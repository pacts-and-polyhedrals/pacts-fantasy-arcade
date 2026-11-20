# Fantasy Minigames & Activities — Foundry VTT Module Blueprint
**Publisher concept:** Pacts & Polyhedrals · **Planning version:** 0.1.0 · **Date:** 19 November 2026

> This is a **design catalogue**, not an installed or tested Foundry module. Past-chat and Library searches were extensive but cannot guarantee total coverage of every historical conversation. Previously mentioned games are distinctly labelled; a prior tabletop rule is not a coded minigame.

## Product vision
A system-independent fantasy activity suite where players physically interact with tables, pieces, dice, instruments, vehicles, creatures, puzzles and sports fields in a shared session. A GM may watch, direct the event, or occupy a seat as an NPC with the same controls as the players. Every game has rules, animations, guided lessons, score/resolution logic and offline-compatible NPC opponents. D&D-specific skill modifiers are optional adapters rather than dependencies.

## At a glance
- **131 planned or recovered activities across 12 categories.**
- Existing standalone browser prototype: **1** (Wyvern Chess).
- Recovered historical tabletop game rules: **17**; earlier conceptual activities/puzzles: **36**.
- Previous Foundry puzzle macro: **1**; newly proposed game designs: **76**.
- Each row specifies a player-facing decision loop and an automated resolver. Some designs still require complete numeric rule sets, fairness tests, art and multiplayer certification.

## Source assets and provenance
| Asset | What actually exists | Reuse plan |
|---|---|---|
| Wyvern Chess | Playable browser prototype at https://pacts-and-polyhedrals.github.io/wyvern-chess/ with three 12×8 boards, Grukk AI, lessons, hints, pass-and-play, sprites and move log. GitHub: https://github.com/pacts-and-polyhedrals/wyvern-chess | Import or adapt the actual rules/render engine. Network play and Foundry windows are new work; inspect own project licensing and third-party content before distribution. |
| Lottie's Palace | Three-Dragon Slots, Waterdeep Hold'em, Black Dragon were developed and used at a table | Convert wagering and rolls to fully animated, authoritative shared experiences. |
| Waterdeep Franchise Fair | Bard, dance, drink, kart, jousting, range and maze mechanics were drafted; some remain story hooks | Convert skill-check-only contests into repeatable button/drag/aim/steer gameplay. |
| Kingfisher Festival | Fishing, egg-dash, hammer, food, storytelling and historical battle contests | Build festival venue pack and player/GM judging tools. |
| Wobblin' Goblin | Tavern drinking and monster-wrestling themes | Convert to repeatable crowd/stamina and grapple games. |
| Forgotten Realms Emoji Door Puzzle Generator | Earlier Foundry macro with click/drag ordering, chains, GM/player views and a reported DialogV2/FormData patch | Audit source code and migrate to a versioned puzzle plugin; live compatibility remains unverified. |
| Starforge / Giant Riddles / 1,111 Riddle Book | Interconnected relic clues and a larger riddle-book concept were discussed; completion of all 1,111 was not verified | Use an original, validated, tag-based riddle corpus and clue graph. |
| Vice & A Slice / The Smoke | Earlier Foundry v14 alpha with venues, activity presets, player/NPC interaction, spectator and tournament/replay experiments; live certification incomplete | Reuse patterns for authority, multiplayer, recoverable state and testing, not the modern setting. |

## Game library
**Provenance:** `Prototype` = independently playable web game; `Rules` = past tabletop rules, not coded; `Concept` = earlier idea/puzzle; `Macro` = prior Foundry macro, unverified live; `New` = proposed here. **Priority 1–3** organizes backlog, not implementation completion.

### Board & strategy (9)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Wyvern Chess | Prototype | 2 | Move fantasy pieces across Sky, Land and Underworld; outplay another seat or AI. | Validate legal moves and checkmate; animate captures, layer transitions, lessons, hint and AI turns. |
| Three Wyrms Ante | New | 2 | Build creature-colour sets, decide whether to raise, fold, or claim a trick. | Deal secret hands, calculate combos, resolve bets and animate dragon cards. |
| King's Gambit | New | 2 | Move six units on a tactical 5x5 court to capture a royal banner. | Enforce turns, line of sight, captures, promotions and positional AI. |
| Runestone Checkers | New | 1 | Jump opponent stones and decide when to awaken rune powers. | Highlight legal jumps, chain captures, trigger rune effects and score. |
| Dwarven Dominoes | New | 1 | Match glyph ends and choose when to play doubles for extra turns. | Place snapping tiles, enforce legal plays and update cumulative score. |
| Goblin's Bones | New | 1 | Draw bones and build scoring chains on a small table. | Shuffle bag, reveal glyphs, animate tile placements and detect patterns. |
| Elemental Conquest | New | 2 | Place fire, water, air and earth counters to capture territory. | Run adjacency and countering rules, animate elemental clashes and tally control. |
| Siege of the Seven Towers | New | 3 | Command small armies, supply routes and siege weapons on a hex board. | Pathfinder, attack preview, cover, turns, siege destruction and NPC strategy. |
| Royal Hunt | New | 2 | Track a disguised quarry on a hidden-information board. | GM-only clues, reveal and move log, deduction validation and chase animation. |

### Dice & wagers (15)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Three-Dragon Slots | Rules | 1 | Spin three symbol dice, hold reels or re-spin, then bank or risk a win. | Animated reels, 3d6 outcome/paytable, optional rigging, payout and history. |
| Crown & Bones | New | 1 | Roll five d6 up to three times, hold dice and fill scoring rows. | Dice physics/animation, holds, scorecard, legal rerolls and final ranking. |
| Goblin's Bluff | New | 1 | Secret-roll five d6 and raise, call, or challenge rivals' face-count bids. | Private cups, bid validation, simultaneous reveal and elimination. |
| Serpent's Seven | New | 1 | Roll two d6 to bank points or push again; doubles trigger danger. | Roll resolution, streak multiplier, bust display and dealer AI. |
| Devil's Knuckles | New | 1 | Roll four d6, lock up to two, then reroll once to form ranked patterns. | Pattern evaluator, lock toggles, animated rolls and instant scoring. |
| Giant's Grip | New | 1 | Bid on total of three dice and choose a safe or risky smash. | Escalating wager, smash animation, bust and point totals. |
| Lucky Kobold | New | 1 | Choose one of three runes and roll d4-d8-d12 to match the chosen omen. | Display odds, resolve pattern and animate small jackpot. |
| Wyrm's Eye | New | 1 | Guess whether the next d12 is higher, lower or equal to a visible die. | Concealed seed, reveal, streak limit and optional point-only mode. |
| Seven Skulls | New | 1 | Toss seven skull tokens; choose which to keep and when to stop. | Simulated throws, locked tokens, combination scoring and risk escalation. |
| Rune Yahtzee | New | 2 | Form runic straights, triplets or quintuplets across three roll phases. | Score sheet, pattern engine, dice holds and magical effect variants. |
| King's High Roll | New | 1 | Each player may reroll one die before comparing hidden totals. | Secret rolling, reveal, tie breakers, NPC decisions and bracket tracker. |
| Cauldron Craps | New | 2 | Bet on a point number and choose among fixed outcomes before dice fly. | Two-dice shooter, fair odds, rerolls according to point rules and ledger. |
| Witches' Triad | New | 2 | Roll d4, d6 and d8 and select a sequence to match an open prophecy. | Pattern matching, animated runes, score and streak badges. |
| Coin of Fate | New | 1 | Choose heads, tails or a tactical three-flip pattern. | Animated coin spins, deterministic settlement and simple tournament scores. |
| Pit Boss Wager | New | 2 | Predict results of an NPC skill contest without influencing the match. | Simulate bout with visible odds, payout and spectator reactions. |

### Cards & casino (10)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Waterdeep Hold'em | Rules | 1 | Play two private dice and three shared dice; check, call, raise or fold. | Keep private hands private, evaluate poker hands, run betting and payouts. |
| Black Dragon | Rules | 1 | Choose hit, stand, double or split against a dealer on d12 card values. | Dealer AI, hand totals, bust/natural payouts and Five-Card Wyvern bonus. |
| Three-Card Wyvern | New | 1 | Bet, then keep or swap one of three cards to form ranked hands. | Deck, card flips, hand strength and payout settlement. |
| Dragon's Trick | New | 2 | Bid how many tricks your hand will take and choose leading suits. | Deal, trump resolution, legal card enforcement and round scoring. |
| Bard's Bluff | New | 2 | Play facedown cards and decide whether to call another player's claim. | Secret hand UI, challenges, discard resolution and bluffing NPCs. |
| Devil's Contract | New | 2 | Draft one benefit and one hidden liability from a contract deck. | Contract reveal, scoring, penalties and animated signing. |
| Thieves' Tower | New | 2 | Lay route cards to climb a dangerous tower while sabotaging rivals. | Card placement, hazard map, progress and trap resolutions. |
| Moonlit Solitaire | New | 1 | Clear a fantasy solitaire layout with one-use magic moves. | Legal cards, undo, hints, scoring and solo completion animation. |
| Deck of Illusions Duel | New | 3 | Play illusion cards to bluff which creature is genuine each round. | Hidden cards, reveal and matching rules, NPC deception probabilities. |
| Fortune's Tarot | New | 2 | Order omen cards and deduce a hidden three-card fate pattern. | Shuffle seed, clue generation, verifier and narrated reveal. |

### Tavern & inn (10)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Wobblin' Goblin Drinking Contest | Concept | 1 | Choose careful sip, bravado or skip; remain standing as rounds grow harder. | Escalating endurance, wobble effect, audience banter, safe non-alcohol skin. |
| Wobblin' Goblin Monster Wrestling | Concept | 2 | Choose grip, feint, push or reversal to beat a fantastical opponent. | Grapple state, ring boundaries, reaction prompts and pin animations. |
| Arm-Wrestling at the Bar | Concept | 1 | Choose power, endurance or feint each exchange to move a pressure marker. | Resolve opposed tactics, animate arms, exhaustion and tournament bracket. |
| Darts of the Deep | New | 1 | Drag an aim reticle, account for sway, and choose riskier double rings. | Animated darts, scored board, wind/sway difficulty and best-of-three. |
| Giant's Skittles | New | 1 | Adjust angle, power and spin to knock over nine wooden pins. | Animate projectile and pin physics; score frames and NPC throws. |
| Goblin Tankard Toss | New | 1 | Flick small tankards into distant moving target barrels. | Projectile arc, collision, combo score and reset targets. |
| Tavern Trivia | Concept | 1 | Answer tiered lore questions, wager bonus points and steal questions. | Question packs, timers, randomized choices and scoreboard. |
| Barrel Bash | New | 2 | Bat a wobbling barrel toward targets while avoiding the barman's stock. | Momentum, collisions, breakage counter and timed scoring. |
| Bardic Karaoke | Concept | 2 | Choose words or timing prompts to match original tavern melodies. | Beat indicators, timing windows, score and applause animation. |
| Sly Fox's Three Cups | New | 1 | Track a marked stone while three cups swap increasingly quickly. | Animated shuffle, adaptive tempo, wager-free practice and reveal. |

### Performance & social (10)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Battle of the Bards | Rules | 2 | Choose song, flourish, crowd read, deception and final encore across rounds. | Rhythm/move prompts, crowd-meter reactions, judge scoring and NPC rivals. |
| Goblin Breakdancing Corporation | Rules | 1 | Mirror steps, freestyle, then collaborate in a three-round dance battle. | Pose prompts, timing windows, escalating score and duet playback. |
| Ispin's Impossible Tale | Rules | 1 | Build a tale from prompt cards and choose twists to impress judges. | Narrative card deck, judge traits, applause and voting overlay. |
| Festival Slam Poetry | Concept | 2 | Pair rhyme and emotion cards then select delivery cadence. | Timed line assembly, audience cues and dynamic scoring. |
| Jester's Roast | New | 2 | Choose witty retorts to match the audience's sense of humour. | NPC reactions, crowd preference, scoring and optional safety filters. |
| Masquerade Match | New | 2 | Ask one question per round to infer hidden masked identities. | Secret identity cards, clue tracking and revelation scene. |
| Tavern Rumour Auction | New | 2 | Bid influence for rumours; decide which hints sound trustworthy. | Hidden truth deck, sealed bids and ownership of clues. |
| Noble's Dance | New | 2 | Follow step diagrams and select partner cues under changing tempo. | Rhythm animation, partner sync, mistake recovery and dance-score display. |
| Trial by Debate | New | 2 | Choose arguments, evidence and rebuttals before a jury. | Dialogue tree, credibility meter, NPC jurors and verdict. |
| Bardic Duet | New | 2 | Two players alternate melodies and harmony prompts to keep a song alive. | Synchronized notes, shared combo, difficulty ramp and applause. |

### Combat & arena (9)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Fighting Pit Tournament | Concept | 2 | Choose attacks, guards, dodge or grapple over arena rounds. | Arena movement, attack telegraphs, stamina, damage and bracket. |
| Wizard Duel | Concept | 2 | Choose elemental stance, counterspell timing and cast range. | Resolve priority/counters, animate spell clashes and duel score. |
| Monster Wrestler Championship | New | 2 | Mount, pin, release or use the ring while a beast fights back. | State machine for grapples, NPC attack patterns and victory checks. |
| Shield Wall | New | 2 | Coordinate guard directions while attackers approach in waves. | Enemy pathing, shield arcs, collisions and survival score. |
| Arrow Storm | New | 2 | Dodge volleys and time return shots against moving targets. | Projectile trajectories, dodge zones, hit detection and waves. |
| Gladiator's Gauntlet | New | 3 | Survive sequential hazards with one-use stunts and crowd favours. | Hazard scheduler, stamina, NPC attack AI and elimination. |
| The Gloop | Concept | 2 | Rescue a captive from a gelatinous obstacle without being absorbed. | Position, slow zones, grapple countdown and animated rescue. |
| Melee Training Dummy | New | 1 | Strike indicated openings, block telegraphed attacks and build combos. | Tutorial animation, timing input, difficulty levels and damage-free score. |
| Arena Beast-Rider | Concept | 3 | Steer mount, time attacks and avoid marked danger arcs. | Mount movement, telegraphs, hit zones and NPC rival turns. |

### Racing & mounts (10)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Wizard Kart Racing / Sorcerous Circuit | Rules | 2 | Steer three laps; choose accelerate, defend, cast or hazard shortcut. | Lane/track movement, hazards, spell effects, d12 boosts and positions. |
| Dragon Jousting | Rules | 2 | Choose flight line, lance angle and shield/body target for three passes. | Mount path, hit zones, shield/body scores and knock-off animation. |
| Griffin Sky Rally | New | 3 | Pilot through rings, thermals and storm clouds with limited stamina. | 3D-like parallax rings, checkpoints, draft and aerial NPCs. |
| Broomstick Derby | New | 2 | Balance speed, altitude and corners through a city course. | Aerial lane positions, collision avoidance and wind effects. |
| Centaur Cross-Country | New | 2 | Choose routes, leaps and stamina pace over uneven fields. | Terrain costs, automatic running, obstacles and lap times. |
| Minecart Mayhem | New | 2 | Switch tracks, brake and duck supports in a dwarven mine. | Track graph, animated carts, hazards and crash recovery. |
| Infernal Quad Sprint | Concept | 3 | Drive soul-fuelled quad bikes around an infernal course. | Vehicle tokens, hazard events, fuel, overtakes and cinematic impacts. |
| Kingfisher Dash | Rules | 1 | Carry a fragile egg through crowds; choose pace and protect the egg. | Sprint phases, stumble animation, breakage tracker and placements. |
| Goblin Soapbox Grand Prix | New | 2 | Choose cart parts and pilot gravity-fed turns without losing wheels. | Build modifiers, steering, breakage and rankings. |
| Wyvern Obstacle Course | New | 3 | Command a wyvern over banners, rings and shifting ground hazards. | Mount pathing, jumping arcs, timing and checkpoint score. |

### Fantasy sports (10)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Magic Bowl | New | 3 | Command a 5v5 fantasy team to carry, throw, tackle or cast toward goals. | Turn-based pitch, ball physics, limited spells, NPC tactics and scoreclock. |
| Spellball | New | 2 | Pass an arcane ball while charging elemental goals. | Tile positions, pass intercepts, goal effects and team AI. |
| Runeball | New | 2 | Aim a glowing stone at rotating scoring rings and defend zones. | Target oscillation, projectiles, blocks and points. |
| Dragonball Aerial | New | 3 | Riders pass an orb between flying mounts under stamina constraints. | Flight lanes, interceptions, aerial trajectories and scoreboard. |
| Dwarven Stonecurling | New | 1 | Set force and spin, then sweep to place stones near the rune. | Stone movement, collision, friction and end-by-end score. |
| Goblin Goal Rush | New | 2 | Three-a-side chaotic football with traps and power-up zones. | Top-down passing, goalkeeper AI, traps and match clock. |
| Orcish Capture Standard | New | 2 | Move a four-person squad, steal the flag and guard a route home. | Grid routes, interception, respawn option and capture counting. |
| Enchanted Court Tennis | Concept | 2 | Aim shot direction, force and spin while magical walls shift. | Ball trajectories, bounce, rally count and line judge. |
| Giants' Boulderball | New | 3 | Control giants to shove huge balls into distant target arches. | Momentum, zone control, collision and team score. |
| Faerie Pitch & Putt | Concept | 2 | Select club, aim and power to navigate six enchanted holes. | Shot trajectory, terrain modifiers, putts and scorecard. |

### Festivals & carnivals (10)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Kingfisher Fishing Championship | Rules | 2 | Select bait and depth, hook fish, then balance tension while reeling. | Fish AI, bite chance, tension minigame, weight tally and prize. |
| Kattal's Hammer | Rules | 1 | Set stance, strike timing and push for a bigger final impact. | Hammer swing, strength meter, three attempts and leaderboard. |
| Founder's Fish-Pie Contest | Rules | 2 | Select fish, seasoning and cook times against judging criteria. | Ingredient timer, flavour balance and judge score. |
| Battle of High Hill Reenactment | Rules | 2 | Coordinate staged tactics and meet objectives before failures accumulate. | NPC waves, three-success/two-failure state and crowd outcome. |
| Horngrim's Amazing Maze | Concept | 2 | Navigate a fogged labyrinth and choose routes under time pressure. | Procedural maze, fog reveal, moving traps and finish timer. |
| Fizzlenub's Feast | Rules | 1 | Taste mystery dishes and decide to keep eating or stop. | d6 effects, reactions, reward reveals and optional food-safe skin. |
| Treant Moot | Rules | 2 | Speak to ancient trees, assemble their needs and persuade a council. | Dialogue states, nature clues, voting and forest rewards. |
| Deranged Range | Concept | 1 | Choose target priority and aim at pop-up magical targets. | Moving targets, arrow paths, wind and score. |
| Phoenix Nest Rescue | Concept | 2 | Traverse a timed obstacle course and carry a glowing egg to safety. | Checkpoints, heat tiles, rescue animation and team score. |
| Mr. Porcelain Doll Chase | Concept | 2 | Predict a darting doll's path through carnival stalls. | AI waypoints, evasive jukes, line-of-sight and capture timing. |

### Craft & skill contests (10)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Firebeard's Portable Forge | Concept | 2 | Balance furnace heat, hammer timing and tempering to make a blade. | Interactive heat gauge, strike targets, quality outcome and item reward. |
| Living Shrine Kitchen | Concept | 2 | Combine harvested ingredients into broths and defensive salves. | Recipe discovery, mixing sequence, reactions and ingredient ledger. |
| Alchemist's Crucible | New | 2 | Mix reagents in the correct order while pressure and heat change. | Reagent interactions, timing, discovery log and potion grade. |
| Enchanter's Etching | New | 2 | Trace glyph paths without touching unstable nodes. | Pointer path validation, sparks, time and engraving quality. |
| Tinker's Lock Race | New | 1 | Rotate pins and find the correct tension to open a lock quickly. | Lock geometry, tension feedback and speed ranking. |
| Herbalist's Hunt | New | 2 | Identify plant silhouettes and choose safe parts for a concoction. | Procedural herb display, lore hints and sorting feedback. |
| Merchant's Bargain | New | 2 | Make offers, bluff or trade extras to satisfy an NPC's hidden priorities. | Bargaining AI, tolerance threshold and shop ledger. |
| Guild Auction | Concept | 2 | Bid openly or secretly on unusual artifacts while tracking a purse. | Sealed bids, appraisal clues, settlement and reveal. |
| Siege Engineer's Range | New | 2 | Tune arc, angle and force to hit targets using a fantasy ballista. | Projectile simulation, wind and moving target evaluation. |
| Potion Sorting Sprint | New | 1 | Match bottles to shelf runes while avoiding unstable combinations. | Drag/drop, escalating pace, correct shelf and failure effects. |

### Riddles & logic (18)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Forgotten Realms Emoji Door Generator | Macro | 1 | Arrange symbolic clue tiles into a valid answer chain. | GM/puzzle views, click/drag ordering, hints, validators and door reaction. |
| Tomb of the Restless Grave | Rules | 1 | Deduce the word REST from a tomb inscription to open an entrance. | Solution validator, staged emoji hints, stone sliding and guardian response. |
| Starforge Giant Lore Chain | Concept | 2 | Solve linked giant riddles for relic locations and hidden Starforge lore. | Persist clue journal, dependency graph, reveal items and link rewards. |
| Night Serpent Emoji Ritual | Rules | 2 | Decode serpent-night-door-sun symbols and sequence three ritual chains. | Tile arrangement, spirit effects and Fear/Despair/Light resolution. |
| Scribe's Riddle Tablet | Concept | 1 | Order Moon, Giant and Flower inscriptions correctly. | Tile drag/drop, clue reveal and animated tablet response. |
| Bone Choir | Concept | 1 | Hear a rhythmic chant and place Red-White-Red bone sigils. | Audio cues, sequence check and crypt opening effect. |
| Crystal Gate Tone Lock | Concept | 2 | Reproduce musical pitches played by a crystal gateway. | Play tones, repeat sequence, error guidance and opening animation. |
| Tri-Moon Lock | Concept | 2 | Rotate lunar dials to match a three-moon alignment. | Simulated orbit dials, partial matches and gate unlock. |
| Grammar of Grief | Concept | 1 | Complete three sentences from a haunted archive. | Accept semantic answer variants, highlight clues and unveil next page. |
| Ink-Bound Door | Concept | 1 | Solve a language riddle to open a sigil-covered door. | Text validation, animated ink flow and alternate clue route. |
| The Three Hungers | Concept | 2 | Feed three mouths according to overlapping restrictions. | Choice board, constraints, reaction feedback and reset. |
| Weight Rhythm Echo Bridge | Concept | 2 | Move across bridge squares according to weight, sound and rhythm. | Tile states, timing windows, animated steps and bridge collapse. |
| The Sluice Sequence | Concept | 2 | Turn valves to direct water through safe channels. | Flow simulation, pipe rotation, pressure and flood consequences. |
| Rotating Gravity Room | Concept | 3 | Rotate a chamber to guide tokens to safe exits. | Animated gravity vectors, falling paths and collision checks. |
| Three Oaths | Concept | 2 | Match vows, speakers and consequences to open a seal. | Clue board, contradiction detection and seal state. |
| Keystone Lattice | Concept | 2 | Route arcane energy between keystone nodes without overload. | Node graph, live light paths and overcharge feedback. |
| Riddle Book Procedural Challenges | Concept | 2 | Select lore tier and solve generated original riddles with optional hints. | Template generation, answer synonym check, uniqueness log and hint ladder. |
| Wally-style Original Trap Builder | New | 3 | GM combines original clues, moving parts and fail-forward triggers. | Visual editor, solvability checks, animated mechanisms and export. |

### Magic & exploration (10)
| Activity | Source | Priority | What players actually do | What the module automates |
|---|---|---|---|---|
| Arcane Sealbreaker | New | 2 | Link rotating runes to dismantle a ward while avoiding alarm nodes. | Rune circuits, charge animation, alarm meter and success. |
| Familiar Racing | New | 2 | Guide small magical companions through a moving obstacle course. | NPC pathing, obstacle movement and finish timing. |
| Illusion Spotter | New | 1 | Find subtle differences between near-identical enchanted rooms. | Swap scene details, hit targets, clue hints and score. |
| Mimic or Treasure? | New | 1 | Test suspicious objects with a limited number of probes. | Hidden object attributes, physical responses and reveal. |
| Golem's Path | New | 2 | Place command runes to guide a golem across hazards. | Step-by-step token path, collisions, loops and goal check. |
| Shadow Heist | New | 3 | Move a thief through patrol routes and collect target objects. | Guard AI, vision cones, alarms and pathfinding. |
| Rune Fishing Beneath the Void | New | 3 | Search strange waters for relics while avoiding hidden creatures. | Sonar-like clues, hook controls, encounter pool and loot. |
| Dungeoneer's Trap Sprint | New | 2 | Select movement, leap or duck actions to traverse timed traps. | Scrolling hazards, timing and replay score. |
| Astral Whale Memory Weave | Concept | 3 | Reconnect shattered memories through constellations and images. | Narrative memory tiles, sequence validation and cinematic reveal. |
| Dimensional Gate Alignment | Concept | 3 | Turn four interlocking planar gates to align a desired route. | Rotation engine, portal animation, misalignment effects and route record. |

## Four D&D-style gaming sets — universally reskinned
| Familiar tool category | System-independent implementation |
|---|---|
| Dice set | All dice minigames, multi-dice patterns, bluffing, push-your-luck, wagerless variants. |
| Playing-card set | Deck engine, private hands, discard piles, ranked hands, trick-taking, solitaire, bidding and bluffing. |
| Dragonchess set | **Wyvern Chess**, retaining its own rules, rendering, AI and lessons; multiplayer requires new Foundry adaptation. |
| Three-Dragon Ante set | **Three Wyrms Ante**, with new original rules rather than reproducing a proprietary game. |
These four categories correspond to common D&D gaming sets, but the module should not hard-code a D&D rules system or redistribute protected game text/art.

## Experience rules — every activity must be playable, not just a skill check
1. Every activity needs **two or more meaningful decisions** per round (aim/power, move/defend, hold/reroll, choose/raise, route/time, build/repair, clue/hint).
2. Use an interactive playing surface: dragging cards or pieces; selecting cards; aiming shots; tap-timing rhythm; rotating valves; moving miniature tokens.
3. Show a **cause/effect animation** for every valid action, not a decorative random animation after an unrelated roll.
4. The same deterministic rules must drive player action, GM-controlled NPC action and automated NPC action.
5. Player decisions should be meaningful in default system-neutral rules. Optional attributes can adjust probabilities but should not replace gameplay.
6. Preserve solo vs NPC, player vs player, team/cooperative, GM-as-NPC and spectator modes when a particular ruleset supports them. A one-seat logic puzzle can instead offer GM hint-control.
7. Every game has a short guided lesson, a practice round, a real match, a result screen and an optional return-to-scene animation.

## Core user journey
```text
Interact with scene prop / activity menu
     -> select game, venue and optional variant
     -> lobby: seats, teams, player/GM NPCs, AI difficulty, entry fee/points
     -> guided animated lesson with skip and interactive practice
     -> authoritative turns, animation, NPC decision, score reconciliation
     -> end screen: replay, recap, leaderboard, optional approved world reward
     -> return to shared Foundry Scene / resume session later
```

## Architecture proposal
**Runtime:** Foundry v14; package manifest `module.json`; ApplicationV2 for custom minigame windows; PIXI/canvas displays and animations when game movement benefits from them; Foundry socket messages for shared intent; avoid undocumented private API. A standalone pure JavaScript game-core library must not depend on any Foundry system.

```text
fantasy-minigames/
  module.json                  # Foundry metadata and compatibility
  src/core/game-registry.mjs   # Discover game definitions and available modes
  src/core/session-engine.mjs  # Turn state-machine, validation, timers, recovery
  src/core/host-authority.mjs  # GM or elected host validates actions
  src/core/dice-and-rng.mjs    # Verifiable or logged RNG with deterministic replays
  src/core/seat-and-npc.mjs    # GM seat, player seat, NPC AI/personality
  src/core/economy.mjs         # Optional points/coin ledger, safe replay protection
  src/core/tutorials.mjs       # Lesson cards and sample turn simulation
  src/core/adapters.mjs        # Optional game-system roll/wallet adapters
  src/ui/activity-browser.mjs  # Game catalogue, search, skill and venue categories
  src/ui/shared-game-window.mjs# Shared player board, per-player private info
  src/ui/gm-director.mjs       # GM referee and NPC role/override tools
  src/games/<game-id>/          # Rules, reducer, view, tutorial, NPC policy, tests
  packs/                      # Original prompts, scenes, rules and NPC packs
  assets/                     # Sprite sheets, backgrounds and SFX
  lang/en.json                # Localization; later es.json etc.
  tests/                      # Unit, simulation, replay, integration, GM/player
```

### Canonical event / state contract
```json
{
  "sessionId": "uuid", "gameId": "goblins-bluff", "phase": "active",
  "version": 14, "actionNumber": 18, "currentSeat": "seat-2",
  "publicState": {"round": 3, "lastBid": "four sixes"},
  "privateStateBySeat": {"seat-1": "encrypted-or-owner-only-reference"},
  "lastValidatedAction": {"seat": "seat-2", "type": "challenge"},
  "outcome": null
}
```
Important: the example is a schematic, not a secure implementation. Hidden dice, cards and puzzle answers must **never** be broadcast to unauthorized clients, whether obscured in CSS or embedded in ordinary shared data. Apply true recipient-scoped access and ensure world storage is permission-protected.

### Game director modes
- **Referee:** GM sets stakes, safety, scoring, entry requirements and fair-play settings; can pause or void a match with an audit trail.
- **Play as NPC:** GM chooses a character, takes a visible seat and receives the same controls a real player would; no extra information except permitted GM referee tools.
- **NPC auto:** rule-specific AI selects legal moves with configurable risk, bluff, aggression, skill and personality; Grukk remains the Wyvern Chess teacher.
- **Hybrid:** GM can hand an NPC seat to AI and reclaim it between turns; no mid-turn double action.
- **Spectator:** watch animations and public outcomes; private hands/dice/puzzle solutions remain hidden where appropriate.

### Animated teaching engine
- Intro in-game character demonstrates a move; movement/path appears in a ghost preview.
- Player performs same move in a safe sandbox; wrong attempts explain the specific rule, not merely display failure.
- Tutorial teaches the minimal objective first, then optional tactics and advanced variants.
- Help button can replay the action or give one progressive hint; auto-advance is optional.
- Reduced-motion mode, keyboard-only control, captions and readable labels must be provided.

## Dice and card engines — first shared implementation
**Dice:** dice notation, custom faces, shake/throw/hold/reroll, secret cups, patterns and match history, deterministic scoring; supports 1d4 through 1d20 as well as mixed dice. Rolls that affect a shared game must be validated by host and logged before animations.

**Cards:** seeded shuffled decks, per-seat hands, shared board/dealer, betting rounds, trick evaluation, discard/replace, hide/show, hand hierarchy, blind/visible AI decisions.

**Odds and wagering:** points-only by default. In-world fictional gold/tokens are optional and require GM approval, a stake cap, safe atomic transfers, no duplicate payouts, no real-money transactions and a plain-language odds/paytable screen where appropriate.

## First vertical slice (10 games + chess bridge)
| Sequence | Activity | What it proves |
|---|---|---|
| 1 | Three-Dragon Slots | RNG, animation, ledgers |
| 2 | Crown & Bones | Dice holds, scorecards |
| 3 | Goblin's Bluff | Private information and bluffing AI |
| 4 | Black Dragon | Dealer AI, multi-action turns |
| 5 | Darts of the Deep | Aiming and projectile animation |
| 6 | Arm-Wrestling at the Bar | Tactics and NPC reaction |
| 7 | Runestone Checkers | Legal moves, turn-based board AI |
| 8 | Tavern Trivia | Question packs, tutorial, timers |
| 9 | Forgotten Realms Emoji Door Generator | GM/player separation, solvable puzzles |
| 10 | Kingfisher Fishing Championship | Moving agents, tension and a contest leaderboard |
| 11 | Wyvern Chess bridge | Review/use existing web rules and lessons; Foundry multiplayer later |

This is the **first certification slice**, not a claim that any of these Foundry game modes have been implemented. Release the foundations with a few stable games, then finish the slice before broad expansion.

## Release / certification checklist
- **Rules:** legal-action tests, illegal-action rejection, exact scoring outcomes, tie handling, repeatability, no impossible states.
- **Multiplayer:** host/GM and at least two real clients; concurrent decisions; reconnect, late join and mid-round departure; distinct account permissions.
- **NPC:** 1,000+ seeded AI-vs-AI sample matches per core game for crashes/imbalances; strategy difficulty verified separately; GM can take a seat.
- **Fairness:** no secret-card leakage; no replay/duplicate settlement; RNG logs; house edge/odds documented when wagers are enabled.
- **Animations:** identical outcome across clients; replay shows same sequence; reduced motion still communicates results.
- **Compatibility:** core Foundry v14 test world, Forge-hosted world, no-system-specific default and optional D&D5e adapter.
- **Authoring:** GM can customize venues, match length, scoring, rules variants, NPC profile and reward packs without changing code.
- **Accessibility:** readable symbols, alternative text for emoji, non-color-only feedback, optional turn timer, translation readiness.
- **Licensing:** original rules/assets; separate credit for previous inspirations; ensure rights/permission before commercial bundling.

## Known gaps and decisions
1. Source code of the past Emoji Door macro and Vice & A Slice must be recovered/audited before claiming reuse of their implementations; only archive descriptions were checked here.
2. The 1,111-riddle book and the 50+ interconnected giant puzzle programme were requests/concepts; the full finished corpus was not verified.
3. Public Wyvern Chess is not currently proven to be true remote multiplayer, even though it has pass-and-play and AI.
4. Most 131 game candidates are definitions/backlog entries, not finalized balanced numerical rulebooks. Ship tested engines first.
5. Puzzle-builder patterns can be inspired by Wally DM puzzle design, but published puzzle text/mechanisms should not be copied wholesale into a commercial content pack without rights.

## References (public)
- Wyvern Chess live: https://pacts-and-polyhedrals.github.io/wyvern-chess/
- Wyvern Chess repository: https://github.com/pacts-and-polyhedrals/wyvern-chess
- Foundry v14 public API: https://foundryvtt.com/api/v14/
- Foundry module authoring: https://foundryvtt.com/article/module-development/
- Wally DM puzzle category finder: https://wallydm.com/wiki/dnd-puzzles/

