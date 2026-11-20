# Fighting Pit Tournaments — Full Expansion Specification

**Status:** Forward design after Stage 5. **Shipped today:** two-seat arena contests and 2/4/8-person single-elimination Tournament Hall. **Not shipped:** persistent professional league, team battle royale, injury progression, external module economy, crowds as NPC Actors, battlemap token engine or multi-combatant squads.

This specification establishes a future professional-scale fighting-pit system using the current reusable Stage 5 arena action/movement engine, without replacing a separately existing fighting-pit/downtime module. Where another module already owns rankings, fatigue, contacts, sponsorships, combat classes or earnings, **that module must remain the source of truth**. Fantasy Arcade should report match results, not overwrite its progression rules. The external module's precise source and API have not yet been supplied/verified.

## Tournament world model

A tournament consists of a stable ID, type, host venue, ruleset, roster, rounds, standings, eligible teams, referee rulings, match timeline, winner and auditable results. The complete system needs both persistent *season state* and a temporary *match state*. A match result is immutable once accepted, except for a separate audited GM correction. Every competitor is tied to a stable character identity but may use a fantasy-arcade-native kit instead of a D&D character sheet.

### Competition formats

| Format | Future participants | Key rules | Existing building block |
|---|---:|---|---|
| Single-elimination knockout | 2/4/8 existing; 16/32 planned | Pairings, seeded brackets, byes, draws requiring overtime or GM ruling | Shipped Tournament Hall |
| Best-of-three duel series | 2 | Contest resets between bouts, persistent match points, finals overtime | Arena match reset and scoreboard |
| Round-robin league | 4–16 | Every player competes against every rival; points for W/D/L and strength of schedule | Same 1v1 arena results |
| Swiss-system festival | 8–32 | Pair players with similar records and avoid repeat matchups | Future pairing algorithm |
| Team tag bouts | 2 teams, 2–5 each | Substitution, limited active fighters, control swaps, shared fatigue | Requires >2-seat match engine |
| Team-based Shield Wall | 2–6 allied heroes | Separate AI combatants and wave score | Prototype co-op 2-seat defend |
| Gauntlet / King of the Hill | 1 champion, sequential rivals | Track between-round health and ranked consecutive wins | Survival duel and scripted waves |
| Battle royale | 4–12 | Multi-target AI, temporary alliances, elimination, last standing | Requires >2-seat tactical engine |
| Mounted contest | 2–8 | Different rules for mount stamina, lane/trajectory, rider strikes | Beast Rider, future aerial movement |
| Arcane invitational | 2–16 | Wards, legal school of magic, nonlethal counter-based point scoring | Wizard Duel |
| Bardic Cup | 2–16 | Judges, moving crowd tastes, duets and judged rounds | Battle of the Bards |

Each format must have a declarative GM setup screen for roster, rules, permitted class profiles and permitted map/event preset. A valid pair of player/AI/GM-controller seats should be playable independently before any advanced league support is exposed.

## Fight contracts and referee decisions

**Match contract** (before the first attack): exhibition/competitive, nonlethal/knockout allowed, equipment restrictions, permitted magic, win condition, bout timer, rest between rounds, spectators, outside assistance permitted/forbidden, tie procedure and optional handicap from validated profile modifiers. Default should be nonlethal fictional contest resources. The core reducer rejects illegal ability uses, but a GM can issue warnings, pause combat, disqualify a contestant or explicitly declare a referee ruling (planned). Never infer cheating simply because the AI lost.

**Exhibition:** The game can be won by score, pins or surrender. **Tournament:** Official result must include winner, mode, round, recorded decisive action, reason, ruling type and independent verification checksum/ID. **Final:** Multiple spectators and richer intro/outro dialog should not change any combat calculations.

**Draw handling:** In the current alpha, only a GM adjudicates a draw in brackets. Future revisions should offer an optional **sudden-death overtime**, best-of-three decider or audience/judge score weighting, with transparent published rules and no invisible GM fiat. The referee override remains a privileged, audited action.

## Competitor dossiers, styles and progression

A competitor may have arena display name, portrait/icon, appearance, voice/persona, primary/secondary style, experience tier, nonlethal health resource, initiative rating, rank, win/loss/draw history and a public victory title. Profiles from D&D or other systems are **converted into bounded arcade attributes only** so a level 20 character cannot arbitrarily dominate a level 3 character merely by importing inflated sheet numbers. The native kit has an explicit power budget; a source-system adapter must preserve relative fairness and disclose modifiers to the GM.

Suggested career tiers (future, not implemented): **Amateur → Journeyman → Champion → Master → Legendary**. A season engine can offer training choices, small mutually exclusive technique unlocks and faction reputation. Since another fighting-pit module may already supply these mechanics, Arena should *not* add permanent effects to world actor data unless the user explicitly enables that integration and the external module supports it.

Proposed balancing approach: rate every kit and specialization over at least 1,000 seeded matches against all other legal combinations, compare first-player advantage, arena advantage, KO/decision ratio, stamina exhaustion frequency and AP usage. Track ratings (Elo/Glicko) only after sufficient matches. Publish the raw balance matrix and versioned rule changes, rather than silently handicapping specific NPC rivals.

## NPC character agency and tactical threat

NPC opponents need **distinct tactics and a reason to win**. Future personality profiles should supply opening plan, preferred distance, risk tolerance, resource conservation, use of cover, aggression at low health, response to a grapple, willingness to surrender, crowd interaction and tactics against familiar opponents. These should parameterise the shared score function; they must never grant free actions. A champion may counter the player's preferred tactics because it has studied previous bouts; mechanically that should be a versioned scouting system with an explicit limit, not the engine cheating by looking at future random rolls.

A fighter should learn in the sense that it can *remember the public history of the current match* (e.g. rival repeated a Heavy Strike twice, then Guard), not retain a private unapproved cross-world record of specific users. Opponents can call out publicly observable attacks, insults, titles, team badges and tournament standings via original script templates. Let the GM opt in to custom dialogue packs with appropriate safety filters for insult content.

**Current alpha baseline:** legal-action utility scoring, three skill settings, one-ply anticipation at highest difficulty, eight scripted personas, varied movement and resource spending, unique mode objectives and no out-of-engine magic powers.

## Arena scene presets and simulated systems

### Environment types

1. **Bare pit:** clear square grid for basic footwork and clean tournament adjudication.
2. **Stone ring:** knockback corridors and boundary hazards (no hard ring-out currently).
3. **Mages' circle:** blocking pillars, cover, ward lines, elemental hazards and counter spells.
4. **Beast pen:** grappleable monster, breakable obstacles and crowd pressure.
5. **Bardic stage:** spotlights, balconies, contest judges and audience preference shifts.
6. **Gauntlet:** scripted round-triggered traps and hazards.
7. **Mounted arena:** mount/rider state, charge lanes and future path animations.
8. **Fortress:** co-op defence, gate HP and wave spawning.

A scene preset should declare its board/canvas dimensions, obstacle cells, legal spawn points, named regions, trigger types, animation IDs and obstacle timing. The engine should be able to reproduce a match from its seed and action log for referee audit.

### Future extension points

- Multi-participant initiative queue and legal target filtering (not assumed by this alpha's 2-seat code).
- Hazards as entities with independent state and turns; real wave movement and attacking AI, not just scripted wave damage.
- Grapple state with limb holds, ring-outs, breath and submission mechanics, including counter-moves.
- Simultaneous spell and projectile animations that never slow or reorder authoritative actions.
- Crowd as a separate simulation with favour, noise, morale and optional arena sponsors.
- Wounds and fatigue between bouts handled either by a native optional fiction-only season model or the other fighting-pit module via adapter, never both by default.
- Original soundtrack and sound effects only, with volume and accessibility controls; original or properly licensed media must be used.
- Tournament standings, replays, printable brackets, stat summaries and opt-in celebratory journal handouts.

## Proposed event contract for an external module (not implemented)

```json
{
  "protocol": "pfa-arena-result-v1",
  "source": "pacts-fantasy-arcade",
  "tournamentId": "festival-cup-01",
  "matchId": "semifinal-2",
  "gameId": "fighting-pit-tournament",
  "result": "win",
  "winnerSeat": "seat-a",
  "reason": "knockout",
  "roundsCompleted": 6,
  "scores": [{"seatId":"seat-a","score":35},{"seatId":"seat-b","score":22}],
  "arenaReplayId": "match-record-01",
  "externalRefs": {"seat-a":"source-character-id-a"}
}
```

This is a **planned example shape**, not an available event API in Alpha 5. A future adapter can implement a permissioned observer and emit completed results to the specific external module. Do not derive real gold, injuries or permanent XP from this object without explicit rules from that module.

## Staged tournament roadmap after Alpha 5

1. **Stage 5 certification:** real local Foundry v14 and Forge multi-client tests, visual QA, stress, performance/a11y; correct known v14 API mismatches. Do not announce production ready until this is complete.
2. **Stage 5.1 — Event refereeing and real combatant library:** opponent rosters and authored dialogue packs; configurable multi-round contracts; replays and rule audit; profile mapping to identified existing pit module.
3. **Stage 5.2 — 2v2 and wave units:** generalise board to many occupants and sequential turns, implement cover/targeting/collision, coop AIs and a responsive bigger arena.
4. **Stage 5.3 — Leagues and progression:** Swiss/round robin, tournament dates, rankings, dialogue, sanctioned titles, GM journals, permissioned external result exchange.
5. **Stage 5.4 — Scene canvas:** supported Foundry canvas rendering, region/arena links, named sprites, spatial movement FX, spectators and reduced-motion equivalence. Keep standalone DOM fallback.
6. **Stage 6 sports:** reuse multi-entity movement for Stonecurling, Boulderball, Spellball, Magic Bowl.
7. **Stage 7 racing:** reuse position and path/event engine for Kingfisher Dash, mounted events, Dragon Jousting, Sorcerous Circuit.

## Stable release acceptance gates

- A referee can start, pause, resume, adjudicate and finish a 2+ player tournament without console surgery.
- Human and AI participants obey exactly the same published combat rules and restrictions.
- Every NPC profile has reachable, tested legal moves for every listed ability and a fallback when trapped/exhausted.
- Win condition, scoring and round progress are deterministic and reproducible from recorded seed/action log where applicable.
- Attempted illegal actions, duplicate submissions, interrupted turns, disconnected players, spectators and reconnects cannot corrupt progression.
- A 1,000-match-per-matchup balance suite demonstrates reasonable first-seat and archetype equity; outliers are documented.
- All meaningful audio/animation feedback has visual and textual alternatives, and players can operate the UI via keyboard alone.
- Profile and progression integration is tested against the *actual specified external module*, with its source/version and permission model recorded.
- No irreversible Foundry character-sheet mutations, hidden-money payouts or unsafe external asset requests occur without explicit consent and an integration contract.
- Full localhost Foundry and hosted Forge multi-client tests pass, with human QA documented by version.
