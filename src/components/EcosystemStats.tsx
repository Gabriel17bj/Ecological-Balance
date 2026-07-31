import React from 'react';
import { Entity } from '../types';
import { Activity, Leaf, Rabbit, Dog, Flame, ShieldCheck, HeartPulse } from 'lucide-react';

interface EcosystemStatsProps {
  entities: Entity[];
  timer: number;
  targetTime: number;
  balanceIndex: number;
}

export const EcosystemStats: React.FC<EcosystemStatsProps> = ({
  entities,
  timer,
  targetTime,
  balanceIndex
}) => {
  const grassCount = entities.filter((e) => e.type === 'grass').length;
  const rabbitCount = entities.filter((e) => e.type === 'rabbit').length;
  const wolfCount = entities.filter((e) => e.type === 'wolf').length;
  const eagleCount = entities.filter((e) => e.type === 'eagle').length;

  // Health level label
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: '매우 안정적 (우수)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (score >= 55) return { label: '적정 균형 유지', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 30) return { label: '불균형 주의', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: '생태계 위기!', color: 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse' };
  };

  const health = getHealthStatus(balanceIndex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {/* Timer & Ecosystem Balance Index */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-100 flex items-center gap-1">
            <Activity className="w-4 h-4" /> 생태계 수호 시간
          </span>
          <span className="text-xs bg-emerald-800/60 px-2 py-0.5 rounded-full font-mono text-emerald-200">
            목표 {targetTime}초
          </span>
        </div>
        <div className="my-2">
          <div className="text-3xl font-extrabold tracking-tight font-mono">
            {timer} <span className="text-sm font-normal text-emerald-200">초</span>
          </div>
          <div className="w-full bg-emerald-950/40 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-300 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (timer / targetTime) * 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/30">
          <span className="text-emerald-100">건강 지수:</span>
          <span className="font-bold text-emerald-200">{balanceIndex}%</span>
        </div>
      </div>

      {/* Counts Grid */}
      <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-emerald-600" /> 개체수 모니터링
          </span>
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${health.color}`}>
            {health.label}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Grass */}
          <div className="bg-emerald-50/70 border border-emerald-200/70 p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> 🌿 풀 (생산자)
              </div>
              <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">{grassCount}</div>
            </div>
          </div>

          {/* Rabbit */}
          <div className="bg-blue-50/70 border border-blue-200/70 p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                <Rabbit className="w-3.5 h-3.5 text-blue-600" /> 🐇 토끼 (1차)
              </div>
              <div className="text-2xl font-black text-blue-900 font-mono mt-0.5">{rabbitCount}</div>
            </div>
          </div>

          {/* Wolf */}
          <div className="bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                <Dog className="w-3.5 h-3.5 text-amber-600" /> 🐺 늑대 (2차)
              </div>
              <div className="text-2xl font-black text-amber-900 font-mono mt-0.5">{wolfCount}</div>
            </div>
          </div>

          {/* Eagle */}
          <div className="bg-purple-50/70 border border-purple-200/70 p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-purple-800 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-purple-600" /> 🦅 독수리 (최상위)
              </div>
              <div className="text-2xl font-black text-purple-900 font-mono mt-0.5">{eagleCount}</div>
            </div>
          </div>
        </div>

        {/* Energy Food Pyramid Visual Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-500 font-semibold">
          <span>생태계 피라미드:</span>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: `${Math.min(100, (grassCount / Math.max(1, grassCount + rabbitCount + wolfCount + eagleCount)) * 100)}%` }} className="bg-emerald-500 h-full" title="생산자" />
            <div style={{ width: `${Math.min(100, (rabbitCount / Math.max(1, grassCount + rabbitCount + wolfCount + eagleCount)) * 100)}%` }} className="bg-blue-500 h-full" title="1차 소비자" />
            <div style={{ width: `${Math.min(100, (wolfCount / Math.max(1, grassCount + rabbitCount + wolfCount + eagleCount)) * 100)}%` }} className="bg-amber-500 h-full" title="2차 소비자" />
            <div style={{ width: `${Math.min(100, (eagleCount / Math.max(1, grassCount + rabbitCount + wolfCount + eagleCount)) * 100)}%` }} className="bg-purple-500 h-full" title="최상위 포식자" />
          </div>
        </div>
      </div>
    </div>
  );
};
