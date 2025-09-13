/**
 * MLB API 날짜를 한국 시간대로 변환하는 유틸리티 함수들
 */

/**
 * UTC 날짜 문자열을 한국 시간대로 변환
 * @param dateString - ISO 날짜 문자열 또는 MLB API 날짜 형식
 * @returns 한국 시간대로 변환된 Date 객체
 */
export function convertToKoreanTime(dateString: string): Date {
  // MLB API는 보통 미국 동부 시간대 (ET) 기준으로 날짜를 제공
  // 날짜 문자열이 'YYYY-MM-DD' 형식이면 미국 동부 시간 자정으로 가정
  // 'YYYY-MM-DDTHH:mm:ssZ' 형식이면 그대로 파싱
  
  let date: Date;
  
  if (dateString.includes('T')) {
    // ISO 형식 날짜 (UTC 시간 포함)
    date = new Date(dateString);
  } else {
    // 'YYYY-MM-DD' 형식 - 미국 동부 시간 오후 7시(경기 시작 시간)로 가정
    // 미국 동부 시간은 UTC-5 (겨울) 또는 UTC-4 (여름)
    // 보수적으로 UTC-4로 계산 (여름 시간)
    date = new Date(`${dateString}T19:00:00-04:00`);
  }
  
  // 한국은 UTC+9이므로, 자동으로 로컬 시간대로 변환됨
  return date;
}

/**
 * 날짜를 한국 형식으로 포맷팅
 * @param date - Date 객체 또는 날짜 문자열
 * @param options - Intl.DateTimeFormatOptions
 * @returns 포맷팅된 날짜 문자열
 */
export function formatKoreanDate(
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  }
): string {
  const koreanDate = typeof date === 'string' ? convertToKoreanTime(date) : date;
  
  return koreanDate.toLocaleDateString('ko-KR', {
    ...options,
    timeZone: 'Asia/Seoul'
  });
}

/**
 * 날짜와 시간을 한국 형식으로 포맷팅
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 포맷팅된 날짜/시간 문자열
 */
export function formatKoreanDateTime(date: Date | string): string {
  const koreanDate = typeof date === 'string' ? convertToKoreanTime(date) : date;
  
  return koreanDate.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    weekday: 'short',
    timeZone: 'Asia/Seoul'
  });
}

/**
 * 상세 날짜 포맷 (모달 등에서 사용)
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 긴 형식의 날짜 문자열
 */
export function formatKoreanDateLong(date: Date | string): string {
  const koreanDate = typeof date === 'string' ? convertToKoreanTime(date) : date;
  
  return koreanDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Seoul'
  });
}