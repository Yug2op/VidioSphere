import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Logo } from "../components/Index.js";
import API from "../api";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const isEmail = identifier.includes("@");
    const payload = isEmail
      ? { email: identifier, password }
      : { username: identifier, password };

    try {
      const res = await API.post("/users/login", payload);
      if (res.data?.success) {
        navigate("/");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gray-900 text-white px-4 sm:px-6">
      <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-800 rounded-xl p-6 sm:p-8 md:p-10 border border-gray-700">
        <div className="mb-6 flex justify-center">
          <span className="inline-block w-24 sm:w-28">
            <Link to="/login">
              <Logo width="100%" />
            </Link>
          </span>
        </div>
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-white">
          Log In to Your Account
        </h1>
        <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
          Already have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-400 transition-all duration-200 hover:underline"
          >
            Signup
          </Link>
        </p>
        {error && (
          <p className="text-red-500 text-center mt-6 text-sm">{error}</p>
        )}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <Input
            label="Email or Username"
            type="text"
            placeholder="Email or Username"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="text-gray-200"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-gray-200"
          />
          <div className="text-right mt-1">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-500 p-2 rounded text-sm sm:text-base"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
