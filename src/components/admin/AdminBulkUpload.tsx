import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationInput } from "@/components/LocationInput";
import { ImageUpload } from "@/components/ImageUpload";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { useListingStore } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";
import { Upload, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

interface Condition {
  id: string;
  name: string;
  value: string;
  display_order: number;
  is_active: boolean;
}

interface BulkListingItem {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  location: string;
  images: string[];
  wantedItems: string[];
}

const initialItem: BulkListingItem = {
  title: "",
  description: "",
  category: "",
  condition: "",
  price: "",
  location: "",
  images: [],
  wantedItems: []
};

export const AdminBulkUpload = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BulkListingItem[]>([initialItem]);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const { toast } = useToast();
  const { addListing } = useListingStore();
  const { user } = useAuthStore();

  // Fetch categories and conditions from database
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        // Fetch conditions
        const { data: conditionsData, error: conditionsError } = await supabase
          .from('conditions')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
        } else {
          setConditions(conditionsData || []);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const addNewItem = () => {
    setItems([...items, { ...initialItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof BulkListingItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleWantedItemsChange = (index: number, value: string) => {
    const wantedItems = value.split(',').map(item => item.trim()).filter(item => item);
    updateItem(index, 'wantedItems', wantedItems);
  };

  const validateItem = (item: BulkListingItem): string | null => {
    if (!item.title.trim()) return "Title is required";
    if (!item.category) return "Category is required";
    if (!item.condition) return "Condition is required";
    if (item.price && isNaN(parseFloat(item.price))) return "Price must be a valid number";
    return null;
  };

  const handleBulkUpload = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload listings",
        variant: "destructive",
      });
      return;
    }

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const error = validateItem(items[i]);
      if (error) {
        toast({
          title: `Error in Item ${i + 1}`,
          description: error,
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);
    let successCount = 0;
    let failureCount = 0;

    for (const item of items) {
      try {
        await addListing({
          title: item.title,
          description: item.description,
          category: item.category,
          condition: item.condition,
          price: item.price ? parseFloat(item.price) : undefined,
          location: item.location,
          images: item.images,
          wanted_items: item.wantedItems,
          status: 'active'
        });
        successCount++;
      } catch (error) {
        console.error('Failed to create listing:', error);
        failureCount++;
      }
    }

    setIsUploading(false);
    
    if (successCount > 0) {
      toast({
        title: "Bulk Upload Complete",
        description: `Successfully uploaded ${successCount} listing(s). ${failureCount > 0 ? `${failureCount} failed.` : ''}`,
      });
      
      if (failureCount === 0) {
        setItems([initialItem]);
        setOpen(false);
      }
    } else {
      toast({
        title: "Upload Failed",
        description: "Failed to upload any listings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const csvItems: BulkListingItem[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= headers.length && values[0]) {
            csvItems.push({
              title: values[0] || "",
              description: values[1] || "",
              category: values[2] || "",
              condition: values[3] || "",
              price: values[4] || "",
              location: values[5] || "",
              images: [],
              wantedItems: values[6] ? values[6].split(';').map(item => item.trim()) : []
            });
          }
        }
        
        if (csvItems.length > 0) {
          setItems(csvItems);
          toast({
            title: "CSV Loaded",
            description: `Loaded ${csvItems.length} items from CSV`,
          });
        }
      } catch (error) {
        toast({
          title: "CSV Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Bulk Upload Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Listings</DialogTitle>
          <DialogDescription>
            Upload multiple listings at once. You can add items manually or import from a CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* CSV Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Import from CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="csv-file" className="text-sm">
                  CSV Format: Title, Description, Category, Condition, Price, Location, Wanted Items (semicolon separated)
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={loadFromCSV}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Manual Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Items to Upload ({items.length})</h3>
              <Button onClick={addNewItem} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Item {index + 1}</CardTitle>
                    {items.length > 1 && (
                      <Button
                        onClick={() => removeItem(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${index}`}>Title *</Label>
                      <Input
                        id={`title-${index}`}
                        value={item.title}
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                        placeholder="Item title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`price-${index}`}>Price (Optional)</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`category-${index}`}>Category *</Label>
                      <Select onValueChange={(value) => updateItem(index, 'category', value)} disabled={isLoadingOptions}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`condition-${index}`}>Condition *</Label>
                      <Select onValueChange={(value) => updateItem(index, 'condition', value)} disabled={isLoadingOptions}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Select condition"} />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition.id} value={condition.value}>
                              {condition.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Describe the item..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`location-${index}`}>Location in Ghana</Label>
                    <LocationInput
                      value={item.location}
                      onChange={(value) => updateItem(index, 'location', value)}
                      placeholder="e.g., Accra, Greater Accra"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`wanted-${index}`}>Wanted Items (comma separated)</Label>
                    <Input
                      id={`wanted-${index}`}
                      value={item.wantedItems.join(', ')}
                      onChange={(e) => handleWantedItemsChange(index, e.target.value)}
                      placeholder="laptop, phone, books"
                    />
                  </div>
                  
                  <div>
                    <Label>Images</Label>
                    <ImageUpload
                      onImagesUploaded={(images) => updateItem(index, 'images', images)}
                      maxImages={5}
                      currentImages={item.images}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleBulkUpload}
              loading={isUploading}
              loadingText="Uploading..."
              disabled={items.length === 0 || isLoadingOptions}
            >
              Upload {items.length} Item{items.length > 1 ? 's' : ''}
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};