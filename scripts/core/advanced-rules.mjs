import {ADVANCED_IDS,ELEMENTS,SUITS} from './advanced-data.mjs';
import {initWyvern,applyWyvern,wyvernNpcMove} from './wyvern.mjs';
const ensure=(value,msg='Illegal move')=>{if(!value)throw Error(msg)};
const copy=structuredClone;
const rand=(rng,n)=>Math.floor(rng()*n);
const shuffle=(list,rng)=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=rand(rng,i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const normalizeCard=(c)=>({rank:c.rank,suit:c.suit});
const deck52=()=>SUITS.flatMap(suit=>Array.from({length:13},(_,i)=>({rank:i+2,suit})));
const deckElemental=(max=10)=>ELEMENTS.flatMap(suit=>Array.from({length:max},(_,i)=>({rank:i+1,suit})));
const deckBard=()=>Array.from({length:6},(_,i)=>Array.from({length:6},()=>({rank:i+1,suit:'🎵'}))).flat();
const order=(s,n=s.turn)=>s.seats[n];
const rotate=(s,start=s.turn,can=()=>true)=>{for(let i=1;i<=s.seats.length;i++){let next=(start+i)%s.seats.length;if(can(next))return next;}return start;};
const pushLog=(s,msg,move=null)=>{s.log.push(msg);s.log=s.log.slice(-36);if(move){s.replay.push(move);s.replay=s.replay.slice(-240);}};
const cardName=c=>c?`${c.rank}${c.suit}`:'?';
const standings=s=>{const best=Math.max(...Object.values(s.scores));const winners=s.seats.map((id,i)=>s.scores[id]===best?i:-1).filter(i=>i>=0);return winners.length===1?winners[0]:'draw';};
const finish=s=>{s.done=true;s.phase='finished';s.winner=standings(s);return s;};
export function publicReplayFrame(s){
 const frame={turn:s.turn,phase:s.phase,round:s.round,log:s.log?.at(-1)||'Match started',scores:structuredClone(s.scores||{}),gameId:s.gameId};
 if(s.community)frame.community=structuredClone(s.community);
 if(s.trick)frame.trick=structuredClone(s.trick);
 if(s.lanes)frame.lanes=structuredClone(s.lanes);
 if(s.cells)frame.cells=structuredClone(s.cells);
 if(s.encounter)frame.encounter=structuredClone(s.encounter);
 if(s.pot!==undefined)frame.pot=s.pot;
 if(s.pending)frame.pending={by:s.pending.by,claim:s.pending.claim};
 if(s.lastTrick)frame.winner=s.lastTrick.winningId;
 return frame;
}
function timeline(s){s.timeline=[...(s.timeline||[]),publicReplayFrame(s)].slice(-240);return s;}
const base=({gameId,seats})=>({gameId,seats:seats.map(z=>z.id),scores:Object.fromEntries(seats.map(z=>[z.id,0])),hands:{},deck:[],discard:[],turn:0,phase:'play',done:false,winner:null,round:0,rounds:3,log:[],replay:[]});

// Correct five-from-seven hand ranking, including wheel straights and split pots.
function hand5(cards){const ranks=cards.map(c=>c.rank).sort((a,b)=>b-a),unique=[...new Set(ranks)].sort((a,b)=>b-a),count={};ranks.forEach(r=>count[r]=(count[r]||0)+1);
 const groups=Object.keys(count).map(Number).sort((a,b)=>count[b]-count[a]||b-a),flush=cards.every(c=>c.suit===cards[0].suit);
 const straight=[...unique,...(unique.includes(14)?[1]:[])];let hi=0;for(let i=0;i<=straight.length-5;i++)if(straight[i]-straight[i+4]===4){hi=straight[i];break;}
 let cat=0,parts=[];
 if(flush&&hi){cat=8;parts=[hi];}
 else if(count[groups[0]]===4){cat=7;parts=[groups[0],groups[1]];}
 else if(count[groups[0]]===3&&count[groups[1]]===2){cat=6;parts=[groups[0],groups[1]];}
 else if(flush){cat=5;parts=ranks;}
 else if(hi){cat=4;parts=[hi];}
 else if(count[groups[0]]===3){cat=3;parts=[groups[0],...groups.slice(1).sort((a,b)=>b-a)];}
 else if(count[groups[0]]===2&&count[groups[1]]===2){cat=2;parts=[...groups.filter(r=>count[r]===2).sort((a,b)=>b-a),groups.find(r=>count[r]===1)];}
 else if(count[groups[0]]===2){cat=1;parts=[groups[0],...groups.slice(1).sort((a,b)=>b-a)];}
 else parts=ranks;
 return cat*15**5+parts.reduce((sum,v,i)=>sum+v*15**(4-i),0);
}
export function pokerScore(cards){ensure(Array.isArray(cards)&&cards.length>=5&&cards.length<=7,'Five to seven cards are required');let best=-1;
 for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++)best=Math.max(best,hand5([cards[a],cards[b],cards[c],cards[d],cards[e]]));
 return best;
}
export const POKER_RANKS=['High card','Pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush'];
export function pokerLabel(score){return POKER_RANKS[Math.floor(score/15**5)]||'Hand';}
function newPokerHand(s,rng){s.deck=shuffle(deck52(),rng);s.hands={};s.folded={};s.streetContrib={};s.acted=[];s.balance={};s.pot=0;s.community=[];s.bets=0;s.maxStreet=0;s.lastReveal=null;
 for(const id of s.seats){s.hands[id]=[s.deck.pop(),s.deck.pop()];s.folded[id]=false;s.streetContrib[id]=0;s.balance[id]=18;s.pot+=2;}
 s.phase='bet-preflop';s.turn=s.round%s.seats.length;pushLog(s,`Hold’em hand ${s.round+1}: ${s.seats.length} contestants ante 2 fictional points.`);}
function alivePoker(s){return s.seats.filter(id=>!s.folded[id]);}
function pokerReveal(s){const remaining=alivePoker(s),ranks=remaining.map(id=>({id,rank:pokerScore([...s.hands[id],...s.community])})),max=Math.max(...ranks.map(x=>x.rank)),winners=ranks.filter(x=>x.rank===max).map(x=>x.id),share=Math.floor(s.pot/winners.length),left=s.pot%winners.length;
 winners.forEach((id,i)=>{s.scores[id]+=share+(i<left?1:0);});s.lastReveal={hands:Object.fromEntries(remaining.map(id=>[id,s.hands[id]])),winners,rank:pokerLabel(max),pot:s.pot,ranks:Object.fromEntries(ranks.map(x=>[x.id,pokerLabel(x.rank)]))};s.phase='reveal';pushLog(s,`${winners.join(' & ')} win ${s.pot} fictional points with ${pokerLabel(max)}.`,{type:'showdown',winners,community:[...s.community]});}
function streetAdvance(s){const phases=['bet-preflop','bet-flop','bet-turn','bet-river'];const next=phases.indexOf(s.phase)+1;
 if(next>=phases.length)return pokerReveal(s);
 s.community.push(...s.deck.splice(-([3,1,1][next-1])));s.phase=phases[next];s.acted=[];s.streetContrib=Object.fromEntries(s.seats.map(id=>[id,0]));s.maxStreet=0;s.bets=0;s.turn=rotate(s,s.round%s.seats.length-1,i=>!s.folded[s.seats[i]]);pushLog(s,`${s.phase.replace('bet-','')} revealed.`);
}
function betting(s,id,action){ensure(!s.folded[id],'You have folded');const owing=s.maxStreet-s.streetContrib[id],type=action.type;
 if(type==='fold'){s.folded[id]=true;s.acted.push(id);pushLog(s,`${id} folds.`,{type:'fold',by:id});}
 else if(type==='check'){ensure(owing===0,'You must call, raise or fold');s.acted.push(id);pushLog(s,`${id} checks.`,{type:'check',by:id});}
 else if(type==='call'){ensure(owing>0,'Nothing to call');ensure(s.balance[id]>=owing,'Not enough fictional chips');s.balance[id]-=owing;s.pot+=owing;s.streetContrib[id]+=owing;s.acted.push(id);pushLog(s,`${id} calls ${owing}.`,{type:'call',by:id,points:owing});}
 else if(type==='raise'){ensure(s.bets<2,'Maximum two raises per street');const cost=owing+2;ensure(s.balance[id]>=cost,'Not enough fictional chips');s.balance[id]-=cost;s.pot+=cost;s.streetContrib[id]+=cost;s.maxStreet+=2;s.bets++;s.acted=[id];pushLog(s,`${id} raises by two fictional points.`,{type:'raise',by:id});}
 else throw Error('Choose check, call, raise or fold');
 const alive=alivePoker(s);if(alive.length===1){const winner=alive[0];s.scores[winner]+=s.pot;s.lastReveal={hands:{},winners:[winner],rank:'Everyone else folded',pot:s.pot};s.phase='reveal';pushLog(s,`${winner} takes the pot after every opponent folds.`);return;}
 if(alive.every(x=>s.acted.includes(x)&&s.streetContrib[x]===s.maxStreet))return streetAdvance(s);
 s.turn=rotate(s,s.turn,i=>!s.folded[s.seats[i]]&&!s.acted.includes(s.seats[i]));
}

function freshTricks(s,rng){const max=s.gameId==='dragon-s-trick'?12:10,number=s.gameId==='dragon-s-trick'?4:5;s.deck=shuffle(deckElemental(max),rng);s.hands={};for(const id of s.seats)s.hands[id]=Array.from({length:number},()=>s.deck.pop());s.trick=[];s.leadSuit=null;s.trickCount=0;s.trickTarget=s.gameId==='dragon-s-trick'?4:3;s.phase='play';s.trump=ELEMENTS[s.round%ELEMENTS.length];s.turn=s.round%s.seats.length;pushLog(s,`Round ${s.round+1}: ${s.gameId==='dragon-s-trick'?`trump ${s.trump}`:'three wyrm tricks'}.`);}
function winnerOfTrick(s){const lead=s.trick[0].card.suit;const value=x=>{
 if(s.gameId==='dragon-s-trick')return (x.card.suit===s.trump?1000:x.card.suit===lead?100:0)+x.card.rank;
 return x.card.rank+(x.card.suit===lead?2:0);
 };let winner=s.trick[0];for(const e of s.trick.slice(1))if(value(e)>value(winner))winner=e;return winner;}
function playTrick(s,id,action){ensure(action.type==='play-card','Choose a card to play');const index=Number(action.index),hand=s.hands[id];ensure(Number.isInteger(index)&&index>=0&&index<hand.length,'Invalid card');
 if(s.gameId==='dragon-s-trick'&&s.trick.length&&hand.some(c=>c.suit===s.leadSuit))ensure(hand[index].suit===s.leadSuit,'You must follow the leading suit');
 const card=hand.splice(index,1)[0];if(!s.trick.length)s.leadSuit=card.suit;s.trick.push({id,card});pushLog(s,`${id} plays ${cardName(card)}.`,{type:'card',by:id,card});
 if(s.trick.length===s.seats.length){const winner=winnerOfTrick(s);s.scores[winner.id]+=s.gameId==='dragon-s-trick'?1:2;s.lastTrick={plays:s.trick,winningId:winner.id};s.trickCount++;s.turn=s.seats.indexOf(winner.id);s.phase='reveal';pushLog(s,`${winner.id} wins the trick.`);}
 else s.turn=rotate(s,s.turn);
}
function trickNext(s,rng){ensure(s.phase==='reveal','No completed trick to clear');if(s.trickCount>=s.trickTarget){s.round++;if(s.round>=s.rounds)return finish(s);return freshTricks(s,rng);}s.trick=[];s.leadSuit=null;s.phase='play';}
function newBluffHand(s,rng){s.deck=shuffle(deckBard(),rng);s.hands={};for(const id of s.seats)s.hands[id]=Array.from({length:4},()=>s.deck.pop());s.pending=null;s.phase='offer';s.calledRank=1;s.turn=s.round%s.seats.length;pushLog(s,`Bard's Bluff hand ${s.round+1}: conceal your four cards.`);}
function bluffOffer(s,id,action){ensure(action.type==='offer','Choose a card and claimed rank');let index=Number(action.index),claim=Number(action.claim);ensure(Number.isInteger(index)&&index>=0&&index<s.hands[id].length,'Invalid private card');if(!Number.isInteger(claim))claim=s.calledRank||1;ensure(claim===(s.calledRank||1),`This turn's called rank is ${s.calledRank||1}; you must claim it, truthfully or not`);
 const card=s.hands[id].splice(index,1)[0];s.pending={by:id,claim,card};s.phase='respond';s.turn=rotate(s,s.turn);pushLog(s,`${id} plays a hidden card and claims rank ${claim}.`,{type:'offer',by:id,claim});}
function bluffRespond(s,id,action){ensure(['accept','challenge'].includes(action.type),'Accept or challenge');const pending=s.pending;ensure(pending&&pending.by!==id,'You cannot challenge yourself');const truthful=pending.claim===pending.card.rank;
 if(action.type==='accept'){s.scores[pending.by]++;pushLog(s,`${id} accepts the claim. ${pending.by} scores 1.`,{type:'accept',by:id});}
 else if(truthful){s.scores[pending.by]+=2;pushLog(s,`${id} challenged a truthful claim! The rank was ${pending.card.rank}; ${pending.by} scores 2.`,{type:'challenge',by:id,truthful:true,rank:pending.card.rank});}
 else{s.scores[id]+=2;s.scores[pending.by]=Math.max(0,s.scores[pending.by]-1);pushLog(s,`${id} caught the bluff! The hidden rank was ${pending.card.rank}, not ${pending.claim}. +2.`,{type:'challenge',by:id,truthful:false,rank:pending.card.rank});}
 s.discard.push(pending.card);s.pending=null;s.calledRank=(s.calledRank||1)%6+1;
 if(s.seats.every(player=>s.hands[player].length===0)){s.phase='reveal';return;}
 s.turn=s.hands[id].length? s.seats.indexOf(id) : rotate(s,s.turn,i=>s.hands[s.seats[i]].length>0);s.phase='offer';
}
function newGambit(s,rng){const deck=shuffle(deckElemental(9),rng);s.hands={};for(const id of s.seats)s.hands[id]=Array.from({length:5},()=>deck.pop());s.lanes=[[],[],[]];s.turn=0;s.phase='deploy';s.round=0;s.rounds=10;}
function finishGambit(s){for(let i=0;i<3;i++){const totals=s.seats.map(id=>s.lanes[i].filter(x=>x.id===id).reduce((a,x)=>a+x.card.rank,0));
 if(totals[0]===totals[1]){s.scores[s.seats[0]]++;s.scores[s.seats[1]]++;}else s.scores[s.seats[totals[0]>totals[1]?0:1]]+=3;
 }finish(s);pushLog(s,'All three battle lanes resolved.');}
function gambitDeploy(s,id,action){ensure(action.type==='deploy','Choose a lane and card');const index=Number(action.index),lane=Number(action.lane);ensure(Number.isInteger(lane)&&lane>=0&&lane<3,'Invalid lane');ensure(Number.isInteger(index)&&index>=0&&index<s.hands[id].length,'Invalid card');
 const card=s.hands[id].splice(index,1)[0];s.lanes[lane].push({id,card});s.round++;pushLog(s,`${id} sends ${cardName(card)} to ${['Gate','Keep','Spire'][lane]}.`,{type:'deploy',by:id,lane,card});if(s.round>=s.rounds)finishGambit(s);else s.turn=rotate(s);}
function newConquest(s,rng){s.deck=shuffle([...deckElemental(8),...deckElemental(8)],rng);s.cells=Array(16).fill(null);s.hands={};for(const id of s.seats)s.hands[id]=Array.from({length:3},()=>s.deck.pop());s.phase='place';s.round=0;s.rounds=16;}
const neighbours=i=>[[Math.floor(i/4)-1,i%4],[Math.floor(i/4)+1,i%4],[Math.floor(i/4),i%4-1],[Math.floor(i/4),i%4+1]].filter(([r,c])=>r>=0&&r<4&&c>=0&&c<4).map(([r,c])=>r*4+c);
function conquestPlace(s,id,action){ensure(action.type==='place','Choose a free cell and tile');const index=Number(action.index),cell=Number(action.cell);
 ensure(Number.isInteger(index)&&index>=0&&index<s.hands[id].length,'Invalid tile');ensure(Number.isInteger(cell)&&cell>=0&&cell<16&&s.cells[cell]===null,'Select an empty square');
 const card=s.hands[id].splice(index,1)[0],bonus=neighbours(cell).filter(i=>s.cells[i]?.card.suit===card.suit).length*2;
 s.cells[cell]={id,card};s.scores[id]+=card.rank+bonus;if(s.deck.length)s.hands[id].push(s.deck.pop());s.round++;
 pushLog(s,`${id} claims square ${cell+1} with ${cardName(card)} (+${card.rank+bonus}).`,{type:'place',by:id,cell,card});
 if(s.round>=16){for(const suit of ELEMENTS){let counts=Object.fromEntries(s.seats.map(id=>[id,0]));for(const cell of s.cells)if(cell?.card.suit===suit)counts[cell.id]++;
  const top=Math.max(...Object.values(counts));const leaders=s.seats.filter(id=>counts[id]===top&&top>0);if(leaders.length===1)s.scores[leaders[0]]+=2;}
  finish(s);
 }else s.turn=rotate(s);}
const regions={forest:{danger:2,reward:1},highlands:{danger:4,reward:3},ruins:{danger:5,reward:5}};
const beasts=['Mossback stag','Stonehorn ram','Glowfang fox','Wyrm hatchling','Grimjaw boar','Crystal wisp','Giant firefly','Moonshadow elk'];
function newHunt(s){s.round=0;s.rounds=s.seats.length*3;s.phase='track';s.stamina=Object.fromEntries(s.seats.map(id=>[id,6]));s.encounter=null;}
function huntTrack(s,id,action,rng){ensure(action.type==='track'&&regions[action.region],'Choose valid hunting grounds');const region=regions[action.region],beast=beasts[rand(rng,beasts.length)];s.encounter={region:action.region,beast,danger:region.danger+rand(rng,3),reward:region.reward+rand(rng,3)};s.phase='decide';pushLog(s,`${id} tracks a ${beast} into the ${action.region}.`,{type:'track',by:id,region:action.region});}
function huntDecide(s,id,action,rng){ensure(['withdraw','cautious','bold'].includes(action.type),'Choose an approach');let pts=0,msg='';
 if(action.type==='withdraw'){s.stamina[id]=Math.min(6,s.stamina[id]+2);msg='Withdrawn safely; recovered 2 stamina.';}
 else{const cost=action.type==='cautious'?1:2;ensure(s.stamina[id]>=cost,'Not enough stamina; withdraw to recover');s.stamina[id]-=cost;
  const roll=rand(rng,6)+1+(action.type==='cautious'?2:0)+(s.stamina[id]>=3?1:0);
  const target=s.encounter.danger+(action.type==='bold'?0:1);
  if(roll>=target){pts=s.encounter.reward+(action.type==='bold'?3:0);s.scores[id]+=pts;msg=`Captured ${s.encounter.beast} for ${pts} points.`;}
  else{s.stamina[id]=Math.max(0,s.stamina[id]-1);msg=`${s.encounter.beast} escaped; one additional stamina lost.`;}
 }
 s.round++;s.encounter=null;pushLog(s,`${id}: ${msg}`,{type:'hunt',by:id,choice:action.type,points:pts});
 if(s.round>=s.rounds)finish(s);else{s.phase='track';s.turn=rotate(s);}
}

export function initAdvancedGame(gameId,seats,rng=Math.random){ensure(ADVANCED_IDS.has(gameId),'Unknown advanced game');ensure(seats.length>=2,'Two seats required');
 if(gameId==='wyvern-chess'){const chess=initWyvern();chess.seatIds=seats.map(x=>x.id);return chess;}
 const s=base({gameId,seats});
 switch(gameId){
 case 'waterdeep-hold-em':ensure(seats.length<=4,'Hold’em supports up to four players');newPokerHand(s,rng);break;
 case 'three-wyrms-ante':case 'dragon-s-trick':ensure(seats.length<=4,'Trick-taking supports up to four players');freshTricks(s,rng);break;
 case 'bard-s-bluff':ensure(seats.length<=4,'Bluffing supports up to four players');newBluffHand(s,rng);break;
 case 'king-s-gambit':ensure(seats.length===2,'The Gambit needs exactly two seats');newGambit(s,rng);break;
 case 'elemental-conquest':ensure(seats.length<=4,'Conquest supports up to four players');newConquest(s,rng);break;
 case 'royal-hunt':ensure(seats.length<=4,'The Hunt supports up to four players');newHunt(s);break;
 }return timeline(s);
}
export function applyAdvancedGame(old,seatId,action,rng=Math.random){
 if(old.gameId==='wyvern-chess')return applyWyvern(old,seatId,old.seatIds,action);
 const s=copy(old);ensure(!s.done,'The match has ended');ensure(s.seats.includes(seatId),'Unknown seat');
 if(s.phase==='reveal'&&action?.type==='next'){
  if(s.gameId==='waterdeep-hold-em'){s.round++;if(s.round>=s.rounds)finish(s);else newPokerHand(s,rng);}
  else if(s.gameId==='bard-s-bluff'){s.round++;if(s.round>=s.rounds)finish(s);else newBluffHand(s,rng);}
  else trickNext(s,rng);
  return timeline(s);
 }
 ensure(s.seats[s.turn]===seatId,'Wait for your turn');
 switch(s.gameId){
 case 'waterdeep-hold-em':ensure(s.phase.startsWith('bet-'),'Wait for the next hand');betting(s,seatId,action);break;
 case 'three-wyrms-ante':case 'dragon-s-trick':ensure(s.phase==='play','Reveal the previous trick first');playTrick(s,seatId,action);break;
 case 'bard-s-bluff':s.phase==='offer'?bluffOffer(s,seatId,action):bluffRespond(s,seatId,action);break;
 case 'king-s-gambit':gambitDeploy(s,seatId,action);break;
 case 'elemental-conquest':conquestPlace(s,seatId,action);break;
 case 'royal-hunt':s.phase==='track'?huntTrack(s,seatId,action,rng):huntDecide(s,seatId,action,rng);break;
 default:throw Error('Advanced reducer missing');
 }
 return timeline(s);
}
// Never disclose other players' private hands or unrevealed board/deck data.
export function projectAdvancedGame(old,ownIds=[]){
 if(old.gameId==='wyvern-chess'){const s=copy(old);delete s.seatIds;return s;}
 const s=copy(old);delete s.deck;
 for(const id of s.seats)if(!ownIds.includes(id))s.hands[id]=s.hands[id]?.map(()=>null)||[];
 if(s.gameId==='waterdeep-hold-em'){
  if(s.phase!=='reveal'&&s.phase!=='finished')s.lastReveal=null;
  s.balance=copy(s.balance); // Fictional betting allowance is public.
 }
 if(s.gameId==='bard-s-bluff'&&s.pending)s.pending={by:s.pending.by,claim:s.pending.claim,hidden:true};
 if(s.gameId==='royal-hunt'&&s.encounter)s.encounter=copy(s.encounter);
 return s;
}
export function advancedLegalActions(s,seatId){if(s.done)return [];if(s.phase==='reveal')return [{type:'next'}];
 if(s.gameId==='wyvern-chess')return [];if(s.seats[s.turn]!==seatId)return [];
 switch(s.gameId){
 case 'waterdeep-hold-em':{const owe=s.maxStreet-s.streetContrib[seatId];return [{type:'fold'},...(owe===0?[{type:'check'}]:s.balance[seatId]>=owe?[{type:'call'}]:[]),...(s.bets<2&&s.balance[seatId]>=owe+2?[{type:'raise'}]:[])];}
 case 'three-wyrms-ante':return s.hands[seatId].map((_,index)=>({type:'play-card',index}));
 case 'dragon-s-trick':{const hand=s.hands[seatId],lead=s.leadSuit,allowed=s.trick.length&&hand.some(c=>c.suit===lead)?hand.map((c,i)=>c.suit===lead?i:-1).filter(i=>i>=0):hand.map((_,i)=>i);return allowed.map(index=>({type:'play-card',index}));}
 case 'bard-s-bluff':return s.phase==='respond'?[{type:'accept'},{type:'challenge'}]:s.hands[seatId].map((_,index)=>({type:'offer',index,claim:s.calledRank||1}));
 case 'king-s-gambit':return s.hands[seatId].flatMap((_,index)=>[0,1,2].map(lane=>({type:'deploy',index,lane})));
 case 'elemental-conquest':return s.hands[seatId].flatMap((_,index)=>s.cells.flatMap((v,cell)=>v===null?[{type:'place',index,cell}]:[]));
 case 'royal-hunt':return s.phase==='track'?Object.keys(regions).map(region=>({type:'track',region})):[{type:'withdraw'},...(s.stamina[seatId]>=1?[{type:'cautious'}]:[]),...(s.stamina[seatId]>=2?[{type:'bold'}]:[])];
 default:return [];
 }
}
export function advancedNpcAction(s,seatId,rng=Math.random){
 if(s.gameId==='wyvern-chess')return wyvernNpcMove(s,rng);
 const legal=advancedLegalActions(s,seatId);if(!legal.length)return null;
 if(s.phase==='reveal')return null;
 if(s.gameId==='waterdeep-hold-em'){const hand=s.hands[seatId],same=hand[0].rank===hand[1].rank,high=hand.some(c=>c.rank>=12),owed=s.maxStreet-s.streetContrib[seatId];
  if((same||high)&&legal.some(x=>x.type==='raise')&&rng()<.25)return {type:'raise'};
  return legal.find(x=>x.type===(owed?'call':'check'))||legal.find(x=>x.type==='call')||{type:'fold'};
 }
 if(s.gameId==='dragon-s-trick'||s.gameId==='three-wyrms-ante')return [...legal].sort((a,b)=>s.hands[seatId][a.index].rank-s.hands[seatId][b.index].rank)[rand(rng,Math.min(2,legal.length))];
 if(s.gameId==='bard-s-bluff'){const want=s.calledRank||1;if(s.phase==='respond'){const seen=[...s.hands[seatId],...s.discard].filter(c=>c?.rank===want).length;const p=Math.min(.9,.15+seen*.17);return {type:rng()<p?'challenge':'accept'};}const hand=s.hands[seatId];let index=hand.findIndex(c=>c.rank===want);if(index<0)index=hand.reduce((ix,c,i,arr)=>c.rank<arr[ix].rank?i:ix,0);return {type:'offer',index,claim:want};}
 if(s.gameId==='king-s-gambit'){const me=seatId,hand=s.hands[me];let best=null;for(let lane=0;lane<3;lane++){const mine=s.lanes[lane].filter(x=>x.id===me).reduce((t,x)=>t+x.card.rank,0),theirs=s.lanes[lane].filter(x=>x.id!==me).reduce((t,x)=>t+x.card.rank,0);hand.forEach((c,index)=>{const after=mine+c.rank,swing=(after>theirs&&mine<=theirs?10:after===theirs?3:0)-(after>theirs+6?4:0)-c.rank*.4+rng();if(!best||swing>best.v)best={v:swing,index,lane};});}return {type:'deploy',index:best.index,lane:best.lane};}
 if(s.gameId==='elemental-conquest'){let best=-Infinity,bestAct=legal[0];for(const a of legal){const c=s.hands[seatId][a.index],score=c.rank+neighbours(a.cell).filter(i=>s.cells[i]?.card.suit===c.suit).length*2;if(score>best){best=score;bestAct=a;}}return bestAct;}
 if(s.gameId==='royal-hunt'){if(s.phase==='track')return {type:'track',region:s.stamina[seatId]>=3?'highlands':'forest'};return s.stamina[seatId]<2?{type:'withdraw'}:{type:'cautious'};}
 return legal[0];
}
export function advanceAdvancedNpc(s,seats,rng=Math.random,max=16){let out=s;for(let i=0;i<max&&!out.done;i++){
 if(out.phase==='reveal'){
  if(seats.every(seat=>seat.kind==='auto-npc')){out=applyAdvancedGame(out,seats[0].id,{type:'next'},rng);continue;}
  break;
 }const seat=seats[out.turn];if(seat?.kind!=='auto-npc')break;const act=advancedNpcAction(out,seat.id,rng);if(!act)break;
 if(out.gameId==='wyvern-chess')out=applyWyvern(out,seat.id,seats.map(x=>x.id),act);else out=applyAdvancedGame(out,seat.id,act,rng);
 }return out;
}
