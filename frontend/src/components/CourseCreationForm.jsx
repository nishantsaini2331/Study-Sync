import axios from "axios";
import { ImagePlus, Info, Trash2, Video, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export default function CourseCreationForm({ edit = false }) {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const initialFormState = {
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
  };

  const [formData, setFormData] = useState(initialFormState);
  const [course, setCourse] = useState({});
  const [initialData, setInitialData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [currentPoint, setCurrentPoint] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
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
  }

  function handleInputChange(field, value) {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    checkForModifications();
  }

  function checkForModifications() {
    const hasChanges = Object.keys(formData).some(
      (key) =>
        JSON.stringify(formData[key]) !== JSON.stringify(initialData[key])
    );
    return hasChanges;
  }

  function handlePointAdd(e) {
    e.preventDefault();
    if (!currentPoint.trim()) return;

    if (formData.whatYouWillLearn.length + 1 > 7) {
      toast.error("What you will learn should not be more than 7 points");
      setErrors({
        ...errors,
        whatYouWillLearn: "Maximum 7 points are allowed",
      });
    } else {
      setFormData({
        ...formData,
        whatYouWillLearn: [...formData.whatYouWillLearn, currentPoint.trim()],
      });
      setCurrentPoint("");
      setErrors({ ...errors, whatYouWillLearn: undefined });
    }
  }

  function removeWhatYouWillLearn(index) {
    const newWhatYouWillLearn = formData.whatYouWillLearn.filter(
      (_, i) => i !== indexconst
    );
    setFormData({ ...formData, whatYouWillLearn: newWhatYouWillLearn });
    checkForModifications();
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
      checkForModifications();
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
      checkForModifications();
    }
  }

  function removeThumbnail(e) {
    e.stopPropagation();
    setFormData({ ...formData, thumbnail: null });
    setThumbnailPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    checkForModifications();
  }

  function removeVideo(e) {
    e.stopPropagation();
    setFormData({ ...formData, previewVideo: null });
    setVideoPreview("");
    if (videoInputRef.current) videoInputRef.current.value = "";
    checkForModifications();
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
    checkForModifications();
  }

  function removeTag(tagToRemove) {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
    checkForModifications();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "tags" || key === "whatYouWillLearn") {
        payload.append(key, JSON.stringify(value));
      } else if (value !== null) {
        payload.append(key, value);
      }
    });

    if (course?.status === "published") {
      alert("You can't edit a published course");
      setIsSubmitting(false);
    } else {
      try {
        const endpoint = edit
          ? `${import.meta.env.VITE_BACKEND_URL}course/${courseId}`
          : `${import.meta.env.VITE_BACKEND_URL}course`;

        const method = edit ? axios.patch : axios.post;

        const res = await method(endpoint, payload, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(
          res.data.message ||
            `Course ${edit ? "updated" : "created"} successfully!`
        );
        navigate(-1);
      } catch (error) {
        console.error("Course submission error:", error);
        toast.error(
          error.response?.data?.message ||
            `Failed to ${edit ? "update" : "create"} course`
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function renderError(field) {
    return errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;
  }

  useEffect(() => {
    async function checkForInstructorCourseCreation() {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }instructor/can-instructor-create-course`,
          { withCredentials: true }
        );
        if (!res.data.canCreateCourse) {
          toast.error("You have reached your course upload limit.");
          navigate("/instructor/dashboard");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to check course limit"
        );
      }
    }
    checkForInstructorCourseCreation();
  }, []);

  useEffect(() => {
    if (courseId && edit) {
      checkForModifications();
      async function fetchCourseData() {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}course/${courseId}`,
            { withCredentials: true }
          );
          const course = res.data.course;

          let data = {
            title: course?.title || "",
            description: course?.description || "",
            price: course?.price || "",
            thumbnail: course?.thumbnail || null,
            previewVideo: course?.previewVideo || null,
            tags: course?.tags || [],
            minimumSkill: course?.minimumSkill || "beginner",
            language: course?.language || "english",
            requiredCompletionPercentage:
              course?.requiredCompletionPercentage || 50,
            category: course?.category?.name.toLowerCase() || "",
            whatYouWillLearn: course?.whatYouWillLearn || [],
          };

          setCourse(course);
          setFormData(data);
          setInitialData(data);
          setThumbnailPreview(course?.thumbnail || "");
          setVideoPreview(course?.previewVideo || "");
        } catch (error) {
          console.error("Error fetching course data:", error);
          toast.error("Failed to load course data");
        }
      }

      fetchCourseData();
    }

    async function fetchAllCategories() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}category`,
          { withCredentials: true }
        );
        setCategories(res?.data?.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    }

    fetchAllCategories();
  }, [courseId, edit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8"
      >
        <button
          type="button"
          className="rounded-full text-white bg-black px-7 py-2 my-5"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {edit ? "Edit Course" : "Create New Course"}
        </h1>

        <div className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="title"
            >
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter course title"
            />
            {renderError("title")}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="description"
            >
              Course Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter course description"
            />
            {renderError("description")}
          </div>
          <div>
            <label
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
              htmlFor="whatYouWillLearn"
            >
              What Will You Learn <span className="text-red-500">*</span>
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full ml-2">
                <Info size={14} className="mr-2" />
                Maximum 7 points
              </div>
            </label>

            <div className="flex gap-2">
              <input
                id="whatYouWillLearn"
                name="whatYouWillLearn"
                type="text"
                value={currentPoint}
                onChange={(e) => setCurrentPoint(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePointAdd(e);
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.whatYouWillLearn ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter a learning point and press Enter"
              />
              <button
                type="button"
                onClick={handlePointAdd}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {formData.whatYouWillLearn.map((point, index) => (
                <div
                  key={index}
                  className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg flex items-center justify-between"
                >
                  <span>{point}</span>
                  <button
                    type="button"
                    onClick={() => removeWhatYouWillLearn(index)}
                    className="bg-red-500 rounded-full text-white p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {renderError("whatYouWillLearn")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="minimumSkill"
              >
                Minimum Skill <span className="text-red-500">*</span>
              </label>
              <select
                id="minimumSkill"
                name="minimumSkill"
                value={formData.minimumSkill}
                onChange={(e) =>
                  handleInputChange("minimumSkill", e.target.value)
                }
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

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="language"
              >
                Language <span className="text-red-500">*</span>
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={(e) => handleInputChange("language", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.language ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
              {renderError("language")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="category"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))
                ) : (
                  <option value="">Loading categories...</option>
                )}
              </select>
              {renderError("category")}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="requiredCompletionPercentage"
              >
                Required Pass Percentage <span className="text-red-500">*</span>
              </label>
              <input
                id="requiredCompletionPercentage"
                name="requiredCompletionPercentage"
                type="number"
                value={formData.requiredCompletionPercentage}
                onChange={(e) =>
                  handleInputChange(
                    "requiredCompletionPercentage",
                    e.target.value
                  )
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.requiredCompletionPercentage
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter required pass percentage"
                max="100"
                min="0"
              />
              {renderError("requiredCompletionPercentage")}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="price"
            >
              Course Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter price"
                min="0"
              />
            </div>
            {renderError("price")}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="thumbnail"
            >
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
                    onClick={removeThumbnail}
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
                id="thumbnail"
                name="thumbnail"
                type="file"
                ref={fileInputRef}
                onChange={handleThumbnailChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            {renderError("thumbnail")}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="previewVideo"
            >
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
                    onClick={removeVideo}
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
                id="previewVideo"
                name="previewVideo"
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
                className="hidden"
              />
            </div>
            {renderError("previewVideo")}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="tags"
            >
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
            <div className="flex gap-2">
              <input
                id="tags"
                name="tags"
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagInput}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.tags ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Type a tag and press Space or Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            {renderError("tags")}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={!checkForModifications() || isSubmitting}
            className={`w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 ${
              !checkForModifications() || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting
              ? "Processing..."
              : edit
              ? "Update Course"
              : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
