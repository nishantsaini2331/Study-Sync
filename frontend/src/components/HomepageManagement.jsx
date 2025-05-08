import { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Edit,
  Save,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";

const HomePageManagement = ({ role }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingFeaturedCourse, setEditingFeaturedCourse] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    featuredCourses: true,
    testimonials: true,
  });

  const [newCategory, setNewCategory] = useState({ name: "", courses: [] });
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    description: "",
    price: "",
    instructor: "",
  });
  const [newTestimonial, setNewTestimonial] = useState({
    review: "",
    rating: 5,
    username: "",
    courseEnrolledName: "",
  });

  const [newCourseForCategory, setNewCourseForCategory] = useState("");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}home-page`,
          { withCredentials: true }
        );

        console.log(res.data);
        if (res.data) {
          setCategories(res.data.categories || []);
          setFeaturedCourses(res.data.featuredCourses || []);
          setTestimonials(res.data.testimonials || []);
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to load homepage data"
        );
      } finally {
        setLoading(false);
      }
    }

    // fetchData();
    document.title = "Home Page Management";
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const saveChanges = async (section, data, id = null) => {
    try {
      setLoading(true);
      const endpoint = id
        ? `${import.meta.env.VITE_BACKEND_URL}home-page/${section}/${id}`
        : `${import.meta.env.VITE_BACKEND_URL}home-page/${section}`;

      const method = id ? "put" : "post";

      const response = await axios({
        method,
        url: endpoint,
        data,
        withCredentials: true,
      });

      toast.success(`${section} updated successfully!`);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}home-page`,
        { withCredentials: true }
      );

      if (res.data) {
        setCategories(res.data.categories || []);
        setFeaturedCourses(res.data.featuredCourses || []);
        setTestimonials(res.data.testimonials || []);
      }

      setEditingCategory(null);
      setEditingFeaturedCourse(null);
      setEditingTestimonial(null);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || `Failed to update ${section}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (section, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${section}?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}home-page/${section}/${id}`,
        { withCredentials: true }
      );

      toast.success(`${section} deleted successfully!`);

      if (section === "categories") {
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
      } else if (section === "featuredCourses") {
        setFeaturedCourses((prev) =>
          prev.filter((course) => course._id !== id)
        );
      } else if (section === "testimonials") {
        setTestimonials((prev) =>
          prev.filter((testimonial) => testimonial._id !== id)
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || `Failed to delete ${section}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast.error("Category name is required");
      return;
    }
    saveChanges("categories", newCategory);
    setNewCategory({ name: "", courses: [] });
  };

  const handleAddFeaturedCourse = () => {
    if (!newCourse.courseName || !newCourse.instructor) {
      toast.error("Course name and instructor are required");
      return;
    }
    saveChanges("featuredCourses", newCourse);
    setNewCourse({
      courseName: "",
      description: "",
      price: "",
      instructor: "",
    });
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.username || !newTestimonial.review) {
      toast.error("Username and review are required");
      return;
    }
    saveChanges("testimonials", newTestimonial);
    setNewTestimonial({
      review: "",
      rating: 5,
      username: "",
      courseEnrolledName: "",
    });
  };

  const handleAddCourseToCategory = (categoryIndex) => {
    if (!newCourseForCategory) {
      toast.error("Course name is required");
      return;
    }

    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].courses.push(newCourseForCategory);

    if (
      editingCategory &&
      editingCategory._id === updatedCategories[categoryIndex]._id
    ) {
      setEditingCategory({
        ...editingCategory,
        courses: [...editingCategory.courses, newCourseForCategory],
      });
    }

    saveChanges(
      "categories",
      updatedCategories[categoryIndex],
      updatedCategories[categoryIndex]._id
    );
    setNewCourseForCategory("");
    setSelectedCategoryIndex(null);
  };

  const handleRemoveCourseFromCategory = (categoryIndex, courseIndex) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].courses.splice(courseIndex, 1);

    if (
      editingCategory &&
      editingCategory._id === updatedCategories[categoryIndex]._id
    ) {
      const updatedCourses = [...editingCategory.courses];
      updatedCourses.splice(courseIndex, 1);
      setEditingCategory({ ...editingCategory, courses: updatedCourses });
    }

    saveChanges(
      "categories",
      updatedCategories[categoryIndex],
      updatedCategories[categoryIndex]._id
    );
  };

  if (
    loading &&
    !categories.length &&
    !featuredCourses.length &&
    !testimonials.length
  ) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DashboardHeader
          title="Home Page Management"
          description="Manage your website homepage content"
          role={role}
        />
        <div className="flex justify-center items-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading homepage data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <DashboardHeader
        title="Home Page Management"
        description="Manage your website homepage content"
        role={role}
      />

      <div className="p-6 divide-y divide-gray-200">
        <div className="py-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("categories")}
          >
            <h2 className="text-xl font-bold">Categories Management</h2>
            {expandedSections.categories ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>

          {expandedSections.categories && (
            <div className="mt-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Add New Category</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="e.g., Programming Languages"
                    />
                  </div>
                  <button
                    onClick={handleAddCategory}
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Plus size={16} className="mr-1" /> Add Category
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {categories.map((category, catIndex) => (
                  <div
                    key={category._id || catIndex}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-100 p-4 flex justify-between items-center">
                      <h3 className="font-medium">{category.name}</h3>
                      <div className="flex space-x-2">
                        {editingCategory &&
                        editingCategory._id === category._id ? (
                          <button
                            onClick={() =>
                              saveChanges(
                                "categories",
                                editingCategory,
                                category._id
                              )
                            }
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={loading}
                          >
                            <Save size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingCategory({ ...category })}
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDelete("categories", category._id)
                          }
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingCategory && editingCategory._id === category._id ? (
                      <div className="p-4 bg-white">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Category Name
                          </label>
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                name: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Courses
                          </label>
                          {editingCategory.courses &&
                            editingCategory.courses.map((course, courseIdx) => (
                              <div
                                key={courseIdx}
                                className="flex items-center mt-2"
                              >
                                <input
                                  type="text"
                                  value={course}
                                  onChange={(e) => {
                                    const updatedCourses = [
                                      ...editingCategory.courses,
                                    ];
                                    updatedCourses[courseIdx] = e.target.value;
                                    setEditingCategory({
                                      ...editingCategory,
                                      courses: updatedCourses,
                                    });
                                  }}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                />
                                <button
                                  onClick={() => {
                                    const updatedCourses = [
                                      ...editingCategory.courses,
                                    ];
                                    updatedCourses.splice(courseIdx, 1);
                                    setEditingCategory({
                                      ...editingCategory,
                                      courses: updatedCourses,
                                    });
                                  }}
                                  className="ml-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}

                          <div className="flex items-center mt-3">
                            <input
                              type="text"
                              value={newCourseForCategory}
                              onChange={(e) =>
                                setNewCourseForCategory(e.target.value)
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                              placeholder="New course name"
                            />
                            <button
                              onClick={() => {
                                if (newCourseForCategory) {
                                  setEditingCategory({
                                    ...editingCategory,
                                    courses: [
                                      ...editingCategory.courses,
                                      newCourseForCategory,
                                    ],
                                  });
                                  setNewCourseForCategory("");
                                }
                              }}
                              className="ml-2 p-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="bg-gray-200 text-gray-800 px-3 py-1 rounded mr-2 hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              saveChanges(
                                "categories",
                                editingCategory,
                                category._id
                              )
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            disabled={loading}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Courses:
                        </h4>
                        {category.courses && category.courses.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {category.courses.map((course, courseIdx) => (
                              <li
                                key={courseIdx}
                                className="flex justify-between items-center"
                              >
                                <span>{course}</span>
                                <button
                                  onClick={() =>
                                    handleRemoveCourseFromCategory(
                                      catIndex,
                                      courseIdx
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X size={16} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No courses added yet.
                          </p>
                        )}

                        {selectedCategoryIndex === catIndex ? (
                          <div className="mt-4 flex items-center">
                            <input
                              type="text"
                              value={newCourseForCategory}
                              onChange={(e) =>
                                setNewCourseForCategory(e.target.value)
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                              placeholder="New course name"
                            />
                            <button
                              onClick={() =>
                                handleAddCourseToCategory(catIndex)
                              }
                              className="ml-2 p-1 bg-green-600 text-white rounded hover:bg-green-700"
                              disabled={loading}
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => setSelectedCategoryIndex(null)}
                              className="ml-2 p-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedCategoryIndex(catIndex)}
                            className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Plus size={14} className="mr-1" /> Add Course
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No categories found. Add your first category above.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Featured Courses Section */}
        <div className="py-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("featuredCourses")}
          >
            <h2 className="text-xl font-bold">Featured Courses Management</h2>
            {expandedSections.featuredCourses ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>

          {expandedSections.featuredCourses && (
            <div className="mt-4">
              {/* Add New Featured Course */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Add New Featured Course</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={newCourse.courseName}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          courseName: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="e.g., Introduction to React"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows="3"
                      placeholder="Brief description of the course"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Price
                      </label>
                      <input
                        type="text"
                        value={newCourse.price}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, price: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        placeholder="e.g., $49.99"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Instructor
                      </label>
                      <input
                        type="text"
                        value={newCourse.instructor}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            instructor: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddFeaturedCourse}
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Plus size={16} className="mr-1" /> Add Featured Course
                  </button>
                </div>
              </div>

              {/* List of Featured Courses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredCourses.map((course, index) => (
                  <div
                    key={course._id || index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-100 p-4 flex justify-between items-center">
                      <h3 className="font-medium">{course.courseName}</h3>
                      <div className="flex space-x-2">
                        {editingFeaturedCourse &&
                        editingFeaturedCourse._id === course._id ? (
                          <button
                            onClick={() =>
                              saveChanges(
                                "featuredCourses",
                                editingFeaturedCourse,
                                course._id
                              )
                            }
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={loading}
                          >
                            <Save size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setEditingFeaturedCourse({ ...course })
                            }
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDelete("featuredCourses", course._id)
                          }
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingFeaturedCourse &&
                    editingFeaturedCourse._id === course._id ? (
                      <div className="p-4 bg-white">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Course Name
                          </label>
                          <input
                            type="text"
                            value={editingFeaturedCourse.courseName}
                            onChange={(e) =>
                              setEditingFeaturedCourse({
                                ...editingFeaturedCourse,
                                courseName: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            value={editingFeaturedCourse.description}
                            onChange={(e) =>
                              setEditingFeaturedCourse({
                                ...editingFeaturedCourse,
                                description: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            rows="3"
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Price
                            </label>
                            <input
                              type="text"
                              value={editingFeaturedCourse.price}
                              onChange={(e) =>
                                setEditingFeaturedCourse({
                                  ...editingFeaturedCourse,
                                  price: e.target.value,
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Instructor
                            </label>
                            <input
                              type="text"
                              value={editingFeaturedCourse.instructor}
                              onChange={(e) =>
                                setEditingFeaturedCourse({
                                  ...editingFeaturedCourse,
                                  instructor: e.target.value,
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => setEditingFeaturedCourse(null)}
                            className="bg-gray-200 text-gray-800 px-3 py-1 rounded mr-2 hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              saveChanges(
                                "featuredCourses",
                                editingFeaturedCourse,
                                course._id
                              )
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            disabled={loading}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-2">
                          {course.description}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{course.price}</span>
                          <span className="text-gray-600">
                            Instructor: {course.instructor}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {featuredCourses.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-gray-500">
                    No featured courses found. Add your first course above.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Testimonials Section */}
        <div className="py-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("testimonials")}
          >
            <h2 className="text-xl font-bold">Testimonials Management</h2>
            {expandedSections.testimonials ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>

          {expandedSections.testimonials && (
            <div className="mt-4">
              {/* Add New Testimonial */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Add New Testimonial</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      value={newTestimonial.username}
                      onChange={(e) =>
                        setNewTestimonial({
                          ...newTestimonial,
                          username: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      placeholder="e.g., Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Review
                    </label>
                    <textarea
                      value={newTestimonial.review}
                      onChange={(e) =>
                        setNewTestimonial({
                          ...newTestimonial,
                          review: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows="3"
                      placeholder="Write testimonial review here..."
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newTestimonial.rating}
                        onChange={(e) =>
                          setNewTestimonial({
                            ...newTestimonial,
                            rating: parseInt(e.target.value) || 5,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Course Enrolled
                      </label>
                      <input
                        type="text"
                        value={newTestimonial.courseEnrolledName}
                        onChange={(e) =>
                          setNewTestimonial({
                            ...newTestimonial,
                            courseEnrolledName: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        placeholder="e.g., Advanced JavaScript"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddTestimonial}
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Plus size={16} className="mr-1" /> Add Testimonial
                  </button>
                </div>
              </div>

              {/* List of Testimonials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial._id || index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-100 p-4 flex justify-between items-center">
                      <h3 className="font-medium">{testimonial.username}</h3>
                      <div className="flex space-x-2">
                        {editingTestimonial &&
                        editingTestimonial._id === testimonial._id ? (
                          <button
                            onClick={() =>
                              saveChanges(
                                "testimonials",
                                editingTestimonial,
                                testimonial._id
                              )
                            }
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={loading}
                          >
                            <Save size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setEditingTestimonial({ ...testimonial })
                            }
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDelete("testimonials", testimonial._id)
                          }
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingTestimonial &&
                    editingTestimonial._id === testimonial._id ? (
                      <div className="p-4 bg-white">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Username
                          </label>
                          <input
                            type="text"
                            value={editingTestimonial.username}
                            onChange={(e) =>
                              setEditingTestimonial({
                                ...editingTestimonial,
                                username: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Review
                          </label>
                          <textarea
                            value={editingTestimonial.review}
                            onChange={(e) =>
                              setEditingTestimonial({
                                ...editingTestimonial,
                                review: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            rows="3"
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Rating (1-5)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={editingTestimonial.rating}
                              onChange={(e) =>
                                setEditingTestimonial({
                                  ...editingTestimonial,
                                  rating: parseInt(e.target.value) || 5,
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Course Enrolled
                            </label>
                            <input
                              type="text"
                              value={editingTestimonial.courseEnrolledName}
                              onChange={(e) =>
                                setEditingTestimonial({
                                  ...editingTestimonial,
                                  courseEnrolledName: e.target.value,
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => setEditingTestimonial(null)}
                            className="bg-gray-200 text-gray-800 px-3 py-1 rounded mr-2 hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              saveChanges(
                                "testimonials",
                                editingTestimonial,
                                testimonial._id
                              )
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            disabled={loading}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < testimonial.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          "{testimonial.review}"
                        </p>
                        <p className="text-sm text-gray-500">
                          Course: {testimonial.courseEnrolledName}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {testimonials.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-gray-500">
                    No testimonials found. Add your first testimonial above.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <div className="mr-3">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageManagement;
