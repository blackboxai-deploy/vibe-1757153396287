import { AIDefender, Player, Position, GameField, DifficultyConfig } from './gameTypes';

// Calculate distance between two positions
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Normalize vector
export const normalizeVector = (dx: number, dy: number): { x: number; y: number } => {
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return { x: 0, y: 0 };
  return { x: dx / length, y: dy / length };
};

// Create formation positions for defenders
export const createDefenderFormation = (
  defenderZone: { x: number; y: number; width: number; height: number }
): Position[] => {
  const zoneWidth = defenderZone.width;
  const zoneHeight = defenderZone.height;
  
  // Create a 3-2-2 formation (7 defenders)
  const formations = [
    // Front line (3 defenders)
    { x: defenderZone.x + zoneWidth * 0.2, y: defenderZone.y + zoneHeight * 0.2 },
    { x: defenderZone.x + zoneWidth * 0.5, y: defenderZone.y + zoneHeight * 0.2 },
    { x: defenderZone.x + zoneWidth * 0.8, y: defenderZone.y + zoneHeight * 0.2 },
    
    // Mid line (2 defenders)
    { x: defenderZone.x + zoneWidth * 0.3, y: defenderZone.y + zoneHeight * 0.5 },
    { x: defenderZone.x + zoneWidth * 0.7, y: defenderZone.y + zoneHeight * 0.5 },
    
    // Back line (2 defenders)
    { x: defenderZone.x + zoneWidth * 0.4, y: defenderZone.y + zoneHeight * 0.8 },
    { x: defenderZone.x + zoneWidth * 0.6, y: defenderZone.y + zoneHeight * 0.8 },
  ];
  
  return formations;
};

// Update AI defender behavior
export const updateDefenderAI = (
  defender: AIDefender,
  raider: Player,
  gameField: GameField,
  difficultyConfig: DifficultyConfig,
  deltaTime: number
): AIDefender => {
  const updatedDefender = { ...defender };
  const raiderDistance = calculateDistance(defender.position, raider.position);
  
  // Determine target position based on raider position and game state
  let targetPosition = { ...defender.formationPosition };
  
  // If raider is close, move towards raider
  if (raiderDistance < 100 && raider.isActive) {
    const aggressiveFactor = difficultyConfig.defenderAggressiveness;
    
    // Calculate interception point
    const interceptX = raider.position.x + (Math.random() - 0.5) * 50 * (1 - aggressiveFactor);
    const interceptY = raider.position.y + (Math.random() - 0.5) * 30 * (1 - aggressiveFactor);
    
    targetPosition = {
      x: Math.max(gameField.defenderZone.x, Math.min(gameField.defenderZone.x + gameField.defenderZone.width, interceptX)),
      y: Math.max(gameField.defenderZone.y, Math.min(gameField.defenderZone.y + gameField.defenderZone.height, interceptY))
    };
  }
  // If raider crossed the line, all defenders should pursue
  else if (raider.position.y < gameField.centerLine && raider.isActive) {
    targetPosition = {
      x: raider.position.x + (Math.random() - 0.5) * 40,
      y: raider.position.y + (Math.random() - 0.5) * 40
    };
  }
  // Otherwise, maintain formation
  else {
    targetPosition = defender.formationPosition;
  }
  
  updatedDefender.targetPosition = targetPosition;
  
  // Move towards target position
  const dx = targetPosition.x - defender.position.x;
  const dy = targetPosition.y - defender.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 5) { // Minimum distance before moving
    const normalized = normalizeVector(dx, dy);
    const speed = difficultyConfig.defenderSpeed * deltaTime / 16.67; // Normalize to 60fps
    
    updatedDefender.position = {
      x: defender.position.x + normalized.x * speed,
      y: defender.position.y + normalized.y * speed
    };
    
    // Keep defender within bounds
    updatedDefender.position.x = Math.max(
      gameField.boundaryLines.left,
      Math.min(gameField.boundaryLines.right, updatedDefender.position.x)
    );
    updatedDefender.position.y = Math.max(
      gameField.boundaryLines.top,
      Math.min(gameField.boundaryLines.bottom, updatedDefender.position.y)
    );
  }
  
  return updatedDefender;
};

// Check if defender can tackle raider
export const canTackleRaider = (defender: AIDefender, raider: Player): boolean => {
  const distance = calculateDistance(defender.position, raider.position);
  const tackleRange = defender.size + raider.size + 10; // Some extra range
  
  return distance <= tackleRange && raider.isActive && !raider.isTagged;
};

// Update all defenders
export const updateAllDefenders = (
  defenders: AIDefender[],
  raider: Player,
  gameField: GameField,
  difficultyConfig: DifficultyConfig,
  deltaTime: number
): AIDefender[] => {
  return defenders.map(defender => {
    if (defender.isActive) {
      return updateDefenderAI(defender, raider, gameField, difficultyConfig, deltaTime);
    }
    return defender;
  });
};

// Create AI defenders with formation
export const createAIDefenders = (
  gameField: GameField,
  difficultyConfig: DifficultyConfig
): AIDefender[] => {
  const formationPositions = createDefenderFormation(gameField.defenderZone);
  
  return formationPositions.map((position, index) => ({
    id: `defender_${index}`,
    position: { ...position },
    team: 'defenders' as const,
    isActive: true,
    isTagged: false,
    speed: difficultyConfig.defenderSpeed,
    size: 15,
    targetPosition: { ...position },
    reactionTime: difficultyConfig.defenderReactionTime,
    aggressiveness: difficultyConfig.defenderAggressiveness,
    formationPosition: { ...position },
  }));
};

// Check collision between raider and any defender
export const checkRaiderDefenderCollisions = (
  raider: Player,
  defenders: AIDefender[]
): { collision: boolean; defenderId?: string } => {
  for (const defender of defenders) {
    if (defender.isActive && canTackleRaider(defender, raider)) {
      return { collision: true, defenderId: defender.id };
    }
  }
  return { collision: false };
};

// Calculate tactical positioning for defenders
export const calculateTacticalPosition = (
  defender: AIDefender,
  raider: Player,
  allDefenders: AIDefender[],
  gameField: GameField
): Position => {
  // Consider raider position, other defender positions, and field boundaries
  const raiderPos = raider.position;
  const defenderPos = defender.position;
  
  // Calculate coverage gaps
  const nearbyDefenders = allDefenders.filter(d => 
    d.id !== defender.id && 
    calculateDistance(d.position, defenderPos) < 80
  );
  
  // If there are coverage gaps, move to cover them
  if (nearbyDefenders.length < 2 && raiderPos.y > gameField.centerLine - 50) {
    return {
      x: raiderPos.x + (defenderPos.x - raiderPos.x) * 0.7,
      y: raiderPos.y + (defenderPos.y - raiderPos.y) * 0.7
    };
  }
  
  // Default to formation position
  return defender.formationPosition;
};