import { Star, StarHalf } from "lucide-react";

function RatingStars({ rating, interactive = false, onRatingChange = null }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className={`${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
        >
          {star <= fullStars ? (
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ) : star === fullStars + 1 && hasHalfStar ? (
            <StarHalf className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ) : (
            <Star className="w-5 h-5 text-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}

export default RatingStars;
