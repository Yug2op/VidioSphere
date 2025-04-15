import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Logo } from "../components/Index.js";
import API from "../api";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    avatar: null,
    coverImage: null,
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: name === "username" ? value.toLowerCase() : value });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      await API.post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error.response?.data);
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-lg sm:max-w-xl bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-700 shadow-lg">
        <div className="mb-4 flex justify-center">
          <span className="w-24 sm:w-28">
            <Link to="/login">
              <Logo width="100%" />
            </Link>
          </span>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-100">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 transition-all duration-200 hover:underline"
          >
            Log In
          </Link>
        </p>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        <form onSubmit={handleSignup} className="flex flex-col gap-4 mt-6 text-gray-400">
          <Input
            label="Username"
            type="text"
            name="username"
            autoComplete="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded outline-none "
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded outline-none"
            required
          />
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            autoComplete="name"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded outline-none"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded outline-none"
            required
          />
          <div>
            <label className="text-gray-300">Avatar Image</label>
            <Input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-600 file:text-gray-300 hover:file:bg-gray-500"
            />
          </div>
          <div>
            <label className="text-gray-300">Cover Image</label>
            <Input
              type="file"
              name="coverImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-600 file:text-gray-300 hover:file:bg-gray-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-500 p-2 rounded text-white text-sm sm:text-base"
          >
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
