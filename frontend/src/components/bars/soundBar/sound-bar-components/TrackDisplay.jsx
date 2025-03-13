import React, { useState } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import "../soundBar.css";
import useAudioPlayer from "../../../../store/useAudioPlayer.js";

const TrackDisplay = () => {
  const { currentSong } = useAudioPlayer();
  const [liked, setLiked] = useState(false);
  const handleLikeChange = () => {
    setLiked((prev) => !prev);
  };

  return (
    <div className="h-full w-full flex items-center gap-2 py-1 lg:p-0">
      {/* Image of the current song playing */}
      <div className="h-[50px] w-[50px] aspect-square">
        <img
          src={currentSong?.coverImage?.url || "/tempTrackCover.png"}
          className="h-full w-full rounded-sm object-cover"
          alt="song Image"
        />
      </div>
      {currentSong ? (
        <div className="flex w-full h-full justify-between lg:justify-normal items-center gap-2.5">
          {" "}
          <div className=" capitalize">
            <p className="cursor-pointer  hover:underline underline-offset-2">
              {currentSong.title}
            </p>
            <p className="text-sm hoverIcon cursor-pointer hover:underline underline-offset-2">
              {currentSong.artist}
            </p>
          </div>
          <button onClick={handleLikeChange}>
            {liked ? (
              <GoHeartFill className="text-[#fe7641]" />
            ) : (
              <GoHeart className="hoverIcon" />
            )}
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default React.memo(TrackDisplay);
