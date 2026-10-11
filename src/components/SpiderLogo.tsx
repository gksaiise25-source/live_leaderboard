import React from 'react';

interface SpiderLogoProps {
  size?: number;
  className?: string;
}

export const SpiderLogo: React.FC<SpiderLogoProps> = ({ size = 48, className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px rgba(255, 23, 68, 0.6))' }}
      >
        {/* Outer shield */}
        <polygon
          points="50,4 90,24 90,68 50,96 10,68 10,24"
          fill="#0a0f24"
          stroke="#ff1744"
          strokeWidth="3.5"
        />
        {/* Internal web geometry */}
        <line x1="50" y1="4" x2="50" y2="96" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <line x1="10" y1="24" x2="90" y2="68" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <line x1="10" y1="68" x2="90" y2="24" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

        {/* Central Spider Body */}
        <ellipse cx="50" cy="46" rx="8" ry="12" fill="#ff1744" />
        <circle cx="50" cy="30" r="6" fill="#ff1744" />

        {/* Spider Legs */}
        {/* Left Upper Legs */}
        <path d="M46 38 Q30 20 20 28" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M44 44 Q24 38 18 48" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Left Lower Legs */}
        <path d="M44 50 Q22 58 24 72" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M46 54 Q32 72 30 84" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Right Upper Legs */}
        <path d="M54 38 Q70 20 80 28" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M56 44 Q76 38 82 48" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Right Lower Legs */}
        <path d="M56 50 Q78 58 76 72" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M54 54 Q68 72 70 84" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Glowing Eyes */}
        <polygon points="45,30 48,27 49,31" fill="#00e5ff" />
        <polygon points="55,30 52,27 51,31" fill="#00e5ff" />
      </svg>
    </div>
  );
};
