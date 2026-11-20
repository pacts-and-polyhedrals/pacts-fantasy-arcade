# Alpha 5 — Automated Test Results

**Executed:** 19 November 2026  
**Module:** `pacts-fantasy-arcade` `0.5.0-alpha.5`  
**Command:** `node --test tests/*.test.mjs`  
**Environment:** Local Node.js, imported pure `.mjs` reducers and mocked Foundry bootstrap; **not** a real Foundry or Forge session.

## Final result

| Metric | Observed |
|---|---:|
| Test groups passed | **74** |
| Failed | **0** |
| Cancelled / skipped | **0 / 0** |
| Original Alpha 1–4 tests | **53** retained |
| New Stage 5 tests | **21** |
| Simulated complete Stage 5 matches | **700** (50 seeded matches per new activity) |
| Additional targeted AI diversity probe | 7 seeded matches per selected mode; performed and passing |
| Reported combined test duration | about **17.2 seconds** |
| Implemented games | **73 / 131** catalogue designs |

The test report is based on actual executed local code and can be independently reproduced with the command above after extracting the release ZIP.

## What the tests exercise

- All original Stage 1–4 game engines and shared-table rules, scoreboards, custom pack validation, tournament brackets, puzzle authoring, save/restore and mocked scene effects.
- Arena actions, legal AP budgets, orthogonal movement, obstacles, line of sight, resources and blocked/cooldown abilities.
- Wizard's protective counterspell blocking actual incoming magic, magic range, genuine ranged projectile events.
- Grapple legality, release/escape, throwing, successful pins and a two-pin match goal.
- Defensive waves, timed hazards, nonlethal training, captive rescue and stealth extraction success/failure.
- Three-level NPC utility scoring, ranged attacks, active spell offence, varied bard performances, actual wrestling pins, shield defence, training combos, and GM AI takeover/delegation.
- Dialogue variations per NPC persona and victory, CSS animation markup and reduced-motion branches.
- Competitive and cooperative scoring, bounded event/replay timelines, match completion, bracket winners and migration to persistence schema 5.
- Profile allowlist and bounded `pfa-arena-profile-v1` import, including refusal of non-GM import and excessive values.
- Rendering all 14 new interactive game UI states, buttons and labelled grid cells.

## Additional tactical balance probe

A separate 6-seed high-difficulty AI profile run uncovered and corrected earlier behaviours in which wizard NPCs overused Counterspell, Bards relied only on Harmonise, and training actors could score through repeated Taunt. With the revised code, the run observed:

- **Wizard Duel:** Blink, Ember Lance, Counterspell, Thunder Wave, Arcane Focus.
- **Battle of the Bards:** Dash, Verse, Encore, Take Centre Stage and Witty Retort.
- **Monster Wrestler Championship:** Grapple, Break Hold and actual successful Pin choices.
- **Shield Wall:** movement and direct strikes against raiders, not just taunting.
- **Melee Training Dummy:** movement, feint, strikes and genuine Training Combos, with Taunt no longer awarding practice points.

These are *behavioural smoke tests*, not a scientifically sufficient balance evaluation of matchups. Full 1,000+ simulation matrices per archetype pairing remain to be run.

## Not verified by these results

- Full Foundry v14 module enable/launch and end-to-end socket behaviour in a live game world.
- Two remote connected clients, simultaneous actions/reconnect, GM ownership switches and Forge hosted deployment.
- Pixel-level desktop/mobile visual audit. A Chromium screenshot attempt timed out; no successful screenshot inspection has been recorded.
- Browser-specific audio, animation timing, full keyboard/screen-reader accessibility, GPU performance, CSS in Foundry's UI theme.
- Malicious actor resistance, socket sender authentication, high-value betting or persistent character sheet effects.
- Automatic integration with the user's separate fighting-pit module, whose repository/API was not available for this build.
- Full professional league, 4v4 fighting pits, actual scene token movement or sophisticated NPC learning.

## Manual acceptance references

`docs/RELEASE-CHECKLIST.md` includes the full local Foundry/Forge testing walkthrough; `docs/FIGHTING-PIT-TOURNAMENTS-DESIGN.md` defines the higher-level next-stage feature and balancing gates.
