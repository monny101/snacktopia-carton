
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures the current user has admin privileges by checking and updating their profile
 * @param userId The ID of the user to check
 * @returns Promise<boolean> True if the user is now an admin
 */
export const ensureUserIsAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // First check if user profile exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking user profile:", error);
      return false;
    }
    
    if (!data) {
      // Create admin profile if none exists
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'admin',
          full_name: 'Admin User'
        });
        
      if (insertError) {
        console.error("Error creating admin profile:", insertError);
        return false;
      }
      
      console.log("Created new admin profile for user:", userId);
      return true;
    } else if (data.role !== 'admin') {
      // Update to admin if needed
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Error updating user to admin:", updateError);
        return false;
      }
      
      console.log("Updated user to admin role:", userId);
      return true;
    }
    
    return data.role === 'admin';
  } catch (err) {
    console.error("Exception in ensureUserIsAdmin:", err);
    return false;
  }
};

/**
 * Updates the user metadata to include the admin role
 * @param userId The ID of the user to update
 * @returns Promise<boolean> True if the update was successful
 */
export const updateUserMetadataRole = async (userId: string): Promise<boolean> => {
  try {
    // Get current user to access their metadata
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Update the user metadata with admin role
    const { error } = await supabase.auth.updateUser({
      data: { 
        ...user.user_metadata,
        role: 'admin' 
      }
    });
    
    if (error) {
      console.error("Error updating user metadata:", error);
      return false;
    }
    
    console.log("Updated user metadata with admin role");
    return true;
  } catch (err) {
    console.error("Exception in updateUserMetadataRole:", err);
    return false;
  }
};
