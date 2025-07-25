import React from "react";
import { IoPlaySharp } from "react-icons/io5";
const SideBarMusicCards = ({ className, onClick, Song }) => {
  return (
    <div className={`w-full main`} onClick={onClick}>
      <div className="flex gap-2 p-2 items-center justify-between rounded-md bg-white/4 hover:bg-white/7 transition-all">
        <div className="flex gap-2 grow overflow-hidden">
          <img
            src={Song?.coverImage?.url}
            className="h-[50px] w-[50px] rounded-md aspect-square object-cover"
            alt="next song in queue"
          />
          <div className="flex flex-col w-full items-start capitalize overflow-hidden">
            <h3 className={`text-base font-semibold  h-5 whitespace-nowrap overflow-hidden overflow-ellipsis ${className}`}>
              {Song?.title}
            </h3>
            <p className="text-sm text-[#c9c9c9] h-5 whitespace-nowrap overflow-hidden w-[200px] text-left overflow-ellipsis  font-medium ">
              {Song?.artist}
            </p>
          </div>
        </div>
        <button className="h-[40px] w-[40px]">
         <IoPlaySharp className="text-2xl playBtn" />
        </button>
      </div>
    </div>
  );
};

export default SideBarMusicCards;
