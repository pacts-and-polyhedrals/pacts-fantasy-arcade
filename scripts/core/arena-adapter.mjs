/** Safe system-neutral connection contract for another fighting-pit/downtime module.
 * Data only. Does not evaluate commands, modify D&D actor documents or copy inventory.
 */
import {ARENA_KITS} from './arena-data.mjs';
const valid=(yes,message)=>{if(!yes)throw Error(message)};
const cleanString=(value,max)=>String(value||'').trim().slice(0,max);
const validInt=(v,lo,hi,key)=>{valid(Number.isInteger(v)&&v>=lo&&v<=hi,`${key} must be an integer from ${lo} to ${hi}`);return v;};
export const ARENA_ADAPTER_PROTOCOL='pfa-arena-profile-v1';
export const ARENA_MODIFIER_LIMITS={hp:[-3,3],stamina:[-2,2],focus:[-2,2],power:[-1,1],protection:[-1,1]};
export function validateArenaProfile(profile){
 valid(profile&&typeof profile==='object'&&!Array.isArray(profile),'Invalid arena profile');
 valid(profile.protocol===ARENA_ADAPTER_PROTOCOL,'Unsupported arena profile protocol');
 const label=cleanString(profile.label,80);valid(label.length>=2,'Arena profile requires a label');
 const source=cleanString(profile.source,80)||'external module';
 const archetype=cleanString(profile.archetype,36);valid(ARENA_KITS[archetype]&&archetype!=='dummy','Unknown arena archetype');
 const mods={};for(const [key,[lo,hi]] of Object.entries(ARENA_MODIFIER_LIMITS))mods[key]=validInt(profile.modifiers?.[key]??0,lo,hi,key);
 return {protocol:ARENA_ADAPTER_PROTOCOL,label,source,archetype,modifiers:mods};
}
export function applyArenaProfile(fighter,raw){
 const p=validateArenaProfile(raw);const m=p.modifiers;
 fighter.maxHp=Math.max(10,fighter.maxHp+m.hp);fighter.hp=fighter.maxHp;
 fighter.maxStamina=Math.max(5,fighter.maxStamina+m.stamina);fighter.stamina=fighter.maxStamina;
 fighter.maxFocus=Math.max(3,fighter.maxFocus+m.focus);fighter.focus=fighter.maxFocus;
 fighter.power=Math.max(1,fighter.power+m.power);
 fighter.protection=Math.max(0,fighter.protection+m.protection);
 fighter.externalProfile={protocol:p.protocol,label:p.label,source:p.source};
 return fighter;
}
/** Explicit handshake for an external module. Existing combat, rewards and injuries remain external. */
export function makeArenaProfile({source,label,archetype='duelist',modifiers={}}){return validateArenaProfile({protocol:ARENA_ADAPTER_PROTOCOL,source,label,archetype,modifiers});}
