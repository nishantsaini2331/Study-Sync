import React, { useEffect, useState } from "react";
import {
  Clock,
  Book,
  Globe,
  BarChart2,
  Play,
  ShoppingCart,
  IndianRupee,
  BadgeIndianRupee,
  ChevronDown,
  ChevronUp,
  Edit,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

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

const CourseDetailsPage = () => {
  const { courseId } = useParams();

  const navigate = useNavigate();

  const { username, name, email } = useSelector((state) => state?.user?.user);

  const [isEnrolled, setIsEnrolled] = useState(false);

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

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}course/public/${courseId}`
        );

        setCourseDetails(response.data.course);
      } catch (error) {
        console.error(error);
      }
    }

    fetchCourseDetails();
    chechStudentEnrolled(courseId, setIsEnrolled);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4 noselect">
            {courseDetails.title}
          </h1>

          <Link>
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
                  <button className="w-full bg-black text-white py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
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

      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Related Courses</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {relatedCourses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative">
                <img
                  src="/api/placeholder/400/250"
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm">
                  ${course.price}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Book className="w-4 h-4" />
                  <span className="text-sm">{course.lessons} Lesson</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {course.description}
                </p>
                <div className="flex items-center gap-2">
                  <img
                    src="/api/placeholder/32/32"
                    alt={course.instructor}
                    className="rounded-full"
                  />
                  <span className="text-sm text-gray-600">
                    by {course.instructor}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

function CourseContent({ lectureIndex, lecture, length }) {
  const [activeLecture, setActiveLecture] = useState(false);

  return (
    <>
      <div
        onClick={() => setActiveLecture(!activeLecture)}
        className={`bg-gray-100 p-4 cursor-pointer border-gray-400 ${
          lectureIndex === length - 1 ? "" : "border-b"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {activeLecture ? <ChevronUp /> : <ChevronDown />}
            <h3 className="text-lg font-bold">{lecture.title}</h3>
          </div>
          <span>Duration: {lecture.duration}</span>
        </div>
      </div>
      {activeLecture && (
        <p
          className={`text-gray-600 p-3  border-gray-400 ${
            lectureIndex === length - 1 ? "" : "border-b"
          }`}
        >
          {lecture.description}
        </p>
      )}
    </>
  );
}

export default CourseDetailsPage;
