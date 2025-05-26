import React, { useEffect, useState } from 'react';
import { Drawer, Input, Button, message } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import NoteBubble from './NoteBubble'; // Adjust import path as needed

interface Note {
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
}

interface EventNotesProps {
  eventId: number;
  visible: boolean;
  onClose: () => void;
  eventName: string;
  maskStyle?: React.CSSProperties;
}

const EventNotes: React.FC<EventNotesProps> = ({ eventId, visible, onClose, eventName, maskStyle }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${eventId}`);
      const data = await res.json();
      setNotes(data);
    } catch {
      message.error('Failed to load notes');
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || '',
        },
        body: JSON.stringify({ message: input }),
      });
      if (res.ok) {
        setInput('');
        fetchNotes();
      } else {
        message.error('Failed to send note');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (visible) fetchNotes();
  }, [visible]);

  return (
    <Drawer
      title={null}
      placement="right"
      closable={false}
      onClose={onClose}
      open={visible}
      width={600}
      bodyStyle={{ padding: 0 }}
      className="event-notes-drawer"
      maskStyle={ maskStyle}
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-black">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm">
          <div>
            <h2 className="text-white text-xl font-semibold mb-1">{eventName}</h2>
            <p className="text-gray-400 text-sm">{notes.length} messages</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-2 rounded-xl bg-white/10 border border-white/20 text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200"
          >
            <CloseOutlined style={{ fontSize: '20px' }} />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-1">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <SendOutlined style={{ fontSize: '32px', color: 'gray', transform: 'translateX(2px)' }} />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No notes yet</h3>
              <p className="text-gray-400 text-sm">Start the conversation by sending the first note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <NoteBubble
                key={note.id}
                note={note}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>

        {/* Input Section */}
        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your note..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="bg-gray-800/60 border-white/20 text-white placeholder-gray-400 rounded-xl resize-none focus:border-blue-400/50 focus:bg-gray-800/80"
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <SendOutlined className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default EventNotes;