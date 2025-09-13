import React from 'react';
import { Match } from '../../types';
import { Card } from '../common/Card';
import { SportBadge } from '../common/SportBadge';
import { getSportTheme } from '../../utils/sportThemes';

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const theme = getSportTheme(match.sport);
  const isLive = match.result?.status === 'live';
  const isFinished = match.result?.status === 'finished';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <Card onClick={onClick} className="relative overflow-hidden">
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg animate-pulse">
          <span className="text-xs font-bold">LIVE</span>
        </div>
      )}

      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SportBadge sport={match.sport} size="sm" />
          <span className="text-sm text-gray-500">{match.competition}</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{formatDate(match.date)}</p>
          <p className="text-xs text-gray-500">{formatTime(match.time)}</p>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.gradient} opacity-70`} />
            <span className="font-semibold">{match.homeTeam}</span>
          </div>
          {match.result && (
            <span className={`text-2xl font-bold ${isFinished && match.result.homeScore > match.result.awayScore ? 'text-korea-blue' : 'text-gray-400'}`}>
              {match.result.homeScore}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.gradient} opacity-50`} />
            <span className="font-semibold">{match.awayTeam}</span>
          </div>
          {match.result && (
            <span className={`text-2xl font-bold ${isFinished && match.result.awayScore > match.result.homeScore ? 'text-korea-blue' : 'text-gray-400'}`}>
              {match.result.awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Korean Players */}
      {match.koreanPlayers && match.koreanPlayers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">🇰🇷 출전 선수</p>
          <div className="flex flex-wrap gap-2">
            {match.koreanPlayers.map((player) => (
              <span
                key={player.id}
                className="text-xs bg-korea-blue/10 text-korea-blue px-2 py-1 rounded-full font-medium"
              >
                {player.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match Status */}
      {!match.result && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">예정된 경기</span>
        </div>
      )}
    </Card>
  );
};