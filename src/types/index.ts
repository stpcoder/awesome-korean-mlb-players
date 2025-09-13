export interface Player {
  id: string;
  name: string;
  nameEn: string;
  sport: SportType;
  team: string;
  position: string;
  profileImage?: string;
  nationality: 'KOR';
  stats?: PlayerStats;
  achievements?: Achievement[];
}

export interface PlayerStats {
  season: string;
  goals?: number;
  assists?: number;
  appearances?: number;
  battingAverage?: number;
  homeRuns?: number;
  rbi?: number;
  points?: number;
  rebounds?: number;
}

export interface Achievement {
  title: string;
  date: string;
  description?: string;
  icon?: string;
}

export interface Match {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  sport: SportType;
  competition: string;
  result?: MatchResult;
  koreanPlayers?: Player[];
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  status: 'upcoming' | 'live' | 'finished';
}

export type SportType = 'football' | 'baseball' | 'basketball' | 'tennis' | 'golf';

export interface SportTheme {
  color: string;
  bgColor: string;
  icon: string;
  gradient: string;
}