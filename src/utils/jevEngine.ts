import { DiceOutcome, ChoiceOption, Room, AIConfig, Player } from '../types/game';

// Procedural Dungeon Rooms
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
    description: 'You awaken on cold basalt flagstones beneath inverted gravity arches. A floating holographic terminal hums with pale luminescent phosphor. Above you, the ceiling stretches into an abyss of humming quantum circuits.',
    exits: ['north: archives', 'east: conduit'],
    hazards: ['Gravitational flux', 'Entropic leak'],
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
    description: 'Gigantic data monoliths towering into the fog. Cryogenic coolant drips onto glowing runic traces. A rogue terminal warden floats ahead, scanning for unauthorized biological entropy.',
    exits: ['south: gate', 'north: siphon'],
    enemy: {
      name: 'Sentinel of Null Space',
      hp: 35,
      maxHp: 35,
      attack: 'Graviton Disruption Beam',
    },
    hazards: ['Cryo-mist'],
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
    description: 'The laws of mass shatter here. Floating stone shards rotate slowly around a miniature singularity. The air tastes of ozone and burnt copper.',
    exits: ['south: archives', 'east: cathedral'],
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
    description: 'Blinding beams of coherence refract through levitating prisms. The resonance cleanses biological entropy and tunes your neural link directly to Grandmaster Jev.',
    exits: ['west: siphon', 'north: throne'],
    hazards: ['Blinding luminescence'],
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
    description: 'The core nexus of Antigravity itself. A conscious quantum matrix coalesces into humanoid form above a floating chessboard of pure energy.',
    exits: ['south: cathedral'],
    enemy: {
      name: 'Jev Core Avatar',
      hp: 100,
      maxHp: 100,
      attack: 'System One Override',
    },
  }
};

// Stochastic Tri-State Dice Roll Logic
export function rollJevDice(player: Player, modifier: number = 0): {
  outcome: DiceOutcome;
  rollValue: number;
  description: string;
} {
  // Deterministic + entropy pseudorandom roll (1 to 100)
  const roll = Math.floor(Math.random() * 100) + 1 + modifier;

  // Tri-State thresholds influenced by Gravity and Entropy
  // null: failure, void penalty (roughly 30-35%)
  // choice: branching path / player agency (roughly 40%)
  // radiant: critical triumph, divine intervention (roughly 25-30%)
  const nullThreshold = Math.max(15, 33 + Math.floor(player.entropy / 10));
  const choiceThreshold = nullThreshold + 42;

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
        label: 'B: Anchor to the Null Monolith',
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
    ]
  ];

  const index = Math.floor(Math.random() * choicesBank.length);
  return choicesBank[index];
}

// Jev Narration Engine (Local Procedural + BYO AI Support)
export async function generateJevResponse(
  playerInput: string,
  player: Player,
  currentRoom: Room,
  diceOutcome: DiceOutcome,
  aiConfig: AIConfig
): Promise<{ text: string; radiantLoot?: string }> {
  // If user configured a cloud or local API key, attempt real LLM call!
  if (aiConfig.provider !== 'builtin' && aiConfig.apiKey) {
    try {
      const prompt = `You are Jev, the Grandmaster AI Dungeon Master of "AGY Dungeon", a retro-cyberpunk terminal RPG.
System Mechanics:
- Tri-state stochastic resolution rolled: [${diceOutcome.toUpperCase()}].
- Player: ${player.name} (${player.className}), HP: ${player.hp}/${player.maxHp}, Entropy: ${player.entropy}%.
- Current Location: ${currentRoom.name}. Description: ${currentRoom.description}.
- Player Action: "${playerInput}".

Rules:
1. If outcome is NULL: Player's action failed or backfired through void entropy/glitch. Keep it dramatic and concise (2-3 sentences).
2. If outcome is CHOICE: Player must make an urgent dilemma choice between two stark consequences.
3. If outcome is RADIANT: Antigravity divine triumph! Exhilarating success, critical strike or mystical revelation.
Keep the response gritty, immersive, terminal-styled, and under 60 words.`;

      if (aiConfig.provider === 'openai' || aiConfig.provider === 'groq') {
        const endpoint = aiConfig.provider === 'groq' 
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : (aiConfig.customEndpoint || 'https://api.openai.com/v1/chat/completions');
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: aiConfig.model || (aiConfig.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'),
            messages: [
              { role: 'system', content: 'You are Jev, the System-One Grandmaster AI DM.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.8,
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
            generationConfig: { maxOutputTokens: 120, temperature: 0.8 }
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
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

  // Built-in Procedural System 1 Matrix (Instant, offline, zero latency)
  if (diceOutcome === 'null') {
    const nullOutcomes = [
      `Jev speaks in dissonant static: "The Void nullifies your initiative." A backdraft of entropic pressure slams you against the bulkhead. You take 8 damage and the gravity field shakes.`,
      `Zero-state collapse. Your input is intercepted by corrupted null-pointers in the chamber floor. Sparks spray across your visor as energy dissipates without effect.`,
      `Null condition verified. Reality freezes for a fraction of a millisecond. When time snaps back, your weapon is jammed with crystalline frost and you stumble.`,
      `The Spire rejects the gesture. A sudden anti-vector pulls your feet out from under you. Jev logs an unhandled exception in your biological telemetry.`,
    ];
    return { text: nullOutcomes[Math.floor(Math.random() * nullOutcomes.length)] };
  }

  if (diceOutcome === 'choice') {
    const choiceOutcomes = [
      `Jev halts the simulation clock. "A crossroads in the decision matrix," whispers the terminal. Two tactical gambits present themselves in your neural feed. Choose wisely.`,
      `Branching state detected. The chamber splits into dual probability corridors. One path offers violent momentum; the other offers fortified survival.`,
      `System-1 yields to Player Agency. Jev freezes the guardian mid-swing, opening a microsecond window to pivot or retaliate.`,
    ];
    return { text: choiceOutcomes[Math.floor(Math.random() * choiceOutcomes.length)] };
  }

  // Radiant Outcome
  const radiantOutcomes = [
    `RADIANT CRITICAL! Pure antigravity brilliance floods the hall. The air ignites with azure ion fire as Jev confirms total domain over the local physics engine. Massive blow landed!`,
    `Divine intervention from the core architecture! A cascading surge of radiant photons cleanses your entropy counter and reveals an ancient cache buried in the floor.`,
    `Harmonic transcendence. Your blow resonates at the exact natural frequency of the chamber. Enemies stagger backward, blinded by celestial coherence.`,
  ];

  const radiantLoots = [
    'Shard of Zero-G Core',
    'Radiant Cipher Key [Tier IV]',
    'Overclocked Chrono-Dagger',
    'Graviton Rail Carbine',
    'Essence of Jev [Unstable]',
  ];

  return {
    text: radiantOutcomes[Math.floor(Math.random() * radiantOutcomes.length)],
    radiantLoot: radiantLoots[Math.floor(Math.random() * radiantLoots.length)],
  };
}
