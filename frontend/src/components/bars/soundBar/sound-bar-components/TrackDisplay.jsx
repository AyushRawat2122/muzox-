import React, { useState } from "react";
import "../soundBar.css";
import useAudioPlayer from "../../../../store/useAudioPlayer.js";
import { useMediaQuery } from "react-responsive";
import usePopUp from "../../../../store/usePopUp.js";
import { CirclePlus } from "lucide-react";
const TrackDisplay = () => {
  const { currentSong } = useAudioPlayer();
  const { setContext, addPopUp, toggleAddPopUp } = usePopUp();

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const handleAddToLibrary = () => {
    if (addPopUp === false) {
      setContext(currentSong);
      toggleAddPopUp();
    }
  };
  return (
    <div className="h-full w-full flex items-center gap-2 py-1 lg:p-0">
      {/* Image of the current song playing */}
      <div className="h-[50px] w-[50px] aspect-square">
        <img
          src={currentSong?.coverImage?.url || "/tempTrackCover.jpeg"}
          className="h-full w-full rounded-sm object-cover"
          alt="song Image"
        />
      </div>
      {currentSong && (
        <div className="flex w-full h-full justify-between lg:justify-normal overflow-hidden items-center gap-2.5">
          {" "}
          <div className=" capitalize pr-4 overflow-hidden">
            <p className="cursor-pointer  hover:underline underline-offset-2 whitespace-nowrap overflow-hidden text-ellipsis">
              {currentSong.title}
            </p>
            <p className="text-sm hoverIcon cursor-pointer hover:underline underline-offset-2 whitespace-nowrap overflow-hidden text-ellipsis">
              {currentSong.artist}
            </p>
          </div>
        </div>
      )}
      {isTabletOrMobile && currentSong && (
        <button onClick={handleAddToLibrary}>
          <CirclePlus />
        </button>
      )}
    </div>
  );
};

export default React.memo(TrackDisplay);
