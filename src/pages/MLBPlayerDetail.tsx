import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mlbPlayers, MLBPlayerInfo } from '../data/mlbPlayers';
import { mlbService, MLBPlayer } from '../services/mlbService';
import { getKoreanTeamName } from '../data/mlbTeamNames';
import { getKoreanPosition } from '../data/mlbPositions';
import { formatKoreanDate, formatKoreanDateLong } from '../utils/dateUtils';
import { logger } from '../utils/logger';

export const MLBPlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [playerInfo, setPlayerInfo] = useState<MLBPlayerInfo | null>(null);
  const [player, setPlayer] = useState<MLBPlayer | null>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [seasonStats, setSeasonStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [daysBack, setDaysBack] = useState(7); // 초기 일주일
  const [hasMore, setHasMore] = useState(true);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showGameDetail, setShowGameDetail] = useState(false);
  const [gamePlayByPlay, setGamePlayByPlay] = useState<any[]>([]);
  const [loadingPlayByPlay, setLoadingPlayByPlay] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const baseInfo = mlbPlayers.find(p => p.id === playerId);
      if (baseInfo) {
        // API로 실시간 정보 가져오기
        const apiInfo = await mlbService.getPlayerInfo(baseInfo.mlbId);
        const mergedInfo = {
          ...baseInfo,
          ...apiInfo,
          name: baseInfo.name, // 한글 이름 유지
        };
        setPlayerInfo(mergedInfo as MLBPlayerInfo);
        fetchPlayerData(baseInfo.mlbId, apiInfo?.sportId);
      }
    };
    fetchData();
  }, [playerId]);

  const fetchPlayerData = async (mlbId: number, sportId?: number) => {
    try {
      setLoading(true);
      
      const [playerData, recentData, statsData] = await Promise.all([
        mlbService.getPlayer(mlbId),
        mlbService.getPlayerRecentGames(mlbId, 100, 7, sportId), // sportId 전달
        mlbService.getPlayerStats(mlbId, 2025, sportId) // sportId 전달
      ]);
      
      setPlayer(playerData);
      setRecentGames(recentData);
      setSeasonStats(statsData);
      setHasMore(recentData.length > 0);
    } catch (err) {
      logger.error('Error fetching player data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreGames = async () => {
    if (!playerInfo || loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const newDaysBack = daysBack + 14; // 2주씩 추가
      const sportId = (playerInfo as any)?.sportId;
      const moreGames = await mlbService.getPlayerRecentGames(playerInfo.mlbId, 100, newDaysBack, sportId);
      
      if (moreGames.length === recentGames.length) {
        setHasMore(false);
      } else {
        setRecentGames(moreGames);
        setDaysBack(newDaysBack);
      }
    } catch (err) {
      logger.error('Error loading more games:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 100) {
        loadMoreGames();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [playerInfo, loadingMore, hasMore, daysBack, recentGames]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playerInfo || !player) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-lg">선수 상세 정보</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 선수 정보 카드 */}
        <div className="rounded-xl p-4 sm:p-6 mb-6 text-white" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #DC2626 100%)' }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src={mlbService.getPlayerImageUrl(playerInfo.mlbId)}
                alt={playerInfo.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const numberSpan = document.createElement('span');
                  numberSpan.className = 'text-4xl font-bold text-purple-600';
                  numberSpan.textContent = `#${player.primaryNumber || playerInfo.jerseyNumber || '00'}`;
                  e.currentTarget.parentElement?.appendChild(numberSpan);
                }}
              />
            </div>
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4">
                <h2 className="text-3xl sm:text-4xl font-bold">{playerInfo.name}</h2>
                {/* 리그 레벨 배지 */}
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-full text-sm font-bold">
                  {playerInfo.level === 'MiLB' && playerInfo.league ? (
                    playerInfo.league.includes('Triple') ? '트리플A' :
                    playerInfo.league.includes('Double') ? '더블A' :
                    playerInfo.league.includes('Single') ? '싱글A' :
                    playerInfo.league === 'Rookie' ? '루키' :
                    playerInfo.league
                  ) : 'MLB'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm sm:text-base">
                <div>
                  <p className="opacity-75 text-xs sm:text-sm mb-1">팀</p>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <img 
                      src={mlbService.getTeamLogoUrl(playerInfo.teamId || 0)} 
                      alt={playerInfo.team}
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="font-semibold text-sm sm:text-lg">{getKoreanTeamName(playerInfo.team || '')}</p>
                  </div>
                </div>
                <div>
                  <p className="opacity-75 text-xs sm:text-sm mb-1">포지션</p>
                  <p className="font-semibold text-sm sm:text-lg">{getKoreanPosition(playerInfo.position)}</p>
                </div>
                <div>
                  <p className="opacity-75 text-xs sm:text-sm mb-1">나이</p>
                  <p className="font-semibold text-sm sm:text-lg">{player.currentAge}세</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2025 시즌 통계 */}
        {seasonStats && (
          <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-4">2025 시즌 통계</h3>
            {/* TWP 선수인 경우 두 통계 모두 표시 */}
            {playerInfo?.position === 'TWP' && (
              <>
                {/* 투수 통계 */}
                {seasonStats.stats?.pitching && (
                  <div className="mb-6">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 text-blue-600">투수 통계</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {seasonStats.stats.pitching.era || '0.00'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">평균자책점</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {seasonStats.stats.pitching.wins || 0}-{seasonStats.stats.pitching.losses || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">승-패</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {seasonStats.stats.pitching.strikeOuts || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">탈삼진</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {seasonStats.stats.pitching.inningsPitched || '0.0'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">투구이닝</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {seasonStats.stats.pitching.saves || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">세이브</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                          {seasonStats.stats.pitching.whip || '0.00'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">WHIP</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* 타자 통계 */}
                {seasonStats.stats?.batting && (
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-600">타자 통계</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {seasonStats.stats.batting.avg || '.000'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">타율</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {seasonStats.stats.batting.homeRuns || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">홈런</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {seasonStats.stats.batting.rbi || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">타점</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {seasonStats.stats.batting.hits || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">안타</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {seasonStats.stats.batting.ops || '.000'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">OPS</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {/* 일반 타자 통계 */}
            {playerInfo?.position !== 'TWP' && seasonStats.stats?.batting && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {seasonStats.stats.batting.avg || '.000'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">타율</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {seasonStats.stats.batting.homeRuns || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">홈런</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {seasonStats.stats.batting.rbi || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">타점</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {seasonStats.stats.batting.hits || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">안타</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {seasonStats.stats.batting.ops || '.000'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">OPS</p>
                </div>
              </div>
            )}
            {/* 일반 투수 통계 */}
            {playerInfo?.position !== 'TWP' && seasonStats.stats?.pitching && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {seasonStats.stats.pitching.era || '0.00'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">평균자책점</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {seasonStats.stats.pitching.wins || 0}-{seasonStats.stats.pitching.losses || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">승-패</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {seasonStats.stats.pitching.saves || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">세이브</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {seasonStats.stats.pitching.holds || 0}
                  </p>
                  <p className="text-sm text-gray-600">홀드</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {seasonStats.stats.pitching.strikeOuts || 0}
                  </p>
                  <p className="text-sm text-gray-600">탈삼진</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {seasonStats.stats.pitching.inningsPitched || '0.0'}
                  </p>
                  <p className="text-sm text-gray-600">이닝</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 최근 경기 기록 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">최근 경기 기록</h3>
          
          {recentGames.length > 0 ? (
            <div className="space-y-3">
              {recentGames.map((game, idx) => {
                const stat = game.stat;
                const isPitcher = playerInfo?.position === 'P';
                const isTwoWayPlayer = playerInfo?.position === 'TWP';
                
                // 투수/타자별 기록 정리
                let gameStats = [];
                let displayBadge = '';
                let pitcherStats = null;
                let batterStats = null;
                
                // TWP 선수의 경우 두 기록 모두 처리
                if (isPitcher || (isTwoWayPlayer && stat?.inningsPitched)) {
                  // 투수 기록 - 자책점과 기타 기록 분리
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
                    if (stat?.hits > 0) subStats.push(`${stat.hits}피안타`);
                  }
                  
                  game.pitcherMainStat = mainStat;
                  game.pitcherSubStats = subStats;
                  
                  // 투수 결과 (승/패/세이브/홀드) - 별도 변수로 관리
                  let pitcherResult = null;
                  let pitcherResultColor = '';
                  
                  if (stat?.wins > 0) {
                    pitcherResult = '승';
                    pitcherResultColor = 'bg-blue-500';
                  } else if (stat?.losses > 0) {
                    pitcherResult = '패';
                    pitcherResultColor = 'bg-red-500';
                  } else if (stat?.saves > 0) {
                    pitcherResult = '세이브';
                    pitcherResultColor = 'bg-green-500';
                  } else if (stat?.holds > 0) {
                    pitcherResult = '홀드';
                    pitcherResultColor = 'bg-purple-500';
                  }
                  
                  displayBadge = stat?.inningsPitched ? `${stat.inningsPitched}이닝` : '-';
                  
                  // pitcherResult를 game 객체에 추가
                  game.pitcherResult = pitcherResult;
                  game.pitcherResultColor = pitcherResultColor;
                  
                  pitcherStats = {
                    mainStat: mainStat,
                    subStats: subStats,
                    result: pitcherResult,
                    resultColor: pitcherResultColor,
                    badge: displayBadge
                  };
                }
                
                // TWP 선수의 타자 기록 또는 일반 타자 기록
                if (!isPitcher || (isTwoWayPlayer && stat?.atBats !== undefined)) {
                  // 타자 기록
                  if (stat?.hits > 0) {
                    gameStats.push(`${stat.hits}안타`);
                  } else if (stat?.atBats > 0) {
                    gameStats.push('무안타');
                  }
                  if (stat?.homeRuns > 0) gameStats.push(`${stat.homeRuns}홈런`);
                  if (stat?.rbi > 0) gameStats.push(`${stat.rbi}타점`);
                  if (stat?.runs > 0) gameStats.push(`${stat.runs}득점`);
                  if (stat?.baseOnBalls > 0) gameStats.push(`${stat.baseOnBalls}볼넷`);
                  if (stat?.stolenBases > 0) gameStats.push(`${stat.stolenBases}도루`);
                  
                  if (!isTwoWayPlayer) {
                    displayBadge = `${stat?.hits || 0}/${stat?.atBats || 0}`;
                  }
                  
                  batterStats = {
                    stats: gameStats,
                    hits: stat?.hits || 0,
                    atBats: stat?.atBats || 0
                  };
                }
                
                const koreanTeamName = getKoreanTeamName(game.opponent);
                
                return (
                  <div 
                    key={idx} 
                    className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden"
                    onClick={async () => {
                      setSelectedGame(game);
                      setShowGameDetail(true);
                      setLoadingPlayByPlay(true);
                      
                      // Play-by-play 데이터 가져오기 - 투수와 타자 구분
                      try {
                        if (playerInfo.position === 'P') {
                          // 투수인 경우 이닝별 상세 기록
                          const inningDetails = await mlbService.getPitcherInningDetails(game.gamePk, playerInfo.mlbId);
                          setGamePlayByPlay(inningDetails);
                        } else {
                          // 타자인 경우 타석별 기록
                          const playByPlay = await mlbService.getGamePlayByPlay(game.gamePk, playerInfo.mlbId);
                          setGamePlayByPlay(playByPlay);
                        }
                      } catch (error) {
                        logger.error('Error fetching play by play:', error);
                        setGamePlayByPlay([]);
                      } finally {
                        setLoadingPlayByPlay(false);
                      }
                    }}
                  >
                    {/* 상단 헤더 */}
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">vs</span>
                        <img 
                          src={mlbService.getTeamLogoUrl(mlbService.getTeamIdByName(game.opponent))} 
                          alt={game.opponent}
                          className="w-5 h-5"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {koreanTeamName} {game.isHome ? '(홈)' : '(원정)'} • {formatKoreanDate(game.date)}
                        </span>
                      </div>
                    </div>
                    
                    {/* 메인 콘텐츠 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* 주요 기록만 표시 */}
                          <div className="space-y-2">
                            {/* TWP 선수의 투수 기록 */}
                            {isTwoWayPlayer && pitcherStats && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-blue-600 min-w-[32px]">투수:</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {pitcherStats.mainStat}
                                </span>
                                {pitcherStats.subStats.length > 0 && (
                                  <span className="text-sm text-gray-600">
                                    {pitcherStats.subStats.join(' ')}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* TWP 선수의 타자 기록 */}
                            {isTwoWayPlayer && batterStats && batterStats.stats.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-purple-600 min-w-[32px]">타자:</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {batterStats.stats.join(' ')}
                                </span>
                              </div>
                            )}
                            
                            {/* 일반 선수의 기록 */}
                            {!isTwoWayPlayer && (
                              <div className="flex items-center gap-2">
                                {isPitcher ? (
                                  <>
                                    {/* 투수: 자책점 강조, 나머지 회색 */}
                                    <span className="text-xl font-bold text-gray-900">
                                      {game.pitcherMainStat}
                                    </span>
                                    {game.pitcherSubStats.length > 0 && (
                                      <span className="text-base text-gray-600">
                                        {game.pitcherSubStats.join(' ')}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xl font-bold text-gray-900">
                                    {gameStats.length > 0 ? gameStats.join(' ') : '무안타'}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* 투수 결과 배지 */}
                            {(isPitcher || (isTwoWayPlayer && pitcherStats)) && game.pitcherResult && (
                              <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${game.pitcherResultColor}`}>
                                {game.pitcherResult}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* 배지 표시 - 투수/타자 구분 */}
                        <div className="ml-4">
                          <div className="relative">
                            {/* 메인 표시 */}
                            <div className="rounded-xl p-3 shadow-lg" style={{ 
                              background: isTwoWayPlayer 
                                ? 'linear-gradient(135deg, #8B5CF6 0%, #4C1D95 100%)'
                                : isPitcher 
                                ? 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)' 
                                : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' 
                            }}>
                              <div className="flex items-center justify-center gap-2">
                                <div className="text-white">
                                  {isTwoWayPlayer ? (
                                    <div className="space-y-1">
                                      {pitcherStats && (
                                        <div className="text-xs">
                                          <span className="opacity-90">투:</span> 
                                          <span className="font-bold">{pitcherStats.badge}</span>
                                        </div>
                                      )}
                                      {batterStats && batterStats.atBats > 0 && (
                                        <div className="text-xs">
                                          <span className="opacity-90">타:</span> 
                                          <span className="font-bold">{batterStats.hits}/{batterStats.atBats}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      <div className="text-3xl font-bold text-lg">
                                        {isPitcher ? displayBadge : `${stat?.hits || 0}`}
                                      </div>
                                      <div className="text-xs opacity-80 uppercase tracking-wider">
                                        {isPitcher ? '' : 'Hit'}
                                      </div>
                                    </>
                                  )}
                                </div>
                                {!isPitcher && !isTwoWayPlayer && (
                                  <>
                                    <div className="w-px h-10 bg-white/30"></div>
                                    <div className="text-white">
                                      <div className="text-3xl font-bold text-lg">{stat?.atBats || 0}</div>
                                      <div className="text-xs opacity-80 uppercase tracking-wider">AB</div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">최근 경기 기록이 없습니다</p>
              <p className="text-sm mt-1">시즌이 시작되면 경기 기록이 표시됩니다</p>
            </div>
          )}
          
          {/* 더 보기 로딩/버튼 */}
          {recentGames.length > 0 && (
            <div className="mt-6 text-center">
              {loadingMore ? (
                <div className="py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-600 mt-2">더 많은 경기 불러오는 중...</p>
                </div>
              ) : hasMore ? (
                <button
                  onClick={loadMoreGames}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  더 많은 경기 보기
                </button>
              ) : (
                <p className="text-sm text-gray-500 py-4">모든 경기를 불러왔습니다</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 경기 상세 모달 */}
      {showGameDetail && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-lg">경기 상세 기록</h3>
                <button
                  onClick={() => {
                    setShowGameDetail(false);
                    setSelectedGame(null);
                    setGamePlayByPlay([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* 경기 정보 */}
              <div className="mb-6">
                <p className="text-xl font-bold text-gray-900">
                  vs {getKoreanTeamName(selectedGame.opponent)} {selectedGame.isHome ? '(홈)' : '(원정)'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatKoreanDateLong(selectedGame.date)}
                </p>
              </div>

              {/* 선수 경기 기록 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {playerInfo?.name} {playerInfo?.position === 'P' ? '투구 기록' : '타석 기록'}
                </h4>

                {/* 상세 기록 */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {playerInfo?.position === 'P' ? (
                    // 투수 기록
                    <>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.inningsPitched || '0.0'}</p>
                        <p className="text-gray-600">이닝</p>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.strikeOuts || 0}</p>
                        <p className="text-gray-600">탈삼진</p>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.baseOnBalls || 0}</p>
                        <p className="text-gray-600">사구</p>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.hits || 0}</p>
                        <p className="text-gray-600">피안타</p>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.earnedRuns || 0}</p>
                        <p className="text-gray-600">자책점</p>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.homeRuns || 0}</p>
                        <p className="text-gray-600">피홈런</p>
                      </div>
                      {selectedGame.stat?.wins > 0 && (
                        <div className="bg-white rounded p-2 text-center">
                          <p className="font-bold text-blue-600">승</p>
                          <p className="text-gray-600">결과</p>
                        </div>
                      )}
                      {selectedGame.stat?.losses > 0 && (
                        <div className="bg-white rounded p-2 text-center">
                          <p className="font-bold text-red-600">패</p>
                          <p className="text-gray-600">결과</p>
                        </div>
                      )}
                      {selectedGame.stat?.saves > 0 && (
                        <div className="bg-white rounded p-2 text-center">
                          <p className="font-bold text-green-600">세이브</p>
                          <p className="text-gray-600">결과</p>
                        </div>
                      )}
                      {selectedGame.stat?.holds > 0 && (
                        <div className="bg-white rounded p-2 text-center">
                          <p className="font-bold text-purple-600">홀드</p>
                          <p className="text-gray-600">결과</p>
                        </div>
                      )}
                    </>
                  ) : (
                    // 타자 기록
                    <>
                      {selectedGame.stat?.homeRuns > 0 && (
                        <div className="bg-white rounded p-2 text-center">
                          <p className="font-bold text-red-600">{selectedGame.stat.homeRuns}</p>
                          <p className="text-gray-600">홈런</p>
                        </div>
                      )}
                      {selectedGame.stat?.doubles > 0 && (
                        <div className="bg-white rounded p-2 text-center">
                          <p className="font-bold text-lg">{selectedGame.stat.doubles}</p>
                          <p className="text-gray-600">2루타</p>
                        </div>
                      )}
                      {selectedGame.stat?.triples > 0 && (
                        <div className="bg-white rounded p-2 text-center">
                          <p className="font-bold text-lg">{selectedGame.stat.triples}</p>
                          <p className="text-gray-600">3루타</p>
                        </div>
                      )}
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.rbi || 0}</p>
                        <p className="text-gray-600">타점</p>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.runs || 0}</p>
                        <p className="text-gray-600">득점</p>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.baseOnBalls || 0}</p>
                        <p className="text-gray-600">볼넷</p>
                      </div>
                      <div className="bg-white rounded p-2 text-center">
                        <p className="font-bold text-lg">{selectedGame.stat?.strikeOuts || 0}</p>
                        <p className="text-gray-600">삼진</p>
                      </div>
                    </>
                  )}
              </div>
              </div>
              
              {/* 상세 기록 - 투수/타자 구분 */}
              {loadingPlayByPlay ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-600 mt-2">
                    {playerInfo?.position === 'P' ? '이닝별 정보 불러오는 중...' : '타석 정보 불러오는 중...'}
                  </p>
                </div>
              ) : gamePlayByPlay.length > 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">
                    {playerInfo?.position === 'P' ? '이닝별 투구 기록' : '타석별 상세 기록'}
                  </h5>
                  <div className="space-y-2">
                    {playerInfo?.position === 'P' ? (
                      // 투수 이닝별 기록
                      gamePlayByPlay.map((inning: any, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="mb-2">
                            <span className="font-bold text-gray-900 text-lg">
                              {inning.inningLabel}
                            </span>
                            <span className="ml-3 text-sm text-gray-600">
                              {inning.hits}안타 {inning.strikeouts}탈삼진 {inning.walks}사구 {inning.outs}아웃
                            </span>
                          </div>
                          <div className="space-y-1 mt-2">
                            {inning.batters?.map((batter: any, bIdx: number) => (
                              <div key={bIdx} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-700">{batter.name}:</span>
                                <span className="font-medium text-gray-900">{batter.result}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      // 타자 타석별 기록
                      gamePlayByPlay.map((atBat, idx) => {
                        // result에서 방향 정보 분리
                        const resultParts = atBat.result ? atBat.result.match(/^([^(]+)(\(.+\))?$/) : null;
                        const mainResult = resultParts ? resultParts[1].trim() : atBat.result;
                        const direction = resultParts && resultParts[2] ? resultParts[2].trim() : null;
                        
                        return (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div>
                                  <span className="font-bold text-gray-900">
                                    {atBat.inning}회 {atBat.halfInning}
                                  </span>
                                  <span className="ml-2 text-gray-900 font-medium">
                                    {mainResult}
                                  </span>
                                  {atBat.rbi > 0 && (
                                    <span className="ml-2 text-green-600 font-semibold">
                                      ({atBat.rbi}타점)
                                    </span>
                                  )}
                                </div>
                                {direction && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    {direction}
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                vs {atBat.pitcher}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};