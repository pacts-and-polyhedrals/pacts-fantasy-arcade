# Fantasy Arcade Stage 5 — Universal Arena Rules and GM Guide

**Edition:** 0.5.0-alpha.5 | **Publisher:** Pacts & Polyhedrals | **Rules:** Original, system-neutral | **Target:** Foundry VTT v14

This is the authoritative manual for the **implemented Alpha 5** combat and performance minigames. It describes the actual arena reducer, not a substitute for a D&D combat engine. All matches operate with fictional game resources. Foundry actor hit points, slots, inventory, currency, combat turns and experience are **never modified by default**.

## Design principles

1. Players take *meaningful tactical actions*, not merely roll a skill check. Movement, terrain, positioning, distance, timing, recovery, counterplay and choosing abilities all matter.
2. Every action is checked by the same rules, irrespective of whether it comes from a player, NPC AI or GM-controlled NPC. Client-supplied damage or success claims are ignored.
3. Each activity uses the same turn/ability/position/event/replay data model. Different arenas change permitted kits, environment, scoring and victory conditions.
4. An NPC must seek victory within the same legal move set, preserving its resources and evaluating attacks, defence and objectives. Dialogue explains character, not hidden special permissions.
5. The GM may referee, play an NPC directly, switch to automated play, pause a match or observe a tournament.
6. Timed animations are presentation, never part of the authoritative rule check; players who prefer reduced motion receive equivalent information in text.
7. A separate fighting-pit/downtime system may provide roster/eligibility/progression/rewards through a **bounded data-only adapter**; Fantasy Arcade keeps the physical minigame separate.

## Shared match state and lifecycle

Each match has exactly **two active seats** in this alpha (two opponents, or two allied co-op seats). Each seat is one of: connected human player, GM-controlled NPC, or AI-controlled NPC. A game progresses through lobby -> playing -> complete. A GM can pause during play. Turn, action-point, health, stamina, focus, positions, hazards, cooldowns, scores, temporary conditions, dialogue events and replay frames are stored in the world state. A connected GM coordinates state mutations and NPC turns.

**Per-turn economy**

- The active participant receives **2 Action Points (AP)**. A technique costs 1 or 2 AP; an exhausted participant can end their turn early.
- **Stamina** represents exertion, movement and melee effort. **Focus** fuels spells and stage techniques. Both are kit-dependent.
- On the start of a participant's turn, it normally gains **+2 stamina and +1 focus** up to its kit maxima; temporary guard and status timers decay. Recovery and focus abilities restore additional resources but consume an action.
- Abilities have a range, target type, AP/stamina/focus cost and sometimes a cooldown. Illegal, out-of-turn, blocked, paused or over-cost actions are rejected. Players choose a highlighted target, destination or self-action; the engine determines results.
- The arena grid is **9 columns by 7 rows**. The default distance for attacks is orthogonal/Manhattan distance; movement uses a shortest clear orthogonal path (no walking through pillars or occupied squares). Blink and Vault can leap to a valid square within range.
- Ranged spells and arrows require **line of sight**, checked along a discrete ray. Pillars block the ray; cover provides protection. Hazards/slime apply their effects when stepped on; encounter-specific waves trigger at round boundaries.
- Attacks calculate: base ability damage + a bounded power contribution + a small random variation, minus guard, dodge, cover and protection as applicable. Exposed targets may take more damage. The authoritative engine resolves all figures.
- A match ends on the mode-specific objective, knockout, pins, score target or judge's decision at the round limit. Competition results enter the existing scoreboard/tournament system.

### Abilities, archetypes and fairness

The base archetype has preconfigured hit points, stamina, focus, power, protection and an allowlisted set of techniques. The **Fighting Pit Tournament** currently allows Duelist, Bruiser, Sentinel, Wrestler, Shadowrunner and Beast Rider; **Wizard Duel** is Mage versus Mage; **Battle of the Bards** and other stage contests permit Virtuoso, Poet and Debater. Other scenarios prescribe themed kits. No player may insert a custom technique, damage figure or full RPG class ability by editing the browser request.

There are 13 initial kits, including the NPC training construct. Shared manoeuvres include Step, Dash, Quick Strike, Power Blow, Guard, Dodge, Feint, Grapple, Break Hold, Recover and Taunt. Higher-order kits add Riposte, Earthshaker, Shield Wall, Aegis, Ember Lance, Frost Bind, Thunder Wave, Counterspell, Blink, Aimed Shot, Volley, Charging Lance, Trample, Vault, Vanish, Shadow Strike, Verse, Harmony, Encore, Argument, Rebuttal and Evidence. Refer to the generated reference table at the end for exact per-ability costs.

#### Defensive counterplay

Guard adds a temporary damage buffer that is consumed by incoming harm and decays when turns advance. Dodge moves one clear square and grants temporary evasion. Aegis is a magical guard. Counterspell costs focus and blocks the next incoming magical damaging technique before its damage is applied; it is a proactive spell stance, not a reaction to secretly previewed outcomes. Frost slows movement, knockback repositions a target where a legal space exists, and Feint or Roar can expose an opponent.

#### Grapple / wrestling sequence

1. Close to one orthogonal square from an opponent and attempt Grapple or Body Lock. A bounded stamina/power test determines whether a hold is established.
2. A held participant cannot use ordinary movement, dash, dodge or teleport until it escapes. It can choose Break Hold and other permitted actions.
3. The holder can attempt a Throw (damage, knockback, release) or, when sufficient AP remains, a Pin attempt. Failed pin attempts expose the defender; successful pins award a recorded pin and release the grapple.
4. **Monster Wrestler Championship** ends when a competitor scores **two legal pins**. Knockouts and ring-round judge decisions also use the shared win system. Grapples and pins are not unconditional button presses.

#### Magic duel sequence

In Wizard Duel the legal spell menu derives from the Battlemage kit, and spell ranges are line-of-sight validated. Ember Lance is a fast flame strike; Frost Bind damages and slows; Thunder Wave spends 2 AP and substantial focus to strike and attempt a knockback. Blink is defensive repositioning. Aegis is protection and Counterspell is preemptive spell denial. Arcane Focus and Recover support endurance, and attacks still obey the normal AP/resource rules. An automated opponent scores the trade-off between immediate damage, threatened replies, avoiding adjacency, cover and remaining focus.

#### Performance rules (same engine, nonlethal scoring)

In Battle of the Bards, Festival Slam Poetry and Trial by Debate, the arena is a theatre/court and the damage stat of a performance technique becomes **audience favour**, not an attack on health. Play focuses on *stage position, spotlight, tempo, choice of delivery, rebuttals, the changing crowd and an encore at the right moment*.

- Each performer selects a **heroic**, **comic** or **heartfelt** delivery; NPC rivals now adapt to the audience's current preference.
- The crowd preference cycles on successive full rounds. Matching it increases favour; delivering the wrong tone loses relative impact. Standing in spotlight and building momentum grant further points.
- Repeating exactly the same technique on consecutive performances reduces novelty. Rebuttal can benefit from recognising the rival's recent verse/argument.
- The rival has a distinct stage persona and reactive lines, and the announcer records notable moments. Public scores and performed styles are visible; this is not hidden-card bluffing.
- **Bardic Duet** reuses audience scoring cooperatively: the two allied performers combine favour and receive a Harmony bonus when close enough to work together.
- **Trial by Debate** is a stylised structured debate, not legal or historical fact checking. Arguments, rebuttals and evidence are represented by original techniques and audience favour.

### Mode-specific objectives

| Activity | Kind | Implemented victory / failure rules | Important decision |
|---|---|---|---|
| Battle of the Bards | Competitive performance | Reach audience threshold or lead when the gong sounds | Delivery, placement, heckle/rebuttal/encore, focus budget |
| Festival Slam Poetry | Competitive performance | Favour threshold or judges | Verse versus comeback, spotlight, momentum |
| Trial by Debate | Competitive performance | Favour threshold or judges | Evidence, argument, rebuttal, recovery |
| Bardic Duet | Cooperative performance | Shared applause target by round limit | Harmonise near ally and budget focus |
| Fighting Pit Tournament | Tactical duel | KO or higher combat metric at final round | Footwork, guard, grapple, cooldown, hazard |
| Wizard Duel | Tactical duel | KO or judges | Range, line of sight, counter, spell resources |
| Monster Wrestler Championship | Grappling duel | Two pins; KO or decision can also end contest | Hold, break, throw, pin |
| Shield Wall | Cooperative defence | Keep gate above zero through final wave | Shelter, incoming raiders, guard, targets |
| Arrow Storm | Cooperative defence | Keep gate above zero through final wave | Dodge, aim, ranged targeting and defence |
| Gladiator's Gauntlet | Survival duel | KO/judges, with escalating environmental damage | Position around timed column hazards |
| The Gloop | Cooperative rescue | Free the captive before time ends | Avoid slime and converge on captive |
| Melee Training Dummy | Training | Achieve technique target; trainer can score by survival metrics | Chain attacks with resource recovery |
| Arena Beast Rider | Mounted combat duel | KO or judges | Long-range charge, knockback, vault |
| Shadow Heist | Cooperative stealth | Extract before alert reaches seven or time expires | Cover, concealment, distraction, pathfinding |

**Scope note:** These are 2D **turn-based tabletop minigames** with a tactical board. A fighting pit is not a full simulation of D&D 5e combat; the beast rider is not yet a racing/flight physics engine. Advanced squads, persistent campaigns, professional league formats and exact existing module combat mechanics are planned in the separate tournament specification.

## AI opponents (legal action evaluation)

Each NPC receives the same legal-action list as a human. It scores actions against relevant tactical goals, then selects one. Tactical signals include: remaining AP and stamina/focus, weapon/magic range, target health and guards, cover, distance before/after a move, whether a move enters a hazard, objective urgency, grapples/pin opportunities, recovery needs, defensive counters, high-priority rescue/exit actions, spotlight and crowd preference.

**Casual:** considers a wider band of acceptable plays; more variation. **Skilled:** selects among closer-to-best plays, still with some unpredictability. **Tactical:** evaluates the strongest candidates and estimates a reply from the opposing seat before committing. This is a bounded, one-ply tactical evaluation, **not a general planning LLM** or a full minimax search, and cannot guarantee perfect play. All NPC decisions still pass through the authoritative reducer; the AI is not permitted to ignore terrain, resource or cooldown restrictions.

The same seat can switch between AI (`auto-npc`) and direct GM control (`gm-npc`), although a GM must be online. A player can watch the AI, take over a rival mid-session as GM, or turn it back to automatic play. Lobby setup offers NPC kits, dialogue personas and AI difficulty. The chosen persona affects speech, not combat bonuses.

### Dialogue and narration

Eight original personas exist: Ironjaw, Grukk, Archmagister Vey, Velvet Thorne, Bramblehide, Wisp of the Rookery, Marshal Thorn and Magister Quorum. Each has distinctive intro/attack/guard/spell/grapple/counter/hurt/victory/defeat-style lines where authored. The engine chooses lines by ability category, participant identity, health and current round; a herald provides neutral commentary on player actions and arena events. This is deterministic authored dialogue and **does not call a language model**; it provides flavour without exposing private state. Future extensibility could allow GM-editable dialogue packs and voiceover with permission.

### Movement, animation and accessibility

The arena interface shows a real tactical grid, legal destinations, ability costs, HP/stamina/focus/score metres, objectives and current AP; the last action and latest NPC speech appear in a live commentary panel. Character icons follow movement with a short CSS ghost trail. Magic and ranged attacks show directional projectiles and impact bursts. The entire animation is skippable/reduced by OS reduced-motion and module settings; visual effects do not govern the match and the action log contains equivalent outcome text. All board squares are buttons with descriptive accessible labels; broader live keyboard/screen-reader testing remains a release gate. This is a first-pass animated 2D rendering, not sprite-sheet character animation or token movement on a Foundry Scene canvas.

### Results, replays and tournament integration

Completed matches write a bounded score/result ledger and expose a public event/replay history of up to 120 frames and 55 recent events. Tournament Hall can schedule a **2-, 4- or 8-person knockout**, launch arena duels and advance winners; a draw can be adjudicated by the GM with a recorded audit entry. The arena UI also allows a GM to pause or resume the match. The tournament feature currently supports eligible 1v1 contests, not complete season management, full multiparty elimination, persistent injuries, betting or integrated D&D downtime.

**Safety and security:** Only fictional points are used. Player and NPC actions are validated by a coordinating GM's session object. However, this alpha relies on standard Foundry module socket transport, which has limits around authenticating malicious senders. Do not use it for real-world wagers, valuable in-world currency or adversarial competitions. Back up world data and test in a disposable world.

## Rules QA checklist for the GM

- The correct 2-seat game mode starts; both seats have legal actions and the right kit.
- Movement respects blocked cells and occupancy; ranged magic cannot pass pillars.
- Spending 2 AP cannot leave an extra action; exhausted and cooled-down abilities are disabled.
- Counterspell blocks one magic attack, not arbitrary melee damage; guard, evade and knockback behave as described.
- Grapple -> Pin/Throw requires a real hold; a rival can attempt escape.
- The crowd's preference visibly changes and repetitive bard choices perform worse.
- NPCs change tactics when wounded, out of resources, in a bad position, or near completing a goal.
- GM control/delegation works without changing game state arbitrarily; the action history explains what happened.
- Tournament matches actually finish before advancing, and a tie is auditable.
- Reduced-motion play displays every important outcome through text, with no animation-dependent choices.

## Exact shipped archetype and ability reference

Generated from the actual `ARENA_KITS` and `ARENA_ABILITIES` definitions at release time, rather than copied from a disconnected design document.

### Kit statistics

| Kit | HP | Stamina | Focus | Power | Protection | Abilities |
|---|---:|---:|---:|---:|---:|---|
| Duelist | 28 | 14 | 5 | 3 | 2 | move, dash, strike, heavy, guard, evade, feint, grapple, break, riposte, recover, taunt |
| Bruiser | 36 | 12 | 3 | 4 | 1 | move, dash, strike, heavy, guard, evade, grapple, break, throw, earthshaker, recover, taunt |
| Battlemage | 24 | 11 | 16 | 2 | 1 | move, guard, evade, strike, ember, frost, storm, counterspell, aegis, blink, meditate, recover, taunt |
| Wrestler | 33 | 16 | 3 | 3 | 2 | move, dash, strike, guard, evade, grapple, break, pin, throw, bodylock, recover, taunt |
| Arena Beast | 35 | 14 | 2 | 4 | 1 | move, dash, strike, heavy, evade, grapple, break, pin, throw, trample, roar, recover |
| Sentinel | 34 | 15 | 5 | 2 | 4 | move, dash, strike, guard, evade, shieldwall, shieldbash, grapple, break, recover, taunt |
| Archer | 26 | 14 | 9 | 3 | 1 | move, dash, strike, guard, evade, aim, shot, volley, recover, taunt |
| Beast Rider | 32 | 15 | 6 | 3 | 2 | move, dash, strike, guard, evade, charge, vault, trample, recover, taunt |
| Shadowrunner | 26 | 16 | 10 | 3 | 1 | move, dash, strike, guard, evade, feint, vanish, backstab, distraction, recover |
| Virtuoso | 27 | 12 | 15 | 2 | 1 | move, dash, guard, evade, verse, heckle, harmony, encore, refrain, spotlight, recover, taunt |
| Slam Poet | 27 | 12 | 15 | 2 | 1 | move, guard, evade, verse, heckle, refrain, spotlight, encore, recover |
| Debater | 29 | 12 | 15 | 2 | 2 | move, guard, evade, argument, rebuttal, evidence, heckle, refrain, recover |
| Training Construct | 99 | 99 | 3 | 1 | 1 | guard, strike, recover |

### Ability costs and targeting

| Ability | AP | Stamina | Focus | Range | Target | Effect |
|---|---:|---:|---:|---:|---|---|
| Step | 1 | 0 | 0 | 2 | empty | Move along clear adjacent squares, up to two spaces. |
| Dash | 2 | 2 | 0 | 4 | empty | Sprint up to four spaces but spend two actions. |
| Quick strike | 1 | 2 | 0 | 1 | enemy | A dependable close-range attack. |
| Power blow | 2 | 4 | 0 | 1 | enemy | Slow, high-damage attack. Risky if exhausted. |
| Guard | 1 | 0 | 0 | self | self | Brace against the next attack and build a little stamina. |
| Dodge | 1 | 1 | 0 | 1 | empty | Move one square and gain temporary evasive cover. |
| Feint | 1 | 2 | 0 | 1 | enemy | Lower a rival’s guard and create an opening. |
| Grapple | 1 | 3 | 0 | 1 | enemy | Grab an adjacent rival and restrict their movement. |
| Break hold | 1 | 2 | 0 | self | self | Try to escape a grapple, using stamina and leverage. |
| Pin | 2 | 4 | 0 | 1 | enemy | Convert a firm wrestling hold into a pin attempt. |
| Throw | 2 | 4 | 0 | 1 | enemy | Throw a grabbed opponent away and off balance. |
| Body lock | 2 | 3 | 0 | 1 | enemy | Stronger attempt to establish an unbreakable clinch. |
| Riposte | 1 | 3 | 0 | 1 | enemy | Parry-and-counter strike, improved if you guarded recently. |
| Earthshaker | 2 | 5 | 0 | 2 | enemy | A concussive blow reaching two squares. |
| Shield wall | 1 | 2 | 0 | self | self | A stronger protective stance against the next volley. |
| Shield bash | 1 | 3 | 0 | 1 | enemy | Damage and push an adjacent target. |
| Ember lance | 1 | 0 | 3 | 4 | enemy | A long-range flame spell; blocked by solid obstacles. |
| Frost bind | 1 | 0 | 4 | 3 | enemy | A slowing frost spell. |
| Thunder wave | 2 | 0 | 6 | 3 | enemy | Powerful ranged spell with knockback. |
| Counterspell | 1 | 0 | 3 | self | self | Nullify the next incoming magical attack this round. |
| Arcane aegis | 1 | 0 | 3 | self | self | Raise magical shielding. |
| Blink | 1 | 0 | 3 | 3 | empty | Teleport to any unobstructed square within range. |
| Arcane focus | 1 | 0 | 0 | self | self | Restore four focus for more spells. |
| Steady aim | 1 | 0 | 0 | self | self | Gain accuracy for your next arrow. |
| Aimed shot | 1 | 2 | 0 | 5 | enemy | Fire along clear line of sight. |
| Volley | 2 | 4 | 0 | 5 | enemy | A powerful ranged attack. |
| Charging lance | 2 | 4 | 0 | 2 | enemy | A brutal mounted strike that can drive rivals back. |
| Trample | 2 | 4 | 0 | 1 | enemy | Heavy impact with knockback. |
| Vault | 1 | 2 | 0 | 3 | empty | A risky leap over the battlefield. |
| Terrifying roar | 1 | 2 | 0 | 3 | enemy | Frighten and unbalance a nearby rival. |
| Fade into shadow | 1 | 0 | 2 | self | self | Hide until you attack or enter a bright square. |
| Shadow strike | 1 | 3 | 0 | 1 | enemy | Devastating when attacking while hidden. |
| Distract patrol | 1 | 0 | 2 | self | self | Reduce patrol alertness before advancing. |
| Winning verse | 1 | 0 | 2 | 5 | enemy | Earn applause and weaken an opponent’s composure. |
| Witty retort | 1 | 0 | 2 | 5 | enemy | Undermine a rival’s momentum and draw laughs. |
| Harmonise | 1 | 0 | 3 | self | self | Blend performances and earn bonus points on a shared stage. |
| Grand finale | 2 | 0 | 5 | 5 | enemy | A high-cost showstopper and tremendous crowd surge. |
| Refrain | 1 | 0 | 0 | self | self | Recover breath and focus for your next verse. |
| Take centre stage | 1 | 1 | 0 | self | self | Win control of the spotlight for extra audience favour. |
| Opening argument | 1 | 0 | 2 | 5 | enemy | Build a case with a convincing claim. |
| Rebuttal | 1 | 0 | 3 | 5 | enemy | Punish an exposed argument or an opposing attack. |
| Produce evidence | 2 | 0 | 4 | 5 | enemy | Offer decisive evidence and sway the panel. |
| Catch breath | 1 | 0 | 0 | self | self | Recover three stamina, restore focus and shake off pressure. |
| Taunt | 1 | 0 | 0 | 5 | enemy | Try to shake your rival’s confidence; useful for crowd control. |
