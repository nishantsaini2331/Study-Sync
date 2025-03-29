import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import { formatDate } from "../utils/formatDate";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const CertificateVerification = () => {
  const [certificateId, setCertificateId] = useState("");
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (id) {
      setCertificateId(id);
      verifyCertificate(id);
    }
  }, [id]);

  function handleInputChange(e) {
    const value = e.target.value;
    setCertificateId(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      navigate(
        value
          ? `/verify-certificate/${value}`
          : `/verify-certificate/your-certificate-id`,
        { replace: true }
      );
    }, 500);
  }

  const verifyCertificate = useCallback(
    async (idToVerify = certificateId) => {
      if (!idToVerify) {
        setError("Please enter a certificate ID.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }certificate/verify-certificate/${idToVerify}`,
          { withCredentials: true }
        );

        if (data.success) {
          setCertificateData(data.data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Verification failed");
        setCertificateData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [certificateId]
  );

  const Signature = ({ name, title }) => (
    <div className="text-center w-full md:w-1/2">
      <div className="border-b border-black mb-2 mx-4"></div>
      <div className="font-semibold">{name}</div>
      <div className="text-gray-600">{title}</div>
    </div>
  );

  function CertificateDetails({ label, value }) {
    return (
      <div className="text-sm text-gray-600">
        <span className="font-semibold">{label}: </span>
        {value}
      </div>
    );
  }
  function renderCertificate() {
    return (
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <div className="border-4 border-blue-200 p-8 rounded-lg">
          <div className="text-center">
            <img
              src={logo}
              alt="Study Sync Logo"
              className="mx-auto mb-4 h-10"
            />
            <div className="text-2xl font-bold text-blue-800 mb-2">
              Study Sync
            </div>
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Certificate of Achievement
            </h1>
            <p className="text-gray-600 mb-4">This is to certify that</p>
            <div className="text-3xl font-bold text-blue-900 my-6">
              {certificateData.learnerName}
            </div>
            <p className="text-gray-700 mb-4">
              has successfully completed all requirements in
            </p>
            <div className="text-2xl font-semibold text-blue-700 mb-4">
              {certificateData.courseName}
            </div>
            <div className="bg-blue-100 inline-block px-4 py-2 rounded-full mb-4">
              <span className="text-blue-800 font-semibold">
                Final Score: {certificateData.finalQuizScore}%
              </span>
            </div>
            <p className="text-gray-700 mb-4">
              Course completed on{" "}
              {formatDate(certificateData.courseCompletionDate)}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between">
            <Signature
              name={certificateData.instructorName}
              title="Course Instructor"
            />
            <Signature name="Jane Smith" title="Director of Education" />
          </div>

          <div className="text-center text-sm text-gray-600 mt-6">
            <CertificateDetails
              label="Issue Date"
              value={formatDate(certificateData.issueDate)}
            />
            <CertificateDetails
              label="Certificate ID"
              value={certificateData.certificateId}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Certificate Verification
          </h2>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={certificateId}
              onChange={handleInputChange}
              placeholder="Enter Certificate ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={verifyCertificate}
              disabled={isLoading}
              className={`${
                isLoading ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white p-2 rounded-md transition`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>

          {error && (
            <div className="text-center text-red-500 bg-red-100 py-2 px-4 rounded-md">
              {error}
            </div>
          )}
        </div>

        {certificateData && renderCertificate()}
      </div>
    </div>
  );
};

export default CertificateVerification;
