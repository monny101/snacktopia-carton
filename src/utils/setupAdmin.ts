import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    console.log("Starting admin/staff user setup...");

    // First, try to create admin user
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: "admin@mondocartonking.com",
      password: "password123",
      options: {
        data: {
          full_name: "Admin User",
          role: "admin",
        },
      },
    });

    if (adminError) {
      if (adminError.message.includes("already registered")) {
        console.log("Admin user already exists");
      } else {
        console.error("Failed to create admin user:", adminError);
        return false;
      }
    } else {
      console.log("Admin user created successfully:", adminData);

      // Create profile in profiles table for admin
      if (adminData?.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: adminData.user.id,
            full_name: "Admin User",
            role: "admin",
          },
        ]);

        if (profileError) {
          console.error("Error creating admin profile:", profileError);
        } else {
          console.log("Admin profile created successfully");
        }
      }
    }

    // Then, try to create staff user
    const { data: staffData, error: staffError } = await supabase.auth.signUp({
      email: "staff@mondocartonking.com",
      password: "password123",
      options: {
        data: {
          full_name: "Staff User",
          role: "staff",
        },
      },
    });

    if (staffError) {
      if (staffError.message.includes("already registered")) {
        console.log("Staff user already exists");
      } else {
        console.error("Failed to create staff user:", staffError);
        return false;
      }
    } else {
      console.log("Staff user created successfully:", staffData);

      // Create profile in profiles table for staff
      if (staffData?.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: staffData.user.id,
            full_name: "Staff User",
            role: "staff",
          },
        ]);

        if (profileError) {
          console.error("Error creating staff profile:", profileError);
        } else {
          console.log("Staff profile created successfully");
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error setting up admin/staff users:", error);
    return false;
  }
};
