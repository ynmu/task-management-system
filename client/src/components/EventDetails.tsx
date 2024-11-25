import React, { useEffect, useState } from "react";
import { useAuth }  from '../context/AuthContext';
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Row, Col, Table } from 'antd';
import { columns, cityNames, topicNames, attendeeColumns} from "../assets/AddEventTable";
import './GeneralStyles.css';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import moment from 'moment';

const BC_CANCER_API = 'https://bc-cancer-faux.onrender.com/event';

type Participant = {
    id: number;
    firstName: string;
    lastName: string;
    organizationName?: string;  // Make optional if data might be missing
    totalDonations: number;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    pmm: string;
    smm: string;
    vmm: string;
};

interface Event {
    id: string;
    name: string;
    date: Date;
    location: string;
    size: number;
    description?: string;
    topic: String;
    attendees: Participant[];
}

const EventDetails: React.FC = () => {
    const [form] = Form.useForm();
    const { id: eventId } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event>();
    const [participants, setParticipants] = React.useState<Participant[]>([]);
    const [possibleParticipants, setPossibleParticipants] = React.useState<Participant[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const { user } = useAuth();

    // Data transformation
    const transformData = (data: any[]): Participant[] => {
        return data.map((item, index) => ({
          id: index + 1,
          firstName: String(item[5] || ''),
          lastName: String(item[7] || ''),
          organizationName: String(item[8] || ''),
          totalDonations: Number(item[9] || 0),
          addressLine1: String(item[18] || ''),
          addressLine2: String(item[19] || ''),
          city: String(item[20] || ''),
          pmm: String(item[0] || ''),
          smm: String(item[1] || ''),
          vmm: String(item[2] || ''),
        }));
      };

    // Fetch possible participants 
    const fetchData = async (city: string) => {
        try {
            const response = await axios.get(`${BC_CANCER_API}?cities=${city}&format=json`);
            console.log('Response:', response);
            if (response.status === 200) {
                const data = response.data;
                const transformedData = transformData(data.data);
                setPossibleParticipants(transformedData);
            } else {
                throw new Error('Failed to fetch participants');
            }
        } catch (error: any) {
            message.error(error.message);
        }
    };

    // Handle searching donors by location from the external API to get possibleParticipants
    const handleSearchDonors = async () => {
        try {
            const values = await form.validateFields(['location', 'size']);
            await fetchData(values.location);
        } catch (error) {
            message.error('Failed to fetch the participants list. Please ensure the form is valid.');
        }
    };

    
    // Handle selection of participants
    const handleSelectedParticipants = (selectedRowKeys: React.Key[], selectedRows: { id: number }[]) => {
        const selectedIds = selectedRows.map(row => row.id);
        setSelectedParticipants(selectedIds);
    };

    // Update attendees as part of the event
    const updateAttendees = async (attendees: Participant[], eventId: number) => {
        try {
            const requestBody = attendees.map(attendee => ({
                firstName: attendee.firstName,
                lastName: attendee.lastName,
                organization: attendee.organizationName || null,
                totalDonations: attendee.totalDonations,
                address1: attendee.addressLine1 || null,
                address2: attendee.addressLine2 || null,
                city: attendee.city || null,
                pmm: attendee.pmm || null,
                smm: attendee.smm || null,
                vmm: attendee.vmm || null,
                eventId: eventId, // Ensure eventId is correctly set
            }));
            console.log('Request Body for Attendees:', requestBody); // Add a console log to inspect request body
    
            const response = await fetch(`${API_BASE_URL}/attendees/:${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            if (response.ok) {
                message.success('Attendees updated successfully');
            } else {
                const errorText = await response.text(); // Read server response for more details
                throw new Error(`Failed to update attendees: ${errorText}`);
            }
        } catch (error: any) {
            message.error(`Error updating attendees: ${error.message}`);
        }
    };

    // Handle updating the attendees
    const handleUpdateAttendees = async () => { 
        try {
            const eventDetails = await form.validateFields();
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...eventDetails,
                    roleId: user?.roleId || null,
                }),
            });
    
            if (!response.ok) throw new Error('Failed to save event.');
    
            const newEvent = await response.json();
            message.success('Event updated successfully');
            const attendeesToSave = participants.filter(p => selectedParticipants.includes(p.id));
            await updateAttendees(attendeesToSave, newEvent.id);
            form.resetFields();
            setSelectedParticipants([]);
            setParticipants([]);
        } catch (error: unknown) {
            if (error instanceof Error) {
              message.error(`Error saving the event: ${error.message}`);
            } else {
              message.error('An unknown error occurred');
            }
          }
    };
    

    // Handle saving the event details without updating the attendees
    const handleUpdateEvent = async () => { 
        try {
            const eventDetails = await form.validateFields();
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...eventDetails,
                    roleId: user?.roleId || null,
                }),
            });
    
            if (!response.ok) throw new Error('Failed to save event.');
    
            const newEvent = await response.json();
            message.success('Event updated successfully');
            setEvent(newEvent);
            form.resetFields();
        } catch (error: unknown) {
            if (error instanceof Error) {
              message.error(`Error updating the event: ${error.message}`);
            } else {
              message.error('An unknown error occurred');
            }
          }
    };

    const handleCancel = () => {
        form.resetFields();
        setParticipants([]);
        setSelectedParticipants([]);
    };

    // Handle deleting selected participants
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const handleDelete = async () => {
        try {
            // Make the DELETE request
            const response = await axios.delete(`${API_BASE_URL}/attendees/${eventId}`, {
                data: { attendeeIds: selectedRowKeys },
            });
    
            // Update the frontend state based on the response
            const { count } = response.data;
            console.log(`${count} attendees deleted successfully`);
    
            // Remove deleted attendees from the local state
            const newParticipants = participants.filter(
                participant => !selectedRowKeys.includes(participant.id)
            );
            setParticipants(newParticipants);
            setSelectedRowKeys([]); // Clear the selection
        } catch (error) {
            console.error('Error deleting attendees:', error);
        }
    };

    // Fetch event details by eventId in the URL
    useEffect(() => {
        const fetchEvents = async (eventId: string) => {
            try {
                const response = await axios.get<Event>(`${API_BASE_URL}/events/${eventId}`);
                setEvent(response.data);
            } catch (error) {
                console.error('Failed to fetch this event:', error);
            }
        };
        if (eventId) {
            fetchEvents(eventId);
        }
    }, [user]);

    // Fetch participants by eventId
    useEffect(() => {
        const fetchParticipates = async (eventId: string) => {
                try {
                    const response = await axios.get<any[]>(`${API_BASE_URL}/attendees/${eventId}`);
                    setParticipants(response.data);
                } catch (error) {
                    console.error('Failed to fetch event names:', error);
                }
            };
            if (eventId) {
                fetchParticipates(eventId);
            }
        }, [event]);

return (
        <>
            <Form
                form={form}
                layout="vertical"
                style={{ maxWidth: 600, margin: '0 auto' }}
                initialValues={{
                    name: event?.name, 
                    topic: event?.topic, 
                    date: event?.date,
                    size: event?.size,
                    location: event?.location,
                    description: event?.description,
                }}
            >
                {/* Form Edit Section */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            label="Event ID" 
                            name="eventId"
                            initialValue={eventId}
                            >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Event Name"
                            name="name"
                        >
                            <Input placeholder={event?.name}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Event Date"
                            name="date"
                        >
                            <DatePicker style={{ width: '100%' }} placeholder={moment(event?.date).format('YYYY-MM-DD')}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Event Topic"
                            name="topic"
                        >
                            <Select placeholder={event?.topic}>
                                {topicNames.map(topic => (
                                    <Select.Option key={topic} value={topic}>
                                        {topic}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Event Size"
                            name="size"
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder={String(event?.size)} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Location"
                            name="location"
                        >
                            <Select 
                                placeholder={event?.location}
                                defaultValue={event?.location}
                                >
                                {cityNames.map(city => (
                                    <Select.Option key={city} value={city}>
                                        {city}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Event Description" name="description">
                    <Input.TextArea placeholder={event?.description} defaultValue={event?.description}/>
                </Form.Item>
                <Row justify="center" style={{ marginTop: 16 }}>
                    <Button className="custom-antd-button" type="primary" htmlType="submit" style={{ marginRight: 20 }} onClick={handleUpdateEvent}>
                        Save Changes
                    </Button>
                    <Button className="custom-antd-button" type="primary" htmlType="submit" onClick={handleSearchDonors}>Search Donors</Button>
                </Row>

            </Form>

            <div style={{ margin: '24px 0', borderBottom: '1px dashed grey' }}></div>
            <div style={{ marginTop: 24 }}>
                <h3>Possible Donors List based on selected location</h3>
                <Table
                    rowSelection={{
                        type: 'checkbox',
                        onChange: handleSelectedParticipants,
                    }}
                    dataSource={possibleParticipants}
                    columns={attendeeColumns}
                    pagination={false}
                    rowKey="id"
                />
                <Row justify="center" style={{ marginTop: 20 }}>
                    <Button 
                        className="custom-antd-button" 
                        type="primary" 
                        htmlType="submit" 
                        style={{ width: '300px' }}
                        onClick={handleUpdateAttendees}>
                        Replace Donors with Selected Ones
                    </Button>
                </Row>
            </div>

            <div style={{ margin: '24px 0', borderBottom: '1px dashed grey' }}></div>
            <div style={{ marginTop: 24 }}>
                <h3>Donors List</h3>
                <Table
                    rowSelection={{
                        type: 'checkbox',
                    }}
                    dataSource={participants}
                    columns={attendeeColumns}
                    pagination={false}
                    rowKey="id"
                />
                <Row justify="center" style={{ marginTop: 20 }}>
                    <Button 
                        className="custom-antd-button" 
                        type="primary" 
                        htmlType="submit" 
                        style={{ width: '300px' }}
                        onClick={handleDelete}>
                        Delete Selected Donors
                    </Button>
                    <Button className="custom-antd-button" id="cancel-button" style={{ marginLeft: 20 }} onClick={handleCancel}>
                        Cancel
                    </Button>
                </Row>
            </div>



            {/* Participants List Section */}
            {/* <div style={{ margin: '24px 0', borderBottom: '1px dashed grey' }}></div>
            <div style={{ marginTop: 24 }}>
                <h3>Participants List</h3>
                <Table
                    rowSelection={{
                        type: 'checkbox',
                        onChange: handleSelectedParticipants,
                    }}
                    dataSource={participants}
                    columns={columns}
                    rowKey="id"
                />
            </div>

            <Row justify="center" gutter={16} style={{ marginTop: 16 }}>
                <Col>
                    <Button className="custom-antd-button" type="primary" onClick={handleUpdateEvent}>Update Event</Button>
                </Col>
                <Col>
                    <Button className="custom-antd-button" id="cancel-button" onClick={handleCancel}>Cancel</Button>
                </Col>
            </Row> */}
        </>
    );
};
export default EventDetails;