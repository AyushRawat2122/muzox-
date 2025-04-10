import React from "react";
import { motion } from "framer-motion";
import { SoundBar } from "../bars/index.js";
import useAudioPlayer from "../../store/useAudioPlayer.js";
import { ChevronDownCircle } from "lucide-react";
import usePopUp from "../../store/usePopUp.js";
import Marquee from "react-fast-marquee";
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
          <div
            className="flex justify-center relative w-full bg-black/20 border-b-4 rounded-b-2xl pb-2 border-[#ffffff1c]"
            onClick={() => {
              setSoundBarPopUp(false);
            }}
          >
            <div className="flex flex-col items-center pt-1">
              <h1 className="text-sm sm:text-base text-gray-300">
                Now Playing
              </h1>
              <div className="capitalize text-bold text-lg w-[80%] sm:text-xl text-gray-100 text-center ">
                <Marquee pauseOnHover gradient={false} speed={40}>
                  <span className="text-lg sm:text-lg capitalize font-semibold mr-5">
                    {currentSong?.title + " | " + currentSong?.artist}
                  </span>
                </Marquee>
              </div>
            </div>
            <ChevronDownCircle
              size={25}
              className="text-[#ffffffa5] bg-white/10 rounded-full backdrop:blur-7xl absolute bottom-0 translate-y-[60%]"
            />
          </div>
          <div className="grow pointer-events-none"></div>
          <motion.div
            animate={soundBarPopUp ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <SoundBar
              audioElement={audioElement}
              className="px-1 py-2 rounded-top-md bg-transparent mb-8"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileTabletsView;
