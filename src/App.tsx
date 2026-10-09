import React, { useState, useEffect } from 'react';
import { Player, PartyMember, Room, LogEntry, AIConfig, TerminalTheme, DiceOutcome, ChoiceOption } from './types/game';
import { INITIAL_ROOMS, rollJevDice, generateJevResponse, generateBranchingChoices } from './utils/jevEngine';
import { audio } from './utils/audio';
import { HeaderBar } from './components/HeaderBar';
import { TerminalView } from './components/TerminalView';
import { Sidebar } from './components/Sidebar';
import { JevStreamView } from './components/JevStreamView';
import { PartyView } from './components/PartyView';
import { SettingsModal } from './components/SettingsModal';
import { LobbyModal } from './components/LobbyModal';
import { DiceRollOverlay } from './components/DiceRollOverlay';

export const App: React.FC = () => {
  // Theme & CRT state
  const [theme, setTheme] = useState<TerminalTheme>('obsidian');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(audio.isMuted());

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dungeon' | 'stream' | 'party'>('dungeon');

  // Modals
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [lobbyOpen, setLobbyOpen] = useState<boolean>(false);
  const [diceOverlay, setDiceOverlay] = useState<{ outcome: DiceOutcome | null; value: number | null }>({
    outcome: null,
    value: null,
  });

  // AI Configuration
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('agy_ai_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      provider: 'builtin',
      apiKey: '',
      model: 'gemini-1.5-flash',
    };
  });

  // Player state
  const [player, setPlayer] = useState<Player>({
    id: 'p_host',
    name: 'Kush',
    className: 'Cyber-Paladin',
    hp: 85,
    maxHp: 100,
    entropy: 24,
    inventory: ['Quantum Grav-Hook', 'Stasis Stimpack', 'Resonant Tuning Fork'],
    stats: {
      strength: 14,
      mind: 16,
      gravity: 5,
      voidResistance: 25,
    },
    level: 1,
    score: 350,
  });

  // Rooms and World state
  const [currentRoom, setCurrentRoom] = useState<Room>(INITIAL_ROOMS.gate);

  // Party state (Herdr multiplayer cluster)
  const [party] = useState<PartyMember[]>([
    { id: 'm1', name: 'Cipher_0x', role: 'Void Weaver', hp: 60, maxHp: 75, isReady: true, ping: 14 },
    { id: 'm2', name: 'Vex_Drift', role: 'Infiltrator', hp: 80, maxHp: 80, isReady: true, ping: 22 },
    { id: 'm3', name: 'Aegis_Prime', role: 'Gravity Monk', hp: 95, maxHp: 110, isReady: true, ping: 18 },
  ]);

  // Terminal Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init_1',
      timestamp: '00:00:01',
      type: 'system',
      content: 'HERDR MESH INITIALIZED. Terminal multiplexer connected to session://7A9F. 4 nodes active.',
    },
    {
      id: 'init_2',
      timestamp: '00:00:02',
      type: 'narrative',
      speaker: 'JEV SYSTEM-1',
      content: 'Welcome to AGY Dungeon. I am Jev, the Grandmaster Engine. I govern all reality across three states: [NULL], [CHOICE], and [RADIANT]. Prepare your actions.',
    },
    {
      id: 'init_3',
      timestamp: '00:00:03',
      type: 'system',
      content: `LOCATION: ${INITIAL_ROOMS.gate.name} (Floor 1). ${INITIAL_ROOMS.gate.description}`,
    },
  ]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Periodic ambient party chatter in terminal
  useEffect(() => {
    const ambientQuotes = [
      { speaker: 'Cipher_0x', text: 'Telemetry checks out. Gravitational flux stable.' },
      { speaker: 'Vex_Drift', text: 'Keep your entropy below 60% or Jev will force a Null collapse.' },
      { speaker: 'Aegis_Prime', text: 'Ready for the next chamber whenever you are, Host.' },
    ];

    const timer = setInterval(() => {
      // 20% chance to drop ambient party message every 30 seconds
      if (Math.random() < 0.25) {
        const quote = ambientQuotes[Math.floor(Math.random() * ambientQuotes.length)];
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [
          ...prev,
          {
            id: `party_${Date.now()}`,
            timestamp: time,
            type: 'party',
            speaker: quote.speaker,
            content: quote.text,
          },
        ]);
      }
    }, 28000);

    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  const handleSaveAIConfig = (cfg: AIConfig) => {
    setAiConfig(cfg);
    localStorage.setItem('agy_ai_config', JSON.stringify(cfg));
  };

  const handleUpdatePlayer = (name: string, className: string) => {
    setPlayer((prev) => ({ ...prev, name, className }));
  };

  // Dispatch dice roll
  const handleRollDice = async (customActionDesc?: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    audio.playDiceRattle();

    const result = rollJevDice(player);

    // Show suspense overlay
    setDiceOverlay({ outcome: result.outcome, value: result.rollValue });

    // Play outcome audio
    if (result.outcome === 'null') audio.playNullSound();
    else if (result.outcome === 'choice') audio.playChoiceSound();
    else audio.playRadiantSound();

    const timestamp = new Date().toLocaleTimeString();

    // Narrative generation
    const actionLabel = customActionDesc || 'Stochastic Roll';
    const narration = await generateJevResponse(
      actionLabel,
      player,
      currentRoom,
      result.outcome,
      aiConfig
    );

    // Apply outcome effects to player vitals
    setPlayer((prev) => {
      let hp = prev.hp;
      let entropy = prev.entropy;
      let score = prev.score + 25;
      const inventory = [...prev.inventory];

      if (result.outcome === 'null') {
        hp = Math.max(10, hp - 12);
        entropy = Math.min(100, entropy + 15);
      } else if (result.outcome === 'choice') {
        entropy = Math.min(100, entropy + 5);
      } else if (result.outcome === 'radiant') {
        hp = Math.min(prev.maxHp, hp + 20);
        entropy = Math.max(0, entropy - 20);
        score += 150;
        if (narration.radiantLoot && !inventory.includes(narration.radiantLoot)) {
          inventory.push(narration.radiantLoot);
        }
      }

      return { ...prev, hp, entropy, score, inventory };
    });

    const choices = result.outcome === 'choice' ? generateBranchingChoices(actionLabel) : undefined;

    setLogs((prev) => [
      ...prev,
      {
        id: `dice_${Date.now()}`,
        timestamp,
        type: 'dice',
        outcome: result.outcome,
        content: `Roll Result: ${result.rollValue}/100. ${result.description}`,
      },
      {
        id: `nar_${Date.now()}`,
        timestamp,
        type: 'narrative',
        speaker: 'JEV SYSTEM-1',
        content: narration.text,
        choices,
        radiantBonus: narration.radiantLoot,
      },
    ]);

    setIsProcessing(false);
  };

  // Command router
  const handleSendCommand = async (cmd: string) => {
    const raw = cmd.toLowerCase().trim();
    const timestamp = new Date().toLocaleTimeString();

    // Echo player's command in terminal
    setLogs((prev) => [
      ...prev,
      {
        id: `cmd_${Date.now()}`,
        timestamp,
        type: 'player',
        speaker: player.name,
        content: cmd,
      },
    ]);

    // Handle standard commands
    if (raw === 'help') {
      setLogs((prev) => [
        ...prev,
        {
          id: `help_${Date.now()}`,
          timestamp,
          type: 'system',
          content: `AGY DUNGEON COMMAND MATRIX:
• roll              - Trigger Jev System-1 tri-state stochastic dice ([NULL], [CHOICE], [RADIANT])
• look              - Inspect current room anomalies, telemetry, and exits
• attack            - Strike room hostile entity (Sentinel / Jev Avatar)
• cast antigravity  - Channel antigravity wave to cleanse biological entropy
• go <direction>    - Navigate through Spire (north, south, east, west)
• use <item>        - Consume an inventory resource (e.g., 'use Stasis Stimpack')
• party             - Display active Herdr multiplexer operators
• clear             - Flush terminal scrollback buffer
• Any custom text   - Custom actions are evaluated directly by Grandmaster Jev!`,
        },
      ]);
      return;
    }

    if (raw === 'clear') {
      setLogs([]);
      return;
    }

    if (raw === 'party') {
      setActiveTab('party');
      return;
    }

    if (raw === 'look') {
      setLogs((prev) => [
        ...prev,
        {
          id: `look_${Date.now()}`,
          timestamp,
          type: 'system',
          content: `[ROOM TELEMETRY]: Floor ${currentRoom.floor} - ${currentRoom.name}
Description: ${currentRoom.description}
Exits: ${currentRoom.exits.join(' | ')}
Hazards: ${currentRoom.hazards?.join(', ') || 'None detected'}
Hostiles: ${currentRoom.enemy ? `${currentRoom.enemy.name} (${currentRoom.enemy.hp}/${currentRoom.enemy.maxHp} HP)` : 'Clear'}`,
        },
      ]);
      return;
    }

    if (raw === 'attack') {
      audio.playHitSound();
      if (!currentRoom.enemy) {
        setLogs((prev) => [
          ...prev,
          {
            id: `atk_${Date.now()}`,
            timestamp,
            type: 'system',
            content: 'No hostile signatures detected in this quadrant. Target the air? Jev is not amused.',
          },
        ]);
        return;
      }

      await handleRollDice(`Engage in combat against ${currentRoom.enemy.name}`);
      return;
    }

    if (raw === 'cast' || raw.includes('cast')) {
      audio.playRadiantSound();
      setPlayer((prev) => ({
        ...prev,
        entropy: Math.max(0, prev.entropy - 15),
      }));
      await handleRollDice('Cast high-frequency Antigravity Pulse to warp chamber physics');
      return;
    }

    if (raw.startsWith('use ')) {
      const itemName = cmd.slice(4).trim();
      const hasItem = player.inventory.some((i) => i.toLowerCase().includes(itemName.toLowerCase()));

      if (hasItem) {
        audio.playRadiantSound();
        setPlayer((prev) => ({
          ...prev,
          hp: Math.min(prev.maxHp, prev.hp + 25),
          entropy: Math.max(0, prev.entropy - 15),
          inventory: prev.inventory.filter((i) => !i.toLowerCase().includes(itemName.toLowerCase())),
        }));
        setLogs((prev) => [
          ...prev,
          {
            id: `use_${Date.now()}`,
            timestamp,
            type: 'system',
            content: `Activated ${itemName}. Restored 25 HP and vented 15% Entropy!`,
          },
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: `use_${Date.now()}`,
            timestamp,
            type: 'system',
            content: `Item "${itemName}" not found in inventory manifold.`,
          },
        ]);
      }
      return;
    }

    // Room Navigation
    if (raw.startsWith('go ') || ['north', 'south', 'east', 'west'].includes(raw)) {
      const targetDir = raw.startsWith('go ') ? raw.slice(3).trim() : raw;
      const validExit = currentRoom.exits.find((e) => e.toLowerCase().includes(targetDir));

      if (validExit) {
        audio.playKeypress();
        let nextRoomKey = 'gate';
        if (validExit.includes('archives')) nextRoomKey = 'archives';
        else if (validExit.includes('siphon')) nextRoomKey = 'siphon';
        else if (validExit.includes('cathedral')) nextRoomKey = 'cathedral';
        else if (validExit.includes('throne')) nextRoomKey = 'throne';
        else if (validExit.includes('gate')) nextRoomKey = 'gate';

        const nextRoom = INITIAL_ROOMS[nextRoomKey] || currentRoom;
        setCurrentRoom(nextRoom);

        setLogs((prev) => [
          ...prev,
          {
            id: `nav_${Date.now()}`,
            timestamp,
            type: 'system',
            content: `TRANSITIONING TO: ${nextRoom.name} (Floor ${nextRoom.floor}). ${nextRoom.description}`,
          },
        ]);
        return;
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: `nav_err_${Date.now()}`,
            timestamp,
            type: 'system',
            content: `Direction "${targetDir}" is obstructed by quantum forcefields. Available exits: ${currentRoom.exits.join(', ')}`,
          },
        ]);
        return;
      }
    }

    // Freeform command: Roll Jev stochastic dice on it!
    await handleRollDice(cmd);
  };

  const handleSelectChoice = async (choice: ChoiceOption) => {
    audio.playKeypress();
    const timestamp = new Date().toLocaleTimeString();

    setLogs((prev) => [
      ...prev,
      {
        id: `choice_select_${Date.now()}`,
        timestamp,
        type: 'player',
        speaker: player.name,
        content: `SELECTED GAMBIT: ${choice.label}`,
      },
    ]);

    await handleRollDice(`Executing dilemma gambit: "${choice.label}" (${choice.description})`);
  };

  const handleBroadcastPartyMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: `party_bcast_${Date.now()}`,
        timestamp,
        type: 'party',
        speaker: player.name,
        content: msg,
      },
    ]);
    setActiveTab('dungeon');
  };

  // Theme color styling
  const themeClasses: Record<TerminalTheme, string> = {
    obsidian: 'bg-[#08090d] text-zinc-200',
    matrix: 'bg-[#041008] text-emerald-400',
    amber: 'bg-[#120b02] text-amber-400',
    cyber: 'bg-[#060b14] text-cyan-300',
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses[theme]} ${crtEnabled ? 'crt-overlay crt-vignette' : ''}`}>
      {/* Top Header Multiplexer */}
      <HeaderBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        crtEnabled={crtEnabled}
        setCrtEnabled={setCrtEnabled}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenLobby={() => setLobbyOpen(true)}
        aiConfig={aiConfig}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Tab 1: Dungeon Terminal */}
        {activeTab === 'dungeon' && (
          <TerminalView
            logs={logs}
            currentRoom={currentRoom}
            onSendCommand={handleSendCommand}
            onSelectChoice={handleSelectChoice}
            isProcessing={isProcessing}
            onRollDice={() => handleRollDice('Stochastic Roll')}
          />
        )}

        {/* Tab 2: Jev Neural Stream */}
        {activeTab === 'stream' && (
          <JevStreamView player={player} aiConfig={aiConfig} />
        )}

        {/* Tab 3: Herdr Party Lobby */}
        {activeTab === 'party' && (
          <PartyView
            party={party}
            player={player}
            onBroadcastPartyMessage={handleBroadcastPartyMessage}
            onOpenLobby={() => setLobbyOpen(true)}
          />
        )}

        {/* Right Sidebar: Vitals, Map, Inventory, Party */}
        <Sidebar
          player={player}
          currentRoom={currentRoom}
          party={party}
          onTriggerQuickAction={handleSendCommand}
        />
      </div>

      {/* Dice Roll Suspense Overlay */}
      <DiceRollOverlay
        outcome={diceOverlay.outcome}
        rollValue={diceOverlay.value}
        onClose={() => setDiceOverlay({ outcome: null, value: null })}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        aiConfig={aiConfig}
        onSaveAIConfig={handleSaveAIConfig}
        theme={theme}
        setTheme={setTheme}
        crtEnabled={crtEnabled}
        setCrtEnabled={setCrtEnabled}
        player={player}
        onUpdatePlayer={handleUpdatePlayer}
      />

      {/* Lobby Modal */}
      <LobbyModal
        isOpen={lobbyOpen}
        onClose={() => setLobbyOpen(false)}
        party={party}
        sessionId="7A9F"
      />
    </div>
  );
};
