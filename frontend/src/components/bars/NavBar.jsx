import { NavLink } from "react-router";
import { Home, Search, Library, Crown } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full bg-black/70 p-4 flex justify-around items-center rounded-2xl">
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
