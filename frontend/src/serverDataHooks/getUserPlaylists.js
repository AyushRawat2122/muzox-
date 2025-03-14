import { useQuery } from "@tanstack/react-query";
import { normalRequest } from "../utils/axiosRequests.config";

const fetchPlaylists = async () => {
  try {
    const playlists = await normalRequest.get("/user/get-playlists", {
      headers: { "Content-Type": "application/json" },
    });
    return playlists.data;
  } catch (error) {
    throw error;
  }
};

const getUserPlaylists = useQuery({
  queryKey: "playlists",
  queryFn: fetchPlaylists,
  staleTime: Infinity,
  retry: 2,
});

export default getUserPlaylists;