
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";

export const AccountDeletion = () => {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user || confirmText !== "DELETE") {
      return;
    }

    try {
      setIsDeleting(true);
      
      // Call the database function to delete all user data
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again or contact support.",
          variant: "destructive",
        });
        return;
      }

      // If successful, the user will be automatically logged out
      // since their auth record has been deleted
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Force logout to clean up local state
      await logout();
      
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfirmText("");
    }
  };

  const isConfirmValid = confirmText === "DELETE";

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
          <p className="text-sm text-red-700 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <div className="text-xs text-red-600 space-y-1">
            <p>• All your listings will be removed</p>
            <p>• Your conversation history will be deleted</p>
            <p>• Your ratings and reviews will be removed</p>
            <p>• Your coin balance will be lost</p>
            <p>• This action is irreversible</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This will permanently delete your account and remove all of your data from our servers. 
                  This action cannot be undone.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium mb-2">This will delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Your profile and personal information</li>
                    <li>All your listings and photos</li>
                    <li>Your message history and conversations</li>
                    <li>Your ratings and reviews</li>
                    <li>Your coin balance and transaction history</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">
                    Type <strong>DELETE</strong> to confirm:
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    className="font-mono"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={!isConfirmValid || isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
