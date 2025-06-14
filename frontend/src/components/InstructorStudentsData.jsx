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
import { commentApi, LoadingSpinner } from "./CommentSystem";
import StudentProgress from "./StudentProgress";

function InstructorStudentsData() {
  const [studentsData, setStudentsData] = useState({
    currentLearner: 0,
    completedCourseStudents: 0,
    totalLearner: 0,
    completedCourseWithCertificate: 0,
    notStartingLearning: 0,
  });

  const [studentsProgress, setStudentsProgress] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("all");

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const courses = await commentApi.fetchInstructorCourses();
        setCourses(courses);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error("Failed to load courses. Please try again.");
        setLoading(false);
      }
    };

    fetchCourses();
    document.title = "Instructor Students Data";
  }, []);

  // Fetch student data when selectedCourse changes
  useEffect(() => {
    async function fetchStudentsData() {
      try {
        setDataLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}instructor/students-details`,
          { withCredentials: true, params: { courseId: selectedCourse } }
        );
        setStudentsData(res.data.studentsData);
        setStudentsProgress(res.data.studentsProgress || []);
        setDataLoading(false);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Please try again later");
        setDataLoading(false);
      }
    }

    if (!loading) {
      // Only fetch student data after courses are loaded
      fetchStudentsData();
    }
  }, [selectedCourse, loading]);

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

  if (loading) {
    return (
      <div className="col-span-3 flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      <DashboardHeader
        title={"Students Overview"}
        description={"Students data overview"}
        role="instructor"
      />

      <div className="px-4 py-5 sm:px-6">
        <select
          className="w-1/4 p-2 border rounded-lg mb-3"
          onChange={(e) => setSelectedCourse(e.target.value)}
          value={selectedCourse}
          disabled={dataLoading}
        >
          <option value="all">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.courseId}>
              {course.title}
            </option>
          ))}
        </select>

        {dataLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {statsCards.map((stat, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-semibold mt-1">
                        {stat.value}
                      </p>
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
                      name="Students"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {selectedCourse !== "all" && studentsProgress.length > 0 && (
              <div className="bg-white p-6 rounded-lg border shadow-sm mt-8">
                <h2 className="text-lg font-semibold mb-4">
                  Students Progress
                </h2>
                <StudentProgress studentProgressData={studentsProgress} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default InstructorStudentsData;
