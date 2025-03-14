import React from "react";
import usePopUp from "../../store/usePopUp";

const HomePage = () => {
  const { toggleAddPopUp } = usePopUp();
  return (
    <div className="text-white text-5xl">
      This is home :{"}"}
      <button
        className="p-2 border border-amber-700"
        onClick={() => {
          console.log("clicked");
          toggleAddPopUp();
        }}
      >
        {" "}
        open popup{" "}
      </button>
    </div>
  );
};

export default HomePage;
