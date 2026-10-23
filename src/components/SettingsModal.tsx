import React, { useState, useEffect } from 'react';
import { AIConfig, AIProvider, TerminalTheme, Player } from '../types/game';
import { webllmEngine, ModelLoadProgress } from '../utils/webllmEngine';
import { X, Cpu, Palette, User, Check, Sparkles, HardDrive } from 'lucide-react';

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
  const [temperature, setTemperature] = useState<number>(aiConfig.temperature || 0.8);
  const [playerName, setPlayerName] = useState(player.name);
  const [playerClass, setPlayerClass] = useState(player.className);
  const [savedToast, setSavedToast] = useState(false);

  // WebLLM State
  const [hasWebGPU, setHasWebGPU] = useState<boolean>(false);
  const [loadingWebLLM, setLoadingWebLLM] = useState<boolean>(false);
  const [webllmProgress, setWebllmProgress] = useState<ModelLoadProgress | null>(null);
  const [webllmLoaded, setWebllmLoaded] = useState<boolean>(webllmEngine.getIsLoaded());

  useEffect(() => {
    webllmEngine.checkWebGPUSupport().then(setHasWebGPU);
    setWebllmLoaded(webllmEngine.getIsLoaded());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInitWebLLM = async () => {
    setLoadingWebLLM(true);
    try {
      await webllmEngine.loadModel('SmolLM2-135M-Instruct-q0f16-MLC', (progress) => {
        setWebllmProgress(progress);
      });
      setWebllmLoaded(true);
      setProvider('webllm');
    } catch (err: any) {
      alert('WebLLM initialization failed: ' + (err?.message || 'Check WebGPU support'));
    } finally {
      setLoadingWebLLM(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAIConfig({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      customEndpoint: customEndpoint.trim() || undefined,
      temperature,
    });
    onUpdatePlayer(playerName.trim() || 'Operator', playerClass);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
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
                <Cpu className="w-3.5 h-3.5" /> JEV SYSTEM-1 RUNTIME ENGINE
              </span>
              <span className="text-[10px] text-zinc-500">Local or BYO Model</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Run on-device directly via WebGPU, zero-latency built-in System-1, or plug in your cloud model API keys.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1">
              {(
                [
                  { id: 'builtin', label: 'System 1 (Edge)' },
                  { id: 'webllm', label: 'WebGPU (Local)' },
                  { id: 'gemini', label: 'Gemini' },
                  { id: 'openai', label: 'OpenAI' },
                  { id: 'groq', label: 'Groq' },
                  { id: 'anthropic', label: 'Claude' },
                  { id: 'deepseek', label: 'DeepSeek' },
                  { id: 'ollama', label: 'Ollama' },
                ] as { id: AIProvider; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProvider(item.id)}
                  className={`p-2 rounded border text-center transition-all text-[11px] ${
                    provider === item.id
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-glow-amber'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div>{item.label}</div>
                </button>
              ))}
            </div>

            {/* WebGPU On-Device Engine Status */}
            {provider === 'webllm' && (
              <div className="p-3 bg-purple-950/20 border border-purple-800/60 rounded flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" /> WebGPU On-Device AI
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {hasWebGPU ? '✓ WebGPU Ready' : '✗ No WebGPU Support'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Runs lightweight model (SmolLM2-135M) entirely in your browser GPU cache without sending any data over the internet.
                </p>

                {webllmProgress && loadingWebLLM && (
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>Downloading model weights:</span>
                      <span>{webllmProgress.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-200"
                        style={{ width: `${webllmProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleInitWebLLM}
                  disabled={loadingWebLLM || !hasWebGPU}
                  className="py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase disabled:opacity-40 transition-colors"
                >
                  {webllmLoaded
                    ? '✓ Model Loaded in WebGPU'
                    : loadingWebLLM
                    ? 'Loading Model Weights...'
                    : 'Download & Initialize Model (35MB)'}
                </button>
              </div>
            )}

            {/* API Key Form for Cloud Providers */}
            {provider !== 'builtin' && provider !== 'webllm' && (
              <div className="space-y-2 pt-2 border-t border-zinc-800/60 mt-1">
                {provider !== 'ollama' && (
                  <div>
                    <label className="text-zinc-400 block mb-1">API Key:</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter ${provider.toUpperCase()} API Key`}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                    />
                    <span className="text-[9px] text-zinc-600">Saved in browser session only. Never logged.</span>
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
                        : provider === 'deepseek'
                        ? 'deepseek-chat'
                        : provider === 'anthropic'
                        ? 'claude-3-5-sonnet-20241022'
                        : provider === 'ollama'
                        ? 'llama3'
                        : 'gpt-4o-mini'
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
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
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Temperature / Variance:</span>
                    <span className="text-amber-400 font-bold">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Player Avatar & Telemetry */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded flex flex-col gap-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> OPERATOR PROFILE &amp; CLASS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-400 block mb-1">Callsign:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Class Archetype:</label>
                <select
                  value={playerClass}
                  onChange={(e) => setPlayerClass(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-200 text-xs font-mono"
                >
                  <option value="Cyber-Paladin">Cyber-Paladin (+Strength)</option>
                  <option value="Void-Weaver">Void-Weaver (+Void Res)</option>
                  <option value="Gravity-Monk">Gravity-Monk (+Gravity)</option>
                  <option value="Rogue-Hacker">Rogue-Hacker (+Mind)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Display & Themes */}
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

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {(['obsidian', 'matrix', 'amber', 'cyber', 'sol'] as TerminalTheme[]).map((t) => (
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
            {savedToast ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {savedToast ? 'CONFIG APPLIED!' : 'APPLY CONFIGURATION'}
          </button>
        </form>
      </div>
    </div>
  );
};
