
import { setupAdmin } from '../src/utils/setupAdmin';
import { ensureProfiles } from './ensureProfiles';
import { updateAdminRoles } from './updateAdminRoles';

// First run the setup admin which creates the handle_new_user function
// and then ensure all users have profiles with the correct role
const runSetup = async () => {
  console.log("Setting up admin user...");
  const adminSetupSuccess = await setupAdmin();
  
  console.log("Ensuring all users have profiles...");
  await ensureProfiles();
  
  // Only set up a first admin if needed and initial setup was successful
  if (adminSetupSuccess) {
    console.log("Setting up first admin user if none exists...");
    await updateAdminRoles(undefined, true); // Setup first admin only
  } else {
    console.log("Skipping admin role setup as it may have already been done");
  }
  
  console.log("Setup complete!");
};

runSetup().catch(console.error);
