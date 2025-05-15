import React, { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import WhyChooseUs from "../components/WhyChooseUs";
import CourseCategories from "../components/CourseCategories";
import FeaturedCourses from "../components/FeaturedCourses";
import Testimonials from "../components/Testimonials";
import SubscribeSection from "../components/SubscribeSection";
import Footer from "../components/Footer";
import axios from "axios";
function HomePage() {
  const [homePageData, setHomePageData] = useState({
    courseCategories: [],
    featuredCourses: [],
    testimonials: [],
  });
  useEffect(() => {
    async function getHomePageData() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}home-page`
        );

        setHomePageData(res.data.data);
      } catch (error) {
        console.log(error);
      }
    }

    getHomePageData();

    document.title = "Study Sync";
  }, []);

  return (
    <div>
      <HeroSection />
      <WhyChooseUs />
      {homePageData.courseCategories.length > 0 && (
        <CourseCategories courseCategories={homePageData.courseCategories} />
      )}
      {homePageData.featuredCourses.length > 0 && (
        <FeaturedCourses featuredCourses={homePageData.featuredCourses} />
      )}
      {/* {homePageData.testimonials.length > 0 && ( */}
        <Testimonials testimonials={homePageData.testimonials} />
      {/* )} */}
      <SubscribeSection />
      <Footer />
    </div>
  );
}

export default HomePage;
