import { GameConfig, GameStats, Score, GameEvent, DifficultyConfig, GameDifficulty } from './gameTypes';

// Default game configuration
export const DEFAULT_GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  pitchWidth: 760,
  pitchHeight: 560,
  raidDuration: 30, // 30 seconds per raid
  gameDuration: 600, // 10 minutes
  maxScore: 30,
  playerSpeed: 3,
  defenderSpeed: 2.5,
};

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<GameDifficulty, DifficultyConfig> = {
  easy: {
    defenderSpeed: 2,
    defenderReactionTime: 800,
    defenderAggressiveness: 0.3,
    aiUpdateFrequency: 100,
  },
  medium: {
    defenderSpeed: 2.5,
    defenderReactionTime: 600,
    defenderAggressiveness: 0.6,
    aiUpdateFrequency: 60,
  },
  hard: {
    defenderSpeed: 3,
    defenderReactionTime: 300,
    defenderAggressiveness: 0.9,
    aiUpdateFrequency: 30,
  },
};

// Scoring rules
export const SCORING_RULES = {
  SUCCESSFUL_RAID: 1, // Points for crossing line and returning safely
  DEFENDER_TAGGED: 1, // Additional point per defender tagged
  BONUS_RAID: 2, // Bonus for tagging all defenders
  DEFENDER_TACKLE: 1, // Points for defenders when they tackle raider
  ALL_OUT_BONUS: 2, // Bonus when all defenders are eliminated
};

// Game field dimensions and zones
export const createGameField = (config: GameConfig) => {
  const centerY = config.canvasHeight / 2;
  const fieldMargin = 20;
  
  return {
    centerLine: centerY,
    boundaryLines: {
      top: fieldMargin,
      bottom: config.canvasHeight - fieldMargin,
      left: fieldMargin,
      right: config.canvasWidth - fieldMargin,
    },
    raiderZone: {
      x: fieldMargin,
      y: fieldMargin,
      width: config.pitchWidth,
      height: (config.pitchHeight / 2) - 10,
    },
    defenderZone: {
      x: fieldMargin,
      y: centerY + 10,
      width: config.pitchWidth,
      height: (config.pitchHeight / 2) - 10,
    },
  };
};

// Calculate score based on game events
export const calculateScore = (events: GameEvent[], currentScore: Score): Score => {
  const newScore = { ...currentScore };
  
  events.forEach(event => {
    switch (event.type) {
      case 'raider_safe':
        newScore.raiders += SCORING_RULES.SUCCESSFUL_RAID;
        break;
      case 'defender_tagged':
        newScore.raiders += SCORING_RULES.DEFENDER_TAGGED;
        break;
      case 'raider_caught':
        newScore.defenders += SCORING_RULES.DEFENDER_TACKLE;
        break;
    }
  });
  
  return newScore;
};

// Check if raid was successful
export const isRaidSuccessful = (
  raiderCrossedLine: boolean,
  raiderReturned: boolean,
  raiderCaught: boolean
): boolean => {
  return raiderCrossedLine && raiderReturned && !raiderCaught;
};

// Check game over conditions
export const checkGameOver = (
  score: Score,
  gameTimer: number,
  config: GameConfig
): boolean => {
  return (
    gameTimer <= 0 ||
    score.raiders >= config.maxScore ||
    score.defenders >= config.maxScore
  );
};

// Get winner
export const getWinner = (score: Score): 'raiders' | 'defenders' | 'tie' => {
  if (score.raiders > score.defenders) return 'raiders';
  if (score.defenders > score.raiders) return 'defenders';
  return 'tie';
};

// Format time display
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate game statistics
export const calculateStats = (events: GameEvent[]): GameStats => {
  const stats: GameStats = {
    totalRaids: 0,
    successfulRaids: 0,
    defendersTagged: 0,
    timeRemaining: 0,
    raidersCaught: 0,
  };
  
  events.forEach(event => {
    switch (event.type) {
      case 'raid_start':
        stats.totalRaids++;
        break;
      case 'raider_safe':
        stats.successfulRaids++;
        break;
      case 'defender_tagged':
        stats.defendersTagged++;
        break;
      case 'raider_caught':
        stats.raidersCaught++;
        break;
    }
  });
  
  return stats;
};

// Validate player position within field boundaries
export const isPositionValid = (
  x: number,
  y: number,
  fieldBoundaries: { top: number; bottom: number; left: number; right: number }
): boolean => {
  return (
    x >= fieldBoundaries.left &&
    x <= fieldBoundaries.right &&
    y >= fieldBoundaries.top &&
    y <= fieldBoundaries.bottom
  );
};