import React, { useState } from "react";
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Row, Col, Table } from 'antd';
import { columns, cityNames } from "../assets/AddEventTable";
import './GeneralStyles.css';
import { API_BASE_URL } from '../config';
import { useAuth }  from '../context/AuthContext';
import axios from 'axios';

const BC_CANCER_API = 'https://bc-cancer-faux.onrender.com/event';

type Participant = {
    id: number;
    firstName: string;
    lastName: string;
    organizationName: string;
    totalDonations: number;
    addressLine1: string;
    addressLine2: string;
    city: string;
    pmm: string;
    smm: string;
    vmm: string;
};

const AddEvent: React.FC = () => {
    const [form] = Form.useForm();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const { user } = useAuth();

    // Data transformation
    const transformData = (data: (string | number)[][]): Participant[] => {
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

    // Fetch participants
    const fetchData = async (city: string) => {
        try {
            const response = await axios.get(`${BC_CANCER_API}?cities=${city}&format=json`);
            console.log('Response:', response);
            if (response.status === 200) {
                const data = response.data;
                const transformedData = transformData(data.data);
                setParticipants(transformedData);
            } else {
                throw new Error('Failed to fetch participants');
            }
        } catch (error: any) {
            message.error(error.message);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields(['location', 'size']);
            await fetchData(values.location);
        } catch {
            message.error('Failed to fetch the participants list');
        }
    };

    // Handle selection of participants
    const handleSelectedParticipants = (selectedRowKeys: React.Key[], selectedRows: { id: number }[]) => {
        const selectedIds = selectedRows.map(row => row.id);
        setSelectedParticipants(selectedIds);
    };

    // Save attendees as part of the event
    const saveAttendees = async (attendees: Participant[], eventId: number) => {
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
    
            const response = await fetch(`${API_BASE_URL}/attendees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            if (response.ok) {
                message.success('Attendees saved successfully');
            } else {
                const errorText = await response.text(); // Read server response for more details
                throw new Error(`Failed to save attendees: ${errorText}`);
            }
        } catch (error: any) {
            message.error(`Error saving attendees: ${error.message}`);
        }
    };
    

    // Handle saving the event and attendees
    const handleSaveEvent = async () => {
        try {
            if (selectedParticipants.length === 0) {
                message.error('No participants have been selected.');
                return;
            }

            console.log('Selected Participants:', selectedParticipants);

            const eventDetails = await form.validateFields();
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...eventDetails,
                    roleId: user?.roleId || null
                }),
            });
            console.log('Event Details:', eventDetails, 'Role ID:', user?.roleId);

            if (response.ok) {
                const newEvent = await response.json();
                message.success('Event has been saved successfully');
                // Save selected attendees associated with the new event
                const attendeesToSave = participants.filter(p => selectedParticipants.includes(p.id));
                console.log('Attendees to Save:', attendeesToSave);
                await saveAttendees(attendeesToSave, newEvent.id);
                form.resetFields();
                setSelectedParticipants([]);
                setParticipants([]);
            } else {
                throw new Error('Response not OK');
            }
        } catch (error: any) {
            message.error(`Error saving the event: ${error.message}`);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setParticipants([]);
        setSelectedParticipants([]);
    };

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                style={{ maxWidth: 600, margin: '0 auto' }}
            >
                {/* Form Input Section */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Event ID" name="eventId">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Event Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter the event name' }]}
                        >
                            <Input placeholder="Enter event title" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Event Date"
                            name="date"
                            rules={[{ required: true, message: 'Please enter the event date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Event Topic"
                            name="topic"
                            rules={[{ required: true, message: 'Please select a category' }]}
                        >
                            <Select placeholder="Select a category">
                                <Select.Option value="1">General - Cancer Research</Select.Option>
                                <Select.Option value="2">Breast Cancer</Select.Option>
                                <Select.Option value="3">Gastric Cancer</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Event Size"
                            name="size"
                            rules={[{ required: true, message: 'Please enter the event size' }]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter max participants" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Location"
                            name="location"
                            rules={[{ required: true, message: 'Please select a location' }]}
                        >
                            <Select placeholder="Select a location">
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
                    <Input.TextArea placeholder="Enter event description" />
                </Form.Item>
                <Row justify="center" style={{ marginTop: 16 }}>
                    <Button className="custom-antd-button" type="primary" htmlType="submit" onClick={handleSubmit}>Search Donors</Button>
                </Row>
            </Form>

            {/* Participants List Section */}
            <div style={{ margin: '24px 0', borderBottom: '1px dashed grey' }}></div>
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
                    <Button className="custom-antd-button" type="primary" onClick={handleSaveEvent}>Save Event</Button>
                </Col>
                <Col>
                    <Button className="custom-antd-button" id="cancel-button" onClick={handleCancel}>Cancel</Button>
                </Col>
            </Row>
        </>
    );
};

export default AddEvent;
