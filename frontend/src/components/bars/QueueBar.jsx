"use client";
import React, { useState, useEffect } from "react";
import useAudioPlayer from "../../store/useAudioPlayer.js";
import { SideBarMusicCards } from "../asset components/index.js";
import { getRecentSongs } from "../../utils/frontendStorage.js";

const QueueBar = ({ className, isRecentTabOpen }) => {
  const [songs, setSongs] = useState([]);
  const { currentSong, currentSongIdx, queue, setCurrentSong } = useAudioPlayer();

  useEffect(() => {
    if (isRecentTabOpen) {
      getRecentSongs()
        .then((fetchedSongs) => {
          setSongs(fetchedSongs);
        })
        .catch((err) => console.error("Error fetching recent songs:", err));
    }
  }, [isRecentTabOpen]);

  return (
    <div className={`${className} h-full w-full px-2`}>
      {!isRecentTabOpen ? (
        <div className="h-full w-full flex flex-col gap-5 py-3 text-sm font-bold capitalize">
          <div>
            <h1 className="py-2">Now playing</h1>
            <SideBarMusicCards className={"text-[#fe7641]"} Song={currentSong} />
          </div>
          <div>
            <h1 className="py-2">Up Next</h1>
            <div className="flex flex-col gap-1">
              {queue.map((song, idx) => {
                if (idx > currentSongIdx) {
                  return (
                    <SideBarMusicCards
                      key={idx}
                      Song={song}
                      onClick={() => setCurrentSong(idx)}
                    />
                  );
                }
                return null;
              })}
              {currentSongIdx === queue.length - 1 && (
                <p className="font-normal text-sm italic text-center underline-offset-8 underline decoration-white decoration-1">
                  The playlist has ended. Pick another vibe!
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex py-3 flex-col">
          <h1 className="capitalize text-sm font-bold">recently played</h1>
          <ul>
            {songs.map((elm) => (
              <SideBarMusicCards Song={elm} key={elm.id} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(QueueBar);
