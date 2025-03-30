import React, { useEffect, useState } from "react";
import useAudioPlayer from "../../store/useAudioPlayer";
import usePopUp from "../../store/usePopUp";
import { NavLink } from "react-router";
import { LiaMicrophoneAltSolid } from "react-icons/lia";
import { Pause, PlayIcon } from "lucide-react";
import Marquee from "react-fast-marquee";
import { useMediaQuery } from "react-responsive";
const MobileSoundBarDisplay = ({ audioElement }) => {
  const { currentSong, isPlaying, togglePlayPause, colors } = useAudioPlayer();
  const { setSoundBarPopUp } = usePopUp();
  const isMobile = useMediaQuery({ query: "(max-width: 40rem)" });
  const [duration, setDuration] = useState(audioElement?.duration || 0);
  const [currentPosition, setCurrentPosition] = useState(
    audioElement?.currentTime || 0
  );
  const togglePlay = (e) => {
    e.stopPropagation();
    togglePlayPause();
  };
  useEffect(() => {
    if (!audioElement) {
      return;
    } else {
      console.log(audioElement);
    }

    const onMetaDataLoaded = () => {
      setDuration(audioElement.duration);
    };
    const onCurrentDurationChange = () => {
      setCurrentPosition(audioElement.currentTime);
    };

    audioElement.addEventListener("loadedmetadata", onMetaDataLoaded);
    audioElement.addEventListener("timeupdate", onCurrentDurationChange);

    return () => {
      audioElement.removeEventListener("loadedmetadata", onMetaDataLoaded);
      audioElement.removeEventListener("timeupdate", onCurrentDurationChange);
    };
  }, [audioElement]);

  return (
    <div
      className="w-full rounded-md overflow-hidden"
      onClick={(e) => {
        e.stopPropagation();
        setSoundBarPopUp(true);
      }}
      style={{ backgroundColor: `${colors?.DarkVibrant?.hex || ""}` }}
    >
      <div className="flex gap-2 items-center bg-black/40 px-2 py-1 rounded-md  border-t-1 border-b-1 border-[#ffffff3c]/20">
        <img
          src={currentSong?.coverImage?.url || null}
          alt="cover"
          className="w-[50px] h-[50px]  object-cover aspect-square rounded-md"
        />
        <div className="w-full overflow-hidden bg-transparent">
          {isMobile && (
            <Marquee pauseOnHover gradient={false} speed={40}>
              <span className="text-lg sm:text-lg capitalize font-semibold  mr-15">
                {currentSong?.title + " | " + currentSong?.artist}
              </span>
            </Marquee>
          )}
          {!isMobile && (
            <span className="text-base sm:text-lg capitalize  mr-15">
              {currentSong?.title + " | " + currentSong?.artist}
            </span>
          )}
        </div>
        <div className="grow flex gap-2 justify-end px-2 bg-transparent">
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <NavLink
              to={"/lyrics"}
              className={({ isActive }) =>
                isActive
                  ? `text-white flex justify-center items-center`
                  : "text-gray-400 flex justify-center items-center"
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
      <div
        className="border-b-2 w-full  transition-all duration-50 ease-out"
        style={{ width: `${Math.ceil((currentPosition * 100) / duration)}%` }}
      ></div>
    </div>
  );
};

export default React.memo(MobileSoundBarDisplay);
