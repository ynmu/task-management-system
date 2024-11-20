import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, InputNumber, message, Row, Col } from 'antd';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './GeneralStyles.css';
import { API_BASE_URL } from '../config';

const { Option } = Select;

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get event ID from URL params
  const [form] = Form.useForm();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false); // Track loading state
  const [roleId, setRoleId] = useState<number | null>(null); // State to store roleId

  useEffect(() => {
    if (!id) {
      message.error('Event ID is missing');
      return;
    }

    // Fetch the current user's roleId
    const fetchUserRole = async () => {
      try {
        const response = await axios.get('/api/users/me'); // Assuming this returns the current logged-in user
        const user = response.data;
        setRoleId(user.roleId); // Store the roleId
      } catch (error) {
        message.error('Failed to fetch user role');
      }
    };

    fetchUserRole();
  }, [id]);

  useEffect(() => {
    if (roleId === null) {
      return; // Wait until roleId is fetched
    }

    setLoading(true); // Start loading state

    // Fetch all events for the role once roleId is available
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events/role/${roleId}`);
        const events = response.data;

        // Ensure `id` is defined before using it in parseInt
        if (!id) {
          message.error('Event ID is missing');
          return;
        }

        // Find the event by ID in the fetched list of events
        const event = events.find((event: any) => event.id === parseInt(id, 10));

        if (event) {
          setEventData(event);
          form.setFieldsValue(event); // Set form values with fetched event data
        } else {
          message.error('Event not found');
        }
      } catch (error) {
        message.error('Failed to load events for the role');
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchEvents();
  }, [roleId, id, form]);

  const handleSubmit = async (values: any) => {
    if (!id) {
      message.error('Event ID is missing');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/events/${id}`, values);
      message.success('Event updated successfully');
    } catch (error) {
      message.error('Failed to update event');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading while fetching data
  }

  if (!eventData) {
    return <div>Error: Event not found.</div>; // Error if no event data
  }

  return (
    <Form form={form} onFinish={handleSubmit} initialValues={eventData}>
      <Form.Item label="Event Name" name="name" rules={[{ required: true, message: 'Please input the event name!' }]}>
        <Input placeholder="Enter event name" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea placeholder="Enter event description" />
      </Form.Item>

      <Form.Item label="Topic" name="topic">
        <Select placeholder="Select event topic">
          <Option value="topic1">Topic 1</Option>
          <Option value="topic2">Topic 2</Option>
          <Option value="topic3">Topic 3</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Size" name="size">
        <InputNumber placeholder="Enter event size" />
      </Form.Item>

      <Form.Item label="Date" name="date">
        <DatePicker placeholder="Select event date" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Location" name="location">
        <Input placeholder="Enter event location" />
      </Form.Item>

      <Form.Item label="Status" name="status">
        <Select placeholder="Select event status">
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </Form.Item>

      <Row justify="center" gutter={16} style={{ marginTop: 16 }}>
        <Col>
          <Button type="primary" htmlType="submit">Update Event</Button>
        </Col>
        <Col>
          <Button onClick={() => form.resetFields()} type="default">Cancel</Button>
        </Col>
      </Row>
    </Form>
  );
};

export default EditEvent;
