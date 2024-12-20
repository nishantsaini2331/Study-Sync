import React, { useEffect } from "react";
import Footer from "../components/Footer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
function TeacherPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div>
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl font-bold mb-4">Come teach with us</h1>
            <p className="text-gray-600 mb-6">
              Become an instructor and change lives — including your own
            </p>
            <div className="space-x-4">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => {
                  navigate("/teaching/onbording");
                }}
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0">
            <img
              src="https://via.placeholder.com/500"
              alt="Hero Section"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">So many reasons to start</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
              <div className="">
                <img
                  src="https://via.placeholder.com/200"
                  alt="Hero Section"
                  className="rounded-lg"
                />
              </div>
              <h3 className="font-bold my-4">Teach What You Love</h3>
              <p className="text-gray-600">
                Publish the course you want, in the way you want, and always
                have control of your own content.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
              <div className="">
                <img
                  src="https://via.placeholder.com/200"
                  alt="Hero Section"
                  className="rounded-lg"
                />
              </div>
              <h3 className="font-bold my-4">Inspire learners</h3>
              <p className="text-gray-600">
                Teach what you know and help learners explore their interests,
                gain new skills, and advance their careers.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center ">
              <div className="">
                <img
                  src="https://via.placeholder.com/200"
                  alt="Hero Section"
                  className="rounded-lg"
                />
              </div>
              <h3 className="font-bold my-4">Get rewarded</h3>
              <p className="text-gray-600">
                Expand your professional network, build your expertise, and earn
                money on each paid enrollment.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            Become an instructor today
          </h2>
          <p className="text-gray-600 mb-6">
            Join one of the world’s largest online learning marketplaces.
          </p>
          <div className="space-x-4">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              onClick={() => {
                navigate("/teaching/onbording");
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default TeacherPage;
