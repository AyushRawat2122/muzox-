import usePopUp from "../../store/usePopUp";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import getUserLikedSong from "../../serverDataHooks/getUserLikedSong.js";
import getUserPlaylists from "../../serverDataHooks/getUserPlaylists.js";
import getUser from "../../serverDataHooks/getUser.js";
import PlaylistCarousel from "../carousel/PlaylistCarousel.jsx";
import { useLikeSong } from "../../serverDataHooks/songMutations.js";
import {
  notifyError,
  notifySuccess,
  notifyWarning,
} from "../../store/useNotification.js";
import PlaylistCard from "../asset components/PlaylistCard.jsx";
import { addToPlaylist } from "../../serverDataHooks/playlistsMutations.js";
import { loadingDotsOrange } from "../../utils/lottie.js";
import Loading from "../loaders/Loading.jsx";
import { useMediaQuery } from "react-responsive";
import { Heart, Music, MicVocal, Clock, Music2 } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Vibrant } from "node-vibrant/browser";

// Utility function for time conversion
const timeConvertor = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = (time % 60).toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

//liked song component
const LikedSong = React.memo(() => {
  const { context } = usePopUp();
  const { data: likedSong, isPending: likedSongNot } = getUserLikedSong();
  const mutation = useLikeSong();
  const isMobile = useMediaQuery({ query: "(max-width: 40rem)" });

  const handleClick = () => {
    if (likedSong?.data?.some((song) => song?._id === context?._id)) {
      notifyWarning("song already exists in liked songs");
      return;
    }
    if (!context) {
      notifyWarning("no context provided");
      return;
    }
    mutation.mutate(context);
  };

  useEffect(() => {
    if (mutation.isSuccess) {
      notifySuccess("saved to liked songs");
    }
    if (mutation.isError) {
      notifyError("failed to save in liked songs");
    }
  }, [mutation.isSuccess, mutation.isError]);

  if (likedSongNot) {
    return <Loading src={loadingDotsOrange}></Loading>;
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-2 rounded-md max-sm:bg-white/5 hover:bg-white/5 cursor-pointer group"
    >
      <div className="w-12 h-12 rounded overflow-hidden bg-gradient-to-br from-blue-500 to-purple-700">
        <img
          src="/LikedSong.png"
          alt="Liked Songs"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="font-medium truncate">Liked Songs</p>
        <p className="text-sm text-gray-400">
          {likedSong?.data?.length || 0} songs
        </p>
      </div>
      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-[#fe7641]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
    </div>
  );
});

const AddToLibrary = () => {
  const { toggleAddPopUp, setContext, context } = usePopUp();
  const popUp = useRef(null);
  const date = new Date();
  const isMobile = useMediaQuery({ query: "(max-width: 40rem)" });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [userPlaylist, setUserPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: user, isPending: userNot } = getUser();
  const { data: playlists, isPending: playlistNot } = getUserPlaylists();
  const [colors, setColor] = useState({});
  const imgRef = useRef(null);

  useEffect(() => {
    if (playlists?.data?.length > 0) {
      const created = playlists?.data?.filter(
        (playlist) => playlist?.owner === user?._id
      );
      setUserPlaylist(created);
    }
    setLoading(false);
  }, [playlists]);

  const handleBackdropClick = (e) => {
    if (popUp.current && e.target === e.currentTarget) {
      setContext(undefined);
      toggleAddPopUp();
    }
  };

  useEffect(() => {
    async function fetchImageAsBlob(url) {
      try {
        const response = await fetch(url, { mode: "cors" });
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const color = await Vibrant.from(blobUrl).getPalette();

        setColor(color);
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    }
    if (context?.coverImage?.url) {
      fetchImageAsBlob(context.coverImage.url);
    }
  }, [context]);

  const filteredPlaylists = userPlaylist.filter((playlist) =>
    playlist.name?.toLowerCase().includes(searchQuery.toLowerCase() || "")
  );

  const mutation = addToPlaylist();

  return (
    <div>
      {/* Background Overlay */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm max-sm:backdrop-blur-xl"
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {/* Modal Box */}
        <motion.div
          ref={popUp}
          key="modal"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
          transition={{ duration: 0.3 }}
          className="relative w-[90%] max-w-4xl max-sm:w-full max-sm:h-full max-sm:rounded-none border border-white/10 rounded-lg overflow-hidden bg-[#121212]60 text-white shadow-2xl"
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <h1 className="text-xl font-bold">Save to Playlist</h1>
            <button
              onClick={toggleAddPopUp}
              className="text-gray-400 h-8 w-8 flex justify-center items-center rounded-full hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex max-md:flex-col px-4 h-full max-sm:overflow-auto">
            {/* Left Side - Song Details */}
            <div className="max-md:w-full py-4 md:w-1/3 md:pr-4 max-sm:py-3 max-sm:pb-4 max-sm:border-b max-sm:border-white/10">
              {context && (
                <div className="max-sm:flex max-sm:items-center max-sm:gap-4">
                  <div className="rounded-md overflow-hidden shadow-lg max-sm:flex-shrink-0">
                    <img
                      src={context.coverImage?.url}
                      alt={context.title}
                      className="w-full h-full max-sm:w-28 max-sm:h-28 aspect-square object-cover"
                      ref={imgRef}
                    />
                  </div>
                  <div className="max-sm:flex-1 max-sm:mt-0 mt-3 w-full max-sm:max-w-[65%]">
                    <h2 className="text-lg font-bold w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {context.title}
                    </h2>
                    <p className="text-gray-400 text-sm overflow-hidden text-ellipsis whitespace-nowrap mb-2">
                      {context.artist}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="inline-block px-3 py-1 rounded-full text-xs bg-white/10">
                        {context.genre}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock size={14} />
                        {timeConvertor(context.duration)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Playlist Selection */}
            <div className="max-md:w-full md:w-2/3 md:pl-4 max-md:mt-2 md:border-l md:border-white/10 max-sm:flex-grow">
              {/* Liked Songs */}
              <div className="py-2">
                <h3 className="text-base font-medium mb-2">Liked Songs</h3>
                <div className="px-1">
                  <LikedSong />
                </div>
              </div>

              {/* Playlists */}
              <div className="py-2">
                <h3 className="text-base font-medium mb-2">Your Playlists</h3>

                {/* Search */}
                <div className="mb-3 px-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search playlists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 pl-8 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:border-[#fe7641] text-white text-sm"
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Make only this div scrollable */}
                <div className="px-1 max-h-[50vh] md:max-h-[200px] overflow-y-auto hiddenScroll">
                  {filteredPlaylists.length > 0 ? (
                    <div className="space-y-2">
                      {filteredPlaylists.map((playlist, id) => {
                        const key = date.getTime() + id;
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              mutation.mutate({ song: context, playlistID: playlist._id });
                            }}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer group max-sm:bg-white/5 max-sm:hover:bg-white/10"
                          >
                            <div className="w-12 h-12 rounded overflow-hidden">
                              <img
                                src={playlist.playListCover?.url || "/placeholder-playlist.png"}
                                alt={playlist.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium truncate">{playlist.name}</p>
                              <p className="text-xs text-gray-400">
                                {playlist.songs?.length || 0} songs
                              </p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-[#fe7641]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400">
                      {searchQuery
                        ? "No matching playlists found"
                        : loading 
                          ? <Loading src={loadingDotsOrange} />
                          : "No created playlist found, create playlist first"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Action Button */}
          <div className="p-3 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={toggleAddPopUp}
              className="px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AddToLibrary;
