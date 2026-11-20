/** Puzzle Forge: deterministic rule reducers, generators, validators and safe projections. */
import {PUZZLE_IDS,PUZZLE_PRESETS,RIDDLE_BANK} from './puzzle-data.mjs';
const fail=(message)=>{throw Error(message);};
const need=(ok,msg)=>{if(!ok)fail(msg);};
const clone=v=>structuredClone(v);
const str=(v,n=300)=>String(v??'').trim().slice(0,n);
const rand=(rng,n)=>Math.floor(rng()*n);
const unique=a=>new Set(a).size===a.length;
const norm=text=>String(text??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const isPermutation=(array,n)=>Array.isArray(array)&&array.length===n&&array.every(v=>Number.isInteger(v)&&v>=0&&v<n)&&unique(array);
const smallText=(v,n=160)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
const shortArray=(a,min,max,limit=80)=>Array.isArray(a)&&a.length>=min&&a.length<=max&&a.every(v=>smallText(v,limit));
const choicesValid=stages=>Array.isArray(stages)&&stages.length>=1&&stages.length<=6&&stages.every(s=>s&&smallText(s.prompt,250)&&shortArray(s.options,2,4,150)&&Number.isInteger(s.correct)&&s.correct>=0&&s.correct<s.options.length);
export const PUZZLE_KINDS=new Set(['riddle','sequence','melody','dials','arrange','offer','logic','choices','pipes','gravity','lights','slide']);
export function validatePuzzleEntries(entries){
 need(Array.isArray(entries)&&entries.length>=1&&entries.length<=24,'Puzzle pack requires 1-24 nodes');
 const ids=new Set();const out=entries.map((raw,i)=>{
  need(raw&&typeof raw==='object','Puzzle node must be an object');
  const id=str(raw.id,55),kind=str(raw.kind,20),title=str(raw.title,90),prompt=str(raw.prompt,600);
  need(/^[a-z0-9-]{2,55}$/.test(id),'Puzzle nodes need distinct lowercase IDs');need(!ids.has(id),'Duplicate puzzle node ID');ids.add(id);
  need(PUZZLE_KINDS.has(kind),'Unknown puzzle kind');need(title.length>=3&&prompt.length>=10,'Each puzzle needs a title and a meaningful prompt');
  const hints=Array.isArray(raw.hints)?raw.hints.map(x=>str(x,200)):[];
  need(hints.length>=2&&hints.length<=3&&hints.every(x=>x.length>3),'Each puzzle needs 2-3 progressive hints');
  const node={id,kind,title,prompt,hints,clue:str(raw.clue,350),next:raw.next===undefined||raw.next===null||raw.next===''?null:str(raw.next,55)};
  if(kind==='riddle'){
   need(shortArray(raw.answers,1,8,100),'Riddle requires 1-8 accepted answer variants');
   node.answers=[...new Set(raw.answers.map(x=>str(x,100)))];need(unique(node.answers.map(norm)),'Equivalent answer variants may not be duplicated');
  }else if(kind==='sequence'){
   need(shortArray(raw.symbols,4,10,50),'Sequence needs 4-10 selectable symbols');
   need(Array.isArray(raw.solution)&&raw.solution.length>=3&&raw.solution.length<=10&&raw.solution.every(v=>Number.isInteger(v)&&v>=0&&v<raw.symbols.length),'Invalid sequence solution');
   node.symbols=raw.symbols.map(x=>str(x,50));node.solution=clone(raw.solution);
  }else if(kind==='melody'){
   need(Array.isArray(raw.solution)&&raw.solution.length>=3&&raw.solution.length<=10&&raw.solution.every(x=>Number.isInteger(x)&&x>=0&&x<4),'Melody requires 3-10 notes (0-3)');node.solution=clone(raw.solution);
  }else if(kind==='dials'){
   need(shortArray(raw.labels,2,5,60)&&shortArray(raw.phases,2,8,60),'Dials need labels and 2-8 phase choices');
   need(Array.isArray(raw.solution)&&raw.solution.length===raw.labels.length&&raw.solution.every(x=>Number.isInteger(x)&&x>=0&&x<raw.phases.length),'Invalid dial solution');
   node.labels=clone(raw.labels);node.phases=clone(raw.phases);node.solution=clone(raw.solution);
  }else if(kind==='arrange'){
   need(shortArray(raw.fragments,3,8,150),'Arrange puzzle requires 3-8 fragments');need(isPermutation(raw.solution,raw.fragments.length),'Arrange solution must reference each fragment once');
   node.fragments=clone(raw.fragments);node.solution=clone(raw.solution);
  }else if(kind==='offer'||kind==='logic'){
   need(shortArray(raw.labels,3,3,70)&&shortArray(raw.items,3,3,70),'Assignment puzzle needs three labels and three offerings');
   need(isPermutation(raw.solution,3),'Assignment needs one different offering per guardian');node.labels=clone(raw.labels);node.items=clone(raw.items);node.solution=clone(raw.solution);
  }else if(kind==='choices'){
   need(choicesValid(raw.stages),'Choices require 1-6 valid stages');node.stages=clone(raw.stages);
  }
  return node;
 });
 for(const [i,node] of out.entries()){
  if(node.next!==null)need(ids.has(node.next),'Linked puzzle references an unknown node');
  else if(i<out.length-1)node.next=out[i+1].id;
 }
 // Packs form one linear progression: no cyclic or unreachable chains, even with explicit links.
 const visited=new Set();let id=out[0].id;
 while(id){need(!visited.has(id),'Linked puzzles may not contain a cycle');visited.add(id);id=out.find(x=>x.id===id)?.next||null;}
 need(visited.size===out.length,'Every puzzle must be reachable from the first node');
 return out;
}
export function validatePuzzlePack(pack){
 need(pack&&typeof pack==='object','Puzzle pack must be an object');const id=str(pack.id,60),name=str(pack.name,60);
 need(/^[a-z0-9-]{4,60}$/.test(id),'Invalid puzzle pack ID');need(name.length>=3,'Puzzle pack needs a name');
 return {id,type:'puzzle',name,entries:validatePuzzleEntries(pack.entries)};
}
export function seededRng(initial=1){let state=(Number(initial)||1)>>>0;return()=>((state=(1664525*state+1013904223)>>>0)/4294967296);}
export function generateRiddlePack({id='riddle-vault',name='Riddle Vault',count=6,seed=1,difficulty=2}={}){
 need(Number.isInteger(count)&&count>=1&&count<=12,'Generate between 1 and 12 riddles');
 need([1,2,3].includes(difficulty),'Difficulty must be 1-3');const rng=seededRng(seed);
 const pool=RIDDLE_BANK.map(({tier,...x})=>({...x,kind:'riddle',tier:tier||2}));
 // Difficulty prefers riddles of the matching tier, then the nearest tiers; seeded shuffle inside each tier.
 for(let i=pool.length-1;i>0;i--){const j=rand(rng,i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 pool.sort((a,b)=>Math.abs(a.tier-difficulty)-Math.abs(b.tier-difficulty));
 const entries=pool.slice(0,count).map(({tier,...r},i)=>({...r,id:`riddle-${i+1}-${r.id}`,clue:`Recorded tablet ${i+1}: ${r.title}.`}));
 return validatePuzzlePack({id,name,entries});
}
function neighbours(i,n){const row=Math.floor(i/n),col=i%n;return [row>0?i-n:-1,col<n-1?i+1:-1,row<n-1?i+n:-1,col>0?i-1:-1].filter(x=>x>=0);}
export function toggleLights(cells,index){need(Array.isArray(cells)&&cells.length===9&&Number.isInteger(index)&&index>=0&&index<9,'Bad keystone position');
 const out=[...cells];for(const at of [index,...neighbours(index,3)])out[at]=1-out[at];return out;
}
export function lightsHint(cells){for(let mask=0;mask<512;mask++){let s=[...cells];for(let k=0;k<9;k++)if(mask&(1<<k))s=toggleLights(s,k);if(s.every(x=>x===1))return Array.from({length:9},(_,k)=>k).filter(k=>mask&(1<<k));}return null;}
const slideMoves=(cells)=>neighbours(cells.indexOf(0),3);
function shuffleSlide(rng){let cells=[1,2,3,4,5,6,7,8,0],prev=-1;
 for(let i=0;i<36;i++){const choices=slideMoves(cells).filter(x=>x!==prev);const from=choices[rand(rng,choices.length)],blank=cells.indexOf(0);[cells[blank],cells[from]]=[cells[from],cells[blank]];prev=blank;}
 if(cells.every((x,i)=>x===[1,2,3,4,5,6,7,8,0][i]))return shuffleSlide(rng);return cells;
}
/** A* solution checker for the nine-tile ward puzzle; returns legal click indices. */
export function solveSlide(start,maxNodes=120000){
 need(Array.isArray(start)&&isPermutation(start,9),'Slide board must contain 0 through 8');
 const goal='123456780',first=start.join('');if(first===goal)return [];
 const h=key=>{let total=0;for(let i=0;i<9;i++){const v=Number(key[i]);if(!v)continue;const target=v-1;total+=Math.abs(Math.floor(target/3)-Math.floor(i/3))+Math.abs(target%3-i%3);}return total;};
 const heap=[],push=item=>{heap.push(item);let i=heap.length-1;while(i>0){let p=(i-1)>>1;if(heap[p].f<=heap[i].f)break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p;}},pop=()=>{const out=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){let l=i*2+1,r=l+1,small=i;if(l<heap.length&&heap[l].f<heap[small].f)small=l;if(r<heap.length&&heap[r].f<heap[small].f)small=r;if(small===i)break;[heap[small],heap[i]]=[heap[i],heap[small]];i=small;}}return out;};
 const g=new Map([[first,0]]),parent=new Map();push({key:first,f:h(first),cost:0});let explored=0;
 while(heap.length&&explored<maxNodes){let current=pop();if(current.cost!==g.get(current.key))continue;explored++;
  if(current.key===goal){const route=[];let key=goal;while(key!==first){const step=parent.get(key);route.push(step.click);key=step.before;}return route.reverse();}
  const blank=current.key.indexOf('0');for(const click of neighbours(blank,3)){
   const chars=current.key.split('');[chars[blank],chars[click]]=[chars[click],chars[blank]];const key=chars.join(''),cost=current.cost+1;
   if(cost<(g.get(key)??Infinity)){g.set(key,cost);parent.set(key,{before:current.key,click});push({key,cost,f:cost+h(key)});}
  }
 }
 return null;
}
// Fixed pipe-piece types; solution is a contiguous west-to-east route with no code execution.
export const PIPE_TYPES=['elbow','straight','elbow','elbow','straight','elbow','straight','elbow','elbow'];
export const PIPE_TARGET=[2,0,0,0,1,2,0,0,0];
const PORTS={elbow:[0,1],straight:[0,2]};
export function pipeConnections(type,rotation){need(type in PORTS,'Unknown pipe type');return PORTS[type].map(d=>(d+rotation)%4);}
export function pipeSolved(rotation){if(!Array.isArray(rotation)||rotation.length!==9||rotation.some(x=>!Number.isInteger(x)||x<0||x>3))return false;
 const reached=new Set(),stack=[0];const start=pipeConnections(PIPE_TYPES[0],rotation[0]);if(!start.includes(3))return false;
 while(stack.length){const i=stack.pop();if(reached.has(i))continue;reached.add(i);const open=pipeConnections(PIPE_TYPES[i],rotation[i]);if(i===8&&open.includes(1))return true;
  for(const dir of open){const r=Math.floor(i/3),c=i%3;if((dir===0&&r===0)||(dir===1&&c===2)||(dir===2&&r===2)||(dir===3&&c===0))continue;
   const dest=i+[ -3,1,3,-1 ][dir],other=(dir+2)%4;
   if(pipeConnections(PIPE_TYPES[dest],rotation[dest]).includes(other))stack.push(dest);
  }
 }return false;
}
export function gravityTilt(cells,dir){const dirs={N:[-1,0],S:[1,0],E:[0,1],W:[0,-1]};need(dirs[dir],'Choose N, S, E or W');
 let pos=cells.pos;const [dr,dc]=dirs[dir];for(let i=0;i<5;i++){const r=Math.floor(pos/5)+dr,c=pos%5+dc,dest=r*5+c;if(r<0||r>=5||c<0||c>=5||cells.walls.includes(dest))break;pos=dest;}return pos;
}
export function gravityPath(start,goal,walls){const begin={pos:start,walls,goal},seen=new Set([start]),queue=[{pos:start,route:[]}];while(queue.length){let p=queue.shift();if(p.pos===goal)return p.route;
  for(const dir of ['N','E','S','W']){const to=gravityTilt({...begin,pos:p.pos},dir);if(to!==p.pos&&!seen.has(to)){seen.add(to);queue.push({pos:to,route:[...p.route,dir]});}}
 }return null;
}
function createGravity(rng){const start=20,goal=4;for(let k=0;k<250;k++){
 const candidates=Array.from({length:25},(_,i)=>i).filter(x=>x!==start&&x!==goal);for(let j=candidates.length-1;j>0;j--){const ix=rand(rng,j+1);[candidates[j],candidates[ix]]=[candidates[ix],candidates[j]];}
 const walls=candidates.slice(0,4+rand(rng,4));const path=gravityPath(start,goal,walls);if(path&&path.length>=3&&path.length<=10)return {start,pos:start,goal,walls};
 }return {start,pos:start,goal,walls:[]};
}
function initCurrent(node,rng){switch(node.kind){
 case 'riddle':return {attempts:0};
 case 'sequence':case 'arrange':return {chosen:[],attempts:0};
 case 'melody':return {chosen:[],mode:'observe',attempts:0};
 case 'dials':return {values:node.labels.map(()=>0),attempts:0};
 case 'offer':case 'logic':return {values:node.labels.map(()=>null),attempts:0};
 case 'choices':return {step:0,attempts:0};
 case 'pipes':{const rotations=PIPE_TARGET.map(x=>(x+1+rand(rng,3))%4);if(pipeSolved(rotations))rotations[0]=(rotations[0]+1)%4;return {rotations,attempts:0};}
 case 'gravity':return {...createGravity(rng),attempts:0,moves:0};
 case 'lights':{let cells=Array(9).fill(1);for(const i of new Set(Array.from({length:3+rand(rng,4)},()=>rand(rng,9))))cells=toggleLights(cells,i);if(cells.every(x=>x===1))cells=toggleLights(cells,4);return {cells,attempts:0};}
 case 'slide':return {cells:shuffleSlide(rng),attempts:0,moves:0};
 default:fail('Unsupported puzzle kind');
}}
export function initPuzzleGame(gameId,seats,rng=Math.random,config={}){
 need(PUZZLE_IDS.has(gameId),'Unknown Puzzle Forge activity');need(Array.isArray(seats)&&seats.length>=1,'Puzzle requires a participant');
 let nodes=validatePuzzleEntries(config.puzzleNodes||PUZZLE_PRESETS[gameId]);const current=initCurrent(nodes[0],rng);
 return {gameId,seats:seats.map(x=>x.id),round:0,index:0,phase:'playing',done:false,winner:null,score:100,attempts:0,hintsUsed:0,displayHint:[],nodes,current,clues:[],history:[],last:'The puzzle awaits your first move.',completedBy:null,revision:0};
}
const curNode=s=>s.nodes[s.index];
function resolved(s,by,rng){const node=curNode(s);s.history.push({id:node.id,title:node.title,clue:node.clue,by});if(node.clue)s.clues.push(node.clue);s.last=`${node.title} solved. ${node.clue}`;
 s.score+=20;s.round++;if(!node.next){s.done=true;s.phase='complete';s.winner='party';s.completedBy=by;return;}
 const next=s.nodes.findIndex(x=>x.id===node.next);need(next>=0,'Broken puzzle chain');s.index=next;s.current=initCurrent(s.nodes[next],rng);s.displayHint=[];
}
function mistake(s,message){s.current.attempts++;s.attempts++;s.score=Math.max(0,s.score-3);s.last=message||'Not yet. The mechanism holds. Try another approach.';}
const validIndex=(v,n)=>Number.isInteger(v)&&v>=0&&v<n;
export function applyPuzzleGame(old,seatId,action,rng=Math.random){need(old&&!old.done,'Puzzle already completed');need(old.seats.includes(seatId),'That character is not at this puzzle');
 const s=clone(old),node=curNode(s),c=s.current,type=action?.type;
 need(typeof type==='string','Missing puzzle action');
 if(type==='hint'){
  need(s.displayHint.length<node.hints.length,'All hints have already been revealed');s.displayHint.push(node.hints[s.displayHint.length]);s.hintsUsed++;s.score=Math.max(0,s.score-2);s.last='A fresh hint appears beneath the mechanism.';s.revision++;return s;
 }
 switch(node.kind){
 case 'riddle':{
  need(type==='answer'&&typeof action.text==='string'&&action.text.length<=160,'Enter an answer of up to 160 characters');
  if(node.answers.some(x=>norm(x)===norm(action.text)))resolved(s,seatId,rng);else mistake(s,'The tablet rejects that answer. Consider another reading.');break;
 }
 case 'sequence':case 'arrange':{
  const target=node.solution;const total=node.kind==='sequence'?node.symbols.length:node.fragments.length;
  if(type==='tap'){need(validIndex(action.index,total),'Select a valid symbol');need(c.chosen.length<target.length,'Your sequence is full');
   if(node.kind==='arrange')need(!c.chosen.includes(action.index),'Fragment already chosen');c.chosen.push(action.index);s.last='A symbol is placed.';break;
  }
  if(type==='undo'){need(c.chosen.length>0,'Nothing to undo');c.chosen.pop();break;}
  need(type==='submit'&&c.chosen.length===target.length,'Complete the whole sequence first');
  if(c.chosen.every((v,i)=>v===target[i]))resolved(s,seatId,rng);else{mistake(s);c.chosen=[];}break;
 }
 case 'melody':{
  if(type==='watch'){c.mode='respond';c.chosen=[];s.last='The ceremonial bells fall silent. Repeat the sequence.';break;}
  need(c.mode==='respond','Observe the tone demonstration first');
  if(type==='tap'){need(validIndex(action.index,4),'Select one of the four bells');need(c.chosen.length<node.solution.length,'The memory phrase is full');c.chosen.push(action.index);
   if(c.chosen.length===node.solution.length){if(c.chosen.every((v,i)=>v===node.solution[i]))resolved(s,seatId,rng);else{mistake(s,'The choir resets the memory sequence. Watch and try again.');c.chosen=[];c.mode='observe';}}break;
  }
  if(type==='undo'){need(c.chosen.length>0,'Nothing to undo');c.chosen.pop();break;}
  fail('Choose a bell or return to its demonstration');
 }
 case 'dials':{
  if(type==='dial'){need(validIndex(action.index,node.labels.length),'Unknown dial');c.values[action.index]=(c.values[action.index]+1)%node.phases.length;break;}
  need(type==='submit','Rotate the dials and then test');
  if(c.values.every((v,i)=>v===node.solution[i]))resolved(s,seatId,rng);else mistake(s,'The lunar sigils briefly darken. Try another alignment.');break;
 }
 case 'offer':case 'logic':{
  if(type==='assign'){need(validIndex(action.index,3)&&validIndex(action.value,3),'Choose a guardian and one offering');c.values[action.index]=action.value;break;}
  if(type==='unassign'){need(validIndex(action.index,3),'Choose an existing guardian');c.values[action.index]=null;break;}
  need(type==='submit'&&c.values.every(x=>x!==null),'Assign every guardian before confirming');
  if(unique(c.values)&&c.values.every((v,i)=>v===node.solution[i]))resolved(s,seatId,rng);else mistake(s,'The guardians refuse the arrangement. Each offering may be used once.');break;
 }
 case 'choices':{
  need(type==='choose'&&validIndex(action.index,node.stages[c.step]?.options.length??0),'Choose one of the offered paths');
  if(action.index===node.stages[c.step].correct){c.step++;s.last='The ward recognises your answer.';if(c.step===node.stages.length)resolved(s,seatId,rng);}
  else mistake(s,'The ancient voice disagrees; you may try this stage again.');break;
 }
 case 'pipes':{
  if(type==='rotate'){need(validIndex(action.index,9),'Choose a pipe');c.rotations[action.index]=(c.rotations[action.index]+1)%4;if(pipeSolved(c.rotations))resolved(s,seatId,rng);break;}
  need(type==='submit','Rotate a pipe or test the water route');
  if(pipeSolved(c.rotations))resolved(s,seatId,rng);else mistake(s,'Water splashes into a sealed passage. Check matching pipe openings.');break;
 }
 case 'gravity':{
  need(type==='tilt'&&['N','S','E','W'].includes(action.direction),'Choose a direction of gravity');let next=gravityTilt(c,action.direction);
  if(next===c.pos){s.last='The crystal cannot move in that direction.';break;}c.pos=next;c.moves++;
  if(c.pos===c.goal)resolved(s,seatId,rng);else s.last='The crystal slides until a wall arrests its movement.';break;
 }
 case 'lights':{
  need(type==='press'&&validIndex(action.index,9),'Choose a keystone');c.cells=toggleLights(c.cells,action.index);if(c.cells.every(x=>x===1))resolved(s,seatId,rng);break;
 }
 case 'slide':{
  need(type==='slide'&&validIndex(action.index,9),'Choose a numbered wardplate');const blank=c.cells.indexOf(0);
  need(neighbours(blank,3).includes(action.index),'Slide only a tile touching the empty slot');[c.cells[blank],c.cells[action.index]]=[c.cells[action.index],c.cells[blank]];c.moves++;
  if(c.cells.every((v,i)=>v===[1,2,3,4,5,6,7,8,0][i]))resolved(s,seatId,rng);break;
 }
 default:fail('Unknown puzzle kind');
 }
 s.revision++;return s;
}
export function projectPuzzleGame(board,viewerId=null,gm=false){if(!board)return null;
 // Intentionally exclude node solution, aliases, future nodes, stage correct indexes and hidden memory patterns.
 const s=clone(board),node=curNode(board),kind=node.kind;
 delete s.nodes;s.nodeCount=board.nodes.length;
 const challenge={id:node.id,title:node.title,prompt:node.prompt,kind};
 for(const key of ['symbols','fragments','labels','phases','items'])if(node[key])challenge[key]=clone(node[key]);
 if(kind==='choices')challenge.stage={step:s.current.step,total:node.stages.length,prompt:node.stages[s.current.step]?.prompt||'',options:clone(node.stages[s.current.step]?.options||[])};
 challenge.hintCount=node.hints.length;
 if(kind==='sequence')challenge.solutionLength=node.solution.length;
 if(kind==='melody')challenge.demonstration=s.current.mode==='observe'?clone(node.solution):null;
 s.challenge=challenge;s.hints=clone(s.displayHint);delete s.displayHint;
 // GM also receives the same safe projected state; configuration should be handled through Pack Studio.
 return s;
}
