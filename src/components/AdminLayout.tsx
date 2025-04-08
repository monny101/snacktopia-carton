
import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  ClipboardList, 
  Settings, 
  AlertOctagon,
  History
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isLoading, profile, user, profileFetchAttempted } = useAuth();
  
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  // Function to verify admin status directly with Supabase if needed
  const verifyAdminStatus = async () => {
    if (!user) return false;
    
    try {
      // Check if the user has admin role in the database
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Error verifying admin status:", error);
        return false;
      }
      
      return data?.role === 'admin';
    } catch (error) {
      console.error("Exception verifying admin status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Only redirect if we've attempted to fetch the profile and user isn't admin
    if (!isLoading && profileFetchAttempted && !isAdmin) {
      console.log("Access denied to admin area. Current role:", profile?.role);
      
      // If user is logged in but not admin, double-check directly with database
      if (user) {
        verifyAdminStatus().then(isReallyAdmin => {
          if (!isReallyAdmin) {
            toast({
              title: "Access Denied",
              description: `You need admin privileges to access this area. Current role: ${profile?.role || 'unknown'}`,
              variant: "destructive",
            });
            navigate('/');
          }
        });
      } else {
        toast({
          title: "Access Denied",
          description: `You need admin privileges to access this area.`,
          variant: "destructive",
        });
        navigate('/login', { state: { redirectTo: location.pathname } });
      }
    }
  }, [isAdmin, isLoading, navigate, profile, profileFetchAttempted, user]);

  // Show loading state while checking permissions
  if (isLoading || !profileFetchAttempted) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Checking admin credentials...</p>
      </div>
    );
  }

  // This will be caught by the useEffect, but we add an extra check for safety
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You don't have permission to access the admin area.</p>
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 min-h-screen">
      {/* Sidebar */}
      <div className="col-span-12 md:col-span-2 bg-gray-900 text-white">
        <div className="p-4 flex flex-col h-full">
          <h1 className="text-lg font-bold mb-8 border-b border-gray-800 pb-2">Admin Dashboard</h1>
          <ScrollArea className="flex-1">
            <nav className="space-y-1">
              <SidebarLink 
                to="/admin" 
                icon={<LayoutDashboard className="mr-2 h-4 w-4" />} 
                text="Dashboard" 
                isActive={isActive('/admin')}
              />
              <SidebarLink 
                to="/admin/products" 
                icon={<Package className="mr-2 h-4 w-4" />} 
                text="Products" 
                isActive={isActive('/admin/products')}
              />
              <SidebarLink 
                to="/admin/users" 
                icon={<Users className="mr-2 h-4 w-4" />} 
                text="Users" 
                isActive={isActive('/admin/users')}
              />
              <SidebarLink 
                to="/admin/orders" 
                icon={<ShoppingCart className="mr-2 h-4 w-4" />} 
                text="Orders" 
                isActive={isActive('/admin/orders')}
              />
              <SidebarLink 
                to="/admin/chat" 
                icon={<MessageSquare className="mr-2 h-4 w-4" />} 
                text="Customer Chat" 
                isActive={isActive('/admin/chat')}
              />
              <SidebarLink 
                to="/admin/inventory-alerts" 
                icon={<AlertOctagon className="mr-2 h-4 w-4" />} 
                text="Inventory Alerts" 
                isActive={isActive('/admin/inventory-alerts')}
              />
              <SidebarLink 
                to="/admin/audit-logs" 
                icon={<History className="mr-2 h-4 w-4" />} 
                text="Audit Logs" 
                isActive={isActive('/admin/audit-logs')}
              />
              <SidebarLink 
                to="/admin/settings" 
                icon={<Settings className="mr-2 h-4 w-4" />} 
                text="Settings" 
                isActive={isActive('/admin/settings')}
              />
            </nav>
          </ScrollArea>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="col-span-12 md:col-span-10 bg-gray-50">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, text, isActive }) => {
  return (
    <Link to={to} className="block">
      <div
        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
          isActive 
            ? 'bg-blue-700 text-white' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        {icon}
        <span>{text}</span>
      </div>
    </Link>
  );
};

export default AdminLayout;
