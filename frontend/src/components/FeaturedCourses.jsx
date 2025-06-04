import { Link } from "react-router-dom";
const FeaturedCourses = ({ featuredCourses }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Featured Courses</h2>

        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl">
            {featuredCourses.map((course, index) => (
              <Link key={index} to={`/course/${course.courseId}`}>
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg shadow w-full max-w-sm flex flex-col"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="rounded-lg mb-4 w-full object-cover h-48"
                  />
                  <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                  sad
                  <p className="text-gray-600 mb-2 line-clamp-3">
                    {course.description}
                  </p>
                  <p className="text-gray-800 font-bold mb-2">
                    ₹ {course.price}
                  </p>
                  <p className="text-gray-600">By {course.instructor.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
