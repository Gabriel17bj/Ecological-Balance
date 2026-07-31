import React from 'react';
import { LEVEL_PRESETS } from '../data/levels';
import { GameMode, ChallengeLevel } from '../types';
import { soundManager } from '../utils/sound';
import { Trophy, Sliders, CheckCircle2, Lock, Sparkles } from 'lucide-react';

interface LevelSelectorProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  currentLevelId: number;
  onSelectLevel: (level: ChallengeLevel) => void;
  completedLevelIds: number[];
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  gameMode,
  setGameMode,
  currentLevelId,
  onSelectLevel,
  completedLevelIds
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
          <button
            onClick={() => {
              soundManager.playClick();
              setGameMode('challenge');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'challenge'
                ? 'bg-white shadow-xs text-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>도전 미션 모드</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setGameMode('sandbox');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'sandbox'
                ? 'bg-white shadow-xs text-blue-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>자유 샌드박스</span>
          </button>
        </div>

        <span className="text-xs font-medium text-slate-500 hidden sm:inline">
          {gameMode === 'challenge' ? '단계별 생태계 미션을 클리어하세요!' : '제한 없이 나만의 생태계를 실험하세요!'}
        </span>
      </div>

      {/* Challenge Levels List */}
      {gameMode === 'challenge' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          {LEVEL_PRESETS.map((lvl) => {
            const isCompleted = completedLevelIds.includes(lvl.id);
            const isCurrent = currentLevelId === lvl.id;
            const isUnlocked = lvl.id === 1 || completedLevelIds.includes(lvl.id - 1) || completedLevelIds.includes(lvl.id);

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => {
                  soundManager.playClick();
                  onSelectLevel(lvl);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-28 ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50'
                    : isUnlocked
                    ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    : 'border-slate-100 bg-slate-50 text-slate-300 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
                      Level {lvl.id}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : null}
                  </div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">{lvl.title}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{lvl.subtitle}</div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-100">
                  <span>⏱️ {lvl.targetTime}초</span>
                  <span className="text-emerald-700 font-bold">🌿{lvl.initialGrass} 🐇{lvl.initialRabbits} {lvl.initialWolves > 0 ? `🐺${lvl.initialWolves}` : ''}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-blue-50/60 border border-blue-200/80 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-blue-900">자유 샌드박스 모드 활성화 중</h4>
              <p className="text-[11px] text-blue-700 mt-0.5">
                모든 도구(풀, 토끼, 늑대, 독수리, 비, 보호구역)가 해금되어 있습니다. 제한 시간 없이 자유롭게 실험하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
