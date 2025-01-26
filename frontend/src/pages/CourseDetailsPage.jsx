import React from "react";
import {
  Clock,
  Book,
  Globe,
  BarChart2,
  Play,
  ShoppingCart,
} from "lucide-react";

const CourseDetailsPage = () => {
  const courseDetails = {
    title: "Advanced Funnels with Google Analytics",
    price: "$99.00 USD",
    instructor: "Albert Flores",
    level: "Intermediate",
    duration: "6hr 44m",
    lessons: 40,
    language: "English",
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{courseDetails.title}</h1>

          <div className="flex items-center gap-2 mb-6">
            <img
              src="/api/placeholder/40/40"
              alt="instructor"
              className="rounded-full"
            />
            <span className="text-gray-600">by {courseDetails.instructor}</span>
          </div>

          <div className="relative aspect-video mb-8">
            <img
              src="/api/placeholder/800/450"
              alt="Course preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-4 rounded-full shadow-lg">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">About the course</h2>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis
                donec massa aliquam id.Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Purus viverra praesent felis consequat
                pellentesque turpis et quisque platea. Eu, elit ut nunc ac
                mauris bibendum nulla placerat.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">What will you learn</h2>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis
                donec massa aliquam id.Lorem ipsum dolor sit amet, consectetur
                adipiscing elit.
              </p>
              <ul className="list-decimal pl-5 space-y-2">
                <li>
                  Sed viverra ipsum nunc aliquet bibendum enim facilisis
                  gravida.
                </li>
                <li>At urna condimentum mattis pellentesque id nibh.</li>
                <li>Magna etiam tempor orci eu lobortis elementum.</li>
                <li>
                  Bibendum est ultricies integer quis. Semper eget duis at
                  tellus.
                </li>
              </ul>
            </section>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <div className="mb-6">
              <h3 className="text-3xl font-bold mb-2">{courseDetails.price}</h3>
              <p className="text-gray-600">
                Provide most popular courses that your want to join and lets
                start the course for the most simply way in here
              </p>
            </div>

            <button className="w-full bg-black text-white py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <BarChart2 className="w-5 h-5" />
                  <span>Course Level</span>
                </div>
                <span>{courseDetails.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Course Duration</span>
                </div>
                <span>{courseDetails.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Book className="w-5 h-5" />
                  <span>Lessons</span>
                </div>
                <span>{courseDetails.lessons}</span>
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

export default CourseDetailsPage;
