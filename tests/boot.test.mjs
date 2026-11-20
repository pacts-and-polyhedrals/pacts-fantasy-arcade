import test from 'node:test';
import assert from 'node:assert/strict';

// This is a deliberately limited shim, not a live Foundry or Forge certification.
test('Foundry v14 module boots with fake core APIs, registers settings and saves a GM-created table', async()=>{
 const hooks=new Map(), settings=new Map(), onSocket=new Map(), seenLaunchers=[];
 globalThis.Hooks={once:(name,fn)=>hooks.set(name,fn),on:(name,fn)=>hooks.set(name,fn)};
 globalThis.foundry={applications:{api:{ApplicationV2:class {render(){this.rendered=true;return Promise.resolve(this);}}}}};
 const users=new Map([['gm',{id:'gm',name:'GM',active:true,isGM:true}],['alice',{id:'alice',name:'Alice',active:true,isGM:false}]]);
 users.filter=fn=>[...users.values()].filter(fn);
 users[Symbol.iterator]=function*(){yield* this.values();};
 const notices=[];
 globalThis.ui={notifications:{warn:msg=>notices.push(msg),error:msg=>notices.push(msg)}};
 globalThis.game={user:users.get('gm'),users,
  settings:{register:(module,key,d)=>settings.set(`${module}.${key}`,structuredClone(d.default)),get:(module,key)=>settings.get(`${module}.${key}`),set:async(module,key,val)=>{settings.set(`${module}.${key}`,structuredClone(val));return val;}},
  socket:{on:(name,callback)=>onSocket.set(name,callback),emit(){}}};
 globalThis.document={getElementById:()=>null,createElement:(tag)=>({tag,setAttribute(){},addEventListener(){}}),body:{appendChild:(el)=>seenLaunchers.push(el)}};
 globalThis.fetch=async()=>({ok:true,json:async()=>({games:Array.from({length:131},(_,i)=>({id:`concept-${i}`,title:`Concept ${i}`}))})});
 await import('../scripts/main.mjs');
 assert(hooks.has('init')&&hooks.has('ready'));
 hooks.get('init')();
 assert.deepEqual(settings.get('pacts-fantasy-arcade.arcadeWorldState').sessions,[]);
 await hooks.get('ready')();
 assert.equal(game.pactsFantasyArcade.version,JSON.parse((await import('node:fs')).readFileSync(new URL('../module.json',import.meta.url))).version);
 assert.equal(game.pactsFantasyArcade.games.length,73);
 assert.equal(seenLaunchers[0].id,'pfa-launcher');
 assert(onSocket.has('module.pacts-fantasy-arcade'));
 await onSocket.get('module.pacts-fantasy-arcade')({kind:'request',from:'gm',command:{type:'create',payload:{id:'table-boot-one-123',gameId:'coin-of-fate',userName:'GM'}}});
 // The handler queues a state write, so follow it by polling a resolved microtask only.
 for(let i=0;i<10&&!settings.get('pacts-fantasy-arcade.arcadeWorldState').sessions.length;i++)await Promise.resolve();
 assert.equal(settings.get('pacts-fantasy-arcade.arcadeWorldState').sessions.length,1);
 assert.deepEqual(notices,[]);
});
