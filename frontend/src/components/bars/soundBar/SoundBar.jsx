import React, { useState, useEffect } from "react";
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
import { useMediaQuery } from "react-responsive";

const SoundBar = ({ audioElement, className }) => {
  const audio = audioElement;
  const isMobile = useMediaQuery({ query: "(max-width: 40rem)" });
  const [currentPosition, setCurrentPosition] = useState(
    audio?.currentTime || 0
  );
  const [duration, setDuration] = useState(audio?.duration || 0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(
    Math.floor(parseInt(audio?.volume * 100)) || 100
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(audio?.loop || false);

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

  // Use the passed audioElement directly

  useEffect(() => {
    if (!audio) return;

    const onMetaDataLoaded = () => {
      setDuration(audio.duration);
    };
    const onCurrentDurationChange = () => {
      if (!isSeeking) {
        setCurrentPosition(audio.currentTime);
      }
    };

    audio.addEventListener("loadedmetadata", onMetaDataLoaded);
    audio.addEventListener("timeupdate", onCurrentDurationChange);
    return () => {
      audio.removeEventListener("loadedmetadata", onMetaDataLoaded);
      audio.removeEventListener("timeupdate", onCurrentDurationChange);
    };
  }, [audio, isSeeking]);

  const togglePlay = () => {
    togglePlayPause();
  };
  const playNextSong = () => {
    playNext();
  };
  const playPrevSong = () => {
    playPrev();
  };
  const convertToMinSecFormat = (number) => {
    const min = Math.floor(number / 60);
    const sec = Math.floor(number % 60);
    return String(min).padStart(1, "0") + ":" + String(sec).padStart(1, "0");
  };

  const curr_time = convertToMinSecFormat(currentPosition);
  const Totalduration = convertToMinSecFormat(duration);

  const handleSeek = (e) => {
    const newPosition = parseFloat(e.target.value);
    setCurrentPosition(newPosition);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = (e) => {
    if (audio) {
      const newPosition = parseFloat(e.target.value);
      audio.currentTime = newPosition;
    }
    setIsSeeking(false);
  };

  const handleVolumeChange = (e) => {
    const volumeChange = e.target.value;
    if (audio) {
      audio.volume = parseFloat(volumeChange) / 100;
      setVolume(parseInt(volumeChange));
    }
  };

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
  };

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
  };

  const toggleShuffle = () => {
    console.log(isShuffled);
    if (!audio) return;
    if (isShuffled) {
      shuffleBack();
    } else {
      shuffleQueue();
    }
  };

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
          <div className="flex justify-between lg:justify-center items-center sm:px-2 pt-2 gap-2 bg-transparent">
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
                className="max-sm:w-[50px] max-sm:h-[50px] max-sm:bg-white/20  sm:w-10 text-white rounded-full relative text-3xl"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause
                    title="pause"
                    className="adjustCenter bg-transparent"
                    size={30}
                    strokeWidth={isMobile ? 2.5 : 2} 
                  />
                ) : (
                  <PlayIcon
                    title="play"
                    className="adjustCenter bg-transparent translate-x-[2px]"
                    size={30}
                    strokeWidth={isMobile ? 2.5 : 2} 
                  />
                )}
              </button>
              {/* PlayNext */}
              <button
                className="h-8 w-8 rounded-full relative"
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
          <div className="flex justify-center lg:pb-2 max-sm:my-3">
            <div className="text-sm flex lg:max-w-[60vw] relative items-center justify-center grow gap-2">
              {/* Current Time */}
              <span className="max-sm:absolute max-sm:top-full max-sm:left-0 max-sm:mt-1">{curr_time}</span>
              {/* Seek Bar */}
              <SeekBar
                value={currentPosition}
                min={0}
                max={duration}
                className="grow"
                onChange={handleSeek}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchEnd={handleSeekEnd}
              />
              {/* Total Time */}
              <span className="max-sm:absolute max-sm:top-full max-sm:right-0 max-sm:mt-1">{Totalduration}</span>
            </div>
          </div>
        </div>

        {/* Playback controls like volume, lyrics, and queue */}
        <div className="hidden lg:flex flex-wrap gap-3 w-[20%] justify-end px-2.5">
          {/* Lyrics */}
          <NavLink
            to={"/lyrics"}
            className={({ isActive }) =>
              isActive
                ? "text-[#fe7641] flex justify-center items-center"
                : "text-gray-300 flex justify-center items-center"
            }
          >
            <LiaMicrophoneAltSolid title="lyrics" className="text-2xl" />
          </NavLink>

          {/* Queue */}
          <button onClick={toggleQueueDisplay}>
            <HiOutlineQueueList
              title="queue"
              className={`${
                isQueueDisplayed ? "text-[#fe7641]" : "hoverIcon"
              } text-2xl`}
            />
          </button>
          {/* Sound Seek */}
          <div className="flex items-center gap-1">
            {/* Mute/Unmute */}
            <button onClick={toggleMute}>
              {isMuted ? (
                <VolumeOff title="mute" className="hoverIcon" />
              ) : volume === 0 ? (
                <VolumeX className="hoverIcon" />
              ) : volume > 0 && volume < 50 ? (
                <Volume title="unmute" className="hoverIcon" />
              ) : volume >= 50 && volume < 100 ? (
                <Volume1 title="unmute" className="hoverIcon" />
              ) : (
                <Volume2 title="unmute" className="hoverIcon" />
              )}
            </button>
            {/* Volume Seek */}
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
};

export default React.memo(SoundBar);
