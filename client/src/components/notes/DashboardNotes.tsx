import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { FaCalendar, FaExclamationTriangle, FaBell, FaEye } from 'react-icons/fa';
import { BsFillPinMapFill } from 'react-icons/bs';
import UserAvatar from '../users/UserAvatar';
import EventNotes from '../notes/EventNotes';

interface Note {
  id: number;
  message: string;
  createdAt: string;
  eventId: number; 
  senderId: number;
  isUrgent: boolean;
  timeAgo: string;
  preview: string;
  event: {
    id: number;
    name: string;
    date: string;
    location: string;
    status: boolean;
  };
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    profileUrl?: string;
  };
}

interface NotesResponse {
  notes: Note[];
  summary: {
    totalNotes: number;
    urgentNotes: number;
    eventsWithNotes: number;
    lastActivity: string | null;
    userRole: string;
    activeEvents: number;
  };
  filters: {
    applied: string;
    limit: number;
  };
}

interface DashboardNotesProps {
  className?: string;
}

const DashboardNotes: React.FC<DashboardNotesProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [notesData, setNotesData] = useState<NotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');
  const [error, setError] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedEventName, setSelectedEventName] = useState<string>('');

  useEffect(() => {
    fetchRecentNotes();
  }, [user?.id, filter]);

  const fetchRecentNotes = async () => {
    if (!user?.id) return;
  
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notes/recent`, {
        headers: {
          'x-user-id': user.id.toString(),
        },
        params: {
          priority: filter,
          limit: 8,
        },
      });
  
      setTimeout(() => {
        setNotesData(response.data);
        setError(null);
        setLoading(false);
      }, 400);
  
    } catch (error) {
      console.error('Error fetching recent notes:', error);
      setError('Failed to load recent notes');
      setLoading(false);
    }
  };
  

  if (!user) return null;

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border-2 border-white/10 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border-2 border-red-500/20 rounded-2xl p-6 ${className}`}>
        <div className="text-center text-red-400">
          <FaExclamationTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <button
            onClick={fetchRecentNotes}
            className="mt-3 text-blue-400 hover:text-blue-300 underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border-2 border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-xl">
            <FaBell className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">Recent Notes</h3>
            <p className="text-gray-400 text-sm">Events that need attention</p>
          </div>
        </div>
        
        {/* Filter Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'urgent'
                ? 'bg-red-500/20 text-red-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Urgent
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {notesData?.summary && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-blue-400 text-lg font-bold">{notesData.summary.totalNotes}</div>
            <div className="text-gray-400 text-xs">Total Notes</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-red-400 text-lg font-bold">{notesData.summary.urgentNotes}</div>
            <div className="text-gray-400 text-xs">Urgent</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-green-400 text-lg font-bold">{notesData.summary.eventsWithNotes}</div>
            <div className="text-gray-400 text-xs">Events</div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3 max-h-125 overflow-y-auto">
        {!notesData?.notes.length ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">📝</div>
            <p className="text-gray-400 text-sm">
              {filter === 'urgent' ? 'No urgent notes found' : 'No recent notes'}
            </p>
          </div>
        ) : (
          notesData.notes.map((note) => (
            <div
              key={note.id}
              className={`bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 border-l-4 ${
                note.isUrgent ? 'border-red-500' : 'border-blue-500'
              }`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    userName={note.sender.userName}
                    firstName={note.sender.firstName}
                    lastName={note.sender.lastName}
                    profileUrl={note.sender.profileUrl}
                    size={24}
                  />
                  <div>
                    <span className="text-white text-sm font-medium">
                      {note.sender.firstName && note.sender.lastName
                        ? `${note.sender.firstName} ${note.sender.lastName}`
                        : note.sender.userName || 'Unknown User'}
                    </span>
                    {note.isUrgent && (
                      <FaExclamationTriangle className="w-3 h-3 text-red-400 ml-2 inline" />
                    )}
                  </div>
                </div>
                <span className="text-gray-400 text-xs">{note.timeAgo}</span>
              </div>

              {/* Event Info */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <FaCalendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300 text-sm font-medium">{note.event.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <BsFillPinMapFill className="w-3 h-3" />
                    {note.event.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCalendar className="w-3 h-3" />
                    {new Date(note.event.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Note Preview */}
              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                {note.preview}
              </p>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedEventId(note.event.id);
                    setSelectedEventName(note.event.name);
                    setShowDrawer(true);
                  }}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  <FaEye className="w-3 h-3" />
                  View Full Note
                </button>
              </div>
              {selectedEventId && (
                <EventNotes
                  eventId={selectedEventId}
                  visible={showDrawer}
                  onClose={() => setShowDrawer(false)}
                  eventName={selectedEventName}
                  maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                />
              )}

            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notesData?.summary.lastActivity && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-gray-400 text-xs">
            Last activity: {new Date(notesData.summary.lastActivity).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardNotes;