import React, { useState, useRef, useEffect } from "react";
import { X, Upload, ImagePlus, Video, Trash2, Info } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function CourseCreationForm({ edit = false }) {
  const navigate = useNavigate();

  const { id: courseId } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: null,
    previewVideo: null,
    tags: [],
    minimumSkill: "beginner",
    language: "english",
    requiredCompletionPercentage: 50,
    category: "Programming",
    whatYouWillLearn: [],
  });

  const [categories, setCategories] = useState([]);
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
    if (!formData.language) newErrors.language = "Language is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.minimumSkill)
      newErrors.minimumSkill = "Minimum skill level is required";
    if (formData.whatYouWillLearn.length === 0)
      newErrors.whatYouWillLearn = "At least one point is required";
    if (formData.whatYouWillLearn.length > 7)
      newErrors.whatYouWillLearn = "Maximum 7 points are allowed";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function removeWhatYouWillLearn(index) {
    const newWhatYouWillLearn = formData.whatYouWillLearn.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, whatYouWillLearn: newWhatYouWillLearn });
  }

  function handleThumbnailChange(e) {
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
  }

  function handleVideoChange(e) {
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
  }

  function removeThumbnail() {
    setFormData({ ...formData, thumbnail: null });
    setThumbnailPreview("");
    fileInputRef.current.value = "";
  }

  function removeVideo() {
    setFormData({ ...formData, previewVideo: null });
    setVideoPreview("");
    videoInputRef.current.value = "";
  }

  function handleTagInput(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addTag();
    }
  }

  function addTag() {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      });
      setErrors({ ...errors, tags: undefined });
    }
    setCurrentTag("");
  }

  function removeTag(tagToRemove) {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (validateForm()) {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("language", formData.language);
      payload.append("minimumSkill", formData.minimumSkill);
      payload.append("thumbnail", formData.thumbnail);
      payload.append("previewVideo", formData.previewVideo);
      payload.append("category", formData.category);
      payload.append(
        "whatYouWillLearn",
        JSON.stringify(formData.whatYouWillLearn)
      );
      payload.append(
        "requiredCompletionPercentage",
        formData.requiredCompletionPercentage
      );
      payload.append("tags", JSON.stringify(formData.tags));

      try {
        let res;

        if (edit) {
          res = await axios.patch(
            `${import.meta.env.VITE_BACKEND_URL}course/${courseId}`,
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
            `${import.meta.env.VITE_BACKEND_URL}course`,
            payload,
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        toast.success(res.data.message || "successful");
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message || "Failed to create course");
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
          requiredCompletionPercentage: 50,
          category: "",
          whatYouWillLearn: [],
        });
        navigate(-1);
      }
    }
  }

  console.log(errors);

  function renderError(field) {
    return errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;
  }

  useEffect(() => {
    if (courseId) {
      async function fetchCourseData() {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}course/${courseId}`,
            {
              withCredentials: true,
            }
          );
          const course = res.data.course;
          setFormData({
            title: course?.title,
            description: course?.description,
            price: course?.price,
            thumbnail: course?.thumbnail,
            previewVideo: course?.previewVideo,
            tags: course?.tags,
            minimumSkill: course?.minimumSkill,
            language: course?.language,
            requiredCompletionPercentage: course?.requiredCompletionPercentage,
            category: course?.category?.name.toLowerCase(),
            whatYouWillLearn: course?.whatYouWillLearn,
          });
          setThumbnailPreview(course?.thumbnail);
          setVideoPreview(course?.previewVideo);
        } catch (error) {
          console.error(error);
        }
      }

      fetchCourseData();
    }
    async function fetchAllCategories() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}category`,
          {
            withCredentials: true,
          }
        );
        setCategories(res?.data?.categories);
      } catch (error) {
        toast.error("Please try again");
      }
    }
    fetchAllCategories();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <form
        // onSubmit={handleSubmit}
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

          {/* What will You Learn Input */}
          <div>
            <label className=" flex  items-center text-sm font-medium text-gray-700 mb-2">
              What Will You Learn <span className="text-red-500">*</span>
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                <Info size={14} className="mr-2" />
                click enter to add & try to keep it short
              </div>
            </label>
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.keyCode === 13) {
                  e.preventDefault();
                  if (formData.whatYouWillLearn.length + 1 > 7) {
                    toast.error(
                      "What you will learn should not be more than 7"
                    );
                    setErrors({ ...errors, whatYouWillLearn: true });
                  } else {
                    setFormData({
                      ...formData,
                      whatYouWillLearn: [
                        ...formData.whatYouWillLearn,
                        e.target.value,
                      ],
                    });
                    e.target.value = "";
                    setErrors({ ...errors, whatYouWillLearn: undefined });
                  }
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.whatYouWillLearn ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter Points"
            />

            <div className="gap-2 mt-2">
              {formData.whatYouWillLearn.map((point, index) => (
                <div
                  key={index}
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 my-1 rounded-full text-lg flex items-center gap-1 justify-between"
                >
                  <span>{point}</span>
                  <button
                    type="button"
                    onClick={() => removeWhatYouWillLearn(index)}
                    className=" bg-red-500 rounded-full text-white p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {renderError("whatYouWillLearn")}
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

          {/* Category Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                console.log(e.target.value);
                setFormData({ ...formData, category: e.target.value });
                setErrors({ ...errors, category: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              {categories?.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
            {renderError("category")}
          </div>

          {/* Required pass percentage field */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Pass Percentage <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.requiredCompletionPercentage}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  requiredCompletionPercentage: e.target.value,
                });
                setErrors({
                  ...errors,
                  requiredCompletionPercentage: undefined,
                });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.language ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter required pass percentage"
              required
              max={100}
              min={0}
            />
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
                    controlsList="nodownload"
                    disablePictureInPicture
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
                  <Video
                    className="mx-auto h-12 w-12 text-gray-400"
                    controlsList="nodownload"
                    disablePictureInPicture
                  />
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
            // type="submit"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02]"
          >
            {edit ? "Update Course" : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
