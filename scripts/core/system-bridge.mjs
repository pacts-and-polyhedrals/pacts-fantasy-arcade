/** System-aware, read-only Foundry World/Actor adapter. Never mutates Actors.
 * Only bounded, GM-approved character summaries are persisted in Arcade sessions.
 * Data from unrecognized systems remains advisory; no speculative power bonuses.
 */
import {GAMES} from './data.mjs';
import {ARENA_IDS,ARENA_CONFIGS,ARENA_KITS} from './arena-data.mjs';
import {makeArenaProfile,validateArenaProfile} from './arena-adapter.mjs';

export const CHARACTER_LINK_PROTOCOL='pfa-character-link-v1';
export const WORLD_LINK_PROTOCOL='pfa-world-link-v1';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const finite=n=>typeof n==='number'&&Number.isFinite(n)?n:Number.isFinite(Number(n))&&n!==''&&n!==null&&n!==undefined?Number(n):null;
const text=(v,max=80)=>String(v??'').trim().slice(0,max);
const assert=(yes,message)=>{if(!yes)throw Error(message);};
const unique=a=>[...new Set(a.filter(Boolean))];
const SKILL={
 might:['ath','athletics'],agility:['acr','acrobatics','slt','sleight-of-hand','ste','stealth'],
 intellect:['arc','arcana','his','history','inv','investigation','society','occultism'],
 insight:['ins','insight','prc','perception','sur','survival'],
 presence:['prf','performance','per','persuasion','dec','deception','itm','intimidation','diplomacy'],
 craft:['crafting','artisanship'],magic:['arc','arcana','occultism','rel','religion'],
 endurance:['ath','athletics','sur','survival'],strategy:['his','history','inv','investigation','society','warfare-lore']
};
const ABILITY={might:['str'],agility:['dex'],intellect:['int'],insight:['wis'],presence:['cha'],craft:['int','dex'],magic:['int','wis','cha'],endurance:['con'],strategy:['int','wis']};
const SKILL_LABEL={might:'Athletics / Strength',agility:'Acrobatics / Dexterity',intellect:'Investigation / Intelligence',insight:'Perception / Wisdom',presence:'Performance / Charisma',craft:'Crafting and tools',magic:'Arcane training',endurance:'Constitution / Survival',strategy:'Planning and lore'};
/** Canonical priority adapters. Unknown systems remain safe read-only identity links. */
export const PRIORITY_SYSTEMS=Object.freeze(['imagi-nations','dnd5e','pf2e','daggerheart']);
const SYSTEM_LABELS=Object.freeze({
 'imagi-nations':'Imagi-Nations RPG',dnd5e:'Dungeons & Dragons 5e',
 pf2e:'Pathfinder 2e',daggerheart:'Daggerheart'
});
export function detectArcadeSystem(world){
 const id=text(world?.system?.id||world?.id||'unknown',40).toLowerCase();
 const version=text(world?.system?.version||world?.version||'',30);
 const adapter=id==='imaginations-rpg'?'imagi-nations':PRIORITY_SYSTEMS.includes(id)?id:'generic';
 const recognised=adapter!=='generic';
 const legacy=id==='imaginations-rpg';
 return {id,version,adapter,recognised,label:SYSTEM_LABELS[adapter]||text(world?.system?.title||id,70),
  warning:legacy?'Legacy Imagi-Nations system ID; stat paths will be checked, and absent fields receive no bonus.':
   !recognised?'Unrecognised system: no automatic ability or arena bonuses; the GM can still link the Actor for roleplay.':''};
}
/** Education/learner Actors, party containers, vehicles and environment Actors must not be imported. */
export function isImportableActor(actor,systemId='unknown'){
 if(!actor?.id||!actor?.name)return false;
 const t=text(actor.type,32).toLowerCase();
 if(['learner','party','environment','vehicle','loot','hazard','army','kingdom'].includes(t))return false;
 const adapter=detectArcadeSystem({system:{id:systemId}}).adapter;
 const allowed={
  'imagi-nations':['character','npc'],dnd5e:['character','npc'],
  pf2e:['character','npc','familiar','animalcompanion'],
  daggerheart:['character','npc','adversary','companion']
 };
 return !t||adapter==='generic'||allowed[adapter]?.includes(t)||false;
}
function rankSkill(skill,adapter){
 if(!skill||typeof skill!=='object')return null;
 if(adapter==='dnd5e'){
  const v=finite(skill.value??skill.proficient);
  return v===null?null:clamp(v*1.5,0,4);
 }
 const r=finite(skill.rank??skill.proficient?.rank??skill.proficiency?.rank);
 return r===null?null:clamp(r,0,4);
}
function abilityScore(value){
 const m=finite(value?.mod??value?.modifier);
 return m===null?null:clamp(2+m*.5,0,4);
}
// These paths are taken from the current published Imagi-Nations Foundry system:
// system.stats.capability and system.stats.connection. Legacy flat stats are read cautiously.
const IMAGI_MAP={
 might:['muscle'],agility:['skill','senses'],intellect:['smarts'],
 insight:['senses','mind'],presence:['charm','voice','heart'],
 craft:['hands','skill','smarts'],magic:['smarts','mind'],
 endurance:['tough','heart'],strategy:['smarts','mind']
};
const IMAGI_CONNECTIONS=new Set(['heart','mind','hands','voice']);
function imagiValue(sys,key){
 const group=IMAGI_CONNECTIONS.has(key)?'connection':'capability';
 return finite(sys?.stats?.[group]?.[key]??sys?.stats?.[key]??null);
}
const DAGGER_MAP={
 might:['strength'],agility:['agility','finesse'],intellect:['knowledge'],
 insight:['instinct'],presence:['presence'],craft:['finesse','knowledge'],
 magic:['knowledge','instinct','presence'],endurance:['strength','instinct'],
 strategy:['knowledge','instinct']
};
const CAP=Object.freeze(Object.keys(IMAGI_MAP));
function daggerTraitValue(sys,key){
 return finite(sys?.traits?.[key]?.value??sys?.traits?.[key]??null);
}
function scoreTrait(actor,trait,adapter){
 const sys=actor?.system||{};
 if(adapter==='imagi-nations'){
  const vals=(IMAGI_MAP[trait]||[]).map(k=>imagiValue(sys,k)).filter(v=>v!==null);
  // 0..20 is valid for Imagi stats. Normalize boundedly, never change the source stat.
  return vals.length?clamp(Math.round(Math.max(...vals)),0,4):null;
 }
 if(adapter==='daggerheart'){
  const keys=[...(DAGGER_MAP[trait]||[])];
  if(trait==='magic'){
   // A Daggerheart subclass identifies its spellcasting trait in its own item data.
   const allItems=allActorItems(actor);
   const casting=allItems.filter(i=>i.type==='subclass').map(i=>i.system?.spellcastingTrait).filter(x=>typeof x==='string'&&Object.hasOwn(sys.traits||{},x));
   if(casting.length)keys.splice(0,keys.length,...casting);
  }
  const vals=keys.map(k=>daggerTraitValue(sys,k)).filter(v=>v!==null);
  return vals.length?clamp(Math.round(2+Math.max(...vals)*.75),0,4):null;
 }
 if(!['dnd5e','pf2e'].includes(adapter))return null;
 const abils=ABILITY[trait]||[],skills=SKILL[trait]||[];
 const b=abils.map(k=>abilityScore(sys.abilities?.[k])).filter(v=>v!==null);
 const sources=[actor?.skills,sys.skills,sys.proficiencies?.skills].filter(Boolean);
 const trained=skills.flatMap(k=>sources.map(src=>rankSkill(src?.[k],adapter))).filter(v=>v!==null);
 if(!b.length&&!trained.length)return null;
 const core=b.length?Math.max(...b):2,training=trained.length?Math.max(...trained):0;
 return clamp(Math.round(core*.65+training*.35),0,4);
}
function allActorItems(actor){
 const items=actor?.items;
 const arr=Array.isArray(items)?items:items?.contents||Array.from(items?.values?.()||[]);
 return arr.filter(i=>i&&typeof i.name==='string').slice(0,450);
}
function daggerExperienceSuggestions(actor,affinity){
 const raw=actor?.system?.experiences;
 if(!raw||typeof raw!=='object')return [];
 const keys={
  might:/fight|guard|strong|wrest|brawl|lift|tough/i,
  agility:/sneak|run|slip|nimble|balance|quick|acrobat/i,
  intellect:/research|history|knowledge|study|scholar|library/i,
  insight:/sense|track|observe|notice|listen|insight|detect/i,
  presence:/sing|stage|charm|lead|speak|story|perform|persuade/i,
  craft:/tinker|build|craft|forge|repair|cook|alchemy/i,
  magic:/spell|arcane|magic|ritual|sorcer|mystic/i,
  endurance:/surviv|resilien|stamina|endure|unyielding/i,
  strategy:/strategy|tactic|plan|schem|chess|think/i
 };
 return Object.values(raw).filter(x=>x&&typeof x.name==='string'&&keys[affinity]?.test(x.name)).slice(0,2).map(x=>text(x.name,60));
}
function itemNames(actor){
 return allActorItems(actor).map(i=>({name:text(i.name,65),type:text(i.type,30)}));
}
function characterClasses(actor,items){
 const fromItems=items.filter(i=>['class','subclass','ancestry','community','heritage'].includes(i.type)).map(i=>i.name);
 const sys=actor?.system||{},detail=sys.details||{};
 const fromDetail=[detail.class,detail.className,detail.class?.name,detail.ancestry?.name,detail.background?.name,
   sys.classKey,sys.ancestryKey,sys.role].filter(v=>typeof v==='string');
 return unique([...fromItems,...fromDetail]).slice(0,6);
}
function gameTrait(gameId){
 const known={
 'arm-wrestling-at-the-bar':'might','kattal-s-hammer':'might','darts-of-the-deep':'agility',
 'tinker-s-lock-race':'craft','potion-sorting-sprint':'craft','fizzlenub-s-feast':'craft',
 'battle-of-the-bards':'presence','bardic-duet':'presence','festival-slam-poetry':'presence',
 'trial-by-debate':'presence','ispin-s-impossible-tale':'presence','wizard-duel':'magic',
 'monster-wrestler-championship':'might','fighting-pit-tournament':'endurance',
 'shadow-heist':'agility','arrow-storm':'agility','shield-wall':'endurance',
 'wyvern-chess':'strategy','runestone-checkers':'strategy','tavern-trivia':'intellect',
 'melee-training-dummy':'might','arena-beast-rider':'agility'
 };
 if(known[gameId])return known[gameId];
 const type=GAMES[gameId]?.type||'';
 if(type==='arena')return 'endurance';if(type==='social')return 'presence';
 if(type==='craft')return 'craft';if(type==='puzzle')return 'intellect';
 if(type==='board'||type==='cards')return 'strategy';
 if(type==='festival')return 'agility';if(type==='tavern')return 'agility';
 return 'none';
}
const LUCK_ONLY=new Set(['coin-of-fate','wyrm-s-eye','serpent-s-seven','lucky-kobold','king-s-high-roll','devil-s-knuckles','seven-skulls','three-dragon-slots','cauldron-craps','waterdeep-hold-em','black-dragon']);
export function allowedArenaKits(gameId){
 if(!ARENA_IDS.has(gameId))return [];
 if(gameId==='fighting-pit-tournament')return ['duelist','bruiser','guardian','wrestler','rogue','rider'];
 if(gameId==='wizard-duel')return ['mage'];
 if(['battle-of-the-bards','festival-slam-poetry','trial-by-debate','bardic-duet'].includes(gameId))return ['bard','poet','orator'];
 return ARENA_CONFIGS[gameId]?.profile?.filter(k=>k!=='dummy')||[];
}
function chooseKit(gameId,values,classes){
 const allowed=allowedArenaKits(gameId);if(!allowed.length)return null;
 const names=classes.join(' ').toLowerCase();
 const preferences=[];
 if(/bard|skald|entertainer|musician|singer/.test(names))preferences.push('bard','poet');
 if(/wizard|sorcerer|witch|magus|warlock|cleric|druid|oracle|psychic|shaman|priest|seraph/.test(names))preferences.push('mage');
 if(/barbarian|monk|brawler/.test(names))preferences.push('bruiser','wrestler');
 if(/paladin|champion|guardian/.test(names))preferences.push('guardian');
 if(/ranger|gunslinger|investigator/.test(names))preferences.push('archer','rogue');
 if(/rogue|thief|swashbuckler/.test(names))preferences.push('rogue','duelist');
 if(/fighter|warrior|soldier/.test(names))preferences.push('duelist','guardian');
 if(values.presence>=3)preferences.push('bard','orator');
 if(values.magic>=3)preferences.push('mage');
 if(values.agility>=3)preferences.push('rogue','archer','rider');
 if(values.might>=3)preferences.push('wrestler','duelist');
 for(const p of preferences)if(allowed.includes(p))return p;
 return allowed[0];
}
function suggestedModifiers(traits,kit){
 const t=k=>traits[k]??2;
 return {hp:t('endurance')>=4?2:t('endurance')<=1?-1:0,
 stamina:t('agility')>=4?1:t('endurance')>=4?1:0,
 focus:t('magic')>=4||t('presence')>=4?2:t('magic')>=3||t('presence')>=3?1:0,
 power:t('might')>=4&&['duelist','bruiser','wrestler','beast','guardian'].includes(kit)?1:0,
 protection:t('endurance')>=4&&['guardian','duelist','wrestler'].includes(kit)?1:0};
}
/** Builds a bounded, public summary; never copies spells, inventory or private descriptions. */
export function previewCharacterForGame(actor,{systemId='unknown',systemVersion='',gameId}={}){
 assert(actor&&typeof actor==='object'&&actor.id&&actor.name,'Select an existing Foundry Actor');
 assert(isImportableActor(actor,systemId),'This Actor type is not eligible for the arcade (learner and private world records are excluded).');
 assert(GAMES[gameId],'Choose an available Fantasy Arcade game');
 const system=detectArcadeSystem({system:{id:systemId,version:systemVersion}});
 const items=itemNames(actor),classes=characterClasses(actor,items);
 const traits=Object.fromEntries(Object.keys(ABILITY).map(k=>[k,scoreTrait(actor,k,system.adapter)]));
 const spellCount=items.filter(i=>['spell','domainCard','domain-card'].includes(i.type)).length;
 if(system.recognised&&spellCount>=2&&traits.magic!==null)traits.magic=clamp(traits.magic+1,0,4);
 const toolCount=items.filter(i=>['tool','equipment','consumable'].includes(i.type)&&/kit|tools|artisan|alchem|smith|thiev|instrument|lute|flute|drum/i.test(i.name)).length;
 if(system.recognised&&toolCount&&traits.craft!==null)traits.craft=clamp(traits.craft+1,0,4);
 const affinity=gameTrait(gameId),strength=traits[affinity],kit=chooseKit(gameId,traits,classes);
 const isLuck=LUCK_ONLY.has(gameId)||affinity==='none',mechanical=system.recognised&&!isLuck&&strength!==null;
 const assistance=mechanical&&['arm-wrestling-at-the-bar','kattal-s-hammer','darts-of-the-deep'].includes(gameId)?clamp(Math.floor(strength/2),0,2):0;
 const arenaProfile=kit&&system.recognised?makeArenaProfile({source:`Foundry ${system.id}`,label:`${actor.name} (${system.id})`,archetype:kit,modifiers:suggestedModifiers(traits,kit)}):null;
 const experiences=system.adapter==='daggerheart'?daggerExperienceSuggestions(actor,affinity):[];
 const note=isLuck?'Luck-based game: no sheet bonuses.':!system.recognised?'Unrecognised system: no mechanical bonuses are imported.':ARENA_IDS.has(gameId)?`Suggested ${ARENA_KITS[kit]?.label||kit} archetype, with bounded arena resources and tactical abilities.`:assistance?`Modest +${assistance} skill assistance in ${SKILL_LABEL[affinity]}.`:`Character affinity: ${SKILL_LABEL[affinity]||'player decisions'}; no automatic outcome changes in this game.`;
 const compact={protocol:CHARACTER_LINK_PROTOCOL,actorId:text(actor.id,64),actorName:text(actor.name,80),actorUuid:text(actor.uuid||`Actor.${actor.id}`,120),systemId:system.id,systemVersion:system.version,gameId,adapter:system.adapter,classes:classes.map(c=>text(c,55)),affinity,affinityScore:strength===null||strength===undefined?null:Math.round(strength),assistance,kit,arenaProfile,note:text(note,230),experienceSuggestions:experiences};
 return validateCharacterLink(compact,gameId);
}
export function validateCharacterLink(raw,gameId=raw?.gameId){
 assert(raw&&raw.protocol===CHARACTER_LINK_PROTOCOL,'Unsupported character link');
 assert(GAMES[gameId]&&raw.gameId===gameId,'Character link is for a different activity');
 const id=text(raw.actorId,64),name=text(raw.actorName,80),uuid=text(raw.actorUuid,120),sys=text(raw.systemId,40),version=text(raw.systemVersion,30);
 assert(/^[A-Za-z0-9_-]{2,64}$/.test(id),'Invalid source Actor ID');
 assert(name.length>=1,'Source Actor has no name');
 assert(uuid.length<=120&&uuid.length>=5,'Invalid Actor UUID');
 assert(/^[a-z0-9_-]{2,40}$/.test(sys),'Invalid system ID');
 const affinity=text(raw.affinity,30),allowed=[...Object.keys(ABILITY),'none'];assert(allowed.includes(affinity),'Invalid character affinity');
 const strength=raw.affinityScore;assert(strength===null||(Number.isInteger(strength)&&strength>=0&&strength<=4),'Invalid skill strength');
 assert(Number.isInteger(raw.assistance)&&raw.assistance>=0&&raw.assistance<=2,'Invalid skill assistance');
 const detected=detectArcadeSystem({system:{id:sys}});
 const recognised=detected.recognised;
 assert(recognised||raw.assistance===0,'Unknown system cannot grant automatic bonuses');
 assert(['arm-wrestling-at-the-bar','kattal-s-hammer','darts-of-the-deep'].includes(gameId)||raw.assistance===0,'Game cannot accept automatic skill assistance');
 const kit=raw.kit===null?null:text(raw.kit,30);
 if(kit!==null){assert(ARENA_IDS.has(gameId)&&allowedArenaKits(gameId).includes(kit),'Invalid arena role');}
 const arenaProfile=raw.arenaProfile===null?null:validateArenaProfile(raw.arenaProfile);
 assert((!ARENA_IDS.has(gameId)&&!kit&&!arenaProfile)||(ARENA_IDS.has(gameId)&&(!arenaProfile||arenaProfile.archetype===kit)),'Arena mapping is inconsistent');
 return {protocol:CHARACTER_LINK_PROTOCOL,actorId:id,actorName:name,actorUuid:uuid,systemId:sys,systemVersion:version,gameId,adapter:detected.adapter,classes:Array.isArray(raw.classes)?raw.classes.slice(0,6).map(x=>text(x,55)):[],affinity,affinityScore:strength,assistance:raw.assistance,kit,arenaProfile,note:text(raw.note,230),experienceSuggestions:detected.adapter==='daggerheart'&&Array.isArray(raw.experienceSuggestions)?raw.experienceSuggestions.slice(0,2).map(x=>text(x,60)):[]};
}
export function makeWorldLink(scene,journal=null){
 assert(scene?.id&&scene?.name,'Select an existing Foundry Scene');
 return validateWorldLink({protocol:WORLD_LINK_PROTOCOL,sceneId:scene.id,sceneName:scene.name,journalId:journal?.id||null,journalName:journal?.name||null});
}
export function validateWorldLink(raw){
 assert(raw?.protocol===WORLD_LINK_PROTOCOL,'Invalid world context');
 const sceneId=text(raw.sceneId,64),sceneName=text(raw.sceneName,90),journalId=raw.journalId===null?null:text(raw.journalId,64),journalName=raw.journalName===null?null:text(raw.journalName,90);
 assert(/^[a-zA-Z0-9_-]{2,64}$/.test(sceneId)&&sceneName.length>0,'Invalid world scene');
 if(journalId!==null)assert(/^[a-zA-Z0-9_-]{2,64}$/.test(journalId)&&journalName?.length,'Invalid journal reference');
 return {protocol:WORLD_LINK_PROTOCOL,sceneId,sceneName,journalId,journalName};
}
export function gameSheetPolicy(gameId){const affinity=gameTrait(gameId),luck=LUCK_ONLY.has(gameId)||affinity==='none';return {affinity,skillLabel:SKILL_LABEL[affinity]||'Player decisions',usesAssist:['arm-wrestling-at-the-bar','kattal-s-hammer','darts-of-the-deep'].includes(gameId),usesArenaProfile:ARENA_IDS.has(gameId),luck};}
