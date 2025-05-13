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
import { motion, AnimatePresence } from "framer-motion";
import { FaMusic, FaClock, FaStar, FaFire, FaHeart } from "react-icons/fa";

const fetchHomePageData = async () => {
  try {
    const [playlistRes, songRes, newSongRes] = await Promise.all([
      normalRequest.get("/playlist/home-page-playlist"),
      normalRequest.get("/songs/song-for-home"),
      normalRequest.get("/songs/newlyAddedSong"),
    ]);
    return {
      playlists: playlistRes?.data?.data || [],
      songs: songRes?.data?.data || [],
      newlyAdded: newSongRes?.data?.data || [],
    };
  } catch (err) {
    console.error("Error fetching homepage data:", err);
    return { playlists: [], songs: [], newlyAdded: [] };
  }
};

const HomePage = () => {
  const [data, setData] = useState({
    playlists: [],
    songs: [],
    newlyAdded: [],
  });
  const [recentSongs, setRecentSongs] = useState([]);
  const navigate = useNavigate();

  const { data: homePageData, isLoading } = useQuery({
    queryKey: ["homePageData"],
    queryFn: fetchHomePageData,
    retry: (failureCount, error) => {
      if (error.response?.status === 404) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    retryOnMount: true,
    keepPreviousData: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (homePageData) setData(homePageData);
  }, [homePageData]);

  useEffect(() => {
    getRecentSongs()
      .then((fetched) => setRecentSongs(fetched || []))
      .catch((err) => console.error("Error fetching recent songs:", err));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading src={loadingDotsOrange} />
      </div>
    );
  }

  const { playlists, songs, newlyAdded } = data;

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5 },
    }),
  };

  return (
    <div className="max-lg:pb-[18vh] overflow-y-scroll h-full px-1 capitalize space-y-6">
      <AnimatePresence>
        {/* Jump back in Time */}
        {Array.isArray(recentSongs) && recentSongs.length > 0 && (
          <motion.section
            key="recentSongs"
            initial="hidden"
            animate="visible"
            exit="hidden"
            custom={0}
            variants={sectionVariants}
          >
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <FaClock className="mr-2 text-orange-500" /> Jump back in Time
            </h1>
            <PlaylistCarousel>
              {recentSongs.map((song, idx) => (
                <HoverCard
                  key={song?._id || idx}
                  img={song?.coverImage?.url}
                  name={song?.title || "Unknown Title"}
                  song={song}
                />
              ))}
            </PlaylistCarousel>
          </motion.section>
        )}

        {/* Welcome Video */}
        <motion.section
          key="welcomeVideo"
          initial="hidden"
          animate="visible"
          exit="hidden"
          custom={1}
          variants={sectionVariants}
        >
          <video src="/WELCOME.mp4" className="w-full" loop autoPlay muted />
        </motion.section>

        {/* Top Playlist For You */}
        {Array.isArray(playlists) && playlists.length > 0 && (
          <motion.section
            key="topPlaylists"
            initial="hidden"
            animate="visible"
            exit="hidden"
            custom={2}
            variants={sectionVariants}
          >
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <FaMusic className="mr-2 text-orange-500" /> Top Playlist For You
            </h1>
            <PlaylistCarousel>
              {playlists.map((item, idx) => (
                <PlaylistCard
                  key={item?._id || idx}
                  playlist={item}
                  onClick={() => navigate(`/playlist/${item?._id}`)}
                />
              ))}
            </PlaylistCarousel>
          </motion.section>
        )}

        {/* Recommended Songs */}
        {Array.isArray(songs) && songs.length > 6 && (
          <motion.section
            key="recommendedSongs"
            initial="hidden"
            animate="visible"
            exit="hidden"
            custom={3}
            variants={sectionVariants}
          >
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <FaStar className="mr-2 text-orange-500" /> Recommended Songs
            </h1>
            <PlaylistCarousel>
              {songs.slice(6).map((song, idx) => (
                <HoverCard
                  key={song?._id || idx}
                  img={song?.coverImage?.url}
                  name={song?.title || "Unknown Title"}
                  song={song}
                />
              ))}
            </PlaylistCarousel>
          </motion.section>
        )}

        {/* MUZOX Video */}
        <motion.section
          key="muzoxVideo"
          initial="hidden"
          animate="visible"
          exit="hidden"
          custom={4}
          variants={sectionVariants}
        >
          <video src="/MUZOX.mp4" className="w-full" loop autoPlay muted />
        </motion.section>

        {/* Latest Songs */}
        {Array.isArray(newlyAdded) && newlyAdded.length > 0 && (
          <motion.section
            key="latestSongs"
            initial="hidden"
            animate="visible"
            exit="hidden"
            custom={5}
            variants={sectionVariants}
          >
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <FaFire className="mr-2 text-orange-500" /> Latest Songs
            </h1>
            <div className="grid sm:grid-cols-2 gap-4">
              {newlyAdded.map((song, idx) => (
                <SearchListSongCard key={song?._id || idx} song={song} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Curated Just for You */}
        {Array.isArray(songs) && songs.length > 0 && (
          <motion.section
            key="curatedSongs"
            initial="hidden"
            animate="visible"
            exit="hidden"
            custom={6}
            variants={sectionVariants}
          >
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <FaHeart className="mr-2 text-orange-500" /> Curated Just for You
            </h1>
            <div className="grid grid-cols-5 lg:h-[300px] w-full max-sm:flex max-sm:flex-col">
              {songs.slice(0, 5).map((song, idx) => (
                <HANDPICK
                  key={song?._id || idx}
                  img={song?.coverImage?.url}
                  name={song?.title || "Unknown Title"}
                  artist={song?.artist || "Unknown Artist"}
                  genre={song?.genre || "Unknown Genre"}
                  song={song}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

const HoverCard = ({ img, name, song }) => {
  const { initializeQueue } = useAudioPlayer();
  return (
    <div
      className="hover:bg-white/10 main w-[150px] h-[180px] rounded-md overflow-hidden shadow-sm flex flex-col p-1 cursor-pointer"
      onClick={() => initializeQueue([song], song?._id)}
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

const HANDPICK = ({ img, name, artist, genre, song }) => {
  const { initializeQueue } = useAudioPlayer();
  return (
    <div
      className="main w-full relative h-full rounded-md overflow-hidden shadow-sm flex flex-col p-1 cursor-pointer group"
      onClick={() => initializeQueue([song], song?._id)}
    >
      <img
        src={img}
        alt={name}
        className="w-full h-full aspect-square object-cover rounded-md"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 text-white">
        <div className="font-semibold truncate text-3xl">{name}</div>
        <div className="truncate text-xl">{artist}</div>
        <div className="italic opacity-80 text-lg">{genre}</div>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
