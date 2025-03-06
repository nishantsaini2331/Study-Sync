import { BookOpen, ExternalLink, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "./CommentSystem";
import toast from "react-hot-toast";
import axios from "axios";
import { Link } from "react-router-dom";
import { handleRemoveFromCart } from "../pages/CourseDetailsPage";
import { useDispatch, useSelector } from "react-redux";

function StudentCartCourses() {
  const [cartCourses, setCartCourses] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { username } = useSelector((state) => state?.user?.user);
  async function fetchCartCourses() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}student/cart-courses`,
        { withCredentials: true }
      );
      setCartCourses(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message || "Please try again later");
    }
  }
  useEffect(() => {
    fetchCartCourses();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="bg-indigo-600 px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-white">
          Cart Courses
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Your cart courses
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {cartCourses && cartCourses.length > 0 ? (
          cartCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white shadow-lg rounded-lg p-4 flex flex-col"
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="rounded-lg h-40 w-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                  <BookOpen size={20} />
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <h1 className="text-xl font-bold">{course.title}</h1>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {course.description.slice(0, 100)}...
              </p>
              <div className="mt-auto pt-4">
                <Link to={`/course/${course.courseId}`}>
                  <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300">
                    <span>Go to Course</span>
                    <ExternalLink size={16} className="ml-2" />
                  </button>
                </Link>
              </div>
              <div
                className="mt-auto pt-4"
                onClick={async () => {
                  await handleRemoveFromCart(
                    username,
                    dispatch,
                    course.courseId
                  );
                  await fetchCartCourses();
                }}
              >
                <button className="w-full mt-2 bg-red-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300">
                  <span>Remove from cart</span>
                  <Trash2 size={16} className="ml-2 text-black" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No courses cart yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCartCourses;
