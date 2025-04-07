
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Image, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  multiple?: boolean;
  onMultipleChange?: (urls: string[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value = '', 
  onChange, 
  multiple = false,
  onMultipleChange 
}) => {
  const [imageUrl, setImageUrl] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(value ? [value] : []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
      
      const uploadedUrl = publicUrlData.publicUrl;
      
      if (multiple) {
        const newUrls = [...imageUrls, uploadedUrl];
        setImageUrls(newUrls);
        if (onMultipleChange) {
          onMultipleChange(newUrls);
        }
      } else {
        setImageUrl(uploadedUrl);
        onChange(uploadedUrl);
      }
      
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      if (multiple && files.length > 1) {
        const uploadPromises = Array.from(files).map(file => uploadImage(file));
        await Promise.all(uploadPromises);
      } else {
        await uploadImage(files[0]);
      }
    } catch (error) {
      console.error('Error in handleFileChange:', error);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveImage = () => {
    setImageUrl('');
    onChange('');
  };
  
  const handleRemoveMultipleImage = (indexToRemove: number) => {
    const newUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newUrls);
    if (onMultipleChange) {
      onMultipleChange(newUrls);
    }
  };
  
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    
    if (multiple) {
      const newUrls = [...imageUrls, urlInput];
      setImageUrls(newUrls);
      if (onMultipleChange) {
        onMultipleChange(newUrls);
      }
    } else {
      setImageUrl(urlInput);
      onChange(urlInput);
    }
    
    setUrlInput('');
  };
  
  return (
    <Tabs defaultValue="upload">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload" className="flex items-center gap-1">
          <UploadCloud className="w-4 h-4" /> Upload
        </TabsTrigger>
        <TabsTrigger value="url" className="flex items-center gap-1">
          <LinkIcon className="w-4 h-4" /> URL
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" className="pt-4">
        <div className="flex flex-col space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              Click to upload or drag and drop<br />
              <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              multiple={multiple}
            />
          </div>
          
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          
          {!multiple && imageUrl && (
            <div className="relative">
              <img 
                src={imageUrl}
                alt="Uploaded image"
                className="w-full h-48 object-contain bg-gray-100 rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {multiple && imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-24 object-contain bg-gray-100 rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5"
                    onClick={() => handleRemoveMultipleImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="url" className="pt-4">
        <form onSubmit={handleUrlSubmit} className="flex flex-col space-y-4">
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <div className="flex gap-2">
              <Input 
                id="imageUrl"
                type="url" 
                placeholder="https://example.com/image.jpg" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <Button type="submit">Add</Button>
            </div>
          </div>
          
          {!multiple && imageUrl && (
            <div className="relative">
              <img 
                src={imageUrl}
                alt="Image from URL"
                className="w-full h-48 object-contain bg-gray-100 rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {multiple && imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-contain bg-gray-100 rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5"
                    onClick={() => handleRemoveMultipleImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </form>
      </TabsContent>
    </Tabs>
  );
};
