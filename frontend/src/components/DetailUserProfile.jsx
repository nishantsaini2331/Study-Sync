import axios from "axios";
import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import StudentProgress from "./StudentProgress";
import InstructorSummaryDashboard from "./InstructorSummaryDashboard";
import {
  User,
  ExternalLink,
  CheckCircle,
  Loader,
  GraduationCap,
  BookOpen,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate } from "../utils/formatDate";
function DetailUserProfile({ detailUser, setDetailUser }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function getUserData() {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}admin/user/${detailUser}`,
          {
            withCredentials: true,
          }
        );
        setUserData(response.data.user);
        setError(null);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    }

    if (detailUser) {
      getUserData();
    }
  }, [detailUser]);

  const isInstructor = userData?.roles?.includes("instructor");

  async function toggleVerification() {
    try {
      if (confirm("Are you sure you want to change the verification status?")) {
        setUpdateLoading(true);
        setUpdateMessage({ text: "", type: "" });
        const response = await axios.patch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }admin/user/${detailUser}/toggle-verification`,
          {
            isVerified: !userData.isVerified,
          },
          {
            withCredentials: true,
          }
        );

        setUserData({
          ...userData,
          isVerified: response.data.user.isVerified,
        });

        setUpdateMessage({
          text: `User ${
            response.data.user.isVerified ? "verified" : "unverified"
          } successfully`,
          type: "success",
        });

        setTimeout(() => {
          setUpdateMessage({ text: "", type: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating verification status:", error);
      setUpdateMessage({
        text: "Failed to update verification status",
        type: "error",
      });
    } finally {
      setUpdateLoading(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden w-full">
      <DashboardHeader
        title={"User Profile Details"}
        description={"View and manage user information."}
        role="admin"
        isShowBtn={true}
        onClick={() => setDetailUser(null)}
      />

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading user data...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : userData ? (
        <div className="p-4 md:p-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Photo */}
              <div className="lg:w-1/3 bg-gray-50 p-4 md:p-6 flex flex-col items-center justify-center">
                {userData.photoUrl ? (
                  <img
                    src={userData.photoUrl}
                    alt={`${userData.name}'s profile`}
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-16 h-16 md:w-24 md:h-24 text-gray-400" />
                  </div>
                )}

                {/* Verification toggle - Added for admin functionality */}
                <div className="mt-6 w-full">
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Verification Status
                    </p>
                    <button
                      onClick={toggleVerification}
                      disabled={updateLoading}
                      className={`w-full max-w-xs flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                        userData.isVerified
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {updateLoading ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : userData.isVerified ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      {userData.isVerified ? "Verified" : "Not Verified"}
                    </button>
                    {updateMessage.text && (
                      <p
                        className={`mt-2 text-sm ${
                          updateMessage.type === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {updateMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Details */}
              <div className="lg:w-2/3 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                      {userData.name}
                    </h1>
                    <p className="text-gray-600 break-words">
                      {userData.email}
                    </p>

                    {userData.isVerified && (
                      <div className="flex items-center mt-1 text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Verified Account</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/profile/${userData.username}`}
                    target="_blank"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Show Public Profile
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">
                      {userData.username || "Not set"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {formatDate(userData.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(userData.updatedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Qualification</p>
                    <p className="font-medium">
                      {userData.qualification || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Roles */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {userData.roles && userData.roles.length > 0 ? (
                      userData.roles.map((role, index) => {
                        let bgColor = "bg-gray-100 text-gray-800";
                        if (role === "admin")
                          bgColor = "bg-purple-100 text-purple-800";
                        if (role === "instructor")
                          bgColor = "bg-blue-100 text-blue-800";
                        if (role === "student")
                          bgColor = "bg-green-100 text-green-800";

                        return (
                          <span
                            key={index}
                            className={`${bgColor} px-3 py-1 rounded-full text-sm font-medium`}
                          >
                            {role}
                          </span>
                        );
                      })
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        user
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 sm:flex gap-2 md:gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Created Courses</p>
                      <p className="font-bold text-blue-600">
                        {userData.createdCourses?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 flex items-center">
                    <GraduationCap className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Purchased Courses</p>
                      <p className="font-bold text-green-600">
                        {userData.purchasedCourses?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Progress Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Student Progress</h2>
            <StudentProgress isAdmin={true} username={userData.username} />
          </div>

          {/* Instructor Summary Section - Only shown if user has instructor role */}
          {isInstructor && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Instructor Dashboard</h2>
              <InstructorSummaryDashboard
                isAdmin={true}
                username={userData.username}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p>No user data found</p>
        </div>
      )}
    </div>
  );
}

export default DetailUserProfile;
