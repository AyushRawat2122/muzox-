import { useState } from "react";
import { Pencil, X, Check, LogOut, Upload, User } from "lucide-react";
import getUser from "../../serverDataHooks/getUser";
import { normalRequest, queryClient } from "../../utils/axiosRequests.config";
import { useMutation } from "@tanstack/react-query";
import Loading from "../../components/loaders/Loading";
import { loadingPlayIcon } from "../../utils/lottie.js";

function UserProfile() {
  const [state, setState] = useState("stats");
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const user = getUser();
  const formatDate = (updatedAt) => {
    const [year, month, day] = updatedAt.split("T")[0].split("-");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[parseInt(month, 10) - 1]} ${parseInt(
      day,
      10
    )}, 2k${year.slice(2)}`;
  };

  const updateUserName = async () => {
    try {
      const res = await normalRequest.post("/user/updateUserDetails", {
        username: tempUsername,
      });
      console.log(res.data);
      setEditingUsername(false);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProfilePic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await normalRequest.post("/user/updateProfilePic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const userLogout = async () => {
    try {
      const res = await normalRequest.post("/user/logout");
      window.location.href = "/login";
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  const mutation = useMutation({
    mutationFn: userLogout,
    onSuccess: () => {
      queryClient.invalidateQueries([{ queryKey: "user" }]);
    },
    onError: (error) => {
      console.error(error);
    },
  });
 
  if (mutation.isPending) {
    return <Loading src={loadingPlayIcon} />;
  }
  const getRecentData = () => {
    const itemStr = localStorage.getItem("recent");
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem("recent");
      return null;
    }
    return item?.value;
  };
  const recentData = getRecentData();

  return (
    <div className="min-h-screen h-full overflow-y-auto bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-2xl">
            Your Profile{" "}
            {user?.data?.isPremiumUser ? <span>~Premium</span> : null}
          </h2>
          <button
            onClick={userLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-400"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        <section className="bg-black p-6 rounded-lg shadow-xl border border-gray-700 mb-6 text-gray-300">
  <div className="flex flex-col md:flex-row items-center gap-6">
    
    {/* Profile Image Section */}
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 rounded-full border-4 border-gray-500 overflow-hidden">
        {user.data?.profilePic?.url ? (
          <img
            src={user.data.profilePic.url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <User size={40} className="text-gray-500" />
          </div>
        )}
      </div>
      <label
        htmlFor="profile-image"
        className="mt-3 cursor-pointer text-sm text-gray-400 hover:text-white flex items-center gap-1"
      >
        <Upload size={14} /> Change Profile Image
      </label>
      <input
        id="profile-image"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={updateProfilePic}
      />
    </div>

   
    <div className="flex-1 w-full space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-500">Username:</span>
        {editingUsername ? (
          <div className="flex items-center gap-2">
            <input
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              className="bg-black text-white p-2 border border-gray-600 w-full"
            />
            <button onClick={updateUserName} className="text-green-400 hover:text-green-300">
              <Check size={18} />
            </button>
            <button onClick={() => setEditingUsername(false)} className="text-red-400 hover:text-red-300">
              <X size={18} />
            </button>
          </div>
        ) : (
          <span
            className="cursor-pointer hover:text-white"
            onClick={() => {
              setTempUsername(user.data.username);
              setEditingUsername(true);
            }}
          >
            {user.data?.username}
          </span>
        )}
      </div>

      {/* Email */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500">Email:</span>
        <span>{user.data?.email}</span>
      </div>

      {/* Member Since */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500">Member Since:</span>
        <span>{user.data?.createdAt && formatDate(user.data.createdAt)}</span>
      </div>
      
    </div>
  </div>
</section>

        <div className="p-4 bg-zinc-900 min-h-screen">
          <div className="flex flex-col gap-4 shadow rounded p-4 bg-gray-800">
            <div className="flex justify-between mb-4">
              <button
                onClick={() => setState("stats")}
                className={`px-6 py-2 rounded transition duration-300 font-medium ${
                  state === "stats"
                    ? "bg-gradient-to-r from-gray-700 to-zinc-950 text-white"
                    : "bg-gray-700 hover:bg-gradient-to-r hover:from-gray-600 hover:to-zinc-800 text-gray-300"
                }`}
              >
                Stats
              </button>
              <button
                onClick={() => setState("recent")}
                className={`px-6 py-2 rounded transition duration-300 font-medium ${
                  state === "recent"
                    ? "bg-gradient-to-r from-gray-700 to-zinc-950 text-white"
                    : "bg-gray-700 hover:bg-gradient-to-r hover:from-gray-600 hover:to-zinc-800 text-gray-300"
                }`}
              >
                Recent
              </button>
            </div>

            {state === "stats" ? (
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user.data.playlists.length}
                </h2>
                <div>
                  <h2 className="text-xl font-semibold text-gray-300">Songs</h2>
                  <ul className="list-disc ml-5 text-gray-300">
                    {user.data.playlists.map((elm, ind) => (
                      <li key={ind}>{elm.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Recent Activity
                </h2>
                {recentData ? (
                  Array.isArray(recentData) ? (
                    recentData.map((activity, index) => (
                      <div key={index} className="text-gray-300 mb-2">
                        {activity}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-300">{recentData}</div>
                  )
                ) : (
                  <p className="text-gray-300">Nothing at hand Right Now!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
