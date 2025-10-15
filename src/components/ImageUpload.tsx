
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Upload, X, Loader2, Image as ImageIcon, Camera } from "lucide-react";
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useHaptics } from "@/hooks/useHaptics";

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages?: number;
  currentImages?: string[];
}

export const ImageUpload = ({ 
  onImagesUploaded, 
  maxImages = 4, 
  currentImages = [] 
}: ImageUploadProps) => {
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>(currentImages);
  const { toast } = useToast();
  const { user } = useAuthStore();
  const haptics = useHaptics();
  const isNative = Capacitor.isNativePlatform();

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to upload images');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive"
      });
      return;
    }

    const fileNames = acceptedFiles.map(file => file.name);
    setUploadingImages(prev => [...prev, ...fileNames]);

    try {
      const uploadPromises = acceptedFiles.map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesUploaded(newImages);
      
      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${acceptedFiles.length} image(s).`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload one or more images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImages(prev => prev.filter(name => !fileNames.includes(name)));
    }
  }, [images, maxImages, onImagesUploaded, toast, user]);

  const takePhoto = async () => {
    if (!isNative) return;
    
    haptics.light();
    
    try {
      const photo = await CapCamera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 90,
      });

      if (!photo.dataUrl) return;

      // Convert data URL to blob
      const response = await fetch(photo.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      await onDrop([file]);
    } catch (error) {
      console.error('Camera error:', error);
      haptics.error();
    }
  };

  const removeImage = async (index: number) => {
    haptics.light();
    const imageUrl = images[index];
    
    // Extract the file path from the URL to delete from storage
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;
      
      await supabase.storage
        .from('listing-images')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting image from storage:', error);
    }

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages
  });

  return (
    <div className="space-y-4">
      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Native Camera Button */}
      {isNative && images.length < maxImages && (
        <Button
          type="button"
          onClick={takePhoto}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </Button>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            {uploadingImages.length > 0 ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-gray-600">
                  Uploading {uploadingImages.length} image(s)...
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? "Drop the images here..."
                      : isNative
                      ? "Tap to select from gallery"
                      : "Drag & drop images here, or click to select"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP up to 10MB ({maxImages - images.length} remaining)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-gray-500 text-center">
          Maximum of {maxImages} images reached
        </p>
      )}
    </div>
  );
};
