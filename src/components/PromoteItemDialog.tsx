import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Star, Crown } from "lucide-react";
import { usePromoteItem, usePromotionPrices } from "@/hooks/usePromotions";
import { LoadingButton } from "@/components/ui/loading-button";

interface PromoteItemDialogProps {
  listingId: string;
  children: React.ReactNode;
}

const MOBILE_PROVIDERS = [
  { id: 'mtn', name: 'MTN Mobile Money', prefixes: ['024', '025', '053', '054', '055', '059'] },
  { id: 'vodafone', name: 'Vodafone Cash', prefixes: ['020', '050'] },
  { id: 'airteltigo', name: 'AirtelTigo Money', prefixes: ['026', '027', '028', '056', '057'] },
];

const PROMOTION_TYPES = [
  {
    id: 'featured',
    name: 'Featured Item',
    description: 'Appear in featured items section',
    icon: Star,
    color: 'text-yellow-500'
  },
  {
    id: 'category_featured',
    name: 'Category Featured',
    description: 'Top of category listings',
    icon: Megaphone,
    color: 'text-blue-500'
  },
  {
    id: 'homepage_carousel',
    name: 'Homepage Carousel',
    description: 'Premium carousel placement',
    icon: Crown,
    color: 'text-purple-500'
  }
];

export const PromoteItemDialog = ({ listingId, children }: PromoteItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [promotionType, setPromotionType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [durationDays, setDurationDays] = useState("7");

  const { data: prices, isLoading: pricesLoading } = usePromotionPrices();
  const promoteItem = usePromoteItem();

  const validatePhoneNumber = (phone: string, selectedProvider: string) => {
    const providerData = MOBILE_PROVIDERS.find(p => p.id === selectedProvider);
    if (!providerData) return false;
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return false;
    
    return providerData.prefixes.some(prefix => cleanPhone.startsWith(prefix));
  };

  const handlePromote = async () => {
    if (!promotionType || !phoneNumber || !provider) return;

    if (!validatePhoneNumber(phoneNumber, provider)) {
      alert('Please enter a valid phone number for the selected provider');
      return;
    }

    try {
      await promoteItem.mutateAsync({
        listingId,
        promotionType,
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        provider,
        durationDays: parseInt(durationDays)
      });
      setOpen(false);
      // Reset form
      setPromotionType("");
      setPhoneNumber("");
      setProvider("");
      setDurationDays("7");
    } catch (error) {
      console.error('Promotion error:', error);
    }
  };

  const getPrice = (type: string) => {
    if (pricesLoading || !prices) return 0;
    const key = `promotion_${type}_price`;
    return prices[key] || 0;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Promote Your Item
          </DialogTitle>
          <DialogDescription>
            Boost your item's visibility and reach more potential buyers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Promotion Types */}
          <div>
            <Label className="text-base font-medium">Choose Promotion Type</Label>
            <div className="grid gap-3 mt-2">
              {PROMOTION_TYPES.map((type) => {
                const Icon = type.icon;
                const price = getPrice(type.id);
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all ${
                      promotionType === type.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setPromotionType(type.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${type.color}`} />
                          {type.name}
                        </div>
                        <span className="text-lg font-bold text-primary">
                          ₵{price}
                        </span>
                      </CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {promotionType && (
            <>
              {/* Duration */}
              <div>
                <Label htmlFor="duration">Promotion Duration</Label>
                <Select value={durationDays} onValueChange={setDurationDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Money Provider */}
              <div>
                <Label htmlFor="provider">Mobile Money Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your mobile money provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOBILE_PROVIDERS.map((prov) => (
                      <SelectItem key={prov.id} value={prov.id}>
                        {prov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone">Mobile Money Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 0241234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                />
                {provider && phoneNumber && !validatePhoneNumber(phoneNumber, provider) && (
                  <p className="text-sm text-destructive mt-1">
                    Invalid phone number for {MOBILE_PROVIDERS.find(p => p.id === provider)?.name}
                  </p>
                )}
              </div>

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-xl font-bold text-primary">
                      ₵{getPrice(promotionType)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    For {durationDays} days of promotion
                  </p>
                </CardContent>
              </Card>

              <LoadingButton
                onClick={handlePromote}
                loading={promoteItem.isPending}
                disabled={!promotionType || !phoneNumber || !provider || !validatePhoneNumber(phoneNumber, provider)}
                className="w-full"
                size="lg"
              >
                {promoteItem.isPending ? "Processing..." : "Promote Item"}
              </LoadingButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};