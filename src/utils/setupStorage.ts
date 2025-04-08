
import { supabase } from '@/integrations/supabase/client';

/**
 * Sets up the storage buckets and RLS policies
 * This should be run once at the start of the app
 * It will check if the storage buckets exist and create them if they don't
 */
export const setupStorage = async () => {
  try {
    console.log("Initializing storage setup");
    
    // First check if we have an authenticated session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.log("No authenticated session, skipping storage setup - will try again later");
      // Not a critical error as the user might not be logged in yet
      return false;
    }
    
    console.log("Checking storage buckets with authenticated session:", sessionData.session.user.id);
    
    try {
      // Check if the products bucket exists
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        
        if (bucketsError.message?.includes('permission')) {
          console.error("Permission error. This might be due to missing policies. Will try to continue anyway.");
        }
      }
      
      const productsBucketExists = buckets?.some(bucket => bucket.name === 'products') || false;
      
      if (!productsBucketExists) {
        console.log("Creating products bucket...");
        try {
          const { error: createError } = await supabase
            .storage
            .createBucket('products', { 
              public: true,
              fileSizeLimit: 10485760 // 10MB
            });
            
          if (createError) {
            console.error("Error creating products bucket:", createError);
            // Continue execution even if bucket creation fails
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
      console.error("Error accessing storage:", error);
      return false;
    }
  } catch (error) {
    console.error("Error in setupStorage:", error);
    // Return false to indicate setup failed
    return false;
  }
};
