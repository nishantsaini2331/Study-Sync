const CourseCategories = () => {
    return (
      <section id="courseCategory"  className="py-16 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Course Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {['Design', 'Development', 'Marketing', 'Personal Development'].map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-xl mb-4">{category}</h3>
                <p className="text-gray-600">Courses: {Math.floor(Math.random() * 100) + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default CourseCategories;
