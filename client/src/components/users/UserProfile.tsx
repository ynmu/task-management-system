// src/components/ui/UserProfile.tsx
import React from 'react';
import clsx from 'clsx';

const COLORS = [
  'bg-red-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

interface UserProfileProps {
  userName: string;
  firstName?: string;
  lastName?: string;
  profileUrl?: string;
  size?: number; // in pixels, default 40
}

const getInitials = (userName: string, firstName?: string, lastName?: string): string => {
  if (firstName || lastName) {
    const firstInitial = firstName?.[0] ?? '';
    const lastInitial = lastName?.[0] ?? '';
    return (firstInitial + lastInitial).toUpperCase();
  }
  return userName.slice(0, 2).toUpperCase();
};

const getColor = (userName: string): string => {
  const hash = Array.from(userName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const UserProfile: React.FC<UserProfileProps> = ({
  userName,
  firstName,
  lastName,
  profileUrl,
  size = 40,
}) => {
  const initials = getInitials(userName, firstName, lastName);
  const colorClass = getColor(userName);
  const dimensionStyle = { width: size, height: size };

  return profileUrl ? (
    <img
      src={profileUrl}
      alt="Profile"
      style={dimensionStyle}
      className="rounded-full object-cover"
    />
  ) : (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center text-white font-semibold select-none overflow-hidden',
        colorClass
      )}
      style={dimensionStyle}
    >
      {initials}
    </div>
  );
};

export default UserProfile;
