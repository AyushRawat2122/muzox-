import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { normalRequest, queryClient } from "../../utils/axiosRequests.config";
import { Vibrant } from "node-vibrant/browser";
import {
  Play,
  Repeat2,
  Pause,
  BookmarkMinus,
  Trash2,
  BookmarkPlus,
  Globe,
  GlobeLock,
  AlertTriangle,
  X,
} from "lucide-react";
import useAudioPlayer from "../../store/useAudioPlayer.js";
import getUserPlaylists from "../../serverDataHooks/getUserPlaylists.js";
import { loadingPlayIcon } from "../../utils/lottie.js";
import Loading from "../../components/loaders/Loading.jsx";
import getUser from "../../serverDataHooks/getUser.js";
import {
  removeFromPlaylist,
  removePlaylistFromLibrary,
  addPlaylistToLibrary,
} from "../../serverDataHooks/playlistsMutations.js";
import { AnimatePresence, motion } from "framer-motion";
import { notifyError, notifySuccess } from "../../store/useNotification.js";
const PlaylistPage = () => {
  const params = useParams();
  const imgRef = useRef(null);
  const [dominantColor, setDominantColor] = useState(undefined);
  const customGradient = {
    background: `linear-gradient(to bottom, ${dominantColor} 10%, black)`, // #ff8c2d → Custom color (Orange)
  }; // custom gradient for cover
  const {
    queueID,
    isLooped,
    initializeQueue,
    isPlaying,
    togglePlayPause,
    toggleLooping,
  } = useAudioPlayer();
  const getPlaylistData = async () => {
    try {
      const res = await normalRequest.get(
        `/playlist/get-playlist-songs/${params?.playlistID}`,
        { headers: { "Content-Type": "application/json" } }
      );
      return res?.data?.data;
    } catch (error) {
      console.log(error);
    }
  };
  const [isSaved, setIsSaved] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [deletePopup, setDeletePopUp] = useState(false);
  const {
    data: playlist,
    isPending: playlistPending,
    isSuccess: playlistSuccess,
  } = useQuery({
    queryKey: ["playlist", params?.playlistID],
    queryFn: getPlaylistData,
    staleTime: Infinity,
    retry: 2,
  });
  const { data: user, isPending: userPending } = getUser();
  const {
    data: library,
    isPending: libraryPending,
    isSuccess: librarySuccess,
  } = getUserPlaylists();
  useEffect(() => {
    if (playlist?.publishStatus) {
      setIsPublic(true);
    } else {
      setIsPublic(false);
    }
  }, [playlist, playlistSuccess]);
  useEffect(() => {
    if (
      library?.data?.some((libPlaylist) => libPlaylist?._id === playlist?._id)
    ) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [library, librarySuccess]);

  const handlePlayButtonClick = () => {
    if (playlist?.songs?.length <= 0) {
      return;
    }
    if (queueID !== playlist?._id) {
      initializeQueue(playlist?.songs, playlist?._id);
      return;
    } else {
      togglePlayPause();
    }
  };
  const handleQueueLooping = () => {
    if (playlist?.songs?.length <= 0 || queueID !== playlist?._id) {
      return;
    } else {
      toggleLooping();
    }
  };
  const handleOnBlur = (e) => {
    e.stopPropagation();
    console.log(e.target, e.currentTarget);
    if (e.target === e.currentTarget) {
      setDeletePopUp(false);
    }
  };
  const toggleStatus = useMutation({
    mutationKey: ["publishStatusToggle"],
    mutationFn: async (playlistID) => {
      const status = await normalRequest.patch(
        `/playlist/toggleStatus/${playlistID}`
      );
      return status?.data?.data;
    },
    onSuccess: (status) => {
      notifySuccess(
        `${
          status
            ? "Playlist is now marked as a Public Playlist"
            : "Playlist is now marked as a Private Playlist"
        }`
      );
      queryClient.setQueryData(["playlist", playlist?._id], (oldData) => {
        return { ...oldData, publishStatus: status };
      });
    },
    onError: (err) => {
      console.log(err);
      notifyError("Failed to change publish status");
    },
  });

  const playlistAddMutation = addPlaylistToLibrary();
  const playlistRemoveMutation = removePlaylistFromLibrary();

  useEffect(() => {
    if (playlist) {

      async function fetchImageAsBlob(url) {
        try {
          const response = await fetch(url, { mode: "cors" }); // Fetch the image
          const blob = await response.blob(); // Convert it into a Blob
          const blobUrl = URL.createObjectURL(blob); // Create a local Blob URL

          if (imgRef.current) {
            imgRef.current.src = blobUrl; // Set Blob URL as img src
            const color = await Vibrant.from(imgRef.current).getPalette();
            setDominantColor(color.Vibrant.hex);
          }
        } catch (err) {
          console.error("Error fetching image:", err);
        }
      }
      fetchImageAsBlob(playlist?.playListCover?.url);
    }
    // Replace with your actual image URL
  }, [playlist]);

  if (userPending || playlistPending || libraryPending) {
    return <Loading src={loadingPlayIcon} />;
  }
  return (
    <main className="h-full max-lg:pb-[18vh] w-full relative overflow-y-auto bg-black text-white">
      {/* Section 1: Playlist Info */}
      <div>
        {" "}
        <div
          className="flex  max-sm:flex-col sm:items-end gap-4  mb-6 sm:p-4 lg:rounded-t-lg"
          style={customGradient}
        >
          <img
            src={playlist?.playListCover?.url || "/playlists.png"}
            alt="playlist"
            className="h-48 aspect-square object-cover rounded"
            ref={imgRef}
          />
          <div className="max-sm:px-2">
            <h4 className="text-sm text-gray-400">
              Playlist,{" "}
              <span className="capitalize text-gray-300">
                {isPublic ? "public" : "private"} Playlist
              </span>
            </h4>
            <div className=" w-full h-fit overflow-hidden py-2">
              <h1 className="text-4xl sm:text-6xl font-bold whitespace-nowrap overflow-ellipsis h-fit">
                {playlist?.name}
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Total • {playlist?.songs?.length} Tracks
            </p>
          </div>
        </div>
        {/* Section 2: Play Control */}
        <div className="sticky top-0 bg-black px-2 py-2 border-b-[1px] border-[#ffffff3d] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {" "}
           <div className="w-14 h-14 rounded-full overflow-hidden" style={{ backgroundColor: dominantColor }}>
           <button
              className={`w-full h-full rounded-full flex items-center justify-center bg-black/15`}
              onClick={handlePlayButtonClick}
              title="Play/Pause"
            >
              {isPlaying && queueID === playlist?._id ? (
                <Pause size={25} strokeWidth={3.5}/>
              ) : (
                <Play size={25} strokeWidth={3.5}/>
              )}
            </button>
           </div>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center"
              onClick={handleQueueLooping}
              title="Loop Entire Playlist"
            >
              <Repeat2
                className={`w-6 h-6 ${
                  isLooped && queueID === playlist._id
                    ? "text-[#ff6a30]"
                    : "text-white"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {user._id === playlist.owner && (
              <button
                className="h-[40px] w-[40px] text-red-500"
                title="Delete Playlist"
                onClick={() => {
                  setDeletePopUp(true);
                }}
              >
                <Trash2 size={25} />
              </button>
            )}
            {user._id !== playlist.owner && isSaved && (
              <button className="h-[40px] w-[40px]" title="Remove from Library" onClick={()=>{playlistRemoveMutation.mutate(playlist)}}>
                <BookmarkMinus size={25} />
              </button>
            )}
            {user._id !== playlist.owner && !isSaved && (
              <button className="h-[40px] w-[40px]" title="Save to Library" onClick={()=>{playlistAddMutation.mutate(playlist)}}>
                <BookmarkPlus size={25} />
              </button>
            )}
            {user._id === playlist.owner && !isPublic && (
              <button
                className="h-[40px] w-[40px]"
                title="Make Public"
                onClick={() => {
                  toggleStatus.mutate(playlist?._id);
                }}
              >
                <Globe size={25} />
              </button>
            )}
            {user._id === playlist.owner && isPublic && (
              <button
                className="h-[40px] w-[40px]"
                title="Make Private"
                onClick={() => {
                  toggleStatus.mutate(playlist?._id);
                }}
              >
                <GlobeLock size={25} />
              </button>
            )}
          </div>
        </div>
        {/* Section 3: Songs List */}
        <div className="mt-6">
          {/* Header */}
          <div className="grid gap-5 sm:gap-10 grid-cols-[auto_1fr_auto] overflow-hidden px-4 items-center border-b border-gray-700 pb-2 mb-2 text-sm text-gray-400">
            <div>#</div>
            <div>Title</div>
            <div className="text-right">Duration</div>
          </div>
          {/* Songs */}
          {playlist?.songs?.map((song, index) => (
            <SongItem
              key={index}
              song={song}
              index={index}
              queueRef={playlist._id}
              ownerRef={playlist?.owner}
              userRef={user._id}
            />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {deletePopup && (
          <div
            className="h-full w-full overflow-hidden px-3 fixed z-777 bg-black/30 backdrop-blur-sm top-0 flex justify-center items-center"
            onClick={handleOnBlur}
          >
            <DeletePlayList
              setDeletePopUp={setDeletePopUp}
              playlistID={playlist?._id}
            ></DeletePlayList>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
const SongItem = ({ song, index, queueRef, ownerRef, userRef }) => {
  const { setCurrentSong, queueID, isShuffled, shuffleBack } = useAudioPlayer();
  const changeCurrentSongOfQueue = (e) => {
    e.stopPropagation();
    if (queueID !== queueRef) {
      return;
    } else {
      if (isShuffled) {
        shuffleBack();
      }
      setCurrentSong(index);
    }
  };
  const mutation = removeFromPlaylist();
  const handleRemoveSong = (e) => {
    e.stopPropagation();
    mutation.mutate({ playlistID: queueRef, songID: song?._id });
  };

  const convertToMinSecFormat = (number) => {
    const min = Math.floor(number / 60); //get min
    const sec = Math.floor(number % 60); //get seconds
    const convertedStr =
      String(min).padStart(1, "0") + ":" + String(sec).padStart(1, "0");
    return convertedStr;
  };
  return (
    <div
      className="grid gap-5 sm:gap-10 grid-cols-[auto_1fr_auto] w-full overflow-hidden items-center px-4 py-2 transition-colors hover:bg-gray-800"
      onClick={changeCurrentSongOfQueue}
    >
      <div className="flex items-center justify-center">
        <span>{index + 1}</span>
      </div>
      <div className="flex items-center gap-2 overflow-hidden">
        <img
          src={song?.coverImage?.url || "/placeholder.svg?height=40&width=40"}
          alt={song.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="overflow-hidden ">
          <p className="font-medium text-ellipsis whitespace-nowrap overflow-hidden">
            {song.title}
          </p>
          <p className="text-xs text-gray-400 text-ellipsis whitespace-nowrap overflow-hidden">
            {song.artist}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-right flex gap-2 items-center">
        {convertToMinSecFormat(song?.duration)}
        {ownerRef === userRef && (
          <span title="remove from playlist">
            <BookmarkMinus
              className="hover:text-red-500 cursor-pointer"
              onClick={handleRemoveSong}
            />
          </span>
        )}
      </div>
    </div>
  );
};
const DeletePlayList = ({ setDeletePopUp, playlistID }) => {
  useEffect(() => {
    return () => {
      setDeletePopUp(false);
    };
  }, []);
  const { data: user, isPending: userPending } = getUser();
  const navigate = useNavigate();
  const deletePlaylist = async (playlistID) => {
    try {
      await normalRequest.delete(`/playlist/delete-playlist/${playlistID}`, {
        headers: { "Content-Type": "application/json" },
      });
      return playlistID;
    } catch (error) {
      throw error?.response?.data;
    }
  };
  const mutation = useMutation({
    mutationKey: ["deletePlaylist"],
    mutationFn: deletePlaylist,
    onSuccess: (playlistID) => {
      notifySuccess("playlist deleted successfully");
      queryClient.removeQueries({ queryKey: ["playlist", playlistID] });
      const oldQueryData = queryClient.getQueryData(["playlists"]);
      if (oldQueryData) {
        queryClient.setQueryData(["playlists"], (oldData) => {
          return {
            ...oldData,
            data: [
              ...(oldData.data.filter(
                (playlist) => playlist?._id !== playlistID
              ) || []),
            ],
          };
        });
      }
      navigate(`/library/playlists/${user?._id}`);
    },
    onError: (error) => {
      console.log(error);
      notifyError(error.message);
    },
  });
  if (userPending) {
    <Loading src={loadingPlayIcon} />;
  }
  return (
    <motion.div
      key="deletePopup"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.2, ease: "easeInOut" },
      }}
      transition={{ duration: 0.2 }}
      className="no-copy overflow-hidden py-2"
    >
      <div className="bg-white/10 rounded-md px-3 py-2">
        <div className="flex gap-2 items-center py-1">
          <AlertTriangle size={25} className="text-red-400" />
          <h1 className="text-left grow text-2xl font-bold">
            Delete Confirmation
          </h1>
          <button
            onClick={() => {
              setDeletePopUp(false);
            }}
          >
            <X size={25} className="hover:text-red-400" />
          </button>
        </div>
        <hr className="text-[#ffffff32]" />
        <p className="text-lg py-4 font-light">
          Are you sure you want to delete this playlist? <br />
          This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            className="p-2 border border-[#ffffff32] rounded-md hover:bg-white/10 transition-all ease-in-out duration-200"
            onClick={() => {
              setDeletePopUp(false);
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              mutation.mutate(playlistID);
            }}
            className="p-2 bg-red-400 rounded-md hover:bg-red-500 transition-all ease-in-out duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default PlaylistPage;