import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-korea-blue to-korea-red text-white mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">K-Sports Star</h3>
            <p className="text-sm opacity-90">
              해외에서 활약하는 대한민국 스포츠 스타들의 
              경기 일정과 활약상을 한눈에 확인하세요.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">빠른 링크</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="#football" className="hover:underline">축구 ⚽</a></li>
              <li><a href="#baseball" className="hover:underline">야구 ⚾</a></li>
              <li><a href="#basketball" className="hover:underline">농구 🏀</a></li>
              <li><a href="#calendar" className="hover:underline">경기 일정 📅</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-bold mb-4">팔로우</h3>
            <div className="flex gap-4">
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📱</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📧</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🌐</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm opacity-80">
          © 2024 K-Sports Star. All rights reserved. 🇰🇷
        </div>
      </div>
    </footer>
  );
};