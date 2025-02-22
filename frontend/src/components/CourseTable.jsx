import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  XCircle,
  Search,
  Clock,
  Filter,
} from "lucide-react";
import React, { useState } from "react";
import { formatDate } from "../utils/formatDate";
import { Link } from "react-router-dom";

function CourseTable({ courses, handleAction }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");

  const filteredCourses = courses
    .filter(
      (course) =>
        course.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((course) =>
      statusFilter === "all" ? true : course.status === statusFilter
    )
    .sort((a, b) => {
      const dateA = new Date(a.submittedAt);
      const dateB = new Date(b.submittedAt);
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Course Management</h2>
      </div>

      {/* Filters */}
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "desc" ? "asc" : "desc"
                    )
                  }
                >
                  <div className="flex items-center gap-1">
                    Submitted At
                    {sortDirection === "desc" ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {course.course.title}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {course.course.description.slice(0, 50)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {course.instructor.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {course.course.category.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(course.status)}
                      <span className="text-sm capitalize">
                        {course.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {/* {new Date(course.submittedAt).toLocaleDateString()} */}
                    {formatDate(course.submittedAt)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/admin/verify-course/${course.course.courseId}`}>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() =>
                          console.log(
                            `Reviewing course ${course.course.courseId}`
                          )
                        }
                      >
                        <Eye className="w-5 h-5 inline" />
                      </button>
                    </Link>
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() =>
                        handleAction("approved", course.course.courseId)
                      }
                    >
                      <CheckCircle className="w-5 h-5 inline" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() =>
                        handleAction("rejected", course.course.courseId)
                      }
                    >
                      <XCircle className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CourseTable;
