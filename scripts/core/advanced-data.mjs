/** Stage 3: casino tables, strategic board activities and native Wyvern Chess. */
export const ADVANCED_GAMES=[
 {id:'waterdeep-hold-em',icon:'♠️',type:'cards',difficulty:4,intro:'Original fantasy hold’em with two secret cards, five shared cards, four rounds of fictional-point betting and real hand comparison.'},
 {id:'three-wyrms-ante',icon:'🐲',type:'cards',difficulty:3,intro:'Draft and reveal cards from four wyrm elements; win three tricks per round.'},
 {id:'dragon-s-trick',icon:'🂡',type:'cards',difficulty:3,intro:'Follow suit, choose when to spend a high card, and contest trump-powered tricks.'},
 {id:'bard-s-bluff',icon:'🎭',type:'cards',difficulty:3,intro:'Play a hidden card, claim its rank, then accept or challenge your rival’s claims.'},
 {id:'king-s-gambit',icon:'♜',type:'board',difficulty:3,intro:'Two players deploy a five-card hand across three battle lanes to claim the realm.'},
 {id:'elemental-conquest',icon:'🌋',type:'board',difficulty:3,intro:'Place elemental tiles on a shared four-by-four realm; exploit matching neighbours for territory points.'},
 {id:'royal-hunt',icon:'🏹',type:'board',difficulty:2,intro:'Choose hunting grounds, scout creatures, and balance bold captures against injury and stamina.'},
 {id:'wyvern-chess',icon:'🐉',type:'board',difficulty:5,intro:'Native three-layer 12×8 Wyvern Chess with 15 piece types, cross-level play, checkmate and NPC moves.'}
];
export const ADVANCED_IDS=new Set(ADVANCED_GAMES.map(g=>g.id));
export const ADVANCED_LESSONS={
 'waterdeep-hold-em':['Each player receives two private cards; five shared cards appear over the flop, turn and river.','Check when the table has no wager, call to match it, raise by two fictional points or fold. At most two raises per betting street.','The best five-card poker hand from your seven cards wins each pot. Play three hands. Fictional points are NOT real-money wagers.'],
 'three-wyrms-ante':['Each player receives five elemental cards. Choose a card to play face up.','Each completed trick compares card strength, plus a two-point bonus for matching the leading element.','The strongest card wins a trick. Nine tricks across three rounds determine the winner.'],
 'dragon-s-trick':['Cards have a rank and one of four suits. The first card played establishes the leading suit.','When you have the leading suit you must follow it; otherwise you may play another suit. One suit is trump.','Highest trump wins if any are played. Otherwise highest card of the leading suit wins. Four tricks per round.'],
 'bard-s-bluff':['The stage calls a rank that climbs 1→2→…→6→1 after every claim. On your turn, lay one card face down and declare it is the called rank — truthfully or not.','The next bard accepts (you score 1) or challenges. A truthful card scores you 2; a caught bluff gives the challenger 2 and costs you 1.','Each bard holds four cards per hand (six copies of each rank exist). Count what you hold and what has been revealed. Three hands decide the winner.'],
 'king-s-gambit':['You have five strength cards and three battle lanes: Gate, Keep and Spire.','On your turn deploy one card in a chosen lane. Both sides alternate until all ten cards are played.','Each lane is scored separately: the stronger army claims three points, while a tie yields one point each.'],
 'elemental-conquest':['Select an elemental tile from your three-card hand.','Place it in an empty square on the shared four-by-four map; every matching adjacent tile adds two points.','Play until all sixteen squares are claimed. Gain a two-point bonus for controlling a majority of each element.'],
 'royal-hunt':['On your turn choose the Forest, Highlands or Ruins. Higher-risk areas offer better prizes.','After the encounter appears, choose to withdraw, approach cautiously or charge boldly.','Stamina and chance influence the result. Each contestant takes three expeditions.'],
 'wyvern-chess':['Gold moves first on one of three boards: Sky (3), Land (2) and Underworld (1). Select a friendly piece and click a highlighted legal destination.','Each piece has distinctive movement, including cross-level moves. Basilisks freeze opposing Land pieces directly above them.','Protect your King while threatening the opponent’s King. The engine rejects moves that leave your King in check. Checkmate wins; stalemate draws.']
};
export const ELEMENTS=['🔥','💧','🌿','⚡'];
export const SUITS=['♠','♥','♦','♣'];
