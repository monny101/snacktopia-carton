import { setupAdmin } from '../src/utils/setupAdmin';

const run = async () => {
  console.log('Attempting to run admin setup...');
  const success = await setupAdmin();
  if (success) {
    console.log('Admin setup completed successfully (or users already exist).');
    process.exit(0); // Exit with success code
  } else {
    console.error('Admin setup failed. Check logs and environment variables.');
    process.exit(1); // Exit with error code
  }
};

run();