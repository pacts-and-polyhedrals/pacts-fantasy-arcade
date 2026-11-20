/** Stage-2 rules. Pure JS: no Foundry globals, DOM, network calls or system dependencies. */
import {EXPANSION_SINGLE,EXPANSION_SHARED,STORY_SCENES,TUMBLER_RUNES,BONE_SYMBOLS,FEAST_INGREDIENTS,DANCE_MOVES} from './expansion-data.mjs';
const copy=x=>structuredClone(x);
const check=(condition,msg='That move is not legal')=>{if(!condition)throw Error(msg);};
const nval=(value,min,max)=>{const v=Number(value);check(Number.isFinite(v)&&Number.isInteger(v)&&v>=min&&v<=max,'Invalid choice');return v;};
const rdie=(sides,rng)=>Math.floor(rng()*sides)+1;
const shuffle=(a,rng)=>{let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b;};
const newCards=rng=>shuffle(Array.from({length:52},(_,id)=>({id,rank:id%13+1,suit:['♠','♣','♦','♥'][Math.floor(id/13)]})),rng);
const nextRound=(s,n=1)=>{s.round+=n;if(s.round>=s.rounds){s.done=true;s.phase='finished'}};
const log=(s,msg)=>{s.last=msg;s.log.push(msg);s.log=s.log.slice(-16)};
function newFood(rng){return {ingredient:FEAST_INGREDIENTS[Math.floor(rng()*FEAST_INGREDIENTS.length)],heat:Math.floor(rng()*65)+18};}
export function solitaireExposed(s,index){
 if(index<0||index>27||s.pyramid[index]?.removed)return false;
 const row=Math.floor((Math.sqrt(8*index+1)-1)/2),col=index-row*(row+1)/2;
 if(row===6)return true;
 const start=(row+1)*(row+2)/2;
 return Boolean(s.pyramid[start+col]?.removed&&s.pyramid[start+col+1]?.removed);
}
const exposed=(s,loc,index)=>loc==='waste'?Boolean(s.waste.length):loc==='pyramid'&&solitaireExposed(s,index);
const accessible=(s)=>s.pyramid.some((x,i)=>!x.removed&&solitaireExposed(s,i))||s.stock.length>0||s.waste.length>0;
const gameOver=(s)=>s.pyramid.every(x=>x.removed);
export function initExtraSeat(gameId,rng,config={}){
 check(EXPANSION_SINGLE.has(gameId),'Not a stage-two solo game');
 const s={gameId,round:0,rounds:5,score:0,done:false,phase:'ready',log:[],last:''};
 switch(gameId){
 case 'giant-s-grip':s.rounds=4;s.pending=0;s.tension=0;break;
 case 'moonlit-solitaire':{let cards=newCards(rng);s.pyramid=cards.splice(0,28).map(c=>({...c,removed:false}));s.stock=cards;s.waste=[];s.selected=null;s.rounds=1;s.phase='play';s.moves=0;break;}
 case 'wobblin-goblin-drinking-contest':s.balance=0;s.spills=0;break;
 case 'giant-s-skittles':s.rounds=3;s.pins=Array(9).fill(true);s.frameThrow=0;s.lastKnocked=[];break;
 case 'goblin-tankard-toss':s.throws=[];break;
 case 'fizzlenub-s-feast':Object.assign(s,{order:newFood(rng)});break;
 case 'tinker-s-lock-race':s.code=shuffle(TUMBLER_RUNES.map((_,i)=>i),rng).slice(0,4);s.guess=[0,0,0,0];s.attempts=0;s.rounds=6;s.feedback={exact:0,misplaced:0};break;
 case 'ispin-s-impossible-tale':{const entries=config.storyScenes?.length>=4?config.storyScenes:STORY_SCENES;s.scenes=shuffle(entries,rng).slice(0,5).map(e=>copy(e));s.rounds=s.scenes.length;s.history=[];break;}
 case 'goblin-breakdancing-corporation':s.rounds=3;s.sequence=Array.from({length:4},()=>Math.floor(rng()*4));s.chosen=[];s.phase='watch';break;
 case 'barrel-bash':s.lanes=shuffle([0.12,0.25,0.43],rng);break;
 case 'cauldron-craps':s.phase='comeout';s.point=null;s.dice=[];break;
 case 'witches-triad':s.rounds=6;break;
 }
 return s;
}
export function applyExtraSeat(old,a,rng){
 const s=copy(old);check(!s.done,'Challenge is complete');check(typeof a?.type==='string','Missing action');
 switch(s.gameId){
 case 'giant-s-grip':{
  if(a.type==='bank'){check(s.pending>0,'Pull first');s.score+=s.pending;log(s,`Secured ${s.pending} rope points.`);s.pending=0;s.tension=0;nextRound(s);break;}
  check(a.type==='haul');const roll=rdie(6,rng),target=2+Math.min(3,s.tension);
  if(roll>=target){s.pending+=2+s.tension;s.tension++;log(s,`Giant's chain holds! d6 ${roll} ≥ ${target}. Haul at risk: ${s.pending}.`);}else{log(s,`Chain slips! d6 ${roll} < ${target}; lost ${s.pending} unbanked points.`);s.pending=0;s.tension=0;nextRound(s);}break;
 }
 case 'moonlit-solitaire':{
  check(s.moves<160,'Too many moves');s.moves++;
  if(a.type==='finish'){log(s,`The moon sets. ${s.score} cards cleared.`);s.done=true;s.phase='finished';break;}
  if(a.type==='draw'){check(s.stock.length>0,'The stock is empty');s.waste.push(s.stock.shift());s.selected=null;log(s,`Drew card ${s.waste.at(-1).rank}.`);break;}
  check(a.type==='select','Choose a visible card');const loc=a.area,index=loc==='waste'?0:nval(a.index,0,27);
  check(exposed(s,loc,index),'Only uncovered pyramid cards and the top waste card may be chosen');
  const chosen=loc==='waste'?s.waste.at(-1):s.pyramid[index];
  const remove=(p)=>{if(p.area==='waste')s.waste.pop();else s.pyramid[p.index].removed=true;};
  const here={area:loc,index};
  if(chosen.rank===13){remove(here);s.score++;s.selected=null;log(s,'King removed alone (+1).');}
  else if(!s.selected){s.selected=here;log(s,`Selected ${chosen.rank}; find a matching card totalling 13.`);}
  else {
   const prev=s.selected;s.selected=null;
   if(prev.area===here.area&&prev.index===here.index){log(s,'Selection cleared.');break;}
   check(exposed(s,prev.area,prev.index),'First card is no longer exposed');
   const oldCard=prev.area==='waste'?s.waste.at(-1):s.pyramid[prev.index];
   if(oldCard.rank+chosen.rank===13){remove(prev);remove(here);s.score+=2;log(s,`${oldCard.rank} + ${chosen.rank} = 13. Pair removed (+2).`);}
   else log(s,`${oldCard.rank} + ${chosen.rank} is not 13. Try another pair.`);
  }
  if(gameOver(s)){s.round=1;s.done=true;s.phase='finished';log(s,'Pyramid cleared — royal moonlight victory!');}
  else if(s.moves>=160){s.done=true;s.phase='finished';log(s,'The moon sets after 160 actions.');}
  break;
 }
 case 'wobblin-goblin-drinking-contest':{
  check(a.type==='taste'&&['sip','sample','gulp','pause'].includes(a.choice));
  const v={sip:[2,1],sample:[4,3],gulp:[7,5],pause:[0,-4]}[a.choice];s.balance=Math.max(0,s.balance+v[1]);
  if(s.balance>=9){s.spills++;s.balance=4;s.score=Math.max(0,s.score-2);log(s,'The goblin tumbles theatrically. -2 points for a spilled tasting.');}
  else{s.score+=v[0];log(s,`${a.choice}: +${v[0]} tasting points, balance ${s.balance}/9.`);}nextRound(s);break;
 }
 case 'giant-s-skittles':{
  check(a.type==='bowl');const aim=nval(a.aim,0,100),power=nval(a.power,20,100);
  const center=aim+(rng()-.5)*(8+power*.2),range=7+power*.16;
  const positions=[50,40,60,30,50,70,20,50,80];
  const knocked=[];for(let i=0;i<9;i++)if(s.pins[i]&&Math.abs(positions[i]-center)<range*(i>=6?.85:1)){s.pins[i]=false;knocked.push(i);}
  const cleared=s.pins.every(x=>!x),bonus=cleared?(s.frameThrow===0?3:1):0;
  s.lastKnocked=knocked;s.score+=knocked.length+bonus;s.frameThrow++;
  log(s,`Stone ball hits ${knocked.length} skittles${bonus===3?' — a giant-felling strike! +3 bonus':bonus===1?' — spare! +1 bonus':''}. Frame ${s.round+1}, throw ${s.frameThrow}.`);
  if(s.frameThrow>=2||s.pins.every(x=>!x)){s.frameThrow=0;nextRound(s);s.pins=Array(9).fill(true);}break;
 }
 case 'goblin-tankard-toss':{
  check(a.type==='toss');const power=nval(a.power,20,100),angle=nval(a.angle,10,80),travel=power*.5*Math.sin(angle*Math.PI/90)+(rng()-.5)*6;
  const targets=[16,28,41],dists=targets.map(t=>Math.abs(t-travel)),distance=Math.min(...dists),barrel=dists.indexOf(distance);
  const points=distance<3?[3,4,5][barrel]:distance<6?2:distance<10?1:0;s.score+=points;s.throws.push({angle,power,travel:Math.round(travel*10)/10,points});
  log(s,`Tankard lands ${travel.toFixed(1)} paces away, earning ${points} points.`);nextRound(s);break;
 }
 case 'fizzlenub-s-feast':{
  check(a.type==='serve');const choice=FEAST_INGREDIENTS[nval(a.ingredient,0,3)],heat=nval(a.heat,0,100);
  const difference=Math.abs(heat-s.order.heat);const ingredientScore=choice===s.order.ingredient?6:0;const heatScore=difference<=10?4:difference<=20?2:0;
  s.score+=ingredientScore+heatScore;log(s,`Dish served! Ingredient ${ingredientScore}/6, cooking ${heatScore}/4.`);nextRound(s);if(!s.done)s.order=newFood(rng);break;
 }
 case 'tinker-s-lock-race':{
  if(a.type==='turn'){let i=nval(a.index,0,3);s.guess[i]=(s.guess[i]+1)%TUMBLER_RUNES.length;break;}
  check(a.type==='test');s.attempts++;let exact=0,misplaced=0;const missesA=[],missesB=[];
  for(let i=0;i<4;i++)if(s.guess[i]===s.code[i])exact++;else{missesA.push(s.guess[i]);missesB.push(s.code[i]);}
  for(const digit of missesA){let ix=missesB.indexOf(digit);if(ix>=0){misplaced++;missesB.splice(ix,1);}}
  s.feedback={exact,misplaced};s.history=[...(s.history||[]),{guess:[...s.guess],exact,misplaced}].slice(-6);
  if(exact===4){s.score=12-(s.attempts-1)*2;s.done=true;s.phase='finished';log(s,`The lock opens in ${s.attempts} tests!`);}
  else{log(s,`${exact} exact pins and ${misplaced} correct-but-misplaced runes.`);if(s.attempts>=6){s.done=true;s.phase='finished';log(s,'The lock jams after six tests.');}}
  break;
 }
 case 'ispin-s-impossible-tale':{
  check(a.type==='choose');const ix=nval(a.index,0,2),scene=s.scenes[s.round],success=ix===scene.correct;
  s.score+=success?3:1;s.history.push({choice:scene.choices[ix],success});log(s,`${scene.choices[ix]} — ${success?'The crowd roars!':'The crowd listens politely.'}`);nextRound(s);break;
 }
 case 'goblin-breakdancing-corporation':{
  if(a.type==='watch'){s.phase='dance';break;}
  if(a.type==='undo'){s.chosen.pop();break;}
  if(a.type==='step'){check(s.phase==='dance'&&s.chosen.length<4,'Watch the routine first');s.chosen.push(nval(a.index,0,3));break;}
  check(a.type==='submit'&&s.chosen.length===4,'Choose four dance moves');const matches=s.chosen.filter((v,i)=>v===s.sequence[i]).length;s.score+=2*matches+(matches===4?4:0);log(s,`${matches}/4 dance moves matched!`);nextRound(s);
  if(!s.done){s.chosen=[];s.sequence=Array.from({length:4},()=>Math.floor(rng()*4));s.phase='watch';}break;
 }
 case 'barrel-bash':{
  check(a.type==='choose');const lane=nval(a.index,0,2),risk=s.lanes[lane],success=rng()>=risk,points=success?({0.12:2,0.25:3,0.43:4}[risk]??2):0;
  s.score+=points;log(s,`Lane ${lane+1}: ${success?`safely through! +${points}`:'the barrel smashes against the obstacle!'}`);nextRound(s);if(!s.done)s.lanes=shuffle([.12,.25,.43],rng);break;
 }
 case 'cauldron-craps':{
  check(a.type==='roll');const ds=[rdie(6,rng),rdie(6,rng)];s.dice=ds;const total=ds[0]+ds[1];
  const settle=()=>{s.phase='comeout';s.point=null;nextRound(s);if(s.done)s.phase='finished';};
  if(s.phase==='comeout'){
   if([7,11].includes(total)){s.score+=3;log(s,`Opening ${total}: natural! +3.`);settle();}
   else if([2,3,12].includes(total)){log(s,`Opening ${total}: the cauldron boils over — round lost.`);settle();}
   else{s.point=total;s.phase='point';log(s,`The point is ${total}. Roll it again before a seven.`);}
  }else{
   if(total===s.point){s.score+=3;log(s,`Point ${total} made! +3.`);settle();}
   else if(total===7){log(s,`Seven out! The point of ${s.point} is lost.`);settle();}
   else log(s,`Rolled ${total}; the point remains ${s.point}.`);
  }
  break;
 }
 case 'witches-triad':{
  check(a.type==='invoke');const face=nval(a.face,1,6),ds=[rdie(6,rng),rdie(6,rng),rdie(6,rng)],n=ds.filter(x=>x===face).length;
  const bonus=ds.every(x=>x===ds[0])?4:0,points=n*2+bonus;s.dice=ds;s.score+=points;log(s,`${ds.join(' · ')}: ${n} runes of ${face}, +${points} points.`);nextRound(s);break;
 }
 default:throw Error('Unimplemented Stage-2 engine');
 }
 return s;
}
export function projectExtraSeat(s){const v=copy(s);if(s.gameId==='moonlit-solitaire'){delete v.stock;v.stockCount=s.stock.length;}if(s.gameId==='tinker-s-lock-race')delete v.code;if(s.gameId==='fizzlenub-s-feast')v.order={ingredient:s.order.ingredient,heatBand:s.order.heat<39?'low':s.order.heat<63?'medium':'high'};if(s.gameId==='ispin-s-impossible-tale')v.scenes=v.scenes.map(({correct,...visible})=>visible);if(s.gameId==='goblin-breakdancing-corporation'&&s.phase!=='watch')v.sequence=null;if(s.gameId==='tinker-s-lock-race'){delete v.npcPlan;delete v.npcPlanAt;}return v;}
function lockScore(guess,code){let exact=0,misplaced=0;const a=[],b=[];for(let i=0;i<4;i++)if(guess[i]===code[i])exact++;else{a.push(guess[i]);b.push(code[i]);}for(const d of a){const ix=b.indexOf(d);if(ix>=0){misplaced++;b.splice(ix,1);}}return {exact,misplaced};}
/** NPC lock-picker: only uses the public feedback history (never the hidden code). */
function lockCandidate(s,rng){
 if(s.npcPlan&&s.npcPlanAt===(s.history||[]).length)return s.npcPlan;
 const n=TUMBLER_RUNES.length,all=[];for(let a=0;a<n;a++)for(let b=0;b<n;b++)for(let c=0;c<n;c++)for(let d=0;d<n;d++){const g=[a,b,c,d];if(new Set(g).size===4)all.push(g);}
 const ok=all.filter(g=>(s.history||[]).every(h=>{const f=lockScore(h.guess,g);return f.exact===h.exact&&f.misplaced===h.misplaced;}));
 const pick=(ok.length?ok:all)[Math.floor(rng()*(ok.length||all.length))];s.npcPlan=pick;s.npcPlanAt=(s.history||[]).length;return pick;
}
export function chooseExtraAction(s,rng){if(s.done)return null;
 switch(s.gameId){
 case 'giant-s-grip':return s.pending>=6||s.tension>=2?{type:'bank'}:{type:'haul'};
 case 'moonlit-solitaire':{
  const ex=s.pyramid.map((c,i)=>({c,i})).filter(({i})=>solitaireExposed(s,i));const w=s.waste.at(-1),vis=[...ex.map(({c,i})=>({area:'pyramid',index:i,rank:c.rank})),...(w?[{area:'waste',index:0,rank:w.rank}]:[])];
  const king=vis.find(x=>x.rank===13);if(king)return {type:'select',...king};
  for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++)if(vis[i].rank+vis[j].rank===13){if(!s.selected)return {type:'select',...vis[i]};if(s.selected.area===vis[i].area&&s.selected.index===vis[i].index)return {type:'select',...vis[j]};}
  return s.stock.length?{type:'draw'}:{type:'finish'};
 }
 case 'wobblin-goblin-drinking-contest':return {type:'taste',choice:s.balance>=6?'pause':s.balance<3?'gulp':'sample'};
 case 'giant-s-skittles':return {type:'bowl',aim:50,power:76};
 case 'goblin-tankard-toss':return {type:'toss',angle:44,power:65};
 case 'fizzlenub-s-feast':return {type:'serve',ingredient:Math.max(0,FEAST_INGREDIENTS.indexOf(s.order.ingredient)),heat:Math.max(0,Math.min(100,Math.round(s.order.heat+(rng()-.5)*25)))};
 case 'tinker-s-lock-race':{const target=lockCandidate(s,rng);const wrong=s.guess.findIndex((x,i)=>x!==target[i]);return wrong>=0?{type:'turn',index:wrong}:{type:'test'};}
 case 'ispin-s-impossible-tale':return {type:'choose',index:rdie(3,rng)-1};
 case 'goblin-breakdancing-corporation':return s.phase==='watch'?{type:'watch'}:s.chosen.length<4?{type:'step',index:rng()<.75?s.sequence[s.chosen.length]:rdie(4,rng)-1}:{type:'submit'};
 case 'barrel-bash':{const order=[0,1,2].sort((x,y)=>s.lanes[x]-s.lanes[y]);return {type:'choose',index:order[Math.floor(rng()*3)]};}
 case 'cauldron-craps':return {type:'roll'};
 case 'witches-triad':return {type:'invoke',face:rdie(6,rng)};
 default:return null;
 }
}
/** Multi-seat shared game state. Public projections must not reveal unplayed cards/dice. */
const makeDominoes=()=>{let arr=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)arr.push({a,b,id:`${a}-${b}`});return arr;};
const modulo=(v,n)=>((v%n)+n)%n;
const nextAlive=(state,after)=>{for(let k=1;k<=state.seats.length;k++){const ix=(after+k)%state.seats.length;if(!state.eliminated?.includes(state.seats[ix]))return ix;}return after;};
function dominoAllowed(s,tile,side){if(!s.chain.length)return true;return side==='left'?(tile.a===s.chain[0].a||tile.b===s.chain[0].a):(tile.a===s.chain.at(-1).b||tile.b===s.chain.at(-1).b);}
function dominoFinish(s){
 const pips=s.seats.map(id=>s.hands[id].reduce((sum,t)=>sum+t.a+t.b,0));const min=Math.min(...pips);s.winner=pips.filter(x=>x===min).length>1?'draw':pips.indexOf(min);s.done=true;s.phase='finished';s.log.push(`Blocked chain. Fewest pips: ${min}.`);
}
export function initSharedGame(gameId,seats,rng){
 check(EXPANSION_SHARED.has(gameId),'Not a shared game');check(seats.length>=2&&seats.length<= (gameId==='goblin-s-bones'?4:gameId==='dwarven-dominoes'?4:6),'Need 2–6 seats for this game');
 const s={gameId,seats:seats.map(x=>x.id),turn:0,done:false,winner:null,phase:'play',round:0,log:[]};
 if(gameId==='goblin-s-bones'){s.tiles=shuffle([...BONE_SYMBOLS,...BONE_SYMBOLS],rng);s.matched=[];s.open=[];s.seen={};s.points=Object.fromEntries(s.seats.map(id=>[id,0]));}
 if(gameId==='dwarven-dominoes'){let deck=shuffle(makeDominoes(),rng);const size=seats.length<=2?7:5;s.hands=Object.fromEntries(s.seats.map(id=>[id,deck.splice(0,size)]));s.stock=deck;s.chain=[];s.passes=0;}
 if(gameId==='goblin-s-bluff'){s.counts=Object.fromEntries(s.seats.map(id=>[id,5]));s.hands=Object.fromEntries(s.seats.map(id=>[id,Array.from({length:5},()=>rdie(6,rng))]));s.eliminated=[];s.bid=null;s.lastBidder=null;s.phase='bid';s.maxRounds=18;s.reveal=null;s.points={};}
 return s;
}
export function sharedLegalActions(s,seatId){
 if(s.gameId==='dwarven-dominoes'){const hand=s.hands[seatId];return hand.flatMap((tile,index)=>['left','right'].filter(side=>dominoAllowed(s,tile,side)).map(side=>({type:'place',index,side})));}
 if(s.gameId==='goblin-s-bones')return Array.from({length:16},(_,index)=>index).filter(index=>!s.matched.includes(index)&&!s.open.includes(index)).map(index=>({type:'flip',index}));
 return [];
}
export function applySharedGame(old,seatId,action,rng){
 const s=copy(old);check(!s.done,'The match has ended');const seatIndex=s.seats.indexOf(seatId);check(seatIndex>=0,'Not a participant');
 const a=action?.type;check(s.turn===seatIndex||(a==='next'&&s.phase==='reveal'),'Wait for your turn');
 if(s.gameId==='goblin-s-bones'){
  if(a==='next'){check(s.phase==='reveal','No mismatched pair to hide');s.open=[];s.phase='play';s.turn=(s.turn+1)%s.seats.length;return s;}
  check(a==='flip'&&s.phase==='play'&&s.open.length<2,'Select a concealed bone');let ix=nval(action.index,0,15);check(!s.matched.includes(ix)&&!s.open.includes(ix),'Bone already face up');
  s.open.push(ix);s.seen[ix]=s.tiles[ix];if(s.open.length===2){
   if(s.tiles[s.open[0]]===s.tiles[s.open[1]]){s.matched.push(...s.open);s.points[seatId]++;s.log.push(`${seatId} found a matching pair!`);s.open=[];
    if(s.matched.length===16){s.done=true;const scores=s.seats.map(id=>s.points[id]),best=Math.max(...scores);s.winner=scores.filter(x=>x===best).length>1?'draw':scores.indexOf(best);s.phase='finished';}}
   else{s.phase='reveal';s.log.push(`${seatId} revealed two different bones.`);}
  }
 }else if(s.gameId==='dwarven-dominoes'){
  const legal=sharedLegalActions(s,seatId);
  if(a==='place'){
   const ix=nval(action.index,0,s.hands[seatId].length-1);const side=action.side;
   check(legal.some(m=>m.index===ix&&m.side===side),'This tile does not match the chain');
   const [tile]=s.hands[seatId].splice(ix,1);let placed={...tile};
   if(s.chain.length){if(side==='left'){if(tile.a===s.chain[0].a)placed={...tile,a:tile.b,b:tile.a};s.chain.unshift(placed);}else{if(tile.b===s.chain.at(-1).b)placed={...tile,a:tile.b,b:tile.a};s.chain.push(placed);}}
   else s.chain.push(placed);
   s.passes=0;s.log.push(`${seatId} placed ${tile.a}:${tile.b} at the ${side} end.`);
   if(!s.hands[seatId].length){s.done=true;s.winner=seatIndex;s.phase='finished';}
   else s.turn=(s.turn+1)%s.seats.length;
  }else if(a==='draw'){
   check(!legal.length&&s.stock.length,'Draw only if no legal dominoes and the stock is not empty');s.hands[seatId].push(s.stock.shift());s.passes=0;s.log.push(`${seatId} drew a tile.`);
  }else if(a==='pass'){
   check(!legal.length&&!s.stock.length,'You must play a tile or draw first');s.passes++;s.log.push(`${seatId} passed.`);
   if(s.passes>=s.seats.length)dominoFinish(s);else s.turn=(s.turn+1)%s.seats.length;
  }else throw Error('Unknown domino action');
 }else if(s.gameId==='goblin-s-bluff'){
  if(a==='next'){
   check(s.phase==='reveal','Finish the previous challenge first');
   s.round++;
   if(s.eliminated.length>=s.seats.length-1||s.round>=s.maxRounds){s.done=true;s.phase='finished';const max=Math.max(...s.seats.map(id=>s.counts[id]));s.winner=s.seats.filter(id=>s.counts[id]===max).length>1?'draw':s.seats.findIndex(id=>s.counts[id]===max);return s;}
   s.phase='bid';s.reveal=null;s.bid=null;s.lastBidder=null;
   s.hands=Object.fromEntries(s.seats.map(id=>[id,Array.from({length:s.counts[id]},()=>rdie(6,rng))]));return s;
  }
  check(s.phase==='bid','Reveal the challenge before continuing');
  if(a==='bid'){
   const qty=nval(action.quantity,1,30),face=nval(action.face,1,6),limit=Object.values(s.counts).reduce((x,y)=>x+y,0);check(qty<=limit,'Bid exceeds the total dice remaining');
   check(!s.bid||qty>s.bid.quantity||(qty===s.bid.quantity&&face>s.bid.face),'Raise the bid or challenge it');
   s.bid={quantity:qty,face};s.lastBidder=seatIndex;s.turn=nextAlive(s,seatIndex);s.log.push(`${seatId} bids ${qty} dice showing ${face}.`);
  }else if(a==='challenge'){
   check(s.bid&&s.lastBidder!==seatIndex,'There is no opposing bid to challenge');
   const count=Object.values(s.hands).flat().filter(n=>n===s.bid.face).length;
   const bidderWon=count>=s.bid.quantity,loser=bidderWon?seatIndex:s.lastBidder;
   const loserId=s.seats[loser];s.counts[loserId]--;if(s.counts[loserId]===0)s.eliminated.push(loserId);
   s.reveal={count,bid:s.bid,bidderWon,loser:loserId};s.phase='reveal';s.turn=s.counts[loserId]>0?loser:nextAlive(s,loser);
   s.log.push(`${seatId} challenged: ${count} dice showed ${s.bid.face}. ${loserId} loses a die.`);
  }else throw Error('Unknown bluff action');
 }
 s.log=s.log.slice(-24);return s;
}
export function projectSharedGame(s,viewerSeatIds=[],gm=false){
 const v=copy(s);const viewerIds=new Set(Array.isArray(viewerSeatIds)?viewerSeatIds:[viewerSeatIds]);
 if(s.gameId==='goblin-s-bones')v.tiles=s.tiles.map((sym,ix)=>s.matched.includes(ix)||s.open.includes(ix)?sym:null);
 if(s.gameId==='dwarven-dominoes'){v.stockCount=s.stock.length;delete v.stock;v.handCounts=Object.fromEntries(s.seats.map(id=>[id,s.hands[id].length]));v.hands=Object.fromEntries(s.seats.map(id=>[id,viewerIds.has(id)?s.hands[id]:Array(s.hands[id].length).fill(null)]));}
 if(s.gameId==='goblin-s-bluff'){
   v.hands=Object.fromEntries(s.seats.map(id=>[id,(s.phase==='reveal'||s.done||viewerIds.has(id))?s.hands[id]:Array(s.hands[id].length).fill(null)]));
 }
 return v;
}
export function chooseSharedAction(s,seatId,rng){if(s.done)return null;
 if(s.gameId==='goblin-s-bones'){
  if(s.phase==='reveal')return {type:'next'};
  const legal=sharedLegalActions(s,seatId),known=new Map();
  for(const move of legal){const symbol=s.seen[move.index];if(symbol){const a=known.get(symbol)||[];a.push(move.index);known.set(symbol,a);}}
  if(s.open.length===1){const symbol=s.tiles[s.open[0]],partner=legal.find(move=>s.seen[move.index]===symbol);const fresh=legal.filter(move=>!Object.hasOwn(s.seen,move.index));return {type:'flip',index:partner?.index??(fresh.length?fresh[Math.floor(rng()*fresh.length)].index:legal[Math.floor(rng()*legal.length)].index)};}
  const pair=[...known.values()].find(a=>a.length>=2);
  const fresh=legal.filter(move=>!Object.hasOwn(s.seen,move.index));
  return {type:'flip',index:pair?pair[0]:(fresh.length?fresh[Math.floor(rng()*fresh.length)].index:legal[Math.floor(rng()*legal.length)].index)};
 }
 if(s.gameId==='dwarven-dominoes'){
  const moves=sharedLegalActions(s,seatId);
  return moves.length?moves[Math.floor(rng()*moves.length)]:s.stock.length?{type:'draw'}:{type:'pass'};
 }
 if(s.gameId==='goblin-s-bluff'){
  if(s.phase==='reveal')return {type:'next'};
  const total=Object.values(s.counts).reduce((x,y)=>x+y,0),hand=s.hands[seatId];
  if(!s.bid){const face=hand.reduce((best,v)=>hand.filter(x=>x===v).length>hand.filter(x=>x===best).length?v:best,hand[0]||1);return {type:'bid',quantity:Math.max(1,Math.floor(total/6)),face};}
  const own=s.hands[seatId].filter(v=>v===s.bid.face).length,expect=own+(total-hand.length)/6;
  if(s.bid.quantity>expect+2||s.bid.quantity>=total)return {type:'challenge'};
  const quantity=Math.min(total,s.bid.quantity+(s.bid.face===6?1:0)),face=s.bid.face===6?1:s.bid.face+1;
  if(quantity>s.bid.quantity||(quantity===s.bid.quantity&&face>s.bid.face))return {type:'bid',quantity,face};
  return {type:'challenge'};
 }
 return null;
}
