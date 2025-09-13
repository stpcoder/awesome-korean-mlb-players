import React from 'react';
import { SportType } from '../../types';
import { getSportTheme } from '../../utils/sportThemes';

interface SportBadgeProps {
  sport: SportType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sportLabels: Record<SportType, string> = {
  football: '축구',
  baseball: '야구',
  basketball: '농구',
  tennis: '테니스',
  golf: '골프',
};

export const SportBadge: React.FC<SportBadgeProps> = ({
  sport,
  size = 'md',
  showLabel = true,
}) => {
  const theme = getSportTheme(sport);
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-1',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-3',
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full font-semibold
        ${theme.bgColor} ${theme.color}
        ${sizeClasses[size]}
        transition-all duration-200 hover:scale-105
      `}
    >
      <span className={iconSizes[size]}>{theme.icon}</span>
      {showLabel && <span>{sportLabels[sport]}</span>}
    </div>
  );
};