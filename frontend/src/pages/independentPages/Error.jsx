import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import Loading from "../../components/loaders/Loading";
import { cat404 } from "../../utils/lottie.js";
const Error = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;

  useEffect(() => {
    if (!from) {
      navigate("/");
    }
  }, [from, navigate]);

  return (
    <div className="h-full w-full gap-2.5 flex justify-between items-center">
      <div className="w-full">
        <img src="/404.png" alt="404" className="w-1/2 mx-auto" />
        <p className="text-4xl font-extrabold text-white text-center">
          NETWORK CONNECTION <br />
          ERROR
        </p>
      </div>
    </div>
  );
};

export default Error;
