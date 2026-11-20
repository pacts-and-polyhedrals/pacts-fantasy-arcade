import os, json
from motifs import *
from covers import PAL, C, scene, frame
OUT='/home/claude/art_out/svg2'; os.makedirs(OUT,exist_ok=True)
KITS={
 'duelist':('#7a1020',lambda: sword(0,30,.55,-30)+sword(0,30,.55,30)),
 'bruiser':('#5a2a10',lambda: hammer(0,40,.5,-25)),
 'mage':('#2a1a5a',lambda: wizard_hat(0,40,.55)),
 'wrestler':('#6a3a10',lambda: fist(0,-28,.42,0)),
 'beast':('#3a2418',lambda: boar(-10,0,.5,True)),
 'guardian':('#1a3a5a',lambda: shield(0,0,.62,0,'crown')),
 'archer':('#1d3a1d',lambda: bow(0,0,.55,-20)),
 'rider':('#3a3a1a',lambda: spear(0,60,.42,40)+shield(-10,10,.35,-10,'dragon')),
 'rogue':('#2a1336',lambda: dagger(0,10,.75,25)),
 'bard':('#5a1030',lambda: lute(0,40,.42,-20)),
 'poet':('#3a2a10',lambda: quill(0,0,.6,25)),
 'orator':('#30301a',lambda: scales(0,10,.38)),
 'dummy':('#4a3a20',lambda: dummy(0,10,.42)),
 'raider':('#40100a',lambda: goblin(0,0,.55,0,'grin')),
}
p=PAL['arena']
for k,(col,fn) in KITS.items():
    body=f'<circle r="118" fill="{col}" stroke="#140a06" stroke-width="10"/><circle r="104" fill="url(#halo)" opacity=".55"/>{fn()}<circle r="112" fill="none" stroke="url(#gold)" stroke-width="10"/><circle r="122" fill="none" stroke="#140a06" stroke-width="6"/>'
    open(f'{OUT}/kit-{k}.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-128 -128 256 256">{defs(p)}{body}</svg>')
# Banner 1280x640: montage of hero layers with title
sp=json.load(open('sprites.json'))
pb=dict(bg1='#07030a',bg2='#2a0d1e',glow='#ffb347')
picks=[('coin-of-fate',150,190,.42),('wyrm-s-eye',1130,190,.42),('goblin-s-bluff',330,470,.42),('battle-of-the-bards',950,470,.42),('wyvern-chess',640,150,.42)]
layers=''
for gid,x,y,s in picks:
    hero=C[gid][1]()
    for a,b in sp.items(): hero=hero.replace(a,b)
    layers+=f'<g transform="translate({x} {y}) scale({s}) translate(-480 -250)">{hero}</g>'
title='<text x="640" y="370" text-anchor="middle" font-family="Cinzel Decorative" font-weight="700" font-size="104" fill="url(#gold)" stroke="#140a06" stroke-width="3">Fantasy Arcade</text>'
sub='<text x="640" y="268" text-anchor="middle" font-family="Cinzel" font-weight="700" font-size="34" fill="#f3e3bd" letter-spacing="8">PACTS &amp; POLYHEDRALS</text><text x="640" y="430" text-anchor="middle" font-family="EB Garamond" font-style="italic" font-size="34" fill="#f3e3bd">73 tavern games, casino tables, puzzles &amp; arena contests for Foundry VTT</text>'
banner=f'<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640">{defs(pb)}<rect width="1280" height="640" fill="url(#bgGlow)"/>{stars(160,5,(0,0,1280,640))}{smoke(9,"#ffb347",.08,500)}{layers}<rect x="130" y="220" width="1020" height="236" rx="20" fill="#0b0604" fill-opacity=".72" stroke="url(#gold)" stroke-width="3"/>{sub}{title}<rect width="1280" height="640" fill="url(#vignette)"/><rect x="16" y="16" width="1248" height="608" rx="12" fill="none" stroke="url(#gold)" stroke-width="4"/></svg>'
open(f'{OUT}/banner.svg','w').write(banner)
print('ok')
