import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import DashboardHeader from "../components/DashboardHeader";
import { LoadingSpinner } from "../components/CommentSystem";

function UpdateProfile({ role }) {
  const { username } = useSelector((state) => state.user.user);

  const [initialData, setInitialData] = useState(null);
  const [formData, setFormData] = useState({
    photoUrl: null,
    name: "",
    headline: "",
    username: "",
    bio: "",
    socials: {
      website: "",
      twitter: "",
      youtube: "",
      github: "",
      linkedin: "",
    },
    qualification: "",
  });

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else if (name.includes("socials.")) {
      const socialKey = name.split(".")[1];
      setFormData({
        ...formData,
        socials: { ...formData.socials, [socialKey]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  useEffect(() => {
    if (initialData) {
      const isEqual = JSON.stringify(formData) === JSON.stringify(initialData);
      setIsSaveDisabled(isEqual);
    }
  }, [formData, initialData]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}user/user/${username}`
        );

        const userData = response.data.user;
        setInitialData(userData);
        setFormData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUserData();
  }, [username]);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaveDisabled(true);
    let formData2 = new FormData();
    formData2.append("name", formData.name);
    formData2.append("headline", formData.headline);
    formData2.append("username", formData.username);
    formData2.append("bio", formData.bio);
    formData2.append("qualification", formData.qualification);
    formData2.append("socials", JSON.stringify(formData.socials));
    if (formData.photoUrl) {
      formData2.append("photoUrl", formData.photoUrl);
    } else {
      formData2.append("photoUrl", initialData.photoUrl);
    }

    try {
      setLoading(true);
      let response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}user/user`,
        formData2,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setInitialData(formData);
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error(error.response.data.message);
    } finally {
      setIsSaveDisabled(true);
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <DashboardHeader
        title={"Profile & Settings"}
        description={"Your profile and settings"}
        role={role}
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-6  rounded-lg "
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Profile & Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 flex flex-col items-center">
            <label
              htmlFor="photoUrl"
              className="w-40 h-40 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer text-gray-500"
            >
              {formData.photoUrl ? (
                <img
                  src={
                    typeof formData.photoUrl === "string"
                      ? formData.photoUrl
                      : URL.createObjectURL(formData.photoUrl)
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "Upload Photo"
              )}
            </label>
            <input
              type="file"
              id="photoUrl"
              name="photoUrl"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
          </div>

          <div className="col-span-1">
            <label className="block mb-2">
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
                placeholder="Enter your name"
              />
            </label>

            <label className="block mb-2">
              Headline
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
                placeholder="Your professional headline"
              />
            </label>

            <label className="block mb-2">
              Username
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
                placeholder="Your professional headline"
              />
            </label>
          </div>

          <hr className="md:col-span-2 hidden md:block my-3" />

          <div className="md:col-span-2">
            <label className="block mb-2">
              Biography
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
                rows={3}
                placeholder="Tell something about yourself"
              />
            </label>

            <label className="block mb-2">
              Website
              <input
                type="url"
                name="socials.website"
                value={formData.socials.website}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
                placeholder="https://example.com"
              />
            </label>
            <label className="block mb-2">
              Qualification
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
              >
                <option value="">Select Qualification</option>
                {[
                  "Secondary (10th Pass)",
                  "Higher Secondary (12th Pass)",
                  "Bachelors",
                  "Masters",
                  "PhD",
                  "Other",
                ].map((qualification) => (
                  <option key={qualification} value={qualification}>
                    {qualification}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {["twitter", "youtube", "github", "linkedin"].map((platform) => (
              <label key={platform}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)} URL
                <input
                  type="url"
                  name={`socials.${platform}`}
                  value={formData.socials[platform]}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded"
                  placeholder={`https://${platform}.com/username`}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="submit"
            className={`p-3 w-30 h-10 rounded text-white text-sm  font-bold ${
              isSaveDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isSaveDisabled}
          >
            {loading ? <LoadingSpinner /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateProfile;
