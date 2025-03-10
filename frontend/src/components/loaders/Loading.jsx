import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { loadingPlayIcon } from "../../utils/lottie.js";
const Loading = () => {
    console.log("rendered");
  return (
    <div className="h-full w-full flex justify-center items-center">
      <DotLottieReact src={loadingPlayIcon} autoplay loop className="h-[50%] w-[50%]"/>
    </div>
  );
};

export default Loading;
