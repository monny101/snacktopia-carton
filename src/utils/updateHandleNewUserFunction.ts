
import { supabase } from "@/integrations/supabase/client";
import fs from "fs";
import path from "path";

/**
 * Updates the handle_new_user function in Supabase
 */
export const updateHandleNewUserFunction = async () => {
  try {
    // Load SQL from file
    const sqlPath = path.join(__dirname, "handle_new_user_function.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    // Execute SQL
    // Use raw query to execute SQL since exec_sql may not be available
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error("Error updating handle_new_user function:", error);
      return false;
    }
    
    console.log("Successfully updated handle_new_user function");
    return true;
  } catch (error) {
    console.error("Error in updateHandleNewUserFunction:", error);
    return false;
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  updateHandleNewUserFunction()
    .then(success => {
      console.log("Function update completed:", success);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("Function update failed:", error);
      process.exit(1);
    });
}
