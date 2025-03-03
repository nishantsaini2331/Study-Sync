import React from "react";
import { CheckCircle, Award } from "lucide-react";

const QuizDisplay = ({ mcqs, responses, isFinalQuiz = false }) => {
  // Format the responses for easier access
  const formattedResponses =
    responses?.mcqResponses?.reduce((acc, response) => {
      acc[response.mcq] = response.selectedOption;
      return acc;
    }, {}) || {};

  return (
    <div className="space-y-6">
      {mcqs.map((mcq, qIndex) => (
        <div key={qIndex} className="border-b pb-4">
          <p className="font-medium mb-3 capitalize">
            {qIndex + 1}. {mcq.question}
          </p>
          <div className="space-y-2 pl-2">
            {mcq.options.map((option, oIndex) => {
              const userSelected = formattedResponses[mcq._id]?.text === option;
              const isCorrect = oIndex === mcq.correctOption;

              return (
                <div
                  key={oIndex}
                  className={`flex items-center p-2 rounded ${
                    isCorrect
                      ? "bg-green-50 border border-green-200"
                      : userSelected && !isCorrect
                      ? "bg-red-50 border border-red-200"
                      : ""
                  }`}
                >
                  <div className="mr-3">
                    {isCorrect && (
                      <CheckCircle size={18} className="text-green-500" />
                    )}
                    {userSelected && !isCorrect && (
                      <div className="h-4 w-4 rounded-full bg-red-500" />
                    )}
                  </div>
                  <label className="text-gray-700 flex-1">{option}</label>
                </div>
              );
            })}
          </div>
          {formattedResponses[mcq._id] &&
            !formattedResponses[mcq._id].isCorrect && (
              <p className="mt-2 text-sm text-blue-600 pl-2">
                <span className="font-medium">Explanation:</span>{" "}
                {mcq.explanation ||
                  `The correct answer is "${mcq.options[mcq.correctOption]}".`}
              </p>
            )}
        </div>
      ))}
    </div>
  );
};

export default QuizDisplay;
