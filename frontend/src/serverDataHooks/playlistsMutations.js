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
      console.log(error);
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

const addPlaylistToLibrary = () => {
  return useMutation({
    mutationFn: async (playlist) => {
      try {
        const res = await normalRequest.patch(
          `/playlist/save-to-library/${playlist?._id}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return playlist;
      } catch (error) {
        throw error.response.data;
      }
    },
    onSuccess: (newPlaylist) => {
      notifySuccess("Playlist added to library");
      const oldQueryData = queryClient.getQueryData(["playlists"]);
      if (oldQueryData) {
        queryClient.setQueryData(["playlists"], (oldData) => {
          return {
            ...oldData,
            data: [...(oldData?.data || []), newPlaylist],
          };
        });
      }
    },
    onError: (error) => {
      notifySuccess(error.message);
    },
  });
};

const removePlaylistFromLibrary = () => {
  return useMutation({
    mutationFn: async (playlist) => {
      try {
        const res = await normalRequest.patch(
          `/playlist/save-to-library/${playlist?._id}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return playlist;
      } catch (error) {
        throw error.response.data;
      }
    },
    onSuccess: (remPlaylist) => {
      notifySuccess("Playlist removed from library");
      const oldQueryData = queryClient.getQueryData(["playlists"]);
      if (oldQueryData) {
        queryClient.setQueryData(["playlists"], (oldData) => {
          return {
            ...oldData,
            data: [
              ...(oldData?.data?.filter(
                (playlist) => playlist?._id !== remPlaylist._id
              ) || []),
            ],
          };
        });
      }
    },
    onError: (error) => {
      notifyError(error.message);
    },
  });
};

export {
  addPlaylistToLibrary,
  removeFromPlaylist,
  removePlaylistFromLibrary,
  addToPlaylist,
};
