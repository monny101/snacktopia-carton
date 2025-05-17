
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  SidebarInset
} from '@/components/ui/sidebar';
import { Loader2, ShoppingCart, MessageSquare, LogOut, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { verifyStaffPrivileges } from '@/utils/adminHelpers';

const StaffLayout: React.FC = () => {
  const { isStaff, isAdmin, isAuthenticated, isLoading, logout, profile, user, profileFetchAttempted } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Verify staff status against database directly
  useEffect(() => {
    // Only check access if we've finished initial loading and profile fetch
    if (!isLoading && profileFetchAttempted && isAuthenticated && !isStaff && !isAdmin && user) {
      console.log("Verifying staff access for user:", user.id);
      
      verifyStaffPrivileges(user.id).then(hasAccess => {
        if (hasAccess) {
          console.log("Staff verification successful, allowing access");
          // Force profile refresh to update state
          window.location.reload();
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have staff permission to access this area.",
            variant: "destructive",
            duration: 3000,
          });
          navigate('/');
        }
      });
    }
  }, [isLoading, isAuthenticated, isStaff, isAdmin, profile, profileFetchAttempted, navigate, user]);

  if (isLoading || !profileFetchAttempted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Loading staff panel...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} />;
  }

  // Redirect if not staff or admin
  if (!isStaff && !isAdmin) {
    return <Navigate to="/" />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <Sidebar>
          <SidebarHeader className="border-b border-blue-100">
            <div className="p-2">
              <h2 className="text-xl font-bold text-blue-600">
                Mondo Staff
              </h2>
              <p className="text-xs text-gray-500">
                Staff Panel
              </p>
              {profile?.full_name && (
                <p className="text-xs text-blue-700 font-medium mt-1">
                  Logged in as: {profile.full_name}
                </p>
              )}
              <p className="text-xs text-blue-700 font-medium">
                Role: {profile?.role || 'Unknown'}
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Orders">
                    <Link to="/staff/orders">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Chat">
                    <Link to="/staff/chat">
                      <MessageSquare className="h-4 w-4" />
                      <span>Customer Chat</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* Show user management only for admins */}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="User Management">
                      <Link to="/admin/users">
                        <UserCog className="h-4 w-4" />
                        <span>User Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-blue-100 p-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
            <div className="text-xs text-center mt-2 text-gray-500">
              <Link to="/" className="hover:text-blue-600">
                Return to Store
              </Link>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-gray-50">
          <div className="p-4 flex">
            <SidebarTrigger className="mr-2" />
            <div className="flex-1 ml-2">
              <div className="bg-white rounded-lg shadow-sm p-4 min-h-[calc(100vh-2rem)]">
                <Outlet />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StaffLayout;
