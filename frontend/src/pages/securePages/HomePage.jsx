import React, { useEffect, useState } from "react";
import { normalRequest } from "../../utils/axiosRequests.config";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../components/loaders/Loading";
import { loadingDotsOrange } from "../../utils/lottie";
import PlaylistCarousel from "../../components/carousel/PlaylistCarousel";
import { PlaylistCard } from "../../components/asset components";

const HomePage = () => {
  const [data, setData] = useState({
    playlists: [],
    songs: [],
    newlyAdded: [],
  });

  const fetchData = async () => {
    const [playlistRes, songRes, newSongRes] = await Promise.all([
      normalRequest.get("/playlist/home-page-playlist"),
      normalRequest.get("/songs/song-for-home"),
      normalRequest.get("/songs/newlyAddedSong"),
    ]);

    return {
      playlists: playlistRes.data.data,
      songs: songRes.data.data,
      newlyAdded: newSongRes.data.data,
    };
  };

  const { data: homePageData, isPending } = useQuery({
    queryKey: ["homePageData"],
    queryFn: fetchData,
  });

  useEffect(() => {
    if (homePageData) {
      setData(homePageData);
    }
  }, [homePageData]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading src={loadingDotsOrange} />
      </div>
    );
  }


  const half = Math.ceil(data.newlyAdded.length / 2);
  const firstColumn = data.newlyAdded.slice(0, half);
  const secondColumn = data.newlyAdded.slice(half);

  return (
    <div className="p-4 overflow-y-scroll h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Top Playlist For You</h1>
        <PlaylistCarousel>
          {data.playlists.map((item, index) => {
            const key = index + data.now;
            return (
              <PlaylistCard key={key} playlist={item} onClick={undefined} />
            );
          })}
        </PlaylistCarousel>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Recommended Songs</h1>
        <div className="grid grid-cols-3 gap-4">
          {data.songs.map((item, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={item.coverImage.url}
                alt={`${item.title}-img`}
                className="w-full h-45 object-cover hover:opacity-45"
              />
              <div className="absolute bottom-0 left-0 w-full  bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm">{item.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">Latest Songs</h1>
        <div className="grid grid-cols-2 gap-10">
          <div className="flex flex-col space-y-2">
            {firstColumn.map((song, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={song.coverImage.url}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded hover:opacity-75"
                  />
                  <div>
                    <p className="text-sm font-semibold">{song.title}</p>
                    <p className="text-xs text-gray-400">{song.artist}</p>
                  </div>
                </div>
                <div className="text-gray-400 hover:text-white cursor-pointer">
               <button>•••</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col space-y-2">
            {secondColumn.map((song, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={song.coverImage.url}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold">{song.title}</p>
                    <p className="text-xs text-gray-400">{song.artist}</p>
                  </div>
                </div>
                <div className="text-gray-400 hover:text-white cursor-pointer">
                  <button>•••</button>
                   {/* abhi ke liye button de diya */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
