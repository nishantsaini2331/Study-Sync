import axios from "axios";
import { ArrowRight, Loader, Mail } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { emailRegex } from "../utils/regex";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  function validateEmail(email) {
    return emailRegex.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}user/forgot-password`,
        { email }
      );

      toast.success(response.data.message, {
        duration: 7000,
      });
      setEmail("");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send password reset email"
      );
    } finally {
      setLoading(false);
    }
  }

  if (user.username) {
    toast.error("You are already logged in", {
      duration: 7000,
    });
    return <Navigate to="/" />;
  }
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Forgot Password</h2>
      <p className="text-gray-600 mb-6">
        Enter your email address and we'll send you instructions to reset your
        password.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-medium mb-2"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="text-gray-400" size={18} />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <Loader className="animate-spin mr-2" size={18} />
              Sending...
            </span>
          ) : (
            <>
              Send Reset Link
              <ArrowRight className="ml-2" size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
