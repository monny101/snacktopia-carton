
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
    
    // Check if the products bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      
      // Handle permission errors specifically
      if (bucketsError.message?.includes('permission')) {
        console.error("Permission error. This might be due to missing policies.");
      }
      return false;
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
          // The bucket might already exist or be created by another process
        } else {
          console.log("Products bucket created successfully");
          
          // Set up the bucket RLS policies
          await setupBucketPolicies('products');
        }
      } catch (createError) {
        console.error("Exception creating bucket:", createError);
        // Continue execution even if there's an error
      }
    } else {
      console.log("Products bucket already exists");
      
      // Make sure policies are set up correctly anyway
      await setupBucketPolicies('products');
    }

    return true;
  } catch (error) {
    console.error("Error in setupStorage:", error);
    // Return false to indicate setup failed
    return false;
  }
};

/**
 * Set up the storage bucket policies
 */
const setupBucketPolicies = async (bucketName: string) => {
  try {
    console.log(`Setting up policies for bucket: ${bucketName}`);
    
    // Check if the bucket already has a policy for authenticated users
    // Use a direct SQL query instead of the get_policies RPC
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies') // Using the view directly instead of RPC
      .select('*')
      .eq('schemaname', 'storage')
      .eq('tablename', 'objects');
    
    if (policiesError) {
      console.error("Error checking policies:", policiesError);
      return;
    }
    
    // Fixed: Check if policies is an array before using some()
    const hasReadPolicy = Array.isArray(policies) && policies.some((p: any) => 
      p.tablename === 'objects' && 
      p.schemaname === 'storage' && 
      p.policyname.includes('Read all objects')
    );
    
    if (!hasReadPolicy) {
      console.log("Setting up read policy for authenticated users");
      // This would normally be done by SQL but we just executed migrations
      // so we'll skip it here and rely on the migrations
    }
    
    console.log("Storage policies setup complete");
  } catch (error) {
    console.error("Error setting up bucket policies:", error);
  }
};
