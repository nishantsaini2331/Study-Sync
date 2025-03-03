import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import CommentItem from "./CommentItem";
import {
  commentApi,
  CommentFilters,
  CommentInput,
  commentUtils,
  LoadingSpinner,
} from "./CommentSystem";

function Comment({ lectureId, comments: initialComments }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(initialComments || []);
  const currentUser = useSelector((state) => state.user.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(!initialComments);
  const [filterOptions, setFilterOptions] = useState({
    showPinned: false,
    sortBy: "pinnedFirst",
  });

  const filteredComments = commentUtils.filterAndSortComments(
    comments,
    searchQuery,
    filterOptions
  );

  async function handleComment() {
    if (!comment.trim()) return;

    try {
      const newComment = await commentApi.addComment(lectureId, comment);

      setComments([...comments, newComment]);
      setComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <CommentInput
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onSubmit={handleComment}
        submitText="Add Comment"
      />

      <CommentFilters
        filterOptions={filterOptions}
        searchQuery={searchQuery}
        setFilterOptions={setFilterOptions}
        setSearchQuery={setSearchQuery}
      />

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  allComments={comments}
                  setComments={setComments}
                  currentUser={currentUser}
                  lectureId={lectureId}
                  canEdit={true}
                  canDelete={true}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export default Comment;
