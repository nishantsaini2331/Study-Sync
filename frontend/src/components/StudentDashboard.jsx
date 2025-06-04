import axios from "axios";
import {
  ChevronRight,
  DollarSign,
  FileText,
  LayoutDashboard,
  Lock,
  Paperclip,
  PartyPopper,
  ShoppingCart,
  TrendingUp,
  User,
  Menu,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import StudentEnrolledCourses from "./StudentEnrolledCourses";
import UpdateProfile from "../pages/UpdateProfile";
import StudentCartCourses from "./StudentCartCourses";
import StudentCourseCertificates from "./StudentCourseCertificates";
import StudentPaymentDetails from "./StudentPaymentDetails";
import StudentProgress from "./StudentProgress";
import ChangePassword from "./ChangePassword";
import { LoadingSpinner } from "./CommentSystem";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("enrolled-courses");
  const [enrolledCourses, setEnrolledCourses] = useState(null);
  const [instructorStats, setInstructorStats] = useState(null);
  const [detailCourseStats, setDetailCourseStats] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarItems = [
    {
      id: "enrolled-courses",
      label: "Enrolled Courses",
      icon: LayoutDashboard,
    },
    { id: "cart-courses", label: "Cart Courses", icon: ShoppingCart },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "payments-detail", label: "Payments Details", icon: DollarSign },
    { id: "profile", label: "Profile", icon: User },
    { id: "certficates", label: "Certificates", icon: FileText },
    { id: "change-password", label: "Change Password", icon: Lock },
  ];

  useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}student/enrolled-course`,
          { withCredentials: true }
        );
        setEnrolledCourses(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message || "Please try again later");
      }
    }
    fetchEnrolledCourses();
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isSidebarOpen &&
        !event.target.closest(".sidebar-container") &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after selecting a tab
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const getCurrentTabLabel = () => {
    const currentTab = sidebarItems.find((item) => item.id === activeTab);
    return currentTab ? currentTab.label : "Dashboard";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "enrolled-courses":
        return <StudentEnrolledCourses enrolledCourses={enrolledCourses} />;
      case "cart-courses":
        return <StudentCartCourses />;
      case "progress":
        return <StudentProgress />;
      case "payments-detail":
        return <StudentPaymentDetails />;
      case "profile":
        return <UpdateProfile />;
      case "settings":
        return <div className="text-xl">Settings Content</div>;
      case "certficates":
        return <StudentCourseCertificates />;
      case "change-password":
        return <ChangePassword role={"student"} />;
      default:
        return <div className="text-xl">Enrolled Course</div>;
    }
  };

  if (!enrolledCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-70px)] overflow-hidden bg-gray-50">
      {/* Mobile Menu Toggle Button */}
      <button
        className="mobile-menu-toggle lg:hidden fixed top-20 left-4 z-50 bg-white shadow-md rounded-md p-2 text-gray-600 hover:text-blue-600"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container bg-white shadow-md transition-all duration-300 z-40 ${
          isSidebarOpen
            ? "fixed left-0 top-[70px] h-[calc(100vh-70px)] w-64 lg:relative lg:translate-x-0"
            : "fixed -translate-x-full lg:relative lg:translate-x-0 lg:w-64 w-64"
        }`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
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
          <h2 className="text-lg font-semibold text-gray-800">
            {getCurrentTabLabel()}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
