// 한국 선수 마스터 리스트 (노션 DB 대체용 임시 데이터)
// 실제로는 노션 API에서 가져올 데이터

import { PlayerIdMapping } from '../config/dataSources';

export const koreanPlayersMaster: PlayerIdMapping[] = [
  // ========== 축구 선수들 ==========
  {
    notionId: 'notion-son-001',
    name: {
      kr: '손흥민',
      en: 'Son Heung-min',
    },
    sport: 'football',
    currentTeam: 'Tottenham Hotspur',
    externalIds: {
      transfermarktId: '92607',
      espnId: '150130',
      sofascoreId: '83036',
      flashscoreId: 'CzqjtdQ8',
      footballDataId: '3180',
      apiFootballId: '1465',
      instagramHandle: 'hm_son7',
    },
    alternativeNames: ['Son', 'Sonny'],
    jerseyNumber: 7,
    position: 'Forward'
  },
  
  {
    notionId: 'notion-kim-002',
    name: {
      kr: '김민재',
      en: 'Kim Min-jae',
    },
    sport: 'football',
    currentTeam: 'Bayern Munich',
    externalIds: {
      transfermarktId: '503482',
      espnId: '241626',
      sofascoreId: '829886',
      instagramHandle: 'kiminjae3',
    },
    jerseyNumber: 3,
    position: 'Defender'
  },
  
  {
    notionId: 'notion-lee-003',
    name: {
      kr: '이강인',
      en: 'Lee Kang-in',
    },
    sport: 'football',
    currentTeam: 'Paris Saint-Germain',
    externalIds: {
      transfermarktId: '334416',
      espnId: '619765',
      sofascoreId: '931990',
      instagramHandle: 'kanginlee',
    },
    jerseyNumber: 19,
    position: 'Midfielder'
  },
  
  {
    notionId: 'notion-hwang-004',
    name: {
      kr: '황희찬',
      en: 'Hwang Hee-chan',
    },
    sport: 'football',
    currentTeam: 'Wolverhampton Wanderers',
    externalIds: {
      transfermarktId: '317945',
      espnId: '587429',
      sofascoreId: '375106',
    },
    jerseyNumber: 11,
    position: 'Forward'
  },
  
  {
    notionId: 'notion-kim-005',
    name: {
      kr: '김진수',
      en: 'Kim Jin-su',
    },
    sport: 'football',
    currentTeam: 'Jeonbuk Hyundai Motors',
    externalIds: {
      transfermarktId: '91022',
      sofascoreId: '125669',
    },
    jerseyNumber: 3,
    position: 'Defender'
  },
  
  // ========== 야구 선수들 ==========
  {
    notionId: 'notion-kim-006',
    name: {
      kr: '김하성',
      en: 'Kim Ha-seong',
    },
    sport: 'baseball',
    currentTeam: 'San Diego Padres',
    externalIds: {
      mlbId: '673490',
      espnId: '33871',
      instagramHandle: 'haseongkim',
    },
    jerseyNumber: 7,
    position: 'Shortstop'
  },
  
  {
    notionId: 'notion-lee-007',
    name: {
      kr: '이정후',
      en: 'Lee Jung-hoo',
    },
    sport: 'baseball',
    currentTeam: 'San Francisco Giants',
    externalIds: {
      mlbId: '808669',
      espnId: '42408',
    },
    jerseyNumber: 51,
    position: 'Outfielder'
  },
  
  {
    notionId: 'notion-ryu-008',
    name: {
      kr: '류현진',
      en: 'Ryu Hyun-jin',
    },
    sport: 'baseball',
    currentTeam: 'Hanwha Eagles',
    externalIds: {
      mlbId: '547943',
      espnId: '30782',
      instagramHandle: 'ryuhyunjin99',
    },
    jerseyNumber: 99,
    position: 'Pitcher'
  },
  
  {
    notionId: 'notion-ko-009',
    name: {
      kr: '고우석',
      en: 'Ko Woo-suk',
    },
    sport: 'baseball',
    currentTeam: 'San Diego Padres',
    externalIds: {
      mlbId: '808707',
    },
    jerseyNumber: 31,
    position: 'Pitcher'
  },
  
  {
    notionId: 'notion-bae-010',
    name: {
      kr: '배지환',
      en: 'Bae Ji-hwan',
    },
    sport: 'baseball',
    currentTeam: 'Pittsburgh Pirates',
    externalIds: {
      mlbId: '678225',
      espnId: '42465',
    },
    jerseyNumber: 16,
    position: 'Infielder'
  },
  
  // ========== 농구 선수들 ==========
  {
    notionId: 'notion-lee-011',
    name: {
      kr: '이현중',
      en: 'Lee Hyun-jung',
    },
    sport: 'basketball',
    currentTeam: 'Ulsan Hyundai Mobis Phoebus',
    externalIds: {},
    jerseyNumber: 10,
    position: 'Forward'
  },
  
  {
    notionId: 'notion-heo-012',
    name: {
      kr: '허훈',
      en: 'Heo Hoon',
    },
    sport: 'basketball',
    currentTeam: 'Suwon KT Sonicboom',
    externalIds: {},
    jerseyNumber: 4,
    position: 'Guard'
  },
  
  // ========== 테니스 선수들 ==========
  {
    notionId: 'notion-kwon-013',
    name: {
      kr: '권순우',
      en: 'Kwon Soon-woo',
    },
    sport: 'tennis',
    currentTeam: 'Individual',
    externalIds: {
      atpId: 'kd46',
      sofascoreId: '835012',
    },
    position: 'Singles'
  },
  
  // ========== 골프 선수들 ==========
  {
    notionId: 'notion-im-014',
    name: {
      kr: '임성재',
      en: 'Im Sung-jae',
      native: 'Sungjae Im'
    },
    sport: 'golf',
    currentTeam: 'PGA Tour',
    externalIds: {
      pgaId: '39971',
      instagramHandle: 'sungjaeimpga',
    },
  },
  
  {
    notionId: 'notion-kim-015',
    name: {
      kr: '김시우',
      en: 'Kim Si-woo',
      native: 'Si Woo Kim'
    },
    sport: 'golf',
    currentTeam: 'PGA Tour',
    externalIds: {
      pgaId: '32366',
    },
  },
  
  {
    notionId: 'notion-an-016',
    name: {
      kr: '안병훈',
      en: 'An Byeong-hun',
      native: 'Byeong Hun An'
    },
    sport: 'golf',
    currentTeam: 'PGA Tour',
    externalIds: {
      pgaId: '33948',
    },
  },
  
  {
    notionId: 'notion-kim-017',
    name: {
      kr: '김주형',
      en: 'Kim Joo-hyung',
      native: 'Tom Kim'
    },
    sport: 'golf',
    currentTeam: 'PGA Tour',
    externalIds: {
      pgaId: '55182',
      instagramHandle: 'joohyung_kim',
    },
    alternativeNames: ['Tom Kim'],
  }
];

// 스포츠별 선수 그룹핑
export const playersBySport = {
  football: koreanPlayersMaster.filter(p => p.sport === 'football'),
  baseball: koreanPlayersMaster.filter(p => p.sport === 'baseball'),
  basketball: koreanPlayersMaster.filter(p => p.sport === 'basketball'),
  tennis: koreanPlayersMaster.filter(p => p.sport === 'tennis'),
  golf: koreanPlayersMaster.filter(p => p.sport === 'golf'),
};

// 리그별 선수 그룹핑
export const playersByLeague = {
  // 축구
  'premier-league': ['손흥민', '황희찬'],
  'bundesliga': ['김민재', '정우영', '이재성'],
  'ligue1': ['이강인'],
  'serie-a': ['김민재'], // 과거
  'la-liga': ['이강인'], // 과거
  
  // 야구
  'mlb': ['김하성', '이정후', '고우석', '배지환'],
  'npb': [],
  'kbo': ['류현진'],
  
  // 농구
  'nba': [],
  'kbl': ['이현중', '허훈'],
  
  // 테니스
  'atp': ['권순우'],
  
  // 골프
  'pga': ['임성재', '김시우', '안병훈', '김주형'],
};

// 팀별 한국 선수 매핑
export const koreanPlayersByTeam: Record<string, string[]> = {
  // Premier League
  'Tottenham Hotspur': ['손흥민'],
  'Wolverhampton Wanderers': ['황희찬'],
  
  // Bundesliga
  'Bayern Munich': ['김민재'],
  'VfB Stuttgart': ['정우영'],
  'Mainz 05': ['이재성'],
  
  // Ligue 1
  'Paris Saint-Germain': ['이강인'],
  
  // MLB
  'San Diego Padres': ['김하성', '고우석'],
  'San Francisco Giants': ['이정후'],
  'Pittsburgh Pirates': ['배지환'],
  
  // KBO
  'Hanwha Eagles': ['류현진'],
};