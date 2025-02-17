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

function CourseLearningPage() {
  const { courseId } = useParams();

  const [lockedLectures, setLockedLectures] = useState([]);
  const [unlockedLectures, setUnlockedLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);

  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  console.log(userAnswers);

  const [showLectures, setShowLectures] = useState(false);

  async function fetchCourseLearningData() {
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
        setCurrentLecture(response.data.data.currentLecture);
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
  }

  function calculateScore() {
    if (!quizSubmitted || !currentLecture?.lecture.mcqs) return null;

    const totalQuestions = currentLecture.lecture.mcqs.length;
    let correctAnswers = 0;

    for (let i = 0; i < totalQuestions; i++) {
      if (userAnswers[i] === currentLecture.lecture.mcqs[i].correctOption) {
        correctAnswers++;
      }
    }

    return {
      total: totalQuestions,
      correct: correctAnswers,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
    };
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
      if (response.data.success) {
        setUserAnswers({});
        setQuizSubmitted(false);
        fetchCourseLearningData();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const score = calculateScore();

  useEffect(() => {
    if (
      score &&
      currentLecture &&
      score.percentage >= currentLecture.lecture.requiredPassPercentage
    ) {
      unlockNextLecture();
    }
  }, [score]);

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
        className={`md:w-1/4 bg-white shadow-md md:min-h-screen ${
          showLectures ? "block" : "hidden md:block"
        }`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Course Content</h2>
          <p className="text-sm text-gray-500">
            {unlockedLectures.length} /{" "}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Toggle Button */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-semibold">Course Learning Page</h1>
          <button
            onClick={() => setShowLectures(!showLectures)}
            className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"
          >
            <List size={20} />
          </button>
        </div>

        {/* Video & Content Section */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Video Player */}
              <div className="aspect-video bg-black flex items-center justify-center">
                <video
                  src={currentLecture.lecture.videoUrl}
                  controls
                  className="w-full h-full"
                />
              </div>

              {/* Lecture Info & Quiz */}
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">
                  {currentLecture.lecture.title}
                </h1>
                <p className="text-gray-600 mb-4">
                  {currentLecture.lecture.description}
                </p>

                {/* Quiz Section */}
                <div className="border rounded-lg p-6 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Knowledge Check
                    </h2>
                    <p className="text-gray-600 mb-1">
                      Take the quiz to test your understanding of the lecture.
                    </p>
                    <p className="text-gray-600 mb-4">
                      You need to score at least{" "}
                      <b>{currentLecture.lecture.requiredPassPercentage}%</b> to
                      pass the quiz and unlock the next lecture.
                    </p>
                  </div>

                  {!currentLecture.isCompleted ? (
                    !quizSubmitted ? (
                      <>
                        <div className="space-y-6">
                          {currentLecture.lecture.mcqs.map((mcq, qIndex) => (
                            <div key={qIndex} className="border-b pb-4">
                              <p className="font-medium mb-3 capitalize">
                                {qIndex + 1}. {mcq.question}
                              </p>
                              <div className="space-y-2 pl-2">
                                {mcq.options.map((option, oIndex) => (
                                  <div
                                    key={oIndex}
                                    className="flex items-center"
                                  >
                                    <input
                                      type="radio"
                                      id={`q${qIndex}-o${oIndex}`}
                                      name={`question-${qIndex}`}
                                      className="mr-3 h-4 w-4 text-blue-600"
                                      // checked={true}
                                      // disabled={true}
                                      // checked={userAnswers[qIndex] === oIndex}
                                      onChange={() =>
                                        handleAnswerSelection(qIndex, oIndex)
                                      }
                                    />
                                    <label
                                      htmlFor={`q${qIndex}-o${oIndex}`}
                                      className="text-gray-700 flex-1 cursor-pointer"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {!currentLecture.isCompleted ? (
                          <div className="mt-6">
                            <button
                              onClick={handleQuizSubmit}
                              disabled={
                                Object.keys(userAnswers).length !==
                                currentLecture.lecture.mcqs.length
                              }
                              className={`px-6 py-2 rounded-md ${
                                Object.keys(userAnswers).length ===
                                currentLecture.lecture.mcqs.length
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              Submit Answers
                            </button>
                          </div>
                        ) : (
                          ""
                        )}
                      </>
                    ) : (
                      <div className="space-y-6">
                        {/* Quiz Results */}
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-blue-700">
                              Quiz Results
                            </h3>
                            <div className="flex items-center">
                              <span className="text-3xl font-bold text-blue-700">
                                {score.percentage}%
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-blue-600">
                            You answered {score.correct} out of {score.total}{" "}
                            questions correctly.
                          </p>
                          <p className="text-blue-600">
                            {score.percentage >=
                            currentLecture.lecture.requiredPassPercentage
                              ? "Congratulations! You passed the quiz."
                              : "You did not pass the quiz. Try again to unlock the next lecture."}
                          </p>
                        </div>

                        {/* Review Answers */}
                        {currentLecture.lecture.mcqs.map((mcq, qIndex) => (
                          <div key={qIndex} className="border-b pb-4">
                            <p className="font-medium mb-3">
                              {qIndex + 1}. {mcq.question}
                            </p>
                            <div className="space-y-2 pl-2">
                              {mcq.options.map((option, oIndex) => (
                                <div
                                  key={oIndex}
                                  className={`flex items-center p-2 rounded ${
                                    oIndex === mcq.correctOption
                                      ? "bg-green-50 border border-green-200"
                                      : userAnswers[qIndex] === oIndex
                                      ? "bg-red-50 border border-red-200"
                                      : ""
                                  }`}
                                >
                                  <div className="mr-3">
                                    {oIndex === mcq.correctOption && (
                                      <CheckCircle
                                        size={18}
                                        className="text-green-500"
                                      />
                                    )}
                                    {userAnswers[qIndex] === oIndex &&
                                      oIndex !== mcq.correctOption && (
                                        <div className="h-4 w-4 rounded-full bg-red-500" />
                                      )}
                                  </div>
                                  <label className="text-gray-700 flex-1">
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {userAnswers[qIndex] !== mcq.correctOption && (
                              <p className="mt-2 text-sm text-blue-600 pl-2">
                                <span className="font-medium">
                                  Explanation:
                                </span>{" "}
                                The correct answer is "
                                {mcq.options[mcq.correctOption]}".
                              </p>
                            )}
                          </div>
                        ))}
                        <div className="mt-6">
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setUserAnswers({});
                            }}
                            className="px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <>
                      {currentLecture.lecture.mcqs.map((mcq, qIndex) => (
                        <div key={qIndex} className="border-b pb-4">
                          <p className="font-medium mb-3">
                            {qIndex + 1}. {mcq.question}
                          </p>
                          <div className="space-y-2 pl-2">
                            {mcq.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className={`flex items-center p-2 rounded ${
                                  oIndex === mcq.correctOption
                                    ? "bg-green-50 border border-green-200"
                                    : userAnswers[qIndex] === oIndex
                                    ? "bg-red-50 border border-red-200"
                                    : ""
                                }`}
                              >
                                <div className="mr-3">
                                  {oIndex === mcq.correctOption && (
                                    <CheckCircle
                                      size={18}
                                      className="text-green-500"
                                    />
                                  )}
                                  {userAnswers[qIndex] === oIndex &&
                                    oIndex !== mcq.correctOption && (
                                      <div className="h-4 w-4 rounded-full bg-red-500" />
                                    )}
                                </div>
                                <label className="text-gray-700 flex-1">
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                          {userAnswers[qIndex] !== mcq.correctOption && (
                            <p className="mt-2 text-sm text-blue-600 pl-2">
                              <span className="font-medium">Explanation:</span>{" "}
                              The correct answer is "
                              {mcq.options[mcq.correctOption]}".
                            </p>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>

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
