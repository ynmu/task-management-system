import React, { useEffect } from "react";
import { Row, Col, Table } from 'antd';
import { attendeeColumns} from "../assets/AddEventTable";
import './GeneralStyles.css';
import { API_BASE_URL } from '../config';
import { useAuth }  from '../context/AuthContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const EventDetails: React.FC = () => {
    const { id: eventId } = useParams<{ id: string }>();
    const [participants, setParticipants] = React.useState<any[]>([]);

    useEffect(() => {
        const fetchEvents = async (eventId: string) => {
                try {
                    const response = await axios.get<any[]>(`${API_BASE_URL}/attendees/${eventId}`);
                    setParticipants(response.data);
                } catch (error) {
                    console.error('Failed to fetch event names:', error);
                }
            };
            if (eventId) {
                fetchEvents(eventId);
            }
        }, [eventId]);

return (
        <div className="view-event">
            <Row>
                <Col span={24}>
                    <Table
                        columns={attendeeColumns}
                        dataSource={participants}
                        pagination={false}
                    />
                </Col>
            </Row>
        </div>
    );
};
export default EventDetails;