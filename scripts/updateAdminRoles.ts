
import { supabase } from '../src/integrations/supabase/client';

/**
 * This script updates specific users to have admin role
 * Run with: ts-node scripts/updateAdminRoles.ts
 */
const updateAdminRoles = async () => {
  try {
    console.log("Updating admin roles...");
    
    // Find the admin@mondocartonking.com user
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }
    
    console.log(`Found ${users.users.length} users`);
    
    // Find admin and staff users
    const adminUser = users.users.find(u => u.email === 'admin@mondocartonking.com');
    const staffUser = users.users.find(u => u.email === 'staff@mondocartonking.com');
    
    if (adminUser) {
      console.log(`Updating user ${adminUser.email} to admin role...`);
      
      // Update user metadata to include admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { user_metadata: { ...adminUser.user_metadata, role: 'admin' } }
      );
      
      if (updateError) {
        console.error(`Error updating user ${adminUser.email}:`, updateError);
      }
      
      // Update the profile for admin
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: adminUser.id,
          full_name: adminUser.user_metadata?.full_name || 'Admin User',
          role: 'admin'
        });
      
      if (profileError) {
        console.error(`Error updating profile for user ${adminUser.email}:`, profileError);
      } else {
        console.log(`Updated profile for user ${adminUser.email} to admin role`);
      }
      
      // Run the profile update function to ensure it's properly set in both places
      const { error: updateRoleError } = await supabase.rpc('update_user_role' as any, { 
        user_id: adminUser.id, 
        new_role: 'admin' 
      });
      
      if (updateRoleError) {
        console.error(`Error running update_user_role for ${adminUser.email}:`, updateRoleError);
      } else {
        console.log(`Successfully ran update_user_role for ${adminUser.email}`);
      }
    } else {
      console.log("Admin user not found");
    }
    
    if (staffUser) {
      console.log(`Updating user ${staffUser.email} to staff role...`);
      
      // Update user metadata to include staff role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        staffUser.id,
        { user_metadata: { ...staffUser.user_metadata, role: 'staff' } }
      );
      
      if (updateError) {
        console.error(`Error updating user ${staffUser.email}:`, updateError);
      }
      
      // Update the profile for staff
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: staffUser.id,
          full_name: staffUser.user_metadata?.full_name || 'Staff User',
          role: 'staff'
        });
      
      if (profileError) {
        console.error(`Error updating profile for user ${staffUser.email}:`, profileError);
      } else {
        console.log(`Updated profile for user ${staffUser.email} to staff role`);
      }
      
      // Run the profile update function to ensure it's properly set
      const { error: updateRoleError } = await supabase.rpc('update_user_role' as any, { 
        user_id: staffUser.id, 
        new_role: 'staff' 
      });
      
      if (updateRoleError) {
        console.error(`Error running update_user_role for ${staffUser.email}:`, updateRoleError);
      } else {
        console.log(`Successfully ran update_user_role for ${staffUser.email}`);
      }
    } else {
      console.log("Staff user not found");
    }
    
    // Create or update the test account to have admin role
    const testUser = users.users.find(u => u.email === 'test@mondocartonking.com');
    if (testUser) {
      console.log(`Updating test user ${testUser.email} to admin role...`);
      
      // Update user metadata to include admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        testUser.id,
        { user_metadata: { ...testUser.user_metadata, role: 'admin' } }
      );
      
      if (updateError) {
        console.error(`Error updating test user ${testUser.email}:`, updateError);
      }
      
      // Update the profile for test user
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: testUser.id,
          full_name: testUser.user_metadata?.full_name || 'Test Admin',
          role: 'admin'
        });
      
      if (profileError) {
        console.error(`Error updating profile for test user ${testUser.email}:`, profileError);
      } else {
        console.log(`Updated profile for test user ${testUser.email} to admin role`);
      }
    } else {
      console.log("Test user not found, creating one...");
      
      // Create a test admin user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'test@mondocartonking.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Test Admin',
          role: 'admin'
        }
      });
      
      if (createError) {
        console.error("Error creating test admin user:", createError);
      } else if (newUser?.user) {
        console.log("Created test admin user successfully");
        
        // Create the profile for the test admin user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: newUser.user.id,
            full_name: 'Test Admin',
            role: 'admin'
          });
        
        if (profileError) {
          console.error("Error creating test admin profile:", profileError);
        } else {
          console.log("Created test admin profile successfully");
        }
      }
    }
    
    console.log("Finished updating admin and staff roles");
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
