export type EntityType = 'grass' | 'rabbit' | 'wolf' | 'eagle' | 'carcass' | 'rock' | 'pond';

export type WeatherCondition = 'sunny' | 'rainy' | 'drought' | 'autumn';

export type ToolType = 'select' | 'grass' | 'rabbit' | 'wolf' | 'eagle' | 'rain' | 'fertilizer' | 'sanctuary' | 'remove';

export type GameMode = 'challenge' | 'sandbox';

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  maxEnergy: number;
  age: number;
  maxAge: number;
  size: number;
  state: 'idle' | 'hunting' | 'fleeing' | 'mating' | 'grazing';
  targetX?: number;
  targetY?: number;
  birthTime: number;
  gender?: 'M' | 'F';
  isBaby?: boolean;
}

export interface SanctuaryZone {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

export interface ChallengeLevel {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  targetTime: number; // in seconds
  initialGrass: number;
  initialRabbits: number;
  initialWolves: number;
  initialEagles: number;
  weatherEventsEnabled: boolean;
  minGrassTarget: number;
  minRabbitTarget: number;
  minWolfTarget: number;
  maxRabbitTarget?: number;
  maxWolfTarget?: number;
  unlockedTools: ToolType[];
  tips: string;
}

export interface PopulationLog {
  time: number;
  timeFormatted: string;
  grass: number;
  rabbits: number;
  wolves: number;
  eagles: number;
  balanceIndex: number;
}

export interface EcosystemParams {
  grassGrowthRate: number; // 0.1 to 2.0
  rabbitReproductionRate: number; // 0.1 to 2.0
  rabbitEnergyCost: number; // 0.5 to 2.0
  wolfReproductionRate: number; // 0.1 to 2.0
  wolfEnergyCost: number; // 0.5 to 2.0
  carcassDecomposeRate: number;
  weatherChangeInterval: number; // seconds
}
