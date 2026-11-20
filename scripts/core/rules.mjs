import {EXPANSION_SINGLE} from "./expansion-data.mjs";
import {initExtraSeat,applyExtraSeat,chooseExtraAction,projectExtraSeat} from "./expansion-rules.mjs";
import {GAMES, CATEGORIES, QUESTIONS, EMOJI_PUZZLES, POTIONS, SYMBOLS} from "./data.mjs";

export function secureRandom() {
  if (globalThis.crypto?.getRandomValues) {const b=new Uint32Array(1); globalThis.crypto.getRandomValues(b); return b[0]/4294967296;}
  return Math.random(); // Test/legacy browser fallback; no monetary stakes are supported.
}
const die=(n,rng)=>Math.floor(rng()*n)+1;
const dice=(n,sides,rng)=>Array.from({length:n},()=>die(sides,rng));
export function shuffle(items,rng=secureRandom) {let a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const assert=(ok,msg="That action is not permitted right now")=>{if(!ok)throw Error(msg);};
const number=(x,min,max)=>{let n=Number(x);assert(Number.isFinite(n)&&n>=min&&n<=max,"Invalid value");return n;};
const clone=x=>structuredClone(x);
const end=s=>{s.done=true;s.phase="finished";return s;};
export function labelOf(id){return GAMES[id]?.id||id;}
export function rankKnuckles(ds) {
 const counts=Object.values(ds.reduce((o,x)=>(o[x]=(o[x]||0)+1,o),{})).sort((a,b)=>b-a);
 const sum=ds.reduce((a,b)=>a+b,0);
 return (counts[0]===4?40:counts[0]===3?24:counts[0]===2&&counts[1]===2?18:counts[0]===2?10:0)+sum;
}
export function crownScore(ds,category) {
 assert(ds.length===5,"Roll first");const c=Array.from({length:7},(_,i)=>ds.filter(d=>d===i).length),sum=ds.reduce((a,b)=>a+b,0);
 if(category>=0&&category<=5)return c[category+1]*(category+1);
 if(category===6)return Math.max(...c)>=3?sum:0;
 if(category===7)return Math.max(...c)>=4?sum:0;
 if(category===8)return c.includes(3)&&c.includes(2)?25:0;
 const distinct=[...new Set(ds)].sort().join("");
 if(category===9)return ["1234","2345","3456"].some(x=>[...x].every(d=>distinct.includes(d)))?30:0;
 if(category===10)return ["12345","23456"].includes(distinct)?40:0;
 if(category===11)return Math.max(...c)===5?50:0;
 if(category===12)return sum;
 throw Error("Unknown score category");
}
export function scoreSlots(ds,payouts={triple:12,pair:2,sequence:5}){
 const c=Object.values(ds.reduce((o,v)=>(o[v]=(o[v]||0)+1,o),{}));
 if(c.includes(3))return payouts.triple;
 if(c.includes(2))return payouts.pair;
 return new Set(ds).size===3&&[...ds].sort().join("")==="123"?payouts.sequence:0;
}
function newWyvernRound(rng){const deck=shuffle(Array.from({length:20},(_,i)=>({rank:Math.floor(i/4)+1,suit:["☀️","🌙","🌿","🔥"][i%4]})),rng);return {hand:deck.splice(0,3),dealerHand:deck.splice(0,3),deck};}
export function rankCards(hand){const ranks=hand.map(c=>c.rank).sort((a,b)=>a-b),suits=hand.map(c=>c.suit);const dup=new Set(ranks).size;const straight=ranks[2]-ranks[0]===2&&dup===3;const flush=new Set(suits).size===1;
 const pairRank=dup===2?(ranks[0]===ranks[1]?ranks[0]:ranks[1]):0;
 return (straight&&flush?700:dup===1?600:flush?500:straight?400:dup===2?300+pairRank*3:0)+ranks.reduce((a,b)=>a+b,0);
}
const cardTotal=hand=>{let v=hand.reduce((a,b)=>a+(b===1?1:b),0);if(hand.includes(1)&&v+10<=21)v+=10;return v;};
const nextHammer=(rng)=>Math.floor(rng()*40)+45;
const swapsForCups=(rng,n=5)=>{let list=[];for(let i=0;i<n;i++){let a=die(3,rng)-1,b=die(3,rng)-1;while(a===b)b=die(3,rng)-1;list.push([a,b]);}return list;};
function prepareCups(rng){let start=die(3,rng)-1,swaps=swapsForCups(rng),answer=start;for(let [a,b] of swaps){if(answer===a)answer=b;else if(answer===b)answer=a;}return {start,swaps,answer};}
function newEmoji(rng,index,pool=EMOJI_PUZZLES){const puzzle=pool[index%pool.length];let palette=shuffle(puzzle.solution,rng);if(palette.every((v,i)=>v===puzzle.solution[i]))palette=[...palette.slice(1),palette[0]];return {puzzleIndex:index%pool.length, palette, chosen:[],hint:false};}
const ordinal=n=>["first","second","third","fourth","fifth"][n]||`${n+1}th`;
function freshTrivia(rng,pool=QUESTIONS){return {questionOrder:shuffle(pool.map((_,i)=>i),rng).slice(0,Math.min(8,pool.length)), optionOrders:Array.from({length:8},()=>shuffle([0,1,2,3],rng)),streak:0};}
export function triviaQuestion(state){const q=(state.questions||QUESTIONS)[state.questionOrder[state.round]];if(!q)return null;return {q:q.q,choices:state.optionOrders[state.round].map(i=>q.a[i])};}
export function initSeat(id,rng=secureRandom,config={}){
 assert(GAMES[id],"Unknown game");
 if(EXPANSION_SINGLE.has(id))return initExtraSeat(id,rng,config);
 let s={gameId:id,round:0,rounds:5,score:0,done:false,phase:"ready",log:[],last:"",startTime:0};
 switch(id){
 case "coin-of-fate":s.rounds=[3,5,9,15].includes(config.coinRounds)?config.coinRounds:5;s.coinMode=config.coinMode==="streak"?"streak":"classic";s.streak=0;break;
 case "wyrm-s-eye":s.face=die(12,rng);s.streak=0;s.rounds=8;break;
 case "serpent-s-seven":s.pending=0;break;
 case "lucky-kobold":break;
 case "king-s-high-roll":s.dice=[];s.holds=[];break;
 case "devil-s-knuckles":s.dice=[];s.holds=[];break;
 case "three-dragon-slots":s.dice=[];s.holds=[];s.spins=0;s.slotSymbols=Array.isArray(config.slotSymbols)&&config.slotSymbols.length===6?config.slotSymbols:SYMBOLS;s.payouts=config.slotPayouts||{triple:12,pair:2,sequence:5};break;
 case "seven-skulls":s.dice=[];s.holds=[];s.rolls=0;break;
 case "crown-bones":s.dice=[];s.holds=[];s.rolls=0;s.rounds=13;s.sheet={};break;
 case "arm-wrestling-at-the-bar":s.position=0;s.energy=5+Math.max(0,Math.min(2,Number(config.characterAssist)||0));s.rival=5;s.rounds=9;break;
 case "kattal-s-hammer":s.rounds=3;s.target=nextHammer(rng);s.hammerGrace=Math.max(0,Math.min(2,Number(config.characterAssist)||0))*2;break;
 case "darts-of-the-deep":s.rounds=6;s.wind=(rng()-.5)*.24;s.dartControl=Math.max(0,Math.min(2,Number(config.characterAssist)||0));s.hits=[];break;
 case "sly-fox-s-three-cups":Object.assign(s,prepareCups(rng));break;
 case "tavern-trivia":{s.questions=Array.isArray(config.questions)&&config.questions.length>=4?config.questions:QUESTIONS;s.rounds=Math.min(8,s.questions.length);Object.assign(s,freshTrivia(rng,s.questions));break;}
 case "tomb-of-the-restless-grave":s.rounds=4;s.attempts=0;s.hint=false;break;
 case "forgotten-realms-emoji-door-generator":s.runePuzzles=Array.isArray(config.runePuzzles)&&config.runePuzzles.length>=4?config.runePuzzles:EMOJI_PUZZLES;s.rounds=Math.min(3,s.runePuzzles.length);s.doorOrder=shuffle(s.runePuzzles.map((_,i)=>i),rng).slice(0,s.rounds);Object.assign(s,newEmoji(rng,s.doorOrder[0],s.runePuzzles));break;
 case "potion-sorting-sprint":s.rounds=POTIONS.length;s.order=shuffle(POTIONS.map((_,i)=>i),rng);break;
 case "black-dragon":s.phase="play";s.player=dice(2,12,rng);s.dealer=dice(2,12,rng);s.multiplier=1;break;
 case "three-card-wyvern":s.phase="choose";Object.assign(s,newWyvernRound(rng));break;
 case "runestone-checkers":throw Error("Runestone Checkers is a two-seat board game; use initBoard");
 default:throw Error("Missing implementation");
 }return s;
}
const finishRound=(s,count=1)=>{s.round+=count;if(s.round>=s.rounds)end(s);};
function startNextDiceRound(s) {s.dice=[];s.holds=[];s.rolls=0;s.spins=0;s.phase="ready";}
export function applySeat(old,action,rng=secureRandom){
 if(EXPANSION_SINGLE.has(old.gameId))return applyExtraSeat(old,action,rng);
 const s=clone(old);assert(!s.done,"Match is complete");
 const a=action?.type;assert(typeof a==="string","Missing action");
 const addLog=msg=>{s.last=msg;s.log.push(msg);s.log=s.log.slice(-16);};
 switch(s.gameId){
 case "coin-of-fate":{
  assert(a==="guess"&&["heads","tails"].includes(action.choice));let face=rng()<.5?"heads":"tails";let win=face===action.choice;
  s.streak=win?s.streak+1:0;s.score+=win?(s.coinMode==="streak"?s.streak:1):0;s.face=face;addLog(`${action.choice} → ${face}. ${win?`Correct! +${s.coinMode==="streak"?s.streak:1}`:"Not this time."}`);finishRound(s);break;
 }
 case "wyrm-s-eye":{
  if(a==="bank"){s.score+=s.streak;addLog(`Banked ${s.streak} points.`);end(s);break;}
  assert(a==="guess"&&["higher","lower","equal"].includes(action.choice));let next=die(12,rng),out=next>s.face?"higher":next<s.face?"lower":"equal";
  if(action.choice===out){s.streak+=out==="equal"?4:1;addLog(`${s.face} → ${next}: correct. Streak ${s.streak}.`);} else {addLog(`${s.face} → ${next}: ${out}. Lost the unbanked streak.`);s.streak=0;end(s);}
  s.face=next;s.round++;if(!s.done&&s.round>=s.rounds){s.score+=s.streak;end(s);}break;
 }
 case "serpent-s-seven":{
  if(a==="bank"){s.score+=s.pending;addLog(`Banked ${s.pending}.`);s.pending=0;finishRound(s);break;}
  assert(a==="roll");let d=dice(2,6,rng);s.dice=d;
  if(d[0]===d[1]){s.pending=0;addLog(`${d.join(" + ")} — doubles! Round bust.`);finishRound(s);}else {s.pending+=d[0]+d[1];addLog(`${d.join(" + ")} — ${s.pending} points at risk.`);}break;
 }
 case "lucky-kobold":{
  assert(a==="omen"&&["ascending","same-parity","low","high"].includes(action.choice));let d=[die(4,rng),die(8,rng),die(12,rng)],sum=d.reduce((x,y)=>x+y,0);
  let win=action.choice==="ascending"?d[0]<d[1]&&d[1]<d[2]:action.choice==="same-parity"?d.every(x=>x%2===d[0]%2):action.choice==="low"?sum<=11:sum>=16;
  let prize=action.choice==="same-parity"?3:2;s.score+=win?prize:0;s.dice=d;addLog(`${d.join(" · ")} (${sum}) — ${win?`Omen fulfilled: +${prize}`:"Omen missed"}.`);finishRound(s);break;
 }
 case "king-s-high-roll":{
  if(a==="roll"){assert(s.phase==="ready");s.dice=dice(3,6,rng);s.holds=[];s.phase="hold";addLog("Choose dice to keep before challenging the dealer.");break;}
  if(a==="toggle"){assert(s.phase==="hold");let i=number(action.index,0,2);s.holds=s.holds.includes(i)?s.holds.filter(x=>x!==i):[...s.holds,i];break;}
  assert(a==="settle"&&s.phase==="hold");s.dice=s.dice.map((v,i)=>s.holds.includes(i)?v:die(6,rng));const enemy=dice(3,6,rng),total=s.dice.reduce((x,y)=>x+y,0),them=enemy.reduce((x,y)=>x+y,0),win=total>them;
  s.score+=win?2:total===them?1:0;s.rivalDice=enemy;addLog(`Your ${total} vs goblin ${them}. ${win?"Win +2":total===them?"Draw +1":"Loss"}.`);finishRound(s);startNextDiceRound(s);break;
 }
 case "devil-s-knuckles":{
  if(a==="roll"){assert(s.phase==="ready"||s.phase==="hold");if(s.phase==="ready"){s.dice=dice(4,6,rng);s.rolls=1;s.holds=[];s.phase="hold";}else{assert(s.rolls===1,"Only one reroll is permitted");s.dice=s.dice.map((v,i)=>s.holds.includes(i)?v:die(6,rng));s.rolls=2;}addLog(`Dice: ${s.dice.join(" · ")}`);break;}
  if(a==="toggle"){assert(s.phase==="hold"&&s.rolls===1);let i=number(action.index,0,3);s.holds=s.holds.includes(i)?s.holds.filter(x=>x!==i):[...s.holds,i];break;}
  assert(a==="bank"&&s.phase==="hold");let amount=rankKnuckles(s.dice);s.score+=amount;addLog(`Pattern worth ${amount} points.`);finishRound(s);startNextDiceRound(s);break;
 }
 case "three-dragon-slots":{
  if(a==="spin"){assert(s.phase==="ready"||s.phase==="hold");if(s.phase==="ready"){s.dice=dice(3,6,rng);s.spins=1;s.phase="hold";s.holds=[];}else{assert(s.spins===1);s.dice=s.dice.map((v,i)=>s.holds.includes(i)?v:die(6,rng));s.spins=2;}addLog("The enchanted reels settle.");break;}
  if(a==="toggle"){assert(s.phase==="hold"&&s.spins===1);let i=number(action.index,0,2);s.holds=s.holds.includes(i)?s.holds.filter(x=>x!==i):[...s.holds,i];break;}
  assert(a==="bank"&&s.phase==="hold");let pay=scoreSlots(s.dice,s.payouts);s.score+=pay;addLog(`Payout: ${pay} fantasy points.`);finishRound(s);startNextDiceRound(s);break;
 }
 case "seven-skulls":{
  if(a==="roll"){assert(s.phase==="ready"||s.phase==="hold");if(s.phase==="ready"){s.dice=dice(7,6,rng);s.rolls=1;s.phase="hold";s.holds=[];}else{assert(s.rolls<3);s.dice=s.dice.map((v,i)=>s.holds.includes(i)?v:die(6,rng));s.rolls++;}addLog(`Seven skulls: ${s.dice.join(" · ")}`);break;}
  if(a==="toggle"){assert(s.phase==="hold"&&s.rolls<3);let i=number(action.index,0,6);s.holds=s.holds.includes(i)?s.holds.filter(x=>x!==i):[...s.holds,i];break;}
  assert(a==="bank"&&s.phase==="hold");let skulls=s.dice.filter(x=>x===1).length;let pay=skulls>=3?0:s.dice.reduce((x,y)=>x+(y===1?0:y),0)+(skulls===0?10:0);s.score+=pay;addLog(skulls>=3?"Three skulls! Round bust.":`Safe haul: ${pay} points.`);finishRound(s);startNextDiceRound(s);break;
 }
 case "crown-bones":{
  if(a==="roll"){assert(s.rolls<3&&s.phase!=="finished");s.dice=s.dice.length?s.dice.map((v,i)=>s.holds.includes(i)?v:die(6,rng)):dice(5,6,rng);s.rolls++;s.phase="hold";addLog(`Rolled ${s.dice.join(" · ")}`);break;}
  if(a==="toggle"){assert(s.phase==="hold"&&s.rolls<3);let i=number(action.index,0,4);s.holds=s.holds.includes(i)?s.holds.filter(x=>x!==i):[...s.holds,i];break;}
  assert(a==="score"&&s.dice.length===5);let index=number(action.index,0,12);assert(s.sheet[index]===undefined,"That category is already scored");let pts=crownScore(s.dice,index);s.sheet[index]=pts;s.score+=pts;addLog(`${CATEGORIES[index]}: ${pts} points.`);finishRound(s);startNextDiceRound(s);break;
 }
 case "arm-wrestling-at-the-bar":{
  assert(a==="tactic"&&["power","brace","feint"].includes(action.choice));const move=action.choice;
  // Power beats Feint, Brace beats Power, Feint beats Brace. Power costs stamina; Brace recovers it.
  const rivalOptions=s.rival>0?["power","brace","feint"]:["brace","feint"];
  const npc=rivalOptions[die(rivalOptions.length,rng)-1];
  const beats={power:"feint",brace:"power",feint:"brace"};
  let impact=0;
  if(move==="power"&&s.energy<=0)impact=-1; // An exhausted surge simply fails.
  else if(move===npc)impact=move==="power"?Math.sign(s.energy-s.rival):0;
  else impact=beats[move]===npc?(move==="power"?2:1):-1;
  if(move==="power")s.energy=Math.max(0,s.energy-1);else if(move==="brace")s.energy=Math.min(9,s.energy+1);
  if(npc==="power")s.rival=Math.max(0,s.rival-1);else if(npc==="brace")s.rival=Math.min(9,s.rival+1);
  s.position=Math.max(-3,Math.min(3,s.position+impact));s.round++;s.rivalMove=npc;
  addLog(`You ${move}; your rival uses ${npc}. Grip shifts ${impact>0?"+":""}${impact}.`);
  if(s.position>=3){s.score=3+Math.min(2,Math.floor(s.energy/3));addLog("You slam the rival's knuckles to the bar! Victory.");end(s);}else if(s.position<=-3){s.score=0;addLog("Your hand hits the bar. Pinned!");end(s);}else if(s.round>=s.rounds){s.score=Math.max(0,s.position);addLog("Time! The referee judges the grip.");end(s);}break;
 }
 case "kattal-s-hammer":{
  assert(a==="strike");let p=number(action.power,0,100),precision=Math.max(0,25-Math.max(0,Math.abs(p-s.target)-(s.hammerGrace||0))),pts=Math.round(precision*2);s.score+=pts;addLog(`Hammer at ${Math.round(p)}%; sweet spot ${s.target}%. +${pts}`);s.target=nextHammer(rng);finishRound(s);break;
 }
 case "darts-of-the-deep":{
  assert(a==="throw");let x=number(action.x,-1,1),y=number(action.y,-1,1),power=number(action.power??70,20,100);
  let drift=(100-power)/100*.18;x+=s.wind+(rng()-.5)*(.10+drift)*(1-.15*(s.dartControl||0));y+=(rng()-.5)*(.12+drift)*(1-.15*(s.dartControl||0));
  let dist=Math.hypot(x,y),wedge=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5][Math.floor(((Math.atan2(x,-y)+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*20)];
  let pts=dist>1?0:dist<.09?50:dist<.17?25:dist>.78?2*wedge:dist>.42&&dist<.54?3*wedge:wedge;
  s.score+=pts;s.hits.push({x,y,points:pts});addLog(`Dart ${s.round+1}: ${pts} points${pts===50?" · bullseye!":""}`);finishRound(s);break;
 }
 case "sly-fox-s-three-cups":{
  if(a==="next"){assert(s.phase==="reveal");Object.assign(s,prepareCups(rng));s.phase="ready";break;}
  assert(a==="choose"&&s.phase==="ready");let cup=number(action.index,0,2),win=cup===s.answer;s.score+=win?1:0;addLog(win?"You found the gem!":"The goblin reveals an empty cup.");s.lastCup=s.answer;finishRound(s);if(!s.done)s.phase="reveal";break;
 }
 case "tavern-trivia":{
  assert(a==="answer");let idx=number(action.index,0,3),correct=s.optionOrders[s.round][idx]===(s.questions||QUESTIONS)[s.questionOrder[s.round]].correct;
  s.streak=correct?s.streak+1:0;let pts=correct?10+(s.streak>=3?2:0):0;s.score+=pts;addLog(`${correct?"Correct":"Wrong"} answer. +${pts} points.`);finishRound(s);break;
 }
 case "tomb-of-the-restless-grave":{
  if(a==="hint"){s.hint=true;addLog("A cold voice whispers: 'The weary seek me'.");break;}
  assert(a==="answer"&&typeof action.text==="string"&&action.text.length<120);let phrase=action.text.toLowerCase().trim().replace(/[^a-z\s]/g,"").replace(/\s+/g," ");s.attempts++;
  let success=["rest","peace","let the dead rest","rest in peace"].includes(phrase);if(success){s.score=Math.max(1,10-(s.attempts-1)*2-(s.hint?2:0));addLog("The grave exhales. The stone door slides open.");end(s);}else {addLog("The grave whispers: 'Then share my unrest'.");if(s.attempts>=4)end(s);}break;
 }
 case "forgotten-realms-emoji-door-generator":{
  if(a==="hint"){s.hint=true;break;}
  if(a==="undo"){s.chosen.pop();break;}
  if(a==="select"){let i=number(action.index,0,s.palette.length-1);assert(!s.chosen.includes(i),"Rune already chosen");s.chosen.push(i);break;}
  assert(a==="submit"&&s.chosen.length===s.palette.length,"Select all four runes first");let puzzle=(s.runePuzzles||EMOJI_PUZZLES)[s.puzzleIndex],correct=s.chosen.every((i,n)=>s.palette[i]===puzzle.solution[n]);
  if(correct){s.score+=s.hint?7:10;addLog(`The ${ordinal(s.round)} seal opens.`);finishRound(s);if(!s.done)Object.assign(s,newEmoji(rng,s.doorOrder?.[s.round]??s.round,s.runePuzzles||EMOJI_PUZZLES));}
  else {s.chosen=[];s.score=Math.max(0,s.score-1);addLog("The glyphs reset; try another order.");}break;
 }
 case "potion-sorting-sprint":{
  assert(a==="sort"&&["flora","mineral","fungus"].includes(action.choice));let item=POTIONS[s.order[s.round]],win=item.type===action.choice;s.score+=win?5:0;addLog(`${item.name} → ${action.choice}. ${win?"Correct +5":"Incorrect"}`);finishRound(s);break;
 }
 case "black-dragon":{
  if(a==="next"){assert(s.phase==="reveal");s.player=dice(2,12,rng);s.dealer=dice(2,12,rng);s.phase="play";s.multiplier=1;break;}
  assert(s.phase==="play"&&["hit","stand","double"].includes(a));if(a==="double")assert(s.player.length===2,"You may only double on your first two cards");
  if(a==="hit"||a==="double")s.player.push(die(12,rng));
  if(a==="double")s.multiplier=2;
  if(a==="stand"||a==="double"||cardTotal(s.player)>=21){
   let player=cardTotal(s.player);while(player<=21&&cardTotal(s.dealer)<17)s.dealer.push(die(12,rng));let dealer=cardTotal(s.dealer);
   let win=player<=21&&(dealer>21||player>dealer),tie=player===dealer&&player<=21;
   let pts=win?2*s.multiplier:tie?s.multiplier:0;s.score+=pts;addLog(`You ${player} / dealer ${dealer}: ${win?"Win":tie?"Draw":"Loss"} +${pts}.`);
   finishRound(s);if(!s.done)s.phase="reveal";
  }else addLog(`Your hand: ${cardTotal(s.player)}.`);break;
 }
 case "three-card-wyvern":{
  if(a==="next"){assert(s.phase==="reveal");Object.assign(s,newWyvernRound(rng));s.phase="choose";break;}
  assert(a==="exchange"&&s.phase==="choose");let ix=number(action.index,-1,2);if(ix>=0){s.hand[ix]=s.deck.shift();}
  let ours=rankCards(s.hand),theirs=rankCards(s.dealerHand),pts=ours>theirs?2:ours===theirs?1:0;s.score+=pts;
  addLog(`You ${ours} / dealer ${theirs}: +${pts} points.`);finishRound(s);if(!s.done)s.phase="reveal";break;
 }
 default:throw Error(`No reducer for ${s.gameId}`);
 }
 return s;
}
export function projectSeat(s){if(EXPANSION_SINGLE.has(s.gameId))return projectExtraSeat(s);const out=clone(s);if(s.gameId==="tavern-trivia"){out.activeQuestion=triviaQuestion(s);delete out.questions;delete out.optionOrders;delete out.questionOrder;}if(s.gameId==="forgotten-realms-emoji-door-generator"){const q=(s.runePuzzles||EMOJI_PUZZLES)[s.puzzleIndex];out.activePuzzle={clue:q.clue,hint:q.hint};delete out.runePuzzles;}if(s.gameId==="sly-fox-s-three-cups")delete out.answer;if(s.gameId==="three-card-wyvern"){delete out.deck;if(s.phase==="choose")delete out.dealerHand;}if(s.gameId==="black-dragon"&&s.phase==="play")out.dealer=out.dealer.map((v,i)=>i===0?v:null);return out;}

export function initBoard(seats){assert(seats?.length===2,"Checkers requires two seats");let board=Array(64).fill(null);
 for(let row=0;row<8;row++)for(let col=0;col<8;col++)if((row+col)%2===1){if(row<=2)board[row*8+col]={side:1,king:false};if(row>=5)board[row*8+col]={side:0,king:false};}
 return {gameId:"runestone-checkers",board,turn:0,forced:null,winner:null,moveCount:0,log:[],done:false};
}
const indexXY=(r,c)=>r>=0&&r<8&&c>=0&&c<8?r*8+c:-1;
export function checkersMoves(state,side){
 const moves=[];let board=state.board;for(let from=0;from<64;from++){
  if(state.forced!==null&&from!==state.forced)continue;
  const piece=board[from];if(!piece||piece.side!==side)continue;
  let r=Math.floor(from/8),c=from%8,dirs=piece.king?[[-1,-1],[-1,1],[1,-1],[1,1]]:side===0?[[-1,-1],[-1,1]]:[[1,-1],[1,1]];
  for(let [dy,dx] of dirs){let near=indexXY(r+dy,c+dx),far=indexXY(r+2*dy,c+2*dx);
   if(near<0)continue;
   if(board[near]===null&&!state.forced)moves.push({from,to:near,capture:null});
   if(far>=0&&board[near]?.side===1-side&&board[far]===null)moves.push({from,to:far,capture:near});
  }
 }
 const captures=moves.filter(x=>x.capture!==null);return captures.length?captures:state.forced!==null?[]:moves;
}
export function moveChecker(old,from,to){let s=clone(old);assert(!s.done,"Board game is over");from=number(from,0,63);to=number(to,0,63);
 let move=checkersMoves(s,s.turn).find(m=>m.from===from&&m.to===to);assert(move,"Illegal move or compulsory capture");
 s.board[to]=s.board[from];s.board[from]=null;if(move.capture!==null)s.board[move.capture]=null;
 let row=Math.floor(to/8),promoted=!s.board[to].king&&((s.turn===0&&row===0)||(s.turn===1&&row===7));if(promoted)s.board[to].king=true;
 s.moveCount++;s.log.push(`${s.turn===0?"Gold":"Scarlet"} ${from} → ${to}${move.capture!==null?" capture":""}${promoted?" crowned":""}`);s.log=s.log.slice(-20);
 if(move.capture!==null&&!promoted){s.forced=to;let next=checkersMoves(s,s.turn);if(next.length)return s;}
 s.forced=null;s.turn=1-s.turn;const moves=checkersMoves(s,s.turn);
 if(!moves.length){s.winner=1-s.turn;s.done=true;}
 else if(s.moveCount>=240){s.winner="draw";s.done=true;}
 return s;
}
export function chooseAutoAction(s,rng=secureRandom){if(s.done)return null;if(EXPANSION_SINGLE.has(s.gameId))return chooseExtraAction(s,rng);switch(s.gameId){
 case "coin-of-fate":return {type:"guess",choice:rng()<.5?"heads":"tails"};
 case "wyrm-s-eye":return s.streak>=3||s.round>=6?{type:"bank"}:{type:"guess",choice:s.face>=8?"lower":s.face<=4?"higher":rng()<.5?"higher":"lower"};
 case "serpent-s-seven":return s.pending>=14?{type:"bank"}:{type:"roll"};
 case "lucky-kobold":return {type:"omen",choice:["ascending","same-parity","low","high"][die(4,rng)-1]};
 case "king-s-high-roll":{if(s.phase==="ready")return {type:"roll"};const want=s.dice.map((v,i)=>v>=4?i:-1).filter(i=>i>=0);const fix=want.find(i=>!s.holds.includes(i))??s.holds.find(i=>!want.includes(i));return fix!==undefined?{type:"toggle",index:fix}:{type:"settle"};}
 case "devil-s-knuckles":{if(s.phase==="ready")return {type:"roll"};if(s.rolls!==1)return {type:"bank"};const counts=s.dice.reduce((o,v)=>(o[v]=(o[v]||0)+1,o),{});const best=Number(Object.keys(counts).sort((a,b)=>counts[b]-counts[a]||b-a)[0]);const want=s.dice.map((v,i)=>v===best&&counts[best]>1?i:-1).filter(i=>i>=0);const fix=want.find(i=>!s.holds.includes(i))??s.holds.find(i=>!want.includes(i));return fix!==undefined?{type:"toggle",index:fix}:{type:"roll"};}
 case "three-dragon-slots":return s.phase==="ready"?{type:"spin"}:s.spins===1?{type:"spin"}:{type:"bank"};
 case "seven-skulls":return s.phase==="ready"?{type:"roll"}:s.rolls<2?{type:"roll"}:{type:"bank"};
 case "crown-bones":return s.phase==="ready"?{type:"roll"}:s.rolls<2?{type:"roll"}:{type:"score",index:Array.from({length:13},(_,i)=>i).find(i=>s.sheet[i]===undefined)};
 case "arm-wrestling-at-the-bar":return {type:"tactic",choice:["power","brace","feint"][die(3,rng)-1]};
 case "kattal-s-hammer":return {type:"strike",power:Math.max(0,Math.min(100,s.target+(rng()-.5)*34))};
 case "darts-of-the-deep":return {type:"throw",x:(rng()-.5)*.8,y:(rng()-.5)*.8,power:65};
 case "sly-fox-s-three-cups":return s.phase==="reveal"?{type:"next"}:{type:"choose",index:die(3,rng)-1};
 case "tavern-trivia":return {type:"answer",index:die(4,rng)-1};
 case "tomb-of-the-restless-grave":return {type:"answer",text:"rest"};
 case "forgotten-realms-emoji-door-generator":{const pool=s.runePuzzles||EMOJI_PUZZLES;if(s.chosen.length===s.palette.length)return {type:"submit"};const want=pool[s.puzzleIndex].solution[s.chosen.length];const ix=s.palette.findIndex((v,i)=>v===want&&!s.chosen.includes(i));return {type:"select",index:ix>=0?ix:s.palette.findIndex((_,i)=>!s.chosen.includes(i))};}
 case "potion-sorting-sprint":return {type:"sort",choice:POTIONS[s.order[s.round]].type};
 case "black-dragon":return s.phase==="reveal"?{type:"next"}:{type:cardTotal(s.player)<16?"hit":"stand"};
 case "three-card-wyvern":return s.phase==="reveal"?{type:"next"}:{type:"exchange",index:-1};
 default:return null;
 }}
export function stepNpcSeat(s,rng=secureRandom,n=2){let current=s;for(let k=0;k<n&&!current.done;k++){const action=chooseAutoAction(current,rng);if(!action)break;current=applySeat(current,action,rng);}return current;}
export function stepNpcBoard(s,rng=secureRandom){if(s.done)return s;const moves=checkersMoves(s,s.turn);if(!moves.length)return {...s,done:true,winner:1-s.turn};const m=moves[Math.floor(rng()*moves.length)];return moveChecker(s,m.from,m.to);}
