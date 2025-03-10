import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { floatingMusicIcons } from "../../utils/lottie.js";
const EmptyQueue = () => {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      <DotLottieReact
        src={floatingMusicIcons}
        autoplay
        loop
        className="h-fit"
      />
      <p className=" text-center absolute top-[70%] text-2xl italic">
        The stage is empty! <br /> Time to bring
        <br /> the vibes—pick something! ✨
      </p>
    </div>
  );
};

export default EmptyQueue;
