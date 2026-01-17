import React, { useEffect, useState } from 'react';
import { MLBPlayerInfo } from '../../data/mlbPlayers';
import { mlbService, MLBPlayer } from '../../services/mlbService';
import { getKoreanTeamName } from '../../data/mlbTeamNames';
import { getKoreanPosition } from '../../data/mlbPositions';
import { formatKoreanDate } from '../../utils/dateUtils';
import { logger } from '../../utils/logger';

interface MLBPlayerCardProps {
  playerInfo: MLBPlayerInfo;
}

// 스켈레톤 로딩 컴포넌트
const PlayerCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
    <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300" />
    <div className="p-5">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-xl -mt-14 border-4 border-white" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  </div>
);

// 통계 뱃지 컴포넌트
const StatBadge = ({
  label,
  value,
  variant = 'default'
}: {
  label: string;
  value: string | number;
  variant?: 'default' | 'highlight' | 'success' | 'warning';
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    highlight: 'bg-gradient-card text-white',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className={`px-3 py-1.5 rounded-lg text-center ${variants[variant]}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
};

export const MLBPlayerCard: React.FC<MLBPlayerCardProps> = ({ playerInfo }) => {
  const [player, setPlayer] = useState<MLBPlayer | null>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        const sportId = (playerInfo as any).sportId;

        const [playerData, recentData] = await Promise.all([
          mlbService.getPlayer(playerInfo.mlbId),
          mlbService.getPlayerRecentGames(playerInfo.mlbId, 1, 30, sportId)
        ]);

        setPlayer(playerData);
        setRecentGames(recentData);
      } catch (err) {
        logger.error('Error fetching MLB data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerInfo.mlbId]);

  if (loading) {
    return <PlayerCardSkeleton />;
  }

  if (!player) {
    return null;
  }

  const isPitcher = playerInfo.position === 'P';
  const isTwoWayPlayer = playerInfo.position === 'TWP';
  const hasRecentGame = recentGames && recentGames.length > 0;
  const recentGame = hasRecentGame ? recentGames[0] : null;
  const stat = recentGame?.stat;

  // 레벨 뱃지 텍스트
  const getLevelBadge = () => {
    if (playerInfo.level === 'MiLB' && playerInfo.league) {
      if (playerInfo.league.includes('Triple')) return 'AAA';
      if (playerInfo.league.includes('Double')) return 'AA';
      if (playerInfo.league.includes('Single')) return 'A';
      if (playerInfo.league === 'Rookie') return 'R';
      return playerInfo.league;
    }
    return 'MLB';
  };

  // 투수 결과 뱃지
  const getPitcherResult = () => {
    if (!stat) return null;
    if (stat.wins > 0) return { text: 'W', color: 'bg-blue-500' };
    if (stat.losses > 0) return { text: 'L', color: 'bg-red-500' };
    if (stat.saves > 0) return { text: 'SV', color: 'bg-green-500' };
    if (stat.holds > 0) return { text: 'H', color: 'bg-purple-500' };
    return null;
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* 헤더 - 그라데이션 배경 */}
      <div className="relative h-28 bg-gradient-card overflow-hidden">
        {/* 패턴 오버레이 */}
        <div className="absolute inset-0 bg-mesh-pattern opacity-30" />

        {/* 레벨 뱃지 */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold">
            {getLevelBadge()}
          </span>
        </div>

        {/* 팀 로고 (배경) */}
        {playerInfo.teamId && playerInfo.teamId > 0 && (
          <img
            src={mlbService.getTeamLogoUrl(playerInfo.teamId)}
            alt=""
            className="absolute -right-6 -bottom-6 w-32 h-32 opacity-20 brightness-0 invert"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        )}
      </div>

      {/* 프로필 섹션 */}
      <div className="px-5 pb-5">
        <div className="flex gap-4">
          {/* 프로필 이미지 */}
          <div className="relative -mt-12 z-10">
            <div className="w-20 h-20 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {!imageError ? (
                <img
                  src={mlbService.getPlayerImageUrl(playerInfo.mlbId)}
                  alt={playerInfo.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {playerInfo.name.charAt(0)}
                </div>
              )}
            </div>
            {/* 국기 */}
            <span className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full p-0.5 shadow-md">
              🇰🇷
            </span>
          </div>

          {/* 선수 정보 */}
          <div className="flex-1 pt-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-accent-purple transition-colors">
              {playerInfo.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              {playerInfo.teamId && playerInfo.teamId > 0 && (
                <img
                  src={mlbService.getTeamLogoUrl(playerInfo.teamId)}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              )}
              <span className="font-medium">
                {playerInfo.team ? getKoreanTeamName(playerInfo.team) : '팀 정보 없음'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                {getKoreanPosition(playerInfo.position)}
              </span>
              {player?.currentAge && (
                <span>{player.currentAge}세</span>
              )}
            </div>
          </div>
        </div>

        {/* 최근 경기 기록 */}
        {hasRecentGame ? (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* 경기 정보 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">최근 경기</span>
                <span className="text-xs text-gray-400">vs</span>
                <img
                  src={mlbService.getTeamLogoUrl(mlbService.getTeamIdByName(recentGame.opponent))}
                  alt={recentGame.opponent}
                  className="w-4 h-4"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <span className="text-xs font-medium text-gray-600">
                  {getKoreanTeamName(recentGame.opponent)}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {formatKoreanDate(recentGame.date, { month: 'numeric', day: 'numeric' })}
              </span>
            </div>

            {/* 통계 그리드 */}
            <div className="grid grid-cols-4 gap-2">
              {(isPitcher || (isTwoWayPlayer && stat?.inningsPitched)) && (
                <>
                  <StatBadge
                    label="이닝"
                    value={stat?.inningsPitched || '-'}
                    variant="default"
                  />
                  <StatBadge
                    label="자책"
                    value={stat?.earnedRuns ?? '-'}
                    variant={stat?.earnedRuns === 0 ? 'success' : 'default'}
                  />
                  <StatBadge
                    label="탈삼진"
                    value={stat?.strikeOuts || 0}
                    variant="default"
                  />
                  {getPitcherResult() ? (
                    <div className={`px-3 py-1.5 rounded-lg text-center text-white ${getPitcherResult()!.color}`}>
                      <div className="text-lg font-bold">{getPitcherResult()!.text}</div>
                      <div className="text-xs opacity-80">결과</div>
                    </div>
                  ) : (
                    <StatBadge label="사사구" value={stat?.baseOnBalls || 0} variant="default" />
                  )}
                </>
              )}

              {(!isPitcher || isTwoWayPlayer) && stat?.atBats !== undefined && (
                <>
                  <StatBadge
                    label="타율"
                    value={stat.atBats > 0 ? `${stat.hits}-${stat.atBats}` : '-'}
                    variant={stat.hits > 0 ? 'highlight' : 'default'}
                  />
                  <StatBadge
                    label="홈런"
                    value={stat?.homeRuns || 0}
                    variant={stat?.homeRuns > 0 ? 'warning' : 'default'}
                  />
                  <StatBadge
                    label="타점"
                    value={stat?.rbi || 0}
                    variant="default"
                  />
                  <StatBadge
                    label="득점"
                    value={stat?.runs || 0}
                    variant="default"
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-center py-4 text-gray-400">
              <div className="text-2xl mb-1">⚾</div>
              <p className="text-sm">최근 경기 기록 없음</p>
              <p className="text-xs mt-1">
                {playerInfo.level === 'MiLB' ? '마이너리그 시즌 대기 중' : '시즌 시작 대기 중'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
