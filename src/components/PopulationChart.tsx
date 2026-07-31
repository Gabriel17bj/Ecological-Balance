import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { PopulationLog } from '../types';
import { TrendingUp } from 'lucide-react';

interface PopulationChartProps {
  data: PopulationLog[];
}

export const PopulationChart: React.FC<PopulationChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> 실시간 개체수 변화 그래프 (Lotka-Volterra 추이)
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">최근 60초 기록</span>
      </div>

      <div className="w-full h-48 text-xs font-sans">
        {data.length < 2 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            시뮬레이션을 시작하면 실시간 개체수 추이가 그래프로 기록됩니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="timeFormatted" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                formatter={(value) => {
                  const map: Record<string, string> = {
                    grass: '🌿 풀',
                    rabbits: '🐇 토끼',
                    wolves: '🐺 늑대',
                    eagles: '🦅 독수리',
                    balanceIndex: '💚 건강지수(%)'
                  };
                  return map[value] || value;
                }}
              />
              <Line type="monotone" dataKey="grass" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="rabbits" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="wolves" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="eagles" stroke="#8b5cf6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
