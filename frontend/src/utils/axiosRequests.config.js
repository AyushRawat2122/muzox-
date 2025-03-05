import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
const securedRequest = axios.create({
  baseURL: "",
  withCredentials: true,
});
const normalRequest = axios.create({
  baseURL: "",
  withCredentials: false,
});

// this is a response interceptor that will work with the response it takes 2 methods as an arguments
// 1st method -> works on success response
// 2nd method -> works on error returned as response

securedRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config; // this will give us the complete instance of req failed

    // if the status is 401 which we ve set on backend for unavailable access token and  ._retry if field to object which is undefined (false) at starting to prevent multiple retries

    if (error.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // trying but wont try it again
      try {
        const res = await axios.get("regenerate Refresh & AccessToken", {
          withCredentials: true,
        });
        return securedRequest(originalRequest); //reposted the request :)
      } catch (RefreshError) {
        console.log("Token refresh failed , logging out...");
        queryClient.clear(); //clear all cache stored :)
        window.location.href = "/login";
      }
    }

    return Promise.reject(error); // if reaching this point just reject this mess
  }
);

export { securedRequest, normalRequest , queryClient};
