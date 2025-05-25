// src/components/ui/UserStatus.tsx
import React, { useState } from 'react';
import { Dropdown, MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import clsx from 'clsx';

const STATUS_OPTIONS = [
  { label: 'Available', value: 'available', color: 'bg-green-500' },
  { label: 'Busy', value: 'busy', color: 'bg-red-500' },
  { label: 'Away', value: 'away', color: 'bg-yellow-400' },
  { label: 'Offline', value: 'offline', color: 'bg-gray-400' },
];

interface UserStatusProps {
  initialStatus?: string;
  onChange?: (newStatus: string) => void;
  size?: number; // dot size in px
}

const UserStatus: React.FC<UserStatusProps> = ({
  initialStatus = 'available',
  onChange,
  size = 10,
}) => {
  const [status, setStatus] = useState(initialStatus);

  const handleSelect = (key: string) => {
    setStatus(key);
    onChange?.(key);
  };

  const current = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  const items: MenuProps['items'] = STATUS_OPTIONS.map((option) => ({
    key: option.value,
    label: (
      <div className="flex items-center gap-2 text-sm">
        <span className={clsx('rounded-full', option.color)} style={{ width: 8, height: 8 }} />
        {option.label}
      </div>
    ),
  }));

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => handleSelect(key),
      }}
      trigger={['click']}
    >
      <div className="cursor-pointer select-none text-sm">
        <div className="flex items-center gap-2">
          <span
            className={clsx('rounded-full', current.color)}
            style={{ width: size, height: size }}
          />
          <span className="capitalize">{current.label}</span>
          <DownOutlined className="text-xs" />
        </div>
      </div>
    </Dropdown>
  );
};

export default UserStatus;
