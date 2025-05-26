import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Table, Popconfirm } from 'antd';
import { FilterOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { columns, cityNames, topicNames } from '../../assets/EventFields';
import dayjs from 'dayjs';
import '../../css/GeneralStyles.css';
import { API_BASE_URL } from '../../config';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import DonorFilterPanel from "./DonorFilterPanel";

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

interface Event {
    id: string;
    name: string;
    date: dayjs.ConfigType;
    location: string;
    size: number;
    description?: string;
    topic: string;
    attendees: Participant[];
    sharedRoleIds?: number[];
}

const communicationOptions = [
    { label: 'Holiday Card', value: 'Holiday_Card' },
    { label: 'Survey', value: 'Survey' },
    { label: 'Event', value: 'Event' },
    { label: 'Thank You', value: 'Thank_you' },
    { label: 'Newsletter', value: 'Newsletter' },
    { label: 'Research Update', value: 'Research_update' }
];

const EventDetails: React.FC = () => {
    const [form] = Form.useForm();
    const { id: eventId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event>();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [selectedParticipantDetails, setSelectedParticipantDetails] = useState<Participant[]>([]);
    const [originalParticipantIds, setOriginalParticipantIds] = useState<number[]>([]);
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

    // Fetch roles
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/roles`);
                const fetchedRoles = response.data;
                setRoles(fetchedRoles);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, []);

    // Apply filters to participants
    useEffect(() => {
        let filtered = [...participants];

        if (filters.cities.length > 0) {
            filtered = filtered.filter(p => filters.cities.includes(p.city));
        }

        filtered = filtered.filter(p => {
            return p.totalDonations >= filters.donationRange[0] && 
                   p.totalDonations <= filters.donationRange[1];
        });

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
            
            const requestBody: any = {};
            
            if (applyFilters) {
                if (filters.cities.length > 0) {
                    requestBody.cities = filters.cities;
                } else if (baseCity) {
                    requestBody.cities = [baseCity];
                }
                
                requestBody.minTotalDonations = filters.donationRange[0];
                requestBody.maxTotalDonations = filters.donationRange[1];
                
                if (filters.communicationPreferences.length > 0) {
                    requestBody.communicationPreferences = filters.communicationPreferences;
                }
            } else {
                requestBody.cities = [baseCity];
                requestBody.minTotalDonations = 0;
                requestBody.maxTotalDonations = 20;
            }

            const response = await axios.post(`${API_BASE_URL}/donors/search`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.status === 200) {
                const data = response.data;
                const transformedData = transformData(data);
                setParticipants(transformedData);
                
                // Keep original participants selected
                const newlySelectedIds = transformedData
                    .filter(p => originalParticipantIds.includes(p.id))
                    .map(p => p.id);
                
                setSelectedParticipants(prev => {
                    const combined = Array.from(new Set([...prev, ...newlySelectedIds]));
                    return combined;
                });
                
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

    const handleSearchDonors = async () => {
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
    const saveDonorsToEvent = async (donors: Participant[], eventId: string) => {
        try {
            const donorIds = donors.map(d => d.id);

            const response = await fetch(`${API_BASE_URL}/donors/savetoevent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: parseInt(eventId),
                    donorIds,
                }),
            });

            if (response.ok) {
                message.success('Donors updated successfully');
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to save donors: ${errorText}`);
            }
        } catch (error: any) {
            message.error(`Error saving donors: ${error.message}`);
        }
    };

    // Handle updating the event and attendees
    const handleUpdateEvent = async () => {
        if (selectedParticipants.length === 0) {
            message.error('No participants selected. Please search and select donors first.');
            return;
        }

        try {
            const eventDetails = await form.validateFields();

            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
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

            const updatedEvent = await response.json();
            setEvent(updatedEvent);
            message.success('Event updated successfully');

            const selectedDonors = filteredParticipants.filter(p =>
                selectedParticipants.includes(p.id)
            );

            await saveDonorsToEvent(selectedDonors, eventId!);

        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(`Error updating the event: ${error.message}`);
            } else {
                message.error('An unknown error occurred');
            }
        }
    };

    const handleDeleteEvent = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/events/${eventId}`);

            if (response.status === 204) {
                message.success('Event deleted successfully');
                navigate('/view-event');
            } else {
                throw new Error('Failed to delete event');
            }
        } catch (error: any) {
            message.error(error.message);
        }
    };

    const handleCancel = () => {
        navigate('/view-event');
    };

    // Fetch event details by eventId in the URL
    useEffect(() => {
        const fetchEvent = async (eventId: string) => {
            try {
                const response = await axios.get<Event>(`${API_BASE_URL}/events/${eventId}`);
                const eventData = response.data;
                setEvent(eventData);
                
                // Set form values
                form.setFieldsValue({
                    name: eventData.name,
                    topic: eventData.topic,
                    date: eventData.date ? dayjs(eventData.date) : null,
                    size: eventData.size,
                    location: eventData.location,
                    description: eventData.description,
                });

                // Set selected roles
                if (eventData.sharedRoleIds) {
                    setSelectedRoleIds(eventData.sharedRoleIds);
                }

                // Fetch current attendees and set them as selected
                const attendeesResponse = await axios.get<Participant[]>(`${API_BASE_URL}/events/${eventId}/attendees`);
                const currentAttendees = attendeesResponse.data;
                const attendeeIds = currentAttendees.map(a => a.id);
                
                setOriginalParticipantIds(attendeeIds);
                setSelectedParticipants(attendeeIds);
                
                // Auto-fetch donors for the event location
                if (eventData.location) {
                    await fetchData(eventData.location);
                }
                
            } catch (error) {
                console.error('Failed to fetch event:', error);
                message.error('Failed to load event details');
            }
        };

        if (eventId) {
            fetchEvent(eventId);
        }
    }, [eventId]);

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left Panel - Event Form */}
            <div className="lg:col-span-2 sticky top-8">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
                    <div className="mb-6">
                        <h4 className="text-xl font-semibold mb-1 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                            Edit Event Details
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
                                    onChange={(value) => {
                                        // Auto-search when location changes
                                        fetchData(value);
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
                                onClick={handleUpdateEvent}
                                disabled={selectedParticipants.length === 0}
                                className="bg-gradient-45-indigo-purple text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
                            >
                                <SaveOutlined />
                                Update Event
                            </button>
                            <Popconfirm
                                title="Delete Event"
                                description="Are you sure you want to delete this event? This action cannot be undone."
                                onConfirm={handleDeleteEvent}
                                okText="Yes, Delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                            >
                                <button
                                    type="button"
                                    className="w-full bg-rose-400 hover:bg-rose-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300">
                                    <DeleteOutlined />
                                    Delete Event
                                </button>
                            </Popconfirm>
                        </div>

                        {/* Delete Event Button */}
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
                    
                    {/* Filter panel */}
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
                                    {loading ? 'Searching for donors...' : 'Donors will appear here when you select a location'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;