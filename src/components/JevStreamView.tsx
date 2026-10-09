import React, { useState } from 'react';
import { Player, AIConfig, DiceOutcome } from '../types/game';
import { rollJevDice } from '../utils/jevEngine';
import { audio } from '../utils/audio';
import { Dices, Sparkles, AlertTriangle, Cpu, Code2, Activity } from 'lucide-react';

interface JevStreamViewProps {
  player: Player;
  aiConfig: AIConfig;
}

export const JevStreamView: React.FC<JevStreamViewProps> = ({ player, aiConfig }) => {
  const [benchRolls, setBenchRolls] = useState<Array<{ outcome: DiceOutcome; value: number; timestamp: string }>>([]);
  const [testModifier, setTestModifier] = useState<number>(0);

  const handleTestRoll = () => {
    audio.playDiceRattle();
    const result = rollJevDice(player, testModifier);
    if (result.outcome === 'null') audio.playNullSound();
    else if (result.outcome === 'choice') audio.playChoiceSound();
    else audio.playRadiantSound();

    setBenchRolls((prev) => [
      { outcome: result.outcome, value: result.rollValue, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9),
    ]);
  };

  const nullPct = Math.max(15, 33 + Math.floor(player.entropy / 10));
  const choicePct = 42;
  const radiantPct = Math.max(10, 100 - (nullPct + choicePct));

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 font-mono text-xs select-none space-y-6">
      {/* Title & Arch Overview */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-amber-400 font-black text-sm tracking-wide">
          <Cpu className="w-5 h-5 text-amber-400" />
          <span>JEV SYSTEM-ONE DECISION ENGINE // NEURAL TELEMETRY</span>
        </div>
        <p className="text-zinc-400 text-xs mt-1 max-w-2xl">
          Jev functions simultaneously as the stochastic dice engine and the Grandmaster Dungeon Master. Reality is discretized into three fundamental ontological states:
        </p>
      </div>

      {/* The 3 Core Ontological Data Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Null Card */}
        <div className="p-4 rounded border border-red-800/80 bg-red-950/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-red-400 font-black">
            <span className="flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4" /> 1. NULL (Void)
            </span>
            <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800">
              {nullPct}% CHANCE
            </span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Represents zero-state collapse, unhandled exceptions, and void entropy. The player's intent is swallowed, triggering backdraft hazards or positional setbacks.
          </p>
          <div className="mt-auto pt-2 border-t border-red-900/40 text-[10px] text-red-400 font-mono">
            <code>State: failure | void_drain</code>
          </div>
        </div>

        {/* Choice Card */}
        <div className="p-4 rounded border border-amber-800/80 bg-amber-950/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-amber-400 font-black">
            <span className="flex items-center gap-1.5 text-sm">
              <Dices className="w-4 h-4" /> 2. CHOICE (Branch)
            </span>
            <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              {choicePct}% CHANCE
            </span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            System-1 suspends linear time and forces a probability bifurcation. Player agency is paramount: choose between high-risk offensive momentum or fortified defense.
          </p>
          <div className="mt-auto pt-2 border-t border-amber-900/40 text-[10px] text-amber-400 font-mono">
            <code>State: bifurcation | agency_lock</code>
          </div>
        </div>

        {/* Radiant Card */}
        <div className="p-4 rounded border border-cyan-800/80 bg-cyan-950/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-cyan-400 font-black">
            <span className="flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4" /> 3. RADIANT (Surge)
            </span>
            <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {radiantPct}% CHANCE
            </span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Antigravity coherence achieved. Divine intervention, critical damage multiplier, zero biological entropy, and procedural cache discoveries.
          </p>
          <div className="mt-auto pt-2 border-t border-cyan-900/40 text-[10px] text-cyan-400 font-mono">
            <code>State: critical | divine_intervention</code>
          </div>
        </div>
      </div>

      {/* Stochastic Probability Distribution Bar */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> LIVE PROBABILITY CURVE DISTRIBUTION
          </span>
          <span className="text-zinc-400 text-[11px]">Dynamic based on Entropy: {player.entropy}%</span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-4 bg-zinc-950 rounded flex overflow-hidden border border-zinc-800">
          <div style={{ width: `${nullPct}%` }} className="bg-red-600/80 h-full flex items-center justify-center text-[9px] font-bold text-white">
            NULL {nullPct}%
          </div>
          <div style={{ width: `${choicePct}%` }} className="bg-amber-500/80 h-full flex items-center justify-center text-[9px] font-bold text-black">
            CHOICE {choicePct}%
          </div>
          <div style={{ width: `${radiantPct}%` }} className="bg-cyan-500/80 h-full flex items-center justify-center text-[9px] font-bold text-black">
            RADIANT {radiantPct}%
          </div>
        </div>
      </div>

      {/* Interactive Dice Benchmark & Test Bench */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-200 flex items-center gap-2">
            <Dices className="w-4 h-4 text-amber-400" /> STOCHASTIC BENCHMARK TEST BED
          </span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">Modifier:</span>
            <input
              type="number"
              value={testModifier}
              onChange={(e) => setTestModifier(Number(e.target.value))}
              className="w-14 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-center text-zinc-200"
            />
          </div>
        </div>

        <button
          onClick={handleTestRoll}
          className="py-2.5 rounded bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black uppercase tracking-wider text-xs shadow-glow-amber transition-all flex items-center justify-center gap-2"
        >
          <Dices className="w-4 h-4" /> TEST ROLL STOCHASTIC ENGINE
        </button>

        {benchRolls.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
            {benchRolls.map((r, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded text-[10px] font-bold border uppercase ${
                  r.outcome === 'null'
                    ? 'bg-red-950 border-red-700 text-red-400'
                    : r.outcome === 'choice'
                    ? 'bg-amber-950 border-amber-600 text-amber-300'
                    : 'bg-cyan-950 border-cyan-500 text-cyan-300'
                }`}
              >
                [{r.outcome.toUpperCase()}] ({r.value})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* System Prompt Inspector */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50 flex flex-col gap-2">
        <span className="font-bold text-zinc-200 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-purple-400" /> SYSTEM-1 GRANDMASTER PROMPT ARCHITECTURE
        </span>
        <pre className="p-3 bg-zinc-950 rounded border border-zinc-800 text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap">
{`SYSTEM INSTRUCTION: You are JEV, the Grandmaster AI of AGY Dungeon.
CORE PRINCIPLE: System-1 thinking. High-frequency narrative resolution.
ONTOLOGICAL TYPES:
  - NULL: Failure, void damage, collapse.
  - CHOICE: Player agency dilemma (A vs B).
  - RADIANT: Antigravity transcendence, critical strike.
RUNTIME COMPLIANCE: Runs on Edge, Mobile (Ollama/WebLLM), or Bring-Your-Own API Key.
CURRENT PROVIDER: ${aiConfig.provider.toUpperCase()} (${aiConfig.model || 'Default'})`}
        </pre>
      </div>
    </div>
  );
};
