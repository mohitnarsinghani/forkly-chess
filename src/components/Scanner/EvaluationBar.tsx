import React from 'react';
import { EvaluationState } from '../../types';

interface EvaluationBarProps {
  evaluation: EvaluationState;
  orientation?: 'white' | 'black';
  vertical?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  orientation = 'white',
  vertical = true,
}) => {
  const { scoreText, winChance, mate } = evaluation;

  // Percentage of white height (0% to 100%)
  // winChance is 0 to 100 from White's perspective
  const whitePercent = Math.min(98, Math.max(2, winChance));
  const blackPercent = 100 - whitePercent;

  // In vertical mode:
  // If orientation is 'white': White is at the bottom, Black is at the top.
  // If orientation is 'black': Black is at the bottom, White is at the top.
  const isWhiteBottom = orientation === 'white';

  return (
    <div
      id="engine-eval-bar"
      className={`relative overflow-hidden rounded-md bg-zinc-900 border border-zinc-800 shadow-inner flex select-none ${
        vertical
          ? 'w-7 md:w-8 h-full flex-col'
          : 'w-full h-6 flex-row'
      }`}
      title={`Engine Evaluation: ${scoreText} (Win Chance: ${winChance}%)`}
    >
      {/* Black section */}
      <div
        className="bg-zinc-850 transition-all duration-500 ease-out flex items-center justify-center relative overflow-hidden"
        style={
          vertical
            ? {
                height: `${isWhiteBottom ? blackPercent : whitePercent}%`,
                backgroundColor: isWhiteBottom ? '#18181b' : '#f4f4f5',
              }
            : {
                width: `${isWhiteBottom ? blackPercent : whitePercent}%`,
                backgroundColor: isWhiteBottom ? '#18181b' : '#f4f4f5',
              }
        }
      >
        {/* Label on top section if black is winning or mate */}
        {((isWhiteBottom && winChance < 45) || (!isWhiteBottom && winChance > 55)) && (
          <span
            className={`font-mono text-[10px] md:text-xs font-bold px-1 rounded ${
              isWhiteBottom ? 'text-zinc-300' : 'text-zinc-900'
            }`}
          >
            {mate ? scoreText : scoreText}
          </span>
        )}
      </div>

      {/* White section */}
      <div
        className="bg-zinc-100 transition-all duration-500 ease-out flex items-center justify-center relative overflow-hidden"
        style={
          vertical
            ? {
                height: `${isWhiteBottom ? whitePercent : blackPercent}%`,
                backgroundColor: isWhiteBottom ? '#f4f4f5' : '#18181b',
              }
            : {
                width: `${isWhiteBottom ? whitePercent : blackPercent}%`,
                backgroundColor: isWhiteBottom ? '#f4f4f5' : '#18181b',
              }
        }
      >
        {/* Label on bottom section if white is winning or equal */}
        {((isWhiteBottom && winChance >= 45) || (!isWhiteBottom && winChance <= 55)) && (
          <span
            className={`font-mono text-[10px] md:text-xs font-bold px-1 rounded ${
              isWhiteBottom ? 'text-zinc-900' : 'text-zinc-300'
            }`}
          >
            {scoreText}
          </span>
        )}
      </div>

      {/* Zero point midline indicator */}
      <div
        className={`absolute bg-emerald-500/60 pointer-events-none z-10 ${
          vertical
            ? 'left-0 right-0 h-0.5 top-1/2 -translate-y-1/2'
            : 'top-0 bottom-0 w-0.5 left-1/2 -translate-x-1/2'
        }`}
      />
    </div>
  );
};
