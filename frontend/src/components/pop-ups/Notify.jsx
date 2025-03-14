import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Notify = ({ error, setError, successMsg, setSuccessMsg }) => {
  const message = error || successMsg;

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMsg("");
      }, 3000); // Hide after 3s

      return () => clearTimeout(timer);
    }
  }, [error, successMsg]); // Reset when message changes

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key="notification"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-4 right-4 z-50 bg-[#272727] text-white px-4 py-2 rounded-md shadow-md cursor-pointer"
          onClick={() => {
            setError("");
            setSuccessMsg("");
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notify;



