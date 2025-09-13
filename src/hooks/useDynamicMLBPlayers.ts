// 동적 MLB 선수 정보 관리 Hook
// 실시간으로 선수들의 현재 상태를 추적하고 자동 분류

import { useState, useEffect } from 'react';
import { 
  DynamicPlayerInfo, 
  fetchAllPlayersInfo,
  detectLevelChanges 
} from '../services/mlbPlayerService';
import { logger } from '../utils/logger';

interface UseDynamicMLBPlayersReturn {
  mlbPlayers: DynamicPlayerInfo[];
  tripleAPlayers: DynamicPlayerInfo[];
  doubleAPlayers: DynamicPlayerInfo[];
  singleAPlayers: DynamicPlayerInfo[];
  rookiePlayers: DynamicPlayerInfo[];
  allPlayers: DynamicPlayerInfo[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  levelChanges: Array<{player: string, oldLevel: string, newLevel: string}>;
  refresh: () => void;
}

export function useDynamicMLBPlayers(): UseDynamicMLBPlayersReturn {
  const [playersByLevel, setPlayersByLevel] = useState<Map<string, DynamicPlayerInfo[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [levelChanges, setLevelChanges] = useState<Array<{player: string, oldLevel: string, newLevel: string}>>([]);

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 레벨 변경 감지
      const changes = await detectLevelChanges();
      if (changes.length > 0) {
        setLevelChanges(changes);
        logger.log('🔄 선수 레벨 변경 감지:', changes);
      }
      
      // 모든 선수 정보 가져오기
      const players = await fetchAllPlayersInfo();
      setPlayersByLevel(players);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '선수 정보를 불러오는데 실패했습니다');
      logger.error('선수 정보 로딩 에러:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadPlayers();
    
    // 5분마다 자동 새로고침
    const interval = setInterval(loadPlayers, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 레벨별 선수 추출
  const mlbPlayers = playersByLevel.get('MLB') || [];
  const tripleAPlayers = playersByLevel.get('Triple-A') || [];
  const doubleAPlayers = playersByLevel.get('Double-A') || [];
  const singleAPlayers = [
    ...(playersByLevel.get('Single-A') || []),
    ...(playersByLevel.get('Single-A Advanced') || [])
  ];
  const rookiePlayers = [
    ...(playersByLevel.get('Rookie') || []),
    ...(playersByLevel.get('Rookie Advanced') || [])
  ];
  
  // 모든 선수
  const allPlayers = [
    ...mlbPlayers,
    ...tripleAPlayers,
    ...doubleAPlayers,
    ...singleAPlayers,
    ...rookiePlayers
  ];

  return {
    mlbPlayers,
    tripleAPlayers,
    doubleAPlayers,
    singleAPlayers,
    rookiePlayers,
    allPlayers,
    isLoading,
    error,
    lastUpdated,
    levelChanges,
    refresh: loadPlayers
  };
}