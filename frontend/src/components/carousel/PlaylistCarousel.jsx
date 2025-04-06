import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./playlistCarousel.css";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import { useMediaQuery } from "react-responsive";
const PlaylistCarousel = ({ drag = true, click = true, children }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
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
      {!isTabletOrMobile && (
        <div className="absolute bottom-[100%] flex gap-2.5 -translate-y-3 right-0">
          <button onClick={handlePrev}>
            <CircleChevronLeft size={25} />
          </button>
          <button onClick={handleNext}>
            <CircleChevronRight size={25} />
          </button>
        </div>
      )}

      <Swiper
        key={`${isTabletOrMobile ? "drag" : "nodrag"}-${
          !isTabletOrMobile ? "click" : "noclick"
        }`}
        onSwiper={(swiper) => setSwiperInstance(swiper)}
        allowTouchMove={isTabletOrMobile}
        slideToClickedSlide={!isTabletOrMobile}
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
    </div>
  );
};

export default PlaylistCarousel;
