// src/components/ui/SideBar.tsx
import React, { useState } from 'react';
import { Menu, Button, Tooltip } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  EyeOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../users/UserAvatar';
import UserStatus from '../users/UserStatus';

const NAVBAR_HEIGHT = 60; // Height of the navbar
const SIDEBAR_WIDTH_COLLAPSED = 60; // Width when collapsed
const SIDEBAR_WIDTH_EXPANDED = 220; // Width when expanded

const SideBar: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: 'add-event',
      icon: <PlusOutlined />,
      label: 'Add Event',
      onClick: () => navigate('/add-event'),
    },
    {
      key: 'view-events',
      icon: <EyeOutlined />,
      label: 'View Events',
      onClick: () => navigate('/view-event'),
    },
    {
      key: 'members',
      icon: <UsergroupAddOutlined />,
      label: 'Members',
      onClick: () => navigate('/view-members'),
    },
  ];

  return (
    <div
      className={clsx(
        'flex flex-col h-screen bg-white shadow-md border-r border-gray-200 transition-all duration-300 ease-in-out',
        collapsed ? 'w-${SIDEBAR_WIDTH_COLLAPSED}px' : 'w-${SIDEBAR_WIDTH_EXPANDED}px',
      )}
    >
      <div className="flex items-center justify-between p-4 h-[60px] border-b border-gray-100">
        {!collapsed && <span className="font-bold text-sm">BC Cancer</span>}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        />
      </div>

      <Menu
        mode="inline"
        className={clsx('border-none', collapsed ? 'text-center' : '')}
        style={{
          borderRight: 0,
          width: collapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`,
        }}
        inlineCollapsed={collapsed}
        items={menuItems}
        onClick={({ key }) => {
          const selected = menuItems.find((item) => item.key === key);
          selected?.onClick?.();
        }}
        theme="light"
      />


      {/* Bottom: user info and logout */}
      <div className="p-3 mt-auto pb-6">
        {user && (
          <div className="flex items-start gap-3 mb-6">
            {collapsed ? (
              // Show only the profile picture when collapsed
              <UserAvatar
                key={`${user?.profileUrl}-${user?.userName}-${user?.firstName}-${user?.lastName}`}
                userName={user.userName}
                profileUrl={user.profileUrl}
                size={40} // Adjust size for collapsed view
              />
            ) : (
              // Show full user info when expanded
              <>
                <UserAvatar
                  key={`${user?.profileUrl}-${user?.userName}-${user?.firstName}-${user?.lastName}`}
                  userName={user.userName}
                  profileUrl={user.profileUrl}
                  size={50}
                />
                <div className="flex flex-col justify-center">
                  <span className="font-semibold text-sm leading-tight">
                    { user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.userName || 'N/A' }
                  </span>
                  <span className="text-gray-500 text-xs">{user.roleName}</span>
                  <div className="mt-1">
                    <UserStatus
                      initialStatus="available"
                      size={8}
                      onChange={(newStatus) => console.log('Status:', newStatus)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      {/* Account and Logout buttons */}
      <div className={clsx('w-full', collapsed ? 'flex flex-col h-full' : 'flex items-center gap-2')}>
        {/* Top section: Account */}
        <div className={clsx(collapsed ? '' : 'flex-1')}>
          {collapsed ? (
            <Tooltip title="Account" placement="right">
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => navigate('/account')}
                className="w-full flex items-center justify-center"
              />
            </Tooltip>
          ) : (
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => navigate('/account')}
              className="flex items-center justify-start"
            >
              <span className="ml-2">Account</span>
            </Button>
          )}
        </div>

        {/* Bottom section: Logout */}
        <div>
          {collapsed ? (
            <Tooltip title="Log Out" placement="right">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={logout}
                className="w-full flex items-center justify-center text-red-500"
              />
            </Tooltip>
          ) : (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              className="flex items-center justify-start text-red-500"
            >
              <span className="ml-2">Log Out</span>
            </Button>
          )}
        </div>
      </div>

      </div>
    </div>
  );
};

export default SideBar;
