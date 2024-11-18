import React from 'react';
import './EventCard.css';
import { FaUserFriends } from "react-icons/fa";
import { FaCalendar } from "react-icons/fa";
import { BsFillPinMapFill } from "react-icons/bs";
import { MdEditNote } from "react-icons/md";

interface EventCardProps {
    name: string;
    date: string; // Expected format: YYYY-MM-DD
    location: string;
    size: number;
}



const EventCard: React.FC<EventCardProps> = ({ name, date, location, size }) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const ids = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 29, 37, 38, 42, 44, 48, 52, 56, 57, 62, 74, 88];
    const randomId = ids[Math.floor(Math.random() * ids.length)];

    return (
        <div className="event-card">
            <img src={`https://picsum.photos/id/${randomId}/210/120`} alt="Random scenic placeholder" className="event-card__image" />
            <h2 className="event-card__name">{name}</h2>
            <p className="event-card__info"><FaCalendar />   {formattedDate}</p>
            <p className="event-card__info"><BsFillPinMapFill />   {location}</p>
            <p className="event-card__info"><FaUserFriends />   {size} Expected Participants</p>
            <div className="event-card__buttons">
                <button className="event-card__button"><MdEditNote size={25} /></button>
            </div>
        </div>
    );
};

export default EventCard;
