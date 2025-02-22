import React, { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Video,
  Send,
  Info,
  DollarSign,
  Globe,
  Percent,
  BookOpen,
  Tag,
  IndianRupee,
  ChartBarBig,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export async function deleteCourse(courseId, navigate) {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}course/${courseId}`,
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
      `${import.meta.env.VITE_BACKEND_URL}lecture/${lectureId}`,
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

function CourseManagement({ isVerify = false }) {
  const { id: courseId } = useParams();
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
        lectureId: "1",
      },
      {
        id: 2,
        title: "CSS Fundamentals",
        description: "Learning CSS styling and layouts",
        previewVideo: "https://example.com/lecture2.mp4",
        lectureId: "2",
      },
    ],
    category: {
      name: "Programming",
    },
    finalQuiz: {
      mcqs: [
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "Hyperlinks and Text Markup Language",
            "Home Tool Markup Language",
          ],
          correctOption: 0,
          _id: "1",
        },
        {
          question:
            "Which of the following tag is used to mark a begining of paragraph ?",
          options: ["<TD>", "<br>", "<P>"],
          correctOption: 2,
          _id: "2",
        },
        {
          question: "From which tag descriptive list starts ?",
          options: ["<LL>", "<DD>", "<DL>"],
          correctOption: 2,
          _id: "3",
        },
        {
          question: "Correct HTML tag for the largest heading is",
          options: ["<head>", "<h6>", "<heading>"],
          correctOption: 1,
          _id: "4",
        },
        {
          question: "The attribute of <form> tag",
          options: ["Method", "Action", "Both (a)&(b)"],
          correctOption: 2,
          _id: "5",
        },
      ],
    },

    whatYouWillLearn: [
      "HTML Basics",
      "CSS Fundamentals",
      "JavaScript Introduction",
    ],
  });

  function valdidateToSubmitReview() {
    if (courseData?.status === "under review") {
      return false;
    }
    if (
      courseData?.lectures?.length >= 3 &&
      courseData?.finalQuiz?.mcqs.length >= 5
    ) {
      return true;
    }
    return false;
  }

  async function fetchCourseData() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}course/${courseId}`,
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

  async function handleSubmitReview() {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}course-verify`,
        {
          courseId,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        fetchCourseData();
      }
      toast.success(res.data.message || "Course submitted for review");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response.data.message || "Failed to submit course for review"
      );
    }
  }

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 ">
      <button
        className="rounded-full text-white bg-black px-7 py-2 mb-5 fixed left-[23rem] z-30"
        onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
      >
        Back
      </button>

      {!isVerify && courseData?.status === "under review" && (
        <div className="flex items-center text-2xl text-gray-600 bg-yellow-400/30 px-3 py-1 rounded-full">
          <Info size={25} className="mr-2" />
          Course is under review
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        <div className="px-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-3 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {courseData.title}
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {courseData.description}
              </p>
            </div>
            {!isVerify && (
              <div className="flex gap-2 w-full md:w-auto">
                <Link
                  to={`/edit-course/${courseId}`}
                  className="flex-1 md:flex-none"
                >
                  <button className="w-full md:w-auto flex items-center justify-center px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-200">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => deleteCourse(courseId, navigate)}
                  className="flex-1 md:flex-none w-full md:w-auto flex items-center justify-center px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Video Preview Section */}
          <div className="mt-8 bg-gray-50 rounded-lg overflow-hidden">
            <div className="aspect-video w-full">
              {courseData.previewVideo ? (
                <video
                  src={courseData.previewVideo}
                  controls
                  className="w-full h-full object-cover"
                  controlsList="nodownload"
                  disablePictureInPicture
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No preview video available
                </div>
              )}
            </div>
          </div>

          {/* Course Details and Thumbnail Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Course Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Course Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <IndianRupee className="w-5 h-5" />
                  <span className="font-medium">Price:</span>
                  <span>₹ {courseData.price}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Language:</span>
                  <span className="capitalize">{courseData.language}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Minimum Skill:</span>
                  <span className="capitalize">{courseData.minimumSkill}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Percent className="w-5 h-5" />
                  <span className="font-medium">Required Pass:</span>
                  <span>{courseData.requiredCompletionPercentage}%</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <ChartBarBig className="w-5 h-5" />
                  <span className="font-medium">Category:</span>
                  <span>{courseData.category.name}</span>
                </div>

                <div className="flex items-start gap-3 text-gray-600">
                  <Tag className="w-5 h-5 mt-1" />
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {courseData.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Thumbnail</h2>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={courseData.thumbnail}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* render whatYouWillLearn  */}
          <div className="mt-8 ">
            <h2 className="text-xl font-semibold text-gray-800">
              What you will learn
            </h2>
            <div className="space-y-4 py-3">
              {courseData.whatYouWillLearn.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-600 text-lg fonb"
                >
                  <span className="font-medium">{index + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
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
          {!isVerify && (
            <Link to={`/create-lecture/${courseId}`}>
              <button
                //   onClick={handleAddLecture}
                className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
              >
                <Plus size={16} className="mr-1" />
                Add Lecture
              </button>
            </Link>
          )}
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
                  {isVerify ? (
                    <div>Check lecture</div>
                  ) : (
                    <div className="flex gap-2">
                      <Link to={`/edit-lecture/${lecture.lectureId}`}>
                        <button className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                          <Pencil size={16} className="mr-1" />
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() =>
                          deleteLecture(lecture.lectureId, navigate)
                        }
                        className="flex items-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 bg-gray-100 rounded-lg p-4 flex items-center justify-center w-2/4 h-48">
                  <div className="text-gray-500 ">
                    {lecture.videoUrl ? (
                      <video
                        src={lecture.videoUrl}
                        controls
                        className="my-4 rounded-lg"
                        controlsList="nodownload"
                        disablePictureInPicture
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

          {!isVerify && (
            <Link
              to={`${
                courseData?.finalQuiz
                  ? "/edit-final-quiz"
                  : "/create-final-quiz"
              }/${courseId}`}
            >
              <button
                //   onClick={handleAddLecture}
                className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
              >
                <Plus size={16} className="mr-1" />
                {courseData?.finalQuiz ? "Edit" : "Add"} Final Quiz
              </button>
            </Link>
          )}
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

      {courseData?.status === "draft" && (
        <div className="flex justify-center mt-8">
          <button
            disabled={!valdidateToSubmitReview()}
            onClick={handleSubmitReview}
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
      )}
    </div>
  );
}

export default CourseManagement;
