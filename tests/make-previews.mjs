import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {renderArcade} from '../scripts/ui/view.mjs';
import {ArcadeSessions} from '../scripts/core/session.mjs';
const games=JSON.parse(readFileSync(new URL('../data/catalog.json',import.meta.url))).games;
const out=new URL('./screens/',import.meta.url);mkdirSync(out,{recursive:true});
const rng=(()=>{let state=7;return()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296}})();
const base={catalog:games,gm:true,user:{id:'u1',name:'DM Asmo'},selected:'goblin-s-bluff',sessions:[],session:null,showAll:false,filter:'',tutorialStep:0,power:75,heat:50,ingredient:0,angle:45,aimValue:50,aimX:0,aimY:0,selectedSquare:null,bidQty:2,bidFace:3,coinMode:'classic',coinRounds:5,packs:[],ledger:[],reducedMotion:false};
const wrappers=(name,html)=>{
 const full=`<!doctype html><html><head><meta charset="utf-8"><title>${name}</title><style>${readFileSync(new URL('../styles/arcade.css',import.meta.url),'utf8')}</style><style>body{background:#11141d;margin:0;padding:26px;display:flex;justify-content:center}.pfa-application{width:1180px;height:850px;border:1px solid #947d68;box-shadow:0 10px 40px #0009}.pfa-application .window-content{height:100%;}</style></head><body><div class="pfa-application"><div class="window-content">${html}</div></div></body></html>`;
 writeFileSync(new URL(`./screens/${name}.html`,import.meta.url),full);
};
for(const gameId of ['goblin-s-bluff','dwarven-dominoes','goblin-s-bones','moonlit-solitaire','tinker-s-lock-race']){
 const manager=new ArcadeSessions(rng),id=`table-preview-${gameId}`;
 manager.create({gameId,id,userId:'u1',userName:'DM Asmo'});manager.addNpc({id,userId:'u1',name:'Grukk',controlled:false,gm:true});manager.start({id,userId:'u1',gm:true});
 const session=manager.publicView(manager.sessions.get(id),'u1',true);
 wrappers(gameId,renderArcade({...base,selected:gameId,session,sessions:[session],seatId:session.seats[0].id}));
}
wrappers('pack-studio',renderArcade({...base,packOpen:true,packName:'New adventure pack',packType:'trivia',session:null}));
