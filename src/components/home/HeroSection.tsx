import React from 'react';
import { Button } from '../common/Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-korea-blue via-white to-korea-red py-20 rounded-2xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-6 gap-4 p-8">
          {[...Array(30)].map((_, i) => (
            <span key={i} className="text-4xl animate-bounce-in" style={{ animationDelay: `${i * 0.1}s` }}>
              {['⚽', '⚾', '🏀', '🎾', '⛳'][i % 5]}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-korea-red to-korea-blue bg-clip-text text-transparent">
            대한민국
          </span>
          <span className="block mt-2">스포츠 영웅들</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          세계 무대에서 활약하는 한국 스포츠 스타들의 
          경기 일정과 활약상을 실시간으로 확인하세요
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg">
            오늘의 경기 보기 📅
          </Button>
          <Button variant="ghost" size="lg">
            선수 둘러보기 🏃
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <p className="text-3xl font-bold text-korea-blue">50+</p>
            <p className="text-sm text-gray-600">활약 중인 선수</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-korea-red">10+</p>
            <p className="text-sm text-gray-600">리그</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-sport-green">5</p>
            <p className="text-sm text-gray-600">종목</p>
          </div>
        </div>
      </div>
    </section>
  );
};