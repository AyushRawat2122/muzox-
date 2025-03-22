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
//liked song component
const LikedSong = React.memo(() => {
  const { context } = usePopUp();
  const { data: likedSong, isPending: likedSongNot } = getUserLikedSong();
  const mutation = useLikeSong();

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
    return <p> loading... </p>;
  }

  return (
    <div
      className="max-sm:w-[150px] max-lg:w-[180px] w-[200px] p-2 hover:bg-white/10 rounded-sm cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative w-full">
        <div className="absolute h-full w-full flex items-end px-1 bg-black/20">
          <h1 className="text-left w-[70%] whitespace-nowrap text-lg sm:text-2xl font-bold overflow-ellipsis overflow-hidden">
            Liked Songs
          </h1>
        </div>
        <img
          src={"/LikedSong.png"}
          alt="playlist"
          className="w-full h-full aspect-square object-cover rounded-sm"
        />
      </div>
      <div className="w-[100%] py-2 text-left">
        <p className="whitespace-nowrap text-gray-300 text-sm font-medium overflow-ellipsis w-full overflow-hidden">
          Total Songs: {likedSong?.data?.length} songs
        </p>
      </div>
    </div>
  );
});

const AddToLibrary = () => {
  const { toggleAddPopUp, setContext } = usePopUp();
  const popUp = useRef(null);
  const date = new Date();
  const [userPlaylist, setUserPlaylist] = useState([]);
  const { data: user, isPending: userNot } = getUser();
  const { data: playlists, isPending: playlistNot } = getUserPlaylists();
  const { context } = usePopUp();
  useEffect(() => {
    if (playlists?.data?.length > 0) {
      const created = playlists?.data?.filter(
        (playlist) => playlist?.owner === user?._id
      );
      setUserPlaylist(created);
    }
  }, [playlists]);

  const handleBackdropClick = (e) => {
    if (popUp.current && e.target === e.currentTarget) {
      setContext(undefined);
      toggleAddPopUp();
    }
  };

  const mutation = addToPlaylist();

  return (
    <div>
      {/* Background Overlay */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
          className="relative w-[80%] h-[80%] overflow-y-scroll hiddenScroll p-6 gradientBg text-white rounded-lg shadow-sm shadow-gray-300"
        >
          {/* Close Button */}
          <button
            onClick={toggleAddPopUp}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
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

          <h1 className="text-2xl font-bold">Save To :</h1>
          <h2 className="text-lg pt-2">Liked Songs</h2>
          <hr className="text-[#ffffff4b] mb-2" />
          <LikedSong />
          <h2 className="text-lg pt-2">Playlists</h2>
          <hr className="text-[#ffffff4b] mb-2" />
          {userPlaylist.length > 0 ? (
            <PlaylistCarousel>
              {userPlaylist.map((playlist, id) => {
                const key = date.now + id;
                return (
                  <PlaylistCard
                    playlist={playlist}
                    key={key}
                    onClick={() => {
                      const id = playlist?._id;
                      mutation.mutate({ song: context, playlistID: id });
                    }}
                    playBtn={false}
                  />
                );
              })}
            </PlaylistCarousel>
          ) : (
            <p className="text-gray-300">
              No created playlist found, create playlist first
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AddToLibrary;
