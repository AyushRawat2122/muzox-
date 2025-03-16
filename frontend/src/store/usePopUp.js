import { create } from "zustand";
const usePopUp = create((set) => ({
  context: undefined,
  addPopUp: false,
  soundBarPopUp: false,
  setSoundBarPopUp: (bool) => set({ soundBarPopUp: bool }),
  toggleAddPopUp: () => {
    set((state) => ({ addPopUp: !state.addPopUp }));
  },
  setContext: (context) => set({ context: context }),
}));

export default usePopUp;
