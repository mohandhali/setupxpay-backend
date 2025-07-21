import React, { useEffect, useState } from "react";

const BACKEND_URL = "https://setupxpay-backend.onrender.com";

const AdminKYCPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("admin_jwt") || "");
  const [loginState, setLoginState] = useState({ username: "", password: "", error: "", loading: false });
  const [bankActionLoading, setBankActionLoading] = useState("");
  const [bankNotes, setBankNotes] = useState({});

  useEffect(() => {
    if (token) fetchKYCUsers();
    // eslint-disable-next-line
  }, [token]);

  const fetchKYCUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/kyc/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setToken("");
        localStorage.removeItem("admin_jwt");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users");
    }
    setLoading(false);
  };

  // Fetch all users with bank details for admin review
  const fetchBankUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/admin/bank-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setToken("");
        localStorage.removeItem("admin_jwt");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch users' bank details");
      }
    } catch (err) {
      setError("Failed to fetch users' bank details");
    }
    setLoading(false);
  };

  const updateKYCStatus = async (userId, status) => {
    setActionLoading(userId + status);
    try {
      const res = await fetch(`${BACKEND_URL}/kyc/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, status })
      });
      if (res.status === 401) {
        setToken("");
        localStorage.removeItem("admin_jwt");
        setActionLoading("");
        return;
      }
      const data = await res.json();
      if (data.success) {
        fetchKYCUsers();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    }
    setActionLoading("");
  };

  // Approve/reject a user's bank detail
  const updateBankStatus = async (userId, index, status) => {
    setBankActionLoading(userId + index + status);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/approve-bank-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, index, status, adminNote: bankNotes[userId + "-" + index] || "" })
      });
      if (res.status === 401) {
        setToken("");
        localStorage.removeItem("admin_jwt");
        setBankActionLoading("");
        return;
      }
      const data = await res.json();
      if (data.success) {
        fetchBankUsers();
      } else {
        alert(data.error || "Failed to update bank detail status");
      }
    } catch (err) {
      alert("Failed to update bank detail status");
    }
    setBankActionLoading("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginState.username, password: loginState.password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem("admin_jwt", data.token);
        setLoginState({ username: "", password: "", error: "", loading: false });
      } else {
        setLoginState((s) => ({ ...s, error: data.error || "Login failed", loading: false }));
      }
    } catch (err) {
      setLoginState((s) => ({ ...s, error: "Login failed", loading: false }));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <div className="mb-4">
            <label className="block text-sm mb-1">Username</label>
            <input type="text" className="w-full border px-3 py-2 rounded" value={loginState.username} onChange={e => setLoginState(s => ({ ...s, username: e.target.value }))} required />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border px-3 py-2 rounded" value={loginState.password} onChange={e => setLoginState(s => ({ ...s, password: e.target.value }))} required />
          </div>
          {loginState.error && <div className="text-red-600 mb-2 text-sm">{loginState.error}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium" disabled={loginState.loading}>
            {loginState.loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">KYC Admin Panel</h1>
        <button onClick={() => { setToken(""); localStorage.removeItem("admin_jwt"); }} className="bg-gray-200 px-3 py-1 rounded text-sm">Logout</button>
      </div>
      <div className="mb-6">
        <button onClick={fetchKYCUsers} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">KYC Users</button>
        <button onClick={fetchBankUsers} className="bg-green-600 text-white px-4 py-2 rounded">Bank Details</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          {/* KYC Table (default) */}
          <table className="min-w-full bg-white border rounded-lg mb-10">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">KYC Status</th>
                <th className="px-4 py-2 border">Details</th>
                <th className="px-4 py-2 border">Documents</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-2 border">{user.kycData?.fullName || "-"}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.kycStatus}</td>
                  <td className="px-4 py-2 border text-xs">
                    <div><b>DOB:</b> {user.kycData?.dateOfBirth || "-"}</div>
                    <div><b>Address:</b> {user.kycData?.address || "-"}</div>
                    <div><b>City:</b> {user.kycData?.city || "-"}</div>
                    <div><b>State:</b> {user.kycData?.state || "-"}</div>
                    <div><b>Pincode:</b> {user.kycData?.pincode || "-"}</div>
                  </td>
                  <td className="px-4 py-2 border text-xs">
                    <div><b>PAN:</b> {user.kycDocuments?.panCard ? (
                      <a href={user.kycDocuments.panCard} target="_blank" rel="noopener noreferrer">
                        <img src={user.kycDocuments.panCard} alt="PAN" className="h-12 w-auto inline-block border rounded mb-1" />
                      </a>
                    ) : "-"}</div>
                    <div><b>Aadhar Front:</b> {user.kycDocuments?.aadharFront ? (
                      <a href={user.kycDocuments.aadharFront} target="_blank" rel="noopener noreferrer">
                        <img src={user.kycDocuments.aadharFront} alt="Aadhar Front" className="h-12 w-auto inline-block border rounded mb-1" />
                      </a>
                    ) : "-"}</div>
                    <div><b>Aadhar Back:</b> {user.kycDocuments?.aadharBack ? (
                      <a href={user.kycDocuments.aadharBack} target="_blank" rel="noopener noreferrer">
                        <img src={user.kycDocuments.aadharBack} alt="Aadhar Back" className="h-12 w-auto inline-block border rounded mb-1" />
                      </a>
                    ) : "-"}</div>
                  </td>
                  <td className="px-4 py-2 border">
                    {user.kycStatus !== "verified" && (
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                        disabled={actionLoading === user._id + "verified"}
                        onClick={() => updateKYCStatus(user._id, "verified")}
                      >
                        {actionLoading === user._id + "verified" ? "Verifying..." : "Mark Verified"}
                      </button>
                    )}
                    {user.kycStatus !== "rejected" && (
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        disabled={actionLoading === user._id + "rejected"}
                        onClick={() => updateKYCStatus(user._id, "rejected")}
                      >
                        {actionLoading === user._id + "rejected" ? "Rejecting..." : "Reject"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bank Details Table (if any user has bankDetails) */}
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Bank/UPI Details</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Admin Note</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                user.bankDetails && user.bankDetails.length > 0 && user.bankDetails.map((bd, idx) => (
                  <tr key={user._id + "-" + idx} className="border-t">
                    <td className="px-4 py-2 border">{user.kycData?.fullName || user.name || "-"}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border text-xs">
                      <div><b>Account Holder:</b> {bd.accountHolder || "-"}</div>
                      {bd.accountNumber && <div><b>Account No:</b> {bd.accountNumber}</div>}
                      {bd.ifsc && <div><b>IFSC:</b> {bd.ifsc}</div>}
                      {bd.upiId && <div><b>UPI:</b> {bd.upiId}</div>}
                      <div className="text-gray-400 text-xs mt-1">Added: {bd.addedAt ? new Date(bd.addedAt).toLocaleString() : "-"}</div>
                    </td>
                    <td className="px-4 py-2 border capitalize">{bd.status}</td>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        className="border px-2 py-1 rounded w-32 text-xs"
                        placeholder="Admin note"
                        value={bankNotes[user._id + "-" + idx] || bd.adminNote || ""}
                        onChange={e => setBankNotes({ ...bankNotes, [user._id + "-" + idx]: e.target.value })}
                        disabled={bankActionLoading === user._id + idx + "approved" || bankActionLoading === user._id + idx + "rejected"}
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      {bd.status !== "approved" && (
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                          disabled={bankActionLoading === user._id + idx + "approved"}
                          onClick={() => updateBankStatus(user._id, idx, "approved")}
                        >
                          {bankActionLoading === user._id + idx + "approved" ? "Approving..." : "Approve"}
                        </button>
                      )}
                      {bd.status !== "rejected" && (
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                          disabled={bankActionLoading === user._id + idx + "rejected"}
                          onClick={() => updateBankStatus(user._id, idx, "rejected")}
                        >
                          {bankActionLoading === user._id + idx + "rejected" ? "Rejecting..." : "Reject"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminKYCPanel; 