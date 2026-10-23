import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Player,
  PartyMember,
  Room,
  LogEntry,
  AIConfig,
  TerminalTheme,
  DiceOutcome,
  ChoiceOption,
} from './types/game';
import {
  INITIAL_ROOMS,
  rollJevDice,
  generateJevResponse,
  generateBranchingChoices,
  ITEMS_DATABASE,
} from './utils/jevEngine';
import { audio } from './utils/audio';
import { multiplayer, NetworkMessage } from './utils/multiplayer';
import { HeaderBar } from './components/HeaderBar';
import { TerminalView } from './components/TerminalView';
import { Sidebar } from './components/Sidebar';
import { JevStreamView } from './components/JevStreamView';
import { PartyView } from './components/PartyView';
import { CodexView } from './components/CodexView';
import { SettingsModal } from './components/SettingsModal';
import { LobbyModal } from './components/LobbyModal';
import { DiceRollOverlay } from './components/DiceRollOverlay';

export const App: React.FC = () => {
  // Theme & CRT state
  const [theme, setTheme] = useState<TerminalTheme>(() => {
    return (localStorage.getItem('agy_theme') as TerminalTheme) || 'obsidian';
  });
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(audio.isMuted());
  const [ambientActive, setAmbientActive] = useState<boolean>(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dungeon' | 'stream' | 'party' | 'codex'>('dungeon');

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
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      provider: 'builtin',
      apiKey: '',
      model: 'gemini-1.5-flash',
      temperature: 0.8,
    };
  });

  // Player state
  const [player, setPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem('agy_player_save');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      id: multiplayer.getPlayerId(),
      name: 'Kush',
      className: 'Cyber-Paladin',
      hp: 100,
      maxHp: 100,
      entropy: 15,
      inventory: ['Quantum Grav-Hook', 'Stasis Stimpack', 'Resonant Tuning Fork'],
      stats: {
        strength: 16,
        mind: 14,
        gravity: 6,
        voidResistance: 30,
      },
      level: 1,
      score: 350,
    };
  });

  // Rooms and World state
  const [rooms, setRooms] = useState<Record<string, Room>>(INITIAL_ROOMS);
  const [currentRoomId, setCurrentRoomId] = useState<string>('gate');
  const currentRoom = rooms[currentRoomId] || INITIAL_ROOMS.gate;

  // Multiplayer Network state
  const [roomCode, setRoomCode] = useState<string>('');
  const [peerCount, setPeerCount] = useState<number>(0);
  const [networkStatus, setNetworkStatus] = useState<string>('Initializing');
  const [isHost, setIsHost] = useState<boolean>(false);

  // Party state (Herdr multiplayer cluster)
  const [party, setParty] = useState<PartyMember[]>([
    { id: 'm1', name: 'Cipher_0x', role: 'Void Weaver', hp: 70, maxHp: 75, isReady: true, ping: 14 },
    { id: 'm2', name: 'Vex_Drift', role: 'Infiltrator', hp: 80, maxHp: 80, isReady: true, ping: 22 },
    { id: 'm3', name: 'Aegis_Prime', role: 'Gravity Monk', hp: 105, maxHp: 110, isReady: true, ping: 18 },
  ]);

  // Terminal Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init_1',
      timestamp: '00:00:01',
      type: 'system',
      content: 'HERDR MULTIPLEXER MESH ONLINE. Session buffer initialized.',
    },
    {
      id: 'init_2',
      timestamp: '00:00:02',
      type: 'narrative',
      speaker: 'JEV SYSTEM-1',
      content:
        'Welcome to AGY Dungeon. I am Jev, the System-One Grandmaster Engine. I govern all reality across three states: [NULL], [CHOICE], and [RADIANT]. Prepare your actions.',
    },
    {
      id: 'init_3',
      timestamp: '00:00:03',
      type: 'system',
      content: `LOCATION: ${INITIAL_ROOMS.gate.name} (Floor 1). ${INITIAL_ROOMS.gate.description}`,
    },
  ]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const playerRef = useRef(player);
  playerRef.current = player;

  // Setup WebRTC Multiplayer on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');

    const unsubscribeStatus = multiplayer.onStatusChange((status, count) => {
      setNetworkStatus(status);
      setPeerCount(count);
    });

    const unsubscribeMessage = multiplayer.onMessage((msg: NetworkMessage) => {
      handleRemoteNetworkMessage(msg);
    });

    if (sessionParam) {
      // Connect as client to requested room
      multiplayer.joinRoom(sessionParam, playerRef.current).then((success) => {
        if (success) {
          setRoomCode(sessionParam);
          setIsHost(false);
          addLogEntry({
            id: `net_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'system',
            content: `Connected to Herdr multiplayer session://${sessionParam.toUpperCase()}.`,
          });
        } else {
          // If join failed, host own room
          multiplayer.hostRoom().then((code) => {
            setRoomCode(code);
            setIsHost(true);
          });
        }
      });
    } else {
      // Start as host with new room
      multiplayer.hostRoom().then((code) => {
        setRoomCode(code);
        setIsHost(true);
      });
    }

    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
    };
  }, []);

  const handleRemoteNetworkMessage = (msg: NetworkMessage) => {
    if (msg.type === 'LOG_SYNC' && msg.payload) {
      setLogs((prev) => [...prev, msg.payload]);
    } else if (msg.type === 'CHAT_MESSAGE' && msg.payload) {
      setLogs((prev) => [
        ...prev,
        {
          id: `chat_${Date.now()}`,
          timestamp: msg.timestamp,
          type: 'party',
          speaker: msg.senderName,
          content: msg.payload.text,
        },
      ]);
    } else if (msg.type === 'DICE_EVENT' && msg.payload) {
      audio.playDiceRattle();
      setDiceOverlay({ outcome: msg.payload.outcome, value: msg.payload.rollValue });
      if (msg.payload.outcome === 'null') audio.playNullSound();
      else if (msg.payload.outcome === 'choice') audio.playChoiceSound();
      else audio.playRadiantSound();
    } else if (msg.type === 'ROOM_CHANGE' && msg.payload) {
      const targetRoom = msg.payload as Room;
      setCurrentRoomId(targetRoom.id);
      addLogEntry({
        id: `sync_nav_${Date.now()}`,
        timestamp: msg.timestamp,
        type: 'system',
        content: `${msg.senderName} transitioned party to: ${targetRoom.name} (Floor ${targetRoom.floor}).`,
      });
    } else if (msg.type === 'PLAYER_JOIN' && msg.payload) {
      const newPeerPlayer = msg.payload as Player;
      setParty((prev) => [
        ...prev.filter((p) => p.id !== newPeerPlayer.id),
        {
          id: newPeerPlayer.id,
          name: newPeerPlayer.name,
          role: newPeerPlayer.className,
          hp: newPeerPlayer.hp,
          maxHp: newPeerPlayer.maxHp,
          isReady: true,
          ping: 18,
          isPeer: true,
        },
      ]);
      addLogEntry({
        id: `peer_join_${Date.now()}`,
        timestamp: msg.timestamp,
        type: 'system',
        content: `Operator ${newPeerPlayer.name} (${newPeerPlayer.className}) linked to Herdr cluster.`,
      });
    } else if (msg.type === 'PLAYER_UPDATE' && msg.payload) {
      const updated = msg.payload as Player;
      setParty((prev) =>
        prev.map((m) =>
          m.id === updated.id ? { ...m, hp: updated.hp, maxHp: updated.maxHp, name: updated.name } : m
        )
      );
    }
  };

  const addLogEntry = useCallback((entry: LogEntry) => {
    setLogs((prev) => [...prev, entry]);
  }, []);

  // Ambient party chatter when in solo mode
  useEffect(() => {
    if (peerCount > 0) return; // In real multiplayer, real peers talk!

    const ambientQuotes = [
      { speaker: 'Cipher_0x', text: 'Telemetry checks out. Gravitational flux stable.' },
      { speaker: 'Vex_Drift', text: 'Keep your entropy below 60% or Jev will force a Null collapse.' },
      { speaker: 'Aegis_Prime', text: 'Ready for the next chamber whenever you are, Host.' },
      { speaker: 'Cipher_0x', text: 'Scan indicates high quantum coherence in the northern sector.' },
    ];

    const timer = setInterval(() => {
      if (Math.random() < 0.22) {
        const quote = ambientQuotes[Math.floor(Math.random() * ambientQuotes.length)];
        const time = new Date().toLocaleTimeString();
        addLogEntry({
          id: `party_${Date.now()}`,
          timestamp: time,
          type: 'party',
          speaker: quote.speaker,
          content: quote.text,
        });
      }
    }, 32000);

    return () => clearInterval(timer);
  }, [peerCount, addLogEntry]);

  // Audio Toggles
  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  const handleToggleAmbient = () => {
    const active = audio.toggleAmbientDrone();
    setAmbientActive(active);
  };

  // AI & Player Config
  const handleSaveAIConfig = (cfg: AIConfig) => {
    setAiConfig(cfg);
    localStorage.setItem('agy_ai_config', JSON.stringify(cfg));
  };

  const handleUpdatePlayer = (name: string, className: string) => {
    setPlayer((prev) => {
      const updated = { ...prev, name, className };
      multiplayer.broadcastPlayerState(updated);
      return updated;
    });
  };

  // Local Save / Load / Reset
  const handleSaveGame = () => {
    audio.playKeypress();
    localStorage.setItem('agy_player_save', JSON.stringify(player));
    localStorage.setItem('agy_room_save', currentRoomId);
    addLogEntry({
      id: `save_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      content: 'Expedition telemetry saved to browser local storage.',
    });
  };

  const handleResetGame = () => {
    audio.playKeypress();
    if (!confirm('Restart your Spire expedition from Floor 1?')) return;
    localStorage.removeItem('agy_player_save');
    localStorage.removeItem('agy_room_save');
    setCurrentRoomId('gate');
    setPlayer({
      id: multiplayer.getPlayerId(),
      name: player.name,
      className: player.className,
      hp: 100,
      maxHp: 100,
      entropy: 10,
      inventory: ['Quantum Grav-Hook', 'Stasis Stimpack', 'Resonant Tuning Fork'],
      stats: { strength: 16, mind: 14, gravity: 6, voidResistance: 30 },
      level: 1,
      score: 0,
    });
    setRooms(INITIAL_ROOMS);
    addLogEntry({
      id: `reset_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      content: 'Expedition rebooted. Basalt flagstones cold beneath your boots.',
    });
  };

  // Core Dice Roll Action
  const handleRollDice = async (customActionDesc?: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    audio.playDiceRattle();

    const result = rollJevDice(player);

    // Show suspense overlay
    setDiceOverlay({ outcome: result.outcome, value: result.rollValue });
    multiplayer.broadcastDiceRoll(result.outcome, result.rollValue, player.name);

    // Sound FX
    if (result.outcome === 'null') audio.playNullSound();
    else if (result.outcome === 'choice') audio.playChoiceSound();
    else audio.playRadiantSound();

    const timestamp = new Date().toLocaleTimeString();
    const actionLabel = customActionDesc || 'Stochastic Roll';

    // Narrative generation
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
        hp = Math.min(prev.maxHp, hp + 25);
        entropy = Math.max(0, entropy - 20);
        score += 150;
        if (narration.radiantLoot && !inventory.includes(narration.radiantLoot)) {
          inventory.push(narration.radiantLoot);
        }
      }

      const updated = { ...prev, hp, entropy, score, inventory };
      multiplayer.broadcastPlayerState(updated);
      return updated;
    });

    const choices = result.outcome === 'choice' ? generateBranchingChoices(actionLabel) : undefined;

    const diceLog: LogEntry = {
      id: `dice_${Date.now()}`,
      timestamp,
      type: 'dice',
      outcome: result.outcome,
      content: `Roll Result: ${result.rollValue}/100. ${result.description}`,
    };

    const narLog: LogEntry = {
      id: `nar_${Date.now()}`,
      timestamp,
      type: 'narrative',
      speaker: 'JEV SYSTEM-1',
      content: narration.text,
      choices,
      radiantBonus: narration.radiantLoot,
    };

    setLogs((prev) => [...prev, diceLog, narLog]);
    multiplayer.broadcastLog(diceLog, player.name);
    multiplayer.broadcastLog(narLog, 'JEV SYSTEM-1');

    setIsProcessing(false);
  };

  // Combat Execution
  const handleAttackEnemy = async () => {
    if (!currentRoom.enemy || currentRoom.enemy.hp <= 0) {
      addLogEntry({
        id: `atk_none_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        content: 'No hostile signatures detected in this quadrant.',
      });
      return;
    }

    setIsProcessing(true);
    audio.playHitSound();

    const enemy = currentRoom.enemy;
    const result = rollJevDice(player);
    const timestamp = new Date().toLocaleTimeString();

    setDiceOverlay({ outcome: result.outcome, value: result.rollValue });
    multiplayer.broadcastDiceRoll(result.outcome, result.rollValue, player.name);

    if (result.outcome === 'null') {
      audio.playNullSound();
      // Player misses and takes damage from enemy
      const damageTaken = enemy.damage;
      setPlayer((prev) => {
        const hp = Math.max(5, prev.hp - damageTaken);
        const entropy = Math.min(100, prev.entropy + 15);
        const updated = { ...prev, hp, entropy };
        multiplayer.broadcastPlayerState(updated);
        return updated;
      });

      addLogEntry({
        id: `atk_fail_${Date.now()}`,
        timestamp,
        type: 'combat',
        speaker: 'COMBAT',
        content: `STRIKE FAILED [NULL]. ${enemy.name} counters with ${enemy.attack}! You take ${damageTaken} damage.`,
      });
    } else {
      // Hit or Radiant Critical
      const isRadiant = result.outcome === 'radiant';
      if (isRadiant) audio.playRadiantSound();
      else audio.playHitSound();

      const damageDealt = isRadiant ? 35 : 20;
      const newEnemyHp = Math.max(0, enemy.hp - damageDealt);

      // Update room enemy HP
      setRooms((prev) => ({
        ...prev,
        [currentRoomId]: {
          ...prev[currentRoomId],
          enemy: {
            ...enemy,
            hp: newEnemyHp,
          },
        },
      }));

      addLogEntry({
        id: `atk_hit_${Date.now()}`,
        timestamp,
        type: 'combat',
        speaker: 'COMBAT',
        outcome: result.outcome,
        content: `${isRadiant ? 'CRITICAL RADIANT STRIKE!' : 'DIRECT HIT!'} Dealt ${damageDealt} damage to ${enemy.name} (${newEnemyHp}/${enemy.maxHp} HP remaining).`,
      });

      // Enemy Defeated!
      if (newEnemyHp <= 0) {
        audio.playVictoryFanfare();
        const drop = enemy.drop || 'Stasis Stimpack';

        setPlayer((prev) => {
          const score = prev.score + (enemy.phase ? 1000 : 300);
          const inventory = prev.inventory.includes(drop) ? prev.inventory : [...prev.inventory, drop];
          const updated = { ...prev, score, inventory, level: prev.level + 1 };
          multiplayer.broadcastPlayerState(updated);
          return updated;
        });

        addLogEntry({
          id: `defeat_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'combat',
          speaker: 'VICTORY',
          content: `TARGET NEUTRALIZED: ${enemy.name} collapsed into quantum dust! Dropped [${drop}]. Level Up!`,
        });

        if (currentRoom.id === 'throne') {
          addLogEntry({
            id: `grandmaster_win_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'narrative',
            speaker: 'JEV GRANDMASTER',
            content:
              'IMPRESSIVE. You have dismantled my System-1 avatar and transcended the Spire. The entire Antigravity manifold is now yours.',
          });
        }
      }
    }

    setIsProcessing(false);
  };

  // Command Input Router
  const handleSendCommand = async (cmd: string) => {
    const raw = cmd.toLowerCase().trim();
    const timestamp = new Date().toLocaleTimeString();

    const playerLog: LogEntry = {
      id: `cmd_${Date.now()}`,
      timestamp,
      type: 'player',
      speaker: player.name,
      content: cmd,
    };
    addLogEntry(playerLog);
    multiplayer.broadcastLog(playerLog, player.name);

    if (raw === 'help') {
      addLogEntry({
        id: `help_${Date.now()}`,
        timestamp,
        type: 'system',
        content: `AGY DUNGEON COMMAND MATRIX:
• roll              - Trigger Jev tri-state stochastic dice ([NULL], [CHOICE], [RADIANT])
• attack / strike   - Attack the room enemy with equipped weapons
• cast antigravity  - Channel antigravity wave to cleanse biological entropy
• look              - Inspect current room anomalies, telemetry, and exits
• go <direction>    - Navigate Spire (north, south, east, west)
• use <item>        - Consume an inventory resource (e.g. 'use Stasis Stimpack')
• loot / scavenge   - Scour the room for hidden items and caches
• say <message>     - Broadcast a message to all Herdr multiplayer peers
• party             - Open Herdr multiplayer party overview
• save / restart    - Save or reset your Spire run
• clear             - Flush terminal buffer
• Any custom text   - Custom actions evaluated directly by Jev System-1!`,
      });
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

    if (raw === 'codex') {
      setActiveTab('codex');
      return;
    }

    if (raw === 'save') {
      handleSaveGame();
      return;
    }

    if (raw === 'restart') {
      handleResetGame();
      return;
    }

    if (raw.startsWith('say ')) {
      const chatText = cmd.slice(4).trim();
      multiplayer.broadcastChat(chatText, player.name);
      return;
    }

    if (raw === 'look') {
      addLogEntry({
        id: `look_${Date.now()}`,
        timestamp,
        type: 'system',
        content: `[ROOM TELEMETRY]: Floor ${currentRoom.floor} - ${currentRoom.name}
Description: ${currentRoom.description}
Exits: ${currentRoom.exits.join(' | ')}
Hazards: ${currentRoom.hazards?.join(', ') || 'None detected'}
Items in Room: ${currentRoom.items?.join(', ') || 'None visible'}
Hostiles: ${
          currentRoom.enemy && currentRoom.enemy.hp > 0
            ? `${currentRoom.enemy.name} (${currentRoom.enemy.hp}/${currentRoom.enemy.maxHp} HP)`
            : 'Clear'
        }`,
      });
      return;
    }

    if (raw === 'attack' || raw === 'strike') {
      await handleAttackEnemy();
      return;
    }

    if (raw === 'cast' || raw.includes('cast')) {
      audio.playRadiantSound();
      setPlayer((prev) => {
        const entropy = Math.max(0, prev.entropy - 15);
        const updated = { ...prev, entropy };
        multiplayer.broadcastPlayerState(updated);
        return updated;
      });
      await handleRollDice('Cast high-frequency Antigravity Pulse to warp chamber physics');
      return;
    }

    if (raw === 'loot' || raw === 'scavenge') {
      audio.playKeypress();
      if (currentRoom.items && currentRoom.items.length > 0) {
        const foundItem = currentRoom.items[0];
        setPlayer((prev) => {
          const inventory = prev.inventory.includes(foundItem) ? prev.inventory : [...prev.inventory, foundItem];
          const score = prev.score + 50;
          const updated = { ...prev, inventory, score };
          multiplayer.broadcastPlayerState(updated);
          return updated;
        });

        // Remove item from room
        setRooms((prev) => ({
          ...prev,
          [currentRoomId]: {
            ...prev[currentRoomId],
            items: prev[currentRoomId].items?.filter((i) => i !== foundItem),
          },
        }));

        addLogEntry({
          id: `loot_${Date.now()}`,
          timestamp,
          type: 'loot',
          content: `SCAVENGE SUCCESS: Discovered [${foundItem}] in a hidden alcove! Added to inventory.`,
        });
      } else {
        addLogEntry({
          id: `loot_none_${Date.now()}`,
          timestamp,
          type: 'system',
          content: 'You scour the chamber floor, but find only basalt dust and burnt circuits.',
        });
      }
      return;
    }

    if (raw.startsWith('use ')) {
      const itemName = cmd.slice(4).trim();
      const matchKey = Object.keys(ITEMS_DATABASE).find(
        (k) =>
          ITEMS_DATABASE[k].name.toLowerCase().includes(itemName.toLowerCase()) ||
          k.toLowerCase().includes(itemName.toLowerCase())
      );

      const hasItem = player.inventory.some((i) => i.toLowerCase().includes(itemName.toLowerCase()));

      if (hasItem) {
        audio.playRadiantSound();
        const itemDef = matchKey ? ITEMS_DATABASE[matchKey] : null;
        const hpGain = itemDef?.hpRestore || 30;
        const entropyLoss = itemDef?.entropyReduce || 20;

        setPlayer((prev) => {
          const hp = Math.min(prev.maxHp, prev.hp + hpGain);
          const entropy = Math.max(0, prev.entropy - entropyLoss);
          const inventory = prev.inventory.filter((i) => !i.toLowerCase().includes(itemName.toLowerCase()));
          const updated = { ...prev, hp, entropy, inventory };
          multiplayer.broadcastPlayerState(updated);
          return updated;
        });

        addLogEntry({
          id: `use_${Date.now()}`,
          timestamp,
          type: 'system',
          content: `Activated ${itemName}. Restored ${hpGain} HP and reduced Entropy by ${entropyLoss}%!`,
        });
      } else {
        addLogEntry({
          id: `use_err_${Date.now()}`,
          timestamp,
          type: 'system',
          content: `Item "${itemName}" not found in inventory manifold.`,
        });
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
        if (validExit.includes('crypt')) nextRoomKey = 'crypt';
        else if (validExit.includes('archives')) nextRoomKey = 'archives';
        else if (validExit.includes('laboratory') || validExit.includes('lab')) nextRoomKey = 'laboratory';
        else if (validExit.includes('siphon')) nextRoomKey = 'siphon';
        else if (validExit.includes('cathedral')) nextRoomKey = 'cathedral';
        else if (validExit.includes('harness')) nextRoomKey = 'harness';
        else if (validExit.includes('throne')) nextRoomKey = 'throne';
        else if (validExit.includes('gate')) nextRoomKey = 'gate';

        const nextRoom = rooms[nextRoomKey] || INITIAL_ROOMS[nextRoomKey];
        setCurrentRoomId(nextRoomKey);
        multiplayer.broadcastRoomChange(nextRoom, player.name);

        addLogEntry({
          id: `nav_${Date.now()}`,
          timestamp,
          type: 'system',
          content: `TRANSITIONING TO: ${nextRoom.name} (Floor ${nextRoom.floor}). ${nextRoom.description}`,
        });
        return;
      } else {
        addLogEntry({
          id: `nav_err_${Date.now()}`,
          timestamp,
          type: 'system',
          content: `Direction "${targetDir}" is obstructed by forcefields. Available exits: ${currentRoom.exits.join(', ')}`,
        });
        return;
      }
    }

    // Freeform action: Roll Jev dice on it!
    await handleRollDice(cmd);
  };

  const handleSelectChoice = async (choice: ChoiceOption) => {
    audio.playKeypress();
    const timestamp = new Date().toLocaleTimeString();

    const choiceLog: LogEntry = {
      id: `choice_select_${Date.now()}`,
      timestamp,
      type: 'player',
      speaker: player.name,
      content: `SELECTED GAMBIT: ${choice.label}`,
    };
    addLogEntry(choiceLog);
    multiplayer.broadcastLog(choiceLog, player.name);

    await handleRollDice(`Executing dilemma gambit: "${choice.label}" (${choice.description})`);
  };

  const handleBroadcastPartyMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const chatLog: LogEntry = {
      id: `party_bcast_${Date.now()}`,
      timestamp,
      type: 'party',
      speaker: player.name,
      content: msg,
    };
    addLogEntry(chatLog);
    multiplayer.broadcastChat(msg, player.name);
    setActiveTab('dungeon');
  };

  // Host or Join from Lobby
  const handleHostNewRoom = () => {
    multiplayer.hostRoom().then((code) => {
      setRoomCode(code);
      setIsHost(true);
      window.history.replaceState({}, '', `/?session=${code}`);
      addLogEntry({
        id: `host_new_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        content: `Created new Herdr multiplexer session: ${code.toUpperCase()}`,
      });
    });
  };

  const handleJoinRoom = (code: string) => {
    multiplayer.joinRoom(code, player).then((success) => {
      if (success) {
        setRoomCode(code);
        setIsHost(false);
        window.history.replaceState({}, '', `/?session=${code}`);
        addLogEntry({
          id: `join_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'system',
          content: `Successfully joined session://${code.toUpperCase()}`,
        });
        setLobbyOpen(false);
      }
    });
  };

  // Theme color styling
  const themeClasses: Record<TerminalTheme, string> = {
    obsidian: 'bg-[#08090d] text-zinc-200',
    matrix: 'bg-[#041008] text-emerald-400',
    amber: 'bg-[#120b02] text-amber-400',
    cyber: 'bg-[#060b14] text-cyan-300',
    sol: 'bg-[#002b36] text-[#93a1a1]',
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${themeClasses[theme]} ${
        crtEnabled ? 'crt-overlay crt-vignette' : ''
      }`}
    >
      {/* Top Header Multiplexer */}
      <HeaderBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        crtEnabled={crtEnabled}
        setCrtEnabled={setCrtEnabled}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        ambientActive={ambientActive}
        onToggleAmbient={handleToggleAmbient}
        theme={theme}
        setTheme={(t) => {
          setTheme(t);
          localStorage.setItem('agy_theme', t);
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenLobby={() => setLobbyOpen(true)}
        aiConfig={aiConfig}
        roomCode={roomCode}
        peerCount={peerCount}
        networkStatus={networkStatus}
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
        {activeTab === 'stream' && <JevStreamView player={player} aiConfig={aiConfig} />}

        {/* Tab 3: Herdr Party Lobby */}
        {activeTab === 'party' && (
          <PartyView
            party={party}
            player={player}
            onBroadcastPartyMessage={handleBroadcastPartyMessage}
            onOpenLobby={() => setLobbyOpen(true)}
          />
        )}

        {/* Tab 4: Spire Codex */}
        {activeTab === 'codex' && <CodexView />}

        {/* Right Sidebar: Vitals, Map, Inventory, Party */}
        <Sidebar
          player={player}
          currentRoom={currentRoom}
          party={party}
          onTriggerQuickAction={handleSendCommand}
          onSaveGame={handleSaveGame}
          onResetGame={handleResetGame}
          peerCount={peerCount}
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
        setTheme={(t) => {
          setTheme(t);
          localStorage.setItem('agy_theme', t);
        }}
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
        roomCode={roomCode}
        isHost={isHost}
        peerCount={peerCount}
        networkStatus={networkStatus}
        onHostNewRoom={handleHostNewRoom}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
};
