import React from "react";
import PlaylistCarousel from "../../components/carousel/PlaylistCarousel";
const Search = () => {
  return (
    <div className="h-full w-full">
      <div>
        Search Result
        <div className="h-[300px]">
        <PlaylistCarousel></PlaylistCarousel>
        </div>
      </div>
    </div>
  );
};

export default Search;
