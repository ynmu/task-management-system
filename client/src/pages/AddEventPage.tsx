import AddEvent from "../components/AddEvent";



const AddEventPage: React.FC = () => {
    return (
        <div>
            <header className="page-header">
                <h1>Add Event</h1>
            </header>
            <AddEvent />
        </div>
    );
};

export default AddEventPage;
// AddEventPage.tsx
export type Participant = {
    id: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    totalDonations: number;
    addressLine1: string;
    addressLine2: string;
    city: string;
  };