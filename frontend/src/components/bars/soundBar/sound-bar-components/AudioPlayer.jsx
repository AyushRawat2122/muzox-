import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import useAudioPlayer from "../../../../store/useAudioPlayer.js";
import { saveInIDB } from "../../../../utils/frontendStorage.js";
import { Vibrant } from "node-vibrant/browser";
//used forwardRef to pass a ref from soundBar to here so that sound bar can take access of the audioRef

const AudioPlayer = forwardRef((props, ref) => {
  const { currentSong, isPlaying, playNext ,setColor } = useAudioPlayer(); //methods and states imported from global audioPlayer
  const audioRef = useRef(null); //create ref of audio element to prevent modifiying at rerenders

  useImperativeHandle(ref, () => {
    return { getAudioElement: () => audioRef.current };
  }); //here ref has a object which has a method which will provide the parent - access to the audio of child Element

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const onFinish = () => {
      if (!audioRef.current.loop) {
        playNext();
      }
    }; //action performed when the song gets ended only when the user is not set his current song to loop

    audio.addEventListener("ended", onFinish); //this will trigger when the song is ended

    return () => {
      audio.removeEventListener("ended", onFinish);
    }; // this is used for the cleanup function
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    async function fetchImageAsBlob(url) {
      try {
        const response = await fetch(url, { mode: "cors" }); // Fetch the image
        const blob = await response.blob(); // Convert it into a Blob
        const blobUrl = URL.createObjectURL(blob); // Create a local Blob URL
        const color = await Vibrant.from(blobUrl).getPalette();
        console.log(color);
        setColor(color);
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    }
    if (audioRef.current?.src !== currentSong?.song?.url) {
      audioRef.current.src = currentSong?.song?.url;
      fetchImageAsBlob(currentSong?.coverImage?.url);
      saveInIDB(currentSong);
    } // setting audio src

    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    } // conditional play
  }, [currentSong, isPlaying]); //this thing should be fixed with the backend integration

  return <audio ref={audioRef} />;
});

export default AudioPlayer;