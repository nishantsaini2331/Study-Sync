import React from "react";

function HomepageManagement({ courses }) {
  return (
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
                key={course._id}
                className="flex items-center justify-between"
              >
                <span>{course.title}</span>
                <input type="checkbox" className="rounded text-blue-600" />
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
  );
}

export default HomepageManagement;
