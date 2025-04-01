
import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    // First, check if admin user already exists to avoid duplicates
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .maybeSingle();
    
    if (!existingAdmin) {
      // Create admin user if it doesn't exist
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
        console.error('Failed to create admin user:', adminError);
      } else {
        console.log('Admin user created successfully:', adminData);
      }
    }
    
    // Check if staff user already exists
    const { data: existingStaff } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'staff')
      .maybeSingle();
    
    if (!existingStaff) {
      // Create staff user if it doesn't exist
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
        console.error('Failed to create staff user:', staffError);
      } else {
        console.log('Staff user created successfully:', staffData);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up admin users:', error);
    return false;
  }
};

// Run this function once to set up admin/staff users
// setupAdmin();
