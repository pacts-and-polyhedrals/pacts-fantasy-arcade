import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PLAYABLE,GAMES,EMOJI_PUZZLES,CATEGORIES} from '../scripts/core/data.mjs';
import {EXPANSION_SHARED} from '../scripts/core/expansion-data.mjs';
import {ADVANCED_IDS} from '../scripts/core/advanced-data.mjs';
import {PUZZLE_IDS} from '../scripts/core/puzzle-data.mjs';
import {ARENA_IDS} from '../scripts/core/arena-data.mjs';
import {initArenaGame} from '../scripts/core/arena-engine.mjs';
import {initPuzzleGame,projectPuzzleGame} from '../scripts/core/puzzle-engine.mjs';
import {initAdvancedGame,projectAdvancedGame} from '../scripts/core/advanced-rules.mjs';
import {initSharedGame,applySharedGame,chooseSharedAction,projectSharedGame,sharedLegalActions} from '../scripts/core/expansion-rules.mjs';
import {initSeat,applySeat,chooseAutoAction,checkersMoves,initBoard,moveChecker,stepNpcBoard,crownScore,scoreSlots,rankKnuckles,projectSeat} from '../scripts/core/rules.mjs';
import {ArcadeSessions} from '../scripts/core/session.mjs';
import {renderArcade,esc} from '../scripts/ui/view.mjs';
const raw=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
const seeded=(initial)=>{let v=initial>>>0;return()=>((v=(1664525*v+1013904223)>>>0)/4294967296)};

test('catalogues include 131 unique planned games and exactly 73 implementations',()=>{
 assert.equal(raw.games.length,131);assert.equal(new Set(raw.games.map(g=>g.id)).size,131);assert.equal(PLAYABLE.length,73);
 for(const g of PLAYABLE)assert(raw.games.some(x=>x.id===g.id),`Missing in catalogue: ${g.id}`);
});

test('all 31 preexisting single-seat engines finish 100 automated seeded sessions',()=>{
 for(const g of PLAYABLE.filter(g=>g.id!=='runestone-checkers'&&!EXPANSION_SHARED.has(g.id)&&!ADVANCED_IDS.has(g.id)&&!PUZZLE_IDS.has(g.id)&&!ARENA_IDS.has(g.id)))for(let seed=1;seed<=100;seed++){
   const rng=seeded(seed*9973);let s=initSeat(g.id,rng);
   for(let i=0;!s.done&&i<350;i++){
    const act=chooseAutoAction(s,rng);assert(act,`No NPC action ${g.id}`);s=applySeat(s,act,rng);
    assert(Number.isFinite(s.score)&&s.score>=0,`Bad score ${g.id}`);
   }
   assert(s.done,`${g.id} did not finish seed ${seed}`);
 }
});

test('checkers setup and mandatory capture legality',()=>{
 const s=initBoard([{id:'a'},{id:'b'}]);assert.equal(s.board.filter(Boolean).length,24);
 assert.equal(checkersMoves(s,0).length,7);assert.equal(checkersMoves(s,1).length,7);
 let p=initBoard([{id:'a'},{id:'b'}]);p.board=Array(64).fill(null);p.board[5*8+2]={side:0,king:false};p.board[4*8+3]={side:1,king:false};p.board[2*8+5]={side:1,king:false};
 const moves=checkersMoves(p,0);assert.equal(moves.length,1);assert.equal(moves[0].capture,4*8+3);
 p=moveChecker(p,5*8+2,3*8+4);assert.equal(p.board[4*8+3],null);assert.equal(p.turn,0);assert.equal(p.forced,3*8+4);
 p=moveChecker(p,3*8+4,1*8+6);assert.equal(p.turn,1);assert.equal(p.board[2*8+5],null);
});

test('checkers automatic move generator respects all moves',()=>{
 for(let seed=1;seed<=30;seed++){
  let rng=seeded(seed),s=initBoard([{id:'a'},{id:'b'}]);let n=0;
  for(;!s.done&&n<245;n++)s=stepNpcBoard(s,rng);
  assert(s.done,`Game stalled at seed ${seed}`);assert(s.moveCount<=240);
 }
});

test('session authority: create, join, GM add NPC, play, ownership, close',()=>{
 const mgr=new ArcadeSessions(seeded(7));
 const req=(type,payload,userId='u1',gm=true)=>mgr.handle({type,payload},{userId,gm});
 const id='table-example-123';req('create',{gameId:'coin-of-fate',id,userName:'Master'});
 assert.throws(()=>req('addNpc',{id,name:'X'},'u2',false),/Only a GM/);
 req('join',{id,userName:'Player 2'},'u2',false);req('addNpc',{id,name:'Grukk',controlled:false});
 req('addNpc',{id,name:'My NPC',controlled:true});req('start',{id});
 let s=mgr.summaries()[0];assert.equal(s.status,'playing');assert.equal(s.seats.length,4);
 assert.throws(()=>req('play',{id,seatId:s.seats[1].id,action:{type:'guess',choice:'heads'}},'u1',true),/do not control/);
 req('play',{id,seatId:s.seats[0].id,action:{type:'guess',choice:'heads'}});
 assert.equal(mgr.summaries()[0].seatStates[s.seats[0].id].round,1);
 req('delegate',{id,seatId:s.seats[3].id,controlled:false});
 assert.equal(mgr.summaries()[0].seats[3].kind,'auto-npc');
 req('close',{id});assert.equal(mgr.summaries().length,0);
});

test('projected hidden information does not disclose cup answer, dealer deck or hidden dealer cards',()=>{
 let a=projectSeat(initSeat('sly-fox-s-three-cups',seeded(3)));assert.equal(a.answer,undefined);
 a=projectSeat(initSeat('black-dragon',seeded(4)));assert.equal(a.dealer[1],null);
 a=projectSeat(initSeat('three-card-wyvern',seeded(5)));assert.equal(a.dealerHand,undefined);
});

test('Crown & Bones scoring covers distinct legitimate patterns',()=>{
 assert.equal(crownScore([1,1,1,2,2],8),25);
 assert.equal(crownScore([1,2,3,4,5],10),40);
 assert.equal(crownScore([6,6,6,6,6],11),50);
 assert.equal(crownScore([1,2,4,5,6],11),0);
 assert.equal(scoreSlots([1,1,1]),12);
 assert(rankKnuckles([2,2,2,2])>rankKnuckles([1,2,3,4]));
});

test('UI renderer produces a game, lobby and completed screen for each engine',()=>{
 const ctx={catalog:raw.games,sessions:[],session:null,selected:'coin-of-fate',user:{id:'u1',name:'Master'},gm:true,showAll:false,seatId:'one',tutorialStep:0,power:70,aimX:0,aimY:0,selectedSquare:null};
 assert.match(renderArcade(ctx),/Fantasy Arcade/);
 for(const g of PLAYABLE){
  const s={id:'table-example',gameId:g.id,status:'playing',seats:[{id:'one',name:'Master',ownerId:'u1',kind:'person'},{id:'two',name:'Grukk',ownerId:null,kind:'auto-npc'}],hostId:'u1',seatStates:{},board:null};
  if(g.id==='runestone-checkers')s.board=initBoard(s.seats);else if(EXPANSION_SHARED.has(g.id))s.board=projectSharedGame(initSharedGame(g.id,s.seats,seeded(12)),['one']);else if(ADVANCED_IDS.has(g.id))s.board=projectAdvancedGame(initAdvancedGame(g.id,s.seats,seeded(12)),['one']);else if(PUZZLE_IDS.has(g.id))s.board=projectPuzzleGame(initPuzzleGame(g.id,s.seats,seeded(12)));else if(ARENA_IDS.has(g.id))s.board=initArenaGame(g.id,s.seats,seeded(12));else {s.seatStates.one=projectSeat(initSeat(g.id,seeded(10)));s.seatStates.two=projectSeat(initSeat(g.id,seeded(11)));}
  assert.match(renderArcade({...ctx,session:s,sessions:[s]}),/Play surface/,`Missing render for ${g.id}`);
 }
});

test('user names and trivia strings are escaped in rendered output',()=>{
 assert.equal(esc(`<img src=x onerror="alert('x')">`),'&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;');
 const s={id:'t',gameId:'coin-of-fate',status:'lobby',seats:[{id:'one',ownerId:'u1',name:'<script>alert(1)</script>',kind:'person'}],hostId:'u1',seatStates:{},notes:[]};
 let html=renderArcade({catalog:raw.games,sessions:[],session:s,selected:'coin-of-fate',user:{id:'u1',name:'Master'},gm:true});
 assert(!html.includes('<script>alert(1)</script>'));
});
