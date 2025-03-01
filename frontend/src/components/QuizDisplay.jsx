import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const QuizDisplay = ({ mcqs, responses }) => {
  const formattedResponses = responses.mcqResponses.reduce((acc, response) => {
    acc[response.mcq] = response.selectedOption;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {mcqs.map((mcq, index) => {
        const response = formattedResponses[mcq._id];
        const isAnswered = !!response;

        return (
          <div key={mcq._id} className="border-b pb-4">
            <p className="font-medium mb-3">
              {index + 1}. {mcq.question}
            </p>

            <div className="space-y-2 pl-2">
              {mcq.options.map((option, optionIndex) => {
                const isSelected = isAnswered && response.text === option;

                const isCorrect = mcq.correctOption === optionIndex;

                return (
                  <div
                    key={optionIndex}
                    className={`flex items-center p-2 rounded ${
                      isCorrect
                        ? "bg-green-50 border border-green-200"
                        : isSelected && !isCorrect
                        ? "bg-red-50 border border-red-200"
                        : ""
                    }`}
                  >
                    <div className="mr-3">
                      {isCorrect && (
                        <CheckCircle size={18} className="text-green-500" />
                      )}
                      {isSelected && !isCorrect && (
                        <XCircle size={18} className="text-red-500" />
                      )}
                    </div>
                    <label className="text-gray-700 flex-1">{option}</label>
                  </div>
                );
              })}
            </div>

            {isAnswered && !response.isCorrect && (
              <p className="mt-2 text-sm text-blue-600 pl-2">
                <span className="font-medium">Explanation:</span>{" "}
                {mcq.explanation ||
                  `The correct answer is "${mcq.options[mcq.correctOption]}".`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuizDisplay;
