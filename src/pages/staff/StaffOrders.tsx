
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  tracking_number: string | null;
  profiles?: {
    full_name: string | null;
  };
}

const StaffOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log("Fetching staff orders from Supabase...");
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            profiles:user_id(full_name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching orders:', error);
          throw error;
        }
        
        console.log("Orders fetched:", data);
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load orders. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const orderIdMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const customerNameMatch = order.profiles?.full_name?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const trackingMatch = order.tracking_number?.toLowerCase()?.includes(searchTerm.toLowerCase());
    
    return orderIdMatch || customerNameMatch || trackingMatch;
  });

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(o => 
        o.id === orderId ? { 
          ...o, 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        } : o
      ));
      
      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  // Add tracking number
  const handleAddTracking = async (orderId: string, trackingNumber: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString(),
          status: 'shipped' // Also update status to shipped
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(o => 
        o.id === orderId ? { 
          ...o, 
          tracking_number: trackingNumber,
          status: 'shipped',
          updated_at: new Date().toISOString() 
        } : o
      ));
      
      toast({
        title: 'Success',
        description: 'Tracking number added and order marked as shipped',
      });
    } catch (error) {
      console.error('Error adding tracking number:', error);
      toast({
        title: 'Error',
        description: 'Failed to add tracking number',
        variant: 'destructive',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Orders</h1>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders by ID, customer name or tracking number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {filteredOrders.length > 0 ? (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 text-left font-medium">Order ID</th>
                  <th className="py-3 px-4 text-left font-medium">Customer</th>
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Tracking</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{order.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4">{order.profiles?.full_name || 'Unknown'}</td>
                    <td className="py-3 px-4">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4">₦{order.total_amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[order.status] || ''}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {order.tracking_number ? (
                        <span className="font-mono">{order.tracking_number}</span>
                      ) : (
                        <div className="flex items-center">
                          <Input
                            placeholder="Add tracking #"
                            className="h-8 w-32 mr-2"
                            id={`tracking-${order.id}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById(`tracking-${order.id}`) as HTMLInputElement;
                              if (input.value) {
                                handleAddTracking(order.id, input.value);
                              }
                            }}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Select 
                        defaultValue={order.status}
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No orders found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm ? 'No orders match your search criteria' : 'There are no orders in the system yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffOrders;
