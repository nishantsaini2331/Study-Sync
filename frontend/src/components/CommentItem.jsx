import {
  ChevronDown,
  ChevronUp,
  Edit,
  MessageSquare,
  MoreVertical,
  Pin,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { formatDate } from "../utils/formatDate";
import {
  CommentInput,
  DeleteConfirmation,
  commentApi,
  commentUtils,
} from "./CommentSystem";
import toast from "react-hot-toast";

const CommentItem = ({
  comment,
  allComments,
  setComments,
  currentUser,
  lectureId,
  level = 0,
  isInstructor = false,
  canEdit = false,
  canDelete = false,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.comment);
  const [showReplies, setShowReplies] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const isAuthor =
    currentUser && comment.student && currentUser._id === comment.student._id;
  const hasLiked =
    currentUser && comment.likes && comment.likes.includes(currentUser._id);
  const isRootComment = level === 0;

  const handleLike = async () => {
    try {
      await commentApi.likeComment(comment._id);

      const updatedComments = commentUtils.updateCommentTree(
        allComments,
        comment._id,
        (item) => {
          let newLikes = [...(item.likes || [])];

          if (hasLiked) {
            newLikes = newLikes.filter((id) => id !== currentUser._id);
          } else {
            newLikes.push(currentUser._id);
          }

          return { ...item, likes: newLikes };
        }
      );

      setComments(updatedComments);
      toast.success(hasLiked ? "Unliked comment" : "Liked comment");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reply");
      console.error("Failed to like comment:", error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      const newReply = await commentApi.addReply(
        comment._id,
        replyText,
        lectureId
      );

      if (isInstructor) {
        newReply.isInstructor = true;
      }

      const updatedComments = commentUtils.updateCommentTree(
        allComments,
        comment._id,
        (item) => ({
          ...item,
          replies: [...(item.replies || []), newReply],
        })
      );

      setComments(updatedComments);
      setReplyText("");
      setIsReplying(false);
      toast.success("Reply added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reply");
      console.error("Failed to add reply:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;

    try {
      await commentApi.updateComment(comment._id, editText);

      const updatedComments = commentUtils.updateCommentTree(
        allComments,
        comment._id,
        (item) => ({
          ...item,
          comment: editText,
        })
      );

      setComments(updatedComments);
      setIsEditing(false);
      toast.success("Comment updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update comment");
      console.error("Failed to update comment:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await commentApi.deleteComment(comment._id);

      const updatedComments = commentUtils.removeFromCommentTree(
        allComments,
        comment._id
      );
      setComments(updatedComments);
      setConfirmDelete(null);
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
      console.error("Failed to delete comment:", error);
    }
  };

  const handlePin = async () => {
    if (!isInstructor) return;

    try {
      await commentApi.pinComment(comment._id, comment.isPinned);

      const updatedComments = commentUtils.updateCommentTree(
        allComments,
        comment._id,
        (item) => ({
          ...item,
          isPinned: !item.isPinned,
        })
      );

      setComments(updatedComments);
      toast.success("Comment pinned/unpinned successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to pin/unpin comment"
      );
      console.error("Failed to pin/unpin comment:", error);
    }
  };

  function renderUserInfo() {
    const userObj = comment.student || comment.user || {};
    const name = userObj.name || "Anonymous";
    const photoUrl =
      userObj.photoUrl ||
      `https://api.dicebear.com/9.x/initials/svg?seed=${name}`;
    const username = userObj.username;

    return (
      <div className="flex gap-2">
        <div className="w-10 h-10 aspect-square rounded-full overflow-hidden">
          <img
            src={photoUrl}
            alt={name}
            className="rounded-full w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="capitalize font-medium">
            {name}
            {comment?.isInstructor && (
              <span className="ml-2  items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Instructor
              </span>
            )}
          </p>

          <p className="text-gray-500 text-sm">
            {formatDate(comment.createdAt, true)}
          </p>
        </div>
      </div>
    );
  }

  function renderOptionsMenu() {
    if (!canEdit && !canDelete) return null;

    return (
      <div className="relative">
        {showOptions ? (
          <div className="absolute right-0 bg-white shadow-lg w-28 rounded-lg z-10 border">
            <button
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowOptions(false)}
            >
              <X size={16} />
            </button>
            {canEdit && (
              <button
                className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-100"
                onClick={() => {
                  setIsEditing(true);
                  setShowOptions(false);
                }}
              >
                <Edit size={16} /> Edit
              </button>
            )}
            {canDelete && (
              <button
                className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-100 text-red-500 border-t"
                onClick={() => setConfirmDelete({ commentId: comment._id })}
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        ) : (
          <button
            className="text-gray-500 p-1 rounded-full hover:bg-gray-100"
            onClick={() => setShowOptions(true)}
          >
            <MoreVertical size={18} />
          </button>
        )}
      </div>
    );
  }

  function renderInstructorActions() {
    if (!isInstructor) return null;

    return (
      <div className="mt-2 ">
        {isRootComment && (
          <button
            onClick={handlePin}
            className={`p-2 mx-3 rounded-full ${
              comment.isPinned
                ? "bg-blue-100 text-blue-600 "
                : "text-gray-400 hover:bg-gray-100 "
            }`}
            title={comment.isPinned ? "Unpin comment" : "Pin comment"}
          >
            <Pin size={15} />
          </button>
        )}
        <button
          onClick={() =>
            setConfirmDelete({
              commentId: comment._id,
              isReply: comment.parentComment ? true : false,
            })
          }
          className="p-1  rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500"
          title="Delete comment"
        >
          <Trash2 size={15} />
        </button>

        {comment.student._id === currentUser._id ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 mx-3  rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500"
            title="edit comment"
          >
            <Edit size={15} />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`p-3 ${
        level > 0
          ? "pl-4 mt-3 border-l-2 border-gray-200"
          : "border-b pb-4 mb-4"
      } 
      ${comment.isPinned && level === 0 ? "bg-blue-50 rounded " : ""}`}
    >
      {isEditing ? (
        <div className="my-4">
          <textarea
            value={editText}
            placeholder="Edit your comment..."
            className="h-[150px] resize-none border rounded-lg w-full p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-5 py-2 rounded-md hover:bg-gray-500 transition flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition flex items-center gap-2"
              disabled={!editText.trim()}
            >
              <Edit size={16} /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex w-full justify-between">
            {renderUserInfo()}
            {isInstructor
              ? renderInstructorActions()
              : isAuthor
              ? renderOptionsMenu()
              : ""}
          </div>

          {isRootComment && comment.isPinned && !isInstructor && (
            <div className="mt-1 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                <Pin size={12} className="mr-1" /> Pinned
              </span>
            </div>
          )}

          <p className="font-normal text-base my-2">{comment.comment}</p>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-4">
              <button
                className={`flex items-center gap-1 ${
                  hasLiked
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={handleLike}
              >
                <ThumbsUp size={16} />
                <span>{comment.likes?.length || 0}</span>
              </button>
              {comment.replies && comment.replies.length > 0 && (
                <div className="flex items-center gap-1 text-gray-600">
                  <MessageSquare size={16} />
                  <span>{comment.replies.length}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            >
              <MessageSquare size={14} /> Reply
            </button>
          </div>
        </>
      )}

      {isReplying && (
        <div className="my-4 pl-8 border-l-2 border-gray-200">
          <CommentInput
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onSubmit={handleReply}
            onCancel={() => setIsReplying(false)}
            placeholder="Write your reply..."
            submitText="Reply"
            isReply={true}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className={`pl-2 mt-4 ${level >= 3 ? "ml-0" : ""}`}>
          {level === 0 && (
            <div className="mb-2">
              <button
                className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <>
                    Hide replies <ChevronUp size={14} className="ml-1" />
                  </>
                ) : (
                  <>
                    Show replies ({comment.replies.length}){" "}
                    <ChevronDown size={14} className="ml-1" />
                  </>
                )}
              </button>
            </div>
          )}

          {showReplies && (
            <div className="space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  allComments={allComments}
                  setComments={setComments}
                  currentUser={currentUser}
                  lectureId={lectureId}
                  level={level + 1}
                  isInstructor={isInstructor}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <DeleteConfirmation
          commentId={confirmDelete.commentId}
          isReply={confirmDelete.isReply}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default CommentItem;
