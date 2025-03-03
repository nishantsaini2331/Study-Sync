import React from "react";
import { CheckCircle, Award } from "lucide-react";
import QuizDisplay from "./QuizDisplay";

function QuizComponent({
  currentLecture,
  quizSubmitted,
  userAnswers,
  handleAnswerSelection,
  handleQuizSubmit,
  score,
  setQuizSubmitted,
  setUserAnswers,
  isFinalQuiz = false,
}) {
  const quizData = isFinalQuiz ? currentLecture : currentLecture?.lecture;
  const mcqs = isFinalQuiz
    ? currentLecture?.mcqs
    : currentLecture?.lecture?.mcqs;
  const isCompleted = currentLecture?.isCompleted;
  const requiredPassPercentage = isFinalQuiz
    ? currentLecture?.requiredPassPercentage
    : currentLecture?.lecture?.requiredPassPercentage;

  const quizAttempts = currentLecture?.quizAttempts || [];

  if (!currentLecture || !mcqs) {
    return <div>Loading quiz data...</div>;
  }

  return (
    <div className="border rounded-lg p-6 mb-6">
      {!isCompleted ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isFinalQuiz ? "Final Assessment" : "Knowledge Check"}
          </h2>
          <p className="text-gray-600 mb-1">
            {isFinalQuiz
              ? "Take this final quiz to complete the course and receive your certificate."
              : "Take the quiz to test your understanding of the lecture."}
          </p>
          <p className="text-gray-600 mb-4">
            You need to score at least <b>{requiredPassPercentage}%</b> to
            {isFinalQuiz
              ? " pass the course."
              : " pass the quiz and unlock the next lecture."}
          </p>
        </div>
      ) : (
        <div className="mb-4 bg-green-200 p-4 text-xl rounded flex items-center">
          {isFinalQuiz && <Award className="text-green-700 mr-2" size={24} />}
          <span>
            You passed the {isFinalQuiz ? "final quiz" : "quiz"} with the score
            of {quizAttempts[0]?.score || 0}%
          </span>
        </div>
      )}

      {!isCompleted ? (
        !quizSubmitted ? (
          <>
            <div className="space-y-6">
              {mcqs.map((mcq, qIndex) => (
                <div key={qIndex} className="border-b pb-4">
                  <p className="font-medium mb-3 capitalize">
                    {qIndex + 1}. {mcq.question}
                  </p>
                  <div className="space-y-2 pl-2">
                    {mcq.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`q${mcq._id}-o${oIndex}`}
                          name={`question-${mcq._id}`}
                          className="mr-3 h-4 w-4 text-blue-600"
                          checked={userAnswers[mcq._id] === oIndex}
                          onChange={() =>
                            handleAnswerSelection(mcq._id, oIndex)
                          }
                        />
                        <label
                          htmlFor={`q${mcq._id}-o${oIndex}`}
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

            <div className="mt-6">
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(userAnswers).length !== mcqs.length}
                className={`px-6 py-2 rounded-md ${
                  Object.keys(userAnswers).length === mcqs.length
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Answers
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div
              className={` p-4 rounded-md border mb-6 ${
                score.isPassed
                  ? " bg-green-100 border-green-100 "
                  : " bg-red-100 border-red-100 "
              } `}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-semibold ${
                    score.isPassed ? " text-green-700 " : " text-red-700 "
                  }`}
                >
                  {isFinalQuiz ? "Final Quiz Results" : "Quiz Results"}
                </h3>
                <div className="flex items-center">
                  <span
                    className={`text-3xl font-bold  ${
                      score.isPassed ? " text-green-700 " : " text-red-700 "
                    }`}
                  >
                    {score.percentage}%
                  </span>
                </div>
              </div>
              <p
                className={`mt-2 ${
                  score.isPassed ? " text-green-700 " : " text-red-700 "
                }`}
              >
                You answered {score.correctAnswers} out of{" "}
                {score.totalQuestions} questions correctly.
              </p>
              <p
                className={
                  score.isPassed ? " text-green-600 " : "  text-red-600 "
                }
              >
                {score.percentage >= requiredPassPercentage
                  ? isFinalQuiz
                    ? "Congratulations! You have successfully completed the course."
                    : "Congratulations! You passed the quiz."
                  : isFinalQuiz
                  ? "You did not pass the final quiz. Try again to complete the course."
                  : "You did not pass the quiz. Try again to unlock the next lecture."}
              </p>
            </div>

            {score.isPassed &&
              mcqs.map((mcq, qIndex) => (
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
                            : userAnswers[mcq._id] === oIndex
                            ? "bg-red-50 border border-red-200"
                            : ""
                        }`}
                      >
                        <div className="mr-3">
                          {oIndex === mcq.correctOption && (
                            <CheckCircle size={18} className="text-green-500" />
                          )}
                          {userAnswers[mcq._id] === oIndex &&
                            oIndex !== mcq.correctOption && (
                              <div className="h-4 w-4 rounded-full bg-red-500" />
                            )}
                        </div>
                        <label className="text-gray-700 flex-1">{option}</label>
                      </div>
                    ))}
                  </div>
                  {userAnswers[mcq._id] !== mcq.correctOption && (
                    <p className="mt-2 text-sm text-blue-600 pl-2">
                      <span className="font-medium">Explanation:</span> The
                      correct answer is "{mcq.options[mcq.correctOption]}".
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
          <QuizDisplay
            mcqs={mcqs}
            responses={quizAttempts[0]}
            isFinalQuiz={isFinalQuiz}
          />
          {isFinalQuiz && isCompleted && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="font-semibold text-blue-800 flex items-center">
                <Award className="mr-2" size={20} />
                Course Completion
              </h3>
              <p className="mt-2 text-gray-700">
                Congratulations on completing this course! You've successfully
                finished all lectures and passed the final quiz.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default QuizComponent;
