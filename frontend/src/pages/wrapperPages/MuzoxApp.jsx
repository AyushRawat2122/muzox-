import React from "react";

const MuzoxApp = ({ children, className }) => {
  return <div className={`${className}`}>{children}</div>;
};

export default MuzoxApp;
