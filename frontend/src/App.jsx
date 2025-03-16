import { useState } from "react";
import { Outlet } from "react-router";
function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black/20">
      {/*simply return the outlet which will display all the pages dependent on it*/}
      <Outlet />
    </div>
  );
}

export default App;
