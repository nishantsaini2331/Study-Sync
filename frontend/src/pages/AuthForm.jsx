import React, { useEffect, useState } from "react";

import google from "../assets/google.svg";
import loginLogo from "../assets/loginLogo.svg";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { emailRegex, passwordRegex } from "../utils/regex";



function AuthForm({ type }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    qualification: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading((prev) => !prev);

    if (type === "register") {
      if (formData.name === "") {
        toast.error("Name is required");
        setLoading((prev) => !prev);
        return;
      }

      if (formData.email === "") {
        toast.error("Email is required");
        setLoading((prev) => !prev);
        return;
      }

      if (!emailRegex.test(formData.email)) {
        toast.error("Invalid email");
        setLoading((prev) => !prev);
        return;
      }

      if (formData.password === "") {
        toast.error("Password is required");
        setLoading((prev) => !prev);
        return;
      }

      if (!passwordRegex.test(formData.password)) {
        toast.error(
          "Password must be at least 8 characters long and contain at least one number, one uppercase letter, and one lowercase letter"
        );
        setLoading((prev) => !prev);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setLoading((prev) => !prev);
        return;
      }
      if (formData.qualification === "") {
        toast.error("Qualification is required");
        setLoading((prev) => !prev);
        return;
      }
    }

    if (type === "login") {
      if (!emailRegex.test(formData.email)) {
        toast.error("Invalid email");
        setLoading((prev) => !prev);
        return;
      }
      if (formData.email === "") {
        toast.error("Email is required");
        setLoading((prev) => !prev);
        return;
      }
      if (formData.password === "") {
        toast.error("Password is required");
        setLoading((prev) => !prev);
        return;
      }
    }
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}user/${type}`,
        formData,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        qualification: "",
      });
      if (res.data.user.roles.includes("admin")) {
        return navigate("/admin/dashboard");
      }
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData({
      name: "",
      email: "ns0109375@gmail.com",
      password: "#Nishant1",
      confirmPassword: "",
      qualification: "",
    });

    document.title = `Study Sync - ${type}`;
  }, [type]);

  return (
    <div className="flex h-[calc(100vh_-_70px)]">
      <div className="hidden lg:flex items-center justify-center flex-1 bg-white text-black">
        <div className="max-w-md text-center">
          <img src={loginLogo} alt="" />
        </div>
      </div>

      <div className="w-full bg-gray-100 lg:w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          {type === "login" ? (
            <div>
              <h1 className="text-2xl font-semibold text-gray-700 text-center">
                Login
              </h1>
              <form className="mt-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-indigo-600 focus:outline-none"
                    required
                    onChange={(e) => handleChange(e)}
                    value={formData.email}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-indigo-600 focus:outline-none"
                    required
                    onChange={(e) => handleChange(e)}
                    value={formData.password}
                  />
                </div>
                <div
                  className="text-right
                    mt-2"
                >
                  <Link
                    to={"/forgot-password"}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className="w-full block bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-3 mt-6"
                >
                  Login
                </button>
              </form>
              <hr className="my-6 border-gray-300 w-full" />

              <p className="mt-1">
                New here ?
                <Link
                  to="/register"
                  className="text-indigo-500 hover:text-indigo-600 font-semibold"
                >
                  Create an account
                </Link>
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold text-gray-700 text-center">
                Create an account
              </h1>
              <form className="mt-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-indigo-600 focus:outline-none"
                    required
                    onChange={(e) => handleChange(e)}
                    value={formData.name}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-indigo-600 focus:outline-none"
                    required
                    onChange={(e) => handleChange(e)}
                    value={formData.email}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-indigo-600 focus:outline-none"
                    required
                    onChange={(e) => handleChange(e)}
                    value={formData.password}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Enter your password again"
                    className="w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-indigo-600 focus:outline-none"
                    required
                    onChange={(e) => handleChange(e)}
                    value={formData.confirmPassword}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700">Qualification</label>
                  <select
                    name="qualification"
                    id="qualification"
                    className="w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-indigo-600 focus:outline-none"
                    required
                    onChange={(e) => handleChange(e)}
                    value={formData.qualification}
                  >
                    <option value="">Select Qualification</option>
                    <option value="Secondary (10th pass)">
                      Secondary (10th pass){" "}
                    </option>
                    <option value="Higher Secondary (12th pass)">
                      Higher Secondary (12th pass)
                    </option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  type="submit"
                  className="w-full block bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-700 text-white font-semibold rounded-lg  mt-6"
                >
                  {loading ? (
                    <span className="loader p-2 my-2"></span>
                  ) : (
                    <p className="text-center p-3">Register</p>
                  )}
                </button>
              </form>
              <hr className="my-6 border-gray-300 w-full" />
              <p className="mt-8">
                Already have an account?
                <Link
                  to="/login"
                  className="text-indigo-500 hover:text-indigo-600 font-semibold"
                >
                  Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
