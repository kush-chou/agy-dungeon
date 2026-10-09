import React, { useState, useRef, useEffect } from 'react';
import { LogEntry, ChoiceOption, Room } from '../types/game';
import { Terminal, Send, Sparkles, AlertTriangle, CheckCircle, Dices, Skull } from 'lucide-react';
import { audio } from '../utils/audio';

interface TerminalViewProps {
  logs: LogEntry[];
  currentRoom: Room;
  onSendCommand: (cmd: string) => void;
  onSelectChoice: (choice: ChoiceOption) => void;
  isProcessing: boolean;
  onRollDice: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  logs,
  currentRoom,
  onSendCommand,
  onSelectChoice,
  isProcessing,
  onRollDice,
}) => {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const commandHistoryRef = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isProcessing]);

  // Keep focus on input unless clicking on something else
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input.trim();
    commandHistoryRef.current.push(cmd);
    setHistoryIndex(-1);
    setInput('');
    audio.playKeypress();
    onSendCommand(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    audio.playKeypress();
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const history = commandHistoryRef.current;
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const history = commandHistoryRef.current;
      if (history.length === 0 || historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  };

  return (
    <div
      onClick={handleTerminalClick}
      className="flex-1 flex flex-col bg-black/60 relative overflow-hidden font-mono text-xs cursor-text"
    >
      {/* Terminal Output Log */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text"
      >
        {/* Welcome ASCII Banner */}
        <div className="text-zinc-500 border-b border-zinc-900 pb-3 font-mono">
          <pre className="text-cyan-400 font-bold text-[10px] sm:text-xs leading-none overflow-x-auto">
{`
    ___   ______  __   ____  __  ___   _________________  _   __
   /   | / ____/\\/ /  / __ \\/ / / / | / / ____/ ____/ __ \\/ | / /
  / /| |/ / __  / /  / / / / / / /  |/ / / __/ __/ / / / /  |/ / 
 / ___ / /_/ / / /  / /_/ / /_/ / /|  / /_/ / /___/ /_/ / /|  /  
/_/  |_\\____/ /_/  /_____/\\____/_/ |_/\\____/_____/\\____/_/ |_/   
       === GRANDMASTER JEV SYSTEM-1 MULTIPLAYER RPG ===
`}
          </pre>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-zinc-400">
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-300">
              STOCHASTIC ENGINE: [NULL] [CHOICE] [RADIANT]
            </span>
            <span className="text-zinc-600">•</span>
            <span>Type <code className="text-amber-300 font-bold">help</code> or <code className="text-cyan-300 font-bold">roll</code> to begin</span>
            <span className="text-zinc-600">•</span>
            <span>Mobile touch chips available below</span>
          </div>
        </div>

        {/* Current Room ASCII Display if present */}
        {currentRoom.asciiArt && (
          <div className="bg-zinc-950/80 p-2.5 rounded border border-zinc-800 text-cyan-300/90 overflow-x-auto">
            <pre className="text-[10px] leading-tight font-mono">{currentRoom.asciiArt}</pre>
          </div>
        )}

        {/* Dynamic Log Entries */}
        {logs.map((log) => (
          <div key={log.id} className="leading-relaxed flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 text-[10px]">{log.timestamp}</span>

              {log.type === 'system' && (
                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-semibold text-[10px]">
                  [SYSTEM]
                </span>
              )}

              {log.type === 'player' && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold text-[10px]">
                  &gt; {log.speaker || 'YOU'}
                </span>
              )}

              {log.type === 'narrative' && (
                <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold text-[10px] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> [JEV DM]
                </span>
              )}

              {log.type === 'party' && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-[10px]">
                  [HERDR // {log.speaker}]
                </span>
              )}

              {log.type === 'combat' && (
                <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 font-semibold text-[10px] flex items-center gap-1">
                  <Skull className="w-2.5 h-2.5" /> [COMBAT]
                </span>
              )}

              {log.outcome && (
                <span
                  className={`px-2 py-0.5 rounded font-black text-[10px] tracking-wide uppercase border flex items-center gap-1 ${
                    log.outcome === 'null'
                      ? 'bg-red-950 text-red-400 border-red-700 shadow-glow-red'
                      : log.outcome === 'choice'
                      ? 'bg-amber-950 text-amber-300 border-amber-600 shadow-glow-amber'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-glow-cyan animate-pulse'
                  }`}
                >
                  {log.outcome === 'null' && <AlertTriangle className="w-3 h-3" />}
                  {log.outcome === 'choice' && <Dices className="w-3 h-3" />}
                  {log.outcome === 'radiant' && <CheckCircle className="w-3 h-3" />}
                  TRI-STATE: [{log.outcome}]
                </span>
              )}
            </div>

            {/* Log Content */}
            <div
              className={`pl-2 border-l-2 ${
                log.type === 'player'
                  ? 'border-cyan-500 text-cyan-100 font-medium'
                  : log.type === 'narrative'
                  ? 'border-amber-500 text-amber-100/90'
                  : log.type === 'combat'
                  ? 'border-red-500 text-red-200'
                  : log.outcome === 'radiant'
                  ? 'border-cyan-400 text-cyan-200 glow-text-cyan'
                  : log.outcome === 'null'
                  ? 'border-red-600 text-red-300'
                  : 'border-zinc-800 text-zinc-300'
              }`}
            >
              {log.content}
            </div>

            {/* Radiant Loot Banner */}
            {log.radiantBonus && (
              <div className="mt-1 ml-2 p-2 bg-gradient-to-r from-cyan-950/80 to-amber-950/80 border border-cyan-500/50 rounded flex items-center gap-2 text-cyan-300">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>
                  <strong>RADIANT CACHE UNLOCKED:</strong> {log.radiantBonus} (Added to Inventory)
                </span>
              </div>
            )}

            {/* Interactive Choice Buttons if log contains ChoiceOption */}
            {log.choices && log.choices.length > 0 && (
              <div className="mt-2 ml-2 flex flex-col sm:flex-row gap-2">
                {log.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => onSelectChoice(choice)}
                    className="flex-1 p-2.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-amber-600/70 hover:border-amber-400 text-left transition-all hover:scale-[1.01] shadow-glow-amber group"
                  >
                    <div className="font-bold text-amber-400 group-hover:text-amber-300 flex items-center justify-between text-xs">
                      <span>{choice.label}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400">
                        RISK: {choice.risk}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{choice.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-amber-400 pl-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Grandmaster Jev is resolving System-1 decision matrix...</span>
          </div>
        )}
      </div>

      {/* Quick Action Chips (Mobile & Quick Play) */}
      <div className="border-t border-zinc-900 bg-zinc-950/90 px-3 py-2 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
        <button
          onClick={onRollDice}
          disabled={isProcessing}
          className="px-2.5 py-1.5 rounded bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-[11px] flex items-center gap-1 shrink-0 shadow-glow-amber transition-all disabled:opacity-50"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>ROLL JEV</span>
        </button>

        <button
          onClick={() => onSendCommand('attack')}
          disabled={isProcessing}
          className="px-2.5 py-1.5 rounded bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 font-semibold text-[11px] flex items-center gap-1 shrink-0 transition-all disabled:opacity-50"
        >
          <Skull className="w-3 h-3" />
          <span>Attack</span>
        </button>

        <button
          onClick={() => onSendCommand('look')}
          disabled={isProcessing}
          className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] shrink-0 transition-all disabled:opacity-50"
        >
          👁️ Look
        </button>

        <button
          onClick={() => onSendCommand('cast antigravity')}
          disabled={isProcessing}
          className="px-2.5 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[11px] shrink-0 transition-all disabled:opacity-50"
        >
          ⚡ Antigravity Surge
        </button>

        <button
          onClick={() => onSendCommand('loot')}
          disabled={isProcessing}
          className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] shrink-0 transition-all disabled:opacity-50"
        >
          📦 Scavenge
        </button>

        <button
          onClick={() => onSendCommand('help')}
          disabled={isProcessing}
          className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-[11px] shrink-0 transition-all disabled:opacity-50"
        >
          ❓ Help
        </button>
      </div>

      {/* Terminal Input Form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-800 bg-zinc-950 p-2.5 flex items-center gap-2"
      >
        <div className="flex items-center gap-1 text-cyan-400 font-bold select-none shrink-0 text-xs">
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">guest@agy-dungeon:~$</span>
          <span className="sm:hidden">&gt;</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          placeholder="Enter command or action ('roll', 'look', 'attack', 'cast', 'help')..."
          className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs font-mono"
        />

        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="p-1.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
