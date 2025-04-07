
import { supabase } from '@/integrations/supabase/client';

// This function creates a storage bucket for product images if it doesn't exist
export const setupProductStorage = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      return;
    }

    const productsBucketExists = buckets?.some(bucket => bucket.name === 'products');
    
    if (!productsBucketExists) {
      // Create the products bucket
      const { data, error } = await supabase
        .storage
        .createBucket('products', {
          public: true,
          fileSizeLimit: 10485760, // 10MB in bytes
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
        });
        
      if (error) {
        console.error('Error creating products bucket:', error);
      } else {
        console.log('Products bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Unexpected error in setupProductStorage:', error);
  }
};

// Function to call when the application initializes
export const initStorage = async () => {
  await setupProductStorage();
};
