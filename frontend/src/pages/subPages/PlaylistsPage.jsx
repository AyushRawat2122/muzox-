import React, { useEffect } from "react";
import getUserPlaylists from "../../serverDataHooks/getUserPlaylists.js";
import {} from "../../utils/lottie.js"
const PlaylistsPage = () => {
  const { data: playlists, isPending } = getUserPlaylists();
  if(isPending){
    return
  }
  return <div></div>;
};

export default PlaylistsPage;
