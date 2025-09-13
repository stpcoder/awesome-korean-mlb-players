import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mlbService } from '../../services/mlbService';
import { mlbPlayers } from '../../data/mlbPlayers';
import { getKoreanTeamName } from '../../data/mlbTeamNames';
import { getKoreanPosition } from '../../data/mlbPositions';
import { Modal } from '../common/Modal';
import { logger } from '../../utils/logger';

interface MLBGameWithKorean {
  gamePk: number;
  gameDate: string;
  koreanTime?: Date;
  koreanDateString?: string;
  gameStatus?: string;
  status: {
    abstractGameState: string;
    detailedState: string;
  };
  teams: {
    away: {
      team: { id: number; name: string };
      score?: number;
    };
    home: {
      team: { id: number; name: string };
      score?: number;
    };
  };
  venue: {
    name: string;
  };
}

interface PlayerPerformance {
  playerId: number;
  playerName: string;
  team: string;
  position: string;
  battingOrder?: string;
  batting?: {
    atBats: number;
    hits: number;
    runs: number;
    rbi: number;
    homeRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    avg: string;
  };
  pitching?: {
    inningsPitched: string;
    hits: number;
    runs: number;
    earnedRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    homeRuns: number;
    era: string;
  };
  played: boolean;
  inningStats?: Array<{
    inning: string;
    result: string;
    description: string;
    rbi: number;
    pitcher: string;
  }>;
}

interface GameBoxscore {
  teams: {
    home: {
      teamStats: {
        batting: {
          runs: number;
          hits: number;
          errors: number;
          leftOnBase: number;
        };
      };
      players?: Record<string, any>;
    };
    away: {
      teamStats: {
        batting: {
          runs: number;
          hits: number;
          errors: number;
          leftOnBase: number;
        };
      };
      players?: Record<string, any>;
    };
  };
  linescore?: {
    innings: Array<{
      num: number;
      home: { runs?: number };
      away: { runs?: number };
    }>;
  };
}

interface GameLiveFeed {
  liveData?: {
    plays?: {
      allPlays?: Array<{
        about: {
          halfInning: string;
          inning: number;
        };
        result: {
          type: string;
          event: string;
          eventType: string;
          description: string;
          rbi?: number;
        };
        matchup?: {
          batter: {
            fullName: string;
          };
          pitcher: {
            fullName: string;
          };
        };
      }>;
    };
  };
}

export const MLBScheduleEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<MLBGameWithKorean[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pastDaysLoaded, setPastDaysLoaded] = useState(0); // 과거 날짜 로드 수
  const [futureDaysLoaded, setFutureDaysLoaded] = useState(0); // 미래 날짜 로드 수
  const [selectedGame, setSelectedGame] = useState<MLBGameWithKorean | null>(null);
  const [gamePerformances, setGamePerformances] = useState<PlayerPerformance[]>([]);
  const [gameBoxscore, setGameBoxscore] = useState<GameBoxscore | null>(null);
  const [gameLiveFeed, setGameLiveFeed] = useState<GameLiveFeed | null>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [levelFilter, setLevelFilter] = useState<'all' | 'MLB' | 'MiLB'>('MLB');
  const [playersWithInfo, setPlayersWithInfo] = useState<any[]>([]);
  const [showInningDetails, setShowInningDetails] = useState(false);
  const fetchGamesRef = useRef<(direction: 'initial' | 'past' | 'future') => Promise<void>>();
  const loadingMoreRef = useRef(false);

  // 선수 정보 업데이트
  const updatePlayersInfo = useCallback(async () => {
    const playerIds = mlbPlayers.map(p => p.mlbId);
    const playerInfos = await mlbService.getPlayersInfo(playerIds);
    
    // 한글 이름과 API 정보 병합
    const mergedPlayers = mlbPlayers.map(player => {
      const apiInfo = playerInfos.find(info => info?.mlbId === player.mlbId);
      return {
        ...player,
        ...apiInfo,
        name: player.name, // 한글 이름 유지
      };
    });
    
    setPlayersWithInfo(mergedPlayers);
    return mergedPlayers;
  }, []);

  // 경기 데이터 가져오기 - 무한 스크롤을 위해 개선
  const fetchGames = useCallback(async (direction: 'initial' | 'past' | 'future' = 'initial') => {
    logger.log('fetchGames called with direction:', direction);
    
    if (direction === 'initial') {
      setLoading(true);
      setGames([]);
      setPastDaysLoaded(1); // 어제(-1일)를 이미 로드했으므로
      setFutureDaysLoaded(6); // 오늘부터 6일 후까지 이미 로드
    } else {
      if (loadingMoreRef.current) {
        logger.log('Already loading, returning early');
        return; // 이미 로딩 중이면 중단
      }
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }
    
    try {
      // 선수 정보 먼저 업데이트
      const players = playersWithInfo.length > 0 ? playersWithInfo : await updatePlayersInfo();
      
      let filteredPlayers = players;
      if (levelFilter === 'MLB') {
        filteredPlayers = players.filter(p => p.level === 'MLB');
      } else if (levelFilter === 'MiLB') {
        filteredPlayers = players.filter(p => p.level === 'MiLB');
      }
      
      const teamIds = [...new Set(filteredPlayers.map(p => p.teamId).filter(id => id > 0))];
      
      // 날짜 범위 계산
      const today = new Date();
      let startDate: string = '';
      let endDate: string = '';
      
      if (direction === 'initial') {
        // 초기 로드: 어제부터 7일 후까지 (오늘 포함)
        const start = new Date(today);
        start.setDate(start.getDate() - 1); // 어제부터 시작
        startDate = start.toISOString().split('T')[0];
        
        const end = new Date(today);
        end.setDate(end.getDate() + 6); // 오늘부터 6일 후까지 (총 8일)
        endDate = end.toISOString().split('T')[0];
      } else if (direction === 'past') {
        // 과거 로드: 이전 날짜로 확장
        const start = new Date(today);
        start.setDate(start.getDate() - pastDaysLoaded - 8); // 초기 로드가 어제(-1)부터이므로 -8
        startDate = start.toISOString().split('T')[0];
        
        const end = new Date(today);
        end.setDate(end.getDate() - pastDaysLoaded - 2); // 어제 이전까지
        endDate = end.toISOString().split('T')[0];
        
        setPastDaysLoaded(pastDaysLoaded + 7);
      } else if (direction === 'future') {
        // 미래 로드: 미래 날짜로 확장
        const start = new Date(today);
        start.setDate(start.getDate() + futureDaysLoaded + 7); // 초기 로드가 +6까지이므로 +7부터
        startDate = start.toISOString().split('T')[0];
        
        const end = new Date(today);
        end.setDate(end.getDate() + futureDaysLoaded + 13); // 7일 더 미래로
        endDate = end.toISOString().split('T')[0];
        
        setFutureDaysLoaded(futureDaysLoaded + 7);
      }
      
      // MLB API 호출 (프록시 사용)
      const sportIds = '1,11,12,13,14,15,16'; // 모든 레벨 포함
      let apiPath = `/schedule?sportId=${sportIds}&startDate=${startDate}&endDate=${endDate}`;
      if (teamIds && teamIds.length > 0) {
        apiPath += `&teamId=${teamIds.join(',')}`;
      }
      
      // 프로덕션 환경에서는 프록시 사용
      const isDevelopment = import.meta.env.DEV;
      const url = isDevelopment 
        ? `/api/mlb/api/v1${apiPath}`
        : `/api/mlb-proxy?url=${encodeURIComponent(`https://statsapi.mlb.com/api/v1${apiPath}`)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const newGames: MLBGameWithKorean[] = [];
      
      // 선수 출전 정보 가져오기 (종료된 경기용)
      const playerGamePks = new Set<number>();
      for (const player of filteredPlayers) {
        try {
          const recentGames = await mlbService.getPlayerRecentGames(
            player.mlbId,
            100, // 더 많은 경기 확인
            60, // 60일간
            player.sportId
          );
          recentGames.forEach((game: any) => {
            if (game.gamePk) {
              playerGamePks.add(game.gamePk);
            }
          });
        } catch (error) {
          logger.error(`Error fetching recent games for player ${player.mlbId}:`, error);
        }
      }
      
      data.dates?.forEach((date: any) => {
        date.games?.forEach((game: any) => {
          const gameDate = new Date(game.gameDate);
          const koreanTime = mlbService.convertToKoreanTime(gameDate);
          
          const gameWithKorean: MLBGameWithKorean = {
            ...game,
            gameDate: game.gameDate,
            koreanTime: koreanTime,
            koreanDateString: mlbService.formatKoreanDateTime(gameDate),
            gameStatus: mlbService.getGameStatus(game.status)
          };
          
          // 필터링 로직
          const isFinished = gameWithKorean.gameStatus === '경기 종료' || game.status?.abstractGameState === 'Final';
          const isLive = gameWithKorean.gameStatus === '경기 중' || game.status?.abstractGameState === 'Live';
          const isScheduled = gameWithKorean.gameStatus === '예정' || game.status?.abstractGameState === 'Preview';
          
          // 진행중이거나 예정된 경기는 모두 표시
          if (isLive || isScheduled) {
            newGames.push(gameWithKorean);
          }
          // 종료된 경기는 선수가 실제로 출전한 경기만 표시
          else if (isFinished && playerGamePks.has(game.gamePk)) {
            newGames.push(gameWithKorean);
          }
        });
      });
      
      // 경기 업데이트
      if (direction === 'initial') {
        setGames(newGames);
      } else {
        setGames(prevGames => {
          const existingGamePks = new Set(prevGames.map(g => g.gamePk));
          const uniqueNewGames = newGames.filter(g => !existingGamePks.has(g.gamePk));
          return [...prevGames, ...uniqueNewGames];
        });
      }
      
      // 새로운 경기가 없으면 더 이상 로드하지 않도록 표시
      if (newGames.length === 0) {
        logger.log('No more games to load');
      }
      
    } catch (error) {
      logger.error('Error fetching games:', error);
    } finally {
      if (direction === 'initial') {
        setLoading(false);
      } else {
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, [levelFilter, playersWithInfo, updatePlayersInfo, pastDaysLoaded, futureDaysLoaded]);

  // fetchGames를 ref에 저장
  useEffect(() => {
    fetchGamesRef.current = fetchGames;
  }, [fetchGames]);

  // 컴포넌트 마운트 시 선수 정보 로드
  useEffect(() => {
    updatePlayersInfo();
  }, [updatePlayersInfo]);

  // 선수 정보가 로드되면 경기 데이터 가져오기
  useEffect(() => {
    if (playersWithInfo.length > 0) {
      fetchGames('initial'); // 초기 로드
    }
  }, [playersWithInfo.length, levelFilter]); // fetchGames는 의존성에서 제외

  // 더 보기 버튼 클릭 핸들러 (미래 경기)
  const handleLoadMore = async () => {
    logger.log('Load more clicked, loadingMore:', loadingMore);
    if (!loadingMore) {
      logger.log('Calling fetchGames(future)...');
      await fetchGames('future');
    }
  };
  
  // 이전 경기 보기 버튼 클릭 핸들러 (과거 경기)
  const handleLoadPast = async () => {
    logger.log('Load past clicked, loadingMore:', loadingMore);
    if (!loadingMore) {
      logger.log('Calling fetchGames(past)...');
      await fetchGames('past');
    }
  };

  // 경기 상세 정보 가져오기
  const fetchGamePerformance = async (game: MLBGameWithKorean, playerIds: number[]) => {
    setLoadingPerformance(true);
    setSelectedGame(game);
    setShowModal(true);
    
    logger.log('=== 경기 상세 정보 가져오기 ===');
    logger.log('Game PK:', game.gamePk);
    logger.log('Teams:', game.teams.home.team.name, 'vs', game.teams.away.team.name);
    logger.log('한국 선수 IDs:', playerIds);
    
    try {
      // 한국 선수 기록 가져오기
      logger.log('Calling getKoreanPlayersInGame with:', { gamePk: game.gamePk, playerIds });
      const performances = await mlbService.getKoreanPlayersInGame(game.gamePk, playerIds);
      logger.log('Fetched performances:', performances);
      logger.log('Performances length:', performances.length);
      
      if (performances.length === 0) {
        logger.warn('No Korean players found in this game!');
        logger.log('Trying to debug - Available playerIds:', playerIds);
      }
      
      // 전체 경기 박스스코어 가져오기 (프록시 사용)
      const isDevelopment = import.meta.env.DEV;
      const boxscoreUrl = isDevelopment 
        ? `/api/mlb/api/v1/game/${game.gamePk}/boxscore`
        : `/api/mlb-proxy?url=${encodeURIComponent(`https://statsapi.mlb.com/api/v1/game/${game.gamePk}/boxscore`)}`;
      const boxscoreResponse = await fetch(boxscoreUrl);
      const boxscoreData = await boxscoreResponse.json();
      logger.log('Fetched boxscore:', boxscoreData);
      setGameBoxscore(boxscoreData);
      
      // 이닝별 플레이 기록 가져오기 (실패해도 계속 진행)
      let liveFeed = null;
      try {
        liveFeed = await mlbService.getGameLiveFeed(game.gamePk);
        logger.log('Fetched live feed:', liveFeed);
      } catch (liveFeedError) {
        logger.error('Failed to fetch live feed, continuing without it:', liveFeedError);
      }
      setGameLiveFeed(liveFeed);
      
      // 한국 선수의 이닝별 타석 결과 추가
      // 이미 getKoreanPlayersInGame에서 inningStats를 가져왔으므로, 
      // liveFeed에서 추가 정보가 있을 때만 보완
      const performancesWithInningStats = performances.map(perf => {
        // 이미 inningStats가 있으면 그대로 사용
        if ((perf as any).inningStats && (perf as any).inningStats.length > 0) {
          logger.log(`Using existing inning stats for ${perf.playerName}:`, (perf as any).inningStats);
          return perf;
        }
        
        // inningStats가 없고 liveFeed가 있으면 liveFeed에서 가져오기
        const inningStats: any[] = [];
        
        if (liveFeed?.liveData?.plays?.allPlays) {
          liveFeed.liveData.plays.allPlays.forEach((play: any) => {
            if (play.matchup?.batter?.id === perf.playerId && play.result?.event) {
              inningStats.push({
                inning: `${play.about.inning}회 ${play.about.halfInning === 'top' ? '초' : '말'}`,
                result: translatePlayEvent(play.result.event),
                description: play.result.description || '',
                rbi: play.result.rbi || 0,
                pitcher: play.matchup?.pitcher?.fullName || ''
              });
            }
          });
        }
        
        logger.log(`Created inning stats from liveFeed for ${perf.playerName}:`, inningStats);
        
        return {
          ...perf,
          inningStats
        };
      });
      
      setGamePerformances(performancesWithInningStats);
    } catch (error) {
      logger.error('Error fetching game data:', error);
    } finally {
      setLoadingPerformance(false);
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedGame(null);
    setGamePerformances([]);
    setGameBoxscore(null);
    setGameLiveFeed(null);
  };

  const getKoreanPlayers = (teamId: number) => {
    const players = playersWithInfo.length > 0 ? playersWithInfo : mlbPlayers;
    return players.filter(p => p.teamId === teamId);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      '경기 중': 'bg-red-500 text-white animate-pulse',
      '경기 종료': 'bg-slate-500 text-white',
      '경기 예정': 'bg-blue-500 text-white',
      '연기': 'bg-yellow-500 text-white',
      '취소': 'bg-gray-400 text-white'
    };

    return (
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[status] || 'bg-gray-400 text-white'}`}>
        {status}
      </span>
    );
  };

  // 플레이 이벤트를 한글로 변환
  const translatePlayEvent = (event: string): string => {
    const translations: Record<string, string> = {
      'Single': '안타',
      'Double': '2루타',
      'Triple': '3루타',
      'Home Run': '홈런',
      'Strikeout': '삼진',
      'Walk': '볼넷',
      'Groundout': '땅볼',
      'Flyout': '뜬공',
      'Lineout': '직선타',
      'Pop Out': '인필드 플라이',
      'Sacrifice Fly': '희생플라이',
      'Sacrifice Bunt': '희생번트',
      'Hit By Pitch': '몸에 맞는 볼',
      'Stolen Base': '도루',
      'Caught Stealing': '도루 실패',
      'Wild Pitch': '폭투',
      'Passed Ball': '포수 에러',
      'Error': '에러',
      'Fielders Choice': '야수 선택',
      'Force Out': '포스 아웃',
      'Double Play': '병살',
      'Triple Play': '삼중살',
      'Balk': '보크',
      'Intent Walk': '고의사구',
      'Intentional Walk': '고의사구',
      'Grounded Into DP': '병살타',
    };
    return translations[event] || event;
  };
  
  // 선수 기록 포맷팅
  // 현재 사용하지 않는 함수
  // const _formatPlayerStats = (perf: PlayerPerformance) => {
  //   if (!perf.played) {
  //     return '출전하지 않음';
  //   }
  //   
  //   if (perf.batting) {
  //     const { hits, atBats, homeRuns, rbi, runs } = perf.batting;
  //     let result = `${hits}안타`;
  //     if (homeRuns > 0) result += ` ${homeRuns}홈런`;
  //     if (rbi > 0) result += ` ${rbi}타점`;
  //     if (runs > 0) result += ` ${runs}득점`;
  //     return `${hits} for ${atBats} (${result})`;
  //   }
  //   
  //   if (perf.pitching) {
  //     const { inningsPitched, earnedRuns, strikeOuts } = perf.pitching;
  //     return `${inningsPitched}이닝 ${earnedRuns}자책 ${strikeOuts}탈삼진`;
  //   }
  //   
  //   return '기록 없음';
  // };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="sport-card animate-pulse">
            <div className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 날짜별로 그룹화하고 정렬
  const gamesByDate = games.reduce((acc, game) => {
    const gameDate = new Date(game.gameDate);
    // 한국 시간으로 변환
    const koreanDate = new Date(gameDate.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const dateKey = koreanDate.toLocaleDateString('ko-KR', { 
      month: 'numeric', 
      day: 'numeric',
      weekday: 'short'
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(game);
    return acc;
  }, {} as Record<string, MLBGameWithKorean[]>);
  
  // 오늘 날짜 구하기 (한국 시간)
  const todayKorean = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
  const todayStr = todayKorean.toLocaleDateString('ko-KR', { 
    month: 'numeric', 
    day: 'numeric',
    weekday: 'short'
  });
  
  logger.log('Today Korean:', todayKorean);
  logger.log('Today String:', todayStr);
  logger.log('Games by date keys:', Object.keys(gamesByDate));
  
  // 날짜를 정렬 - 단순히 날짜 순서대로 정렬
  const sortedDates = Object.keys(gamesByDate).sort((a, b) => {
    // "12. 9. (월)" 형식에서 월과 일을 추출
    const matchA = a.match(/(\d+)\.\s*(\d+)\./);
    const matchB = b.match(/(\d+)\.\s*(\d+)\./);
    
    if (!matchA || !matchB) return 0;
    
    const monthA = parseInt(matchA[1]);
    const dayA = parseInt(matchA[2]);
    const monthB = parseInt(matchB[1]);
    const dayB = parseInt(matchB[2]);
    
    const year = new Date().getFullYear();
    const dateA = new Date(year, monthA - 1, dayA);
    const dateB = new Date(year, monthB - 1, dayB);
    
    // 단순히 날짜 오름차순으로 정렬 (과거 → 현재 → 미래)
    return dateA.getTime() - dateB.getTime();
  });

  // 날짜가 과거인지 확인 (오늘 제외)
  const isPastDate = (dateString: string): boolean => {
    if (dateString === todayStr) return false; // 오늘은 과거가 아님
    
    // "12. 9. (월)" 형식에서 월과 일을 추출
    const match = dateString.match(/(\d+)\.\s*(\d+)\./);
    if (!match) return false;
    
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    const year = new Date().getFullYear();
    const dateToCheck = new Date(year, month - 1, day);
    const todayDate = new Date(todayKorean.getFullYear(), todayKorean.getMonth(), todayKorean.getDate());
    return dateToCheck < todayDate;
  };

  return (
    <div>
      {/* 필터 버튼들 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setLevelFilter('MLB')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            levelFilter === 'MLB'
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          메이저
        </button>
        <button
          onClick={() => setLevelFilter('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            levelFilter === 'all'
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setLevelFilter('MiLB')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            levelFilter === 'MiLB'
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          마이너
        </button>
        
        {/* 이전 경기 보기 버튼 */}
        <button
          onClick={handleLoadPast}
          className="ml-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
          disabled={loadingMore}
        >
          {loadingMore ? '로딩 중...' : '이전 경기 보기'}
        </button>
      </div>
      
      {games.length === 0 ? (
        <div className="sport-card">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚾</div>
            <p className="text-xl text-gray-700 font-medium">
              경기가 없습니다
            </p>
            <p className="text-gray-500 mt-2">
              이전 경기 보기를 눌러 과거 경기를 확인하세요
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => {
          const dateGames = gamesByDate[date];
          // 오늘 날짜 강조
          const isToday = date === todayStr;
          const isPast = isPastDate(date);
          
          // 모든 경기를 표시 (이미 필터링됨)
          
          return (
            <div key={date} className="space-y-3">
              <h3 className={`text-lg font-bold ${isToday ? 'text-purple-600' : isPast ? 'text-gray-500' : 'text-gray-800'} flex items-center gap-2`}>
                {date}
                {isToday && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">오늘</span>}
                {isPast && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">지난 경기</span>}
              </h3>
              
              {dateGames.map(game => {
                const homePlayers = getKoreanPlayers(game.teams.home.team.id);
                const awayPlayers = getKoreanPlayers(game.teams.away.team.id);
                const hasKoreanPlayers = homePlayers.length > 0 || awayPlayers.length > 0;
                
                if (!hasKoreanPlayers) return null;
                
                const ourPlayers = [...homePlayers, ...awayPlayers];
                const isFinished = game.gameStatus === '경기 종료';
                const isLive = game.gameStatus === '경기 중';
                const isClickable = isFinished || isLive;
                
                return (
                  <div key={game.gamePk} className="sport-card overflow-hidden">
                    <div 
                      className={`p-4 ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => isClickable && fetchGamePerformance(game, ourPlayers.map(p => p.mlbId))}
                    >
                      <div className="flex flex-col gap-3">
                        {/* 팀 매치업과 점수 및 시간 */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          {/* 팀과 점수 - 그리드로 정렬 */}
                          <div className="flex items-center justify-center flex-1">
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 w-full max-w-lg">
                              {/* 원정팀 - 우측 정렬 */}
                              <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
                                <img 
                                  src={mlbService.getTeamLogoUrl(game.teams.away.team.id)} 
                                  alt={game.teams.away.team.name}
                                  className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <span className="font-medium text-xs sm:text-sm text-gray-700 text-right truncate max-w-[80px] sm:max-w-[150px]">
                                  {getKoreanTeamName(game.teams.away.team.name)}
                                </span>
                              </div>
                              
                              {/* 점수 또는 vs - 정중앙 */}
                              {(isLive || isFinished) ? (
                                <div className="flex items-center gap-1 sm:gap-2 justify-center">
                                  <span className="font-bold text-base sm:text-lg">{game.teams.away.score}</span>
                                  <span className="text-xs sm:text-sm text-gray-600 font-semibold">:</span>
                                  <span className="font-bold text-base sm:text-lg">{game.teams.home.score}</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <span className="text-xs text-gray-400">vs</span>
                                </div>
                              )}
                              
                              {/* 홈팀 - 좌측 정렬 */}
                              <div className="flex items-center gap-1 sm:gap-1.5 justify-start">
                                <img 
                                  src={mlbService.getTeamLogoUrl(game.teams.home.team.id)} 
                                  alt={game.teams.home.team.name}
                                  className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <span className="font-medium text-xs sm:text-sm text-gray-700 truncate max-w-[80px] sm:max-w-[150px]">
                                  {getKoreanTeamName(game.teams.home.team.name)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 시간 및 상태 - 우측 정렬 또는 하단 */}
                          <div className="flex items-center gap-2 justify-center sm:justify-end">
                            <span className="text-xs sm:text-sm text-gray-600">
                              {game.koreanDateString?.split(' ').slice(-2).join(' ') || 
                               new Date(game.gameDate).toLocaleTimeString('ko-KR', { 
                                 hour: 'numeric', 
                                 minute: '2-digit',
                                 hour12: true,
                                 timeZone: 'Asia/Seoul'
                               })}
                            </span>
                            {getStatusBadge(game.gameStatus)}
                          </div>
                        </div>
                        
                        {/* 선수 태그 */}
                        <div className="flex flex-wrap items-center gap-2 justify-center">
                          {ourPlayers.map(player => {
                            const playerIsHome = homePlayers.some(p => p.id === player.id);
                            return (
                              <button
                                key={player.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/player/${player.id}`);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors text-xs sm:text-sm"
                              >
                                <span className="font-semibold">
                                  {player.name}
                                </span>
                                <span className="text-xs opacity-75">
                                  {playerIsHome ? '홈' : '원정'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        </div>
      )}

      {/* 더 보기 버튼 */}
      {games.length > 0 && !loading && (
        <div className="flex justify-center py-6">
          {loadingMore ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              <span className="ml-2 text-gray-600">로딩 중...</span>
            </div>
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-8 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              더 보기
            </button>
          )}
        </div>
      )}

      {/* 게임 상세 모달 */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={selectedGame ? `${getKoreanTeamName(selectedGame.teams.away.team.name)} vs ${getKoreanTeamName(selectedGame.teams.home.team.name)}` : ''}
      >
        {selectedGame && (
          <div className="space-y-6">
            {/* 경기 정보 - 심플한 헤더 */}
            <div className="text-center space-y-2">
              {/* 모바일: 세로 정렬, 데스크톱: 가로 정렬 */}
              <div className="block sm:hidden">
                {/* 모바일 레이아웃 */}
                <div className="flex items-center justify-center gap-2">
                  <img 
                    src={mlbService.getTeamLogoUrl(selectedGame.teams.away.team.id)} 
                    alt={selectedGame.teams.away.team.name}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="font-semibold text-sm">{getKoreanTeamName(selectedGame.teams.away.team.name)}</span>
                  <span className="text-xl font-bold text-gray-900">{selectedGame.teams.away.score}</span>
                </div>
                <div className="text-sm text-gray-500 my-1">vs</div>
                <div className="flex items-center justify-center gap-2">
                  <img 
                    src={mlbService.getTeamLogoUrl(selectedGame.teams.home.team.id)} 
                    alt={selectedGame.teams.home.team.name}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="font-semibold text-sm">{getKoreanTeamName(selectedGame.teams.home.team.name)}</span>
                  <span className="text-xl font-bold text-gray-900">{selectedGame.teams.home.score}</span>
                </div>
              </div>
              {/* 데스크톱 레이아웃 */}
              <div className="hidden sm:flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={mlbService.getTeamLogoUrl(selectedGame.teams.away.team.id)} 
                    alt={selectedGame.teams.away.team.name}
                    className="w-8 h-8"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="font-semibold text-lg">{getKoreanTeamName(selectedGame.teams.away.team.name)}</span>
                  <span className="text-2xl font-bold text-gray-900">{selectedGame.teams.away.score}</span>
                </div>
                <span className="text-lg text-gray-500">vs</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{selectedGame.teams.home.score}</span>
                  <span className="font-semibold text-lg">{getKoreanTeamName(selectedGame.teams.home.team.name)}</span>
                  <img 
                    src={mlbService.getTeamLogoUrl(selectedGame.teams.home.team.id)} 
                    alt={selectedGame.teams.home.team.name}
                    className="w-8 h-8"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {selectedGame.koreanDateString} | {selectedGame.venue.name}
              </div>
            </div>

            {/* 경기 박스스코어 */}
            {loadingPerformance ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-sm text-gray-600 mt-2">경기 기록 불러오는 중...</p>
              </div>
            ) : (
              <>
                {gameBoxscore && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">경기 기록</h3>
                    
                    {/* 팀 통계 - 가로 레이아웃 */}
                    <div className="space-y-3">
                      {/* 원정 팀 */}
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img 
                            src={mlbService.getTeamLogoUrl(selectedGame.teams.away.team.id)} 
                            alt={selectedGame.teams.away.team.name}
                            className="w-5 sm:w-6 h-5 sm:h-6"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="font-semibold text-sm sm:text-base text-gray-900">{getKoreanTeamName(selectedGame.teams.away.team.name)}</div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
                          <div className="flex-1 bg-white rounded p-1.5 sm:p-2 text-center">
                            <div className="text-xs text-gray-500">득점</div>
                            <div className="text-base sm:text-lg font-bold">{gameBoxscore.teams?.away?.teamStats?.batting?.runs ?? selectedGame.teams.away.score ?? 0}</div>
                          </div>
                          <div className="flex-1 bg-white rounded p-1.5 sm:p-2 text-center">
                            <div className="text-xs text-gray-500">안타</div>
                            <div className="text-base sm:text-lg font-bold">{gameBoxscore.teams?.away?.teamStats?.batting?.hits ?? 0}</div>
                          </div>
                          <div className="flex-1 bg-white rounded p-1.5 sm:p-2 text-center">
                            <div className="text-xs text-gray-500">실책</div>
                            <div className="text-base sm:text-lg font-bold">{gameBoxscore.teams?.away?.teamStats?.batting?.errors ?? 0}</div>
                          </div>
                          <div className="flex-1 bg-white rounded p-1.5 sm:p-2 text-center">
                            <div className="text-xs text-gray-500">잔루</div>
                            <div className="text-base sm:text-lg font-bold">{gameBoxscore.teams?.away?.teamStats?.batting?.leftOnBase ?? 0}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 홈 팀 */}
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img 
                            src={mlbService.getTeamLogoUrl(selectedGame.teams.home.team.id)} 
                            alt={selectedGame.teams.home.team.name}
                            className="w-5 sm:w-6 h-5 sm:h-6"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="font-semibold text-sm sm:text-base text-gray-900">{getKoreanTeamName(selectedGame.teams.home.team.name)}</div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
                          <div className="flex-1 bg-white rounded p-1.5 sm:p-2 text-center">
                            <div className="text-xs text-gray-500">득점</div>
                            <div className="text-base sm:text-lg font-bold">{gameBoxscore.teams?.home?.teamStats?.batting?.runs ?? selectedGame.teams.home.score ?? 0}</div>
                          </div>
                          <div className="flex-1 bg-white rounded p-1.5 sm:p-2 text-center">
                            <div className="text-xs text-gray-500">안타</div>
                            <div className="text-base sm:text-lg font-bold">{gameBoxscore.teams?.home?.teamStats?.batting?.hits ?? 0}</div>
                          </div>
                          <div className="flex-1 bg-white rounded p-1.5 sm:p-2 text-center">
                            <div className="text-xs text-gray-500">실책</div>
                            <div className="text-base sm:text-lg font-bold">{gameBoxscore.teams?.home?.teamStats?.batting?.errors ?? 0}</div>
                          </div>
                          <div className="flex-1 bg-white rounded p-1.5 sm:p-2 text-center">
                            <div className="text-xs text-gray-500">잔루</div>
                            <div className="text-base sm:text-lg font-bold">{gameBoxscore.teams?.home?.teamStats?.batting?.leftOnBase ?? 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  
                  {/* 이닝별 스코어 */}
                  {gameBoxscore.linescore && gameBoxscore.linescore.innings && gameBoxscore.linescore.innings.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-2">이닝별 기록</h4>
                      <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <table className="min-w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1 sm:py-2 px-1 sm:px-2 text-xs sm:text-sm">팀</th>
                            {gameBoxscore.linescore.innings.map(inning => (
                              <th key={inning.num} className="text-center px-1 sm:px-2 text-xs sm:text-sm">{inning.num}</th>
                            ))}
                            <th className="text-center px-1 sm:px-2 font-bold text-xs sm:text-sm">R</th>
                            <th className="text-center px-1 sm:px-2 text-xs sm:text-sm">H</th>
                            <th className="text-center px-1 sm:px-2 text-xs sm:text-sm">E</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-1 sm:py-2 px-1 sm:px-2 font-medium text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none">{getKoreanTeamName(selectedGame.teams.away.team.name)}</td>
                            {gameBoxscore.linescore.innings.map(inning => (
                              <td key={inning.num} className="text-center px-1 sm:px-2 text-xs sm:text-sm">
                                {inning.away.runs ?? '-'}
                              </td>
                            ))}
                            <td className="text-center px-1 sm:px-2 font-bold text-xs sm:text-sm">
                              {gameBoxscore.teams?.away?.teamStats?.batting?.runs ?? selectedGame.teams.away.score ?? 0}
                            </td>
                            <td className="text-center px-1 sm:px-2 text-xs sm:text-sm">
                              {gameBoxscore.teams?.away?.teamStats?.batting?.hits ?? 0}
                            </td>
                            <td className="text-center px-1 sm:px-2 text-xs sm:text-sm">
                              {gameBoxscore.teams?.away?.teamStats?.batting?.errors ?? 0}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 sm:py-2 px-1 sm:px-2 font-medium text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none">{getKoreanTeamName(selectedGame.teams.home.team.name)}</td>
                            {gameBoxscore.linescore.innings.map(inning => (
                              <td key={inning.num} className="text-center px-1 sm:px-2 text-xs sm:text-sm">
                                {inning.home.runs ?? '-'}
                              </td>
                            ))}
                            <td className="text-center px-1 sm:px-2 font-bold text-xs sm:text-sm">
                              {gameBoxscore.teams?.home?.teamStats?.batting?.runs ?? selectedGame.teams.home.score ?? 0}
                            </td>
                            <td className="text-center px-1 sm:px-2 text-xs sm:text-sm">
                              {gameBoxscore.teams?.home?.teamStats?.batting?.hits ?? 0}
                            </td>
                            <td className="text-center px-1 sm:px-2 text-xs sm:text-sm">
                              {gameBoxscore.teams?.home?.teamStats?.batting?.errors ?? 0}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    </div>
                  )}
                  
                  {/* 이닝별 플레이 기록 - 토글 */}
                  <div>
                    <button
                      onClick={() => setShowInningDetails(!showInningDetails)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <span className={`transform transition-transform ${showInningDetails ? 'rotate-90' : ''}`}>▶</span>
                      이닝별 상세 기록
                    </button>
                    
                    {showInningDetails && gameLiveFeed && gameLiveFeed.liveData?.plays?.allPlays && gameLiveFeed.liveData.plays.allPlays.length > 0 ? (() => {
                    // 이닝별로 그룹화
                    const playsByInning = gameLiveFeed.liveData.plays.allPlays
                      .filter(play => play.result.type === 'atBat' || play.result.eventType === 'game_event')
                      .reduce((acc, play) => {
                        const key = `${play.about.inning}-${play.about.halfInning}`;
                        if (!acc[key]) {
                          acc[key] = {
                            inning: play.about.inning,
                            halfInning: play.about.halfInning,
                            plays: []
                          };
                        }
                        acc[key].plays.push(play);
                        return acc;
                      }, {} as Record<string, any>);
                    
                    return (
                      <div className="mt-3">
                        <div className="max-h-96 overflow-y-auto bg-gray-50 rounded p-2 sm:p-3 space-y-4 text-xs sm:text-sm">
                          {Object.values(playsByInning).map((inningGroup: any, groupIndex) => (
                            <div key={groupIndex} className="border-b border-gray-300 pb-3 last:border-0">
                              <div className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                                {inningGroup.inning}회 {inningGroup.halfInning === 'top' ? '초' : '말'}
                              </div>
                              <div className="space-y-2 pl-2 sm:pl-3">
                                {inningGroup.plays.map((play: any, playIndex: number) => (
                                  <div key={playIndex} className="border-l-2 border-gray-300 pl-2 sm:pl-3">
                                    <div className="text-gray-600 text-xs sm:text-sm">
                                      {play.matchup && (
                                        <span className="block sm:inline">
                                          타자: {play.matchup.batter.fullName} <span className="hidden sm:inline">vs</span><br className="sm:hidden" /> 투수: {play.matchup.pitcher.fullName}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-gray-800 mt-1">
                                      <span className="font-medium text-xs sm:text-sm">{translatePlayEvent(play.result.event)}</span>
                                      {play.result.rbi > 0 && (
                                        <span className="text-green-600 ml-2 text-xs sm:text-sm">({play.result.rbi}타점)</span>
                                      )}
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">
                                      {play.result.description}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })() : null}
                  </div>
                </div>
              )}
              
              {/* 한국 선수 기록 */}
              {!loadingPerformance && gamePerformances.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">한국 선수 기록</h3>
                <div className="space-y-4">
                {gamePerformances.map((perf, idx) => {
                  const isPitcher = perf.position === 'P';
                  const isTwoWayPlayer = perf.position === 'TWP';
                  
                  // 투수/타자별 기록 정리
                  let pitcherStats = null;
                  let batterStats = null;
                  
                  // 투수 기록 처리
                  if ((isPitcher || isTwoWayPlayer) && perf.pitching) {
                    let mainStat = '';
                    let subStats = [];
                    
                    if (perf.pitching.inningsPitched) {
                      // 자책점을 메인으로
                      if (perf.pitching.earnedRuns === 0) {
                        mainStat = '무자책';
                      } else if (perf.pitching.earnedRuns > 0) {
                        mainStat = `${perf.pitching.earnedRuns}자책`;
                      }
                      
                      // 나머지는 서브로
                      if (perf.pitching.strikeOuts > 0) subStats.push(`${perf.pitching.strikeOuts}탈삼진`);
                      if (perf.pitching.baseOnBalls > 0) subStats.push(`${perf.pitching.baseOnBalls}사구`);
                      if (perf.pitching.hits > 0) subStats.push(`${perf.pitching.hits}피안타`);
                    }
                    
                    pitcherStats = {
                      mainStat: mainStat,
                      subStats: subStats,
                      innings: perf.pitching.inningsPitched || '-'
                    };
                  }
                  
                  // 타자 기록 처리
                  if ((!isPitcher || isTwoWayPlayer) && perf.batting) {
                    let stats = [];
                    if (perf.batting.hits > 0) {
                      stats.push(`${perf.batting.hits}안타`);
                    } else if (perf.batting.atBats > 0) {
                      stats.push('무안타');
                    }
                    if (perf.batting.homeRuns > 0) stats.push(`${perf.batting.homeRuns}홈런`);
                    if (perf.batting.rbi > 0) stats.push(`${perf.batting.rbi}타점`);
                    if (perf.batting.runs > 0) stats.push(`${perf.batting.runs}득점`);
                    if (perf.batting.baseOnBalls > 0) stats.push(`${perf.batting.baseOnBalls}볼넷`);
                    if ((perf.batting as any).stolenBases > 0) stats.push(`${(perf.batting as any).stolenBases}도루`);
                    
                    batterStats = {
                      stats: stats,
                      hits: perf.batting.hits || 0,
                      atBats: perf.batting.atBats || 0
                    };
                  }
                  
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors overflow-hidden">
                      {/* 상단 파란색 바 */}
                      <div className="h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {/* 선수 정보 */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-3">
                              <span className="font-bold text-lg text-gray-900">
                                {mlbPlayers.find(p => p.mlbId === perf.playerId)?.name || perf.playerName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {getKoreanTeamName(perf.team)} - {getKoreanPosition(perf.position)}
                                </span>
                                {perf.battingOrder && (
                                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                    {perf.battingOrder}번 타자
                                  </span>
                                )}
                              </div>
                            </div>
                            
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
                                  {isPitcher && pitcherStats ? (
                                    <>
                                      <span className="text-xl font-bold text-gray-900">
                                        {pitcherStats.mainStat}
                                      </span>
                                      {pitcherStats.subStats.length > 0 && (
                                        <span className="text-base text-gray-600">
                                          {pitcherStats.subStats.join(' ')}
                                        </span>
                                      )}
                                    </>
                                  ) : batterStats ? (
                                    <span className="text-xl font-bold text-gray-900">
                                      {batterStats.stats.length > 0 ? batterStats.stats.join(' ') : '무안타'}
                                    </span>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* 배지 표시 */}
                          <div className="ml-4">
                            <div className="relative">
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
                                            <span className="font-bold">{pitcherStats.innings}이닝</span>
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
                                        <div className="text-2xl font-bold">
                                          {isPitcher && pitcherStats ? pitcherStats.innings : batterStats ? `${batterStats.hits}` : '-'}
                                        </div>
                                        <div className="text-xs opacity-80 uppercase tracking-wider">
                                          {isPitcher ? '이닝' : 'Hit'}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {!isPitcher && !isTwoWayPlayer && batterStats && (
                                    <>
                                      <div className="w-px h-10 bg-white/30"></div>
                                      <div className="text-white">
                                        <div className="text-2xl font-bold">{batterStats.atBats}</div>
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
                  
                  {perf.inningStats && perf.inningStats.length > 0 && (
                    <div className="px-4 pb-4">
                      <div className="border-t pt-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">타석별 상세 기록</div>
                        <div className="grid grid-cols-1 gap-2">
                          {perf.inningStats.map((inning, inningIdx) => {
                            const vsKoreanName = mlbPlayers.find(p => 
                              inning.pitcher?.toLowerCase().includes(p.name.toLowerCase()) ||
                              inning.pitcher?.includes(p.mlbId.toString())
                            )?.name;
                            
                            return (
                              <div key={inningIdx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm bg-gray-50 rounded px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-700">{inning.inning}:</span>
                                  <span className="font-semibold text-purple-600">{inning.result}</span>
                                  {inning.rbi > 0 && (
                                    <span className="text-green-600 font-medium">({inning.rbi}타점)</span>
                                  )}
                                </div>
                                {inning.description && inning.description.includes('(') && (
                                  <span className="text-gray-500 text-xs block">
                                    {inning.description.match(/\([^)]*\)/)?.[0]}
                                  </span>
                                )}
                                {inning.pitcher && (
                                  <span className="text-gray-500 text-xs">vs {vsKoreanName || inning.pitcher}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
          )}
          </>
        )}
      </div>
    )}
  </Modal>
  </div>
  );
};