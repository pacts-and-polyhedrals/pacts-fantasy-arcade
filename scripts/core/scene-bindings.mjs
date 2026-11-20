/** Safe, declarative scene bindings. No user-authored scripts are evaluated. */
import {PUZZLE_IDS} from './puzzle-data.mjs';
const ensure=(p,m)=>{if(!p)throw Error(m);};
const ident=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,110}$/.test(s);
export function validateBinding(b){
 ensure(b&&typeof b==='object','Binding is required');
 ensure(ident(b.id)&&ident(b.sceneId)&&ident(b.sourceId)&&ident(b.effectId),'Invalid scene or document ID');
 ensure(PUZZLE_IDS.has(b.gameId),'Only Puzzle Forge activities may be bound to scenes');
 ensure(['Region','Tile'].includes(b.sourceKind),'Scene source must be a Region or Tile');
 ensure(['Tile','Wall'].includes(b.effectKind),'Effect must target a Tile or Wall');
 ensure((b.effectKind==='Tile'&&['reveal','hide'].includes(b.effectAction))||(b.effectKind==='Wall'&&['open','close'].includes(b.effectAction)),'Effect action does not match its target');
 ensure(!b.packId||/^[a-z0-9-]{4,60}$/.test(b.packId),'Invalid puzzle pack reference');
 return {id:b.id,sceneId:b.sceneId,sceneName:String(b.sceneName||'').slice(0,100),sourceKind:b.sourceKind,sourceId:b.sourceId,effectKind:b.effectKind,effectId:b.effectId,effectAction:b.effectAction,gameId:b.gameId,packId:b.packId||'',activeTableId:b.activeTableId||null};
}
export function findSceneDocument(scene,kind,id){return kind==='Region'?scene?.regions?.get?.(id):kind==='Tile'?scene?.tiles?.get?.(id):kind==='Wall'?scene?.walls?.get?.(id):null;}
export function validateBindingAgainstScene(binding,scene){
 const b=validateBinding(binding);ensure(scene?.id===b.sceneId,'Binding scene does not match the selected scene');
 ensure(findSceneDocument(scene,b.sourceKind,b.sourceId),'Scene trigger not found');
 const reward=findSceneDocument(scene,b.effectKind,b.effectId);ensure(reward,'Scene reward target not found');
 if(b.effectKind==='Wall')ensure(Number(reward.door)>0,'The wall must be configured as a door');
 return b;
}
function pointInsideTile(tile,point){
 if(!tile||!Number.isFinite(tile.x)||!Number.isFinite(tile.y)||!Number.isFinite(tile.width)||!Number.isFinite(tile.height)||tile.width<=0||tile.height<=0)return false;
 const cx=tile.x+tile.width/2,cy=tile.y+tile.height/2,angle=-(Number(tile.rotation)||0)*Math.PI/180;
 const dx=point.x-cx,dy=point.y-cy,x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle);
 return Math.abs(x)<=tile.width/2&&Math.abs(y)<=tile.height/2;
}
export function pointInBinding(binding,scene,point){
 if(!binding||!scene||scene.id!==binding.sceneId||!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return false;
 const document=findSceneDocument(scene,binding.sourceKind,binding.sourceId);if(!document)return false;
 if(binding.sourceKind==='Region'){
  try{return Boolean(document.testPoint({x:point.x,y:point.y,elevation:Number(point.elevation)||0}));}catch{return false;}
 }
 return pointInsideTile(document,point);
}
export function triggeredOnEntry(binding,scene,previous,next){return !pointInBinding(binding,scene,previous)&&pointInBinding(binding,scene,next);}
export async function applySceneReward(binding,scene){const b=validateBindingAgainstScene(binding,scene);
 const target=findSceneDocument(scene,b.effectKind,b.effectId);
 if(b.effectKind==='Tile')await target.update({hidden:b.effectAction==='hide'});
 else await target.update({ds:b.effectAction==='open'?1:0});
 return {sceneId:scene.id,targetId:b.effectId,action:b.effectAction};
}
