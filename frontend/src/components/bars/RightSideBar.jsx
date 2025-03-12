import React, { useState } from "react";
import CurrentSongAbout from "./CurrentSongAbout";
import useAudioPlayer from "../../store/useAudioPlayer.js";
import { PanelRightClose } from "lucide-react";
import useSideBar from "../../store/useSideBar.js";
import QueueBar from "./QueueBar.jsx";

const RightSideBar = () => {
  const { currentSong } = useAudioPlayer();
  const { toggleSideBarOpen, isQueueDisplayed} = useSideBar();
  const [isRecentTabOpen, setIsRecentTabOpen] = useState(false);
  return (
    <div className="h-full flex relative flex-col w-full overflow-y-auto">
      <div className="sticky font-semibold text-lg top-0 py-3 shadow-md shadow-[#121212] flex items-center gap-2.5 z-10 bg-[#121212]">
        <PanelRightClose
          className="hover:text-white text-[#c9c9c9] cursor-pointer"
          onClick={() => {
            toggleSideBarOpen();
          }}
        />
        {!isQueueDisplayed && <h1>{currentSong?.title}</h1>}
        {isQueueDisplayed && (
          <div className="flex w-full gap-4 text-base items-center">
            {" "}
            <button
              onClick={() => {
                if (isRecentTabOpen) {
                  setIsRecentTabOpen(false);
                }
              }}
              className={`${!isRecentTabOpen ? "underline" : ""} capitalize underline-offset-7 decoration-2 decoration-[#ff00ff]`}
            >
              queue
            </button>
            <button
              onClick={() => {
                if (!isRecentTabOpen) {
                  setIsRecentTabOpen(true);
                }
              }}
              className={`${isRecentTabOpen ? "underline" : ""} capitalize underline-offset-7 decoration-2 decoration-[#ff00ff]`}
            >
              recently played
            </button>
          </div>
        )}
      </div>
      {!isQueueDisplayed && <CurrentSongAbout />}
      {isQueueDisplayed && <QueueBar isRecentTabOpen={isRecentTabOpen} />}
    </div>
  );
};

export default React.memo(RightSideBar);
