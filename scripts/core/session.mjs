/** Authoritative session transitions and durable export; the Foundry socket is transport only. */
import {GAMES} from './data.mjs';
import {PUZZLE_IDS} from './puzzle-data.mjs';
import {ARENA_IDS,ARENA_KITS,ARENA_CONFIGS} from './arena-data.mjs';
import {ARENA_PERSONAS} from './arena-dialogue.mjs';
import {validateArenaProfile} from './arena-adapter.mjs';
import {validateCharacterLink,validateWorldLink} from './system-bridge.mjs';
import {initArenaGame,applyArenaGame,projectArenaGame} from './arena-engine.mjs';
import {stepArenaNpcs} from './arena-ai.mjs';
import {initPuzzleGame,applyPuzzleGame,projectPuzzleGame,validatePuzzlePack} from './puzzle-engine.mjs';
import {validateBinding} from './scene-bindings.mjs';
import {EXPANSION_SHARED} from './expansion-data.mjs';
import {ADVANCED_IDS} from './advanced-data.mjs';
import {createBracket,findBracketMatch,advanceBracket,recordBracketGame,publicBracket} from './tournaments.mjs';
import {initAdvancedGame,applyAdvancedGame,projectAdvancedGame,advanceAdvancedNpc} from './advanced-rules.mjs';
import {secureRandom,initSeat,applySeat,projectSeat,initBoard,moveChecker,stepNpcSeat,stepNpcBoard} from './rules.mjs';
import {initSharedGame,applySharedGame,chooseSharedAction,projectSharedGame} from './expansion-rules.mjs';
const ensure=(condition,message)=>{if(!condition)throw Error(message)};
const copy=x=>structuredClone(x);
const safeText=(text,max=80)=>String(text??'').trim().slice(0,max);
export const BOARD_ID='runestone-checkers';
export const SHARED_IDS=new Set([BOARD_ID,...EXPANSION_SHARED,...ADVANCED_IDS,...PUZZLE_IDS,...ARENA_IDS]);
const MAX_SEATS=gameId=>ARENA_IDS.has(gameId)?2:['runestone-checkers','wyvern-chess','king-s-gambit'].includes(gameId)?2:ADVANCED_IDS.has(gameId)?4:gameId==='goblin-s-bluff'?6:gameId==='goblin-s-bones'||gameId==='dwarven-dominoes'?4:12;
const trimLogs=s=>{if(s.notes.length>24)s.notes=s.notes.slice(-24)};
const expectedPackType=gameId=>PUZZLE_IDS.has(gameId)?'puzzle':gameId==='tavern-trivia'?'trivia':gameId==='ispin-s-impossible-tale'?'story':gameId==='forgotten-realms-emoji-door-generator'?'runes':gameId==='three-dragon-slots'?'slots':null;
export function validatePack(data){
 ensure(data&&typeof data==='object','Pack must be an object');
 const type=data.type,name=safeText(data.name,60),id=safeText(data.id,60);
 ensure(['trivia','story','runes','slots','puzzle'].includes(type),'Pack type must be trivia, story, runes, slots or puzzle');
 if(type==='puzzle')return validatePuzzlePack(data);
 ensure(name.length>=2,'Pack needs a name');
 ensure(/^[a-z0-9-]{4,60}$/.test(id),'Invalid pack ID');
 ensure(Array.isArray(data.entries)&&(type==='slots'?data.entries.length===1:data.entries.length>=4&&data.entries.length<=80),type==='slots'?'Slot packs require one configuration object':'Pack must contain between four and eighty entries');
 const entries=data.entries.map(e=>{
  ensure(e&&typeof e==='object','Malformed pack entry');
  if(type==='slots'){
   ensure(Array.isArray(e.symbols)&&e.symbols.length===6&&e.symbols.every(x=>typeof x==='string'&&x.length>0&&x.length<=16),'Slot pack needs exactly six symbol names (up to 16 characters each)');
   ensure(new Set(e.symbols).size===6,'All six slot symbols must be distinct');
   ensure(e.payouts&&['triple','pair','sequence'].every(k=>Number.isInteger(e.payouts[k])&&e.payouts[k]>=0&&e.payouts[k]<=100),'Slot payouts must be whole values from 0 to 100');
   return {symbols:e.symbols,payouts:{triple:e.payouts.triple,pair:e.payouts.pair,sequence:e.payouts.sequence}};
  }
  if(type==='trivia'){
   ensure(typeof e.q==='string'&&e.q.length>=5&&e.q.length<=240,'Trivia question must be 5–240 characters');
   ensure(Array.isArray(e.a)&&e.a.length===4&&e.a.every(a=>typeof a==='string'&&a.length>=1&&a.length<=120),'Trivia needs four answers');
   ensure(Number.isInteger(e.correct)&&e.correct>=0&&e.correct<=3,'Trivia correct index must be 0–3');
   return {q:e.q,a:e.a,correct:e.correct};
  }
  if(type==='story'){
   ensure(typeof e.setup==='string'&&e.setup.length>=5&&e.setup.length<=300,'Story setup must be 5–300 characters');
   ensure(Array.isArray(e.choices)&&e.choices.length===3&&e.choices.every(a=>typeof a==='string'&&a.length>=1&&a.length<=160),'Story needs three choices');
   ensure(Number.isInteger(e.correct)&&e.correct>=0&&e.correct<=2,'Story correct index must be 0–2');
   return {setup:e.setup,choices:e.choices,correct:e.correct,mood:safeText(e.mood||'dramatic',30)};
  }
  ensure(typeof e.clue==='string'&&e.clue.length>=5&&e.clue.length<=220,'Rune clue must be 5–220 characters');
  ensure(Array.isArray(e.solution)&&e.solution.length===4&&e.solution.every(v=>typeof v==='string'&&v.length>0&&v.length<=16),'Rune solution needs four glyphs');
  ensure(new Set(e.solution).size===4,'Rune glyphs must be distinct');
  ensure(typeof e.hint==='string'&&e.hint.length<=180,'Rune hint must be under 180 characters');
  return {clue:e.clue,solution:e.solution,hint:e.hint};
 });
 return {id,type,name,entries};
}
export class ArcadeSessions {
 constructor(rng=secureRandom){this.rng=rng;this.sessions=new Map();this.ledger=[];this.packs=[];this.tournaments=[];this.bindings=[];this.seatSequence=0;}
 exportState(){return {schema:5,sessions:[...this.sessions.values()].map(copy),ledger:copy(this.ledger),packs:copy(this.packs),tournaments:copy(this.tournaments),bindings:copy(this.bindings)};}
 restoreState(raw){
  ensure(raw&&[2,3,4,5].includes(raw.schema),'Unsupported saved arcade schema');
  ensure(Array.isArray(raw.sessions)&&raw.sessions.length<=30,'Invalid saved tables');
  ensure(Array.isArray(raw.ledger)&&raw.ledger.length<=300,'Invalid saved scoreboard');
  ensure(Array.isArray(raw.packs)&&raw.packs.length<=20,'Invalid saved packs');
  ensure(raw.schema===2||(Array.isArray(raw.tournaments)&&raw.tournaments.length<=12),'Invalid saved tournament list');
  ensure(raw.schema<4||(Array.isArray(raw.bindings)&&raw.bindings.length<=30),'Invalid scene bindings');
  const packs=raw.packs.map(validatePack);
  const sessions=[];
  for(const s of raw.sessions){
   if(!s||typeof s.id!=='string'||!GAMES[s.gameId]||!['lobby','playing','complete'].includes(s.status))continue;
   if(!Array.isArray(s.seats)||s.seats.length<1||s.seats.length>MAX_SEATS(s.gameId))continue;
   sessions.push(copy(s));
  }
  this.sessions=new Map(sessions.map(s=>[s.id,s]));this.ledger=copy(raw.ledger).slice(-250);this.packs=packs;
  this.tournaments=(raw.tournaments||[]).filter(t=>t&&typeof t.id==='string'&&Array.isArray(t.rounds)&&Array.isArray(t.participants)&&[2,4,8].includes(t.participants.length)).map(copy);
  this.bindings=(raw.bindings||[]).map(validateBinding);
  return sessions.length;
 }
 tournamentList(){return this.tournaments.map(publicBracket);}
 packList(gm=false){return this.packs.map(p=>gm?copy(p):{id:p.id,type:p.type,name:p.name,count:p.entries.length});}
 summaries(viewerId=null,gm=false){return [...this.sessions.values()].map(s=>this.publicView(s,viewerId,gm));}
 publicView(s,viewerId=null,gm=false){
  if(!s)return null;
  const p=copy(s),ownIds=s.seats.filter(z=>z.ownerId===viewerId).map(z=>z.id);
  for(const [seatId,st] of Object.entries(s.seatStates||{}))p.seatStates[seatId]=ownIds.includes(seatId)?projectSeat(st):{gameId:st.gameId,score:st.score,round:st.round,rounds:st.rounds,phase:st.phase,done:st.done,last:st.last};
  if(s.board&&EXPANSION_SHARED.has(s.gameId))p.board=projectSharedGame(s.board,ownIds,gm);
  if(s.board&&ADVANCED_IDS.has(s.gameId))p.board=projectAdvancedGame(s.board,ownIds);
  if(s.board&&PUZZLE_IDS.has(s.gameId))p.board=projectPuzzleGame(s.board,viewerId,gm);
  if(s.board&&ARENA_IDS.has(s.gameId))p.board=projectArenaGame(s.board);
  // World/Journal refs and Daggerheart Experience labels are GM-only discovery data.
  // Players receive approved public role/affinity information but not world planning metadata.
  if(!gm){
   delete p.worldLink;
   for(const seat of p.seats)if(seat.characterLink)delete seat.characterLink.experienceSuggestions;
  }
  // No source packs (or hidden solution data) travel in regular table projections.
  delete p.packs;return p;
 }
 _find(id){const s=this.sessions.get(id);ensure(s,'Table not found. Ask the GM to reopen it.');return s;}
 _member(s,seatId,userId){const seat=s.seats.find(x=>x.id===seatId);ensure(seat,'That seat no longer exists');ensure(seat.ownerId===userId,'You do not control that character');return seat;}
 _newSeat(name,kind,ownerId){return {id:`seat-${Date.now().toString(36)}-${++this.seatSequence}-${Math.floor(this.rng()*1e9)}`,ownerId,name:safeText(name,50)||'Adventurer',kind};}
 _updated(s){
  s.version=(s.version||0)+1;s.updatedAt=Date.now();trimLogs(s);
  if(s.status==='playing'&&!SHARED_IDS.has(s.gameId)&&s.seats.every(z=>s.seatStates[z.id]?.done))s.status='complete';
  if(s.status==='playing'&&SHARED_IDS.has(s.gameId)&&s.board?.done)s.status='complete';
  this.sessions.set(s.id,s);
  if(s.status==='complete'&&!s.archived){this._recordResult(s);s.archived=true;}
  return this.publicView(s);
 }
 _recordResult(s){
  const results=s.seats.map((seat,i)=>({id:seat.id,name:seat.name,kind:seat.kind,score:ARENA_IDS.has(s.gameId)?s.board?.scores?.[seat.id]??0:PUZZLE_IDS.has(s.gameId)?s.board?.score??0:ADVANCED_IDS.has(s.gameId)?(s.board?.scores?.[seat.id]??(s.board?.winner===i?'Winner':s.board?.winner==='draw'?'Draw':'Finished')):SHARED_IDS.has(s.gameId)?(s.board?.winner===i?'Winner':s.board?.winner==='draw'?'Draw':s.gameId==='goblin-s-bones'?s.board?.points?.[seat.id]??0:s.gameId==='goblin-s-bluff'?s.board?.counts?.[seat.id]??0:'Finished'):s.seatStates[seat.id]?.score??0}));
  this.ledger.push({tableId:s.id,gameId:s.gameId,endedAt:Date.now(),results});this.ledger=this.ledger.slice(-250);
  if(s.tournamentId&&s.tournamentMatchId){const t=this.tournaments.find(x=>x.id===s.tournamentId);if(t)recordBracketGame(t,s.tournamentMatchId,s);}
 }
 create({gameId,userId,userName,id,config={}}){
  ensure(GAMES[gameId],'This game is still on the development backlog');
  ensure(typeof id==='string'&&/^[a-zA-Z0-9-]{8,90}$/.test(id),'Invalid table ID');
  ensure(typeof userId==='string'&&userId.length<=100,'Invalid user ID');
  ensure(!this.sessions.has(id),'Duplicate table ID');ensure(this.sessions.size<30,'Close an old table before creating another');
  const clean={};if(ARENA_IDS.has(gameId))clean.difficulty=2;if(gameId==='coin-of-fate'){clean.coinMode=config.coinMode==='streak'?'streak':'classic';clean.coinRounds=[3,5,9,15].includes(Number(config.coinRounds))?Number(config.coinRounds):5;}
  const packType=expectedPackType(gameId);
  if(packType&&config.packId){const pack=this.packs.find(p=>p.id===config.packId&&p.type===packType);ensure(pack,'The selected pack does not exist or has the wrong type');clean.packId=pack.id;}
  const s={id,gameId,status:'lobby',seats:[this._newSeat(userName,'person',userId)],hostId:userId,createdAt:Date.now(),updatedAt:Date.now(),version:0,config:clean,seatStates:{},board:null,notes:['Imaginary points only · No real-money wagers']};
  this.sessions.set(id,s);return this._updated(s);
 }
 join({id,userId,userName}){
  const s=this._find(id);ensure(s.status==='lobby'||(PUZZLE_IDS.has(s.gameId)&&s.status==='playing'),'This table has started; watch it instead');ensure(s.seats.length<MAX_SEATS(s.gameId),'Table is full');
  ensure(!s.seats.some(z=>z.ownerId===userId),'You already have a seat');const newSeat=this._newSeat(userName,'person',userId);s.seats.push(newSeat);if(PUZZLE_IDS.has(s.gameId)&&s.board?.seats)s.board.seats.push(newSeat.id);return this._updated(s);
 }
 addNpc({id,userId,name,controlled=false,gm=false}){
  const s=this._find(id);ensure(gm,'Only a GM may create NPCs');ensure(s.status==='lobby','NPCs can only join before play');ensure(s.seats.length<MAX_SEATS(s.gameId),'Table is full');
  s.seats.push(this._newSeat(name||'Grukk the Goblin',controlled?'gm-npc':'auto-npc',controlled?userId:null));return this._updated(s);
 }
 configureArenaSeat({id,seatId,userId,gm=false,kit,persona}){
  const s=this._find(id);ensure(ARENA_IDS.has(s.gameId)&&s.status==='lobby','Arena characters are chosen before the match');
  const seat=s.seats.find(z=>z.id===seatId);ensure(seat,'Choose a seat');ensure(seat.ownerId===userId||gm,'Only the seat owner or GM may choose this kit');
  const allowed=s.gameId==='fighting-pit-tournament'?['duelist','bruiser','guardian','wrestler','rogue','rider']:s.gameId==='wizard-duel'?['mage']:['battle-of-the-bards','festival-slam-poetry','trial-by-debate','bardic-duet'].includes(s.gameId)?['bard','poet','orator']:ARENA_CONFIGS[s.gameId].profile;
  if(kit!==undefined){ensure(ARENA_KITS[kit]&&allowed.includes(kit),'Kit is not allowed in this contest');seat.arenaKit=kit;}
  if(persona!==undefined){ensure(persona===''||Object.hasOwn(ARENA_PERSONAS,persona),'Unknown dialogue personality');seat.arenaPersona=persona||null;}
  return this._updated(s);
 }
 configureArenaProfile({id,seatId,profile,gm=false}){
  const s=this._find(id);ensure(ARENA_IDS.has(s.gameId)&&s.status==='lobby','Arena profiles may be imported only before a match');ensure(gm,'Only the GM may import profiles');
  const seat=s.seats.find(z=>z.id===seatId);ensure(seat,'Arena seat is missing');const checked=validateArenaProfile(profile);
  const allowed=s.gameId==='fighting-pit-tournament'?['duelist','bruiser','guardian','wrestler','rogue','rider']:s.gameId==='wizard-duel'?['mage']:['battle-of-the-bards','festival-slam-poetry','trial-by-debate','bardic-duet'].includes(s.gameId)?['bard','poet','orator']:ARENA_CONFIGS[s.gameId].profile;
  ensure(allowed.includes(checked.archetype),'Imported archetype is not allowed in this contest');seat.arenaProfile=checked;seat.arenaKit=checked.archetype;
  return this._updated(s);
 }
 /** Import a GM-reviewed, already mapped World Actor snapshot into one lobby seat. */
 configureCharacterLink({id,seatId,profile,gm=false}){
  ensure(gm,'Only a GM can link World Actors to tables');
  const s=this._find(id);ensure(s.status==='lobby','Characters can only be linked before the match starts');
  const seat=s.seats.find(z=>z.id===seatId);ensure(seat,'Choose an existing table seat');
  const checked=validateCharacterLink(profile,s.gameId);
  seat.characterLink=checked;
  if(ARENA_IDS.has(s.gameId)&&checked.arenaProfile){seat.arenaProfile=checked.arenaProfile;seat.arenaKit=checked.arenaProfile.archetype;}
  s.notes.push(`World Actor ${checked.actorName} linked to ${seat.name} (${checked.systemId}).`);
  return this._updated(s);
 }
 unlinkCharacter({id,seatId,gm=false}){
  ensure(gm,'Only the GM may unlink characters');const s=this._find(id);
  ensure(s.status==='lobby','Characters can only be unlinked before a match');
  const seat=s.seats.find(z=>z.id===seatId);ensure(seat,'Unknown seat');
  if(seat.characterLink?.arenaProfile&&seat.arenaProfile?.label===seat.characterLink.arenaProfile.label){delete seat.arenaProfile;delete seat.arenaKit;}
  delete seat.characterLink;return this._updated(s);
 }
 configureWorldContext({id,worldLink,gm=false}){
  ensure(gm,'Only GMs may import world context');const s=this._find(id);
  ensure(s.status==='lobby','World context is selected before play');
  s.worldLink=worldLink===null?null:validateWorldLink(worldLink);return this._updated(s);
 }
 configureArena({id,gm=false,difficulty}){
  const s=this._find(id);ensure(ARENA_IDS.has(s.gameId)&&s.status==='lobby','Configure the arena before the match');ensure(gm,'Only GMs can set arena difficulty');
  ensure([1,2,3].includes(Number(difficulty)),'Difficulty must be 1, 2, or 3');s.config.difficulty=Number(difficulty);return this._updated(s);
 }
 pauseArena({id,gm=false}){
  const s=this._find(id);ensure(ARENA_IDS.has(s.gameId)&&s.status==='playing','Arena is not running');ensure(gm,'Only the GM can pause or resume');s.board.paused=!s.board.paused;return this._updated(s);
 }
 delegate({id,userId,seatId,gm=false,controlled}){
  const s=this._find(id);ensure(gm,'Only a GM may delegate NPCs');let seat=s.seats.find(z=>z.id===seatId);ensure(seat&&seat.kind!=='person','Choose an NPC seat');
  seat.kind=controlled?'gm-npc':'auto-npc';seat.ownerId=controlled?userId:null;this._runNpcs(s,8);return this._updated(s);
 }
 _configFor(s){const pack=this.packs.find(p=>p.id===s.config?.packId);return {...s.config,...(pack?.type==='puzzle'?{puzzleNodes:pack.entries}:{}),...(pack?.type==='trivia'?{questions:pack.entries}:{}),...(pack?.type==='story'?{storyScenes:pack.entries}:{}),...(pack?.type==='runes'?{runePuzzles:pack.entries}:{}),...(pack?.type==='slots'?{slotSymbols:pack.entries[0].symbols,slotPayouts:pack.entries[0].payouts}:{})};}
 start({id,userId,gm=false}){
  const s=this._find(id);ensure(s.status==='lobby','Match already started');ensure(userId===s.hostId||gm,'Only table creator or GM may start');
  if(SHARED_IDS.has(s.gameId)&&!PUZZLE_IDS.has(s.gameId)&&s.seats.length===1)s.seats.push(this._newSeat('Grukk the Goblin','auto-npc',null));
  ensure(!SHARED_IDS.has(s.gameId)||PUZZLE_IDS.has(s.gameId)||s.seats.length>=2,'At least two players are needed');
  s.status='playing';if(ARENA_IDS.has(s.gameId))s.board=initArenaGame(s.gameId,s.seats,this.rng,s.config);
  else if(PUZZLE_IDS.has(s.gameId))s.board=initPuzzleGame(s.gameId,s.seats,this.rng,this._configFor(s));
  else if(s.gameId===BOARD_ID)s.board=initBoard(s.seats);
  else if(ADVANCED_IDS.has(s.gameId))s.board=initAdvancedGame(s.gameId,s.seats,this.rng);
  else if(EXPANSION_SHARED.has(s.gameId))s.board=initSharedGame(s.gameId,s.seats,this.rng);
  else for(const seat of s.seats)s.seatStates[seat.id]=initSeat(s.gameId,this.rng,{...this._configFor(s),characterAssist:seat.characterLink?.assistance??0});
  s.notes.push('The contest has begun!');this._runNpcs(s,ARENA_IDS.has(s.gameId)&&s.seats.every(z=>z.kind==='auto-npc')?320:10);return this._updated(s);
 }
 play({id,seatId,userId,action}){
  const s=this._find(id);ensure(s.status==='playing','This contest is not running');this._member(s,seatId,userId);
  if(SHARED_IDS.has(s.gameId)){
   if(!PUZZLE_IDS.has(s.gameId))ensure(s.seats[s.board.turn].id===seatId||(s.board.phase==='reveal'&&action?.type==='next'),'It is not your turn');
   if(ARENA_IDS.has(s.gameId))s.board=applyArenaGame(s.board,seatId,action,this.rng);
   else if(PUZZLE_IDS.has(s.gameId))s.board=applyPuzzleGame(s.board,seatId,action,this.rng);
   else if(s.gameId===BOARD_ID){ensure(action?.type==='move','Select a checker move');s.board=moveChecker(s.board,action.from,action.to);}
   else if(ADVANCED_IDS.has(s.gameId))s.board=applyAdvancedGame(s.board,seatId,action,this.rng);
   else s.board=applySharedGame(s.board,seatId,action,this.rng);
  }else s.seatStates[seatId]=applySeat(s.seatStates[seatId],action,this.rng);
  this._runNpcs(s,10);return this._updated(s);
 }
 advance({id,gm=false}){ensure(gm,'Only the GM may advance opponents');const s=this._find(id);ensure(s.status==='playing','Match not running');this._runNpcs(s,40);return this._updated(s);}
 _runNpcs(s,maxMoves=10){
  if(s.status!=='playing')return;
  if(SHARED_IDS.has(s.gameId)){
   if(PUZZLE_IDS.has(s.gameId))return;
   if(ARENA_IDS.has(s.gameId)){if(!s.board.paused)s.board=stepArenaNpcs(s.board,s.seats,this.rng,maxMoves);return;}
   if(ADVANCED_IDS.has(s.gameId)){s.board=advanceAdvancedNpc(s.board,s.seats,this.rng,maxMoves);return;}
   for(let n=0;n<maxMoves&&!s.board.done;n++){
    if(s.board.phase==='reveal')break; // Preserve reveal for humans; any participant can advance it.
    const seat=s.seats[s.board.turn];if(seat.kind!=='auto-npc')break;
    if(s.gameId===BOARD_ID)s.board=stepNpcBoard(s.board,this.rng);
    else {const act=chooseSharedAction(s.board,seat.id,this.rng);if(!act)break;s.board=applySharedGame(s.board,seat.id,act,this.rng);}
   }
  }else for(const seat of s.seats)if(seat.kind==='auto-npc'&&!s.seatStates[seat.id].done)s.seatStates[seat.id]=stepNpcSeat(s.seatStates[seat.id],this.rng,maxMoves);
 }
 close({id,userId,gm=false}){const s=this._find(id);ensure(gm||s.hostId===userId,'Only the GM or table creator can close');this.sessions.delete(id);return {closed:id};}
 upsertPack({pack,gm=false}){
  ensure(gm,'Only a GM can edit packs');const clean=validatePack(pack);const ix=this.packs.findIndex(p=>p.id===clean.id);
  ensure(ix>=0||this.packs.length<20,'Maximum of twenty custom packs');if(ix>=0){ensure(this.packs[ix].type===clean.type,'Cannot change an existing pack type');this.packs[ix]=clean;}else this.packs.push(clean);
  return {saved:clean.id};
 }
 deletePack({id,gm=false}){ensure(gm,'Only a GM can remove packs');const ix=this.packs.findIndex(p=>p.id===id);ensure(ix>=0,'No such pack');this.packs.splice(ix,1);return {deleted:id};}

 listBindings(){return copy(this.bindings);}
 upsertBinding({binding,gm=false}){
  ensure(gm,'Only GMs can create scene bindings');const clean=validateBinding(binding);
  if(clean.packId)ensure(this.packs.some(p=>p.id===clean.packId&&p.type==='puzzle'),'Puzzle pack not found');
  const old=this.bindings.findIndex(b=>b.id===clean.id);ensure(old>=0||this.bindings.length<30,'Maximum thirty scene bindings');
  if(old>=0){clean.activeTableId=this.bindings[old].activeTableId;this.bindings[old]=clean;}else this.bindings.push(clean);
  return {saved:clean.id};
 }
 deleteBinding({id,gm=false}){
  ensure(gm,'Only GMs can delete bindings');const index=this.bindings.findIndex(b=>b.id===id);ensure(index>=0,'No such binding');this.bindings.splice(index,1);return {deleted:id};
 }
 triggerBinding({id,userId,gm=false,participantUserId,participantName}){
  ensure(gm,'Only the GM host can trigger a linked scene puzzle');const b=this.bindings.find(x=>x.id===id);ensure(b,'Scene puzzle binding does not exist');
  if(b.activeTableId&&this.sessions.has(b.activeTableId))return {tableId:b.activeTableId,participantUserId:participantUserId||userId,resumed:true};
  const owner=participantUserId||userId,ownerName=safeText(participantName||'Adventurer',50);
  const tableId=`table-puzzle-${Date.now().toString(36)}-${Math.floor(this.rng()*1e9).toString(36)}`;
  this.create({id:tableId,gameId:b.gameId,userId:owner,userName:ownerName,config:{packId:b.packId}});
  const s=this._find(tableId);s.bindingId=b.id;b.activeTableId=tableId;
  this.start({id:tableId,userId:owner,gm:true});return {tableId,participantUserId:owner,resumed:false};
 }
 createTournament({id,name,gameId,participants,gm=false}){
  ensure(gm,'Only a GM may create tournaments');ensure(ADVANCED_IDS.has(gameId)||(ARENA_IDS.has(gameId)&&['duel','wrestling','performance','survival'].includes(ARENA_CONFIGS[gameId].kind)),'Choose a bracket-compatible game');
  ensure(this.tournaments.length<12,'Close older tournaments before creating more');
  ensure(!this.tournaments.some(t=>t.id===id),'Tournament ID exists');
  const t=createBracket({id,name,gameId,participants});
  this.tournaments.push(t);return publicBracket(t);
 }
 launchTournamentMatch({tournamentId,matchId,userId,gm=false}){
  ensure(gm,'Only a GM may launch tournament matches');const t=this.tournaments.find(t=>t.id===tournamentId);ensure(t,'Tournament not found');
  const m=findBracketMatch(t,matchId);ensure(m&&m.a&&m.b,'This bracket match is not ready');ensure(!m.tableId&&!m.winner,'The match was already launched or finished');
  ensure(this.sessions.size<30,'Maximum 30 arcade tables; close some first');
  const pair=[m.a,m.b].map(id=>t.participants.find(p=>p.id===id));ensure(pair.every(Boolean),'Competitor missing from bracket');
  const tableId=`table-${Math.random().toString(36).slice(2,12)}-${Date.now().toString(36)}`;
  const seats=pair.map(p=>this._newSeat(p.name,p.kind==='npc'?'auto-npc':p.kind==='gm-npc'?'gm-npc':'person',p.userId));
  const s={id:tableId,gameId:t.gameId,status:'lobby',seats,hostId:userId,createdAt:Date.now(),updatedAt:Date.now(),version:0,config:{},seatStates:{},board:null,notes:[`🏆 Tournament: ${t.name} · ${m.id} · fictional points only`],tournamentId:t.id,tournamentMatchId:m.id};
  this.sessions.set(tableId,s);m.tableId=tableId;m.status='active';t.updatedAt=Date.now();t.audit.push({event:'launched',matchId,tableId,at:Date.now()});
  this.start({id:tableId,userId,gm:true});return {tableId,tournamentId:t.id,matchId};
 }
 resolveTournamentMatch({tournamentId,matchId,winnerId,gm=false}){
  ensure(gm,'Only a GM may adjudicate tournament results');const t=this.tournaments.find(t=>t.id===tournamentId);ensure(t,'Tournament not found');
  const m=findBracketMatch(t,matchId);ensure(m,'Tournament match not found');
  if(m.tableId){const table=this.sessions.get(m.tableId);ensure(!table||table.status==='complete','Finish the linked game before adjudicating');}
  return advanceBracket(t,matchId,winnerId,'GM-adjudicated');
 }
 handle(command,context={}){
  ensure(command&&typeof command.type==='string','Invalid command');const from=context.userId,gm=Boolean(context.gm),p=command.payload||{};
  ensure(typeof from==='string'&&from.length<=100,'Invalid sender');
  switch(command.type){
  case 'create':return this.create({...p,userId:from});case 'join':return this.join({...p,userId:from});
  case 'addNpc':return this.addNpc({...p,userId:from,gm});case 'delegate':return this.delegate({...p,userId:from,gm});
  case 'start':return this.start({...p,userId:from,gm});case 'play':return this.play({...p,userId:from});
  case 'advance':return this.advance({...p,userId:from,gm});case 'configureCharacterLink':return this.configureCharacterLink({...p,gm});case 'unlinkCharacter':return this.unlinkCharacter({...p,gm});case 'configureWorldContext':return this.configureWorldContext({...p,gm});case 'configureArenaProfile':return this.configureArenaProfile({...p,gm});case 'configureArenaSeat':return this.configureArenaSeat({...p,userId:from,gm});case 'configureArena':return this.configureArena({...p,userId:from,gm});case 'pauseArena':return this.pauseArena({...p,userId:from,gm});case 'close':return this.close({...p,userId:from,gm});
  case 'savePack':return this.upsertPack({...p,gm});case 'deletePack':return this.deletePack({...p,gm});
  case 'createTournament':return this.createTournament({...p,gm});case 'launchTournamentMatch':return this.launchTournamentMatch({...p,userId:from,gm});case 'resolveTournamentMatch':return this.resolveTournamentMatch({...p,gm});
  case 'saveBinding':return this.upsertBinding({...p,gm});case 'deleteBinding':return this.deleteBinding({...p,gm});case 'triggerBinding':return this.triggerBinding({...p,userId:from,gm});
  case 'sync':return this.summaries(from,gm);default:throw Error('Unknown arcade command');
  }
 }
}
