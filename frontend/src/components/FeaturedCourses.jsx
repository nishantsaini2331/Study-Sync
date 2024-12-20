const FeaturedCourses = () => {
    const courses = Array(3).fill({
      title: 'The Complete Copywriting',
      lessons: 17,
      price: '$99.00',
      instructor: 'Albert Pores',
    });
  
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Featured Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow">
                <img src="https://via.placeholder.com/300" alt={course.title} className="rounded-lg mb-4" />
                <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-2">{course.lessons} Lessons</p>
                <p className="text-gray-800 font-bold mb-2">{course.price}</p>
                <p className="text-gray-600">By {course.instructor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default FeaturedCourses;
  