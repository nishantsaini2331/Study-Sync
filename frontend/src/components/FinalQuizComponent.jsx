import React, { useEffect, useState } from "react";
import { Info, Plus, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const FinalQuizComponent = ({ edit = false }) => {
  const { courseId } = useParams();
  console.log(edit);

  const [quizForm, setQuizForm] = useState({
    mcqs: [
      {
        id: Date.now(),
        question: "",
        options: ["", "", "", ""],
        correctOption: null,
      },
    ],
  });

  const [editingOption, setEditingOption] = useState({
    mcqIndex: null,
    optionIndex: null,
  });

  const navigate = useNavigate();

  const handleAddMcq = () => {
    if (quizForm.mcqs.length >= 20) {
      toast.error("Maximum 20 MCQs allowed", {
        icon: <AlertCircle className="text-red-500" size={20} />,
      });
      return;
    }

    setQuizForm((prev) => ({
      ...prev,
      mcqs: [
        ...prev.mcqs,
        {
          id: Date.now(),
          question: "",
          options: ["", "", "", ""],
          correctOption: null,
        },
      ],
    }));
  };

  const handleDeleteMcq = (mcqIndex) => {
    if (quizForm.mcqs.length <= 1) {
      toast.error("Minimum 5 MCQs required");
      return;
    }

    setQuizForm((prev) => ({
      ...prev,
      mcqs: prev.mcqs.filter((_, index) => index !== mcqIndex),
    }));
  };

  const handleMcqChange = (mcqIndex, field, value) => {
    setQuizForm((prev) => ({
      ...prev,
      mcqs: prev.mcqs.map((mcq, index) =>
        index === mcqIndex ? { ...mcq, [field]: value } : mcq
      ),
    }));
  };

  const handleOptionClick = (mcqIndex, optIndex) => {
    setEditingOption({ mcqIndex, optionIndex: optIndex });
  };

  const handleOptionDoubleClick = (e, mcqIndex, optIndex) => {
    e.preventDefault();
    setQuizForm((prev) => ({
      ...prev,
      mcqs: prev.mcqs.map((mcq, index) =>
        index === mcqIndex ? { ...mcq, correctOption: optIndex } : mcq
      ),
    }));
  };

  const handleOptionEdit = (e, mcqIndex, optIndex) => {
    const value = e.target.value;
    setQuizForm((prev) => ({
      ...prev,
      mcqs: prev.mcqs.map((mcq, index) =>
        index === mcqIndex
          ? {
              ...mcq,
              options: mcq.options.map((opt, i) =>
                i === optIndex ? value : opt
              ),
            }
          : mcq
      ),
    }));
  };

  const handleOptionBlur = () => {
    setEditingOption({ mcqIndex: null, optionIndex: null });
  };

  const handleOptionKeyPress = (e) => {
    if (e.key === "Enter") {
      handleOptionBlur();
    }
  };

  const validateQuiz = () => {
    let isValid = true;

    if (quizForm.mcqs.length < 5) {
      toast.error("Minimum 5 MCQs required");
      isValid = false;
    }

    if (quizForm.mcqs.length > 20) {
      toast.error("Maximum 20 MCQs allowed");
      isValid = false;
    }

    quizForm.mcqs.forEach((mcq, index) => {
      if (!mcq.question.trim()) {
        toast.error(`Question ${index + 1} is empty`);
        isValid = false;
      }

      if (mcq.correctOption === null) {
        toast.error(`Correct option not selected for question ${index + 1}`);
        isValid = false;
      }

      mcq.options.forEach((option, optIndex) => {
        if (!option.trim()) {
          toast.error(
            `Option ${optIndex + 1} is empty in question ${index + 1}`
          );
          isValid = false;
        }
      });
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (validateQuiz()) {
    try {
      let res;
      if (edit) {
        res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}final-quiz/${courseId}`,
          { quiz: quizForm.mcqs },
          {
            withCredentials: true,
          }
        );
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}final-quiz/${courseId}`,
          { quiz: quizForm.mcqs },
          {
            withCredentials: true,
          }
        );
      }
      console.log(res.data);
      toast.success(res.data.message || "Quiz saved successfully");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message || "Internal server error");
    }
  };

  useEffect(() => {
    if (edit) {
      (async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}final-quiz/${courseId}`,
            {
              withCredentials: true,
            }
          );

          setQuizForm({ mcqs: res.data.finalQuiz.mcqs });
        } catch (error) {
          console.error(error);
          toast.error(error.response.data.error || "Internal server error");
        }
      })();
    }
  }, [edit, courseId]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white">
      <button
        className="rounded-full text-white bg-black px-7 py-2 my-5"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            Final Course Quiz
          </h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium">
                    MCQs ({quizForm.mcqs.length}/20)
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                    <Info size={14} className="mr-2" />
                    Single click to edit option • Double click to select correct
                    answer
                  </div>
                </div>
                {quizForm.mcqs.length < 20 && (
                  <button
                    type="button"
                    onClick={handleAddMcq}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus size={16} />
                    Add MCQ
                  </button>
                )}
              </div>

              {quizForm.mcqs.map((mcq, mcqIndex) => (
                <div key={mcqIndex} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      value={mcq.question}
                      onChange={(e) =>
                        handleMcqChange(mcqIndex, "question", e.target.value)
                      }
                      placeholder="Enter question"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteMcq(mcqIndex)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {mcq.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        onClick={() => handleOptionClick(mcqIndex, optIndex)}
                        onDoubleClick={(e) =>
                          handleOptionDoubleClick(e, mcqIndex, optIndex)
                        }
                        className={`
                        px-4 py-2 rounded-lg cursor-pointer border 
                        ${
                          mcq.correctOption === optIndex
                            ? "bg-green-100 border-green-300"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        }
                        ${
                          editingOption.mcqIndex === mcqIndex &&
                          editingOption.optionIndex === optIndex
                            ? "ring-2 ring-indigo-500"
                            : ""
                        }
                      `}
                      >
                        {editingOption.mcqIndex === mcqIndex &&
                        editingOption.optionIndex === optIndex ? (
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionEdit(e, mcqIndex, optIndex)
                            }
                            onBlur={handleOptionBlur}
                            onKeyPress={handleOptionKeyPress}
                            className="w-full bg-transparent outline-none"
                            autoFocus
                            required
                          />
                        ) : (
                          <span>{option || `Option ${optIndex + 1}`}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {edit ? "Update Quiz" : "Create Quiz"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinalQuizComponent;
