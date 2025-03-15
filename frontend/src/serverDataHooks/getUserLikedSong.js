import { useQuery } from "@tanstack/react-query";
import { normalRequest } from "../utils/axiosRequests.config";

const fetchLikedSongs = async () => {
  try {
    const likedSongs = await normalRequest.get("/songs/getLikedSong", {
      headers: { "Content-Type": "application/json" },
    });
    return likedSongs.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getUserLikedSong = () =>
  useQuery({
    queryKey: ["likedSongs"],
    queryFn: fetchLikedSongs,
    staleTime: Infinity,
    retry: 2,
  });

export default getUserLikedSong;
