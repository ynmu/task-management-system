import EventCardList from '../components/events/EventCardList';

const ViewEventsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
            <EventCardList />
        </div>
    );
};

export default ViewEventsPage;