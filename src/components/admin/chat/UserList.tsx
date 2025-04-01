
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatUser {
  id: string;
  full_name: string;
  unread: number;
  latest_message?: string;
  latest_message_time?: string;
}

interface UserListProps {
  users: ChatUser[];
  selectedUser: ChatUser | null;
  onSelectUser: (user: ChatUser) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  selectedUser,
  onSelectUser,
  searchTerm,
  onSearchChange
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="w-1/3 border-r flex flex-col">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {users.length > 0 ? (
          users.map((chatUser) => (
            <div
              key={chatUser.id}
              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                selectedUser?.id === chatUser.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectUser(chatUser)}
            >
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {chatUser.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{chatUser.full_name}</h3>
                    {chatUser.latest_message_time && (
                      <span className="text-xs text-gray-500">
                        {formatTime(chatUser.latest_message_time)}
                      </span>
                    )}
                  </div>
                  {chatUser.latest_message && (
                    <p className="text-sm text-gray-500 truncate">
                      {chatUser.latest_message}
                    </p>
                  )}
                </div>
                {chatUser.unread > 0 && (
                  <div className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                    {chatUser.unread}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No customers found matching your search' : 'No customer chats available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
