
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "./ImageUpload";
import { LocationInput } from "./LocationInput";
import { useListingStore } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/use-toast";
import { Coins, Plus, X } from "lucide-react";

interface PostItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostItemDialog = ({ open, onOpenChange }: PostItemDialogProps) => {
  const { user, canCreateListing } = useAuthStore();
  const { addListing, isLoading } = useListingStore();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [wantedItems, setWantedItems] = useState<string[]>([]);
  const [currentWantedItem, setCurrentWantedItem] = useState('');
  const [location, setLocation] = useState('');

  const categories = [
    "Electronics",
    "Clothing",
    "Furniture",
    "Books",
    "Sports Equipment",
    "Home Appliances",
    "Other"
  ];

  const conditions = [
    "New",
    "Like New",
    "Used - Excellent",
    "Used - Good",
    "Used - Fair"
  ];

  const handleAddWantedItem = () => {
    if (currentWantedItem.trim() !== '') {
      setWantedItems([...wantedItems, currentWantedItem.trim()]);
      setCurrentWantedItem('');
    }
  };

  const handleRemoveWantedItem = (index: number) => {
    const newWantedItems = [...wantedItems];
    newWantedItems.splice(index, 1);
    setWantedItems(newWantedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post an item.",
        variant: "destructive",
      });
      return;
    }

    if (!canCreateListing()) {
      toast({
        title: "Insufficient Coins",
        description: "You need 1 coin to post a listing. Purchase more coins to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !category || !condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const success = await addListing({
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      images,
      wantedItems,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatar || user.firstName?.charAt(0) || 'U',
      location: location.trim(),
      status: 'active',
    });

    if (success) {
      toast({
        title: "Item Posted Successfully!",
        description: "Your item has been posted and 1 coin has been deducted from your account.",
      });
      
      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setCategory('');
      setCondition('');
      setImages([]);
      setWantedItems([]);
      setLocation('');
      setCurrentWantedItem('');
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to Post Item",
        description: "There was an error posting your item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Post New Item
            <div className="flex items-center space-x-2 text-sm">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className={`${canCreateListing() ? 'text-green-600' : 'text-red-600'}`}>
                Cost: 1 coin {!canCreateListing() && '(Insufficient balance)'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {!canCreateListing() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              You need 1 coin to post a listing. You currently have {user?.coins || 0} coins.
              <Button 
                variant="link" 
                className="p-0 h-auto text-red-700 underline ml-1"
                onClick={() => {
                  onOpenChange(false);
                  // Could trigger opening coin purchase dialog here
                }}
              >
                Purchase more coins
              </Button>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <ImageUpload onImagesUploaded={setImages} currentImages={images} />
          </div>

          <div className="space-y-2">
            <Label>Wanted Items (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter item"
                value={currentWantedItem}
                onChange={(e) => setCurrentWantedItem(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddWantedItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            {wantedItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {wantedItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{item}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mr-1"
                      onClick={() => handleRemoveWantedItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <LocationInput
              value={location}
              onChange={(value) => setLocation(value)}
              placeholder="Enter your city and state"
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !canCreateListing()}
              className="flex-1"
            >
              {isLoading ? 'Posting...' : 'Post Item (1 coin)'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
