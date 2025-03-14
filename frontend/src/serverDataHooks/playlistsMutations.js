import { useMutation } from "@tanstack/react-query";
import { queryClient, normalRequest } from "../utils/axiosRequests.config";

const addToPlaylist = () => {
  return useMutation({
    mutationFn: async ({ songID, playlistID }) => {
      try {
        const res = await normalRequest.post(
          `/playlist/${playlistID}/${songID}`,
          { headers: { "Content-Type": "application/json" } }
        );
        return res?.data?.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["playlists"], (oldData) => {
        if (!oldData) return [data];
        const oldList = oldData.filter(
          (playlist) => playlist?._id !== data?._id
        );
        return [...oldList, data];
      });
    },
  });
};

const removeFromPlaylist = () => {
  return useMutation({
    mutationFn: async ({ playlistID, songID }) => {
      try {
        const res = await normalRequest.post(
          `/remove-from-playlist/${playlistID}/${songID}`,
          { headers: { "Content-Type": "application/json" } }
        );
        return res?.data?.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["playlists"], (oldData) => {
        if (!oldData) return [data];
        const oldList = oldData.filter(
          (playlist) => playlist?._id !== data?._id
        );
        return [...oldList, data];
      });
    },
  });
};

const deletePlaylist = () => {
  return useMutation({
    mutationFn: async (playlistID) => {
      try {
        const res = await normalRequest.post(`/delete-playlist/${playlistID}`, {
          headers: { "Content-Type": "application/json" },
        });
        return playlistID;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (playlistID) => {
      queryClient.setQueryData(["playlists"], (oldData) => {
        return oldData.filter((playlist) => playlist?._id !== playlistID);
      });
    },
  });
};

const addPlaylistToLibrary = () => {
  return useMutation({
    mutationFn: async (playlistID) => {
      try {
        const res = normalRequest.patch(`/save-to-library/${playlistID}`, {
          headers: { "Content-Type": "application/json" },
        });
        return res;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["playlists"]);
    },
  });
};

const removePlaylistFromLibrary = () => {
  return useMutation({
    mutationFn: async (playlistID) => {
      try {Library
      
        const res = normalRequest.patch(`/save-to-library/${playlistID}`, {
          headers: { "Content-Type": "application/json" },
        });
        return res;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["playlists"]);
    },
  });
};

export {
  addPlaylistToLibrary,
  createNewPlayist,
  removeFromPlaylist,
  removePlaylistFromLibrary,
  deletePlaylist,
  addToPlaylist,
};
