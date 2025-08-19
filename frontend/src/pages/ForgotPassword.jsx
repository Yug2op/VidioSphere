import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await API.post("/users/forgot-password", { email });
      setMessage(res.data?.message || "If the email exists, a reset link will be sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 bg-gray-800 rounded text-white"
        />
        <button className="w-full bg-blue-500 p-2 rounded">Send reset link</button>
      </form>
      {message && <p className="mt-4 text-green-400">{message}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-blue-400 hover:underline">Back to login</Link>
      </p>
    </div>
  );
}