/**
 * @typedef {import('@supabase/supabase-js').User} User
 * @typedef {import('../src/integrations/supabase/types').UserProfile} UserProfile
 */
const { supabase } = require('../dist-scripts/src/integrations/supabase/client.js');
async function updateAdminRoles() {
    try {
        console.log("Fetching all users...");
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) {
            console.error("Error fetching users:", usersError);
            return;
        }
        console.log(`Found ${users.users.length} users`);
        // Update all users to have admin role in their user metadata
        for (const user of users.users) {
            console.log(`Updating user ${user.email} to admin role...`);
            // Update user metadata to include admin role
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, role: 'admin' } });
            if (updateError) {
                console.error(`Error updating user ${user.email}:`, updateError);
                continue;
            }
            // Also update the profile if it exists
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (profileError) {
                console.log(`Creating new admin profile for user ${user.email}`);
                // Create new profile with admin role
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
                    phone: user.user_metadata?.phone || null,
                    role: 'admin'
                });
                if (insertError) {
                    console.error(`Error creating profile for user ${user.email}:`, insertError);
                }
                else {
                    console.log(`Created admin profile for user ${user.email}`);
                }
            }
            else {
                console.log(`Updating existing profile for user ${user.email}`);
                // Update existing profile to admin role
                const { error: updateProfileError } = await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', user.id);
                if (updateProfileError) {
                    console.error(`Error updating profile for user ${user.email}:`, updateProfileError);
                }
                else {
                    console.log(`Updated profile for user ${user.email} to admin role`);
                }
            }
        }
        console.log("Finished updating all users to admin role");
    }
    catch (err) {
        console.error("Error in updateAdminRoles:", err);
    }
}
updateAdminRoles().catch(console.error);
