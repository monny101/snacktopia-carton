
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  FileText, 
  ArrowUp, 
  ArrowDown,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  user_id: string;
  address_id: string | null;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string; // Changed from strict union type to allow any string
  delivery_type: string; // Changed from strict union to string
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
  addresses?: {
    address_line: string;
    city: string;
    state: string;
  } | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string | null;
  };
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);
  
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
        console.log("Fetching orders from Supabase...");
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            profiles (full_name, phone),
            addresses (address_line, city, state)
          `)
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (error) {
          console.error('Error fetching orders:', error);
          throw error;
        }
        
        console.log("Orders fetched:", data);
        if (data) {
          // Convert the data to the correct Order type
          const typedOrders: Order[] = data.map(order => ({
            ...order,
            status: order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
            payment_method: order.payment_method, // Accept any string value
            delivery_type: order.delivery_type // Accept any string value
          }));
          setOrders(typedOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load orders. Please check the console for details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [sortField, sortDirection]);
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
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
  
  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    const orderIdMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const customerNameMatch = order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return orderIdMatch || (customerNameMatch || false);
  });
  
  // View order details
  const handleViewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
    
    try {
      setLoadingOrderItems(true);
      console.log("Fetching order items for order:", order.id);
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products(name, image_url)
        `)
        .eq('order_id', order.id);
      
      if (error) {
        console.error('Error fetching order items:', error);
        throw error;
      }
      
      console.log("Order items fetched:", data);
      if (data) {
        setOrderItems(data as unknown as OrderItem[]);
      } else {
        setOrderItems([]);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details. Please check the console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrderItems(false);
    }
  };
  
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
          status: newStatus as Order['status'], 
          updated_at: new Date().toISOString() 
        } : o
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ 
          ...selectedOrder, 
          status: newStatus as Order['status'], 
          updated_at: new Date().toISOString() 
        });
      }
      
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
            placeholder="Search orders by ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-4 text-left font-medium">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('id')}
                  >
                    Order ID
                    {sortField === 'id' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">Customer</th>
                <th className="py-3 px-4 text-left font-medium">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('created_at')}
                  >
                    Date
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('total_amount')}
                  >
                    Amount (₦)
                    {sortField === 'total_amount' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  <button 
                    className="flex items-center" 
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium">Delivery Type</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{order.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4">{order.profiles?.full_name || 'Unknown'}</td>
                    <td className="py-3 px-4">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4">₦{order.total_amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[order.status]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 capitalize">{order.delivery_type}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                    {searchTerm ? 'No orders found matching your search' : 'No orders available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Order Information</h3>
                  <p className="text-sm">Order ID: <span className="font-mono">{selectedOrder.id}</span></p>
                  <p className="text-sm">Date: {formatDate(selectedOrder.created_at)}</p>
                  <p className="text-sm">Payment Method: <span className="capitalize">{selectedOrder.payment_method.replace(/_/g, ' ')}</span></p>
                  <p className="text-sm">Delivery Type: <span className="capitalize">{selectedOrder.delivery_type}</span></p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-semibold">Status:</span>
                    <Select 
                      defaultValue={selectedOrder.status}
                      onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Customer Information</h3>
                  <p className="text-sm">Name: {selectedOrder.profiles?.full_name || 'N/A'}</p>
                  <p className="text-sm">Phone: {selectedOrder.profiles?.phone || 'N/A'}</p>
                  
                  {selectedOrder.delivery_type === 'delivery' && selectedOrder.addresses && (
                    <>
                      <h3 className="text-sm font-semibold mt-3 mb-1">Delivery Address</h3>
                      <p className="text-sm">{selectedOrder.addresses.address_line}</p>
                      <p className="text-sm">{selectedOrder.addresses.city}, {selectedOrder.addresses.state}</p>
                    </>
                  )}
                </div>
              </div>
              
              <h3 className="text-sm font-semibold mb-2">Order Items</h3>
              
              {loadingOrderItems ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  <div className="border rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="py-2 px-3 text-left font-medium">Product</th>
                          <th className="py-2 px-3 text-right font-medium">Quantity</th>
                          <th className="py-2 px-3 text-right font-medium">Price</th>
                          <th className="py-2 px-3 text-right font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2 px-3">{item.products.name}</td>
                            <td className="py-2 px-3 text-right">{item.quantity}</td>
                            <td className="py-2 px-3 text-right">₦{item.price.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right">₦{(item.price * item.quantity).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan={3} className="py-2 px-3 text-right">Total:</td>
                          <td className="py-2 px-3 text-right">₦{selectedOrder.total_amount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
