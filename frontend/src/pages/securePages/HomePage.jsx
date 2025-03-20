import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import { normalRequest } from "../../utils/axiosRequests.config";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
  const [data, setData] = useState({
    playlists: [],
    songs: [],
    newlyAdded: [],
  });

  const fetchData = useCallback(async () => {
    try {
      const [playlistRes, songRes, newSongRes] = await Promise.all([
        normalRequest.get("/playlist/home-page-playlist"),
        normalRequest.get("/songs/song-for-home"),
        normalRequest.get("/songs/newlyAddedSong"),
      ]);

      setData({
        playlists: playlistRes.data.data.map((item) => ({
          title: item.name,
          description: item.description,
          src: item.playListCover.url,
        })),
        songs: songRes.data.data.map((item) => ({
          title: item.title,
          artist: item.artist,
          src: item.coverImage.url,
        })),
        newlyAdded: newSongRes.data.data.map((item) => ({
          title: item.title,
          artist: item.artist,
          src: item.coverImage.url,
        })),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const config = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1280, config: { slidesToShow: 3 } },
      { breakpoint: 1024, config: { slidesToShow: 2 } },
      { breakpoint: 768, config: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="h-full w-full overflow-y-scroll p-4 mt-10">
      {[
        { title: "Top Playlists For You", data: data.playlists },
        { title: "Top Songs For You", data: data.songs },
        { title: "Newly Added Songs", data: data.newlyAdded },
      ].map((section, index) => (
        <div key={index} className="mb-6">
          <h1 className="text-xl font-bold mb-2">{section.title}</h1>
          <Slider {...config}>
            {section.data.map((item, idx) => (
              <div key={idx} className="p-2">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-lg"
                  loading="lazy"
                />
                <p className="text-center font-semibold">{item.title}</p>
                {item.artist && <p className="text-center text-sm">{item.artist}</p>}
              </div>
            ))}
          </Slider>
        </div>
      ))}
    </div>
  );
};

export default React.memo(HomePage);
