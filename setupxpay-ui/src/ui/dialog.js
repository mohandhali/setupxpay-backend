
import React from "react";

export const Dialog = ({ open, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {children}
    </div>
  );
};

export const DialogContent = ({ children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-xl max-w-md w-full ${className}`}>
    {children}
  </div>
);

export const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;

export const DialogTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-800">{children}</h3>
);
