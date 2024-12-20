import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";

const TeacherOnboard = () => {
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      questionText: "Why do you want to teach?",
      options: [
        "I am passionate about sharing knowledge",
        "Teaching aligns with my career goals",
        "I want to earn extra income",
        "Other",
      ],
    },
    {
      id: 2,
      questionText: "How many years of teaching experience do you have?",
      options: [
        "Less than a year",
        "1-2 years",
        "2-3 years",
        "More than 3 years",
      ],
    },
    {
      id: 3,
      questionText: "What type of courses would you like to teach?",
      options: [
        "Technical (e.g., coding, data science)",
        "Creative (e.g., art, design)",
        "Business skills",
        "Other",
      ],
    },
    {
      id: 4,
      questionText:
        "How comfortable are you with preparing online course materials?",
      options: [
        "Very comfortable",
        "Somewhat comfortable",
        "Neutral",
        "Not comfortable",
      ],
    },
    {
      id: 5,
      questionText: "What is your preferred teaching method?",
      options: [
        "Video lectures",
        "Live sessions",
        "Written content",
        "Combination of methods",
      ],
    },
  ];

  const handleChange = (questionId, selectedOption) => {
    setAnswers({ ...answers, [questionId]: selectedOption });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      userId: "user-object-id", // Replace with actual user ID
      questions: questions.map((question) => ({
        questionText: question.questionText,
        selectedOption: answers[question.id],
        options: question.options,
      })),
    };

    console.log(answers);
    console.log(formattedData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}user/instructor/onboard`,
        formattedData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsSubmitted(true);
        //onboard success
        toast.success("We love you to onboard as an instructor");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const allQuestionsAnswered =
    Object.keys(answers).length === questions.length &&
    Object.values(answers).every((answer) => answer !== "");

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-2xl font-bold text-blue-500">
          Thank You for Submitting!
        </h2>
        <p className="text-lg mt-2 text-gray-600">
          We’ll review your application and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
          Join as an Instructor
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Answer these quick questions to start your teaching journey with us!
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-gray-100 p-4 rounded-md shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {question.questionText}
              </h3>
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-2 mb-2 text-gray-600"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    onChange={() => handleChange(question.id, option)}
                    required
                    className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-400"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ))}
          <button
            type="submit"
            disabled={!allQuestionsAnswered}
            className={`w-full py-2 px-4 rounded-md font-medium transition ${
              allQuestionsAnswered
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherOnboard;
