import React from 'react';
import { BookOpen, Terminal, Sparkles, AlertTriangle, Dices, Cpu, Shield, Key } from 'lucide-react';

export const CodexView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 font-mono text-xs select-none space-y-6">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-purple-400 font-black text-sm tracking-wide">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span>SPIRE CODEX // SYSTEM ARCHITECTURE &amp; LORE</span>
        </div>
        <p className="text-zinc-400 text-xs mt-1">
          Historical records, mathematical axioms, and terminal operation manual for AGY Dungeon.
        </p>
      </div>

      {/* Raw Verbatim Genesis Section */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/40 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Key className="w-4 h-4 text-amber-400" />
          <span>THE GENESIS TRANSCRIPT (VERBATIM FOUNDATION)</span>
        </div>
        <blockquote className="p-3 bg-zinc-950 border-l-2 border-amber-500 rounded text-[11px] text-zinc-300 italic leading-relaxed">
          &ldquo;Grandmaster Jev DND. Multiplayer, terminal, roleplay, adventure, video game for PC/phone with local AI integration or open any API that exists in the world. You can enter it and you can also do your own runtime even on mobile, your own AI models on device. It's going to be DND with Jev, Jev the new system one thinking... The new decision-making system is going to be run by Jev. It's going to be three possible data types: null, choice, and radiant. It's somehow going to be the dice of the game as well as the grandmaster of the game, and then multiple players are going to be seeing the same terminal user interface using something like a herder or a terminal multiplexer like tmux.&rdquo;
        </blockquote>
      </div>

      {/* Tri-State Ontological Architecture */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/40 flex flex-col gap-3">
        <span className="font-bold text-cyan-400 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" /> THE TRI-STATE ONTOLOGY
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-950 rounded border border-red-900/60">
            <div className="text-red-400 font-bold flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" /> [ NULL ] Void Collapse
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              When an action encounters insurmountable quantum entropy. The initiative fails, dealing void damage and destabilizing the local physics buffer.
            </p>
          </div>

          <div className="p-3 bg-zinc-950 rounded border border-amber-900/60">
            <div className="text-amber-400 font-bold flex items-center gap-1.5 mb-1">
              <Dices className="w-3.5 h-3.5" /> [ CHOICE ] Branching Dilemma
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              System-1 halts time and presents two branching tactical dilemmas (A or B). The outcome depends entirely on player agency and risk calculus.
            </p>
          </div>

          <div className="p-3 bg-zinc-950 rounded border border-cyan-900/60">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> [ RADIANT ] Antigravity Surge
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Harmonic transcendence. Inverts gravitational vectors, executes critical strikes, vents biological entropy, and reveals legendary artifacts.
            </p>
          </div>
        </div>
      </div>

      {/* Complete Command Matrix */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/40 flex flex-col gap-2.5">
        <span className="font-bold text-zinc-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" /> FULL TERMINAL COMMAND REFERENCE
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
            <code className="text-amber-300 font-bold">roll [context]</code>
            <p className="text-zinc-400">Triggers the tri-state stochastic dice with optional action descriptor.</p>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
            <code className="text-red-400 font-bold">attack / strike</code>
            <p className="text-zinc-400">Engages the room hostile target in direct combat.</p>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
            <code className="text-cyan-300 font-bold">cast [spell]</code>
            <p className="text-zinc-400">Channels an antigravity pulse to reduce biological entropy.</p>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
            <code className="text-zinc-300 font-bold">look / inspect</code>
            <p className="text-zinc-400">Examines the current room anomalies, telemetry, and exits.</p>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
            <code className="text-zinc-300 font-bold">go &lt;north/south/east/west&gt;</code>
            <p className="text-zinc-400">Traverses through the interconnected chambers of the Spire.</p>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
            <code className="text-amber-300 font-bold">use &lt;item&gt;</code>
            <p className="text-zinc-400">Consumes or activates an inventory resource (e.g. 'use Stasis Stimpack').</p>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
            <code className="text-emerald-400 font-bold">say &lt;message&gt;</code>
            <p className="text-zinc-400">Broadcasts a message to all connected Herdr operators.</p>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
            <code className="text-purple-300 font-bold">loot / scavenge</code>
            <p className="text-zinc-400">Scours the chamber floor for hidden caches and relics.</p>
          </div>
        </div>
      </div>

      {/* Relic & Artifact Index */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/40 flex flex-col gap-2.5">
        <span className="font-bold text-zinc-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" /> KNOWN SPIRE ARTIFACTS
        </span>
        <div className="space-y-1.5 text-[11px]">
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
            <span className="font-semibold text-cyan-300">Stasis Stimpack</span>
            <span className="text-zinc-400">+35 HP, -20% Entropy</span>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
            <span className="font-semibold text-amber-300">Overclocked Chrono-Dagger</span>
            <span className="text-zinc-400">+15 Strike Damage</span>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
            <span className="font-semibold text-purple-300">Graviton Rail Carbine</span>
            <span className="text-zinc-400">+25 Damage (Shield Piercing)</span>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
            <span className="font-semibold text-emerald-300">Null Inverter Module</span>
            <span className="text-zinc-400">Resets Entropy to 0%</span>
          </div>
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
            <span className="font-semibold text-yellow-300">Essence of Jev [Unstable]</span>
            <span className="text-zinc-400">+50 Max HP, +10 Mind</span>
          </div>
        </div>
      </div>
    </div>
  );
};
