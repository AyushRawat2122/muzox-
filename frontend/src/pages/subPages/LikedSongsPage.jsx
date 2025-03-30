import React, { useEffect, useRef, useState } from "react";
import { Play, Repeat2, Pause, BookmarkMinus } from "lucide-react";
import useAudioPlayer from "../../store/useAudioPlayer.js";
import getUserLikedSong from "../../serverDataHooks/getUserLikedSong.js";
import { useUnlikeSong } from "../../serverDataHooks/songMutations.js";
import { loadingDotsOrange, loadingPlayIcon } from "../../utils/lottie.js";
import Loading from "../../components/loaders/Loading.jsx"
const LikedSongsPage = () => {
  const {
    queueID,
    isLooped,
    initializeQueue,
    isPlaying,
    togglePlayPause,
    toggleLooping,
  } = useAudioPlayer(); //audio players methods
  const { data: likedSongs, isPending } = getUserLikedSong();

  const handlePlayButtonClick = () => {
    if (likedSongs?.data?.length <= 0) {
      return;
    }
    if (queueID !== "likedSongs") {
      initializeQueue(likedSongs?.data, "likedSongs");
      return;
    } else {
      togglePlayPause();
    }
  };
  const handleQueueLooping = () => {
    if (likedSongs?.data?.length <= 0 || queueID !== "likedSongs") {
      return;
    } else {
      toggleLooping();
    }
  };

  const customGradient = {
    background: `linear-gradient(to bottom, #ff8c2d 10%, black)`, // #ff8c2d → Custom color (Orange)
  }; // custom gradient for cover

  if(isPending){
    return <Loading src={loadingDotsOrange}/>
  }

  return (
    <main className="max-lg:pb-[18vh] h-full w-full overflow-y-auto bg-black text-white">
      {/* Section 1: Playlist Info */}
      <div
        className="flex  max-sm:flex-col sm:items-end gap-4  mb-6 sm:p-4 lg:rounded-t-lg"
        style={customGradient}
      >
        <img
          src="/LikedSong.png"
          alt="Liked Songs"
          className="h-48 aspect-square object-cover rounded"
        />
        <div className="max-sm:px-2">
          <h4 className="text-sm text-gray-400">Playlist</h4>
          <h1 className="text-4xl sm:text-6xl font-bold">Liked Songs</h1>
          <p className="text-sm text-gray-400">
            Your Library • {likedSongs?.data?.length} songs
          </p>
        </div>
      </div>

      {/* Section 2: Play Control */}
      <div className="sticky top-0 bg-black px-2 py-2 border-b-[1px] border-[#ffffff3d] flex items-center gap-2">
        <button
          className="w-14 h-14 rounded-full bg-[#ff4800] flex items-center justify-center"
          onClick={handlePlayButtonClick}
        >
          {isPlaying && queueID === "likedSongs" ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          onClick={handleQueueLooping}
        >
          <Repeat2
            className={`w-6 h-6 ${
              isLooped && queueID === "likedSongs"
                ? "text-[#ff4800]"
                : "text-white"
            }`}
          />
        </button>
      </div>

      {/* Section 3: Songs List */}
      <div className="mt-6">
        {/* Header */}
        <div className="grid gap-5 sm:gap-10 grid-cols-[auto_1fr_auto] px-4 items-center border-b border-gray-700 pb-2 mb-2 text-sm text-gray-400">
          <div>#</div>
          <div>Title</div>
          <div className="text-right">Duration</div>
        </div>
        {/* Songs */}
        {likedSongs?.data?.map((song, index) => (
          <SongItem
            key={index}
            song={song}
            index={index}
            queueRef={"likedSongs"}
          />
        ))}
      </div>
    </main>
  );
};

const SongItem = ({ song, index, queueRef }) => {
  const { setCurrentSong, queueID , isShuffled ,shuffleBack} = useAudioPlayer();
  const changeCurrentSongOfQueue = (e) => {
    e.stopPropagation();
    if (queueID !== queueRef) {
      return;
    } else {
      if(isShuffled){
        shuffleBack();
      }
      setCurrentSong(index);
    }
  };
  const mutation = useUnlikeSong();
  const handleRemoveSong = (e) => {
    e.stopPropagation();
    mutation.mutate(song?._id);
  };

  const convertToMinSecFormat = (number) => {
    const min = Math.floor(number / 60); //get min
    const sec = Math.floor(number % 60); //get seconds
    const convertedStr =
      String(min).padStart(1, "0") + ":" + String(sec).padStart(1, "0");
    return convertedStr;
  };
  return (
    <div
      className="grid gap-5 sm:gap-10 grid-cols-[auto_1fr_auto] items-center px-4 py-2 transition-colors hover:bg-gray-800"
      onClick={changeCurrentSongOfQueue}
    >
      <div className="flex items-center justify-center">
        <span>{index + 1}</span>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={song?.coverImage?.url || "/placeholder.svg?height=40&width=40"}
          alt={song.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div>
          <div className="font-medium">{song.title}</div>
          <div className="text-xs text-gray-400">{song.artist}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-right flex gap-2 items-center">
        {convertToMinSecFormat(song?.duration)}
        <span title="remove from liked songs">
          <BookmarkMinus
            className="hover:text-red-500 cursor-pointer"
            onClick={handleRemoveSong}
          />
        </span>
      </div>
    </div>
  );
};

export default React.memo(LikedSongsPage);
