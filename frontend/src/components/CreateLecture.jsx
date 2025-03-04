import React, { useEffect, useState } from "react";
import { Plus, Video, Trash2, Info, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { LoadingSpinner } from "./CommentSystem";

const CreateLecture = ({ edit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const [lectureForm, setLectureForm] = useState({
    title: "",
    description: "",
    videoUrl: null,
    videoPreview: "",
    mcqs: [],
    requiredPassPercentage: 60,
  });

  console.log(lectureForm);

  const [editingOption, setEditingOption] = useState({
    mcqIndex: null,
    optionIndex: null,
  });

  const initialMcqForm = {
    question: "",
    options: ["", "", "", ""],
    correctOption: null,
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a valid video file");
        return;
      }

      // Validate file size (e.g., 100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        toast.error("Video file size should be less than 100MB");
        return;
      }

      setLectureForm({
        ...lectureForm,
        videoUrl: file,
        videoPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleDeleteVideo = () => {
    setLectureForm({
      ...lectureForm,
      videoUrl: null,
      videoPreview: "",
    });
    // Reset the file input
    const fileInput = document.getElementById("video-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleAddMcq = () => {
    if (lectureForm.mcqs.length < 5) {
      setLectureForm({
        ...lectureForm,
        mcqs: [...lectureForm.mcqs, { ...initialMcqForm, id: Date.now() }],
      });
    }
  };

  const handleMcqChange = (mcqIndex, field, value, optionIndex = null) => {
    console.log(mcqIndex, field, value, optionIndex);
    const newMcqs = [...lectureForm.mcqs];
    if (optionIndex !== null) {
      newMcqs[mcqIndex].options[optionIndex] = value;
    } else if (field === "correctOption") {
      newMcqs[mcqIndex].correctOption = value;
    } else {
      newMcqs[mcqIndex][field] = value;
    }
    setLectureForm({ ...lectureForm, mcqs: newMcqs });
  };

  const handleDeleteMcq = (mcqIndex) => {
    const newMcqs = lectureForm.mcqs.filter((_, index) => index !== mcqIndex);
    setLectureForm({ ...lectureForm, mcqs: newMcqs });
  };

  const handleOptionDoubleClick = (e, mcqIndex, optIndex) => {
    e.preventDefault();
    handleMcqChange(mcqIndex, "correctOption", optIndex);
  };

  const handleOptionClick = (mcqIndex, optIndex) => {
    setEditingOption({ mcqIndex, optionIndex: optIndex });
  };

  const handleOptionEdit = (e, mcqIndex, optIndex) => {
    handleMcqChange(mcqIndex, "options", e.target.value, optIndex);
  };

  const handleOptionBlur = () => {
    setEditingOption({ mcqIndex: null, optionIndex: null });
  };

  const handleOptionKeyPress = (e) => {
    if (e.key === "Enter") {
      handleOptionBlur();
    }
  };

  const handleLectureSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation checks
      setLoading(true);
      if (!lectureForm.title.trim()) {
        toast.error("Please enter a lecture title");
        return;
      }

      if (!lectureForm.description.trim()) {
        toast.error("Please enter a lecture description");
        return;
      }

      if (!lectureForm.videoUrl && !id) {
        toast.error("Please upload a video");
        return;
      }

      if (lectureForm.mcqs.length < 3) {
        toast.error("Please add at least 3 MCQs");
        return;
      }

      // Validate MCQs
      for (const mcq of lectureForm.mcqs) {
        if (!mcq.question.trim()) {
          toast.error("Please fill in all MCQ questions");
          return;
        }

        if (mcq.correctOption === null) {
          toast.error("Please select a correct answer for all MCQs");
          return;
        }

        if (mcq.options.some((opt) => !opt.trim())) {
          toast.error("Please fill in all MCQ options");
          return;
        }
      }

      const payload = new FormData();
      payload.append("title", lectureForm.title);
      payload.append("description", lectureForm.description);
      payload.append(
        "requiredPassPercentage",
        lectureForm.requiredPassPercentage
      );
      if (lectureForm.videoUrl instanceof File) {
        payload.append("video", lectureForm.videoUrl);
      }
      payload.append("mcqs", JSON.stringify(lectureForm.mcqs));

      let res;
      if (edit) {
        res = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}lecture/${id}`,
          payload,
          {
            withCredentials: true,
          }
        );
        toast.success("Lecture updated successfully");
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}lecture/${id}`,
          payload,
          {
            withCredentials: true,
          }
        );
        toast.success("Lecture created successfully");
      }
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save lecture");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (edit) {
      async function fetchLectureData() {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}lecture/${id}`,
            {
              withCredentials: true,
            }
          );
          console.log(res.data.lecture);
          setLectureForm({
            ...res.data.lecture,
            videoPreview: res.data.lecture.videoUrl,
          });
        } catch (error) {
          console.error(error);
          toast.error("Failed to fetch lecture data");
          navigate(-1);
        }
      }
      fetchLectureData();
    }
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          className="rounded-full text-white bg-black px-7 py-2 my-5"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8">
          <h2 className="text-2xl font-bold mb-4">
            {edit ? "Edit Lecture" : "Create New Lecture"}
          </h2>
          <form onSubmit={handleLectureSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lecture Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lectureForm.title}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Description field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lecture Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lectureForm.description}
                onChange={(e) =>
                  setLectureForm({
                    ...lectureForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Required pass percentage field */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Pass Percentage <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={lectureForm.requiredPassPercentage}
                onChange={(e) =>
                  setLectureForm({
                    ...lectureForm,
                    requiredPassPercentage: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
                max={100}
                min={0}
              />
            </div>

            {/* Video upload field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lecture Video {!id && <span className="text-red-500">*</span>}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  onChange={handleVideoChange}
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  required={!id}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center relative"
                >
                  {lectureForm.videoPreview ? (
                    <div className="relative w-full">
                      <video
                        src={lectureForm.videoPreview}
                        controls
                        className="max-h-48 w-full"
                        controlsList="nodownload"
                        disablePictureInPicture
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteVideo();
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Video
                        className="h-12 w-12 text-gray-400"
                        controlsList="nodownload"
                        disablePictureInPicture
                      />
                      <span className="mt-2 text-sm text-gray-600">
                        Click to upload video
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* MCQs section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium">
                    MCQs ({lectureForm.mcqs.length}/5)
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                    <Info size={14} className="mr-2" />
                    Single click to edit option • Double click to select correct
                    answer
                  </div>
                </div>
                {lectureForm.mcqs.length < 5 && (
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

              {lectureForm.mcqs.map((mcq, mcqIndex) => (
                <div key={mcqIndex} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      value={mcq.question}
                      onChange={(e) =>
                        handleMcqChange(mcqIndex, "question", e.target.value)
                      }
                      placeholder="Enter question"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg mr-2"
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

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {loading ? <LoadingSpinner /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
