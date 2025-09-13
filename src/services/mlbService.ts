// MLB Stats API 서비스
// 공식 무료 API - 제한 없음!

// Vite 프록시를 통해 CORS 우회
const MLB_API_BASE = '/api/mlb/api/v1';

export interface MLBPlayer {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  primaryNumber?: string;
  birthDate: string;
  currentAge: number;
  birthCity?: string;
  birthCountry: string;
  height: string;
  weight: number;
  primaryPosition: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  currentTeam?: {
    id: number;
    name: string;
    link: string;
  };
  active: boolean;
}

export interface MLBPlayerStats {
  season: string;
  stats: {
    batting?: {
      gamesPlayed: number;
      atBats: number;
      runs: number;
      hits: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      rbi: number;
      baseOnBalls: number;
      strikeOuts: number;
      stolenBases: number;
      avg: string;
      obp: string;
      slg: string;
      ops: string;
    };
    pitching?: {
      gamesPlayed: number;
      gamesStarted: number;
      wins: number;
      losses: number;
      era: string;
      innings: string;
      hits: number;
      runs: number;
      earnedRuns: number;
      homeRuns: number;
      baseOnBalls: number;
      strikeOuts: number;
      whip: string;
    };
  };
}

export interface MLBGame {
  gamePk: number;
  gameDate: string;
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

class MLBService {
  // 선수 실시간 정보 가져오기 (팀, 포지션, 등번호 등)
  async getPlayerInfo(playerId: number) {
    try {
      // 먼저 기본 선수 정보 조회
      const response = await fetch(`${MLB_API_BASE}/people/${playerId}?hydrate=currentTeam,team(league)`);
      const data = await response.json();
      
      if (data.people && data.people.length > 0) {
        const player = data.people[0];
        
        // currentTeam이 없으면 stats에서 가장 최근 팀 정보 가져오기
        let teamInfo = player.currentTeam;
        let level = 'MLB';
        let sportId = 1;
        
        if (!teamInfo) {
          // 현재 시즌 stats 조회 (마이너리그 포함)
          const currentYear = new Date().getFullYear();
          const statsResponse = await fetch(`${MLB_API_BASE}/people/${playerId}/stats?stats=gameLog&season=${currentYear}&sportIds=1,11,12,13,14,15,16`);
          const statsData = await statsResponse.json();
          
          if (statsData.stats && statsData.stats.length > 0 && statsData.stats[0].splits && statsData.stats[0].splits.length > 0) {
            const latestGame = statsData.stats[0].splits[0];
            teamInfo = latestGame.team;
            sportId = latestGame.sport?.id || 16; // 기본값은 Rookie
          }
        }
        
        // sportId로 레벨 판단
        if (teamInfo?.sport?.id) {
          sportId = teamInfo.sport.id;
        }
        level = sportId === 1 ? 'MLB' : 'MiLB';
        
        // 리그 이름 결정
        let leagueName = '';
        if (sportId === 11) leagueName = 'Triple-A';
        else if (sportId === 12) leagueName = 'Double-A';
        else if (sportId === 13 || sportId === 14) leagueName = 'Single-A';
        else if (sportId === 15 || sportId === 16) leagueName = 'Rookie';
        else if (sportId === 1) leagueName = 'MLB';
        
        return {
          mlbId: player.id,
          nameEn: player.fullName,
          team: teamInfo?.name || '',
          teamId: teamInfo?.id || 0,
          position: player.primaryPosition?.abbreviation || '',
          jerseyNumber: player.primaryNumber ? parseInt(player.primaryNumber) : 0,
          level: level,
          sportId: sportId,
          league: leagueName || teamInfo?.league?.name || '',
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching player info for ${playerId}:`, error);
      return null;
    }
  }

  // 여러 선수 정보 한번에 가져오기
  async getPlayersInfo(playerIds: number[]) {
    try {
      const promises = playerIds.map(id => this.getPlayerInfo(id));
      const results = await Promise.all(promises);
      return results.filter(player => player !== null);
    } catch (error) {
      console.error('Error fetching players info:', error);
      return [];
    }
  }

  // 선수 사진 URL 생성
  getPlayerImageUrl(playerId: number): string {
    return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
  }

  // 팀 로고 URL 생성
  getTeamLogoUrl(teamId: number): string {
    return `https://www.mlbstatic.com/team-logos/team-cap-on-light/${teamId}.svg`;
  }

  // 팀 이름으로 팀 ID 찾기
  getTeamIdByName(teamName: string): number {
    const teamMap: Record<string, number> = {
      'Los Angeles Angels': 108,
      'Arizona Diamondbacks': 109,
      'Baltimore Orioles': 110,
      'Boston Red Sox': 111,
      'Chicago Cubs': 112,
      'Cincinnati Reds': 113,
      'Cleveland Guardians': 114,
      'Colorado Rockies': 115,
      'Detroit Tigers': 116,
      'Houston Astros': 117,
      'Kansas City Royals': 118,
      'Los Angeles Dodgers': 119,
      'Washington Nationals': 120,
      'New York Mets': 121,
      'Oakland Athletics': 133,
      'Pittsburgh Pirates': 134,
      'San Diego Padres': 135,
      'Seattle Mariners': 136,
      'San Francisco Giants': 137,
      'St. Louis Cardinals': 138,
      'Tampa Bay Rays': 139,
      'Texas Rangers': 140,
      'Toronto Blue Jays': 141,
      'Minnesota Twins': 142,
      'Philadelphia Phillies': 143,
      'Atlanta Braves': 144,
      'Chicago White Sox': 145,
      'Miami Marlins': 146,
      'New York Yankees': 147,
      'Milwaukee Brewers': 158
    };
    return teamMap[teamName] || 119; // Default to Dodgers if not found
  }

  // 선수 액션샷 URL (대체용)
  getPlayerActionImageUrl(playerId: number): string {
    return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:action:67:current.png/w_640,q_auto:best/v1/people/${playerId}/action/67/current`;
  }
  // 선수 기본 정보 가져오기
  async getPlayer(playerId: number): Promise<MLBPlayer | null> {
    try {
      const response = await fetch(`${MLB_API_BASE}/people/${playerId}`);
      const data = await response.json();
      return data.people?.[0] || null;
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      return null;
    }
  }

  // 선수 시즌 통계 가져오기 (메이저/마이너 모두 지원)
  async getPlayerStats(playerId: number, season: number = 2025, sportId?: number): Promise<MLBPlayerStats | null> {
    try {
      // sportId가 제공된 경우 (마이너리그) 해당 리그 통계 사용
      let url = `${MLB_API_BASE}/people/${playerId}/stats?stats=season&season=${season}&gameType=R`;
      if (sportId) {
        url += `&sportId=${sportId}`;
      }
      
      let response = await fetch(url);
      let data = await response.json();
      
      // 메이저리그 통계가 없으면 마이너리그 통계 시도
      if (!data.stats || data.stats.length === 0) {
        response = await fetch(
          `${MLB_API_BASE}/people/${playerId}/stats?stats=season&season=${season}&gameType=R&group=hitting,pitching`
        );
        data = await response.json();
      }
      
      if (!data.stats || data.stats.length === 0) return null;
      
      const statGroup = data.stats[0];
      const statSplits = statGroup.splits?.[0];
      
      if (!statSplits) return null;
      
      return {
        season: statSplits.season || season.toString(),
        stats: {
          batting: statGroup.group?.displayName === 'hitting' ? statSplits.stat : undefined,
          pitching: statGroup.group?.displayName === 'pitching' ? statSplits.stat : undefined
        }
      };
    } catch (error) {
      console.error(`Error fetching stats for player ${playerId}:`, error);
      return null;
    }
  }

  // 경기 일정 가져오기 (과거/미래 모두 지원, 메이저/마이너 모두 지원)
  async getUpcomingGames(teamIds?: number[], days: number = 7, includePast: boolean = false): Promise<MLBGame[]> {
    try {
      const today = new Date();
      let startDate: string;
      let endDate: string;
      
      if (includePast) {
        // 오늘 기준 과거 3일 (오늘 포함)
        const startDateObj = new Date(today);
        startDateObj.setDate(startDateObj.getDate() - 3);
        startDate = startDateObj.toISOString().split('T')[0];
        
        // 오늘까지만 (미래 경기 제외)
        endDate = today.toISOString().split('T')[0];
      } else {
        // 오늘 새벽(00:00)부터 미래 경기까지 (오늘 종료된 경기 포함)
        const startDateObj = new Date(today);
        startDateObj.setHours(0, 0, 0, 0);
        startDate = startDateObj.toISOString().split('T')[0];
        
        const endDateObj = new Date(today);
        endDateObj.setDate(endDateObj.getDate() + days);
        endDate = endDateObj.toISOString().split('T')[0];
      }
      
      // sportId: 1=MLB, 11=Triple-A, 12=Double-A, 14=Single-A, 16=Rookie
      // 마이너리그 팀도 포함하여 모든 리그 검색
      const sportIds = '1,11,12,13,14,15,16';
      
      // 여러 팀의 경기를 한번에 가져오기
      let url = `${MLB_API_BASE}/schedule?sportId=${sportIds}&startDate=${startDate}&endDate=${endDate}`;
      if (teamIds && teamIds.length > 0) {
        // 팀 ID가 0인 경우 제외
        const validTeamIds = teamIds.filter(id => id > 0);
        if (validTeamIds.length > 0) {
          url += `&teamId=${validTeamIds.join(',')}`;
        }
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      const games: MLBGame[] = [];
      data.dates?.forEach((date: any) => {
        date.games?.forEach((game: any) => {
          // 한국 시간으로 변환
          const gameDate = new Date(game.gameDate);
          const koreanTime = this.convertToKoreanTime(gameDate);
          
          games.push({
            ...game,
            gameDate: game.gameDate,
            koreanTime: koreanTime,
            koreanDateString: this.formatKoreanDateTime(gameDate),
            gameStatus: this.getGameStatus(game.status)
          });
        });
      });
      
      // 과거 경기는 최신 날짜가 먼저 오도록 정렬 (내림차순)
      // 미래 경기는 가까운 날짜가 먼저 오도록 정렬 (오름차순)
      if (includePast) {
        return games.sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime());
      } else {
        return games.sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());
      }
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      return [];
    }
  }

  // 한국 시간으로 변환
  convertToKoreanTime(date: Date): Date {
    // Date를 한국 시간대로 해석
    // toLocaleString을 사용하여 한국 시간대로 변환된 날짜를 얻고
    // 그것을 다시 Date 객체로 만듦
    const koreanDateString = date.toLocaleString("en-US", { timeZone: "Asia/Seoul" });
    const koreanTime = new Date(koreanDateString);
    return koreanTime;
  }

  // 한국 시간 포맷팅
  formatKoreanDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Seoul'
    };
    return date.toLocaleString('ko-KR', options);
  }

  // 경기 상태 가져오기
  getGameStatus(status: any): string {
    const abstractState = status?.abstractGameState?.toLowerCase();
    const detailedState = status?.detailedState;
    
    if (abstractState === 'live' || abstractState === 'in progress') {
      return '경기 중';
    } else if (abstractState === 'final') {
      return '경기 종료';
    } else if (abstractState === 'preview') {
      return '경기 예정';
    } else if (detailedState?.includes('Postponed')) {
      return '연기';
    } else if (detailedState?.includes('Cancelled')) {
      return '취소';
    }
    return '경기 예정';
  }

  // 팀 정보 가져오기
  async getTeam(teamId: number) {
    try {
      const response = await fetch(`${MLB_API_BASE}/teams/${teamId}`);
      const data = await response.json();
      return data.teams?.[0] || null;
    } catch (error) {
      console.error(`Error fetching team ${teamId}:`, error);
      return null;
    }
  }

  // 실시간 경기 정보
  async getGameLiveFeed(gamePk: number) {
    try {
      // v1.1 API 사용
      const response = await fetch(`${MLB_API_BASE}.1/game/${gamePk}/feed/live`);
      
      if (!response.ok) {
        console.warn(`Game ${gamePk} not found, trying v1 API...`);
        // v1 API fallback
        const v1Response = await fetch(`${MLB_API_BASE}/game/${gamePk}/feed/live`);
        if (!v1Response.ok) {
          console.error(`Game ${gamePk} not found in both v1.1 and v1 APIs`);
          return null;
        }
        const v1Data = await v1Response.json();
        return v1Data;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching game ${gamePk}:`, error);
      return null;
    }
  }

  // 선수 최근 경기 기록 가져오기 (메이저/마이너 모두 지원)
  async getPlayerRecentGames(playerId: number, limit: number = 5, _daysBack: number = 30, sportId?: number): Promise<any[]> {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // 현재 연도 시즌 데이터 가져오기
      let url = `${MLB_API_BASE}/people/${playerId}/stats?stats=gameLog&season=${currentYear}`;
      
      // sportId가 제공되면 추가 (마이너리그 필수)
      if (sportId) {
        url += `&sportId=${sportId}`;
      }
      
      let response = await fetch(url);
      let data = await response.json();
      
      if (!data.stats || data.stats.length === 0) return [];
      
      const gameLogs = data.stats[0].splits || [];
      
      // 선수가 실제로 출전한 경기만 필터링 (타석에 서거나 투구한 경우만)
      const playedGames = gameLogs.filter((game: any) => {
        const stat = game.stat;
        
        // 투수: 실제로 이닝을 던진 경우
        const hasPitching = stat?.inningsPitched !== undefined && parseFloat(stat.inningsPitched) > 0;
        if (hasPitching) return true;
        
        // 타자: 타석에 실제로 선 경우 (타수가 있거나 타석 수가 있는 경우)
        const hasAtBats = stat?.atBats !== undefined && stat.atBats > 0;
        const hasPlateAppearances = stat?.plateAppearances !== undefined && stat.plateAppearances > 0;
        
        // 타수가 0이어도 볼넷, 몸에 맞는 공 등으로 타석에는 섰을 수 있음
        // 따라서 타석수(plateAppearances)가 0보다 큰 경우만 포함
        return hasPlateAppearances || hasAtBats;
      });
      
      // 최신 경기가 먼저 오도록 역순 정렬
      return playedGames
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)
        .map((game: any) => ({
          date: game.date,
          opponent: game.opponent?.name || 'Unknown',
          isHome: game.isHome,
          stat: game.stat,
          team: game.team?.name || 'Unknown',
          gamePk: game.game?.gamePk // 경기 ID 추가
        }));
    } catch (error) {
      console.error(`Error fetching recent games for player ${playerId}:`, error);
      return [];
    }
  }

  // 경기별 한국 선수 출전 정보 가져오기
  async getKoreanPlayersInGame(gamePk: number, playerIds: number[]): Promise<any[]> {
    try {
      const gameData = await this.getGameLiveFeed(gamePk);
      if (!gameData) {
        console.log('No game data found for gamePk:', gamePk);
        return [];
      }
      
      const boxscore = gameData.liveData?.boxscore;
      if (!boxscore) {
        console.log('No boxscore data found');
        return [];
      }
      
      const playersInGame = [];
      console.log('Looking for Korean players:', playerIds);
      console.log('Boxscore teams:', Object.keys(boxscore.teams));
      
      // 홈팀/원정팀 선수 명단에서 한국 선수 찾기
      for (const teamKey of ['home', 'away']) {
        const teamPlayers = boxscore.teams[teamKey].players || {};
        console.log(`${teamKey} team players:`, Object.keys(teamPlayers));
        
        for (const [playerKey, playerData] of Object.entries(teamPlayers)) {
          // playerData가 객체인지 확인
          if (!playerData || typeof playerData !== 'object') continue;
          
          const id = parseInt(playerKey.replace('ID', ''));
          
          // 모든 선수 ID 로그
          if (teamKey === 'away' || teamKey === 'home') {
            const person = (playerData as any).person || {};
            console.log(`Player: ${person.fullName} (ID: ${id})`);
          }
          
          // 해당 선수가 한국 선수 목록에 있는지 확인
          if (playerIds.includes(id)) {
            const stats = (playerData as any).stats || {};
            const batting = stats.batting || {};
            const pitching = stats.pitching || {};
            const person = (playerData as any).person || {};
            
            console.log(`Found Korean player: ${person.fullName} (${id}), playerData:`, playerData);
            console.log(`Batting stats:`, batting);
            console.log(`Pitching stats:`, pitching);
            
            // 선수가 경기에 출전했는지 확인 - 더 포괄적으로 체크
            const played = (playerData as any).gameStatus?.isCurrentBatter || 
                          (playerData as any).gameStatus?.isCurrentPitcher ||
                          (playerData as any).gameStatus?.isOnBench === false ||
                          batting.atBats >= 0 || // 0타수도 출전으로 간주
                          batting.plateAppearances > 0 ||
                          pitching.inningsPitched !== undefined ||
                          (playerData as any).allPositions?.length > 0 ||
                          (playerData as any).battingOrder !== undefined;
            
            // 실제 팀 이름 가져오기
            const actualTeamName = teamKey === 'home' 
              ? gameData.gameData?.teams?.home?.name || boxscore.teams.home.team?.name || '홈'
              : gameData.gameData?.teams?.away?.name || boxscore.teams.away.team?.name || '원정';
            
            playersInGame.push({
              playerId: id,
              playerName: person.fullName,
              team: actualTeamName,
              position: (playerData as any).position?.abbreviation || (playerData as any).allPositions?.[0]?.abbreviation || 'DH',
              battingOrder: (playerData as any).battingOrder ? parseInt((playerData as any).battingOrder) / 100 : null,
              jerseyNumber: person.primaryNumber,
              
              // 타자 기록 - 출전한 모든 선수의 기록 포함
              batting: (batting.atBats !== undefined || batting.plateAppearances !== undefined) ? {
                plateAppearances: batting.plateAppearances || 0,
                atBats: batting.atBats || 0,
                hits: batting.hits || 0,
                runs: batting.runs || 0,
                rbi: batting.rbi || 0,
                homeRuns: batting.homeRuns || 0,
                doubles: batting.doubles || 0,
                triples: batting.triples || 0,
                strikeOuts: batting.strikeOuts || 0,
                baseOnBalls: batting.baseOnBalls || 0,
                stolenBases: batting.stolenBases || 0,
                caughtStealing: batting.caughtStealing || 0,
                avg: batting.avg || '.000',
                obp: batting.obp || '.000',
                slg: batting.slg || '.000',
                ops: batting.ops || '.000'
              } : null,
              
              // 투수 기록
              pitching: (pitching.inningsPitched !== undefined && parseFloat(pitching.inningsPitched) > 0) ? {
                inningsPitched: pitching.inningsPitched || '0.0',
                battersFaced: pitching.battersFaced || 0,
                hits: pitching.hits || 0,
                runs: pitching.runs || 0,
                earnedRuns: pitching.earnedRuns || 0,
                strikeOuts: pitching.strikeOuts || 0,
                baseOnBalls: pitching.baseOnBalls || 0,
                homeRuns: pitching.homeRuns || 0,
                pitchesThrown: pitching.pitchesThrown || 0,
                strikes: pitching.strikes || 0,
                balls: pitching.balls || 0,
                era: pitching.era || '0.00',
                whip: pitching.whip || '0.00',
                win: pitching.wins > 0,
                loss: pitching.losses > 0,
                save: pitching.saves > 0,
                hold: pitching.holds > 0
              } : null,
              
              // 출전 여부
              played: played,
              gameStatus: (playerData as any).gameStatus || {},
              substitute: (playerData as any).gameStatus?.isSubstitute || false,
              
              // 이닝별 기록은 나중에 추가
              inningStats: []
            });
          }
        }
      }
      
      // 각 선수의 이닝별 기록 가져오기
      for (const player of playersInGame) {
        if (player.played && player.batting) {
          (player as any).inningStats = await this.getPlayerInningStats(gamePk, player.playerId);
        }
      }
      
      console.log('Found players in game with inning stats:', playersInGame);
      return playersInGame;
    } catch (error) {
      console.error(`Error fetching Korean players in game ${gamePk}:`, error);
      return [];
    }
  }

  // 선수 경기별 상세 기록 가져오기
  async getPlayerGameStats(playerId: number, gameId: number) {
    try {
      const response = await fetch(
        `${MLB_API_BASE}/game/${gameId}/boxscore`
      );
      const data = await response.json();
      
      // 선수의 경기 기록 찾기
      const teams = ['home', 'away'];
      for (const team of teams) {
        const players = data.teams[team].players;
        const playerData = players[`ID${playerId}`];
        if (playerData) {
          return playerData.stats;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching game stats:`, error);
      return null;
    }
  }

  // 투수 이닝별 상세 정보 가져오기
  async getPitcherInningDetails(gameId: number, playerId: number) {
    try {
      const response = await fetch(
        `${MLB_API_BASE}/game/${gameId}/playByPlay`
      );
      const data = await response.json();
      
      if (!data.allPlays) return [];
      
      // 이닝별로 투구 기록 정리
      const inningDetails: any = {};
      
      data.allPlays.forEach((play: any) => {
        // 해당 투수가 던진 타석만 필터링
        if (play.matchup?.pitcher?.id === playerId) {
          const inning = play.about.inning;
          const halfInning = play.about.halfInning === 'top' ? '초' : '말';
          const inningKey = `${inning}회 ${halfInning}`;
          
          if (!inningDetails[inningKey]) {
            inningDetails[inningKey] = {
              inning: inning,
              half: halfInning,
              outs: 0,
              hits: 0,
              walks: 0,
              strikeouts: 0,
              runs: 0,
              batters: []
            };
          }
          
          // 타자 결과 기록
          const result = play.result.event;
          const batter = play.matchup.batter.fullName;
          
          inningDetails[inningKey].batters.push({
            name: batter,
            result: this.translatePitchResult(result),
            description: play.result.description
          });
          
          // 결과별 카운트
          if (result === 'Strikeout') inningDetails[inningKey].strikeouts++;
          if (result === 'Walk' || result === 'Intent Walk' || result === 'Hit By Pitch') inningDetails[inningKey].walks++;
          if (['Single', 'Double', 'Triple', 'Home Run'].includes(result)) inningDetails[inningKey].hits++;
          if (['Groundout', 'Flyout', 'Lineout', 'Pop Out', 'Strikeout'].includes(result)) inningDetails[inningKey].outs++;
        }
      });
      
      // 배열로 변환하여 반환
      return Object.entries(inningDetails).map(([key, value]: [string, any]) => ({
        inningLabel: key,
        ...value
      }));
    } catch (error) {
      console.error(`Error fetching pitcher inning details:`, error);
      return [];
    }
  }

  // 투구 결과 한국어 변환
  translatePitchResult(event: string): string {
    const eventMap: Record<string, string> = {
      'Strikeout': '탈삼진',
      'Groundout': '땅볼',
      'Flyout': '뜬공',
      'Lineout': '라인드라이브',
      'Pop Out': '내야뜬공',
      'Single': '1루타',
      'Double': '2루타',
      'Triple': '3루타',
      'Home Run': '홈런',
      'Walk': '볼넷',
      'Intent Walk': '고의사구',
      'Hit By Pitch': '몸에맞는공',
      'Sac Fly': '희생플라이',
      'Sac Bunt': '희생번트',
      'Fielders Choice': '야수선택',
      'Field Error': '실책',
      'Error': '실책',
      'Forceout': '포스아웃',
      'Grounded Into DP': '병살타',
      'Double Play': '병살'
    };
    
    return eventMap[event] || event;
  }

  // 선수별 이닝 기록 가져오기
  async getPlayerInningStats(gameId: number, playerId: number) {
    try {
      const response = await fetch(
        `${MLB_API_BASE}/game/${gameId}/playByPlay`
      );
      const data = await response.json();
      
      if (!data.allPlays) return [];
      
      const inningStats: any[] = [];
      
      // 각 이닝별로 선수의 타석 결과 정리
      data.allPlays.forEach((play: any) => {
        if (play.matchup?.batter?.id === playerId) {
          const inning = play.about.inning;
          const halfInning = play.about.halfInning === 'top' ? '초' : '말';
          
          inningStats.push({
            inning: `${inning}회 ${halfInning}`,
            result: this.translateBattingResult(play.result.event),
            description: play.result.description,
            rbi: play.result.rbi || 0,
            pitcher: play.matchup.pitcher.fullName
          });
        }
      });
      
      return inningStats;
    } catch (error) {
      console.error(`Error fetching player inning stats:`, error);
      return [];
    }
  }
  
  // 타격 결과 한국어 변환
  translateBattingResult(event: string): string {
    const eventMap: Record<string, string> = {
      'Single': '1루타',
      'Double': '2루타',
      'Triple': '3루타',
      'Home Run': '홈런',
      'Walk': '볼넷',
      'Intent Walk': '고의사구',
      'Hit By Pitch': '몸에맞는공',
      'Strikeout': '삼진',
      'Groundout': '땅볼아웃',
      'Flyout': '뜬공아웃',
      'Lineout': '라인드라이브아웃',
      'Pop Out': '내야뜬공',
      'Sac Fly': '희생플라이',
      'Sac Bunt': '희생번트',
      'Fielders Choice': '야수선택',
      'Field Error': '실책',
      'Error': '실책',
      'Forceout': '포스아웃',
      'Grounded Into DP': '병살타',
      'Double Play': '병살'
    };
    
    return eventMap[event] || event;
  }

  // 경기 타석별 상세 정보 가져오기
  async getGamePlayByPlay(gameId: number, playerId: number) {
    try {
      const response = await fetch(
        `${MLB_API_BASE}/game/${gameId}/playByPlay`
      );
      const data = await response.json();
      
      if (!data.allPlays) return [];
      
      // 특정 선수의 타석만 필터링 (ID로 비교)
      const playerAtBats = data.allPlays
        .filter((play: any) => play.matchup?.batter?.id === playerId)
        .map((play: any) => {
          // 결과를 한국어로 변환
          const event = play.result.event;
          
          // 주요 이벤트 한국어 변환
          const eventMap: Record<string, string> = {
            'Strikeout': '삼진',
            'Groundout': '땅볼 아웃',
            'Flyout': '뜬공 아웃',
            'Lineout': '직선타 아웃',
            'Pop Out': '내야 뜬공',
            'Single': '단타',
            'Double': '2루타',
            'Triple': '3루타',
            'Home Run': '홈런',
            'Walk': '볼넷',
            'Intent Walk': '고의사구',
            'Hit By Pitch': '몸에 맞는 공',
            'Sac Fly': '희생플라이',
            'Sac Bunt': '희생번트',
            'Fielders Choice': '야수선택',
            'Field Error': '실책',
            'Error': '실책',
            'Forceout': '포스아웃',
            'Grounded Into DP': '병살타',
            'Double Play': '병살'
          };
          
          const koreanEvent = eventMap[event] || event;
          
          // 타구 위치 정보 추출
          let hitLocation = '';
          if (play.result.description.includes('center field')) {
            hitLocation = ' (중견수 방향)';
          } else if (play.result.description.includes('left field')) {
            hitLocation = ' (좌익수 방향)';
          } else if (play.result.description.includes('right field')) {
            hitLocation = ' (우익수 방향)';
          } else if (play.result.description.includes('shortstop')) {
            hitLocation = ' (유격수 방향)';
          } else if (play.result.description.includes('third')) {
            hitLocation = ' (3루 방향)';
          } else if (play.result.description.includes('second')) {
            hitLocation = ' (2루 방향)';
          } else if (play.result.description.includes('first')) {
            hitLocation = ' (1루 방향)';
          }
          
          return {
            inning: play.about.inning,
            halfInning: play.about.halfInning === 'top' ? '초' : '말',
            pitcher: play.matchup.pitcher.fullName,
            pitcherId: play.matchup.pitcher.id,
            result: koreanEvent + hitLocation,
            originalResult: play.result.description,
            event: event,
            rbi: play.result.rbi || 0,
            atBatIndex: play.atBatIndex
          };
        });
      
      return playerAtBats;
    } catch (error) {
      console.error(`Error fetching play by play:`, error);
      return [];
    }
  }
}

export const mlbService = new MLBService();