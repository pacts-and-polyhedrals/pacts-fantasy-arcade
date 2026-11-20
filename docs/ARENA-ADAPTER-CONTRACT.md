# Stage 5 — External Fighting-Pit Module Adapter Contract

**Shipped, data-only interface:** `pfa-arena-profile-v1`.
**Not shipped yet:** a concrete adapter for the user's separate Foundry fighting-pit module; its source and exact API are not in this working set. No automatic update to player sheets, money, injuries, XP or tournament rank.

The goal is to make Fantasy Arcade's tactical arenas usable as a *contest layer* alongside an established downtime/fighting-pit module, not duplicate its canonical campaign rules. The other module is entitled to be the source of truth for roster, character progression, downtime earnings, prize distribution and persistent injuries. Fantasy Arcade is the source of truth only for the isolated arena action state and public match result.

## Public API

Once both modules are enabled and a GM is connected, Fantasy Arcade exposes:

```js
const api = game.pactsFantasyArcade;
// Create a bounded profile with explicit source and label.
const profile = api.arena.makeProfile({
  source: 'The Existing Fighting Pits Module',
  label: 'Copper League — Brash Fighter',
  archetype: 'duelist',
  modifiers: { hp: 2, stamina: 1, focus: 0, power: 0, protection: 1 }
});
// This must be run by the GM during the target arena table's lobby phase.
await api.arena.importProfile({
  tableId: 'EXACT_FANTASY_ARCADE_TABLE_ID',
  seatId: 'EXACT_FANTASY_ARCADE_SEAT_ID',
  profile
});
```

The `tableId` and `seatId` are exact IDs from a live Fantasy Arcade session; never guess them. Import requires GM authority, an arena game, a lobby-state table, a real seat and an archetype allowed by the selected mode. If this validation fails, the import must fail without changing the existing actor or match. `api.arena.protocol` equals `pfa-arena-profile-v1`.

### Validated input

```json
{
  "protocol": "pfa-arena-profile-v1",
  "source": "The Existing Fighting Pits Module",
  "label": "Copper League — Brash Fighter",
  "archetype": "duelist",
  "modifiers": {
    "hp": 2,
    "stamina": 1,
    "focus": 0,
    "power": 0,
    "protection": 1
  }
}
```

`label` requires at least two visible characters and is capped at 80. `source` is capped at 80. Archetype must be in the native allowlist and permitted by the target game. Any missing modifier defaults to zero; every supplied modifier must be an integer in the exact ranges below. The engine rejects unknown protocol strings and arbitrary non-integer values.

| Modifier | Allowed value |
|---|---|
| HP | -3 to +3 |
| Stamina | -2 to +2 |
| Focus | -2 to +2 |
| Power | -1 to +1 |
| Protection | -1 to +1 |

A profile can only alter initial bounded arena resources and one starting kit. It cannot add custom attacks, bypass cooldowns, control other seats, reveal unrevealed data or inject scripts. The original D&D actor/character's abilities and slots remain untouched. The arena state retains a short provenance object containing the profile protocol, source and label for traceability.

### Suggested mapping guidelines

Translate external character levels/classes/proficiencies into **archetype choice + a few balanced modifiers**, not one-to-one D&D 5e combat equivalence. For instance, a skilled shield specialist could be `guardian` with +1 protection; a trained stage performer could be `bard` with +1 focus; a grappling veteran could be `wrestler` with +1 power. Ensure arena-mode restrictions still apply: a mage cannot enter a strict wrestling bracket by spoofing an external profile. No export of armour class, attack bonus, inventory, spell names or hit-dice is required for this initial integration.

## Integration workflow

1. Identify the exact external module ID, GitHub repository/release and game-system compatibility, plus which data it owns. Get the author's permission where necessary and determine whether scripts can be reused under its licence.
2. Create a separate `adapters/<external-module-id>/` package or submodule after examining actual interfaces. The current alpha deliberately does not guess how the external module stores entities.
3. The external module assembles a `pfa-arena-profile-v1` object and validates its own eligibility rules before making the explicit GM-only `importProfile` call.
4. The GM reviews public labels, chosen kits, modifiers and tournament rules before starting the match.
5. The arena engine runs the bout normally, retaining all actions in its own world-state history.
6. A future **result observer** may emit a versioned, idempotent `pfa-arena-result-v1` payload for the external module to adjudicate. Such an observer is *not implemented* in Alpha 5.
7. Once an adapter exists, integration tests must cover module absent, old module version, missing profile, schema mismatch, invalid values, sender forgery attempts, reconnect, duplicate results and GM override.

## Ownership/security limitations

This module uses a GM-coordinated Foundry socket bridge. A malicious client could potentially forge a message or impersonate a sender at this layer; a secure trusted transport or authenticated server would be required before using the app for valuable items or adversarial competition. Import is restricted by the local GM session logic, but the environment is not cryptographically adversarial secure. Never claim the adapter grants D&D rules parity or cheat-proof combat.

The profile is **data only**. It never executes an external script or imports web resources, even if an external sender supplies an object shaped like a script. It never uses `eval`. The adapter intentionally does not call actor.update, updateEmbeddedDocuments, item.create or currency/experience mutators.

## Conformance tests in this release

- A valid bounded profile imports during an arena lobby and changes only the starting arena fighter statistics.
- Unknown protocol or excessive modifier values are rejected before an affected match starts.
- Non-GM clients are refused profile import requests by the session authority.
- Illegal archetype choices are refused for the selected activity.
- Imported fields survive session start and state export/reload where permitted.

See `tests/stage5.test.mjs` for test cases and `docs/FIGHTING-PIT-TOURNAMENTS-DESIGN.md` for the proposed result handoff and career league expansion.
