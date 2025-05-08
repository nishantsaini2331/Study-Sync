import axios from "axios";
import {
  BookOpen,
  ChevronRight,
  GitPullRequest,
  IndianRupee,
  LayoutDashboard,
  Lock,
  LucideHome,
  Tag,
  User,
  Users,
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
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import UpdateProfile from "../pages/UpdateProfile";
import Category from "./Category";
import CoursesForReview from "./CoursesForReview";
import DashboardHeader from "./DashboardHeader";
import DetailUserProfile from "./DetailUserProfile";
import Request from "./Request";
import UsersAdminDashboard from "./UsersAdminDashboard";
import ChangePassword from "./ChangePassword";
import HomePageManagement from "./HomepageManagement";

const AdminDetailDash = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [detailUser, setDetailUser] = useState(null);
  const navigate = useNavigate();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Courses for Review", icon: BookOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "requests", label: "Requests", icon: GitPullRequest },
    // { id: "settings", label: "Settings", icon: Settings },
    { id: "profile", label: "Profile", icon: User },
    { id: "change-password", label: "Change Password", icon: Lock },
    { id: "homePage", label: "Home Page", icon: LucideHome },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }admin/dashboard?timeFilter=${timeFilter}`,
        { withCredentials: true }
      );
      setDashboardData(res.data);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }

  function renderDashboardContent() {
    return (
      <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
        <DashboardHeader
          title={"Admin Dashboard"}
          description={"Platform overview and analytics"}
          role="admin"
        />

        <div className="px-6 pt-4 flex justify-end">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="all">All Time</option>
            <option value="30days">30 days</option>
            <option value="90days">90 days</option>
            <option value="365days">365 days</option>
          </select>
        </div>

        <div className="px-4 py-5 sm:px-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Total Courses",
                value: dashboardData?.platformSummary?.totalCourses || 0,
                color: "text-blue-600",
                icon: BookOpen,
              },
              {
                label: "Total Students",
                value: dashboardData?.platformSummary?.totalStudents || 0,
                color: "text-green-600",
                icon: Users,
              },
              {
                label: "Total Instructors",
                value: dashboardData?.platformSummary?.totalInstructors || 0,
                color: "text-purple-600",
                icon: User,
              },
              {
                label: "Platform Revenue",
                value: `₹ ${
                  dashboardData?.platformSummary?.platformRevenue || 0
                }`,
                color: "text-orange-600",
                icon: IndianRupee,
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
                  <AreaChart data={dashboardData?.monthlyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Total Revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="platformRevenue"
                      name="Platform Revenue"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Monthly Enrollments
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData?.monthlyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="enrollments"
                      fill="#82ca9d"
                      name="Enrollments"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Course Status Distribution
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={dashboardData?.courseStatusData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData?.courseStatusData?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {dashboardData?.courseStatusData?.map((entry, index) => (
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold mb-4">
                  Category Performance
                </h3>
                <button
                  onClick={() => setActiveTab("categories")}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData?.categoryPerformance || []}
                    layout="vertical"
                    margin={{ left: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="enrollments"
                      fill="#8884d8"
                      name="Enrollments"
                    />
                    <Bar dataKey="courseCount" fill="#82ca9d" name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold mb-4">
                  Top Performing Courses
                </h3>
                <button
                  onClick={() => setActiveTab("courses")}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData?.topCourses?.slice(0, 3).map((course) => (
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
                      <p className="text-sm text-gray-500">
                        {course.instructorName} • {course.categoryName}
                      </p>
                      <div className="flex items-center text-sm mt-1">
                        <span className="text-green-600 font-medium mr-3">
                          ₹{course.revenue}
                        </span>
                        <span className="text-gray-600">
                          {course.enrollmentCount} enrollments
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/admin/verify-course/${course.courseId}`)
                      }
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold mb-4">Top Instructors</h3>
                <button
                  onClick={() => setActiveTab("users")}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData?.topInstructors
                  ?.slice(0, 3)
                  .map((instructor) => (
                    <div
                      key={instructor.instructorId}
                      className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {instructor.photoUrl ? (
                          <img
                            src={instructor.photoUrl}
                            className="h-full rounded-full"
                            alt=""
                          />
                        ) : (
                          <User className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{instructor.name}</h4>
                        <p className="text-sm text-gray-500">
                          {instructor.email}
                        </p>
                        <div className="flex items-center text-sm mt-1">
                          <span className="text-green-600 font-medium mr-3">
                            ₹{instructor.instructorRevenue}
                          </span>
                          <span className="text-gray-600">
                            {instructor.courseCount} courses •{" "}
                            {instructor.enrollments} students
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDetailUser(instructor.username);
                          setActiveTab("users");
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="text-gray-500 text-sm font-medium">
                  Total Revenue
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{dashboardData?.financialMetrics?.totalRevenue || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="text-gray-500 text-sm font-medium">
                  Platform Revenue
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  ₹{dashboardData?.financialMetrics?.platformRevenue || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="text-gray-500 text-sm font-medium">
                  Instructor Payouts
                </h4>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{dashboardData?.financialMetrics?.instructorRevenue || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "courses":
        return <CoursesForReview />;
      case "users":
        return detailUser ? (
          <DetailUserProfile
            detailUser={detailUser}
            setDetailUser={setDetailUser}
          />
        ) : (
          <UsersAdminDashboard setDetailUser={setDetailUser} />
        );
      case "categories":
        return <Category />;
      case "requests":
        return <Request role={"admin"} />;
      case "settings":
        return <h1>Admin Settings</h1>;
      case "profile":
        return <UpdateProfile role="admin" />;
      case "change-password":
        return <ChangePassword role={"admin"} />;
      case "homePage":
        return <HomePageManagement role={"admin"} />;
      default:
        return renderDashboardContent();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setDetailUser(null);
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

      <div className="flex-1 p-8 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

export default AdminDetailDash;
