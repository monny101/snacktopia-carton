
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, X, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Database } from '@/integrations/supabase/types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'] & {
  profiles?: {
    full_name: string;
  };
};

const CustomerChat: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages when chat is opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      fetchMessages();
    }
  }, [isOpen, isAuthenticated, user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const chatSubscription = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `user_id=eq.${user.id}` 
        }, 
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // If chat is open, add message to chat and mark as read
          if (isOpen) {
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
            
            // If it's from staff, mark as read
            if (newMessage.staff_id) {
              markMessageAsRead(newMessage.id);
            }
          } else {
            // If chat is closed, increment unread count
            if (newMessage.staff_id) {
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    // Fetch initial unread count
    fetchUnreadCount();
    
    return () => {
      supabase.removeChannel(chatSubscription);
    };
  }, [isAuthenticated, user, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:staff_id(full_name)
        `)
        .or(`user_id.eq.${user.id},staff_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Cast as any first to avoid TypeScript errors with the profiles join
      setMessages((data as any) || []);
      
      // Reset unread count and mark messages as read
      setUnreadCount(0);
      markAllMessagesAsRead();
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .not('staff_id', 'is', null);
      
      if (error) throw error;
      
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAllMessagesAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Please login',
        description: 'You need to login to send messages',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newMessage.trim() || !user) return;
    
    try {
      const message = {
        user_id: user.id,
        staff_id: null,
        message: newMessage.trim(),
        is_read: false
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([message])
        .select();
      
      if (error) throw error;
      
      // Add message to state
      setMessages(prev => [...prev, data[0] as ChatMessage]);
      setNewMessage('');
      scrollToBottom();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  // Helper to get display name for staff messages
  const getDisplayName = (message: ChatMessage) => {
    if (message.staff_id && message.profiles?.full_name) {
      return message.profiles.full_name;
    }
    return 'Support Staff';
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors relative"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                {unreadCount}
              </div>
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col border overflow-hidden">
          {/* Chat header */}
          <div className="p-3 bg-blue-500 text-white flex justify-between items-center">
            <h3 className="font-medium">Customer Support</h3>
            <button onClick={toggleChat} className="text-white hover:text-blue-100">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {!isAuthenticated ? (
              <div className="flex justify-center items-center h-full text-center text-gray-500 p-4">
                Please login to start a conversation with our support team.
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => {
                  const isFromStaff = !!message.staff_id;
                  
                  return (
                    <div key={message.id} className={`flex ${isFromStaff ? 'justify-start' : 'justify-end'}`}>
                      {isFromStaff && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            MS
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-2 ${
                          isFromStaff
                            ? 'bg-gray-100 rounded-tl-none'
                            : 'bg-blue-500 text-white rounded-tr-none'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 text-right ${
                          isFromStaff ? 'text-gray-500' : 'text-blue-100'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex justify-center items-center h-full text-center text-gray-500 p-4">
                No messages yet. Send a message to start a conversation with our support team!
              </div>
            )}
          </div>

          {/* Message input */}
          {isAuthenticated && (
            <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
              <Input
                ref={chatInputRef}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerChat;
