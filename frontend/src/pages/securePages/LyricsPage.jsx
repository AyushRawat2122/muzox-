import React, { useState, useEffect, useCallback } from "react";
import useAudioPlayer from "../../store/useAudioPlayer";
import axios from "axios";
const LyricsPage = () => {
  const [lyrics, setLyrics] = useState("");
  const [error, setError] = useState("");
  const { currentSong, colors } = useAudioPlayer();
  const lyricsErrorMessages = [
    "Lyrics? We got you on this one—our team is working on it!",
    "No lyrics right now. Trust us, we’re on it!",
    "Looks like the words are taking a break. We’re working on getting them back for you!",
    "Oops, no lyrics available at the moment. We’re on the case!",
  ];
  const fetchLyrics = useCallback(async () => {
    setError("");
    setLyrics("");

    try {
      if (!currentSong) {
        setError(
          "It seems there's no melody playing right now! Your lyrics page is whispering in the wind."
        );
        return;
      }
      const res = await axios.get(
        `https://api.lyrics.ovh/v1/${currentSong.artist}/${currentSong.title}`,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(res.data.lyrics);
      setLyrics(res.data.lyrics);
    } catch (err) {
      console.log(err);
      const randIdx = Math.floor(Math.random() * lyricsErrorMessages.length);
      setError(lyricsErrorMessages[randIdx]);
    }
  }, [currentSong]);
  console.log(colors);
  useEffect(() => {
    fetchLyrics();
  }, [currentSong]);
  return (
    <div className="h-full w-full overflow-y-scroll flex flex-col relative hiddenScroll">
      <div className="bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.4)_100%)] sticky top-0  rounded-b-md ">
        <h1 className="py-2 text-4xl bg-black/20  -translate-y-0.5 sm:gap-4 font-bold text-white items-baseline flex max-sm:flex-col pb-1 backdrop-blur-md shadow-md shadow-[#00000031] px-2">
          Lyrics
          <span className="text-base font-light text-gray-100">
            {"["} lyrics re not synced with the song yet {"]"}
          </span>
        </h1>
      </div>
      <div className="h-full px-2 w-full grow flex items-center justify-center shadow-lg overflow-hidden">
        {error ? (
          <p className="text-gray-300 text-center h-full w-full text-[30px] flex justify-center items-center">
            {error}
          </p>
        ) : lyrics ? (
          <div className="h-full w-full overflow-y-scroll ">
            <hr className="text-[#cccccc9a]" />
            <pre className="whitespace-pre-wrap font-mono text-[33px] font-semibold text-center tracking-wider  text-gray-200 pointer-events-none no-copy">
              {lyrics}
            </pre>
            <hr className="text-[#cccccc9a]" />
            <p className="py-2 text-sm text-gray-300 px-2  max-lg:pb-[18vh]">
              Powered by Lyrics.ovh-
            </p>
          </div>
        ) : (
          <p className="text-gray-300 h-full w-full flex justify-center items-center">
            Loading...
          </p>
        )}
      </div>
      <div
        className="h-full w-full absolute -z-20"
        style={{ backgroundColor: `${colors?.Vibrant?.hex || ""}` }}
      ></div>
    </div>
  );
};

export default React.memo(LyricsPage);
