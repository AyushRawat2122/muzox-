import { useState } from "react";
import { Outlet } from "react-router";
function App() {
  return (
    <div className="h-screen w-screen bg-black">
      {/*simply return the outlet which will display all the pages dependent on it*/}
      <Outlet />
    </div>
  );
}

export default App;
