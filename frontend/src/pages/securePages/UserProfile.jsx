import { useEffect, useState } from "react";
import { X, Check, LogOut, User, Bitcoin } from "lucide-react";
import getUser from "../../serverDataHooks/getUser";
import { normalRequest, queryClient } from "../../utils/axiosRequests.config";
import { useMutation } from "@tanstack/react-query";
import Loading from "../../components/loaders/Loading";
import { loadingDotsOrange } from "../../utils/lottie.js";
import { useNavigate } from "react-router";

function UserProfile() {
  const [state, setState] = useState("stats");
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const user = getUser();
  const navigate = useNavigate();
  const [prevSrc, setPrevSrc] = useState(user.data.profilePic.url);

  const formatDate = (updatedAt) => {
    const [year, month, day] = updatedAt.split("T")[0].split("-");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, 2k${year.slice(2)}`;
  };
 const TakeToAdmin=()=>{
  navigate("/admin-panel");
 }
 const TakeToAdminRequest=()=>{
  navigate("/admin-panel-req")
 }
  const mutation1 = useMutation({
    mutationFn: async () => {
      const res = await normalRequest.post("/user/updateUserDetails", {
        username: tempUsername,
      });
      return res.data;
    },
    onMutate: async () => {
      setEditingUsername(false);
      await queryClient.cancelQueries(["user"]);
      const previousUser = queryClient.getQueryData(["user"]);
      queryClient.setQueryData(["user"], old => ({
        ...old,
        username: tempUsername,
      }));
      return { previousUser };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["user"], context.previousUser);
      console.error(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });

  const anoMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await normalRequest.post("/user/updateProfilePic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onMutate: async (file) => {
      await queryClient.cancelQueries(["user"]);
      const previousUser = queryClient.getQueryData(["user"]);
      const localImageUrl = URL.createObjectURL(file);
      setPrevSrc(localImageUrl);
      queryClient.setQueryData(["user"], old => ({
        ...old,
        profilePic: { url: localImageUrl },
      }));
      return { previousUser, localImageUrl };
    },
    onError: (err, file, context) => {
      queryClient.setQueryData(["user"], context.previousUser);
      setPrevSrc(context.previousUser.profilePic.url);
      console.error(err);
    },
    onSuccess: (data) => {
      const newUrl = data.message.profilePic.url;
      setPrevSrc(newUrl);
      queryClient.setQueryData(["user"], old => ({
        ...old,
        profilePic: data.message.profilePic,
      }));
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await normalRequest.post("/user/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/login", { replace: true });
    },
    onError: (error) => console.error(error),
  });

  const handleProfileUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      anoMutation.mutate(file);
    }
  };

  const handleUsernameUpdate = () => {
    if (tempUsername.trim()) {
      mutation1.mutate();
    }
  };

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

  if (mutation.isLoading || mutation1.isLoading || anoMutation.isLoading) {
    return <Loading src={loadingDotsOrange} />;
  }

  return (
    <div className="w-full h-full overflow-y-scroll bg-zinc-950 text-white p-4 md:p-8">
      <header className="flex justify-between space-around items-center mb-6">
        <h2 className="font-bold flex gap-1 text-2xl md:text-5xl">
          Your Profile{" "}
          {user?.data?.isPremiumUser ? <span className="text-yellow-400"><Bitcoin size={25}/></span> : null}
        </h2>
         
        <button
          onClick={() => mutation.mutate()}
          className="flex items-center gap-2 text-red-500 hover:text-red-400"
        >
        
          <LogOut size={16} /> Logout
        </button>
      </header>

      <section className="bg-gray-500/10 p-6 rounded-lg shadow-xl mb-6 text-gray-300">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <label
              htmlFor="profile-image"
              className="mt-3 cursor-pointer text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <div className="w-32 h-32 sm:w-[200px] sm:h-[200px] rounded-full overflow-hidden">
                {user.data?.profilePic?.url ? (
                  <img
                    src={prevSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <User size={40} className="text-gray-500" />
                  </div>
                )}
              </div>
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileUpdate}
            />
          </div>

          <div className="flex flex-col items-center sm:items-end w-full space-y-3">
            <div className="flex items-center justify-between">
              {editingUsername ? (
                <div className="flex items-center gap-2">
                  <input
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="text-white text-right outline-none capitalize text-2xl md:text-6xl p-2 w-full"
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setEditingUsername(false)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <span
                  className="cursor-pointer text-2xl capitalize font-extrabold md:text-6xl hover:text-white"
                  onClick={() => {
                    setTempUsername(user.data.username);
                    setEditingUsername(true);
                  }}
                >
                  {user.data?.username}
                </span>
              )}
            </div>

            <span>{user.data?.email}</span>
            <div className="flex items-center text-gray-500 text-sm ">
              <span>Member Since: </span>
              <span>
                {user.data?.createdAt && formatDate(user.data.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="p-4 bg-gray-500/10">
        <div className="flex flex-col gap-4 shadow rounded p-4 bg-white/1">
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setState("stats")}
              className={`px-6 py-2 rounded transition duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#3a3a3a] ${
                state === "stats"
                  ? "bg-gradient-to-r from-[#1a1a1a] to-[#2e2e2e] text-white shadow-md"
                  : "bg-[#121212] text-[#CCCCCC] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setState("recent")}
              className={`px-6 py-2 rounded transition duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#3a3a3a] ${
                state === "recent"
                  ? "bg-gradient-to-r from-[#1a1a1a] to-[#2e2e2e] text-white shadow-md"
                  : "bg-[#121212] text-[#CCCCCC] hover:bg-[#1a1a1a] hover:text-white"
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
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
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
    <div className="flex items-center justify-center mt-5">
  {user.data.isAdmin ? (
    <button
      onClick={TakeToAdmin}
      className="px-6 py-2 rounded-lg border border-amber-300 text-amber-200 hover:bg-amber-300   hover:text-zinc-950 transition duration-200"
      aria-label="Go to Admin Panel"
    >
      Admin Panel
    </button>
  ) : (
    <button
      onClick={TakeToAdminRequest}
      className="px-6 py-2 rounded-lg border border-green-400 text-green-400 hover:bg-green-400 hover:text-white transition duration-200"
      aria-label="Request Admin Access"
    >
      Request For Admin
    </button>
  )}
</div>

    </div>
  );
}

export default UserProfile;
