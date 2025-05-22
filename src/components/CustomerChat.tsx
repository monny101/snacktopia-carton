
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import ChatWindow from './chat/ChatWindow';
import ChatInput from './chat/ChatInput';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'] & {
  profiles?: {
    full_name: string;
  };
};

const CustomerChat: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when chat is opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      fetchMessages();
    }
  }, [isOpen, isAuthenticated, user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    console.log("Setting up chat subscription for user:", user.id);

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
          console.log("New chat message received:", payload);
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
      console.log("Removing chat subscription");
      supabase.removeChannel(chatSubscription);
    };
  }, [isAuthenticated, user, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log("Fetching chat messages for user:", user.id);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_staff_id_fkey(full_name)
        `)
        .or(`user_id.eq.${user.id},staff_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log("Chat messages fetched:", data);
      if (data) {
        setMessages(data as any);
      } else {
        setMessages([]);
      }
      
      // Reset unread count and mark messages as read
      setUnreadCount(0);
      markAllMessagesAsRead();
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history. Please try again later.',
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
        .update({ is_read: true } as any)
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
        .update({ is_read: true } as any)
        .eq('id', messageId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Please login',
        description: 'You need to login to send messages',
        variant: 'destructive',
      });
      return;
    }
    
    if (!message.trim() || !user) return;
    
    try {
      console.log("Sending chat message for user:", user.id);
      
      const messageData = {
        user_id: user.id,
        staff_id: null,
        message: message.trim(),
        is_read: false
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData as any])
        .select();
      
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      console.log("Chat message sent:", data);
      
      // Add message to state
      if (data && data[0]) {
        setMessages(prev => [...prev, data[0] as ChatMessage]);
        scrollToBottom();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0);
    }
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
            <ChatWindow 
              messages={messages}
              loading={loading}
              isAuthenticated={isAuthenticated}
              messagesEndRef={messagesEndRef}
            />
          </div>

          {/* Message input */}
          {isAuthenticated && (
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={!isAuthenticated}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerChat;
