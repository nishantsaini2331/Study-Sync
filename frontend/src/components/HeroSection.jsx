import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto flex flex-col lg:flex-row lg:justify-between items-center">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl font-bold mb-4">
            Explore Live Creative Classes
          </h1>
          <p className="text-gray-600 mb-6">
            Choose from over 2,000+ courses on topics like UI design, front-end
            development, and much more.
          </p>
          <div className="space-x-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              Get Started
            </button>
            <button className="px-6 py-2 border border-gray-400 rounded-lg">
              Learn More
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 mt-8 lg:mt-0 rounded-3xl lg:ml-40">
          <img
            src="https://static.vecteezy.com/system/resources/previews/004/578/793/non_2x/man-working-with-computer-at-desk-free-vector.jpg"
            alt="Hero Section"
            className="rounded-lg w-[600px]"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
