
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
        
        // Check if admin profile exists
        const { data: adminProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', adminAuthData?.user?.id || 'no-id')
          .single();
        
        if (profileError) {
          console.log('Admin profile may not exist yet, attempting to create it manually');
          
          // Try to get admin user ID
          const { data } = await supabase.auth.admin.listUsers();
          
          // Safely access the users array and handle potential undefined
          const users = data?.users || [];
          const adminUser = users.find(u => {
            // Safely check if email property exists before using it
            return u && typeof u === 'object' && 'email' in u && u.email === adminEmail;
          });
          
          if (adminUser?.id) {
            // Manually create admin profile if needed
            await supabase.from('profiles').upsert({
              id: adminUser.id,
              full_name: 'Admin User',
              role: 'admin'
            });
            console.log('Admin profile created manually');
          }
        } else {
          console.log('Admin profile exists:', adminProfile);
        }
      } else {
        console.error('Failed to create admin user:', adminError);
      }
    } else {
      console.log('Admin user created successfully');
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
        
        // Check if staff profile exists
        const { data: staffProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', staffAuthData?.user?.id || 'no-id')
          .single();
        
        if (profileError) {
          console.log('Staff profile may not exist yet, attempting to create it manually');
          
          // Try to get staff user ID
          const { data } = await supabase.auth.admin.listUsers();
          
          // Safely access the users array and handle potential undefined
          const users = data?.users || [];
          const staffUser = users.find(u => {
            // Safely check if email property exists before using it
            return u && typeof u === 'object' && 'email' in u && u.email === staffEmail;
          });
          
          if (staffUser?.id) {
            // Manually create staff profile if needed
            await supabase.from('profiles').upsert({
              id: staffUser.id,
              full_name: 'Staff User',
              role: 'staff'
            });
            console.log('Staff profile created manually');
          }
        } else {
          console.log('Staff profile exists:', staffProfile);
        }
      } else {
        console.error('Failed to create staff user:', staffError);
      }
    } else {
      console.log('Staff user created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up admin/staff users:', error);
    return false;
  }
};
