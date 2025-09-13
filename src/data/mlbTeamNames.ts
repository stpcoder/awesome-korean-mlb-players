// MLB 팀 한글명 사전
// 한국에서 일반적으로 사용하는 팀명으로 표기

export const mlbTeamKoreanNames: Record<string, string> = {
  // American League East
  'Baltimore Orioles': '볼티모어 오리올스',
  'Boston Red Sox': '보스턴 레드삭스',
  'New York Yankees': '뉴욕 양키스',
  'Tampa Bay Rays': '탬파베이 레이스',
  'Toronto Blue Jays': '토론토 블루제이스',

  // American League Central
  'Chicago White Sox': '시카고 화이트삭스',
  'Cleveland Guardians': '클리블랜드 가디언스',
  'Detroit Tigers': '디트로이트 타이거스',
  'Kansas City Royals': '캔자스시티 로열스',
  'Minnesota Twins': '미네소타 트윈스',

  // American League West
  'Houston Astros': '휴스턴 애스트로스',
  'Los Angeles Angels': 'LA 에인절스',
  'Oakland Athletics': '오클랜드 애슬레틱스',
  'Seattle Mariners': '시애틀 매리너스',
  'Texas Rangers': '텍사스 레인저스',

  // National League East
  'Atlanta Braves': '애틀랜타 브레이브스',
  'Miami Marlins': '마이애미 말린스',
  'New York Mets': '뉴욕 메츠',
  'Philadelphia Phillies': '필라델피아 필리스',
  'Washington Nationals': '워싱턴 내셔널스',

  // National League Central
  'Chicago Cubs': '시카고 컵스',
  'Cincinnati Reds': '신시내티 레즈',
  'Milwaukee Brewers': '밀워키 브루어스',
  'Pittsburgh Pirates': '피츠버그 파이리츠',
  'St. Louis Cardinals': '세인트루이스 카디널스',

  // National League West
  'Arizona Diamondbacks': '애리조나 다이아몬드백스',
  'Colorado Rockies': '콜로라도 로키스',
  'Los Angeles Dodgers': 'LA 다저스',
  'San Diego Padres': '샌디에이고 파드리스',
  'San Francisco Giants': '샌프란시스코 자이언츠',
};

// 팀명 변환 함수
export function getKoreanTeamName(englishName: string): string {
  return mlbTeamKoreanNames[englishName] || englishName;
}

// 약어로 팀명 찾기
export const mlbTeamAbbreviations: Record<string, string> = {
  'BAL': '볼티모어',
  'BOS': '보스턴',
  'NYY': '양키스',
  'TB': '탬파베이',
  'TOR': '토론토',
  'CWS': '화이트삭스',
  'CLE': '클리블랜드',
  'DET': '디트로이트',
  'KC': '캔자스시티',
  'MIN': '미네소타',
  'HOU': '휴스턴',
  'LAA': 'LA 에인절스',
  'OAK': '오클랜드',
  'SEA': '시애틀',
  'TEX': '텍사스',
  'ATL': '애틀랜타',
  'MIA': '마이애미',
  'NYM': '메츠',
  'PHI': '필라델피아',
  'WSH': '워싱턴',
  'CHC': '컵스',
  'CIN': '신시내티',
  'MIL': '밀워키',
  'PIT': '피츠버그',
  'STL': '세인트루이스',
  'ARI': '애리조나',
  'COL': '콜로라도',
  'LAD': 'LA 다저스',
  'SD': '샌디에이고',
  'SF': '샌프란시스코',
};

/**
 * 한글 팀명 변환 기준:
 * 
 * 1. LA 팀들: Los Angeles → LA로 축약 (LA 다저스, LA 에인절스)
 * 2. 뉴욕 팀들: 양키스, 메츠로 구분
 * 3. 시카고 팀들: 화이트삭스, 컵스로 구분
 * 4. 긴 이름: 세인트루이스 (축약 없음), 샌프란시스코 (축약 없음)
 * 5. 한국에서 자주 사용하는 표기 유지
 *    - 레드삭스 (레드 삭스 X)
 *    - 화이트삭스 (화이트 삭스 X)
 *    - 블루제이스 (블루 제이스 X)
 * 6. 최근 변경된 팀명 반영
 *    - Cleveland Indians → Cleveland Guardians (가디언스)
 */