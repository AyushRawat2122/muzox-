import { create } from "zustand";
const useSearchQuery = create((set)=>({
    searchQuery : "",
    updateSearchQuery : (query) => set({searchQuery:query})
}));
export default useSearchQuery;