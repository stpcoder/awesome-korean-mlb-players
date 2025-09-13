import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import './styles/globals.css';
import { MLBPlayerCard } from './components/mlb/MLBPlayerCard';
import { MLBScheduleEnhanced } from './components/mlb/MLBScheduleEnhanced';
import { MLBPlayerDetail } from './pages/MLBPlayerDetail';
import { mlbPlayers } from './data/mlbPlayers';
import { mlbService } from './services/mlbService';

// 선수 정보 페이지 (메인)
function PlayersPage() {
  const [playerLevel, setPlayerLevel] = useState<'MLB' | 'MiLB'>('MLB');
  const navigate = useNavigate();
  const [playersWithInfo, setPlayersWithInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 선수 정보 업데이트
  useEffect(() => {
    const updatePlayersInfo = async () => {
      setLoading(true);
      const playerIds = mlbPlayers.map(p => p.mlbId);
      const playerInfos = await mlbService.getPlayersInfo(playerIds);
      
      // 한글 이름과 API 정보 병합
      const mergedPlayers = mlbPlayers.map(player => {
        const apiInfo = playerInfos.find(info => info?.mlbId === player.mlbId);
        return {
          ...player,
          ...apiInfo,
          name: player.name, // 한글 이름 유지
        };
      });
      
      setPlayersWithInfo(mergedPlayers);
      setLoading(false);
    };

    updatePlayersInfo();
  }, []);

  // 레벨에 따라 선수 필터링
  const filteredPlayers = playersWithInfo.filter(player => player.level === playerLevel);

  return (
    <>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">MLB 선수 정보</h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">실시간 데이터로 확인하는 한국 선수 성적</p>
      </div>

      {/* 메이저/마이너 탭 */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => setPlayerLevel('MLB')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm md:text-base transition-all ${
            playerLevel === 'MLB'
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          메이저리거 ({playersWithInfo.filter(p => p.level === 'MLB').length}명)
        </button>
        <button
          onClick={() => setPlayerLevel('MiLB')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm md:text-base transition-all ${
            playerLevel === 'MiLB'
              ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          마이너리거 ({playersWithInfo.filter(p => p.level === 'MiLB').length}명)
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredPlayers.map(player => (
            <div 
              key={player.id}
              onClick={() => navigate(`/player/${player.id}`)}
              className="cursor-pointer transform transition-transform hover:scale-[1.02]"
            >
              <MLBPlayerCard playerInfo={player} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// 경기 일정 페이지
function SchedulePage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="section-title">오늘의 MLB 경기</h2>
        <p className="text-gray-600">한국 선수가 출전하는 경기 일정 (한국시간 기준)</p>
      </div>

      <MLBScheduleEnhanced />
    </>
  );
}

// 공통 레이아웃 컴포넌트
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">K-MLB</h1>
              <span className="hidden sm:block text-xs sm:text-sm text-gray-500">한국 선수 MLB 실시간 통계</span>
            </div>
            
            {/* 네비게이션 */}
            <nav className="flex gap-1 sm:gap-2">
              <Link
                to="/"
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm transition-all ${
                  location.pathname === '/' 
                    ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                선수 정보
              </Link>
              <Link
                to="/schedule"
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm transition-all ${
                  location.pathname === '/schedule' 
                    ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                경기 일정
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 K-MLB. MLB Stats API 기반 실시간 데이터</p>
            <p className="text-xs mt-1">실시간으로 업데이트되는 2025 시즌 통계입니다</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router basename="/awesome-korean-mlb-players">
      <Routes>
        <Route path="/" element={<Layout><PlayersPage /></Layout>} />
        <Route path="/schedule" element={<Layout><SchedulePage /></Layout>} />
        <Route path="/player/:playerId" element={<MLBPlayerDetail />} />
      </Routes>
    </Router>
  );
}

export default App;