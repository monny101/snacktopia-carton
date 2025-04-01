import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog, ShoppingBag, Package, Users, MapPin, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const { profile } = useAuth();

  useEffect(() => {
    // Fetch total products
    supabase
      .from('products')
      .select('*', { count: 'exact' })
      .then(response => {
        if (response.error) {
          console.error('Error fetching products:', response.error);
        } else {
          setTotalProducts(response.count || 0);
        }
      });

    // Fetch total orders
    supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .then(response => {
        if (response.error) {
          console.error('Error fetching orders:', response.error);
        } else {
          setTotalOrders(response.count || 0);
        }
      });

    // Fetch total users
    supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .then(response => {
        if (response.error) {
          console.error('Error fetching users:', response.error);
        } else {
          setTotalUsers(response.count || 0);
        }
      });

    // Fetch recent orders (last 5)
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(response => {
        if (response.error) {
          console.error('Error fetching recent orders:', response.error);
        } else {
          setRecentOrders(response.data);
        }
      });

    // Fetch sales data (example: last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    supabase
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', lastWeek.toISOString())
      .lte('created_at', today.toISOString())
      .then(response => {
        if (response.error) {
          console.error('Error fetching sales data:', response.error);
        } else {
          // Aggregate sales data by date
          const aggregatedData = response.data.reduce((acc: any, order: any) => {
            const orderDate = order.created_at.split('T')[0]; // Extract date part
            if (acc[orderDate]) {
              acc[orderDate] += order.total_amount;
            } else {
              acc[orderDate] = order.total_amount;
            }
            return acc;
          }, {});

          // Convert aggregated data to array format for recharts
          const salesDataArray = Object.keys(aggregatedData).map(date => ({
            date,
            sales: aggregatedData[date],
          }));

          setSalesData(salesDataArray);
        }
      });
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Welcome message */}
      {profile && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Welcome, {profile.full_name}!</h2>
          <p className="text-gray-600">Here's a summary of what's happening in your store.</p>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Package className="mr-2 h-4 w-4 text-gray-500" /> Total Products</CardTitle>
            <CardDescription>All products available in the store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><ShoppingBag className="mr-2 h-4 w-4 text-gray-500" /> Total Orders</CardTitle>
            <CardDescription>Number of orders placed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-4 w-4 text-gray-500" /> Total Users</CardTitle>
            <CardDescription>Registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><UserCog className="mr-2 h-4 w-4 text-gray-500" /> Admin Profile</CardTitle>
            <CardDescription>Your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium">
                <MapPin className="mr-2 inline-block h-4 w-4" /> {profile?.full_name || 'N/A'}
              </p>
              <p className="text-sm font-medium">
                <Mail className="mr-2 inline-block h-4 w-4" /> {profile?.phone || 'N/A'}
              </p>
              <p className="text-sm font-medium">
                <Phone className="mr-2 inline-block h-4 w-4" /> {profile?.role || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Sales Performance (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {order.id}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {order.user_id}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    ${order.total_amount}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {order.status || 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
