import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const securedRequest = axios.create({
  baseURL: "http://localhost:3000/api/muzox-",
  withCredentials: true,
  credentials: "include",
});

const normalRequest = axios.create({
  baseURL: "http://localhost:3000/api/muzox-",
  withCredentials: true,
  credentials: "include",
});

// this is a response interceptor that will work with the response it takes 2 methods as an arguments
// 1st method -> works on success response
// 2nd method -> works on error returned as response
normalRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      queryClient.invalidateQueries(["user"]);
    }
    return Promise.reject(error);
  }
);
securedRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config; // this will give us the complete instance of req failed
    console.log("request Failed");
    // if the status is 401 which we ve set on backend for unavailable access token and  ._retry if field to object which is undefined (false) at starting to prevent multiple retries

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true; // trying but wont try it again
      console.log("retrying with refreshToken");
      try {
        const res = await axios.get(
          "http://localhost:3000/api/muzox-/user/generateAccessToken",
          {
            withCredentials: true,
            credentials: "include",
          }
        );
        return securedRequest(originalRequest); //reposted the request :)
      } catch (RefreshError) {
        console.log("Token refresh failed , logging out...");
      }
    }

    return Promise.reject(error); // if reaching this point just reject this mess
  }
);

export { securedRequest, normalRequest, queryClient };
