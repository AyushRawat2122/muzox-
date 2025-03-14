import React from "react";
import usePopUp from "../../store/usePopUp";
import AddToLibrary from "../../components/pop-ups/AddToLibrary";
const MuzoxApp = ({ children, className }) => {
  const { addPopUp } = usePopUp();
  console.log(addPopUp);
  return (
    <div className={`${className} relative`}>
      {addPopUp && <AddToLibrary />}
      {children}
    </div>
  );
};

export default MuzoxApp;
