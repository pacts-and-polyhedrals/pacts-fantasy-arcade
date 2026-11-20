import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYABLE,GAMES,LESSONS} from '../scripts/core/data.mjs';
import {EXPANSION_GAMES,EXPANSION_SHARED,STORY_SCENES,BONE_SYMBOLS} from '../scripts/core/expansion-data.mjs';
import {initSeat,applySeat,chooseAutoAction,projectSeat,initBoard,scoreSlots} from '../scripts/core/rules.mjs';
import {initSharedGame,applySharedGame,chooseSharedAction,projectSharedGame,solitaireExposed,sharedLegalActions} from '../scripts/core/expansion-rules.mjs';
import {ArcadeSessions,validatePack} from '../scripts/core/session.mjs';
import {renderArcade} from '../scripts/ui/view.mjs';
const seeded=(initial)=>{let v=initial>>>0;return()=>((v=(1664525*v+1013904223)>>>0)/4294967296)};
const ids=()=>[{id:'one'},{id:'two'},{id:'three'}];
const ctx={catalog:[],sessions:[],session:null,selected:'goblin-s-bluff',user:{id:'u1',name:'Player'},gm:true,seatId:'one',tutorialStep:0,power:70,angle:45,aimValue:50,heat:50,ingredient:0,selectedSquare:null,aimX:0,aimY:0,bidQty:2,bidFace:3,packs:[],ledger:[],coinMode:'classic',coinRounds:5,packChoice:'',reducedMotion:false};
const qpack={id:'custom-fairy-quiz',type:'trivia',name:'Fairy Quiz',entries:Array.from({length:5},(_,i)=>({q:`What number is marked on the flag ${i+1}?`,a:['One','Two','Three','Four'],correct:i%4}))};

test('all 73 games have registered lessons and 15 distinct new implementations',()=>{
 assert.equal(PLAYABLE.length,73);assert.equal(EXPANSION_GAMES.length,15);
 assert.equal(new Set(PLAYABLE.map(g=>g.id)).size,73);
 for(const g of PLAYABLE){assert(GAMES[g.id]&&LESSONS[g.id]?.length>=3,g.id);}
});

test('new solo NPC engines terminate in 100 seeds with bounded scores',()=>{
 for(const g of EXPANSION_GAMES.filter(g=>!EXPANSION_SHARED.has(g.id)))for(let seed=1;seed<=100;seed++){
  const rng=seeded(seed*23+11);let s=initSeat(g.id,rng),steps=0;
  for(;!s.done&&steps<340;steps++){const a=chooseAutoAction(s,rng);assert(a,`No action: ${g.id}`);s=applySeat(s,a,rng);assert(Number.isFinite(s.score)&&s.score>=0,g.id);}
  assert(s.done,`NPC hung: ${g.id} seed ${seed}`);
 }
});

test('all 3 shared games complete 150 seeded multi-seat AI matches each',()=>{
 for(const gameId of EXPANSION_SHARED){
  for(let seed=1;seed<=150;seed++){
   const rng=seeded(seed*37+41),seats=ids();let s=initSharedGame(gameId,seats,rng),steps=0;
   for(;!s.done&&steps<600;steps++){
    const seatId=s.seats[s.turn],act=chooseSharedAction(s,seatId,rng);
    assert(act,`Missing NPC move ${gameId} seed ${seed}`);s=applySharedGame(s,seatId,act,rng);
   }
   assert(s.done,`${gameId} stalled seed ${seed} after ${steps} moves`);
   assert(s.winner==='draw'||(Number.isInteger(s.winner)&&s.winner>=0&&s.winner<s.seats.length),`Invalid winner ${gameId}`);
  }
 }
});

test('goblin bones hides unknown tiles, reveals matches and rejects duplicate flips',()=>{
 let rng=seeded(1),s=initSharedGame('goblin-s-bones',ids(),rng);
 assert.equal(s.tiles.length,16);assert.equal(new Set(s.tiles).size,BONE_SYMBOLS.length);
 assert(projectSharedGame(s,[]).tiles.every(x=>x===null));
 s=applySharedGame(s,'one',{type:'flip',index:0},rng);
 assert.equal(projectSharedGame(s,[]).tiles[0],s.tiles[0]);
 assert.throws(()=>applySharedGame(s,'one',{type:'flip',index:0},rng),/already face up/);
 const matching=s.tiles.findIndex((v,i)=>i!==0&&v===s.tiles[0]);
 s=applySharedGame(s,'one',{type:'flip',index:matching},rng);
 assert.equal(s.points.one,1);assert(s.matched.includes(matching));
});

test('dominoes deals a valid unique double-six deck, conceals hands and enforces turns',()=>{
 const rng=seeded(7),s=initSharedGame('dwarven-dominoes',ids(),rng),all=[...s.stock,...Object.values(s.hands).flat()];
 assert.equal(all.length,28);assert.equal(new Set(all.map(t=>t.id)).size,28);
 const player=projectSharedGame(s,['one']);assert.equal(player.hands.one.length,5);assert(player.hands.two.every(x=>x===null));
 assert.equal(player.stock,undefined);assert.equal(player.stockCount,13);
 assert.throws(()=>applySharedGame(s,'two',{type:'draw'},rng),/Wait for your turn/);
 const a=sharedLegalActions(s,'one')[0];const placed=applySharedGame(s,'one',a,rng);
 assert.equal(placed.chain.length,1);assert.equal(placed.hands.one.length,4);assert.equal(placed.turn,1);
});

test('goblin bluff private dice remain concealed before challenges, then reveal and cost a die',()=>{
 const rng=seeded(10),s=initSharedGame('goblin-s-bluff',ids(),rng);
 assert.equal(s.hands.one.length,5);
 assert.deepEqual(projectSharedGame(s,['one']).hands.two,[null,null,null,null,null]);
 assert.deepEqual(projectSharedGame(s,['one']).hands.one,s.hands.one);
 assert.throws(()=>applySharedGame(s,'one',{type:'challenge'},rng),/no opposing bid/i);
 let bid=applySharedGame(s,'one',{type:'bid',quantity:1,face:6},rng);
 assert.equal(bid.turn,1);
 assert.throws(()=>applySharedGame(bid,'two',{type:'bid',quantity:1,face:6},rng),/Raise the bid/);
 const reveal=applySharedGame(bid,'two',{type:'challenge'},rng);
 assert.equal(reveal.phase,'reveal');assert.equal(Object.values(reveal.counts).reduce((a,b)=>a+b),14);
 assert(projectSharedGame(reveal,['three']).hands.one.every(Number.isInteger));
 const restart=applySharedGame(reveal,'three',{type:'next'},rng);assert.equal(restart.phase,'bid');
});

test('real solution data is redacted from a player-facing story, lock, kitchen and rune scene',()=>{
 let v=projectSeat(initSeat('tinker-s-lock-race',seeded(1)));assert.equal(v.code,undefined);
 v=projectSeat(initSeat('ispin-s-impossible-tale',seeded(2)));assert(!v.scenes.some(x=>Object.hasOwn(x,'correct')));
 v=projectSeat(initSeat('fizzlenub-s-feast',seeded(3)));assert.equal(v.order.heat,undefined);assert(v.order.heatBand);
 v=projectSeat(initSeat('forgotten-realms-emoji-door-generator',seeded(4)));assert.equal(v.runePuzzles,undefined);assert(v.activePuzzle.clue);
 v=projectSeat(initSeat('tavern-trivia',seeded(5)));assert.equal(v.questions,undefined);assert.equal(v.questionOrder,undefined);assert(v.activeQuestion.choices.length===4);
});

test('moonlit solitaire starts with seven exposed cards and can remove a visible king',()=>{
 let rng=seeded(7),s=initSeat('moonlit-solitaire',rng);
 const exposed=Array.from({length:28},(_,i)=>i).filter(i=>solitaireExposed(s,i));assert.deepEqual(exposed,[21,22,23,24,25,26,27]);
 assert.throws(()=>applySeat(s,{type:'select',area:'pyramid',index:0},rng),/Only uncovered/);
 const king=exposed.find(i=>s.pyramid[i].rank===13);
 if(king!==undefined){s=applySeat(s,{type:'select',area:'pyramid',index:king},rng);assert.equal(s.score,1);assert.equal(s.pyramid[king].removed,true);}
 const v=projectSeat(s);assert.equal(v.stock,undefined);assert.equal(v.stockCount,24);
});

test('pack authoring validates structured content and rejects invalid or unauthorised edits',()=>{
 const valid=validatePack(qpack);assert.equal(valid.entries.length,5);
 assert.throws(()=>validatePack({...qpack,entries:[{q:'too short',a:['a'],correct:0}]}),/between four/);
 assert.throws(()=>validatePack({...qpack,id:'../../evil'}),/Invalid pack ID/);
 const m=new ArcadeSessions(seeded(4));
 assert.throws(()=>m.handle({type:'savePack',payload:{pack:qpack}},{userId:'u1',gm:false}),/Only a GM/);
 m.handle({type:'savePack',payload:{pack:qpack}},{userId:'gm',gm:true});assert.equal(m.packs[0].id,qpack.id);
 const id='table-custom-quiz-123';m.handle({type:'create',payload:{id,gameId:'tavern-trivia',userName:'Host',config:{packId:qpack.id}}},{userId:'gm',gm:true});
 m.handle({type:'start',payload:{id}},{userId:'gm',gm:true});
 const s=m.sessions.get(id),seat=s.seats[0].id;
 assert.equal(s.seatStates[seat].questions.length,5);assert.equal(s.seatStates[seat].rounds,5);
 assert.equal(m.publicView(s,'gm').seatStates[seat].activeQuestion.choices.length,4);
 assert.equal(m.publicView(s,'visitor').seatStates[seat].questions,undefined);
});

test('custom story and rune packs are used by game engines, not just saved to a menu',()=>{
 const storyScenes=STORY_SCENES.slice(0,5).map(x=>({...x,setup:`CUSTOM ${x.setup}`}));
 let s=initSeat('ispin-s-impossible-tale',seeded(5),{storyScenes});assert(s.scenes.every(x=>x.setup.startsWith('CUSTOM')));
 const runePuzzles=Array.from({length:4},(_,i)=>({clue:`CUSTOM RUNE ${i}`,solution:['A','B','C','D'],hint:'Alphabetical'}));
 s=initSeat('forgotten-realms-emoji-door-generator',seeded(6),{runePuzzles});assert.match(projectSeat(s).activePuzzle.clue,/^CUSTOM RUNE [0-4]$/);
});

test('world state export / restore survives play, saves packs and records results exactly once',()=>{
 const rng=seeded(7),m=new ArcadeSessions(rng),user={userId:'gm',gm:true};
 m.handle({type:'savePack',payload:{pack:qpack}},user);
 const id='table-persist-123';m.handle({type:'create',payload:{id,gameId:'coin-of-fate',userName:'GM',config:{coinRounds:3,coinMode:'streak'}}},user);
 m.handle({type:'start',payload:{id}},user);const seat=m.sessions.get(id).seats[0].id;
 m.handle({type:'play',payload:{id,seatId:seat,action:{type:'guess',choice:'heads'}}},user);
 const saved=JSON.parse(JSON.stringify(m.exportState()));const m2=new ArcadeSessions(rng);assert.equal(m2.restoreState(saved),1);
 assert.equal(m2.sessions.get(id).seatStates[seat].round,1);assert.equal(m2.packs.length,1);
 m2.handle({type:'play',payload:{id,seatId:seat,action:{type:'guess',choice:'tails'}}},user);
 m2.handle({type:'play',payload:{id,seatId:seat,action:{type:'guess',choice:'tails'}}},user);
 assert.equal(m2.sessions.get(id).status,'complete');assert.equal(m2.ledger.length,1);
 assert.equal(m2.exportState().schema,5);
 const m3=new ArcadeSessions(rng);m3.restoreState(JSON.parse(JSON.stringify(m2.exportState())));assert.equal(m3.ledger.length,1);
});

test('game table ownership protects turns, delegates NPCs and allows humans to complete reveal phases',()=>{
 const rng=seeded(8),m=new ArcadeSessions(rng),id='table-npc-challenge-1',gm={userId:'gm',gm:true};
 m.handle({type:'create',payload:{gameId:'goblin-s-bluff',id,userName:'Host'}},gm);
 m.handle({type:'addNpc',payload:{id,name:'Grukk',controlled:true}},gm);
 m.handle({type:'start',payload:{id}},gm);
 let s=m.sessions.get(id),human=s.seats[0].id,npc=s.seats[1].id;
 m.handle({type:'play',payload:{id,seatId:human,action:{type:'bid',quantity:1,face:6}}},gm);
 assert.throws(()=>m.handle({type:'play',payload:{id,seatId:human,action:{type:'challenge'}}},gm),/not your turn/);
 m.handle({type:'play',payload:{id,seatId:npc,action:{type:'challenge'}}},gm);
 assert.equal(m.sessions.get(id).board.phase,'reveal');
 m.handle({type:'play',payload:{id,seatId:human,action:{type:'next'}}},gm);
 assert.equal(m.sessions.get(id).board.phase,'bid');
 m.handle({type:'delegate',payload:{id,seatId:npc,controlled:false}},gm);
 assert.equal(m.sessions.get(id).seats[1].kind,'auto-npc');
});

test('all stage-two solo and board views render controls without raw HTML injection',()=>{
 for(const g of EXPANSION_GAMES){
  const seats=[{id:'one',name:'Alice',ownerId:'u1',kind:'person'},{id:'two',name:'Grukk',ownerId:null,kind:'auto-npc'}];
  const s={id:'table-test-123',gameId:g.id,status:'playing',seats,hostId:'u1',board:null,seatStates:{},notes:[]};
  if(EXPANSION_SHARED.has(g.id))s.board=projectSharedGame(initSharedGame(g.id,seats,seeded(7)),['one']);
  else s.seatStates.one=projectSeat(initSeat(g.id,seeded(7)));
  const page=renderArcade({...ctx,session:s,sessions:[s],selected:g.id});
  assert(page.includes('Play surface'),`Missing surface ${g.id}`);
  assert(!page.includes('undefined"'),`Broken button ${g.id}`);
 }
 const editor=renderArcade({...ctx,packOpen:true,packName:'<script>bad</script>',packType:'trivia'});
 assert(editor.includes('Pack Studio'));assert(!editor.includes('<script>bad</script>'));
 assert(editor.includes('Save pack to world'));
});


test('GM custom slot packs override reel labels and paytables while rejecting malformed presets',()=>{
 const slotpack={id:'dragon-coin-slots',type:'slots',name:"Dragon's Hoard",entries:[{symbols:['🐉','🔥','💎','👑','🦄','⭐'],payouts:{triple:17,pair:3,sequence:8}}]};
 assert.equal(validatePack(slotpack).entries.length,1);
 assert.throws(()=>validatePack({...slotpack,entries:[{symbols:['a','a','b','c','d','e'],payouts:{triple:1,pair:2,sequence:3}}]}),/distinct/);
 assert.equal(scoreSlots([3,3,3],slotpack.entries[0].payouts),17);
 assert.equal(scoreSlots([1,1,4],slotpack.entries[0].payouts),3);
 assert.equal(scoreSlots([1,2,3],slotpack.entries[0].payouts),8);
 const m=new ArcadeSessions(seeded(11)),user={userId:'gm',gm:true};
 m.handle({type:'savePack',payload:{pack:slotpack}},user);
 const id='table-slot-custom-123';
 m.handle({type:'create',payload:{id,gameId:'three-dragon-slots',userName:'GM',config:{packId:slotpack.id}}},user);
 m.handle({type:'start',payload:{id}},user);
 const s=m.sessions.get(id),seat=s.seats[0].id;
 assert.deepEqual(s.seatStates[seat].slotSymbols,slotpack.entries[0].symbols);
 assert.equal(s.seatStates[seat].payouts.triple,17);
 assert.deepEqual(m.publicView(s,'gm').seatStates[seat].slotSymbols,slotpack.entries[0].symbols);
});
