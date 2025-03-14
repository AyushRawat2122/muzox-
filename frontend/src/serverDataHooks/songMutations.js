import { queryClient, normalRequest } from "../utils/axiosRequests.config";
import { useMutation } from "@tanstack/react-query";

const useLikeSong = () => {
  return useMutation({
    mutationFn: async (songID) => {
      try {
        const likedSong = await normalRequest.post(
          `/songs/like-a-song/${songID}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return likedSong?.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["likedSongs"], (oldData) => {
        return [...(oldData || []), data?.data];
      });
    },
  });
};

const useUnlikeSong = () => {
  return useMutation({
    mutationFn: async (songID) => {
      try {
        const unlikeSong = await normalRequest.delete(
          `/songs/unlike/${songID}`,
          { headers: { "Content-Type": "application/json" } }
        );
        return songID;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (songID) => {
      queryClient.setQueryData(["likedSongs"], (oldData) => {
        return oldData.filter((song) => song?._id !== songID);
      });
    },
  });
};

export { useLikeSong, useUnlikeSong };
