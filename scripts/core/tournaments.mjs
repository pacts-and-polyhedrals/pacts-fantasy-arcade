/** Stage-three knockout brackets. Each bracket match can launch a real shared-game table. */
const ensure=(value,msg)=>{if(!value)throw Error(msg)};
export function createBracket({id,name,gameId,participants}){
 ensure(typeof id==='string'&&/^tour-[a-zA-Z0-9-]{8,65}$/.test(id),'Invalid tournament ID');
 ensure(typeof name==='string'&&name.trim().length>=3&&name.trim().length<=80,'Tournament name must be 3–80 characters');
 ensure(typeof gameId==='string','Choose a game');
 ensure(Array.isArray(participants)&&[2,4,8].includes(participants.length),'A tournament needs exactly 2, 4 or 8 competitors');
 const seen=new Set();const entrants=participants.map((p,i)=>{
  ensure(p&&typeof p.id==='string'&&/^[a-zA-Z0-9_-]{1,65}$/.test(p.id)&&!seen.has(p.id),'Duplicate or invalid competitor IDs');seen.add(p.id);
  ensure(typeof p.name==='string'&&p.name.trim().length>=2&&p.name.trim().length<=60,'Invalid competitor name');
  ensure(['person','npc','gm-npc'].includes(p.kind),'Invalid competitor kind');
  if(p.kind!=='npc')ensure(typeof p.userId==='string'&&p.userId.length>=1&&p.userId.length<=100,'Player must have an owner user ID');
  return {id:p.id,name:p.name.trim(),kind:p.kind,userId:p.kind==='npc'?null:p.userId,seed:i+1};
 });
 const rounds=[];for(let size=entrants.length,r=0;size>1;size/=2,r++){
  rounds.push(Array.from({length:size/2},(_,i)=>({id:`r${r+1}m${i+1}`,round:r,slot:i,a:r===0?entrants[i*2].id:null,b:r===0?entrants[i*2+1].id:null,tableId:null,winner:null,status:'waiting',method:null})));
 }
 return {id,name:name.trim(),gameId,participants:entrants,rounds,champion:null,createdAt:Date.now(),updatedAt:Date.now(),audit:[]};
}
export function findBracketMatch(t,matchId){for(const round of t.rounds){const m=round.find(m=>m.id===matchId);if(m)return m;}return null;}
export function advanceBracket(t,matchId,winnerId,method='table'){
 const match=findBracketMatch(t,matchId);ensure(match,'Tournament match not found');ensure(match.a&&match.b,'Match competitors are not determined');ensure(!match.winner,'Match already has a winner');ensure([match.a,match.b].includes(winnerId),'Winner must be one of the competing entrants');
 match.winner=winnerId;match.status='complete';match.method=method;
 const row=match.round;if(row===t.rounds.length-1)t.champion=winnerId;
 else{const next=t.rounds[row+1][Math.floor(match.slot/2)];next[match.slot%2===0?'a':'b']=winnerId;}
 t.updatedAt=Date.now();t.audit.push({event:'result',matchId,winnerId,method,at:Date.now()});return match;
}
export function recordBracketGame(t,matchId,table){const m=findBracketMatch(t,matchId);if(!m||m.winner)return null;
 if(table.status!=='complete'||!table.board||!Number.isInteger(table.board.winner))return null;
 const winner=[m.a,m.b][table.board.winner];if(!winner)return null;
 return advanceBracket(t,matchId,winner,'automatic');
}
export function publicBracket(t){return structuredClone(t);}
