import React, { useEffect, useState } from "react";
import useAudioPlayer from "../../store/useAudioPlayer.js";
import { EmptyQueue, SideBarMusicCards } from "../asset components/index.js";
import { GiLoveSong } from "react-icons/gi";
import useSideBar from "../../store/useSideBar.js";

const CurrentSongAbout = () => {
  const { currentSong, queue, currentSongIdx, playNext, isLooped, isShuffled } =
    useAudioPlayer();
  const { toggleQueueDisplay } = useSideBar();
  const [nextSong, setNextSong] = useState({});

  useEffect(() => {
    console.log(currentSong);
    if (currentSongIdx < queue.length - 1) {
      setNextSong(queue[currentSongIdx + 1]);
    } else if (isLooped && currentSongIdx === queue.length - 1) {
      setNextSong(queue[0]);
    } else {
      setNextSong(false);
    }
  }, [currentSong, isLooped, isShuffled]);

  if (!currentSong) {
    return <EmptyQueue />; // this is displayed when there is no currentSong Playing
  }
  console.log(currentSong.coverImage.url);
  return (
    <div className="h-full w-full p-2 flex flex-col gap-5 relative">
      <img
        src={currentSong?.coverImage?.url || null}
        className="rounded-md aspect-square w-full object-cover"
        alt="coverImage"
      />
      <hr className="text-[#ffffff51]" />
      <div className="w-full text-clip capitalize">
        <h1 className="text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">{currentSong?.title}</h1>
        <h2 className="text-lg text-[#c9c9c9] whitespace-nowrap overflow-hidden text-ellipsis">{currentSong?.artist}</h2>
      </div>
      <hr className="text-[#ffffff51]" />
      <div>
        <div className="flex justify-between mb-3">
          <h3 className="text-base capitalize font-bold">next in Queue</h3>
          <button
            className="text-sm hover:text-white hover:underline underline-offset-2"
            onClick={() => {
              toggleQueueDisplay();
            }}
          >
            Open queue
          </button>
        </div>

        {nextSong && (
          <SideBarMusicCards
            onClick={() => {
              playNext();
            }}
            Song={nextSong}
          />
        )}
        {!nextSong && (
          <p className="italic text-[#c9c9c9] p-3">
            "Whoa, you just played through the entire setlist! Want an encore or
            should we smash the guitar?{" "}
            <GiLoveSong className="bg-orange-500 text-2xl inline" />"
          </p>
        )}

        <div>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CurrentSongAbout);
