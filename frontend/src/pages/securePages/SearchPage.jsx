import React, { useCallback, useState, useEffect } from "react";
import PlaylistCarousel from "../../components/carousel/PlaylistCarousel.jsx";
import SearchBar from "../../components/bars/SearchBar.jsx";
import { normalRequest } from "../../utils/axiosRequests.config.js";
import useSearchQuery from "../../store/useSearchQuery.js";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import Loading from "../../components/loaders/Loading.jsx";
import { loadingDots } from "../../utils/lottie.js";
import { useMediaQuery } from "react-responsive";
const SearchPage = () => {
  const { searchQuery } = useSearchQuery();
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)'
  })
   const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSearchQuery = async (query) => {
    setLoading(true);
    try {
      const songsRes = await normalRequest.get(`/songs/suggestionList`, {
        params: { query: `${query}` },
        headers: { "Content-Type": "application/json" },
      });
      const playlistsRes = await normalRequest.get(
        `/playlist/search-playlist`,
        {
          params: { query: `${query}` },
          headers: { "Content-Type": "application/json" },
        }
      );
      
      console.log(new Date().toLocaleTimeString() , "fetching");
      setSongs(songsRes?.data?.data || []);
      setPlaylists(playlistsRes?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getSearchList = useCallback(
    debounce((query) => fetchSearchQuery(query), 2000),
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
    <div className="h-full p-2 w-full">
      <div>
        {isTabletOrMobile && (
          <div>
            {/* Search bar for mobile users :} */}
            <SearchBar />
          </div>
        )}
      </div>
      {searchQuery === "" && (
        <div className="h-full w-full flex justify-center items-center underline decoration-1 underline-offset-8 decoration-white">
          <p className="text-white text-lg sm:text-2xl italic px-3 text-center">
            <Search className="inline" />
            Looking for something? Type a song name to begin your search!{" "}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchPage);
