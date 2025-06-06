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
        className="flex max-sm:flex-col sm:items-end gap-4 mb-6 sm:p-4 lg:rounded-t-lg"
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
      <div className="sticky -translate-y-1 top-0 bg-black px-2 py-2 border-b-[1px] border-[#ffffff3d] flex items-center gap-2">
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
        <div className="grid grid-cols-[2rem_1fr_auto] px-4 items-center border-b border-gray-700 pb-2 mb-2 text-sm text-gray-400">
          <div className="text-right pr-3">#</div>
          <div>Title</div>
          <div className="text-right pr-2">Duration</div>
        </div>
        {/* Songs */}
        {likedSongs?.data?.map((song, index) => (
          <SongItem
            key={index}
            song={song}
            index={index}
            queueRef={"likedSongs"}
            likedSongs={likedSongs?.data}
          />
        ))}
      </div>
    </main>
  );
};

const SongItem = ({ song, index, queueRef, likedSongs }) => {
  const { setCurrentSong, queueID, isShuffled, shuffleBack, initializeQueue } = useAudioPlayer();
  const changeCurrentSongOfQueue = (e) => {
    e.stopPropagation();
    if (queueID !== queueRef) {
      initializeQueue(likedSongs || [], queueRef);
    }
    if(isShuffled){
      shuffleBack();
    }
    setCurrentSong(index);
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
      className="grid grid-cols-[2rem_1fr_auto] items-center px-4 py-2 transition-colors hover:bg-gray-800 cursor-pointer"
      onClick={changeCurrentSongOfQueue}
    >
      <div className="text-right pr-3">
        <span>{index + 1}</span>
      </div>
      <div className="flex items-center gap-2 overflow-hidden">
        <img
          src={song?.coverImage?.url || "/placeholder.svg?height=40&width=40"}
          alt={song.title}
          className="w-10 h-10 rounded object-cover flex-shrink-0"
        />
        <div className="overflow-hidden">
          <div className="font-medium truncate">{song.title}</div>
          <div className="text-xs text-gray-400 truncate">{song.artist}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 flex gap-1 items-center min-w-max">
        <span className="inline-block min-w-[3rem] text-right">{convertToMinSecFormat(song?.duration)}</span>
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
