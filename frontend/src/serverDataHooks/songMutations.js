import { queryClient, normalRequest } from "../utils/axiosRequests.config";
import { useMutation } from "@tanstack/react-query";

const useLikeSong = () => {
  return useMutation({
    mutationFn: async (song) => {
      try {
        await normalRequest.post(`/songs/like-a-song/${song?._id}`, {
          headers: { "Content-Type": "application/json" },
        });
        return song;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (song) => {
      queryClient.invalidateQueries(["likedSongs"]);
      queryClient.setQueryData(["likedSongs"], (oldData) => {
        const data = oldData?.data;
        data.push(song);
        return { ...oldData, data: data };
      });
    },
    onError: (error) => {
      throw error;
    },
  });
};

const useUnlikeSong = () => {
  return useMutation({
    mutationFn: async (songID) => {
      try {
        await normalRequest.delete(`/songs/unlike/${songID}`, {
          headers: { "Content-Type": "application/json" },
        });
        return songID;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (songID) => {
      queryClient.setQueryData(["likedSongs"], (oldData) => {
        if (!oldData) return oldData;
        const songs = oldData.data.filter((song) => song?._id !== songID);
        return { ...oldData, data: songs };
      });
    },
    onError: (error) => {
      throw error;
    },
  });
};

export { useLikeSong, useUnlikeSong };
