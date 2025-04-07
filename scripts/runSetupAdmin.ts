
import { setupAdmin } from '../src/utils/setupAdmin';
import { ensureProfiles } from './ensureProfiles';
import { updateAdminRoles } from './updateAdminRoles';
import { setupStorage } from './setup-storage';

// First run the setup admin which creates the handle_new_user function
// and then ensure all users have profiles with the correct role
const runSetup = async () => {
  console.log("Setting up admin user...");
  await setupAdmin();
  
  console.log("Ensuring all users have profiles...");
  await ensureProfiles();
  
  console.log("Updating admin roles...");
  await updateAdminRoles();
  
  console.log("Setting up storage buckets...");
  await setupStorage();
  
  console.log("Setup complete!");
  
  console.log("\nIMPORTANT: You can now log in with these test accounts:");
  console.log("Admin: admin@mondocartonking.com / password123");
  console.log("Staff: staff@mondocartonking.com / password123");
  console.log("Test Admin: test@mondocartonking.com / password123");
  console.log("\nMake sure to disable email confirmation in Supabase for testing.");
};

runSetup().catch(console.error);
