# Build report — 0.5.2-alpha.5.2 (Art, Rulebook & Mechanics Audit)

## Verified in this build
| Check | Result |
|---|---|
| Automated suite (`node --test tests/*.test.mjs`, Node 22) | **104 / 104 groups pass** |
| All 73 games played to completion AI-vs-AI through `ArcadeSessions` (3 seeds each; puzzles verified to start — solvability covered by stage 4 tests) | Pass |
| Hostile-input fuzzing of all 31 single-seat engines (no TypeError/RangeError, scores stay finite) | Pass |
| Every game has a rules entry (9 required sections), cover art and a 3-step lesson | Pass |
| Rulebook compendium compiled with the official `@foundryvtt/foundryvtt-cli` and re-extracted | 85 pages, 73 games |
| Browser render of the library and all 73 live table views (Chrome, real CSS and assets) | No broken images, no script errors |
| Foundry boot test with mocked v14 core APIs | Pass |

## Not yet verified
- A live Foundry v14 world and The Forge (two connected clients). Use `docs/RELEASE-CHECKLIST.md`.
- Rulebook pack opening in the v14 journal sheet (`pageId` render option) — falls back to opening the entry.
- Screen-reader pass on the new image-based library list (images carry empty alt text; titles remain as text).

## Assets
- `assets/art/covers/*.webp` (73, 960×540), `assets/art/thumbs/*.webp` (73, 256²), `assets/art/kits/*.webp` (14), `assets/art/banner.webp`, `assets/art/banner-bg.webp`.
- `assets/art/wyvern/*.webp` — 30 original Wyvern Chess sprites by DM Asmo (downscaled to 128 px).
- `assets/fonts/` — Cinzel, Cinzel Decorative, EB Garamond (+ italic) as WOFF2, SIL OFL 1.1.
- Sources: `tools/art/` (vector motif library and compositions), `tools/build-journal.mjs`, `packs/_source/`.

## Notes for the GM
- Display names changed for three entries whose catalogue titles were development labels: *Emoji Rune Door*, *The Riddle Book* and *Wardplate Trap: The Falling Sun*, plus punctuation in *Weight, Rhythm & Echo Bridge*. Internal IDs are unchanged, so saved tables and packs still load.
- Rule changes that alter outcomes: Arm-Wrestling, Cauldron Craps, Three-Card Wyvern ranking, Lucky Kobold payouts, Barrel Bash, Tankard Toss, Skittles bonuses, Bard’s Bluff called rank. Tables already in progress keep running under the new reducer.
