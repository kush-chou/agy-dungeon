import React from 'react';
import { Player, PartyMember, Room } from '../types/game';
import { Shield, Zap, Compass, Backpack, Wifi } from 'lucide-react';

interface SidebarProps {
  player: Player;
  currentRoom: Room;
  party: PartyMember[];
  onTriggerQuickAction: (action: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  player,
  currentRoom,
  party,
  onTriggerQuickAction,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const entropyPercent = Math.max(0, Math.min(100, player.entropy));

  return (
    <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-950/80 p-3 flex flex-col gap-4 text-xs font-mono select-none overflow-y-auto">
      {/* Player Vitals HUD */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div>
            <span className="font-bold text-cyan-300 text-sm">{player.name}</span>
            <div className="text-[10px] text-zinc-400">{player.className} • LVL {player.level}</div>
          </div>
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold text-[10px]">
            SCORE: {player.score}
          </span>
        </div>

        {/* HP Bar */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-zinc-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-red-400" /> VITALITY (HP)
            </span>
            <span className="font-bold text-red-300">{player.hp} / {player.maxHp}</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Entropy / Void Bar */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-zinc-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> ENTROPY GAUGE
            </span>
            <span className="font-bold text-amber-300">{player.entropy}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
            <div
              className={`h-full transition-all duration-300 ${
                entropyPercent > 70
                  ? 'bg-red-500 animate-pulse'
                  : entropyPercent > 40
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${entropyPercent}%` }}
            />
          </div>
          <p className="text-[9px] text-zinc-500 mt-1">High entropy shifts stochastic dice rolls toward [NULL].</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
          <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800 flex justify-between">
            <span className="text-zinc-400">Strength:</span>
            <span className="text-zinc-200 font-bold">{player.stats.strength}</span>
          </div>
          <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800 flex justify-between">
            <span className="text-zinc-400">Mind:</span>
            <span className="text-zinc-200 font-bold">{player.stats.mind}</span>
          </div>
          <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800 flex justify-between">
            <span className="text-cyan-400">Gravity:</span>
            <span className="text-cyan-200 font-bold">+{player.stats.gravity}</span>
          </div>
          <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-800 flex justify-between">
            <span className="text-amber-400">Void Res:</span>
            <span className="text-amber-200 font-bold">{player.stats.voidResistance}%</span>
          </div>
        </div>
      </div>

      {/* ASCII Spire Mini-Map */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-zinc-400 text-xs border-b border-zinc-800 pb-1">
          <span className="flex items-center gap-1 font-semibold text-zinc-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400" /> SPIRE TELEMETRY
          </span>
          <span className="text-[10px] text-zinc-500">FLOOR {currentRoom.floor}/5</span>
        </div>

        <pre className="text-[10px] leading-tight text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-800/80 overflow-x-auto font-mono">
{`   [THRONE: F5]    ${currentRoom.id === 'throne' ? '<-- YOU (@)' : ''}
        |
   [CATHEDRAL: F4] ${currentRoom.id === 'cathedral' ? '<-- YOU (@)' : ''}
        |
   [SIPHON: F3]    ${currentRoom.id === 'siphon' ? '<-- YOU (@)' : ''}
        |
   [ARCHIVES: F2]  ${currentRoom.id === 'archives' ? '<-- YOU (@)' : ''}
        |
   [GATEWAY: F1]   ${currentRoom.id === 'gate' ? '<-- YOU (@)' : ''}`}
        </pre>

        <div className="text-[11px] text-zinc-300">
          <span className="text-zinc-500">Current Node:</span>{' '}
          <span className="font-semibold text-cyan-300">{currentRoom.name}</span>
        </div>

        {/* Exits */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentRoom.exits.map((exit, idx) => (
            <button
              key={idx}
              onClick={() => onTriggerQuickAction(`go ${exit.split(':')[0].trim()}`)}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-[10px] text-zinc-200 transition-colors"
            >
              ➔ {exit}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-zinc-400 text-xs border-b border-zinc-800 pb-1">
          <span className="flex items-center gap-1 font-semibold text-zinc-300">
            <Backpack className="w-3.5 h-3.5 text-amber-400" /> INVENTORY ({player.inventory.length}/8)
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {player.inventory.map((item, idx) => (
            <div
              key={idx}
              className="px-2 py-1 bg-zinc-950 border border-zinc-800/80 rounded flex items-center justify-between text-[11px]"
            >
              <span className="text-zinc-300">{item}</span>
              <button
                onClick={() => onTriggerQuickAction(`use ${item}`)}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 underline"
              >
                USE
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Herdr P2P Multiplexer Party */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-zinc-400 text-xs border-b border-zinc-800 pb-1">
          <span className="flex items-center gap-1 font-semibold text-zinc-300">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> HERDR PARTY CLUSTER
          </span>
          <span className="text-[10px] text-emerald-400">4 ONLINE</span>
        </div>

        <div className="flex flex-col gap-1.5 text-[10px]">
          {party.map((member) => (
            <div
              key={member.id}
              className="p-1.5 bg-zinc-950 border border-zinc-800/80 rounded flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-zinc-200">{member.name}</span>
                <span className="text-zinc-500 ml-1">({member.role})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-mono">{member.hp}/{member.maxHp}</span>
                <span className="text-emerald-400 font-mono">{member.ping}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
