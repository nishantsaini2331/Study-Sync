import {
  BookOpen,
  ChevronRight,
  GitPullRequest,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Plus,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UpdateProfile from "../pages/UpdateProfile";
import DetailCourseStats from "./DetailCourseStats";
import InstructorCommentDashboard from "./InstructorCommentDashboard";
import InstructorCourses from "./InstructorCourses";
import InstructorStudentsData from "./InstructorStudentsData";
import InstructorSummaryDashboard from "./InstructorSummaryDashboard";
import Request from "./Request";
import ChangePassword from "./ChangePassword";
import RequestModal from "./RequestModal";
import { RequestType } from "../utils/requestTypes";
import toast from "react-hot-toast";
import axios from "axios";

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [detailCourseStats, setDetailCourseStats] = useState(null);
  const [isInstructorCreateCourse, setIsInstructorCreateCourse] =
    useState(false);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState(null);

  function openRequestModal(type) {
    setRequestType(type);
    setIsModalOpen(true);
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    {
      id: "my-requests",
      label: "My Requests",
      icon: GitPullRequest,
    },
    // {
    //   id: "student-requests",
    //   label: "Student Requests",
    //   icon: GitPullRequestArrow,
    // },
    // { id: "payments", label: "Payments", icon: DollarSign },
    // { id: "reviews", label: "Reviews", icon: Star },
    { id: "comments", label: "Comments", icon: MessageCircle },
    // { id: "settings", label: "Settings", icon: Settings },
    { id: "profile", label: "Profile", icon: User },

    { id: "change-password", label: "Change Password", icon: Lock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <InstructorSummaryDashboard />;
      case "courses":
        return (
          <div className="text-xl">
            {detailCourseStats ? (
              <DetailCourseStats detailCourseStats={detailCourseStats} setDetailCourseStats={setDetailCourseStats} />
            ) : (
              <InstructorCourses setDetailCourseStats={setDetailCourseStats} />
            )}
          </div>
        );
      case "students":
        return (
          <div className="text-xl">
            <InstructorStudentsData />
          </div>
        );
      case "payments":
        return <div className="text-xl">Payments Content</div>;
      case "reviews":
        return <div className="text-xl">Reviews Content</div>;
      case "settings":
        return <div className="text-xl">Settings Content</div>;
      case "profile":
        return (
          <div className="text-xl">
            <UpdateProfile role={"instructor"} />
          </div>
        );

      case "comments":
        return <InstructorCommentDashboard />;
      case "my-requests":
        return (
          <div className="text-xl">
            <Request role={"instructor"} />
          </div>
        );
      case "student-requests":
        return (
          <div className="text-xl">
            <Request />
          </div>
        );
      case "change-password":
        return <ChangePassword role={"instructor"} />;
      default:
        return <div className="text-xl">Dashboard Content</div>;
    }
  };

  useEffect(() => {
    async function checkForInstructorCourseCreation() {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }instructor/can-instructor-create-course`,
          { withCredentials: true }
        );
        if (res.data.canCreateCourse) {
          setIsInstructorCreateCourse(true);
        } else {
          setIsInstructorCreateCourse(false);
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message || "Failed to check course limit"
        );
      }
    }
    checkForInstructorCourseCreation();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Instructor Panel</h1>
        </div>
        <nav className="py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div>
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === "courses") {
                      setDetailCourseStats(null);
                    }
                  }}
                  className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {activeTab === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
                <div className="border-t border-gray-200 my-1"></div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-700"
            >
              Switch to Student
            </button>

            {!isInstructorCreateCourse ? (
              <>
                <button
                  onClick={() =>
                    openRequestModal(RequestType.INCREASE_COURSE_CREATE_LIMIT)
                  }
                  className="flex-1 md:flex-none w-full md:w-auto flex items-center justify-center px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" /> Request Create Course
                </button>
                <RequestModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  requestType={requestType}
                  entityType="User"
                />
              </>
            ) : (
              <button
                onClick={() => navigate("/create-course")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Course
              </button>
            )}
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default InstructorDashboard;
