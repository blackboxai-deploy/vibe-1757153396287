'use client';

import React from 'react';
import { GameState, Score } from '@/lib/gameTypes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GameUIProps {
  score: Score;
  gameState: GameState;
  onPause: () => void;
  onRestart: () => void;
}

export default function GameUI({ score, gameState, onPause, onRestart }: GameUIProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'raiding': return 'text-yellow-400';
      case 'returning': return 'text-blue-400';
      case 'scored': return 'text-green-400';
      case 'tackled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPhaseText = (phase: string): string => {
    switch (phase) {
      case 'waiting': return 'Get Ready';
      case 'raiding': return 'Raiding';
      case 'returning': return 'Returning';
      case 'scored': return 'Successful Raid!';
      case 'tackled': return 'Raider Caught!';
      default: return phase.charAt(0).toUpperCase() + phase.slice(1);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full z-10 p-4">
      <div className="flex justify-between items-start">
        {/* Score Display */}
        <Card className="bg-black/70 text-white border-gray-600 p-4 min-w-[200px]">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">SCORE</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{score.raiders}</div>
                <div className="text-sm">Raiders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{score.defenders}</div>
                <div className="text-sm">Defenders</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Game Timer */}
        <Card className="bg-black/70 text-white border-gray-600 p-4 min-w-[150px]">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">GAME TIME</h3>
            <div className="text-2xl font-bold">
              {formatTime(gameState.gameTimer)}
            </div>
          </div>
        </Card>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onPause}
            disabled={gameState.isGameOver}
            variant="outline"
            className="bg-black/70 text-white border-gray-600 hover:bg-black/90"
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            className="bg-black/70 text-white border-gray-600 hover:bg-black/90"
          >
            Restart
          </Button>
        </div>
      </div>

      {/* Raid Timer and Phase */}
      <div className="mt-4 flex justify-center">
        <Card className="bg-black/70 text-white border-gray-600 p-4 min-w-[300px]">
          <div className="text-center">
            <div className={`text-xl font-bold mb-2 ${getPhaseColor(gameState.currentPhase)}`}>
              {getPhaseText(gameState.currentPhase)}
            </div>
            
            {gameState.currentPhase === 'raiding' || gameState.currentPhase === 'returning' ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Raid Timer</span>
                  <span className={gameState.raidTimer <= 10 ? 'text-red-400' : 'text-white'}>
                    {Math.ceil(gameState.raidTimer)}s
                  </span>
                </div>
                <Progress 
                  value={(gameState.raidTimer / 30) * 100} 
                  className="w-full h-2"
                />
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Game Rules Reminder */}
      {gameState.currentPhase === 'waiting' && (
        <div className="mt-4 flex justify-center">
          <Card className="bg-black/70 text-white border-gray-600 p-3 max-w-md">
            <div className="text-center text-sm">
              <p><strong>Objective:</strong> Cross the center line, tag defenders, and return safely!</p>
              <p className="mt-2"><strong>Controls:</strong> Arrow Keys or WASD to move</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}