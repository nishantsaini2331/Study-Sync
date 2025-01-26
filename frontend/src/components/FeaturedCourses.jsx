const FeaturedCourses = () => {
  const courses = [
    {
      title: "Master node js",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
      instructor: "John Doe",
      price: 498,
      thumbnail:
        "https://res.cloudinary.com/digkgdovw/image/upload/v1734875786/jw1nojiywvtk5bkxaolo.png",
    },
    {
      title: "Master Redux toolkit",
      description:
        "masterLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",

      instructor: "Sam Altman",
      price: 498,
      thumbnail:
        "https://res.cloudinary.com/digkgdovw/image/upload/v1734928631/bd54v9y9scpwhrjx93ul.png",
    },
    {
      title: "Master Tailwind",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      instructor: "Alex Carry",
      price: 499,
      thumbnail:
        "https://res.cloudinary.com/digkgdovw/image/upload/v1734929101/clqzdgrxl7hboblrnbuf.png",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Featured Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div
              key={index}
              className="flex flex-col bg-gray-50 p-6 rounded-lg shadow"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="rounded-lg mb-4"
              />
              <h3 className="font-bold text-xl mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-2 line-clamp-3">
                {course.description}
              </p>
              <p className="text-gray-800 font-bold mb-2">₹ {course.price}</p>
              <p className="text-gray-600">By {course.instructor}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
