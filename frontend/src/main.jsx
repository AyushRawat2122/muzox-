import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import { Signup, Login, Verify } from "./pages/independentPages/index.js";
import {
  HomePage,
  LibraryPage,
  PremiumPage,
  SearchPage,
  LyricsPage,
  CreatePlaylist,
} from "./pages/securePages/index.js";
import { LikedSongsPage, PlaylistsPage } from "./pages/subPages/index.js";

import { queryClient } from "./utils/axiosRequests.config.js";
import ProtectedRoute from "./ProtectedRoute.jsx";

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      {
        path: "/verify",
        children: [
          { index: true, element: <Navigate to="/login" replace /> },
          { path: ":userID", element: <Verify /> },
        ],
      },
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/search", element: <SearchPage /> },
          {
            path: "/library",
            element: <LibraryPage />,
            children: [
              {
                path: "likedSongs",
                children: [
                  { index: true, element: <Navigate to="/library" replace /> },
                  { path: ":userID", element: <LikedSongsPage /> },
                ],
              },
              {
                path: "playlists",
                children: [
                  { index: true, element: <Navigate to="/library" replace /> },
                  { path: ":userID", element: <PlaylistsPage /> },
                ],
              },
              {
                path:"create-playlist" , element : <CreatePlaylist/>
              }
            ],
          },
          { path: "/premium", element: <PremiumPage /> },
          { path: "/lyrics", element: <LyricsPage /> },
        ],
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
