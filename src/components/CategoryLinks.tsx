import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Smartphone, Car, Shirt, Home, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  listing_count?: number;
}

const categoryIcons: Record<string, any> = {
  electronics: Smartphone,
  vehicles: Car,
  fashion: Shirt,
  home: Home,
  sports: Gamepad2,
  default: Package
};

export const CategoryLinks = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
        .limit(6);

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (name: string) => {
    navigate(`/category/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`);
  };

  const handleViewAllCategories = () => {
    navigate('/categories');
  };

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge 
            variant="secondary" 
            className="mb-4 px-6 py-2 text-sm font-medium bg-primary/10 border border-primary/20 text-primary"
          >
            Browse by Category
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Find What You're Looking For
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our popular categories and discover amazing items from Ghana's trading community
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.name.toLowerCase()] || categoryIcons.default;
            
            return (
              <Card 
                key={category.id}
                className="p-6 text-center bg-card border border-primary/10 shadow-elegant hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors mx-auto mb-4 w-fit">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors text-sm md:text-base">
                  {category.name}
                </h3>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            variant="outline"
            onClick={handleViewAllCategories}
            className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary bg-background/80 backdrop-blur-sm px-8 py-3 font-semibold transition-all duration-300 hover:scale-105"
          >
            View All Categories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};