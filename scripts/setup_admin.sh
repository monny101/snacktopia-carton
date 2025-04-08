
#!/bin/bash

# This script runs the create_admin.sql file using the Supabase CLI
# Make sure you have the Supabase CLI installed and are logged in

echo "Running create_admin.sql to set up admin user and fix permissions..."
supabase db execute --file ./scripts/create_admin.sql

echo "Done! You can now log in with:"
echo "Email: admin@admin.com"
echo "Password: admin"
