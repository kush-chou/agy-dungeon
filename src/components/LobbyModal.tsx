import React, { useState } from 'react';
import { PartyMember } from '../types/game';
import { X, Copy, Check, Users, Shield, Share2, Plus, ArrowRight, Wifi } from 'lucide-react';

interface LobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: PartyMember[];
  roomCode: string;
  isHost: boolean;
  peerCount: number;
  networkStatus: string;
  onHostNewRoom: () => void;
  onJoinRoom: (code: string) => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  isOpen,
  onClose,
  party,
  roomCode,
  isHost,
  peerCount,
  networkStatus,
  onHostNewRoom,
  onJoinRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?session=${roomCode}`
    : `https://agy-dungeon.com/?session=${roomCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my AGY Dungeon Session',
          text: `Join my Grandmaster Jev D&D party on room ${roomCode}!`,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInput.trim()) return;
    setIsJoining(true);
    onJoinRoom(joinInput.trim());
    setTimeout(() => setIsJoining(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-lg p-5 flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-zinc-100 text-sm">HERDR SHARED TERMINAL MULTIPLEXER</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multiplexer Explainer */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" /> P2P WEBRTC MESH PROTOCOL
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px]">
              {networkStatus}
            </span>
          </div>
          <p className="text-zinc-300 leading-relaxed text-[11px]">
            Connected operators view the exact same terminal buffer simultaneously. When any player rolls the Jev stochastic dice or moves through the Spire, all viewports update in real-time.
          </p>
        </div>

        {/* Current Room & Share Link */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" /> PARTY INVITATION LINK
            </span>
            <span className="text-[10px] text-cyan-400">ROOM: {roomCode.toUpperCase()}</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 font-mono text-xs select-all focus:outline-none"
            />
            <button
              onClick={handleNativeShare}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold flex items-center gap-1 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED' : 'SHARE'}
            </button>
          </div>
        </div>

        {/* Connect to Another Room */}
        <form onSubmit={handleJoinSubmit} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded flex flex-col gap-2">
          <span className="text-zinc-300 font-bold text-[11px]">SWITCH OR JOIN ANOTHER PARTY</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              placeholder="Enter Room Code (e.g. jev-4892)"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 text-xs font-mono uppercase focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!joinInput.trim() || isJoining}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold flex items-center gap-1 text-xs disabled:opacity-40 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>{isJoining ? 'Connecting...' : 'Join'}</span>
            </button>
            <button
              type="button"
              onClick={onHostNewRoom}
              title="Generate a brand new private room"
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </form>

        {/* Connected Party Members */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-zinc-400 font-semibold">
            <span>SYNCHRONIZED OPERATORS ({peerCount + 1}/8 MAX)</span>
            <span className="text-emerald-400 text-[10px]">
              {isHost ? 'YOU ARE HOST' : 'CLIENT MODE'}
            </span>
          </div>

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

        {/* Close Button */}
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
