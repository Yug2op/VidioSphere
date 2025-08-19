import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function ResetPassword() {
  const [search] = useSearchParams();
  const token = search.get("token");
  const userId = search.get("id");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/reset-password", { userId, token, password });
      navigate("/login");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to reset");
    }
  };

  return (
    <form onSubmit={submit}>
      <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="New password" />
      <button type="submit">Set password</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}