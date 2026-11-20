import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYABLE,GAMES,LESSONS} from '../scripts/core/data.mjs';
import {ARENA_GAMES,ARENA_IDS,ARENA_CONFIGS,ARENA_KITS,ARENA_ABILITIES} from '../scripts/core/arena-data.mjs';
import {ARENA_PERSONAS,npcLine,introPersona} from '../scripts/core/arena-dialogue.mjs';
import {initArenaGame,applyArenaGame,legalArenaActions,projectArenaGame,arenaMatrix,lineOfSight,arenaOutcome} from '../scripts/core/arena-engine.mjs';
import {chooseArenaNpcAction,arenaUtility,stepArenaNpcs} from '../scripts/core/arena-ai.mjs';
import {ArcadeSessions} from '../scripts/core/session.mjs';
import {renderArenaGame,renderArenaSetup} from '../scripts/ui/arena-view.mjs';
import {renderArcade} from '../scripts/ui/view.mjs';
import {createBracket} from '../scripts/core/tournaments.mjs';
const rng=(seed)=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const people=(a='hero',b='villain')=>[{id:a,name:'The Challenger',kind:'person',ownerId:a},{id:b,name:'The Rival',kind:'auto-npc',ownerId:null}];
const fresh=(id,seed=17)=>initArenaGame(id,people(),rng(seed));
const legal=(s,id=s.seats[s.turn])=>legalArenaActions(s,id);
const pick=(s,ability,filter=()=>true)=>legal(s).find(a=>a.ability===ability&&filter(a));
const use=(s,action,r=Math.random)=>applyArenaGame(s,s.seats[s.turn],{type:'use',...action},r);
const seeded=seed=>rng(seed);

test('Stage 5 registers precisely fourteen new original arena games without replacing old gameplay',()=>{
 assert.equal(ARENA_GAMES.length,14);assert.equal(ARENA_IDS.size,14);assert.equal(PLAYABLE.length,73);
 assert.equal(new Set(PLAYABLE.map(g=>g.id)).size,73);
 for(const g of ARENA_GAMES){assert.equal(GAMES[g.id].type,g.type);assert.equal(LESSONS[g.id].length,3);assert(ARENA_CONFIGS[g.id]);}
 assert(Object.keys(ARENA_ABILITIES).length>=40);assert(Object.keys(ARENA_KITS).length>=10);
});

test('arena rules have a stable two-action economy, obstacle pathfinding, and valid targets',()=>{
 let s=fresh('fighting-pit-tournament');
 assert.equal(s.ap,2);assert.equal(s.turn,0);
 const moves=legal(s).filter(a=>a.ability==='move');assert(moves.length>0);
 assert(!moves.some(a=>s.terrain[`${a.x},${a.y}`]==='pillar'));
 assert(!moves.some(a=>a.x===s.fighters.villain.x&&a.y===s.fighters.villain.y));
 assert.throws(()=>use(s,{ability:'heavy',x:8,y:8},()=>.5),/not legal/);
 assert.throws(()=>use(s,{ability:'move',x:3.5,y:2},()=>.5),/not legal/);
 const move=moves.find(a=>a.x>=2)||moves[0];s=use(s,move,()=>.5);
 assert.equal(s.ap,1);assert.equal(s.fighters.hero.x,move.x);assert.equal(s.fighters.hero.y,move.y);
 assert.equal(s.eventSeq,2);assert.equal(s.timeline.length,2);
 assert.throws(()=>applyArenaGame(s,'villain',{type:'end'},()=>.5),/not your turn/);
 s=applyArenaGame(s,'hero',{type:'end'},()=>.5);assert.equal(s.turn,1);assert.equal(s.ap,2);
});

test('arena line of sight and caster ranges cannot pass through blocked columns',()=>{
 const s=fresh('wizard-duel');const a=s.fighters.hero,b=s.fighters.villain;
 assert(lineOfSight(s,a,b));
 // Direct line blocked by an artificial central pillar.
 a.x=1;a.y=3;b.x=7;b.y=3;s.terrain['4,3']='pillar';
 assert(!lineOfSight(s,a,b));
 assert(!legal(s).some(m=>m.ability==='ember'&&m.x===b.x&&m.y===b.y));
 delete s.terrain['4,3'];a.x=3;a.y=3;b.x=6;b.y=3;
 assert(legal(s).some(m=>m.ability==='ember'&&m.x===b.x&&m.y===b.y));
});

test('wizard counterspell actually negates magical damage and consumes resources',()=>{
 let s=fresh('wizard-duel');s.fighters.hero.x=3;s.fighters.hero.y=3;s.fighters.villain.x=6;s.fighters.villain.y=3;
 s=use(s,{ability:'counterspell'},()=>.5);assert.equal(s.fighters.hero.counter,1);
 s=use(s,{ability:'guard'},()=>.5);assert.equal(s.turn,1);
 let before=s.fighters.hero.hp;
 s=use(s,{ability:'ember',x:3,y:3},()=>.5);
 assert.equal(s.fighters.hero.hp,before,'counter spell should prevent HP loss');
 assert.equal(s.fighters.hero.counter,0);assert.equal(s.fighters.villain.focus,13);
});

test('wrestling pin is gated behind an actual grapple and completes the two-pin objective',()=>{
 let s=fresh('monster-wrestler-championship');s.fighters.hero.x=3;s.fighters.hero.y=3;s.fighters.villain.x=4;s.fighters.villain.y=3;s.fighters.hero.stamina=16;s.fighters.villain.stamina=1;
 assert(!pick(s,'pin'));
 s=use(s,{ability:'grapple',x:4,y:3},()=>.99);
 assert.equal(s.fighters.hero.grappling,'villain');
 assert.equal(s.fighters.villain.grappledBy,'hero');
 // A pin costs 2 AP, so it becomes available on a later turn.
 s=use(s,{ability:'guard'},()=>.5);
 s=applyArenaGame(s,'villain',{type:'end'},()=>.5);
 assert(pick(s,'pin'));
 s=use(s,{ability:'pin',x:4,y:3},()=>.99);
 assert.equal(s.fighters.hero.pins,1);
 assert.equal(s.fighters.villain.grappledBy,null);
});

test('ranged and guard actions consume their focus or stamina, with no client-supplied damage values',()=>{
 let s=fresh('wizard-duel');s.fighters.hero.x=3;s.fighters.hero.y=3;s.fighters.villain.x=6;s.fighters.villain.y=3;
 const hp=s.fighters.villain.hp;
 s=applyArenaGame(s,'hero',{type:'use',ability:'ember',x:6,y:3,damage:999999,score:9999},()=>.5);
 assert(s.fighters.villain.hp<hp&&s.fighters.villain.hp>=hp-12);
 assert(s.fighters.hero.focus<16);
 s=applyArenaGame(s,'hero',{type:'use',ability:'ember',x:6,y:3},()=>.5);
 assert.throws(()=>applyArenaGame(s,'hero',{type:'use',ability:'ember',x:6,y:3},()=>.5),/not your turn/);
});

test('Battle of the Bards has real tempo, spotlight and rebuttal bonuses',()=>{
 let s=fresh('battle-of-the-bards');s.fighters.hero.x=4;s.fighters.hero.y=3;s.fighters.villain.x=6;s.fighters.villain.y=3;
 assert.equal(s.terrain['4,3'],'spotlight');
 const prep=s.fighters.hero.score;
 s=use(s,{ability:'verse',x:6,y:3},()=>0);assert(s.fighters.hero.score>=prep+10);
 assert.equal(s.fighters.villain.exposed,1);
 assert.equal(s.events.at(-1).kind,'performance');
 const ac=s.fighters.hero.score;
 s=applyArenaGame(s,'hero',{type:'end'},()=>.5);
 assert.equal(s.turn,1);
 assert(legal(s).some(a=>a.ability==='heckle'));
});

test('defence, rescue and stealth have different rules, terminal objectives and victory checks',()=>{
 let d=fresh('shield-wall');assert.equal(d.gate,24);assert.equal(d.threats.length,2);
 const h=d.fighters.hero;d.turn=0;d.ap=1;
 let g=use(d,{ability:'shieldwall'},()=>.5);assert(g.fighters.hero.guard>=4);
 let r=fresh('the-gloop');r.fighters.hero.x=4;r.fighters.hero.y=2;r.ap=2;
 r=use(r,{ability:'free',x:4,y:1},()=>.5);
 assert(r.done&&r.success===true);assert.equal(r.winner,'draw');
 let stealth=fresh('shadow-heist');stealth.fighters.hero.x=6;stealth.fighters.hero.y=3;stealth.alert=3;
 stealth=use(stealth,{ability:'extract',x:7,y:3},()=>.5);assert(stealth.done&&stealth.success===true);
 let failed=fresh('shadow-heist');failed.alert=7;failed=applyArenaGame(failed,'hero',{type:'end'},()=>.5);assert(failed.done&&failed.success===false);
});

test('NPC personality dialogue uses situation and does not depend on an outside text service',()=>{
 for(const persona of Object.keys(ARENA_PERSONAS)){
  const a=npcLine({persona,ability:'attack',round:2,actorName:'Opponent',opponentName:'Challenger'});
  assert(a.speaker==='Opponent');assert(a.text.length>=9);assert(a.text.length<=220);
 }
 assert.equal(introPersona('wizard-duel',1),'ember');
 const one=npcLine({persona:'velvet',ability:'verse',round:1});const two=npcLine({persona:'velvet',ability:'verse',round:2});
 assert.notEqual(one.text,two.text,'bard dialogue rotates with round');
});

test('AI is capable of legal ranged attacks, grappling, recovery and special tactical actions',()=>{
 let spell=fresh('wizard-duel');spell.fighters.hero.x=3;spell.fighters.hero.y=3;spell.fighters.villain.x=6;spell.fighters.villain.y=3;
 const a=chooseArenaNpcAction(spell,'hero',()=>.5);assert(legal(spell).some(m=>m.ability===a.ability&&m.x===a.x&&m.y===a.y));
 assert(['ember','frost','storm','counterspell','aegis','blink','meditate','move','strike','guard','evade','recover','taunt'].includes(a.ability));
 let wrest=fresh('monster-wrestler-championship');wrest.fighters.hero.x=3;wrest.fighters.hero.y=3;wrest.fighters.villain.x=4;wrest.fighters.villain.y=3;wrest.fighters.hero.grappling='villain';wrest.fighters.villain.grappledBy='hero';
 assert.equal(chooseArenaNpcAction(wrest,'hero',()=>.5).ability,'pin');
 let exhausted=fresh('wizard-duel');exhausted.fighters.hero.stamina=0;exhausted.fighters.hero.focus=0;
 assert(legal(exhausted).some(m=>m.ability==='recover'||m.ability==='meditate'));
});

test('all fourteen Stage 5 games finish autonomously across diverse randomised matches',()=>{
 for(const g of ARENA_GAMES)for(let seed=1;seed<=50;seed++){
  const random=seeded(seed*9973),f=people();f[0].kind='auto-npc';let s=initArenaGame(g.id,f,random,{difficulty:seed%3+1});
  for(let i=0;!s.done&&i<300;i++){
   const id=s.seats[s.turn],action=chooseArenaNpcAction(s,id,random);
   assert(action,`No NPC action ${g.id}/${seed}`);
   s=applyArenaGame(s,id,action,random);
  }
  assert(s.done,`${g.id} seed ${seed} failed to finish`);
  assert(Object.values(s.scores).every(n=>Number.isFinite(n)&&n>=0));
  assert(s.timeline.length<=120&&s.events.length<=55);
  assert(arenaOutcome(s)?.winner!==null);
 }
});

test('public arena replay snapshots and grid remain deterministic, bounded and serialisable',()=>{
 let s=fresh('fighting-pit-tournament');const a=projectArenaGame(s);
 assert.equal(JSON.stringify(a),JSON.stringify(s));assert.equal(arenaMatrix(s).length,s.height);
 for(let i=0;i<20&&!s.done;i++){
  const legalMoves=legal(s);let chosen=legalMoves[0];s=chosen?use(s,chosen,()=>.5):applyArenaGame(s,s.seats[s.turn],{type:'end'},()=>.5);
 }
 assert(s.timeline.length>1&&s.timeline.length<=120);
 assert(s.timeline.every(f=>!('secrets'in f)&&!('dice'in f)));
});

test('session permissions cover kit selection, NPC ownership, GM pause and save restoration',()=>{
 const m=new ArcadeSessions(seeded(91));const id='table-arena-00123';
 const run=(type,payload,userId='owner',gm=false)=>m.handle({type,payload},{userId,gm});
 run('create',{id,gameId:'fighting-pit-tournament',userName:'A'});
 run('addNpc',{id,name:'The Bruiser',controlled:false},'gm',true);
 let s=m.summaries('owner')[0];
 assert.throws(()=>run('configureArenaSeat',{id,seatId:s.seats[0].id,kit:'mage'}),/not allowed/);
 assert.throws(()=>run('configureArenaSeat',{id,seatId:s.seats[0].id,kit:'rogue'},'stranger'),/Only the seat/);
 run('configureArenaSeat',{id,seatId:s.seats[0].id,kit:'rogue',persona:'wisp'});
 run('configureArena',{id,difficulty:3},'gm',true);
 run('start',{id});s=m.summaries('owner')[0];assert.equal(s.board.fighters[s.seats[0].id].kit,'rogue');assert.equal(s.board.difficulty,3);
 assert.throws(()=>run('pauseArena',{id},'stranger'),/Only the GM/);
 run('pauseArena',{id},'gm',true);assert(m.summaries()[0].board.paused);
 assert.throws(()=>run('play',{id,seatId:s.seats[0].id,action:{type:'end'}}),/paused/);
 run('pauseArena',{id},'gm',true);
 assert.throws(()=>run('play',{id,seatId:s.seats[1].id,action:{type:'end'}}),/do not control/);
 const snapshot=m.exportState();assert.equal(snapshot.schema,5);
 const restored=new ArcadeSessions(seeded(23));assert.equal(restored.restoreState(snapshot),1);
 assert.equal(restored.summaries()[0].board.fighters[s.seats[0].id].kit,'rogue');
});

test('arena games can host existing knockout brackets and automatically crown their winner',()=>{
 const m=new ArcadeSessions(seeded(9));const cmd=(type,payload,userId='gm',gm=true)=>m.handle({type,payload},{userId,gm});
 const t=cmd('createTournament',{id:'tour-stage5-bards',name:'Seven Bells Championship',gameId:'battle-of-the-bards',participants:[{id:'a',name:'Velvet',kind:'npc'},{id:'b',name:'Grukk',kind:'npc'}]});
 assert.equal(t.rounds.length,1);
 const start=cmd('launchTournamentMatch',{tournamentId:t.id,matchId:'r1m1'});
 const table=m.sessions.get(start.tableId);assert.equal(table.gameId,'battle-of-the-bards');
 assert.equal(table.status,'complete','AI-only bards bracket should auto-finish');
 assert(m.tournaments[0].champion);assert(m.ledger.length===1);
});

test('arena interface renders all fourteen titles with interactive controls and accessible action history',()=>{
 for(const g of ARENA_GAMES){
  const seats=people();const s=initArenaGame(g.id,seats,seeded(1));
  const session={id:'table-pfa5',gameId:g.id,status:'playing',seats,board:s,config:{difficulty:2},notes:[],hostId:'hero'};
  const ctx={seatId:'hero',gm:true,canPlay:true,user:{id:'hero'},replayIndex:-1,arenaAbility:'move',reducedMotion:false};
  const html=renderArenaGame(session,ctx);
  assert.match(html,/pfa-arena-grid/);assert.match(html,/data-act="arena-cell"/);
  assert.match(html,/data-act="arena-end-turn"/);assert.match(html,/aria-label="Tactical arena map"/);
  assert.match(html,/pfa-arena-commentary/);assert(!html.includes('[object Object]'));
  assert.match(renderArenaSetup({...session,status:'lobby',board:null},ctx),/Arena preparation/);
  const spectator=renderArenaGame(session,{...ctx,seatId:null,canPlay:false});assert(!spectator.includes('data-act="arena-use-self"'));
  const live=renderArcade({sessions:[session],session,selected:g.id,gm:true,user:{id:'hero',name:'Hero'},seatId:'hero',arenaAbility:'move',catalog:PLAYABLE.map(g=>({id:g.id,title:g.id,category:g.type})),replayIndex:-1,tutorialStep:0});
  assert.match(live,/Play surface/);
 }
});

test('Stage 5 imported external profiles are bounded, validated and have no character-sheet effects',async()=>{
 const {makeArenaProfile,validateArenaProfile,applyArenaProfile,ARENA_ADAPTER_PROTOCOL}=await import('../scripts/core/arena-adapter.mjs');
 const profile=makeArenaProfile({source:'Fighting Pits Module',label:'Bladesworn',archetype:'duelist',modifiers:{hp:3,stamina:2,power:1}});
 assert.equal(profile.protocol,ARENA_ADAPTER_PROTOCOL);
 const fighter=structuredClone(fresh('fighting-pit-tournament').fighters.hero),original=structuredClone(fighter);
 applyArenaProfile(fighter,profile);assert.equal(fighter.hp,original.hp+3);assert.equal(fighter.power,original.power+1);assert.equal(fighter.externalProfile.source,'Fighting Pits Module');
 assert(!fighter.items&&!fighter.spells&&!fighter.actorUuid);
 assert.throws(()=>validateArenaProfile({...profile,modifiers:{hp:40000}}),/integer/);
 assert.throws(()=>validateArenaProfile({...profile,protocol:'random-remote-code'}),/Unsupported/);
 const m=new ArcadeSessions(seeded(11));const id='arena-profile-demo';const cmd=(type,payload,u='gm',gm=true)=>m.handle({type,payload},{userId:u,gm});
 cmd('create',{id,gameId:'fighting-pit-tournament',userName:'Player'},'owner',false);
 cmd('addNpc',{id,name:'Arena Rival',controlled:false});const table=m.sessions.get(id);
 assert.throws(()=>cmd('configureArenaProfile',{id,seatId:table.seats[0].id,profile},'owner',false),/Only the GM/);
 cmd('configureArenaProfile',{id,seatId:table.seats[0].id,profile});cmd('start',{id});
 assert.equal(m.sessions.get(id).board.fighters[table.seats[0].id].hp,original.hp+3);
});

test('Stage 5 NPC bards adapt to crowd delivery; repeated material earns fewer points',()=>{
 let s=fresh('battle-of-the-bards');s.fighters.hero.x=4;s.fighters.hero.y=3;s.fighters.villain.x=6;s.fighters.villain.y=3;s.crowdPreference='heartfelt';
 const npc=chooseArenaNpcAction(s,'hero',()=>.5);
 if(arenaAbilityType(npc.ability)==='performance')assert.equal(npc.delivery,'heartfelt');
 const action={type:'use',ability:'verse',x:6,y:3};
 const correct=applyArenaGame(s,'hero',{...action,delivery:'heartfelt'},()=>0).fighters.hero.score;
 const wrong=applyArenaGame(s,'hero',{...action,delivery:'comic'},()=>0).fighters.hero.score;
 assert(correct>=wrong+4);
 s=applyArenaGame(s,'hero',{...action,delivery:'heartfelt'},()=>0);
 assert.equal(s.fighters.hero.lastPerformance,'verse');
 s=applyArenaGame(s,'hero',{...action,delivery:'heartfelt'},()=>0);
 assert(s.fighters.hero.score<correct*2,'Repeating a verse should receive a penalty');
 function arenaAbilityType(id){return ARENA_ABILITIES[id]?.effect;}
});

test('Arena NPC victory speeches and projectile impact markup are contextual and accessible',()=>{
 let s=fresh('wizard-duel');s.fighters.hero.x=3;s.fighters.hero.y=3;s.fighters.villain.x=6;s.fighters.villain.y=3;
 s=use(s,{ability:'ember',x:6,y:3},()=>.5);
 const seats=people();const session={gameId:'wizard-duel',status:'playing',seats,board:s,config:{},notes:[]};
 const html=renderArenaGame(session,{seatId:'hero',gm:true,canPlay:true,user:{id:'hero'},replayIndex:-1,arenaAbility:'ember',reducedMotion:false});
 assert.match(html,/pfa-arena-projectile arcane/);assert.match(html,/pfa-arena-impact/);
 const htmlReduced=renderArenaGame(session,{seatId:'hero',gm:true,canPlay:true,user:{id:'hero'},replayIndex:-1,arenaAbility:'ember',reducedMotion:true});
 assert(!htmlReduced.includes('pfa-arena-projectile arcane'));
 let victory=fresh('fighting-pit-tournament');victory.fighters.hero.hp=1;victory.fighters.hero.x=3;victory.fighters.hero.y=3;victory.fighters.villain.x=4;victory.fighters.villain.y=3;
 victory.turn=1;victory=applyArenaGame(victory,'villain',{type:'use',ability:'strike',x:3,y:3},()=>.9);
 assert(victory.done&&victory.winner===1);assert.equal(victory.lastEvent.quote.speaker,'The Rival');
});

test('Game setup kit choices match accepted session kit restrictions',()=>{
 const seats=people();const board=initArenaGame('fighting-pit-tournament',seats,seeded(1));
 const setup=renderArenaSetup({gameId:'fighting-pit-tournament',seats,board,status:'lobby',config:{}},{gm:true,user:{id:'hero'}});
 assert(!setup.includes('value="mage"'));assert(!setup.includes('value="poet"'));assert(setup.includes('value="duelist"'));assert(setup.includes('value="rider"'));
});

test('high-difficulty NPCs actually attack, perform, defend, pin and train instead of exploiting safe infinite loops',()=>{
 const requirements={
  'battle-of-the-bards':['verse','encore'],
  'wizard-duel':['ember','storm'],
  'monster-wrestler-championship':['pin'],
  'shield-wall':['strike'],
  'melee-training-dummy':['combo']
 };
 for(const [id,wanted] of Object.entries(requirements)){
  const observed=new Set();
  for(let seed=1;seed<=7;seed++){
   const random=seeded(seed*7213);let s=initArenaGame(id,[{id:'p',name:'P',kind:'auto-npc'},{id:'n',name:'N',kind:'auto-npc'}],random,{difficulty:3});
   for(let i=0;i<350&&!s.done;i++){
    const who=s.seats[s.turn],act=chooseArenaNpcAction(s,who,random);assert(act,`Stalled ${id}`);observed.add(act.ability);s=applyArenaGame(s,who,act,random);
   }
   assert(s.done,`AI did not finish ${id}`);
  }
  for(const ability of wanted)assert(observed.has(ability),`${id} never used its important technique ${ability}`);
 }
});

test('Taunt is crowd flavour rather than a non-combat training score exploit',()=>{
 let training=fresh('melee-training-dummy');training.fighters.hero.x=5;training.fighters.hero.y=3;
 const before=training.fighters.hero.score;
 training=use(training,{ability:'taunt',x:6,y:3},()=>.5);
 assert.equal(training.fighters.hero.score,before);
});
