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
import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/formatDate";
import { Link } from "react-router-dom";
import CourseVerifyModal from "./CourseVerifyModal";
import axios from "axios";
import DashboardHeader from "./DashboardHeader";
import toast from "react-hot-toast";

function CoursesForReview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [courses, setCourses] = useState([
    {
      _id: 1,
      course: {
        _id: 1,
        title: "Introduction to Python",
        status: "approved",
        description: "Learn the basics of Python programming",
        category: {
          _id: 1,
          name: "Programming",
        },
      },
      instructor: {
        _id: 1,
        name: "John Doe",
        username: "john123",
      },
      approvedAt: null,
      submittedAt: "2024-02-06",
      comment: "",
      status: "approved",
    },
    {
      _id: 2,
      course: {
        _id: 2,
        title: "Introduction to React",
        status: "approved",
        description: "Learn the basics of React",
        category: {
          _id: 2,
          name: "Web Development",
        },
      },
      instructor: {
        _id: 2,
        name: "Jane Doe",
        username: "jane123",
      },
      approvedAt: null,
      submittedAt: "2024-02-05",
      comment: "",
      status: "approved",
    },
    {
      _id: 3,
      course: {
        _id: 3,
        title: "UI/UX Design Basics",
        status: "rejected",
        description: "Introduction to UI/UX design principles",
        category: {
          _id: 3,
          name: "Design",
        },
      },
      instructor: {
        _id: 3,
        name: "Alice Johnson",
        username: "alice123",
      },
      approvedAt: null,
      submittedAt: "2024-02-04",
      comment: "",
      status: "rejected",
    },
  ]);

  const [actionModal, setActionModal] = useState({
    type: null,
    isOpen: false,
    courseId: null,
  });

  const [comment, setComment] = useState("");

  function handleAction(type, courseId) {
    setActionModal({ type, isOpen: true, courseId });
    setComment("");
  }

  async function handleSubmitAction() {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}course-verify/${
          actionModal.courseId
        }/${actionModal.type}`,
        { comment },
        { withCredentials: true }
      );
      toast.success(response.data.message || "Course approved successfully");
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }

    setCourses(
      courses.map((course) =>
        course.course.courseId === actionModal.courseId
          ? { ...course, status: actionModal.type }
          : course
      )
    );

    setActionModal({ type: null, isOpen: false, courseId: null });

    setComment("");
  }
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
  useEffect(() => {
    async function fetchCoursesForReview() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}course-verify`,
          { withCredentials: true }
        );
        setCourses(response.data.courseVerifications);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
    }

    fetchCoursesForReview();

    document.title = "Courses for Review";
  }, []);
  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      <DashboardHeader
        title={"Courses for Review"}
        description={"Review and manage course submissions from instructors."}
        role="admin"
      />

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
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100"
              onClick={() =>
                setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
              }
            >
              Sort by Date
              {sortDirection === "desc" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="h-48 bg-gray-200 relative">
              <img
                src={course.course.thumbnail || "/api/placeholder/400/320"}
                alt={course.course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center bg-white px-3 py-1 rounded-full shadow">
                {getStatusIcon(course.status)}
                <span className="text-sm capitalize ml-1">{course.status}</span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {course.course.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {course.course.description}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <span className="text-xs text-gray-500 block">
                    Instructor
                  </span>
                  <span className="text-sm font-medium">
                    {course.instructor.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Category</span>
                  <span className="text-sm font-medium">
                    {course.course.category.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">
                    Submitted On
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(course.submittedAt)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <Link to={`/admin/verify-course/${course.course.courseId}`}>
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="View Course"
                    onClick={() =>
                      console.log(`Reviewing course ${course.course.courseId}`)
                    }
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </Link>
                <button
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                  title="Approve Course"
                  onClick={() =>
                    handleAction("approved", course.course.courseId)
                  }
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Reject Course"
                  onClick={() =>
                    handleAction("rejected", course.course.courseId)
                  }
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            No courses match your search criteria.
          </p>
        </div>
      )}

      <CourseVerifyModal
        isOpen={actionModal.isOpen}
        onClose={() =>
          setActionModal({ type: null, isOpen: false, courseId: null })
        }
        title={
          actionModal.type === "approved" ? "Approve Course" : "Reject Course"
        }
      >
        <div className="p-4">
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder={
              actionModal.type === "approved"
                ? "Add any comments or suggestions..."
                : "Please provide a reason for rejection..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required={actionModal.type === "rejected"}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={() =>
                setActionModal({ type: null, isOpen: false, courseId: null })
              }
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleSubmitAction}
            >
              {actionModal.type === "approved" ? "Approve" : "Reject"}
            </button>
          </div>
        </div>
      </CourseVerifyModal>
    </div>
  );
}

export default CoursesForReview;
