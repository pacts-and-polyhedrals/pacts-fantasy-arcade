## Stage 5.1 — System-aware character integration (implemented alpha, pending live verification)

First-class adapters now prioritise **Imagi-Nations RPG, D&D 5e, Pathfinder 2e and Daggerheart**, with cautious ID/field detection and an identity-only fallback. GM-approved Actor links supply optional capped arcade affinities, arena kits and physical contest allowances, not full native class mechanics or sheet updates. Imagi-Nations learner/private education records cannot be imported. Daggerheart Experiences remain GM-reviewed advice; its Hope/Stress and Imagi Help/Power Cards are not consumed.

The next acceptance step is to test each of these four systems in its own disposable Foundry v14 world, first GM-only then live two-client gameplay. Follow `docs/CHARACTER-IMPORT-SYSTEMS.md`. Expansion to real system native rolls and approved reversible sheet effects is future work.

# Fantasy Arcade — Development Roadmap

**Current code release:** `0.5.0-alpha.5` • **Foundry:** v14 target • **Registry:** 131 proposed designs, 73 coded game engines, 58 designs not yet implemented.

This roadmap prioritises small, reusable games before complex arenas, magic sports, and the Sorcerous Circuit. An item may be coded but is **not considered certified for live use** until it has passed Foundry and Forge integration testing.

## Stage 1 — Core platform (coded in Alpha 1)

Twenty games implemented in the original alpha: Coin of Fate, Wyrm's Eye, Serpent's Seven, Lucky Kobold, King's High Roll, Devil's Knuckles, Three-Dragon Slots, Seven Skulls, Crown & Bones, Arm Wrestling at the Bar, Kattal's Hammer, Darts of the Deep, Sly Fox's Three Cups, Tavern Trivia, Tomb of the Restless Grave, Emoji Rune Door, Potion Sorting Sprint, Black Dragon, Three-Card Wyvern and Runestone Checkers.

Shared features: Foundry module manifest, ApplicationV2 game hub, local rules engines, hosted tables, NPC seats, GM takeover and tutorial panels.

## Stage 2 — Small games and GM tools (coded in Alpha 2)

**15 additional games:** Giant's Grip, Goblin's Bones (shared memory competition), Dwarven Dominoes (shared domino chain), Goblin's Bluff (shared hidden-dice bidding), Moonlit Solitaire, Wobblin' Goblin Drinking Contest, Giant's Skittles, Goblin Tankard Toss, Fizzlenub's Feast, Tinker's Lock Race, Ispin's Impossible Tale, Goblin Breakdancing Corporation, Cauldron Craps, Witches' Triad and Barrel Bash.

**Infrastructure developed:** per-user public game projections that hide other players' hands in normal gameplay; world-setting persistence for tables, pack definitions, and results; GM Pack Studio for trivia, story, rune and Three-Dragon Slots packs; editable six-symbol slot paytables; Coin of Fate short and streak variants; new controls, game-specific lessons and game-specific NPC move generation. Multiple seeded simulations and rules/UI rendering unit tests are included.

**Stage 2 items still open:** actual secure transport with trustworthy client identities (Foundry module sockets alone are *not* an anti-cheat protocol); consistent real-time clocks and pause control; fully animated cup/dice/throw timelines beyond existing CSS effects; a fully accessible keyboard/screen-reader audit; expanded NPC personality presets; live host failover integration; certified scene tile bindings and high-confidence browser screenshot verification.

## Stage 3 — Advanced casino, tournaments, native Wyvern Chess (coded in Alpha 3)

**Eight additional interactive implementations:** Waterdeep Hold’em, Three Wyrms Ante (original rules), Dragon’s Trick, Bard’s Bluff, King’s Gambit, Elemental Conquest, Royal Hunt and a **modified native Wyvern Chess port**. There are now **43 coded game engines** from the 131-design registry.

**Infrastructure developed:** shared card-hand reducers and per-user projections, 4 poker betting streets with fictional points only, trump/follow-suit trick logic, interactive tile/lanes, scene-independent native three-board chess, AI legal-move selection, 2-/4-/8-participant knockout Tournament Hall, GM adjudication audit, saved brackets, public-only match replay and clickable guided-lesson checkpoints. Node simulations cover 60 complete matches of each new non-chess activity and tournament/store/replay tests. Original Wyvern Chess licence is included.

**Stage 3 still open before stable shipping:** live two-client Foundry/Forge testing, high-fidelity animated pieces and dealing, input handling with long turn sequences, comprehensive AI tuning (Grukk Warlord) and original Wyvern full lesson course, browser-version rules parity tests, competitive identity/secret-hand security, responsive visual QA, accessibility/screen-reader testing and faster all-NPC chess tournaments. No real-world betting or wallet integration is planned.

## Stage 4 — Puzzle Forge and adventure scenes (coded in Alpha 4)

**16 new cooperative activities**, for **59 coded engines** from the 131-game catalogue: Starforge Giant Lore Chain, Night Serpent Emoji Ritual, Scribe's Riddle Tablet, Bone Choir, Crystal Gate Tone Lock, Tri-Moon Lock, Grammar of Grief, Ink-Bound Door, The Three Hungers, Weight/Rhythm/Echo Bridge, Sluice Sequence, Rotating Gravity Room, Three Oaths, Keystone Lattice, Riddle Book Procedural Challenges and Wally-Style Original Trap Builder (original mechanics, no borrowed asset pack).

**Implemented systems:** 12 reusable puzzle reducers; visual interactive board controls; hints and party score; five-stage Starforge lore rewards; safe per-user projection omitting undiscovered clues and solutions; late-join cooperative lobbies; GM puzzle-pack editor (1–24 validated and connected nodes); deterministic original riddle-pack generator with seed/count/difficulty; world schema-4 saves; declarative Region/Tile source bindings and Tile visibility/Wall door-change rewards; experimental GM-host token enter detection and explicit GM script API. The assignment selector supports clearing prior choices; original four-tone audio lessons are optional and accompanied by text equivalents.

**Verification:** 160 complete seeded puzzle solutions plus 60 extra generated puzzle solver checks, action permission tests, progression, pack validation, world save/reload and mocked Scene updates, along with all original Alpha 1–3 regressions. Node suite has 53 passing test groups.

**Stage 4 limitations and hardening backlog:** tests with two remote Foundry v14 clients and actual Region/Tile/Wall documents; verify Scene/Tiles that have rotation and nonstandard grids; stable multi-GM failover; deliberate trigger cooldown/restart and tile restore controls; scene event automation when the active GM disconnects; independent authoritative server and secure secrets; full animation, captions/audio cues, accessibility and screenshot QA; larger original clue banks and procedural logic-grid generation beyond curated templates. The riddle generator shuffles **validated authored riddles** rather than inventing unvalidated riddles with an LLM. The scene workflow is experimental until verified live.

## Stage 5 — Performance, combat pits and arenas (coded in Alpha 5)

**14 new implementations, reaching 73/131 coded engines:** Battle of the Bards, Festival Slam Poetry, Trial by Debate, Bardic Duet, Fighting Pit Tournament, Wizard Duel, Monster Wrestler Championship, Shield Wall, Arrow Storm, Gladiator's Gauntlet, The Gloop, Melee Training Dummy, Arena Beast Rider, Shadow Heist.

**Shared foundations shipped:** 9×7 arena board; movement, obstacles and line-of-sight; two-action turn economy; stamina/focus and cooldowns; attacks, guards, grapples/pins, spell counters, projectiles and arena hazards; performance score and rotating crowd tastes; three-level tactical NPC evaluation and eight character dialogue packs; GM NPC takeover and pause; matches, replay, tournament and persistence integration; reduced-motion 2D CSS animations; bounded `pfa-arena-profile-v1` import contract. Includes a complete published rules reference and professional fighting-pit tournament expansion specification.

**Not yet production-ready:** two-client live Foundry/Forge certification, actual scene-token animations, 3D/mount movement, >2 active fighters, sophisticated opponent planning/learning, full cinematic dialogue/voice, a secure authenticated multiplayer transport, and a concrete adapter to the separate fighting-pit module. The earlier module's source/API was not available, so only a safe profile handshake has been implemented.

**Future Stage 5.1–5.4:** live certification, professional refereeing, multi-actor initiative, expanded leagues and seasons, full external module rules/reward handoff with its source, authored NPC dialogue packs and improved scene animations. See `docs/FIGHTING-PIT-TOURNAMENTS-DESIGN.md`.

## Stage 6 — Team fantasy sports

Start with Dwarven Stonecurling and Boulderball to validate shared ball simulation; then Spellball and **Magic Bowl** with pitch movement, ball ownership, tackling, team AI and tournament seasons.

## Stage 7 — Racing and mounted competitions

Implement a common animation/simulation engine for paths, acceleration, checkpoints, collision and spectator replay. Progress Kingfisher Dash → Griffin Rally → Dragon Jousting / Minecart Mayhem → **Sorcerous Circuit**. Do not substitute skill-check-only races for actual player-controlled steering, maneuvers and tactical choices.

## Acceptance gates for every stage

- Original, system-independent rules with meaningful player decisions, documented victory conditions and guided tutorials.
- GM can run the activity, control an NPC seat or delegate that seat to the automatic opponent.
- Deterministic state transitions under test; no trusting client-supplied outcomes; reproducible integration scenarios.
- Accessible alternative controls and reduced-motion settings; clear labels independent of colour.
- Explicit handling of hidden information, reconnects and suspended sessions; do not advertise adversarial security without an identity-verifying server.
- No real-money or valuable-world wagers.
- Node unit/simulation tests, UI tests, two-client Foundry v14 tests and Forge host tests before stable release.

**Next development target:** certify Alpha 5 in a real two-client Foundry v14/Forge world, identify the actual separate fighting-pit module for an adapter, then expand the arena engine for multi-actor squads and professional leagues before Stage 6 Magic Bowl and Stage 7 Sorcerous Circuit.
