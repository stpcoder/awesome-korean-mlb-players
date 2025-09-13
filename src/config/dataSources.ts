// 데이터 소스 설정 및 매핑

export interface DataSource {
  name: string;
  type: 'api' | 'scraping' | 'manual';
  baseUrl: string;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
  };
  endpoints?: Record<string, string>;
}

export interface LeagueConfig {
  id: string;
  name: string;
  nameKr: string;
  country: string;
  sport: string;
  primarySource: string;
  alternativeSources: string[];
  season: {
    current: string;
    startMonth: number;
    endMonth: number;
  };
}

// 데이터 소스 정의
export const dataSources: Record<string, DataSource> = {
  // ========== 축구 ==========
  'football-data-org': {
    name: 'Football-Data.org',
    type: 'api',
    baseUrl: 'https://api.football-data.org/v4',
    requiresAuth: true,
    rateLimit: { requests: 10, period: 'minute' },
    endpoints: {
      competitions: '/competitions',
      matches: '/competitions/{id}/matches',
      teams: '/competitions/{id}/teams',
      player: '/persons/{id}'
    }
  },
  
  'api-football': {
    name: 'API-FOOTBALL',
    type: 'api',
    baseUrl: 'https://v3.football.api-sports.io',
    requiresAuth: true,
    rateLimit: { requests: 100, period: 'day' },
    endpoints: {
      fixtures: '/fixtures',
      players: '/players',
      statistics: '/players/statistics'
    }
  },
  
  'sofascore': {
    name: 'SofaScore',
    type: 'scraping',
    baseUrl: 'https://www.sofascore.com',
    requiresAuth: false,
    endpoints: {
      player: '/player/{slug}/{id}',
      match: '/match/{id}',
      team: '/team/{slug}/{id}'
    }
  },
  
  'flashscore': {
    name: 'FlashScore',
    type: 'scraping',
    baseUrl: 'https://www.flashscore.com',
    requiresAuth: false
  },
  
  // ========== 야구 ==========
  'mlb-stats': {
    name: 'MLB Stats API',
    type: 'api',
    baseUrl: 'https://statsapi.mlb.com/api/v1',
    requiresAuth: false,
    endpoints: {
      schedule: '/schedule',
      player: '/people/{id}',
      stats: '/people/{id}/stats',
      game: '/game/{id}/feed/live'
    }
  },
  
  'kbo-official': {
    name: 'KBO 공식',
    type: 'scraping',
    baseUrl: 'https://www.koreabaseball.com',
    requiresAuth: false
  },
  
  'npb-official': {
    name: 'NPB 공식',
    type: 'scraping',
    baseUrl: 'https://npb.jp',
    requiresAuth: false
  },
  
  // ========== 농구 ==========
  'nba-unofficial': {
    name: 'NBA Unofficial API',
    type: 'api',
    baseUrl: 'https://www.balldontlie.io/api/v1',
    requiresAuth: false,
    endpoints: {
      players: '/players',
      games: '/games',
      stats: '/stats'
    }
  },
  
  'euroleague': {
    name: 'EuroLeague',
    type: 'scraping',
    baseUrl: 'https://www.euroleague.net',
    requiresAuth: false
  },
  
  // ========== 테니스 ==========
  'atp-tour': {
    name: 'ATP Tour',
    type: 'scraping',
    baseUrl: 'https://www.atptour.com',
    requiresAuth: false
  },
  
  // ========== 골프 ==========
  'pga-tour': {
    name: 'PGA Tour',
    type: 'scraping',
    baseUrl: 'https://www.pgatour.com',
    requiresAuth: false
  },
  
  // ========== 노션 ==========
  'notion': {
    name: 'Notion Database',
    type: 'api',
    baseUrl: 'https://api.notion.com/v1',
    requiresAuth: true,
    endpoints: {
      database: '/databases/{id}/query',
      page: '/pages/{id}'
    }
  }
};

// 리그별 설정
export const leagues: Record<string, LeagueConfig> = {
  // ========== 축구 리그 ==========
  'epl': {
    id: 'epl',
    name: 'Premier League',
    nameKr: '프리미어리그',
    country: 'England',
    sport: 'football',
    primarySource: 'football-data-org',
    alternativeSources: ['api-football', 'sofascore', 'flashscore'],
    season: {
      current: '2023-24',
      startMonth: 8,
      endMonth: 5
    }
  },
  
  'bundesliga': {
    id: 'bundesliga',
    name: 'Bundesliga',
    nameKr: '분데스리가',
    country: 'Germany',
    sport: 'football',
    primarySource: 'football-data-org',
    alternativeSources: ['api-football', 'sofascore'],
    season: {
      current: '2023-24',
      startMonth: 8,
      endMonth: 5
    }
  },
  
  'laliga': {
    id: 'laliga',
    name: 'La Liga',
    nameKr: '라리가',
    country: 'Spain',
    sport: 'football',
    primarySource: 'football-data-org',
    alternativeSources: ['api-football', 'sofascore'],
    season: {
      current: '2023-24',
      startMonth: 8,
      endMonth: 5
    }
  },
  
  'ligue1': {
    id: 'ligue1',
    name: 'Ligue 1',
    nameKr: '리그 1',
    country: 'France',
    sport: 'football',
    primarySource: 'football-data-org',
    alternativeSources: ['api-football', 'sofascore'],
    season: {
      current: '2023-24',
      startMonth: 8,
      endMonth: 5
    }
  },
  
  'seriea': {
    id: 'seriea',
    name: 'Serie A',
    nameKr: '세리에 A',
    country: 'Italy',
    sport: 'football',
    primarySource: 'football-data-org',
    alternativeSources: ['api-football', 'sofascore'],
    season: {
      current: '2023-24',
      startMonth: 8,
      endMonth: 5
    }
  },
  
  // ========== 야구 리그 ==========
  'mlb': {
    id: 'mlb',
    name: 'Major League Baseball',
    nameKr: '메이저리그',
    country: 'USA',
    sport: 'baseball',
    primarySource: 'mlb-stats',
    alternativeSources: ['sofascore'],
    season: {
      current: '2024',
      startMonth: 3,
      endMonth: 10
    }
  },
  
  'npb': {
    id: 'npb',
    name: 'Nippon Professional Baseball',
    nameKr: '일본프로야구',
    country: 'Japan',
    sport: 'baseball',
    primarySource: 'npb-official',
    alternativeSources: [],
    season: {
      current: '2024',
      startMonth: 3,
      endMonth: 10
    }
  },
  
  // ========== 농구 리그 ==========
  'nba': {
    id: 'nba',
    name: 'National Basketball Association',
    nameKr: 'NBA',
    country: 'USA',
    sport: 'basketball',
    primarySource: 'nba-unofficial',
    alternativeSources: ['sofascore'],
    season: {
      current: '2023-24',
      startMonth: 10,
      endMonth: 6
    }
  },
  
  'euroleague': {
    id: 'euroleague',
    name: 'EuroLeague',
    nameKr: '유로리그',
    country: 'Europe',
    sport: 'basketball',
    primarySource: 'euroleague',
    alternativeSources: ['sofascore'],
    season: {
      current: '2023-24',
      startMonth: 10,
      endMonth: 5
    }
  },
  
  // ========== 테니스 ==========
  'atp': {
    id: 'atp',
    name: 'ATP Tour',
    nameKr: 'ATP 투어',
    country: 'International',
    sport: 'tennis',
    primarySource: 'atp-tour',
    alternativeSources: ['sofascore'],
    season: {
      current: '2024',
      startMonth: 1,
      endMonth: 12
    }
  },
  
  // ========== 골프 ==========
  'pga': {
    id: 'pga',
    name: 'PGA Tour',
    nameKr: 'PGA 투어',
    country: 'USA',
    sport: 'golf',
    primarySource: 'pga-tour',
    alternativeSources: [],
    season: {
      current: '2024',
      startMonth: 1,
      endMonth: 12
    }
  }
};

// 선수 ID 매핑 인터페이스
export interface PlayerIdMapping {
  notionId: string;           // 노션 DB의 고유 ID
  name: {
    kr: string;
    en: string;
    native?: string;           // 현지 표기 (일본 선수의 경우)
  };
  sport: string;
  currentTeam: string;
  externalIds: {
    // 축구
    transfermarktId?: string;
    espnId?: string;
    sofascoreId?: string;
    flashscoreId?: string;
    footballDataId?: string;
    apiFootballId?: string;
    fifaId?: string;
    
    // 야구
    mlbId?: string;
    npbId?: string;
    kboId?: string;
    
    // 농구
    nbaId?: string;
    euroleagueId?: string;
    
    // 테니스
    atpId?: string;
    wtaId?: string;
    
    // 골프
    pgaId?: string;
    lpgaId?: string;
    
    // 공통
    wikipediaId?: string;
    instagramHandle?: string;
    twitterHandle?: string;
  };
  alternativeNames?: string[];  // 다른 표기법들 (검색용)
  jerseyNumber?: number;
  position?: string;
}