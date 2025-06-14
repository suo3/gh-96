
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useListingStore } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";

interface PostItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostItemDialog = ({ open, onOpenChange }: PostItemDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    wantedItems: [] as string[],
    newWantedItem: "",
    image: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { createListing, loading } = useListingStore();
  const { user } = useAuthStore();

  const categories = [
    "Electronics", "Books", "Clothing", "Kitchen", "Furniture", 
    "Sports", "Toys", "Garden", "Art", "Music", "Other"
  ];

  const conditions = ["New", "Like New", "Good", "Fair"];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const addWantedItem = () => {
    if (formData.newWantedItem.trim() && !formData.wantedItems.includes(formData.newWantedItem.trim())) {
      setFormData({
        ...formData,
        wantedItems: [...formData.wantedItems, formData.newWantedItem.trim()],
        newWantedItem: "",
      });
    }
  };

  const removeWantedItem = (item: string) => {
    setFormData({
      ...formData,
      wantedItems: formData.wantedItems.filter(i => i !== item),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to post an item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll use a placeholder image URL since we don't have image upload set up
      const imageUrl = formData.image 
        ? "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"
        : "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";

      await createListing({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        wanted_items: formData.wantedItems.length > 0 ? formData.wantedItems : null,
        images: [imageUrl],
        user_id: user.id,
        location: user.location || null,
        status: 'active',
        views: 0,
        likes: 0
      });

      toast({
        title: "Item Posted!",
        description: "Your item has been added to the swap board.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        condition: "",
        wantedItems: [],
        newWantedItem: "",
        image: null,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error posting item:', error);
      toast({
        title: "Error Posting Item",
        description: "There was a problem posting your item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Post an Item to Swap</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photo *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              {formData.image ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setFormData({ ...formData, image: null })}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload a photo of your item</p>
                  <div className="flex items-center justify-center space-x-4">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Camera className="w-4 h-4 mr-2" />
                        Choose File
                      </label>
                    </Button>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Item Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Vintage Coffee Maker"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition *</Label>
            <Select 
              value={formData.condition} 
              onValueChange={(value) => setFormData({ ...formData, condition: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your item and why you're swapping it..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Wanted Items */}
          <div className="space-y-2">
            <Label>What are you looking for in exchange?</Label>
            <div className="flex space-x-2">
              <Input
                value={formData.newWantedItem}
                onChange={(e) => setFormData({ ...formData, newWantedItem: e.target.value })}
                placeholder="e.g., Books, Kitchen items, or 'Open to offers'"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWantedItem())}
                disabled={isSubmitting}
              />
              <Button 
                type="button" 
                onClick={addWantedItem} 
                variant="outline"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.wantedItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.wantedItems.map((item) => (
                  <Badge key={item} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeWantedItem(item)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? "Posting..." : "Post Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
