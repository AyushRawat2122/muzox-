import React from "react";
import { useLocation, Outlet, NavLink } from "react-router";
import getUser from "../../serverDataHooks/getUser";
import getUserLikedSong from "../../serverDataHooks/getUserLikedSong";
import getUserPlaylists from "../../serverDataHooks/getUserPlaylists";

// Import icons from lucide-react
import { List, Heart, Plus } from "lucide-react";

// Inline Card component for reusability
const Card = ({ icon, title, defaultBg, hoverBg }) => (
  <div className="relative h-40 rounded-md group overflow-hidden">
    {/* Default background image */}
    <div
      className="absolute inset-0 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-0 card-default"
      style={{ background: defaultBg }}
    />
    {/* Hover background image */}
    <div
      className="absolute inset-0 bg-cover bg-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 card-hover"
      style={{ backgroundImage: `url(${hoverBg})` }}
    />
    {/* Overlay that darkens on hover */}
    <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/40" />
    {/* Icon in the top-left */}
    <div className="absolute top-3 left-3 text-white">{icon}</div>
    {/* Title in the bottom-left */}
    <div className="absolute bottom-3 left-3 font-semibold text-white">
      {title}
    </div>
  </div>
);

const Library = () => {
  const location = useLocation();
  const { data: user, isPending: userPending } = getUser();
  const { data: likedSongs, isPending: likedSongsPending } = getUserLikedSong();
  const { data: playlists, isPending: playlistsPending } = getUserPlaylists();

  // Loading state
  if (userPending || likedSongsPending || playlistsPending) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-black text-white text-2xl">
        Loading...
      </div>
    );
  }

  if (location.pathname === "/library") {
    return (
      <>
        {/* Media query to ensure mobile devices (hover: none) show the hover image by default */}
        <style>{`
          @media (hover: none) {
            .card-default {
              opacity: 0 !important;
            }
            .card-hover {
              opacity: 1 !important;
            }
          }
        `}</style>
        <div className="h-full w-full bg-black text-white p-4 sm:p-8 overflow-y-scroll">
          <h1 className="text-3xl font-bold mb-8">Library</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Card 1: Your Playlists */}
            <NavLink to="/library/playlists" className="group">
              <Card
                icon={<List size={24} />}
                title="Your Playlists"
                defaultBg="linear-gradient(to bottom right, #000, #434343)"
                hoverBg={`/playlists.png`}
              />
            </NavLink>
            {/* Card 2: Liked Songs */}
            <NavLink to={`/library/likedSongs/${user?.data?._id}`} className="group">
              <Card
                icon={<Heart size={24} />}
                title="Liked Songs"
                defaultBg="linear-gradient(to bottom right, #000, #434343)"
                hoverBg={`/LikedSong.png`}
              />
            </NavLink>
            {/* Card 3: Create Playlist */}
            <NavLink to="/library/create-playlist" className="group">
              <Card
                icon={<Plus size={24} />}
                title="Create Playlist"
                defaultBg="linear-gradient(to bottom right, #000, #434343)"
                hoverBg={`/createPlaylists.png`}
              />
            </NavLink>
          </div>
        </div>
      </>
    );
  }

  // Render nested routes if not on the main /library route
  return (
    <div className="h-full w-full bg-black text-white overflow-y-scroll">
      <Outlet />
    </div>
  );
};

export default React.memo(Library);