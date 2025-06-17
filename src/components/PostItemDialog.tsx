
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useListingStore } from "@/stores/listingStore";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { ImageUpload } from "./ImageUpload";
import { MapPin, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  condition: z.string().min(1, {
    message: "Please select a condition.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  wantedItems: z.string().optional(),
  images: z.array(z.string()).max(4, {
    message: "You can upload up to 4 images.",
  }).optional(),
});

interface PostItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostItemDialog = ({ open, onOpenChange }: PostItemDialogProps) => {
  const { addListing } = useListingStore();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const { detectLocation, isDetecting, detectedLocation } = useLocationDetection();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      condition: "",
      location: "",
      wantedItems: "",
      images: [],
    },
  });

  const handleDetectLocation = async () => {
    const location = await detectLocation();
    if (location) {
      form.setValue("location", location);
    }
  };

  const handleImageUpload = (imageUrls: string[]) => {
    form.setValue("images", imageUrls);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    setIsPending(true);
    
    try {
      await addListing({
        title: values.title,
        description: values.description,
        category: values.category,
        condition: values.condition,
        location: values.location,
        wanted_items: values.wantedItems ? [values.wantedItems] : [],
        images: values.images || []
      });

      toast({
        title: "Item Posted!",
        description: "Your item has been successfully posted to the marketplace.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error posting item:', error);
      toast({
        title: "Error",
        description: "Failed to post your item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Post Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Item</DialogTitle>
          <DialogDescription>
            List your item for swapping.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Item Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the item you are offering"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images (Up to 4)</FormLabel>
                  <FormControl>
                    <ImageUpload
                      onImagesUploaded={handleImageUpload}
                      maxImages={4}
                      currentImages={field.value || []}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload up to 4 images of your item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="sports">Sports Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="used_good">Used - Good</SelectItem>
                      <SelectItem value="used_fair">Used - Fair</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleDetectLocation}
                      disabled={isDetecting}
                    >
                      {isDetecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {detectedLocation && (
                    <FormDescription className="text-green-600">
                      Location detected: {detectedLocation}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="wantedItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wanted Items (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="List items you would like to swap for" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Posting..." : "Post Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
