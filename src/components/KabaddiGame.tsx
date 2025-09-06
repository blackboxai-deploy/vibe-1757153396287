'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { KabaddiGameEngine } from '@/lib/gameEngine';
import { DEFAULT_GAME_CONFIG, DIFFICULTY_CONFIGS } from '@/lib/kabaddiRules';
import { GameDifficulty } from '@/lib/gameTypes';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import GameControls from './GameControls';
import StartScreen from './StartScreen';
import GameResults from './GameResults';

interface KabaddiGameProps {
  className?: string;
}

export default function KabaddiGame({ className }: KabaddiGameProps) {
  const [gameEngine, setGameEngine] = useState<KabaddiGameEngine | null>(null);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Initialize game engine
  const initializeGame = useCallback((selectedDifficulty: GameDifficulty) => {
    const config = DEFAULT_GAME_CONFIG;
    const difficultyConfig = DIFFICULTY_CONFIGS[selectedDifficulty];
    const engine = new KabaddiGameEngine(config, difficultyConfig);
    setGameEngine(engine);
    setDifficulty(selectedDifficulty);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    if (gameEngine) {
      gameEngine.startGame();
      setGameStarted(true);
      setShowResults(false);
    }
  }, [gameEngine]);

  // Restart game
  const restartGame = useCallback(() => {
    if (gameEngine) {
      gameEngine.resetGame();
      setShowResults(false);
      setGameStarted(false);
    } else {
      initializeGame(difficulty);
    }
  }, [gameEngine, difficulty, initializeGame]);

  // Handle keyboard controls
  useEffect(() => {
    if (!gameEngine || !gameStarted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const controls = {
        up: false,
        down: false,
        left: false,
        right: false
      };

      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          controls.up = true;
          break;
        case 'arrowdown':
        case 's':
          controls.down = true;
          break;
        case 'arrowleft':
        case 'a':
          controls.left = true;
          break;
        case 'arrowright':
        case 'd':
          controls.right = true;
          break;
        case 'p':
          gameEngine.togglePause();
          break;
        case 'r':
          if (gameEngine.getGameState().isGameOver) {
            restartGame();
          }
          break;
      }

      gameEngine.updateControls(controls);
    };

    const handleKeyUp = () => {
      const controls = {
        up: false,
        down: false,
        left: false,
        right: false
      };

      gameEngine.updateControls(controls);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameEngine, gameStarted, restartGame]);

  // Game loop
  useEffect(() => {
    if (!gameEngine || !gameStarted) return;

    let animationId: number;
    
    const gameLoop = (currentTime: number) => {
      gameEngine.update(currentTime);
      
      // Check if game ended
      if (gameEngine.getGameState().isGameOver && !showResults) {
        setShowResults(true);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameEngine, gameStarted, showResults]);

  // Handle touch controls
  const handleTouchControls = useCallback((direction: string, isPressed: boolean) => {
    if (!gameEngine) return;

    const controls = {
      up: direction === 'up' && isPressed,
      down: direction === 'down' && isPressed,
      left: direction === 'left' && isPressed,
      right: direction === 'right' && isPressed
    };

    gameEngine.updateControls(controls);
  }, [gameEngine]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame('medium');
  }, [initializeGame]);

  if (!gameEngine) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading Kabaddi Game...</p>
        </div>
      </div>
    );
  }

  if (!gameStarted && !showResults) {
    return (
      <StartScreen
        onStart={startGame}
        onDifficultyChange={(newDifficulty) => {
          setDifficulty(newDifficulty);
          initializeGame(newDifficulty);
        }}
        selectedDifficulty={difficulty}
      />
    );
  }

  if (showResults) {
    return (
      <GameResults
        score={gameEngine.getScore()}
        gameEvents={gameEngine.getGameEvents()}
        onRestart={restartGame}
        onMainMenu={() => {
          setShowResults(false);
          setGameStarted(false);
        }}
      />
    );
  }

  return (
    <div className={`relative w-full h-screen bg-gray-900 overflow-hidden ${className}`}>
      {/* Game UI Overlay */}
      <GameUI
        score={gameEngine.getScore()}
        gameState={gameEngine.getGameState()}
        onPause={() => gameEngine.togglePause()}
        onRestart={restartGame}
      />

      {/* Game Canvas */}
      <GameCanvas
        gameEngine={gameEngine}
        width={DEFAULT_GAME_CONFIG.canvasWidth}
        height={DEFAULT_GAME_CONFIG.canvasHeight}
      />

      {/* Touch Controls for Mobile */}
      <GameControls
        onControlPress={handleTouchControls}
        visible={true}
      />

      {/* Game Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-sm opacity-75">
        <p>Arrow Keys / WASD: Move Raider</p>
        <p>P: Pause | R: Restart (when game over)</p>
        <p>Cross the center line, tag defenders, return safely!</p>
      </div>
    </div>
  );
}