import React, { useEffect } from "react";
import HeroSection from "../components/HeroSection";
import WhyChooseUs from "../components/WhyChooseUs";
import CourseCategories from "../components/CourseCategories";
import FeaturedCourses from "../components/FeaturedCourses";
import Testimonials from "../components/Testimonials";
import SubscribeSection from "../components/SubscribeSection";
import Footer from "../components/Footer";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
function HomePage() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    async function VerifyUser() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}user/auth`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          dispatch(setUser(response.data.user));
        }
      } catch (error) {
        console.log(error);
      }
    }

    // VerifyUser();

    document.title = "Study Sync";
  }, []);

  return (
    <div>
      <HeroSection />
      <WhyChooseUs />
      <CourseCategories />
      <FeaturedCourses />
      <Testimonials />
      <SubscribeSection />
      <Footer />
    </div>
  );
}

export default HomePage;
