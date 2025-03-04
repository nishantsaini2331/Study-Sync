import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  BookOpen,
  Star,
  Globe,
  Filter,
  IndianRupee,
  X,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const CoursesPage = () => {
  const [filters, setFilters] = useState({
    category: "",
    rating: "",
    language: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState([
    {
      courseId: "1",
      title: "Complete Web Development Bootcamp",
      description: "Learn full-stack web development from scratch",
      instructor: {
        name: "John Doe",
        username: "john_doe",
      },
      rating: 4.8,
      enrolledStudents: 12345,
      price: 89.99,
      category: {
        name: "Web Development",
      },
      language: "English",
      thumbnail: "/api/placeholder/280/160",
    },
    {
      courseId: "2",
      title: "Python for Data Science and Machine Learning",
      description: "Learn Python for data science and machine learning",
      instructor: {
        name: "Jane Doe",
        username: "jane_doe",
      },
      rating: 4.5,
      enrolledStudents: 54321,
      price: 79.99,
      category: {
        name: "Data Science",
      },
      thumbnail: "/api/placeholder/280/160",
    },
    {
      courseId: "3",
      title: "Complete JavaScript Course",
      description: "Learn JavaScript from scratch",
      instructor: {
        name: "John Doe",
        username: "john_doe",
      },
      rating: 4.7,
      enrolledStudents: 23456,
      price: 69.99,
      category: {
        name: "Web Development",
      },
      thumbnail: "/api/placeholder/280/160",
    },
  ]);

  const [categories, setCategories] = useState([
    "Web Development",
    "Data Science",
    "Programming",
    "Design",
    "Business",
  ]);

  const languages = ["English", "Hindi", "French", "German"];
  const ratings = ["4.5+", "4.0+", "3.5+", "3.0+"];

  const fetchFilteredCourses = useCallback(async (currentFilters, search) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}course/search`,
        {
          params: {
            ...currentFilters,
            search,
          },
        }
      );
      setCourses(response.data.courses);
    } catch (error) {
      //   toast.error("Please try again");
      console.error(error);
    }
  }, []);

  function handleFilterChange(e) {
    setSearchQuery("");
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    fetchFilteredCourses(newFilters, searchQuery);
  }

  function handleSearchChange(e) {
    clearFilters();
    setSearchQuery(e.target.value);
  }

  function clearFilters() {
    setFilters({
      category: "",
      rating: "",
      language: "",
    });

    fetchFilteredCourses(
      {
        category: "",
        rating: "",
        language: "",
      },
      searchQuery
    );
  }

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchFilteredCourses(filters, searchQuery);
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, fetchFilteredCourses]);

  useEffect(() => {
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
        // toast.error("Please try again");
      }
    }
    fetchAllCategories();
    document.title = "Explore Courses | Study Sync";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Explore Courses
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* <select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              {ratings.map((rating) => (
                <option key={rating} value={rating.replace("+", "")}>
                  {rating}
                </option>
              ))}
            </select> */}

            <select
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Languages</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

            {Object.values(filters).some((filter) => filter) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-gray-600"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length ? (
            courses.map((course) => (
              <Link key={course.courseId} to={`/course/${course.courseId}`}>
                <div
                  key={course.courseId}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <BookOpen size={16} />
                      <span>{course.category.name}</span>
                      <Globe size={16} className="ml-2" />
                      <span className="capitalize">{course.language}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {course.description.slice(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star
                          className="fill-yellow-400 text-yellow-400"
                          size={16}
                        />
                        <span className="font-semibold">{course.rating}</span>
                        <span className="text-gray-600">
                          ({course.enrolledStudents} students)
                        </span>
                      </div>
                      <span className="font-bold text-lg flex items-center">
                        <IndianRupee size={17} />
                        {course.price}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-600">
              No courses found. Try changing the filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
