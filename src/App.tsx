import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Entity, 
  WeatherCondition, 
  ToolType, 
  GameMode, 
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
import { soundManager } from './utils/sound';
import { Leaf, BookOpen, ShieldCheck, HelpCircle, Volume2, VolumeX, Sparkles, FileText } from 'lucide-react';

export default function App() {
  // Game Setup State
  const [gameMode, setGameMode] = useState<GameMode>('challenge');
  const [currentLevel, setCurrentLevel] = useState<ChallengeLevel>(LEVEL_PRESETS[0]);
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>([]);

  // Simulation Entities & State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sanctuaries, setSanctuaries] = useState<SanctuaryZone[]>([]);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [eventMessage, setEventMessage] = useState<string | null>(null);

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
  const [gameResult, setGameResult] = useState<{ status: 'victory' | 'defeat' | null; reason?: string }>({ status: null });

  // Floating text helper
  const addFloatingText = useCallback((text: string, x: number, y: number, color = '#22c55e') => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color, createdAt: Date.now() }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
    }, 1200);
  }, []);

  // Compute Ecosystem Health Index (0 - 100%)
  const calculateBalanceIndex = useCallback(() => {
    const grass = entities.filter((e) => e.type === 'grass').length;
    const rabbits = entities.filter((e) => e.type === 'rabbit').length;
    const wolves = entities.filter((e) => e.type === 'wolf').length;
    const eagles = entities.filter((e) => e.type === 'eagle').length;

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
      if (currentLevel.initialWolves > 0) score -= 20; // missing expected species
    }

    // Diversity bonus
    const speciesCount = (grass > 0 ? 1 : 0) + (rabbits > 0 ? 1 : 0) + (wolves > 0 ? 1 : 0) + (eagles > 0 ? 1 : 0);
    score += speciesCount * 5;

    return Math.max(5, Math.min(100, Math.round(score)));
  }, [entities, currentLevel]);

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

        // Weather Change Events in Challenge Mode
        if (currentLevel.weatherEventsEnabled) {
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
        const grass = entities.filter((e) => e.type === 'grass').length;
        const rabbits = entities.filter((e) => e.type === 'rabbit').length;
        const wolves = entities.filter((e) => e.type === 'wolf').length;
        const eagles = entities.filter((e) => e.type === 'eagle').length;
        const balance = calculateBalanceIndex();

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
        if (gameMode === 'challenge') {
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
          if (currentLevel.initialWolves > 0 && wolves === 0) {
            setGameResult({ status: 'defeat', reason: '🐺 늑대 무리가 굶어 죽어 멸종했습니다!' });
            setIsPaused(true);
            return nextTimer;
          }

          // Victory Condition: Reached target time with healthy ecosystem
          if (nextTimer >= currentLevel.targetTime) {
            setGameResult({ status: 'victory' });
            setIsPaused(true);
            if (!completedLevelIds.includes(currentLevel.id)) {
              setCompletedLevelIds((prev) => [...prev, currentLevel.id]);
            }
          }
        }

        return nextTimer;
      });
    }, 1000 / gameSpeed);

    return () => clearInterval(interval);
  }, [isPaused, gameSpeed, entities, currentLevel, gameMode, gameResult.status, completedLevelIds, calculateBalanceIndex]);

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
          onResetGame={() => initLevel(currentLevel)}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onQuickAddGrass={handleQuickAddGrass}
          onQuickAddRabbits={handleQuickAddRabbits}
        />

        {/* Live Population Graph Chart */}
        <PopulationChart data={populationLogs} />
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
    </div>
  );
}
