import React, { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { Navigate, useLocation, NavLink } from "react-router";
import getUser from "./serverDataHooks/getUser.js";
import MuzoxApp from "./pages/wrapperPages/MuzoxApp.jsx";
import { queryClient } from "./utils/axiosRequests.config.js";
import Loading from "./components/loaders/Loading.jsx";
import useSideBar from "./store/useSideBar.js";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SearchBar from "./components/bars/SearchBar.jsx";
import { FaHouse } from "react-icons/fa6";
import { loadingPlayIcon } from "./utils/lottie.js";
import NavBar from "./components/bars/NavBar.jsx";
import { useMediaQuery } from "react-responsive";

const ProtectedRoute = () => {
  const location = useLocation();
  const { data: user, isPending, error } = getUser();
  const { isSideBarOpen, toggleSideBarOpen } = useSideBar();
  const [leftPanelSize, setLeftPanelSize] = useState(4);
  const [rightPanelSize, setRightPanelSize] = useState(22);

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
      <div className="bg-black text-white h-screen w-screen flex flex-col">
        {/* Global audio element responsible for playing the music */}

        {/* Top bar */}
        {((isTabletOrMobile && location.pathname === "/") ||
          isDesktopOrLaptop) && (
          <div className="flex py-2 max-lg:justify-between">
            <div>
              <img
                src="/textLogo.png"
                alt=""
                className="w-[100px] sm:w-[150px] py-2"
              />
            </div>
            {isDesktopOrLaptop && (
              <div className="flex w-full items-center grow gap-2 justify-center">
                <NavLink
                  to={"/"}
                  className={({ isActive }) =>
                    isActive ? "text-white" : "muzoxSubText"
                  }
                >
                  <FaHouse
                    className=" h-[30px] w-[30px] "
                    strokeWidth={"3px"}
                  />
                </NavLink>
                <div className="w-[450px]">
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
          {isDesktopOrLaptop && (
            <PanelResizeHandle className="w-[1px] m-1 bg-[#393939] cursor-ew-resize" />
          )}

          {/* ✅ MIDDLE PANEL (Auto-Adjust) */}
          <Panel className="muzoxPanelBg rounded-lg">
            <Outlet />
          </Panel>

          {/* ✅ LAST RESIZE HANDLE */}
          {isDesktopOrLaptop && isSideBarOpen && (
            <PanelResizeHandle className="w-[1px] m-1 bg-[#393939] cursor-ew-resize" />
          )}

          {/* ✅ RIGHT PANEL (Draggable) */}
          {isDesktopOrLaptop && isSideBarOpen && (
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

        {/* navigation bar which will only render on tablets screen sizes */}
        {isTabletOrMobile && <NavBar />}
      </div>
    </MuzoxApp>
  );
};

export default ProtectedRoute;
