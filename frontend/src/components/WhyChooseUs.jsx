import React from 'react';

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Learn from Anywhere</h3>
            <p className="text-gray-600">
              Our platform empowers you to learn new skills from anywhere.
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Courses Taught by Experts</h3>
            <p className="text-gray-600">
              Learn from experienced instructors who share their wisdom.
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">In-Demand Skills</h3>
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
