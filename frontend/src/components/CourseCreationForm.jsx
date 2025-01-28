import React, { useState, useRef, useEffect } from "react";
import { X, Upload, ImagePlus, Video, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function CourseCreationForm({ edit = false }) {
  const navigate = useNavigate();

  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: null,
    previewVideo: null,
    tags: [],
    minimumSkill: "beginner",
    language: "english",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.thumbnail) newErrors.thumbnail = "Thumbnail is required";
    if (!formData.previewVideo)
      newErrors.previewVideo = "Preview video is required";
    if (formData.tags.length === 0)
      newErrors.tags = "At least one tag is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          thumbnail: "File size should be less than 5MB",
        });
        return;
      }
      setFormData({ ...formData, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, thumbnail: undefined });
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setErrors({
          ...errors,
          previewVideo: "File size should be less than 100MB",
        });
        return;
      }
      setFormData({ ...formData, previewVideo: file });
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setErrors({ ...errors, previewVideo: undefined });
    }
  };

  const removeThumbnail = () => {
    setFormData({ ...formData, thumbnail: null });
    setThumbnailPreview("");
    fileInputRef.current.value = "";
  };

  const removeVideo = () => {
    setFormData({ ...formData, previewVideo: null });
    setVideoPreview("");
    videoInputRef.current.value = "";
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      });
      setErrors({ ...errors, tags: undefined });
    }
    setCurrentTag("");
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form Data:", formData);
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("language", formData.language);
      payload.append("minimumSkill", formData.minimumSkill);
      payload.append("thumbnail", formData.thumbnail);
      payload.append("previewVideo", formData.previewVideo);
      payload.append("tags", JSON.stringify(formData.tags));

      try {
        let res;
        if (edit) {
          res = await axios.patch(
            `${import.meta.env.VITE_BACKEND_URL}course/edit-course/${id}`,
            payload,
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}course/create-course`,
            payload,
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
        console.log(res.data);
        toast.success("Course created successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to create course");
      } finally {
        setFormData({
          title: "",
          description: "",
          price: "",
          thumbnail: null,
          previewVideo: null,
          tags: [],
          minimumSkill: "beginner",
          language: "english",
        });
        navigate("/instructor/dashboard");
      }
    }
  };

  const renderError = (field) => {
    return errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;
  };

  useEffect(() => {
    if (id) {
      async function fetchCourseData() {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}course/course/${id}`,
            {
              withCredentials: true,
            }
          );
          const course = res.data.course;
          setFormData({
            title: course.title,
            description: course.description,
            price: course.price,
            thumbnail: course.thumbnail,
            previewVideo: course.previewVideo,
            tags: course.tags,
            minimumSkill: course.minimumSkill,
            language: course.language,
          });
          setThumbnailPreview(course.thumbnail);
          setVideoPreview(course.previewVideo);
        } catch (error) {
          console.error(error);
        }
      }
      fetchCourseData();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8"
      >
        <button
          className="rounded-full text-white bg-black px-7 py-2 my-5"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {edit ? "Edit Course" : "Create New Course"}
        </h1>

        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setErrors({ ...errors, title: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter course title"
            />
            {renderError("title")}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setErrors({ ...errors, description: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter course description"
            />
            {renderError("description")}
          </div>

          {/* Minimum Skill Input */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Skill <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.minimumSkill}
              onChange={(e) => {
                setFormData({ ...formData, minimumSkill: e.target.value });
                setErrors({ ...errors, minimumSkill: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.minimumSkill ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {renderError("minimumSkill")}
          </div>

          {/* Language Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.language}
              onChange={(e) => {
                setFormData({ ...formData, language: e.target.value });
                setErrors({ ...errors, language: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.language ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
            {renderError("language")}
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  setErrors({ ...errors, price: undefined });
                }}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter price"
                min="0"
              />
            </div>
            {renderError("price")}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Thumbnail <span className="text-red-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors ${
                errors.thumbnail ? "border-red-500" : "border-gray-300"
              }`}
              onClick={() => fileInputRef.current.click()}
            >
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeThumbnail();
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload thumbnail
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleThumbnailChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            {renderError("thumbnail")}
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Video <span className="text-red-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors ${
                errors.previewVideo ? "border-red-500" : "border-gray-300"
              }`}
              onClick={() => videoInputRef.current.click()}
            >
              {videoPreview ? (
                <div className="relative">
                  <video
                    src={videoPreview}
                    controls
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVideo();
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <Video className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload preview video
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max size: 100MB</p>
                </div>
              )}
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
                className="hidden"
              />
            </div>
            {renderError("previewVideo")}
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Tags <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-indigo-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagInput}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.tags ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Type and press Space or Enter to add tags"
            />
            {renderError("tags")}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02]"
          >
            {edit ? "Update Course" : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
