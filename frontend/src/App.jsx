import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { Outlet, useLocation, useNavigate } from "react-router";
function App() {
 
  const [isOnline, setIsOnline] = useState();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(true);
      console.log("online")
      if (location.pathname === "/error") {
        const prevlocation = location.state?.from || "/";
        console.log(prevlocation , "navigating")
        navigate(prevlocation);
      }
    };
    const handleOfflineStatus = () => {
      setIsOnline(false);
      console.log("offline");
      navigate("/error", { state: { from: location.pathname } });
    };
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black/20">
      {/*simply return the outlet which will display all the pages dependent on it*/}
      <Outlet />
      <ToastContainer autoClose={3000} position="top-right" />
    </div>
  );
}

export default App;
