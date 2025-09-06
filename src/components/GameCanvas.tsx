'use client';

import React, { useRef, useEffect } from 'react';
import { KabaddiGameEngine } from '@/lib/gameEngine';
import {
  clearCanvas,
  drawKabaddiField,
  drawPlayer,
  drawGameInfo,
  drawRaidPath,
  drawMovementTrail,
  drawGameOverOverlay
} from '@/lib/canvasUtils';

interface GameCanvasProps {
  gameEngine: KabaddiGameEngine;
  width: number;
  height: number;
}

export default function GameCanvas({ gameEngine, width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // Clear canvas
      clearCanvas(ctx, width, height);

      // Get current game state
      const gameState = gameEngine.getGameState();
      const score = gameEngine.getScore();
      const raider = gameEngine.getRaider();
      const defenders = gameEngine.getDefenders();
      const gameField = gameEngine.getGameField();
      const raiderTrail = gameEngine.getRaiderTrail();

      // Draw game field
      drawKabaddiField(ctx, gameField, width, height);

      // Draw raider movement trail
      if (raiderTrail.length > 1) {
        drawMovementTrail(ctx, raiderTrail, 'rgba(255, 0, 0, 0.5)');
      }

      // Draw raid path if raider crossed line
      if (gameEngine.hasCrossedCenterLine()) {
        drawRaidPath(ctx, raider.position, gameField.centerLine, true);
      }

      // Draw defenders
      defenders.forEach(defender => {
        const color = defender.isTagged ? '#666666' : '#4ecdc4';
        drawPlayer(ctx, defender, color, false);
      });

      // Draw raider (highlighted)
      const raiderColor = raider.isTagged ? '#ff4444' : '#ff6b6b';
      drawPlayer(ctx, raider, raiderColor, true);

      // Draw game info overlay
      drawGameInfo(
        ctx,
        score,
        Math.ceil(gameState.raidTimer),
        Math.ceil(gameState.gameTimer),
        gameState.currentPhase
      );

      // Draw game over overlay if applicable
      if (gameState.isGameOver) {
        const winner = score.raiders > score.defenders ? 'raiders' : 
                      score.defenders > score.raiders ? 'defenders' : 'tie';
        drawGameOverOverlay(ctx, winner, width, height);
      }

      // Draw pause overlay
      if (gameState.isPaused && !gameState.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', width / 2, height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press P to resume', width / 2, height / 2 + 40);
      }

      // Continue rendering
      animationId = requestAnimationFrame(render);
    };

    // Start rendering loop
    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameEngine, width, height]);

  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-800">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-gray-600 rounded-lg shadow-2xl bg-green-800"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'crisp-edges'
        }}
      />
    </div>
  );
}