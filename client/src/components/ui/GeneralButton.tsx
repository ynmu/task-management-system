import React from 'react';
import '../../css/GeneralButton.css';

interface GeneralButtonProps {
  label: string;
  to: string;
}

const GeneralButton: React.FC<GeneralButtonProps> = ({ label, to }) => {
  return (
    <button
      onClick={() => (window.location.href = to)}
      className="general-button p-2.5 my-1.5 w-40 h-12 text-base bg-white text-black border border-black rounded-sm shadow-[3px_3px_0_rgba(0,0,0,1)] cursor-pointer hover:bg-black hover:text-white transition-colors"
    >
      {label}
    </button>
  );
};

export default GeneralButton;