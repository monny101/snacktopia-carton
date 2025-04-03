
import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    console.log("Starting admin/staff user setup...");

    // Check if the profiles table exists
    const { error: tableCheckError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    if (tableCheckError && tableCheckError.code === 'PGRST116') {
      console.log('Warning: Profiles table may not exist. This could cause issues with role assignments.');
    }

    // Try to create admin user
    const adminEmail = 'admin@mondocartonking.com';
    const adminPassword = 'password123';
    const { data: adminAuthData, error: adminError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'Admin User',
          role: 'admin'
        }
      }
    });
    
    if (adminError) {
      if (adminError.message.includes('already registered')) {
        console.log('Admin user already exists in auth system');
        
        // Check if admin profile exists with correct admin role
        // Using signInWithPassword instead of getUserByEmail which doesn't exist
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });
        
        if (!signInError && signInData?.user) {
          // Ensure profile exists with admin role
          await supabase
            .from('profiles')
            .upsert({
              id: signInData.user.id,
              full_name: 'Admin User',
              role: 'admin'
            }, { onConflict: 'id' });
          
          console.log('Admin profile verified/created with correct role');
          
          // Sign out after checking/updating
          await supabase.auth.signOut();
        }
      } else {
        console.error('Failed to create admin user:', adminError);
      }
    } else {
      console.log('Admin user created successfully');
      
      // Make sure the profile is created with admin role
      if (adminAuthData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: adminAuthData.user.id,
            full_name: 'Admin User',
            role: 'admin'
          });
          
        if (profileError) {
          console.error('Failed to create admin profile:', profileError);
        } else {
          console.log('Admin profile created successfully with admin role');
        }
      }
    }
    
    // Try to create staff user
    const staffEmail = 'staff@mondocartonking.com';
    const staffPassword = 'password123';
    const { data: staffAuthData, error: staffError } = await supabase.auth.signUp({
      email: staffEmail,
      password: staffPassword,
      options: {
        data: {
          full_name: 'Staff User',
          role: 'staff'
        }
      }
    });
    
    if (staffError) {
      if (staffError.message.includes('already registered')) {
        console.log('Staff user already exists in auth system');
        
        // Check if staff profile exists with correct staff role
        // Using signInWithPassword instead of getUserByEmail
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: staffEmail,
          password: staffPassword
        });
        
        if (!signInError && signInData?.user) {
          // Ensure profile exists with staff role
          await supabase
            .from('profiles')
            .upsert({
              id: signInData.user.id,
              full_name: 'Staff User',
              role: 'staff'
            }, { onConflict: 'id' });
          
          console.log('Staff profile verified/created with correct role');
          
          // Sign out after checking/updating
          await supabase.auth.signOut();
        }
      } else {
        console.error('Failed to create staff user:', staffError);
      }
    } else {
      console.log('Staff user created successfully');
      
      // Make sure the profile is created with staff role
      if (staffAuthData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: staffAuthData.user.id,
            full_name: 'Staff User',
            role: 'staff'
          });
          
        if (profileError) {
          console.error('Failed to create staff profile:', profileError);
        } else {
          console.log('Staff profile created successfully with staff role');
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up admin/staff users:', error);
    return false;
  }
};
