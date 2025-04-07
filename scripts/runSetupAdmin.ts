
import { setupAdmin } from '../src/utils/setupAdmin';
import { ensureProfiles } from './ensureProfiles';
import { updateAdminRoles } from './updateAdminRoles';

// First run the setup admin which creates the handle_new_user function
// and then ensure all users have profiles with the correct role
const runSetup = async () => {
  console.log("Setting up admin user...");
  await setupAdmin();
  
  console.log("Ensuring all users have profiles...");
  await ensureProfiles();
  
  console.log("Updating admin roles...");
  await updateAdminRoles();
  
  console.log("Setup complete!");
};

runSetup().catch(console.error);
