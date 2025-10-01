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
"Samsung TV 55 Smart","55-inch Samsung Smart TV with 4K resolution. Perfect for home entertainment.",3500,"Electronics","Used - Good","Accra","https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400","LG TV, Sony TV"
"Gaming Laptop HP","High-performance gaming laptop with RTX graphics card. Perfect for gaming and work.",15000,"Electronics","Used - Like New","Tema","https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400","Gaming Desktop, Cash"
"Sony Headphones","Wireless noise-cancelling headphones with excellent sound quality.",800,"Electronics","New","Kumasi","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400","Bose Headphones, Cash"
"Washer and Dryer Set","Energy-efficient washing machine and dryer combo. Perfect for families.",4500,"Appliances","Used - Good","Accra","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400","Single Washer, Cash"
"Refrigerator Double Door","Large capacity double door refrigerator with freezer compartment.",3200,"Appliances","Used - Good","Tema","https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400","Single Door Fridge, Cash"
"Microwave Oven","Compact microwave oven with grill function. Perfect for small kitchens.",450,"Appliances","New","Kumasi","https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400","Toaster Oven, Cash"
"Air Conditioner Split","1.5 HP split AC unit with remote control. Energy efficient cooling.",2800,"Appliances","Used - Good","Accra","https://images.unsplash.com/photo-1506423555807-df39b04aceb8?w=400","Window AC, Cash"
"Blender High Speed","Professional grade blender for smoothies and food preparation.",320,"Appliances","New","Tema","https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400","Food Processor, Cash"
"Abstract Canvas Art","Beautiful abstract painting on canvas. Perfect for modern homes.",650,"Art & Crafts","New","Accra","https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400","Other Art, Cash"
"Handmade Pottery Set","Traditional Ghanaian pottery set including bowls and vases.",400,"Art & Crafts","New","Kumasi","https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400","Clay Items, Cash"
"Beaded Jewelry","Handcrafted beaded necklaces and bracelets. Traditional African designs.",150,"Art & Crafts","New","Tema","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400","Other Jewelry, Cash"
"Wood Carving Mask","Authentic African wooden mask. Hand-carved by local artisans.",800,"Art & Crafts","New","Accra","https://images.unsplash.com/photo-1577720643271-6760b6dc2054?w=400","Other Carvings, Cash"
"Kente Fabric Strips","Authentic Kente cloth strips for traditional wear or decoration.",500,"Art & Crafts","New","Kumasi","https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400","Traditional Cloth, Cash"
"Toyota Corolla 2019","Well maintained Toyota Corolla 2019 model. Low mileage, full service history.",45000,"Automotive","Used - Good","Tema","https://images.unsplash.com/photo-1549924231-f129b911e442?w=400","Honda Civic, Nissan Sentra"
"Honda Civic 2020","2020 Honda Civic in excellent condition. One owner, full service records.",52000,"Automotive","Used - Like New","Accra","https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400","Toyota Corolla, Cash"
"Nissan Sentra 2018","Reliable and fuel-efficient sedan. Perfect for daily commuting.",38000,"Automotive","Used - Good","Kumasi","https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400","Other Sedans, Cash"
"Ford Pickup Truck","Heavy-duty pickup truck perfect for construction and farming.",65000,"Automotive","Used - Good","Tema","https://images.unsplash.com/photo-1562141961-d1f1d5a8a76c?w=400","Other Trucks, Cash"
"Motorcycle Honda","150cc Honda motorcycle in good running condition. Great for city commuting.",8500,"Automotive","Used - Good","Accra","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400","Other Motorcycles, Cash"
"Baby Stroller","Lightweight and foldable baby stroller with safety harness.",450,"Baby & Kids","Used - Good","Accra","https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400","Baby Carrier, Cash"
"Children Bicycle","Kids bicycle with training wheels. Perfect for ages 4-8 years.",280,"Baby & Kids","Used - Good","Tema","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Scooter, Cash"
"Baby Crib Wooden","Solid wood baby crib with adjustable mattress height.",850,"Baby & Kids","Used - Like New","Kumasi","https://images.unsplash.com/photo-1555898019-aca9292ba016?w=400","Toddler Bed, Cash"
"Toy Building Blocks","Educational building blocks set for creative play.",150,"Baby & Kids","New","Accra","https://images.unsplash.com/photo-1558877385-bc7c71e40c23?w=400","Other Toys, Cash"
"High Chair Baby","Adjustable high chair for feeding time. Easy to clean.",320,"Baby & Kids","Used - Good","Tema","https://images.unsplash.com/photo-1586024408152-5b96006f2518?w=400","Booster Seat, Cash"`;

  const loadSampleData = async () => {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');
      if (error) throw error;

      const conditions = ["New", "Used - Like New", "Used - Good"];
      const locations = ["Accra", "Kumasi", "Tema", "Takoradi", "Cape Coast"];
      
      // Build a unique, category-relevant image using Unsplash Source with a stable seed
      const imageFor = (cat: string, seed: number) => `https://source.unsplash.com/featured/800x600?${encodeURIComponent(cat)},product,marketplace&sig=${seed}`;
      
      // Realistic product names by category
      const productNames: Record<string, string[]> = {
        'Electronics': [
          'iPhone Pro Max',
          'MacBook Air Laptop',
          'Samsung Smart TV',
          'Sony Wireless Headphones',
          'Dell Gaming Laptop'
        ],
        'Appliances': [
          'LG Washing Machine',
          'Samsung Refrigerator',
          'Microwave Oven',
          'Air Conditioner Unit',
          'Electric Blender'
        ],
        'Automotive': [
          'Toyota Corolla',
          'Honda Civic',
          'Nissan Sentra',
          'Ford Pickup Truck',
          'Yamaha Motorcycle'
        ],
        'Fashion & Beauty': [
          'Designer Handbag',
          'Leather Jacket',
          'Wedding Dress',
          'Running Sneakers',
          'Gold Necklace'
        ],
        'Baby & Kids': [
          'Baby Stroller',
          'Wooden Crib',
          'Kids Bicycle',
          'Educational Toys Set',
          'High Chair'
        ],
        'Art & Crafts': [
          'Canvas Painting',
          'Handmade Pottery',
          'Beaded Jewelry',
          'Wooden Sculpture',
          'Kente Cloth'
        ],
        'Home & Garden': [
          'Leather Sofa Set',
          'Dining Table',
          'Garden Tools',
          'Outdoor Furniture',
          'Wall Decorations'
        ],
        'Sports & Fitness': [
          'Treadmill Machine',
          'Weight Bench',
          'Yoga Mat Set',
          'Mountain Bike',
          'Tennis Racket'
        ]
      };

      const header = 'title,description,price,category,condition,location,images,wanted_items';
      const lines: string[] = [header];

      (categories || []).forEach((c: { name: string }, idx: number) => {
        const category = c.name;
        const names = productNames[category] || ['Quality Item', 'Premium Product', 'Excellent Condition', 'Great Value', 'Top Quality'];
        
        for (let i = 0; i < 5; i++) {
          const seed = i + idx * 100;
          const title = names[i % names.length];
          const desc = `High quality ${category.toLowerCase()} in excellent condition. Well maintained and ready for immediate use.`;
          const price = Math.round(100 + i * 25 + idx * 10);
          const condition = conditions[i % conditions.length];
          const location = locations[(i + idx) % locations.length];
          const image = imageFor(category, seed);
          const wanted = 'Cash';
          lines.push(`"${title}","${desc}",${price},"${category}","${condition}","${location}","${image}","${wanted}"`);
        }
      });

      const csv = lines.join('\n');
      setCsvData(csv);
      toast({ title: 'Sample Data Loaded', description: 'Generated 5 items per category with unique, category-relevant images.' });
    } catch (e) {
      console.error('Error generating sample CSV:', e);
      toast({ title: 'Failed to load sample data', description: 'Could not generate sample dataset.', variant: 'destructive' });
    }
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
      const rawLines = csvData.trim().split('\n').filter(l => l.trim().length > 0);

      // Robust CSV line parser to handle quoted fields and commas
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // Escaped quote
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current);
        return result.map(v => v.trim().replace(/^"|"$/g, ''));
      };

      if (rawLines.length === 0) {
        throw new Error('No CSV lines');
      }

      const headers = parseCsvLine(rawLines[0]).map(h => h.replace(/"/g, '').trim());
      const parsedProducts: BulkProduct[] = [];

      for (let i = 1; i < rawLines.length; i++) {
        const values = parseCsvLine(rawLines[i]);
        if (values.length >= 6) {
          const imageField = values[6] || '';
          const wantedField = values[7] || '';
          const product: BulkProduct = {
            title: values[0] || '',
            description: values[1] || '',
            price: parseFloat(values[2]) || 0,
            category: values[3] || '',
            condition: values[4] || '',
            location: values[5] || '',
            images: imageField ? imageField.split(/[|;\s]+/).map(u => u.trim()).filter(Boolean) : ["https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400"],
            wanted_items: wantedField ? wantedField.split(',').map(item => item.trim()).filter(Boolean) : []
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

  const ensureMinPerCategory = (items: BulkProduct[], min = 5): BulkProduct[] => {
    const map = new Map<string, BulkProduct[]>();
    items.forEach((p) => {
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
    });
    const result: BulkProduct[] = [];
    map.forEach((arr) => {
      const needed = Math.max(0, min - arr.length);
      for (let i = 0; i < needed; i++) {
        const base = arr[i % arr.length];
        result.push({
          ...base,
          title: `${base.title} (Sample ${i + 1})`,
          price: Math.max(0, (base.price || 0) + (i + 1) * 5),
        });
      }
      result.push(...arr);
    });
    return result;
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
      const expanded = ensureMinPerCategory(products, 5);
      const { data, error } = await supabase.functions.invoke('admin-bulk-import-listings', {
        body: { products: expanded },
      });

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `${expanded.length} products imported as KentaKart.`,
      });

      setProducts([]);
      setCsvData("");
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error?.message || 'Failed to import products.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvTemplate = `title,description,price,category,condition,location,images,wanted_items
"Product Title","Product description here",100,"Electronics","New","Accra","https://example.com/image1.jpg|https://example.com/image2.jpg","Item 1, Item 2"`;
    
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