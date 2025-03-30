import React, { useEffect, useState } from "react";
import { normalRequest } from "../../utils/axiosRequests.config";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../components/loaders/Loading";
import { loadingDotsOrange } from "../../utils/lottie";
import PlaylistCarousel from "../../components/carousel/PlaylistCarousel";
import {
  PlaylistCard,
  SearchListSongCard,
} from "../../components/asset components";
import { useNavigate } from "react-router";
import { Play } from "lucide-react";
import useAudioPlayer from "../../store/useAudioPlayer";
import { getRecentSongs } from "../../utils/frontendStorage";
const HomePage = () => {
  const [data, setData] = useState({
    playlists: [],
    songs: [],
    newlyAdded: [],
  });
  const [recentSongs, setRecentSongs] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    const [playlistRes, songRes, newSongRes] = await Promise.all([
      normalRequest.get("/playlist/home-page-playlist"),
      normalRequest.get("/songs/song-for-home"),
      normalRequest.get("/songs/newlyAddedSong"),
    ]);

    return {
      playlists: playlistRes.data.data,
      songs: songRes.data.data,
      newlyAdded: newSongRes.data.data,
    };
  };

  const { data: homePageData, isPending } = useQuery({
    queryKey: ["homePageData"],
    queryFn: fetchData,
  });

  useEffect(() => {
    if (homePageData) setData(homePageData);
  }, [homePageData]);

  useEffect(() => {
    getRecentSongs()
      .then((fetchedSongs) => {
        setRecentSongs(fetchedSongs);
      })
      .catch((err) => console.error("Error fetching recent songs:", err));
  }, []);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading src={loadingDotsOrange} />
      </div>
    );
  }

  return (
    <div className="max-lg:pb-[18vh] overflow-y-scroll h-full px-1 capitalize space-y-6">
    {/* Jump back in Time */}
    <section>
      <h1 className="text-2xl font-bold mb-2">Jump back in Time</h1>
      <PlaylistCarousel>
        {recentSongs.map((song) => (
          <HoverCard
            key={song?._id}
            img={song?.coverImage?.url}
            name={song?.title}
            song={song}
          />
        ))}
      </PlaylistCarousel>
    </section>
  
    {/* Top Playlist For You */}
    <section>
      <h1 className="text-2xl font-bold mb-2">Top Playlist For You</h1>
      <PlaylistCarousel>
        {data.playlists.map((item) => (
          <PlaylistCard
            key={item._id}
            playlist={item}
            onClick={() => navigate(`/playlist/${item?._id}`)}
          />
        ))}
      </PlaylistCarousel>
    </section>
  
    {/* Recommended Songs */}
    <section>
      <h1 className="text-2xl font-bold mb-2">Recommended Songs</h1>
      <PlaylistCarousel>
        {data.songs.map((song) => (
          <HoverCard
            key={song?._id}
            img={song?.coverImage?.url}
            name={song?.title}
            song={song}
          />
        ))}
      </PlaylistCarousel>
    </section>
  
    {/* Latest Songs */}
    <section>
      <h1 className="text-2xl font-bold mb-2">Latest Songs</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {data.newlyAdded.map((song, idx) => (
          <SearchListSongCard key={`${idx}LatestSongKEY`} song={song} />
        ))}
      </div>
    </section>
  </div>
  
  );
};

const HoverCard = ({ img, name, song }) => {
  const { initializeQueue } = useAudioPlayer();
  const handleClick = (e) => {
    initializeQueue([song], song?._id);
  };
  return (
    <div
      className="hover:bg-white/10 main w-[150px] h-[180px] rounded-md overflow-hidden shadow-sm flex flex-col p-1"
      onClick={handleClick}
    >
      <div className="relative w-full rounded-lg overflow-hidden">
        <img
          src={img}
          alt={name}
          className="w-full aspect-square object-cover"
        />
        <button className="absolute inset-0 flex items-center justify-center playBtn">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff733c]">
            <Play className="text-white w-5 h-5" size={50} strokeWidth={4} />
          </div>
        </button>
      </div>
      <div className="p-2 overflow-hidden">
        <p className="text-white text-sm text-left whitespace-nowrap text-ellipsis overflow-hidden">
          {name}
        </p>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
