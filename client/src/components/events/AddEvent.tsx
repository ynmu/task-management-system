import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Row, Col, Table, Card, Typography, Divider, Slider, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { columns, cityNames, topicNames } from "../../assets/EventFields";
import '../../css/GeneralStyles.css';
import { API_BASE_URL } from '../../config';
import { useAuth }  from '../../context/AuthContext';
import axios from 'axios';
import { saveAs } from 'file-saver';
import DonorFilterPanel from "./DonorFilterPanel";

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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left Panel - Event Form */}
            <div className="lg:col-span-2 sticky top-8">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold mb-1 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                        Event Details
                      </h4>
                      {filteredParticipants.length > 0 && (
                          <span className="text-blue-400 text-sm font-medium">
                              {filteredParticipants.length} donors found
                          </span>
                      )}
                    </div>

                    <Form form={form} layout="vertical" className="space-y-2">
                        {/* Role Selection */}
                        <Form.Item label={<span className="text-gray-800 font-medium">Share Access With Roles</span>}>
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
                                className="w-full"
                                style={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                    borderColor: 'rgba(255, 255, 255, 0.4)',
                                    borderRadius: '12px'
                                }}
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
                            label={<span className="text-gray-800 font-medium">Event Name</span>}
                            name="name"
                            rules={[{ required: true, message: 'Please enter the event name' }]}
                        >
                            <Input 
                                placeholder="Enter event title" 
                                className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                            />
                        </Form.Item>

                        {/* Event Date and Topic */}
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                label={<span className="text-gray-800 font-medium">Event Date</span>}
                                name="date"
                                rules={[{ required: true, message: 'Please enter the event date' }]}
                            >
                                <DatePicker 
                                    className="w-full bg-white/5 border-white/10 text-white rounded-xl h-12" 
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span className="text-gray-800 font-medium">Event Topic</span>}
                                name="topic"
                                rules={[{ required: true, message: 'Please select a category' }]}
                            >
                                <Select 
                                    placeholder="Select a category"
                                    className="w-full"
                                    style={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    {topicNames.map(topic => (
                                        <Select.Option key={topic} value={topic}>
                                            {topic}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        {/* Event Size and Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                label={<span className="text-gray-800 font-medium">Event Size</span>}
                                name="size"
                                rules={[{ required: true, message: 'Please enter the event size' }]}
                            >
                                <InputNumber 
                                    min={1} 
                                    placeholder="Max participants" 
                                    className="!w-full bg-white/5 border-white/10 text-white rounded-xl h-12"
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span className="text-gray-800 font-medium">Location</span>}
                                name="location"
                                rules={[{ required: true, message: 'Please select a location' }]}
                            >
                                <Select 
                                    placeholder="Select a location"
                                    className="w-full"
                                    style={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    {cityNames.map(city => (
                                        <Select.Option key={city} value={city}>
                                            {city}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        {/* Event Description */}
                        <Form.Item label={<span className="text-gray-800 font-medium">Event Description</span>} name="description">
                            <Input.TextArea 
                                rows={4} 
                                placeholder="Enter event description" 
                                className="bg-white/5 border-white/10 text-white rounded-xl"
                            />
                        </Form.Item>

                        {/* Selected Participants Summary */}
                        {selectedParticipants.length > 0 && (
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
                                <span className="text-gray-500 font-medium">
                                    Selected Participants: {selectedParticipants.length}
                                </span>
                                <button 
                                    onClick={clearSelectedParticipants}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={handleSaveEvent}
                                disabled={selectedParticipants.length === 0}
                                className="bg-gradient-45-indigo-purple text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none"
                            >
                                Save Event
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-500 border border-white/10 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-300"
                            >
                                Clear Filter
                            </button>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Right Panel - Donors List */}
          <div className="lg:col-span-3 flex flex-col">
              <div className="bg-black rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex-1">
                    {/* Header */}
                    <div className="bg-gradient-45-indigo-purple p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-white text-xl font-semibold">Available Donors</h3>
                            {filteredParticipants.length > 0 && (
                                <span className="text-white/80 text-sm">{filteredParticipants.length} found</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedParticipants.length > 0 && (
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
                                    <span className="text-white text-sm font-medium">
                                        {selectedParticipants.length} selected
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                    showFilters 
                                        ? 'bg-white text-blue-600' 
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                <FilterOutlined />
                                Filters
                            </button>
                        </div>
                    </div>
                    
                    {/* filter panel */}
                    {showFilters && <DonorFilterPanel
                      show={showFilters}
                      setShow={setShowFilters}
                      filters={filters}
                      setFilters={setFilters}
                      cityNames={cityNames}
                      communicationOptions={communicationOptions}
                      loading={loading}
                      onApply={handleApplyFilters}
                      onClear={handleClearFilters}
                    />}

                    {/* Table Container */}
                    <div className="relative bg-black">
                        {filteredParticipants.length > 0 ? (
                            <div className="overflow-hidden bg-white">
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
                                        y: 'calc(100vh - 350px)'
                                    }}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showQuickJumper: true,
                                        showTotal: (total, range) => 
                                            `${range[0]}-${range[1]} of ${total} donors`,
                                        style: {
                                            width: 'calc(100% - 18px)',
                                            color: 'black',
                                            backgroundColor: 'rgb(255, 255, 255)',
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        }
                                    }}
                                    className="custom-dark-table"
                                    style={{
                                        backgroundColor: 'transparent',
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-12">
                                <div className="text-6xl mb-4 opacity-50">📋</div>
                                <p className="text-gray-400 text-lg">
                                    {loading ? 'Searching for donors...' : 'Search for donors to see available participants'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
  );
};

export default AddEvent;