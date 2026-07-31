import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Entity, 
  WeatherCondition, 
  ToolType, 
  GameMode, 
  ActivityMode,
  ChallengeLevel, 
  SanctuaryZone, 
  FloatingText, 
  PopulationLog 
} from './types';
import { LEVEL_PRESETS } from './data/levels';
import { EcosystemCanvas } from './components/EcosystemCanvas';
import { ControlPanel } from './components/ControlPanel';
import { EcosystemStats } from './components/EcosystemStats';
import { PopulationChart } from './components/PopulationChart';
import { LevelSelector } from './components/LevelSelector';
import { EcosystemGuideModal } from './components/EcosystemGuideModal';
import { EntityDetailDrawer } from './components/EntityDetailDrawer';
import { DisasterEventBanner } from './components/DisasterEventBanner';
import { LevelResultModal } from './components/LevelResultModal';
import { ReflectionReportModal } from './components/ReflectionReportModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { soundManager } from './utils/sound';
import { Leaf, BookOpen, ShieldCheck, HelpCircle, Volume2, VolumeX, Sparkles, FileText, Lock } from 'lucide-react';

export default function App() {
  // Game Setup State
  const [gameMode, setGameMode] = useState<GameMode>('challenge');
  const [activityMode, setActivityMode] = useState<ActivityMode>('auto');
  const [currentLevel, setCurrentLevel] = useState<ChallengeLevel>(LEVEL_PRESETS[0]);
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>([]);

  // Simulation Entities & State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sanctuaries, setSanctuaries] = useState<SanctuaryZone[]>([]);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  // Refs for current state to avoid resetting interval timer on entity state updates
  const entitiesRef = useRef(entities);
  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  const currentLevelRef = useRef(currentLevel);
  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  const gameModeRef = useRef(gameMode);
  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  // Playback State
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer & Statistics Logs
  const [timer, setTimer] = useState<number>(0);
  const [populationLogs, setPopulationLogs] = useState<PopulationLog[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Modals & Results
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [reflectionModalOpen, setReflectionModalOpen] = useState<boolean>(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{ status: 'victory' | 'defeat' | null; reason?: string }>({ status: null });

  // Auto-open privacy modal if accessed via /privacy route
  useEffect(() => {
    if (window.location.pathname === '/privacy') {
      setPrivacyModalOpen(true);
    }
  }, []);

  // Floating text helper
  const addFloatingText = useCallback((text: string, x: number, y: number, color = '#22c55e') => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color, createdAt: Date.now() }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
    }, 1200);
  }, []);

  // Compute Ecosystem Health Index (0 - 100%)
  const calculateBalanceIndex = useCallback((currentEntities: Entity[] = entitiesRef.current) => {
    const grass = currentEntities.filter((e) => e.type === 'grass').length;
    const rabbits = currentEntities.filter((e) => e.type === 'rabbit').length;
    const wolves = currentEntities.filter((e) => e.type === 'wolf').length;
    const eagles = currentEntities.filter((e) => e.type === 'eagle').length;

    if (grass === 0 && rabbits === 0) return 0;

    let score = 50;

    // Grass ratio check
    if (grass >= rabbits * 1.5 && grass >= 5) score += 20;
    else if (grass < rabbits) score -= 20;

    // Predator-Prey ratio check
    if (wolves > 0) {
      if (rabbits >= wolves * 1.8) score += 20;
      else if (rabbits < wolves) score -= 25;
    } else {
      if (currentLevelRef.current.initialWolves > 0) score -= 20; // missing expected species
    }

    // Diversity bonus
    const speciesCount = (grass > 0 ? 1 : 0) + (rabbits > 0 ? 1 : 0) + (wolves > 0 ? 1 : 0) + (eagles > 0 ? 1 : 0);
    score += speciesCount * 5;

    return Math.max(5, Math.min(100, Math.round(score)));
  }, []);

  // Initializing Level
  const initLevel = useCallback((lvl: ChallengeLevel) => {
    setCurrentLevel(lvl);
    setTimer(0);
    setPopulationLogs([]);
    setGameResult({ status: null });
    setIsPaused(false);
    setSelectedEntity(null);
    setSanctuaries([]);
    setWeather('sunny');
    setEventMessage(null);

    // Generate initial entities distributed across field
    const width = 700;
    const height = 450;
    const initialList: Entity[] = [];

    // Spawn Grass
    for (let i = 0; i < lvl.initialGrass; i++) {
      initialList.push({
        id: `init_grass_${i}`,
        type: 'grass',
        x: 30 + Math.random() * (width - 60),
        y: 30 + Math.random() * (height - 60),
        vx: 0,
        vy: 0,
        energy: 50 + Math.random() * 50,
        maxEnergy: 100,
        age: Math.random() * 20,
        maxAge: 120,
        size: 16,
        state: 'idle',
        birthTime: performance.now()
      });
    }

    // Spawn Rabbits
    for (let i = 0; i < lvl.initialRabbits; i++) {
      initialList.push({
        id: `init_rabbit_${i}`,
        type: 'rabbit',
        x: 40 + Math.random() * (width - 80),
        y: 40 + Math.random() * (height - 80),
        vx: (Math.random() - 0.5) * 35,
        vy: (Math.random() - 0.5) * 35,
        energy: 70 + Math.random() * 20,
        maxEnergy: 100,
        age: 2 + Math.random() * 5,
        maxAge: 80,
        size: 20,
        state: 'idle',
        birthTime: performance.now()
      });
    }

    // Spawn Wolves
    for (let i = 0; i < lvl.initialWolves; i++) {
      initialList.push({
        id: `init_wolf_${i}`,
        type: 'wolf',
        x: 50 + Math.random() * (width - 100),
        y: 50 + Math.random() * (height - 100),
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        energy: 85,
        maxEnergy: 120,
        age: 5,
        maxAge: 100,
        size: 26,
        state: 'idle',
        birthTime: performance.now()
      });
    }

    // Spawn Eagles
    for (let i = 0; i < lvl.initialEagles; i++) {
      initialList.push({
        id: `init_eagle_${i}`,
        type: 'eagle',
        x: 100 + Math.random() * (width - 200),
        y: 100 + Math.random() * (height - 200),
        vx: (Math.random() - 0.5) * 55,
        vy: (Math.random() - 0.5) * 55,
        energy: 95,
        maxEnergy: 150,
        age: 8,
        maxAge: 120,
        size: 28,
        state: 'idle',
        birthTime: performance.now()
      });
    }

    setEntities(initialList);
  }, []);

  // Initialize on load
  useEffect(() => {
    initLevel(LEVEL_PRESETS[0]);
  }, [initLevel]);

  // Main 1-second interval timer & rule checker
  useEffect(() => {
    if (isPaused || gameResult.status !== null) return;

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        const nextTimer = prevTimer + 1;
        const lvl = currentLevelRef.current;
        const mode = gameModeRef.current;
        const currentEntities = entitiesRef.current;

        // Weather Change Events in Challenge Mode
        if (lvl.weatherEventsEnabled) {
          if (nextTimer % 20 === 10) {
            setWeather('drought');
            setEventMessage('☀️ 극심한 가뭄 발령! 풀 성장이 저해됩니다.');
          } else if (nextTimer % 20 === 18) {
            setWeather('rainy');
            setEventMessage('🌧️ 반가운 단비 내림! 풀 성장이 가속화됩니다.');
          } else if (nextTimer % 20 === 0) {
            setWeather('sunny');
            setEventMessage(null);
          }
        }

        // Log population for Recharts graph
        const grass = currentEntities.filter((e) => e.type === 'grass').length;
        const rabbits = currentEntities.filter((e) => e.type === 'rabbit').length;
        const wolves = currentEntities.filter((e) => e.type === 'wolf').length;
        const eagles = currentEntities.filter((e) => e.type === 'eagle').length;
        const balance = calculateBalanceIndex(currentEntities);

        setPopulationLogs((prevLogs) => [
          ...prevLogs.slice(-59),
          {
            time: nextTimer,
            timeFormatted: `${nextTimer}초`,
            grass,
            rabbits,
            wolves,
            eagles,
            balanceIndex: balance
          }
        ]);

        // Check Victory / Defeat conditions in Challenge Mode
        if (mode === 'challenge') {
          // Defeat condition: Key species extinction
          if (rabbits === 0) {
            setGameResult({ status: 'defeat', reason: '😭 토끼가 모두 멸종했습니다!' });
            setIsPaused(true);
            return nextTimer;
          }
          if (grass === 0 && rabbits > 0) {
            setGameResult({ status: 'defeat', reason: '🌿 초목이 모두 사막화되었습니다!' });
            setIsPaused(true);
            return nextTimer;
          }
          if (lvl.initialWolves > 0 && wolves === 0) {
            setGameResult({ status: 'defeat', reason: '🐺 늑대 무리가 굶어 죽어 멸종했습니다!' });
            setIsPaused(true);
            return nextTimer;
          }

          // Victory Condition: Reached target time with healthy ecosystem
          if (nextTimer >= lvl.targetTime) {
            setGameResult({ status: 'victory' });
            setIsPaused(true);
            setCompletedLevelIds((prev) => (prev.includes(lvl.id) ? prev : [...prev, lvl.id]));
          }
        }

        return nextTimer;
      });
    }, 1000 / gameSpeed);

    return () => clearInterval(interval);
  }, [isPaused, gameSpeed, gameResult.status, calculateBalanceIndex]);

  // Handle Level Transition
  const handleNextLevel = () => {
    const nextLvlIndex = LEVEL_PRESETS.findIndex((l) => l.id === currentLevel.id) + 1;
    if (nextLvlIndex < LEVEL_PRESETS.length) {
      initLevel(LEVEL_PRESETS[nextLvlIndex]);
    } else {
      // Completed all levels! Switch to Sandbox mode
      setGameMode('sandbox');
      setGameResult({ status: null });
    }
  };

  const handleSelectLevel = (lvl: ChallengeLevel) => {
    initLevel(lvl);
  };

  // Entity Drawer Feed/Remove Handlers
  const handleFeedEntity = (id: string) => {
    soundManager.playPlantSeed();
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, energy: Math.min(e.maxEnergy, e.energy + 40) } : e))
    );
  };

  const handleRemoveEntity = (id: string) => {
    soundManager.playClick();
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntity(null);
  };

  // Middle School Quick Mass Add Handlers
  const handleQuickAddGrass = () => {
    const width = 700;
    const height = 450;
    const newGrassList: Entity[] = [];
    for (let i = 0; i < 10; i++) {
      newGrassList.push({
        id: `quick_grass_${Date.now()}_${i}`,
        type: 'grass',
        x: 30 + Math.random() * (width - 60),
        y: 30 + Math.random() * (height - 60),
        vx: 0,
        vy: 0,
        energy: 50,
        maxEnergy: 100,
        age: 0,
        maxAge: 120,
        size: 16,
        state: 'idle',
        birthTime: performance.now()
      });
    }
    setEntities((prev) => [...prev, ...newGrassList]);
    addFloatingText('🌿 풀 +10 살포 완료!', 350, 200, '#22c55e');
  };

  const handleQuickAddRabbits = () => {
    const width = 700;
    const height = 450;
    const newRabbits: Entity[] = [];
    for (let i = 0; i < 5; i++) {
      newRabbits.push({
        id: `quick_rabbit_${Date.now()}_${i}`,
        type: 'rabbit',
        x: 40 + Math.random() * (width - 80),
        y: 40 + Math.random() * (height - 80),
        vx: (Math.random() - 0.5) * 35,
        vy: (Math.random() - 0.5) * 35,
        energy: 70,
        maxEnergy: 100,
        age: 2,
        maxAge: 80,
        size: 20,
        state: 'idle',
        birthTime: performance.now()
      });
    }
    setEntities((prev) => [...prev, ...newRabbits]);
    addFloatingText('🐇 토끼 +5 방사 완료!', 350, 220, '#3b82f6');
  };

  // Manual Mode Operational Handlers
  const handleManualStep = () => {
    setTimer((prev) => prev + 1);
    const grass = entities.filter((e) => e.type === 'grass').length;
    const rabbits = entities.filter((e) => e.type === 'rabbit').length;
    const wolves = entities.filter((e) => e.type === 'wolf').length;
    const eagles = entities.filter((e) => e.type === 'eagle').length;
    const balance = calculateBalanceIndex();

    setPopulationLogs((prev) => [
      ...prev.slice(-59),
      {
        time: timer + 1,
        timeFormatted: `${timer + 1}초`,
        grass,
        rabbits,
        wolves,
        eagles,
        balanceIndex: balance
      }
    ]);
    addFloatingText('⏭️ 1초 진행 완료', 350, 180, '#6366f1');
  };

  const handleManualBreed = () => {
    const rabbits = entities.filter((e) => e.type === 'rabbit' && e.energy > 45);
    if (rabbits.length === 0) {
      addFloatingText('⚠️ 번식 가능 에너지를 가진 토끼가 부족합니다!', 350, 200, '#f43f5e');
      return;
    }

    const babies: Entity[] = [];
    rabbits.forEach((r, idx) => {
      if (idx % 2 === 0) {
        babies.push({
          id: `manual_baby_${Date.now()}_${idx}`,
          type: 'rabbit',
          x: r.x + (Math.random() - 0.5) * 30,
          y: r.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 35,
          vy: (Math.random() - 0.5) * 35,
          energy: 60,
          maxEnergy: 100,
          age: 0,
          maxAge: 80,
          size: 16,
          state: 'idle',
          birthTime: performance.now(),
          isBaby: true
        });
      }
    });

    soundManager.playRabbitHop();
    setEntities((prev) => [...prev, ...babies]);
    addFloatingText(`💕 수동 번식 성공! (아기 토끼 +${babies.length || 1})`, 350, 200, '#ec4899');
  };

  const handleManualAddWolf = () => {
    const width = 700;
    const height = 450;
    const wolves: Entity[] = [];
    for (let i = 0; i < 2; i++) {
      wolves.push({
        id: `manual_wolf_${Date.now()}_${i}`,
        type: 'wolf',
        x: 50 + Math.random() * (width - 100),
        y: 50 + Math.random() * (height - 100),
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        energy: 85,
        maxEnergy: 120,
        age: 5,
        maxAge: 100,
        size: 26,
        state: 'idle',
        birthTime: performance.now()
      });
    }
    soundManager.playWolfHowl();
    setEntities((prev) => [...prev, ...wolves]);
    addFloatingText('🐺 수동 늑대 +2 방사!', 350, 200, '#f59e0b');
  };

  const handleManualAddEagle = () => {
    const width = 700;
    const height = 450;
    const eagle: Entity = {
      id: `manual_eagle_${Date.now()}`,
      type: 'eagle',
      x: 100 + Math.random() * (width - 200),
      y: 100 + Math.random() * (height - 200),
      vx: (Math.random() - 0.5) * 55,
      vy: (Math.random() - 0.5) * 55,
      energy: 95,
      maxEnergy: 150,
      age: 8,
      maxAge: 120,
      size: 28,
      state: 'idle',
      birthTime: performance.now()
    };
    soundManager.playClick();
    setEntities((prev) => [...prev, eagle]);
    addFloatingText('🦅 수동 독수리 +1 등판!', 350, 200, '#8b5cf6');
  };

  const handleManualClearAll = () => {
    soundManager.playClick();
    setEntities([]);
    addFloatingText('🧹 수동 전체 개체 청소 완료', 350, 200, '#ef4444');
  };

  const handleManualRain = () => {
    soundManager.playRain();
    setWeather('rainy');
    setEntities((prev) =>
      prev.map((e) => (e.type === 'grass' ? { ...e, energy: Math.min(e.maxEnergy, e.energy + 40) } : e))
    );
    addFloatingText('🌧️ 수동 단비 가동! 풀 수분 충전', 350, 200, '#0284c7');
  };

  const handleManualFertilizer = () => {
    soundManager.playPlantSeed();
    const width = 700;
    const height = 450;
    const fertGrass: Entity[] = [];
    for (let i = 0; i < 6; i++) {
      fertGrass.push({
        id: `manual_fert_${Date.now()}_${i}`,
        type: 'grass',
        x: 40 + Math.random() * (width - 80),
        y: 40 + Math.random() * (height - 80),
        vx: 0,
        vy: 0,
        energy: 85,
        maxEnergy: 100,
        age: 0,
        maxAge: 120,
        size: 16,
        state: 'idle',
        birthTime: performance.now()
      });
    }
    setEntities((prev) => [...prev, ...fertGrass]);
    addFloatingText('🧪 수동 천연 비료 투입!', 350, 200, '#16a34a');
  };

  const handleManualDisaster = () => {
    soundManager.playClick();
    if (weather === 'drought') {
      setWeather('sunny');
      setEventMessage(null);
      addFloatingText('☀️ 가뭄 해제 -> 맑음 전환', 350, 200, '#eab308');
    } else {
      setWeather('drought');
      setEventMessage('☀️ 수동 가뭄 발령! 풀 성장이 저해됩니다.');
      addFloatingText('☀️ 수동 가뭄 재해 발령!', 350, 200, '#f97316');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-3 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header Bar */}
        <header className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                🌱 생태계 균형 맞추기 게임
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                중학생을 위한 쉽고 재밌는 생태계 먹이사슬 탐환 시뮬레이터
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setGuideModalOpen(true);
              }}
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black transition-all shadow-md hover:scale-102 ring-2 ring-emerald-200"
            >
              <BookOpen className="w-4 h-4 text-white animate-bounce" />
              <span>📖 게임 설명서</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setReflectionModalOpen(true);
              }}
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 hover:from-teal-800 hover:to-blue-800 text-white rounded-2xl text-xs font-black transition-all shadow-md hover:scale-102 ring-2 ring-cyan-200"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>📝 탐구 보고서 & PDF 저장</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setPrivacyModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-slate-200 rounded-2xl text-xs font-bold transition-all shadow-md hover:scale-102"
              title="개인정보 처리방침"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>개인정보 처리방침</span>
            </button>
          </div>
        </header>

        {/* Level / Mode Selector */}
        <LevelSelector
          gameMode={gameMode}
          setGameMode={setGameMode}
          currentLevelId={currentLevel.id}
          onSelectLevel={handleSelectLevel}
          completedLevelIds={completedLevelIds}
        />

        {/* Disaster / Event Banner */}
        <DisasterEventBanner weather={weather} eventMessage={eventMessage} />

        {/* Real-time Ecosystem Statistics */}
        <EcosystemStats
          entities={entities}
          timer={timer}
          targetTime={currentLevel.targetTime}
          balanceIndex={calculateBalanceIndex()}
        />

        {/* Main Canvas Field */}
        <main className="relative">
          <EcosystemCanvas
            entities={entities}
            setEntities={setEntities}
            weather={weather}
            activeTool={activeTool}
            isPaused={isPaused}
            gameSpeed={gameSpeed}
            sanctuaries={sanctuaries}
            setSanctuaries={setSanctuaries}
            floatingTexts={floatingTexts}
            addFloatingText={addFloatingText}
            onEntityClick={(e) => setSelectedEntity(e)}
            selectedEntityId={selectedEntity?.id}
          />
        </main>

        {/* Interactive Controls & Tools */}
        <ControlPanel
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          unlockedTools={currentLevel.unlockedTools}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          gameSpeed={gameSpeed}
          setGameSpeed={setGameSpeed}
          weather={weather}
          setWeather={setWeather}
          gameMode={gameMode}
          activityMode={activityMode}
          setActivityMode={setActivityMode}
          onResetGame={() => initLevel(currentLevel)}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onQuickAddGrass={handleQuickAddGrass}
          onQuickAddRabbits={handleQuickAddRabbits}
          onManualStep={handleManualStep}
          onManualBreed={handleManualBreed}
          onManualAddWolf={handleManualAddWolf}
          onManualAddEagle={handleManualAddEagle}
          onManualClearAll={handleManualClearAll}
          onManualRain={handleManualRain}
          onManualFertilizer={handleManualFertilizer}
          onManualDisaster={handleManualDisaster}
        />

        {/* Live Population Graph Chart */}
        <PopulationChart data={populationLogs} />

        {/* Footer with Educational Purpose & Privacy Policy Link */}
        <footer className="w-full max-w-5xl mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2 pb-6">
          <p className="leading-relaxed">
            🌱 <strong>제작 목적:</strong> 중학생 들이 생태계 균형을 직접 만들어 보고 게임을 통하여 자신의 생각을 정리하며 생태계 보전에 대한 학습을 할 수 있도록 만들었습니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium text-slate-600">
            <span>개발자: Gabriel Math (Gabriel Byeongje Jeon)</span>
            <span>|</span>
            <span>문의: gabriel@gabrielmath.kr</span>
            <span>|</span>
            <button
              onClick={() => {
                soundManager.playClick();
                setPrivacyModalOpen(true);
              }}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-emerald-600" /> 개인정보 처리방침
            </button>
          </div>
        </footer>
      </div>

      {/* Entity Inspector Drawer */}
      <EntityDetailDrawer
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onFeedEntity={handleFeedEntity}
        onRemoveEntity={handleRemoveEntity}
      />

      {/* Educational Guide Modal */}
      <EcosystemGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />

      {/* Level Completion / Defeat Modal */}
      <LevelResultModal
        status={gameResult.status}
        level={currentLevel}
        reason={gameResult.reason}
        onNextLevel={handleNextLevel}
        onRetry={() => initLevel(currentLevel)}
        onClose={() => setGameResult({ status: null })}
        finalBalanceIndex={calculateBalanceIndex()}
        onOpenReflection={() => {
          setGameResult({ status: null });
          setReflectionModalOpen(true);
        }}
      />

      {/* Student Reflection & Action Plan Report Modal */}
      <ReflectionReportModal
        isOpen={reflectionModalOpen}
        onClose={() => setReflectionModalOpen(false)}
        levelTitle={currentLevel.title}
        balanceIndex={calculateBalanceIndex()}
        grassCount={entities.filter((e) => e.type === 'grass').length}
        rabbitCount={entities.filter((e) => e.type === 'rabbit').length}
        wolfCount={entities.filter((e) => e.type === 'wolf').length}
        eagleCount={entities.filter((e) => e.type === 'eagle').length}
        elapsedTime={timer}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}
