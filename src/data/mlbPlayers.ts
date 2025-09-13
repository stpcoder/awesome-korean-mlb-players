// MLB 한국/일본 선수 데이터
// MLB ID와 한글 이름만 하드코딩, 나머지는 API로 실시간 조회

export interface MLBPlayerInfo {
  id: string;  // 내부 ID
  mlbId: number;  // MLB API ID (필수)
  name: string;  // 한글 이름 (필수)
  nameEn?: string;  // 영문 이름 (API에서 조회)
  team?: string;  // 팀명 (API에서 조회)
  teamId?: number;  // 팀 ID (API에서 조회)
  position?: string;  // 포지션 (API에서 조회)
  jerseyNumber?: number;  // 등번호 (API에서 조회)
  nationality: 'KOR' | 'JPN';  // 국적
  level?: 'MLB' | 'MiLB';  // 메이저/마이너 구분 (API에서 조회)
  league?: string;  // 마이너리그 레벨 (API에서 조회)
  sportId?: number;  // MLB API sport ID (API에서 조회)
  profileImage?: string;  // 프로필 이미지 (API에서 조회)
}

export const mlbPlayers: MLBPlayerInfo[] = [
  // 한국 선수들
  {
    id: 'kim-haseong',
    mlbId: 673490,
    name: '김하성',
    nationality: 'KOR',
  },
  {
    id: 'lee-jungho',
    mlbId: 808982,
    name: '이정후',
    nationality: 'KOR',
  },
  {
    id: 'kim-hyeseong',
    mlbId: 808975,
    name: '김혜성',
    nationality: 'KOR',
  },
  {
    id: 'bae-jihwan',
    mlbId: 678225,
    name: '배지환',
    nationality: 'KOR',
  },
  
  // 일본 선수 - 오타니
  {
    id: 'ohtani-shohei',
    mlbId: 660271,
    name: '오타니 쇼헤이',
    nationality: 'JPN',
  },
  
  // 한국 마이너리거들
  {
    id: 'go-woosuk',
    mlbId: 808970,
    name: '고우석',
    nationality: 'KOR',
  },
  {
    id: 'cho-wonbin',
    mlbId: 800231,
    name: '조원빈',
    nationality: 'KOR',
  },
  {
    id: 'jang-hyunseok',
    mlbId: 815794,
    name: '장현석',
    nationality: 'KOR',
  },
  {
    id: 'choi-hyunil',
    mlbId: 683425,
    name: '최현일',
    nationality: 'KOR',
  },
  {
    id: 'um-hyungchan',
    mlbId: 805870,
    name: '엄형찬',
    nationality: 'KOR',
  },
  {
    id: 'kim-seongjun',
    mlbId: 834605,
    name: '김성준',
    nationality: 'KOR',
  },
  {
    id: 'lee-hyunseung',
    mlbId: 829748,
    name: '이현승',
    nationality: 'KOR',
  },
  {
    id: 'kim-junseok',
    mlbId: 806739,
    name: '김준석',
    nationality: 'KOR',
  }
];

// MLB 팀 정보 (API에서 팀 ID 매칭용)
export const mlbTeams = {
  108: { name: 'Los Angeles Angels', abbr: 'LAA', league: 'AL', division: 'West' },
  109: { name: 'Arizona Diamondbacks', abbr: 'ARI', league: 'NL', division: 'West' },
  110: { name: 'Baltimore Orioles', abbr: 'BAL', league: 'AL', division: 'East' },
  111: { name: 'Boston Red Sox', abbr: 'BOS', league: 'AL', division: 'East' },
  112: { name: 'Chicago Cubs', abbr: 'CHC', league: 'NL', division: 'Central' },
  113: { name: 'Cincinnati Reds', abbr: 'CIN', league: 'NL', division: 'Central' },
  114: { name: 'Cleveland Guardians', abbr: 'CLE', league: 'AL', division: 'Central' },
  115: { name: 'Colorado Rockies', abbr: 'COL', league: 'NL', division: 'West' },
  116: { name: 'Detroit Tigers', abbr: 'DET', league: 'AL', division: 'Central' },
  117: { name: 'Houston Astros', abbr: 'HOU', league: 'AL', division: 'West' },
  118: { name: 'Kansas City Royals', abbr: 'KC', league: 'AL', division: 'Central' },
  119: { name: 'Los Angeles Dodgers', abbr: 'LAD', league: 'NL', division: 'West' },
  120: { name: 'Washington Nationals', abbr: 'WSH', league: 'NL', division: 'East' },
  121: { name: 'New York Mets', abbr: 'NYM', league: 'NL', division: 'East' },
  133: { name: 'Oakland Athletics', abbr: 'OAK', league: 'AL', division: 'West' },
  134: { name: 'Pittsburgh Pirates', abbr: 'PIT', league: 'NL', division: 'Central' },
  135: { name: 'San Diego Padres', abbr: 'SD', league: 'NL', division: 'West' },
  136: { name: 'Seattle Mariners', abbr: 'SEA', league: 'AL', division: 'West' },
  137: { name: 'San Francisco Giants', abbr: 'SF', league: 'NL', division: 'West' },
  138: { name: 'St. Louis Cardinals', abbr: 'STL', league: 'NL', division: 'Central' },
  139: { name: 'Tampa Bay Rays', abbr: 'TB', league: 'AL', division: 'East' },
  140: { name: 'Texas Rangers', abbr: 'TEX', league: 'AL', division: 'West' },
  141: { name: 'Toronto Blue Jays', abbr: 'TOR', league: 'AL', division: 'East' },
  142: { name: 'Minnesota Twins', abbr: 'MIN', league: 'AL', division: 'Central' },
  143: { name: 'Philadelphia Phillies', abbr: 'PHI', league: 'NL', division: 'East' },
  144: { name: 'Atlanta Braves', abbr: 'ATL', league: 'NL', division: 'East' },
  145: { name: 'Chicago White Sox', abbr: 'CWS', league: 'AL', division: 'Central' },
  146: { name: 'Miami Marlins', abbr: 'MIA', league: 'NL', division: 'East' },
  147: { name: 'New York Yankees', abbr: 'NYY', league: 'AL', division: 'East' },
  158: { name: 'Milwaukee Brewers', abbr: 'MIL', league: 'NL', division: 'Central' },
};