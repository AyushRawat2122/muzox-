import React from "react";
import usePopUp from "../../store/usePopUp";
import AddToLibrary from "../../components/pop-ups/AddToLibrary";
import { AnimatePresence } from "framer-motion";
const MuzoxApp = ({ children, className }) => {
  const { addPopUp } = usePopUp();
  return (
    <div className={`${className} relative`}>
      <AnimatePresence mode="wait">
        {addPopUp && <AddToLibrary key={"backdrop"} />}
      </AnimatePresence>
      {children}
    </div>
  );
};

export default React.memo(MuzoxApp);
