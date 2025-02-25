import { Trash2 } from "lucide-react";
import React from "react";
import RatingStars from "./RatingStars";
import { formatDate } from "../utils/formatDate";

function ReviewAndRating({
  courseDetails,
  user = {
    isEnrolled: false,
    username: "",
    hasReviewed: false,
  },
  userReviewData = {
    rating: 0,
    review: "",
    isSubmitting: false,
  },
  reviewActions = {
    setRating: () => {},
    setReview: () => {},
    submitReview: () => {},
    editReview: () => {},
    deleteReview: () => {},
  },
}) {
  const { isEnrolled, username, hasReviewed } = user;
  const { rating, review, isSubmitting } = userReviewData;
  const { setRating, setReview, submitReview, editReview, deleteReview } =
    reviewActions;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Reviews & Ratings</h2>
      <div className="flex items-center gap-3 mb-6">
        <div className="text-5xl font-bold">
          {courseDetails?.averageRating?.toFixed(1)}
        </div>
        <div>
          <div className="flex items-center">
            <RatingStars rating={courseDetails?.averageRating} />
            <span className="ml-2 text-gray-600">
              ({courseDetails.reviewAndRating.length} reviews)
            </span>
          </div>
        </div>
      </div>

      {isEnrolled && (
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-4">
            {hasReviewed ? "Edit Your Review" : "Write a Review"}
          </h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Rating</label>
            <RatingStars
              rating={rating}
              interactive={true}
              onRatingChange={setRating}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Review</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Share your experience with this course..."
            ></textarea>
          </div>
          <button
            onClick={hasReviewed ? editReview : submitReview}
            disabled={isSubmitting}
            className="bg-black text-white py-2 px-4 rounded-lg"
          >
            {isSubmitting
              ? "Submitting..."
              : hasReviewed
              ? "Update Review"
              : "Submit Review"}
          </button>
        </div>
      )}

      <div className="space-y-6">
        {courseDetails.reviewAndRating.map((review) => (
          <div
            key={review._id}
            className="border-b border-gray-200 pb-6 flex justify-between items-center px-2"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                {review?.student?.photoUrl ? (
                  <img
                    src={review?.student?.photoUrl}
                    alt="user"
                    className="w-12 h-12 rounded-full "
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${review?.student?.name}&background=random&length=1&rounded=true`}
                    alt="user"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{review?.student?.name}</div>
                  <div className="flex items-center">
                    <RatingStars rating={review.rating} />
                    <span className="ml-2 text-gray-500 text-sm">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{review.review}</p>
            </div>
            {username === review?.student?.username && (
              <Trash2
                className="cursor-pointer text-red-600"
                onClick={() => deleteReview(review._id)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReviewAndRating;
