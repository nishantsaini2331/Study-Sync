import React from "react";
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
}) {
  return (
    <div className="border rounded-lg p-6 mb-6">
      {!currentLecture.isCompleted ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Knowledge Check</h2>
          <p className="text-gray-600 mb-1">
            Take the quiz to test your understanding of the lecture.
          </p>
          <p className="text-gray-600 mb-4">
            You need to score at least{" "}
            <b>{currentLecture.lecture.requiredPassPercentage}%</b> to pass the
            quiz and unlock the next lecture.
          </p>
        </div>
      ) : (
        <div className="mb-4 bg-green-200 p-4 text-xl rounded">
          You passed the quiz with the score of{" "}
          {currentLecture.quizAttempts[0].score} %
        </div>
      )}

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
                      <div key={oIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`q${mcq._id}-o${oIndex}`}
                          name={`question-${mcq._id}`}
                          className="mr-3 h-4 w-4 text-blue-600"
                          // checked={true}
                          // disabled={true}
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
                  Quiz Results
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
                {score.percentage >=
                currentLecture.lecture.requiredPassPercentage
                  ? "Congratulations! You passed the quiz."
                  : "You did not pass the quiz. Try again to unlock the next lecture."}
              </p>
            </div>

            {score.isPassed &&
              currentLecture.lecture.mcqs.map((mcq, qIndex) => (
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
                  {userAnswers[qIndex] !== mcq.correctOption && (
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
            mcqs={currentLecture.lecture.mcqs}
            responses={currentLecture.quizAttempts[0]}
          />
        </>
      )}
    </div>
  );
}

export default QuizComponent;
