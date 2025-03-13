import React from "react";
import { IoPlaySharp } from "react-icons/io5";
const SideBarMusicCards = ({ className, onClick, Song }) => {
  return (
    <button className={`w-full hoverPlay`} onClick={onClick}>
      <div className="flex gap-2 p-2 items-center justify-between rounded-md bg-white/4 hover:bg-white/7 transition-all">
        <div className="flex gap-2">
          <img
            src={Song?.coverImage?.url}
            className="h-[50px] w-[50px] rounded-md aspect-square object-cover"
            alt="next song in queue"
          />
          <div className="flex flex-col items-start capitalize">
            <h3 className={`text-base font-semibold  h-5 ${className}`}>
              {Song?.title}
            </h3>
            <p className="text-sm text-[#c9c9c9] h-5  font-medium ">
              {Song?.artist}
            </p>
          </div>
        </div>
        <IoPlaySharp className="text-2xl playBtn" />
      </div>
    </button>
  );
};

export default SideBarMusicCards;
