import { queryClient, normalRequest } from "../utils/axiosRequests.config";
import { useMutation } from "@tanstack/react-query";

const useLikeSong = () => {
  return useMutation({
    mutationFn: async (songID) => {
      try {
        await normalRequest.post(
          `/songs/like-a-song/${songID}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["likedSongs"])
    },
    onError:(error) =>{
      throw error;
    }
  });
};

const useUnlikeSong = () => {
  return useMutation({
    mutationFn: async (songID) => {
      try {
        await normalRequest.delete(
          `/songs/unlike/${songID}`,
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["likedSongs"]);
    },
    onError:(error) =>{
      throw error;
    }
  });
};

export { useLikeSong, useUnlikeSong };
