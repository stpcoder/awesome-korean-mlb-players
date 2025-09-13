import React from 'react';
import { Player } from '../../types';
import { Card } from '../common/Card';
import { SportBadge } from '../common/SportBadge';
import { getSportTheme } from '../../utils/sportThemes';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClick }) => {
  const theme = getSportTheme(player.sport);

  return (
    <Card onClick={onClick} className="group">
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white text-3xl font-bold overflow-hidden`}>
          {player.profileImage ? (
            <img
              src={player.profileImage}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{player.name[0]}</span>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{player.name}</h3>
              <p className="text-sm text-gray-500">{player.nameEn}</p>
            </div>
            <SportBadge sport={player.sport} size="sm" showLabel={false} />
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">팀:</span> {player.team}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">포지션:</span> {player.position}
            </p>
          </div>

          {/* Stats Preview */}
          {player.stats && (
            <div className="mt-3 flex gap-4 text-xs">
              {player.sport === 'football' && (
                <>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.goals || 0}</p>
                    <p className="text-gray-500">골</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.assists || 0}</p>
                    <p className="text-gray-500">도움</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.appearances || 0}</p>
                    <p className="text-gray-500">경기</p>
                  </div>
                </>
              )}
              {player.sport === 'baseball' && (
                <>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.battingAverage || '.000'}</p>
                    <p className="text-gray-500">타율</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.homeRuns || 0}</p>
                    <p className="text-gray-500">홈런</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.rbi || 0}</p>
                    <p className="text-gray-500">타점</p>
                  </div>
                </>
              )}
              {player.sport === 'basketball' && (
                <>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.points || 0}</p>
                    <p className="text-gray-500">득점</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.rebounds || 0}</p>
                    <p className="text-gray-500">리바운드</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-korea-blue">{player.stats.assists || 0}</p>
                    <p className="text-gray-500">어시스트</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      {player.achievements && player.achievements.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-gold text-lg">🏆</span>
            <p className="text-sm text-gray-600">
              {player.achievements[0].title}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};