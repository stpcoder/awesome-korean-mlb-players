import React, { useState } from 'react';
import { MLBPlayerCard } from '../components/mlb/MLBPlayerCard';
import { MLBSchedule } from '../components/mlb/MLBSchedule';
import { useDynamicMLBPlayers } from '../hooks/useDynamicMLBPlayers';

// 탭 버튼 컴포넌트
const TabButton = ({
  active,
  onClick,
  children,
  icon
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: string;
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
      transition-all duration-300
      ${active
        ? 'bg-white text-gray-900 shadow-lg'
        : 'text-white/80 hover:text-white hover:bg-white/10'
      }
    `}
  >
    <span>{icon}</span>
    {children}
  </button>
);

// 필터 버튼 컴포넌트
const FilterChip = ({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-full text-sm font-medium
      transition-all duration-200
      ${active
        ? 'bg-accent-purple text-white shadow-md'
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }
    `}
  >
    {children}
  </button>
);

// 통계 카드 컴포넌트
const StatCard = ({
  value,
  label,
  icon
}: {
  value: string | number;
  label: string;
  icon: string;
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
    <div className="text-3xl mb-1">{icon}</div>
    <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
    <div className="text-xs text-white/70 mt-1">{label}</div>
  </div>
);

export const MLBPage: React.FC = () => {
  const [view, setView] = useState<'players' | 'schedule'>('players');
  const [levelFilter, setLevelFilter] = useState<'all' | 'mlb' | 'milb'>('all');

  // 동적 선수 데이터 사용
  const {
    mlbPlayers,
    tripleAPlayers,
    doubleAPlayers,
    singleAPlayers,
    rookiePlayers,
    allPlayers,
    isLoading,
    lastUpdated
  } = useDynamicMLBPlayers();

  // 필터링된 선수 목록
  const filteredPlayers = (() => {
    switch (levelFilter) {
      case 'mlb':
        return mlbPlayers;
      case 'milb':
        return [...tripleAPlayers, ...doubleAPlayers, ...singleAPlayers, ...rookiePlayers];
      default:
        return allPlayers;
    }
  })();

  // 선수 데이터를 MLBPlayerCard에 맞는 형식으로 변환
  const playerInfoList = filteredPlayers.map(p => ({
    id: `player-${p.mlbId}`,
    mlbId: p.mlbId,
    name: p.nameKr,
    nameEn: p.nameEn,
    team: p.team,
    teamId: p.teamId,
    position: p.position,
    jerseyNumber: p.jerseyNumber,
    nationality: 'KOR' as const,
    level: p.level === 'MLB' ? 'MLB' : 'MiLB' as 'MLB' | 'MiLB',
    league: p.league,
    sportId: p.sportId,
  }));

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Hero Section - 대시보드 스타일 */}
      <section className="relative overflow-hidden">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

        {/* 패턴 오버레이 */}
        <div className="absolute inset-0 bg-mesh-pattern opacity-20" />

        {/* 빛나는 원형 효과 */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-purple/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-korea-blue/30 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-16">
          {/* 헤더 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl animate-float">⚾</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  K-MLB 대시보드
                </h1>
              </div>
              <p className="text-white/70 text-sm md:text-base">
                메이저리그에서 활약하는 한국 선수들의 실시간 정보
              </p>
            </div>

            {/* 마지막 업데이트 */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
              </div>
            )}
          </div>

          {/* 통계 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <StatCard
              value={mlbPlayers.length}
              label="메이저리거"
              icon="🏆"
            />
            <StatCard
              value={tripleAPlayers.length + doubleAPlayers.length}
              label="마이너리거"
              icon="📈"
            />
            <StatCard
              value="2025"
              label="시즌"
              icon="📅"
            />
            <StatCard
              value="LIVE"
              label="실시간 데이터"
              icon="🔴"
            />
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-2">
            <TabButton
              active={view === 'players'}
              onClick={() => setView('players')}
              icon="👥"
            >
              선수 정보
            </TabButton>
            <TabButton
              active={view === 'schedule'}
              onClick={() => setView('schedule')}
              icon="📅"
            >
              경기 일정
            </TabButton>
          </div>
        </div>
      </section>

      {/* 콘텐츠 영역 */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {view === 'players' ? (
          <>
            {/* 필터 */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-500">리그:</span>
              <FilterChip
                active={levelFilter === 'all'}
                onClick={() => setLevelFilter('all')}
              >
                전체 ({allPlayers.length})
              </FilterChip>
              <FilterChip
                active={levelFilter === 'mlb'}
                onClick={() => setLevelFilter('mlb')}
              >
                🏆 메이저 ({mlbPlayers.length})
              </FilterChip>
              <FilterChip
                active={levelFilter === 'milb'}
                onClick={() => setLevelFilter('milb')}
              >
                📈 마이너 ({tripleAPlayers.length + doubleAPlayers.length + singleAPlayers.length + rookiePlayers.length})
              </FilterChip>
            </div>

            {/* 선수 카드 그리드 */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse"
                  >
                    <div className="h-28 bg-gradient-to-r from-gray-200 to-gray-300" />
                    <div className="p-5">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-xl -mt-12" />
                        <div className="flex-1 space-y-2 pt-2">
                          <div className="h-5 bg-gray-200 rounded w-24" />
                          <div className="h-4 bg-gray-200 rounded w-32" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {playerInfoList.map((player) => (
                  <MLBPlayerCard key={player.mlbId} playerInfo={player} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⚾</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  선수 정보 없음
                </h3>
                <p className="text-gray-500">
                  선택한 필터에 해당하는 선수가 없습니다.
                </p>
              </div>
            )}
          </>
        ) : (
          <MLBSchedule />
        )}

        {/* 데이터 출처 */}
        <div className="mt-10 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                데이터 출처: MLB Stats API
              </p>
              <p className="text-xs text-gray-500 mt-1">
                공식 MLB API를 통해 실시간으로 업데이트되는 통계 데이터를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
