import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { normalRequest } from "../../utils/axiosRequests.config";
import { FastAverageColor } from "fast-average-color";
import {
  Play,
  Repeat2,
  Pause,
  BookmarkMinus,
  Trash2,
  BookmarkPlus,
  Globe,
  GlobeLock,
} from "lucide-react";
import useAudioPlayer from "../../store/useAudioPlayer.js";
import getUserPlaylists from "../../serverDataHooks/getUserPlaylists.js";
import { loadingPlayIcon } from "../../utils/lottie.js";
import Loading from "../../components/loaders/Loading.jsx";
import getUser from "../../serverDataHooks/getUser.js";
import {
  removeFromPlaylist,
  removePlaylistFromLibrary,
  deletePlaylist,
  addPlaylistToLibrary,
} from "../../serverDataHooks/playlistsMutations.js";

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
    if (
      playlist?.publishStatus
    ) {
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
  useEffect(() => {
    if (playlist) {
      const fac = new FastAverageColor();

      async function fetchImageAsBlob(url) {
        try {
          const response = await fetch(url, { mode: "cors" }); // Fetch the image
          const blob = await response.blob(); // Convert it into a Blob
          const blobUrl = URL.createObjectURL(blob); // Create a local Blob URL

          if (imgRef.current) {
            imgRef.current.src = blobUrl; // Set Blob URL as img src
            const color = await fac.getColorAsync(imgRef.current);
            setDominantColor(color.hex);
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
    <main className="h-full w-full overflow-y-auto bg-black text-white">
      {/* Section 1: Playlist Info */}
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
          <h4 className="text-sm text-gray-400">Playlist, <span className="capitalize text-gray-300">{isPublic?"public":"private"} Playlist</span></h4>
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
          <button
            className={`w-14 h-14 rounded-full flex items-center justify-center`}
            style={{ backgroundColor: dominantColor }}
            onClick={handlePlayButtonClick}
            title="Play/Pause"
          >
            {isPlaying && queueID === playlist?._id ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
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
            >
              <Trash2 size={25} />
            </button>
          )}
          {user.id !== playlist.owner && isSaved && (
            <button className="h-[40px] w-[40px]" title="Remove from Library">
              <BookmarkMinus size={25} />
            </button>
          )}
          {user.id !== playlist.owner && !isSaved && (
            <button className="h-[40px] w-[40px]" title="Save to Library">
              <BookmarkPlus size={25} />
            </button>
          )}
          {user._id === playlist.owner && !isPublic && (
            <button className="h-[40px] w-[40px]" title="Make Public">
              <Globe size={25} />
            </button>
          )}
          {user._id === playlist.owner && isPublic && (
            <button className="h-[40px] w-[40px]" title="Make Private">
              <GlobeLock size={25} />
            </button>
          )}
        </div>
      </div>

      {/* Section 3: Songs List */}
      <div className="mt-6">
        {/* Header */}
        <div className="grid gap-5 sm:gap-10 grid-cols-[auto_1fr_auto] px-4 items-center border-b border-gray-700 pb-2 mb-2 text-sm text-gray-400">
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
      className="grid gap-5 sm:gap-10 grid-cols-[auto_1fr_auto] items-center px-4 py-2 transition-colors hover:bg-gray-800"
      onClick={changeCurrentSongOfQueue}
    >
      <div className="flex items-center justify-center">
        <span>{index + 1}</span>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={song?.coverImage?.url || "/placeholder.svg?height=40&width=40"}
          alt={song.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="overflow-hidden">
          <div className="font-medium text-ellipsis whitespace-nowrap overflow-hidden">
            {song.title}
          </div>
          <div className="text-xs text-gray-400 text-ellipsis whitespace-nowrap overflow-hidden">
            {song.artist}
          </div>
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
const deletePlayList = ({}) => {
  return <div></div>;
};
export default PlaylistPage;
