
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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
    images: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { toast } = useToast();
  const { createListing } = useListingStore();
  const { user } = useAuthStore();

  const categories = [
    "Electronics", "Books", "Clothing", "Kitchen", "Furniture", 
    "Sports", "Toys", "Garden", "Art", "Music", "Other"
  ];

  const conditions = ["New", "Like New", "Good", "Fair"];

  // Fetch user's location from profile when dialog opens
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('location')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        setUserLocation(profile?.location || null);
        console.log('User location from profile:', profile?.location);
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    if (open && user?.id) {
      fetchUserLocation();
    }
  }, [open, user?.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 4 images total
    const remainingSlots = 4 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast({
        title: "Image Limit",
        description: `You can only upload up to 4 images. ${remainingSlots} slots remaining.`,
        variant: "destructive"
      });
    }

    if (filesToAdd.length > 0) {
      const newImages = [...formData.images, ...filesToAdd];
      setFormData({ ...formData, images: newImages });
      
      // Create preview URLs
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
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
    
    console.log('=== POST ITEM DEBUG START ===');
    console.log('Submit clicked, formData:', formData);
    console.log('User:', user);
    console.log('User location from profile:', userLocation);
    
    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      console.log('Form validation failed - missing required fields');
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      console.log('User not authenticated');
      toast({
        title: "Authentication Required",
        description: "You must be logged in to post an item.",
        variant: "destructive",
      });
      return;
    }

    console.log('Setting isSubmitting to true');
    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      
      // Upload all images if provided
      if (formData.images.length > 0) {
        console.log('Uploading images to Supabase...');
        const uploadPromises = formData.images.map(image => uploadImageToSupabase(image));
        const uploadResults = await Promise.all(uploadPromises);
        
        // Filter out any failed uploads
        imageUrls = uploadResults.filter(url => url !== null) as string[];
        
        if (imageUrls.length !== formData.images.length) {
          toast({
            title: "Some Images Failed to Upload",
            description: `${formData.images.length - imageUrls.length} images failed to upload.`,
            variant: "destructive",
          });
        }
        
        console.log('Images uploaded successfully:', imageUrls);
      }

      // If no images were uploaded, use default
      if (imageUrls.length === 0) {
        imageUrls = ["https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"];
      }

      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        wanted_items: formData.wantedItems.length > 0 ? formData.wantedItems : null,
        images: imageUrls,
        user_id: user.id,
        location: userLocation,
        status: 'active',
        views: 0,
        likes: 0
      };

      console.log('About to call createListing with data:', listingData);
      
      const result = await createListing(listingData);
      console.log('createListing result:', result);

      console.log('Listing created successfully');

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
        images: [],
      });
      // Clean up preview URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);

      onOpenChange(false);
    } catch (error) {
      console.error('=== ERROR POSTING ITEM ===');
      console.error('Error details:', error);
      toast({
        title: "Error Posting Item",
        description: `There was a problem posting your item: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      console.log('Setting isSubmitting to false in finally block');
      setIsSubmitting(false);
      console.log('=== POST ITEM DEBUG END ===');
    }
  };

  // Check if form is valid
  const isFormValid = formData.title && formData.description && formData.category && formData.condition;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Post an Item to Swap</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photos (up to 4) *</Label>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 p-1 h-auto"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {formData.images.length < 4 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Upload photos of your item ({formData.images.length}/4)
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Files
                    </label>
                  </Button>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
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

          {/* Location Display */}
          {userLocation && (
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                📍 {userLocation}
              </div>
            </div>
          )}

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
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Posting..." : "Post Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
