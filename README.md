# AGY Dungeon — Grandmaster Jev D&D

> **Multiplayer, cross-platform terminal-based RPG adventure powered by Jev System-One AI Engine.**

Live at: [https://agy-dungeon.com](https://agy-dungeon.com)

---

## The Concept

AGY Dungeon is a shared terminal roleplay game implementing the **Jev System-One Decision Engine**:
- **Tri-State Stochastic Dice**:
  - `[ NULL ]` (Zero-state collapse / void penalty / entropy surge)
  - `[ CHOICE ]` (Reality bifurcation / player agency dilemmas)
  - `[ RADIANT ]` (Antigravity divine transcendence / critical strike / cache discovery)
- **Shared Terminal Session (Herdr Multiplexer)**: Broadcasts a unified TUI across PC & mobile viewports.
- **Bring-Your-Own-Compute**: Run entirely on-device (Edge, Ollama, WebLLM) or connect global model API keys (Gemini, OpenAI, Groq, Anthropic).

---

## Local Development

```bash
bun install
bun run dev
```

Build for production:
```bash
bun run build
```

---

## DNS Configuration (Spaceship / Registrar)

To link `agy-dungeon.com` to GitHub Pages:

### Option 1: Apex A Records
Add the 4 GitHub Pages A records to your DNS zone on Spaceship:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

### Option 2: CNAME
- Host: `www`
- Value: `<username>.github.io`
