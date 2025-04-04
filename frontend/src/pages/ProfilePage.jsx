import axios from "axios";
import {
  BookOpen,
  Briefcase,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Twitter,
  User,
  User2,
  Youtube,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ProfilePage() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}user/profile/${id}`
        );
        setUserData(response.data.user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data");
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-4">
          Error
        </h2>
        <p className="text-gray-700">{error || "User profile not found"}</p>
      </div>
    );
  }

  const isInstructor = userData.roles && userData.roles.includes("instructor");
  const hasCreatedCourses =
    isInstructor &&
    userData.createdCourses &&
    userData.createdCourses.length > 0;

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24 sm:h-32"></div>
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex items-center">
              <div className="relative -mt-16 flex-shrink-0">
                {userData.photoUrl ? (
                  <img
                    src={userData.photoUrl}
                    alt={userData.name || "User profile"}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                    <User2 size={32} className="text-gray-500" />
                  </div>
                )}
              </div>
              <div className="ml-4 mt-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {userData.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  @{userData.username}
                </p>
                {userData.headline && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {userData.headline}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="block sm:hidden border-t mt-2">
          <div className="flex justify-between items-center px-4 py-2">
            <button
              onClick={() => toggleTab("about")}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "about"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              About
            </button>

            {isInstructor && (
              <button
                onClick={() => toggleTab("teaching")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "teaching"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Teaching
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        <div
          className={`md:col-span-1 ${
            activeTab !== "about" && "hidden sm:block"
          }`}
        >
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
              <User className="mr-2 text-blue-500" size={20} />
              <span>About</span>
            </h2>

            {userData.bio ? (
              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                {userData.bio}
              </p>
            ) : (
              <p className="text-gray-500 italic mb-6 text-sm">
                No bio provided
              </p>
            )}

            <ul className="space-y-3">
              {userData.qualification && (
                <li className="flex items-center text-gray-700 text-sm sm:text-base">
                  <GraduationCap
                    className="mr-2 text-blue-500 flex-shrink-0"
                    size={18}
                  />
                  <span>{userData.qualification}</span>
                </li>
              )}

              <li className="flex items-center text-gray-700 text-sm sm:text-base">
                <Briefcase
                  className="mr-2 text-blue-500 flex-shrink-0"
                  size={18}
                />
                <span>{isInstructor ? "Instructor & Student" : "Student"}</span>
              </li>
            </ul>

            {userData.socials &&
              Object.values(userData.socials).some(
                (value) => value && value.trim() !== ""
              ) && (
                <div className="mt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">
                    Connect
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {userData.socials.github && (
                      <a
                        href={userData.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      >
                        <Github size={18} className="text-gray-700" />
                      </a>
                    )}
                    {userData.socials.twitter && (
                      <a
                        href={userData.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      >
                        <Twitter size={18} className="text-blue-400" />
                      </a>
                    )}
                    {userData.socials.linkedin && (
                      <a
                        href={userData.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      >
                        <Linkedin size={18} className="text-blue-700" />
                      </a>
                    )}
                    {userData.socials.youtube && (
                      <a
                        href={userData.socials.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      >
                        <Youtube size={18} className="text-red-600" />
                      </a>
                    )}
                    {userData.socials.website && (
                      <a
                        href={userData.socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      >
                        <ExternalLink size={18} className="text-gray-700" />
                      </a>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className={`md:col-span-2 space-y-4 sm:space-y-6`}>
          {isInstructor && hasCreatedCourses && (
            <div
              className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${
                activeTab !== "teaching" &&
                activeTab !== "about" &&
                "hidden sm:block"
              }`}
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                <BookOpen
                  className="mr-2 text-blue-500 flex-shrink-0"
                  size={20}
                />
                <span>Courses by {userData.name}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userData.createdCourses.map((course) => (
                  <div
                    key={course.courseId}
                    onClick={() => {
                      window.location.href = `/course/${course.courseId}`;
                    }}
                    title={course.title}
                    className="border rounded-lg cursor-pointer overflow-hidden hover:shadow-md transition"
                  >
                    <div className="relative">
                      <img
                        src={course.thumbnail || "https://placehold.co/300x150"}
                        alt={course.title}
                        className="w-full h-32 sm:h-36 object-cover "
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-base sm:text-lg mb-1 text-gray-800 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isInstructor && !hasCreatedCourses && (
            <div
              className={`bg-white rounded-lg shadow-md p-4 sm:p-6 text-center ${
                activeTab !== "teaching" &&
                activeTab !== "about" &&
                "hidden sm:block"
              }`}
            >
              <div className="py-6 sm:py-8">
                <BookOpen className="mx-auto text-gray-400" size={36} />
                <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                  No Created Courses
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  This instructor hasn't created any courses yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
