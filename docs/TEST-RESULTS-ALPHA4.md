# Alpha 4 automated test results

**Run:** 19 November 2026 · Node.js local test environment

```bash
node --test tests/*.test.mjs
```

**Outcome:** **53 test groups passed; 0 failed; 0 skipped.**

**Stage 4 specific coverage:** 160 seeded complete puzzle runs (16 activities × 10 seeds), 60 independent checks of generated gravity/keystone/sliding puzzle solvability, a deterministic 12-riddle-pack traversal, a saved custom four-riddle pack restored and played to completion, invalid actions, score penalties, progressive hints, player ownership, mid-game party joining, declarative Region/Tile/Wall validation with mocked documents, and HTML renderer checks for every new game type.

**Regression coverage:** retained Alpha 1–3 tests for game engines, multiplayer rule validation, save migration, original cards, tournaments, public replay, Wyvern rules and Foundry bootstrap shim.

**Not a production certification:** The tests run pure rules and mock some Foundry APIs. They do not prove actual Foundry v14/Forge hosting, remote connections, region geometry under every map transformation, screenshot layout, screen-reader usability, or adversarial secret-data security. The optional Chromium screenshot check did not complete reliably in this build environment and is left unchecked in `RELEASE-CHECKLIST.md`.
