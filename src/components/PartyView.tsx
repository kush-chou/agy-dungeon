import React, { useState } from 'react';
import { PartyMember, Player } from '../types/game';
import { Users, Wifi, Terminal, Send } from 'lucide-react';
import { audio } from '../utils/audio';

interface PartyViewProps {
  party: PartyMember[];
  player: Player;
  onBroadcastPartyMessage: (msg: string) => void;
  onOpenLobby: () => void;
}

export const PartyView: React.FC<PartyViewProps> = ({
  party,
  player,
  onBroadcastPartyMessage,
  onOpenLobby,
}) => {
  const [msg, setMsg] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    audio.playKeypress();
    onBroadcastPartyMessage(msg.trim());
    setMsg('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 font-mono text-xs select-none space-y-6">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm tracking-wide">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>HERDR MULTIPLEXER // SHARED TERMINAL SESSION</span>
          </div>
          <p className="text-zinc-400 text-xs mt-1">
            Simultaneous TUI multiplexing via Rust-based P2P stream. All operators share the same state buffer.
          </p>
        </div>
        <button
          onClick={onOpenLobby}
          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs"
        >
          Invite Operators
        </button>
      </div>

      {/* Operators Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Current Player Host Card */}
        <div className="p-3 rounded border border-cyan-500 bg-cyan-950/20 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300">{player.name} (YOU)</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-900 border border-cyan-700 text-cyan-300 text-[10px]">HOST</span>
          </div>
          <div className="text-[11px] text-zinc-400">{player.className} • LVL {player.level}</div>
          <div className="mt-2 text-[11px] flex justify-between">
            <span className="text-zinc-400">Vitality:</span>
            <span className="text-red-400 font-bold">{player.hp}/{player.maxHp} HP</span>
          </div>
          <div className="text-[11px] flex justify-between">
            <span className="text-zinc-400">Entropy:</span>
            <span className="text-amber-400 font-bold">{player.entropy}%</span>
          </div>
          <div className="mt-auto pt-2 border-t border-cyan-900/40 text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LOCAL TERMINAL MASTER</span>
          </div>
        </div>

        {/* Remote Party Members */}
        {party.map((m) => (
          <div key={m.id} className="p-3 rounded border border-zinc-800 bg-zinc-900/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-200">{m.name}</span>
              <span className="text-[10px] text-emerald-400 font-mono">{m.ping}ms</span>
            </div>
            <div className="text-[11px] text-zinc-400">{m.role}</div>
            <div className="mt-2 text-[11px] flex justify-between">
              <span className="text-zinc-400">Vitality:</span>
              <span className="text-red-400 font-bold">{m.hp}/{m.maxHp} HP</span>
            </div>
            <div className="mt-auto pt-2 border-t border-zinc-800 text-[10px] text-emerald-400 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>P2P SYNCED (READY)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Shared Terminal Sub-Channel Form */}
      <div className="p-4 rounded border border-zinc-800 bg-zinc-900/40 flex flex-col gap-3">
        <span className="font-bold text-zinc-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" /> BROADCAST TO HERDR OPERATORS
        </span>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type tactical message to party..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500 text-xs font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
