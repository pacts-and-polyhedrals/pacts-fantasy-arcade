/** Stage 4 UI: cooperative interactive puzzles + GM Puzzle Forge. */
import {PUZZLE_GAMES} from '../core/puzzle-data.mjs';
import {PIPE_TYPES} from '../core/puzzle-engine.mjs';
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const data=p=>Object.entries(p).map(([key,val])=>` data-${esc(key)}="${esc(val)}"`).join('');
const btn=(name,type,p={},disabled=false,cls='')=>`<button type="button" class="pfa-btn ${cls}" data-act="${esc(type)}"${data(p)}${disabled?' disabled':''}>${esc(name)}</button>`;
const pb=(name,type,p={},disabled=false,cls='')=>btn(name,'puzzle-action',{type,...p},disabled,cls);
const buttons=parts=>`<div class="pfa-actions">${parts.join('')}</div>`;
const roman=['I','II','III','IV'];
const pipeGlyph=(type,r)=>type==='straight'?(['\u2502','\u2500','\u2502','\u2500'][r]):(['\u2514','\u250c','\u2510','\u2518'][r]);
export function renderPuzzleGame(session,ctx){const b=session?.board;if(!b?.challenge)return '<p>Waiting for the puzzle to start.</p>';
 const node=b.challenge,kind=node.kind,c=b.current,can=Boolean(ctx.canPlay&&!b.done),hints=b.hints||[],done=b.done;
 const intro=`<div class="pfa-puzzle-heading"><span class="pfa-pill">${esc(kind.toUpperCase())}</span><div><h3>${esc(node.title)}</h3><p>${esc(node.prompt)}</p></div></div>`;
 let body='';
 switch(kind){
 case 'riddle':body=`<label for="pfa-puzzle-answer">Your interpretation</label><input id="pfa-puzzle-answer" data-act="puzzle-answer-input" type="text" autocomplete="off" maxlength="160" placeholder="Type a solution..." ${!can?'disabled':''}/>${buttons([pb('Speak answer','answer',{},!can,'pfa-primary')])}<p class="pfa-muted">Accepts known equivalent spellings and phrasing. There are no dice checks.</p>`;break;
 case 'sequence':case 'arrange':{
  const items=kind==='sequence'?node.symbols:node.fragments;
  const placed=(c.chosen||[]).map(i=>items[i]);
  body=`<div class="pfa-puzzle-slots">${Array.from({length:kind==='sequence'?node.solutionLength:items.length},(_,i)=>`<span class="${placed[i]?'filled':''}">${esc(placed[i]||'?')}</span>`).join('')}</div>`;
  body+=`<p>Select ${kind==='sequence'?'the rune sequence':'the sentence fragments'} in order.</p><div class="pfa-puzzle-palette">${items.map((v,i)=>pb(v,'tap',{index:i},!can||(kind==='arrange'&&c.chosen.includes(i))||c.chosen.length>=(kind==='sequence'?node.solutionLength:items.length),'pfa-puzzle-choice')).join('')}</div>`;
  body+=buttons([pb('Undo last','undo',{},!can||!c.chosen?.length),pb('Test sequence','submit',{},!can||c.chosen.length!==(kind==='sequence'?node.solutionLength:items.length),'pfa-primary')]);
  break;
 }
 case 'melody':{
  const viewing=c.mode==='observe';const demo=viewing?node.demonstration||[]:[];
  body=`<div class="pfa-puzzle-tones" aria-label="Original four-bell tone pattern">${roman.map((v,i)=>btn(`Bell ${v}`,'puzzle-tone',{index:i},!can||viewing,'pfa-puzzle-tone')).join('')}</div>`;
  if(viewing)body+=`<div class="pfa-puzzle-score"><p>Observe this sequence, or press Demonstrate to hear its four original tones.</p><div>${demo.map(i=>`<strong>${esc(roman[i])}</strong>`).join('<span> - </span>')}</div></div>${buttons([btn('Demonstrate tones','puzzle-demo',{},!can),pb('I remember: begin','watch',{},!can,'pfa-primary')])}`;
  else body+=`<p>Your recalled notes: <strong>${(c.chosen||[]).map(i=>roman[i]).join(' - ')||'None yet'}</strong></p>${buttons([pb('Undo note','undo',{},!can||!c.chosen?.length)])}`;
  break;
 }
 case 'dials':body=`<div class="pfa-puzzle-grid pfa-puzzle-dials">${node.labels.map((label,i)=>`<div><small>${esc(label)}</small>${pb(node.phases[c.values[i]],'dial',{index:i},!can,'pfa-puzzle-dial')}<small>Rotate clockwise</small></div>`).join('')}</div>${buttons([pb('Test alignment','submit',{},!can,'pfa-primary')])}`;break;
 case 'offer':case 'logic':body=`<div class="pfa-puzzle-assignments">${node.labels.map((label,i)=>`<label>${esc(label)}<select data-act="puzzle-assignment" data-index="${i}" ${!can?'disabled':''}><option value="">Choose an offering</option>${node.items.map((item,j)=>`<option value="${j}" ${c.values[i]===j?'selected':''}>${esc(item)}</option>`).join('')}</select></label>`).join('')}</div>${buttons([pb('Confirm assignments','submit',{},!can||c.values.some(x=>x===null),'pfa-primary')])}<p class="pfa-muted">No two guardians may receive the same offering.</p>`;break;
 case 'choices':body=`<div class="pfa-puzzle-choice-stage"><h4>Stage ${c.step+1} of ${node.stage.total}</h4><p>${esc(node.stage.prompt)}</p></div>${buttons(node.stage.options.map((option,i)=>pb(option,'choose',{index:i},!can,'pfa-puzzle-choice')))}`;break;
 case 'pipes':{
  body=`<p>Inlet: WEST (upper left) <span class="pfa-muted">to</span> EAST (lower right). Click a pipe to rotate.</p><div class="pfa-puzzle-grid pfa-puzzle-pipes">${c.rotations.map((r,i)=>`<button type="button" data-act="puzzle-action" data-type="rotate" data-index="${i}" class="pfa-puzzle-pipe" ${!can?'disabled':''} aria-label="Rotate pipe ${i+1}">${esc(pipeGlyph(PIPE_TYPES[i],r))}</button>`).join('')}</div>${buttons([pb('Test water route','submit',{},!can,'pfa-primary')])}`;break;
 }
 case 'gravity':{
  const walls=new Set(c.walls);body=`<p>Tilt the room. The crystal slides until the next obstacle; you cannot stop it mid-flight.</p><div class="pfa-puzzle-grid pfa-puzzle-gravity">${Array.from({length:25},(_,i)=>`<div class="pfa-gravity-cell ${walls.has(i)?'wall':''} ${i===c.goal?'goal':''}">${walls.has(i)?'#':i===c.pos?'<span class="pfa-gravity-crystal" aria-label="Crystal">*</span>':i===c.goal?'EXIT':''}</div>`).join('')}</div><p class="pfa-muted">Moves taken: ${c.moves}</p>${buttons([pb('North','tilt',{direction:'N'},!can),pb('South','tilt',{direction:'S'},!can),pb('West','tilt',{direction:'W'},!can),pb('East','tilt',{direction:'E'},!can)])}`;break;
 }
 case 'lights':body=`<p>Illuminate all nine stones. Pressing one also toggles its north, east, south and west neighbours.</p><div class="pfa-puzzle-grid pfa-puzzle-lights">${c.cells.map((v,i)=>pb(v?'ON':'OFF','press',{index:i},!can,`pfa-lattice-stone ${v?'lit':''}`)).join('')}</div>`;break;
 case 'slide':{
  const blank=c.cells.indexOf(0),near=[blank%3>0?blank-1:-1,blank%3<2?blank+1:-1,blank>=3?blank-3:-1,blank<6?blank+3:-1];
  body=`<p>Slide a numbered plate into the blank. Goal: 1-8 in row order with the blank in the last cell.</p><div class="pfa-puzzle-grid pfa-puzzle-slide">${c.cells.map((v,i)=>`<button type="button" class="pfa-slide-plate ${v===0?'blank':''}" data-act="puzzle-action" data-type="slide" data-index="${i}" ${!can||!near.includes(i)||v===0?'disabled':''}>${v||''}</button>`).join('')}</div><p>Moves taken: ${c.moves}</p>`;break;
 }
 }
 const progress=`<div class="pfa-puzzle-progress"><span>Chamber ${Math.min(b.round+1,b.nodeCount)} / ${b.nodeCount}</span><span>Party score ${b.score}</span><span>Failed attempts ${b.attempts}</span></div>`;
 const hintBlock=`<div class="pfa-puzzle-hints"><h4>Progressive hints</h4>${hints.map((v,i)=>`<p><b>Hint ${i+1}:</b> ${esc(v)}</p>`).join('')}${can?pb(`Reveal next hint (${hints.length}/${node.hintCount})`,'hint',{},!can||hints.length>=node.hintCount):''}</div>`;
 const trail=b.history?.length?`<div class="pfa-puzzle-history"><h4>Discovered clues</h4>${b.history.map((v,i)=>`<details ${i===b.history.length-1?'open':''}><summary>${esc(v.title)}</summary><p>${esc(v.clue||'The ward yielded.')}</p></details>`).join('')}</div>`:'';
 const footer=done?`<div class="pfa-victory" role="status"><strong>Linked puzzle completed!</strong> All clues are revealed. Party score: ${b.score}.</div>`:`<div class="pfa-notice" role="status">${esc(b.last)}</div>`;
 return `<div class="pfa-game-content pfa-puzzle-game">${progress}${intro}${body}${hintBlock}${trail}${footer}${session.bindingId?'<p class="pfa-muted">This puzzle is linked to a Foundry scene event; the GM controls its effect.</p>':''}</div>`;
}
export function renderPuzzleForge(ctx){const scenes=ctx.scenes||[],scene=ctx.scene||null,bindings=ctx.bindings||[],sceneSources=scene?.sources||[],sceneEffects=scene?.effects||[];
 const name=(g)=>ctx.catalog?.find(x=>x.id===g)?.title||g;
 const options=(arr,map)=>arr.map(map).join('');
 const packOptions=`<option value="">Built-in puzzle</option>${(ctx.packs||[]).filter(x=>x.type==='puzzle').map(x=>`<option value="${esc(x.id)}">${esc(x.name)} (${x.count||x.entries?.length||0} nodes)</option>`).join('')}`;
 return `<section class="pfa-puzzle-forge pfa-panel">
 <div class="pfa-session-header"><div><span class="pfa-eyebrow">GM studio</span><h2>Puzzle Forge</h2><p>Create original linked puzzle books, connect them to adventure locations, and decide what solving them changes.</p></div>${btn('Back to library','exit-forge')}</div>
 <div class="pfa-puzzle-studio-section"><h3>1. Generate a validated riddle book</h3><p>Produces deterministic, original authored riddles with stored answers, accepted variants and progressive hints. Repeated seeds reproduce the same order.</p>
 <div class="pfa-form-grid"><label>Pack ID<input id="pfa-forge-id" value="my-riddle-vault" maxlength="60"/></label><label>Title<input id="pfa-forge-name" value="My Riddle Vault" maxlength="60"/></label><label>Riddle count<select id="pfa-forge-count">${[4,5,6,8,10,12].map(n=>`<option value="${n}" ${n===6?'selected':''}>${n}</option>`).join('')}</select></label><label>Difficulty<select id="pfa-forge-difficulty"><option value="1">Easy</option><option value="2" selected>Intermediate</option><option value="3">Challenging</option></select></label><label>Seed<input id="pfa-forge-seed" type="number" value="842" min="1" max="2147483647"/></label></div>
 ${buttons([btn('Generate and save original riddles','forge-generate',{},false,'pfa-primary'),btn('Edit puzzle pack JSON','open-puzzle-pack-editor')])}
 <p class="pfa-muted">Every stored answer can be checked exactly; generated riddles are curated templates, not unverified AI text. Edit these packs later in GM Pack Studio.</p></div>
 <div class="pfa-puzzle-studio-section"><h3>2. Link the puzzle to the current scene</h3><p>Region and Tile sources launch a co-operative puzzle when a token enters their footprint. On success the GM host can reveal/hide a tile or open/close a door wall.</p>
 <p>Current scene: <b>${esc(scene?.name||'No viewed scene')}</b></p>
 ${scene?`<div class="pfa-form-grid"><label>Trigger region / tile<select id="pfa-forge-source">${options(sceneSources,x=>`<option value="${esc(x.kind)}:${esc(x.id)}">${esc(x.kind)}: ${esc(x.name)}</option>`)}</select></label><label>Game<select id="pfa-forge-game">${PUZZLE_GAMES.map(x=>`<option value="${esc(x.id)}">${esc(name(x.id))}</option>`).join('')}</select></label><label>Custom pack (optional)<select id="pfa-forge-pack">${packOptions}</select></label><label>Effect target<select id="pfa-forge-target">${options(sceneEffects,x=>`<option value="${esc(x.kind)}:${esc(x.id)}">${esc(x.kind)}: ${esc(x.name)}</option>`)}</select></label><label>When solved<select id="pfa-forge-effect"><option value="reveal">Reveal Tile</option><option value="hide">Hide Tile</option><option value="open">Open Wall Door</option><option value="close">Close Wall Door</option></select></label></div>${buttons([btn('Bind scene trigger and reward','forge-bind',{},!sceneSources.length||!sceneEffects.length,'pfa-primary')])}`:'<p class="pfa-muted">Open a Foundry scene to configure bindings.</p>'}
 <p class="pfa-muted">Optional: attach a Region Execute Script behavior to call the public <code>triggerScenePuzzle(bindingId)</code> API. Automatic token-entry detection is experimental and requires a connected GM host.</p>
 <div class="pfa-puzzle-bindings"><h4>Saved scene bindings</h4>${bindings.length?bindings.map(b=>`<div class="pfa-binding-row"><div><b>${esc(b.sceneName||b.sceneId)}</b><p>${esc(name(b.gameId))} | ${esc(b.sourceKind)} ${esc(b.sourceId)} | ${esc(b.effectKind)} ${esc(b.effectAction)}</p></div>${buttons([btn('Launch / resume','forge-trigger',{id:b.id},false),btn('Copy Region script','forge-copy-script',{id:b.id},false),btn('Remove','forge-unbind',{id:b.id},false)])}</div>`).join(''):'<p>No bindings yet. Puzzle tables can still be launched directly from the library.</p>'}</div>
 </div>
 <div class="pfa-puzzle-studio-section"><h3>3. Original puzzle templates</h3><p>Editable pack kinds include riddles, rune sequences, tone memory, lunar dials, logic assignment, sentence ordering, branching choices, pipe networks, gravity, lights and sliding tiles.</p><p>The Starforge chain is a five-stage reference demonstrating how clue rewards unlock successive challenges. Correct solutions are stored only on the host side, not in regular player projections.</p></div></section>`;
}
