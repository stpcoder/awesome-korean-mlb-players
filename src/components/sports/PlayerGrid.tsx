import React from 'react';
import { Player } from '../../types';
import { PlayerCard } from './PlayerCard';
import { Skeleton } from '../common/Skeleton';

interface PlayerGridProps {
  players: Player[];
  loading?: boolean;
  onPlayerClick?: (player: Player) => void;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  players,
  loading = false,
  onPlayerClick,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <Skeleton variant="circle" width="80px" height="80px" />
              <div className="flex-1">
                <Skeleton width="150px" height="24px" className="mb-2" />
                <Skeleton width="100px" height="16px" className="mb-3" />
                <Skeleton width="200px" height="14px" className="mb-1" />
                <Skeleton width="180px" height="14px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🔍</span>
        <p className="text-gray-500 text-lg">선수 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onClick={() => onPlayerClick?.(player)}
        />
      ))}
    </div>
  );
};