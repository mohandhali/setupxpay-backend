
import React from "react";

export const Button = ({ children, className = "", ...props }) => (
  <button
    className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm ${className}`}
    {...props}
  >
    {children}
  </button>
);
