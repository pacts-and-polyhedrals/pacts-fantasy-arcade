import {EXPANSION_GAMES,EXPANSION_LESSONS} from "./expansion-data.mjs";
import {ADVANCED_GAMES,ADVANCED_LESSONS} from "./advanced-data.mjs";
import {PUZZLE_GAMES,PUZZLE_LESSONS} from "./puzzle-data.mjs";
import {ARENA_GAMES,ARENA_LESSONS} from "./arena-data.mjs";
/* Pure game definitions: safe to import from Node tests and browser. */
export const PLAYABLE = [
 {id:"coin-of-fate",icon:"🪙",intro:"Predict a coin flip. Five rounds; coins earn points.",type:"dice",difficulty:1},
 {id:"wyrm-s-eye",icon:"🐲",intro:"Guess higher or lower on a d12. Bank a growing streak before it breaks.",type:"dice",difficulty:1},
 {id:"serpent-s-seven",icon:"🐍",intro:"Push your luck with two dice. Doubles wipe out your unbanked points.",type:"dice",difficulty:1},
 {id:"lucky-kobold",icon:"🍀",intro:"Choose a prophecy then roll d4, d8 and d12 to meet it.",type:"dice",difficulty:1},
 {id:"king-s-high-roll",icon:"👑",intro:"Roll three dice, keep what you like, and beat Grukk's roll.",type:"dice",difficulty:1},
 {id:"devil-s-knuckles",icon:"👹",intro:"Roll four dice, lock the good ones and build a winning pattern.",type:"dice",difficulty:1},
 {id:"three-dragon-slots",icon:"🎰",intro:"Spin three enchanted reels, hold symbols, and take one respin.",type:"dice",difficulty:1},
 {id:"seven-skulls",icon:"💀",intro:"Push seven dice toward scoring sets; three skulls bust the round.",type:"dice",difficulty:1},
 {id:"crown-bones",icon:"🎲",intro:"A complete 13-category scorecard challenge with up to three rolls per round.",type:"dice",difficulty:2},
 {id:"arm-wrestling-at-the-bar",icon:"💪",intro:"Power, brace, or feint to drive your opponent's hand toward the table.",type:"tavern",difficulty:1},
 {id:"kattal-s-hammer",icon:"🔨",intro:"Time and aim a mighty hammer blow to ring the fairground bell.",type:"festival",difficulty:1},
 {id:"darts-of-the-deep",icon:"🎯",intro:"Aim an actual dart on an interactive board; wind changes the landing point.",type:"tavern",difficulty:2},
 {id:"sly-fox-s-three-cups",icon:"🥤",intro:"Watch the enchanted cups shuffle; follow the gem and call its location.",type:"tavern",difficulty:2},
 {id:"tavern-trivia",icon:"🧠",intro:"Eight questions from original fantasy lore packs, with scores tracked automatically.",type:"social",difficulty:1},
 {id:"tomb-of-the-restless-grave",icon:"⚰️",intro:"Solve a cursed epitaph and open the grave entrance without brute force.",type:"puzzle",difficulty:1},
 {id:"forgotten-realms-emoji-door-generator",icon:"🚪",intro:"Rearrange an emoji rune sequence to unlock the door.",type:"puzzle",difficulty:2},
 {id:"potion-sorting-sprint",icon:"⚗️",intro:"Sort eight reagents into their corresponding cauldrons.",type:"craft",difficulty:1},
 {id:"black-dragon",icon:"🃏",intro:"Five rounds against a fantasy card dealer. Hit, stand or double.",type:"cards",difficulty:2},
 {id:"three-card-wyvern",icon:"🐉",intro:"Draw three fantasy cards, exchange one, and compare sets with the dealer.",type:"cards",difficulty:2},
 {id:"runestone-checkers",icon:"♟️",intro:"A complete two-seat checkers contest with captures, kings and legal move hints.",type:"board",difficulty:3},
 ...EXPANSION_GAMES,
 ...ADVANCED_GAMES,
 ...PUZZLE_GAMES,
 ...ARENA_GAMES
];
export const GAMES = Object.fromEntries(PLAYABLE.map(g=>[g.id,g]));
export const DICE_FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];
export const SYMBOLS = ["🐉","🔥","💎","👑","🦄","⭐"];
export const CATEGORIES = ["Ones","Twos","Threes","Fours","Fives","Sixes","Three of a kind","Four of a kind","Full house","Small straight","Large straight","Five of a kind","Chance"];
export const QUESTIONS = [
 {q:"Which creature is traditionally associated with a hoard?",a:["Dragon","Mermaid","Dryad","Pixie"],correct:0},
 {q:"A cartographer's primary tool helps create what?",a:["Maps","Potions","Armor","Bread"],correct:0},
 {q:"Which item is commonly used to focus a wizard's spell?",a:["Arcane focus","Fishing rod","Pickaxe","Bedroll"],correct:0},
 {q:"Which kind of creature is a griffon usually depicted as?",a:["Lion and eagle","Fish and spider","Horse and serpent","Goat and bear"],correct:0},
 {q:"What does a blacksmith most commonly work with?",a:["Metal","Parchment","Silk","Ink"],correct:0},
 {q:"A portcullis normally protects a...?",a:["Gateway","Library shelf","Ship's mast","Potion bottle"],correct:0},
 {q:"In fantasy settings, a wyvern is most commonly...?",a:["A winged reptilian predator","A living tree","A stone giant","A sea spirit"],correct:0},
 {q:"Which is usually a musical instrument?",a:["Lute","Flail","Bracer","Quiver"],correct:0},
 {q:"What would an alchemist likely keep in a vial?",a:["A reagent","A horseshoe","A helm","A tapestry"],correct:0},
 {q:"Which is usually a type of protective armor?",a:["Chain mail","Quill","Compass","Tinderbox"],correct:0},
 {q:"A labyrinth is most likely to test your sense of...?",a:["Direction","Taste","Temperature","Rhythm"],correct:0},
 {q:"A bard entertaining a royal court might use...?",a:["Song and storytelling","Mining tools","Ship rigging","Saddlebags"],correct:0},
 {q:"A potion brewer might use a...?",a:["Cauldron","Crossbow","Drawbridge","War horn"],correct:0},
 {q:"What is most useful when navigating by the stars?",a:["Star chart","Smithing hammer","Loom","Abacus only"],correct:0},
 {q:"Where are coins commonly minted?",a:["A mint","An aviary","A stable","An observatory"],correct:0},
 {q:"Which is normally used to preserve a royal decree?",a:["Wax seal","Rope ladder","Fishing net","Iron spike"],correct:0},
 {q:"A ballista generally fires...?",a:["Heavy bolts","Tuning forks","Spellbooks","Flour sacks"],correct:0},
 {q:"What is a moon dial most likely intended to measure?",a:["Moon phases","Rainfall","Sword weight","Water depth"],correct:0},
 {q:"Which tool would a locksmith recognize?",a:["Tension wrench","Frying pan","Bellows","Hourglass"],correct:0},
 {q:"A compass needle commonly points toward...?",a:["Magnetic north","The nearest tavern","The loudest bard","The longest river"],correct:0}
];
export const EMOJI_PUZZLES = [
 {clue:"From seed to forest: arrange the symbols from beginning to end.",solution:["🌰","🌱","🌳","🍃"],hint:"The seed must come first."},
 {clue:"The cycle of a forge: work from cold iron to a completed sword.",solution:["⛏️","🔥","🔨","⚔️"],hint:"The fire precedes the hammer."},
 {clue:"The adventurer's night: follow the moon until dawn.",solution:["🌆","🌙","⭐","🌅"],hint:"Dusk starts the path."},
 {clue:"An ancient door: gather the key and reveal the treasure.",solution:["🗺️","🗝️","🚪","💎"],hint:"First find the map."},
 {clue:"A storm is born and the harvest follows.",solution:["☁️","⚡","🌧️","🌾"],hint:"Rain nourishes the crop."}
];
export const POTIONS = [
 {icon:"🌹",type:"flora",name:"Rose petals"},{icon:"🍄",type:"fungus",name:"Mooncap"},
 {icon:"🌿",type:"flora",name:"Silverleaf"},{icon:"🪨",type:"mineral",name:"Lodestone"},
 {icon:"💎",type:"mineral",name:"Aether crystal"},{icon:"🍃",type:"flora",name:"Bitterleaf"},
 {icon:"🧫",type:"fungus",name:"Spore culture"},{icon:"🪵",type:"mineral",name:"Petrified wood"}
];
export const LESSONS = {...EXPANSION_LESSONS,...ADVANCED_LESSONS,...PUZZLE_LESSONS,...ARENA_LESSONS,
 "coin-of-fate":["Choose heads or tails before the coin flips.","Each successful prediction is worth a point.","Play five rounds; highest score wins."],
 "wyrm-s-eye":["You start with one visible d12.","Predict whether the next is higher, lower or equal.","Bank your streak before a wrong call ends your run."],
 "serpent-s-seven":["Roll two dice to grow your unbanked score.","If you roll doubles, you lose your unbanked points.","Bank to secure points and begin a fresh round. Five banks end the match."],
 "lucky-kobold":["Choose an omen: Ascending (d4 < d8 < d12), Same parity (all odd or all even), Low (sum 11 or less) or High (sum 16 or more).","The kobold then rolls a d4, a d8 and a d12.","Same parity pays 3; every other omen pays 2. Play five rounds."],
 "king-s-high-roll":["Roll three six-sided dice.","Toggle dice to keep, then settle to reroll the others.","The dealer rolls three dice: highest total wins each round."],
 "devil-s-knuckles":["Roll four dice.","Keep promising dice and roll the others once.","Bank the result; pairs, triples and quads score bonuses."],
 "three-dragon-slots":["Spin the three magical reels.","Lock any symbol, then respin the rest once.","Bank the combination. Matching symbols pay fantasy points."],
 "seven-skulls":["Toss seven enchanted skull dice.","Keep dice or risk additional throws to improve your set.","Three skull faces in the final result bust that round."],
 "crown-bones":["Roll five dice and hold your favourites.","Up to three rolls per turn, then pick an unused scorecard row.","Complete all 13 rows; the strongest score wins."],
 "arm-wrestling-at-the-bar":["Each exchange, pick Power, Brace or Feint at the same moment as your rival: Power beats Feint, Brace beats Power, Feint beats Brace.","Power wins move the grip two notches but cost stamina; Brace recovers stamina. An exhausted Power fails, and Power-versus-Power favours the fresher arm.","Drive the grip three notches to your side to win outright (bonus for leftover stamina). After nine exchanges the referee scores your grip position."],
 "kattal-s-hammer":["The fairground bell has a shifting sweet spot.","Set your striking power near the glowing target.","Three blows add to your tournament score."],
 "darts-of-the-deep":["Click the board to select where you are aiming.","The wind nudges your dart after release.","Six throws award bullseye, ring and wedge scores."],
 "sly-fox-s-three-cups":["Watch the gem appear under one of three cups.","Watch each swap; the animation moves the cups.","Pick the final cup. Five correct guesses earn five points."],
 "tavern-trivia":["Read each fantasy question.","Choose one of four answers; there is no time limit.","Correct answers award ten points. Streaks add a bonus."],
 "tomb-of-the-restless-grave":["Read the six-line epitaph carefully.","Enter a word that answers all of its clues.","You have four attempts. A whispered hint is available but costs two points."],
 "forgotten-realms-emoji-door-generator":["Read the clue above the rune door.","Tap glyphs in the intended sequence; undo if needed.","Submit to open the door (10 points, 7 with a hint; a wrong order costs 1). Three doors are drawn at random."],
 "potion-sorting-sprint":["Inspect a magical ingredient.","Choose which of three cauldrons it belongs in.","Sort all eight reagents to complete the apothecary's test."],
 "black-dragon":["You and the dealer each draw two mystical cards valued 1–12; a 1 counts as 11 when that does not bust you.","Hit for another card, stand, or — on your first two cards only — double for exactly one more card at twice the stakes.","Closest to 21 without going over wins 2 (4 doubled); a tie returns 1. The dealer draws until reaching at least 17."],
 "three-card-wyvern":["Receive three cards from four magical suits.","Exchange at most one card to improve your hand.","Compare with the goblin dealer in five rounds."],
 "runestone-checkers":["Click one of your stones and then its target square.","Diagonal jumps are compulsory. Make another jump when one is available.","Reach the far side to crown a king; capture all rivals or block their moves."]
};
