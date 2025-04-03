import axios from "axios";
import {
  AlertCircle,
  Award,
  BookMarked,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  PlayCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDate } from "../utils/formatDate";
import { LoadingSpinner } from "./CommentSystem";
import DashboardHeader from "./DashboardHeader";

function StudentProgress({ isAdmin, username }) {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});

  useEffect(() => {
    async function getCourseProgress() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}student/progress/${
            isAdmin ? username : "me"
          }`,
          {
            withCredentials: true,
          }
        );
        setProgressData(res.data.data);
        const initialExpandedState = {};
        res.data.data.forEach((course, index) => {
          initialExpandedState[index] = false;
        });
        setExpandedCourses(initialExpandedState);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to get course progress. Please try again later"
        );
      } finally {
        setLoading(false);
      }
    }
    getCourseProgress();
  }, []);

  const toggleCourseExpand = (index) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!progressData || progressData.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg shadow">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          No progress data found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          We couldn't find any course progress information.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {!isAdmin && (
        <DashboardHeader
          title={"My Course Progress"}
          description={"Track your progress across all courses"}
        />
      )}

      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {progressData.map((course, courseIndex) => (
            <div
              key={courseIndex}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleCourseExpand(courseIndex)}
              >
                <div className="flex items-center">
                  <BookMarked className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {course.course
                        ? `Course: ${course.course.title}`
                        : "Course Details"}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 text-right">
                    <span className="text-sm text-gray-500">Progress</span>
                    <div className="text-base font-medium text-indigo-600">
                      {course.overallProgress}%
                    </div>
                  </div>
                  {expandedCourses[courseIndex] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedCourses[courseIndex] && (
                <div className="p-4">
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${course.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-6 bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Started On</p>
                        <p className="text-sm font-medium">
                          {formatDate(course.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="text-sm font-medium">
                          {formatDate(course.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">
                          Final Quiz Status
                        </p>
                        <div className="flex items-center">
                          {course.isCourseFinalQuizPassed ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              <p className="text-sm font-medium text-green-600">
                                Passed
                              </p>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                              <p className="text-sm font-medium text-orange-600">
                                Not Passed Yet
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Lecture Progress
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.lectureProgress &&
                      course.lectureProgress.map((lecture, lectureIndex) => (
                        <div
                          key={lectureIndex}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start">
                            <div
                              className={`p-2 rounded-lg ${
                                lecture.isCompleted
                                  ? "bg-green-100"
                                  : "bg-gray-100"
                              } mr-3`}
                            >
                              {lecture.isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">
                                Lecture {lectureIndex + 1}
                              </h5>
                              <p className="text-sm text-gray-500">
                                {lecture.lecture
                                  ? lecture.lecture.title
                                  : "No ID"}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <div
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    lecture.isUnlocked
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {lecture.isUnlocked ? "Unlocked" : "Locked"}
                                </div>

                                <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                  Quiz Attempts:{" "}
                                  {lecture.quizAttempts
                                    ? lecture.quizAttempts.length
                                    : 0}
                                </div>
                              </div>

                              <div className="mt-2">
                                <div className="flex items-center text-xs">
                                  <span className="text-gray-500">Status:</span>
                                  <span
                                    className={`ml-1 font-medium ${
                                      lecture.isCompleted
                                        ? "text-green-600"
                                        : "text-orange-600"
                                    }`}
                                  >
                                    {lecture.isCompleted
                                      ? "Completed"
                                      : "In Progress"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentProgress;
