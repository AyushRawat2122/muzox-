import { useQuery } from "@tanstack/react-query";
import { securedRequest } from "../utils/axiosRequests.config";
const fetchUserData = async () => {
  try {
    const userData = await securedRequest.get("/user/userDetails", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(userData?.data?.data);
    return userData?.data?.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getUser = () =>
  useQuery({
    queryKey: ["user"],
    queryFn: fetchUserData,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false, 
  });

export default getUser;
