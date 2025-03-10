import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClientProvider} from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Signup, Login, Verify } from "./pages/independentPages/index.js";
import { Home } from "./pages/securePages/index.js";
import { queryClient } from "./utils/axiosRequests.config.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Search from "./pages/securePages/Search.jsx";
const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/verify/:userID", element: <Verify /> },
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [{ path: "/", element: <Home /> } , {path:"/search" , element:<Search/>}],
      },
    ],
  },
]);
/*
routes explaination
the route / where whole application is going to render is App
  its independent children's are
      -login
      -verify
      -signup
      -resetPassword

      -protected route <- its a higher order componenet which will display everything only when the user is logged in
          its childrens are
            -home
            -track/:id
            -playlist/:id
            -userPlaylists
            -likedSongs
            -search
            -admin/:adminID
            -premium
*/

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={route} />
    </QueryClientProvider>
  </StrictMode>
);
