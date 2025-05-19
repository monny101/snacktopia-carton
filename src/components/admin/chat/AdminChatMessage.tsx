
import React from 'react';
import type { Database } from '@/integrations/supabase/types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'] & {
  profiles?: {
    full_name: string | null;
  } | null;
};

interface DateHeaderProps {
  date: string;
}

interface MessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  userId: string;
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

const DateHeader: React.FC<DateHeaderProps> = ({ date }) => (
  <div className="flex justify-center my-2">
    <div className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
      {date}
    </div>
  </div>
);

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => (
  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[70%] rounded-lg p-3 ${
      isCurrentUser 
        ? 'bg-blue-500 text-white rounded-br-none' 
        : 'bg-gray-100 rounded-bl-none'
    }`}>
      <p>{message.message}</p>
      <p className={`text-xs mt-1 text-right ${
        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
      }`}>
        {formatTime(message.created_at)}
      </p>
    </div>
  </div>
);

interface AdminChatMessageProps {
  message: ChatMessage;
  index: number;
  messages: ChatMessage[];
  userId: string;
}

const AdminChatMessage: React.FC<AdminChatMessageProps> = ({ 
  message, 
  index, 
  messages,
  userId
}) => {
  const isCurrentUser = message.staff_id === userId;
  const showDateHeader = index === 0 || 
    formatDate(messages[index-1].created_at) !== formatDate(message.created_at);
  
  return (
    <React.Fragment>
      {showDateHeader && (
        <DateHeader date={formatDate(message.created_at)} />
      )}
      <Message 
        message={message} 
        isCurrentUser={isCurrentUser} 
        userId={userId}
      />
    </React.Fragment>
  );
};

export default AdminChatMessage;
