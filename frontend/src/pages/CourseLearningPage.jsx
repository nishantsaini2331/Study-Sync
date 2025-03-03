import axios from "axios";
import confetti from "canvas-confetti";
import {
    Award,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    FileText,
    List,
    Lock,
    Play,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Comment from "../components/Comment";
import QuizComponent from "../components/QuizComponent";

function CourseLearningPage() {
  const { id: courseId } = useParams();

  const [lockedLectures, setLockedLectures] = useState([]);
  const [unlockedLectures, setUnlockedLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [finalQuiz, setFinalQuiz] = useState(null);
  const [showingFinalQuiz, setShowingFinalQuiz] = useState(false);

  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("quiz");

  const [showLectures, setShowLectures] = useState(false);

  const [score, setScore] = useState({
    correctAnswers: "",
    totalQuestions: "",
    percentage: "",
    isPassed: false,
  });

  async function fetchCourseLearningData(
    setPreviousLecture = false,
    isForFinalQuiz = false
  ) {
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
        overallProgress,
        finalQuiz,
      } = response.data.data;

      setLockedLectures(locked);
      setUnlockedLectures(unlocked);
      setOverallProgress(overallProgress);
      setFinalQuiz(finalQuiz);

      if (isForFinalQuiz) {
        setShowingFinalQuiz(true);
        setCurrentLecture(finalQuiz);
      } else if (unlocked.length > 0 && !currentLecture && !showingFinalQuiz) {
        setCurrentLecture(unlocked[0]);
      } else if (response.data.data.currentLecture && !showingFinalQuiz) {
        if (overallProgress === 100) {
          setCurrentLecture(currentLecture);
        } else {
          if (setPreviousLecture) {
            const previousLecture = unlocked.find(
              (lecture) =>
                lecture.lecture.order === currentLecture.lecture.order - 1
            );
            if (previousLecture) {
              fetchCurrentLecture(previousLecture.lecture.lectureId);
            } else {
              setCurrentLecture(currentLecture);
            }
          } else {
            setCurrentLecture(currentLecture);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching course learning data:", error);
    }
  }

  async function fetchCurrentLecture(lectureId) {
    setIsLoading(true);
    setShowingFinalQuiz(false);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }student/current-lecture/${courseId}/${lectureId}`,
        {
          withCredentials: true,
        }
      );
      setCurrentLecture(response.data.data);
    } catch (error) {
      console.error("Error fetching current lecture:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFinalQuiz() {
    setIsLoading(true);
    setShowingFinalQuiz(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}student/${courseId}/final-quiz`,
        {
          withCredentials: true,
        }
      );
      setFinalQuiz(response.data.data);
    } catch (error) {
      console.error("Error fetching final quiz:", error);
    } finally {
      setIsLoading(false);
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
    if (showingFinalQuiz) {
      submitFinalQuiz();
    } else {
      unlockNextLecture();
    }
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

  function triggerConfetti() {
    const duration = 10 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.5, 0.6) },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      });

      confetti({
        particleCount,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.5, 0.6) },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      });
    }, 250);
  }

  async function submitFinalQuiz() {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }student/${courseId}/submit-final-quiz`,
        {
          userAnswers: userAnswers,
        },
        {
          withCredentials: true,
        }
      );

      setScore(response.data.data);
      if (response.data.data.isPassed) {
        toast.success("Congratulations! You have passed the final quiz.");
        toast.success("Please check your dashboard for your certificate.");
        setUserAnswers({});
        setQuizSubmitted(false);
        fetchCourseLearningData(false, true);
        // fetchFinalQuiz();
        triggerConfetti();
      }
    } catch (error) {
      console.log(error);
    }
  }

  function renderContent() {
    switch (activeTab) {
      case "quiz":
        return (
          <div className="text-lg">
            <QuizComponent
              currentLecture={showingFinalQuiz ? finalQuiz : currentLecture}
              quizSubmitted={quizSubmitted}
              userAnswers={userAnswers}
              handleAnswerSelection={handleAnswerSelection}
              handleQuizSubmit={handleQuizSubmit}
              score={score}
              setQuizSubmitted={setQuizSubmitted}
              setUserAnswers={setUserAnswers}
              isFinalQuiz={showingFinalQuiz}
            />
          </div>
        );
      case "comments":
        return (
          <div className="text-lg">
            <Comment
              lectureId={currentLecture?.lecture?.lectureId}
              comments={currentLecture?.lecture?.comments}
            />
          </div>
        );

      default:
        return (
          <div className="text-lg">
            <QuizComponent
              currentLecture={showingFinalQuiz ? finalQuiz : currentLecture}
              quizSubmitted={quizSubmitted}
              userAnswers={userAnswers}
              handleAnswerSelection={handleAnswerSelection}
              handleQuizSubmit={handleQuizSubmit}
              score={score}
              setQuizSubmitted={setQuizSubmitted}
              setUserAnswers={setUserAnswers}
              isFinalQuiz={showingFinalQuiz}
            />
          </div>
        );
    }
  }

  useEffect(() => {
    fetchCourseLearningData();
    document.title = "Course Learning Page";
  }, [courseId]);

  if ((!currentLecture && !showingFinalQuiz) || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading course content...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div
        className={`md:w-1/4 bg-white shadow-md md:min-h-screen ${
          showLectures ? "block" : "hidden md:block"
        }`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Course Content</h2>
          <p className="text-sm text-gray-500">
            {unlockedLectures.length} /
            {unlockedLectures.length + lockedLectures.length} lectures unlocked
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="p-2">
            <h3 className="text-md font-medium mb-2">Available Content</h3>
            {unlockedLectures.map((lecture, index) => (
              <div
                key={`unlocked-${lecture.lecture.lectureId}`}
                className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer ${
                  !showingFinalQuiz &&
                  currentLecture &&
                  currentLecture.lecture.lectureId === lecture.lecture.lectureId
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setQuizSubmitted(false);
                  setUserAnswers({});
                  setShowLectures(false);
                  setActiveTab("quiz");
                  fetchCurrentLecture(lecture.lecture.lectureId);
                }}
              >
                <div className="mr-3">
                  {!showingFinalQuiz &&
                  currentLecture &&
                  currentLecture.lecture.lectureId ===
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
                      !showingFinalQuiz &&
                      currentLecture &&
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

            {overallProgress === 100 && finalQuiz && (
              <div
                className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer ${
                  showingFinalQuiz
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setQuizSubmitted(false);
                  setUserAnswers({});
                  setShowLectures(false);
                  setActiveTab("quiz");
                  fetchFinalQuiz();
                }}
              >
                <div className="mr-3">
                  {showingFinalQuiz ? (
                    <Play size={18} className="text-blue-500" />
                  ) : finalQuiz.isCompleted ? (
                    <Award size={18} className="text-green-500" />
                  ) : (
                    <FileText size={18} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      showingFinalQuiz
                        ? "font-semibold text-blue-700"
                        : finalQuiz.isCompleted
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    Final Quiz
                  </p>
                  {finalQuiz.isCompleted && (
                    <div className="flex items-center text-xs text-green-500 mt-1">
                      <span>
                        Completed with{" "}
                        {finalQuiz.quizAttempts[0]?.score || "N/A"}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {overallProgress < 100 && (
            <div className="p-2 border-t">
              <h3 className="text-md font-medium mb-2 text-gray-500">
                Locked Content
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

              <div className="flex items-center p-3 mb-2 rounded-lg text-gray-400">
                <div className="mr-3">
                  <Lock size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Final Quiz</p>
                </div>
              </div>
            </div>
          )}
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
              {showingFinalQuiz ? (
                <div className="p-6 bg-blue-50 border-b border-blue-100">
                  <div className="flex items-center mb-2">
                    <Award size={24} className="text-blue-600 mr-2" />
                    <h1 className="text-2xl font-bold text-blue-800">
                      Final Quiz
                    </h1>
                  </div>
                  <p className="text-gray-700">
                    {finalQuiz.isCompleted ? (
                      <>
                        You have completed the final quiz with a score of{" "}
                        <span className="font-semibold">
                          {finalQuiz.quizAttempts[0]?.score}%
                        </span>
                        <p>Please check your dashboard for your certificate.</p>
                      </>
                    ) : (
                      "Complete the final quiz to get your certificate."
                    )}
                  </p>
                </div>
              ) : (
                <div className="aspect-video bg-black flex items-center justify-center">
                  <video
                    src={currentLecture.lecture.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
              )}

              <div className="p-6">
                {!showingFinalQuiz && (
                  <>
                    <h1 className="text-2xl font-bold mb-2">
                      {currentLecture.lecture.title}
                    </h1>
                    <p className="text-gray-600 mb-4">
                      {currentLecture.lecture.description}
                    </p>
                  </>
                )}

                <div>
                  <div className="flex items-center mb-4">
                    {!showingFinalQuiz &&
                      ["quiz", "comments"].map((tab) => (
                        <button
                          key={tab}
                          className={`px-4 py-2 rounded-md capitalize text-lg mx-2 text-gray-700 ${
                            activeTab === tab
                              ? "bg-blue-700 text-white"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                  </div>
                </div>

                {renderContent()}

                {!showingFinalQuiz && (
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
                )}

                {showingFinalQuiz && overallProgress === 100 && (
                  <div className="flex justify-between border-t pt-6">
                    <button
                      className="px-4 py-2 border rounded-md flex items-center text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        if (unlockedLectures.length > 0) {
                          fetchCurrentLecture(
                            unlockedLectures[unlockedLectures.length - 1]
                              .lecture.lectureId
                          );
                          setQuizSubmitted(false);
                          setUserAnswers({});
                        }
                      }}
                    >
                      <ChevronUp size={16} className="mr-2" />
                      Back to Lectures
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseLearningPage;
