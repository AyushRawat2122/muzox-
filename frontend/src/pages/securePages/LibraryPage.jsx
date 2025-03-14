import React from "react";
import { useLocation, Outlet } from "react-router";

const Library = () => {
  const location = useLocation();
  return (
    <div>
      {location.pathname === "/library" && (
        <div className="text-white p-2">
          <div>
            <h1 className="text-3xl">Library</h1>
            <hr className="text-[#ffffff5f] mt-2" />
          </div>
          <div className="flex gap-5 p-2">
            <div className="h-[200px] w-[200px] bg-white"></div>
            <div className="h-[200px] w-[200px] bg-white"></div>
          </div>
          <div></div>
        </div>
      )}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Library;
