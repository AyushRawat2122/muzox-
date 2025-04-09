import React, { useState, useEffect, useCallback } from "react";
import useAudioPlayer from "../../store/useAudioPlayer";
import { useMediaQuery } from "react-responsive";
import Loading from "../../components/loaders/Loading.jsx";
import { loadingDotsOrange } from "../../utils/lottie.js";
import axios from "axios";
const LyricsPage = () => {
  const [lyrics, setLyrics] = useState("");
  const [error, setError] = useState("");
  const { currentSong, colors } = useAudioPlayer();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
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

  if (error) {
    return (
      <div className="h-full w-full">
        <div
          className="h-full w-full"
          style={{ backgroundColor: `${colors?.Vibrant?.hex || ""}` }}
        >
          <p className="h-full w-full px-2.5 flex justify-center items-center text-4xl sm:text-5xl text-center text-white font-bold bg-black/25">
            {error}
          </p>
        </div>
      </div>
    );
  }
  if (!error && !lyrics) {
    return (
      <div className="h-full w-full">
        <div
          className="h-full w-full"
          style={{ backgroundColor: `${colors?.Vibrant?.hex || ""}` }}
        >
          <div className="h-full w-full px-2.5 flex justify-center items-center bg-black/25">
            <Loading src={loadingDotsOrange} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-scroll flex flex-col relative hiddenScroll">
      <div style={{ backgroundColor: `${colors?.Vibrant?.hex || ""}` }}>
        <div className="h-fit bg-black/25">
          {!isTabletOrMobile && (
            <div
              className="top-0 rounded-b-md"
              style={
                isTabletOrMobile ? { position: "" } : { position: "sticky" }
              }
            >
              <h1 className="py-2 text-4xl -translate-y-0.5 sm:gap-4 font-bold text-white items-baseline flex max-sm:flex-col pb-1 backdrop-blur-md shadow-md shadow-[#00000031] px-2">
                Lyrics
                <span className="text-base font-light text-gray-100">
                  {"["} lyrics re not synced with the song yet {"]"}
                </span>
              </h1>
            </div>
          )}
          <div className="px-2 w-full flex flex-col items-center justify-center shadow-lg">
            <pre className="whitespace-pre-wrap font-mono text-[33px] font-semibold text-center tracking-wider  text-gray-200 pointer-events-none no-copy">
              {lyrics}
            </pre>
            <p className="py-2 border-t-2 underline underline-offset-4 border-gray-400/50 text-sm text-gray-300 text-left px-2 w-full  max-lg:pb-[18vh]">
              Powered by Lyrics.ovh-
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LyricsPage);
