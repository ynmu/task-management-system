import React from 'react';
import '../../css/GeneralButton.css';

interface GeneralButtonProps {
  label: string;
  onClick?: () => void;
  htmlType?: 'button' | 'submit' | 'reset';
  theme?: 'light' | 'dark';
  disabled?: boolean;
  width?: string;
  height?: string;
}

const GeneralButton: React.FC<GeneralButtonProps> = ({
  label,
  onClick,
  htmlType = 'button',
  theme = 'light',
  disabled = false,
  width = '160px',
  height = '48px',
}) => {
  const baseClasses =
    'general-button p-2.5 my-1.5 text-base border rounded-sm shadow-[3px_3px_0_rgba(0,0,0,1)] cursor-pointer transition-colors';

  const themeClasses =
    theme === 'dark'
      ? 'bg-black text-white border-white hover:bg-white hover:text-black'
      : 'bg-white text-black border-black hover:bg-black hover:text-white';

  return (
    <button
      type={htmlType}
      onClick={onClick}
      disabled={disabled}
      style={{ width, height }}
      className={`${baseClasses} ${themeClasses}`}
    >
      {label}
    </button>
  );
};

export default GeneralButton;