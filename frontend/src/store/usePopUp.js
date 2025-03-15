import { create } from "zustand";
const usePopUp = create((set) => ({
  context: undefined,
  addPopUp: false,
  toggleAddPopUp: () => {
    set((state) => ({ addPopUp: !state.addPopUp }));
  },
  setContext: (context) => set({context:context}),
}));

export default usePopUp;
