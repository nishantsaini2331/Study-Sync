const CourseCategories = ({ courseCategories }) => {
  return (
    <section id="courseCategory" className="py-16 bg-gray-50">
      <div className=" mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Course Categories</h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-10 max-w-screen-lg w-full">
            {courseCategories.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-xl mb-4">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseCategories;
