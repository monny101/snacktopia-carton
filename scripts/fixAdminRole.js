
/**
 * This script is used to fix admin roles for users in Supabase
 * It ensures that all users have the admin role in both auth metadata and profiles table
 * 
 * Run with: node scripts/fixAdminRole.js
 */
const { createClient } = require('@supabase/supabase-js');

// Supabase client setup
const SUPABASE_URL = "https://uwcgfyxsdpmlaybjlrcr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Y2dmeXhzZHBtbGF5YmpscmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NzQyNjQsImV4cCI6MjA1OTA1MDI2NH0.4yuVXcvI3TqTt6aUzohrIMmAl7YwfJAHdFYUKGORt5k";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_KEY environment variable is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdminRoles() {
  try {
    console.log("Starting admin role fix process...");
    
    // Get all users
    console.log("Fetching all users...");
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }
    
    console.log(`Found ${users.users.length} users`);
    
    // Update users one by one
    for (const user of users.users) {
      console.log(`Processing user ${user.email || user.id}...`);
      
      // 1. Update user metadata to include admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { 
          user_metadata: { 
            ...user.user_metadata,
            role: 'admin'
          }
        }
      );
      
      if (updateError) {
        console.error(`Error updating user ${user.email || user.id} metadata:`, updateError);
        continue;
      }
      
      // 2. Check if profile exists and update it
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        // Profile doesn't exist, create it
        console.log(`Creating new admin profile for user ${user.email || user.id}`);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
            role: 'admin'
          });
        
        if (insertError) {
          console.error(`Error creating profile for user ${user.email || user.id}:`, insertError);
        } else {
          console.log(`Created admin profile for user ${user.email || user.id}`);
        }
      } else {
        // Profile exists, update it to admin role if not already
        if (profile.role !== 'admin') {
          console.log(`Updating existing profile for user ${user.email || user.id} to admin role`);
          
          const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);
          
          if (updateProfileError) {
            console.error(`Error updating profile for user ${user.email || user.id}:`, updateProfileError);
          } else {
            console.log(`Updated profile for user ${user.email || user.id} to admin role`);
          }
        } else {
          console.log(`User ${user.email || user.id} already has admin role in profile`);
        }
      }
    }
    
    console.log("Admin role fix process completed");
  } catch (err) {
    console.error("Error in fixAdminRoles:", err);
  }
}

fixAdminRoles().catch(console.error);
