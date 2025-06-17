
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useRatingStore } from "@/stores/ratingStore";

interface AllRatingsModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AllRatingsModal = ({ userId, open, onOpenChange }: AllRatingsModalProps) => {
  const { userRatings } = useRatingStore();
  const ratings = userRatings[userId] || [];

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Ratings ({ratings.length})</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {ratings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No ratings yet
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{rating.raterUserName}</span>
                      <div className="flex">{renderStars(rating.rating)}</div>
                      <span className="text-sm text-gray-600">({rating.rating}/5)</span>
                    </div>
                    {rating.comment && (
                      <p className="text-gray-700 mb-2">{rating.comment}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      {rating.itemTitle && `Item: ${rating.itemTitle} • `}
                      {rating.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
