export type DiceOutcome = 'null' | 'choice' | 'radiant';

export interface PlayerStats {
  strength: number;
  mind: number;
  gravity: number;
  voidResistance: number;
}

export interface Player {
  id: string;
  name: string;
  className: string;
  hp: number;
  maxHp: number;
  entropy: number; // 0 to 100
  inventory: string[];
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

export interface Room {
  id: string;
  floor: number;
  name: string;
  asciiArt?: string;
  description: string;
  exits: string[];
  hazards?: string[];
  enemy?: {
    name: string;
    hp: number;
    maxHp: number;
    attack: string;
  };
}

export type AIProvider = 'builtin' | 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
}

export type TerminalTheme = 'obsidian' | 'matrix' | 'amber' | 'cyber';
