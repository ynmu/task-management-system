import '../../css/GeneralStyles.css';
import { API_BASE_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
import '../../css/EventCard.css';
import '../../css/EventCardList.css';
import { useAuth } from '../../context/AuthContext';

interface Event {
    id: string;
    name: string;
    date: string;
    location: string;
    size: number;
    description: string;
}

const EventCardList: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchEvents = async (roleId: number) => {
            try {
                setLoading(true);
                const response = await axios.get<Event[]>(`${API_BASE_URL}/events/role/${roleId}`);
                setEvents(response.data);
            } catch (error) {
                console.error('Failed to fetch event names:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.roleId) {
            fetchEvents(user.roleId);
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return (
            <div className="bg-black rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="bg-gradient-45-indigo-purple p-6">
                    <h3 className="text-white text-xl font-semibold">Events</h3>
                </div>
                <div className="flex flex-col items-center justify-center h-64 text-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-400 text-lg">Loading events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-45-indigo-purple p-6 flex justify-between items-center">
                <div>
                    <h3 className="text-white text-xl font-semibold">Events</h3>
                    {events.length > 0 && (
                        <span className="text-white/80 text-sm">{events.length} event{events.length !== 1 ? 's' : ''} available</span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {events.length > 0 && (
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
                            <span className="text-white text-sm font-medium">
                                Total: {events.reduce((sum, event) => sum + event.size, 0)} participants expected
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Events Container */}
            <div className="relative p-6">
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                          <EventCard
                              key={event.id}
                              id={event.id}
                              name={event.name}
                              date={event.date}
                              location={event.location}
                              size={event.size}
                              description={event.description}
                          />
                      ))}
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-12">
                        <div className="text-6xl mb-4 opacity-50">📅</div>
                        <p className="text-gray-400 text-lg mb-2">No events available</p>
                        <p className="text-gray-500 text-sm">Events will appear here when they're created for your role</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCardList;