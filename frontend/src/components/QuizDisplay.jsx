const QuizDisplay = ({ mcqs, responses, isFinalQuiz = false }) => {
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
              const userResponse = formattedResponses[mcq._id];

              const userSelected =
                mcq.options[userResponse?.textIndex] === option;

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
                      <div className="h-4 w-4 rounded-full bg-green-500" />
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
              <div className="mt-3 flex items-center font-bold gap-4 text-xs pl-2 bg-gray-100 p-2 rounded">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-gray-600">Your choice</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">Correct answer</span>
                </div>
              </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default QuizDisplay;
