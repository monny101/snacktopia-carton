
import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import type { Database } from '@/integrations/supabase/types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'] & {
  profiles?: {
    full_name: string;
  };
};

type ChatWindowProps = {
  messages: ChatMessage[];
  loading: boolean;
  isAuthenticated: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  loading, 
  isAuthenticated,
  messagesEndRef 
}) => {
  
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-full text-center text-gray-500 p-4">
        Please login to start a conversation with our support team.
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-center text-gray-500 p-4">
        No messages yet. Send a message to start a conversation with our support team!
      </div>
    );
  }
  
  return (
    <>
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          isFromStaff={!!message.staff_id} 
        />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};

export default ChatWindow;
