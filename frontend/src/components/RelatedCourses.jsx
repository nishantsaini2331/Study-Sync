import { Book } from "lucide-react";
import React from "react";

function RelatedCourses({ relatedCourses }) {
  return (
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
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
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
  );
}

export default RelatedCourses;
