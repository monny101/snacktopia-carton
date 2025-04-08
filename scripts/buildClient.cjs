const { execSync } = require('child_process');

try {
  // Create dist-scripts directory if it doesn't exist
  execSync('mkdir -p dist-scripts/src/integrations/supabase');
  
  // Compile client.ts to CommonJS
  execSync('npx tsc src/integrations/supabase/client.ts --outDir dist-scripts --module commonjs --esModuleInterop true');
  
  console.log('Successfully compiled client.ts');
} catch (error) {
  console.error('Error compiling client.ts:', error);
  process.exit(1);
}