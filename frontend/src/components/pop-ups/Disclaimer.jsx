import React from "react";
import { AlertTriangle } from "lucide-react";
import usePopUp from "../../store/usePopUp";
import { motion } from "framer-motion";
const Disclaimer = () => {
  const { toggleDisclaimerPopUp } = usePopUp();
  return (
    <motion.div
      key="Disclaimer"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className="min-h-screen absolute z-[999999] w-full h-full bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="max-w-2xl bg-black/40 p-8 rounded-lg shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white">Disclaimer</h1>
        </div>

        <div className="space-y-4 text-gray-300 text-lg">
          <p>
            Muzox is a <span className="text-amber-700">non-commercial, educational project developed solely for
            learning and portfolio purposes</span>. We do <span className="text-lime-400">not engage</span> in any form of
            <span className="text-cyan-300">business or profit-making activities</span> through this platform.
          </p>

          <p>
            <span className="italic font-bold underline text-yellow-100">All music files uploaded or streamed on Muzox are the property of
            their respective copyright owners</span>. We do not claim any ownership or
            rights over the music content provided.
          </p>

          <p>
            <span className="text-red-200">If you are a copyright holder and believe any content should be
            removed, please contact us and we will take immediate action.</span>
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            transition-colors duration-200 font-medium"
            onClick={() => {
              toggleDisclaimerPopUp(false);
            }}
          >
            Continue to Muzox
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Disclaimer;
