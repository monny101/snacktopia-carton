
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures the current user has admin privileges by checking and updating their profile
 * @param userId The ID of the user to check
 * @returns Promise<boolean> True if the user is now an admin
 */
export const ensureUserIsAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error("Invalid user ID provided");
    return false;
  }
  
  try {
    console.log("Checking if user is admin:", userId);
    
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
      console.log("No profile found, creating admin profile");
      
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
      console.log("User exists but is not admin, updating role");
      
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
    
    console.log("User is already an admin");
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
    if (!userId) {
      console.error("Invalid user ID provided to updateUserMetadataRole");
      return false;
    }
    
    // Get current user to access their metadata
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Failed to retrieve current user");
      return false;
    }
    
    console.log("Updating metadata for user:", userId);
    
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

/**
 * Verifies a user has staff privileges and grants them if authorized
 * @param userId The ID of the user to verify
 * @param grantedByAdmin Optional admin user ID that is granting the permission
 * @returns Promise<boolean> True if the user has or was granted staff role
 */
export const verifyStaffPrivileges = async (
  userId: string, 
  grantedByAdmin?: string
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Check current role
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error verifying staff privileges:", error);
      return false;
    }
    
    // User already has appropriate privileges
    if (data && (data.role === 'staff' || data.role === 'admin')) {
      return true;
    }
    
    // If an admin is granting permission, update the role
    if (grantedByAdmin) {
      // Verify the granter is an admin
      const isAdmin = await ensureUserIsAdmin(grantedByAdmin);
      
      if (!isAdmin) {
        console.error("Permission denied: Granter is not an admin");
        return false;
      }
      
      // Update user to staff role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'staff' })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Error updating user to staff role:", updateError);
        return false;
      }
      
      // Also update metadata
      try {
        // Get user to update metadata
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        
        if (userData?.user) {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...userData.user.user_metadata,
              role: 'staff'
            }
          });
        }
      } catch (metaError) {
        // Non-critical error, just log it
        console.warn("Could not update user metadata:", metaError);
      }
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.error("Exception in verifyStaffPrivileges:", err);
    return false;
  }
};
