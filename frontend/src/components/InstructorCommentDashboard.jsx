import axios from "axios";
import { AlertTriangle, MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CommentItem from "./CommentItem";
import {
  commentApi,
  CommentFilters,
  CommentInput,
  commentUtils,
  LoadingSpinner,
} from "./CommentSystem";
import DashboardHeader from "./DashboardHeader";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const InstructorCommentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    showPinned: false,
    sortBy: "newest",
  });

  const currentUser = useSelector((state) => state.user.user);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const courses = await commentApi.fetchInstructorCourses();
        setCourses(courses);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchLectures = async () => {
      try {
        setLoading(true);
        const lecturs = await commentApi.fetchInstructorLectures(
          selectedCourse
        );
        setLectures(lecturs);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch lectures:", error);
        setLoading(false);
      }
    };

    fetchLectures();
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedLecture) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const comments = await commentApi.fetchInstructorComments(
          selectedLecture
        );
        setComments(comments);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setLoading(false);
      }
    };

    fetchComments();
  }, [selectedLecture]);

  async function handleAddComment() {
    if (!commentText.trim()) return;

    try {
      const newComment = await commentApi.addComment(
        selectedLecture,
        commentText
      );

      setComments([
        { ...newComment, isInstructor: true, replies: [] },
        ...comments,
      ]);

      setCommentText("");
      setIsCommenting(false);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  }

  async function handleDeleteComment(commentId, isReply = false) {
    try {
      await axios.delete(`${BACKEND_URL}comment/${commentId}`, {
        withCredentials: true,
      });

      if (isReply) {
        const removeReplyFromComments = (commentsList, replyId) => {
          return commentsList.map((comment) => {
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies
                  .filter((reply) => reply._id !== replyId)
                  .map((reply) => {
                    if (reply.replies && reply.replies.length > 0) {
                      return {
                        ...reply,
                        replies: removeReplyFromComments(
                          reply.replies,
                          replyId
                        ),
                      };
                    }
                    return reply;
                  }),
              };
            }
            return comment;
          });
        };

        const updatedComments = removeReplyFromComments(comments, commentId);
        setComments(updatedComments);
      } else {
        const updatedComments = comments.filter(
          (comment) => comment._id !== commentId
        );
        setComments(updatedComments);
      }

      setConfirmDelete(null);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  }

  const filteredComments = commentUtils.filterAndSortComments(
    comments,
    searchQuery,
    filterOptions
  );

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      <DashboardHeader
        title={"Comment"}
        description={"Course comments"}
        role="instructor"
      />

      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Course
            </label>
            <select
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedCourse || ""}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedLecture(null);
                setComments([]);
              }}
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Lecture
            </label>
            <select
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedLecture || ""}
              onChange={(e) => setSelectedLecture(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">-- Select Lecture --</option>
              {lectures.map((lecture) => (
                <option key={lecture.lectureId} value={lecture.lectureId}>
                  {lecture.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedLecture && (
          <div className="">
            <CommentFilters
              filterOptions={filterOptions}
              searchQuery={searchQuery}
              setFilterOptions={setFilterOptions}
              setSearchQuery={setSearchQuery}
            />

            <button
              onClick={() => setIsCommenting(!isCommenting)}
              className="p-2 my-3 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Add Comment
            </button>
          </div>
        )}

        {isCommenting && (
          <CommentInput
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onSubmit={handleAddComment}
            placeholder="Write your comment..."
            submitText="Add Comment"
          />
        )}

        {loading ? (
          <div className="col-span-3 flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow px-2">
            {selectedLecture ? (
              filteredComments.length > 0 ? (
                <div className="divide-y">
                  {filteredComments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      setComments={setComments}
                      allComments={comments}
                      lectureId={selectedLecture}
                      currentUser={currentUser}
                      isInstructor={true}
                      level={0}
                      canDelete={true}
                      canEdit={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <MessageSquare
                    size={40}
                    className="mx-auto mb-2 text-gray-400"
                  />
                  <p>No comments found for this lecture</p>
                </div>
              )
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>Select a course and lecture to view comments</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorCommentDashboard;
