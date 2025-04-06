
import { supabase } from '../src/integrations/supabase/client';

/**
 * This script updates all existing users to have admin role
 * Run with: ts-node scripts/updateAdminRoles.ts
 */
const updateAdminRoles = async () => {
  try {
    console.log("Fetching all users...");
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }
    
    console.log(`Found ${users.users.length} users`);
    
    // Update all users to have customer role in their user metadata
    // This is more appropriate for a production environment
    for (const user of users.users) {
      console.log(`Updating user ${user.email} to customer role...`);
      
      // Update user metadata to include customer role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, role: 'customer' } }
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
        console.log(`Creating new customer profile for user ${user.email}`);
        
        // Create new profile with customer role
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
            phone: user.user_metadata?.phone || null,
            role: 'customer' // Set to customer role
          });
        
        if (insertError) {
          console.error(`Error creating profile for user ${user.email}:`, insertError);
        } else {
          console.log(`Created customer profile for user ${user.email}`);
        }
      } else {
        console.log(`Updating existing profile for user ${user.email}`);
        
        // Update existing profile to customer role
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ role: 'customer' })
          .eq('id', user.id);
        
        if (updateProfileError) {
          console.error(`Error updating profile for user ${user.email}:`, updateProfileError);
        } else {
          console.log(`Updated profile for user ${user.email} to customer role`);
        }
      }
    }
    
    console.log("Finished updating all users to customer role");

    // Set up a specific admin user
    console.log("Setting up admin user...");
    const adminEmail = 'admin@mondocartonking.com';
    
    // Check if admin already exists
    const { data: existingAdmin, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);
      
    if (findError) {
      console.error("Error checking for admin:", findError);
    } else if (!existingAdmin || existingAdmin.length === 0) {
      console.log("No admin found, attempting to create one");
      
      // Try to find the user first
      const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (searchError) {
        console.error("Error searching for users:", searchError);
      } else {
        const adminUser = users.users.find(u => u.email === adminEmail);
        
        if (adminUser) {
          console.log("Found existing admin user, updating role");
          
          // Update user to admin role
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            adminUser.id,
            { user_metadata: { ...adminUser.user_metadata, role: 'admin' } }
          );
          
          if (updateError) {
            console.error("Error updating admin user:", updateError);
          } else {
            // Update profile to admin role
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', adminUser.id);
              
            if (profileUpdateError) {
              console.error("Error updating admin profile:", profileUpdateError);
            } else {
              console.log("Updated user to admin role successfully");
            }
          }
        } else {
          // Create admin user if not found
          console.log("Admin user not found, creating a new one");
          try {
            const { data, error } = await supabase.auth.signUp({
              email: adminEmail,
              password: 'password123',
              options: {
                data: {
                  full_name: 'Admin User',
                  role: 'admin'
                }
              }
            });
            
            if (error) {
              console.error("Error creating admin user:", error);
            } else if (data.user) {
              console.log("Admin user created, setting up profile");
              
              // Create admin profile
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  full_name: 'Admin User',
                  role: 'admin'
                });
                
              if (profileError) {
                console.error("Error creating admin profile:", profileError);
              } else {
                console.log("Admin profile created successfully");
              }
            }
          } catch (err) {
            console.error("Error in admin user creation:", err);
          }
        }
      }
    } else {
      console.log("Admin user already exists:", existingAdmin[0]);
    }
  } catch (err) {
    console.error("Error in updateAdminRoles:", err);
  } finally {
    process.exit(0);
  }
};

// Run the script if this file is executed directly
if (require.main === module) {
  updateAdminRoles().catch(console.error);
}

export { updateAdminRoles };
