import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import EditEvent from '../components/events/EventDetails';

const EditEventPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
      <button
        onClick={() => navigate('/view-event')}
        className="mb-6 flex items-center text-sm text-blue-500 hover:underline"
      >
        <ArrowLeftOutlined className="mr-2" />
        Back to Events
      </button>
      <div className="">
        <EditEvent /> 
      </div>
    </div>
  );
};

export default EditEventPage;
