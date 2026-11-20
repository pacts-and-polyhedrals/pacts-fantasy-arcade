# Alpha 5 — Release Verification and Live Test Checklist

**Release candidate:** `0.5.0-alpha.5` • **Foundry:** v14 targeted • **Mode:** development alpha, no real-world/valuable-world wagering.

## Verified by automated tests and code review

- [x] Foundry module manifest has valid JSON and entrypoint is present; JavaScript source passes syntax checks.
- [x] Catalogue includes all 131 unique designs, with exactly 73 coded Alpha 1–5 and 58 planned; unimplemented entries not exposed as playable.
- [x] Previous 53 Alpha 1–4 test groups continue to pass: legacy dice/card/board, game packs, AI, puzzle, saved world, scene-binding mocks and tournament logic.
- [x] 14 new arena engines share a deterministic action API, legal two-AP turns, pathfinding, blocked ranged shots, resource costs, conditions, and own victory conditions.
- [x] Every new mode completes 50 seeded NPC-vs-NPC matches without hanging: 700 complete match simulations in Stage 5 suite.
- [x] Tests explicitly cover spell counters, grapples, pins, ranged attacks, hazards, rescue, stealth, and game-specific scoring.
- [x] NPC action selections use only legal moves; crowd-aware bard delivery and scripted personality dialogue are tested.
- [x] GM may configure a permitted arena kit/persona/difficulty, control/delegate NPC seats, pause/resume, and launch eligible 1v1 tournament matches.
- [x] Arena profiles use a strict bounded `pfa-arena-profile-v1` contract; non-GM imports and unsupported stats/protocols are rejected.
- [x] Public arena timeline/events are bounded and JSON-serialisable; active arena saves restore under schema 5 and older schema 2–4 migrate.
- [x] Tactical UI contains button-grid movement, costed actions, narrator and action history, public replay, ARIA cell labels and a reduced-motion branch.
- [x] Spell/arrow animations, impact effects and responsive layout styles are included and unit-tested at markup level.
- [x] ZIP archive integrity, release file tree and manifest compatibility are checked at packaging.

## Not yet verified — explicit blockers to production declaration

- [ ] **Actually install** Alpha 5 in Foundry v14 and test with two or more connected client browsers, one GM and one/multiple player.
- [ ] Hosted **Forge** install and remote connectivity; package has no published public manifest or update URL.
- [ ] Conflicting commands, concurrent GMs, disconnected clients, session recovery and group spectators under real socket load.
- [ ] Test every visual action in a browser at desktop and mobile widths. The available headless-browser screenshot run timed out, so live visual QA is *not* claimed.
- [ ] Keyboard-only navigation, screen-reader announcement order, contrast ratios, focus rings and reduced-motion under actual client conditions.
- [ ] NPC performance under real-world browser load when using 8-person knockout (series of sequential 2-person games).
- [ ] Interactive training lessons with real animations, tutorial practice scenarios and voice/crowd sound options.
- [ ] Character sprite animations or native Foundry Scene token/Region driving; currently UI uses DOM/CSS tactical cells and effects.
- [ ] Exhaustive character-kit balance (e.g. 1,000+ matches *per matchup*), player first-seat advantage and competent tactical difficulty beyond bounded heuristic rules.
- [ ] Concrete compatibility with the other existing fighting-pit module: exact code and API were not available for Stage 5.
- [ ] Authenticated authoritative networking and secret integrity against malicious clients; Foundry module sockets alone do not provide anti-cheat guarantees.
- [ ] Multi-actor arenas, professional leagues and full-season progression. Stage 5 matches are exactly 2 seats.

## Local Foundry v14 acceptance walkthrough

1. Back up `Data/worlds` and `Data/modules/pacts-fantasy-arcade`, stop Foundry, replace the module folder with this ZIP's top-level `pacts-fantasy-arcade/`, restart, and enable in Manage Modules.
2. Confirm **73 playable** entries / 131 total designs. Start an older Stage 3 card game, then a Stage 4 Puzzle Forge puzzle, and confirm prior content still functions.
3. Create a **Fighting Pit Tournament** table: one player, one NPC. In the lobby set permitted character kit, persona and difficulty. Start. Verify 2 AP, action legality, movement, stances, stamina/focus and turn handoff.
4. Move adjacent and attempt **Grapple**, then **Throw/Pin** in a Monster Wrestler Championship. Verify hold/break states and two-pin victory; also test a blocked pin when no grapple exists.
5. Start **Wizard Duel**. Block line of sight with a pillar, use Ember and Frost only when legal, raise Counterspell on one turn and confirm the next magic attack is blocked, then test Blink and Thunder Wave.
6. Start **Battle of the Bards**. Try different styles for the same performance under the current audience preference, step onto Spotlight, use Rebuttal and Encore, and observe preference changes and novelty penalties.
7. Start each cooperative challenge: Bardic Duet, Shield Wall, Arrow Storm, Gloop and Shadow Heist. Confirm goals, wave timing, hazard state, score and success/failure. Note these are 2 active seats, not a 4-player squad.
8. In the arena UI, turn on reduced-motion settings and verify no movement/projectile effects while text still communicates every event. Test tab navigation, tooltips, and viewport widths.
9. Let the GM **take control of an NPC**, make a legal ability choice, then **delegate back to AI**. Check that the AI uses legal actions and the action ledger reflects each choice. Pause, resume and observe as a spectator.
10. Create an eligible **four-participant knockout tournament** and complete two qualifying matches plus the final. Verify advancement, completed results, and if a draw occurs, GM resolution is auditable.
11. Save/reload world state mid-arena and after a tournament, then restore a saved Alpha 4 world snapshot in a disposable world to check migration. Verify prior custom packs and scene bindings survive.
12. In a test world, try `game.pactsFantasyArcade.arena.makeProfile(...)` and GM `importProfile(...)`. Confirm only the contest profile changes and that a source RPG actor's HP, spell slots, XP and inventory remain untouched.
13. Only after successful two-client Foundry and Forge tests, UI checks and external module compatibility tests should a stable release be considered.

## Security policy for this alpha

No real-money stakes, cash prizes or in-world valuable betting pools. The module must not be represented as adversarially secure. GM-only checks in the reducer and session manager provide a useful cooperative-table boundary, **not cryptographic sender verification**. A future trusted relay or server is required for secure competition.

## Alpha 5.1 system bridge acceptance (automated tests pass; live checks remain)

- [x] Detect native system IDs `imagi-nations`, `dnd5e`, `pf2e`, `daggerheart` and legacy Imagi alias.
- [x] Read known sheet fields; cap assistance at +2 and arena modifiers at the existing strict limits.
- [x] Prevent imports of Imagi learner Actors, party/environment/loot containers, private identity/learner details and whole-world Journal content.
- [x] Validate all 73 activity previews under each of four supported systems using mock Actors.
- [x] GM permissions, save/reload, actor immutability and unknown-system fallback tests pass. Public player snapshots redact private world references and Daggerheart Experience hints.
- [ ] In a live Imagi-Nations world (current published system), verify 10-stat path, Entertainer/Sorcerer kits and learner exclusion.
- [ ] In a live D&D 5e world, verify Fighter/Bard/Wizard imported arena kits and no changed character resources.
- [ ] In a live PF2e world, verify trained/untrained/legendary ranks and source-sheet immutability.
- [ ] In a live Daggerheart world, verify subclass casting trait, appropriate Experience hint and unchanged Hope/Stress.
- [ ] In each world, test assigned User Character auto-match, manual GM approval, Scene/Journal reference links and reconnect in a real GM+player session.
- [ ] Check accessible keyboard/touch use on the GM Actor picker and responsive displays.
