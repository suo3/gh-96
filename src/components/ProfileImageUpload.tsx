
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Upload, X, Loader2, User } from "lucide-react";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
}

export const ProfileImageUpload = ({ 
  currentImageUrl, 
  onImageUploaded 
}: ProfileImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to upload images');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadImage(file);
      onImageUploaded(uploadedUrl);
      
      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [onImageUploaded, toast, user]);

  const removeImage = async () => {
    if (!user || !currentImageUrl) return;

    try {
      const fileName = `${user.id}/profile.jpg`;
      await supabase.storage
        .from('profile-images')
        .remove([fileName]);

      onImageUploaded('');
      
      toast({
        title: "Profile image removed",
        description: "Your profile image has been removed.",
      });
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Current Profile Image */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-4xl font-bold">
              {user?.avatar || <User className="w-12 h-12" />}
            </div>
          )}
        </div>
        {currentImageUrl && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={removeImage}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? "Drop the image here..."
                    : "Click or drag to upload profile picture"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
