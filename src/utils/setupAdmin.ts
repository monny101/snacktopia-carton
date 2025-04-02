
import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    console.log("Starting admin/staff user setup...");

    // Check if the profiles table exists, if not, create it
    const { error: tableCheckError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    if (tableCheckError && tableCheckError.code === 'PGRST116') {
      console.log('Profiles table may not exist. Please make sure it is created with the correct columns.');
    }

    // Try to create admin user
    const adminEmail = 'admin@mondocartonking.com';
    const adminPassword = 'password123';
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
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
        console.log('Admin user already exists');
      } else {
        console.error('Failed to create admin user:', adminError);
        // Continue to try creating staff user even if admin creation fails
      }
    } else {
      console.log('Admin user created successfully');
    }
    
    // Try to create staff user
    const staffEmail = 'staff@mondocartonking.com';
    const staffPassword = 'password123';
    const { data: staffData, error: staffError } = await supabase.auth.signUp({
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
        console.log('Staff user already exists');
      } else {
        console.error('Failed to create staff user:', staffError);
        // Continue processing
      }
    } else {
      console.log('Staff user created successfully');
    }
    
    // At least one user was created successfully or already exists
    if (
      (!adminError || adminError.message.includes('already registered')) ||
      (!staffError || staffError.message.includes('already registered'))
    ) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error setting up admin/staff users:', error);
    return false;
  }
};
