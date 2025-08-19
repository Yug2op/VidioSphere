import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function ResetPassword() {
  const [search] = useSearchParams();
  const token = search.get("token");
  const userId = search.get("id");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");

    try {
      await API.post("/users/reset-password", { userId, token, password });
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  if (!token || !userId) {
    return <p className="p-6 text-red-400">Invalid reset link.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
      <form onSubmit={submit} className="space-y-4">
        <input type="password" placeholder="New password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full p-2 bg-gray-800 rounded text-white" />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required className="w-full p-2 bg-gray-800 rounded text-white" />
        <button className="w-full bg-blue-500 p-2 rounded">Set new password</button>
      </form>
      {message && <p className="mt-4 text-green-400">{message}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
}