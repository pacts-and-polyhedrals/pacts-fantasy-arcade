/** Build the "Fantasy Arcade Rulebook" JournalEntry compendium from scripts/core/rules-text.mjs.
 * Usage (from a folder where @foundryvtt/foundryvtt-cli is installed):
 *   node tools/build-journal.mjs <module-root>
 * Writes JSON sources to packs/_source/arcade-rulebook and compiles LevelDB into packs/arcade-rulebook. */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const root=path.resolve(process.argv[2]||'.');
const load=p=>import(pathToFileURL(path.join(root,p)).href);
const {GAME_RULES,RULEBOOK_CHAPTERS,RULE_CATEGORIES,RULEBOOK_ENTRY_ID,RULEBOOK_PACK,rulePageId,rulesHTML}=await load('scripts/core/rules-text.mjs');
const {GAME_ART}=await load('scripts/core/art.mjs');
const {PLAYABLE}=await load('scripts/core/data.mjs');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'module.json'),'utf8'));
const require=createRequire(path.join(process.cwd(),'package.json'));
const {compilePack}=await import(pathToFileURL(require.resolve('@foundryvtt/foundryvtt-cli')).href);

const now=Date.parse('2026-11-19T00:00:00Z');
const stats={coreVersion:'14',systemId:null,systemVersion:null,createdTime:now,modifiedTime:now,lastModifiedBy:null,compendiumSource:null,duplicateSource:null,exportSource:null};
const pages=[];let sort=100000;
const page=(key,name,html,level=1)=>{const _id=rulePageId(key);if(pages.some(p=>p._id===_id))throw Error(`Duplicate page id for ${key}`);pages.push({_id,_key:`!journal.pages!${RULEBOOK_ENTRY_ID}.${_id}`,name,type:'text',title:{show:true,level},image:{},text:{format:1,content:html,markdown:''},video:{controls:true,volume:0.5},src:null,system:{},sort:(sort+=100000),ownership:{default:-1},flags:{'pacts-fantasy-arcade':{key}},_stats:stats});};

page('chapter-welcome',RULEBOOK_CHAPTERS[0].title,`<p><img src="modules/pacts-fantasy-arcade/assets/art/banner.webp" alt="Fantasy Arcade" width="640"/></p>${RULEBOOK_CHAPTERS[0].html}<h3>Contents</h3>${RULE_CATEGORIES.map(([cat,ids])=>`<p><b>${cat}:</b> ${ids.map(id=>`@UUID[.${rulePageId(id)}]{${GAME_RULES[id].title}}`).join(' · ')}</p>`).join('')}`);
for(const ch of RULEBOOK_CHAPTERS.slice(1))page(`chapter-${ch.id}`,ch.title,ch.html);
const covered=new Set();
for(const [cat,ids] of RULE_CATEGORIES){
 page(`category-${cat}`,`— ${cat} —`,`<p><em>${ids.length} games.</em></p><ul>${ids.map(id=>`<li>@UUID[.${rulePageId(id)}]{${GAME_RULES[id].title}} — ${GAME_RULES[id].tagline}</li>`).join('')}</ul>`);
 for(const id of ids){if(!GAME_RULES[id])throw Error(`No rules for ${id}`);covered.add(id);page(id,GAME_RULES[id].title,rulesHTML(id,{image:GAME_ART[id]?.cover}),2);}
}
const missing=PLAYABLE.map(g=>g.id).filter(id=>!covered.has(id));
if(missing.length)throw Error(`Games missing from rulebook categories: ${missing.join(', ')}`);

const entry={_id:RULEBOOK_ENTRY_ID,_key:`!journal!${RULEBOOK_ENTRY_ID}`,name:'Fantasy Arcade Rulebook',pages,folder:null,categories:[],sort:0,ownership:{default:2},flags:{'pacts-fantasy-arcade':{version:manifest.version}},_stats:stats};
const src=path.join(root,'packs/_source',RULEBOOK_PACK),dest=path.join(root,'packs',RULEBOOK_PACK);
fs.rmSync(src,{recursive:true,force:true});fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(src,{recursive:true});
fs.writeFileSync(path.join(src,`Fantasy_Arcade_Rulebook_${RULEBOOK_ENTRY_ID}.json`),JSON.stringify(entry,null,1));
await compilePack(src,dest,{log:false});
console.log(`Rulebook compiled: ${pages.length} pages (${covered.size} games) → ${dest}`);
