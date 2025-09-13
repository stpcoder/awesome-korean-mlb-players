import React, { useState } from 'react';
import { MLBPlayerCard } from '../components/mlb/MLBPlayerCard';
import { MLBSchedule } from '../components/mlb/MLBSchedule';
import { Button } from '../components/common/Button';
import { mlbPlayers } from '../data/mlbPlayers';

export const MLBPage: React.FC = () => {
  const [view, setView] = useState<'players' | 'schedule'>('players');
  const [selectedNationality, setSelectedNationality] = useState<'all' | 'KOR' | 'JPN'>('all');

  const filteredPlayers = mlbPlayers.filter(player => {
    if (selectedNationality === 'all') return true;
    return player.nationality === selectedNationality;
  });

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 sm:py-12 px-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <span>⚾</span>
            MLB 한국/일본 선수
          </h1>
          <p className="text-sm sm:text-lg opacity-90">
            메이저리그에서 활약하는 아시아 선수들의 실시간 통계와 경기 정보
          </p>
          <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-2xl">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">{mlbPlayers.filter(p => p.nationality === 'KOR').length}</p>
              <p className="text-xs sm:text-sm opacity-80">한국 선수</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">{mlbPlayers.filter(p => p.nationality === 'JPN').length}</p>
              <p className="text-xs sm:text-sm opacity-80">일본 선수</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">2024</p>
              <p className="text-xs sm:text-sm opacity-80">시즌</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">LIVE</p>
              <p className="text-xs sm:text-sm opacity-80">실시간 데이터</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <Button
            variant={view === 'players' ? 'primary' : 'ghost'}
            onClick={() => setView('players')}
          >
            선수 정보 👥
          </Button>
          <Button
            variant={view === 'schedule' ? 'primary' : 'ghost'}
            onClick={() => setView('schedule')}
          >
            오늘 경기 📅
          </Button>
        </div>

        {/* Nationality Filter (선수 정보 뷰에서만) */}
        {view === 'players' && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedNationality === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedNationality('all')}
            >
              전체
            </Button>
            <Button
              size="sm"
              variant={selectedNationality === 'KOR' ? 'primary' : 'ghost'}
              onClick={() => setSelectedNationality('KOR')}
            >
              🇰🇷 한국
            </Button>
            <Button
              size="sm"
              variant={selectedNationality === 'JPN' ? 'primary' : 'ghost'}
              onClick={() => setSelectedNationality('JPN')}
            >
              🇯🇵 일본
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {view === 'players' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredPlayers.map(player => (
            <MLBPlayerCard key={player.id} playerInfo={player} />
          ))}
        </div>
      ) : (
        <MLBSchedule />
      )}

      {/* Data Source Info */}
      <div className="mt-8 sm:mt-12 p-3 sm:p-4 bg-blue-50 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-700">
          <span className="font-semibold">📊 데이터 출처:</span> MLB Stats API (공식 무료 API)
        </p>
        <p className="text-xs text-blue-600 mt-1">
          실시간으로 업데이트되는 공식 통계 데이터를 제공받고 있습니다.
        </p>
      </div>
    </div>
  );
};