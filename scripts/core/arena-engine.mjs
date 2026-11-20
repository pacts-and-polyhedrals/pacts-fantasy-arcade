/** Pacts Fantasy Arcade: deterministic, system-neutral 2D arena reducer.
 * No Foundry globals or DOM. Session authority must verify actor seat ownership.
 * Rules use turns, two AP, grid distance, line-of-sight, stamina and focus.
 */
import {ARENA_IDS,ARENA_CONFIGS,ARENA_KITS,ARENA_ABILITIES} from './arena-data.mjs';
import {npcLine,announcerLine,introPersona} from './arena-dialogue.mjs';
import {applyArenaProfile} from './arena-adapter.mjs';
const assert=(value,message='Illegal arena action')=>{if(!value)throw Error(message)};
const clone=structuredClone;
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const eq=(a,b)=>a?.x===b?.x&&a?.y===b?.y;
const inBounds=(s,x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<s.width&&y<s.height;
const cell=(x,y)=>`${x},${y}`;
const actor=(s,index=s.turn)=>s.fighters[s.seats[index]];
const other=(s,index=s.turn)=>actor(s,index===0?1:0);
const terrain=(s,x,y)=>s.terrain[cell(x,y)]||'floor';
const blocked=(s,x,y)=>!inBounds(s,x,y)||terrain(s,x,y)==='pillar';
const isAlive=f=>f&&f.hp>0;
const isCoop=s=>['cooperative','defence','rescue','stealth'].includes(s.kind);
const PERFORM=s=>['performance','cooperative'].includes(s.kind)&&['theatre','court'].includes(s.venue);
function character(seat,kit,side,gameId,width,height){
 const k=ARENA_KITS[kit];assert(k,'Invalid arena character kit');
 return {id:seat.id,name:seat.name,kind:seat.kind||'person',kit,side,x:side===0?1:width-2,y:side===0?Math.floor(height/2)-1:Math.floor(height/2)+1,icon:k.icon,hp:k.hp,maxHp:k.hp,stamina:k.stamina,maxStamina:k.stamina,focus:k.focus,maxFocus:k.focus,score:0,guard:0,evade:0,exposed:0,hidden:false,aim:0,slow:0,grappledBy:null,grappling:null,cooldowns:{},lastAbility:null,momentum:0,pins:0,persona:introPersona(gameId,side),power:k.power,protection:k.guard};
}
function buildTerrain(venue,width,height){
 const m={};const put=(x,y,t)=>{if(x>=0&&y>=0&&x<width&&y<height)m[cell(x,y)]=t;};
 if(venue==='pit'||venue==='gauntlet')for(const [x,y] of [[3,1],[5,5]])put(x,y,'pillar');
 if(venue==='arcane')for(const [x,y] of [[3,2],[5,4],[4,1],[4,5]])put(x,y,'pillar');
 if(venue==='ring')for(let x=0;x<width;x++){put(x,0,'edge');put(x,height-1,'edge');}
 if(venue==='theatre'||venue==='court')for(let x=3;x<=5;x++)put(x,Math.floor(height/2),'spotlight');
 if(venue==='fortress')for(let y=1;y<height-1;y++)put(4,y,'cover');
 if(venue==='ranged')for(const [x,y] of [[3,1],[5,5]])put(x,y,'cover');
 if(venue==='slime')for(const [x,y] of [[3,2],[4,3],[5,4]])put(x,y,'slime');
 if(venue==='shadow')for(const [x,y] of [[2,2],[3,4],[5,1],[6,4]])put(x,y,'cover');
 if(venue==='gauntlet')for(const [x,y] of [[2,2],[6,4]])put(x,y,'hazard');
 return m;
}
function addEvent(s,{kind='action',name='',actorId=null,ability=null,text='',from=null,to=null,amount=null,quote=null,impact=null}){
 const event={n:++s.eventSeq,kind,name:String(name).slice(0,70),actorId,ability,text:String(text).slice(0,240),from,to,amount,quote,impact,round:s.round,turn:s.turn};
 s.events.push(event);s.events=s.events.slice(-55);s.lastEvent=event;
 return event;
}
function replayFrame(s){return {turn:s.turn,round:s.round,crowdPreference:s.crowdPreference,ap:s.ap,done:s.done,winner:s.winner,scoreboard:clone(s.scores),fighters:Object.fromEntries(Object.entries(s.fighters).map(([id,f])=>[id,{x:f.x,y:f.y,hp:f.hp,stamina:f.stamina,focus:f.focus,score:f.score,guard:f.guard,hidden:f.hidden,kit:f.kit,pins:f.pins}])),threats:clone(s.threats),gate:s.gate,alert:s.alert,volleyRow:s.volleyRow??null,caption:s.lastEvent?.text||'',event:s.lastEvent&&clone(s.lastEvent)};}
function remember(s){s.timeline.push(replayFrame(s));s.timeline=s.timeline.slice(-120);return s;}
function nextVolley(s){return s.gameId==='arrow-storm'?((s.round*3+1)%(s.height-2))+1:null;}
function newThreats(s){if(s.kind!=='defence')return [];
 const round=s.round;return [0,1].map((n)=>({id:`wave-${round}-${n}`,x:4+(n===0?0:1),y:(round+n*2)%5+1,hp:round>4?9:6,kind:'raider',power:round>4?5:4}));
}
export function initArenaGame(gameId,seats,rng=Math.random,config={}){
 assert(ARENA_IDS.has(gameId),'Unknown arena game');assert(Array.isArray(seats)&&seats.length===2,'An arena table needs exactly two competitors or allies');
 const preset=ARENA_CONFIGS[gameId],width=9,height=7;
 const s={schema:1,gameId,kind:preset.kind,venue:preset.venue,width,height,terrain:buildTerrain(preset.venue,width,height),seats:seats.map(z=>z.id),fighters:{},turn:0,ap:2,round:1,roundLimit:preset.roundLimit,goal:preset.goal||0,crowdPreference:'heroic',done:false,winner:null,success:null,scores:{},eventSeq:0,events:[],lastEvent:null,timeline:[],threats:[],gate:24,alert:0,objective:{x:7,y:1},hazardTick:0,seed:Math.floor(rng()*0x7fffffff),difficulty:clamp(Number(config.difficulty)||2,1,3)};
 seats.forEach((z,i)=>{const requested=z.arenaKit;const compatible=ARENA_KITS[requested]&&((gameId==='fighting-pit-tournament'&&['duelist','bruiser','guardian','wrestler','rogue','rider'].includes(requested))||(gameId==='wizard-duel'&&requested==='mage')||(PERFORM(s)&&['bard','poet','orator'].includes(requested)));const kit=compatible?requested:preset.profile[i];s.fighters[z.id]=character(z,kit,i,gameId,width,height);if(z.arenaPersona)s.fighters[z.id].persona=z.arenaPersona;if(z.arenaProfile)applyArenaProfile(s.fighters[z.id],z.arenaProfile);s.scores[z.id]=0;});
 if(isCoop(s))for(const f of Object.values(s.fighters)){f.x=1;f.y=2+f.side*2;}
 if(gameId==='melee-training-dummy'){const d=other(s,0);d.x=6;d.y=3;}
 if(gameId==='the-gloop')s.objective={x:4,y:1};
 if(gameId==='shadow-heist')s.objective={x:7,y:3};
 s.threats=newThreats(s);s.volleyRow=nextVolley(s);
 addEvent(s,{kind:'start',text:announcerLine('start',1)});remember(s);return s;
}
/** Bresenham line, excluding endpoints, with cover offering defence and pillars blocking shots. */
export function lineOfSight(s,a,b){let x=a.x,y=a.y;const dx=Math.abs(b.x-x),dy=Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1;let err=dx-dy;
 while(x!==b.x||y!==b.y){const twice=2*err;if(twice>-dy){err-=dy;x+=sx;}if(twice<dx){err+=dx;y+=sy;}if(x===b.x&&y===b.y)break;if(blocked(s,x,y))return false;}
 return true;
}
const occupant=(s,x,y)=>Object.values(s.fighters).find(f=>isAlive(f)&&f.x===x&&f.y===y);
function reachable(s,f,max){const start=cell(f.x,f.y),queue=[[f.x,f.y,0]],visited=new Set([start]),out=[];for(let k=0;k<queue.length;k++){
  const [x,y,d]=queue[k];if(d>=max)continue;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=x+dx,ny=y+dy,key=cell(nx,ny);if(visited.has(key)||blocked(s,nx,ny)||occupant(s,nx,ny))continue;
   visited.add(key);queue.push([nx,ny,d+1]);out.push({x:nx,y:ny,d:d+1});
  }
 }return out;
}
function effectiveAbilities(s,f){const base=ARENA_KITS[f.kit].abilities.filter(a=>a!=='harmony'||s.kind==='cooperative');const add=[];
 if(s.kind==='rescue')add.push('free');if(s.kind==='stealth')add.push('extract');
 if(s.kind==='training'&&f.kit!=='dummy')add.push('combo');
 return [...base,...add];
}
const EXTRAS={free:{name:'Free captive',ap:2,range:1,target:'objective',effect:'free',tip:'Release the captive within one square.'},extract:{name:'Extract quietly',ap:2,range:1,target:'objective',effect:'extract',tip:'Escape with the prize before patrol alert maxes out.'},combo:{name:'Training combo',ap:2,st:3,range:1,target:'enemy',effect:'training',damage:9,tip:'A practised three-strike sequence against the training dummy.'}};
export const arenaAbility=id=>ARENA_ABILITIES[id]||EXTRAS[id]||null;
export function legalArenaActions(s,seatId){
 if(s.done||s.paused||s.seats[s.turn]!==seatId||s.ap<=0)return [];
 const f=s.fighters[seatId],enemy=other(s),actions=[];
 for(const ability of effectiveAbilities(s,f)){
  const spec=arenaAbility(ability);if(!spec||spec.ap>s.ap||(spec.st||0)>f.stamina||(spec.fo||0)>f.focus||f.cooldowns[ability]>0)continue;
  if(f.grappledBy&&['move','dash','evade','blink','vault','charge'].includes(ability))continue;
  if(ability==='break'&&!f.grappledBy)continue;
  if(['grapple','bodylock'].includes(ability)&&(f.grappledBy||f.grappling))continue;
  if(ability==='pin'&&f.grappling!==enemy.id)continue;
  if(ability==='throw'&&f.grappling!==enemy.id)continue;
  if(ability==='backstab'&&f.hidden===false&&dist(f,enemy)>1)continue;
  if(spec.target==='self'){actions.push({ability});continue;}
  if(spec.target==='empty'){
   const paths=['teleport'].includes(spec.effect)?Array.from({length:s.width*s.height},(_,i)=>({x:i%s.width,y:Math.floor(i/s.width)})).filter(t=>dist(f,t)<=spec.range&&!blocked(s,t.x,t.y)&&!occupant(s,t.x,t.y)):reachable(s,f,Math.max(1,spec.range-(f.slow||0)));
   for(const p of paths)actions.push({ability,x:p.x,y:p.y});continue;
  }
  if(spec.target==='objective'){
   if(dist(f,s.objective)<=spec.range)actions.push({ability,x:s.objective.x,y:s.objective.y});continue;
  }
  if(spec.target==='enemy'){
   if(isCoop(s)&&spec.effect==='performance'){actions.push({ability});continue;}
   if(isCoop(s)&&s.kind!=='defence')continue;
   if(s.kind==='defence'&&!['damage'].includes(spec.effect))continue;
   const targets=isCoop(s)&&s.kind==='defence'?s.threats.filter(t=>t.hp>0):isAlive(enemy)?[enemy]:[];
   for(const t of targets){if(dist(f,t)>spec.range)continue;
    if((spec.magic||spec.ranged||spec.effect==='performance')&&!lineOfSight(s,f,t))continue;
    actions.push({ability,x:t.x,y:t.y});
   }
   if(s.kind==='training'&&enemy.kit==='dummy'&&spec.effect==='training'&&dist(f,enemy)<=spec.range&&!actions.some(a=>a.ability===ability))actions.push({ability,x:enemy.x,y:enemy.y});
  }
 }
 return actions;
}
function reduceHp(s,target,damage,attacker,ability,magic=false){
 if(magic&&target.counter>0){target.counter=0;target.guard=Math.max(0,target.guard-1);addEvent(s,{kind:'counter',name:target.name,actorId:target.id,ability,text:`${target.name} counters ${attacker.name}'s ${ability}!`,quote:npcLine({persona:target.persona,ability:'counter',actorName:target.name,round:s.round})});return 0;}
 const reduction=Math.min(10,target.guard+target.evade+(terrain(s,target.x,target.y)==='cover'?2:0)+(target.hidden?2:0));const actual=Math.max(0,damage-reduction+(target.exposed?2:0));target.hp=Math.max(0,target.hp-actual);target.guard=Math.max(0,target.guard-2);target.evade=0;target.exposed=0;
 return actual;
}
function checkWin(s){
 const [a,b]=s.seats.map(id=>s.fighters[id]);
 const finish=(win,success,reason)=>{s.done=true;s.winner=win;s.success=success;const victor=Number.isInteger(win)?s.fighters[s.seats[win]]:null;const quote=victor&&['auto-npc','gm-npc'].includes(victor.kind)?npcLine({persona:victor.persona,ability:'victory',actorName:victor.name,round:s.round}):{speaker:'Arena Herald',text:announcerLine(success===false?'loss':'win',s.round)};addEvent(s,{kind:'finish',text:reason,quote});};
 if(s.kind==='training'&&a.score>=s.goal){finish(0,true,`${a.name} completes the training regimen with ${a.score} technique points.`);return;}
 if(s.kind==='rescue'&&s.rescued){finish('draw',true,'The captive is free! The heroes win together.');return;}
 if(s.kind==='stealth'&&s.extracted){finish('draw',true,'The prize is recovered without alerting the entire patrol.');return;}
 if(isCoop(s)&&s.kind==='defence'&&s.gate<=0){finish('draw',false,'The defence falls! The attackers break the line.');return;}
 if(isCoop(s)&&s.kind==='stealth'&&s.alert>=7){finish('draw',false,'The patrol raises the alarm and the heist ends.');return;}
 if(!isCoop(s)&&s.kind==='wrestling'&&(a.pins>=2||b.pins>=2)){const win=a.pins>=2?0:1;finish(win,true,`${s.fighters[s.seats[win]].name} wins by two legal pins!`);return;}
 if(!isCoop(s)&&!PERFORM(s)&&(a.hp<=0||b.hp<=0)){const win=a.hp>b.hp?0:b.hp>a.hp?1:'draw';finish(win,true,win==='draw'?'Double knockout!':`${s.fighters[s.seats[win]].name} wins by knockout!`);return;}
 if(PERFORM(s)&&!isCoop(s)&&(a.score>=s.goal||b.score>=s.goal)){const win=a.score>b.score?0:b.score>a.score?1:'draw';finish(win,true,`${win==='draw'?'Both performers':s.fighters[s.seats[win]].name} win the crowd!`);return;}
 if(s.round>s.roundLimit){
  if(isCoop(s)){
   if(s.kind==='defence')finish('draw',s.gate>0,s.gate>0?'The defenders hold the gate until the final gong!':'The gate has fallen.');
   else if(s.kind==='cooperative')finish('draw',a.score+b.score>=s.goal,`${a.name} and ${b.name} earn ${a.score+b.score} applause points.`);
   else finish('draw',false,'The contest timer expires before the objective is completed.');
  }else{
   const metric=f=>PERFORM(s)?f.score:(f.hp*2+f.score+(f.pins||0)*12);
   const win=metric(a)>metric(b)?0:metric(b)>metric(a)?1:'draw';finish(win,true,win==='draw'?'The judges call a draw.':`${s.fighters[s.seats[win]].name} wins the judges' decision.`);
  }
 }
}
function release(s,f){if(f.grappling){const t=s.fighters[f.grappling];if(t)t.grappledBy=null;f.grappling=null;}if(f.grappledBy){const a=s.fighters[f.grappledBy];if(a)a.grappling=null;f.grappledBy=null;}}
function shiftTarget(s,f,away){const dx=Math.sign(f.x-away.x),dy=Math.sign(f.y-away.y);const possibles=[{x:f.x+dx,y:f.y},{x:f.x,y:f.y+dy},{x:f.x-dy,y:f.y+dx}];for(const p of possibles)if(!blocked(s,p.x,p.y)&&!occupant(s,p.x,p.y)){f.x=p.x;f.y=p.y;return true;}return false;}
function stageHazard(s,f){const t=terrain(s,f.x,f.y);if(t==='slime'){f.stamina=Math.max(0,f.stamina-2);f.exposed=1;}
 if(t==='hazard'){f.hp=Math.max(0,f.hp-3);}
 if(s.kind==='stealth'&&!f.hidden&&t!=='cover'&&t!=='pillar'){s.alert=clamp(s.alert+1,0,7);}
}
function scriptedWave(s){
 const round=s.round,roundType=s.kind;
 if(roundType==='defence'){
  const alive=s.threats.filter(t=>t.hp>0);const guard=Object.values(s.fighters).reduce((n,f)=>n+f.guard,0);
  const incoming=alive.reduce((n,t)=>n+t.power,0);
  const damage=Math.max(0,incoming-Math.floor(guard/2));s.gate=Math.max(0,s.gate-damage);
  for(const f of Object.values(s.fighters)){f.guard=Math.max(0,f.guard-2);}
  addEvent(s,{kind:'hazard',text:`Wave ${round} hits the gate for ${damage} damage. ${s.gate} integrity remains.`,amount:damage});
  if(s.volleyRow!==null&&s.volleyRow!==undefined){for(const f of Object.values(s.fighters))if(f.y===s.volleyRow&&terrain(s,f.x,f.y)!=='cover'){const hit=Math.max(0,5-Math.floor(f.guard/2)-f.evade);f.hp=Math.max(1,f.hp-hit);addEvent(s,{kind:'hazard',text:`An arrow storm rakes row ${s.volleyRow+1}: ${f.name} takes ${hit}.`,actorId:f.id,amount:hit});}}
  s.threats=newThreats(s);s.volleyRow=nextVolley({...s,round:round+1});
 }
 if(roundType==='survival'||s.venue==='gauntlet'){
  const column=(round%3)+2;for(const f of Object.values(s.fighters)){if(f.x===column){const d=Math.min(5,2+Math.floor(round/3));f.hp=Math.max(0,f.hp-d);addEvent(s,{kind:'hazard',text:`A pit trap erupts under ${f.name} for ${d} damage!`,actorId:f.id,amount:d});}}
 }
 if(roundType==='rescue'){
  s.hazardTick++;
  for(const f of Object.values(s.fighters))if(terrain(s,f.x,f.y)==='slime'){f.hp=Math.max(0,f.hp-2);addEvent(s,{kind:'hazard',text:`Slime burns ${f.name} for 2 damage.`});}
 }
 if(roundType==='stealth'){
  s.alert=clamp(s.alert+1,0,7);addEvent(s,{kind:'hazard',text:`The patrol advances. Alert ${s.alert}/7. Seek cover or distract them.`});
 }
}
function beginNextTurn(s){
 const previous=s.turn;s.turn=(s.turn+1)%s.seats.length;
 if(s.turn===0){scriptedWave(s);s.round++;s.crowdPreference=['heroic','comic','heartfelt'][(s.round-1)%3];}
 const f=actor(s);f.stamina=clamp(f.stamina+2,0,f.maxStamina);f.focus=clamp(f.focus+1,0,f.maxFocus);
 f.guard=Math.max(0,f.guard-1);f.exposed=0;f.evade=0;f.counter=0;f.slow=Math.max(0,f.slow-1);
 for(const key of Object.keys(f.cooldowns))f.cooldowns[key]=Math.max(0,f.cooldowns[key]-1);
 s.ap=2;
 if(previous===s.turn&&s.round>s.roundLimit)checkWin(s);
 checkWin(s);
}
export function applyArenaGame(original,seatId,action,rng=Math.random){
 assert(original&&ARENA_IDS.has(original.gameId),'Invalid arena board');assert(!original.done,'Contest is complete');
 assert(original.seats[original.turn]===seatId,'It is not your turn');
 assert(action&&typeof action.type==='string','Malformed arena action');
 const s=clone(original);assert(!s.paused,'The GM has paused the arena');
 const f=s.fighters[seatId],enemy=other(s);
 if(action.type==='end'){s.ap=0;addEvent(s,{kind:'pass',name:f.name,actorId:f.id,text:`${f.name} ends the turn and prepares for the next exchange.`});}
 else{
  assert(action.type==='use'&&typeof action.ability==='string','Choose a legal ability');
  const possible=legalArenaActions(s,seatId);const picked=possible.find(a=>a.ability===action.ability&&(a.x===undefined||(a.x===action.x&&a.y===action.y)));assert(picked,'This ability or destination is not legal now');
  const ability=action.ability,spec=arenaAbility(ability),before={x:f.x,y:f.y};
  const target=spec.target==='enemy'&&Number.isInteger(picked.x)?(s.kind==='defence'?s.threats.find(t=>t.x===picked.x&&t.y===picked.y&&t.hp>0):enemy):null;
  s.ap-=spec.ap;f.stamina=Math.max(0,f.stamina-(spec.st||0));f.focus=Math.max(0,f.focus-(spec.fo||0));
  if(spec.cooldown)f.cooldowns[ability]=spec.cooldown+1;
  f.lastAbility=ability;
  let amount=0,note='',fx=spec.effect;
  if(['move','evade','teleport'].includes(fx)){
   f.x=picked.x;f.y=picked.y;
   if(f.grappling&&dist(f,s.fighters[f.grappling])>1)release(s,f);
   if(fx==='evade')f.evade=3;
   stageHazard(s,f);
   note=`${f.name} ${fx==='teleport'?'blinks':fx==='evade'?'dodges':'moves'} to (${f.x+1},${f.y+1}).`;
  }else if(fx==='damage'||fx==='training'){
   const rolled=Math.floor(rng()*3);let raw=(spec.damage||4)+Math.floor(f.power/2)+rolled+(f.aim||0);
   if(ability==='riposte'&&f.guard>0)raw+=3;
   if(ability==='backstab'&&f.hidden)raw+=4;
   if(target){if(target.id&&s.threats.includes(target)){amount=raw;target.hp=Math.max(0,target.hp-raw);s.scores[f.id]+=raw;f.score+=raw;}else{amount=reduceHp(s,target,raw,f,ability,Boolean(spec.magic));if(s.kind==='training'){f.score+=Math.max(2,amount);s.scores[f.id]=f.score;}else{f.score+=Math.max(0,Math.floor(amount/2));s.scores[f.id]=f.score;}}}
   if(spec.knock&&target?.id&&s.fighters[target.id])shiftTarget(s,target,f);
   if(spec.slow&&target?.id&&s.fighters[target.id])target.slow=Math.max(target.slow,spec.slow+1);
   f.aim=0;f.hidden=false;
   note=`${f.name} uses ${spec.name}${target?.name?` against ${target.name}`:''} for ${amount} damage.`;
  }else if(fx==='guard'){f.guard=Math.min(12,f.guard+(spec.damage||4));f.stamina=Math.min(f.maxStamina,f.stamina+1);note=`${f.name} raises ${spec.name} (${f.guard} defence).`;}
  else if(fx==='counter'){f.counter=1;f.guard=Math.min(12,f.guard+1);note=`${f.name} prepares a spell counter.`;}
  else if(fx==='focus'||fx==='recover'){f.focus=Math.min(f.maxFocus,f.focus+(fx==='focus'?5:2));f.stamina=Math.min(f.maxStamina,f.stamina+3);note=`${f.name} recovers concentration and stamina.`;}
  else if(fx==='aim'){f.aim=3;note=`${f.name} takes careful aim.`;}
  else if(fx==='expose'){if(target){target.exposed=1;target.guard=Math.max(0,target.guard-2);}f.momentum++;note=`${f.name} unbalances ${target?.name||'the opposition'} with ${spec.name}.`;}
  else if(fx==='grapple'){
   if(target?.id){if(target.grappledBy===null&&f.grappling===null){const resistance=target.stamina+(target.protection||0),attack=f.stamina+f.power*2+Math.floor(rng()*5);if(attack>=resistance-5){f.grappling=target.id;target.grappledBy=f.id;note=`${f.name} locks ${target.name} in a grapple.`;}else note=`${target.name} breaks ${f.name}'s grapple attempt.`;}else note=`${f.name} cannot establish another hold.`;}
  }else if(fx==='break'){
   const holder=s.fighters[f.grappledBy];const chance=f.stamina+f.power*2+Math.floor(rng()*7),defence=(holder?.stamina||0)+(holder?.power||2)*2;
   // Escaping a secure hold needs a good leverage check; an even match is not an automatic escape.
   if(chance>=defence+3){release(s,f);note=`${f.name} escapes the hold!`;}else note=`${f.name} struggles but remains grappled.`;
  }else if(fx==='pin'){
   const t=s.fighters[f.grappling];const roll=f.stamina+f.power*2+Math.floor(rng()*6),res=t.stamina+(t.protection||0)*2;
   if(roll>=res-3){f.pins++;f.score+=12;s.scores[f.id]=f.score;note=`${f.name} scores a legal pin against ${t.name}! (${f.pins}/2)`;release(s,f);}else{t.exposed=1;note=`${t.name} narrowly fights off ${f.name}'s pin attempt.`;}
  }else if(fx==='throw'){
   if(target){release(s,f);amount=Math.max(2,6+Math.floor(rng()*3)-target.protection);target.hp=Math.max(0,target.hp-amount);shiftTarget(s,target,f);f.score+=4;s.scores[f.id]=f.score;note=`${f.name} throws ${target.name} for ${amount} damage!`;}
  }else if(fx==='performance'){
   const position=terrain(s,f.x,f.y)==='spotlight'?3:0;const empathy=(f.momentum>=2?2:0);const comeback=(ability==='rebuttal'&&['verse','argument','heckle','evidence','encore'].includes(target?.lastAbility)?5:0);
   const delivery=['heroic','comic','heartfelt'].includes(action.delivery)?action.delivery:'heroic';
   const style=(delivery===s.crowdPreference?3:-1)+(f.lastPerformance===ability?-3:0);
   const points=Math.max(1,spec.damage+position+empathy+comeback+style+Math.floor(rng()*3));
   f.score+=points;s.scores[f.id]=f.score;f.momentum=Math.min(4,f.momentum+1);amount=points;f.lastPerformance=ability;
   if(target&&s.kind==='performance'){target.momentum=Math.max(0,target.momentum-1);target.exposed=1;}
   if(s.kind==='cooperative'){const ally=other(s);if(ability==='harmony'&&dist(f,ally)<=2){f.score+=4;s.scores[f.id]=f.score;amount+=4;}}
   note=`${f.name} performs ${spec.name} with a ${delivery} delivery, earning ${amount} audience favour!`;
  }else if(fx==='hidden'){f.hidden=true;s.alert=Math.max(0,s.alert-1);note=`${f.name} vanishes into the shadows.`;}
  else if(fx==='distract'){s.alert=Math.max(0,s.alert-3);note=`${f.name} distracts the patrol (alert ${s.alert}/7).`;}
  else if(fx==='taunt'){if(target){target.exposed=1;target.momentum=Math.max(0,target.momentum-1);}const favour=PERFORM(s)?2:0;f.score+=favour;s.scores[f.id]=f.score;note=`${f.name} taunts ${target?.name||'the crowd'}${favour?' and earns two audience points':''}.`;}
  else if(fx==='free'){s.rescued=true;f.score+=20;s.scores[f.id]=f.score;note=`${f.name} frees the captive and escapes the slime!`;}
  else if(fx==='extract'){if(s.alert<=6){s.extracted=true;f.score+=20;s.scores[f.id]=f.score;note=`${f.name} retrieves the prize and reaches the escape route!`;}}
  else throw Error('Unsupported arena action effect');
  const quote=['auto-npc','gm-npc'].includes(f.kind)?npcLine({persona:f.persona,ability,actorName:f.name,opponentName:enemy.name,health:f.hp,round:s.round}):{speaker:'Arena Herald',text:announcerLine(fx==='performance'?'performance':spec.magic?'magic':fx==='grapple'?'grapple':fx==='guard'?'blocked':'strike',s.round)};
  addEvent(s,{kind:fx,actorId:f.id,name:f.name,ability,text:note,from:before,to:{x:f.x,y:f.y},amount,quote,impact:Number.isInteger(picked.x)?{x:picked.x,y:picked.y}:null});
 }
 checkWin(s);if(!s.done&&s.ap<=0)beginNextTurn(s);
 remember(s);return s;
}
export function projectArenaGame(s){const p=clone(s);p.timeline=(p.timeline||[]).slice(-80);return p;}
export function arenaOutcome(s){if(!s.done)return null;return {winner:s.winner,success:s.success,scores:clone(s.scores),rounds:s.round,method:s.lastEvent?.text||'Judges decision'};}
export function arenaMatrix(s){return Array.from({length:s.height},(_,y)=>Array.from({length:s.width},(_,x)=>({x,y,terrain:terrain(s,x,y),actor:occupant(s,x,y)?.id||null,threat:s.threats?.find(t=>t.x===x&&t.y===y&&t.hp>0)||null,objective:eq(s.objective,{x,y}),volley:s.volleyRow===y})));}
