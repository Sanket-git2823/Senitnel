import React from 'react';

interface SentinelLogoProps {
  className?: string;
  size?: number;
}

export const SentinelLogo: React.FC<SentinelLogoProps> = ({
  className = 'w-5 h-5',
  size = 20
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/sentinel-logo.png"
        alt="Sentinel Emblem"
        width={size}
        height={size}
        className="w-full h-full object-contain rounded-full shadow-sm"
        onError={(e) => {
          // If image fails, fallback to pure inline SVG of the quadrant emblem
          e.currentTarget.style.display = 'none';
          const svg = e.currentTarget.nextElementSibling as HTMLElement;
          if (svg) svg.style.display = 'block';
        }}
      />
      {/* Precision SVG Vector Fallback matching the uploaded emblem */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full rounded-full hidden"
        style={{ background: '#000000' }}
      >
        {/* Top-Left Quadrant: White */}
        <path d="M 50 50 L 10 50 A 40 40 0 0 1 50 10 Z" fill="#FFFFFF" />
        {/* Top-Right Quadrant: Black */}
        <path d="M 50 50 L 50 10 A 40 40 0 0 1 90 50 Z" fill="#000000" />
        {/* Bottom-Left Quadrant: Black */}
        <path d="M 50 50 L 10 50 A 40 40 0 0 0 50 90 Z" fill="#000000" />
        {/* Bottom-Right Quadrant: Electric Blue */}
        <path d="M 50 50 L 50 90 A 40 40 0 0 0 90 50 Z" fill="#2F72FF" />
      </svg>
    </div>
  );
};
