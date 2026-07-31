import React from 'react';
import { Entity } from '../types';
import { X, Heart, Battery, Sparkles, Trash2, Shield } from 'lucide-react';

interface EntityDetailDrawerProps {
  entity: Entity | null;
  onClose: () => void;
  onFeedEntity: (id: string) => void;
  onRemoveEntity: (id: string) => void;
}

export const EntityDetailDrawer: React.FC<EntityDetailDrawerProps> = ({
  entity,
  onClose,
  onFeedEntity,
  onRemoveEntity
}) => {
  if (!entity) return null;

  const typeMap: Record<string, { label: string; emoji: string; color: string }> = {
    grass: { label: '초목 (풀)', emoji: '🌿', color: 'bg-emerald-100 text-emerald-800' },
    rabbit: { label: '토끼 (1차 소비자)', emoji: '🐇', color: 'bg-blue-100 text-blue-800' },
    wolf: { label: '늑대 (2차 소비자)', emoji: '🐺', color: 'bg-amber-100 text-amber-800' },
    eagle: { label: '독수리 (상위 포식자)', emoji: '🦅', color: 'bg-purple-100 text-purple-800' },
    carcass: { label: '사체 / 유기물', emoji: '💀', color: 'bg-slate-100 text-slate-800' }
  };

  const info = typeMap[entity.type] || { label: entity.type, emoji: '🐾', color: 'bg-slate-100' };

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 w-80 text-xs space-y-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{info.emoji}</span>
          <div>
            <h4 className="font-extrabold text-slate-800">{info.label}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${info.color}`}>
              ID: {entity.id.slice(0, 12)}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Energy Bar */}
        <div>
          <div className="flex justify-between font-bold text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-emerald-600" /> 에너지
            </span>
            <span>{Math.round(entity.energy)} / {entity.maxEnergy}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                entity.energy > 50 ? 'bg-emerald-500' : entity.energy > 20 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (entity.energy / entity.maxEnergy) * 100)}%` }}
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-slate-400 block">나이 / 수명</span>
            <span className="font-bold text-slate-700">{Math.floor(entity.age)} / {entity.maxAge}초</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-slate-400 block">행동 상태</span>
            <span className="font-bold text-slate-700 capitalize">
              {entity.state === 'grazing'
                ? '🌾 섭식 중'
                : entity.state === 'hunting'
                ? '🍖 사냥 중'
                : entity.state === 'fleeing'
                ? '🏃 도망치는 중'
                : '💤 배회 중'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onFeedEntity(entity.id)}
          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" /> 에너지 보충
        </button>
        <button
          onClick={() => onRemoveEntity(entity.id)}
          className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> 삭제
        </button>
      </div>
    </div>
  );
};
