import React, { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";

import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const InstructorDashboard = () => {
  const [courses, setCourses] = useState(null);
  const [instructorStats, setInstructorStats] = useState(null);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });

  const navigate = useNavigate();

  const handleAction = (action, courseId) => {
    switch (action) {
      case "edit":
        // showNotification(`Editing course ${courseId}`);
        break;
      case "delete":
        // if (window.confirm("Are you sure you want to delete this course?")) {
        //   setCourses(courses.filter((course) => course.id !== courseId));
        //   showNotification("Course deleted successfully");
        // }
        break;
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}instructor/dashboard`,
          {
            withCredentials: true,
          }
        );
        console.log(res.data.courses);
        setCourses(res.data.courses);
        setInstructorStats(res.data.instructor);
        // toast.success("Course created successfully");
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message || "Please try again later");
      }
    }

    fetchCourses();
  }, []);

  if (!courses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            notification.type === "error" ? "bg-red-500" : "bg-green-500"
          } transition-opacity duration-300`}
        >
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Instructor Dashboard
          </h1>
          {/* <Link to={"/create-course"}> */}

          <div className="flex items-center gap-4">
            <h2
              className="text-lg text-blue-600 cursor-pointer "
              onClick={() => {
                navigate("/");
              }}
            >
              Switch to Student
            </h2>

            <button
              onClick={() => navigate("/create-course")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Courses",
              value: instructorStats.totalCourses,
              color: "text-blue-600",
            },
            {
              label: "Active Students",
              value: instructorStats.totalStudents,
              color: "text-green-600",
            },
            {
              label: "Total Revenue",
              value: `₹ ${instructorStats.totalEarnings}`,
              color: "text-purple-600",
            },
            // {
            //   label: "Average Rating",
            //   value: (
            //     courses.reduce((acc, course) => acc + (course.rating || 0), 0) /
            //     courses.filter((c) => c.rating > 0).length
            //   ).toFixed(1),
            //   color: "text-yellow-600",
            // },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium">
                {stat.label}
              </h3>
              <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div
              key={course?.courseId}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link
                to={`/course-preview/${course.courseId}`}
                // key={course.courseId}
              >
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover "
                  />
                  <div className="absolute top-2 right-2">
                    <div className="relative inline-block">
                      <button
                        className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                        onClick={() => {
                          const menu = document.getElementById(
                            `menu-${course.courseId}`
                          );
                          menu.classList.toggle("hidden");
                        }}
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      <div
                        id={`menu-${course.courseId}`}
                        className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10"
                      >
                        <div className="py-1">
                          <button
                            onClick={() =>
                              handleAction("edit", course.courseId)
                            }
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleAction("delete", course.courseId)
                            }
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        course.status === "Published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {course.status}
                    </span>

                    <Link to={`/edit-course/${course.courseId}`}>
                      <span
                        className="bg-black text-white rounded-full px-7 py-2 cursor-pointer"
                        onClick={(e) =>
                          navigate(`/edit-course/${course.courseId}`)
                        }
                      >
                        Edit
                      </span>
                    </Link>
                    {/* <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-gray-600">
                      {course.rating || "N/A"}
                    </span>
                  </div> */}
                  </div>
                  {/* <div className="flex justify-between text-sm text-gray-500">
                  <span>{course.students.toLocaleString()} students</span>
                  <span>${course.revenue.toLocaleString()}</span>
                </div> */}
                  <div className="text-xs text-gray-400 mt-2">
                    Last updated:{" "}
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
