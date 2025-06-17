
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useRatingStore } from "@/stores/ratingStore";

interface UserRatingDisplayProps {
  userId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UserRatingDisplay = ({ userId, showCount = false, size = 'sm' }: UserRatingDisplayProps) => {
  const { fetchUserRatings, getAverageRating, userRatings } = useRatingStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserRatings(userId).finally(() => setIsLoading(false));
    }
  }, [userId, fetchUserRatings]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
      </div>
    );
  }

  const averageRating = getAverageRating(userId);
  const ratingCount = userRatings[userId]?.length || 0;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    
    const starSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3';

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={`${starSize} text-yellow-400 fill-current`} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className={`${starSize} text-yellow-400 fill-current opacity-50`} />);
      } else {
        stars.push(<Star key={i} className={`${starSize} text-gray-300`} />);
      }
    }
    return stars;
  };

  if (averageRating === 0) {
    return (
      <div className="flex items-center space-x-1 text-gray-500">
        <span className="text-sm">No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">{renderStars()}</div>
      <span className={`${size === 'lg' ? 'text-base' : 'text-sm'} font-medium text-gray-700`}>
        {averageRating.toFixed(1)}
      </span>
      {showCount && (
        <span className="text-sm text-gray-500">({ratingCount})</span>
      )}
    </div>
  );
};
