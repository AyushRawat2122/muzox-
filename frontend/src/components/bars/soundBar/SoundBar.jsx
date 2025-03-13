import React, { useState, useEffect, useRef, forwardRef } from "react";
import { IoPlaySkipBackSharp, IoPlaySkipForwardSharp } from "react-icons/io5";
import { PiRepeat } from "react-icons/pi";
import { RxShuffle } from "react-icons/rx";
import { LiaMicrophoneAltSolid } from "react-icons/lia";
import {
  Volume,
  Volume1,
  Volume2,
  VolumeOff,
  VolumeX,
  PlayIcon,
  Pause,
} from "lucide-react";
import useAudioPlayer from "../../../store/useAudioPlayer.js";
import SeekBar from "./sound-bar-components/SeekBar";
import { HiOutlineQueueList } from "react-icons/hi2";
import TrackDisplay from "./sound-bar-components/TrackDisplay";
import useSideBar from "../../../store/useSideBar.js";
import { NavLink } from "react-router";

const SoundBar = forwardRef((props, ref) => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  const {
    isShuffled,
    shuffleQueue,
    shuffleBack,
    isPlaying,
    playNext,
    playPrev,
    togglePlayPause,
  } = useAudioPlayer();
  const { isQueueDisplayed, toggleQueueDisplay } = useSideBar();
  const audio = ref?.current?.getAudioElement(); // this will bring us the audio ref
  const className = props?.className;

  useEffect(() => {
    if (!audio) {
      return;
    }

    const onMetaDataLoaded = (e) => {
      setDuration(audio.duration);
    };
    const onCurrentDurationChange = () => {
      if (!isSeeking) {
        setCurrentPosition(audio.currentTime);
      }
    };

    audio.addEventListener("loadedmetadata", onMetaDataLoaded); //this will allow you to access all props of the audio after its loaded like duration or so otherwise they ll be undefined or null
    audio.addEventListener("timeupdate", onCurrentDurationChange); //this will update the seek
    return () => {
      audio.removeEventListener("loadedmetadata", onMetaDataLoaded);
      audio.removeEventListener("timeupdate", onCurrentDurationChange);
    };
  }, [audio, isSeeking]);

  const togglePlay = () => {
    togglePlayPause();
  }; //play pause functionality
  const playNextSong = () => {
    playNext();
  }; //plays next Song
  const playPrevSong = () => {
    playPrev();
  }; //plays prev Song
  const convertToMinSecFormat = (number) => {
    const min = Math.floor(number / 60); //get min
    const sec = Math.floor(number % 60); //get seconds
    const convertedStr =
      String(min).padStart(1, "0") + ":" + String(sec).padStart(1, "0");
    return convertedStr;
  };

  const curr_time = convertToMinSecFormat(currentPosition);
  const Totalduration = convertToMinSecFormat(duration); // converting to display format

  const handleSeek = (e) => {
    const newPosition = parseFloat(e.target.value);
    setCurrentPosition(newPosition);
  }; // update current time and current postion of seekBar

  const handleSeekStart = () => {
    setIsSeeking(true); // ⏳ Seeking start
  }; // set seeking to true

  const handleSeekEnd = (e) => {
    if (audio) {
      const newPosition = parseFloat(e.target.value);
      audio.currentTime = newPosition; // ✅ Direct audio time update karo
    }
    setIsSeeking(false); // 🔥 Resume auto update only when user releases seek bar
  }; // set seeking to false

  const handleVolumeChange = (e) => {
    const volumeChange = e.target.value;
    if (audio) {
      audio.volume = parseFloat(volumeChange) / 100;
      setVolume(parseInt(volumeChange));
    }
  }; //set volume

  const toggleMute = () => {
    if (audio) {
      if (audio.muted) {
        const currVolume = Math.floor(parseInt(audio.volume * 100));
        setIsMuted(false);
        audio.muted = false;
        setVolume(currVolume);
      } else {
        setIsMuted(true);
        audio.muted = true;
        setVolume(0);
      }
    }
  }; //toggle the mute functionality

  const toggleLoop = () => {
    if (!audio) return;
    console.log(isLoop);
    if (audio.loop) {
      audio.loop = false;
      setIsLoop(false);
    } else {
      audio.loop = true;
      setIsLoop(true);
    }
  }; //toggle the loop functionality

  const toggleShuffle = () => {
    console.log(isShuffled);
    if (!audio) return;
    if (isShuffled) {
      shuffleBack();
    } else {
      shuffleQueue();
    }
  }; //toggle the shuffle functionality

  return (
    <div className={`${className} w-full bg-black/60 text-white`}>
      <div className="flex w-full flex-col lg:flex-row gap-2.5 px-2.5">
        {/* Current song information */}
        <div className="w-full lg:w-[20%]">
          <TrackDisplay />
        </div>

        {/* Current song seek + control */}
        <div className="flex flex-col-reverse lg:flex-col w-full lg:w-[60%]">
          {/* Song Controls */}
          <div className="flex justify-between lg:justify-center items-center px-2 pt-2 gap-2 bg-transparent">
            {/* Shuffle */}
            <button
              className="h-8 w-8 rounded-full relative"
              onClick={toggleShuffle}
            >
              <RxShuffle
                title="shuffle"
                className={
                  (isShuffled ? "text-[#fe7641]" : "hoverIcon") +
                  " adjustCenter text-xl"
                }
              />
            </button>
            <div className="flex justify-center items-center gap-2">
              {/* PlayPrevious */}
              <button
                className="h-8 w-8 rounded-full relative"
                onClick={playPrevSong}
              >
                <IoPlaySkipBackSharp
                  title="play next"
                  className="adjustCenter hoverIcon text-2xl"
                />
              </button>
              {/* Play || Pause */}
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
              {/* PlayNext */}
              <button
                className="h-8 w-8 rounded-full relative "
                onClick={playNextSong}
              >
                <IoPlaySkipForwardSharp
                  title="play next"
                  className="adjustCenter hoverIcon text-2xl"
                />
              </button>
            </div>
            {/* Repeat */}
            <button
              className="h-8 w-8 rounded-full relative"
              onClick={toggleLoop}
            >
              <PiRepeat
                title="repeat"
                className={`${
                  isLoop ? "text-[#fe7641]" : "text-gray-300"
                } adjustCenter text-xl`}
              />
            </button>
          </div>

          {/* Seek Bar */}
          <div className="flex justify-center lg:pb-2">
            {/* Combined Seek Bar */}
            <div className="text-sm flex lg:max-w-[60vw] items-center justify-center grow gap-2">
              {/* Current Time */}
              <span>{curr_time}</span>
              {/* Seek Bar */}
              <SeekBar
                value={currentPosition}
                min={0}
                max={duration}
                className="grow"
                onChange={handleSeek}
                onMouseDown={handleSeekStart} // ⏳ Seeking start
                onMouseUp={handleSeekEnd} // ✅ Seeking end
                onTouchStart={handleSeekStart} // 📱 Mobile support
                onTouchEnd={handleSeekEnd} // 📱 Mobile support
              />
              {/* Total Time */}
              <span>{Totalduration}</span>
            </div>
          </div>
        </div>

        {/* Playback controls like volume + lyrics + queue */}
        <div className="hidden lg:flex flex-wrap gap-3  w-[20%] justify-end px-2.5">
          {/* Lyrics */}

          <NavLink
            to={"/lyrics"}
            className={({ isActive }) =>
              isActive ? "text-[#fe7641] flex justify-center items-center" : "text-gray-300 flex justify-center items-center"
            }
          >
            <LiaMicrophoneAltSolid
              title="lyrics"
              className="text-2xl"
            />
          </NavLink>

          {/* Queue */}
          <button
            onClick={() => {
              toggleQueueDisplay();
            }}
          >
            <HiOutlineQueueList
              title="queue"
              className={`${
                isQueueDisplayed ? "text-[#fe7641]" : "hoverIcon"
              } text-2xl`}
            />
          </button>
          {/* Sound Seek */}
          <div className="flex items-center gap-1">
            {/* mute unmute */}
            <button onClick={toggleMute}>
              {isMuted ? (
                <VolumeOff title="mute" className="hoverIcon" /> // 🔇 Mute icon
              ) : volume === 0 ? (
                <VolumeX className="hoverIcon" /> // ❌ Volume off (muted nahi but 0 hai)
              ) : volume > 0 && volume < 50 ? (
                <Volume title="unmute" className="hoverIcon" /> // 🔊 Low Volume
              ) : volume >= 50 && volume < 100 ? (
                <Volume1 title="unmute" className="hoverIcon" /> // 🔉 Medium Volume
              ) : (
                <Volume2 title="unmute" className="hoverIcon" /> // 🔊 Max Volume
              )}
            </button>
            {/* Set Sound In Range */}
            <SeekBar
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default SoundBar;
