import React from 'react';
import { ToolType, WeatherCondition, GameMode } from '../types';
import { soundManager } from '../utils/sound';
import { 
  Play, Pause, MousePointer, Sprout, Footprints, 
  Dog, Flame, CloudRain, FlaskConical, ShieldAlert, Trash2, 
  Sun, CloudDrizzle, SunMedium, Volume2, VolumeX, RefreshCw, Zap
} from 'lucide-react';

interface ControlPanelProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  unlockedTools: ToolType[];
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  gameSpeed: number;
  setGameSpeed: (speed: number) => void;
  weather: WeatherCondition;
  setWeather: (w: WeatherCondition) => void;
  gameMode: GameMode;
  onResetGame: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onQuickAddGrass?: () => void;
  onQuickAddRabbits?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeTool,
  setActiveTool,
  unlockedTools,
  isPaused,
  setIsPaused,
  gameSpeed,
  setGameSpeed,
  weather,
  setWeather,
  gameMode,
  onResetGame,
  soundEnabled,
  setSoundEnabled,
  onQuickAddGrass,
  onQuickAddRabbits
}) => {
  const toolButtons: { type: ToolType; label: string; icon: React.ReactNode; badge: string; color: string; desc: string }[] = [
    { type: 'select', label: '선택 / 탐색', icon: <MousePointer className="w-4 h-4" />, badge: '🔍', color: 'bg-slate-100 border-slate-300 text-slate-700', desc: '클릭하여 상태 관찰' },
    { type: 'grass', label: '풀 씨앗 심기', icon: <Sprout className="w-4 h-4 text-emerald-600" />, badge: '🌿', color: 'bg-emerald-50 border-emerald-300 text-emerald-800', desc: '클릭/드래그하여 배치' },
    { type: 'rabbit', label: '토끼 방사', icon: <Footprints className="w-4 h-4 text-blue-600" />, badge: '🐇', color: 'bg-blue-50 border-blue-300 text-blue-800', desc: '초식동물 추가' },
    { type: 'wolf', label: '늑대 방사', icon: <Dog className="w-4 h-4 text-amber-600" />, badge: '🐺', color: 'bg-amber-50 border-amber-300 text-amber-800', desc: '육식동물 추가' },
    { type: 'eagle', label: '독수리 방사', icon: <Flame className="w-4 h-4 text-purple-600" />, badge: '🦅', color: 'bg-purple-50 border-purple-300 text-purple-800', desc: '최상위 포식자 추가' },
    { type: 'rain', label: '단비 내리기', icon: <CloudRain className="w-4 h-4 text-sky-600" />, badge: '🌧️', color: 'bg-sky-50 border-sky-300 text-sky-800', desc: '풀 수분 공급' },
    { type: 'fertilizer', label: '천연 비료', icon: <FlaskConical className="w-4 h-4 text-green-600" />, badge: '🧪', color: 'bg-green-50 border-green-300 text-green-800', desc: '풀 급성장' },
    { type: 'sanctuary', label: '토끼 보호구역', icon: <ShieldAlert className="w-4 h-4 text-teal-600" />, badge: '🛡️', color: 'bg-teal-50 border-teal-300 text-teal-800', desc: '안전지대 설치' },
    { type: 'remove', label: '개체 정리', icon: <Trash2 className="w-4 h-4 text-rose-600" />, badge: '🧹', color: 'bg-rose-50 border-rose-300 text-rose-800', desc: '필드 청소' }
  ];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
      {/* Simulation Speed & Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsPaused(!isPaused);
            }}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all shadow-md ${
              isPaused
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-300'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            <span>{isPaused ? '▶️ 게임 재개' : '⏸️ 일시정지'}</span>
          </button>

          <div className="flex bg-slate-100 rounded-2xl p-1 space-x-1 border border-slate-200">
            <span className="text-[11px] font-extrabold text-slate-500 px-2 py-1 flex items-center">속도:</span>
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  soundManager.playClick();
                  setGameSpeed(speed);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  gameSpeed === speed ? 'bg-white shadow-xs text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Weather Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-black text-slate-600">🌤️ 날씨:</span>
          <div className="flex bg-slate-100 rounded-2xl p-1 space-x-1 border border-slate-200">
            {[
              { type: 'sunny', label: '맑음', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
              { type: 'rainy', label: '우기', icon: <CloudDrizzle className="w-3.5 h-3.5 text-sky-500" /> },
              { type: 'drought', label: '가뭄', icon: <SunMedium className="w-3.5 h-3.5 text-orange-600" /> }
            ].map((w) => (
              <button
                key={w.type}
                onClick={() => {
                  soundManager.playClick();
                  setWeather(w.type as WeatherCondition);
                }}
                className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  weather === w.type ? 'bg-white shadow-xs text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {w.icon}
                <span>{w.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundManager.enabled = !soundEnabled;
              setSoundEnabled(!soundEnabled);
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors border border-transparent hover:border-slate-200"
            title="음향 효과"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onResetGame();
            }}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-200"
            title="초기화"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>다시시작</span>
          </button>
        </div>
      </div>

      {/* Intervention Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
            🛠️ 개입 도구함 <span className="text-[11px] font-normal text-slate-500">(클릭 후 맵을 클릭하거나 마우스로 누른 채 드래그하세요)</span>
          </span>
          {gameMode === 'challenge' && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              미션별 도구 자동 제공
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {toolButtons.map((tool) => {
            const isUnlocked = gameMode === 'sandbox' || unlockedTools.includes(tool.type);
            const isActive = activeTool === tool.type;

            return (
              <button
                key={tool.type}
                disabled={!isUnlocked}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTool(tool.type);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-xs font-black border transition-all relative group ${
                  isActive
                    ? 'ring-2 ring-emerald-500 shadow-md border-emerald-500 bg-emerald-50 text-emerald-900 scale-105'
                    : isUnlocked
                    ? `${tool.color} hover:shadow-xs hover:scale-102 cursor-pointer`
                    : 'bg-slate-50 border-slate-200 text-slate-300 opacity-40 cursor-not-allowed'
                }`}
                title={tool.desc}
              >
                <span className="text-xl mb-0.5">{tool.badge}</span>
                <span className="text-[11px] leading-tight text-center truncate w-full">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle School Quick Emergency Actions */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-600 animate-pulse" />
          <span className="text-xs font-extrabold text-amber-900">⚡ 중학생 전용 비상 긴급 버튼 (원클릭 배치):</span>
        </div>
        <div className="flex items-center space-x-2">
          {onQuickAddGrass && (
            <button
              onClick={() => {
                soundManager.playPlantSeed();
                onQuickAddGrass();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
            >
              <span>🌿 풀 +10 대량 씨뿌리기</span>
            </button>
          )}
          {onQuickAddRabbits && (
            <button
              onClick={() => {
                soundManager.playRabbitHop();
                onQuickAddRabbits();
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
            >
              <span>🐇 토끼 +5 대량 방사</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
