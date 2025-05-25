import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Row, Col, Table, Card, Typography, Divider, Slider, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { columns, cityNames, topicNames } from "../../assets/EventFields";
import '../../css/GeneralStyles.css';
import { API_BASE_URL } from '../../config';
import { useAuth }  from '../../context/AuthContext';
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

type DonorFilters = {
    cities: string[];
    donationRange: [number, number];
    communicationPreferences: string[];
};

const communicationOptions = [
    { label: 'Holiday Card', value: 'Holiday_Card' },
    { label: 'Survey', value: 'Survey' },
    { label: 'Event', value: 'Event' },
    { label: 'Thank You', value: 'Thank_you' },
    { label: 'Newsletter', value: 'Newsletter' },
    { label: 'Research Update', value: 'Research_update' }
];

const AddEvent: React.FC = () => {
    const [form] = Form.useForm();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [selectedParticipantDetails, setSelectedParticipantDetails] = useState<Participant[]>([]);
    const [roles, setRoles] = useState<{ id: number; roleName: string }[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<DonorFilters>({
        cities: [],
        donationRange: [0, 20],
        communicationPreferences: []
    });
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

    // Apply filters to participants
    useEffect(() => {
        let filtered = [...participants];

        // Filter by cities
        if (filters.cities.length > 0) {
            filtered = filtered.filter(p => filters.cities.includes(p.city));
        }

        // Filter by donation range
        filtered = filtered.filter(p => {
            return p.totalDonations >= filters.donationRange[0] && 
                   p.totalDonations <= filters.donationRange[1];
        });

        // Note: Communication preference filtering would need to be added to the participant data
        // For now, we'll skip this filter as it's not in the current data structure

        setFilteredParticipants(filtered);
    }, [participants, filters]);

    // Data transformation
    const transformData = (data: any[]): Participant[] => {
      return data.map((item) => ({
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        fullName: `${item.firstName} ${item.lastName}`,
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
    
    // Fetch participants with filters
    const fetchData = async (baseCity: string, applyFilters = false) => {
      try {
          setLoading(true);
          
          // Build request body
          const requestBody: any = {};
          
          if (applyFilters) {
              // Use filter cities if available, otherwise use base city
              if (filters.cities.length > 0) {
                  requestBody.cities = filters.cities;
              } else if (baseCity) {
                  requestBody.cities = [baseCity];
              }
              
              // Add donation range - always include both bounds to avoid undefined upper bound
              requestBody.minTotalDonations = filters.donationRange[0];
              requestBody.maxTotalDonations = filters.donationRange[1];
              
              // Add communication preferences
              if (filters.communicationPreferences.length > 0) {
                  requestBody.communicationPreferences = filters.communicationPreferences;
              }
          } else {
              requestBody.cities = [baseCity];
              // Set default donation range bounds when not applying filters
              requestBody.minTotalDonations = 0;
              requestBody.maxTotalDonations = 20;
          }

          console.log('Request body:', requestBody); // Debug log

          const response = await axios.post(`${API_BASE_URL}/donors/search`, requestBody, {
              headers: {
                  'Content-Type': 'application/json',
              },
          });
          
          console.log('Response:', response);
          if (response.status === 200) {
              const data = response.data;
              const transformedData = transformData(data);
              setParticipants(transformedData);
              message.success(`Found ${transformedData.length} donors`);
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

    const handleApplyFilters = async () => {
        const values = form.getFieldsValue(['location']);
        if (values.location || filters.cities.length > 0) {
            await fetchData(values.location, true);
        } else {
            message.warning('Please select a location first or choose cities in the filter.');
        }
    };

    const handleClearFilters = () => {
        setFilters({
            cities: [],
            donationRange: [0, 20],
            communicationPreferences: []
        });
        // Re-fetch with original location
        const values = form.getFieldsValue(['location']);
        if (values.location) {
            fetchData(values.location);
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
    
        const selectedDonors = filteredParticipants.filter(p =>
          selectedParticipants.includes(p.id)
        );
    
        await saveDonorsToEvent(selectedDonors, newEvent.id);
    
        form.resetFields();
        setSelectedParticipants([]);
        setSelectedParticipantDetails([]);
        setParticipants([]);
        setFilteredParticipants([]);
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
        setFilteredParticipants([]);
        setSelectedParticipants([]);
        setSelectedParticipantDetails([]);
        setFilters({
            cities: [],
            donationRange: [0, 20],
            communicationPreferences: []
        });
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

                        {/* Save Event Button */}
                        <Form.Item>
                            <Button 
                                className="custom-antd-button" 
                                type="primary" 
                                block
                                loading={loading}
                                onClick={handleSaveEvent}
                                disabled={selectedParticipants.length === 0}
                            >
                                Save Event
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
                                Available Donors {filteredParticipants.length > 0 && `(${filteredParticipants.length})`}
                            </Title>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {selectedParticipants.length > 0 && (
                                    <Text type="secondary">
                                        {selectedParticipants.length} selected
                                    </Text>
                                )}
                                <Button
                                    icon={<FilterOutlined />}
                                    onClick={() => setShowFilters(!showFilters)}
                                    type={showFilters ? 'primary' : 'default'}
                                    size="small"
                                >
                                    Filters
                                </Button>
                            </div>
                        </div>
                    }
                    style={{ height: '100%' }}
                    bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'hidden', position: 'relative' }}
                >
                    {/* Floating Filter Panel */}
                    {showFilters && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 10,
                            background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
                            border: '1px solid #e8f4fd',
                            borderRadius: '12px',
                            padding: '20px',
                            margin: '16px',
                            boxShadow: '0 8px 32px rgba(24, 144, 255, 0.12), 0 2px 8px rgba(24, 144, 255, 0.08)',
                            backdropFilter: 'blur(8px)',
                        }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                    <FilterOutlined style={{ marginRight: '8px' }} />
                                    Filter Donors
                                </Text>
                            </div>
                            
                            <Row gutter={16} style={{ marginBottom: '16px' }}>
                                <Col span={8}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <Text strong>Cities</Text>
                                    </div>
                                    <Select
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        placeholder="Select cities"
                                        value={filters.cities}
                                        onChange={(cities) => setFilters(prev => ({ ...prev, cities }))}
                                        maxTagCount="responsive"
                                    >
                                        {cityNames.map(city => (
                                            <Select.Option key={city} value={city}>
                                                {city}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Col>
                                
                                <Col span={8}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <Text strong>Total Donations</Text>
                                    </div>
                                    <div style={{ padding: '0 8px' }}>
                                        <Slider
                                            range
                                            min={0}
                                            max={20}
                                            step={1}
                                            value={filters.donationRange}
                                            onChange={(range) => setFilters(prev => ({ ...prev, donationRange: range as [number, number] }))}
                                            marks={{ 0: '0', 10: '10', 20: '20' }}
                                        />
                                    </div>
                                </Col>
                                
                                <Col span={8}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <Text strong>Communication Preferences</Text>
                                    </div>
                                    <Select
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        placeholder="Select preferences"
                                        value={filters.communicationPreferences}
                                        onChange={(prefs) => setFilters(prev => ({ ...prev, communicationPreferences: prefs }))}
                                        maxTagCount="responsive"
                                    >
                                        {communicationOptions.map(option => (
                                            <Select.Option key={option.value} value={option.value}>
                                                {option.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                            
                            <Space>
                                <Button 
                                    type="primary" 
                                    onClick={handleApplyFilters}
                                    loading={loading}
                                    style={{
                                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
                                    }}
                                >
                                    Apply Filters
                                </Button>
                                <Button 
                                    icon={<ClearOutlined />} 
                                    onClick={handleClearFilters}
                                    style={{
                                        borderRadius: '6px'
                                    }}
                                >
                                    Clear All
                                </Button>
                                <Button 
                                    type="text" 
                                    onClick={() => setShowFilters(false)}
                                    style={{ color: '#8c8c8c' }}
                                >
                                    Close
                                </Button>
                            </Space>
                        </div>
                    )}

                    {/* Table Container */}
                    <div style={{
                        height: '100%',
                        position: 'relative'
                    }}>
                        {filteredParticipants.length > 0 ? (
                            <Table
                                rowSelection={{
                                    type: 'checkbox',
                                    selectedRowKeys: selectedParticipants,
                                    onChange: handleSelectedParticipants,
                                }}
                                dataSource={filteredParticipants}
                                columns={columns}
                                rowKey="id"
                                scroll={{ 
                                    x: 700,
                                    y: 'calc(100vh - 200px)'
                                }}
                                pagination={{
                                    pageSize: 15,
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
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default AddEvent;