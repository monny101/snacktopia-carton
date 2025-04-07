
import { supabase } from "@/integrations/supabase/client";

/**
 * This script ensures that all users have profiles
 * and that the handle_new_user function is set up correctly
 */
export const ensureProfiles = async () => {
  // Update the handle_new_user function to ensure new users get the correct role
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
      console.log(`Creating profile for user ${user.email || user.id}`);
      
      // Get role from user metadata or default to customer
      const role = user.user_metadata?.role || 'customer';
      
      // Create profile with role
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
          phone: user.user_metadata?.phone || null,
          role: role
        });
      
      if (insertError) {
        console.error(`Error creating profile for user ${user.email || user.id}:`, insertError);
      } else {
        console.log(`Created profile for user ${user.email || user.id} with role: ${role}`);
      }
    } else {
      console.log(`User ${user.email || user.id} already has a profile with role: ${profile.role}`);
    }
  }
  
  console.log("Finished ensuring profiles");
};

// Run the script if this file is executed directly
if (require.main === module) {
  ensureProfiles().catch(console.error);
}
