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
import { Heart, Music } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Vibrant } from "node-vibrant/browser";
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

  return isMobile ? (
    <div
      className="w-full p-2 flex gap-2.5 items-center bg-white/5 rounded-md"
      onClick={handleClick}
    >
      <div className="bg-gradient-to-br flex justify-center items-center from-amber-500 to-amber-700 h-[55px] w-[55px] rounded-lg">
        <Heart fill="white" size={40}></Heart>
      </div>
      <div>
        <h1 className="text-xl font-bold">Liked Songs</h1>
        <p className="text-gray-300 text-sm">
          Total Songs : {likedSong?.data?.length}
        </p>
      </div>
    </div>
  ) : (
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
  const { toggleAddPopUp, setContext, context } = usePopUp();
  const popUp = useRef(null);
  const date = new Date();
  const isMobile = useMediaQuery({ query: "(max-width: 40rem)" });
  const [userPlaylist, setUserPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const response = await fetch(url, { mode: "cors" }); // Fetch the image
        const blob = await response.blob(); // Convert it into a Blob
        const blobUrl = URL.createObjectURL(blob); // Create a local Blob URL
        const color = await Vibrant.from(blobUrl).getPalette();

        setColor(color);
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    }
    fetchImageAsBlob(context?.coverImage?.url);
  }, [context]);
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
          className="relative h-full w-full sm:w-[80%] sm:h-[70%] border-2 border-[#ffffff24] overflow-y-scroll hiddenScrollPC bg-black/50 text-white rounded-lg"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Close Button */}

          <div
            className="sticky z-[200] top-0 bg-black/50 backdrop-blur-2xl"
            style={{ backgroundColor: colors?.Vibrant?.hex || "" }}
          >
            <div className="bg-black/50 p-2">
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold truncate">
                  Save Track :
                  {!isMobile && (
                    <span className="text-lg italic font-medium truncate">
                      {" "}
                      {context?.title + " | " + context?.artist}{" "}
                    </span>
                  )}
                </h1>
                <button
                  onClick={toggleAddPopUp}
                  className="text-gray-100 hover:text-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {isMobile && (
                <div className="flex gap-2.5 px-2 bg-black/30 p-1 items-center rounded-md">
                  <img
                    src={context?.coverImage?.url || "/tempTrackCover.jpeg"}
                    alt=""
                    className="h-[50px] w-[50px] aspect-square object-cover rounded-md"
                    ref={imgRef}
                  />
                  <div className="flex flex-col">
                    <Marquee pauseOnHover gradient={false} speed={60}>
                      <span className="text-lg sm:text-lg capitalize">
                        {context?.title}
                      </span>
                    </Marquee>
                    <Marquee pauseOnHover gradient={false} speed={40}>
                      <span className="text-sm sm:text-lg capitalize">
                        {context?.artist}
                      </span>
                    </Marquee>
                  </div>
                  <div className="w-[50px] h-[50px] flex justify-center items-center">
                    <Music strokeWidth={2} size={35}></Music>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-2">
            <h2 className="text-lg max-sm:text-2xl pt-2">Liked Songs</h2>
            <hr className="text-[#ffffff27] my-2" />
            <LikedSong />
            <h2 className="text-lg max-sm:text-2xl pt-2">Playlists</h2>
            <hr className="text-[#ffffff27] my-2" />
            {userPlaylist.length > 0 && !isMobile && (
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
            )}
            {userPlaylist.length > 0 && isMobile && (
              <div>
                {userPlaylist.map((playlist, id) => {
                  const key = "addToLib" + id;
                  return (
                    <PlaylistCard
                      playlist={playlist}
                      key={key}
                      onClick={() => {
                        const id = playlist?._id;
                        mutation.mutate({ song: context, playlistID: id });
                      }}
                      playBtn={false}
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                      }}
                      text={{ fontSize: "2rem" }}
                      description={false}
                    />
                  );
                })}
              </div>
            )}
            {loading && <Loading src={loadingDotsOrange} />}
            {!loading && userPlaylist.length <= 0 && (
              <p className="text-gray-300">
                No created playlist found, create playlist first
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AddToLibrary;
