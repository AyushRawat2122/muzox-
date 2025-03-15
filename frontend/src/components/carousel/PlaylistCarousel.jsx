import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./playlistCarousel.css";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
const PlaylistCarousel = ({ drag = true, click = true, children }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);

  const handleNext = () => {
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  const handlePrev = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev();
    }
  };
  return (
    <div className="carousel-container relative">
      {click && (
        <button
          onClick={handlePrev}
          className="rounded-full absolute z-999 top-[40%] left-1 bg-black/40 p-1"
        >
          <CircleChevronLeft size={30} />
        </button>
      )}
      <Swiper
        key={`${drag ? "drag" : "nodrag"}-${click ? "click" : "noclick"}`}
        onSwiper={(swiper) => setSwiperInstance(swiper)}
        allowTouchMove={drag}
        slideToClickedSlide={click}
        slidesPerView="auto"
        spaceBetween={10}
        className="mySwiper swiper"
      >
        {children &&
          // Map over passed children and wrap each with SwiperSlide
          React.Children.map(children, (child, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              {child}
            </SwiperSlide>
          ))}
      </Swiper>

      {click && (
        <button
          onClick={handleNext}
          className="rounded-full absolute z-999 top-[40%] right-1 bg-black/40 p-1"
        >
          <CircleChevronRight size={30} />
        </button>
      )}
    </div>
  );
};

export default PlaylistCarousel;
