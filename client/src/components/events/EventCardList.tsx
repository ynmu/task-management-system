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
    const { user } = useAuth();

    useEffect(() => {
        const fetchEvents = async (roleId: number) => {
            try {
                const response = await axios.get<Event[]>(`${API_BASE_URL}/events/role/${roleId}`);
                setEvents(response.data);
            } catch (error) {
                console.error('Failed to fetch event names:', error);
            }
        };

        if (user && user.roleId) {
            fetchEvents(user.roleId);
        }
    }, [user]);

    return (
        <div className="event-card-list">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    name={event.name}
                    date={event.date}
                    location={event.location}
                    size={event.size}
                    id={event.id}
                />
            ))}
        </div>
    );
};

export default EventCardList;
