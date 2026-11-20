/**
 * Native Foundry adaptation of the original Wyvern Chess rules by DM Asmo /
 * Pacts & Polyhedrals. Original prototype:
 * https://github.com/pacts-and-polyhedrals/wyvern-chess
 * Licensed with the included Wyvern Chess Community License.
 * No iframe, remote calls or external dependency is used by this game engine.
 */
const W=12,H=8;
export const WYVERN_PIECES=['sylph','griffon','dragon','warrior','oliphant','unicorn','hero','thief','cleric','mage','paladin','king','dwarf','basilisk','elemental'];
export const WYVERN_GLYPHS={sylph:'🧚',griffon:'🦅',dragon:'🐉',warrior:'⚔️',oliphant:'🐘',unicorn:'🦄',hero:'🛡️',thief:'🗡️',cleric:'✨',mage:'🧙',paladin:'⚜️',king:'👑',dwarf:'⛏️',basilisk:'🐍',elemental:'🔥'};
const VALUES={king:1000,mage:11,paladin:10,cleric:9,dragon:8,griffon:5,oliphant:5,hero:4.5,thief:4,elemental:4,basilisk:3,unicorn:2.5,dwarf:2,sylph:1,warrior:1};
const key=(L,f,r)=>`${L},${f},${r}`;
const coord=k=>String(k).split(',').map(Number);
const valid=(L,f,r)=>Number.isInteger(L)&&Number.isInteger(f)&&Number.isInteger(r)&&L>=1&&L<=3&&f>=0&&f<W&&r>=0&&r<H;
const get=(board,L,f,r)=>board[key(L,f,r)];
const opposite=s=>s==='gold'?'scarlet':'gold';
const direction=s=>s==='gold'?1:-1;
const home={gold:[0,2,4,6,8,10].map(f=>[3,f,1]),scarlet:[1,3,5,7,9,11].map(f=>[3,f,6])};
const assert=(condition,message)=>{if(!condition)throw Error(message)};

export function wyvernInitial(){
 const b={};const put=(L,f,r,type,side)=>{b[key(L,f,r)]={type,side}};
 for(const f of [0,2,4,6,8,10])put(3,f,1,'sylph','gold');
 for(const f of [1,3,5,7,9,11])put(3,f,6,'sylph','scarlet');
 for(const side of ['gold','scarlet']){const r=side==='gold'?0:7;
  put(3,2,r,'griffon',side);put(3,10,r,'griffon',side);put(3,6,r,'dragon',side);
  const back=['oliphant','unicorn','hero','thief','cleric','mage','king','paladin','thief','hero','unicorn','oliphant'];
  back.forEach((t,f)=>put(2,f,r,t,side));for(let f=0;f<W;f++)put(2,f,side==='gold'?1:6,'warrior',side);
  put(1,6,r,'elemental',side);put(1,2,r,'basilisk',side);put(1,10,r,'basilisk',side);
  for(const f of [0,2,4,6,8,10])put(1,f,side==='gold'?1:6,'dwarf',side);
 }
 return b;
}
export function initWyvern(){return {gameId:'wyvern-chess',cells:wyvernInitial(),turn:0,phase:'play',done:false,winner:null,moveCount:0,check:null,log:[],replay:[],captured:{gold:[],scarlet:[]}};}
export function wyvernFrozen(board,L,f,r,side){return L===2&&get(board,1,f,r)?.type==='basilisk'&&get(board,1,f,r)?.side!==side;}
/** Mode attack returns squares, mode move returns moves with from/to and remote/promote. */
export function wyvernGenerate(board,from,mode='move'){
 const [L,f,r]=typeof from==='string'?coord(from):from; if(!valid(L,f,r))return [];
 const p=get(board,L,f,r);if(!p)return [];
 const side=p.side,dir=direction(side),attack=mode==='attack',out=[];
 const mk=(nl,nf,nr,extra={})=>({from:key(L,f,r),to:key(nl,nf,nr),...extra});
 function candidate(nl,nf,nr,canMove=true,canCapture=true){
  if(!valid(nl,nf,nr))return;
  if(attack){if(canCapture)out.push(key(nl,nf,nr));return;}
  const target=get(board,nl,nf,nr);
  if(!target){if(canMove)out.push(mk(nl,nf,nr));}
  else if(target.side!==side&&canCapture)out.push(mk(nl,nf,nr,{capture:true}));
 }
 function ray(nl,df,dr,max=99){let nf=f,nr=r;
  for(let k=0;k<max;k++){
   nf+=df;nr+=dr;if(!valid(nl,nf,nr))break;
   const target=get(board,nl,nf,nr);
   if(!target){if(attack)out.push(key(nl,nf,nr));else out.push(mk(nl,nf,nr));continue;}
   if(attack)out.push(key(nl,nf,nr));
   else if(target.side!==side)out.push(mk(nl,nf,nr,{capture:true}));
   break;
  }
 }
 const diagonals=[[1,1],[1,-1],[-1,1],[-1,-1]];
 const knights=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
 switch(p.type){
 case 'sylph':
  if(L===3){candidate(3,f-1,r+dir,true,false);candidate(3,f+1,r+dir,true,false);candidate(3,f,r+dir,false,true);candidate(2,f,r,false,true);}
  else if(L===2){candidate(3,f,r,true,false);for(const [nl,nf,nr] of home[side])candidate(nl,nf,nr,true,false);}break;
 case 'griffon':
  if(L===3){for(const [df,dr] of [[3,2],[3,-2],[-3,2],[-3,-2],[2,3],[2,-3],[-2,3],[-2,-3]])candidate(3,f+df,r+dr);
   for(const [df,dr] of diagonals)candidate(2,f+df,r+dr);
  }else if(L===2)for(const [df,dr] of diagonals){candidate(2,f+df,r+dr);candidate(3,f+df,r+dr);}break;
 case 'dragon':
  if(L===3){for(const [df,dr] of diagonals)ray(3,df,dr);
   for(const [df,dr] of [[1,0],[-1,0],[0,1],[0,-1]])candidate(3,f+df,r+dr);
   for(const [df,dr] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
    let nf=f+df,nr=r+dr;if(!valid(2,nf,nr))continue;
    const target=get(board,2,nf,nr);
    if(attack)out.push(key(2,nf,nr));else if(target&&target.side!==side)out.push(mk(2,nf,nr,{capture:true,remote:true}));
   }
  }break;
 case 'warrior':
  if(L===2){if(!attack&&valid(2,f,r+dir)&&!get(board,2,f,r+dir))out.push(mk(2,f,r+dir,{promote:r+dir===(side==='gold'?7:0)}));
   for(const df of [-1,1]){let nf=f+df,nr=r+dir;if(!valid(2,nf,nr))continue;
    if(attack)out.push(key(2,nf,nr));else if(get(board,2,nf,nr)?.side===opposite(side))out.push(mk(2,nf,nr,{capture:true,promote:nr===(side==='gold'?7:0)}));
   }
  }break;
 case 'oliphant':if(L===2)for(const [df,dr] of [[1,0],[-1,0],[0,1],[0,-1]])ray(2,df,dr);break;
 case 'thief':if(L===2)for(const [df,dr] of diagonals)ray(2,df,dr);break;
 case 'unicorn':if(L===2)for(const [df,dr] of knights)candidate(2,f+df,r+dr);break;
 case 'mage':
  if(L===2)for(const [df,dr] of [[1,0],[-1,0],[0,1],[0,-1],...diagonals])ray(2,df,dr);
  for(const dl of [1,2,-1,-2])candidate(L+dl,f,r);break;
 case 'hero':
  if(L===2)for(const [df,dr] of diagonals){candidate(2,f+df,r+dr);candidate(2,f+2*df,r+2*dr);candidate(1,f+df,r+dr);candidate(3,f+df,r+dr);}
  else for(const [df,dr] of diagonals)candidate(2,f+df,r+dr);break;
 case 'cleric':
  for(const df of [-1,0,1])for(const dr of [-1,0,1])if(df||dr)candidate(L,f+df,r+dr);
  candidate(L+1,f,r);candidate(L-1,f,r);break;
 case 'paladin':
  for(const df of [-1,0,1])for(const dr of [-1,0,1])if(df||dr)candidate(L,f+df,r+dr);
  if(L===2)for(const [df,dr] of knights)candidate(2,f+df,r+dr);
  for(const dl of [1,-1])for(const [df,dr] of [[2,0],[-2,0],[0,2],[0,-2]])candidate(L+dl,f+df,r+dr);
  for(const dl of [2,-2])for(const [df,dr] of [[1,0],[-1,0],[0,1],[0,-1]])candidate(L+dl,f+df,r+dr);break;
 case 'king':
  if(L===2){for(const df of [-1,0,1])for(const dr of [-1,0,1])if(df||dr)candidate(2,f+df,r+dr);candidate(1,f,r);candidate(3,f,r);}
  else candidate(2,f,r);break;
 case 'dwarf':
  if(L===1||L===2){candidate(L,f,r+dir,true,false);candidate(L,f-1,r,true,false);candidate(L,f+1,r,true,false);
   candidate(L,f-1,r+dir,false,true);candidate(L,f+1,r+dir,false,true);
  }
  if(L===1)candidate(2,f,r,false,true);else if(L===2)candidate(1,f,r,true,false);break;
 case 'basilisk':
  if(L===1){candidate(1,f-1,r+dir);candidate(1,f+1,r+dir);candidate(1,f,r+dir);candidate(1,f,r-dir,true,false);}break;
 case 'elemental':
  if(L===1){for(const [df,dr] of [[1,0],[-1,0],[0,1],[0,-1]])ray(1,df,dr,2);
   for(const [df,dr] of diagonals)candidate(1,f+df,r+dr);
   for(const [df,dr] of [[1,0],[-1,0],[0,1],[0,-1]])candidate(2,f+df,r+dr);
  }else if(L===2)for(const [df,dr] of [[1,0],[-1,0],[0,1],[0,-1]])candidate(1,f+df,r+dr);break;
 }
 return out;
}
export function wyvernThreatened(board,target,bySide){for(const [pos,p] of Object.entries(board))if(p.side===bySide&&wyvernGenerate(board,pos,'attack').includes(target))return true;return false;}
export function wyvernCheck(board,side){const king=Object.entries(board).find(([,p])=>p.side===side&&p.type==='king');return king?wyvernThreatened(board,king[0],opposite(side)):true;}
export function wyvernApplyBoard(board,move){const next={...board},p=next[move.from];assert(p,'Source piece not found');const captured=next[move.to]||null;
 if(move.remote)delete next[move.to];else{delete next[move.from];next[move.to]={...p,type:move.promote?'hero':p.type};}
 return {cells:next,captured};
}
export function wyvernMoves(s,forSide=null){const side=forSide|| (s.turn===0?'gold':'scarlet'),all=[];
 for(const [pos,p] of Object.entries(s.cells)){if(p.side!==side)continue;const [L,f,r]=coord(pos);if(wyvernFrozen(s.cells,L,f,r,side))continue;
  for(const move of wyvernGenerate(s.cells,pos,'move')){const after=wyvernApplyBoard(s.cells,move).cells;if(!wyvernCheck(after,side))all.push(move);}
 }return all;
}
export function applyWyvern(old,seatId,seatIds,action){
 const s=structuredClone(old);assert(!s.done,'Wyvern Chess has ended');assert(seatIds[s.turn]===seatId,'Wait for your turn');assert(action?.type==='move','Choose a piece then a destination');
 const validKey=p=>typeof p==='string'&&/^[123],(?:[0-9]|1[01]),[0-7]$/.test(p);
 assert(validKey(action.from)&&validKey(action.to),'Invalid board position');
 const move=wyvernMoves(s).find(x=>x.from===action.from&&x.to===action.to);assert(move,'That Wyvern Chess move is not legal');
 const {cells,captured}=wyvernApplyBoard(s.cells,move),p=s.cells[move.from];s.cells=cells;
 if(captured)s.captured[captured.side].push(captured.type);
 const desc=`${p.side} ${p.type}: ${move.from} → ${move.to}${captured?` takes ${captured.type}`:''}${move.promote?' promotes to hero':''}${move.remote?' (remote strike)':''}`;
 s.log.push(desc);s.log=s.log.slice(-45);s.replay.push({turn:s.moveCount,side:p.side,from:move.from,to:move.to,capture:captured?.type||null,promote:Boolean(move.promote),remote:Boolean(move.remote)});
 s.moveCount++;s.turn=1-s.turn;s.check=wyvernCheck(s.cells,s.turn===0?'gold':'scarlet')?s.turn:null;
 const next=wyvernMoves(s);if(!next.length){s.done=true;s.phase='finished';s.winner=s.check===null?'draw':1-s.turn;}
 if(s.moveCount>=300){s.done=true;s.phase='finished';s.winner='draw';}
 return s;
}
export function wyvernNpcMove(s,seed=Math.random){
 const moves=wyvernMoves(s);if(!moves.length)return null;const opp=s.turn===0?'scarlet':'gold';
 let max=-Infinity,top=[];
 for(const move of moves){const gain=VALUES[s.cells[move.to]?.type]||0;const after=wyvernApplyBoard(s.cells,move).cells;const reply=move.remote?0:(wyvernThreatened(after,move.to,opp)?VALUES[s.cells[move.from]?.type]*0.8:0);
  const score=gain*3-reply+(move.promote?5:0)+(wyvernCheck(after,opp)?1.2:0);
  if(score>max+0.001){max=score;top=[move];}else if(Math.abs(score-max)<0.001)top.push(move);
 }
 return {type:'move',...top[Math.floor(seed()*top.length)]};
}

/** Rebuild a public Wyvern Chess position from the original board and move history.
 * Index 0 = before the first move, index N = after N moves.
 * Captured pieces, promotions and remote strikes are deterministically replayed.
 */
export function wyvernReplayBoard(s,step){
 assert(Number.isInteger(step)&&step>=0&&step<=s.replay.length,'Invalid replay frame');
 let cells=wyvernInitial();
 for(const move of s.replay.slice(0,step))cells=wyvernApplyBoard(cells,move).cells;
 return cells;
}
