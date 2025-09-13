import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  className = '',
  variant = 'rect',
  count = 1,
}) => {
  const variantClasses = {
    text: 'rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  ));

  return <>{skeletons}</>;
};