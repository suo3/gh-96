
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ItemCard } from "./ItemCard";
import { Listing, useListingStore } from "@/stores/listingStore";
import { useRatingStore } from "@/stores/ratingStore";

interface ItemListProps {
  items: Listing[];
  onItemLike: (item: Listing) => void;
}

export const ItemList = ({ items, onItemLike }: ItemListProps) => {
  const { fetchUserRatings, getAverageRating } = useRatingStore();
  const { minRating } = useListingStore();

  // Fetch ratings for all users when items change
  useEffect(() => {
    const userIds = [...new Set(items.map(item => item.user_id).filter(Boolean))];
    userIds.forEach(userId => {
      if (userId) {
        fetchUserRatings(userId);
      }
    });
  }, [items, fetchUserRatings]);

  // Apply rating filter at component level
  const filteredByRating = items.filter((item) => {
    if (minRating <= 0) return true;
    if (!item.user_id) return true; // Keep items without user_id
    const userRating = getAverageRating(item.user_id);
    return userRating >= minRating;
  });

  return (
    <>
      <div className="space-y-4">
        {filteredByRating.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onItemLike={onItemLike}
          />
        ))}
      </div>
    </>
  );
};
