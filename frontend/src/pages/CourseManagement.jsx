import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Video, Send, Info } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export async function deleteCourse(id, navigate) {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}course/course/${id}`,
      {
        withCredentials: true,
      }
    );
    toast.success("Course deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete course");
  } finally {
    navigate(-1);
  }
}

async function deleteLecture(lectureId, navigate) {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}lecture/lecture/${lectureId}`,
      {
        withCredentials: true,
      }
    );
    toast.success("Lecture deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete lecture");
  } finally {
    navigate(-1);
  }
}

const CourseManagement = () => {
  // Sample data structure (in real app, this would come from backend)

  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState({
    title: "Introduction to Web Development",
    description:
      "Learn the fundamentals of web development including HTML, CSS, and JavaScript",
    previewVideo: "https://example.com/preview.mp4",
    lectures: [
      {
        id: 1,
        title: "HTML Basics",
        description: "Understanding HTML structure and common elements",
        previewVideo: "https://example.com/lecture1.mp4",
      },
      {
        id: 2,
        title: "CSS Fundamentals",
        description: "Learning CSS styling and layouts",
        previewVideo: "https://example.com/lecture2.mp4",
      },
    ],
  });

  function valdidateToSubmitReview() {
    if (
      courseData?.lectures?.length >= 3 &&
      courseData?.finalQuiz?.mcqs.length >= 5
    ) {
      return true;
    }
    return false;
  }

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}course/course/${id}`,
          {
            withCredentials: true,
          }
        );
        setCourseData(res.data.course);
        // toast.success("Course created successfully");
      } catch (error) {
        console.error(error);
        // toast.error("Failed to create course");
      }
    }
    fetchCourseData();
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 ">
      {/* Course Header */}
      <button
        className="rounded-full text-white bg-black px-7 py-2 mb-5"
        onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
      >
        Back
      </button>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {courseData.title}
            </h1>
            <p className="text-gray-600">{courseData.description}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/edit-course/${id}`}>
              <button className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                <Pencil size={16} className="mr-1" />
                Edit
              </button>
            </Link>
            <button
              onClick={() => deleteCourse(id, navigate)}
              className="flex items-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          </div>
        </div>

        {/* Course Preview Video */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4 flex items-center justify-center h-64">
          <div className="text-gray-500 ">
            {courseData.previewVideo ? (
              <video
                src={courseData.previewVideo}
                controls
                className="my-4 rounded-lg"
              />
            ) : (
              <span className="text-gray-400">No preview video available</span>
            )}
          </div>
        </div>
      </div>

      {/* Lectures Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-800 flex gap-3">
            Lectures
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <Info size={14} className="mr-2" />
              Atleast 3 lectures required to publish course
            </div>
          </div>
          <Link to={`/create-lecture/${id}`}>
            <button
              //   onClick={handleAddLecture}
              className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
            >
              <Plus size={16} className="mr-1" />
              Add Lecture
            </button>
          </Link>
        </div>

        {/* Lecture List */}
        <div className="space-y-4">
          {courseData?.lectures.length > 0 ? (
            courseData.lectures.map((lecture) => (
              <div
                key={lecture.lectureId}
                className="bg-white rounded-lg shadow-md p-4 flex w-full justify-between"
              >
                <div className="flex flex-col w-3/4 gap-3">
                  <div className="space-y-2 ">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {lecture.title}
                    </h3>
                    <p className="text-gray-600">{lecture.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/edit-lecture/${lecture.lectureId}`}>
                      <button className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                        <Pencil size={16} className="mr-1" />
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteLecture(lecture.lectureId, navigate)}
                      className="flex items-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Lecture Preview Video */}
                <div className="mt-4 bg-gray-100 rounded-lg p-4 flex items-center justify-center w-2/4 h-48">
                  <div className="text-gray-500 ">
                    {lecture.videoUrl ? (
                      <video
                        src={lecture.videoUrl}
                        controls
                        className="my-4 rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400">
                        No preview video available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">
              No lectures add yet please add lectures to publish course
            </div>
          )}
        </div>
      </div>

      {/* final quiz Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-800 flex gap-3">
            Final Quiz
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <Info size={14} className="mr-2" />
              Add atleast 5 MCQs to publish course
            </div>
          </div>
          <Link
            to={`${
              courseData?.finalQuiz ? "/edit-final-quiz" : "/create-final-quiz"
            }/${id}`}
          >
            <button
              //   onClick={handleAddLecture}
              className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
            >
              <Plus size={16} className="mr-1" />
              {courseData?.finalQuiz ? "Edit" : "Add"} Final Quiz
            </button>
          </Link>
        </div>

        <div className="border rounded-lg p-4 capitalize">
          {courseData?.finalQuiz?.mcqs.map((mcq, mcqIndex) => (
            <div key={mcq._id} className="p-4 border rounded-lg space-y-4 my-2">
              <div className="text-lg font-semibold">{mcq.question}</div>
              <div className="grid grid-cols-2 gap-4 ">
                {mcq.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-2 border-2  rounded-lg ${
                      mcq.correctOption === index ? "bg-green-100" : ""
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-8">
        <button
          className={`flex items-center px-6 py-3  text-white rounded-md ${
            valdidateToSubmitReview()
              ? "bg-blue-700 "
              : " bg-blue-300 cursor-not-allowed "
          } `}
        >
          <Send size={16} className="mr-2" />
          Submit for Review
        </button>
      </div>
    </div>
  );
};

export default CourseManagement;
