import React, { useState } from "react";
import { Play } from "lucide-react";
const PlaylistCard = ({ playlist, onClick, playBtn = true }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="max-sm:w-[150px] max-lg:w-[180px] w-[200px] p-2 hover:bg-white/10 rounded-sm cursor-pointer transition-all ease-in-out duration-300"
      onClick={onClick}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <div className="relative w-full h-fit overflow-hidden">
        <div className="absolute h-full w-full flex items-end px-1 bg-black/20">
          <h1 className="text-left w-[70%] whitespace-nowrap text-lg sm:text-2xl font-bold overflow-ellipsis overflow-hidden">
            {playlist?.name}
          </h1>
        </div>
        {playBtn && (
          <button
            className={`absolute bottom-1 right-1 ${
              hover ? "" : "translate-y-[50px]"
            } h-[40px] w-[40px] bg-[#fe7641] rounded-full flex justify-center items-center transition-all ease-in-out duration-300`}
          >
            <Play strokeWidth={2.5}></Play>
          </button>
        )}
        <img
          src={playlist?.playListCover?.url || "/playlists.png"}
          alt="playlist"
          className="w-full h-full aspect-square object-cover rounded-sm"
        />
      </div>

      <div className="w-[100%] py-2 text-left">
        <p className="whitespace-nowrap text-gray-300 text-sm font-medium overflow-ellipsis w-full overflow-hidden">
          {playlist?.description}
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
