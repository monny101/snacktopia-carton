
import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    console.log("Starting admin/staff user setup...");
    
    // First, try to create admin user
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: 'admin@mondocartonking.com',
      password: 'password123',
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
        return false;
      }
    } else {
      console.log('Admin user created successfully:', adminData);
    }
    
    // Then, try to create staff user
    const { data: staffData, error: staffError } = await supabase.auth.signUp({
      email: 'staff@mondocartonking.com',
      password: 'password123',
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
        return false;
      }
    } else {
      console.log('Staff user created successfully:', staffData);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up admin/staff users:', error);
    return false;
  }
};
