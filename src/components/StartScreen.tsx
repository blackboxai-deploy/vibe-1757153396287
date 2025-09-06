'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameDifficulty } from '@/lib/gameTypes';

interface StartScreenProps {
  onStart: () => void;
  onDifficultyChange: (difficulty: GameDifficulty) => void;
  selectedDifficulty: GameDifficulty;
}

export default function StartScreen({ onStart, onDifficultyChange, selectedDifficulty }: StartScreenProps) {
  const difficultyDescriptions = {
    easy: 'Slower defenders, more reaction time',
    medium: 'Balanced gameplay experience',
    hard: 'Fast defenders, challenging AI'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white/95 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-800 mb-4">
            KABADDI
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            The Ancient Sport of Raiders and Defenders
          </p>
          <div className="w-24 h-1 bg-green-600 mx-auto rounded"></div>
        </div>

        {/* Game Rules */}
        <Card className="mb-8 p-6 bg-green-50 border-green-200">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">Objective:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Cross the center line into defender territory</li>
                <li>• Tag as many defenders as possible</li>
                <li>• Return to your safe zone before time runs out</li>
                <li>• Avoid being tackled by defenders</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-700 mb-2">Controls:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Arrow Keys</strong> or <strong>WASD</strong> to move</li>
                <li>• <strong>P</strong> to pause/resume</li>
                <li>• <strong>R</strong> to restart (when game over)</li>
                <li>• Touch controls available on mobile</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Scoring Rules */}
        <Card className="mb-8 p-6 bg-blue-50 border-blue-200">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Scoring</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">Raiders Score:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>1 point</strong> for successful raid</li>
                <li>• <strong>1 point</strong> per defender tagged</li>
                <li>• <strong>2 points</strong> bonus for tagging all defenders</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">Defenders Score:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>1 point</strong> for tackling the raider</li>
                <li>• <strong>1 point</strong> if raid timer expires</li>
                <li>• <strong>2 points</strong> all-out bonus</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Select Difficulty</h2>
          <div className="flex justify-center mb-4">
            <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-center text-sm text-gray-600">
            {difficultyDescriptions[selectedDifficulty]}
          </p>
        </div>

        {/* Game Stats */}
        <Card className="mb-8 p-4 bg-yellow-50 border-yellow-200">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-yellow-800">Game Duration</div>
              <div className="text-gray-700">10 minutes</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-800">Raid Timer</div>
              <div className="text-gray-700">30 seconds</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-800">Win Condition</div>
              <div className="text-gray-700">30 points or time up</div>
            </div>
          </div>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-xl px-12 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            START GAME
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Experience the thrill of this ancient Indian sport!</p>
        </div>
      </Card>
    </div>
  );
}