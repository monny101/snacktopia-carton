import React from "react";
import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Loader2,
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Users,
  LogOut,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout: React.FC = () => {
  const { isAdmin, isAuthenticated, isLoading, logout, profile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated or not an admin
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} />;
  }

  if (!isAdmin) {
    console.log("User authenticated but not admin, profile:", profile);
    console.log("Current user role:", profile?.role);
    return <Navigate to="/" />;
  }

  // If we're still loading, don't redirect yet
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <Sidebar>
          <SidebarHeader className="border-b border-blue-100">
            <div className="p-2">
              <Link to="/admin" className="block">
                <h2 className="text-xl font-bold text-blue-600">Mondo Admin</h2>
                <p className="text-xs text-gray-500">Administration Panel</p>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Products">
                    <Link to="/admin/products">
                      <Package className="h-4 w-4" />
                      <span>Products</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Orders">
                    <Link to="/admin/orders">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Chat">
                    <Link to="/admin/chat">
                      <MessageSquare className="h-4 w-4" />
                      <span>Customer Chat</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Users">
                    <Link to="/admin/users">
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-blue-100 p-4 space-y-2">
            <Link to="/" className="block w-full">
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span>Back to Store</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
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

export default AdminLayout;
