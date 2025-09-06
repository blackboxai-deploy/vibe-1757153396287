'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  onControlPress: (direction: string, isPressed: boolean) => void;
  visible: boolean;
}

export default function GameControls({ onControlPress, visible }: GameControlsProps) {
  if (!visible) return null;

  const handleTouchStart = (direction: string) => {
    onControlPress(direction, true);
  };

  const handleTouchEnd = (direction: string) => {
    onControlPress(direction, false);
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 md:hidden">
      {/* Virtual D-Pad */}
      <div className="relative w-32 h-32">
        {/* Up Button */}
        <Button
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-black/70 text-white border border-gray-600 hover:bg-black/90 active:bg-gray-700 p-0"
          onTouchStart={() => handleTouchStart('up')}
          onTouchEnd={() => handleTouchEnd('up')}
          onMouseDown={() => handleTouchStart('up')}
          onMouseUp={() => handleTouchEnd('up')}
          onMouseLeave={() => handleTouchEnd('up')}
        >
          ↑
        </Button>

        {/* Left Button */}
        <Button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/70 text-white border border-gray-600 hover:bg-black/90 active:bg-gray-700 p-0"
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={() => handleTouchEnd('left')}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          onMouseLeave={() => handleTouchEnd('left')}
        >
          ←
        </Button>

        {/* Right Button */}
        <Button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/70 text-white border border-gray-600 hover:bg-black/90 active:bg-gray-700 p-0"
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={() => handleTouchEnd('right')}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          onMouseLeave={() => handleTouchEnd('right')}
        >
          →
        </Button>

        {/* Down Button */}
        <Button
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-black/70 text-white border border-gray-600 hover:bg-black/90 active:bg-gray-700 p-0"
          onTouchStart={() => handleTouchStart('down')}
          onTouchEnd={() => handleTouchEnd('down')}
          onMouseDown={() => handleTouchStart('down')}
          onMouseUp={() => handleTouchEnd('down')}
          onMouseLeave={() => handleTouchEnd('down')}
        >
          ↓
        </Button>

        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Instructions for mobile */}
      <div className="mt-2 text-center">
        <p className="text-xs text-white/70">Touch controls</p>
      </div>
    </div>
  );
}