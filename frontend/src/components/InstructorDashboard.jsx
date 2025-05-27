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
  Menu,
  X,
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
  const [isInstructorCreateCourse, setIsInstructorCreateCourse] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    { id: "comments", label: "Comments", icon: MessageCircle },
    { id: "profile", label: "Profile", icon: User },
    { id: "change-password", label: "Change Password", icon: Lock },
  ];

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event) {
      if (isSidebarOpen && !event.target.closest('.sidebar-container') && !event.target.closest('.mobile-menu-toggle')) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "courses") {
      setDetailCourseStats(null);
    }
    // Close sidebar on mobile after selecting a tab
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const getCurrentTabLabel = () => {
    const currentTab = sidebarItems.find(item => item.id === activeTab);
    return currentTab ? currentTab.label : "Dashboard";
  };

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
    <div className="flex h-[calc(100vh-70px)] bg-gray-50 overflow-hidden">
      {/* Mobile Menu Toggle Button */}
      <button
        className="mobile-menu-toggle lg:hidden fixed top-20 left-4 z-50 bg-white shadow-md rounded-md p-2 text-gray-600 hover:text-blue-600"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container bg-white shadow-md transition-all duration-300 z-40 ${
        isSidebarOpen 
          ? 'fixed left-0 top-[70px] h-[calc(100vh-70px)] w-64 lg:relative lg:translate-x-0' 
          : 'fixed -translate-x-full lg:relative lg:translate-x-0 lg:w-64 w-64'
      }`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Instructor Panel</h1>
        </div>
        <nav className="py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-2 p-3 mx-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="truncate">{item.label}</span>
                  {activeTab === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
                  )}
                </button>
                <div className="border-t border-gray-200 my-1 mx-2"></div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header showing current tab */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 pl-16">
          <h2 className="text-lg font-semibold text-gray-800">{getCurrentTabLabel()}</h2>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Action Bar */}
          <div className="bg-white border-b border-gray-200 p-4 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-700 text-sm lg:text-base"
              >
                Switch to Student
              </button>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {!isInstructorCreateCourse ? (
                  <>
                    <button
                      onClick={() =>
                        openRequestModal(RequestType.INCREASE_COURSE_CREATE_LIMIT)
                      }
                      className="flex items-center justify-center px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200 whitespace-nowrap"
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    Create Course
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;