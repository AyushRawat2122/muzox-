import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
const Loading = ({src}) => {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <DotLottieReact src={src} autoplay loop className="lg:h-[120px] lg:w-[120px] h-[80px] w-[80px] "/>
    </div>
  );
};

export default Loading;
