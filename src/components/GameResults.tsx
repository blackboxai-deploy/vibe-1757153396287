'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Score, GameEvent } from '@/lib/gameTypes';

interface GameResultsProps {
  score: Score;
  gameEvents: GameEvent[];
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function GameResults({ score, gameEvents, onRestart, onMainMenu }: GameResultsProps) {
  // Calculate statistics from game events
  const calculateStats = () => {
    const stats = {
      totalRaids: 0,
      successfulRaids: 0,
      defendersTagged: 0,
      raidersCaught: 0,
      timeouts: 0
    };

    gameEvents.forEach(event => {
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
        case 'raid_timeout':
          stats.timeouts++;
          break;
      }
    });

    return stats;
  };

  const stats = calculateStats();
  const winner = score.raiders > score.defenders ? 'Raiders' : 
                 score.defenders > score.raiders ? 'Defenders' : 'Tie';
  
  const winnerColor = winner === 'Raiders' ? 'text-red-500' : 
                      winner === 'Defenders' ? 'text-blue-500' : 'text-gray-500';
  
  const successRate = stats.totalRaids > 0 ? 
    Math.round((stats.successfulRaids / stats.totalRaids) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white/95 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            GAME OVER
          </h1>
          <h2 className={`text-3xl font-bold ${winnerColor} mb-4`}>
            {winner === 'Tie' ? 'IT\'S A TIE!' : `${winner.toUpperCase()} WIN!`}
          </h2>
          <div className="w-24 h-1 bg-gray-600 mx-auto rounded"></div>
        </div>

        {/* Final Score */}
        <Card className="mb-8 p-6 bg-gray-50">
          <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">Final Score</h3>
          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500">{score.raiders}</div>
              <div className="text-lg text-gray-600">Raiders</div>
            </div>
            <div className="text-2xl font-bold text-gray-400">VS</div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500">{score.defenders}</div>
              <div className="text-lg text-gray-600">Defenders</div>
            </div>
          </div>
        </Card>

        {/* Game Statistics */}
        <Card className="mb-8 p-6 bg-blue-50 border-blue-200">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 text-center">Match Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.totalRaids}</div>
              <div className="text-sm text-gray-600">Total Raids</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successfulRaids}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.defendersTagged}</div>
              <div className="text-sm text-gray-600">Defenders Tagged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.raidersCaught}</div>
              <div className="text-sm text-gray-600">Raiders Caught</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Success Rate: {successRate}%
            </Badge>
          </div>
        </Card>

        {/* Performance Rating */}
        <Card className="mb-8 p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4 text-center">Performance Rating</h3>
          <div className="text-center">
            {successRate >= 80 && (
              <div>
                <div className="text-3xl mb-2">🏆</div>
                <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                  KABADDI MASTER
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Outstanding performance!</p>
              </div>
            )}
            {successRate >= 60 && successRate < 80 && (
              <div>
                <div className="text-3xl mb-2">🥉</div>
                <Badge className="bg-orange-500 text-white text-lg px-4 py-2">
                  SKILLED RAIDER
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Good tactical play!</p>
              </div>
            )}
            {successRate >= 40 && successRate < 60 && (
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <Badge className="bg-blue-500 text-white text-lg px-4 py-2">
                  LEARNING WARRIOR
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Keep practicing!</p>
              </div>
            )}
            {successRate < 40 && (
              <div>
                <div className="text-3xl mb-2">💪</div>
                <Badge className="bg-gray-500 text-white text-lg px-4 py-2">
                  ROOKIE RAIDER
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Try different strategies!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Events */}
        {gameEvents.length > 0 && (
          <Card className="mb-8 p-6 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Recent Events</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {gameEvents.slice(-5).reverse().map((event, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{event.message}</span>
                  {event.points && (
                    <Badge variant="outline" className="text-xs">
                      +{event.points} pts
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={onRestart}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            Play Again
          </Button>
          <Button
            onClick={onMainMenu}
            size="lg"
            variant="outline"
            className="px-8 py-3"
          >
            Main Menu
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-8 text-center">
          <Card className="p-4 bg-green-50 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Pro Tips</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Move quickly but strategically to avoid defenders</p>
              <p>• Tag multiple defenders for bonus points</p>
              <p>• Watch the raid timer - don't get caught in enemy territory!</p>
              <p>• Practice different movement patterns to confuse AI defenders</p>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}