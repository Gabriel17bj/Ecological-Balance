import React from 'react';
import { WeatherCondition } from '../types';
import { CloudRain, Sun, Zap, Sparkles } from 'lucide-react';

interface DisasterEventBannerProps {
  weather: WeatherCondition;
  eventMessage: string | null;
}

export const DisasterEventBanner: React.FC<DisasterEventBannerProps> = ({ weather, eventMessage }) => {
  if (weather === 'sunny' && !eventMessage) return null;

  const weatherBannerMap: Record<WeatherCondition, { title: string; desc: string; icon: React.ReactNode; style: string }> = {
    sunny: { title: '온화한 날씨', desc: '평온한 햇살 아래 생태계가 안정적으로 자라납니다.', icon: <Sun className="w-4 h-4 text-amber-500" />, style: 'bg-amber-50 border-amber-200 text-amber-900' },
    rainy: { title: '🌧️ 생명의 단비 집중 조우', desc: '단비가 내려 초목이 2.2배 빠르게 자라고 토양이 비옥해집니다.', icon: <CloudRain className="w-4 h-4 text-sky-600" />, style: 'bg-sky-50 border-sky-200 text-sky-900' },
    drought: { title: '☀️ 극심한 가뭄 발생!', desc: '가뭄으로 풀 성장이 둔화됩니다. 단비 도구(🌧️)나 풀 씨앗을 공급하세요.', icon: <Zap className="w-4 h-4 text-orange-600" />, style: 'bg-orange-50 border-orange-200 text-orange-900 animate-pulse' },
    autumn: { title: '🍁 계절 변화', desc: '낙엽이 지고 먹이가 줄어듭니다.', icon: <Sparkles className="w-4 h-4 text-amber-600" />, style: 'bg-amber-50 border-amber-200 text-amber-900' }
  };

  const currentBanner = weatherBannerMap[weather];

  return (
    <div className={`p-3 rounded-2xl border shadow-xs flex items-center justify-between text-xs transition-all ${currentBanner.style}`}>
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded-xl bg-white/80 shadow-xs">{currentBanner.icon}</div>
        <div>
          <span className="font-extrabold block">{eventMessage || currentBanner.title}</span>
          <span className="text-[11px] opacity-80">{currentBanner.desc}</span>
        </div>
      </div>
    </div>
  );
};
