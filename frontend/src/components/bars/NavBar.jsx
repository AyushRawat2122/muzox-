import { NavLink } from "react-router";
import { Home, Search, Library, Crown } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full absolute bottom-0 bg-black/40 p-4 flex justify-around items-center rounded-t-md">
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? "text-white" : "text-gray-400")}
      >
        <Home size={28} />
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) => (isActive ? "text-white" : "text-gray-400")}
      >
        <Search size={28} />
      </NavLink>

      <NavLink
        to="/library"
        className={({ isActive }) => (isActive ? "text-white" : "text-gray-400")}
      >
        <Library size={28} />
      </NavLink>

      <NavLink
        to="/premium"
        className={({ isActive }) => (isActive ? "text-white" : "text-gray-400")}
      >
        <Crown size={28} />
      </NavLink>
    </nav>
  );
};

export default Navbar;

