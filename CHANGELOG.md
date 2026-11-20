# Fantasy Arcade release history

## 0.5.2-alpha.5.2 — Art, Rulebook & Mechanics Audit

**Artwork**
- 73 original cover illustrations (960×540 WebP) plus 256px library thumbnails, shown in the library list, game page header, table header and rulebook.
- Module banner, 14 arena kit tokens (used on the arena grid and fighter portraits) and the original Wyvern Chess sprites (30 pieces) on all three boards.
- Emoji placeholders replaced; puzzle activities get proper icons. Bundled Cinzel, Cinzel Decorative and EB Garamond (OFL) for headings and rules text.

**Rulebook**
- New `Fantasy Arcade Rulebook` JournalEntry compendium (85 pages): welcome & table guide, GM tools, arena basics, fair play & credits, eight category indexes and complete rules for all 73 games, written against the shipped engines.
- In-app collapsible rules panel on every game page and table, a sidebar Rulebook button, and `game.pactsFantasyArcade.openRules(gameId)`.

**Rules fixes**
- Cauldron Craps: the point was cleared the moment it was set, so the point phase never happened. Rewritten state machine.
- Arm-Wrestling: Power dominated every other tactic. Now a true Power › Feint › Brace › Power triangle with stamina for both arms; pin bonus for leftover stamina.
- Three-Card Wyvern: hand ranking now follows actual rarity in the 20-card deck (pairs were ranked above flushes and straights).
- Lucky Kobold: rebalanced so every omen is worth choosing (Low ≤11 and High ≥16 now pay 2).
- Barrel Bash: rewards now scale with the lane’s visible risk instead of its position.
- Goblin Tankard Toss: farther barrels are worth more, as the lesson always promised.
- Giant’s Skittles: power now trades accuracy for sweep; strike and spare bonuses added.
- Black Dragon: double is limited to the opening two cards.
- Tomb of the Restless Grave: the hint now costs 2 points.
- Emoji Rune Door: doors drawn at random; custom rune packs no longer crash the AI; correct ordinals.
- Kattal’s Hammer: AI could throw an out-of-range strike and crash its seat.
- Tinker’s Lock Race: the AI read the hidden code; it now deduces from public feedback like a player.
- Goblin Breakdancing: the routine is hidden once dancing starts.
- Ispin’s Impossible Tale: four-scene story packs are honoured instead of silently ignored.
- Moonlit Solitaire: clicking a selected card clears the selection.
- Bard’s Bluff: claims were meaningless; the stage now calls a climbing rank that must be claimed, and caught bluffers lose a point.
- Waterdeep Hold’em: folded hands are no longer revealed at showdown.
- Goblin’s Bones, Goblin’s Bluff and blocked Dwarven Dominoes: tied games are draws instead of favouring the first seat.
- Runestone Checkers: a win on the 240th move is no longer overwritten as a draw.
- Co-operative arenas (Bardic Duet, The Gloop, Shadow Heist, Shield Wall, Arrow Storm): allies could target each other. Co-op performances now play to the audience.
- Arrow Storm now has its advertised telegraphed arrow lanes.
- Riddle Forge difficulty now changes which riddles are chosen.
- Smarter AI for King’s High Roll, Devil’s Knuckles, Barrel Bash and King’s Gambit.

**Foundry**
- IDs use `foundry.utils.randomID` (tables could not be created on plain-http LAN hosts).
- `window.confirm` replaced with `DialogV2.confirm`.
- Manifest: credits, project/manifest/download URLs, compendium pack + folder, cover media.

**Tests**
- New `tests/audit.test.mjs`: every game completes AI-vs-AI matches through the session authority (3 seeds each); hostile-input fuzzing of all 31 single-seat engines; regression tests for each fix; rules + art coverage check for all 73 games. 104 groups pass.


## 0.5.1-alpha.5.1 — Four-system World & Character Bridge

- Auto-detect Imagi-Nations, D&D 5e, Pathfinder 2e and Daggerheart in the active Foundry v14 world; legacy Imagi-Nations identifier receives guarded fallback.
- Provide GM-controlled one-click sheet linking for seats, assigned-character auto-match, previews, Scene/Journal reference links, and system-specific explanatory UI.
- Normalise Imagi-Nations ten Capability/Connection stats, D&D abilities and trained skills, PF2e proficiency ranks, and Daggerheart traits/subclass casting; give Daggerheart Experience cues for GM review.
- Exclude Imagi-Nations learner/education Actors, private story fields and inappropriate world Actor types; do not modify source sheets or automatically spend game resources.
- Keep the 73 coded game engines; add bounded arena/physical contest mapping with neutral mechanics for other games. Unknown systems remain generic.
- Add 16 system-adapter test groups and 4-system-by-73-game preview coverage, bringing the combined automated suite to **90 passing groups**. Full native rules integration, Forge and live two-client Foundry testing remain future work.


## 0.5.0-alpha.5 — Stage 5: Tactical arenas and performances

- Added **14 new fully coded alpha activities** spanning pit fighting, wizard duels, monster wrestling, rival performers, cooperative defence, training, survival, mounted arena combat and stealth, bringing the module to **73 coded / 58 planned** of 131 catalogued designs.
- Created a shared 9×7 turn-based arena reducer with orthogonal pathfinding, line of sight, obstacles, hazards, 2 AP per turn, stamina/focus pools, ability cooldowns, guard/evade/counterspell, grapple/pin/throw and game-specific objectives.
- Added **13 original kits, 44 base abilities** and an action allowlist; all player, GM and NPC moves pass through identical legality and scoring checks. A modified external actor sheet cannot introduce free attacks or unlimited stats.
- Added three levels of NPC difficulty, utility scoring of legal actions and limited counter-move lookahead at high difficulty. Eight original NPC dialogue personas and event-aware announcers provide original speech during combat and performance; NPCs can deliver their own victory lines.
- Added rotating bard audience preferences (heroic/comic/heartfelt), selectable performer delivery and novelty penalties for repeating a technique. NPC bards adapt their delivery to the current audience.
- Added a responsive clickable arena map, legal-target highlights, hit-point/resource meters, short CSS movement trails, ranged/magic projectile and impact animations, live narration and textual replay, and a reduced-motion alternative. This is not yet Foundry Scene token animation.
- Added NPC kit/dialogue/difficulty setup, GM pause/resume, GM NPC takeover/delegation, world-state migration to **schema 5**, replay and tournament hooks for supported 1v1 arena games, and completed match results.
- Introduced `pfa-arena-profile-v1` for bounded, GM-only *data-only* import from a future fighting-pit module. A concrete integration with the user's separate module still awaits its actual source/API; the stage does not alter D&D class data, sheet HP, equipment or real money.
- Added the original universal arena rulebook, extensive future professional fighting-pit tournament specification, data adapter contract and Stage 5 build/testing reports.
- Expanded automated tests to include 700 seeded fully automated arena matches (50 for each new activity), arena legality, permissions, grappling, counterspell, dialogue, tactical AI, UI, scene-independent replay, external profiles and tournaments. Older Alpha 1–4 tests remain part of the suite. Live Foundry v14/Forge and visual/keyboard accessibility certification remain open.

## 0.4.0-alpha.4 — Stage 4: Puzzle Forge

- Added **16 interactive cooperative Puzzle Forge engines**, bringing the module to **59 coded activities**, with **72 of 131 still planned**. New activities include the five-chamber Starforge giant-lore chain, original riddle tablets and cipher locks, symbol sequences, bell and tone-memory puzzles, lunar dials, mourning-text ordering, three-offering logic, linked choices, Sluice pipes, rotating gravity, keystone lights and sliding wardplates.
- Added **Puzzle Forge GM Studio** for a deterministic original-riddle book generator (1–12 riddles, seed and difficulty), custom linked puzzle packs (1–24 nodes), original progressive hints, game-specific answer validators and party scoring.
- Added a cooperative shared-puzzle lifecycle, late joining during play, optional GM-controlled NPC seats, shared clues and consistent victory/scoreboard integration.
- Added validated declarative Foundry Scene Region/Tile entrance bindings; on puzzle completion, change a scene Tile's visibility or a door Wall's open/closed state. Explicit script trigger API is available for GM-controlled Foundry Region workflows. No arbitrary user-authored JavaScript is executed from a puzzle pack.
- Updated world save format to **schema 4**, preserving compatible schema-2 and schema-3 world states, results, packs and tournaments. Added binding persistence and scene-effect retry reporting.
- Fixed a revalidation bug affecting final puzzle nodes with `next: null` after world reload; added assignment clearing, action guards and player-facing projection checks that omit answers/undiscovered nodes.
- Added responsive tactile puzzle UI, focus outlines and reduced-motion styles for puzzle interactions; provided original four-tone bell demonstration where WebAudio is available.
- Extended the full Node suite to **53 passing test groups**, including 160 complete seeded runs across the 16 new activities, 60 generated mechanical-puzzle solvability checks, persistence, access control and mocked Scene document updates. **Live Foundry/Forge multiplayer and responsive visual QA remain certification work.**

## 0.3.0-alpha.3 — Stage 3

- Added 8 advanced engines: Waterdeep Hold’em, Three Wyrms Ante, Dragon’s Trick, Bard’s Bluff, King’s Gambit, Elemental Conquest, Royal Hunt and native Wyvern Chess. Total: **43 coded**, **88 planned**.
- Added standalone source-based, modified native Foundry rules port of Wyvern Chess: Sky/Land/Underworld boards (12×8 each), 15 piece types, legal-move checks, freezes, cross-level moves, royal checkmate, basic AI and click-to-select squares. Original licence and attribution included; original art and complete Warlord AI not ported.
- Added private-hand projections for seven more card/strategy engines, original card-game logic, bounded fictional-point betting and turn validation.
- Added Tournament Hall for 2-, 4- and 8-person brackets, live linked matches, score-driven progression and GM-adjudicated draws with recorded audit.
- Added public historical snapshots for Stage 3 games and recorded chess-move board reconstruction; opponent private cards and concealed decks are not included in replay frames.
- Added three-step tutorials with eight clickable rules checkpoints and explanatory feedback (not full scenario-level animated practice).
- Upgraded persistence schema to v3 while accepting prior v2 state.
- Added and expanded simulation, native rules, tournament, replay, projection, migration and Foundry bootstrap tests. **Live v14/Forge testing and browser visual QA remain open.**


## 0.2.0-alpha.2 — Stage 2

- Added fifteen small activities: Dwarven Dominoes, Goblin's Bones, Goblin's Bluff, Giant's Grip, Cauldron Craps, Witches' Triad, Moonlit Solitaire, Wobblin' Goblin Drinking Contest, Giant's Skittles, Goblin Tankard Toss, Barrel Bash, Tinker's Lock Race, Fizzlenub's Feast, Ispin's Impossible Tale, and Goblin Breakdancing Corporation.
- Added turn-by-turn rule validation for the three new shared-table activities.
- Added GM Pack Studio for custom trivia, story, rune and slots content, including six slot symbols and three configurable payout rules.
- Added Coin of Fate modes and configurable round counts.
- Added world-setting persistence for tables, packs and the completed-game scoreboard. A GM host coordinates mutations and snapshots.
- Added per-recipient UI projections of hidden game state and player control checks. **Not security against a malicious socket participant.**
- Added Stage 2 rules, UI and simulation tests; expanded tests include seeded NPC games, 450 simulated shared matches and save/reload logic.
- Retained the 131-design master catalogue; 35 games are implemented as engines and 96 remain planned.
- Fixed an animation-cleanup issue that reset unrelated game controls after watching the three cups.

## 0.1.0-alpha.1 — Stage 1

- Introduced original Foundry VTT v14 module shell, 20 coded starter games and a 131-game planning catalogue.
- Added first-pass multiplayer lobby, GM-owned session manager, NPC controls, guided lessons and core rule unit tests.

**Development status:** All alpha releases remain uncertified against a live Foundry/Forge world. All game awards are fictional points. Production security, animations and accessibility remain outstanding.
