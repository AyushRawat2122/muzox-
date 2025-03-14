import usePopUp from "../../store/usePopUp";
import Notify from "./Notify";
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
const AddToLibrary = () => {
  const { toggleAddPopUp } = usePopUp();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const popUp = useRef(null);

  // Demo: set an error message on mount
  useEffect(() => {
    setError("booyah");
  }, []);

  const handleBackdropClick = (e) => {
    if (popUp.current && e.target === e.currentTarget) {
      toggleAddPopUp();
    }
  };
  
  //liked song component
  const LikedSong = () => {
    return <div></div>;
  };

  //user playlist component

  return (
    <AnimatePresence mode="wait">
      {/* Background Overlay */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {/* Notification */}
        <Notify
          error={error}
          setError={setError}
          successMsg={successMsg}
          setSuccessMsg={setSuccessMsg}
        />

        {/* Modal Box */}
        <motion.div
          ref={popUp}
          key="modal"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
          transition={{ duration: 0.3 }}
          className="relative w-[80%] h-[80%] overflow-y-scroll hiddenScroll p-6 gradientBg text-white rounded-lg shadow-sm shadow-gray-300"
        >
          {/* Close Button */}
          <button
            onClick={toggleAddPopUp}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h1 className="text-2xl font-bold mb-4">Save To :</h1>
          <h2>Liked Songs</h2>

          <div className="mt-4 flex items-center gap-4">
            {/* Confirm Button */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddToLibrary;
