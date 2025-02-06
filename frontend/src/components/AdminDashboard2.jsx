import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Home,
  Users,
  Settings,
  Bell,
  Search,
  Edit,
  Trash,
  Eye,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "React Fundamentals",
      instructor: "John Doe",
      status: "pending",
      category: "Programming",
      createdAt: "2024-02-06",
      description: "Learn the basics of React development",
      students: 120,
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      instructor: "Jane Smith",
      status: "approved",
      category: "Programming",
      createdAt: "2024-02-05",
      description: "Master advanced JavaScript concepts",
      students: 85,
    },
    {
      id: 3,
      title: "UI/UX Design Basics",
      instructor: "Alice Johnson",
      status: "rejected",
      category: "Design",
      createdAt: "2024-02-04",
      description: "Introduction to UI/UX design principles",
      students: 0,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [actionModal, setActionModal] = useState({
    type: null,
    isOpen: false,
    courseId: null,
  });
  const [comment, setComment] = useState("");

  const filteredCourses = courses
    .filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((course) =>
      statusFilter === "all" ? true : course.status === statusFilter
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
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

  const handleAction = (type, courseId) => {
    setActionModal({ type, isOpen: true, courseId });
    setComment("");
  };

  const handleSubmitAction = () => {
    setCourses(
      courses.map((course) =>
        course.id === actionModal.courseId
          ? { ...course, status: actionModal.type }
          : course
      )
    );
    setActionModal({ type: null, isOpen: false, courseId: null });
    setComment("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
        </div>
        <nav className="mt-4">
          <a
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center p-4 text-gray-700 hover:bg-gray-50 cursor-pointer ${
              activeTab === "dashboard" ? "bg-gray-50" : ""
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </a>
          <a
            onClick={() => setActiveTab("courses")}
            className={`flex items-center p-4 text-gray-700 hover:bg-gray-50 cursor-pointer ${
              activeTab === "courses" ? "bg-gray-50" : ""
            }`}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Courses
          </a>
          <a
            onClick={() => setActiveTab("homepage")}
            className={`flex items-center p-4 text-gray-700 hover:bg-gray-50 cursor-pointer ${
              activeTab === "homepage" ? "bg-gray-50" : ""
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Homepage
          </a>
          <a
            onClick={() => setActiveTab("users")}
            className={`flex items-center p-4 text-gray-700 hover:bg-gray-50 cursor-pointer ${
              activeTab === "users" ? "bg-gray-50" : ""
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Users
          </a>
          <a
            onClick={() => setActiveTab("settings")}
            className={`flex items-center p-4 text-gray-700 hover:bg-gray-50 cursor-pointer ${
              activeTab === "settings" ? "bg-gray-50" : ""
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="p-6 overflow-auto h-[calc(100vh-4rem)]">
          {activeTab === "courses" && (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Course Management
                </h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add New Course
                </button>
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
                          Course Details
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
                            Date
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
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {course.instructor}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {course.category}
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
                            {new Date(course.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() =>
                                console.log(`Reviewing course ${course.id}`)
                              }
                            >
                              <Eye className="w-5 h-5 inline" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={() =>
                                handleAction("approved", course.id)
                              }
                            >
                              <CheckCircle className="w-5 h-5 inline" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() =>
                                handleAction("rejected", course.id)
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
          )}

          {/* Homepage Management Tab */}
          {activeTab === "homepage" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Homepage Management
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Hero Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Heading
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter hero heading"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Subheading
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter hero subheading"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Featured Courses</h3>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between"
                      >
                        <span>{course.title}</span>
                        <input
                          type="checkbox"
                          className="rounded text-blue-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() =>
          setActionModal({ type: null, isOpen: false, courseId: null })
        }
        title={
          actionModal.type === "approved" ? "Approve Course" : "Reject Course"
        }
      >
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {actionModal.type === "approved"
                ? "Additional Comments (Optional)"
                : "Rejection Reason"}
            </label>
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
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={() =>
                setActionModal({ type: null, isOpen: false, courseId: null })
              }
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 text-sm text-white rounded-md ${
                actionModal.type === "approved"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={handleSubmitAction}
              disabled={actionModal.type === "rejected" && !comment.trim()}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
