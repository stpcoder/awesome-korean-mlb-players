# K-Sports Star ⚾

> 해외에서 활약하는 한국인 스포츠 스타들의 실시간 경기 기록과 일정을 한눈에 보는 웹 애플리케이션

🔗 **라이브 데모**: [https://awesome-korean-mlb-players.vercel.app](https://awesome-korean-mlb-players.vercel.app)

## 🌟 주요 기능

### 🏠 메인 화면
- 한국인 MLB 선수들의 리스트 및 최신 경기 결과
- 선수별 카드 형식의 정보 제공
- 실시간 업데이트되는 경기 일정

### ⚾ MLB 선수 정보
- **선수 리스트**: 메이저리그 및 마이너리그에서 활약하는 한국인 선수들
- **선수 상세 정보**: 
  - 기본 프로필 (나이, 팀, 포지션)
  - 2025 시즌 통계 (타율, 홈런, 타점, 방어율 등)
  - 최근 경기 기록 (무한 스크롤)
  - 경기별 상세 기록 (타석별/이닝별)

### 📅 경기 일정 및 결과
- **오늘의 경기**: 실시간 경기 진행 상황
- **지난 경기**: 최근 3일간 경기 결과
- **한국인 선수 출전 정보**: 경기별 선수 기록
- **이닝별 상세 기록**: 토글로 확인 가능

### 🎯 특별 기능
- **투타겸업(TWP) 선수 지원**: 투수/타자 기록 동시 표시
- **한국 시간대 변환**: 모든 날짜/시간을 한국 시간으로 자동 변환
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원

## 🛠 기술 스택

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Data Source**: MLB Stats API
- **State Management**: React Hooks
- **Animation**: react-bits 컴포넌트

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18.x 이상
- npm 또는 yarn

### 설치
```bash
# 저장소 클론
git clone https://github.com/stpcoder/awesome-korean-mlb-players.git
cd awesome-korean-mlb-players

# 의존성 설치
npm install
```

### 실행
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드된 파일 미리보기
npm run preview
```

### 환경 변수
현재 별도의 환경 변수 설정은 필요하지 않습니다. MLB API는 공개 API를 사용합니다.

## 🚀 Vercel 배포

### 자동 배포 (권장)
1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. "Import Project" 클릭
3. GitHub 저장소 `stpcoder/awesome-korean-mlb-players` 선택
4. 프로젝트 설정은 자동으로 감지됨 (Vite 프레임워크)
5. "Deploy" 클릭

### 수동 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

배포 후 `https://[프로젝트명].vercel.app` 형태의 URL이 생성됩니다.

## 📁 프로젝트 구조

```
k-sports-star/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── common/          # 공통 컴포넌트 (Button, Card, Modal 등)
│   │   ├── home/            # 홈 화면 컴포넌트
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── mlb/             # MLB 관련 컴포넌트
│   │   └── sports/          # 스포츠 공통 컴포넌트
│   ├── data/                # 정적 데이터 및 상수
│   │   ├── mlbPlayers.ts    # 한국인 MLB 선수 정보
│   │   ├── mlbTeamNames.ts  # MLB 팀명 한글 변환
│   │   └── mlbPositions.ts  # 포지션 한글 변환
│   ├── hooks/               # 커스텀 React Hooks
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── MLBPage.tsx      # MLB 메인 페이지
│   │   └── MLBPlayerDetail.tsx # 선수 상세 페이지
│   ├── services/            # API 서비스
│   │   └── mlbService.ts    # MLB API 통신
│   ├── styles/              # 전역 스타일
│   ├── types/               # TypeScript 타입 정의
│   └── utils/               # 유틸리티 함수
│       └── dateUtils.ts     # 날짜 변환 유틸리티
├── public/                  # 정적 파일
├── react-bits-kit/          # UI 디자인 시스템
└── package.json

```

## 🎨 디자인 시스템

### 색상 팔레트
- **주 색상**: 한국 국기 색상 (#CD2E3A 빨강, #0047A0 파랑)
- **스포츠 색상**: #FF6B35 (오렌지), #2ECC71 (그린)
- **배경**: #F8F9FA (연한 회색)
- **텍스트**: #2C3E50 (진한 회색)

### 컴포넌트 스타일
- **카드**: 둥근 모서리 (border-radius: 12px), 그림자 효과
- **버튼**: 그라데이션 배경, 호버 효과
- **애니메이션**: 0.3초 ease-in-out 트랜지션

## 📊 데이터 소스

- **MLB Stats API**: 실시간 경기 데이터 및 선수 통계
- **정적 데이터**: 한국인 선수 목록 및 팀/포지션 한글 변환

## 🚀 주요 페이지

### `/` - 홈
- 전체 스포츠 종목 선택
- 한국인 선수 하이라이트

### `/mlb` - MLB 메인
- 한국인 MLB 선수 카드 리스트
- 오늘의 경기 일정
- 최근 경기 결과

### `/mlb/player/:id` - 선수 상세
- 선수 프로필 및 시즌 통계
- 최근 경기 상세 기록
- 타석별/이닝별 플레이 기록

## 🔄 업데이트 예정

- [ ] 다른 스포츠 종목 추가 (KBO, NPB, 축구, 농구 등)
- [ ] 선수별 하이라이트 영상
- [ ] 실시간 알림 기능
- [ ] 선수 비교 기능
- [ ] 다크 모드

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👥 기여

기여를 환영합니다! PR을 보내주세요.

## 📧 문의

문제가 있거나 제안사항이 있으시면 이슈를 생성해주세요.

---

Made with ❤️ for Korean sports fans worldwide