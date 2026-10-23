import React from 'react';
import { Volume2, VolumeX, Monitor, Settings, Users, Terminal as TerminalIcon, Sparkles, BookOpen, Radio, Copy, Check } from 'lucide-react';
import { TerminalTheme, AIConfig } from '../types/game';

interface HeaderBarProps {
  activeTab: 'dungeon' | 'stream' | 'party' | 'codex';
  setActiveTab: (tab: 'dungeon' | 'stream' | 'party' | 'codex') => void;
  crtEnabled: boolean;
  setCrtEnabled: (v: boolean) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  ambientActive: boolean;
  onToggleAmbient: () => void;
  theme: TerminalTheme;
  setTheme: (t: TerminalTheme) => void;
  onOpenSettings: () => void;
  onOpenLobby: () => void;
  aiConfig: AIConfig;
  roomCode: string;
  peerCount: number;
  networkStatus: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  setActiveTab,
  crtEnabled,
  setCrtEnabled,
  isMuted,
  onToggleMute,
  ambientActive,
  onToggleAmbient,
  theme,
  setTheme,
  onOpenSettings,
  onOpenLobby,
  aiConfig,
  roomCode,
  peerCount,
  networkStatus,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?session=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 select-none sticky top-0 z-30">
      {/* Brand & Zellij-style Session Header */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-cyan-400">
          <TerminalIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">AGY-DUNGEON //</span>
          <span className="text-amber-400 font-black">GRANDMASTER JEV</span>
        </div>

        {/* Live Multiplayer Status Bar */}
        <div
          onClick={onOpenLobby}
          title={`Herdr Network: ${networkStatus} (Click to manage session)`}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 cursor-pointer transition-colors"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              peerCount > 0 ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
            }`}
          />
          <span className="font-mono text-[11px] font-semibold text-emerald-400 uppercase">
            {roomCode ? `HERDR://${roomCode}` : 'STANDALONE'}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 text-[10px]">
            {peerCount > 0 ? `${peerCount} PEER${peerCount > 1 ? 'S' : ''}` : 'SOLO'}
          </span>
        </div>

        {roomCode && (
          <button
            onClick={handleCopyLink}
            title="Copy invite URL to clipboard"
            className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'COPIED' : 'INVITE'}</span>
          </button>
        )}
      </div>

      {/* Multiplexer Tabs */}
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs font-mono overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('dungeon')}
          className={`px-2.5 sm:px-3 py-1 rounded transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dungeon'
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-glow-cyan'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>1:</span>
          <span>Dungeon TUI</span>
        </button>

        <button
          onClick={() => setActiveTab('stream')}
          className={`px-2.5 sm:px-3 py-1 rounded transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'stream'
              ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-glow-amber'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>2:</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Jev Stream
          </span>
        </button>

        <button
          onClick={() => setActiveTab('party')}
          className={`px-2.5 sm:px-3 py-1 rounded transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'party'
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shadow-glow-green'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>3:</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-400" />
            Party ({peerCount + 1})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('codex')}
          className={`px-2.5 sm:px-3 py-1 rounded transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'codex'
              ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>4:</span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-purple-400" />
            Codex
          </span>
        </button>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* AI Provider Status Pill */}
        <button
          onClick={onOpenSettings}
          title="Configure Bring-Your-Own-AI runtime"
          className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-zinc-300 text-[11px] transition-colors"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              aiConfig.provider === 'webllm'
                ? 'bg-purple-400 animate-pulse'
                : aiConfig.provider === 'builtin'
                ? 'bg-cyan-400'
                : 'bg-amber-400'
            }`}
          />
          <span>AI:</span>
          <span className="font-semibold text-cyan-300 uppercase">
            {aiConfig.provider === 'builtin'
              ? 'System-1 Edge'
              : aiConfig.provider === 'webllm'
              ? 'WebGPU On-Device'
              : aiConfig.provider}
          </span>
        </button>

        {/* Theme Cycle */}
        <button
          onClick={() => {
            const themes: TerminalTheme[] = ['obsidian', 'matrix', 'amber', 'cyber', 'sol'];
            const next = themes[(themes.indexOf(theme) + 1) % themes.length];
            setTheme(next);
          }}
          title="Switch Color Theme"
          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 text-[11px] uppercase font-mono"
        >
          🎨 {theme}
        </button>

        {/* Ambient Drone Toggle */}
        <button
          onClick={onToggleAmbient}
          title={`Ambient Spire Drone: ${ambientActive ? 'ON' : 'OFF'}`}
          className={`p-1.5 rounded border transition-colors ${
            ambientActive
              ? 'bg-purple-950/60 border-purple-500 text-purple-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
        </button>

        {/* CRT Scanline Toggle */}
        <button
          onClick={() => setCrtEnabled(!crtEnabled)}
          title={`CRT Scanlines & Phosphor: ${crtEnabled ? 'ON' : 'OFF'}`}
          className={`p-1.5 rounded border transition-colors ${
            crtEnabled
              ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute 8-bit Audio' : 'Mute Audio'}
          className={`p-1.5 rounded border transition-colors ${
            !isMuted
              ? 'bg-amber-950/60 border-amber-500 text-amber-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Multiplayer Lobby Button */}
        <button
          onClick={onOpenLobby}
          title="Share Herdr Multiplayer Session"
          className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 rounded flex items-center gap-1 font-medium transition-colors"
        >
          <Users className="w-3 h-3" />
          <span className="hidden sm:inline">Multiplayer</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Engine & AI Settings"
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
