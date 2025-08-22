import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Logo } from "../components/Index.js";
import API from "../api";
import { toast } from 'react-toastify';

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isEmail = identifier.includes("@");
      const credentials = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await API.post("/users/login", credentials);

      if (response.data.data?.accessToken) {
        localStorage.setItem("authToken", response.data.data.accessToken);
        toast.success('Login successful!');
        navigate("/");
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle unverified email case
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        const errorMessage = 'Please verify your email before logging in. Check your email for the verification link.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (error.response?.status === 403) {
        // Handle other 403 errors
        const errorMessage = error.response?.data?.message || 'Access denied. Please check your credentials.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Handle all other errors
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate(`/forgot-password?email=${encodeURIComponent(identifier)}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gray-900 text-white px-4 sm:px-6">
      <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-800 rounded-xl p-6 sm:p-8 md:p-10 border border-gray-700">
        <div className="mb-6 flex justify-center">
          <span className="inline-block w-24 sm:w-28">
            <Link to="/">
              <Logo width="100%" />
            </Link>
          </span>
        </div>
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-white">
          Log In to Your Account
        </h1>
        <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-400 transition-all duration-200 hover:underline"
          >
            Sign up
          </Link>
        </p>

        {error && (
          <p className="text-red-500 text-center mt-6 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-4">
            <Input
              label="Email or Username"
              type="text"
              placeholder="Email or Username"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="text-gray-200"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-gray-200"
              required
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
