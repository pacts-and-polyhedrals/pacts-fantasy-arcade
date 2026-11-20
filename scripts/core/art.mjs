/** Bundled artwork manifest. Paths are relative so they resolve under any Foundry route prefix. */
import {PLAYABLE} from './data.mjs';
export const ART_ROOT='modules/pacts-fantasy-arcade/assets/art';
export const GAME_ART=Object.fromEntries(PLAYABLE.map(g=>[g.id,{cover:`${ART_ROOT}/covers/${g.id}.webp`,thumb:`${ART_ROOT}/thumbs/${g.id}.webp`}]));
export const KIT_ART=Object.fromEntries(['duelist','bruiser','mage','wrestler','beast','guardian','archer','rider','rogue','bard','poet','orator','dummy','raider'].map(k=>[k,`${ART_ROOT}/kits/kit-${k}.webp`]));
export const BANNER_ART=`${ART_ROOT}/banner-bg.webp`;
export const BANNER_TITLE_ART=`${ART_ROOT}/banner.webp`;
/** Original Wyvern Chess sprites by DM Asmo / Pacts & Polyhedrals (Wyvern Chess Community License). */
export const wyvernSprite=(side,type)=>`${ART_ROOT}/wyvern/${side==='scarlet'?'scarlet':'gold'}-${type}.webp`;
