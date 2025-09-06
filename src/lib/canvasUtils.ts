import { Player, GameField, Position } from './gameTypes';

// Clear canvas
export const clearCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.clearRect(0, 0, width, height);
};

// Draw kabaddi field
export const drawKabaddiField = (ctx: CanvasRenderingContext2D, gameField: GameField, canvasWidth: number, canvasHeight: number) => {
  // Field background
  ctx.fillStyle = '#2d5016'; // Dark green
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Field boundaries
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(
    gameField.boundaryLines.left,
    gameField.boundaryLines.top,
    gameField.boundaryLines.right - gameField.boundaryLines.left,
    gameField.boundaryLines.bottom - gameField.boundaryLines.top
  );
  
  // Center line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gameField.boundaryLines.left, gameField.centerLine);
  ctx.lineTo(gameField.boundaryLines.right, gameField.centerLine);
  ctx.stroke();
  
  // Center circle
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, gameField.centerLine, 50, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Raider zone marking
  ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
  ctx.fillRect(
    gameField.raiderZone.x,
    gameField.raiderZone.y,
    gameField.raiderZone.width,
    gameField.raiderZone.height
  );
  
  // Defender zone marking
  ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
  ctx.fillRect(
    gameField.defenderZone.x,
    gameField.defenderZone.y,
    gameField.defenderZone.width,
    gameField.defenderZone.height
  );
  
  // Zone labels
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('RAIDER ZONE', canvasWidth / 2, gameField.raiderZone.y + gameField.raiderZone.height / 2);
  ctx.fillText('DEFENDER ZONE', canvasWidth / 2, gameField.defenderZone.y + gameField.defenderZone.height / 2);
};

// Draw player
export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: Player,
  color: string,
  isHighlighted = false
) => {
  const { x, y } = player.position;
  const radius = player.size;
  
  // Player shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 4, radius * 0.8, radius * 0.4, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Player body
  if (isHighlighted) {
    // Highlight ring
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  // Player circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Player border
  ctx.strokeStyle = isHighlighted ? '#ffff00' : '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Player number/indicator
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(player.team === 'raiders' ? 'R' : 'D', x, y + 4);
  
  // Tagged indicator
  if (player.isTagged) {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x - 10, y - 10, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
};

// Draw movement trail
export const drawMovementTrail = (
  ctx: CanvasRenderingContext2D,
  positions: Position[],
  color: string
) => {
  if (positions.length < 2) return;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  
  ctx.beginPath();
  ctx.moveTo(positions[0].x, positions[0].y);
  
  for (let i = 1; i < positions.length; i++) {
    ctx.lineTo(positions[i].x, positions[i].y);
  }
  
  ctx.stroke();
  ctx.globalAlpha = 1;
};

// Draw game UI elements on canvas
export const drawGameInfo = (
  ctx: CanvasRenderingContext2D,
  score: { raiders: number; defenders: number },
  raidTimer: number,
  gameTimer: number,
  currentPhase: string
) => {
  // Semi-transparent background for UI
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 800, 60);
  
  // Score display
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Raiders: ${score.raiders}`, 20, 25);
  ctx.fillText(`Defenders: ${score.defenders}`, 20, 45);
  
  // Timer display
  ctx.textAlign = 'center';
  ctx.fillStyle = raidTimer <= 10 ? '#ff0000' : '#ffffff';
  ctx.fillText(`Raid: ${raidTimer}s`, 400, 25);
  
  ctx.fillStyle = '#ffffff';
  const gameMinutes = Math.floor(gameTimer / 60);
  const gameSeconds = gameTimer % 60;
  ctx.fillText(
    `Game: ${gameMinutes}:${gameSeconds.toString().padStart(2, '0')}`,
    400,
    45
  );
  
  // Phase indicator
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(currentPhase.toUpperCase(), 780, 35);
};

// Draw raid path visualization
export const drawRaidPath = (
  ctx: CanvasRenderingContext2D,
  raiderPosition: Position,
  centerLine: number,
  hasCrossedLine: boolean
) => {
  if (hasCrossedLine) {
    // Draw line from raider to center line
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(raiderPosition.x, raiderPosition.y);
    ctx.lineTo(raiderPosition.x, centerLine);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

// Draw collision detection visualization (for debugging)
export const drawCollisionRadius = (
  ctx: CanvasRenderingContext2D,
  position: Position,
  radius: number,
  color: string
) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
};

// Animate player movement
export const animatePlayerMovement = (
  fromPosition: Position,
  toPosition: Position,
  progress: number
): Position => {
  return {
    x: fromPosition.x + (toPosition.x - fromPosition.x) * progress,
    y: fromPosition.y + (toPosition.y - fromPosition.y) * progress,
  };
};

// Draw victory/defeat animation
export const drawGameOverOverlay = (
  ctx: CanvasRenderingContext2D,
  winner: string,
  canvasWidth: number,
  canvasHeight: number
) => {
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Winner text
  ctx.fillStyle = winner === 'raiders' ? '#ff6b6b' : '#4ecdc4';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${winner.toUpperCase()} WIN!`,
    canvasWidth / 2,
    canvasHeight / 2 - 50
  );
  
  // Additional game over text
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.fillText('Press R to restart', canvasWidth / 2, canvasHeight / 2 + 20);
};

// Draw loading indicator
export const drawLoadingIndicator = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  progress: number
) => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // Background circle
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Progress arc
  ctx.strokeStyle = '#4ecdc4';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, -Math.PI / 2, -Math.PI / 2 + (progress * 2 * Math.PI));
  ctx.stroke();
};