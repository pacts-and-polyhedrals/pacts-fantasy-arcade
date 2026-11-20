# Fantasy Arcade — Alpha 4 Build Report

**Version:** 0.4.0-alpha.4 • **Milestone:** Stage 4 Puzzle Forge • **Date:** 19 November 2026

## Summary

- Previous: **43** coded-alpha games / **88** planned. Current: **59** coded-alpha games / **72** planned, out of an unchanged **131**-design register.
- Added **16** original interactive Puzzle Forge games and **12** reusable puzzle kinds: riddle, sequence, melody, dials, arrange, offer, logic, choices, pipes, gravity, lights and slide.
- Retained Alpha 1–3 engines and tournament code unchanged wherever practicable.
- World state accepts schema **2, 3, 4**, exports schema **4** and persists validated puzzle packs, tables, results, tournaments and scene bindings.
- Verified with **52 passing Node test groups** (including 160 complete simulated puzzle runs and 60 independent mechanical-solver probes). This is not yet a complete real-world Foundry v14 smoke test.

## New installed game IDs (16)

`starforge-giant-lore-chain`, `night-serpent-emoji-ritual`, `scribe-s-riddle-tablet`, `bone-choir`, `crystal-gate-tone-lock`, `tri-moon-lock`, `grammar-of-grief`, `ink-bound-door`, `the-three-hungers`, `weight-rhythm-echo-bridge`, `the-sluice-sequence`, `rotating-gravity-room`, `three-oaths`, `keystone-lattice`, `riddle-book-procedural-challenges`, `wally-style-original-trap-builder`.

## New gameplay mechanisms

- **One shared state per table:** cooperating participants may manipulate the same mechanism; non-members and wrong owners cannot submit actions.
- **Starforge five-chamber chain:** a riddle opens a guardian-logic puzzle, then a forge sequence, moon gate and sliding wardplate. Each success awards an original giant-lore clue to the party.
- **Feedback:** wrong answers incur a small party-score penalty; progressively more explicit hints cost points and can be revealed by participants. The GM can view custom solutions in the Pack Studio, while regular table snapshots omit them.
- **Riddle generator:** 18 original hand-curated riddles. A seed/count/difficulty selector produces reproducible, validated packs of 1–12 riddles; it is not an AI language-model generator.
- **Mechanics validation:** the slide game shuffles legal slides from the solved state; gravity generation checks path existence; keystone lights are generated from solvable toggles; the pipe target has an independently checked end-to-end path.
- **Controls:** click/tap rune buttons, input riddles, repeat bell notes, rotate moon dials and pipes, assign items, choose dialogue, tilt gravity, light keystones and slide wardplates. Styling includes responsive layouts and reduced-motion preferences.

## GM workflow and scene bindings

1. Open **Puzzle Forge** from the Fantasy Arcade GM sidebar.
2. Generate original riddle packs, or open **GM Pack Studio** to edit a linked puzzle pack (up to 24 nodes) and accepted answers. The system refuses unreachable/cyclic node chains, invalid symbols and malformed solutions.
3. On a viewed Foundry Scene select a **Region** or **Tile** source and a target **Tile** or **door Wall**. Define on-completion action: show/hide tile or open/close door.
4. A GM can manually launch/resume the linked puzzle. An experimental GM-host Token update hook observes entry and opens a linked table, or the GM can invoke `await game.pactsFantasyArcade.triggerScenePuzzle("binding-id")` from an appropriate Foundry Region script.
5. When the linked puzzle completes, the GM host validates and updates only the selected document field (`Tile.hidden` or door `Wall.ds`). Errors are noted; failed rewards are retried after further GM actions.

No arbitrary scripts are evaluated from JSON packs. Bounds, source/target type and door checks are validated before applying effects. **A real Foundry/Forge scene run is required** to certify these integrations.

## Source layout

- `scripts/core/puzzle-data.mjs` — 16 activity definitions, 18 original riddles, linked Starforge story and default puzzles.
- `scripts/core/puzzle-engine.mjs` — validators, generator, reducers, solvers and safe projections.
- `scripts/core/scene-bindings.mjs` — declarative scene-source geometry, target validation and reward updates.
- `scripts/core/session.mjs` — Puzzle Forge table hosting, late joining, saves and GM binding actions.
- `scripts/ui/puzzle-view.mjs` — player-facing hands-on puzzles and GM studio.
- `scripts/main.mjs` — Foundry socket bridge, GM pack/scene controls, token entry and optional original bell tones.
- `styles/arcade.css` — styled, responsive, reduced-motion puzzle interface.
- `tests/stage4.test.mjs` — new solver/simulation/security/scene/migration/UI tests.

## Known gaps

This alpha does **not** assert that all historical puzzles are reproduced verbatim or that 131 engines exist yet. Other than the 18 curated original riddles, it does not synthesize original prose riddles with AI. The Region/Tile workflow is experimental, the sound demo is optional, hidden information remains vulnerable to an adversarial module-socket participant, and no live two-browser Foundry/Forge validation has been performed. The current animations are limited to CSS feedback and note playback; they are not advanced physics simulations.

## Next stage

**Stage 5:** implement a shared grid/arena movement core and build the smaller action/entertainment competitions first (Battle of the Bards, wizard duel, monster wrestling and pit fighting), retaining manual GM NPC control. Complete the live Alpha-4 acceptance checks before shipping a stable public package.
