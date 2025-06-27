import React from "react";

const Dashboard = ({ user }) => {
  return (
    <div className="text-center mt-8">
      <h1 className="text-xl font-bold mb-2">👋 Welcome, {user?.name}</h1>
      <p className="text-sm text-gray-600">Your Dashboard will appear here.</p>
    </div>
  );
};

export default Dashboard;
