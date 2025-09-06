import { 
  GameState, 
  Player, 
  AIDefender, 
  Score, 
  GameField, 
  GameConfig, 
  Position, 
  Controls,
  GameEvent,
  DifficultyConfig 
} from './gameTypes';
import { 
  createGameField, 
  checkGameOver,
  calculateScore 
} from './kabaddiRules';
import { 
  createAIDefenders, 
  updateAllDefenders, 
  checkRaiderDefenderCollisions 
} from './aiLogic';

export class KabaddiGameEngine {
  private gameState: GameState;
  private score: Score;
  private raider: Player;
  private defenders: AIDefender[];
  private gameField: GameField;
  private config: GameConfig;
  private difficultyConfig: DifficultyConfig;
  private gameEvents: GameEvent[];
  private controls: Controls;
  private lastUpdateTime: number;
  private raiderTrail: Position[];
  private hasCrossedLine: boolean;
  private isReturning: boolean;

  constructor(config: GameConfig, difficultyConfig: DifficultyConfig) {
    this.config = config;
    this.difficultyConfig = difficultyConfig;
    this.gameField = createGameField(config);
    this.gameEvents = [];
    this.controls = { up: false, down: false, left: false, right: false };
    this.lastUpdateTime = 0;
    this.raiderTrail = [];
    this.hasCrossedLine = false;
    this.isReturning = false;

    // Initialize game state
    this.gameState = {
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      currentPhase: 'waiting',
      raidTimer: config.raidDuration,
      gameTimer: config.gameDuration,
      currentRaider: 'player_raider'
    };

    this.score = { raiders: 0, defenders: 0 };

    // Create raider
    this.raider = {
      id: 'player_raider',
      position: {
        x: config.canvasWidth / 2,
        y: this.gameField.raiderZone.y + this.gameField.raiderZone.height - 30
      },
      team: 'raiders',
      isActive: true,
      isTagged: false,
      speed: config.playerSpeed,
      size: 20
    };

    // Create AI defenders
    this.defenders = createAIDefenders(this.gameField, difficultyConfig);
  }

  // Start the game
  public startGame(): void {
    this.gameState.isPlaying = true;
    this.gameState.currentPhase = 'raiding';
    this.addGameEvent('raid_start', this.raider.id);
  }

  // Pause/unpause the game
  public togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  // Update game controls
  public updateControls(controls: Controls): void {
    this.controls = { ...controls };
  }

  // Main game update loop
  public update(currentTime: number): void {
    if (!this.gameState.isPlaying || this.gameState.isPaused || this.gameState.isGameOver) {
      return;
    }

    const deltaTime = currentTime - this.lastUpdateTime || 0;
    this.lastUpdateTime = currentTime;

    // Update timers
    this.updateTimers(deltaTime);

    // Update raider position
    this.updateRaiderPosition(deltaTime);

    // Update AI defenders
    this.defenders = updateAllDefenders(
      this.defenders, 
      this.raider, 
      this.gameField, 
      this.difficultyConfig, 
      deltaTime
    );

    // Check game logic
    this.checkRaidLogic();

    // Check collisions
    this.checkCollisions();

    // Check game over conditions
    this.checkGameOverConditions();

    // Update raider trail
    this.updateRaiderTrail();
  }

  // Update game timers
  private updateTimers(deltaTime: number): void {
    // Update raid timer
    this.gameState.raidTimer -= deltaTime / 1000;
    if (this.gameState.raidTimer <= 0) {
      this.handleRaidTimeout();
    }

    // Update game timer
    this.gameState.gameTimer -= deltaTime / 1000;
    if (this.gameState.gameTimer <= 0) {
      this.endGame();
    }
  }

  // Update raider position based on controls
  private updateRaiderPosition(deltaTime: number): void {
    if (!this.raider.isActive) return;

    let dx = 0;
    let dy = 0;

    if (this.controls.up) dy -= 1;
    if (this.controls.down) dy += 1;
    if (this.controls.left) dx -= 1;
    if (this.controls.right) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    // Apply movement
    const speed = this.raider.speed * deltaTime / 16.67; // Normalize to 60fps
    const newX = this.raider.position.x + dx * speed;
    const newY = this.raider.position.y + dy * speed;

    // Check boundaries
    if (newX >= this.gameField.boundaryLines.left + this.raider.size && 
        newX <= this.gameField.boundaryLines.right - this.raider.size) {
      this.raider.position.x = newX;
    }

    if (newY >= this.gameField.boundaryLines.top + this.raider.size && 
        newY <= this.gameField.boundaryLines.bottom - this.raider.size) {
      this.raider.position.y = newY;
    }
  }

  // Check raid logic
  private checkRaidLogic(): void {
    // Check if raider crossed the center line
    if (!this.hasCrossedLine && this.raider.position.y < this.gameField.centerLine) {
      this.hasCrossedLine = true;
      this.gameState.currentPhase = 'raiding';
      this.addGameEvent('line_crossed', this.raider.id);
    }

    // Check if raider is returning to safe zone
    if (this.hasCrossedLine && this.raider.position.y > this.gameField.centerLine) {
      if (!this.isReturning) {
        this.isReturning = true;
        this.gameState.currentPhase = 'returning';
      }
    }

    // Check if raider reached safe zone
    if (this.isReturning && 
        this.raider.position.y > this.gameField.raiderZone.y + this.gameField.raiderZone.height - 50) {
      this.handleSuccessfulRaid();
    }
  }

  // Check collisions between raider and defenders
  private checkCollisions(): void {
    const collision = checkRaiderDefenderCollisions(this.raider, this.defenders);
    
    if (collision.collision && collision.defenderId) {
      // Check if raider is in defender zone (can be tackled)
      if (this.raider.position.y < this.gameField.centerLine) {
        this.handleRaiderCaught(collision.defenderId);
      } else {
        // Raider tagged a defender in raider zone
        this.handleDefenderTagged(collision.defenderId);
      }
    }
  }

  // Handle successful raid
  private handleSuccessfulRaid(): void {
    if (this.hasCrossedLine && !this.raider.isTagged) {
      this.gameState.currentPhase = 'scored';
      this.addGameEvent('raider_safe', this.raider.id, 1);
      this.updateScore();
      this.resetRaid();
    }
  }

  // Handle raider being caught
  private handleRaiderCaught(defenderId: string): void {
    this.raider.isTagged = true;
    this.gameState.currentPhase = 'tackled';
    this.addGameEvent('raider_caught', defenderId, 1);
    this.updateScore();
    this.resetRaid();
  }

  // Handle defender being tagged
  private handleDefenderTagged(defenderId: string): void {
    const defender = this.defenders.find(d => d.id === defenderId);
    if (defender && !defender.isTagged) {
      defender.isTagged = true;
      defender.isActive = false;
      this.addGameEvent('defender_tagged', defenderId, 1);
    }
  }

  // Handle raid timeout
  private handleRaidTimeout(): void {
    this.gameState.currentPhase = 'tackled';
    this.addGameEvent('raid_timeout', this.raider.id);
    this.updateScore();
    this.resetRaid();
  }

  // Reset raid for next round
  private resetRaid(): void {
    setTimeout(() => {
      // Reset raider position
      this.raider.position = {
        x: this.config.canvasWidth / 2,
        y: this.gameField.raiderZone.y + this.gameField.raiderZone.height - 30
      };
      this.raider.isTagged = false;
      this.raider.isActive = true;

      // Reset raid state
      this.hasCrossedLine = false;
      this.isReturning = false;
      this.gameState.raidTimer = this.config.raidDuration;
      this.gameState.currentPhase = 'waiting';
      this.raiderTrail = [];

      // Reactivate tagged defenders (simplified rule)
      this.defenders.forEach(defender => {
        if (defender.isTagged) {
          defender.isTagged = false;
          defender.isActive = true;
        }
      });

      // Start next raid
      setTimeout(() => {
        if (!this.gameState.isGameOver) {
          this.gameState.currentPhase = 'raiding';
          this.addGameEvent('raid_start', this.raider.id);
        }
      }, 2000);
    }, 2000);
  }

  // Update score based on recent events
  private updateScore(): void {
    const recentEvents = this.gameEvents.slice(-5); // Get recent events
    this.score = calculateScore(recentEvents, this.score);
  }

  // Check game over conditions
  private checkGameOverConditions(): void {
    if (checkGameOver(this.score, this.gameState.gameTimer, this.config)) {
      this.endGame();
    }
  }

  // End the game
  private endGame(): void {
    this.gameState.isGameOver = true;
    this.gameState.isPlaying = false;
    this.gameState.currentPhase = 'waiting';
    this.addGameEvent('game_over');
  }

  // Add game event
  private addGameEvent(type: GameEvent['type'], playerId?: string, points?: number): void {
    this.gameEvents.push({
      type,
      timestamp: Date.now(),
      playerId,
      points,
      message: this.getEventMessage(type, playerId)
    });
  }

  // Get event message
  private getEventMessage(type: GameEvent['type']): string {
    switch (type) {
      case 'raid_start': return 'New raid started!';
      case 'line_crossed': return 'Raider crossed the line!';
      case 'defender_tagged': return 'Defender tagged!';
      case 'raider_safe': return 'Successful raid!';
      case 'raider_caught': return 'Raider caught!';
      case 'raid_timeout': return 'Raid timed out!';
      case 'game_over': return 'Game Over!';
      default: return '';
    }
  }

  // Update raider trail
  private updateRaiderTrail(): void {
    this.raiderTrail.push({ ...this.raider.position });
    if (this.raiderTrail.length > 20) {
      this.raiderTrail.shift();
    }
  }

  // Reset game
  public resetGame(): void {
    this.gameState = {
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      currentPhase: 'waiting',
      raidTimer: this.config.raidDuration,
      gameTimer: this.config.gameDuration,
      currentRaider: 'player_raider'
    };

    this.score = { raiders: 0, defenders: 0 };
    this.gameEvents = [];
    this.raiderTrail = [];
    this.hasCrossedLine = false;
    this.isReturning = false;

    // Reset raider
    this.raider.position = {
      x: this.config.canvasWidth / 2,
      y: this.gameField.raiderZone.y + this.gameField.raiderZone.height - 30
    };
    this.raider.isTagged = false;
    this.raider.isActive = true;

    // Reset defenders
    this.defenders = createAIDefenders(this.gameField, this.difficultyConfig);
  }

  // Getters for external access
  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public getScore(): Score {
    return { ...this.score };
  }

  public getRaider(): Player {
    return { ...this.raider };
  }

  public getDefenders(): AIDefender[] {
    return this.defenders.map(d => ({ ...d }));
  }

  public getGameField(): GameField {
    return { ...this.gameField };
  }

  public getRaiderTrail(): Position[] {
    return [...this.raiderTrail];
  }

  public getGameEvents(): GameEvent[] {
    return [...this.gameEvents];
  }

  public hasCrossedCenterLine(): boolean {
    return this.hasCrossedLine;
  }

  public isRaiderReturning(): boolean {
    return this.isReturning;
  }
}