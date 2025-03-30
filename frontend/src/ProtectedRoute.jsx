import React, { useEffect, useRef, useState, useCallback } from "react";
import { Outlet } from "react-router";
import { Navigate, useLocation, NavLink, Link } from "react-router";
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
import { ChevronLeft, Home, Heart, ListMusic } from "lucide-react";
import { MdLibraryMusic } from "react-icons/md";
import usePopUp from "./store/usePopUp.js";
import MobileTabletsView from "./components/pop-ups/MobileTabletsView.jsx";
import MobileSoundBarDisplay from "./components/bars/MobileSoundBarDisplay.jsx";
import { AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
const ProtectedRoute = () => {
  const location = useLocation();
  const { data: user, isPending, error } = getUser();
  const { isSideBarOpen, toggleSideBarOpen } = useSideBar();
  const [leftPanelSize, setLeftPanelSize] = useState(4);
  const [rightPanelSize, setRightPanelSize] = useState(22);

  // Use a single ref for AudioPlayer
  const audioPlayerRef = useRef(null);

  const { queue } = useAudioPlayer();
  const { soundBarPopUp } = usePopUp();

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1224px)",
  });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });

  // Helper to get the audio element
  const getAudio = () => {
    return audioPlayerRef.current
      ? audioPlayerRef.current.getAudioElement()
      : null;
  };
  const [audioReady, setAudioReady] = useState(false);
  const leftResize = useCallback(
    debounce((size) => {
      setLeftPanelSize(size);
    }, 500),
    []
  );
  const rightResize = useCallback(
    debounce((size) => {
      setRightPanelSize(size);
    }, 500),
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioPlayerRef.current && audioPlayerRef.current.getAudioElement()) {
        setAudioReady(true);
        clearInterval(interval);
      }
    }, 100);
    return () => {
      clearInterval(interval);
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
    <MuzoxApp className={"relative"}>
      {/* Mobile popup gets the audio element via prop instead of ref */}
      <AnimatePresence mode="wait">
        {soundBarPopUp && isTabletOrMobile && audioReady && (
          <MobileTabletsView key="mobileView" audioElement={getAudio()} />
        )}
      </AnimatePresence>
      <div className="text-white h-screen w-screen flex flex-col">
        {/* AudioPlayer holds the actual audio element and gets the ref */}
        <AudioPlayer ref={audioPlayerRef} />

        {/* Top bar */}
        {((isTabletOrMobile && (location.pathname !== "/search" && location.pathname !== "/lyrics" )) ||
          isDesktopOrLaptop) && (
          <div className="flex py-2 max-sm:px-2 justify-between bg-black/50">
            <div>
              <img
                src="/MUZOX.png"
                alt="logo"
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
                  <Home className=" h-[35px] w-[35px] " />
                </NavLink>
                <div className="w-[500px]">
                  <SearchBar />
                </div>
              </div>
            )}
            <div className="flex gap-2 px-2">
              {isDesktopOrLaptop && (
                <NavLink to={"/premium"}>
                  <button className="gradient-btn w-[200px] h-[40px]">
                    Explore Premium
                  </button>
                </NavLink>
              )}
              <NavLink to={`/user/${user?._id}`} className={`block`}>
                <div className="h-[40px] w-[40px] rounded-full">
                  <img
                    src={user?.profilePic?.url}
                    alt="userProfile"
                    className="w-[40px] h-[40px] object-cover rounded-full aspect-square"
                  />
                </div>
              </NavLink>
            </div>
          </div>
        )}

        {/* Middle Section includes Main page left sidebar and right sidebar resizable */}
        <PanelGroup
          direction="horizontal"
          className="grow bg-transparent h-full"
        >
          {/* LEFT PANEL (Draggable) */}
          {isDesktopOrLaptop && (
            <Panel
              className="bg-black/40 no-copy"
              minSize={4}
              maxSize={13}
              order={1}
              defaultSize={leftPanelSize}
              onResize={leftResize}
              id="left-panel"
            >
              <div className="flex flex-col gap-4 p-2 myContainer">
                <NavLink
                  to={`/library`}
                  className={({ isActive }) =>
                    isActive ? "text-[#fe7641]" : "text-gray-300"
                  }
                >
                  <div
                    className={`flex gap-2 ${
                      leftPanelSize <= 10 ? "justify-center" : "justify-normal"
                    } items-center`}
                  >
                    <MdLibraryMusic size={35} />
                    {leftPanelSize > 10 && (
                      <h2 className="capitalize responsive-text font-semibold text-lg">
                        Library
                      </h2>
                    )}
                  </div>
                  <hr className="text-[#fafafa46] mt-2" />
                </NavLink>
                <NavLink
                  to={`/library/likedSongs/${user?._id}`}
                  className={({ isActive }) =>
                    isActive ? "text-[#fe7641]" : "text-gray-300"
                  }
                >
                  <div
                    className={`flex gap-2 ${
                      leftPanelSize <= 10 ? "justify-center" : "justify-normal"
                    } items-center hover:bg-white/10 py-2 rounded-md`}
                  >
                    <Heart size={30} />
                    {leftPanelSize > 10 && (
                      <h2
                        className="capitalize text-white responsive-text font-semibold"
                        style={{ fontSize: "15px" }}
                      >
                        Liked songs
                      </h2>
                    )}
                  </div>
                </NavLink>
                <NavLink
                  to={`/library/playlists/${user?._id}`}
                  className={({ isActive }) =>
                    isActive ? "text-[#fe7641]" : "text-gray-300"
                  }
                >
                  <div
                    className={`flex gap-2 ${
                      leftPanelSize <= 10 ? "justify-center" : "justify-normal"
                    } items-center hover:bg-white/10 py-2 rounded-md`}
                  >
                    <ListMusic size={30} />
                    {leftPanelSize > 10 && (
                      <h2
                        className="capitalize text-white responsive-text font-semibold"
                        style={{ fontSize: "15px" }}
                      >
                        Playlists
                      </h2>
                    )}
                  </div>
                </NavLink>
              </div>
            </Panel>
          )}

          {/* FIRST RESIZE HANDLE */}
          {isDesktopOrLaptop && (
            <PanelResizeHandle
              className="w-[1px] bg-gray-300/60 cursor-ew-resize"
              id="left-panel-handle"
            />
          )}

          {/* MIDDLE PANEL (Auto-Adjust) */}
          <Panel
            className="bg-black/30 overflow-hidden"
            id="middle-panel"
            order={2}
          >
            <Outlet />
          </Panel>

          {/* LAST RESIZE HANDLE */}
          {isDesktopOrLaptop && isSideBarOpen && (
            <PanelResizeHandle
              className="w-[1px] bg-gray-300/60 cursor-ew-resize"
              id="right-panel-handle"
            />
          )}

          {/* RIGHT PANEL (Draggable) */}
          {isDesktopOrLaptop && isSideBarOpen && (
            <Panel
              className="bg-black/40"
              minSize={18}
              maxSize={25}
              order={3}
              defaultSize={rightPanelSize}
              onResize={rightResize}
              id="right-panel"
            >
              {queue?.length > 0 ? <RightSideBar /> : <EmptyQueue />}
            </Panel>
          )}

          {!isSideBarOpen && (
            <button
              className="h-full w-[30px] cursor-pointer bg-white/2 hover:bg-white/5 text-[#ececec] hover:text-white"
              onClick={toggleSideBarOpen}
            >
              <ChevronLeft strokeWidth={1.75} />
            </button>
          )}
        </PanelGroup>

        {/* SoundBar for large screen devices gets the audio element via prop */}
        {isDesktopOrLaptop && audioReady && (
          <SoundBar audioElement={getAudio()} />
        )}
        {/* Mobile SoundBar Display */}
        {isTabletOrMobile && (
        <div className="w-full absolute bottom-0 z-777 bg-[linear-gradient(180deg,transparent_10%,rgba(0,0,0,1.2)_100%)]">
            {queue.length > 0 && audioReady && (
              <div className="p-2">
                <MobileSoundBarDisplay audioElement={getAudio()} />
              </div>
            )}
            <NavBar />
          </div>
        )}
      </div>
    </MuzoxApp>
  );
};

export default ProtectedRoute;
