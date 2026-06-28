import React from 'react';

export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) {
  return (
    <div 
      className="skeleton-base" 
      style={{ 
        width, 
        height, 
        borderRadius,
        ...style 
      }} 
    />
  );
}
