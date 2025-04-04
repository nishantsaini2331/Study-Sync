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

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("enrolled-courses");
  const [enrolledCourses, setEnrolledCourses] = useState(null);
  const [instructorStats, setInstructorStats] = useState(null);
  const [detailCourseStats, setDetailCourseStats] = useState(null);
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
    // { id: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}student/enrolled-course`,
          { withCredentials: true }
        );
        setEnrolledCourses(res.data.data);
        //   setCourses(res.data.courses);
        //   setInstructorStats(res.data.instructor);
        //   setCourseStatusData(res.data.dashboardStats.courseStatusData);
        //   setRevenueData(res.data.dashboardStats.monthlyRevenue);
        //   setStudentsEnrollments(res.data.dashboardStats.monthlyEnrollments);
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message || "Please try again later");
      }
    }
    fetchEnrolledCourses();
  }, []);

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
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-70px)] overflow-hidden bg-gray-50">
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
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

      <div className="flex-1  p-8 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}

export default StudentDashboard;
