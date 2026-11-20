import test from 'node:test';
import assert from 'node:assert/strict';
import {createBracket,advanceBracket,findBracketMatch} from '../scripts/core/tournaments.mjs';
import {ArcadeSessions} from '../scripts/core/session.mjs';
import {initAdvancedGame,applyAdvancedGame,advancedNpcAction,projectAdvancedGame,advanceAdvancedNpc} from '../scripts/core/advanced-rules.mjs';
import {initWyvern,applyWyvern,wyvernMoves,wyvernReplayBoard} from '../scripts/core/wyvern.mjs';
import {renderAdvancedShared} from '../scripts/ui/advanced-view.mjs';
import {renderTournaments} from '../scripts/ui/tournament-view.mjs';
const rng=(seed=1)=>()=>((seed=((seed*1664525+1013904223)>>>0))/4294967296);
const entrants=(n)=>Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Adventurer ${i}`,kind:'person',userId:`u${i}`}));
const gm={userId:'gm',gm:true};
const cmd=(m,type,payload,context=gm)=>m.handle({type,payload},context);

test('knockout bracket seeds two, four, and eight contestants and advances correct path',()=>{
 for(const n of [2,4,8]){
  const t=createBracket({id:`tour-${'x'.repeat(9)}-${n}`,name:`The test cup ${n}`,gameId:'king-s-gambit',participants:entrants(n)});
  assert.equal(t.rounds.length,Math.log2(n));
  assert.equal(t.rounds[0].length,n/2);
  for(let round=0;round<t.rounds.length;round++)for(const m of t.rounds[round]){
   assert(m.a&&m.b);
   advanceBracket(t,m.id,m.a,'GM-test');
  }
  assert.equal(t.champion,'p0');
  assert.equal(t.audit.length,n-1);
  assert.throws(()=>advanceBracket(t,t.rounds[0][0].id,'p0'),/already/);
 }
});

test('tournament launches a real shared game, validates owners, records its winner and persists',()=>{
 const m=new ArcadeSessions(rng(123));
 const id='tour-showcase12345',participants=entrants(2);
 cmd(m,'createTournament',{id,name:'The Violet Crown',gameId:'king-s-gambit',participants});
 assert.throws(()=>cmd(m,'launchTournamentMatch',{tournamentId:id,matchId:'r1m1'},{userId:'u0',gm:false}),/Only a GM/);
 const r=cmd(m,'launchTournamentMatch',{tournamentId:id,matchId:'r1m1'});
 assert(r.tableId.startsWith('table-'));
 let table=m.sessions.get(r.tableId),steps=0;
 while(table.status==='playing'&&steps++<30){
  const seat=table.seats[table.board.turn];
  const action=advancedNpcAction(table.board,seat.id,rng(steps));
  cmd(m,'play',{id:table.id,seatId:seat.id,action},{userId:seat.ownerId,gm:false});
  table=m.sessions.get(r.tableId);
 }
 assert(table.status==='complete');
 const tournament=m.tournaments.find(x=>x.id===id);
 assert.equal(tournament.rounds[0][0].status,'complete');
 assert(tournament.champion==='p0'||tournament.champion==='p1');
 assert.equal(m.ledger.filter(x=>x.tableId===r.tableId).length,1);
 const saved=m.exportState();assert.equal(saved.schema,5);
 const restored=new ArcadeSessions(rng(5));restored.restoreState(saved);
 assert.equal(restored.tournaments[0].champion,tournament.champion);
 assert.equal(restored.sessions.get(r.tableId).status,'complete');
 assert.equal(restored.ledger.length,1);
});

test('old Alpha 2 persistence schema migrates safely with no lost tables or packs',()=>{
 const m=new ArcadeSessions(rng(6));
 cmd(m,'create',{id:'table-migrate10001',gameId:'coin-of-fate',userName:'Alice'},{userId:'u0',gm:false});
 const old=m.exportState();old.schema=2;delete old.tournaments;
 const restored=new ArcadeSessions(rng(7));restored.restoreState(old);
 assert.equal(restored.sessions.size,1);
 assert.deepEqual(restored.tournaments,[]);
 assert.equal(restored.exportState().schema,5);
});

test('advanceAdvancedNpc completes an all-NPC card table through reveal phases',()=>{
 const seats=[{id:'g0',kind:'auto-npc'},{id:'g1',kind:'auto-npc'}];
 let s=initAdvancedGame('waterdeep-hold-em',seats,rng(44));
 for(let i=0;i<35&&!s.done;i++)s=advanceAdvancedNpc(s,seats,rng(44+i),50);
 assert(s.done,`stuck in ${s.phase}`);
 assert.equal(s.timeline?.at(-1)?.phase,'finished');
});

test('card-game public replay frames omit hidden hands and persist after moves',()=>{
 const seats=[{id:'s0',kind:'person'},{id:'s1',kind:'person'}];
 let s=initAdvancedGame('waterdeep-hold-em',seats,rng(12));
 assert.equal(s.timeline.length,1);
 s=applyAdvancedGame(s,'s0',{type:'check'},rng(12));
 assert.equal(s.timeline.length,2);
 for(const frame of s.timeline){assert(!('hands' in frame));assert(!('deck' in frame));assert(!('lastReveal' in frame));}
 const masked=projectAdvancedGame(s,['s0']);
 assert(masked.hands.s1.every(x=>x===null));
 const context={seatId:'s0',canPlay:true,replayIndex:0,selectedCard:0};
 const html=renderAdvancedShared({gameId:'waterdeep-hold-em',board:masked,seats},context);
 assert(html.includes('Recorded public position'));
 assert(html.includes('replay-next'));
 assert(!html.includes('data-type="raise"'));
});

test('Wyvern Chess replay reconstructs past positions and locks controls in history mode',()=>{
 let s=initWyvern(),states=[structuredClone(s.cells)];const people=['s0','s1'];
 for(let i=0;i<6;i++){
  const action=wyvernMoves(s)[0];
  s=applyWyvern(s,people[s.turn],people,{type:'move',from:action.from,to:action.to});
  states.push(structuredClone(s.cells));
 }
 for(let i=0;i<states.length;i++)assert.deepEqual(wyvernReplayBoard(s,i),states[i]);
 const html=renderAdvancedShared({board:s,gameId:'wyvern-chess',seats:people.map((id,i)=>({id,name:`Player ${i}`}))},{seatId:'s0',canPlay:true,wyvernLayer:2,selectedWyvern:null,replayIndex:3});
 assert(html.includes('Historical position after 3 moves'));
 assert(html.includes('replay-live'));
 assert(!html.includes('legal destination</button>'));
});

test('tournament view escapes competitor names and keeps per-match controls',()=>{
 const t=createBracket({id:'tour-html1234',name:'<script>alert(1)</script> Cup',gameId:'wyvern-chess',participants:[{...entrants(2)[0],name:'<img onerror=alert(1)>'},entrants(2)[1]]});
 const html=renderTournaments({gm:true,tourneyOpen:true,tourneyId:t.id,tournaments:[t],users:[],tourneyUsers:[],tourneyNpcs:2,tourneyGMNpcs:0,tourneyName:'Cup',tourneyGame:'wyvern-chess'});
 assert(!html.includes('<script>'));
 assert(!html.includes('<img onerror'));
 assert(html.includes('tournament-match-launch'));
});

test('guided lessons include clickable rule checkpoints for all eight Stage-3 games',async()=>{
 const {ADVANCED_GAMES}=await import('../scripts/core/advanced-data.mjs');
 const {ADVANCED_PRACTICE}=await import('../scripts/core/advanced-practice.mjs');
 const {renderArcade}=await import('../scripts/ui/view.mjs');
 for(const g of ADVANCED_GAMES){
  const practice=ADVANCED_PRACTICE[g.id];assert(practice&&practice.options.length===4);
  assert(practice.correct>=0&&practice.correct<4);
  const ctx={catalog:ADVANCED_GAMES,selected:g.id,session:null,sessions:[],user:{id:'u0',name:'GM'},gm:true,showAll:false,filter:'',tutorialStep:2,packs:[],ledger:[],practiceAnswer:null};
  const html=renderArcade(ctx);assert(html.includes('data-act="lesson-practice"'),g.id);
  const marked=renderArcade({...ctx,practiceAnswer:practice.correct});assert(marked.includes('✓ Correct.'),g.id);
 }
});
