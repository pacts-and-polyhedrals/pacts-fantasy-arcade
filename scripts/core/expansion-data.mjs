/** Stage 2: original, system-neutral game definitions and teaching scripts. */
export const EXPANSION_GAMES = [
 {id:"giant-s-grip",icon:"🪨",type:"dice",difficulty:2,intro:"Risk dice to haul a giant's weighted chain; choose when to secure the rope."},
 {id:"goblin-s-bones",icon:"🦴",type:"board",difficulty:1,intro:"Two to four players uncover sixteen enchanted bone tiles in a turn-based memory contest."},
 {id:"dwarven-dominoes",icon:"⚒️",type:"board",difficulty:2,intro:"Play a full double-six domino chain against other players or an automatic rival."},
 {id:"goblin-s-bluff",icon:"🫣",type:"dice",difficulty:3,intro:"Secret dice, rising bids and challenges; the last goblin with dice wins."},
 {id:"moonlit-solitaire",icon:"🌙",type:"cards",difficulty:3,intro:"A seven-row pyramid solitaire: remove exposed pairs summing to thirteen."},
 {id:"wobblin-goblin-drinking-contest",icon:"🍻",type:"tavern",difficulty:2,intro:"A theatrical fantasy-brew tasting contest; pace yourself and manage your balance."},
 {id:"giant-s-skittles",icon:"🎳",type:"tavern",difficulty:2,intro:"Line up the enchanted stone ball and topple as many of nine pins as you can."},
 {id:"goblin-tankard-toss",icon:"🍺",type:"tavern",difficulty:2,intro:"Choose the angle and power of your throw to land a tankard on target barrels."},
 {id:"fizzlenub-s-feast",icon:"🥧",type:"festival",difficulty:2,intro:"Assemble a magical feast by choosing ingredients and the right cooking moment."},
 {id:"tinker-s-lock-race",icon:"🔐",type:"craft",difficulty:2,intro:"Set four tumblers to the right runes using feedback from the lock mechanism."},
 {id:"ispin-s-impossible-tale",icon:"📖",type:"social",difficulty:1,intro:"Perform a branching fantasy story by selecting the next dramatic story beat."},
 {id:"goblin-breakdancing-corporation",icon:"🕺",type:"social",difficulty:2,intro:"Remember the goblin choreographer's routine and reproduce the dance moves."},
 {id:"barrel-bash",icon:"🛢️",type:"tavern",difficulty:1,intro:"Pick the safest line to roll a barrel through an obstacle course."},
 {id:"cauldron-craps",icon:"🎲",type:"dice",difficulty:2,intro:"A fantasy two-dice point game: establish your number, then chase it before seven."},
 {id:"witches-triad",icon:"🔮",type:"dice",difficulty:1,intro:"Pick a rune of three, roll three dice and collect matching combinations."}
];
export const EXPANSION_SINGLE = new Set(EXPANSION_GAMES.filter(g=>!["goblin-s-bones","dwarven-dominoes","goblin-s-bluff"].includes(g.id)).map(g=>g.id));
export const EXPANSION_SHARED = new Set(["goblin-s-bones","dwarven-dominoes","goblin-s-bluff"]);
export const EXPANSION_LESSONS = {
 "giant-s-grip":["Each Haul rolls a d6 against the chain: you need 2+ on the first pull, and the target rises by one per successful pull (to a maximum of 5+).","Every successful pull adds 2 + current tension to your unbanked haul. A failed roll snaps the chain and loses the unbanked haul.","Secure the rope to bank your haul. Four hauls (banked or snapped) make a match."],
 "goblin-s-bones":["Sixteen bones hide eight pairs of identical symbols.","Flip two bones each turn. Matching bones stay uncovered and earn a point.","A mismatched pair is revealed until the next player hides it. Remember what you saw."],
 "dwarven-dominoes":["Players receive a concealed hand of domino tiles from a double-six set.","Place a tile at either end of the chain so touching numbers match.","Draw when you cannot play. An empty hand wins; blocked rounds use fewest remaining pips."],
 "goblin-s-bluff":["Only you can see your own goblin dice. Other players' dice are hidden.","Bid how many dice of one face you believe exist across all cups, then others must raise or challenge.","A failed challenge costs the challenger a die; an exaggerated bid costs its bidder a die. Last player with dice wins."],
 "moonlit-solitaire":["Remove a king on its own or any two exposed cards whose values add to thirteen.","A pyramid card is exposed when neither of the two cards directly beneath it remains.","Draw cards from your stock. You can pair the waste card with an exposed pyramid card. Clear as much of the pyramid as possible."],
 "wobblin-goblin-drinking-contest":["This is a fictional game of theatrical brewing, not an instruction for real-world drinking.","Take a small sip, balanced taste or reckless gulp; each earns points at a different balance cost.","Regain your balance with a pause. Five rounds decide the most convincing tavern connoisseur."],
 "giant-s-skittles":["Aim at the nine skittle pins using the horizontal slider.","Power widens the ball's sweep but adds wobble; gentle throws are more accurate.","Each pin is 1 point. Clearing all nine on the first throw is a strike (+3), on the second a spare (+1). Two throws per frame, three frames."],
 "goblin-tankard-toss":["Select a throwing angle and strength; 45° carries farthest.","The tankard follows an arc with a small unpredictable drift. Barrels sit at 16, 28 and 41 paces.","A clean landing (within 3 paces) scores 3, 4 or 5 for the near, middle and far barrel; close calls score 2 or 1. Five tankards."],
 "fizzlenub-s-feast":["A new feast order appears every round: match the requested ingredient and heat.","Pick an ingredient and choose a cooking temperature.","A perfect dish earns more points. You have five orders to serve."],
 "tinker-s-lock-race":["The chest hides a code of four different runes drawn from six.","Turn each tumbler, then test your guess.","Green pins = right rune, right slot; amber = right rune, wrong slot. Open it in six tests: 12 points on the first, 2 fewer for each extra test."],
 "ispin-s-impossible-tale":["Read the audience's next story prompt.","Pick one of three plot twists to move your story forward.","Matching the mood scores applause; follow the branching plot across five scenes."],
 "goblin-breakdancing-corporation":["Study the glowing choreography sequence.","Select the four dance moves in order. You may undo a move before submitting.","The audience awards points for each correct step; the routine changes each round."],
 "barrel-bash":["Examine the three lanes and their visible crash risk (12%, 25% or 43%).","Choose a lane: the safe lane pays 2, the middle 3 and the dangerous lane 4.","The barrel runs automatically and either clears the course or smashes. Lanes reshuffle every roll; five rolls."],
 "cauldron-craps":["On the opening roll, seven or eleven immediately wins and two, three or twelve loses.","Otherwise your total becomes the point to chase.","Roll until you hit the point (win) or seven (loss). Five hands form the match."],
 "witches-triad":["Pick a rune value from one through six.","Roll three six-sided dice; every matching rune is worth two points.","Rolling three identical dice earns an additional four-point triad bonus. Six rounds total."]
};
export const STORY_SCENES = [
 {setup:"Ispin is trapped before the gates of the stone giant's mountain hall. What does the audience want?",mood:"wit",choices:["Outwit the gatekeeper with a riddle","Break the mountain with a spoon","Offer the giant a stale potato"],correct:0},
 {setup:"A dragon circles above the festival stage. The crowd cries for courage!",mood:"bravery",choices:["Hide under the banquet table","Challenge the dragon to single combat","Ask if the dragon delivers letters"],correct:1},
 {setup:"A lost child sees a lantern burning deep in the haunted orchard.",mood:"kindness",choices:["Walk away and count your coins","Offer the child a sword","Light a path and bring the child home"],correct:2},
 {setup:"The royal treasury is empty, and a dubious merchant offers a magical bargain.",mood:"wit",choices:["Read the contract for its hidden loophole","Sign immediately","Set fire to the palace"],correct:0},
 {setup:"The last page of Ispin's legend is blank. Everyone demands a heroic finale.",mood:"bravery",choices:["Leave the battle for someone else","Shield the village and rally its people","Claim you were never here"],correct:1},
 {setup:"A furious stone golem blocks the bridge. The bridge cannot take its weight.",mood:"wit",choices:["Strike the bridge repeatedly","Ask the golem to chase you","Lure it onto the shallows instead"],correct:2},
 {setup:"The archmage has forgotten the name of the old king.",mood:"kindness",choices:["Help piece together the old king's story","Mock the archmage","Pretend the king never existed"],correct:0},
 {setup:"A thief steals the village festival prize and flees into the market.",mood:"bravery",choices:["Help the thief escape","Pursue the thief and protect the crowd","Accuse the village baker"],correct:1}
];
export const TUMBLER_RUNES=["☀","☾","✶","◆","✦","⬡"];
export const BONE_SYMBOLS=["💀","🦴","🐸","🍄","🪙","🐲","🧿","👑"];
export const FEAST_INGREDIENTS=["mushrooms","root vegetables","wild herbs","moonberries"];
export const DANCE_MOVES=["🌀","🦶","🙌","🕺"];
