import React, { useCallback, useState, useEffect, useRef } from "react";
import PlaylistCarousel from "../../components/carousel/PlaylistCarousel.jsx";
import { normalRequest } from "../../utils/axiosRequests.config.js";
import useSearchQuery from "../../store/useSearchQuery.js";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import Loading from "../../components/loaders/Loading.jsx";
import { loadingDots } from "../../utils/lottie.js";
import { useMediaQuery } from "react-responsive";
import { SearchListSongCard } from "../../components/asset components/index.js";
import { SearchBar } from "../../components/bars";

const SearchPage = () => {
  const { searchQuery } = useSearchQuery();
  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1224px)",
  });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const abortController = useRef(null);
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // if(loading){
  //   return <Loading src={"loadingDots"} />
  // }

  return (
    <div className="h-full w-full overflow-y-scroll relative">
      {isTabletOrMobile && (
        <div className="sticky w-full top-0 p-2 bg-black/70 z-10 rounded-b-md">
          <div>
            {/* Search bar for mobile users :} */}
            <SearchBar />
          </div>
        </div>
      )}
      {playlists.length === 0 && songs.length === 0 && searchQuery === "" && (
        <div className="h-full w-full flex justify-center items-center underline decoration-1 underline-offset-8 decoration-white">
          <p className="text-white text-lg sm:text-2xl italic px-3 text-center">
            <Search className="inline" />
            Looking for something? Type a song name to begin your search!{" "}
          </p>
        </div>
      )}
      {playlists.length === 0 && songs.length === 0 && searchQuery !== "" && (
        <div className="h-full w-full flex justify-center items-center underline decoration-1 underline-offset-8 decoration-white">
          <p className="text-white text-lg sm:text-2xl italic px-3 text-center">
            No results found !!
          </p>
        </div>
      )}

      <div className="p-2">
        {songs.length > 0 && (
          <div className="">
            <p className="text-lg font-bold">Songs</p>
            <hr className="muzoxSubText" />
            {songs.map((song, idx) => (
              <SearchListSongCard song={song} key={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchPage);
