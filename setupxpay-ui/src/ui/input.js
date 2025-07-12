import React from "react";

export const Input = ({ className = "", ...props }) => (
  <input
    className={`border border-gray-300 rounded-md px-3 py-2 text-sm w-full ${className}`}
    {...props}
  />
);