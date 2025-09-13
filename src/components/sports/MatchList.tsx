import React from 'react';
import { Match } from '../../types';
import { MatchCard } from './MatchCard';
import { Skeleton } from '../common/Skeleton';

interface MatchListProps {
  matches: Match[];
  loading?: boolean;
  onMatchClick?: (match: Match) => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  loading = false,
  onMatchClick,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between mb-4">
              <Skeleton width="120px" height="28px" />
              <Skeleton width="80px" height="20px" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton width="150px" height="24px" />
                <Skeleton width="30px" height="32px" />
              </div>
              <div className="flex justify-between">
                <Skeleton width="150px" height="24px" />
                <Skeleton width="30px" height="32px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">📅</span>
        <p className="text-gray-500 text-lg">예정된 경기가 없습니다.</p>
      </div>
    );
  }

  const groupedMatches = matches.reduce((acc, match) => {
    const date = match.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([date, dateMatches]) => (
        <div key={date}>
          <h3 className="text-lg font-bold text-gray-700 mb-3">
            {new Date(date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dateMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={() => onMatchClick?.(match)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};