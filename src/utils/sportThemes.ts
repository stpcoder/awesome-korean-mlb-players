import { SportType, SportTheme } from '../types';

export const sportThemes: Record<SportType, SportTheme> = {
  football: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: '⚽',
    gradient: 'from-green-400 to-green-600',
  },
  baseball: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '⚾',
    gradient: 'from-blue-400 to-blue-600',
  },
  basketball: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: '🏀',
    gradient: 'from-orange-400 to-orange-600',
  },
  tennis: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    icon: '🎾',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  golf: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: '⛳',
    gradient: 'from-emerald-400 to-emerald-600',
  },
};

export const getSportTheme = (sport: SportType): SportTheme => {
  return sportThemes[sport];
};