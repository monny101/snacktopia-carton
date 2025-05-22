
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, ShoppingBag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChatActivity {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
  staff_id?: string | null;
}

interface OrderActivity {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

const RecentActivity: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [chatActivities, setChatActivities] = useState<ChatActivity[]>([]);
  const [orderActivities, setOrderActivities] = useState<OrderActivity[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      try {
        // Fetch recent chat messages
        const { data: chatData, error: chatError } = await supabase
          .from('chat_messages')
          .select(`
            id,
            user_id,
            message,
            staff_id,
            created_at,
            profiles:user_id(full_name)
          `)
          .is('staff_id', null) // Only customer-initiated messages
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (chatError) throw chatError;
        
        // Fetch recent orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            status,
            total_amount,
            created_at,
            profiles:user_id(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (orderError) throw orderError;
        
        setChatActivities(chatData as ChatActivity[]);
        setOrderActivities(orderData as OrderActivity[]);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentActivity();
    
    // Set up real-time listeners for chat messages and orders
    const chatSubscription = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
        (payload) => {
          const newMessage = payload.new as any;
          
          // Only include customer messages (no staff_id)
          if (newMessage.staff_id === null) {
            // Need to fetch the user details
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', newMessage.user_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setChatActivities(prev => [
                    { 
                      ...newMessage, 
                      profiles: { full_name: data.full_name } 
                    } as ChatActivity, 
                    ...prev.slice(0, 9)
                  ]);
                }
              });
          }
        }
      )
      .subscribe();
    
    const orderSubscription = supabase
      .channel('public:orders')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'orders' }, 
        (payload) => {
          const newOrder = payload.new as any;
          
          // Fetch user details
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newOrder.user_id)
            .single()
            .then(({ data }) => {
              if (data) {
                setOrderActivities(prev => [
                  { 
                    ...newOrder, 
                    profiles: { full_name: data.full_name } 
                  } as OrderActivity, 
                  ...prev.slice(0, 9)
                ]);
              }
            });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(chatSubscription);
      supabase.removeChannel(orderSubscription);
    };
  }, []);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const allActivities = [...chatActivities, ...orderActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
  
  if (loading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Recent Customer Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle>Recent Customer Activity</CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="chat">Chat Messages</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-2">
            {allActivities.length > 0 ? (
              <div className="divide-y">
                {allActivities.map((activity) => (
                  <div key={activity.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {activity.profiles?.full_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(activity.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {'message' in activity ? (
                        <>
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-600 truncate">
                            {activity.message}
                          </span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">
                            Placed an order for ₦{activity.total_amount.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="ml-auto">
                            {activity.status}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No recent activity</div>
            )}
          </TabsContent>
          
          <TabsContent value="chat" className="mt-2">
            {chatActivities.length > 0 ? (
              <div className="divide-y">
                {chatActivities.map((activity) => (
                  <div key={activity.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {activity.profiles?.full_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(activity.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600 truncate">
                        {activity.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No recent chat messages</div>
            )}
          </TabsContent>
          
          <TabsContent value="orders" className="mt-2">
            {orderActivities.length > 0 ? (
              <div className="divide-y">
                {orderActivities.map((activity) => (
                  <div key={activity.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {activity.profiles?.full_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(activity.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">
                        Placed an order for ₦{activity.total_amount.toLocaleString()}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No recent orders</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
