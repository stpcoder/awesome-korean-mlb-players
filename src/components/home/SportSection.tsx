import React from 'react';
import { SportType } from '../../types';
import { getSportTheme } from '../../utils/sportThemes';
import { Card } from '../common/Card';

interface SportSectionProps {
  sport: SportType;
  title: string;
  playerCount: number;
  featuredPlayers: string[];
  onClick?: () => void;
}

export const SportSection: React.FC<SportSectionProps> = ({
  sport,
  title,
  playerCount,
  featuredPlayers,
  onClick,
}) => {
  const theme = getSportTheme(sport);

  return (
    <Card
      onClick={onClick}
      className={`relative overflow-hidden border-2 border-transparent hover:border-korea-blue/20`}
    >
      {/* Background Gradient */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} opacity-10 rounded-full -mr-16 -mt-16`}
      />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">{theme.icon}</span>
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{playerCount}명의 선수</p>
          </div>
          <div className={`px-3 py-1 rounded-full ${theme.bgColor} ${theme.color} text-sm font-semibold`}>
            {sport.toUpperCase()}
          </div>
        </div>

        {/* Featured Players */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-semibold">주요 선수</p>
          <div className="flex flex-wrap gap-2">
            {featuredPlayers.map((player, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {player}
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-korea-blue font-semibold flex items-center gap-1">
            자세히 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </div>
      </div>
    </Card>
  );
};