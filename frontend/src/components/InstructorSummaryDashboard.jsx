import axios from "axios";
import { BookOpen, IndianRupee, Star, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
import DashboardHeader from "./DashboardHeader";
import { LoadingSpinner } from "./CommentSystem";

function InstructorSummaryDashboard({ isAdmin, username }) {
  const [courses, setCourses] = useState(null);
  const [instructorStats, setInstructorStats] = useState(null);
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
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}instructor/dashboard/${
            isAdmin ? username : "me"
          } `,
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

  if (!courses || !instructorStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner/>
      </div>
    );
  }
  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      {!isAdmin && (
        <DashboardHeader
          title={"Dashboard"}
          description={"Your instructor dashboard"}
          role="instructor"
        />
      )}
      <div className="px-4 py-5 sm:px-6 space-y-6">
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
                    onClick={() =>
                      navigate(`/course-preview/${course.courseId}`)
                    }
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
    </div>
  );
}

export default InstructorSummaryDashboard;
