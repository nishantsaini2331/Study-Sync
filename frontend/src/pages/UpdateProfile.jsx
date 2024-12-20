import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const UpdateProfile = () => {
  const { username } = useSelector((state) => state.userSlice.user);

  const [initialData, setInitialData] = useState(null); // To hold the original fetched data
  const [formData, setFormData] = useState({
    photoUrl: null,
    name: "",
    headline: "",
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

  const handleChange = (e) => {
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
  };

  useEffect(() => {
    if (initialData) {
      const isEqual = JSON.stringify(formData) === JSON.stringify(initialData);
      setIsSaveDisabled(isEqual);
    }
  }, [formData, initialData]);

  useEffect(() => {
    const fetchUserData = async () => {
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
    };
    fetchUserData();
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaveDisabled(true);
    let formData2 = new FormData();
    formData2.append("name", formData.name);
    formData2.append("headline", formData.headline);
    formData2.append("bio", formData.bio);
    formData2.append("qualification", formData.qualification);
    formData2.append("socials", JSON.stringify(formData.socials));
    if (formData.photoUrl) {
      formData2.append("photoUrl", formData.photoUrl);
    } else {
      formData2.append("photoUrl", initialData.photoUrl);
    }

    try {
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
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6  rounded-lg "
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        Profile & Settings
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Picture */}
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

        {/* Input Fields */}
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
        </div>

        <hr className="md:col-span-2 hidden md:block my-3" />

        {/* Full Width Fields */}
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

          {/* Qualification */}
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

        {/* Social Media Links */}
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

      {/* Save Button */}
      <div className="mt-6 text-center">
        <button
          type="submit"
          className={`py-2 px-6 rounded text-white font-bold ${
            isSaveDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isSaveDisabled}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default UpdateProfile;
