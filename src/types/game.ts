export type DiceOutcome = 'null' | 'choice' | 'radiant';

export interface PlayerStats {
  strength: number;
  mind: number;
  gravity: number;
  voidResistance: number;
}

export interface ItemDef {
  id: string;
  name: string;
  type: 'weapon' | 'consumable' | 'relic' | 'armor';
  description: string;
  effect: string;
  hpRestore?: number;
  entropyReduce?: number;
  gravityBoost?: number;
}

export interface Player {
  id: string;
  name: string;
  className: string;
  hp: number;
  maxHp: number;
  entropy: number; // 0 to 100
  inventory: string[];
  equippedWeapon?: string;
  stats: PlayerStats;
  level: number;
  score: number;
}

export interface PartyMember {
  id: string;
  name: string;
  role: string;
  hp: number;
  maxHp: number;
  isReady: boolean;
  ping: number;
  isPeer?: boolean;
}

export interface ChoiceOption {
  id: string;
  label: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'system' | 'narrative' | 'dice' | 'player' | 'party' | 'choice' | 'loot' | 'combat';
  speaker?: string;
  content: string;
  outcome?: DiceOutcome;
  choices?: ChoiceOption[];
  radiantBonus?: string;
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: string;
  damage: number;
  weakness?: string;
  special?: string;
  drop?: string;
  phase?: number;
}

export interface Room {
  id: string;
  floor: number;
  name: string;
  asciiArt?: string;
  description: string;
  exits: string[];
  hazards?: string[];
  items?: string[];
  enemy?: Enemy;
}

export type AIProvider = 'builtin' | 'webllm' | 'gemini' | 'openai' | 'anthropic' | 'groq' | 'deepseek' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
  temperature?: number;
}

export type TerminalTheme = 'obsidian' | 'matrix' | 'amber' | 'cyber' | 'sol';
