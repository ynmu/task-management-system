import React from 'react';
import UserAvatar from '../users/UserAvatar';

interface NoteBubbleProps {
  note: {
    id: number;
    message: string;
    sender: {
      id: number;
      firstName?: string;
      lastName?: string;
      userName?: string;
      profileUrl?: string;
    };
    createdAt: string;
  };
  currentUserId?: number;
}

const NoteBubble: React.FC<NoteBubbleProps> = ({ note, currentUserId }) => {
  const isOwnMessage = note.sender.id === currentUserId;
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  return (
    <div className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <UserAvatar
          userName={note.sender.userName || ''}
          firstName={note.sender.firstName}
          profileUrl={note.sender.profileUrl}
          size={36}
        />
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[75%] ${isOwnMessage ? 'flex flex-col items-end' : ''}`}>
        {/* Sender Name & Time */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-400 mb-1 ml-1">
            {note.sender.firstName || note.sender.userName}
          </div>
        )}
        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-200 hover:shadow-lg ${
            isOwnMessage
              ? 'bg-gray-200 border-gray-200 text-gray-900 ml-auto'
              : 'bg-gray-800/60 border-white/10 text-gray-100'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{note.message}</p>
          
          {/* Message tail */}
          <div
            className={`absolute top-3 w-0 h-0 ${
              isOwnMessage
                ? 'right-[-6px] border-l-[6px] border-l-gray-200 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                : 'left-[-6px] border-r-[6px] border-r-gray-800/60 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
            }`}
          />
        </div>

        {/* Time */}
        <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
          {formatTime(note.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default NoteBubble;