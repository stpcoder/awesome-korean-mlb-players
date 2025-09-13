import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = true,
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = `
    bg-white rounded-xl shadow-lg 
    transition-all duration-300
    ${paddingClasses[padding]}
    ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  return (
    <div className={`${baseClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};