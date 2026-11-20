import test from 'node:test';
import assert from 'node:assert/strict';
import {PRIORITY_SYSTEMS,detectArcadeSystem,isImportableActor,previewCharacterForGame,validateCharacterLink,makeWorldLink,gameSheetPolicy} from '../scripts/core/system-bridge.mjs';
import {ArcadeSessions} from '../scripts/core/session.mjs';
import {renderSystemBridge} from '../scripts/ui/system-bridge-view.mjs';

const actor=(name,type='character',system={},items=[])=>({id:'validActor01234',uuid:'Actor.validActor01234',name,type,system,items});
const preview=(a,id,gameId)=>previewCharacterForGame(a,{systemId:id,systemVersion:'14.1',gameId});
const imagi=()=>actor('Lumi','character',{
 classKey:'entertainer',ancestryKey:'goblin',level:3,
 stats:{capability:{muscle:4,skill:3,tough:2,smarts:2,senses:3,charm:4},connection:{heart:4,mind:2,hands:4,voice:5}},
 cards:{help:{value:3,max:3},power:{value:3,max:3}},
 identity:{fear:'a private story',bond:'a private bond'},biography:'PRIVATE BIOGRAPHY'
 },[{name:'Power Card',type:'card'},{name:'Whispering Pipe',type:'equipment'}]);
const dnd=()=>actor('Ariadne','character',{
 abilities:{str:{mod:4},dex:{mod:2},con:{mod:2},int:{mod:0},wis:{mod:1},cha:{mod:1}},
 skills:{ath:{value:2},prf:{value:1},inv:{value:0}},details:{class:'Fighter'}
 },[{type:'class',name:'Fighter'},{type:'equipment',name:'Climbing Kit'}]);
const pf2=()=>actor('Kess','character',{
 abilities:{str:{mod:3},dex:{mod:1},con:{mod:2},int:{mod:1},wis:{mod:0},cha:{mod:1}},
 skills:{athletics:{rank:4},crafting:{rank:2}},details:{class:{name:'Fighter'},ancestry:{name:'Elf'}}
 },[{type:'class',name:'Fighter'}]);
const dagger=()=>actor('Marrow','character',{
 traits:{agility:{value:1},strength:{value:2},finesse:{value:0},instinct:{value:0},presence:{value:2},knowledge:{value:1}},
 resources:{hope:{value:5,max:6},stress:{value:1,max:6}},
 experiences:{first:{name:'Born for the Stage',value:2},second:{name:'Stormborn Wanderer',value:2}},
 biography:{background:'PRIVATE BACKGROUND'}
 },[{type:'class',name:'Bard'},{type:'domainCard',name:'Shimmering Tune'}]);

test('detects the four priority Foundry systems and a legacy Imagi ID',()=>{
 assert.deepEqual(PRIORITY_SYSTEMS,['imagi-nations','dnd5e','pf2e','daggerheart']);
 for(const id of PRIORITY_SYSTEMS){const found=detectArcadeSystem({system:{id,version:'14.9'}});assert.equal(found.recognised,true);assert.equal(found.adapter,id);assert.equal(found.version,'14.9');}
 const old=detectArcadeSystem({system:{id:'imaginations-rpg'}});assert.equal(old.adapter,'imagi-nations');assert.match(old.warning,/legacy/i);
 const generic=detectArcadeSystem({system:{id:'unknown-system'}});assert.equal(generic.recognised,false);
});

test('Imagi-Nations current Capability plus Connection mapping drives bard and craft recommendations',()=>{
 const a=imagi(),snap=structuredClone(a);
 const bard=preview(a,'imagi-nations','battle-of-the-bards');
 assert.equal(bard.adapter,'imagi-nations');assert.equal(bard.kit,'bard');assert.equal(bard.affinity,'presence');assert.equal(bard.affinityScore,4);
 assert(bard.classes.includes('entertainer'));
 assert.equal(bard.arenaProfile.archetype,'bard');
 const craft=preview(a,'imagi-nations','potion-sorting-sprint');assert.equal(craft.affinity,'craft');assert.equal(craft.affinityScore,4);
 assert.deepEqual(a,snap,'Read-only adapter must never write to Actor');
 for(const p of [bard,craft])for(const secret of ['PRIVATE BIOGRAPHY','a private story','a private bond','Power Card'])assert(!JSON.stringify(p).includes(secret));
});

test('Imagi-Nations legacy 6-stat Actor is handled without inventing absent Connection stats',()=>{
 const a=actor('Old Hero','character',{stats:{muscle:3,skill:2,tough:1,smarts:4,senses:2,charm:2},classKey:'sorcerer'});
 const duel=preview(a,'imaginations-rpg','wizard-duel');assert.equal(duel.kit,'mage');assert.equal(duel.affinity,'magic');assert(duel.affinityScore>=1);
 const bard=preview(a,'imaginations-rpg','battle-of-the-bards');assert(bard.affinityScore!==null);
 const missing=preview(actor('Unprepared','character',{classKey:'soldier'}),'imagi-nations','darts-of-the-deep');
 assert.equal(missing.assistance,0);assert.equal(missing.affinityScore,null);
});

test('Imagi-Nations learner/private education Actors and nonplayable Actors can never be linked',()=>{
 const learner=actor('Child Records','learner',{accommodations:'PRIVATE',boundaries:'PRIVATE'});
 assert.equal(isImportableActor(learner,'imagi-nations'),false);
 assert.throws(()=>preview(learner,'imagi-nations','battle-of-the-bards'),/not eligible/);
 for(const type of ['party','environment','vehicle','loot','hazard'])assert.equal(isImportableActor(actor(type,type,{}),'dnd5e'),false);
 assert.equal(isImportableActor(imagi(),'imagi-nations'),true);
});

test('D&D 5e official ability modifiers and proficiency contribute to bounded skill assistance',()=>{
 const a=dnd();const p=preview(a,'dnd5e','arm-wrestling-at-the-bar');
 assert.equal(p.adapter,'dnd5e');assert(p.assistance>=1&&p.assistance<=2);assert.equal(p.affinity,'might');
 assert.equal(preview(a,'dnd5e','fighting-pit-tournament').arenaProfile.archetype,'duelist');
 assert.equal(preview(a,'dnd5e','coin-of-fate').assistance,0);
});

test('Pathfinder 2e proficiency ranks are mapped without treating character level as raw skill rank',()=>{
 const p=preview(pf2(),'pf2e','arm-wrestling-at-the-bar');
 assert.equal(p.adapter,'pf2e');assert(p.affinityScore<=4&&p.assistance>=1);
 assert.equal(preview(pf2(),'pf2e','fighting-pit-tournament').arenaProfile.archetype,'duelist');
});

test('Daggerheart traits, class and selected Experiences become advice, not resource expenditure',()=>{
 const a=dagger(),old=structuredClone(a);
 const bard=preview(a,'daggerheart','battle-of-the-bards');
 assert.equal(bard.adapter,'daggerheart');assert.equal(bard.arenaProfile.archetype,'bard');
 assert(bard.experienceSuggestions.includes('Born for the Stage'));
 assert(!JSON.stringify(bard).includes('PRIVATE BACKGROUND'));
 assert(!JSON.stringify(bard).includes('Stormborn Wanderer'));
 assert(!JSON.stringify(bard).includes('"hope"'));
 assert(!JSON.stringify(bard).includes('"stress"'));
 assert.deepEqual(a,old);
});

test('Daggerheart subclass spellcasting trait is preferred for magical duels',()=>{
 const a=dagger();a.items.push({type:'subclass',name:'Spellweaver',system:{spellcastingTrait:'presence'}});
 a.system.traits.knowledge.value=-1;
 const p=preview(a,'daggerheart','wizard-duel');assert.equal(p.kit,'mage');assert(p.affinityScore>=3);
});

test('Unrecognised systems remain read-only identity links with zero bonuses',()=>{
 const a=actor('The Traveller','character',{abilities:{str:{mod:5}},skills:{athletics:{rank:4}}},[{type:'class',name:'Fighter'}]);
 const p=preview(a,'custom-system','fighting-pit-tournament');assert.equal(p.arenaProfile,null);assert.equal(p.affinityScore,null);
 const dart=preview(a,'custom-system','darts-of-the-deep');assert.equal(dart.assistance,0);
});

test('All four priority systems can preview every one of the 73 currently coded games',async()=>{
 const {PLAYABLE}=await import('../scripts/core/data.mjs');
 assert.equal(PLAYABLE.length,73);
 for(const [id,a] of [['imagi-nations',imagi()],['dnd5e',dnd()],['pf2e',pf2()],['daggerheart',dagger()]]){
  for(const g of PLAYABLE){const p=preview(a,id,g.id);assert.equal(p.adapter,id);assert.equal(p.gameId,g.id);assert(p.assistance>=0&&p.assistance<=2);}
 }
});

test('GM must approve links, and a saved Actor profile survives a schema 5 restore without modifying sources',()=>{
 const manager=new ArcadeSessions(()=>.5);
 const id='table-system-test';const s=manager.handle({type:'create',payload:{id,gameId:'battle-of-the-bards'}},{userId:'gm',gm:true});
 const seatId=s.seats[0].id;
 const p=preview(imagi(),'imagi-nations','battle-of-the-bards');
 assert.throws(()=>manager.handle({type:'configureCharacterLink',payload:{id,seatId,profile:p}},{userId:'other',gm:false}),/Only a GM/);
 manager.handle({type:'configureCharacterLink',payload:{id,seatId,profile:p}},{userId:'gm',gm:true});
 const out=manager.exportState();assert.equal(out.schema,5);
 const next=new ArcadeSessions(()=>.5);next.restoreState(out);
 const restored=next.summaries('gm',true)[0].seats[0];assert.equal(restored.characterLink.systemId,'imagi-nations');
 assert.equal(restored.arenaProfile.archetype,'bard');
 assert.throws(()=>next.handle({type:'unlinkCharacter',payload:{id,seatId}},{userId:'other',gm:false}),/Only the GM/);
});

test('Link validation rejects unsupported mechanical bonuses but accepts all four approved systems',()=>{
 const empty=actor('Stranger');
 for(const id of PRIORITY_SYSTEMS){const p=preview(empty,id,'darts-of-the-deep');assert.equal(validateCharacterLink(p).systemId,id);}
 const p=preview(empty,'homebrew','darts-of-the-deep');
 assert.throws(()=>validateCharacterLink({...p,assistance:2}),/Unknown system/);
});

test('World links retain only Scene and Journal identifiers and display names',()=>{
 const linked=makeWorldLink({id:'testScene004',name:'The Ring',secret:'hidden'},{id:'testJournal04',name:'Announcer Notes',content:'secret NPC dialogue'});
 assert.deepEqual(Object.keys(linked).sort(),['journalId','journalName','protocol','sceneId','sceneName']);
 assert(!JSON.stringify(linked).includes('secret'));
});

test('GM view is tailored to Imagi-Nations and Daggerheart and escapes uploaded names',()=>{
 const s={gameId:'battle-of-the-bards',seats:[{id:'one',name:'Player & Friend',kind:'person',ownerId:'user1'}]};
 const gm={gm:true,systemInfo:detectArcadeSystem({system:{id:'imagi-nations',version:'1.26.1'}}),worldActors:[{id:'validActor01234',name:'Lumi <test>',ownerId:'user1'}],actorPreviews:{one:preview(imagi(),'imagi-nations','battle-of-the-bards')}};
 const html=renderSystemBridge(s,gm);
 assert.match(html,/Imagi-Nations/);assert.match(html,/Capability and Connection/);assert(!html.includes('Lumi <test>'));
 const d=renderSystemBridge(s,{...gm,systemInfo:detectArcadeSystem({system:{id:'daggerheart'}}),actorPreviews:{one:preview(dagger(),'daggerheart','battle-of-the-bards')}});
 assert.match(d,/Possible Daggerheart Experiences/);assert.match(d,/Hope or Stress/);
});

test('Arcade policy leaves luck-based games untouched by character expertise',()=>{
 const p=gameSheetPolicy('coin-of-fate');assert.equal(p.luck,true);
 for(const id of PRIORITY_SYSTEMS){const a=({ 'imagi-nations':imagi,'dnd5e':dnd,'pf2e':pf2,'daggerheart':dagger})[id]();assert.equal(preview(a,id,'coin-of-fate').assistance,0);}
});


test('Player snapshots omit GM-only world references and Daggerheart Experience details',()=>{
 const manager=new ArcadeSessions(()=>.5);const id='table-private-bridge';
 const s=manager.handle({type:'create',payload:{id,gameId:'battle-of-the-bards'}},{userId:'gm',gm:true});
 const profile=preview(dagger(),'daggerheart','battle-of-the-bards');
 manager.configureCharacterLink({id,seatId:s.seats[0].id,profile,gm:true});
 manager.configureWorldContext({id,worldLink:makeWorldLink({id:'testScene0123',name:'Secret Arena'},{id:'journalSecret23',name:'GM Journal'}),gm:true});
 const visible=manager.summaries('gm',true)[0],other=manager.summaries('viewer',false)[0];
 assert(visible.worldLink?.journalName==='GM Journal');assert(visible.seats[0].characterLink.experienceSuggestions.length>0);
 assert.equal(other.worldLink,undefined);assert.equal(other.seats[0].characterLink.experienceSuggestions,undefined);
});
