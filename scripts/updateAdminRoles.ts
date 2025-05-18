
import { supabase } from "@/integrations/supabase/client";

/**
 * This script promotes specific users to admin role
 * Usage:
 * - To promote one user: ts-node scripts/updateAdminRoles.ts user@example.com
 * - To promote first admin only: ts-node scripts/updateAdminRoles.ts --setup-first-admin
 */
export const updateAdminRoles = async (targetEmail?: string, setupFirstAdmin: boolean = false) => {
  try {
    console.log("Starting admin role management...");
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }
    
    console.log(`Found ${users.users.length} users`);
    
    // Check if we already have an admin
    if (setupFirstAdmin) {
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
        
      if (!adminsError && admins && admins.length > 0) {
        console.log("Admin user already exists, skipping first admin setup");
        return;
      }
    }
    
    // Filter users based on parameters
    let usersToUpdate = users.users;
    
    if (targetEmail) {
      console.log(`Targeting specific user: ${targetEmail}`);
      usersToUpdate = users.users.filter(user => user.email === targetEmail);
      
      if (usersToUpdate.length === 0) {
        console.error(`No user found with email: ${targetEmail}`);
        return;
      }
    } else if (setupFirstAdmin) {
      // If setting up first admin and no specific user is requested, 
      // just pick the first user (usually during initial setup)
      console.log("Selecting first user as admin for initial setup");
      usersToUpdate = usersToUpdate.slice(0, 1);
    } else {
      console.error("No target specified. Use --setup-first-admin or provide an email");
      return;
    }
    
    // Update specified users to have admin role
    for (const user of usersToUpdate) {
      console.log(`Promoting user ${user.email} to admin role...`);
      
      // Update user metadata to include admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, role: 'admin' } }
      );
      
      if (updateError) {
        console.error(`Error updating user ${user.email}:`, updateError);
        continue;
      }
      
      // Also update the profile if it exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.log(`Creating new admin profile for user ${user.email}`);
        
        // Create new profile with admin role
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
            phone: user.user_metadata?.phone || null,
            role: 'admin'
          });
        
        if (insertError) {
          console.error(`Error creating profile for user ${user.email}:`, insertError);
        } else {
          console.log(`Created admin profile for user ${user.email}`);
        }
      } else {
        console.log(`Updating existing profile for user ${user.email}`);
        
        // Update existing profile to admin role
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id);
        
        if (updateProfileError) {
          console.error(`Error updating profile for user ${user.email}:`, updateProfileError);
        } else {
          console.log(`Updated profile for user ${user.email} to admin role`);
        }
      }
    }
    
    console.log("Finished updating admin roles");
  } catch (err) {
    console.error("Error in updateAdminRoles:", err);
  } finally {
    process.exit(0);
  }
};

// Run the script if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetEmail = args.find(arg => !arg.startsWith('--'));
  const setupFirstAdmin = args.includes('--setup-first-admin');
  
  updateAdminRoles(targetEmail, setupFirstAdmin).catch(console.error);
}
