import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Row, Col, Table, Popconfirm } from 'antd';
import { columns, cityNames, topicNames, attendeeColumns } from '../../assets/EventFields';
import dayjs from 'dayjs';
import '../../css/GeneralStyles.css';
import { API_BASE_URL } from '../../config';
import axios from 'axios';
import { useParams } from 'react-router-dom';


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
    date: dayjs.ConfigType;
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
            const response = await axios.get(`${API_BASE_URL}/donors/?city=${city}`);
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
    const updateAttendees = async (attendees: Participant[], eventId: string) => {
        try {
            // // Log the attendees array to inspect its structure
            // console.log('Attendees array that is used to replace original attendees:', attendees);
    
            // Delete existing attendees
            const deleteResponse = await fetch(`${API_BASE_URL}/attendees/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                throw new Error(`Failed to delete existing attendees: ${errorText}`);
            }
    
            // Prepare the request body for adding new attendees
            const requestAttendees = attendees.map(attendee => ({
                firstName: attendee.firstName || '',
                lastName: attendee.lastName || '',
                organization: attendee.organizationName || null,
                totalDonations: attendee.totalDonations,
                address1: attendee.addressLine1 || null,
                address2: attendee.addressLine2 || null,
                city: attendee.city || null,
                pmm: attendee.pmm || null,
                smm: attendee.smm || null,
                vmm: attendee.vmm || null,
                eventId: Number(eventId), // Ensure eventId is correctly set
            }));
    
            // // Add a console log to inspect request body
            // console.log('Request Body for Attendees:', requestAttendees); 
    
            // Add new attendees
            const postResponse = await axios.post(`${API_BASE_URL}/attendees`, requestAttendees);
    
            // // Await the response JSON
            // console.log('Response after connecting with POST API endpoint:', postResponse);

            setParticipants(attendees);
    
            if (postResponse.status === 200 || postResponse.status === 201) {
                message.success('Attendees updated successfully');
            } else {
                const errorText = postResponse.data.error;
                throw new Error(`Failed to update attendees: ${errorText}`);
            }
        } catch (error: any) {
            message.error(`Error updating attendees: ${error.message}`);
        }
    };

    // Handle updating the event details except the attendees
    const handleUpdateEvent = async () => { 
        try {
            const eventDetails = await form.validateFields(['name', 'date', 'topic', 'size', 'location', 'description']);
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
            setEvent(newEvent);
            message.success('Event updated successfully');
            // form.resetFields();
        } catch (error: unknown) {
            if (error instanceof Error) {
              message.error(`Error saving the event: ${error.message}`);
            } else {
              message.error('An unknown error occurred');
            }
          }
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
                form.setFieldsValue({
                    name: response.data.name,
                    topic: response.data.topic,
                    date: response.data.date ? dayjs(response.data.date) : null,
                    size: response.data.size,
                    location: response.data.location,
                    description: response.data.description,
                    eventId: eventId,
                });
            } catch (error) {
                console.error('Failed to fetch this event:', error);
            }
        };
        if (eventId) {
            fetchEvents(eventId);
        }
    }, [eventId]);

    // Fetch participants by eventId
    useEffect(() => {
        const fetchParticipates = async (eventId: string) => {
                try {
                    const response = await axios.get<any[]>(`${API_BASE_URL}/attendees/${eventId}`);
                    setParticipants(response.data);
                } catch (error) {
                    console.error('Failed to fetch participants names:', error);
                }
            };
            if (eventId) {
                fetchParticipates(eventId);
            }
        }, [event]);
    
    const handleReset = () => {
        form.resetFields();
        setPossibleParticipants([]);
    };

    const handleDeleteEvent = async () => {
        // Confirm the deletion
        const confirm = window.confirm('Are you sure you want to delete this event?');
        if (!confirm) {
            return;
        }

        try {
            // Make the DELETE request
            const response = await axios.delete(`${API_BASE_URL}/events/${eventId}`);
    
            // Update the frontend state based on the response
            if (response.status === 204) {
                message.success('Event deleted successfully');
            } else {
                throw new Error('Failed to delete event');
            }

            // Redirect to the events page
            window.location.href = '/view-event';
        } catch (error: any) {
            message.error(error.message);
        }
    }

return (
        <>
            <Form
                form={form}
                layout="vertical"
                style={{ maxWidth: 600, margin: '0 auto' }}
                initialValues={{
                    name: event?.name, 
                    topic: event?.topic, 
                    date: event?.date ? dayjs(event.date) : null, // Ensure date is a dayjs object
                    size: event?.size,
                    location: event?.location,
                    description: event?.description,
                    eventId: eventId,
                }}
            >
                {/* Form Edit Section */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            label="Event ID" 
                            name="eventId"
                            >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Event Name"
                            name="name"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Event Date"
                            name="date"
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Event Topic"
                            name="topic"
                        >
                            <Select>
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
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Location"
                            name="location"
                        >
                            <Select> 
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
                    <Input.TextArea />
                </Form.Item>
                <Row justify="center" style={{ marginTop: 16 }}>
                    <Button className="custom-antd-button" type="primary" htmlType="submit" style={{ marginRight: 20 }} onClick={handleUpdateEvent}>
                        Save Changes
                    </Button>
                    <Button className="custom-antd-button" type="primary" htmlType="submit" onClick={handleSearchDonors}>Search Donors</Button>
                    <Button className="custom-antd-button" id="cancel-button" style={{ marginLeft: 20 }} onClick={handleReset}>
                        Reset
                    </Button>
                    <Button className="custom-antd-button" id="delete-button" style={{ marginLeft: 20, backgroundColor: '#b33e4a', color: 'white' }} onClick={handleDeleteEvent}>
                        Delete Event
                    </Button>
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
                        onClick={() => {
                            const selectedAttendees = selectedParticipants.map(id => {
                                const participant = possibleParticipants.find(p => p.id === id);
                                if (!participant) {
                                    console.error(`Participant with ID ${id} not found`);
                                }
                                return participant;
                            }).filter((p): p is Participant => p !== undefined); // Type guard to filter out undefined values
            
                            console.log('Selected Attendees:', selectedAttendees);
            
                            if (eventId) {
                                updateAttendees(selectedAttendees, eventId);
                            } else {
                                console.error('Event ID is undefined');
                            }
                        }}>
                        Replace Donors with Selected Ones
                    </Button>
                </Row>
            </div>

            <div style={{ margin: '24px 0', borderBottom: '1px dashed grey' }}></div>
            <div style={{ marginTop: 24 }}>
                <h3>Donors List</h3>
                <Table
                    // rowSelection={{
                    //     type: 'checkbox',
                    // }}
                    dataSource={participants}
                    columns={attendeeColumns}
                    pagination={false}
                    rowKey="id"
                />
            </div>
        </>
    );
};
export default EventDetails;