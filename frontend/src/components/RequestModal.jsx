import React, { useState, useEffect } from "react";
import { X, Send, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { RequestType } from "../utils/requestTypes";
import axios from "axios";

const RequestModal = ({
  isOpen,
  onClose,
  requestType,
  entityId,
  entityType,
  moduleId = null,
  userId = null,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    additionalInfo: "",
    files: [],
    requestType,
    relatedEntities: {
      entityType,
      entityId,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(
    "There was an error submitting your request. Please try again."
  );

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        title: getDefaultTitle(requestType),
        description: "",
        additionalInfo: "",
        requestType,
        files: [],
        submitStatus: null,
      }));
      setSubmitStatus(null);
    }
  }, [isOpen, requestType]);

  function getDefaultTitle(type) {
    const titles = {
      [RequestType.EDIT_COURSE]: "Edit Course Request",
      [RequestType.DELETE_COURSE]: "Course Deletion Request",
      [RequestType.ADD_MODULE]: "Add New Module Request",
      [RequestType.EDIT_MODULE]: "Edit Module Request",
      [RequestType.DELETE_MODULE]: "Delete Module Request",
      [RequestType.EDIT_FINAL_QUIZ]: "Edit Final Quiz Request",
      [RequestType.RESET_QUIZ_ATTEMPTS]: "Reset Quiz Attempts Request",
      [RequestType.EXTENSION_REQUEST]: "Course Access Extension Request",
      [RequestType.REFUND_REQUEST]: "Refund Request",
      [RequestType.CERTIFICATE_ISSUE]: "Certificate Issue Report",
    };
    return titles[type] || "New Request";
  }

  function getRequestSpecificFields() {
    switch (requestType) {
      case RequestType.EDIT_COURSE:
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Please describe the changes you want to make to your course.
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What sections need changes?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Title",
                    "Description",
                    "Cover Image",
                    "Price",
                    "Prerequisites",
                    "Learning Objectives",
                    "Content",
                  ].map((section) => (
                    <label
                      key={section}
                      className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-md"
                    >
                      <input
                        type="checkbox"
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">{section}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload reference files (optional)
              </label>
              <input
                type="file"
                multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, files: e.target.files }))
                }
              />
            </div>
          </div>
        );

      case RequestType.DELETE_COURSE:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Important Notice</p>
                <p className="text-sm">
                  Deleting a course will remove all content and student
                  enrollments. This action cannot be undone and may affect
                  revenue reporting.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for deletion
              </label>
              <select
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    additionalInfo: e.target.value,
                  }))
                }
                value={formData.additionalInfo}
              >
                <option value="">Select a reason</option>
                <option value="outdated">Course is outdated</option>
                <option value="low_engagement">Low student engagement</option>
                <option value="replacing">Replacing with new course</option>
                <option value="technical_issues">Technical issues</option>
                <option value="other">Other reason</option>
              </select>
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type "DELETE" to confirm
              </label>
              <input
                required
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Type DELETE to confirm"
              />
            </div> */}
          </div>
        );

      case RequestType.RESET_QUIZ_ATTEMPTS:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md text-blue-700 text-sm">
              <p className="font-medium mb-1">Current Status</p>
              <p>You have used 3/3 attempts. Your highest score is 65%.</p>
              <p className="mt-2">Passing score required: 75%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for reset request
              </label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    additionalInfo: e.target.value,
                  }))
                }
                value={formData.additionalInfo}
              >
                <option value="">Select a reason</option>
                <option value="technical_issues">
                  Technical issues during quiz
                </option>
                <option value="connectivity">
                  Internet connectivity problems
                </option>
                <option value="need_more_practice">
                  Need more practice attempts
                </option>
                <option value="misunderstood">Misunderstood questions</option>
                <option value="other">Other reason</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How many additional attempts are you requesting?
              </label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="1">1 attempt</option>
                <option value="2">2 attempts</option>
                <option value="3">3 attempts</option>
              </select>
            </div>
          </div>
        );

      case RequestType.CERTIFICATE_ISSUE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of issue
              </label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    additionalInfo: e.target.value,
                  }))
                }
                value={formData.additionalInfo}
              >
                <option value="">Select an issue</option>
                <option value="name_incorrect">
                  Incorrect name on certificate
                </option>
                <option value="date_incorrect">
                  Incorrect date on certificate
                </option>
                <option value="cannot_download">
                  Cannot download certificate
                </option>
                <option value="not_generated">
                  Completed course but certificate not generated
                </option>
                <option value="other">Other issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Screenshot of the issue (optional)
              </label>
              <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept="image/*"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, files: e.target.files }))
                }
              />
            </div>
            <div className="bg-green-50 p-4 rounded-md text-green-700 text-sm">
              <p className="font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" /> Course completed on:
                February 15, 2025
              </p>
              <p className="font-medium flex items-center mt-1">
                <CheckCircle className="h-4 w-4 mr-2" /> Final quiz score: 85%
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional details (optional)
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Provide any additional information that may be helpful"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    additionalInfo: e.target.value,
                  }))
                }
                value={formData.additionalInfo}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload supporting documents (optional)
              </label>
              <input
                type="file"
                multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, files: e.target.files }))
                }
              />
            </div>
          </div>
        );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}request`,
        {
          ...formData,
        },
        {
          withCredentials: true,
        }
      );

      setSubmitStatus("success");

      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || errorMsg);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    {getDefaultTitle(requestType)}
                  </h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description of your request
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Please provide details about your request..."
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        value={formData.description}
                      />
                    </div>

                    {getRequestSpecificFields()}

                    <div className="flex items-center text-sm text-gray-500 mt-4">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Expected response time: 1-2 business days</span>
                    </div>

                    {submitStatus === "success" && (
                      <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span>
                          Your request has been submitted successfully!
                        </span>
                      </div>
                    )}

                    {submitStatus === "error" && (
                      <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting || submitStatus === "success"}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        isSubmitting || submitStatus === "success"
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </>
                      ) : submitStatus === "success" ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submitted
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
