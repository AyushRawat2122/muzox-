import React, { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { Navigate, useLocation } from "react-router";
import getUser from "./serverDataHooks/getUser.js";
import MuzoxApp from "./pages/wrapperPages/MuzoxApp.jsx";
import { queryClient } from "./utils/axiosRequests.config.js";
import Loading from "./components/loaders/Loading.jsx";
import useSideBar from "./store/useSideBar.js";
import useDeviceWidth from "./hooks/useDeviceWidth.js";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const ProtectedRoute = () => {
  const location = useLocation();
  const { data: user, isPending, error } = getUser();
  const { isSideBarOpen, toggleSideBarOpen } = useSideBar();
  const [leftPanelSize, setLeftPanelSize] = useState(4);
  const [rightPanelSize, setRightPanelSize] = useState(22);
  const windowWidth = useDeviceWidth();

  useEffect(() => {
    return () => {
      queryClient.clear();
    };
  }, []);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return (
      <Navigate to={"/login"} replace state={{ from: location.pathname }} />
    );
  }

  return (
    <MuzoxApp>
      {/* Muzox App is the Wrapper which will have our player and Sidebar or NavBar*/}
      <div className="bg-black text-white h-screen w-screen flex flex-col">
        {/* Global audio element responsible for playing the music */}

        {/* Top bar */}
        <div>
          <h1 className="text-2xl">Muzox</h1>
        </div>

        {/* Middle Section icludes Main page left side bar and right side bar resizable */}

        <PanelGroup
          direction="horizontal"
          className="grow bg-transparent p-2 h-full"
        >
          {/* ✅ LEFT PANEL (Draggable) */}
          {windowWidth > 1024 && (
            <Panel
              className="muzoxPanelBg rounded-lg"
              minSize={4}
              maxSize={20}
              defaultSize={leftPanelSize} // Maintain size
              onResize={(size) => setLeftPanelSize(size)} // Save size on change
            >
              <div>Hey</div>
            </Panel>
          )}

          {/* ✅ FIRST RESIZE HANDLE */}
          {windowWidth > 1024 && (
            <PanelResizeHandle className="w-[1px] m-1 bg-[#393939] cursor-ew-resize" />
          )}

          {/* ✅ MIDDLE PANEL (Auto-Adjust) */}
          <Panel className="muzoxPanelBg rounded-lg">
            <Outlet />
          </Panel>

          {/* ✅ LAST RESIZE HANDLE */}
          {windowWidth > 1024 && isSideBarOpen && (
            <PanelResizeHandle className="w-[1px] m-1 bg-[#393939] cursor-ew-resize" />
          )}

          {/* ✅ RIGHT PANEL (Draggable) */}
          {windowWidth > 1024 && isSideBarOpen && (
            <Panel
              className="muzoxPanelBg rounded-lg"
              minSize={15}
              maxSize={25}
              defaultSize={rightPanelSize} // Maintain size
              onResize={(size) => setRightPanelSize(size)} // Save size on change
            ></Panel>
          )}

          {!isSideBarOpen && (
            <button
              className="h-full w-[30px] cursor-pointer ml-2 muzoxPanelBg hover:bg-[#1d1d1dc9] text-[#5f5f5f] hover:text-white rounded-l-lg"
              onClick={toggleSideBarOpen}
            >
              <ChevronLeft strokeWidth={1.75} />
            </button>
          )}
        </PanelGroup>

        {/* Sound Bar for large screen devices and navBar for mobile layouts */}
      </div>
    </MuzoxApp>
  );
};

export default ProtectedRoute;
