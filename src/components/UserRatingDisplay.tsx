
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";
import { useRatingStore, Rating } from "@/stores/ratingStore";

interface UserRatingDisplayProps {
  userId: string;
  showDetailed?: boolean;
  compact?: boolean;
}

export const UserRatingDisplay = ({ 
  userId, 
  showDetailed = false, 
  compact = false 
}: UserRatingDisplayProps) => {
  const { fetchUserRatings, getAverageRating, userRatings } = useRatingStore();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRatings = async () => {
      setLoading(true);
      await fetchUserRatings(userId);
      const userRatingList = userRatings[userId] || [];
      setRatings(userRatingList);
      setLoading(false);
    };

    if (userId) {
      loadRatings();
    }
  }, [userId, fetchUserRatings, userRatings]);

  const averageRating = getAverageRating(userId);
  const totalRatings = ratings.length;

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        <span className="text-sm text-gray-400">Loading ratings...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="text-sm font-medium">
          {averageRating > 0 ? averageRating : 'No ratings'}
        </span>
        {totalRatings > 0 && (
          <span className="text-xs text-gray-500">({totalRatings})</span>
        )}
      </div>
    );
  }

  return (
    <Card className={showDetailed ? "" : "border-0 shadow-none"}>
      {showDetailed && (
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            User Ratings
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showDetailed ? "" : "p-0"}>
        <div className="space-y-4">
          {/* Rating Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                <span className="text-lg font-bold">
                  {averageRating > 0 ? averageRating : 'No ratings yet'}
                </span>
              </div>
              {totalRatings > 0 && (
                <Badge variant="secondary">
                  {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Star Distribution */}
          {totalRatings > 0 && showDetailed && (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratings.filter(r => r.rating === stars).length;
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center space-x-2 text-sm">
                    <span className="w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-gray-600">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Reviews */}
          {showDetailed && ratings.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recent Reviews</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ratings.slice(0, 5).map((rating) => (
                  <div key={rating.id} className="border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {rating.raterUserName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rating.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.itemTitle && (
                      <p className="text-xs text-gray-500 mb-1">
                        Swap: {rating.itemTitle}
                      </p>
                    )}
                    {rating.comment && (
                      <p className="text-sm text-gray-700">{rating.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {rating.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalRatings === 0 && showDetailed && (
            <div className="text-center py-6 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No ratings yet</p>
              <p className="text-xs">Complete some swaps to start receiving ratings!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
