import { setupAdmin } from "../src/utils/setupAdmin";

async function main() {
  console.log("Starting admin setup script...");

  try {
    const success = await setupAdmin();

    if (success) {
      console.log("✅ Admin and staff users created successfully!");
      console.log("Admin: admin@mondocartonking.com / password123");
      console.log("Staff: staff@mondocartonking.com / password123");
    } else {
      console.log("❌ Failed to create admin and staff users.");
    }
  } catch (error) {
    console.error("Error running setup script:", error);
  }

  // Exit the process after completion
  process.exit(0);
}

main();
