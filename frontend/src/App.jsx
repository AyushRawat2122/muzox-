import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black/20">
      <Outlet />
      <ToastContainer autoClose={3000} position="top-right" />
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
