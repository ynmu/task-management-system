
// AccountProfileUpload.tsx - Updated Profile Component
import React, { useRef, useState } from 'react';
import { useAuth, User } from '../../context/AuthContext';
import UserAvatar from './UserAvatar';
import { Tooltip, message } from 'antd';
import { UploadOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../../config';

const AccountProfileUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useAuth(); 
  const [preview, setPreview] = useState(user?.profileUrl);
  const [hovered, setHovered] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    console.log('CLOUD_NAME:', CLOUD_NAME);
    console.log('UPLOAD_PRESET:', UPLOAD_PRESET);

    if (!file || !user?.id || !CLOUD_NAME || !UPLOAD_PRESET) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await cloudinaryRes.json();
      if (!data.secure_url) throw new Error('Image upload failed');

      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl: data.secure_url }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }
      setPreview(data.secure_url);
      setUser({
        ...user,
        profileUrl: data.secure_url,
      } as User);
      message.success('Profile picture updated successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      message.error('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Profile Picture */}
      <div className="relative">
        <Tooltip title="Click to change your profile picture">
          <div
            className="cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 group-hover:border-blue-400 transition-all duration-300">
              <UserAvatar
                key={`${user?.profileUrl}-${user?.userName}-${user?.firstName}-${user?.lastName}`}
                userName={user?.userName || ''}
                firstName={user?.firstName}
                lastName={user?.lastName}
                profileUrl={preview}
                size={120}
              />
              {/* Hover overlay */}
              {hovered && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <UploadOutlined className="!text-white !text-5xl" />
                </div>
              )}
            </div>
          </div>
        </Tooltip>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* User Info */}
      <div className="text-center space-y-3">
        <div>
          <h3 className="text-white text-xl font-semibold">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.userName || 'Unknown User'
            }
          </h3>
          <p className="text-gray-400 text-sm">@{user?.userName}</p>
        </div>

        {/* Role Badge */}
        {user?.roleName && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-400/30 text-blue-300 text-sm px-4 py-2 rounded-full backdrop-blur-sm">
            <CrownOutlined className="text-xs" />
            {user.roleName}
          </div>
        )}

        {/* Stats or Additional Info */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <UserOutlined />
            <span>Member since {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfileUpload;