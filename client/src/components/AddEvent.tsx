import React, { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, Select, TimePicker, message, Row, Col, InputNumber, Table } from 'antd';
import { columns, cityNames } from "../assets/AddEventTable";
import './GeneralStyles.css';


const AddEvent: React.FC = () => {
    const [form] = Form.useForm();
    const [criteria, setCriteria] = useState<string>('location');
    const [size, setSize] = useState<number>(0);
    const [participants, setParticipants] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    {/* Fetch the participants list based on the criteria and size */ }

    useEffect(() => {
        if (criteria && size) {
            fetchData(criteria, size);
        }
    }, [criteria, size]);

    const fetchData = async (criteria: string, size: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/participants?criteria=${criteria}&size=${size}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                setParticipants(data);
            } else {
                const text = await response.text();
                throw new Error(`Expected JSON but received HTML: ${text}`);
            }
        }
        catch (error: any) {
            message.error(error.message);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields(['location', 'size']);
            setCriteria(values.location);
            setSize(values.size);
        }
        catch (error) {
            message.error('Failed to fetch the participants list');
        }
    };

    {/* Select the donors and save to the event*/ }
    const handleSelectedParticipants = (selectedRowKeys: React.Key[], selectedRows: any) => {
        setSelectedParticipants(selectedRows);
    };


    return (
        <>
            <Form
                form={form}
                layout="vertical"
                style={{ maxWidth: 600, margin: '0 auto' }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Event ID"
                            name="eventid">
                            1234
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Event Name"
                            name="title"
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
                            rules={[{ required: true, message: 'Please enter the event time' }]}
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
                            <Select placeholder="Select a category">
                                {cityNames.map(city => (
                                    <Select.Option key={city} value={city}>
                                        {city}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row justify="center" style={{ marginTop: 16 }}>
                    <Button className="custom-antd-button" type="primary" htmlType="submit" onClick={handleSubmit}>Submit</Button>
                </Row>
            </Form>

            {/* Participants List Section*/}
            <div style={{ margin: '24px 0', borderBottom: '1px dashed grey' }}></div>
            <div style={{ marginTop: 24 }}>
                <h3>Participants List</h3>
                <Table
                    rowSelection={
                        {
                            type: 'checkbox',
                            onChange: (selectedRowKeys, selectedRows) => {
                                console.log(selectedRowKeys, selectedRows);
                            }
                        }
                    }
                    dataSource={participants}
                    columns={columns}
                    rowKey="id" />
            </div>

            <Row justify="center" gutter={16} style={{ marginTop: 16 }}>
                <Col>
                    <Button className="custom-antd-button" type="primary">Save</Button>
                </Col>
                <Col>
                    <Button className="custom-antd-button" id="cancel-button">Cancel</Button>
                </Col>
            </Row>
        </>
    )
};
export default AddEvent;