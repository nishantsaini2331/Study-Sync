import React, { useEffect, useState } from "react";
import {
  Play,
  Lock,
  Clock,
  FileText,
  CheckCircle,
  List,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import QuizComponent from "../components/QuizComponent";

function CourseLearningPage() {
  const { courseId } = useParams();

  const [lockedLectures, setLockedLectures] = useState([]);
  const [unlockedLectures, setUnlockedLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);

  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);

  const [showLectures, setShowLectures] = useState(false);

  const [score, setScore] = useState({
    correctAnswers: "",
    totalQuestions: "",
    percentage: "",
    isPassed: false,
  });

  async function fetchCourseLearningData(setPreviousLecture = false) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}student/${courseId}/learn`,
        {
          withCredentials: true,
        }
      );

      const {
        lockedLectures: locked,
        unlockedLectures: unlocked,
        currentLecture,
      } = response.data.data;

      setLockedLectures(locked);
      setUnlockedLectures(unlocked);

      if (unlocked.length > 0 && !currentLecture) {
        setCurrentLecture(unlocked[0]);
      } else if (response.data.data.currentLecture) {
        if (setPreviousLecture) {
          const previousLecture = unlocked.find(
            (lecture) =>
              lecture.lecture.order === currentLecture.lecture.order - 1
          );
          if (previousLecture) {
            setCurrentLecture(previousLecture);
          } else {
            setCurrentLecture(currentLecture);
          }
        } else {
          setCurrentLecture(currentLecture);
        }
      }
    } catch (error) {
      console.error("Error fetching course learning data:", error);
    }
  }

  function handleAnswerSelection(questionIndex, optionIndex) {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: optionIndex,
    });
  }

  function handleQuizSubmit() {
    setQuizSubmitted(true);
    unlockNextLecture();
  }

  async function unlockNextLecture() {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}student/${courseId}/${
          currentLecture.lecture.lectureId
        }/unlock-lecture`,
        {
          userAnswers: userAnswers,
        },
        {
          withCredentials: true,
        }
      );

      setScore(response.data.data);
      if (response.data.data.isPassed) {
        setUserAnswers({});
        setQuizSubmitted(false);
        fetchCourseLearningData(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchCourseLearningData();
    document.title = "Course Learning Page";
  }, [courseId]);

  if (!currentLecture) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading course content...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <div
        className={`md:w-1/4  bg-white shadow-md md:min-h-screen ${
          showLectures ? "block" : "hidden md:block"
        }`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Course Content</h2>
          <p className="text-sm text-gray-500">
            {unlockedLectures.length} /
            {unlockedLectures.length + lockedLectures.length} lectures unlocked
          </p>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="p-2">
            <h3 className="text-md font-medium mb-2">Available Lectures</h3>
            {unlockedLectures.map((lecture, index) => (
              <div
                key={`unlocked-${lecture.lecture.lectureId}`}
                className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer ${
                  currentLecture.lecture.lectureId === lecture.lecture.lectureId
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setCurrentLecture(lecture);
                  setQuizSubmitted(false);
                  setUserAnswers({});
                  setShowLectures(false);
                }}
              >
                <div className="mr-3">
                  {currentLecture.lecture.lectureId ===
                  lecture.lecture.lectureId ? (
                    <Play size={18} className="text-blue-500" />
                  ) : lecture.isCompleted ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : (
                    <FileText size={18} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      currentLecture.lecture.lectureId ===
                      lecture.lecture.lectureId
                        ? "font-semibold text-blue-700"
                        : lecture.isCompleted
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {lecture.lecture.title}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={14} className="mr-1" />
                    <span>{lecture.lecture.duration} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t">
            <h3 className="text-md font-medium mb-2 text-gray-500">
              Locked Lectures
            </h3>
            {lockedLectures.map((lecture, index) => (
              <div
                key={`locked-${index}`}
                className="flex items-center p-3 mb-2 rounded-lg text-gray-400"
              >
                <div className="mr-3">
                  <Lock size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{lecture.title}</p>
                  <div className="flex items-center text-xs mt-1">
                    <Clock size={14} className="mr-1" />
                    <span>{lecture.duration} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-semibold">Course Learning Page</h1>
          <button
            onClick={() => setShowLectures(!showLectures)}
            className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"
          >
            <List size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                
              <div className="aspect-video bg-black flex items-center justify-center">
                <video
                  src={currentLecture.lecture.videoUrl}
                  controls
                  className="w-full h-full"
                />
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">
                  {currentLecture.lecture.title}
                </h1>
                <p className="text-gray-600 mb-4">
                  {currentLecture.lecture.description}
                </p>

                <QuizComponent
                  currentLecture={currentLecture}
                  quizSubmitted={quizSubmitted}
                  userAnswers={userAnswers}
                  handleAnswerSelection={handleAnswerSelection}
                  handleQuizSubmit={handleQuizSubmit}
                  score={score}
                  setQuizSubmitted={setQuizSubmitted}
                  setUserAnswers={setUserAnswers}
                />

                <div className="flex justify-between border-t pt-6">
                  <button
                    className="px-4 py-2 border rounded-md flex items-center text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={unlockedLectures.indexOf(currentLecture) === 0}
                    onClick={() => {
                      const currentIndex = unlockedLectures.findIndex(
                        (lecture) =>
                          lecture.lecture.lectureId ===
                          currentLecture.lecture.lectureId
                      );

                      if (currentIndex > 0) {
                        setCurrentLecture(unlockedLectures[currentIndex - 1]);
                        setQuizSubmitted(false);
                        setUserAnswers({});
                      }
                    }}
                  >
                    <ChevronUp size={16} className="mr-2" />
                    Previous Lecture
                  </button>
                  <button
                    className="px-4 py-2 border rounded-md flex items-center text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      unlockedLectures.indexOf(currentLecture) ===
                      unlockedLectures.length - 1
                    }
                    onClick={() => {
                      const currentIndex = unlockedLectures.findIndex(
                        (lecture) =>
                          lecture.lecture.lectureId ===
                          currentLecture.lecture.lectureId
                      );
                      if (currentIndex < unlockedLectures.length - 1) {
                        setCurrentLecture(unlockedLectures[currentIndex + 1]);
                        setQuizSubmitted(false);
                        setUserAnswers({});
                      }
                    }}
                  >
                    Next Lecture
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseLearningPage;
