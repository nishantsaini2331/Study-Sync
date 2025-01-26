import React from "react";

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
            <div className="w-[200px]">
              <img
                src="https://y7b6t9n6.rocketcdn.me/wp-content/uploads/2021/09/7_Advanced_Mobile_eLearning_Tools.png"
                alt="Hero Section"
                className="rounded-lg"
              />
            </div>
            <h3 className="font-bold my-4">Learn from Anywhere</h3>
            <p className="text-gray-600">
              Our platform empowers you to learn new skills from anywhere.
            </p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
            <div className="w-[200px]">
              <img
                src="https://img.freepik.com/premium-vector/it-courses-female-student-studies-programming-online-with-her-laptop-home_441800-131.jpg"
                alt="Hero Section"
                className="rounded-lg"
              />
            </div>
            <h3 className="font-bold my-4">Courses Taught by Experts</h3>
            <p className="text-gray-600">
              Learn from experienced instructors who share their wisdom.
            </p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
            <div className="w-[200px]">
              <img
                src="https://staffinghub.com/wp-content/uploads/2024/03/bigstock-In-Demand-Skills-And-Competenc-454394677-696x533.jpg"
                alt="Hero Section"
                className="rounded-lg"
              />
            </div>
            <h3 className="font-bold my-4">In-Demand Skills</h3>
            <p className="text-gray-600">
              Acquire skills that are in demand to boost your career.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
