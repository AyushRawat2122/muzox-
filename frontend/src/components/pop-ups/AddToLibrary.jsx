import usePopUp from "../../store/usePopUp";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import getUserLikedSong from "../../serverDataHooks/getUserLikedSong.js";
import getUserPlaylists from "../../serverDataHooks/getUserPlaylists.js";
import getUser from "../../serverDataHooks/getUser.js";
import { useMediaQuery } from "react-responsive";
import PlaylistCarousel from "../carousel/PlaylistCarousel.jsx";
import { useLikeSong } from "../../serverDataHooks/songMutations.js";
import {
  notifyError,
  notifySuccess,
  notifyWarning,
} from "../../store/useNotification.js";
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
      onClick={handleClick}
      className="border-1 border-gray-400 p-2 rounded-md w-[200px] hover:bg-white/3 no-copy cursor-pointer"
    >
      <img
        src="/LikedSong.png"
        alt=""
        className="w-full aspect-square rounded-md"
      />
      <p className="text-sm pt-2 capitalize text-gray-400">
        liked songs : {likedSong?.data?.length} tracks
      </p>
    </div>
  );
});

//user playlist component
const PlaylistCard = () => {
  return <div></div>;
};

const AddToLibrary = () => {
  const { toggleAddPopUp, setContext } = usePopUp();
  const popUp = useRef(null);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const [userPlaylist, setUserPlaylist] = useState([]);
  const [carouselDrag, setCarouselDrag] = useState(false);
  const { data: user, isSuccess: userSuccess, isPending: userNot } = getUser();
  const {
    data: playlist,
    isSuccess: playlistSuccess,
    isPending: playlistNot,
  } = getUserPlaylists();

  useEffect(() => {
    if (isTabletOrMobile) {
      setCarouselDrag(true);
    } else {
      setCarouselDrag(false);
    }
    console.log(carouselDrag);
  }, [isTabletOrMobile]);
  useEffect(() => {
    console.log("isTabletOrMobile:", isTabletOrMobile);
  }, [isTabletOrMobile]);

  const handleBackdropClick = (e) => {
    if (popUp.current && e.target === e.currentTarget) {
      setContext(undefined);
      toggleAddPopUp();
    }
  };

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
            <PlaylistCarousel
              drag={carouselDrag}
              click={!carouselDrag}
            ></PlaylistCarousel>
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
