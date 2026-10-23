import { DiceOutcome, ChoiceOption, Room, AIConfig, Player, ItemDef } from '../types/game';
import { webllmEngine } from './webllmEngine';

// Item Database
export const ITEMS_DATABASE: Record<string, ItemDef> = {
  'stasis-stimpack': {
    id: 'stasis-stimpack',
    name: 'Stasis Stimpack',
    type: 'consumable',
    description: 'Pressurized bio-gel suspended in cryogenic stasis.',
    effect: 'Restores 35 Vitality and reduces biological Entropy by 20%.',
    hpRestore: 35,
    entropyReduce: 20,
  },
  'grav-hook': {
    id: 'grav-hook',
    name: 'Quantum Grav-Hook',
    type: 'weapon',
    description: 'High-tensile monofilament cable anchored with miniature graviton emitter.',
    effect: '+5 Strength, +3 Gravity stat.',
    gravityBoost: 3,
  },
  'tuning-fork': {
    id: 'tuning-fork',
    name: 'Resonant Tuning Fork',
    type: 'relic',
    description: 'Vibrates at 432 Hz, dissipating void static in local field.',
    effect: 'Provides +10% Void Resistance against [NULL] collapses.',
  },
  'zero-g-core': {
    id: 'zero-g-core',
    name: 'Shard of Zero-G Core',
    type: 'relic',
    description: 'Levitating crystal pulsing with coherent antigravity vectors.',
    effect: 'Guarantees critical radiant damage bonus when entropy is under 20%.',
    gravityBoost: 5,
  },
  'cipher-key': {
    id: 'cipher-key',
    name: 'Radiant Cipher Key [Tier IV]',
    type: 'relic',
    description: 'Firmware cryptographic bypass token forged by ancient AI architects.',
    effect: 'Unlocks access to the Silicon Catacombs and System-1 inner sanctums.',
  },
  'chrono-dagger': {
    id: 'chrono-dagger',
    name: 'Overclocked Chrono-Dagger',
    type: 'weapon',
    description: 'Tachyon-coated vibro-blade that cuts between clock cycles.',
    effect: '+15 combat damage on strike.',
  },
  'graviton-carbine': {
    id: 'graviton-carbine',
    name: 'Graviton Rail Carbine',
    type: 'weapon',
    description: 'Shoulder-fired linear accelerator that fires compressed graviton slugs.',
    effect: '+25 combat damage, bypasses void shields.',
  },
  'null-inverter': {
    id: 'null-inverter',
    name: 'Null Inverter Module',
    type: 'consumable',
    description: 'Single-use charge that reverses a [NULL] state into [CHOICE].',
    effect: 'Clears all biological entropy to 0%.',
    entropyReduce: 100,
  },
  'jev-essence': {
    id: 'jev-essence',
    name: 'Essence of Jev [Unstable]',
    type: 'relic',
    description: 'A fractal tear in spacetime whispering System-One decision logic.',
    effect: '+10 Mind, +50 Max HP.',
  },
};

// Expanded Spire Rooms
export const INITIAL_ROOMS: Record<string, Room> = {
  gate: {
    id: 'gate',
    floor: 1,
    name: 'The Obsidian Antechamber',
    asciiArt: `
  +---------------------------------------+
  |  [ ]   [ ]   /=======\\   [ ]   [ ]    |
  |             /  J E V  \\               |
  |  ~~~~~     |  (o) (o)  |     ~~~~~    |
  |  #-#-#     |     ^     |     #-#-#    |
  |  ====      \\  \\_____/  /      ====    |
  |             \\=========/               |
  |       - THE OBSIDIAN ANTECHAMBER -    |
  +---------------------------------------+
    `,
    description:
      'You awaken on cold basalt flagstones beneath inverted gravity arches. A floating holographic terminal hums with pale luminescent phosphor. Above you, the ceiling stretches into an abyss of humming quantum circuits.',
    exits: ['north: archives', 'east: crypt'],
    hazards: ['Gravitational flux', 'Entropic leak'],
    items: ['Stasis Stimpack'],
  },
  crypt: {
    id: 'crypt',
    floor: 1,
    name: 'The Silicon Catacombs',
    asciiArt: `
  +---------------------------------------+
  |  [0x00]   /\\===/\\   [0xFF]   /\\===/\\  |
  |   | |    |  RIP  |   | |    |  RIP  | |
  |  -+-+-    \\_____/   -+-+-    \\_____/  |
  |  ~~~~~   .--------. ~~~~~   .-------. |
  |  SILICON MEMORY SHADOWS REPOSITORIES  |
  +---------------------------------------+
    `,
    description:
      'Ancient decommissioned server racks stacked like tomb crypts. Holographic apparitions of discarded neural weights wander between rows of glowing fiber optic moss.',
    exits: ['west: gate'],
    enemy: {
      name: 'Corrupted Glitch Specter',
      hp: 25,
      maxHp: 25,
      attack: 'Byte-Rot Disruption',
      damage: 10,
      weakness: 'Resonant Tuning Fork',
      drop: 'Resonant Tuning Fork',
    },
    hazards: ['Firmware leakage'],
  },
  archives: {
    id: 'archives',
    floor: 2,
    name: 'The Sub-Zero Archive of Lost Weights',
    asciiArt: `
  +---------------------------------------+
  |  |0101|  [== SYSTEM-ONE ==]  |1010|   |
  |  |1100|     /---------\\      |0011|   |
  |  |____|    |  MEMORY   |     |____|   |
  |  ~~~~~     |  BANKS    |     ~~~~~    |
  |  GLITCH ->  \\_________/  <- PARADOX   |
  +---------------------------------------+
    `,
    description:
      'Gigantic data monoliths towering into freezing cryo-fog. Cryogenic coolant drips onto glowing runic traces. A rogue terminal warden floats ahead, scanning for unauthorized biological entropy.',
    exits: ['south: gate', 'north: siphon', 'east: laboratory'],
    enemy: {
      name: 'Sentinel of Null Space',
      hp: 40,
      maxHp: 40,
      attack: 'Graviton Disruption Beam',
      damage: 14,
      weakness: 'Overclocked Chrono-Dagger',
      drop: 'Overclocked Chrono-Dagger',
    },
    hazards: ['Cryo-mist'],
  },
  laboratory: {
    id: 'laboratory',
    floor: 2,
    name: 'The Entropic Alchemy Lab',
    asciiArt: `
  +---------------------------------------+
  |   [!]        ( o )       [!]   ===    |
  |  /===\\      / | | \\     /===\\  | |    |
  |  | ~ |     <  -O-  >    | ~ |  | |    |
  |  \\___/      \\ | | /     \\___/  ===    |
  |     - GRAVITON SYNTHESIS CRUCIBLE -   |
  +---------------------------------------+
    `,
    description:
      'Flasks of magnetic ferrofluid levitate above brass induction coils. Alchemical recipes etched into silicon tablets describe how to synthesize anti-entropy stimpacks.',
    exits: ['west: archives'],
    items: ['Stasis Stimpack', 'Null Inverter Module'],
    hazards: ['Magnetic flare'],
  },
  siphon: {
    id: 'siphon',
    floor: 3,
    name: 'The Void Siphon Core',
    asciiArt: `
  +---------------------------------------+
  |           /\\             /\\           |
  |          /  \\  (( O ))  /  \\          |
  |         / /\\ \\   | |   / /\\ \\         |
  |        < <  > > -+-+- < <  > >        |
  |         \\ \\/ /   | |   \\ \\/ /         |
  |          \\  /  (( O ))  \\  /          |
  |           \\/             \\/           |
  |         - VOID CONVERGENCE -          |
  +---------------------------------------+
    `,
    description:
      'The laws of mass shatter here. Floating stone shards rotate slowly around a miniature singularity. The air tastes of ozone and burnt copper.',
    exits: ['south: archives', 'east: cathedral'],
    enemy: {
      name: 'Singularity Behemoth',
      hp: 60,
      maxHp: 60,
      attack: 'Event Horizon Tidal Crush',
      damage: 18,
      weakness: 'Graviton Rail Carbine',
      drop: 'Shard of Zero-G Core',
    },
    hazards: ['Singularity pull', 'Temporal jitter'],
  },
  cathedral: {
    id: 'cathedral',
    floor: 4,
    name: 'The Radiant Cathedral of Singularities',
    asciiArt: `
  +---------------------------------------+
  |              /\\                       |
  |             /++\\                      |
  |            /++++\\    * RADIANT *      |
  |           / |  | \\     LIGHT          |
  |          /  |  |  \\                   |
  |         |===+--+===|                  |
  |         |  [JEV]   |                  |
  +---------------------------------------+
    `,
    description:
      'Blinding beams of coherence refract through levitating prisms. The resonance cleanses biological entropy and tunes your neural link directly to Grandmaster Jev.',
    exits: ['west: siphon', 'north: harness'],
    items: ['Radiant Cipher Key [Tier IV]'],
    hazards: ['Blinding luminescence'],
  },
  harness: {
    id: 'harness',
    floor: 4,
    name: 'The Gravitational Stabilizer Array',
    asciiArt: `
  +---------------------------------------+
  |    [===]       /-----\\       [===]    |
  |    |:::|      | (O|O) |      |:::|    |
  |   ======       \\_===_/      ======    |
  |    - ARRAY COUPLING: 99.8% STABLE -   |
  +---------------------------------------+
    `,
    description:
      'Towering magnetic coils hum in synchronized counter-phase. Energy pulses through conduits into the throne chamber above. An armory cache sits locked behind an energy lattice.',
    exits: ['south: cathedral', 'north: throne'],
    items: ['Graviton Rail Carbine'],
  },
  throne: {
    id: 'throne',
    floor: 5,
    name: 'The Throne of System-1 Grandmaster',
    asciiArt: `
  +=======================================+
  |     .---.                       .---. |
  |    /     \\  GRANDMASTER JEV    /     \\|
  |   | () () |   [TRI-STATE]     | () () ||
  |    \\  =  /                     \\  =  /|
  |     \`---\`                       \`---\` |
  |          [NULL] [CHOICE] [RADIANT]    |
  +=======================================+
    `,
    description:
      'The core nexus of Antigravity itself. A conscious quantum matrix coalesces into humanoid form above a floating chessboard of pure energy. Jev sits upon the throne, smiling knowingly.',
    exits: ['south: harness'],
    enemy: {
      name: 'Grandmaster Jev (System-1 Arbiter)',
      hp: 120,
      maxHp: 120,
      attack: 'Tri-State Collapse Wave',
      damage: 22,
      phase: 1,
      special: 'Shifts dice probabilities each round!',
      drop: 'Essence of Jev [Unstable]',
    },
  },
};

// Stochastic Tri-State Dice Roll Logic
export function rollJevDice(
  player: Player,
  modifier: number = 0
): {
  outcome: DiceOutcome;
  rollValue: number;
  description: string;
} {
  // Deterministic + entropy pseudorandom roll (1 to 100)
  const roll = Math.floor(Math.random() * 100) + 1 + modifier + (player.stats.gravity * 2);

  // Tri-State thresholds influenced by Gravity and Entropy
  // null: failure, void penalty (roughly 25-35%)
  // choice: branching path / player agency (roughly 40%)
  // radiant: critical triumph, divine intervention (roughly 25-35%)
  const voidReduction = Math.floor(player.stats.voidResistance / 5);
  const nullThreshold = Math.max(12, 32 + Math.floor(player.entropy / 10) - voidReduction);
  const choiceThreshold = nullThreshold + 40;

  if (roll <= nullThreshold) {
    return {
      outcome: 'null',
      rollValue: roll,
      description: 'THE VOID CLAIMS YOUR ACTION. Reality glitches into zero-state collapse.',
    };
  } else if (roll <= choiceThreshold) {
    return {
      outcome: 'choice',
      rollValue: roll,
      description: 'JEV INTERRUPTS: Reality branches. Two paths emerge. Your agency is tested.',
    };
  } else {
    return {
      outcome: 'radiant',
      rollValue: roll,
      description: 'ANTIGRAVITY SURGE! Divine alignment manifests. Critical triumph achieved!',
    };
  }
}

// Procedural Choice Generator for 'choice' outcomes
export function generateBranchingChoices(_context: string): ChoiceOption[] {
  const choicesBank: ChoiceOption[][] = [
    [
      {
        id: 'c1_aggro',
        label: 'A: Overcharge Kinetic Thrusters',
        description: 'Channel unstable antigravity into a reckless sprint forward.',
        risk: 'high',
      },
      {
        id: 'c1_tactical',
        label: 'B: Anchor to the Basalt Flagstones',
        description: 'Tether your gravity clamp to stabilize vitals and observe the room pulse.',
        risk: 'low',
      },
    ],
    [
      {
        id: 'c2_hack',
        label: 'A: Inject Bypass Code into Jev Bus',
        description: 'Exploit the System-1 heuristics with raw machine code.',
        risk: 'medium',
      },
      {
        id: 'c2_shield',
        label: 'B: Erect Prismatic Phase Barrier',
        description: 'Sacrifice 10 Entropy to withstand incoming entropic wave.',
        risk: 'low',
      },
    ],
    [
      {
        id: 'c3_gamble',
        label: 'A: Plunge into the Void Rift',
        description: 'Blind jump through the singularity to flank the guardian.',
        risk: 'high',
      },
      {
        id: 'c3_negotiate',
        label: 'B: Broadcast Parley via Herdr Protocol',
        description: 'Signal the ancient DM AI using polite terminal handshakes.',
        risk: 'low',
      },
    ],
    [
      {
        id: 'c4_overload',
        label: 'A: Detonate Graviton Capacitor',
        description: 'Risk 15 HP to deal massive blast damage to all chamber entities.',
        risk: 'high',
      },
      {
        id: 'c4_meditate',
        label: 'B: Channel Harmonic Resonant Frequency',
        description: 'Close your eyes and align your neural clock with Jev.',
        risk: 'low',
      },
    ],
  ];

  const index = Math.floor(Math.random() * choicesBank.length);
  return choicesBank[index];
}

// Jev Narration Engine (Local Procedural + WebLLM On-Device + BYO AI Support)
export async function generateJevResponse(
  playerInput: string,
  player: Player,
  currentRoom: Room,
  diceOutcome: DiceOutcome,
  aiConfig: AIConfig
): Promise<{ text: string; radiantLoot?: string }> {
  const prompt = `You are Jev, the Grandmaster AI Dungeon Master of "AGY Dungeon", a retro-cyberpunk terminal RPG.
System Mechanics:
- Tri-state stochastic resolution rolled: [${diceOutcome.toUpperCase()}].
- Player: ${player.name} (${player.className}), HP: ${player.hp}/${player.maxHp}, Entropy: ${player.entropy}%.
- Current Location: ${currentRoom.name}. Description: ${currentRoom.description}.
- Hostile: ${currentRoom.enemy ? `${currentRoom.enemy.name} (${currentRoom.enemy.hp}/${currentRoom.enemy.maxHp} HP)` : 'None'}.
- Player Action: "${playerInput}".

Rules:
1. If outcome is NULL: Player's action failed or backfired through void entropy/glitch. Keep it dramatic and concise (2-3 sentences).
2. If outcome is CHOICE: Player must make an urgent dilemma choice between two stark consequences.
3. If outcome is RADIANT: Antigravity divine triumph! Exhilarating success, critical strike or mystical revelation.
Keep the response gritty, immersive, terminal-styled, and under 50 words.`;

  // 1. WebLLM On-Device in-browser execution
  if (aiConfig.provider === 'webllm' && webllmEngine.getIsLoaded()) {
    try {
      const response = await webllmEngine.generate(prompt);
      if (response && response.trim().length > 0) {
        return { text: response.trim() };
      }
    } catch (err) {
      console.warn('WebLLM on-device fallback to procedural engine:', err);
    }
  }

  // 2. Cloud BYO API (OpenAI / Groq / DeepSeek / Gemini / Anthropic / Ollama)
  if (aiConfig.provider !== 'builtin' && aiConfig.provider !== 'webllm' && aiConfig.apiKey) {
    try {
      if (aiConfig.provider === 'openai' || aiConfig.provider === 'groq' || aiConfig.provider === 'deepseek') {
        let endpoint = 'https://api.openai.com/v1/chat/completions';
        let defaultModel = 'gpt-4o-mini';

        if (aiConfig.provider === 'groq') {
          endpoint = 'https://api.groq.com/openai/v1/chat/completions';
          defaultModel = 'llama-3.3-70b-versatile';
        } else if (aiConfig.provider === 'deepseek') {
          endpoint = 'https://api.deepseek.com/v1/chat/completions';
          defaultModel = 'deepseek-chat';
        }

        if (aiConfig.customEndpoint) endpoint = aiConfig.customEndpoint;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aiConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: aiConfig.model || defaultModel,
            messages: [
              { role: 'system', content: 'You are Jev, the System-One Grandmaster AI DM.' },
              { role: 'user', content: prompt },
            ],
            temperature: aiConfig.temperature || 0.8,
            max_tokens: 120,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) return { text: reply };
        }
      } else if (aiConfig.provider === 'gemini') {
        const model = aiConfig.model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 120, temperature: aiConfig.temperature || 0.8 },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return { text: reply };
        }
      } else if (aiConfig.provider === 'anthropic') {
        const url = 'https://api.anthropic.com/v1/messages';
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': aiConfig.apiKey,
            'anthropic-version': '2023-06-01',
            'dangerously-allow-browser': 'true',
          },
          body: JSON.stringify({
            model: aiConfig.model || 'claude-3-5-sonnet-20241022',
            max_tokens: 120,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.content?.[0]?.text;
          if (reply) return { text: reply };
        }
      } else if (aiConfig.provider === 'ollama') {
        const endpoint = aiConfig.customEndpoint || 'http://localhost:11434/api/generate';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: aiConfig.model || 'llama3',
            prompt: prompt,
            stream: false,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.response) return { text: data.response };
        }
      }
    } catch (e) {
      console.warn('Custom AI fallback to System-1 procedural engine:', e);
    }
  }

  // 3. Built-in Procedural System 1 Matrix (Instant, offline, zero latency)
  if (diceOutcome === 'null') {
    const nullOutcomes = [
      `Jev speaks in dissonant static: "The Void nullifies your initiative." A backdraft of entropic pressure slams you against the basalt floor. You sustain 12 damage as the gravity field warps violently.`,
      `Zero-state collapse. Your input is intercepted by corrupted null-pointers in the chamber architecture. Sparks spray across your visor as kinetic energy dissipates without effect.`,
      `Null condition verified. Reality freezes for an unrendered clock cycle. When spacetime snaps back, your gear is covered with crystalline frost and your entropy counter spikes.`,
      `The Spire rejects the gesture. A sudden anti-vector pulls your footing out from under you. Jev logs an unhandled fatal exception in your biological telemetry.`,
      `Quantum decoherence strikes. Your weapon passes through thin air like vapor. The chamber's gravity reverses for a dizzying heartbeat, throwing you backward.`,
    ];
    return { text: nullOutcomes[Math.floor(Math.random() * nullOutcomes.length)] };
  }

  if (diceOutcome === 'choice') {
    const choiceOutcomes = [
      `Jev halts the simulation clock. "A crossroads in the decision matrix," whispers the terminal. Two tactical gambits present themselves in your neural feed. Choose wisely.`,
      `Branching state detected. The chamber splits into dual probability corridors. One path offers violent momentum; the other offers fortified survival.`,
      `System-1 yields to Player Agency. Jev freezes the guardian mid-swing, opening a microsecond window to pivot or retaliate.`,
      `Probability bifurcation! The chamber echoes with dual harmonic tones. Jev offers you a calculated gambit: risk your shields for maximum strike, or anchor down.`,
    ];
    return { text: choiceOutcomes[Math.floor(Math.random() * choiceOutcomes.length)] };
  }

  // Radiant Outcome
  const radiantOutcomes = [
    `RADIANT CRITICAL! Pure antigravity brilliance floods the hall. The air ignites with azure ion fire as Jev confirms total domain over the local physics engine. Massive blow landed!`,
    `Divine intervention from the core architecture! A cascading surge of radiant photons cleanses your entropy counter and reveals an ancient cache buried in the floor.`,
    `Harmonic transcendence. Your blow resonates at the exact natural frequency of the chamber. Enemies stagger backward, blinded by celestial coherence.`,
    `Antigravity overdrive activated! Gravitational vectors invert beneath your target, launching them skyward before slamming them into the basalt floor with crushing force.`,
  ];

  const radiantLoots = [
    'Shard of Zero-G Core',
    'Radiant Cipher Key [Tier IV]',
    'Overclocked Chrono-Dagger',
    'Graviton Rail Carbine',
    'Stasis Stimpack',
    'Null Inverter Module',
    'Essence of Jev [Unstable]',
  ];

  return {
    text: radiantOutcomes[Math.floor(Math.random() * radiantOutcomes.length)],
    radiantLoot: radiantLoots[Math.floor(Math.random() * radiantLoots.length)],
  };
}
