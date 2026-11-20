import test from 'node:test';
import assert from 'node:assert/strict';
import {PUZZLE_GAMES,PUZZLE_IDS,PUZZLE_LESSONS,PUZZLE_PRESETS,STARFORGE_CHAIN} from '../scripts/core/puzzle-data.mjs';
import {PUZZLE_KINDS,validatePuzzlePack,validatePuzzleEntries,generateRiddlePack,seededRng,initPuzzleGame,applyPuzzleGame,projectPuzzleGame,gravityPath,gravityTilt,PIPE_TARGET,pipeSolved,lightsHint,solveSlide,toggleLights} from '../scripts/core/puzzle-engine.mjs';
import {validateBinding,validateBindingAgainstScene,pointInBinding,triggeredOnEntry,applySceneReward} from '../scripts/core/scene-bindings.mjs';
import {ArcadeSessions} from '../scripts/core/session.mjs';
import {GAMES,PLAYABLE} from '../scripts/core/data.mjs';
import {renderArcade} from '../scripts/ui/view.mjs';
import {renderPuzzleGame,renderPuzzleForge} from '../scripts/ui/puzzle-view.mjs';
const seats=ids=>ids.map(id=>({id,name:id,ownerId:id,kind:'person'}));
const seat='seat-one';
const initial=(id,seed=53)=>initPuzzleGame(id,seats([seat]),seededRng(seed));
function solveNode(s,rng){
 const n=s.nodes[s.index],c=s.current,play=(action)=>{s=applyPuzzleGame(s,seat,action,rng);return s;};
 switch(n.kind){
  case 'riddle':play({type:'answer',text:n.answers[0]});break;
  case 'sequence':case 'arrange':for(const i of n.solution)play({type:'tap',index:i});play({type:'submit'});break;
  case 'melody':play({type:'watch'});for(const i of n.solution)play({type:'tap',index:i});break;
  case 'dials':for(let i=0;i<n.solution.length;i++)for(let j=0;j<n.solution[i];j++)play({type:'dial',index:i});play({type:'submit'});break;
  case 'logic':case 'offer':for(let i=0;i<n.solution.length;i++)play({type:'assign',index:i,value:n.solution[i]});play({type:'submit'});break;
  case 'choices':for(const stage of n.stages)play({type:'choose',index:stage.correct});break;
  case 'pipes':for(let i=0;i<PIPE_TARGET.length&&!s.done;i++)for(let j=0;j<4&&!s.done&&s.current.rotations[i]!==PIPE_TARGET[i];j++)play({type:'rotate',index:i});if(!s.done)play({type:'submit'});break;
  case 'gravity':{const path=gravityPath(c.pos,c.goal,c.walls);assert(path,`${s.gameId}: gravity start unsolvable`);for(const dir of path)play({type:'tilt',direction:dir});break;}
  case 'lights':{const moves=lightsHint(c.cells);assert(moves,`${s.gameId}: lights unsolvable`);for(const index of moves)play({type:'press',index});break;}
  case 'slide':{const moves=solveSlide(c.cells);assert(moves,`${s.gameId}: slide unsolvable`);for(const index of moves)play({type:'slide',index});break;}
  default:assert.fail('No solver for kind '+n.kind);
 }
 return s;
}

test('the 16 Puzzle Forge activities are uniquely registered, validated and lesson-enabled',()=>{
 assert.equal(PUZZLE_GAMES.length,16);assert.equal(PUZZLE_IDS.size,16);assert.equal(PUZZLE_KINDS.size,12);
 assert.equal(PLAYABLE.length,73);
 for(const g of PUZZLE_GAMES){assert(GAMES[g.id],g.id);assert.equal(GAMES[g.id].type,'puzzle');assert.equal(PUZZLE_LESSONS[g.id].length,3);assert(validatePuzzleEntries(PUZZLE_PRESETS[g.id]).length>=1);}
 assert.equal(validatePuzzleEntries(STARFORGE_CHAIN).length,5);
});

test('all 16 puzzles solve in 160 seeded complete runs; the Starforge chain resolves five chambers',()=>{
 for(const game of PUZZLE_GAMES)for(let seed=1;seed<=10;seed++){
  let s=initial(game.id,seed*293),rng=seededRng(seed*100+39);let steps=0;
  while(!s.done&&steps++<26){const previous=s.index;s=solveNode(s,rng);assert(s.done||s.index!==previous,`Did not advance ${game.id} ${seed} on node ${previous}`);}
  assert(s.done,`${game.id} seed ${seed} did not finish`);
  assert.equal(s.phase,'complete');assert.equal(s.winner,'party');assert.equal(s.history.length,s.nodes.length);
  assert.equal(s.score,100+20*s.nodes.length);assert.equal(s.attempts,0);
 }
});

test('puzzle rules reject illegal/duplicate/unauthorised moves and do not accept answers with extra text',()=>{
 let s=initial('scribe-s-riddle-tablet',35),answer=s.nodes[0].answers[0];
 assert.throws(()=>applyPuzzleGame(s,'stranger',{type:'answer',text:answer}),/not at this puzzle/);
 assert.throws(()=>applyPuzzleGame(s,seat,{type:'answer',text:answer.repeat(500)}),/up to 160/);
 const wrong=applyPuzzleGame(s,seat,{type:'answer',text:'absolutely not the answer'});
 assert.equal(wrong.attempts,1);assert.equal(wrong.score,97);assert.equal(s.attempts,0);
 assert(!wrong.done);s=applyPuzzleGame(wrong,seat,{type:'answer',text:answer.toUpperCase()});assert.equal(s.round,1);
 const logic=initial('the-three-hungers');let l=applyPuzzleGame(logic,seat,{type:'assign',index:0,value:1});l=applyPuzzleGame(l,seat,{type:'unassign',index:0});assert.equal(l.current.values[0],null);
 assert.throws(()=>applyPuzzleGame(logic,seat,{type:'assign',index:0,value:8}),/Choose a guardian/);
 assert.throws(()=>applyPuzzleGame(initial('wally-style-original-trap-builder'),seat,{type:'slide',index:99}),/Choose a numbered wardplate/);
 const riddle=initial('ink-bound-door');assert.equal(applyPuzzleGame(riddle,seat,{type:'answer',text:'a random string'}).done,false);
});

test('hints cost party points, are progressively revealed and do not contain a secret answer object',()=>{
 const s=initial('tri-moon-lock'),publicBefore=projectPuzzleGame(s,'someone');
 assert.equal(publicBefore.nodes,undefined);assert.equal(publicBefore.challenge.solution,undefined);
 assert.equal(publicBefore.challenge.hints,undefined);assert.equal(publicBefore.challenge.hintCount,3);
 let next=applyPuzzleGame(s,seat,{type:'hint'});
 assert.equal(next.score,98);assert.equal(next.hintsUsed,1);assert.equal(projectPuzzleGame(next).hints.length,1);
 next=applyPuzzleGame(next,seat,{type:'hint'});next=applyPuzzleGame(next,seat,{type:'hint'});
 assert.equal(next.hintsUsed,3);assert.throws(()=>applyPuzzleGame(next,seat,{type:'hint'}),/All hints/);
});

test('generated riddle packs are deterministic, valid, original and completely traversable',()=>{
 const a=generateRiddlePack({id:'old-gates',name:'Old Gates',count:12,seed:914,difficulty:3});
 assert.deepEqual(a,generateRiddlePack({id:'old-gates',name:'Old Gates',count:12,seed:914,difficulty:3}));
 assert.equal(a.entries.length,12);assert.equal(new Set(a.entries.map(x=>x.id)).size,12);
 for(const node of a.entries)assert(node.answers?.length);
 assert.throws(()=>generateRiddlePack({count:13}),/1 and 12/);
 assert.throws(()=>validatePuzzlePack({id:'bad-pack',name:'Bad Pack',entries:[{id:'first',kind:'riddle',title:'Test riddle',prompt:'A puzzle needing an answer',hints:['First hint','Second hint'],answers:['door'],next:'nobody'}]}),/unknown node/);
 const c=structuredClone(a);c.entries[1].next=c.entries[0].id;assert.throws(()=>validatePuzzlePack(c),/cycle|reachable/);
 const game=initPuzzleGame('riddle-book-procedural-challenges',seats([seat]),seededRng(3),{puzzleNodes:a.entries});let s=game;
 for(let i=0;i<12;i++){s=applyPuzzleGame(s,seat,{type:'answer',text:s.nodes[s.index].answers[0]});}
 assert.equal(s.done,true);assert.equal(s.history.length,12);
});


test('saved custom puzzle pack with explicit final null linkage can be restored and played',()=>{
 const manager=new ArcadeSessions(seededRng(19));
 const pack=generateRiddlePack({id:'ancient-vault-pack',name:'Ancient Vault',count:4,seed:44});
 assert.equal(pack.entries.at(-1).next,null);
 manager.handle({type:'savePack',payload:{pack}},{userId:'gm',gm:true});
 const state=manager.exportState();
 const restored=new ArcadeSessions(seededRng(31));restored.restoreState(state);
 assert.deepEqual(restored.packs[0],pack);
 const id='table-reloaded-custom-book';
 restored.create({id,gameId:'riddle-book-procedural-challenges',userId:'gm',userName:'GM',config:{packId:pack.id}});
 restored.start({id,userId:'gm',gm:true});
 assert.equal(restored.sessions.get(id).board.nodes.length,4);
 for(let i=0;i<4;i++){
  const board=restored.sessions.get(id).board;
  const seatId=restored.sessions.get(id).seats[0].id;
  restored.play({id,seatId,userId:'gm',action:{type:'answer',text:board.nodes[board.index].answers[0]}});
 }
 assert.equal(restored.sessions.get(id).status,'complete');
 assert.equal(restored.ledger.length,1);
});

test('generated mechanical puzzles have independent verified solvers and reject bad moves',()=>{
 for(let seed=1;seed<=60;seed++){
  const r=seededRng(seed),lights=initial('keystone-lattice',seed);
  const seq=lightsHint(lights.current.cells);assert(seq);
  let cells=[...lights.current.cells];for(const i of seq)cells=toggleLights(cells,i);assert(cells.every(v=>v===1));
  const slide=initial('wally-style-original-trap-builder',seed);
  assert(solveSlide(slide.current.cells),`Slide seed ${seed} impossible`);
  const gravity=initial('rotating-gravity-room',seed);
  assert(gravityPath(gravity.current.pos,gravity.current.goal,gravity.current.walls));
  assert(pipeSolved(PIPE_TARGET));
  assert.throws(()=>gravityTilt(gravity.current,'Z'),/Choose N/);
 }
});

test('cooperative puzzles let another user join after start while preserving ownership and private rules',()=>{
 const manager=new ArcadeSessions(seededRng(66)),id='table-puzzle-live-one';
 const call=(userId,type,payload,gm=false)=>manager.handle({type,payload},{userId,gm});
 call('alice','create',{id,gameId:'tri-moon-lock',userName:'Alice'});
 call('alice','start',{id});assert.equal(manager.sessions.get(id).status,'playing');
 call('bob','join',{id,userName:'Bob'});
 const table=manager.sessions.get(id),alice=table.seats[0].id,bob=table.seats[1].id;
 assert(table.board.seats.includes(alice)&&table.board.seats.includes(bob));
 assert.throws(()=>call('mallory','play',{id,seatId:bob,action:{type:'dial',index:0}}),/do not control/);
 call('bob','play',{id,seatId:bob,action:{type:'hint'}});
 call('alice','play',{id,seatId:alice,action:{type:'dial',index:1}});
 assert.equal(manager.sessions.get(id).board.hintsUsed,1);
 assert.equal(manager.publicView(manager.sessions.get(id),'alice').board.nodes,undefined);
 const snapshot=manager.exportState();assert.equal(snapshot.schema,5);
 const restored=new ArcadeSessions(seededRng(17));restored.restoreState(snapshot);
 assert.equal(restored.sessions.get(id).board.hintsUsed,1);
 assert.equal(restored.sessions.get(id).seats.length,2);
});

test('GM-approved bindings persist and non-GMs cannot create, remove or trigger scene puzzles',()=>{
 const mgr=new ArcadeSessions(seededRng(34));const binding={id:'bind-tomb',sceneId:'scene-1',sceneName:'Forgotten Crypt',sourceKind:'Region',sourceId:'region-1',effectKind:'Wall',effectId:'door-1',effectAction:'open',gameId:'ink-bound-door'};
 assert.throws(()=>mgr.handle({type:'saveBinding',payload:{binding}},{userId:'alice',gm:false}),/Only GMs/);
 mgr.handle({type:'saveBinding',payload:{binding}},{userId:'gm',gm:true});
 assert.equal(mgr.listBindings().length,1);
 const triggered=mgr.handle({type:'triggerBinding',payload:{id:binding.id,participantUserId:'alice',participantName:'Alice'}},{userId:'gm',gm:true});
 assert(triggered.tableId);
 const run=mgr.sessions.get(triggered.tableId);assert.equal(run.status,'playing');assert.equal(run.seats[0].ownerId,'alice');assert.equal(run.bindingId,binding.id);
 assert.equal(mgr.handle({type:'triggerBinding',payload:{id:binding.id}},{userId:'gm',gm:true}).resumed,true);
 const loaded=new ArcadeSessions(seededRng(7));loaded.restoreState(mgr.exportState());
 assert.equal(loaded.bindings[0].activeTableId,triggered.tableId);
 assert.throws(()=>loaded.handle({type:'deleteBinding',payload:{id:binding.id}},{userId:'alice',gm:false}),/Only GMs/);
 assert.throws(()=>loaded.handle({type:'triggerBinding',payload:{id:binding.id}},{userId:'alice',gm:false}),/Only the GM/);
});

test('scene binding validates identifiers, geometric entry, matching rewards and real async document updates',async()=>{
 let update=null;const tile={id:'tile-1',x:10,y:10,width:100,height:100,rotation:0,hidden:true,async update(data){update=data;return data;}};
 let doorUpdate=null;const wall={id:'door-1',door:1,ds:0,async update(data){doorUpdate=data;return data;}};
 const region={id:'region-1',testPoint:(p)=>p.x>=10&&p.x<=110&&p.y>=10&&p.y<=110};
 const scene={id:'scene-1',tiles:new Map([['tile-1',tile]]),walls:new Map([['door-1',wall]]),regions:new Map([['region-1',region]])};
 const base={id:'binding-f',sceneId:'scene-1',sceneName:'Test',sourceKind:'Region',sourceId:'region-1',effectKind:'Wall',effectId:'door-1',effectAction:'open',gameId:'tri-moon-lock'};
 assert.deepEqual(validateBindingAgainstScene(base,scene),validateBinding(base));
 assert.equal(triggeredOnEntry(base,scene,{x:0,y:0},{x:20,y:20}),true);
 assert.equal(triggeredOnEntry(base,scene,{x:20,y:20},{x:25,y:25}),false);
 assert.equal(pointInBinding(base,scene,{x:500,y:500}),false);
 await applySceneReward(base,scene);assert.deepEqual(doorUpdate,{ds:1});
 const reveal={...base,id:'bind-tile',sourceKind:'Tile',sourceId:'tile-1',effectKind:'Tile',effectId:'tile-1',effectAction:'reveal'};
 assert(pointInBinding(reveal,scene,{x:20,y:20}));assert(!pointInBinding(reveal,scene,{x:0,y:0}));
 await applySceneReward(reveal,scene);assert.deepEqual(update,{hidden:false});
 assert.throws(()=>validateBindingAgainstScene({...base,effectId:'unknown'},scene),/target not found/);
 assert.throws(()=>validateBinding({...base,effectKind:'Wall',effectAction:'reveal'}),/does not match/);
});

test('every new puzzle renders a playable scene with no solutions in the HTML',()=>{
 const baseContext={canPlay:true};
 for(const g of PUZZLE_GAMES){
  const s=initial(g.id,19),session={gameId:g.id,board:projectPuzzleGame(s,'alice'),seats:[{id:seat,name:'Alice',ownerId:'alice'}]};
  const html=renderPuzzleGame(session,baseContext);
  assert(html.includes('pfa-puzzle-game'),g.id);assert(html.includes('pfa-puzzle-heading'),g.id);
  assert(/data-act="(puzzle-action|puzzle-tone|puzzle-demo)"/.test(html),g.id);
  assert(!html.includes('<script>'),g.id);
  assert(!html.includes('undefined'),`${g.id} has undefined text`);
 }
 const forge=renderPuzzleForge({catalog:Object.values(GAMES),scene:null,scenes:[],packs:[],bindings:[]});
 assert(forge.includes('Puzzle Forge'));assert(forge.includes('Generate and save'));
 assert(!forge.includes('<script>'));
});
