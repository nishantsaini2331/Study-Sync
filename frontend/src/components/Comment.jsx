import { useState } from "react";
import axios from "axios";
import { formatDate } from "../utils/formatDate";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  ThumbsUp,
  MessageSquare,
  MoreVertical,
  X,
  Send,
  Edit,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Comment({ lectureId, comments: initialComments }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(initialComments || []);
  const currentUser = useSelector((state) => state.user.user);

  async function handleComment() {
    if (!comment.trim()) return;

    try {
      const res = await axios.post(
        `${BACKEND_URL}comment/${lectureId}`,
        { comment },
        { withCredentials: true }
      );

      setComments([...comments, res.data.comment]);
      setComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div>
        <textarea
          value={comment}
          placeholder="Add your comment..."
          className="h-[100px] resize-none border rounded-lg w-full p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={handleComment}
          className="bg-blue-600 text-white px-6 py-2 my-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
          disabled={!comment.trim()}
        >
          <Send size={18} /> Add Comment
        </button>
      </div>

      <div className="mt-6">
        <CommentsList
          comments={comments}
          setComments={setComments}
          lectureId={lectureId}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

function CommentsList({ comments, setComments, lectureId, currentUser }) {
  return (
    <>
      {comments &&
        comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            comments={comments}
            setComments={setComments}
            lectureId={lectureId}
            currentUser={currentUser}
            level={0}
          />
        ))}
    </>
  );
}

function CommentItem({
  comment,
  comments,
  setComments,
  lectureId,
  currentUser,
  level,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.comment);

  const isAuthor = currentUser && currentUser._id === comment?.student?._id;

  const hasLiked =
    currentUser && comment.likes && comment.likes.includes(currentUser._id);

  const updateCommentTree = (list, commentId, updater) => {
    return list.map((item) => {
      if (item._id === commentId) {
        return updater(item);
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: updateCommentTree(item.replies, commentId, updater),
        };
      }
      return item;
    });
  };

  const removeFromCommentTree = (list, commentId) => {
    return list.filter((item) => {
      if (item._id === commentId) {
        return false;
      }
      if (item.replies && item.replies.length > 0) {
        item.replies = removeFromCommentTree(item.replies, commentId);
      }
      return true;
    });
  };

  async function handleReply() {
    if (!replyText.trim()) return;

    try {
      const res = await axios.post(
        `${BACKEND_URL}comment/reply/${comment._id}`,
        { reply: replyText, lectureId },
        { withCredentials: true }
      );

      const updatedComments = updateCommentTree(
        comments,
        comment._id,
        (item) => ({
          ...item,
          replies: [...(item.replies || []), res.data.reply],
        })
      );

      setComments(updatedComments);
      setReplyText("");
      setIsReplying(false);
      toast.success("Reply added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reply");
    }
  }

  async function handleLike() {
    try {
      await axios.patch(
        `${BACKEND_URL}comment/${comment._id}`,
        {},
        { withCredentials: true }
      );

      const updatedComments = updateCommentTree(
        comments,
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
    } catch (error) {
      toast.error("Failed to like comment");
    }
  }

  async function handleUpdate() {
    if (!editText.trim()) return;

    try {
      await axios.put(
        `${BACKEND_URL}comment/${comment._id}`,
        { updatedCommentText: editText },
        { withCredentials: true }
      );

      const updatedComments = updateCommentTree(
        comments,
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
    }
  }

  async function handleDelete() {
    try {
      const res = await axios.delete(`${BACKEND_URL}comment/${comment._id}`, {
        withCredentials: true,
      });

      const updatedComments = removeFromCommentTree(comments, comment._id);
      setComments(updatedComments);
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  }

  return (
    <div className="border-b pb-4 mb-4">
      <div className="flex flex-col gap-2 my-4">
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
              <Link
                to={`/@${comment.student?.username}`}
                className="flex gap-2"
              >
                <div className="flex gap-2">
                  <div className="w-10 h-10 aspect-square rounded-full overflow-hidden">
                    <img
                      src={
                        comment.student?.photoUrl ||
                        `https://api.dicebear.com/9.x/initials/svg?seed=${comment.student?.name}`
                      }
                      alt={comment.student?.name}
                      className="rounded-full w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="capitalize font-medium">
                      {comment.student?.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>

              {isAuthor && (
                <div className="relative">
                  {showOptions ? (
                    <div className="absolute right-0 bg-white shadow-lg w-28 rounded-lg z-10 border">
                      <button
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowOptions(false)}
                      >
                        <X size={16} />
                      </button>
                      <button
                        className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-100"
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        className="flex items-center gap-2 w-full text-left p-3 hover:bg-gray-100 text-red-500 border-t"
                        onClick={handleDelete}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
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
              )}
            </div>

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
                <div className="flex items-center gap-1 text-gray-600">
                  <MessageSquare size={16} />
                  <span>{comment.replies?.length || 0}</span>
                </div>
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
            <textarea
              value={replyText}
              placeholder="Write your reply..."
              className="h-[100px] resize-none border rounded-lg w-full p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setIsReplying(false)}
                className="bg-gray-400 text-white px-4 py-1 text-sm rounded-md hover:bg-gray-500 transition flex items-center gap-1"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleReply}
                className="bg-blue-600 text-white px-4 py-1 text-sm rounded-md hover:bg-blue-700 transition flex items-center gap-1"
                disabled={!replyText.trim()}
              >
                <Send size={14} /> Reply
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div
            className={`pl-2 mt-4 border-l-2 border-gray-200 ${
              level >= 3 ? "ml-0" : ""
            }`}
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                comments={comments}
                setComments={setComments}
                lectureId={lectureId}
                currentUser={currentUser}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment;
