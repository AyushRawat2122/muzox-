import React, { useEffect, useState } from "react";
import getUserPlaylists from "../../serverDataHooks/getUserPlaylists.js";
import { loadingPlayIcon } from "../../utils/lottie.js";
import Loading from "../../components/loaders/Loading.jsx";
import getUser from "../../serverDataHooks/getUser.js";
import PlaylistCarousel from "../../components/carousel/PlaylistCarousel.jsx";
import { NavLink, useNavigate } from "react-router";
import { PlusCircle, Search } from "lucide-react";
import { PlaylistCard } from "../../components/asset components/index.js";
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
    console.log(playlists);
  }, [playlists]);
  const navigate = useNavigate();
  const date = new Date();
  if (playlistPending || userPending) {
    return <Loading src={loadingPlayIcon} />;
  }

  return (
    <div className="h-full w-full overflow-y-scroll p-2">
      <h1 className="text-3xl font-extrabold my-2">Playlists:</h1>
      <h2 className="text-xl font-semibold my-2">Your Favorites:</h2>
      {favorites.length > 0 ? (
        <PlaylistCarousel>
          {favorites.map((playlist, id) => {
            const key = date.now + id;
            return (
              <PlaylistCard playlist={playlist} key={key} onClick={undefined} />
            );
          })}
        </PlaylistCarousel>
      ) : (
        <NavLink to={"/search"}>
          <div className="max-sm:h-[150px] max-sm:w-[150px] max-lg:w-[180px] max-lg:h-[180px] h-[200px] w-[200px] bg-white/10 rounded-md hover:bg-white/14 transition-all ease-in-out duration-300">
            <div className="flex flex-col justify-center items-center h-full gap-2">
              <Search />
              <p className="text-white">Browse</p>
            </div>
          </div>
        </NavLink>
      )}
      <h2 className="text-xl font-semibold my-2">Your Creations:</h2>
      {creations.length > 0 ? (
        <PlaylistCarousel>
          {creations.map((playlist, id) => {
            const key = date.now + id;
            const playlistPage = `/playlist/${playlist?._id}`;
            return (
              <PlaylistCard
                playlist={playlist}
                key={key}
                onClick={() => {
                  navigate(playlistPage);
                }}
              />
            );
          })}
        </PlaylistCarousel>
      ) : (
        <NavLink to={"/library/create-playlist"}>
          <div className="max-sm:h-[150px] max-sm:w-[150px] max-lg:w-[180px] max-lg:h-[180px] h-[200px] w-[200px] bg-white/10 rounded-md hover:bg-white/14 transition-all ease-in-out duration-300">
            <div className="flex flex-col justify-center items-center h-full gap-2">
              <PlusCircle />
              <p className="text-white">Create Playlist</p>
            </div>
          </div>
        </NavLink>
      )}
    </div>
  );
};

export default PlaylistsPage;
