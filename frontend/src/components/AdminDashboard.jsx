import React, { useState } from "react";
import CourseTable from "./CourseTable";
import HomepageManagement from "./HomepageManagement";
import AdminDashboardSidebar from "./AdminDashboardSidebar";
import CourseVerifyModal from "./CourseVerifyModal";
import Category from "./Category";

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

  const [actionModal, setActionModal] = useState({
    type: null,
    isOpen: false,
    courseId: null,
  });

  const [comment, setComment] = useState("");

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
      <AdminDashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1 overflow-hidden">
        <main className="p-6 overflow-auto h-[calc(100vh-4rem)]">
          {activeTab === "courses" && (
            <CourseTable courses={courses} handleAction={handleAction} />
          )}
          {activeTab === "homepage" && <HomepageManagement courses={courses} />}
          {activeTab === "users" && <div>Users</div>}
          {activeTab === "settings" && <div>Settings</div>}
          {activeTab === "dashboard" && <div>Dashboard</div>}
          {activeTab === "category" && <Category />}
        </main>
      </div>

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

export default AdminDashboard;