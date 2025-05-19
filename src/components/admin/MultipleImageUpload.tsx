
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MultipleImageUploadProps {
  productId: string;
  existingImages?: { id: string, url: string }[];
  onImagesChange: (images: { id: string, url: string }[]) => void;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({ 
  productId, 
  existingImages = [],
  onImagesChange 
}) => {
  const [images, setImages] = useState<{ id: string, url: string }[]>(existingImages);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;
    
    setIsAdding(true);
    
    try {
      const { data, error } = await supabase
        .from('product_images')
        .insert([{
          product_id: productId,
          image_url: newImageUrl,
          is_primary: images.length === 0,
          display_order: images.length
        }])
        .select();
      
      if (error) throw error;
      
      const newImage = { id: data[0].id, url: data[0].image_url };
      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      setNewImageUrl('');
      
      toast({
        title: 'Success',
        description: 'Image added successfully',
      });
    } catch (error: any) {
      console.error('Error adding image:', error);
      toast({
        title: 'Error',
        description: `Failed to add image: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const updatedImages = images.filter(img => img.id !== id);
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
      // If we deleted the primary image, make the first remaining image primary
      if (updatedImages.length > 0) {
        const wasPrimary = !images.find(img => img.id !== id && img.id === (existingImages.find(ei => ei.id === id)?.id));
        if (wasPrimary) {
          const { error: updateError } = await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', updatedImages[0].id);
          
          if (updateError) console.error('Error updating primary image:', updateError);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: `Failed to delete image: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `product_images/${fileName}`;
        
        // Upload to storage
        const { error: uploadError, data } = await supabase.storage
          .from('products')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        // Add to product_images table
        const { data: imageData, error: insertError } = await supabase
          .from('product_images')
          .insert([{
            product_id: productId,
            image_url: publicUrl,
            is_primary: images.length === 0 && i === 0,
            display_order: images.length + i
          }])
          .select();
        
        if (insertError) throw insertError;
        
        const newImage = { id: imageData[0].id, url: imageData[0].image_url };
        setImages(prev => [...prev, newImage]);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      // Notify parent component of all images
      onImagesChange(images);
      
      toast({
        title: 'Success',
        description: `${files.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: `Failed to upload images: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Product Images</h3>
      
      {/* Image preview grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((image) => (
          <div key={image.id} className="relative aspect-square border rounded overflow-hidden group">
            <img 
              src={image.url} 
              alt="Product" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Error';
              }} 
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteImage(image.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {/* Upload placeholder */}
        <label className="border border-dashed rounded aspect-square flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="text-xs text-gray-500">{uploadProgress}%</span>
            </div>
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Upload Images</span>
            </>
          )}
        </label>
      </div>
      
      {/* URL input */}
      <div className="flex gap-2">
        <Input
          placeholder="Or add image URL..."
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          disabled={isAdding}
        />
        <Button 
          onClick={handleAddImage} 
          disabled={!newImageUrl.trim() || isAdding}
          variant="outline"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1" />
          )}
          Add
        </Button>
      </div>
    </div>
  );
};

export default MultipleImageUpload;
