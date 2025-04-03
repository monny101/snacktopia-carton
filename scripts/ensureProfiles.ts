
import { supabase } from "@/integrations/supabase/client";

/**
 * This script ensures that all users have profiles
 * and that the handle_new_user function is set up correctly
 */
export const ensureProfiles = async () => {
  // Update the handle_new_user function to ensure new users get the admin role
  const { error: functionError } = await supabase.rpc('update_handle_new_user_function');
  
  if (functionError) {
    console.error("Error updating handle_new_user function:", functionError);
    // Create the function if it doesn't exist
    const { error: createFunctionError } = await supabase.rpc('create_handle_new_user_function');
    if (createFunctionError) {
      console.error("Error creating handle_new_user function:", createFunctionError);
    } else {
      console.log("Created handle_new_user function successfully");
    }
  } else {
    console.log("Updated handle_new_user function successfully");
  }
  
  // Get all users who don't have profiles
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error("Error fetching users:", usersError);
    return;
  }
  
  console.log(`Found ${users.users.length} users`);
  
  // For each user, check if they have a profile
  for (const user of users.users) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.log(`Creating profile for user ${user.id}`);
      
      // Create profile with admin role
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
          phone: user.user_metadata?.phone || null,
          role: 'admin' // Set to admin role
        });
      
      if (insertError) {
        console.error(`Error creating profile for user ${user.id}:`, insertError);
      } else {
        console.log(`Created profile for user ${user.id} with admin role`);
      }
    } else {
      console.log(`User ${user.id} already has a profile`);
      
      // Ensure the user has admin role
      if (profile.role !== 'admin') {
        console.log(`Updating user ${user.id} to admin role`);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`Error updating profile for user ${user.id}:`, updateError);
        } else {
          console.log(`Updated profile for user ${user.id} to admin role`);
        }
      }
    }
  }
  
  console.log("Finished ensuring profiles");
};

// Run the script if this file is executed directly
if (require.main === module) {
  ensureProfiles().catch(console.error);
}
