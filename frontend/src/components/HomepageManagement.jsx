import { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import axios from "axios";
import { toast } from "react-hot-toast";

const HomePageManagement = ({ role }) => {
  const [loading, setLoading] = useState(true);
  const [courseCategories, setCourseCategories] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const [fetchedData, setFetchedData] = useState([]);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}home-page`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load homepage data");
      }

      const data = await res.json();

      if (data.data) {
        setCourseCategories(data.data.courseCategories || []);
        setFeaturedCourses(data.data.featuredCourses || []);
        setTestimonials(data.data.testimonials || []);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load homepage data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomePageData();
    document.title = "Home Page Management";
  }, []);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFetchedData([]);
  };

  const handleAddCategory = async (categoryId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}home-page/categories/${categoryId}`,
        {
          withCredentials: true,
        }
      );

      await fetchHomePageData();
      toast.success("Category added successfully!");
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to add category");
    }
  };

  const handleRemoveCategory = async (categoryId) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}home-page/categories/${categoryId}`,
        {
          withCredentials: true,
        }
      );

      await fetchHomePageData();
      toast.success("Category removed successfully!");
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to remove category");
    }
  };

  const handleAddCourse = async (courseId) => {
    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }home-page/featured-courses/${courseId}`,
        {
          withCredentials: true,
        }
      );

      await fetchHomePageData();
      toast.success("Featured course added successfully!");
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to add featured course");
    }
  };

  const handleRemoveCourse = async (courseId) => {
    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }home-page/featured-courses/${courseId}`,
        {
          withCredentials: true,
        }
      );
      await fetchHomePageData();
      toast.success("Featured course removed successfully!");
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to remove featured course");
    }
  };

  const handleAddTestimonial = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}home-page/testimonials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testimonialForm),
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to add testimonial");
      }

      await fetchHomePageData();
      alert("Testimonial added successfully!");
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to add testimonial");
    }
  };

  async function fetchData(modalType) {
    try {
      setLoading(true);
      let url;
      if (modalType === "course") {
        url = `${import.meta.env.VITE_BACKEND_URL}admin/all-courses`;
      } else if (modalType === "testimonial") {
        url = `${import.meta.env.VITE_BACKEND_URL}admin/all-testimonials`;
      } else {
        url = `${import.meta.env.VITE_BACKEND_URL}admin/all-categories`;
      }
      const res = await axios.get(url, {
        withCredentials: true,
      });

      if (res.data) {
        setFetchedData(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load homepage data");
    } finally {
      setLoading(false);
    }
  }

  const renderModalContent = () => {
    switch (modalType) {
      case "category":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Add New Category</h3>
            {fetchedData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{category.name}</span>
                {courseCategories.some((cat) => cat._id === category._id) ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveCategory(category._id);
                    }}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCategory(category._id);
                    }}
                    className="text-green-500"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case "course":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Add Featured Course</h3>
            {fetchedData.map((course, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{course.title}</span>
                {featuredCourses.some(
                  (cat) => cat.courseId === course.courseId
                ) ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveCourse(course.courseId);
                    }}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCourse(course.courseId);
                    }}
                    className="text-green-500"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case "testimonial":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Add New Testimonial</h3>
            <div className="flex flex-wrap justify-center gap-8 max-w-6xl">
              {fetchedData.map((item, index) => (
                <div key={index} className="flex items-stretch gap-5 justify-between">
                  <div
                    key={item._id}
                    className="bg-white  p-5 rounded-lg shadow w-[50%]  flex flex-col transition-all hover:shadow-md"
                  >
                    <div className="mb-3">
                      <p className="text-gray-700 italic text-sm leading-relaxed">
                        "
                        {item.review ||
                          "I have learned a lot from this course."}
                        "
                      </p>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <h4 className="font-bold text-blue-600">
                        {item.student.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {item.course.title}
                      </p>
                    </div>
                  </div>
                  {testimonials.some((item2) => item._id === item2._id) ? (
                    <button
                      type="button"
                      onClick={() => {
                        // handleRemoveTestimonial(item._id);
                      }}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleAddTestimonial(item._id);
                      }}
                      className="text-green-500"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCategories = () => {
    if (courseCategories.length === 0) {
      return <p className="text-gray-500 italic">No categories added yet.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courseCategories.map((category, index) => (
          <div
            key={category.id || index}
            className="bg-white p-4 rounded-md shadow border"
          >
            <h4 className="font-semibold text-lg">{category.name}</h4>
            <p className="text-gray-600 text-sm mt-1">{category.description}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderFeaturedCourses = () => {
    if (featuredCourses.length === 0) {
      return (
        <p className="text-gray-500 italic">No featured courses added yet.</p>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredCourses.map((course, index) => (
          <div
            key={course.id || index}
            className="bg-white p-4 rounded-md shadow border"
          >
            {course.imageUrl && (
              <div className="h-40 bg-gray-200 mb-3 rounded overflow-hidden">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h4 className="font-semibold text-lg">{course.title}</h4>
            <p className="text-gray-600 text-sm mt-1">{course.description}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderTestimonials = () => {
    if (testimonials.length === 0) {
      return <p className="text-gray-500 italic">No testimonials added yet.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id || index}
            className="bg-white p-4 rounded-md shadow border"
          >
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < testimonial.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-700 italic mb-2">"{testimonial.content}"</p>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-gray-600 text-sm">{testimonial.role}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <DashboardHeader
        title="Home Page Management"
        description="Here you can manage the content displayed on your website's homepage."
        role={role}
      />

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Course Categories</h3>
                <button
                  onClick={() => {
                    openModal("category");
                    fetchData("category");
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Add
                </button>
              </div>
              <div className="mt-4">{renderCategories()}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Featured Courses</h3>
                <button
                  onClick={() => {
                    openModal("course");
                    fetchData("course");
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Add
                </button>
              </div>
              <div className="mt-4">{renderFeaturedCourses()}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Testimonials</h3>
                <button
                  onClick={() => {
                    openModal("testimonial");
                    fetchData("testimonial");
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Add
                </button>
              </div>
              <div className="mt-4">{renderTestimonials()}</div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              {renderModalContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePageManagement;
