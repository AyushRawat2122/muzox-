import React, { useCallback, useState, useEffect, useRef } from "react";
import PlaylistCarousel from "../../components/carousel/PlaylistCarousel.jsx";
import { normalRequest } from "../../utils/axiosRequests.config.js";
import useSearchQuery from "../../store/useSearchQuery.js";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import {
  PlaylistCard,
  SearchListSongCard,
} from "../../components/asset components/index.js";
import { SearchBar } from "../../components/bars";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate } from "react-router";

const SearchResult = React.memo(() => {
  const { searchQuery } = useSearchQuery();
  const abortController = useRef(null);
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchSearchQuery = async (query) => {
    if (abortController.current) {
      abortController.current.abort();
    } // if we have a controller of previous request cancel it for now we dont need to proceed with that req cuz user asked new

    abortController.current = new AbortController(); // helps us to abort prev requests

    setLoading(true);
    try {
      // promise all will help to run parallel query at once
      const [songsRes, playlistsRes] = await Promise.all([
        normalRequest.get(`/songs/suggestionList`, {
          params: { query: `${query}` },
          headers: { "Content-Type": "application/json" },
          signal: abortController.current.signal, // property required to send signals to abort req
        }),
        normalRequest.get(`/playlist/search-playlist`, {
          params: { query: `${query}` },
          headers: { "Content-Type": "application/json" },
          signal: abortController.current.signal, // property required to send signals to abort req
        }),
      ]);
      setSongs(songsRes?.data?.data || []);
      setPlaylists(playlistsRes?.data?.data || []);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted for query:", query);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getSearchList = useCallback(
    debounce((query) => fetchSearchQuery(query), 400),
    []
  );

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      getSearchList(searchQuery);
    }
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        {" "}
        <DotLottieReact
          src="https://lottie.host/b6ed7211-8749-45d9-8ed6-a50acf95d33f/m7v5QYV6qA.lottie"
          loop
          autoplay
          className="w-[200px] lg:w-[300px] h-[200px] lg:h-[300px]"
        />
      </div>
    );
  }
  return (
    <div className="h-full w-full">
      {playlists.length === 0 && songs.length === 0 && searchQuery === "" && (
        <div className="h-full w-full flex justify-center items-center underline decoration-1 underline-offset-8 decoration-white">
          <p className="text-white text-base italic px-3 text-center">
            <Search className="inline" />
            Looking for something? Type a song name to begin your search!{" "}
          </p>
        </div>
      )}
      {playlists.length === 0 && songs.length === 0 && searchQuery !== "" && (
        <div className="h-full w-full flex justify-center items-center underline decoration-1 underline-offset-8 decoration-white">
          <p className="text-white text-base italic px-3 text-center">
            No results found !!
          </p>
        </div>
      )}
      {(playlists.length !== 0 || songs.length !== 0) && searchQuery !== "" && (
        <div className="p-2 max-lg:pb-[18vh]">
          {songs.length > 0 && (
            <div className="">
              <p className="text-lg font-bold">Songs</p>
              <hr className="muzoxSubText" />
              {songs.map((song, idx) => (
                <SearchListSongCard song={song} key={idx+"searchResult"} />
              ))}
            </div>
          )}
          {playlists.length > 0 && (
            <div className="my-2">
              <p className="text-lg font-bold">Playlists</p>
              <PlaylistCarousel>
                {playlists.map((playlist , idx) => {
                  return (
                    <PlaylistCard
                      playlist={playlist}
                      onClick={() => {
                        navigate(`/playlist/${playlist?._id}`);
                      }}
                      key={idx+"searchPlaylist"}
                    />
                  );
                })}
              </PlaylistCarousel>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const SearchPage = () => {
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const { updateSearchQuery } = useSearchQuery();
  useEffect(() => {
    return () => {
      updateSearchQuery("eeeeee");
    };
  }, []);
  return (
    <div className="h-full w-full overflow-y-scroll relative">
      {isTabletOrMobile && (
        <div className="sticky w-full top-0 p-2 bg-black/40 backdrop-blur-sm z-10 rounded-b-md">
          <div>
            {/* Search bar for mobile users :} */}
            <SearchBar />
          </div>
        </div>
      )}
      <SearchResult></SearchResult>
    </div>
  );
};

export default React.memo(SearchPage);
