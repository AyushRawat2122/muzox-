import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router";
function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black/20">
      {/*simply return the outlet which will display all the pages dependent on it*/}
      <Outlet />
      <ToastContainer autoClose={3000} position="top-right"/>
    </div>
  );
}

export default App;
