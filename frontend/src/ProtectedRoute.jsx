import React, { useEffect } from "react";
import { Outlet } from "react-router";
import { Navigate, useLocation } from "react-router";
import getUser from "./serverDataHooks/getUser";
import MuzoxApp from "./pages/wrapperPages/MuzoxApp";

const ProtectedRoute = () => {
  const location = useLocation();
  const { data: user , isPending ,error } = getUser();

  if (isPending) {
    return <p className="text-8xl text-white">loading</p>;
  }

  if (error) {
    return (
      <Navigate to={"/login"} replace state={{ from: location.pathname }} />
    );
  }

  return (
    <MuzoxApp>
      <Outlet />{" "}
      {/* Muzox App is the Wrapper which will have our player and Sidebar or NavBar*/}
    </MuzoxApp>
  );
};

export default ProtectedRoute;
