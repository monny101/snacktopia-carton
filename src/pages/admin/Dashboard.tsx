
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShoppingBag, Users, MessageSquare, Package } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  unreadMessages: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total products
        const { count: totalProducts, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Get total orders
        const { count: totalOrders, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // Get total customers (profiles with role 'customer')
        const { count: totalCustomers, error: customersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');

        // Get unread messages
        const { count: unreadMessages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        if (productsError || ordersError || customersError || messagesError) {
          console.error('Error fetching stats:', { productsError, ordersError, customersError, messagesError });
          return;
        }

        setStats({
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          totalCustomers: totalCustomers || 0,
          unreadMessages: unreadMessages || 0
        });
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Package className="h-6 w-6 mr-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <ShoppingBag className="h-6 w-6 mr-2 text-green-500" />
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Users className="h-6 w-6 mr-2 text-indigo-500" />
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-500">{stats?.unreadMessages || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Mondo Carton King</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-medium mb-4 text-blue-600">Contact Information</h3>
          <div className="flex flex-col space-y-3">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <p>No 50 Okedigo Street Odotu, near Eki FM, Ondo City, Ondo State</p>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-500 mr-3" />
              <p>mondocartonking@gmail.com</p>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-500 mr-3" />
              <p>+234 803 580 2867</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="font-medium mb-2 text-gray-700">Store Hours</h4>
            <ul className="space-y-1">
              <li className="text-sm text-gray-600 flex justify-between">
                <span>Monday - Friday</span>
                <span>8:00 AM - 6:00 PM</span>
              </li>
              <li className="text-sm text-gray-600 flex justify-between">
                <span>Saturday</span>
                <span>9:00 AM - 5:00 PM</span>
              </li>
              <li className="text-sm text-gray-600 flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
