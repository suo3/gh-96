
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface ReportListingDialogProps {
  listingId: string;
  listingTitle: string;
}

export const ReportListingDialog = ({ listingId, listingTitle }: ReportListingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const reportReasons = [
    "Inappropriate content",
    "Spam or scam",
    "Misleading information",
    "Prohibited item",
    "Duplicate listing",
    "Other"
  ];

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to report listings");
      return;
    }

    if (!reason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting report for listing:', listingId);

      const { error } = await supabase
        .from('reported_listings')
        .insert({
          listing_id: listingId,
          reporter_id: user.id,
          reason,
          description: description.trim() || null
        });

      if (error) throw error;

      toast.success("Report submitted successfully. Thank you for helping keep our community safe.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Flag className="w-4 h-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Listing</DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Listing: {listingTitle}
            </Label>
          </div>

          <div>
            <Label htmlFor="reason">Reason for reporting *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context..."
              className="min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !reason}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
