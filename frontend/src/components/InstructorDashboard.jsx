import axios from "axios";
import {
  BookOpen,
  ChevronRight,
  DollarSign,
  IndianRupee,
  LayoutDashboard,
  Plus,
  Settings,
  Star,
  User,
  Users,
  Users2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import InstructorCourses from "./InstructorCourses";
import InstructorStudentsData from "./InstructorStudentsData";
import UpdateProfile from "../pages/UpdateProfile";
import DetailCourseStats from "./DetailCourseStats";

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState(null);
  const [instructorStats, setInstructorStats] = useState(null);
  const [detailCourseStats, setDetailCourseStats] = useState(null);
  const navigate = useNavigate();

  const [revenueData, setRevenueData] = useState([
    { month: "Jan", revenue: 2400 },
    { month: "Feb", revenue: 3600 },
    { month: "Mar", revenue: 600 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 3800 },
  ]);

  const [studentsEnrollments, setStudentsEnrollments] = useState([
    { month: "Jan", enrollments: 1 },
    { month: "Feb", enrollments: 2 },
    { month: "Mar", enrollments: 3 },
    { month: "Apr", enrollments: 4 },
    { month: "May", enrollments: 5 },
  ]);

  const [courseStatusData, setCourseStatusData] = useState([
    { name: "published", value: 5 },
    { name: "draft", value: 2 },
    { name: "pending", value: 1 },
    { name: "rejected", value: 1 },
  ]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "reviews", label: "Reviews", icon: Star },
    // { id: "settings", label: "Settings", icon: Settings },
    { id: "profile", label: "Profile", icon: User },
  ];

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}instructor/dashboard`,
          { withCredentials: true }
        );
        setCourses(res.data.courses);
        setInstructorStats(res.data.instructor);
        setCourseStatusData(res.data.dashboardStats.courseStatusData);
        setRevenueData(res.data.dashboardStats.monthlyRevenue);
        setStudentsEnrollments(res.data.dashboardStats.monthlyEnrollments);
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message || "Please try again later");
      }
    }
    fetchCourses();
  }, []);

  const renderDashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Courses",
            value: instructorStats?.totalCourses || 0,
            color: "text-blue-600",
            icon: BookOpen,
          },
          {
            label: "Active Students",
            value: instructorStats?.totalStudents || 0,
            color: "text-green-600",
            icon: Users2,
          },
          {
            label: "Total Revenue",
            value: `₹ ${instructorStats?.totalEarnings || 0}`,
            color: "text-purple-600",
            icon: IndianRupee,
          },
          {
            label: "Average Course Rating",
            value: `${instructorStats?.averageRating || "N/A"} ★`,
            color: "text-orange-600",
            icon: Star,
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  {stat.label}
                </h3>
                <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Students Enrollments</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsEnrollments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#82ca9d" name="Enrollments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Course Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {courseStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className=" flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">Recent Courses</h3>
            <button
              onClick={() => setActiveTab("courses")}
              className="text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {courses?.slice(0, 3).map((course) => (
              <div
                key={course.courseId}
                className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{course.title}</h4>
                  <p className="text-sm text-gray-500">{course.status}</p>
                </div>
                <button
                  onClick={() => navigate(`/course-preview/${course.courseId}`)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "courses":
        return (
          <div className="text-xl">
            {detailCourseStats ? (
              <DetailCourseStats detailCourseStats={detailCourseStats} />
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
            <UpdateProfile />
          </div>
        );
      default:
        return <div className="text-xl">Dashboard Content</div>;
    }
  };

  if (!courses || !instructorStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
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

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {sidebarItems.find((item) => item.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-700"
            >
              Switch to Student
            </button>
            <button
              onClick={() => navigate("/create-course")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </button>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default InstructorDashboard;
