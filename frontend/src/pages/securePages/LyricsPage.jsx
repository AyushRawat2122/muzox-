import React, { useState, useEffect } from "react";
import useAudioPlayer from "../../store/useAudioPlayer";
import axios from "axios";

const LyricsPage = () => {
  const [lyrics, setLyrics] = useState("");
  const [error, setError] = useState("");
  const { currentSong } = useAudioPlayer();

  useEffect(() => {
    if (currentSong && currentSong?.artist && currentSong?.title) {
      const fetchLyrics = async () => {
        try {
          const res = await axios.get(
            `https://api.lyrics.ovh/v1/${currentSong.artist}/${currentSong.title}`,
            { headers: { "Content-Type": "application/json" } }
          );
          setLyrics(res.data.lyrics);
        } catch (err) {
          console.log(err);
          setError("Lyrics is not available ");
        }
      };
      fetchLyrics();
    }
  }, [currentSong]);

  return (
    <div className="h-full w-full overflow-y-scroll flex flex-col relative pb-2">
      <h1 className="text-2xl font-bold text-white sticky top-0 pb-1 backdrop-blur-md shadow-md shadow-[#00000031] px-2">Lyrics <span className="text-sm px-4 font-light text-gray-300">{'['} lyrics re not synced with the song yet {']'}</span></h1>
      <hr className="text-[#cccccc9a]" />
      <div className="grow bg-black/20 my-2 rounded-lg shadow-lg p-8 mx-2">
        {error ? (
          <p className="text-gray-300 text-center h-full w-full flex justify-center items-center">{error}</p>
        ) : lyrics ? (
          <pre className="whitespace-pre-wrap font-mono text-[30px] text-center tracking-wider  text-gray-200 pointer-events-none no-copy">
            {lyrics}
          </pre>
        ) : (
          <p className="text-gray-300 h-full w-full flex justify-center items-center">Loading...</p>
        )}
      </div>
      <hr className="text-[#cccccc9a]" />
      <p className="py-2 text-sm text-gray-300 px-2">Powered by Lyrics.ovh-</p>
    </div>
  );
};

export default LyricsPage;
