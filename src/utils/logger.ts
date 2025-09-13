// 프로덕션 환경에서 콘솔 로그를 제어하는 유틸리티
const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // 에러는 프로덕션에서도 표시 (중요한 정보)
    console.error(...args);
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  }
};

// 기본 export
export default logger;