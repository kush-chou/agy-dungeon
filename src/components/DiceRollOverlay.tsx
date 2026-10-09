import React, { useEffect, useState } from 'react';
import { DiceOutcome } from '../types/game';
import confetti from 'canvas-confetti';
import { AlertTriangle, Dices, Sparkles, X } from 'lucide-react';

interface DiceRollOverlayProps {
  outcome: DiceOutcome | null;
  rollValue: number | null;
  onClose: () => void;
}

export const DiceRollOverlay: React.FC<DiceRollOverlayProps> = ({
  outcome,
  rollValue,
  onClose,
}) => {
  const [spinningText, setSpinningText] = useState('CALCULATING...');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!outcome) return;

    setRevealed(false);
    const outcomes: string[] = ['[ NULL ]', '[ CHOICE ]', '[ RADIANT ]', '[ VOID ]', '[ BRANCH ]', '[ SURGE ]'];
    let counter = 0;

    const interval = setInterval(() => {
      setSpinningText(outcomes[counter % outcomes.length]);
      counter++;
    }, 70);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setRevealed(true);

      if (outcome === 'radiant') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#38bdf8', '#eab308', '#ffffff'],
        });
      }
    }, 900);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [outcome]);

  if (!outcome) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div
        className={`max-w-md w-full p-6 rounded-lg border-2 text-center relative transition-all duration-300 font-mono ${
          !revealed
            ? 'border-zinc-700 bg-zinc-950 text-zinc-300'
            : outcome === 'null'
            ? 'border-red-600 bg-zinc-950 text-red-400 shadow-glow-red'
            : outcome === 'choice'
            ? 'border-amber-500 bg-zinc-950 text-amber-300 shadow-glow-amber'
            : 'border-cyan-400 bg-zinc-950 text-cyan-300 shadow-glow-cyan'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-[10px] tracking-widest text-zinc-500 uppercase mb-2">
          JEV SYSTEM-1 STOCHASTIC RESOLUTION
        </div>

        {!revealed ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-xl font-black text-amber-400 animate-pulse tracking-wider">
              {spinningText}
            </div>
            <p className="text-xs text-zinc-500">Sampling quantum entropy state...</p>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center gap-3 animate-bounce-short">
            {outcome === 'null' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-700 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="text-3xl font-black tracking-widest text-red-500 glow-text-red">
                  [ NULL ]
                </div>
                <div className="text-xs text-zinc-400">
                  Entropy Roll: <span className="font-bold text-red-400">{rollValue}</span> / 100
                </div>
                <p className="text-xs text-red-300/90 max-w-xs mt-1">
                  VOID PENALTY: Action swallowed by quantum noise. Damage sustained and entropy increased.
                </p>
              </>
            )}

            {outcome === 'choice' && (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-600 flex items-center justify-center text-amber-400">
                  <Dices className="w-8 h-8" />
                </div>
                <div className="text-3xl font-black tracking-widest text-amber-400 glow-text-amber">
                  [ CHOICE ]
                </div>
                <div className="text-xs text-zinc-400">
                  Entropy Roll: <span className="font-bold text-amber-400">{rollValue}</span> / 100
                </div>
                <p className="text-xs text-amber-200/90 max-w-xs mt-1">
                  BRANCHING AGENCY: Reality cleaves in two. Review your tactical gambits in the terminal.
                </p>
              </>
            )}

            {outcome === 'radiant' && (
              <>
                <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500 flex items-center justify-center text-cyan-300">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <div className="text-3xl font-black tracking-widest text-cyan-300 glow-text-cyan">
                  [ RADIANT ]
                </div>
                <div className="text-xs text-zinc-400">
                  Entropy Roll: <span className="font-bold text-cyan-400">{rollValue}</span> / 100
                </div>
                <p className="text-xs text-cyan-200/90 max-w-xs mt-1">
                  CRITICAL TRANSCENDENCE: Pure antigravity surge! Massive damage, cleansed entropy, and divine cache.
                </p>
              </>
            )}

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 uppercase tracking-wider transition-all"
            >
              Continue to Terminal &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
