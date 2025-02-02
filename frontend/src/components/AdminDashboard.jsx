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
} from "lucide-react";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses] = useState([
    { id: 1, title: "React Fundamentals", status: "Published", students: 120 },
    {
      id: 2,
      title: "Advanced JavaScript",
      status: "Under Review",
      students: 85,
    },
    { id: 3, title: "UI/UX Design Basics", status: "Draft", students: 0 },
  ]);

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
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center bg-gray-100 rounded-lg w-64">
              <Search className="w-5 h-5 ml-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 bg-transparent focus:outline-none"
              />
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <div className="ml-4 w-8 h-8 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 overflow-auto h-[calc(100vh-4rem)]">
          {activeTab === "courses" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Course Management
                </h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add New Course
                </button>
              </div>

              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Course Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Students
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {course.title}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              course.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : course.status === "Under Review"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {course.students}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-5 h-5 inline" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-5 h-5 inline" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash className="w-5 h-5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Background Image
                      </label>
                      <div className="mt-1 flex items-center">
                        <span className="inline-block h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                          <svg
                            className="h-full w-full text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </span>
                        <button className="ml-4 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Change
                        </button>
                      </div>
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
    </div>
  );
}

export default AdminDashboard;
