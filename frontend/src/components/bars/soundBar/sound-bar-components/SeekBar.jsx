import React, { useState } from "react";
import "../soundBar.css";
const SeekBar = ({
  className,
  value,
  min,
  max,
  onChange = () => {},
  onMouseDown = () => {},
  onMouseUp = () => {},
  onTouchStart = () => {},
  onTouchEnd = () => {},
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      className={`${className} custom-slider`}
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        "--progress-color": isHovered ? "#fe7641" : "#ffff",
        "--progress-width": `${progress}%`,
      }}
    />
  );
};

export default React.memo(SeekBar);
