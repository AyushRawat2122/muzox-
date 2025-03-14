import { create } from "zustand";
const usePopUp = create((set) => ({
  context: {},
  addPopUp: false,
  toggleAddPopUp: () => {
    set((state) => ({ addPopUp: !state.addPopUp }));
  },
  setContext: (context) => set(context),
}));

export default usePopUp;
