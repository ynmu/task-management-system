import ViewEvents from '../components/EventCardList';

const ViewEventsPage: React.FC = () => {
    return (
        <div>
            <header className="page-header">
                <h1>View Events</h1>
            </header>
            <ViewEvents />
        </div>
    );
};

export default ViewEventsPage;