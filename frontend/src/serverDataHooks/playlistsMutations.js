import { useMutation } from "@tanstack/react-query";
import { queryClient, normalRequest } from "../utils/axiosRequests.config";
import { notifyError, notifySuccess } from "../store/useNotification";
const addToPlaylist = () => {
  return useMutation({
    mutationFn: async ({ song, playlistID }) => {
      try {
        const oldData = queryClient.getQueryData(["playlist", playlistID]);
        const res = await normalRequest.post(
          `/playlist/add-to-playlist/${playlistID}/${song?._id}`,
          { headers: { "Content-Type": "application/json" } }
        );
        return { song, playlistID };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: ({ song, playlistID }) => {
      notifySuccess("song added to playlist successfully");
      const oldData = queryClient.getQueryData(["playlist", playlistID]);
      if (!oldData) return;
      queryClient.setQueryData(["playlist", playlistID], (oldData) => {
        return {
          ...oldData,
          songs: [...(oldData?.songs || []), song],
        };
      });
    },
    onError: (error) => {
      console.log(error)
      notifyError(error.response.data.message);
    },
  });
};

const removeFromPlaylist = () => {
  return useMutation({
    mutationFn: async ({ playlistID, songID }) => {
      try {
        const res = await normalRequest.patch(
          `/playlist/remove-from-playlist/${playlistID}/${songID}`,
          { headers: { "Content-Type": "application/json" } }
        );
        return { playlistID, songID };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: ({ playlistID, songID }) => {
      notifySuccess("song removed Successfully");
      queryClient.setQueryData(["playlist", playlistID], (oldData) => {
        return {
          ...oldData,
          songs: [...oldData?.songs.filter((song) => song._id !== songID)],
        };
      });
    },
    onError: (error) => {
      notifyError(error.response.data.message);
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
      try {
        Library;

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
  removeFromPlaylist,
  removePlaylistFromLibrary,
  deletePlaylist,
  addToPlaylist,
};
