
import { supabase } from "@/integrations/supabase/client";

/**
 * This script creates the necessary storage buckets for the application.
 */
export const setupStorage = async () => {
  try {
    console.log("Setting up storage buckets...");

    // Check if products bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }
    
    const productsBucketExists = existingBuckets.some(bucket => bucket.name === 'products');
    
    if (!productsBucketExists) {
      // Create the products bucket
      const { data, error } = await supabase.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 10485760, // 10MB in bytes
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
      });
      
      if (error) {
        console.error("Error creating products bucket:", error);
        return false;
      }
      
      console.log("Products bucket created successfully:", data);
    } else {
      console.log("Products bucket already exists, skipping creation");
    }
    
    return true;
  } catch (err) {
    console.error("Error in setupStorage:", err);
    return false;
  }
};

// Run the script if this file is executed directly
if (require.main === module) {
  setupStorage().catch(console.error);
}
