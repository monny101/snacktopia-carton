
import fs from 'fs';
import path from 'path';

const addNpmScript = () => {
  try {
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add the create-admin script if it doesn't exist
    if (!packageJson.scripts['create-admin']) {
      packageJson.scripts['create-admin'] = 'ts-node scripts/createAdminUser.ts';
      
      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Successfully added create-admin script to package.json');
    } else {
      console.log('create-admin script already exists in package.json');
    }
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
};

addNpmScript();
