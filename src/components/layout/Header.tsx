import React, { useState } from 'react';
import { SportType } from '../../types';
import { SportBadge } from '../common/SportBadge';

const sports: SportType[] = ['football', 'baseball', 'basketball', 'tennis', 'golf'];

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇰🇷</span>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-korea-red to-korea-blue bg-clip-text text-transparent">
              K-Sports Star
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {sports.map((sport) => (
              <a
                key={sport}
                href={`#${sport}`}
                className="hover:scale-110 transition-transform"
              >
                <SportBadge sport={sport} size="sm" showLabel={false} />
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t animate-slide-up">
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <a
                  key={sport}
                  href={`#${sport}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <SportBadge sport={sport} size="sm" />
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};