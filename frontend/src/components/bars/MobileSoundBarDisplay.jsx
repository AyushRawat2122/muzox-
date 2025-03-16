import React from "react";
import useAudioPlayer from "../../store/useAudioPlayer";
import usePopUp from "../../store/usePopUp";
import { NavLink } from "react-router";
import { LiaMicrophoneAltSolid } from "react-icons/lia";
import { Pause, PlayIcon } from "lucide-react";
const MobileSoundBarDisplay = (props) => {
  const { currentSong, isPlaying, togglePlayPause } = useAudioPlayer();
  const { setSoundBarPopUp } = usePopUp();
  const togglePlay = (e) => {
    e.stopPropagation();
    togglePlayPause();
  };
  return (
    <div
      className="flex w-full gap-2 items-center px-2 py-1 border-t-1 border-b-1 border-[#ffffff3c]"
      onClick={(e) => {
        e.stopPropagation();
        setSoundBarPopUp(true);
      }}
    >
      <img
        src={currentSong?.coverImage?.url || null}
        alt="cover"
        className="w-[50px] h-[50px]  object-cover aspect-square rounded-md"
      />
      <div className="marquee-container w-[150px] sm:w-full">
        <p className="marquee text-base sm:text-lg capitalize">
          {currentSong?.title + " | " + currentSong?.artist}
        </p>
      </div>
      <div className="grow flex gap-2 justify-end px-2">
       <button onClick={(e)=>{e.stopPropagation()}}>
       <NavLink
          to={"/lyrics"}
          className={({ isActive }) =>
            isActive
              ? "text-[#fe7641] flex justify-center items-center"
              : "text-gray-300 flex justify-center items-center"
          }
        >
          <LiaMicrophoneAltSolid title="lyrics" size={30} />
        </NavLink>
       </button>
        <button
          className=" w-10 text-white rounded-full relative text-3xl"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause title="pause " className="adjustCenter" size={30} />
          ) : (
            <PlayIcon title="play" className="adjustCenter" size={30} />
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(MobileSoundBarDisplay);
