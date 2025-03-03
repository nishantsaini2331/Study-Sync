import axios from "axios";
import { BookOpen, Download, ExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDate } from "../utils/formatDate";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "./CommentSystem";

function StudentCourseCertificates() {
  const [certficates, setCertficates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function downloadCertificate(certificateId) {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }certificate/download-certificate/${certificateId}`,
        {
          withCredentials: true,
          responseType: "blob",
          timeout: 60000,
        }
      );

      if (response.data.size < 1000) {
        throw new Error(
          "The downloaded certificate appears to be empty. Please contact support."
        );
      }

      const blob = new Blob([response.data], { type: "application/pdf" });

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `certificate-${certificateId}.pdf`);

      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Certificate downloaded successfully!");
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to download certificate. Please try again later"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}student/certificates`,
          { withCredentials: true }
        );
        setCertficates(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message || "Please try again later");
      }
    }
    fetchCertificates();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="bg-indigo-600 px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-white">
          Certificates
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Your course certificates
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {certficates && certficates.length > 0 ? (
          certficates.map((certificate) => (
            <div
              key={certificate.certificateId}
              className="bg-white shadow-lg rounded-lg p-4 flex flex-col"
            >
              <Link to={`/course/${certificate.course.courseId}/learn`}>
                <div className="relative">
                  <img
                    src={certificate.course.thumbnail}
                    alt={certificate.course.title}
                    className="rounded-lg h-40 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                    <BookOpen size={20} />
                  </div>
                </div>
              </Link>
              <div className="flex justify-between items-center mt-4">
                <h1 className="text-xl font-bold">
                  {certificate.course.title}
                </h1>
              </div>
              <span className="text-base capitalize flex-none text-gray-700 mt-2  rounded-lg p-1">
                {certificate.status} at : {formatDate(certificate.createdAt)}
              </span>
              <div className="mt-auto pt-4">
                <button
                  onClick={() => downloadCertificate(certificate.certificateId)}
                  disabled={isLoading}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300"
                >
                  {isLoading ? (
                    "Generating..."
                  ) : (
                    <span>
                      Download <Download size={16} className="ml-2 inline" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No certificate yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCourseCertificates;
