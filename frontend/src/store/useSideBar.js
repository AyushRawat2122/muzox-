import { create } from "zustand";
const useSideBar = create((set) => ({
  isSideBarOpen: true,
  isQueueDisplayed: false,
  toggleQueueDisplay: () => {
    set((state) => ({ isQueueDisplayed: !state.isQueueDisplayed }));
  },
  toggleSideBarOpen: () => {
    set((state) => ({ isSideBarOpen: !state.isSideBarOpen }));
  }
}));

export default useSideBar;
