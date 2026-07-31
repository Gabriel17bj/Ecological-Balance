import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ChallengeLevel } from '../types';
import { Trophy, AlertTriangle, ArrowRight, RotateCcw, Star, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface LevelResultModalProps {
  status: 'victory' | 'defeat' | null;
  level: ChallengeLevel | null;
  reason?: string;
  onNextLevel: () => void;
  onRetry: () => void;
  onClose: () => void;
  finalBalanceIndex: number;
  onOpenReflection?: () => void;
}

export const LevelResultModal: React.FC<LevelResultModalProps> = ({
  status,
  level,
  reason,
  onNextLevel,
  onRetry,
  onClose,
  finalBalanceIndex,
  onOpenReflection
}) => {
  useEffect(() => {
    if (status === 'victory') {
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore if confetti fails
      }
    } else if (status === 'defeat') {
      soundManager.playGameOver();
    }
  }, [status]);

  if (!status || !level) return null;

  const isVictory = status === 'victory';

  // Stars calculation based on health index
  const starsCount = finalBalanceIndex >= 80 ? 3 : finalBalanceIndex >= 60 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="flex justify-center">
          {isVictory ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-100 border-4 border-rose-200 flex items-center justify-center text-rose-600 shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-black text-slate-800">
            {isVictory ? '🎉 축하합니다! 미션 클리어' : '😭 생태계 균형 붕괴'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">{level.title} - {level.subtitle}</p>
        </div>

        {/* Victory Stars */}
        {isVictory && (
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 ${
                  s <= starsCount ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Result Message Card */}
        <div className={`p-4 rounded-2xl text-xs text-left border ${
          isVictory ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
        }`}>
          {isVictory ? (
            <div className="space-y-1.5">
              <div className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 성공적으로 {level.targetTime}초 동안 균형을 수호했습니다!
              </div>
              <p className="text-emerald-700">
                최종 생태계 건강 지수: <strong>{finalBalanceIndex}%</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="font-extrabold text-sm text-rose-800">
                실패 원인: {reason || '특정 종이 멸종했거나 개체수가 고갈되었습니다.'}
              </div>
              <p className="text-rose-700">
                💡 <strong>도움말:</strong> {level.tips}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {onOpenReflection && (
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenReflection();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-black rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>📝 탐구 보고서 작성 & PDF 저장하기</span>
            </button>
          )}

          <div className="flex space-x-2">
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> 다시 도전
            </button>
            {isVictory && (
              <button
                onClick={onNextLevel}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <span>다음 단계 도전</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
