
import { supabase } from '../src/integrations/supabase/client';

const ensureProfilesTable = async () => {
  try {
    console.log('Checking profiles table...');
    
    // Check if profiles table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    if (tableCheckError) {
      console.error('Error checking profiles table:', tableCheckError);
      console.log('Attempting to create profiles table and trigger...');
      
      // Create profiles table
      const { error: createTableError } = await supabase.rpc('create_profiles_table');
      
      if (createTableError) {
        console.error('Error creating profiles table:', createTableError);
        return false;
      }
      
      console.log('Profiles table created successfully');
      return true;
    }
    
    console.log('Profiles table already exists');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
};

// Run the function
ensureProfilesTable()
  .then(success => {
    console.log('Script completed with status:', success ? 'SUCCESS' : 'FAILURE');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Script failed with error:', err);
    process.exit(1);
  });
