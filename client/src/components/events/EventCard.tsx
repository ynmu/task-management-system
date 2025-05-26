import React, { useState } from 'react';
import { FaUserFriends, FaCalendar } from "react-icons/fa";
import { BsFillPinMapFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import '../../css/EventCard.css';
import EventNotes from '../notes/EventNotes';

interface EventCardProps {
    id: string;
    name: string;
    date: string;
    location: string;
    size: number;
    description?: string;
}

const EventCard: React.FC<EventCardProps> = ({ id, name, date, location, size, description }) => {
    const navigate = useNavigate();
    const [showNotes, setShowNotes] = useState(false);

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <>
            <div
                className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border-2 border-white/10 rounded-2xl p-6 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 group"
            >
                {/* Header */}
                <div className="mb-4">
                    <h4 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                        {name}
                    </h4>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FaCalendar className="w-4 h-4" />
                        {formattedDate}
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <BsFillPinMapFill className="w-4 h-4" />
                        {location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <FaUserFriends className="w-4 h-4" />
                        {size} participants expected
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-gray-400 text-sm line-clamp-3">{description}</p>
                    </div>
                )}

                {/* Action */}
                <div className="mt-6 space-y-3">
                    <button
                        onClick={() => navigate(`/event-details/${id}`)}
                        className="w-full bg-gradient-45-indigo-purple text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 group-hover:from-blue-400 group-hover:to-purple-500"
                    >
                        Edit Event
                    </button>

                    <button
                        onClick={() => setShowNotes(true)}
                        className="w-full bg-white text-black px-4 py-2 rounded-xl font-medium border border-white/20 hover:bg-gray-100 transition-all duration-300"
                    >
                        View Notes
                    </button>
                </div>
            </div>

            <EventNotes
                eventId={parseInt(id)}
                visible={showNotes}
                onClose={() => setShowNotes(false)}
                eventName={name}
            />
        </>
    );
};

export default EventCard;
