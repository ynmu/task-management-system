import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Row, Col, Table } from 'antd';
import './GeneralStyles.css';
import { API_BASE_URL } from '../config';
import { attendeeColumns } from "../assets/AddEventTable";
import { useAuth } from '../context/AuthContext';

// Event Type
export type Event = {
    id: number;
    name: string;
    date: string;
    location: string; // Address or location name
  };
  

const ViewEvent: React.FC = () => {
    const [form] = Form.useForm();
    const [events, setEvents] = useState<Event[]>([]);
    const [participants, setParticipants] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState<Event>();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchEvents(user.roleId);
        }
    }, []);

{/* fetch event id and name from backend */}
const fetchEvents = async (roleId: number) => {
    try {
        const response = await axios.get<Event[]>(`${API_BASE_URL}/events/role/${roleId}`);
        setEvents(response.data);
    }
    catch (error) {
        console.error('Failed to fetch event names:', error);
    }
};

{/* fetch participants of the selected event */}
const fetchParticipantList = async (eventId: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/attendees/${eventId}`);
        setParticipants(response.data);
    }
    catch (error) {
        console.error('Failed to fetch participants:', error);
    }
};

const handleEventSelect = (eventId:number) => {
    fetchParticipantList(eventId);
    setSelectedEvent(events.find((event) => event.id === eventId));
}

return (
    <>
        <Form
                form={form}
                layout="vertical"
                style={{ maxWidth: 600, margin: '0 auto' }}
            >
                <Form.Item
                    label="Event Name"
                    name="eventName"
                    rules={[{ required: true, message: 'Please select an Event' }]}
                        >
                            <Select 
                            placeholder="Select an Event"
                            onChange={handleEventSelect}>
                                {events.map((event) => (
                                    <Select.Option key={event.id} value={event.id}>
                                        {event.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                
                <Row style={{ margin: '20px 0' }}>
                    <Col span={24}>
                        <h2>Location : {selectedEvent?.location}</h2>
                    </Col>
                    <Col span={24}>
                        <h2>Date: {selectedEvent?.date.substring(0, 10)}</h2>
                    </Col>
                </Row>
            <Table
                dataSource={participants}
                columns={attendeeColumns}
                pagination={{ pageSize: 10 }}>
            </Table>
        </>
    );
}

export default ViewEvent;