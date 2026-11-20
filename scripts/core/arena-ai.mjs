/** Arena opponent: scores every legal ability against position, resources, threats and objectives.
 * Difficulty controls lookahead / selection variance; it never bypasses action legality.
 */
import {ARENA_CONFIGS,ARENA_ABILITIES} from './arena-data.mjs';
import {legalArenaActions,arenaAbility,lineOfSight,applyArenaGame} from './arena-engine.mjs';
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const cover=(s,p)=>s.terrain[`${p.x},${p.y}`]==='cover';
const spotlight=(s,p)=>s.terrain[`${p.x},${p.y}`]==='spotlight';
const isCoop=s=>['cooperative','defence','rescue','stealth'].includes(s.kind);
const combat=s=>!['performance','cooperative','stealth','rescue'].includes(s.kind);
export function arenaUtility(s,action,seatId){
 const a=s.fighters[seatId],b=s.fighters[s.seats.find(id=>id!==seatId)],spec=arenaAbility(action.ability),name=action.ability;
 const next={x:action.x??a.x,y:action.y??a.y},distance=dist(a,b),nextDist=dist(next,b);
 let value=0;
 if(['move','dash','evade','blink','vault'].includes(name)){
  const [goal,prefer]=s.kind==='rescue'||s.kind==='stealth'?[s.objective,true]:[b,false];
  const before=dist(a,goal),after=dist(next,goal);
  value=(before-after)*(prefer?8:distance>1?4:0.7)+(cover(s,next)?2.5:0)+(s.kind==='stealth'?before-after>0?4:0:0);
  if(s.kind==='performance'||s.kind==='cooperative'){
   value+=(spotlight(s,next)?9:0)+(spotlight(s,a)?-4:0);
   // Pursue a rival so actual verse/rebuttal actions become possible; reach ally for duets.
   const desired=s.kind==='cooperative'?2:5;
   if(distance>desired&&nextDist<=desired)value+=25;
   if(spotlight(s,next)&&!spotlight(s,a))value+=10;
  }
  if(a.kit==='mage'){
   if(distance>4&&nextDist<=4)value+=26;
   if(distance>4&&nextDist>4)value+=Math.max(0,distance-nextDist)*6;
   if(nextDist>=2&&nextDist<=4)value+=4;
  }
  if(s.kind==='training'){
   value+=(distance-nextDist)*10;
   if(distance>1&&nextDist===1)value+=16;
  }
  if(s.kind==='defence'){
   const alive=s.threats.filter(t=>t.hp>0);
   if(alive.length){const before=Math.min(...alive.map(t=>dist(a,t))),after=Math.min(...alive.map(t=>dist(next,t)));
    const reach=a.kit==='archer'?5:1;
    value+=(before-after)*8+(before>reach&&after<=reach?13:0);
   }
  }
  if(s.kind==='duel'||s.kind==='wrestling'||s.kind==='survival'||s.kind==='training'){
   if(a.kit==='mage'||a.kit==='archer')value+=(nextDist>=2&&nextDist<=4?2.5:0)-(nextDist===1?5:0);
   else value+=(nextDist===1?3:0)-(nextDist>4?1:0);
  }
  if(s.terrain[`${next.x},${next.y}`]==='hazard'||s.terrain[`${next.x},${next.y}`]==='slime')value-=9;
  if(Number.isInteger(s.volleyRow)){if(next.y===s.volleyRow&&s.terrain[`${next.x},${next.y}`]!=='cover')value-=7;if(a.y===s.volleyRow&&next.y!==s.volleyRow)value+=6;}
  if(name==='evade'&&a.hp<a.maxHp*.45)value+=3;
  if(name==='dash'&&before-after<=2)value-=3;
 }
 if(['strike','heavy','riposte','earthshaker','shieldbash','ember','frost','storm','shot','volley','charge','trample','backstab','combo'].includes(name)){
  const threat=s.threats.find(t=>t.x===action.x&&t.y===action.y&&t.hp>0);
  const target=threat||b;const expected=(spec.damage||4)+a.power*.5-(target.guard||0)-(target.evade||0)-(target.protection||0)*.6;
  value=8+Math.max(0,expected)*1.8;
  if(target.hp<=expected)value+=14;
  if(name==='frost'&&target.stamina>3)value+=3;
  if(name==='backstab'&&a.hidden)value+=9;
  if(name==='riposte'&&a.guard)value+=3;
  if(name==='shot'&&a.aim)value+=7;
  if(name==='combo'&&s.kind==='training')value+=20;
  if(name==='storm'&&b.hp<13)value+=7;
  if(spec.magic&&b.counter>0)value-=19;
  if(s.kind==='wrestling'&&name==='strike'&&b.hp<9)value+=3;
  if(s.kind==='defence'&&threat)value+=Math.max(6,threat.power*4)+(threat.hp<=expected?10:0);
  if(s.kind==='performance')value=3;
  if(name==='heavy'&&a.stamina<6)value-=4;
 }
 if(name==='guard'||name==='aegis'||name==='shieldwall'||name==='counterspell'){
  value=3+(a.hp<a.maxHp*.5?5:0)+(a.guard===0?3:0)+(a.stamina<5?2:0);
  if(name==='counterspell'){
   if(a.counter)value-=50;
   if(b.kit==='mage'&&b.focus>=3&&distance<=4&&lineOfSight(s,b,a))value+=6;
   else value-=16;
  }
  if(name==='shieldwall'&&s.kind==='defence')value+=11+(s.gate<12?7:0);
  if(a.guard>6)value-=10;
 }
 if(name==='grapple'||name==='bodylock')value=12+(s.kind==='wrestling'?13:0)+(a.stamina>b.stamina?4:0);
 if(name==='pin')value=80+(a.pins?60:0);
 if(name==='throw')value=22+(b.hp<9?7:0);
 if(name==='break')value=80;
 if(name==='feint'||name==='roar')value=8+(b.guard>0?7:0)+(b.exposed? -4:1);
 if(name==='aim')value=10+(a.aim? -12:0)+(distance>2?5:0);
 if(name==='vanish')value=(s.kind==='stealth'?24:12)+(a.hidden?-28:0)+(s.alert>=4?7:0);
 if(name==='distract')value=s.kind==='stealth'?15+s.alert*3:2;
 if(name==='free'||name==='extract')value=999;
 if(['verse','heckle','harmony','encore','spotlight','argument','rebuttal','evidence'].includes(name)){
  value=(spec.damage||4)*2.1+8;
  if(spotlight(s,a))value+=5;
  if(name==='harmony'&&s.kind==='cooperative'&&dist(a,b)<=2)value+=17;
  if(name==='rebuttal'&&b.exposed)value+=9;
  if(name==='evidence'&&a.focus>=4)value+=3;
  if(name==='heckle'&&b.momentum>1)value+=7;
  if(name==='spotlight'&&spotlight(s,a))value+=1;
  if(name===a.lastPerformance)value-=25;
  if(name==='harmony'&&s.kind==='cooperative'&&dist(a,b)>2)value-=20;
  if(name==='encore'&&a.focus<=5)value-=4;
 }
 if(name==='taunt'){
  value=4+(b.guard>0?7:0)+(s.kind==='performance'?4:0);
  if(['training','defence','rescue','stealth'].includes(s.kind))value=-30;
  if(a.lastAbility==='taunt')value-=9;
 }
 if(name==='recover'||name==='meditate'||name==='refrain')value=2+(a.maxStamina-a.stamina)*1.8+(a.maxFocus-a.focus)*1.3+(a.stamina<=3?13:0)+(a.focus<=3&&a.kit==='mage'?9:0);
 if(s.kind==='stealth'&&name!=='distract'&&name!=='vanish'&&a.hidden===false&&s.alert>=5)value-=7;
 if(s.kind==='rescue'&&name==='move'&&dist(next,s.objective)===1)value+=14;
 if(!Number.isFinite(value))return -1000;
 // AP and resource economy: prefer low-cost moves when similar in value.
 return value-(spec.ap-1)*2-(spec.st||0)*0.25-(spec.fo||0)*0.15;
}
export function chooseArenaNpcAction(s,seatId,rng=Math.random){
 if(s.done||s.seats[s.turn]!==seatId)return null;
 const legal=legalArenaActions(s,seatId);if(!legal.length)return {type:'end'};
 const ranked=legal.map(a=>({a,score:arenaUtility(s,a,seatId)})).sort((x,y)=>y.score-x.score);
 const max=ranked[0].score;
 const acceptable=ranked.filter(x=>x.score>=max-(s.difficulty===3?0:s.difficulty===2?3:9));
 let selected=acceptable[Math.floor(rng()*acceptable.length)]?.a||ranked[0].a;
 if(s.difficulty===3&&ranked.length>1){
  // Small tactical lookahead of the rival's reply. Mutations occur only on a clone.
  const candidates=ranked.slice(0,Math.min(12,ranked.length));let best=selected,bestScore=-Infinity;
  for(const {a,score} of candidates){
   let value=score;try{const future=applyArenaGame(s,seatId,{type:'use',...a},()=>0.5);if(!future.done&&future.seats[future.turn]!==seatId){
    const oppId=future.seats[future.turn],opp=legalArenaActions(future,oppId);const reply=Math.max(0,...opp.map(m=>arenaUtility(future,m,oppId)));value-=Math.min(12,reply*.25);
   }}catch{value=-Infinity;}
   if(value>bestScore){bestScore=value;best=a;}
  }selected=best;
 }
 // NPCs read the current crowd; they use the same delivery input as players.
 const ability=arenaAbility(selected.ability);
 return {type:'use',...selected,...(ability?.effect==='performance'?{delivery:s.crowdPreference}:{})};
}
export function stepArenaNpcs(s,seats,rng=Math.random,maxMoves=12){let next=s;
 for(let i=0;i<maxMoves&&!next.done;i++){
  const seat=seats[next.turn];if(!seat||seat.kind!=='auto-npc')break;
  const action=chooseArenaNpcAction(next,seat.id,rng);if(!action)break;
  next=applyArenaGame(next,seat.id,action,rng);
 }
 return next;
}
