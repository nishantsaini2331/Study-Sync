import React from "react";

const InstructorDashboard = () => {
  const courses = [
    {
      id: 1,
      title: "React for Beginners",
      students: 150,
      status: "Published",
    },
    {
      id: 2,
      title: "Advanced Node.js",
      students: 85,
      status: "Draft",
    },
    {
      id: 3,
      title: "Mastering JavaScript",
      students: 220,
      status: "Published",
    },
  ];

  const handleCreateCourse = () => {
    alert("Redirecting to course creation page...");
  };

  const handleEditCourse = (id) => {
    alert(`Editing course with ID: ${id}`);
  };

  const handleDeleteCourse = (id) => {
    alert(`Deleting course with ID: ${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-500 text-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
        <button
          onClick={handleCreateCourse}
          className="bg-white text-blue-500 py-2 px-4 rounded-md shadow hover:bg-gray-200 transition"
        >
          + Create New Course
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-600">Total Courses</h2>
          <p className="text-2xl font-bold text-blue-500">12</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-600">Active Courses</h2>
          <p className="text-2xl font-bold text-green-500">8</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-600">Enrolled Students</h2>
          <p className="text-2xl font-bold text-purple-500">450</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-600">Pending Reviews</h2>
          <p className="text-2xl font-bold text-red-500">4</p>
        </div>
      </div>

      {/* Manage Courses Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-600 mb-4">
          Manage Your Courses
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 border border-gray-200 text-left">
                  Course Title
                </th>
                <th className="p-4 border border-gray-200 text-left">
                  Students
                </th>
                <th className="p-4 border border-gray-200 text-left">Status</th>
                <th className="p-4 border border-gray-200 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="p-4 border border-gray-200">{course.title}</td>
                  <td className="p-4 border border-gray-200">
                    {course.students}
                  </td>
                  <td className="p-4 border border-gray-200">
                    <span
                      className={`px-2 py-1 text-sm font-semibold rounded ${
                        course.status === "Published"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 text-center">
                    <button
                      onClick={() => handleEditCourse(course.id)}
                      className="text-blue-500 hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
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
};

export default InstructorDashboard;
