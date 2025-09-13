// MLB 한국/일본 선수 ID 리스트 (최소한의 하드코딩)
// API에서 실시간으로 선수 정보를 가져오기 위한 ID만 저장

export interface PlayerIdEntry {
  mlbId: number;
  nameKr: string;  // 한글 이름만 하드코딩 (API에 없으므로)
}

// 추적할 선수들의 MLB ID와 한글 이름만 관리
export const trackedPlayers: PlayerIdEntry[] = [
  // 메이저/마이너 구분 없이 모든 선수
  { mlbId: 673490, nameKr: '김하성' },
  { mlbId: 808982, nameKr: '이정후' },
  { mlbId: 808975, nameKr: '김혜성' },
  { mlbId: 678225, nameKr: '배지환' },
  { mlbId: 660271, nameKr: '오타니 쇼헤이' },
  { mlbId: 808970, nameKr: '고우석' },
  { mlbId: 800231, nameKr: '조원빈' },
  { mlbId: 815794, nameKr: '장현석' },
  { mlbId: 683425, nameKr: '최현일' },
  { mlbId: 805870, nameKr: '엄형찬' },
  { mlbId: 834605, nameKr: '김성준' },
  { mlbId: 829748, nameKr: '이현승' },
  { mlbId: 806739, nameKr: '김준석' },
];

// 선수 ID로 한글 이름 찾기
export function getKoreanName(mlbId: number): string {
  const player = trackedPlayers.find(p => p.mlbId === mlbId);
  return player?.nameKr || '';
}