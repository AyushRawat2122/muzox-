import React, { useEffect, useState } from "react";
import getUserPlaylists from "../../serverDataHooks/getUserPlaylists.js";
import { loadingPlayIcon } from "../../utils/lottie.js";
import Loading from "../../components/loaders/Loading.jsx";
import getUser from "../../serverDataHooks/getUser.js";
import PlaylistCarousel from "../../components/carousel/PlaylistCarousel.jsx";

const PlaylistsPage = () => {
  const { data: playlists, isPending: playlistPending } = getUserPlaylists();
  const { data: user, isPending: userPending } = getUser();
  const [favorites, setFavorites] = useState([]);
  const [creations, setCreations] = useState([]);

  useEffect(() => {
    const favs = playlists?.data?.filter(
      (playlist) => playlist?.owner !== user?._id
    );
    const created = playlists?.data?.filter(
      (playlist) => playlist?.owner === user?._id
    );

    setFavorites(favs);
    setCreations(created);
    console.log(favs, created);
  }, [playlists]);

  const date = new Date();
  if (playlistPending || userPending) {
    return <Loading src={loadingPlayIcon} />;
  }

  return (
    <div className="h-full w-full overflow-y-scroll p-2">
      <h1 className="text-3xl font-extrabold my-2">Playlists:</h1>
      <h2 className="text-xl font-semibold my-2">Your Favorites:</h2>
      {favorites.length > 0 ? <PlaylistCarousel></PlaylistCarousel> : <p> </p>}
      <h2 className="text-xl font-semibold my-2">Your Creations:</h2>
      {creations.length > 0 ? (
        <PlaylistCarousel>
          {creations.map((playlist, id) => (
            <div className="h-full w-full relative" key={date.now + id}>
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
          ))}
        </PlaylistCarousel>
      ) : (
        <p> </p>
      )}
    </div>
  );
};

export default PlaylistsPage;
