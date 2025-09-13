// MLB 선수 정보 동적 관리 서비스
// API에서 실시간으로 선수 정보를 가져와 자동 분류

import { trackedPlayers, getKoreanName } from '../data/mlbPlayerIds';

export interface DynamicPlayerInfo {
  mlbId: number;
  nameKr: string;
  nameEn: string;
  team: string;
  teamId: number;
  position: string;
  jerseyNumber: number;
  level: 'MLB' | 'Triple-A' | 'Double-A' | 'Single-A' | 'Rookie' | 'Unknown';
  league?: string;
  sportId: number;
  currentStatus: 'active' | 'injured' | 'inactive';
  lastUpdated: Date;
}

// MLB API의 sport ID 매핑
const SPORT_LEVEL_MAP: Record<number, string> = {
  1: 'MLB',
  11: 'Triple-A',
  12: 'Double-A',
  13: 'Single-A Advanced',
  14: 'Single-A',
  15: 'Short Season A',
  16: 'Rookie',
  5: 'Rookie Advanced',
};

// 선수 한 명의 실시간 정보 가져오기
export async function fetchPlayerInfo(mlbId: number): Promise<DynamicPlayerInfo | null> {
  try {
    // 1. 선수 기본 정보 가져오기
    const response = await fetch(`/api/mlb/people/${mlbId}?hydrate=currentTeam,team`);
    const data = await response.json();
    
    if (!data.people || data.people.length === 0) {
      console.error(`선수 정보를 찾을 수 없음: ${mlbId}`);
      return null;
    }
    
    const player = data.people[0];
    const currentTeam = player.currentTeam;
    
    // 2. 팀의 sport 정보로 레벨 판단
    const sportId = currentTeam?.sport?.id || 1;
    const level = SPORT_LEVEL_MAP[sportId] || 'Unknown';
    
    // 3. 동적 선수 정보 생성
    const playerInfo: DynamicPlayerInfo = {
      mlbId: player.id,
      nameKr: getKoreanName(player.id),
      nameEn: player.fullName,
      team: currentTeam?.name || 'Free Agent',
      teamId: currentTeam?.id || 0,
      position: player.primaryPosition?.abbreviation || 'DH',
      jerseyNumber: parseInt(player.primaryNumber) || 0,
      level: level as DynamicPlayerInfo['level'],
      league: currentTeam?.league?.name,
      sportId: sportId,
      currentStatus: player.active ? 'active' : 'inactive',
      lastUpdated: new Date(),
    };
    
    return playerInfo;
  } catch (error) {
    console.error(`선수 정보 가져오기 실패 (ID: ${mlbId}):`, error);
    return null;
  }
}

// 모든 추적 선수들의 정보 가져오기
export async function fetchAllPlayersInfo(): Promise<Map<string, DynamicPlayerInfo[]>> {
  const playersByLevel = new Map<string, DynamicPlayerInfo[]>();
  
  // 초기화
  playersByLevel.set('MLB', []);
  playersByLevel.set('Triple-A', []);
  playersByLevel.set('Double-A', []);
  playersByLevel.set('Single-A', []);
  playersByLevel.set('Rookie', []);
  
  // 병렬로 모든 선수 정보 가져오기
  const promises = trackedPlayers.map(p => fetchPlayerInfo(p.mlbId));
  const results = await Promise.all(promises);
  
  // 레벨별로 자동 분류
  results.forEach(playerInfo => {
    if (playerInfo) {
      const level = playerInfo.level;
      const levelPlayers = playersByLevel.get(level) || [];
      levelPlayers.push(playerInfo);
      playersByLevel.set(level, levelPlayers);
    }
  });
  
  return playersByLevel;
}

// 선수 정보 캐싱 (5분간 유지)
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const playerCache = new Map<number, { data: DynamicPlayerInfo; timestamp: number }>();

export async function getCachedPlayerInfo(mlbId: number): Promise<DynamicPlayerInfo | null> {
  const cached = playerCache.get(mlbId);
  const now = Date.now();
  
  // 캐시가 유효한 경우
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  // 새로 가져오기
  const freshData = await fetchPlayerInfo(mlbId);
  if (freshData) {
    playerCache.set(mlbId, { data: freshData, timestamp: now });
  }
  
  return freshData;
}

// 선수 레벨 변경 감지
export async function detectLevelChanges(): Promise<Array<{player: string, oldLevel: string, newLevel: string}>> {
  const changes: Array<{player: string, oldLevel: string, newLevel: string}> = [];
  
  for (const player of trackedPlayers) {
    const cached = playerCache.get(player.mlbId);
    const current = await fetchPlayerInfo(player.mlbId);
    
    if (cached && current && cached.data.level !== current.level) {
      changes.push({
        player: player.nameKr,
        oldLevel: cached.data.level,
        newLevel: current.level
      });
    }
  }
  
  return changes;
}

// 팀별 선수 그룹핑 (동적)
export async function getPlayersByTeam(): Promise<Map<string, DynamicPlayerInfo[]>> {
  const playersByTeam = new Map<string, DynamicPlayerInfo[]>();
  
  const allPlayers = await fetchAllPlayersInfo();
  
  allPlayers.forEach((players) => {
    players.forEach(player => {
      const teamPlayers = playersByTeam.get(player.team) || [];
      teamPlayers.push(player);
      playersByTeam.set(player.team, teamPlayers);
    });
  });
  
  return playersByTeam;
}