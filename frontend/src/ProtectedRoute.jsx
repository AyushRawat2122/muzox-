import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router";
import { Navigate, useLocation, NavLink } from "react-router";
import getUser from "./serverDataHooks/getUser.js";
import MuzoxApp from "./pages/wrapperPages/MuzoxApp.jsx";
import { queryClient } from "./utils/axiosRequests.config.js";
import Loading from "./components/loaders/Loading.jsx";
import useSideBar from "./store/useSideBar.js";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { EmptyQueue } from "./components/asset components/index.js";
import {
  SearchBar,
  NavBar,
  RightSideBar,
  SoundBar,
  AudioPlayer,
} from "./components/bars/index.js";
import { loadingPlayIcon } from "./utils/lottie.js";
import { useMediaQuery } from "react-responsive";
import useAudioPlayer from "./store/useAudioPlayer.js";
import { ChevronLeft, Home } from "lucide-react";

const ProtectedRoute = () => {
  const location = useLocation();
  const { data: user, isPending, error } = getUser();
  const { isSideBarOpen, toggleSideBarOpen } = useSideBar();
  const [leftPanelSize, setLeftPanelSize] = useState(4);
  const [rightPanelSize, setRightPanelSize] = useState(22);
  const audioRef = useRef(null);
  const { queue } = useAudioPlayer();

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1224px)",
  });

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  useEffect(() => {
    return () => {
      queryClient.clear();
    };
  }, []);

  if (isPending) {
    return <Loading src={loadingPlayIcon} />;
  }

  if (error) {
    return (
      <Navigate to={"/login"} replace state={{ from: location.pathname }} />
    );
  }

  return (
    <MuzoxApp className={"max-sm:px-[1px]"}>
      {/* Muzox App is the Wrapper which will have our player and Sidebar or NavBar*/}
      <div className="text-white h-screen w-screen flex flex-col">
        {/* Global audio element responsible for playing the music */}
        <AudioPlayer ref={audioRef} />
        {/* Top bar */}
        {((isTabletOrMobile && location.pathname === "/") ||
          isDesktopOrLaptop) && (
          <div className="flex py-2 max-lg:justify-between  bg-black/50">
            <div>
              <img
                src="/MUZOX.png"
                alt=""
                className="w-[100px] sm:w-[150px] px-1 py-2"
              />
            </div>
            {isDesktopOrLaptop && (
              <div className="flex w-full items-center grow gap-2 justify-center">
                <NavLink
                  to={"/"}
                  className={({ isActive }) =>
                    isActive ? "text-white" : "text-gray-300"
                  }
                >
                  <Home
                    className=" h-[35px] w-[35px] "
                  />
                </NavLink>
                <div className="w-[500px]">
                  <SearchBar></SearchBar>
                </div>
              </div>
            )}
            <div>User</div>
          </div>
        )}

        {/* Middle Section icludes Main page left side bar and right side bar resizable */}

        <PanelGroup
          direction="horizontal"
          className="grow bg-transparent h-full"
        >
          {/* ✅ LEFT PANEL (Draggable) */}
          {isDesktopOrLaptop && (
            <Panel
              className="bg-black/40"
              minSize={4}
              maxSize={20}
              defaultSize={leftPanelSize} // Maintain size
              onResize={(size) => setLeftPanelSize(size)} // Save size on change
            >
              <div>Hey</div>
            </Panel>
          )}

          {/* ✅ FIRST RESIZE HANDLE */}
          {isDesktopOrLaptop && (
            <PanelResizeHandle className="w-[1px]  bg-gray-300/60 cursor-ew-resize" />
          )}

          {/* ✅ MIDDLE PANEL (Auto-Adjust) */}
          <Panel className="bg-black/30">
            <Outlet />
          </Panel>

          {/* ✅ LAST RESIZE HANDLE */}
          {isDesktopOrLaptop && isSideBarOpen && (
            <PanelResizeHandle className="w-[1px] bg-gray-300/60 cursor-ew-resize" />
          )}

          {/* ✅ RIGHT PANEL (Draggable) */}
          {isDesktopOrLaptop && isSideBarOpen && (
            <Panel
              className=" bg-black/40"
              minSize={15}
              maxSize={25}
              defaultSize={rightPanelSize} // Maintain size
              onResize={(size) => setRightPanelSize(size)} // Save size on change
            >
              {queue?.length > 0 && <RightSideBar />}
              {!queue?.length && <EmptyQueue />}
            </Panel>
          )}

          {!isSideBarOpen && (
            <button
              className="h-full w-[30px] cursor-pointer bg-black/40 hover:bg-black/60 text-[#ececec] hover:text-white"
              onClick={toggleSideBarOpen}
            >
              <ChevronLeft strokeWidth={1.75} />
            </button>
          )}
        </PanelGroup>

        {/* Sound Bar for large screen devices and navBar for mobile layouts */}
        {isDesktopOrLaptop && <SoundBar ref={audioRef} />}
        {/* navigation bar which will only render on tablets screen sizes */}
        {isTabletOrMobile && <NavBar />}
      </div>
    </MuzoxApp>
  );
};

export default ProtectedRoute;
