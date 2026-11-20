# Fantasy Arcade v0.5.0-alpha.5 — Stage 5 Build Report

**Status:** Code packaged for developer testing. **Environment:** Foundry VTT v14 / system-neutral. **Coverage:** 73 of 131 catalogue entries implemented; 58 remain a future roadmap. These are independently playable engines, not 73 production-grade modules.

## User brief and decisions

The design priority was not more disconnected games. Stage 5 adds one tactical engine that powers real combat arenas, wizard duels, monster wrestling, performance contests, a cooperative defence and a stealth trial. Every game shares a legal action schema, bounded AP/stamina/focus, positions, health, scores, temporary status, replays and NPC opponent slots. The GM can personally operate a rival NPC and later delegate that slot back to automatic AI. The specific external fighting-pit module referenced by the user was not available in this workspace, so a bounded import handshake and separate full tournament design have been supplied rather than guessing its internal API.

## Exact new activities (14)

| Game | Dominant mechanics | Mode |
|---|---|---|
| Battle of the Bards | Stage position, rotating crowd preferences, delivery, counter-verse, applause | Competitive |
| Festival Slam Poetry | Verse, refrain, spotlight and audience momentum | Competitive |
| Trial by Debate | Argument, evidence, rebuttal, judges | Competitive |
| Bardic Duet | Collaborative harmony and shared applause | Cooperative |
| Fighting Pit Tournament | Position, block, feint, strike, grapple, stamina, hazards | Competitive |
| Wizard Duel | Line-of-sight elemental spells, counters, ward, focus | Competitive |
| Monster Wrestler Championship | Grapple, break, throw, two legal pins | Competitive |
| Shield Wall | Coordinated guards, wave enemies, gate health | Cooperative |
| Arrow Storm | Cover, ranged volleys, guard, gate defence | Cooperative |
| Gladiator's Gauntlet | Environment, increasing hazard pressure, survival | Competitive |
| The Gloop | Slime zones, reposition, captive rescue | Cooperative |
| Melee Training Dummy | Practice attacks/blocks and technique points | Training |
| Arena Beast Rider | Vault, charge, knockback, footwork | Competitive |
| Shadow Heist | Patrol alert, cover, vanish, distractions, extraction | Cooperative |

## Core architecture and files

- `scripts/core/arena-data.mjs`: 14 game presets, 13 original kits, 44 base abilities, tutorials, rule metadata.
- `scripts/core/arena-engine.mjs`: authoritative, pure serialisable reducer; action validation, map, pathfinding, line of sight, costs, conditions, scoring, goals, rounds, event history and public snapshots.
- `scripts/core/arena-ai.mjs`: mode-aware NPC legal-action utility and bounded reply consideration at tactical difficulty. No external model or network requests.
- `scripts/core/arena-dialogue.mjs`: eight originally authored NPC personalities and general event announcer lines, including situational spell, grapple, hurt and victory dialogue.
- `scripts/core/arena-adapter.mjs`: data-only profile import protocol for future external fighting-pit integration; no sheet/wealth mutations.
- `scripts/ui/arena-view.mjs`: 9×7 tactical map, clickable legal destinations, ability controls, speech, resource metres, replay, spectators, performance delivery controls, GM kit/dialogue setup and pause.
- `styles/arena.css`: original arena stage, tokens, movement ghost, projectiles, impact bursts, responsive/reduced-motion alternatives.
- `scripts/core/session.mjs`: authorized lobby and start/turn pathways, NPC automation and delegation, match completion and knockout tournaments; world state migration to schema 5.
- `data/catalog.json`: 131 total catalogue IDs, 73 coded and 58 planned.
- `tests/stage5.test.mjs`: focused Stage 5 simulation, rules, input-validation, adapter, UI and tournament test groups.
- `docs/ARENA-RULEBOOK.md`: detailed current rules and generated ability table.
- `docs/ARENA-ADAPTER-CONTRACT.md`: profile wire format and permission boundary.
- `docs/FIGHTING-PIT-TOURNAMENTS-DESIGN.md`: future professional tournament and league spec with explicit unshipped features.

## NPC and animation behaviour

Each NPC selects only from its kit's currently legal actions. The AI weighs direct HP damage, finishing a rival, target cover, defensive stances, incoming hazard, movement into attack range, line of sight, spell/cooldown costs, stamina and focus recovery, pin availability, threats to the gate and escaping with the objective. A high-difficulty opponent estimates one plausible reply before selecting. Bard NPCs select delivery to match the audience preference, not blindly use a fixed style. The GM can still control an NPC directly. Dialogue is deterministic and authored; not open-ended conversational intelligence.

The UI visually demonstrates grid movement with short ghost transitions and displays projectiles and impact effects for spells and ranged shots. Every action is also written to a textual history; reduced-motion mode suppresses transition effects. This is **CSS-level 2D animation** and is not yet animated Foundry canvas tokens, 3D movement or sophisticated character skeletal animation.

## Compatibility and limitations

- Current package is an **alpha**. Automated Node and mocked Foundry-interface tests can establish rule correctness and integration expectations but cannot certify actual Foundry/Forge multiplayer compatibility.
- This build has not been executed live inside a Foundry v14 or The Forge world with two connected clients. Actual Foundry socket semantics, controls and save behaviour need end-to-end verification.
- Headless browser screenshot attempt timed out; visual QA on real desktop and mobile viewports remains open.
- This stage supports **two active participants per arena**. Cooperative Shield Wall, Bardic Duet, Arrow Storm, The Gloop and Shadow Heist are two-seat challenges; full squads and many hostile units need generalised initiative.
- Tactical AI is a heuristic opponent, not guaranteed optimal or capable of improvising arbitrary RPG spells and character class features. It uses the kit abilities implemented in `arena-data.mjs`.
- The combat numbers are original contest resources and do not exactly replicate D&D 2014/2024 damage, AC, spell lists or feats.
- A **future adapter** may use the user's existing fighting-pit module, but its source and API must be supplied first. The bounded profile import hook is working; a full bidirectional rewards and careers bridge is not.
- Standard module sockets are not adversarially secure and should never support real-money wagers or valuable-world bets. A connected GM coordinates the authoritative session state.
- Some rules such as training/defence wave pressure and rider charge are simplified turn-based implementations, to be expanded after live validation.

## Testing

The targeted Stage 5 suite covers 14 activities with **50 complete seeded NPC-v-NPC simulations per mode (700 matches)**, plus legal turn economy, movement, line of sight, blocked magic, resource checks, grapple/pin/counterspell, performance scoring, AI decisions, victory lines, interactive UI, save/restoration, GM permissions, imported profiles and tournament integration. The existing **53 Alpha 1–4 test groups** are retained, bringing the combined suite to **74/74 passing test groups**. See `docs/TEST-RESULTS-ALPHA5.md` for final executed counts, dates and known gaps. Final combined run: **74 passed, 0 failed** using Node on 19 November 2026; total wall time approximately 17.2 s. Live Foundry and Forge tests are not included.

## Next steps

1. Run a **real Foundry v14 world with two connected clients** and retest every new action/animation and GM takeover.
2. Obtain the separate fighting-pit module's real repository, manifest, data format and licence, then create a versioned adapter, not a replacement combat system.
3. Improve presentational animation, crowd/NPC dialogue authoring and arena scene integration once live Foundry compatibility is confirmed.
4. Implement true multi-actor initiative and more strategic wave AI before 4v4 competitions and sports.
5. Expand the existing tournament hall into seasons, qualifying leagues and referee judgments per `FIGHTING-PIT-TOURNAMENTS-DESIGN.md`.
