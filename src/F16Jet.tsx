import React from 'react';

/**
 * SVG F-16 fighter jet icon — points to the RIGHT by default (0°).
 * Caller wraps it in a transform: rotate(deg) to orient it.
 */
export const F16Jet: React.FC<{ size?: number; color?: string }> = ({
  size = 48,
  color = '#e0e0e0',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="-24 -24 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main fuselage */}
    <ellipse cx="0" cy="0" rx="18" ry="3.5" fill={color} />
    {/* Nose cone */}
    <polygon points="18,0 10,-1.5 10,1.5" fill={color} />
    {/* Main wings */}
    <polygon points="-2,-3.5 8,-3.5 2,-14 -6,-14" fill={color} opacity="0.9" />
    <polygon points="-2,3.5 8,3.5 2,14 -6,14" fill={color} opacity="0.9" />
    {/* Tail fins */}
    <polygon points="-14,-3.5 -10,-3.5 -10,-9 -16,-9" fill={color} opacity="0.85" />
    <polygon points="-14,3.5 -10,3.5 -10,9 -16,9" fill={color} opacity="0.85" />
    {/* Vertical tail */}
    <polygon points="-12,-3.5 -8,-3.5 -8,-7 -14,-7" fill={color} opacity="0.7" />
    {/* Canopy */}
    <ellipse cx="6" cy="0" rx="5" ry="2.5" fill="#4fc3f7" opacity="0.8" />
    {/* Engine exhaust */}
    <ellipse cx="-18" cy="0" rx="2" ry="3" fill="#ff6f00" opacity="0.7" />
    <ellipse cx="-20" cy="0" rx="1.5" ry="2" fill="#ffca28" opacity="0.5" />
  </svg>
);
