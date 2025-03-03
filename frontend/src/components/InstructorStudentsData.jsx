import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Users, GraduationCap, UserCheck, BookOpen, UserX } from "lucide-react";
import DashboardHeader from "./DashboardHeader";

function InstructorStudentsData() {
  const [studentsData, setStudentsData] = useState({
    currentLearner: 0,
    completedCourseStudents: 0,
    totalLearner: 0,
    completedCourseWithCertificate: 0,
    notStartingLearning: 0,
  });

  useEffect(() => {
    async function fetchStudentsData() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}instructor/students-details`,
          { withCredentials: true }
        );
        setStudentsData(res.data.studentsData);
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message || "Please try again later");
      }
    }
    fetchStudentsData();
    document.title = "Instructor Students Data";
  }, []);

  const statsCards = [
    {
      title: "Total Learners",
      value: studentsData.totalLearner,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Current Learners",
      value: studentsData.currentLearner,
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Completed Courses",
      value: studentsData.completedCourseStudents,
      icon: GraduationCap,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "With Certificate",
      value: studentsData.completedCourseWithCertificate,
      icon: UserCheck,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Not Started",
      value: studentsData.notStartingLearning,
      icon: UserX,
      color: "bg-red-100 text-red-600",
    },
  ];
  const chartData = [
    { name: "Current", value: studentsData.currentLearner, fill: "#4F46E5" },
    {
      name: "Completed",
      value: studentsData.completedCourseStudents,
      fill: "#00C49F",
    },
    {
      name: "Certified",
      value: studentsData.completedCourseWithCertificate,
      fill: "#FFBB28",
    },
    {
      name: "Not Started",
      value: studentsData.notStartingLearning,
      fill: "#FF8042",
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      <DashboardHeader
        title={"Students Overview"}
        description={"Students data overview"}
        role="instructor"
      />

      <div className="px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Students Progress Distribution
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  name={"students"}
                  radius={[4, 4, 0, 0]}
                  onClick={(e) => console.log(e.payload)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorStudentsData;
