import test from 'node:test';
import assert from 'node:assert/strict';
import {ADVANCED_GAMES,ADVANCED_IDS,ADVANCED_LESSONS} from '../scripts/core/advanced-data.mjs';
import {initAdvancedGame,applyAdvancedGame,projectAdvancedGame,advancedNpcAction,advancedLegalActions,pokerScore,pokerLabel} from '../scripts/core/advanced-rules.mjs';
import {initWyvern,wyvernInitial,wyvernGenerate,wyvernMoves,applyWyvern,wyvernNpcMove,wyvernFrozen} from '../scripts/core/wyvern.mjs';
import {ArcadeSessions} from '../scripts/core/session.mjs';
import {renderArcade} from '../scripts/ui/view.mjs';
const seeded=(initial)=>{let v=initial>>>0;return()=>((v=(1664525*v+1013904223)>>>0)/4294967296)};
const seats=(n=2)=>Array.from({length:n},(_,i)=>({id:`seat-${i}`,name:`Player ${i}`,ownerId:`user-${i}`,kind:'person'}));
const ctx={catalog:[],sessions:[],session:null,selected:'wyvern-chess',user:{id:'user-0',name:'Player 0'},gm:true,showAll:false,seatId:'seat-0',tutorialStep:0,power:70,selectedSquare:null,aimX:0,aimY:0,selectedCard:0,selectedLane:0,claimRank:1,wyvernLayer:2,selectedWyvern:null,packs:[],ledger:[],coinMode:'classic',coinRounds:5,packChoice:'',reducedMotion:true};

test('all eight advanced game IDs have lessons and distinct catalog entries',()=>{
 assert.equal(ADVANCED_GAMES.length,8);assert.equal(ADVANCED_IDS.size,8);
 for(const g of ADVANCED_GAMES)assert(ADVANCED_LESSONS[g.id]?.length>=3);
});

test('five-of-seven poker evaluation supports wheel, full house and flush',()=>{
 const make=(ranks,suits)=>ranks.map((rank,i)=>({rank,suit:suits[i]}));
 const straightFlush=make([14,2,3,4,5,10,11],['♠','♠','♠','♠','♠','♦','♣']);
 const four=make([13,13,13,13,4,5,7],['♠','♥','♦','♣','♠','♥','♦']);
 const full=make([12,12,12,8,8,3,2],['♠','♥','♦','♣','♠','♥','♦']);
 assert.equal(pokerLabel(pokerScore(straightFlush)),'Straight flush');
 assert.equal(pokerLabel(pokerScore(four)),'Four of a kind');
 assert.equal(pokerLabel(pokerScore(full)),'Full house');
 assert(pokerScore(straightFlush)>pokerScore(four));
 assert(pokerScore(four)>pokerScore(full));
});

test('all seven new advanced games complete 60 full scripted matches without stalls',()=>{
 for(const g of ADVANCED_GAMES.filter(x=>x.id!=='wyvern-chess'))for(let seed=1;seed<=60;seed++){
  const rng=seeded(seed*776+g.id.length),people=seats(g.id==='king-s-gambit'?2:seed%2===0?3:2);
  let s=initAdvancedGame(g.id,people,rng),steps=0;
  for(;!s.done&&steps<360;steps++){
   const id=s.seats[s.turn],action=s.phase==='reveal'?{type:'next'}:advancedNpcAction(s,id,rng);
   assert(action,`No action ${g.id} ${seed} phase ${s.phase}`);
   s=applyAdvancedGame(s,id,action,rng);
   assert.equal(s.gameId,g.id);
  }
  assert(s.done,`${g.id} stalled in seed ${seed}: phase ${s.phase}, round ${s.round}, action count ${steps}`);
  assert(['draw',...Array.from({length:people.length},(_,i)=>i)].includes(s.winner));
  assert(s.replay.length>0);
  assert(Object.values(s.scores).every(x=>Number.isFinite(x)&&x>=0));
 }
});

test('projected card hands are isolated from other players and the random deck is absent',()=>{
 for(const g of ADVANCED_GAMES.filter(x=>x.id!=='wyvern-chess')){
  const s=initAdvancedGame(g.id,seats(2),seeded(41)),visible=projectAdvancedGame(s,['seat-0']);
  assert.equal(visible.deck,undefined);
  if(s.hands['seat-1'])assert(visible.hands['seat-1'].every(x=>x===null),g.id);
  if(s.hands['seat-0'])assert.deepEqual(visible.hands['seat-0'],s.hands['seat-0']);
 }
 const bluff=initAdvancedGame('bard-s-bluff',seats(),seeded(2));
 assert.throws(()=>applyAdvancedGame(bluff,'seat-0',{type:'offer',index:0,claim:5},seeded(4)),/called rank/);
 const next=applyAdvancedGame(bluff,'seat-0',{type:'offer',index:0,claim:1},seeded(4));
 assert.equal(projectAdvancedGame(next,[]).pending.card,undefined);
});

test('waterdeep hold’em validates betting streets, folded players and the ante',()=>{
 const s=initAdvancedGame('waterdeep-hold-em',seats(2),seeded(5));
 assert.equal(s.pot,4);assert.equal(s.hands['seat-0'].length,2);
 assert.equal(advancedLegalActions(s,'seat-0').some(x=>x.type==='check'),true);
 assert.throws(()=>applyAdvancedGame(s,'seat-0',{type:'call'}),/Nothing to call/);
 let next=applyAdvancedGame(s,'seat-0',{type:'raise'});assert.equal(next.maxStreet,2);
 assert.equal(next.pot,6);assert(next.turn===1);
 assert.throws(()=>applyAdvancedGame(next,'seat-0',{type:'check'}),/Wait for your turn/);
 next=applyAdvancedGame(next,'seat-1',{type:'fold'});assert.equal(next.phase,'reveal');
 assert.equal(next.scores['seat-0'],6);
});

test('Dragon’s Trick follows suit; no cheating when a leading suit is available',()=>{
 let s=initAdvancedGame('dragon-s-trick',seats(2),seeded(4));
 s.hands['seat-0']=[{rank:4,suit:'🔥'}];
 s.hands['seat-1']=[{rank:6,suit:'🔥'},{rank:9,suit:'💧'}];
 s=applyAdvancedGame(s,'seat-0',{type:'play-card',index:0});
 assert.throws(()=>applyAdvancedGame(s,'seat-1',{type:'play-card',index:1}),/follow the leading suit/);
});

test('Wyvern Chess uses three 12x8 levels and 15 piece types with legal and frozen moves',()=>{
 const init=initWyvern(),counts=Object.values(init.cells);assert.equal(counts.length,84);
 const legal=wyvernMoves(init);assert(legal.length>10);assert.equal(init.turn,0);
 assert(legal.every(m=>m.from.startsWith('1,')||m.from.startsWith('2,')||m.from.startsWith('3,')));
 assert.throws(()=>applyWyvern(init,'seat-1',['seat-0','seat-1'],{type:'move',from:legal[0].from,to:legal[0].to}),/Wait for your turn/);
 const one=applyWyvern(init,'seat-0',['seat-0','seat-1'],{type:'move',from:legal[0].from,to:legal[0].to});assert.equal(one.turn,1);assert.equal(one.moveCount,1);
 const board=wyvernInitial();board['1,6,3']={type:'basilisk',side:'scarlet'};board['2,6,3']={type:'mage',side:'gold'};
 assert(wyvernFrozen(board,2,6,3,'gold'));
});

test('Wyvern NPC chooses a legal move and the board can be played natively',()=>{
 let s=initWyvern();const rng=seeded(5);
 for(let i=0;i<8&&!s.done;i++){
  const before=wyvernMoves(s),a=wyvernNpcMove(s,rng);
  assert(before.some(m=>m.from===a.from&&m.to===a.to));
  s=applyWyvern(s,s.turn===0?'seat-0':'seat-1',['seat-0','seat-1'],a);
 }
 assert.equal(s.moveCount,8);
});

test('stage-three views render interactive controls for players and spectators',()=>{
 for(const g of ADVANCED_GAMES){const people=seats(2),s={id:'table-stage3',gameId:g.id,status:'playing',seats:people,hostId:'user-0',board:projectAdvancedGame(initAdvancedGame(g.id,people,seeded(2)),['seat-0']),seatStates:{},notes:[]};
  const html=renderArcade({...ctx,session:s,sessions:[s],selected:g.id});
  assert(html.includes('Play surface'),g.id);assert(!html.includes('undefined"'),g.id);
  assert(/data-act="(advanced-play|wyvern-square|conquest-cell)/.test(html),g.id);
  assert(!html.includes('<script>'));
 }
});

test('session manager integrates stage-three tables, guards owners and saves shared state',()=>{
 const manager=new ArcadeSessions(seeded(39)),id='table-stage3-secure-123';
 const by=(type,payload,userId='user-0',gm=false)=>manager.handle({type,payload},{userId,gm});
 by('create',{id,gameId:'king-s-gambit',userName:'Alice'});
 by('join',{id,userName:'Bob'},'user-1');by('start',{id});
 let s=manager.sessions.get(id);assert.equal(s.board.gameId,'king-s-gambit');
 const before=s.board.turn,first=s.seats[before];
 assert.throws(()=>by('play',{id,seatId:first.id,action:{type:'deploy',index:0,lane:0}},'wrong-person'),/do not control/);
 by('play',{id,seatId:first.id,action:{type:'deploy',index:0,lane:0}},first.ownerId);
 assert.equal(manager.sessions.get(id).board.round,1);
 const snapshot=manager.exportState(),restored=new ArcadeSessions(seeded(4));restored.restoreState(snapshot);
 assert.equal(restored.sessions.get(id).board.round,1);
 assert.equal(restored.publicView(restored.sessions.get(id),'user-1').board.hands[first.id].every(x=>x===null),true);
});
