import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Trash,
  X,
  Filter,
} from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import { formatDate } from "../utils/formatDate";
import { useSelector } from "react-redux";
import UpdateRequestModal from "./UpdateRequestModal";

function Request({ role }) {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateNote, setUpdateNote] = useState("");
  const [status, setStatus] = useState("");
  const { username, name, email, roles } = useSelector(
    (state) =>
      state.user.user || { username: "", name: "", email: "", roles: [] }
  );

  const STATUS = {
    ALL: "ALL",
    PENDING: "PENDING",
    IN_REVIEW: "IN_REVIEW",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  };

  const apiUrlRef = useRef("");

  useEffect(() => {
    if (role === "instructor" || role === "student") {
      apiUrlRef.current = `${
        import.meta.env.VITE_BACKEND_URL || ""
      }request/my-requests`;
    } else if (role === "admin") {
      apiUrlRef.current = `${
        import.meta.env.VITE_BACKEND_URL || ""
      }request/admin-requests`;
    }
  }, [role]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeRequest?.comments?.length > 0) {
      scrollToBottom();
    }
  }, [activeRequest]);

  async function fetchRequests() {
    if (!apiUrlRef.current) return;

    setLoading(true);
    try {
      const res = await axios.get(apiUrlRef.current, { withCredentials: true });
      const fetchedRequests = res.data.requests || [];
      setRequests(fetchedRequests);
      setFilteredRequests(fetchedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load requests. Please try again later"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (apiUrlRef.current) {
      fetchRequests();
    }
  }, [apiUrlRef.current]);

  useEffect(() => {
    if (requests.length > 0 && !activeRequest) {
      setActiveRequest(requests[0]);
    }
  }, [requests]);

  useEffect(() => {
    if (activeFilter === "ALL") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(
        requests.filter((req) => req.status === activeFilter)
      );
    }
  }, [activeFilter, requests]);

  async function handleSendComment() {
    if (!newComment.trim() || !activeRequest) return;

    setSubmitting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const res = await axios.post(
        `${backendUrl}request/${activeRequest.requestId}/comment`,
        { comment: newComment },
        { withCredentials: true }
      );

      const updatedRequests = requests.map((req) => {
        if (req.requestId === activeRequest.requestId) {
          return {
            ...req,
            comments: [
              ...(req.comments || []),
              {
                comment: newComment,
                timestamp: new Date().toISOString(),
                commentedBy: {
                  username,
                  name,
                  email,
                },
                commenterRole: role,
              },
            ],
          };
        }
        return req;
      });

      setRequests(updatedRequests);
      setActiveRequest(
        updatedRequests.find((req) => req.requestId === activeRequest.requestId)
      );
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error sending comment:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send comment. Please try again later"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="text-green-500" size={18} />;
      case "REJECTED":
        return <X className="text-red-500" size={18} />;
      case "IN_REVIEW":
        return <RefreshCw className="text-blue-500" size={18} />;
      case "PENDING":
        return <Clock className="text-yellow-500" size={18} />;
      default:
        return <AlertCircle className="text-gray-500" size={18} />;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "IN_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  async function handleUpdateRequest() {
    if (!activeRequest) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const res = await axios.put(
        `${backendUrl}request/${activeRequest.requestId}/update`,
        { note: updateNote, status },
        { withCredentials: true }
      );

      const updatedRequests = requests.map((req) => {
        if (req.requestId === activeRequest.requestId) {
          return {
            ...req,
            adminNote: updateNote,
            status: status,
          };
        }
        return req;
      });

      setRequests(updatedRequests);
      setActiveRequest(
        updatedRequests.find((req) => req.requestId === activeRequest.requestId)
      );
      toast.success("Request updated successfully");
      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error(
        error.response?.data?.message || "Failed to update request. Try again."
      );
    } finally {
      setShowUpdateModal(false);
      setUpdateNote("");
    }
  }

  async function handleDeleteRequest() {
    console.log("asdasd");
    if (!activeRequest) return;
    if (
      activeRequest.status === "APPROVED" ||
      activeRequest.status === "REJECTED" ||
      activeRequest.status === "IN_REVIEW"
    ) {
      toast.error("Cannot delete an approved, rejected or in review request");
      return;
    } else {
      console.log("vcxvsdv");
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        const res = await axios.delete(
          `${backendUrl}request/${activeRequest.requestId}/delete`,
          { withCredentials: true }
        );

        const updatedRequests = requests.filter(
          (req) => req.requestId !== activeRequest.requestId
        );

        setRequests(updatedRequests);
        setActiveRequest(null);
        toast.success("Request deleted successfully");
      } catch (error) {
        console.error("Error deleting request:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete request. Try again."
        );
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="animate-spin text-blue-500 mr-2" size={24} />
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      <DashboardHeader
        title="Request Dashboard"
        description="View and manage your requests"
        role={role}
      />

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">No Requests Found</h2>
          <p className="text-gray-600 mb-4">
            You haven't submitted any requests yet.
          </p>
          <button
            onClick={fetchRequests}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center mx-auto"
          >
            <RefreshCw className="mr-2" size={16} />
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-lg shadow-md h-fit overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">My Requests</h2>
                <div className="flex items-center">
                  <Filter size={16} className="text-gray-500 mr-1" />
                  <span className="text-sm text-gray-500">Filter</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    activeFilter === STATUS.ALL
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveFilter(STATUS.ALL)}
                >
                  All
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors flex items-center ${
                    activeFilter === STATUS.PENDING
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveFilter(STATUS.PENDING)}
                >
                  <Clock size={12} className="mr-1" />
                  Pending
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors flex items-center ${
                    activeFilter === STATUS.IN_REVIEW
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveFilter(STATUS.IN_REVIEW)}
                >
                  <RefreshCw size={12} className="mr-1" />
                  In Review
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors flex items-center ${
                    activeFilter === STATUS.APPROVED
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveFilter(STATUS.APPROVED)}
                >
                  <CheckCircle size={12} className="mr-1" />
                  Approved
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors flex items-center ${
                    activeFilter === STATUS.REJECTED
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveFilter(STATUS.REJECTED)}
                >
                  <Trash size={12} className="mr-1" />
                  Rejected
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              {filteredRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <AlertCircle
                    className="mx-auto text-gray-300 mb-2"
                    size={24}
                  />
                  <p>No requests match this filter</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.requestId}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      activeRequest?.requestId === request.requestId
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => setActiveRequest(request)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium truncate">
                        {request.title}
                      </span>
                      <div className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span
                          className={`ml-1 text-xs ${
                            request.status === "APPROVED"
                              ? "text-green-500"
                              : request.status === "REJECTED"
                              ? "text-red-500"
                              : request.status === "IN_REVIEW"
                              ? "text-blue-500"
                              : "text-yellow-500"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>ID: {request.requestId.substring(0, 8)}...</span>
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-200px)]">
            {activeRequest ? (
              <>
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      {activeRequest.title}
                    </h2>
                    <div
                      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        activeRequest.status
                      )}`}
                    >
                      {getStatusIcon(activeRequest.status)}
                      <span className="ml-2">{activeRequest.status}</span>
                    </div>
                    {role === "admin" && (
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                        onClick={() => {
                          setStatus(activeRequest.status);
                          setUpdateNote(activeRequest.adminNote || "");
                          setShowUpdateModal(true);
                        }}
                      >
                        Update Request
                      </button>
                    )}
                    {console.log(activeRequest.requestedBy)}
                    {activeRequest.requestedBy.username === username && (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                        onClick={handleDeleteRequest}
                      >
                        Delete Request
                      </button>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-700">{activeRequest.description}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Request ID: {activeRequest.requestId}</span>
                    <span>Created: {formatDate(activeRequest.createdAt)}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center mb-4">
                    <MessageSquare className="text-blue-500 mr-2" size={20} />
                    <h3 className="font-medium">Discussion</h3>
                  </div>

                  {activeRequest.comments &&
                  activeRequest.comments.length > 0 ? (
                    activeRequest.comments.map((comment, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg max-w-[80%] ${
                          comment.commenterRole === "admin"
                            ? "bg-blue-50 ml-auto"
                            : "bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">
                            {comment.commenterRole === "admin"
                              ? "Admin"
                              : comment.commentedBy?.username === username
                              ? "You"
                              : comment.commentedBy?.name || "Unknown User"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare
                        className="mx-auto text-gray-300 mb-2"
                        size={36}
                      />
                      <p>No comments yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {activeRequest.status === "APPROVED" ||
                activeRequest.status === "REJECTED" ? (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex text-center items-center justify-between">
                      <span className="text-sm text-gray-600">
                        This request has been{" "}
                        <span
                          className={`font-medium ${
                            activeRequest.status === "APPROVED"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {activeRequest.status}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Type your message here..."
                        className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendComment()
                        }
                      />
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-md flex items-center disabled:bg-blue-300"
                        onClick={handleSendComment}
                        disabled={!newComment.trim() || submitting}
                      >
                        {submitting ? (
                          <RefreshCw className="animate-spin" size={18} />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {showUpdateModal && (
                  <UpdateRequestModal
                    isVisible={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    onSubmit={handleUpdateRequest}
                    updateNote={updateNote}
                    setUpdateNote={setUpdateNote}
                    status={status}
                    setStatus={setStatus}
                    currentStatus={activeRequest.status}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a request to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Request;
