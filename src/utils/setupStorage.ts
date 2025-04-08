
import { supabase } from '@/integrations/supabase/client';

/**
 * Sets up the storage buckets and RLS policies
 * This should be run once at the start of the app
 * It will check if the storage buckets exist and create them if they don't
 */
export const setupStorage = async () => {
  try {
    // Check if the products bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }
    
    const productsBucketExists = buckets.some(bucket => bucket.name === 'products');
    
    if (!productsBucketExists) {
      console.log("Creating products bucket...");
      const { error: createError } = await supabase
        .storage
        .createBucket('products', { public: true });
        
      if (createError) {
        console.error("Error creating products bucket:", createError);
        return false;
      }
      
      console.log("Products bucket created successfully");
    } else {
      console.log("Products bucket already exists");
    }

    return true;
  } catch (error) {
    console.error("Error in setupStorage:", error);
    return false;
  }
};
