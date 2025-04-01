
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Database } from '@/integrations/supabase/types';

type ChatMessageProps = {
  message: Database['public']['Tables']['chat_messages']['Row'] & {
    profiles?: {
      full_name: string;
    };
  };
  isFromStaff: boolean;
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isFromStaff }) => {
  const getDisplayName = () => {
    if (message.staff_id && message.profiles?.full_name) {
      return message.profiles.full_name;
    }
    return 'Support Staff';
  };
  
  return (
    <div className={`flex ${isFromStaff ? 'justify-start' : 'justify-end'}`}>
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
};

export default ChatMessage;
