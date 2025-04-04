import axios from "axios";
import {
  BadgeIndianRupee,
  BarChart2,
  Book,
  Edit,
  Globe,
  IndianRupee,
  MessageSquare,
  ShoppingCart,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/CommentSystem";
import CourseContent from "../components/CourseContent";
import RatingStars from "../components/RatingStars";
import RelatedCourses from "../components/RelatedCourses";
import ReviewAndRating from "../components/ReviewAndRating";
import { addToCart, removeFromCart } from "../store/userSlice";

export async function chechStudentEnrolled(courseId, setIsEnrolled = () => {}) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}course/check-enrolled/${courseId}`,
      {
        withCredentials: true,
      }
    );

    if (response.data.isEnrolled) {
      //   navigate(`/course/${courseId}/learn`);
      setIsEnrolled(true);
      return true;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function handleRemoveFromCart(username, dispatch, courseId) {
  if (!username) {
    toast.error("Please login to remove from cart");
    navigate("/login");
    return;
  }

  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}cart/${courseId}`,
      {
        withCredentials: true,
      }
    );

    if (response.data.success) {
      dispatch(removeFromCart(courseId));
      toast.success("Course removed from cart");
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to remove course from cart"
    );
  }
}

const CourseDetailsPage = () => {
  const { id: courseId } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { username, name, email, cart } = useSelector(
    (state) => state?.user?.user
  );

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [userReviewData, setUserReviewData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [courseDetails, setCourseDetails] = useState({
    title: "Advanced Funnels with Google Analytics",
    price: "99.00",
    instructor: {
      name: "Albert Flores",
      username: "albertflores",
      photo: "/api/placeholder/40/40",
    },
    minimumSkill: "Intermediate",
    // duration: "6hr 44m",
    lectures: [
      {
        title: "Introduction",
        description: "Introduction to the course",
        duration: "00:05:00",
      },
      {
        title: "Understanding the basics",
        description: "Understanding the basics of Google Analytics",
        duration: "00:15:00",
      },
      {
        title: "Creating advanced funnels",
        description: "Creating advanced funnels in Google Analytics",
        duration: "00:30:00",
      },
      {
        title: "Understanding user behavior",
        description: "Understanding user behavior in Google Analytics",
        duration: "00:45:00",
      },
      {
        title: "Optimizing your website",
        description: "Optimizing your website with Google Analytics",
        duration: "00:45:00",
      },
    ],
    previewVideo: "",
    language: "English",
    description: "Learn how to build advanced funnels with Google Analytics",
    whatYouWillLearn: [
      "Understand the basics of Google Analytics",
      "Create advanced funnels",
      "Analyze user behavior",
      "Optimize your website",
    ],

    reviewAndRating: [
      {
        rating: 4.5,
        review:
          "The course is very informative and the instructor is very knowledgeable",
        student: {
          name: "John Doe",
          username: "johndoe",
          photoUrl: "/api/placeholder/40/40",
        },
        course: {
          title: "Advanced Funnels with Google Analytics",
          courseId: "advanced-funnels-with-google-analytics",
        },
      },
      {
        rating: 4.5,
        review:
          "The course is very informative and the instructor is very knowledgeable",
        student: {
          name: "John Doe",
          username: "johndoe",
          photoUrl: "/api/placeholder/40/40",
        },
        course: {
          title: "Advanced Funnels with Google Analytics",
          courseId: "advanced-funnels-with-google-analytics",
        },
      },
    ],
    averageRating: 4.5,
  });

  const relatedCourses = [
    {
      title: "The Complete Copywriting",
      lessons: 17,
      price: "$99.00",
      instructor: "Albert Flores",
      description:
        "Provide most popular courses that your want to join and lets start the course for the most simply way in here",
    },
    {
      title: "The Complete Copywriting",
      lessons: 17,
      price: "$99.00",
      instructor: "Albert Flores",
      description:
        "Provide most popular courses that your want to join and lets start the course for the most simply way in here",
    },
    {
      title: "The Complete Copywriting",
      lessons: 17,
      price: "$99.00",
      instructor: "Albert Flores",
      description:
        "Provide most popular courses that your want to join and lets start the course for the most simply way in here",
    },
  ];

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePayment() {
    if (!username) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (
      confirm(
        "Are you sure you want to buy this course ? We don't have any refund policy"
      )
    ) {
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!res) {
        alert("Failed to load Razorpay SDK");
        return;
      }

      try {
        const {
          data: { data },
        } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}payment/create-order`,
          {
            amount: courseDetails.price,
            courseId,
          },
          {
            withCredentials: true,
          }
        );

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.id,
          name: "Study Sync",
          description: `Purchase of ${courseDetails.title}`,
          handler: async (response) => {
            try {
              const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}payment/verify-payment`,
                {
                  courseId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
                {
                  withCredentials: true,
                }
              );

              console.log(data);
              if (data.success) {
                toast.success("Payment successful");
                chechStudentEnrolled(courseId, setIsEnrolled);
              }
            } catch (error) {
              console.log(error);
              toast.error("Payment failed please try again");
            }
          },
          prefill: {
            name,
            email,
          },
          theme: {
            color: "#f5a623",
          },
        };

        const paymentObject = new window.Razorpay(options);

        paymentObject.open();
      } catch (error) {
        toast.error(
          error.response.data.message ||
            "Something went wrong. Please try again"
        );
      }
    }
  }

  async function handleSubmitReview() {
    if (!username) {
      toast.error("Please login to submit a review");
      navigate("/login");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!userReview) {
      toast.error("Please write a review");
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}review-and-rating/${courseId}`,
        {
          rating: userRating,
          review: userReview,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Review submitted successfully");

        const newReview = response.data.data;
        setCourseDetails((prev) => {
          const newTotalReviews = prev.reviewAndRating.length + 1;

          const totalPoints =
            prev.averageRating * prev.reviewAndRating.length + userRating;
          const newAverageRating = totalPoints / newTotalReviews;

          return {
            ...prev,
            reviewAndRating: [...prev.reviewAndRating, newReview],
            averageRating: newAverageRating,
          };
        });
        setHasUserReviewed(true);
        setUserReviewData({
          rating: userRating,
          review: userReview,
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleEditReview() {
    setSubmittingReview(true);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}review-and-rating/${courseId}`,
        {
          rating: userRating,
          review: userReview,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Review updated successfully");

        const updatedReview = {
          ...userReviewData,
          rating: userRating,
          review: userReview,
          createdAt: new Date(),
        };

        setCourseDetails((prev) => {
          const oldRating = userReviewData.rating;
          const totalPoints =
            prev.averageRating * prev.reviewAndRating.length -
            oldRating +
            userRating;
          const newAverageRating = totalPoints / prev.reviewAndRating.length;

          const updatedReviews = prev.reviewAndRating.map((review) =>
            review.student.username === username ? updatedReview : review
          );

          return {
            ...prev,
            reviewAndRating: updatedReviews,
            averageRating: newAverageRating,
          };
        });

        // Update user review data
        setUserReviewData({
          rating: userRating,
          review: userReview,
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  async function checkUserReview() {
    if (!username) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}review-and-rating/${courseId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setHasUserReviewed(true);
        setUserReviewData(response.data.data);
        setUserRating(response.data.data.rating);
        setUserReview(response.data.data.review);
      }
    } catch (error) {
      console.error("Error checking user review:", error);
    }
  }

  async function handleDeleteReview() {
    if (!username) {
      toast.error("Please login to delete a review");
      navigate("/login");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}review-and-rating/${courseId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Review deleted successfully");

        setCourseDetails((prev) => {
          const totalReviews = prev.reviewAndRating.length - 1;

          if (totalReviews === 0) {
            return {
              ...prev,
              reviewAndRating: [],
              averageRating: 0,
            };
          }

          const totalPoints =
            prev.averageRating * prev.reviewAndRating.length -
            userReviewData.rating;
          const newAverageRating = totalPoints / totalReviews;

          return {
            ...prev,
            reviewAndRating: prev.reviewAndRating.filter(
              (review) => review.student.username !== username
            ),
            averageRating: newAverageRating,
          };
        });

        setHasUserReviewed(false);
        setUserRating(0);
        setUserReview("");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete review. Please try again."
      );
    }
  }

  async function handleAddToCart() {
    if (!username) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}cart/${courseId}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        dispatch(addToCart(courseId));
        toast.success("Course added to cart");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add course to cart"
      );
    }
  }

  useEffect(() => {
    async function fetchCourseDetails() {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}course/public/${courseId}`
        );

        setCourseDetails(response.data.course);
      } catch (error) {
        navigate("/courses");
        toast.error(
          error.response?.data?.message || "Failed to fetch course details"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourseDetails();
    chechStudentEnrolled(courseId, setIsEnrolled);
  }, []);

  useEffect(() => {
    if (isEnrolled && username) {
      checkUserReview();
    }
  }, [isEnrolled, username]);

  useEffect(() => {
    if (username && courseDetails.reviewAndRating) {
      const userReview = courseDetails.reviewAndRating.find(
        (review) => review.student.username === username
      );
      if (userReview) {
        setHasUserReviewed(true);
        setUserReviewData(userReview);
        setUserRating(userReview.rating);
        setUserReview(userReview.text);
      }
    }
  }, [username, courseDetails.reviews]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4 noselect">
            {courseDetails.title}
          </h1>

          <Link to={`/profile/${courseDetails.instructor.username}`}>
            <div className="flex items-center gap-2 mb-6">
              <img
                src={courseDetails.instructor.photoUrl}
                alt="instructor"
                className="rounded-full w-10 h-10"
              />
              <span className="text-gray-600 text-2xl underline hover:decoration-yellow-400">
                by {courseDetails.instructor.name}
              </span>
            </div>
          </Link>

          <div className="relative aspect-video mb-8">
            <video
              src={courseDetails.previewVideo}
              controls
              className="w-full h-full object-cover rounded-lg"
              controlsList="nodownload"
              disablePictureInPicture
            />
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">About the course</h2>
              <p className="text-gray-600">{courseDetails.description}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">What you will learn</h2>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis
                donec massa aliquam id.Lorem ipsum dolor sit amet, consectetur
                adipiscing elit.
              </p>
              <ul className="list-decimal pl-5 space-y-2">
                {courseDetails.whatYouWillLearn.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              <div className="flex flex-col border border-gray-400">
                {courseDetails.lectures.map((lecture, index) => (
                  <CourseContent
                    key={index}
                    lectureIndex={index}
                    length={courseDetails.lectures.length}
                    lecture={lecture}
                  />
                ))}
              </div>
            </section>

            <ReviewAndRating
              courseDetails={courseDetails}
              user={{
                isEnrolled,
                username: username,
                hasReviewed: hasUserReviewed,
              }}
              userReviewData={{
                rating: userRating,
                review: userReview,
                isSubmitting: submittingReview,
              }}
              reviewActions={{
                setRating: setUserRating,
                setReview: setUserReview,
                submitReview: handleSubmitReview,
                editReview: handleEditReview,
                deleteReview: handleDeleteReview,
              }}
            />
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <div className="mb-6">
              <div className="flex items-center gap-1 text-3xl font-bold mb-2">
                <IndianRupee />
                <h3>{courseDetails.price}</h3>
              </div>
              <p className="text-gray-600">
                Provide most popular courses that your want to join and lets
                start the course for the most simply way in here
              </p>
            </div>

            {!isEnrolled ? (
              username === courseDetails?.instructor?.username ? (
                <Link to={`/course-preview/${courseId}`}>
                  <button className="w-full bg-black text-white py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit Course
                  </button>
                </Link>
              ) : (
                <>
                  <button
                    onClick={
                      cart.includes(courseId)
                        ? () =>
                            handleRemoveFromCart(username, dispatch, courseId)
                        : () => handleAddToCart()
                    }
                    className="w-full bg-black text-white py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cart.includes(courseId)
                      ? "Remove from cart"
                      : "Add to cart"}
                  </button>

                  <button
                    onClick={handlePayment}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2"
                  >
                    <BadgeIndianRupee className="w-5 h-5" />
                    Buy Now
                  </button>
                </>
              )
            ) : (
              <Link to={`/course/${courseId}/learn`}>
                <div className="w-full bg-black text-white py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2">
                  Go to course
                </div>
              </Link>
            )}

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Course Reviews</span>
              </div>
              <div className="flex items-center mb-2">
                <RatingStars rating={courseDetails.averageRating} />
                <span className="ml-2 text-gray-600 text-sm">
                  {courseDetails.averageRating.toFixed(1)} (
                  {courseDetails.reviewAndRating.length} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4 capitalize">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <BarChart2 className="w-5 h-5" />
                  <span>Course Level</span>
                </div>
                <span>{courseDetails.minimumSkill}</span>
              </div>
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Course Duration</span>
                </div>
                <span>{courseDetails.duration}</span>
              </div> */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Book className="w-5 h-5" />
                  <span>Lectures</span>
                </div>
                <span>{courseDetails.lectures.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-5 h-5" />
                  <span>Language</span>
                </div>
                <span>{courseDetails.language}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedCourses relatedCourses={relatedCourses} />
    </div>
  );
};

export default CourseDetailsPage;
