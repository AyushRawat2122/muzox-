import React, { useState } from "react";
import useSearchQuery from "../../store/useSearchQuery";
import { useLocation, useNavigate } from "react-router";
import { Search, X } from "lucide-react";
const SearchBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateSearchQuery, searchQuery } = useSearchQuery();
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const handleChange = (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);
    updateSearchQuery(searchQuery.trim());
  };
  const handleFocus = () => {
    const currentPage = location.pathname;
    if (currentPage !== "/search") {
      navigate("/search");
    }
    setIsFocused(true);
  };

  return (
    <div
      className={`flex w-full items-center rounded-md bg-black/20 active:bg-black/30 p-2 lg:rounded-full px-3 ${
        isFocused ? "border-3 border-[#fe7641]" : ""
      } overflow-hidden`}
    >
      <Search className="text-gray-300" />
      <input
        className="outline-none grow text-lg px-2"
        onFocus={handleFocus}
        onBlur={() => {
          setIsFocused(false);
          updateSearchQuery("");
          setQuery("")
        }}
        onChange={handleChange}
        type="text"
        value={query}
        placeholder="What do you want to play ?"
      />
      <X
        className="cursor-pointer hover:text-white muzoxSubText"
        onClick={() => {
          updateSearchQuery("");
          setQuery("");
        }}
      />
    </div>
  );
};

export default SearchBar;
