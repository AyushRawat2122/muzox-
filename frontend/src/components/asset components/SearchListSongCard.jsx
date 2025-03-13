import React, { useState } from "react";
import { Ellipsis, Play } from "lucide-react";
import useAudioPlayer from "../../store/useAudioPlayer.js";
const SearchListSongCard = ({ song }) => {
  const [playIcon, setPlayIcon] = useState(false);
  const displayPlayIcon = () => {
    setPlayIcon(true);
  };
  const hidePlayIcon = () => {
    setPlayIcon(false);
  };
  const { initializeQueue } = useAudioPlayer();
  const { artist, coverImage, title, duration } = song;
  
  const handleClick = (e) => {
    e.stopPropagation();
    initializeQueue([song]);
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
      className="w-full p-2 hover:bg-white/5 flex rounded-sm overflow-hidden gap-2 items-center"
      onMouseEnter={displayPlayIcon}
      onMouseLeave={hidePlayIcon}
      onClick={handleClick}
    >
      <div className="relative h-[50px] w-[50px] rounded-md overflow-hidden aspect-square object-cover">
        {playIcon && (
          <Play
            className="absolute bg-black/50 h-full w-full p-3"
            strokeWidth={3}
          />
        )}
        <img
          src={coverImage?.url || null}
          alt="cover"
          className="h-full w-full aspect-square"
        />
      </div>
      <div className="grow flex justify-between items-center">
        <div>
          <h1 className="capitalize">{title}</h1>
          <p className="text-gray-300">{artist}</p>
        </div>
        <p className="text-sm text-gray-300">{convertToMinSecFormat(duration)}</p>
      </div>
      <button className="hoverIcon">
        <Ellipsis />
      </button>
    </div>
  );
};

export default SearchListSongCard;
