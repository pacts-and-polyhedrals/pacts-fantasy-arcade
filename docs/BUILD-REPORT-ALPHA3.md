# Fantasy Arcade Alpha 3 — Build Report

**Build:** 0.3.0-alpha.3 (Stage 3)  
**Date:** 2026-11-19  
**Target:** Foundry VTT 14, system-independent  
**Status:** Node-tested development alpha; not certified inside a live Foundry or Forge world.

## Game implementations

- Alpha 1: 20 introductory game engines.
- Alpha 2: 15 additional small games.
- Alpha 3: 8 new advanced games: Waterdeep Hold'em, Three Wyrms Ante, Dragon's Trick, Bard's Bluff, King's Gambit, Elemental Conquest, Royal Hunt, Wyvern Chess.
- **43 coded game engines; 88 catalogue entries remain planned.**

## Stage 3 systems

1. Native source-level Wyvern Chess rules adaptation: Sky/Land/Underworld 12 x 8 boards, 15 original piece types, legal king safety and checkmate, cross-layer movement, Basilisk freeze, remote Dragon capture, promotion, basic heuristic NPC, per-move replay. Original prototype: https://github.com/pacts-and-polyhedrals/wyvern-chess. This is a **modified, unofficial, noncommercial port**; the original separate community license is bundled. The stronger original Warlord AI, full interactive lesson campaign, original art and original browser UI are not carried over.
2. Advanced card-hand and bidding states, per-user projection of concealed cards, four poker streets, follow-suit and trump rules, original tactical card boards.
3. Knockout Tournament Hall for 2, 4 and 8 entrants, including human seats, AI rivals, GM-controlled NPCs, match launch, score-to-bracket progression, GM-draw adjudication and an audit log.
4. Public-only replay controls. Archived card frames deliberately omit concealed hands and random decks; Wyvern Chess replays are reconstructed from accepted moves.
5. New guided lessons: three explanatory steps plus a clickable scored rules checkpoint for each of the eight activities.
6. Schema 3 game and bracket persistence with schema 2 restore compatibility.

## Automated verification

- **42/42 tests pass**, using `node --test tests/*.test.mjs` (Node.js 22).
- 60 simulated full matches per each of seven non-chess Stage 3 games (420 total), plus NPC-vs-NPC reveal handling.
- Wyvern Chess move validation, frozen piece interaction, turn ownership, simulated plies and replay reconstruction.
- Bracket seeding/advancement, linked game results, player ownership checks, save/restore and migration.
- Hidden data projections and public-only replay snapshots, rendered HTML control tests, XSS escaping checks, and fake-Foundry startup smoke test.
- All module `.mjs` syntax checked.

## Known limitations and acceptance gates

- Actual Foundry v14 two-client sync, deployment, and The Forge hosting **not tested** in this build environment.
- Optional Chromium screenshot visual check **timed out**; no browser visual certification is claimed.
- Identity claimed in Foundry module sockets is not cryptographically trustworthy. Hidden information is visually redacted, but **this is not cheat-proof**. Do not run consequential or real-money wagers.
- Most movement, cards and chess pieces use HTML/CSS/Unicode controls rather than polished sprite animation, physical dice or world-map token movement.
- Full AI personalities, deep chess strategic search, tutorial scenario play, responsive visual and accessibility audits remain open.
- Full rules/AI parity between native Wyvern Chess and the existing browser prototype requires additional automated equivalence tests.

## Installation/upgrade

1. Backup your Foundry world and previous `pacts-fantasy-arcade` module folder.
2. Replace `<Foundry User Data>/Data/modules/pacts-fantasy-arcade` with the folder from the ZIP. `module.json` must be immediately inside the named folder.
3. Start Foundry 14, enable the module and open the Fantasy Arcade launcher.
4. Test each Stage 3 game using the GM and a second player in a development world. Test a 4-person tournament, spectator views and saved-state recovery.
5. Consult `docs/RELEASE-CHECKLIST.md` before using it for an actual campaign.

## Next roadmap stage

**Stage 4 — Puzzle Forge:** original riddle/template creation, verifiable answers and hints, chained clue networks, emoji/logic mechanisms, and optionally Scene Tile/Region triggers. Larger arenas, sports and Sorcerous Circuit remain later stages.
