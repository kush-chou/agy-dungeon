import React, { useState } from 'react';
import { AIConfig, AIProvider, TerminalTheme, Player } from '../types/game';
import { X, Cpu, Palette, User, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiConfig: AIConfig;
  onSaveAIConfig: (cfg: AIConfig) => void;
  theme: TerminalTheme;
  setTheme: (t: TerminalTheme) => void;
  crtEnabled: boolean;
  setCrtEnabled: (v: boolean) => void;
  player: Player;
  onUpdatePlayer: (name: string, className: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aiConfig,
  onSaveAIConfig,
  theme,
  setTheme,
  crtEnabled,
  setCrtEnabled,
  player,
  onUpdatePlayer,
}) => {
  const [provider, setProvider] = useState<AIProvider>(aiConfig.provider);
  const [apiKey, setApiKey] = useState(aiConfig.apiKey);
  const [model, setModel] = useState(aiConfig.model);
  const [customEndpoint, setCustomEndpoint] = useState(aiConfig.customEndpoint || '');
  const [playerName, setPlayerName] = useState(player.name);
  const [playerClass, setPlayerClass] = useState(player.className);
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAIConfig({
      provider,
      apiKey,
      model,
      customEndpoint: customEndpoint.trim() || undefined,
    });
    onUpdatePlayer(playerName, playerClass);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-lg p-5 flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-zinc-100 text-sm">AGY DUNGEON CONFIGURATION</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Section: Bring Your Own AI */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> BRING-YOUR-OWN-AI (JEV RUNTIME)
              </span>
              <span className="text-[10px] text-zinc-500">System-1 DM Engine</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Run entirely on-device (Ollama / Localhost), use our zero-latency built-in engine, or plug in your personal API keys for unrestricted dynamic narration.
            </p>

            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {(['builtin', 'gemini', 'openai', 'groq', 'ollama'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={`p-2 rounded border text-center transition-all ${
                    provider === p
                      ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold shadow-glow-amber'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="capitalize">{p === 'builtin' ? 'System 1 (Built-in)' : p}</div>
                </button>
              ))}
            </div>

            {provider !== 'builtin' && (
              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                {provider !== 'ollama' && (
                  <div>
                    <label className="text-zinc-400 block mb-1">API Key:</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter ${provider.toUpperCase()} API Key`}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[9px] text-zinc-600">Stored safely in your browser session only.</span>
                  </div>
                )}

                <div>
                  <label className="text-zinc-400 block mb-1">Model Name:</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={
                      provider === 'gemini'
                        ? 'gemini-1.5-flash'
                        : provider === 'groq'
                        ? 'llama-3.3-70b-versatile'
                        : provider === 'ollama'
                        ? 'llama3'
                        : 'gpt-4o-mini'
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {provider === 'ollama' && (
                  <div>
                    <label className="text-zinc-400 block mb-1">Localhost URL (Ollama endpoint):</label>
                    <input
                      type="text"
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                      placeholder="http://localhost:11434/api/generate"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Character Identification */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded flex flex-col gap-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> PLAYER AVATAR &amp; TELEMETRY
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-400 block mb-1">Callsign:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Class:</label>
                <select
                  value={playerClass}
                  onChange={(e) => setPlayerClass(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                >
                  <option value="Cyber-Paladin">Cyber-Paladin</option>
                  <option value="Void-Weaver">Void-Weaver</option>
                  <option value="Gravity-Monk">Gravity-Monk</option>
                  <option value="Rogue-Hacker">Rogue-Hacker</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Display & CRT */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded flex flex-col gap-2">
            <span className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" /> TUI THEME &amp; CRT EMULATION
            </span>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">CRT Scanlines &amp; Phosphor Curve:</span>
              <button
                type="button"
                onClick={() => setCrtEnabled(!crtEnabled)}
                className={`px-3 py-1 rounded font-bold border transition-colors ${
                  crtEnabled
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                {crtEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['obsidian', 'matrix', 'amber', 'cyber'] as TerminalTheme[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`p-1.5 rounded border text-center uppercase text-[10px] ${
                    theme === t
                      ? 'bg-zinc-800 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all"
          >
            {savedToast ? <Check className="w-4 h-4" /> : null}
            {savedToast ? 'SETTINGS APPLIED!' : 'SAVE & APPLY CONFIG'}
          </button>
        </form>
      </div>
    </div>
  );
};
