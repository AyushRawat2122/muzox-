import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClientProvider} from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router";
import Home from "./pages/Home.jsx";
import { queryClient } from "./utils/serverRequest.js";

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [{ path: "/home", element: <Home /> }, { path: "/login" }],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={route} />
    </QueryClientProvider>
  </StrictMode>
);
