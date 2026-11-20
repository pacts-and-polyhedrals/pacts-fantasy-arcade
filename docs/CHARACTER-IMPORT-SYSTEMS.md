# Fantasy Arcade | Four-System World & Character Bridge

**Release:** 0.5.1-alpha.5.1 (Foundry VTT 14 development alpha)

**Priority adapters, in this order:** Imagi-Nations RPG (`imagi-nations`, with cautious legacy `imaginations-rpg`), D&D 5e (`dnd5e`), Pathfinder 2e (`pf2e`), Daggerheart (`daggerheart`). Other Foundry systems use identity-only fallback and receive no skill/arena modifiers.

## What is genuinely implemented

1. Auto-detect the active Foundry `game.system.id` and version as soon as the Arcade opens. No configuration of the system ID is required.
2. Show a GM-only **World & Character Bridge** in every Arcade game lobby with eligible world Actors, actor-sheet previews, a one-click per-seat approval button, and automatic matching for seated players who have a Foundry User Character assigned.
3. Transform eligible sheets to a small, validated `pfa-character-link-v1` profile. The imported copy contains an Actor ID, name/UUID, recognized system, relevant class/ancestry labels, minigame affinity, optional bounded assistance, and an allowed Stage-5 arena kit/profile. It is not a clone of the character sheet.
4. Apply optional, small physical-skill allowances in exactly three existing independent games (Arm Wrestling, Kattal's Hammer, Darts of the Deep). **Arena profiles** influence the existing native tactical minigame kit and bounded resource modifiers in Stage-5 arena games.
5. Recommend affinity/roles without changing outcomes for other Arcade games. All 73 registered games can be inspected, but this is *not* 73 full native-system rules integrations.
6. Link a selected Scene and optional Journal *by reference* for use as world context. No private Journal text or entire Scene content is copied into the Arcade.
7. Save approved links in the existing schema-5 Arcade world state. Unlink before match start. Earlier saved worlds remain compatible with the existing Stage-5 schema migration.

## Character mapping (advisory baseline)

| Arcaded trait | Imagi-Nations | D&D 5e | Pathfinder 2e | Daggerheart |
| --- | --- | --- | --- | --- |
| Might | Muscle | STR, Athletics | STR, Athletics rank | Strength |
| Agility | Skill, Senses | DEX, Acrobatics, Stealth | DEX, Acrobatics, Stealth ranks | Agility, Finesse |
| Intellect | Smarts | INT, Arcana/Investigation | INT, Arcana/Society ranks | Knowledge |
| Insight | Senses, Mind | WIS, Perception | WIS, Perception rank | Instinct |
| Presence | Charm, Voice, Heart | CHA, Performance/Persuasion | CHA, Diplomacy/Deception ranks | Presence |
| Craft | Hands, Skill, Smarts | INT/DEX, tool/equipment cues | INT/DEX, Crafting rank | Finesse, Knowledge |
| Magic | Smarts, Mind, spell items | INT/WIS/CHA, Arcana etc. | INT/WIS/CHA, magical training | Spellcasting subclass trait if present; otherwise Knowledge/Instinct/Presence |
| Endurance | Tough, Heart | CON, survival/athletic cues | CON, survival/athletic cues | Strength, Instinct |
| Strategy | Smarts, Mind | INT/WIS, investigation/history | INT/WIS, history/society | Knowledge, Instinct |

**All imported game trait scores are clamped to 0–4.** Arena profiles are additionally validated against the strictly bounded `pfa-arena-profile-v1` limits. An unusual score never makes an Arcade match auto-win or provides a native D&D 5e spell.

### Imagi-Nations: first-class native model

Adapted to the actual upstream `pacts-and-polyhedrals/imagi-nations` **1.26.1** published actor data model: `system.stats.capability` (Muscle, Skill, Tough, Smarts, Senses, Charm) and `system.stats.connection` (Heart, Mind, Hands, Voice). Class and ancestry keys inform fictional roles; the former 6-stat flat `system.stats` layout has limited fallback support. The module does **not** import or expose a `learner` Actor or learner observations, boundaries, accommodations, goals or intake notes. It also never copies a character's biography, identity prompts, fears, bonds or other private descriptions.

The trauma-informed Imagi design takes precedence: Help and Power Cards are **not** consumed by the Arcade, a player can decline an emotional/narrative challenge without a mechanical penalty, hints are free, and Connection statistics are fictional ability cues, not diagnoses or measures of emotional health. The Arcade is not a clinical or educational assessment system.

### D&D 5e: system-facing, not a character-sheet replacement

Reads `system.abilities.*.mod`, skill proficiency (`system.skills.*.value`) and small item-type cues (classes, spells, tools). Does not invoke native class spell actions or perform edition-specific attack resolution. Does not mutate HP, spell slots, class resources, equipment or experience.

### Pathfinder 2e

Reads current character ability modifiers and trained skill ranks (`system.skills.*.rank` and compatible actor skill entries). A rank is **not** treated as a raw 5e proficiency or as the total roll modifier including level. Any unrecognized field simply produces a neutral/unknown rating rather than a fabricated bonus. No native PF2e action economy, focus spell, reaction or Actor update is executed.

### Daggerheart

Reads `system.traits.{agility,strength,finesse,instinct,presence,knowledge}.value`, class and subclass items; for a magic duel it reads a subclass's `spellcastingTrait` if present. The GM panel flags up to two potentially relevant Experience names **as GM-only suggestions** (keyword matching, never an automatic mechanical modifier). Daggerheart Hope, Fear, Stress, Armor, hit points and experience currency are not read into game outcomes or consumed. The Arcade does not emulate Duality Dice.

## GM instructions (no technical configuration)

1. Install/enable this Arcade module in a **test** Foundry v14 world. The world itself must be created using one of the four systems; a Foundry world only has one active game system at a time.
2. Launch Fantasy Arcade; create a game table; open the lobby. The **World & Character Bridge** indicates the detected system and which mapping applies.
3. Have each player select their assigned Foundry User Character, or choose a World Actor manually from the GM-only drop-down. Click **Auto-match assigned player characters** to match eligible seated players in one action; inspect the proposed class, affinity, role and allowed boosts.
4. Click **Approve sheet for this seat** if you want to link a different Actor. Optionally link a Scene and Journal *by reference*.
5. Start a game and compare the actual arena kit or small contest assistance with the suggestion. Confirm the original character remains unchanged in Foundry.
6. Try one player and one NPC, then a two-client GM/player game, then reconnect mid-session. Use a disposable world for testing. Do not use real-money or valuable in-world wagers.

## Acceptance matrix for a real Foundry test

- [ ] **Imagi-Nations:** Connect a character (not a Learner). Confirm all six Capability + four Connection values produce sensible previews; confirm an Entertainer maps to Bard and a Sorcerer to Mage; verify no learner or identity/private notes appear in Arcade or other clients.
- [ ] **D&D 5e:** Test a Fighter, Bard and Wizard. Compare classes, trained skills, permitted arena roles and modest physical game assistance; ensure sheet HP/slots/gear never change.
- [ ] **Pathfinder 2e:** Test untrained and legendary skill ranks and a trained Crafter; ensure rank normalization remains capped and no native Actions/reactions are consumed.
- [ ] **Daggerheart:** Test a Bard with a stage-related Experience and a spellcasting subclass. Verify advisory Experience names and role choice, and unchanged Hope/Stress/Armor.
- [ ] **All systems:** GM can connect/unlink one Actor, auto-match assigned characters, optionally link a Scene/Journal reference, start and complete a match, save/reload, and join with a second player.
- [ ] **Unknown system:** GM sees safe generic identity-only mapping and no automatic modifiers.
- [ ] **Networking:** Foundry module sockets do not verify sender identity cryptographically; no high-stakes or adversarial tournaments should be assumed safe.

## Extension contract for deeper future system integration

The current bridge is intentionally read-only. A future **native rules adapter** must be versioned per system, consume explicit game actions through that system's documented roll/effect API, produce a GM-reviewed effect plan and only call `Actor.update` after explicit authorization. Its first responsibilities should be system-specific dice handling, resource visibility, mapping individual spells/actions/feats, player-selected one-off expenditures, reversible sheet changes, and import of system-appropriate NPC tactics. Nothing in alpha 5.1 claims to implement those abilities already.

**Source schemas reviewed:** [Imagi-Nations RPG repository](https://github.com/pacts-and-polyhedrals/imagi-nations), [D&D 5e Foundry implementation](https://github.com/foundryvtt/dnd5e), [Pathfinder 2e Foundry implementation](https://github.com/foundryvtt/pf2e), [Daggerheart Foundry implementation](https://github.com/Foundryborne/daggerheart). Versions and paths may change; repeat acceptance tests after updating any of the four systems.
