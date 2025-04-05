import axios from "axios";
import { Filter, MoreVertical, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";

function InstructorCourses({ setDetailCourseStats }) {
  const [courses, setCourses] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCourses =
    courses &&
    courses
      .filter((course) =>
        course?.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((course) =>
        statusFilter === "all" ? true : course.status === statusFilter
      );

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}instructor/courses`,
          { withCredentials: true }
        );
        console.log(res.data.courses);
        setCourses(res.data.courses);
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message || "Please try again later");
      }
    }
    fetchCourses();
    document.title = "Instructor Courses";
  }, []);

  if (!courses) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      <DashboardHeader
        title={"Courses"}
        description={"Your courses"}
        role="instructor"
      />

      <div className="px-4 py-5 sm:px-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses or instructors..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <div
                key={course?.courseId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link to={`/course-preview/${course.courseId}`}>
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
                      <div>
                        {course.status === "published" ? (
                          <span
                            className="bg-black mx-2 text-white rounded-full px-7 py-2 cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              setDetailCourseStats({
                                courseId: course.courseId,
                                title: course.title,
                                description: course.description,
                              });
                            }}
                          >
                            Detail Stats
                          </span>
                        ) : (
                          ""
                        )}
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
                      </div>
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
            ))
          ) : (
            <div className="text-center text-gray-500">No courses found</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorCourses;
