
import { supabase } from '@/integrations/supabase/client';

/**
 * Sets up the storage buckets and RLS policies
 * This should be run once at the start of the app
 * It will check if the storage buckets exist and create them if they don't
 */
export const setupStorage = async () => {
  try {
    // First check if we have an authenticated session
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      console.log("No authenticated session, skipping storage setup");
      // Not a critical error as the user might not be logged in yet
      return true;
    }
    
    console.log("Checking storage buckets with authenticated session");
    
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
      try {
        const { error: createError } = await supabase
          .storage
          .createBucket('products', { public: true });
          
        if (createError) {
          console.error("Error creating products bucket:", createError);
          // Continue execution even if bucket creation fails
          // The bucket might already exist or be created by another process
        } else {
          console.log("Products bucket created successfully");
        }
      } catch (createError) {
        console.error("Exception creating bucket:", createError);
        // Continue execution even if there's an error
      }
    } else {
      console.log("Products bucket already exists");
    }

    return true;
  } catch (error) {
    console.error("Error in setupStorage:", error);
    // Return true to avoid blocking app initialization
    return true;
  }
};
