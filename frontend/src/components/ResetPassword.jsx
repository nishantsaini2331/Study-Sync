import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";

function ResetPassword() {
  const navigate = useNavigate();
  const { resetToken } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    async function extractAndVerifyToken() {
      try {
        console.log("Verifying token:", resetToken);
        if (!resetToken) {
          setError("Reset token is missing from URL");
          setVerifyingToken(false);
          return;
        }

        setToken(resetToken);
        const response = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_URL
          }user/verify-reset-token/${resetToken}`
        );

        setTokenValid(true);
        setVerifyingToken(false);
      } catch (err) {
        setError("Invalid or expired password reset link");
        setTokenValid(false);
        setVerifyingToken(false);
      }
    }

    extractAndVerifyToken();
  }, [resetToken]);

  function validatePassword() {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validatePassword()) return;

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}user/reset-password`,
        {
          token,
          password: newPassword,
          confirmPassword,
        }
      );
      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (verifyingToken) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="text-blue-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold">
            Verifying your reset link...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we verify your password reset link.
          </p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <XCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h2 className="text-xl font-semibold mb-2">Invalid Reset Link</h2>
        <p className="text-gray-600 mb-6">
          {error || "This password reset link is invalid or has expired."}
        </p>
        <button
          onClick={() => navigate("/forgot-password")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Request New Reset Link
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <ShieldCheck className="text-green-500 mx-auto mb-4" size={48} />
        <h2 className="text-xl font-semibold mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-gray-600 mb-2">
          Your password has been reset successfully.
        </p>
        <p className="text-gray-500 text-sm">
          Redirecting you to login page...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <Lock className="mr-2" size={20} />
        Reset Your Password
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle className="mr-2" size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-medium mb-2"
            htmlFor="newPassword"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 8 characters long
          </p>
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-medium mb-2"
            htmlFor="confirmPassword"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              <Save className="mr-2" size={18} />
              Set New Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
