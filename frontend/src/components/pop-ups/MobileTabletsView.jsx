import React from "react";
import { motion } from "framer-motion";
import { SoundBar } from "../bars/index.js";
import useAudioPlayer from "../../store/useAudioPlayer.js";
import { ChevronDown } from "lucide-react";
import usePopUp from "../../store/usePopUp.js";

const MobileTabletsView = (props) => {
  const { audioElement } = props;
  const { currentSong } = useAudioPlayer();
  const { soundBarPopUp, setSoundBarPopUp } = usePopUp(); // assuming soundBarPopUp exists

  return (
    <motion.div
      key="mobileView" // unique key helps AnimatePresence track the component
      initial={{ opacity: 0, y: 100 }} // starts off-screen (or lower opacity)
      animate={{ opacity: 1, y: 0 }} // animates into view
      exit={{ opacity: 0, y: 100 }} // exits by moving downward and fading
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute z-888 w-screen h-screen bg-cover bg-center"
      style={{
        backgroundImage: currentSong?.coverImage?.url
          ? `url(${currentSong.coverImage.url})`
          : "linear-gradient(135deg, #ff8c00, #2d2d2d)",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative z-10 text-white text-2xl flex justify-center items-center h-full">
        <div className="flex flex-col h-full w-full">
          <div className="flex py-2 items-center gap-1">
            <ChevronDown
              size={40}
              className="text-gray-300"
              onClick={() => {
                // Assuming toggling soundBarPopUp might also trigger unmount of this view in the parent
                setSoundBarPopUp(false);
              }}
            />
            <div className="flex items-center gap-2">
              <h1>Now Playing:</h1>
              <span className="marquee-container max-sm:w-[150px] sm:w-[300px]">
                <p className="marquee capitalize"> {currentSong?.title + " | " + currentSong?.artist} </p>
              </span>
            </div>
          </div>
          <div className="grow pointer-events-none"></div>
          <motion.div
            animate={soundBarPopUp ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <SoundBar
              audioElement={audioElement}
              className="px-1 py-2 rounded-top-md bg-transparent"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileTabletsView;
