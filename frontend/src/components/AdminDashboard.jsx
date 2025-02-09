import React, { useEffect, useState } from "react";
import CourseTable from "./CourseTable";
import HomepageManagement from "./HomepageManagement";
import AdminDashboardSidebar from "./AdminDashboardSidebar";
import CourseVerifyModal from "./CourseVerifyModal";
import Category from "./Category";
import axios from "axios";
import toast from "react-hot-toast";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
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

  useEffect(() => {
    async function fetchCoursesForReview() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}course-verify`,
          { withCredentials: true }
        );
        console.log(response.data.courseVerifications);
        setCourses(response.data.courseVerifications);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
    }

    fetchCoursesForReview();

    document.title = "Admin Dashboard - Study Sync";
  }, []);

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
