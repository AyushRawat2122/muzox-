import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
const Loading = ({src}) => {
    console.log("rendered");
  return (
    <div className="h-full w-full flex justify-center items-center">
      <DotLottieReact src={src} autoplay loop className="h-[50%] w-[50%]"/>
    </div>
  );
};

export default Loading;
