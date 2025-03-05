import { useQuery } from "@tanstack/react-query";
import { securedRequest } from "../utils/axiosRequests.config";
const fetchUserData = async () => {
  try {
    const userData = await securedRequest.get("/user/userDetails", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return userData.data;
  } catch (error) {
    console.log(error);
    throw error 
  }
};

const getUser = () =>
   useQuery({ queryKey: ["user"], queryFn: fetchUserData, retry: false });

export default getUser;
