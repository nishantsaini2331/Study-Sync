import axios from "axios";
import { AlertTriangle, Filter, Search, Send, X } from "lucide-react";
import React from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const commentUtils = {
  updateCommentTree: (list, commentId, updater) => {
    return list.map((item) => {
      if (item._id === commentId) {
        return updater(item);
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: commentUtils.updateCommentTree(
            item.replies,
            commentId,
            updater
          ),
        };
      }
      return item;
    });
  },

  removeFromCommentTree: (list, commentId) => {
    return list.filter((item) => {
      if (item._id === commentId) {
        return false;
      }
      if (item.replies && item.replies.length > 0) {
        item.replies = commentUtils.removeFromCommentTree(
          item.replies,
          commentId
        );
      }
      return true;
    });
  },

  filterAndSortComments: (comments, searchQuery, filterOptions) => {
    return comments
      .filter((comment) => {
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const commentText = comment.comment.toLowerCase();
          const studentName = (comment.student?.name || "").toLowerCase();

          return (
            commentText.includes(searchLower) ||
            studentName.includes(searchLower)
          );
        }
        if (filterOptions.showPinned) {
          return comment.isPinned;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterOptions.sortBy === "newest") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (filterOptions.sortBy === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (filterOptions.sortBy === "mostLiked") {
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        } else if (filterOptions.sortBy === "pinnedFirst") {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
        }
        return 0;
      });
  },
};

export const CommentInput = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder,
  submitText,
  isReply = false,
}) => {
  return (
    <div className={`my-${isReply ? "3" : "4"}`}>
      <textarea
        value={value}
        placeholder={placeholder || "Write your comment..."}
        className={`${
          isReply ? "h-auto" : "h-[100px]"
        } resize-none border rounded-lg w-full p-3 ${
          isReply ? "text-sm" : "text-lg"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onChange={onChange}
        rows={isReply ? 2 : 4}
      />
      <div className="flex gap-3 mt-2 justify-end">
        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-1.5 rounded-md hover:bg-gray-500 transition flex items-center gap-1.5"
          >
            <X size={16} /> Cancel
          </button>
        )}
        <button
          onClick={onSubmit}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition flex items-center gap-1.5"
          disabled={!value.trim()}
        >
          <Send size={16} /> {submitText || "Submit"}
        </button>
      </div>
    </div>
  );
};

export const CommentFilters = ({
  searchQuery,
  setSearchQuery,
  filterOptions,
  setFilterOptions,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-2">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search comments..."
          className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPinned"
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={filterOptions.showPinned}
            onChange={() =>
              setFilterOptions({
                ...filterOptions,
                showPinned: !filterOptions.showPinned,
              })
            }
          />
          <label
            htmlFor="showPinned"
            className="text-sm font-medium text-gray-700"
          >
            Show Pinned Only
          </label>
        </div>

        <div className="flex items-center">
          <Filter size={16} className="mr-2 text-gray-500" />
          <select
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            value={filterOptions.sortBy}
            onChange={(e) =>
              setFilterOptions({
                ...filterOptions,
                sortBy: e.target.value,
              })
            }
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostLiked">Most Liked</option>
            <option value="pinnedFirst">Pinned First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export const DeleteConfirmation = ({
  commentId,
  isReply,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center text-red-500 mb-4">
          <AlertTriangle size={24} className="mr-2" />
          <h3 className="text-lg font-medium">Confirm Deletion</h3>
        </div>
        <p className="mb-4">
          Are you sure you want to delete this {isReply ? "reply" : "comment"}?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => onConfirm(commentId, isReply)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const commentApi = {
  fetchComments: async (lectureId) => {
    try {
      const res = await axios.get(`${BACKEND_URL}comment/${lectureId}`, {
        withCredentials: true,
      });
      return res.data.comments;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  },

  addComment: async (lectureId, comment) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}comment/${lectureId}`,
        { comment },
        { withCredentials: true }
      );
      return res.data.comment;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to add comment");
    }
  },

  addReply: async (commentId, reply, lectureId) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}comment/reply/${commentId}`,
        { reply, lectureId },
        { withCredentials: true }
      );
      return res.data.reply;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to add reply");
    }
  },

  updateComment: async (commentId, updatedCommentText) => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}comment/${commentId}`,
        { updatedCommentText },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update comment"
      );
    }
  },

  likeComment: async (commentId) => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}comment/${commentId}`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to like comment"
      );
    }
  },

  pinComment: async (commentId, isPinned) => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}comment/pin/${commentId}`,
        {
          isPinned: !isPinned,
        },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to pin/unpin comment"
      );
    }
  },

  deleteComment: async (commentId) => {
    try {
      const res = await axios.delete(`${BACKEND_URL}comment/${commentId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  },

  fetchInstructorCourses: async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}instructor/courses`, {
        withCredentials: true,
      });
      return res.data.courses;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  },

  fetchInstructorLectures: async (courseId) => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}instructor/lectures/${courseId}`,
        { withCredentials: true }
      );
      return res.data.lectures;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch lectures"
      );
    }
  },

  fetchInstructorComments: async (lectureId) => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}instructor/lecture-comments/${lectureId}`,
        { withCredentials: true }
      );
      return res.data.comments;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  },
};
