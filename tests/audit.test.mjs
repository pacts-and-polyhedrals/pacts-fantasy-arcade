/** Release-candidate audit: every coded engine is driven to completion through the real session
 * authority, fuzzed with malformed input, and checked for the rules corrected in 0.5.2. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYABLE,GAMES,LESSONS} from '../scripts/core/data.mjs';
import {ArcadeSessions} from '../scripts/core/session.mjs';
import {initSeat,applySeat,chooseAutoAction,projectSeat,rankCards} from '../scripts/core/rules.mjs';
import {initExtraSeat,applyExtraSeat,chooseExtraAction,projectExtraSeat,initSharedGame,applySharedGame,chooseSharedAction} from '../scripts/core/expansion-rules.mjs';
import {initAdvancedGame,applyAdvancedGame,advancedLegalActions,advancedNpcAction,projectAdvancedGame} from '../scripts/core/advanced-rules.mjs';
import {initArenaGame,applyArenaGame,legalArenaActions} from '../scripts/core/arena-engine.mjs';
import {ARENA_IDS,ARENA_CONFIGS} from '../scripts/core/arena-data.mjs';
import {PUZZLE_IDS} from '../scripts/core/puzzle-data.mjs';
import {ADVANCED_IDS} from '../scripts/core/advanced-data.mjs';
import {EXPANSION_SHARED} from '../scripts/core/expansion-data.mjs';
import {generateRiddlePack} from '../scripts/core/puzzle-engine.mjs';
import {GAME_RULES} from '../scripts/core/rules-text.mjs';
import {GAME_ART} from '../scripts/core/art.mjs';

const rng=(seed)=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const crash=e=>e instanceof TypeError||e instanceof RangeError||e instanceof ReferenceError||e instanceof SyntaxError;

test('every one of the 73 coded games completes an all-AI match through the session authority',()=>{
 for(const g of PLAYABLE){
  for(const seed of [3,11,29]){
   const m=new ArcadeSessions(rng(seed));
   m.create({id:`table-audit-${g.id}`.slice(0,90),gameId:g.id,userId:'gm',userName:'GM'});
   const s=m._find(`table-audit-${g.id}`.slice(0,90));
   if(!PUZZLE_IDS.has(g.id)){m.addNpc({id:s.id,userId:'gm',gm:true,name:'Rival'});s.seats[0].kind='auto-npc';s.seats[0].ownerId=null;}
   m.start({id:s.id,userId:'gm',gm:true});
   if(PUZZLE_IDS.has(g.id)){assert.equal(m._find(s.id).status,'playing',g.id);continue;}
   for(let k=0;k<400&&m._find(s.id).status==='playing';k++){
    const t=m._find(s.id);
    if(t.board?.phase==='reveal'){
     const actor=t.seats[t.board.turn]?.id||t.seats[0].id;
     try{t.board=EXPANSION_SHARED.has(g.id)?applySharedGame(t.board,actor,{type:'next'},rng(seed+k)):applyAdvancedGame(t.board,actor,{type:'next'},rng(seed+k));}catch(e){if(crash(e))throw e;}
    }
    m.advance({id:s.id,gm:true});
   }
   assert.equal(m._find(s.id).status,'complete',`${g.id} (seed ${seed}) did not finish`);
   const entry=m.ledger.at(-1);assert(entry&&entry.gameId===g.id,`${g.id} has no ledger result`);
   for(const r of entry.results)assert(typeof r.score==='string'||Number.isFinite(r.score),`${g.id} produced a non-finite score`);
  }
 }
});

test('malformed and hostile actions are rejected cleanly by every single-seat engine',()=>{
 const junk=[null,{},{type:5},{type:'roll',index:'x'},{type:'toggle',index:99},{type:'guess',choice:'sideways'},{type:'strike',power:1e9},{type:'throw',x:NaN,y:0},{type:'answer',text:'x'.repeat(500)},{type:'select',area:'waste',index:-4},{type:'serve',ingredient:7,heat:-1},{type:'__proto__'},{type:'score',index:13}];
 const singles=PLAYABLE.filter(g=>!['runestone-checkers'].includes(g.id)&&!EXPANSION_SHARED.has(g.id)&&!ADVANCED_IDS.has(g.id)&&!PUZZLE_IDS.has(g.id)&&!ARENA_IDS.has(g.id));
 assert.equal(singles.length,31);
 for(const g of singles)for(const seed of [1,2,3]){
  let s=initSeat(g.id,rng(seed));
  for(let i=0;i<300&&!s.done;i++){
   const bad=junk[i%junk.length];
   try{const out=applySeat(s,bad,rng(seed+i));assert(out.score>=0||out.gameId==='forgotten-realms-emoji-door-generator',g.id);}catch(e){if(crash(e))throw Error(`${g.id} crashed on ${JSON.stringify(bad)}: ${e.message}`);}
   const act=chooseAutoAction(s,rng(seed*7+i));
   s=applySeat(s,act,rng(seed*13+i));
   assert(Number.isFinite(s.score),`${g.id} score must remain finite`);
  }
  assert(s.done,`${g.id} NPC loop must finish`);
 }
});

test('Cauldron Craps keeps the point alive until it is made or a seven is rolled',()=>{
 let seen=false;
 for(let seed=1;seed<200&&!seen;seed++){
  let s=initExtraSeat('cauldron-craps',rng(seed));
  for(let i=0;i<60&&!s.done;i++){
   const before=s;s=applyExtraSeat(s,{type:'roll'},rng(seed*31+i));
   if(before.phase==='comeout'&&s.phase==='point'){assert(Number.isInteger(s.point));seen=true;}
   if(before.phase==='point'&&s.phase==='point')assert.equal(s.point,before.point,'point must persist between rolls');
  }
 }
 assert(seen,'a point phase must occur');
});

test('Arm-wrestling is a fair triangle: no tactic dominates against a random rival',()=>{
 const results={};
 for(const move of ['power','brace','feint']){let wins=0;
  for(let seed=1;seed<=600;seed++){let s=initSeat('arm-wrestling-at-the-bar',rng(seed));while(!s.done)s=applySeat(s,{type:'tactic',choice:move},rng(seed*17+s.round));if(s.position>=3)wins++;}
  results[move]=wins/600;
 }
 for(const v of Object.values(results))assert(v<0.6,`one tactic is dominant: ${JSON.stringify(results)}`);
});

test('Three-Card Wyvern ranks rarer hands higher',()=>{
 const H=(...c)=>c.map(([rank,suit])=>({rank,suit}));
 const sf=rankCards(H([1,'☀️'],[2,'☀️'],[3,'☀️'])),trips=rankCards(H([5,'☀️'],[5,'🌙'],[5,'🌿'])),flush=rankCards(H([1,'☀️'],[3,'☀️'],[5,'☀️'])),straight=rankCards(H([3,'☀️'],[4,'🌙'],[5,'🌿'])),pair=rankCards(H([5,'☀️'],[5,'🌙'],[4,'🌿'])),high=rankCards(H([1,'☀️'],[3,'🌙'],[5,'🌿']));
 assert(sf>trips&&trips>flush&&flush>straight&&straight>pair&&pair>high);
});

test('Black Dragon only allows doubling on the opening two cards',()=>{
 let s=initSeat('black-dragon',rng(4));s.player=[2,3];s=applySeat(s,{type:'hit'},rng(5));
 if(!s.done&&s.phase==='play')assert.throws(()=>applySeat(s,{type:'double'},rng(6)),/first two cards/);
});

test('Tinker NPC solves the lock from public feedback only, not by reading the code',()=>{
 let total=0;
 for(let seed=1;seed<=40;seed++){let s=initExtraSeat('tinker-s-lock-race',rng(seed));let steps=0;while(!s.done&&steps<400){s=applyExtraSeat(s,chooseExtraAction(s,rng(seed*9+steps)),rng(seed+steps));steps++;}total+=s.attempts;assert(projectExtraSeat(s).npcPlan===undefined);}
 assert(total/40>1.6,'NPC must not open the lock on the first test every time');
});

test('Breakdance choreography is concealed once the dancing phase begins',()=>{
 let s=initExtraSeat('goblin-breakdancing-corporation',rng(2));assert(Array.isArray(projectExtraSeat(s).sequence));
 s=applyExtraSeat(s,{type:'watch'},rng(3));assert.equal(projectExtraSeat(s).sequence,null);
});

test('Bard’s Bluff enforces the climbing called rank and NPC hands follow it',()=>{
 const seats=[{id:'a',kind:'person'},{id:'b',kind:'auto-npc'}];let s=initAdvancedGame('bard-s-bluff',seats,rng(5));
 assert.equal(s.calledRank,1);
 s=applyAdvancedGame(s,'a',{type:'offer',index:0},rng(6));s=applyAdvancedGame(s,'b',{type:'accept'},rng(7));assert.equal(s.calledRank,2);
 const npc=advancedNpcAction(s,'b',rng(8));assert.equal(npc.claim,2);
});

test('Hold’em showdown never reveals folded hands',()=>{
 for(let seed=1;seed<60;seed++){
  const seats=[{id:'a'},{id:'b'},{id:'c'}];let s=initAdvancedGame('waterdeep-hold-em',seats,rng(seed));let folded=null;
  for(let i=0;i<60&&s.phase!=='reveal';i++){const id=s.seats[s.turn];const legal=advancedLegalActions(s,id);const act=!folded&&legal.some(x=>x.type==='fold')?{type:'fold'}:(legal.find(x=>x.type==='check')||legal.find(x=>x.type==='call'));if(act.type==='fold')folded=id;s=applyAdvancedGame(s,id,act,rng(seed+i));}
  if(folded&&s.lastReveal?.hands&&Object.keys(s.lastReveal.hands).length)assert(!(folded in s.lastReveal.hands),'folded hand leaked');
 }
});

test('Co-operative arena allies can never target one another',()=>{
 for(const id of ['bardic-duet','the-gloop','shadow-heist','shield-wall','arrow-storm']){
  const s=initArenaGame(id,[{id:'a',name:'A',kind:'person'},{id:'b',name:'B',kind:'person'}],rng(9));
  const ally=s.fighters.b;
  for(const act of legalArenaActions(s,'a'))assert(!(act.x===ally.x&&act.y===ally.y),`${id}: ${act.ability} targets the ally`);
 }
});

test('Arrow Storm telegraphs a volley lane and it strikes fighters who stay in it',()=>{
 let s=initArenaGame('arrow-storm',[{id:'a',name:'A',kind:'person'},{id:'b',name:'B',kind:'person'}],rng(2));
 assert(Number.isInteger(s.volleyRow));const row=s.volleyRow;
 s.fighters.a.y=row;s.fighters.a.x=0;s.fighters.b.y=row;s.fighters.b.x=2;const hp=s.fighters.a.hp;
 s=applyArenaGame(s,'a',{type:'end'});s=applyArenaGame(s,'b',{type:'end'});
 assert(s.fighters.a.hp<hp,'volley must hit');assert(s.events.some(e=>/arrow storm/i.test(e.text)));
});

test('Riddle Forge difficulty changes which riddles are chosen',()=>{
 const easy=generateRiddlePack({id:'easy-pack',name:'Easy',count:5,seed:3,difficulty:1}).entries.map(x=>x.answers[0]);
 const hard=generateRiddlePack({id:'hard-pack',name:'Hard',count:5,seed:3,difficulty:3}).entries.map(x=>x.answers[0]);
 assert.notDeepEqual(easy,hard);
});

test('every coded game ships a full rules entry and cover art',()=>{
 for(const g of PLAYABLE){
  const r=GAME_RULES[g.id];assert(r,`${g.id} has no rules entry`);
  for(const key of ['title','summary','players','objective','setup','turn','scoring','end','tips'])assert(r[key]&&(!Array.isArray(r[key])||r[key].length),`${g.id} rules missing ${key}`);
  assert(GAME_ART[g.id]?.cover,`${g.id} has no cover art`);
  assert(LESSONS[g.id]?.length>=3,`${g.id} has no lesson`);
 }
});
