import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/forgot-password", { email });
      setMsg("If the email exists, a reset link was sent.");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
      <button type="submit">Send reset link</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}