import axios from "axios";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

function CourseLearningPage() {

    const  {courseId} = useParams()
  useEffect(() => {
    async function fetchCourseLearningData() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}student/${courseId}/learn`,
          {
            withCredentials: true,
          }
        );
        console.log("Course learning data:", response.data);
      } catch (error) {
        console.error("Error fetching course learning data:", error);
      }
    }
    fetchCourseLearningData();

    document.title = "Course Learning Page";
  }, []);
  return <div>CourseLearningPage</div>;
}

export default CourseLearningPage;
