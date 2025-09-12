import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { getCategoryIcon } from "@/utils/categoryIcons";

interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  item_count?: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch item counts for each category
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          const { count } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('category', category.name)
            .eq('status', 'active');

          return {
            ...category,
            item_count: count || 0
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-16 w-16 bg-muted rounded-full mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Categories - KenteKart Ghana Trading Platform</title>
        <meta 
          name="description" 
          content="Browse all categories on KenteKart Ghana. Find electronics, fashion, home goods, vehicles and more in Ghana's premier trading marketplace." 
        />
        <meta name="keywords" content="categories, electronics, fashion, vehicles, home goods, ghana marketplace" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Homepage
              </Button>
            </Link>
            
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
                🛍️ Browse Categories
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-primary">Explore</span>
                <span className="block text-foreground">All Categories</span>
              </h1>
              
              <p className="text-xl text-muted-foreground">
                Find exactly what you're looking for across all our trading categories
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.name);
              const categorySlug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              
              return (
                <Link 
                  key={category.id} 
                  to={`/category/${categorySlug}`}
                  className="group"
                >
                  <Card className="p-4 md:p-8 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary/10 group-hover:border-primary/30">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 md:p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4 md:mb-6">
                        <IconComponent className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                      </div>
                      
                      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="text-xs md:text-sm font-medium">
                          {category.item_count || 0} items
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Call to Action */}
          <Card className="p-6 md:p-8 lg:p-12 text-center bg-primary/5 border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Don't See Your Category?</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find the perfect category for your item? No worries! You can still list your item 
              and help us grow our marketplace categories.
            </p>
            <Link to="/post">
              <Button size="lg" className="font-semibold w-full sm:w-auto">
                List Your Item
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
}