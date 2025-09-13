// MLB 포지션 한글명 사전

export const mlbPositionKoreanNames: Record<string, string> = {
  // 투수
  'P': '투수',
  'SP': '선발투수',
  'RP': '구원투수',
  'CP': '마무리투수',
  
  // 포수
  'C': '포수',
  
  // 내야수
  '1B': '1루수',
  '2B': '2루수',
  '3B': '3루수',
  'SS': '유격수',
  'IF': '내야수',
  
  // 외야수
  'LF': '좌익수',
  'CF': '중견수',
  'RF': '우익수',
  'OF': '외야수',
  
  // 지명타자
  'DH': '지명타자',
  
  // 투타겸업 (Two-Way Player)
  'TWP': '투타겸업',
  
  // 복합
  'DH/P': '지명타자/투수',
  'SS/2B': '유격수/2루수',
  'OF/DH': '외야수/지명타자',
  'UTIL': '유틸리티',
  
  // 약어
  'Pitcher': '투수',
  'Catcher': '포수',
  'Infielder': '내야수',
  'Outfielder': '외야수',
  'Designated Hitter': '지명타자',
  'Utility': '유틸리티',
};

// 포지션 변환 함수
export function getKoreanPosition(englishPosition?: string): string {
  // undefined나 null 체크
  if (!englishPosition) {
    return '포지션 정보 없음';
  }
  
  // 복합 포지션 처리 (예: SS/2B)
  if (englishPosition.includes('/')) {
    const positions = englishPosition.split('/');
    const koreanPositions = positions.map(pos => 
      mlbPositionKoreanNames[pos.trim()] || pos.trim()
    );
    return koreanPositions.join('/');
  }
  
  return mlbPositionKoreanNames[englishPosition] || englishPosition;
}