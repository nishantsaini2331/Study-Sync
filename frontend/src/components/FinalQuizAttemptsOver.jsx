import { AlertCircle } from "lucide-react";
import React from "react";

function FinalQuizAttemptsOver() {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-6 mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="text-red-500 h-6 w-6" />
          <h2 className="text-lg font-semibold text-red-700">
            All Quiz Attempts Used
          </h2>
        </div>

        <div className="pl-9">
          <p className="text-gray-700 mb-4">
            You have used all your available attempts for this final quiz.
            Unfortunately, you are no longer eligible to receive the certificate
            for this course.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FinalQuizAttemptsOver;
