// Game Types and Interfaces for Kabaddi Game

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  position: Position;
  team: 'raiders' | 'defenders';
  isActive: boolean;
  isTagged: boolean;
  speed: number;
  size: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  currentPhase: 'waiting' | 'raiding' | 'returning' | 'scored' | 'tackled';
  raidTimer: number;
  gameTimer: number;
  currentRaider: string | null;
}

export interface Score {
  raiders: number;
  defenders: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  pitchWidth: number;
  pitchHeight: number;
  raidDuration: number;
  gameDuration: number;
  maxScore: number;
  playerSpeed: number;
  defenderSpeed: number;
}

export interface GameStats {
  totalRaids: number;
  successfulRaids: number;
  defendersTagged: number;
  timeRemaining: number;
  raidersCaught: number;
}

export interface AIDefender extends Player {
  targetPosition: Position;
  reactionTime: number;
  aggressiveness: number;
  formationPosition: Position;
}

export interface GameField {
  centerLine: number;
  boundaryLines: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  raiderZone: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  defenderZone: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface GameEvent {
  type: 'raid_start' | 'line_crossed' | 'defender_tagged' | 'raider_safe' | 'raider_caught' | 'raid_timeout' | 'game_over';
  timestamp: number;
  playerId?: string;
  points?: number;
  message?: string;
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  defenderSpeed: number;
  defenderReactionTime: number;
  defenderAggressiveness: number;
  aiUpdateFrequency: number;
}