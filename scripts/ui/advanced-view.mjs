import {ADVANCED_IDS,ELEMENTS,SUITS} from '../core/advanced-data.mjs';
import {advancedLegalActions,POKER_RANKS} from '../core/advanced-rules.mjs';
import {wyvernMoves,wyvernReplayBoard,WYVERN_GLYPHS} from '../core/wyvern.mjs';
import {wyvernSprite} from '../core/art.mjs';
const e=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const b=(txt,act,props={},disabled=false,cls='')=>`<button type="button" class="pfa-btn ${e(cls)}" data-act="${e(act)}" ${Object.entries(props).map(([k,v])=>`data-${e(k)}="${e(v)}"`).join(' ')} ${disabled?'disabled':''}>${e(txt)}</button>`;
const play=(txt,type,props={},disabled=false,cls='')=>b(txt,'advanced-play',{type,...props},disabled,cls);
const actions=arr=>`<div class="pfa-actions">${arr.join('')}</div>`;
const rk=c=>c&&'♠♥♦♣'.includes(c.suit)?({11:'J',12:'Q',13:'K',14:'A'})[c.rank]||c.rank:c?.rank;
const card=(v,flipped=false)=>v&&typeof v==='object'?`<span class="pfa-adv-card ${'♥♦'.includes(v.suit)?'red':''}" title="${e(rk(v))} ${e(v.suit)}"><b>${e(rk(v))}</b><strong>${e(v.suit)}</strong></span>`:`<span class="pfa-adv-card back" aria-label="Face-down card">${flipped?'✶':'?'}</span>`;
const hand=(list=[],selected=null,select=false)=>`<div class="pfa-adv-hand">${list.map((c,i)=>select?`<button type="button" class="pfa-adv-card pick ${i===selected?'chosen':''}" data-act="select-card" data-index="${i}" aria-pressed="${i===selected}" aria-label="Select card ${i+1}: ${e(c?.rank??'hidden')} ${e(c?.suit??'')}">${c?`<b>${e(rk(c))}</b><strong>${e(c.suit)}</strong>`:'?'}</button>`:card(c)).join('')||'<span class="pfa-muted">No cards</span>'}</div>`;
const tableInfo=(s,session)=>`<div class="pfa-adv-top"><span>Round ${Math.min((s.round??0)+1,s.rounds||1)} / ${s.rounds||1}</span><b>${s.done?'Match complete':s.phase==='reveal'?'Reveal':`Turn: ${e(session.seats[s.turn]?.name||'—')}`}</b></div>`;
const foot=(s,canNext,gameId,session)=>`${s.phase==='reveal'?actions([play('Continue to next hand / trick','next',{},!canNext,'pfa-primary')]):''}${s.log?.length?`<div class="pfa-notice" role="status">${e(s.log.at(-1))}</div>`:''}${s.done?`<div class="pfa-victory">🏆 ${s.winner==='draw'?'The match is drawn':`${e(session?.seats?.find(z=>z.id===sessionWinner(s))?.name||sessionWinner(s))} wins the match!`}</div>`:''}`;
const sessionWinner=s=>s.winner==='draw'?'Draw':s.seats?.[s.winner]||s.winner;
const scorePanel=(s,session)=>s.scores?`<div class="pfa-adv-score">${session.seats.map(z=>`<span><b>${e(z.name)}</b> ${e(s.scores[z.id]??0)}</span>`).join('')}</div>`:'';
/** Public replay frames omit all concealed hands, shuffled decks, and unrevealed claims. */
function replayNav(s,ctx){
 const frames=s.gameId==='wyvern-chess'?s.replay?.length??0:Math.max(0,(s.timeline?.length||1)-1);
 const index=Number.isInteger(ctx.replayIndex)&&ctx.replayIndex>=0?Math.min(ctx.replayIndex,frames):-1;
 return `<div class="pfa-replay-nav" role="group" aria-label="Public match replay"><b>⏪ Replay ${index===-1?'Live':`${index} / ${frames}`}</b>${actions([
  b('⏮ Start','replay-first',{},index===0),b('◀ Back','replay-prev',{},index===0),
  b('Next ▶','replay-next',{},index===-1||index>=frames),b('Live ⏵','replay-live',{},index===-1),
 ])}</div>`;
}
function replaySnapshot(session,ctx){
 const s=session.board,index=ctx.replayIndex,frame=s.timeline?.[Math.min(index,s.timeline.length-1)];
 if(!frame)return '<p>No replay frames recorded yet.</p>';
 let content=`<div class="pfa-adv-score"><span>Turn ${e(frame.turn+1)}</span><span>Round ${e((frame.round??0)+1)}</span><span>Phase ${e(frame.phase)}</span>${frame.pot!==undefined?`<span>Pot ${e(frame.pot)}</span>`:''}</div>`;
 if(frame.community?.length)content+=`<p>Shared cards</p>${hand(frame.community)}`;
 if(frame.trick?.length)content+=`<p>Played cards</p>${hand(frame.trick.map(x=>x.card))}`;
 if(frame.lanes?.length)content+=frame.lanes.map((lane,i)=>`<p><b>${e(['Gate','Keep','Spire'][i])}</b>: ${lane.map(x=>e(x.card.rank+' '+x.card.suit)).join(' · ')||'empty'}</p>`).join('');
 if(frame.cells?.length)content+=`<div class="pfa-adv-realm">${frame.cells.map(cell=>`<span class="pfa-replay-tile">${cell?e(cell.card.suit+' '+cell.card.rank):'·'}</span>`).join('')}</div>`;
 if(frame.pending)content+=`<p>Face-down claim: <b>${e(frame.pending.claim)}</b></p>`;
 if(frame.encounter)content+=`<p>Encounter: ${e(frame.encounter.beast||'Unknown')} · ${e(frame.encounter.region)}</p>`;
 if(frame.scores)content+=`<div class="pfa-adv-score">${session.seats.map(z=>`<span>${e(z.name)}: ${e(frame.scores[z.id]||0)}</span>`).join('')}</div>`;
 return `<section class="pfa-replay-snapshot" aria-live="polite"><h3>Recorded public position</h3>${content}<p class="pfa-notice">${e(frame.log)}</p><p class="pfa-muted">Private hands and secret cards are deliberately omitted from historical frames.</p></section>`;
}


export function renderAdvancedShared(session,ctx){if(!session?.board||!ADVANCED_IDS.has(session.gameId))return '';
 const s=session.board,id=ctx.seatId,replaying=Number.isInteger(ctx.replayIndex)&&ctx.replayIndex>=0,own=Boolean(ctx.canPlay&&id),turn=own&&!replaying&&!s.done&&s.seats?.[s.turn]===id,canNext=own&&!replaying&&!s.done&&s.phase==='reveal',legal=s.gameId==='wyvern-chess'?[]:id?advancedLegalActions(s,id):[];
 const ok=(type,criteria={})=>turn&&legal.some(a=>a.type===type&&Object.entries(criteria).every(([k,v])=>a[k]===v));
 let h='';
 if(s.gameId==='wyvern-chess')return renderWyvern(session,ctx);
 if(replaying)return `<div class="pfa-game-content">${replayNav(s,ctx)}${replaySnapshot(session,ctx)}</div>`;
 if(s.gameId==='waterdeep-hold-em'){
  const personal=s.hands[id]||[];
  h=`<h3>♠ Waterdeep Hold'em</h3><p>Two private cards and five public cards · three hands · fictional points only.</p><p>Shared cards</p>${hand(s.community)}<p>Your cards</p>${hand(personal)}<div class="pfa-adv-score"><span>Pot: <b>${s.pot}</b></span><span>Current street: <b>${e(s.phase.replace('bet-',''))}</b></span><span>Max wager: <b>${s.maxStreet}</b></span><span>Raises: <b>${s.bets}/2</b></span></div><div class="pfa-adv-score">${session.seats.map(z=>`<span>${e(z.name)}: ${s.folded[z.id]?'FOLDED':`${s.balance[z.id]} influence left`}</span>`).join('')}</div>${actions(['check','call','raise','fold'].map(t=>play(t[0].toUpperCase()+t.slice(1),t,{},!ok(t),t==='call'?'pfa-primary':'')))}${s.lastReveal?`<div class="pfa-adv-reveal"><b>${e(s.lastReveal.rank)}</b><p>Won by ${s.lastReveal.winners.map(w=>e(session.seats.find(z=>z.id===w)?.name||w)).join(', ')}</p>${session.seats.map(z=>`<p>${e(z.name)}: ${hand(s.lastReveal.hands[z.id]||[])}</p>`).join('')}</div>`:''}`;
 }
 if(['three-wyrms-ante','dragon-s-trick'].includes(s.gameId)){
  h=`<h3>${s.gameId==='dragon-s-trick'?'🂡 Dragon’s Trick':'🐲 Three Wyrms Ante'}</h3><p>${s.gameId==='dragon-s-trick'?`Trump suit: <b>${e(s.trump)}</b>. Follow ${e(s.leadSuit||'the leading suit')} when possible.`:'Lead an element, then try to win the trick with high power and matching element.'}</p><div class="pfa-adv-center"><b>Table cards</b>${s.trick.map(t=>`<span>${e(session.seats.find(z=>z.id===t.id)?.name||t.id)} ${card(t.card)}</span>`).join('')||'<p>Awaiting first card</p>'}</div><p>Choose a card from your hand:</p><div class="pfa-adv-hand">${(s.hands[id]||[]).map((c,i)=>`<button type="button" class="pfa-adv-card pick" data-act="advanced-play" data-type="play-card" data-index="${i}" ${!ok('play-card',{index:i})?'disabled':''} aria-label="Play ${e(c?.rank)} ${e(c?.suit)}"><b>${e(c?.rank||'?')}</b><strong>${e(c?.suit||'')}</strong></button>`).join('')}</div>${s.lastTrick&&s.phase==='reveal'?`<p class="pfa-notice">${e(session.seats.find(z=>z.id===s.lastTrick.winningId)?.name||'Player')} won the trick.</p>`:''}`;
 }
 if(s.gameId==='bard-s-bluff'){
  h=`<h3>🎭 Bard's Bluff</h3><p>Choose a hidden card and publicly claim a rank. The next bard may accept or challenge.</p>${hand(s.hands[id]||[],ctx.selectedCard,s.phase==='offer'&&turn)}<p>${s.pending?`<b>${e(session.seats.find(z=>z.id===s.pending.by)?.name||s.pending.by)}</b> claims rank <b>${e(s.pending.claim)}</b> with a face-down card.`:'No claim currently on the stage.'}</p>${s.phase==='respond'?actions([play('Accept claim','accept',{},!ok('accept')),play('Challenge!','challenge',{},!ok('challenge'),'pfa-primary')]):`<div class="pfa-adv-score"><span>Selected card: ${(ctx.selectedCard??0)+1}</span><span class="pfa-called-rank">The stage calls: <b>${e(s.calledRank??1)}</b></span></div>${actions([play(`Lay card face-down & claim “${s.calledRank??1}”`,'offer',{},!turn||!s.hands[id]?.[ctx.selectedCard??0],'pfa-primary')])}<p class="pfa-muted">The called rank climbs 1→6 after every claim. Revealed cards: ${(s.discard||[]).map(c=>e(c.rank)).join(' · ')||'none yet'}.</p>`}`;
 }
 if(s.gameId==='king-s-gambit'){
  h=`<h3>♜ King's Gambit</h3><p>Deploy five cards across the Gate, Keep and Spire. Strongest total in each lane wins.</p>${s.lanes.map((lane,i)=>`<div class="pfa-adv-lane"><b>${['🛡️ Gate','🏰 Keep','✨ Spire'][i]}</b><span>${lane.map(x=>`${e(session.seats.find(z=>z.id===x.id)?.name||x.id)} ${e(x.card.rank)}${e(x.card.suit)}`).join(' · ')||'Empty'}</span></div>`).join('')}<p>Your hand:</p>${hand(s.hands[id]||[],ctx.selectedCard,turn)}<p>Select a lane:</p>${actions([0,1,2].map(lane=>b(['Gate','Keep','Spire'][lane],'select-lane',{lane},!turn,ctx.selectedLane===lane?'held':'' )))}${actions([play('Deploy selected card','deploy',{},!turn||!s.hands[id]?.[ctx.selectedCard??0],'pfa-primary')])}`;
 }
 if(s.gameId==='elemental-conquest'){
  const cells=s.cells||[];
  h=`<h3>🌋 Elemental Conquest</h3><p>Place tiles on the 4×4 realm. Matching adjacent elements add 2 points each.</p><div class="pfa-adv-realm">${cells.map((c,i)=>b(c?`${c.card.suit} ${c.card.rank}`:'✦','conquest-cell',{cell:i},!turn||Boolean(c),c?'occupied':'' )).join('')}</div><p>Your available element tiles:</p>${hand(s.hands[id]||[],ctx.selectedCard,turn)}<small>Select a tile and then an empty square on the board.</small>`;
 }
 if(s.gameId==='royal-hunt'){
  h=`<h3>🏹 Royal Hunt</h3><p>Stamina: ${e(s.stamina[id]??0)} / 6 · Each contestant takes three expeditions.</p>${s.phase==='track'?`<p>Choose hunting terrain:</p>${actions([play('🌲 Forest · safer','track',{region:'forest'},!ok('track',{region:'forest'})),play('⛰️ Highlands · medium','track',{region:'highlands'},!ok('track',{region:'highlands'})),play('🏚️ Ruins · dangerous','track',{region:'ruins'},!ok('track',{region:'ruins'}))])}`:`<div class="pfa-story-card"><h3>${e(s.encounter?.beast||'Creature')}</h3><p>Terrain ${e(s.encounter?.region)} · Danger ${e(s.encounter?.danger)} · Reward ${e(s.encounter?.reward)}</p></div>${actions([play('Withdraw & recover stamina','withdraw',{},!ok('withdraw')),play('Approach cautiously','cautious',{},!ok('cautious')),play('Charge boldly','bold',{},!ok('bold'),'pfa-primary')])}`}`;
 }
 return `<div class="pfa-game-content">${tableInfo(s,session)}${scorePanel(s,session)}${h}${foot(s,canNext,s.gameId,session)}${replayNav(s,ctx)}${s.replay?.length?`<details><summary>Match record (${s.replay.length} decisions)</summary><div class="pfa-adv-replay">${s.log.map(t=>`<p>${e(t)}</p>`).join('')}</div></details>`:''}</div>`;
}
function renderWyvern(session,ctx){const s=session.board,layer=ctx.wyvernLayer||2,side=s.turn===0?'gold':'scarlet',replaying=Number.isInteger(ctx.replayIndex)&&ctx.replayIndex>=0,isTurn=Boolean(ctx.canPlay&&!replaying&&session.seats[s.turn]?.id===ctx.seatId&&!s.done),cells=replaying?wyvernReplayBoard(s,Math.min(ctx.replayIndex,s.replay.length)):s.cells;
 const legal=isTurn?wyvernMoves(s):[],sources=new Set(legal.map(m=>m.from)),targets=new Set(legal.filter(m=>m.from===ctx.selectedWyvern).map(m=>m.to));
 const tabs=[3,2,1].map(L=>b(`${L===3?'☁️ Sky':L===2?'⚔️ Land':'🔥 Underworld'}${[...targets].some(p=>p.startsWith(`${L},`))?' ✦':''}`,'wyvern-layer',{layer:L},false,L===layer?'held':'' )).join('');
 const board=Array.from({length:8},(_,r)=>Array.from({length:12},(_,f)=>{const pos=`${layer},${f},${r}`,piece=cells[pos],target=targets.has(pos),canSelect=isTurn&&(target||sources.has(pos));return `<button type="button" class="pfa-wyvern-cell ${(r+f)%2?'dark':'light'} ${target?'target':''} ${ctx.selectedWyvern===pos?'selected':''} ${piece?.side||''}" data-act="wyvern-square" data-pos="${pos}" title="${e(`${pos} ${piece?.side||''} ${piece?.type||'empty'}`)}" aria-label="${e(`${pos} ${piece?.side||''} ${piece?.type||'empty'}${target?' legal destination':''}`)}" ${!canSelect?'disabled':''}>${piece?`<span class="pfa-wyvern-piece"><img src="${e(wyvernSprite(piece.side,piece.type))}" alt="" draggable="false" onerror="this.replaceWith(document.createTextNode('${WYVERN_GLYPHS[piece.type]||'◆'}'))"/><small>${e(piece.type.slice(0,3))}</small></span>`:target?'<i>✦</i>':''}</button>`;}).join('')).join('');
 const history=replaying?s.replay.slice(0,Math.min(ctx.replayIndex,s.replay.length)):s.replay;
 const capturesGold=history.filter(m=>m.side==='gold'&&m.capture).length,capturesScarlet=history.filter(m=>m.side==='scarlet'&&m.capture).length;
 const outcome=s.done?s.winner==='draw'?'Stalemate':`${s.winner===0?'Gold':'Scarlet'} checkmates the opposing King!`:`${side} to move${s.check===s.turn?' · King in check':''}`;
 return `<div class="pfa-game-content pfa-wyvern"><h3>🐉 Wyvern Chess · modified native Foundry adaptation</h3><div class="pfa-board-summary">${replaying?`Historical position after ${Math.min(ctx.replayIndex,s.replay.length)} moves` : e(outcome)}</div>${replayNav(s,ctx)}${actions([tabs])}<p><small>Select a piece, then a highlighted destination. Select another layer to perform a cross-level move.</small></p><div class="pfa-wyvern-board" role="group" aria-label="Wyvern Chess ${layer===3?'Sky':layer===2?'Land':'Underworld'} board">${board}</div><div class="pfa-adv-score"><span>Gold captures: ${capturesGold}</span><span>Scarlet captures: ${capturesScarlet}</span><span>Moves: ${history.length}</span></div><div class="pfa-notice" role="status">${e(replaying?(history.at(-1)?`${history.at(-1).side} ${history.at(-1).from} → ${history.at(-1).to}`:'Gold begins.'):s.log.at(-1)||'Gold begins. Choose a legal move.')}</div>${s.done?`<div class="pfa-victory">${e(outcome)}</div>`:''}<details><summary>Wyvern Chess moves · ${s.log.length} recent</summary><div class="pfa-adv-replay">${s.log.map(x=>`<p>${e(x)}</p>`).join('')}</div></details><p><small>Based on the original Wyvern Chess rules engine by DM Asmo · Pacts & Polyhedrals. Remote strikes, Basilisk freezing and cross-level legal moves are enforced natively; visual animations remain alpha-stage.</small></p></div>`;
}
