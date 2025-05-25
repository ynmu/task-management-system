import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Row, Col, Table, Card, Typography, Divider } from 'antd';
import { columns, cityNames, topicNames } from "../assets/AddEventTable";
import './GeneralStyles.css';
import { API_BASE_URL } from '../config';
import { useAuth }  from '../context/AuthContext';
import axios from 'axios';
import { saveAs } from 'file-saver';

const { Title, Text } = Typography;

// Function to download an Excel file
const downloadFile = (data: any) => {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  saveAs(blob, 'exported-file.xlsx');
};

type Participant = {
    id: number;
    firstName: string;
    lastName: string;
    organizationName?: string;
    totalDonations: number;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    pmm: string;
    smm: string;
    vmm: string;
};

const AddEvent: React.FC = () => {
    const [form] = Form.useForm();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [selectedParticipantDetails, setSelectedParticipantDetails] = useState<Participant[]>([]);
    const [roles, setRoles] = useState<{ id: number; roleName: string }[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/users/roles`);
          const fetchedRoles = response.data;
          setRoles(fetchedRoles);

          // Ensure user's own role is selected
          if (user?.roleId) {
            setSelectedRoleIds(prev =>
              prev.includes(user.roleId) ? prev : [...prev, user.roleId]
            );
          }
        } catch (error) {
          console.error('Error fetching roles:', error);
        }
      };

      fetchRoles();
    }, [user?.roleId]);

    // Data transformation
    const transformData = (data: any[]): Participant[] => {
      return data.map((item) => ({
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        organizationName: item.organizationName || '',
        totalDonations: item.totalDonations,
        addressLine1: item.addressLine1,
        addressLine2: item.addressLine2 || '',
        city: item.city,
        pmm: item.pmm || '',
        smm: item.smm || '',
        vmm: item.vmm || '',
      }));
    };
    
    // Fetch participants
    const fetchData = async (city: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/donors?city=${city}`);
            console.log('Response:', response);
            if (response.status === 200) {
                const data = response.data;
                const transformedData = transformData(data);
                setParticipants(transformedData);
                message.success(`Found ${transformedData.length} donors in ${city}`);
            } else {
                throw new Error('Failed to fetch participants');
            }
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields(['location', 'size']);
            await fetchData(values.location);
        } catch (error) {
            message.error('Failed to fetch the participants list. Please ensure the form is valid.');
        }
    };

    // Handle selection of participants
    const handleSelectedParticipants = (selectedRowKeys: React.Key[], selectedRows: Participant[]) => {
        const selectedIds = selectedRows.map(row => row.id);
        setSelectedParticipants(selectedIds);
        setSelectedParticipantDetails(selectedRows);
    };

    // Clear selected participants
    const clearSelectedParticipants = () => {
        setSelectedParticipants([]);
        setSelectedParticipantDetails([]);
        message.success('Selected participants cleared.');
    };

    // Save donors as part of the event
    const saveDonorsToEvent = async (donors: Participant[], eventId: number) => {
      try {
        const donorIds = donors.map(d => d.id);

        const response = await fetch(`${API_BASE_URL}/donors/savetoevent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId,
            donorIds,
          }),
        });
    
        if (response.ok) {
          message.success('Donors saved to event successfully');
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to save donors: ${errorText}`);
        }
      } catch (error: any) {
        message.error(`Error saving donors: ${error.message}`);
      }
    };
    
    // Handle saving the event and attendees
    const handleSaveEvent = async () => {
      if (selectedParticipants.length === 0) {
        message.error('No participants selected. Please search and select donors first.');
        return;
      }
    
      try {
        const eventDetails = await form.validateFields();
    
        const response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...eventDetails,
            sharedRoleIds: selectedRoleIds,
          }),
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save event: ${errorText}`);
        }
    
        const newEvent = await response.json();
        message.success('Event saved successfully');
    
        const selectedDonors = participants.filter(p =>
          selectedParticipants.includes(p.id)
        );
    
        await saveDonorsToEvent(selectedDonors, newEvent.id);
    
        form.resetFields();
        setSelectedParticipants([]);
        setSelectedParticipantDetails([]);
        setParticipants([]);
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(`Error saving the event: ${error.message}`);
        } else {
          message.error('An unknown error occurred');
        }
      }
    };
    
    const handleCancel = () => {
        form.resetFields();
        setParticipants([]);
        setSelectedParticipants([]);
        setSelectedParticipantDetails([]);
    };

    return (
        <Row gutter={24} style={{ height: '100vh', padding: '24px' }}>
            {/* Left Panel - Event Form */}
            <Col span={10}>
                <Card 
                    title={<Title level={3}>Create New Event</Title>}
                    style={{ height: '100%', overflow: 'auto' }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        {/* Role Selection */}
                        <Form.Item label="Share Access With Roles">
                            <Select
                                mode="multiple"
                                value={selectedRoleIds}
                                onChange={(ids) => {
                                    if (user?.roleId && !ids.includes(user.roleId)) {
                                        message.warning("You cannot remove your own role from the event.");
                                        return;
                                    }
                                    setSelectedRoleIds(ids);
                                }}
                                placeholder="Select roles to share event with"
                            >
                                {roles.map(role => (
                                    <Select.Option key={role.id} value={role.id}>
                                        {role.roleName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Event Name */}
                        <Form.Item
                            label="Event Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter the event name' }]}
                        >
                            <Input placeholder="Enter event title" />
                        </Form.Item>

                        {/* Event Date and Topic */}
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
                                        {topicNames.map(topic => (
                                            <Select.Option key={topic} value={topic}>
                                                {topic}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Event Size and Location */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Event Size"
                                    name="size"
                                    rules={[{ required: true, message: 'Please enter the event size' }]}
                                >
                                    <InputNumber min={1} style={{ width: '100%' }} placeholder="Max participants" />
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

                        {/* Event Description */}
                        <Form.Item label="Event Description" name="description">
                            <Input.TextArea rows={4} placeholder="Enter event description" />
                        </Form.Item>

                        {/* Search Button */}
                        <Form.Item>
                            <Button 
                                className="custom-antd-button" 
                                type="primary" 
                                block
                                loading={loading}
                                onClick={handleSubmit}
                            >
                                Search Donors
                            </Button>
                        </Form.Item>

                        <Divider />

                        {/* Selected Participants Summary */}
                        {selectedParticipants.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <Text strong>Selected Participants: {selectedParticipants.length}</Text>
                                <Button 
                                    type="link" 
                                    size="small" 
                                    onClick={clearSelectedParticipants}
                                    style={{ marginLeft: 8 }}
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Button 
                                    className="custom-antd-button" 
                                    type="primary" 
                                    block
                                    onClick={handleSaveEvent}
                                    disabled={selectedParticipants.length === 0}
                                >
                                    Save Event
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button 
                                    className="custom-antd-button" 
                                    id="cancel-button" 
                                    block
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </Col>

            {/* Right Panel - Donors List */}
            <Col span={14}>
                <Card 
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={3} style={{ margin: 0 }}>
                                Available Donors {participants.length > 0 && `(${participants.length})`}
                            </Title>
                            {selectedParticipants.length > 0 && (
                                <Text type="secondary">
                                    {selectedParticipants.length} selected
                                </Text>
                            )}
                        </div>
                    }
                    style={{ height: '100%' }}
                    bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'hidden' }}
                >
                    {participants.length > 0 ? (
                        <Table
                            rowSelection={{
                                type: 'checkbox',
                                selectedRowKeys: selectedParticipants,
                                onChange: handleSelectedParticipants,
                            }}
                            dataSource={participants}
                            columns={columns}
                            rowKey="id"
                            scroll={{ 
                                x: 1200, // Enable horizontal scrolling with minimum width
                                y: 'calc(100vh - 200px)' 
                            }}
                            pagination={{
                                pageSize: 20,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => 
                                    `${range[0]}-${range[1]} of ${total} donors`,
                            }}
                        />
                    ) : (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '100%',
                            flexDirection: 'column',
                            color: '#999'
                        }}>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                {loading ? 'Searching for donors...' : 'Search for donors to see available participants'}
                            </Text>
                        </div>
                    )}
                </Card>
            </Col>
        </Row>
    );
};

export default AddEvent;