# Alpha 5.1 | Four-priority-system Character Bridge

- **Module:** `pacts-fantasy-arcade`
- **Version:** `0.5.1-alpha.5.1`
- **Foundry target:** v14
- **Codebase:** continues Alpha 5 (73 playable activities; original 131-activity catalogue unchanged)
- **Feature:** World/Actor sheet auto-detection with GM-approved imports and game-specific recommendations

### Implemented

The `system-bridge.mjs` bridge detects the active world system and builds validated, short read-only character profiles for Imagi-Nations, D&D 5e, Pathfinder 2e and Daggerheart. A legacy Imagi-Nations identifier receives cautious fallback support. All supported systems preview each coded activity; Arena kits/modifiers are bounded; three physical contest engines already consume bounded character assistance. The UI displays a source-system-specific summary and optional experience advice. `main.mjs` excludes learner/private world Actor types and only accepts Actor IDs resolved by the active GM host, not raw client-provided sheet snapshots. World links store Scene/Journal references only.

### Safety limitations

No source sheet, inventory, notes, Help/Power Cards, Hope/Stress, spell slots, real resources or character progression is modified. No automatic consumption, private learner data ingestion, AI emotional assessment, or automatic class-action execution. Existing module-socket security limitations remain. Daggerheart Experiences are cues for GM review, not mechanically spent; Imagi Connection traits are **not** emotional health scores. The system is not a clinical tool.

### Tests

90/90 automated test groups passing. Of these 16 new adapter-focused groups cover identification of four official system IDs and a legacy alias; current and legacy Imagi stat layouts; learner exclusion; D&D and Pathfinder bonus bounds; Daggerheart subclass spellcasting trait and Experience hints; 73-game by 4-system previews; GM access control and restore; read-only Actor preservation; safe Scene/Journal references; HTML escaping; and luck game neutrality. Old 74 regression groups remain passing. A further redaction test verifies public snapshots omit GM-only world links and Daggerheart Experience names.

### Not claimed

The adapter does not implement every D&D/PF2e/Daggerheart/Imagi-Nations class ability, no live v14/Forge two-client proof exists, and Player Actor permission/Journal sensitivity under malicious clients is not cryptographically protected. The 73-game count is unchanged. System data mapping is version-aware only in the sense of reading known stable fields with safe fallback; it has not been certified against every released patch version of the four systems.
