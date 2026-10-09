import React, { useState } from 'react';
import { PartyMember } from '../types/game';
import { X, Copy, Check, Users, Shield, Share2 } from 'lucide-react';

interface LobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: PartyMember[];
  sessionId: string;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  isOpen,
  onClose,
  party,
  sessionId,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = window.location.origin ? `${window.location.origin}/?session=${sessionId}` : `https://agy-dungeon.com/?session=${sessionId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-lg p-5 flex flex-col gap-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-zinc-100 text-sm">HERDR SHARED TERMINAL LOBBY</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multiplexer Explainer */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded">
          <p className="text-zinc-300 leading-relaxed text-[11px]">
            <strong>Unified TUI Broadcast:</strong> All players connected to this session view the exact same terminal buffer via a Rust-based multiplexer protocol (Herdr / Zellij). When anyone triggers a Jev dice roll, the outcome reverberates across all viewports in real-time.
          </p>
        </div>

        {/* Share Link */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 font-semibold flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-cyan-400" /> SESSION INVITATION LINK
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 font-mono text-xs select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold flex items-center gap-1 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Active Party Members */}
        <div className="flex flex-col gap-2">
          <span className="text-zinc-400 font-semibold flex items-center justify-between">
            <span>ACTIVE OPERATORS ({party.length}/8 MAX)</span>
            <span className="text-emerald-400 text-[10px]">P2P MESH CONNECTED</span>
          </span>

          <div className="flex flex-col gap-1.5">
            {party.map((m) => (
              <div
                key={m.id}
                className="p-2.5 bg-zinc-900/50 border border-zinc-800/80 rounded flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-zinc-200">{m.name}</span>
                  <span className="text-zinc-500 text-[10px]">[{m.role}]</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-red-400" /> {m.hp}/{m.maxHp}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-[10px]">
                    {m.ping}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase transition-all"
        >
          Return to Dungeon Terminal &gt;
        </button>
      </div>
    </div>
  );
};
