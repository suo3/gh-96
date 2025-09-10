import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface BulkProduct {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  images?: string[];
  wanted_items?: string[];
}

export const AdminBulkImport = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [products, setProducts] = useState<BulkProduct[]>([]);

  const sampleData = `title,description,price,category,condition,location,images,wanted_items
"iPhone 14 Pro Max 256GB","Barely used iPhone 14 Pro Max in excellent condition. All accessories included.",8500,"Electronics","Used - Like New","East Legon, Accra","https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400","Samsung Galaxy S24, Cash"
"MacBook Air M2","2022 MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Perfect for students and professionals.",12000,"Electronics","Used - Good","Kumasi","https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400","ThinkPad, Cash"
"Toyota Corolla 2019","Well maintained Toyota Corolla 2019 model. Low mileage, full service history.",45000,"Cars","Used - Good","Tema","https://images.unsplash.com/photo-1549924231-f129b911e442?w=400","Honda Civic, Nissan Sentra"
"3 Bedroom House - Kumasi","Modern 3 bedroom house with 2 bathrooms, kitchen, and parking space.",250000,"Real Estate","New","Kumasi","https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400","Land, 4 Bedroom House"
"Kente Cloth Traditional","Authentic handwoven Kente cloth from Bonwire. Perfect for special occasions.",800,"Fashion","New","Kumasi","https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400","Other traditional wear"
"Rice Cooker - 5L","Brand new 5 liter rice cooker, perfect for families. Energy efficient.",150,"Home & Garden","New","Accra","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400","Blender, Microwave"`;

  const loadSampleData = () => {
    setCsvData(sampleData);
    toast({
      title: "Sample Data Loaded",
      description: "Ghana marketplace sample data has been loaded. You can edit it before importing.",
    });
  };

  const parseCsvData = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data or load sample data first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const parsedProducts: BulkProduct[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('","').map(v => v.replace(/"/g, '').trim());
        
        if (values.length >= 6) {
          const product: BulkProduct = {
            title: values[0],
            description: values[1],
            price: parseFloat(values[2]) || 0,
            category: values[3],
            condition: values[4],
            location: values[5],
            images: values[6] ? [values[6]] : ["https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400"],
            wanted_items: values[7] ? values[7].split(',').map(item => item.trim()) : []
          };
          parsedProducts.push(product);
        }
      }
      
      setProducts(parsedProducts);
      toast({
        title: "CSV Parsed Successfully",
        description: `${parsedProducts.length} products parsed and ready to import.`,
      });
    } catch (error) {
      toast({
        title: "Error Parsing CSV",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    }
  };

  const importProducts = async () => {
    if (products.length === 0) {
      toast({
        title: "Error",
        description: "No products to import. Please parse CSV data first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, create sample user profiles for the products if they don't exist
      const sampleUserIds = await createSampleUsers();
      
      // Convert products to database format
      const listingsData = products.map((product, index) => ({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        condition: product.condition,
        location: product.location,
        images: product.images,
        wanted_items: product.wanted_items,
        user_id: sampleUserIds[index % sampleUserIds.length], // Distribute products among sample users
        status: 'active'
      }));

      const { data, error } = await supabase
        .from('listings')
        .insert(listingsData);

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `${products.length} products have been imported successfully.`,
      });

      setProducts([]);
      setCsvData("");
    } catch (error) {
      console.error('Error importing products:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSampleUsers = async () => {
    const sampleUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        first_name: 'Kwame',
        last_name: 'Asante',
        username: 'kwame_tech',
        location: 'Accra',
        region: 'Greater Accra',
        city: 'Accra',
        bio: 'Tech enthusiast selling quality electronics',
        rating: 4.8,
        total_sales: 23
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        first_name: 'Ama',
        last_name: 'Osei',
        username: 'ama_fashion',
        location: 'Kumasi',
        region: 'Ashanti',
        city: 'Kumasi',
        bio: 'Traditional and modern fashion seller',
        rating: 4.9,
        total_sales: 45
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        first_name: 'Kofi',
        last_name: 'Mensah',
        username: 'kofi_cars',
        location: 'Tema',
        region: 'Greater Accra',
        city: 'Tema',
        bio: 'Reliable car dealer with quality vehicles',
        rating: 4.7,
        total_sales: 12
      }
    ];

    const userIds = [];

    for (const userData of sampleUsers) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert(userData, { onConflict: 'id' });
        
        if (!error) {
          userIds.push(userData.id);
        }
      } catch (error) {
        console.log('User might already exist:', userData.username);
        userIds.push(userData.id);
      }
    }

    return userIds.length > 0 ? userIds : [user?.id]; // Fallback to current user if sample users fail
  };

  const downloadTemplate = () => {
    const csvTemplate = `title,description,price,category,condition,location,images,wanted_items
"Product Title","Product description here",100,"Electronics","New","Accra","https://example.com/image.jpg","Item 1, Item 2"`;
    
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Product Import
          </CardTitle>
          <CardDescription>
            Import multiple products at once using CSV format or start with sample Ghana marketplace data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={loadSampleData} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Load Ghana Sample Data
            </Button>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* CSV Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-data">CSV Data</Label>
            <Textarea
              id="csv-data"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here or load sample data..."
              className="h-40 font-mono text-sm"
            />
          </div>

          {/* Parse and Import Buttons */}
          <div className="flex gap-3">
            <Button onClick={parseCsvData} variant="outline">
              Parse CSV Data
            </Button>
            <Button 
              onClick={importProducts} 
              disabled={loading || products.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Importing..." : `Import ${products.length} Products`}
            </Button>
          </div>

          {/* Preview */}
          {products.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({products.length} products)</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-muted/50">
                {products.slice(0, 3).map((product, index) => (
                  <div key={index} className="mb-3 pb-3 border-b last:border-b-0">
                    <div className="font-medium">{product.title}</div>
                    <div className="text-sm text-muted-foreground">
                      ₵{product.price} • {product.category} • {product.location}
                    </div>
                  </div>
                ))}
                {products.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    ... and {products.length - 3} more products
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};