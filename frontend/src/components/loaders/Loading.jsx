import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
const Loading = ({ src, className, children }) => {
  return (
    <div className="h-full w-full  max-lg:flex-col max-lg:gap-2 flex lg:flex-row  justify-center items-center flex-wrap px-2">
      <DotLottieReact
        src={src}
        autoplay
        loop
        className={`${
          className ? className : "lg:h-[120px] lg:w-[120px] h-[80px] w-[80px]"
        } `}
      />
      <div className=" lg:translate-[-30%] lg:translate-y-2 flex max-lg:w-full justify-center">
        {children}
      </div>
    </div>
  );
};

export default Loading;
