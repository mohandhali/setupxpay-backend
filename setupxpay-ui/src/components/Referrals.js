import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaUsers, FaGift, FaCheckCircle, FaClock, FaCopy } from "react-icons/fa";

const Referrals = ({ user, onClose }) => {
  const [referrals, setReferrals] = useState([
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@example.com",
      date: "2024-01-15",
      status: "completed",
      stxEarned: 200,
      trades: 2
    },
    {
      id: 2,
      name: "Priya Singh",
      email: "priya@example.com",
      date: "2024-01-12",
      status: "pending",
      stxEarned: 100,
      trades: 0
    },
    {
      id: 3,
      name: "Amit Patel",
      email: "amit@example.com",
      date: "2024-01-10",
      status: "completed",
      stxEarned: 300,
      trades: 3
    }
  ]);

  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.status === "completed").length;
  const totalSTXEarned = referrals.reduce((sum, r) => sum + r.stxEarned, 0);
  const pendingReferrals = referrals.filter(r => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 px-6 py-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-800 hover:text-gray-600 transition-colors text-xl"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">My Referrals</h2>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-700">Total Earned</div>
            <div className="text-xl font-bold text-gray-800">{totalSTXEarned} STX</div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-6 pb-20 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center border border-yellow-200 shadow-lg">
              <div className="text-3xl font-bold text-yellow-600">{totalReferrals}</div>
              <div className="text-sm text-gray-600 mt-1">Total Referrals</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center border border-gray-200 shadow-lg">
              <div className="text-3xl font-bold text-gray-700">{totalSTXEarned}</div>
              <div className="text-sm text-gray-600 mt-1">STX Earned</div>
            </div>
          </div>

          {/* Progress Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-200 shadow-lg">
              <div className="text-3xl font-bold text-green-600">{completedReferrals}</div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 text-center border border-orange-200 shadow-lg">
              <div className="text-3xl font-bold text-orange-600">{pendingReferrals}</div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <FaCopy className="text-yellow-600 text-lg" />
              <span className="text-lg font-semibold text-gray-800">Your Referral Link</span>
            </div>
            <div className="bg-white border border-yellow-300 rounded-lg p-4 flex items-center gap-3 shadow-sm">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-gray-700 truncate">
                  https://setupxpay.com/signup?ref={user._id?.slice(-6) || "abc123"}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://setupxpay.com/signup?ref=${user._id?.slice(-6) || "abc123"}`);
                  alert("Referral link copied!");
                }}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-md"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Referral List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FaUsers className="text-yellow-600 text-lg" />
              <span className="text-lg font-semibold text-white">Referral History</span>
            </div>
            
            {referrals.map((referral) => (
                             <motion.div
                 key={referral.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-yellow-300"
               >
                <div className="flex items-center justify-between mb-2">
                                     <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                       {referral.name.charAt(0)}
                     </div>
                    <div>
                      <div className="font-medium text-gray-800">{referral.name}</div>
                      <div className="text-xs text-gray-500">{referral.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {referral.status === "completed" ? (
                        <FaCheckCircle className="text-green-500 text-sm" />
                      ) : (
                        <FaClock className="text-yellow-500 text-sm" />
                      )}
                      <span className={`text-xs font-medium ${
                        referral.status === "completed" ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {referral.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>Joined: {referral.date}</span>
                    <span>Trades: {referral.trades}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaGift className="text-green-500" />
                    <span className="font-medium text-green-600">{referral.stxEarned} STX</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {referrals.length === 0 && (
            <div className="text-center py-8">
              <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No referrals yet</p>
              <p className="text-sm text-gray-400">Share your referral link to start earning STX tokens!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Referrals; 