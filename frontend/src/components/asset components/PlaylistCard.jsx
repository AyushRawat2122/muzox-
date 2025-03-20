import React from "react";

const PlaylistCard = ({ playlist }) => {
  return (
    <div className="h-full w-full relative">
      <div className="absolute px-1 h-full max-sm:bg-black/40 w-full flex items-end lg:opacity-0 hover:opacity-100 hover:bg-black/40 cursor-pointer transition-all ease-in-out duration-300">
        <div className="w-[80%] text-left">
          <h1 className="whitespace-nowrap text-2xl font-bold overflow-ellipsis w-full overflow-hidden">
            {playlist?.name}
          </h1>
          <p className="whitespace-nowrap font-medium overflow-ellipsis w-full overflow-hidden">
            {playlist?.description}
          </p>
        </div>
      </div>
      <img
        src={playlist?.playListCover?.url || "/playlists.png"}
        alt="playlist"
        className="w-full h-full aspect-square object-cover"
      />
    </div>
  );
};

export default PlaylistCard;
