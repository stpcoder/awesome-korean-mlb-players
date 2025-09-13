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

export const MLBPlayerCard: React.FC<MLBPlayerCardProps> = ({ playerInfo }) => {
  const [player, setPlayer] = useState<MLBPlayer | null>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        
        // 마이너리그 선수의 경우 sportId 전달
        const sportId = (playerInfo as any).sportId;
        
        const [playerData, recentData] = await Promise.all([
          mlbService.getPlayer(playerInfo.mlbId),
          mlbService.getPlayerRecentGames(playerInfo.mlbId, 1, 30, sportId) // 최근 1경기만 (카드용)
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
    return (
      <div className="player-card animate-pulse">
        <div className="p-6">
          <div className="flex gap-6">
            <div className="w-28 h-28 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    return null;
  }

  return (
    <div className="player-card">
      {/* 헤더 영역 */}
      <div className="p-4" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #DC2626 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 선수 사진/번호 */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src={mlbService.getPlayerImageUrl(playerInfo.mlbId)}
                  alt={playerInfo.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-4xl font-bold text-blue-600 hidden">
                  #{player.primaryNumber || playerInfo.jerseyNumber || '00'}
                </span>
              </div>
              {/* 국적 표시 */}
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-lg sm:text-2xl bg-white rounded-full p-0.5 sm:p-1 shadow-md">
                🇰🇷
              </span>
            </div>

            {/* 선수 정보 */}
            <div className="text-white flex-1">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{playerInfo.name}</h3>
              <div className="space-y-0.5 text-xs sm:text-sm md:text-base">
                <div className="flex items-center gap-2">
                  {playerInfo.teamId && playerInfo.teamId > 0 && (
                    <img 
                      src={mlbService.getTeamLogoUrl(playerInfo.teamId)} 
                      alt={playerInfo.team || ''}
                      className="w-4 h-4 sm:w-5 sm:h-5 brightness-0 invert"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <p className="font-medium truncate max-w-[120px] sm:max-w-none">
                    {playerInfo.team ? getKoreanTeamName(playerInfo.team) : '팀 정보 없음'}
                  </p>
                </div>
                <p className="opacity-90">
                  {getKoreanPosition(playerInfo.position)} 
                  {player?.currentAge && ` | ${player.currentAge}세`}
                </p>
              </div>
            </div>
          </div>

          {/* 리그 레벨 표시 */}
          <div className="bg-white/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg">
            <span className="text-white font-bold text-xs">
              {playerInfo.level === 'MiLB' && playerInfo.league ? (
                playerInfo.league.includes('Triple') ? '트리플A' :
                playerInfo.league.includes('Double') ? '더블A' :
                playerInfo.league.includes('Single') ? '싱글A' :
                playerInfo.league === 'Rookie' ? '루키' :
                playerInfo.league
              ) : 'MLB'}
            </span>
          </div>
        </div>
      </div>

      {/* 최근 경기 실적 */}
      <div className="p-4">
        
        {recentGames && recentGames.length > 0 ? (
          <>
            {recentGames.map((game, idx) => {
              const stat = game.stat;
              const isPitcher = playerInfo.position === 'P';
              const isTwoWayPlayer = playerInfo.position === 'TWP';
              
              // 투수와 타자 구분하여 기록 표시
              let mainStats = [];
              let displayStats: any = null;
              
              if (isPitcher || (isTwoWayPlayer && stat?.inningsPitched)) {
                // 투수 기록 처리 - 자책점과 기타 기록 분리
                let mainStat = '';
                let subStats = [];
                
                if (stat?.inningsPitched) {
                  // 자책점을 메인으로
                  if (stat?.earnedRuns === 0) {
                    mainStat = '무자책';
                  } else if (stat?.earnedRuns > 0) {
                    mainStat = `${stat.earnedRuns}자책`;
                  }
                  
                  // 나머지는 서브로
                  if (stat?.strikeOuts > 0) subStats.push(`${stat.strikeOuts}탈삼진`);
                  if (stat?.baseOnBalls > 0) subStats.push(`${stat.baseOnBalls}사구`);
                }
                
                // 투수 결과 표시 (승/패/세이브/홀드)
                let resultBadgeColor = '';
                let resultBadgeText = '';
                
                if (stat?.wins > 0) {
                  resultBadgeText = '승';
                  resultBadgeColor = 'bg-blue-500';
                } else if (stat?.losses > 0) {
                  resultBadgeText = '패';
                  resultBadgeColor = 'bg-red-500';
                } else if (stat?.saves > 0) {
                  resultBadgeText = '세이브';
                  resultBadgeColor = 'bg-green-500';
                } else if (stat?.holds > 0) {
                  resultBadgeText = '홀드';
                  resultBadgeColor = 'bg-purple-500';
                }
                
                displayStats = {
                  main: mainStat,
                  subStats: subStats,
                  resultBadge: resultBadgeText,
                  resultBadgeColor: resultBadgeColor,
                  badge: stat?.inningsPitched ? `${stat.inningsPitched}이닝` : '-',
                  isTwoWayPlayer: isTwoWayPlayer
                };
              }
              
              // TWP 선수의 타자 기록 또는 일반 타자 기록
              if (!isPitcher || (isTwoWayPlayer && stat?.atBats)) {
                // 타자 기록 처리
                if (stat?.hits > 0) {
                  mainStats.push(`${stat.hits}안타`);
                } else if (stat?.atBats > 0) {
                  mainStats.push('무안타');
                }
                
                const extraStats = [];
                if (stat?.homeRuns > 0) extraStats.push(`${stat.homeRuns}홈런`);
                if (stat?.rbi > 0) extraStats.push(`${stat.rbi}타점`);
                if (stat?.runs > 0) extraStats.push(`${stat.runs}득점`);
                if (stat?.baseOnBalls > 0) extraStats.push(`${stat.baseOnBalls}볼넷`);
                if (stat?.stolenBases > 0) extraStats.push(`${stat.stolenBases}도루`);
                
                // TWP 선수가 투수 기록도 있는 경우 병합
                if (isTwoWayPlayer && displayStats) {
                  displayStats.battingMain = mainStats.join(' ');
                  displayStats.battingExtra = extraStats.join(' ');
                  displayStats.hits = stat?.hits || 0;
                  displayStats.atBats = stat?.atBats || 0;
                } else {
                  displayStats = {
                    main: mainStats.join(' '),
                    extra: extraStats.join(' '),
                    hits: stat?.hits || 0,
                    atBats: stat?.atBats || 0,
                    isTwoWayPlayer: isTwoWayPlayer
                  };
                }
              }
              
              const koreanTeamName = getKoreanTeamName(game.opponent);
              
              return (
                <div key={idx} className="pt-3">
                  {/* 경기 정보 헤더 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-600">vs</span>
                      <img 
                        src={mlbService.getTeamLogoUrl(mlbService.getTeamIdByName(game.opponent))} 
                        alt={game.opponent}
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-xs font-medium text-gray-600 truncate max-w-[100px] sm:max-w-none">
                        {koreanTeamName} {game.isHome ? '(홈)' : '(원정)'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatKoreanDate(game.date, {
                        month: 'numeric',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </p>
                  </div>
                  
                  {/* 기록 표시 */}
                  <div className="flex flex-col gap-1">
                    {/* TWP 선수의 투수 기록 */}
                    {displayStats && displayStats.isTwoWayPlayer && displayStats.badge && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-semibold text-gray-500">투수:</span>
                          <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                            {displayStats.main}
                          </span>
                          {displayStats.subStats && displayStats.subStats.length > 0 && (
                            <span className="text-xs sm:text-sm md:text-base text-gray-600">
                              {displayStats.subStats.join(' ')}
                            </span>
                          )}
                          {displayStats.resultBadge && (
                            <span className={`px-2 py-0.5 rounded-full text-white text-sm font-bold ${displayStats.resultBadgeColor}`}>
                              {displayStats.resultBadge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)' }}>
                          <span className="text-xs sm:text-sm font-bold">{displayStats.badge}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* TWP 선수의 타자 기록 또는 일반 기록 */}
                    {displayStats && (displayStats.battingMain || (!displayStats.isTwoWayPlayer && displayStats.main)) ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          {displayStats && displayStats.isTwoWayPlayer && (
                            <span className="text-xs font-semibold text-gray-500">타자:</span>
                          )}
                          {isPitcher && displayStats && !displayStats.isTwoWayPlayer ? (
                        <>
                          {/* 투수: 자책점 강조, 나머지 회색 */}
                          <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                            {displayStats.main}
                          </span>
                          {displayStats.subStats && displayStats.subStats.length > 0 && (
                            <span className="text-xs sm:text-sm md:text-base text-gray-600">
                              {displayStats.subStats.join(' ')}
                            </span>
                          )}
                          {displayStats.resultBadge && (
                            <span className={`px-2 py-0.5 rounded-full text-white text-sm font-bold ${displayStats.resultBadgeColor}`}>
                              {displayStats.resultBadge}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                            {displayStats.main}
                          </span>
                          {displayStats?.extra && (
                            <span className="text-xs sm:text-sm md:text-base text-gray-600">
                              {displayStats.extra}
                            </span>
                          )}
                        </>
                      )}
                        </div>
                        
                        {/* 배지 표시 (TWP가 아닌 경우만) */}
                        {!displayStats?.isTwoWayPlayer && (
                          isPitcher ? (
                            <div className="flex items-center gap-1 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)' }}>
                              <span className="text-xs sm:text-sm font-bold">{displayStats?.badge}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-0.5 sm:gap-1 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)' }}>
                              <span className="text-xs sm:text-sm font-bold">{displayStats?.hits}</span>
                              <span className="text-[10px] sm:text-xs opacity-80">for</span>
                              <span className="text-xs sm:text-sm font-bold">{displayStats?.atBats}</span>
                            </div>
                          )
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">최근 경기 기록 없음</p>
            <p className="text-sm mt-1">
              {playerInfo.level === 'MiLB' 
                ? '마이너리그 데이터 확인 중...' 
                : '시즌이 시작되면 경기 실적이 표시됩니다'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};