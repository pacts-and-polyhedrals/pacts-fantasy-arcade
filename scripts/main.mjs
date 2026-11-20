import {PLAYABLE,GAMES,LESSONS} from "./core/data.mjs";
import {ArcadeSessions} from "./core/session.mjs";
import {checkersMoves} from "./core/rules.mjs";
import {wyvernMoves} from "./core/wyvern.mjs";
import {PUZZLE_IDS} from "./core/puzzle-data.mjs";
import {ARENA_IDS,ARENA_CONFIGS} from "./core/arena-data.mjs";
import {makeArenaProfile,ARENA_ADAPTER_PROTOCOL} from './core/arena-adapter.mjs';
import {detectArcadeSystem,isImportableActor,previewCharacterForGame,makeWorldLink,PRIORITY_SYSTEMS} from './core/system-bridge.mjs';
import {generateRiddlePack} from "./core/puzzle-engine.mjs";
import {validateBindingAgainstScene,triggeredOnEntry,applySceneReward} from "./core/scene-bindings.mjs";
import {renderArcade,ARCADE_VERSION} from "./ui/view.mjs";
import {RULEBOOK_PACK,RULEBOOK_ENTRY_ID,rulePageId} from "./core/rules-text.mjs";

const MODULE="pacts-fantasy-arcade";
const CHANNEL=`module.${MODULE}`;
const contentValue=(root,selector)=>root.querySelector(selector)?.value||"";
const localCatalog=PLAYABLE.map(g=>({...g,title:g.id.replaceAll("-"," "),category:g.type,automation:g.intro}));
let bridge;
/** Foundry IDs work on plain-http LAN hosts where crypto.randomUUID is unavailable (insecure context). */
const uid=()=>globalThis.foundry?.utils?.randomID?.(20)||globalThis.crypto?.randomUUID?.().replaceAll('-','')||`${Date.now().toString(36)}${Math.random().toString(36).slice(2,12)}`;
async function confirmDialog(content,title='Fantasy Arcade'){
 const D=globalThis.foundry?.applications?.api?.DialogV2;
 if(D?.confirm)return Boolean(await D.confirm({window:{title},content:`<p>${content}</p>`,rejectClose:false,modal:true}));
 return window.confirm(content);
}
async function openRulebook(gameId=''){
 const pack=game.packs?.get(`${MODULE}.${RULEBOOK_PACK}`);
 if(!pack){ui.notifications.warn('Fantasy Arcade: the Rulebook compendium is missing. The full rules are also shown on every game page.');return;}
 const entry=await pack.getDocument(RULEBOOK_ENTRY_ID);if(!entry)throw Error('Rulebook entry not found in the compendium');
 const pageId=gameId?rulePageId(gameId):undefined;
 try{await entry.sheet.render({force:true,...(pageId&&entry.pages?.get?.(pageId)?{pageId}:{})});}catch(err){entry.sheet.render(true,pageId?{pageId}:{});}
}

class FantasyArcadeWindow extends foundry.applications.api.ApplicationV2 {
 static DEFAULT_OPTIONS={id:"pfa-window",classes:["pfa-application"],window:{title:"Pacts & Polyhedrals · Fantasy Arcade",icon:"fa-solid fa-dice-d20",resizable:true},position:{width:1090,height:750}};
 constructor(...args){super(...args);this.selected="coin-of-fate";this.currentId=null;this.seatId=null;this.showAll=false;this.filter="";this.tutorialStep=0;this.selectedSquare=null;this.aimX=0;this.aimY=0;this.power=70;this.animating=false;this.meterStart=performance.now();this.packOpen=false;this.packType="trivia";this.packName="New adventure pack";this.packJSON=null;this.editPackId=null;this.packChoice="";this.coinMode="classic";this.coinRounds=5;this.aimValue=50;this.angle=45;this.heat=50;this.ingredient=0;this.bidQty=2;this.bidFace=3;this.selectedCard=0;this.selectedLane=0;this.claimRank=1;this.wyvernLayer=2;this.selectedWyvern=null;this.tourneyOpen=false;this.tourneyId=null;this.tourneyUsers=[];this.tourneyNpcs=0;this.tourneyGMNpcs=0;this.tourneyName="The Gilded Cup";this.tourneyGame="waterdeep-hold-em";this.replayIndex=-1;this.practiceAnswer=null;this.forgeOpen=false;this.arenaAbility='move';this.arenaDelivery='heroic';this.actorSelections={};this.worldSceneId=null;this.worldJournalId=null;}
 _context(){const session=bridge?.sessions.find(s=>s.id===this.currentId)||null;
  const owned=session?.seats?.filter(z=>z.ownerId===game.user.id)||[];
  if(!owned.find(z=>z.id===this.seatId))this.seatId=owned[0]?.id||null;
  const selectedScene=globalThis.canvas?.scene||game.scenes?.current||null;
  const scene=selectedScene?{id:selectedScene.id,name:selectedScene.name,sources:[...selectedScene.regions||[]].map(x=>({kind:'Region',id:x.id,name:x.name||x.id})).concat([...selectedScene.tiles||[]].map(x=>({kind:'Tile',id:x.id,name:x.name||x.id}))),effects:[...selectedScene.tiles||[]].map(x=>({kind:'Tile',id:x.id,name:x.name||x.id})).concat([...selectedScene.walls||[]].filter(x=>Number(x.door)>0).map(x=>({kind:'Wall',id:x.id,name:x.name||x.id})))}:null;
  const systemInfo=detectArcadeSystem(game);
  const worldActors=game.user.isGM?[...(game.actors?.contents||game.actors||[])].filter(a=>isImportableActor(a,systemInfo.id)).slice(0,400).map(a=>({id:a.id,name:a.name,ownerId:[...(game.users?.contents||game.users||[])].find(u=>u.character?.id===a.id)?.id||null})):[];
  const worldScenes=game.user.isGM?[...(game.scenes?.contents||game.scenes||[])].filter(x=>x?.id).slice(0,150).map(x=>({id:x.id,name:x.name})):[];
  const worldJournals=game.user.isGM?[...(game.journal?.contents||game.journal||[])].filter(x=>x?.id).slice(0,150).map(x=>({id:x.id,name:x.name})):[];
  const actorPreviews={};
  if(game.user.isGM&&session?.status==='lobby')for(const seat of session.seats){
   const actorId=this.actorSelections[seat.id]??seat.characterLink?.actorId??worldActors.find(a=>a.ownerId===seat.ownerId)?.id;
   const actor=actorId&&game.actors?.get?.(actorId);
   if(actor)try{actorPreviews[seat.id]=previewCharacterForGame(actor,{systemId:systemInfo.id,systemVersion:systemInfo.version,gameId:session.gameId});}
   catch(error){console.warn('Fantasy Arcade: Actor preview rejected',error);}
  }
  return {systemInfo,worldActors,worldScenes,worldJournals,actorSelections:this.actorSelections,actorPreviews,worldSceneId:this.worldSceneId,worldJournalId:this.worldJournalId,activeSceneId:selectedScene?.id||null,scene,bindings:game.user.isGM?(bridge?.bindings||[]):[],forgeOpen:this.forgeOpen,catalog:bridge?.catalog||localCatalog,sessions:bridge?.sessions||[],session,selected:this.selected,seatId:this.seatId,gm:game.user.isGM,user:{id:game.user.id,name:game.user.name},showAll:this.showAll,filter:this.filter,tutorialStep:this.tutorialStep,selectedSquare:this.selectedSquare,aimX:this.aimX,aimY:this.aimY,power:this.power,reducedMotion:window.matchMedia("(prefers-reduced-motion: reduce)").matches||game.settings.get(MODULE,"reducedMotion"),packOpen:this.packOpen,packs:bridge?.packs||[],ledger:bridge?.ledger||[],packType:this.packType,packName:this.packName,packJSON:this.packJSON,editPackId:this.editPackId,packChoice:this.packChoice,coinMode:this.coinMode,coinRounds:this.coinRounds,aimValue:this.aimValue,angle:this.angle,heat:this.heat,ingredient:this.ingredient,bidQty:this.bidQty,bidFace:this.bidFace,selectedCard:this.selectedCard,selectedLane:this.selectedLane,claimRank:this.claimRank,wyvernLayer:this.wyvernLayer,selectedWyvern:this.selectedWyvern,replayIndex:this.replayIndex,arenaAbility:this.arenaAbility,arenaDelivery:this.arenaDelivery,practiceAnswer:this.practiceAnswer,tourneyOpen:this.tourneyOpen,tourneyId:this.tourneyId,tourneyUsers:this.tourneyUsers,tourneyNpcs:this.tourneyNpcs,tourneyGMNpcs:this.tourneyGMNpcs,tourneyName:this.tourneyName,tourneyGame:this.tourneyGame,tournaments:bridge?.tournaments||[],users:[...game.users].filter(u=>u.active).map(u=>({id:u.id,name:u.name}))};
 }
 async _renderHTML(){return renderArcade(this._context());}
 _replaceHTML(html,content){content.innerHTML=html;}
 _onRender(){const content=this.window.content;
  if(this._context().session?.gameId==="kattal-s-hammer")this.meterStart=performance.now();
  content.onclick=(event)=>{const el=event.target.closest("[data-act]");if(el&&content.contains(el)){this.click(event,el).catch(err=>this._alert(err));}};
  content.oninput=(event)=>{const el=event.target;const a=el.dataset?.act;
   if(a==="power"){this.power=Number(el.value);content.querySelectorAll("output").forEach(o=>o.textContent=`${this.power}%`);const needle=content.querySelector(".pfa-meterneedle");if(needle)needle.style.left=`${this.power}%`;}
   else if(a==="aim-value")this.aimValue=Number(el.value);
   else if(a==="arc-angle")this.angle=Number(el.value);
   else if(a==="heat")this.heat=Number(el.value);
   else if(a==="search"){this.filter=el.value;this.refreshSearch(el);}
  };
  content.onchange=event=>{const el=event.target,a=el.dataset?.act;
   if(a==="tournament-game")this.tourneyGame=el.value;
   if(a==='world-actor-select'){this.actorSelections[el.dataset.seat]=el.value;this.refresh();return;}
   if(a==='world-scene-select'){this.worldSceneId=el.value;this.refresh();return;}
   if(a==='world-journal-select'){this.worldJournalId=el.value;this.refresh();return;}
   if(a==='arena-kit')bridge.send('configureArenaSeat',{id:this.currentId,seatId:el.dataset.seat,kit:el.value}).catch(e=>this._alert(e));
   if(a==='arena-persona')bridge.send('configureArenaSeat',{id:this.currentId,seatId:el.dataset.seat,persona:el.value}).catch(e=>this._alert(e));
   if(a==='arena-delivery')this.arenaDelivery=el.value;
   if(a==='arena-difficulty')bridge.send('configureArena',{id:this.currentId,difficulty:Number(el.value)}).catch(e=>this._alert(e));
   if(a==="seat"){this.seatId=el.value;this.selectedSquare=null;this.bidQty=2;this.bidFace=3;this.selectedCard=0;this.selectedLane=0;this.claimRank=1;this.wyvernLayer=2;this.selectedWyvern=null;this.tourneyOpen=false;this.tourneyId=null;this.tourneyUsers=[];this.tourneyNpcs=0;this.tourneyGMNpcs=0;this.tourneyName="The Gilded Cup";this.tourneyGame="waterdeep-hold-em";this.arenaAbility='move';this.refresh();}
   if(a==="all"){this.showAll=el.checked;this.refresh();}
   if(a==="pack-choice")this.packChoice=el.value;
   if(a==="coin-mode")this.coinMode=el.value;
   if(a==="coin-rounds")this.coinRounds=Number(el.value);
   if(a==="puzzle-assignment"){
    const index=Number(el.dataset.index),value=el.value;
    this.play(value===""?{type:"unassign",index}:{type:"assign",index,value:Number(value)}).catch(err=>this._alert(err));
   }
   if(["aim-value","arc-angle","heat"].includes(a))this.refresh();
  };
  content.onkeydown=event=>{if(event.key==="Enter"&&event.target.dataset?.act==="puzzle-answer-input"){event.preventDefault();this.play({type:"answer",text:event.target.value}).catch(err=>this._alert(err));}else if(event.key==="Enter"&&event.target.dataset?.act==="answer-input"){event.preventDefault();this.play({type:"answer",text:event.target.value});}else if((event.key==="Enter"||event.key===" ")&&event.target.dataset?.act==="aim"){event.preventDefault();this.aimX=0;this.aimY=0;this.refresh();}};
 }
 refresh(){if(this.rendered)this.render().catch(err=>console.error(`${MODULE} render`,err));}
 async refreshSearch(el){const pos=el.selectionStart;await this.render();let next=this.window.content.querySelector("#pfa-search");next?.focus();next?.setSelectionRange(pos,pos);}
 _alert(e){console.error(`${MODULE}:`,e);ui.notifications.error(e?.message||String(e));}
 async click(event,el){const act=el.dataset.act,d=el.dataset;
  if(this.animating&&!new Set(["library","select","open"]).has(act))return;
  if(act==='world-link-actor'){
   if(!game.user.isGM)throw Error('Only GMs can import Actor profiles');
   const seat=this._context().session?.seats?.find(s=>s.id===d.seat);if(!seat)throw Error('Select a valid seat');
   const actorId=this.actorSelections[seat.id]??seat.characterLink?.actorId??this._context().worldActors.find(a=>a.ownerId===seat.ownerId)?.id;
   if(!actorId)throw Error('Select a world Actor first');
   await bridge.send('linkWorldActor',{id:this.currentId,seatId:seat.id,actorId});return;
  }
  if(act==='world-unlink-actor'){if(!game.user.isGM)throw Error('GM only');await bridge.send('unlinkCharacter',{id:this.currentId,seatId:d.seat});delete this.actorSelections[d.seat];return;}
  if(act==='world-auto-match'){if(!game.user.isGM)throw Error('GM only');await bridge.send('autoMatchCharacters',{id:this.currentId});return;}
  if(act==='world-link-scene'){
   if(!game.user.isGM)throw Error('GM only');
   const sceneId=this.worldSceneId??this._context().session?.worldLink?.sceneId??this._context().activeSceneId;
   if(!sceneId)throw Error('Choose a World Scene');
   await bridge.send('linkWorldScene',{id:this.currentId,sceneId,journalId:this.worldJournalId??this._context().session?.worldLink?.journalId??null});return;
  }
  if(act==='world-unlink-scene'){if(!game.user.isGM)throw Error('GM only');await bridge.send('unlinkWorldScene',{id:this.currentId});return;}
  if(act==='open-rules'){await openRulebook(d.id||'');return;}
  if(act==='arena-select'){this.arenaAbility=d.ability;this.refresh();return;}
  if(act==='arena-cell'){await this.play({type:'use',ability:this.arenaAbility,delivery:this.arenaDelivery,x:Number(d.x),y:Number(d.y)});return;}
  if(act==='arena-use-self'){await this.play({type:'use',ability:d.ability,delivery:this.arenaDelivery});return;}
  if(act==='arena-end-turn'){await this.play({type:'end'});return;}
  if(act==='arena-pause'){if(!game.user.isGM)throw Error('Only GMs can pause');await bridge.send('pauseArena',{id:this.currentId});return;}
  if(act.startsWith('arena-replay-')){
   const s=bridge.sessions.find(z=>z.id===this.currentId)?.board;if(!s)return;const max=Math.max(0,s.timeline?.length-1);
   if(act==='arena-replay-prev')this.replayIndex=Math.max(0,this.replayIndex<0?max-1:this.replayIndex-1);
   if(act==='arena-replay-next')this.replayIndex=Math.min(max,this.replayIndex<0?0:this.replayIndex+1);
   if(act==='arena-replay-live')this.replayIndex=-1;this.refresh();return;
  }
  if(act==="select"){this.arenaAbility='move';this.forgeOpen=false;this.practiceAnswer=null;this.replayIndex=-1;this.tourneyOpen=false;this.selectedCard=0;this.selectedWyvern=null;this.selected=d.id;this.currentId=null;this.packChoice="";this.tutorialStep=0;this.refresh();return;}
  if(act==="library"){this.forgeOpen=false;this.replayIndex=-1;this.selectedWyvern=null;this.currentId=null;this.selectedSquare=null;this.tutorialStep=0;this.refresh();return;}
  if(act==="open-packs"){this.forgeOpen=false;this.tourneyOpen=false;if(!game.user.isGM)throw Error("Only GMs may edit packs");this.packOpen=true;this.currentId=null;this.refresh();return;}
  if(act==="exit-packs"){this.packOpen=false;this.refresh();return;}
  if(act==="open-forge"){
   if(!game.user.isGM)throw Error('Only the GM can edit Puzzle Forge bindings');
   this.forgeOpen=true;this.packOpen=false;this.tourneyOpen=false;this.currentId=null;this.refresh();return;
  }
  if(act==="exit-forge"){this.forgeOpen=false;this.refresh();return;}
  if(act==="open-puzzle-pack-editor"){
   this.forgeOpen=false;this.packOpen=true;this.editPackId=null;this.packType='puzzle';this.packName='New puzzle book';this.packJSON=null;this.refresh();return;
  }
  if(act==="forge-generate"){
   if(!game.user.isGM)throw Error('Only the GM may generate world puzzle packs');
   const root=this.window.content;
   const pack=generateRiddlePack({id:contentValue(root,'#pfa-forge-id'),name:contentValue(root,'#pfa-forge-name'),count:Number(contentValue(root,'#pfa-forge-count')),difficulty:Number(contentValue(root,'#pfa-forge-difficulty')),seed:Number(contentValue(root,'#pfa-forge-seed'))});
   await bridge.send('savePack',{pack});this.packType='puzzle';this.editPackId=pack.id;this.packName=pack.name;this.packJSON=JSON.stringify(pack.entries,null,2);this.forgeOpen=false;this.packOpen=true;return;
  }
  if(act==="forge-bind"){
   if(!game.user.isGM)throw Error('Only the GM can create scene bindings');const root=this.window.content,scene=globalThis.canvas?.scene||game.scenes?.current;
   if(!scene)throw Error('Open a scene before linking puzzles');
   const source=contentValue(root,'#pfa-forge-source').split(':'),target=contentValue(root,'#pfa-forge-target').split(':');
   const binding={id:`binding-${uid()}`,sceneId:scene.id,sceneName:scene.name,sourceKind:source[0],sourceId:source[1],effectKind:target[0],effectId:target[1],effectAction:contentValue(root,'#pfa-forge-effect'),gameId:contentValue(root,'#pfa-forge-game'),packId:contentValue(root,'#pfa-forge-pack')};
   validateBindingAgainstScene(binding,scene);await bridge.send('saveBinding',{binding});return;
  }
  if(act==="forge-trigger"){
   if(!game.user.isGM)throw Error('Only the GM can start linked puzzles');await bridge.send('triggerBinding',{id:d.id});return;
  }
  if(act==="forge-unbind"){
   if(!game.user.isGM)throw Error('Only the GM can remove scene links');if(!await confirmDialog('Remove this puzzle scene link?'))return;
   await bridge.send('deleteBinding',{id:d.id});return;
  }
  if(act==="forge-copy-script"){
   const script=`if (game.user.isGM) await game.pactsFantasyArcade.triggerScenePuzzle(${JSON.stringify(d.id)});`;
   if(!globalThis.navigator?.clipboard?.writeText)throw Error('Clipboard access is unavailable. Copy the Region script from the README.');
   await navigator.clipboard.writeText(script);ui.notifications.info('Copied Foundry Region Execute Script snippet');return;
  }
  if(act==="new-pack"){this.packType=d.type;this.editPackId=null;this.packName=`New ${d.type} pack`;this.packJSON=null;this.refresh();return;}
  if(act==="edit-pack"){
   const pack=bridge.packs.find(x=>x.id===d.id);if(!pack?.entries)throw Error("Pack details are not available to this client");
   this.packType=pack.type;this.packName=pack.name;this.editPackId=pack.id;this.packJSON=JSON.stringify(pack.entries,null,2);this.refresh();return;
  }
  if(act==="save-pack"){
   if(!game.user.isGM)throw Error("Only GMs may edit packs");
   const name=contentValue(this.window.content,"#pfa-pack-name"),id=contentValue(this.window.content,"#pfa-pack-id");
   let entries;try{entries=JSON.parse(contentValue(this.window.content,"#pfa-pack-json"));}catch(e){throw Error("Pack JSON syntax is invalid: "+e.message);}
   await bridge.send("savePack",{pack:{id,type:this.packType,name,entries}});this.editPackId=id;this.packName=name;this.packJSON=JSON.stringify(entries,null,2);return;
  }
  if(act==="delete-pack"){
   if(!game.user.isGM)throw Error("Only GMs may remove packs");if(!await confirmDialog(`Delete pack ${foundry.utils.escapeHTML?foundry.utils.escapeHTML(d.id):d.id}?`))return;
   await bridge.send("deletePack",{id:d.id});if(this.editPackId===d.id){this.editPackId=null;this.packJSON=null;}return;
  }
  if(act==="show-all"){this.showAll=true;this.refresh();return;}
  if(act==="show-live"){this.showAll=false;this.refresh();return;}
  if(act==="open"){this.forgeOpen=false;this.replayIndex=-1;this.tourneyOpen=false;this.selectedCard=0;this.selectedWyvern=null;this.currentId=d.id;this.tutorialStep=0;this.selectedSquare=null;this.refresh();return;}
  if(act==="new"){this.replayIndex=-1;
   const id=`table-${uid()}`;this.currentId=id;this.packOpen=false;await bridge.send("create",{id,gameId:this.selected,config:{packId:this.packChoice,coinMode:this.coinMode,coinRounds:this.coinRounds}});return;
  }
  if(act==="join"){await bridge.send("join",{id:this.currentId});return;}
  if(act==="npc"){await bridge.send("addNpc",{id:this.currentId,name:d.controlled==="1"?"GM's Challenger":"Grukk the Goblin",controlled:d.controlled==="1"});return;}
  if(act==="start"){await bridge.send("start",{id:this.currentId});return;}
  if(act==="close"){await bridge.send("close",{id:this.currentId});this.currentId=null;return;}
  if(act==="delegate"){await bridge.send("delegate",{id:this.currentId,seatId:d.id,controlled:d.controlled==="1"});return;}
  if(act==="advance"){await bridge.send("advance",{id:this.currentId});return;}
  if(act==="lesson-prev"){this.practiceAnswer=null;this.tutorialStep=Math.max(0,this.tutorialStep-1);this.refresh();return;}
  if(act==="lesson-next"){this.practiceAnswer=null;const gameId=this._context().session?.gameId||this.selected;this.tutorialStep=(this.tutorialStep+1)%(LESSONS[gameId]?.length||1);this.refresh();return;}
  if(act==="lesson-practice"){this.practiceAnswer=Number(d.choice);this.refresh();return;}
  if(act==="lesson-practice-reset"){this.practiceAnswer=null;this.refresh();return;}
  if(act==="aim"){
   const rect=el.getBoundingClientRect();this.aimX=Math.max(-1,Math.min(1,((event.clientX-rect.left)/rect.width)*2-1));this.aimY=Math.max(-1,Math.min(1,((event.clientY-rect.top)/rect.height)*2-1));this.refresh();return;
  }
  if(act==="square"){
    const s=bridge.sessions.find(x=>x.id===this.currentId);if(!s?.board||!this.seatId)return;
    const i=Number(d.index),moves=checkersMoves(s.board,s.board.turn);
    const chosen=moves.find(m=>m.from===this.selectedSquare&&m.to===i);
    if(chosen){this.selectedSquare=null;await this.play({type:"move",from:chosen.from,to:chosen.to});}
    else {this.selectedSquare=moves.some(m=>m.from===i)?i:null;this.refresh();}return;
  }
  if(act==="set-ingredient"){this.ingredient=Number(d.index);this.refresh();return;}
  if(act==="bid-qty"){const b=bridge.sessions.find(x=>x.id===this.currentId)?.board;const max=b?.counts?Object.values(b.counts).reduce((a,v)=>a+v,0):30;this.bidQty=Math.max(1,Math.min(max,this.bidQty+Number(d.direction)));this.refresh();return;}
  if(act==="bid-face"){this.bidFace=Math.max(1,Math.min(6,this.bidFace+Number(d.direction)));this.refresh();return;}
  if(act==="open-tournaments"){this.tourneyOpen=true;this.packOpen=false;this.currentId=null;this.refresh();return;}
  if(act==="tournament-exit"){this.tourneyOpen=false;this.refresh();return;}
  if(act==="tournament-open"){this.tourneyId=d.id;this.tourneyOpen=true;this.refresh();return;}
  if(act==="tournament-match-open"){this.replayIndex=-1;this.tourneyOpen=false;this.currentId=d.id;this.refresh();return;}
  if(act==="tournament-user-toggle"){
   this.tourneyUsers=this.tourneyUsers.includes(d.id)?this.tourneyUsers.filter(x=>x!==d.id):[...this.tourneyUsers,d.id];this.refresh();return;
  }
  if(act==="tournament-npc-add"){this.tourneyNpcs=Math.min(8,this.tourneyNpcs+1);this.refresh();return;}
  if(act==="tournament-npc-remove"){this.tourneyNpcs=Math.max(0,this.tourneyNpcs-1);this.refresh();return;}
  if(act==="tournament-gmnpc-add"){this.tourneyGMNpcs=Math.min(8,this.tourneyGMNpcs+1);this.refresh();return;}
  if(act==="tournament-gmnpc-remove"){this.tourneyGMNpcs=Math.max(0,this.tourneyGMNpcs-1);this.refresh();return;}
  if(act==="tournament-create"){
   if(!game.user.isGM)throw Error('Only the GM can create a tournament');
   const users=[...game.users].filter(u=>u.active),people=this.tourneyUsers.map((id,i)=>{
    const u=users.find(u=>u.id===id);if(!u)throw Error(`User ${id} is no longer connected`);
    return {id:`human-${u.id}`,name:u.name,kind:'person',userId:u.id};
   });
   const ai=Array.from({length:this.tourneyNpcs},(_,i)=>({id:`bot-${i+1}`,name:`Goblin Challenger ${i+1}`,kind:'npc'}));
   const gm=Array.from({length:this.tourneyGMNpcs},(_,i)=>({id:`gm-npc-${i+1}`,name:`GM's Challenger ${i+1}`,kind:'gm-npc',userId:game.user.id}));
   const participants=[...people,...ai,...gm];if(![2,4,8].includes(participants.length))throw Error('Tournaments must have exactly 2, 4 or 8 contestants');
   const id=`tour-${uid()}`;
   const name=contentValue(this.window.content,'#pfa-tourney-name');this.tourneyName=name;
   await bridge.send('createTournament',{id,name,gameId:this.tourneyGame,participants});this.tourneyId=id;return;
  }
  if(act==="tournament-match-launch"){
   if(!game.user.isGM)throw Error('Only the GM may start a tournament match');
   await bridge.send('launchTournamentMatch',{tournamentId:d.id,matchId:d.match});return;
  }
  if(act==="tournament-adjudicate"){
   if(!game.user.isGM)throw Error('Only the GM may adjudicate results');
   if(!await confirmDialog('Award the match to this competitor? This is recorded as a manual GM adjudication.'))return;
   await bridge.send('resolveTournamentMatch',{tournamentId:d.id,matchId:d.match,winnerId:d.winner});return;
  }
  if(act.startsWith('replay-')){
   const s=bridge.sessions.find(x=>x.id===this.currentId)?.board;
   if(!s)return;
   const maximum=s.gameId==='wyvern-chess'?(s.replay?.length||0):Math.max(0,(s.timeline?.length||1)-1);
   if(act==='replay-first')this.replayIndex=0;
   if(act==='replay-prev')this.replayIndex=Math.max(0,(this.replayIndex<0?maximum:this.replayIndex)-1);
   if(act==='replay-next')this.replayIndex=Math.min(maximum,Math.max(0,this.replayIndex)+1);
   if(act==='replay-live')this.replayIndex=-1;
   this.selectedWyvern=null;this.refresh();return;
  }
  if(act==="select-card"){this.selectedCard=Number(d.index);this.refresh();return;}
  if(act==="select-lane"){this.selectedLane=Number(d.lane);this.refresh();return;}
  if(act==="select-claim"){this.claimRank=Number(d.rank);this.refresh();return;}
  if(act==="advanced-play"){
   if(this.replayIndex>=0)return;
   const action={type:d.type};for(const k of ['index','cell','lane','claim'])if(d[k]!==undefined)action[k]=Number(d[k]);
   if(d.region!==undefined)action.region=d.region;
   if(d.type==='offer'){action.index=this.selectedCard;}
   if(d.type==='deploy'){action.index=this.selectedCard;action.lane=this.selectedLane;}
   await this.play(action);this.selectedCard=0;return;
  }
  if(act==="conquest-cell"){if(this.replayIndex>=0)return;await this.play({type:'place',index:this.selectedCard,cell:Number(d.cell)});this.selectedCard=0;return;}
  if(act==="wyvern-layer"){this.wyvernLayer=Number(d.layer);this.refresh();return;}
  if(act==="wyvern-square"){
   if(this.replayIndex>=0)return;
   const table=bridge.sessions.find(x=>x.id===this.currentId),board=table?.board;if(!board||!this.seatId)return;
   const legal=wyvernMoves(board),pos=d.pos;
   const hit=legal.find(m=>m.from===this.selectedWyvern&&m.to===pos);
   if(hit){this.selectedWyvern=null;await this.play({type:'move',from:hit.from,to:hit.to});return;}
   this.selectedWyvern=legal.some(m=>m.from===pos)?pos:null;this.refresh();return;
  }
  if(act==='puzzle-action'){
   const action={type:d.type};for(const key of ['index','value'])if(d[key]!==undefined)action[key]=Number(d[key]);
   if(d.direction!==undefined)action.direction=d.direction;
   if(action.type==='answer')action.text=contentValue(this.window.content,'#pfa-puzzle-answer');
   await this.play(action);return;
  }
  if(act==='puzzle-tone'){const index=Number(d.index);this.playBell(index);await this.play({type:'tap',index});return;}
  if(act==='puzzle-demo'){await this.demonstratePuzzle();return;}
  if(act==="board-flip"){await this.play({type:"flip",index:Number(d.index)});return;}
  if(act==="board-next"){await this.play({type:"next"});return;}
  if(act==="board-place"){await this.play({type:"place",index:Number(d.index),side:d.side});return;}
  if(act==="board-draw"){await this.play({type:"draw"});return;}
  if(act==="board-pass"){await this.play({type:"pass"});return;}
  if(act==="board-bid"){await this.play({type:"bid",quantity:this.bidQty,face:this.bidFace});return;}
  if(act==="board-challenge"){await this.play({type:"challenge"});return;}
  if(act==="cups"){await this.animateCups();return;}
  if(act==="demo"){this.animateDemo(el);return;}
  if(act==="play"){
   const move={type:d.type};if(d.choice!==undefined)move.choice=d.choice;if(d.index!==undefined)move.index=Number(d.index);if(d.face!==undefined)move.face=Number(d.face);if(d.area!==undefined)move.area=d.area;
   if(move.type==="answer"&&this._context().session?.gameId==="tomb-of-the-restless-grave")move.text=this.window.content.querySelector("#pfa-answer")?.value||"";
   if(move.type==="strike"){const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const elapsed=(performance.now()-this.meterStart)%2800;move.power=reduced?this.power:Math.round((elapsed<=1400?elapsed/1400:2-elapsed/1400)*100);}
   if(move.type==="throw"){move.x=this.aimX;move.y=this.aimY;move.power=this.power;}
   if(move.type==="bowl"){move.aim=this.aimValue;move.power=this.power;}
   if(move.type==="toss"){move.angle=this.angle;move.power=this.power;}
   if(move.type==="serve"){move.ingredient=this.ingredient;move.heat=this.heat;}
   await this.play(move);return;
  }
 }
 playBell(index,context=null,when=null){
  if(!Number.isInteger(index)||index<0||index>3)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  const audio=context||new Audio();const osc=audio.createOscillator(),gain=audio.createGain();
  const t=when??audio.currentTime;osc.type='sine';osc.frequency.value=[261.63,329.63,392,523.25][index];
  gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(.12,t+.02);gain.gain.exponentialRampToValueAtTime(.001,t+.2);
  osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.22);
  if(!context)window.setTimeout(()=>audio.close().catch(()=>{}),450);
 }
 async demonstratePuzzle(){
  const demo=bridge.sessions.find(s=>s.id===this.currentId)?.board?.challenge?.demonstration;
  if(!Array.isArray(demo)||!demo.length)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){ui.notifications.info(`Bell sequence: ${demo.map(i=>['I','II','III','IV'][i]).join(' - ')}`);return;}
  const audio=new Audio();await audio.resume();const start=audio.currentTime+.08;
  for(let i=0;i<demo.length;i++)this.playBell(demo[i],audio,start+i*.32);
  window.setTimeout(()=>audio.close().catch(()=>{}),Math.ceil((demo.length+1)*320));
 }
 async play(action){if(this.replayIndex>=0)throw Error("Return to live play before making moves");if(!this.currentId||!this.seatId)throw Error("Select one of your seats first");await bridge.send("play",{id:this.currentId,seatId:this.seatId,action});}
 animateDemo(el){const panel=el.closest(".pfa-lesson");const stage=panel?.querySelector(".pfa-demo-scene");if(!stage)return;stage.classList.remove("playing");void stage.offsetWidth;stage.classList.add("playing");const caption=stage.querySelector(".pfa-demo-caption");if(caption)caption.textContent="Grukk demonstrates the sequence…";setTimeout(()=>{stage.classList.remove("playing");if(caption?.isConnected)caption.textContent="Now try the action yourself";},1500);}
 async animateCups(){
  const s=bridge.sessions.find(x=>x.id===this.currentId),seat=s?.seatStates[this.seatId];if(!seat||seat.gameId!=="sly-fox-s-three-cups")return;
  const cups=[...this.window.content.querySelectorAll(".pfa-cup")],stage=this.window.content.querySelector(".pfa-cup-stage");if(cups.length!==3||!stage)return;
  this.animating=true;const positions=[0,1,2];const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try{
   for(const [a,b] of seat.swaps){for(let i=0;i<3;i++){if(positions[i]===a)positions[i]=b;else if(positions[i]===b)positions[i]=a;}
    cups.forEach((cup,i)=>{cup.style.transform=`translateX(${(positions[i]-i)*100}%)`;cup.style.transitionDuration=reduced?"1ms":"360ms";});
    await new Promise(resolve=>setTimeout(resolve,reduced?20:465));
   }
   await new Promise(resolve=>setTimeout(resolve,reduced?20:400));
  }finally{cups.forEach(cup=>{cup.style.transform="";});this.animating=false;this.meterStart=performance.now();}
 }
}

class FoundryArcadeBridge {
 constructor(){this.manager=new ArcadeSessions();this.sessions=[];this.tournaments=[];this.bindings=[];this.tokenPositions=new Map();this.catalog=localCatalog;this.window=new FantasyArcadeWindow();this.revision=0;this.packs=[];this.ledger=[];this.queue=Promise.resolve();this.hostMarker=null;}
 getHost(){return [...game.users].filter(u=>u.active&&u.isGM).sort((a,b)=>a.id.localeCompare(b.id))[0]||null;}
 isHost(){return this.getHost()?.id===game.user.id;}
 async restore(){if(!this.isHost())return;const state=game.settings.get(MODULE,"arcadeWorldState");try{if([2,3,4,5].includes(state?.schema))this.manager.restoreState(state);this.revision=Math.max(0,Number(state?.revision)||0);}catch(err){ui.notifications.warn("Fantasy Arcade: saved state could not be restored; original state remains untouched.");console.error(`${MODULE}: restore`,err);}this.hostMarker=game.user.id;}
 async ensureHost(){if(this.isHost()&&this.hostMarker!==game.user.id)await this.restore();}
 async save(){if(!this.isHost())return;await game.settings.set(MODULE,"arcadeWorldState",{...this.manager.exportState(),revision:this.revision});}
 async loadCatalog(){try{const r=await fetch(`modules/${MODULE}/data/catalog.json`);if(!r.ok)throw Error(`HTTP ${r.status}`);const parsed=await r.json();if(parsed.games?.length===131)this.catalog=parsed.games;}catch(err){console.warn(`${MODULE}: unable to load catalogue`,err);}}
 open(id=null){if(id)this.window.currentId=id;this.window.render(true);}
 async send(type,payload={}){
  const host=this.getHost();if(!host)throw Error("A connected GM is required for shared tables.");
  const packet={kind:"request",from:game.user.id,nonce:uid(),command:{type,payload}};
  if(this.isHost())await this.handleMessage(packet);else game.socket.emit(CHANNEL,packet);
 }
 async broadcast(){
  if(!this.isHost())return;
  for(const user of game.users.filter(u=>u.active)){
   const payload={kind:"snapshot",from:game.user.id,to:user.id,revision:this.revision,sessions:this.manager.summaries(user.id,user.isGM),ledger:this.manager.ledger.slice(-30),packs:this.manager.packList(user.isGM),tournaments:this.manager.tournamentList(),bindings:user.isGM?this.manager.listBindings():[]};
   if(user.id===game.user.id)await this._onSnapshot(payload);else game.socket.emit(CHANNEL,payload);
  }
 }
 async _onSnapshot(packet){
  if(packet.to!==game.user.id||packet.from!==this.getHost()?.id)return;
  if(!Number.isFinite(packet.revision)||packet.revision<this.revision)return;
  this.revision=packet.revision;this.sessions=packet.sessions||[];this.ledger=packet.ledger||[];this.packs=packet.packs||[];this.tournaments=packet.tournaments||[];this.bindings=packet.bindings||[];
  if(this.window.currentId&&!this.sessions.some(s=>s.id===this.window.currentId))this.window.currentId=null;
  this.window.refresh();
 }
 async _handleRequest(packet){
  if(!this.isHost())return;await this.ensureHost();
  const requester=game.users.get(packet.from);if(!requester?.active||!packet.command?.type)return;
  try{
   const command=structuredClone(packet.command);if(command.type==='create'||command.type==='join')command.payload={...command.payload,userName:requester.name};
   // This request envelope uses a Foundry module socket, not a trusted identity-bearing server RPC.
   // Do not use the module for money, valuable items or adversarial matches.
   let result;
   if(['linkWorldActor','autoMatchCharacters','linkWorldScene','unlinkWorldScene'].includes(command.type)){
    if(!requester.isGM)throw Error('Only GMs can import world context');
    const p=command.payload||{};
    if(command.type==='linkWorldActor'){
     const actor=game.actors?.get?.(p.actorId);if(!actor)throw Error('World Actor not found');
     const session=this.manager._find(p.id),detected=detectArcadeSystem(game);
     const profile=previewCharacterForGame(actor,{systemId:detected.id,systemVersion:detected.version,gameId:session.gameId});
     result=this.manager.configureCharacterLink({id:p.id,seatId:p.seatId,profile,gm:true});
    }else if(command.type==='autoMatchCharacters'){
     const table=this.manager._find(p.id);if(table.status!=='lobby')throw Error('Match has started');
     let matched=0;const detected=detectArcadeSystem(game);
     for(const seat of table.seats){
      if(!seat.ownerId||seat.kind!=='person'||seat.characterLink)continue;
      const actor=game.users?.get?.(seat.ownerId)?.character;
      if(!actor?.id||game.actors?.get?.(actor.id)!==actor||!isImportableActor(actor,detected.id))continue;
      const profile=previewCharacterForGame(actor,{systemId:detected.id,systemVersion:detected.version,gameId:table.gameId});
      this.manager.configureCharacterLink({id:p.id,seatId:seat.id,profile,gm:true});matched++;
     }
     result={matched};if(!matched)ui.notifications.info('No unlinked player seats have an assigned Foundry User Character.');
    }else if(command.type==='linkWorldScene'){
     const scene=game.scenes?.get?.(p.sceneId);if(!scene)throw Error('World Scene not found');
     const journal=p.journalId?game.journal?.get?.(p.journalId):null;if(p.journalId&&!journal)throw Error('Journal not found');
     result=this.manager.configureWorldContext({id:p.id,worldLink:makeWorldLink(scene,journal),gm:true});
    }else result=this.manager.configureWorldContext({id:p.id,worldLink:null,gm:true});
   }else{
    if(['configureCharacterLink','configureWorldContext'].includes(command.type))throw Error('Raw profile import is unavailable; select an existing Actor.');
    result=this.manager.handle(command,{userId:requester.id,gm:requester.isGM});
   }

   if(command.type!=='sync'){
    await this.applyPendingPuzzleRewards();this.revision++;await this.save();
   }
   await this.broadcast();
   if(result?.tableId&&command.type==='triggerBinding'){
    const target=result.participantUserId;
    if(target===game.user.id)this.open(result.tableId);
    else game.socket.emit(CHANNEL,{kind:'invite',to:target,from:game.user.id,tableId:result.tableId});
   }
  }catch(err){game.socket.emit(CHANNEL,{kind:"error",to:requester.id,message:String(err?.message||err)});if(requester.id===game.user.id)ui.notifications.error(err.message);}
 }
 async applyPendingPuzzleRewards(){
  if(!this.isHost())return;
  for(const s of this.manager.sessions.values()){
   if(!s.bindingId||s.status!=='complete'||s.rewardApplied)continue;
   const binding=this.manager.bindings.find(b=>b.id===s.bindingId),scene=binding&&game.scenes?.get(binding.sceneId);
   if(!binding||!scene)continue;
   try{await applySceneReward(binding,scene);s.rewardApplied=true;s.rewardError=null;s.notes.push('Scene reward applied by the GM host.');}
   catch(err){const message=String(err?.message||err).slice(0,140);if(s.rewardError!==message){s.rewardError=message;s.notes.push(`GM action required: scene reward not applied (${message})`);console.warn(`${MODULE}: scene reward`,err);}}
  }
 }
 primeTokenPositions(){
  for(const scene of game.scenes||[])for(const token of scene.tokens||[])this.tokenPositions.set(`${scene.id}:${token.id}`,this.tokenPoint(token,scene));
 }
 tokenPoint(token,scene){const size=Number(scene.grid?.size)||100;return {x:Number(token.x)+(Number(token.width)||1)*size/2,y:Number(token.y)+(Number(token.height)||1)*size/2,elevation:Number(token.elevation)||0};}
 async onTokenMoved(token,changes,originUserId){
  if(!this.isHost()||!token?.parent||!changes||!['x','y','elevation'].some(k=>Object.hasOwn(changes,k)))return;
  const scene=token.parent,key=`${scene.id}:${token.id}`,current=this.tokenPoint(token,scene),previous=this.tokenPositions.get(key);this.tokenPositions.set(key,current);
  if(!previous)return;
  const sender=game.users?.get(originUserId),owner=sender?.active?sender:game.user;
  for(const binding of this.manager.bindings.filter(b=>b.sceneId===scene.id)){
   if(!triggeredOnEntry(binding,scene,previous,current))continue;
   const running=binding.activeTableId&&this.manager.sessions.has(binding.activeTableId);if(running)continue;
   await this.handleMessage({kind:'request',from:game.user.id,command:{type:'triggerBinding',payload:{id:binding.id,participantUserId:owner.id,participantName:owner.name}}});
  }
 }
 async handleMessage(packet){
  if(!packet||typeof packet!=="object")return;
  if(packet.kind==="snapshot")return this._onSnapshot(packet);
  if(packet.kind==='invite'){
   if(packet.to===game.user.id&&packet.from===this.getHost()?.id)this.open(packet.tableId);
   return;
  }
  if(packet.kind==="error"){if(packet.to===game.user.id)ui.notifications.error(`Fantasy Arcade: ${packet.message}`);return;}
  if(packet.kind!=="request"||!this.isHost())return;
  const task=()=>this._handleRequest(packet);
  this.queue=this.queue.then(task,task);return this.queue;
 }
}

Hooks.once("init",()=>{
 game.settings.register(MODULE,"arcadeWorldState",{name:"Fantasy Arcade saved tables",hint:"Stores game tables and leaderboards across GM reloads. Restricted to imaginary-point games; world settings are not a secure vault for secret dice.",scope:"world",config:false,type:Object,default:{schema:5,revision:0,sessions:[],ledger:[],packs:[],tournaments:[],bindings:[]}});
 game.settings.register(MODULE,"reducedMotion",{name:"Fantasy Arcade: Reduced motion",hint:"Disable unnecessary arcade animation and prefer static precision controls.",scope:"client",config:true,type:Boolean,default:false});
});

Hooks.once("ready",async()=>{
 bridge=new FoundryArcadeBridge();
 await bridge.loadCatalog();
 await bridge.restore();
 bridge.primeTokenPositions();
 game.socket.on(CHANNEL,packet=>{bridge.handleMessage(packet).catch(err=>console.error(`${MODULE}: socket`,err));});
 Hooks.on('updateToken',(token,changes,_options,originUserId)=>bridge.onTokenMoved(token,changes,originUserId).catch(err=>console.warn(`${MODULE}: region trigger`,err)));
 game.pactsFantasyArcade=Object.freeze({world:Object.freeze({detect:()=>detectArcadeSystem(game),supportedSystems:PRIORITY_SYSTEMS,preview:(actorId,gameId)=>{if(!game.user.isGM)throw Error('GM only');const a=game.actors?.get?.(actorId);if(!a)throw Error('Unknown Actor');const sys=detectArcadeSystem(game);return previewCharacterForGame(a,{systemId:sys.id,systemVersion:sys.version,gameId});},linkActor:({tableId,seatId,actorId})=>bridge.send('linkWorldActor',{id:tableId,seatId,actorId})}),triggerScenePuzzle:(bindingId)=>bridge.send('triggerBinding',{id:bindingId}),open:(gameId)=>{if(gameId&&GAMES[gameId])bridge.window.selected=gameId;bridge.open();},games:PLAYABLE.map(({id})=>id),arena: Object.freeze({protocol:ARENA_ADAPTER_PROTOCOL,makeProfile:makeArenaProfile,importProfile:({tableId,seatId,profile})=>bridge.send('configureArenaProfile',{id:tableId,seatId,profile})}),version:ARCADE_VERSION,openRules:openRulebook});
 if(!document.getElementById("pfa-launcher")){
  const launch=document.createElement("button");launch.id="pfa-launcher";launch.type="button";launch.setAttribute("aria-label","Open Pacts Fantasy Arcade");launch.title="Open Fantasy Arcade";launch.textContent="🎲 Fantasy Arcade";
  launch.addEventListener("click",()=>bridge.open());document.body.appendChild(launch);
 }
 if(!bridge.isHost()&&bridge.getHost())bridge.send("sync").catch(err=>console.warn(`${MODULE}: sync`,err));
 console.info(`${MODULE}: loaded ${PLAYABLE.length} activity engines with system-aware bridge; Foundry v14 ${ARCADE_VERSION}`);
});
