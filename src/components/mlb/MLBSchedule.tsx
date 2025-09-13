import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { mlbService } from '../../services/mlbService';
import { mlbPlayers } from '../../data/mlbPlayers';
import { getKoreanTeamName } from '../../data/mlbTeamNames';

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

export const MLBSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<MLBGameWithKorean[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysToShow, setDaysToShow] = useState(7);
  const [loadingMore, setLoadingMore] = useState(false);
  const [levelFilter, setLevelFilter] = useState<'all' | 'MLB' | 'MiLB'>('MLB'); // 기본값 메이저
  const [playersWithInfo, setPlayersWithInfo] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      
      // 선수 정보 먼저 업데이트
      const players = playersWithInfo.length > 0 ? playersWithInfo : await updatePlayersInfo();
      
      // 레벨 필터에 따라 선수 필터링
      let filteredPlayers = players;
      if (levelFilter === 'MLB') {
        filteredPlayers = players.filter(p => p.level === 'MLB');
      } else if (levelFilter === 'MiLB') {
        filteredPlayers = players.filter(p => p.level === 'MiLB');
      }
      
      // 필터된 선수들이 속한 팀 ID들
      const teamIds = [...new Set(filteredPlayers.map(p => p.teamId).filter(id => id > 0))];
      const allGames = await mlbService.getUpcomingGames(teamIds, daysToShow);
      
      // 오늘 이전 경기들에 대해서만 출전 여부 확인
      const now = new Date();
      const playerGamePks = new Set<number>();
      
      // 과거 경기에 대해 선수 출전 기록 확인
      for (const player of filteredPlayers) {
        const recentGames = await mlbService.getPlayerRecentGames(
          player.mlbId,
          50, // 최근 50경기
          daysToShow,
          player.sportId
        );
        recentGames.forEach((game: any) => {
          if (game.gamePk) {
            playerGamePks.add(game.gamePk);
          }
        });
      }
      
      // 과거 경기는 출전 기록이 있는 경기만, 미래 경기는 모두 표시
      const filteredGames = allGames.filter(game => {
        const gameDate = new Date(game.gameDate);
        // 미래 경기는 모두 표시
        if (gameDate > now) return true;
        // 과거 경기는 출전한 경기만
        return playerGamePks.has(game.gamePk);
      });
      
      setGames(filteredGames as MLBGameWithKorean[]);
      setLoading(false);
    };

    fetchGames();
  }, [daysToShow, levelFilter, playersWithInfo, updatePlayersInfo]);

  const loadMoreGames = useCallback(async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    const newDays = daysToShow + 7;
    setDaysToShow(newDays);
    
    // 선수 정보 먼저 업데이트
    const players = playersWithInfo.length > 0 ? playersWithInfo : await updatePlayersInfo();
    
    // 레벨 필터에 따라 선수 필터링
    let filteredPlayers = players;
    if (levelFilter === 'MLB') {
      filteredPlayers = players.filter(p => p.level === 'MLB');
    } else if (levelFilter === 'MiLB') {
      filteredPlayers = players.filter(p => p.level === 'MiLB');
    }
    
    const teamIds = [...new Set(filteredPlayers.map(p => p.teamId).filter(id => id > 0))];
    const allGames = await mlbService.getUpcomingGames(teamIds, newDays);
    
    setGames(allGames as MLBGameWithKorean[]);
    setLoadingMore(false);
  }, [daysToShow, loadingMore, levelFilter, playersWithInfo, updatePlayersInfo]);

  // 무한 스크롤
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 100) {
        loadMoreGames();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreGames]);

  const getKoreanPlayers = (teamId: number) => {
    const players = playersWithInfo.length > 0 ? playersWithInfo : mlbPlayers;
    return players.filter(p => p.teamId === teamId);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      '경기 중': 'bg-red-500 text-white animate-pulse',
      '경기 종료': 'bg-gray-500 text-white',
      '경기 예정': 'bg-gray-600 text-white',
      '연기': 'bg-yellow-500 text-white',
      '취소': 'bg-gray-400 text-white'
    };

    return (
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[status] || 'bg-gray-400 text-white'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        {/* 필터 버튼들 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLevelFilter('MLB')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              levelFilter === 'MLB'
                ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            메이저
          </button>
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              levelFilter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setLevelFilter('MiLB')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              levelFilter === 'MiLB'
                ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            마이너
          </button>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="sport-card animate-pulse">
              <div className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div>
        {/* 필터 버튼들 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLevelFilter('MLB')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              levelFilter === 'MLB'
                ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            메이저
          </button>
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              levelFilter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setLevelFilter('MiLB')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              levelFilter === 'MiLB'
                ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            마이너
          </button>
        </div>
        
        <div className="sport-card">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚾</div>
            <p className="text-xl text-gray-700 font-medium">
              {levelFilter === 'MiLB' ? '마이너리그' : levelFilter === 'MLB' ? '메이저리그' : ''} 향후 7일간 경기가 없습니다
            </p>
            <p className="text-gray-500 mt-2">다음 주에 다시 확인해주세요</p>
          </div>
        </div>
      </div>
    );
  }

  // 날짜별로 그룹화
  const gamesByDate = games.reduce((acc, game) => {
    const dateKey = new Date(game.gameDate).toLocaleDateString('ko-KR', { 
      month: 'numeric', 
      day: 'numeric',
      weekday: 'short'
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(game);
    return acc;
  }, {} as Record<string, MLBGameWithKorean[]>);

  return (
    <div>
      {/* 필터 버튼들 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setLevelFilter('MLB')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            levelFilter === 'MLB'
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          메이저
        </button>
        <button
          onClick={() => setLevelFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            levelFilter === 'all'
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setLevelFilter('MiLB')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            levelFilter === 'MiLB'
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          마이너
        </button>
      </div>
      
      <div className="space-y-6">
        {Object.entries(gamesByDate).map(([date, dateGames]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">{date}</h3>
          
          {dateGames.map(game => {
            const homePlayers = getKoreanPlayers(game.teams.home.team.id);
            const awayPlayers = getKoreanPlayers(game.teams.away.team.id);
            const hasKoreanPlayers = homePlayers.length > 0 || awayPlayers.length > 0;
            
            // 한국 선수가 없는 경기는 스킵
            if (!hasKoreanPlayers) return null;
            
            const ourPlayers = [...homePlayers, ...awayPlayers];
            const isHome = homePlayers.length > 0;
            
            return (
              <div key={game.gamePk} className="sport-card overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    {/* 선수 정보 */}
                    <div className="flex flex-wrap items-center gap-2">
                      {ourPlayers.map(player => {
                        const playerIsHome = homePlayers.some(p => p.id === player.id);
                        return (
                          <button
                            key={player.id}
                            onClick={() => navigate(`/player/${player.id}`)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors cursor-pointer text-sm"
                          >
                            <span className="font-semibold text-sm">
                              {player.name}
                            </span>
                            <span className="text-xs opacity-75">
                              {playerIsHome ? '홈' : '원정'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* 팀 대 팀 매치업 */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <img 
                          src={mlbService.getTeamLogoUrl(game.teams.away.team.id)} 
                          alt={game.teams.away.team.name}
                          className="w-5 h-5"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="font-medium text-gray-700">
                          {getKoreanTeamName(game.teams.away.team.name)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">vs</span>
                      <div className="flex items-center gap-1.5">
                        <img 
                          src={mlbService.getTeamLogoUrl(game.teams.home.team.id)} 
                          alt={game.teams.home.team.name}
                          className="w-5 h-5"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="font-medium text-gray-700">
                          {getKoreanTeamName(game.teams.home.team.name)}
                        </span>
                      </div>
                    </div>
                    
                    {/* 시간 및 상태 */}
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {game.koreanDateString?.split(' ').slice(-2).join(' ') || 
                         new Date(game.gameDate).toLocaleTimeString('ko-KR', { 
                           hour: 'numeric', 
                           minute: '2-digit',
                           hour12: true,
                           timeZone: 'Asia/Seoul'
                         })}
                      </span>
                      {getStatusBadge(game.gameStatus)}
                      
                      {/* 점수 (경기 중이거나 종료된 경우) */}
                      {(game.gameStatus === '경기 중' || game.gameStatus === '경기 종료') && (
                        <div className="flex items-center gap-2 ml-2 font-bold">
                          <span className={isHome ? 'text-blue-600' : 'text-gray-600'}>
                            {isHome ? game.teams.home.score : game.teams.away.score}
                          </span>
                          <span className="text-gray-400">:</span>
                          <span className={!isHome ? 'text-blue-600' : 'text-gray-600'}>
                            {isHome ? game.teams.away.score : game.teams.home.score}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
        {/* 로딩 인디케이터 */}
        {loadingMore && games.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600 mt-2">더 많은 경기 불러오는 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};