
import { supabase } from '@/integrations/supabase/client';

// This function creates a storage bucket for product images if it doesn't exist
export const setupProductStorage = async () => {
  try {
    console.log("Setting up product storage bucket");
    
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
      console.log("Products bucket doesn't exist, creating it now");
      
      // Create the products bucket with less restrictive policies
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
        
        // Create a public policy for the bucket
        try {
          // This needs to be run by an admin, may fail for regular users
          function setupStorage(policy: "check_user_role" | "is_admin" | "is_staff_or_admin" | "create_storage_policy")
          const { error: policyError } = await supabase.rpc(
            'create_storage_policy',
            { 
              bucket_name: 'products',
              is_public: true 
            }
          );
          
          if (policyError) {
            console.error('Error setting bucket policy:', policyError);
          } else {
            console.log('Bucket policy set to public successfully');
          }
        } catch (policyErr) {
          console.error('Error handling bucket policy:', policyErr);
        }
      }
    } else {
      console.log("Products bucket already exists");
    }
  } catch (error) {
    console.error('Unexpected error in setupProductStorage:', error);
  }
};

// Function to call when the application initializes
export const initStorage = async () => {
  console.log("Initializing storage");
  await setupProductStorage();
};
