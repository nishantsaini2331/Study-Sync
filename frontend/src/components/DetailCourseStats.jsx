import axios from "axios";
import {
  BookOpen,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardHeader from "./DashboardHeader";
import StudentProgress from "./StudentProgress";

function DetailCourseStats({ detailCourseStats, setDetailCourseStats }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [studentProgressData, setStudentProgressData] = useState([]);
  console.log(studentProgressData.length);

  const [monthlyEnrollmentData, setMontlyEnrollmentData] = useState([
    { name: "Jan", enrollments: 0 },
    { name: "Feb", enrollments: 3 },
    { name: "Mar", enrollments: 1 },
    { name: "Apr", enrollments: 0 },
  ]);

  const [monthlyRevenueData, setMonthlyRevenueData] = useState([
    { name: "Jan", revenue: 0 },
    { name: "Feb", revenue: 2097.9 },
    { name: "Mar", revenue: 699.3 },
    { name: "Apr", revenue: 0 },
  ]);

  const [lectureStatsData, setLectureStatsData] = useState([
    {
      title: "intro",
      totalViews: 2,
      completionRate: "50.00",
    },
    {
      title: "what is node js",
      totalViews: 2,
      completionRate: "50.00",
    },
    {
      title: "Internals of node js",
      totalViews: 2,
      completionRate: "50.00",
    },
  ]);

  useEffect(() => {
    async function fetchCourseStats() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}instructor/detail-course-stats/${
            detailCourseStats.courseId
          }`,
          { withCredentials: true }
        );
        setStats({
          ...res.data.enrollmentStats,
          totalRevenue: res.data.revenue.totalRevenue,
        });
        setMontlyEnrollmentData(res.data.engagement.monthlyEnrollments);
        setMonthlyRevenueData(res.data.revenue.monthlyRevenue);
        setLectureStatsData(res.data.contentPerformance.lectureStats);
        setStudentProgressData(res.data.studentsProgressData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Please try again later");
        setLoading(false);
      }
    }
    fetchCourseStats();

    document.title = detailCourseStats.title;
  }, [detailCourseStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden w-full">
      <DashboardHeader
        title={detailCourseStats.title}
        description={detailCourseStats.description.slice(0, 100) + "..."}
        role="instructor"
        isShowBtn={true}
        onClick={() => setDetailCourseStats(null)}
      />

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completion Rate</p>
                <h3 className="text-2xl font-bold">{stats.completionRate}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Average Progress</p>
                <h3 className="text-2xl font-bold">{stats.averageProgress}</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold">₹{stats.totalRevenue}</h3>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <DollarSign size={20} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Users size={18} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Monthly Enrollments</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEnrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <DollarSign size={18} className="text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Monthly Revenue</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <BookOpen size={18} className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">
              Course Content Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lecture
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lectureStatsData.map((lecture, index) => (
                  <tr>
                    <td className="py-3 px-4 text-sm">{lecture.title}</td>
                    <td className="py-3 px-4 text-sm">{lecture.totalViews}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${lecture.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm ml-2">
                          {lecture.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {studentProgressData.length > 0 && (
          <div className="bg-white py-2 pl-6 rounded-lg border shadow-sm mt-8">
            <h2 className="text-lg font-semibold mb-4">Students Progress</h2>
            <StudentProgress studentProgressData={studentProgressData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailCourseStats;
