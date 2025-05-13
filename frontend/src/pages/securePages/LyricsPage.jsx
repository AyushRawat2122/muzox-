import React, { useState, useEffect, useCallback, useMemo } from "react";
import useAudioPlayer from "../../store/useAudioPlayer";
import { useMediaQuery } from "react-responsive";
import Loading from "../../components/loaders/Loading.jsx";
import { loadingDotsOrange } from "../../utils/lottie.js";
import axios from "axios";

// Helper: calculate relative luminance of a hex color
function luminance(hex) {
  const rgb = hex.replace('#', '')
    .match(/.{1,2}/g)
    .map(x => parseInt(x, 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

// Helper: lighten a hex color
function lighten(hex, amount = 0.2) {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = Math.min(255, Math.floor(((num >> 16) & 0xFF) * (1 + amount)));
  let g = Math.min(255, Math.floor(((num >> 8) & 0xFF) * (1 + amount)));
  let b = Math.min(255, Math.floor((num & 0xFF) * (1 + amount)));
  return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const LyricsPage = () => {
  const [lyrics, setLyrics] = useState("");
  const [error, setError] = useState("");
  const { currentSong, colors } = useAudioPlayer();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  const { bgColor, textColor } = useMemo(() => {
    const vibrant = colors?.Vibrant?.hex || '#000000';
    const lightMuted = colors?.LightMuted?.hex;
    const darkMuted = colors?.DarkMuted?.hex;
    const bgLum = luminance(vibrant);
    let text = '#FFFFFF';
    if (bgLum < 0.5) {
      text = lightMuted ? lighten(lightMuted, 0.25) : '#FFFFFF';
    } else {
      text = darkMuted || '#000000';
    }
    return { bgColor: vibrant, textColor: text };
  }, [colors]);

  const lyricsErrorMessages = [
    "Lyrics? We got you on this one—our team is working on it!",
    "No lyrics right now. Trust us, we’re on it!",
    "Looks like the words are taking a break. We’re working on getting them back for you!",
    "Oops, no lyrics available at the moment. We’re on the case!",
  ];

  const fetchLyrics = useCallback(async () => {
    setError("");
    setLyrics("");

    if (!currentSong) {
      setError(
        "It seems there's no melody playing right now! Your lyrics page is whispering in the wind."
      );
      return;
    }

    try {
      const res = await axios.get(
        `https://api.lyrics.ovh/v1/${currentSong.artist}/${currentSong.title}`
      );
      setLyrics(res.data.lyrics);
    } catch (err) {
      const randIdx = Math.floor(Math.random() * lyricsErrorMessages.length);
      setError(lyricsErrorMessages[randIdx]);
    }
  }, [currentSong]);

  useEffect(() => {
    fetchLyrics();
  }, [fetchLyrics]);

  if (error) {
    return (
      <div className="h-full w-full" style={{ backgroundColor: bgColor }}>
        <p className="h-full w-full px-2.5 flex justify-center items-center text-4xl sm:text-5xl text-center text-white font-bold bg-black/25">
          {error}
        </p>
      </div>
    );
  }

  if (!lyrics) {
    return (
      <div className="h-full w-full" style={{ backgroundColor: bgColor }}>
        <div className="h-full w-full px-2.5 flex justify-center items-center bg-black/25">
          <Loading src={loadingDotsOrange} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-scroll flex flex-col relative hiddenScroll">
      <div style={{ backgroundColor: bgColor }}>
        <div className="h-fit bg-black/25">
          {!isTabletOrMobile && (
            <div className="top-0 rounded-b-md" style={{ position: 'sticky' }}>
              <h1 className="py-2 text-4xl -translate-y-0.5 sm:gap-4 font-bold text-white items-baseline flex max-sm:flex-col pb-1 backdrop-blur-md shadow-md shadow-[#00000031] px-2">
                Lyrics
                <span className="text-base font-light text-gray-100">
                  [ lyrics are not synced with the song yet ]
                </span>
              </h1>
            </div>
          )}
          <div className="px-2 w-full flex flex-col items-center justify-center shadow-lg">
            <pre
              className="inter whitespace-pre-wrap font-sans text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl leading-7 sm:leading-8 md:leading-10 lg:leading-[3.5rem] xl:leading-[4rem] lg:font-semibold text-center tracking-wide pointer-events-none no-copy"
              style={{ color: "white" }}
            >
              {lyrics}
            </pre>
            <p className="py-2 border-t-2 border-gray-400/50 text-sm text-gray-300 text-left px-2 w-full max-lg:pb-[18vh]">
              Powered by Lyrics.ovh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LyricsPage);
