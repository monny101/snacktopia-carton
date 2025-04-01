import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserCog,
  ShoppingBag,
  Package,
  Users,
  MapPin,
  Mail,
  Phone,
  Database,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { populateDatabase } from "@/utils/populateDatabase";

const AdminDashboard: React.FC = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [isPopulating, setIsPopulating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch total products
        const productsResponse = await supabase
          .from("products")
          .select("*", { count: "exact" });

        if (productsResponse.error) {
          console.error("Error fetching products:", productsResponse.error);
          throw new Error(productsResponse.error.message);
        } else {
          setTotalProducts(productsResponse.count || 0);
        }

        // Fetch total orders
        const ordersResponse = await supabase
          .from("orders")
          .select("*", { count: "exact" });

        if (ordersResponse.error) {
          console.error("Error fetching orders:", ordersResponse.error);
          throw new Error(ordersResponse.error.message);
        } else {
          setTotalOrders(ordersResponse.count || 0);
        }

        // Fetch total users
        const usersResponse = await supabase
          .from("profiles")
          .select("*", { count: "exact" });

        if (usersResponse.error) {
          console.error("Error fetching users:", usersResponse.error);
          throw new Error(usersResponse.error.message);
        } else {
          setTotalUsers(usersResponse.count || 0);
        }

        // Fetch recent orders (last 5)
        const recentOrdersResponse = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentOrdersResponse.error) {
          console.error(
            "Error fetching recent orders:",
            recentOrdersResponse.error,
          );
          throw new Error(recentOrdersResponse.error.message);
        } else {
          setRecentOrders(recentOrdersResponse.data);
        }

        // Fetch sales data (example: last 7 days)
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        const salesResponse = await supabase
          .from("orders")
          .select("created_at, total_amount")
          .gte("created_at", lastWeek.toISOString())
          .lte("created_at", today.toISOString());

        if (salesResponse.error) {
          console.error("Error fetching sales data:", salesResponse.error);
          throw new Error(salesResponse.error.message);
        } else {
          // Aggregate sales data by date
          const aggregatedData = salesResponse.data.reduce(
            (acc: any, order: any) => {
              const orderDate = order.created_at.split("T")[0]; // Extract date part
              if (acc[orderDate]) {
                acc[orderDate] += order.total_amount;
              } else {
                acc[orderDate] = order.total_amount;
              }
              return acc;
            },
            {},
          );

          // Convert aggregated data to array format for recharts
          const salesDataArray = Object.keys(aggregatedData).map((date) => ({
            date,
            sales: aggregatedData[date],
          }));

          setSalesData(salesDataArray);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <Button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Welcome message */}
      {profile && (
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Welcome, {profile.full_name}!
            </h2>
            <p className="text-gray-600">
              Here's a summary of what's happening in your store.
            </p>
          </div>
          <Button
            onClick={async () => {
              setIsPopulating(true);
              await populateDatabase();
              // Refresh data after population
              window.location.reload();
            }}
            disabled={isPopulating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPopulating ? (
              <>
                <Database className="mr-2 h-4 w-4 animate-spin" />
                Populating...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                {totalProducts > 0
                  ? "Repopulate Database"
                  : "Populate Database"}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-4 w-4 text-gray-500" /> Total Products
            </CardTitle>
            <CardDescription>
              All products available in the store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4 text-gray-500" /> Total
              Orders
            </CardTitle>
            <CardDescription>Number of orders placed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-gray-500" /> Total Users
            </CardTitle>
            <CardDescription>Registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCog className="mr-2 h-4 w-4 text-gray-500" /> Admin Profile
            </CardTitle>
            <CardDescription>Your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium">
                <MapPin className="mr-2 inline-block h-4 w-4" />{" "}
                {profile?.full_name || "N/A"}
              </p>
              <p className="text-sm font-medium">
                <Mail className="mr-2 inline-block h-4 w-4" />{" "}
                {profile?.phone || "N/A"}
              </p>
              <p className="text-sm font-medium">
                <Phone className="mr-2 inline-block h-4 w-4" />{" "}
                {profile?.role || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Sales Performance (Last 7 Days)
        </h2>
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
        {recentOrders.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
            <p className="text-gray-500">
              No orders found. Orders will appear here once customers start
              placing them.
            </p>
          </div>
        ) : (
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
                      {order.status || "N/A"}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
