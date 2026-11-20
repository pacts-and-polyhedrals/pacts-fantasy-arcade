"""Compose Fantasy Arcade cover art: 960×540 SVG masters (with title plate) and 512×512 thumbnails."""
import json, os, sys
from motifs import *

PAL = {
 'dice':    dict(bg1='#0c0306', bg2='#3b0a12', glow='#ff7a3c', felt1='#6b1220', felt2='#1c0408', label='Dice & Wagers'),
 'cards':   dict(bg1='#020a06', bg2='#0d3322', glow='#e8b14a', felt1='#1f6b45', felt2='#0b2a1b', label='Cards & Casino'),
 'board':   dict(bg1='#04050f', bg2='#151c3d', glow='#8fb4ff', label='Board & Strategy'),
 'tavern':  dict(bg1='#0b0503', bg2='#3a1a0a', glow='#ffb347', label='Tavern & Inn'),
 'festival':dict(bg1='#08040f', bg2='#2c1240', glow='#ff9f1c', label='Festivals & Crafts'),
 'puzzle':  dict(bg1='#020809', bg2='#0b2e33', glow='#5ff3e0', label='Riddles & Logic'),
 'perform': dict(bg1='#0a0206', bg2='#3a0a1a', glow='#ffd36b', label='Performance & Social'),
 'arena':   dict(bg1='#0b0402', bg2='#40180a', glow='#ff6a2a', label='Combat & Arena'),
 'magic':   dict(bg1='#05020a', bg2='#1e0f33', glow='#b8ff6b', label='Magic & Exploration'),
}

def frame(title, label, thumb=False):
    corner = f'<path d="M0,0 L70,0 M0,0 L0,70 M10,10 C40,10 50,20 50,50 C20,50 10,40 10,10Z" stroke="url(#gold)" stroke-width="4" fill="none"/><circle cx="14" cy="14" r="5" fill="url(#gold)"/>'
    out = '<rect width="960" height="540" fill="url(#vignette)"/>'
    out += '<rect x="14" y="14" width="932" height="512" rx="10" fill="none" stroke="url(#gold)" stroke-width="3"/><rect x="22" y="22" width="916" height="496" rx="6" fill="none" stroke="#e8b14a" stroke-opacity=".35" stroke-width="1.5"/>'
    for tx, ty, sx, sy in ((26, 26, 1, 1), (934, 26, -1, 1), (26, 514, 1, -1), (934, 514, -1, -1)):
        out += f'<g transform="translate({tx} {ty}) scale({sx} {sy})">{corner}</g>'
    if thumb:
        return out
    safe = title.replace('&', '&amp;')
    size = 46 if len(title) <= 18 else 40 if len(title) <= 24 else 34
    fit = f' textLength="{min(560, int(len(title)*size*0.66))}" lengthAdjust="spacingAndGlyphs"' if len(title) > 16 else ''
    out += f'<path d="M180,452 L780,452 L812,482 L780,512 L180,512 L148,482Z" fill="#0b0604" fill-opacity=".86" stroke="url(#gold)" stroke-width="3"/>'
    out += f'<path d="M130,482 L152,470 L152,494Z M830,482 L808,470 L808,494Z" fill="url(#gold)"/>'
    out += f'<text x="480" y="{482+size*0.34:.0f}" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="{size}" fill="url(#gold)" stroke="#140a06" stroke-width="1.2" letter-spacing="1.5"{fit}>{safe}</text>'
    out += f'<text x="480" y="444" text-anchor="middle" font-family="EB Garamond" font-style="italic" font-size="21" fill="#f3e3bd" opacity=".92">{label} · Pacts &amp; Polyhedrals Fantasy Arcade</text>'
    return out

def scene(cat, seed):
    p = PAL[cat]
    base = f'<rect width="960" height="540" fill="url(#bgGlow)"/>'
    if cat == 'dice':
        base += smoke(seed, '#ff9f6b', .07, 300) + felt_table(330)
    elif cat == 'cards':
        base += felt_table(310) + smoke(seed, '#ffffff', .05, 260)
    elif cat == 'board':
        base += stars(140, seed) + mountains('#0a0d1e', 420)
    elif cat == 'tavern':
        base += beams() + smoke(seed, '#ffd9a0', .07, 200) + table_edge(410)
    elif cat == 'festival':
        base += stars(90, seed) + lanterns(seed) + mountains('#160a22', 430)
    elif cat == 'puzzle':
        base = stone_wall(seed, '#0d1a1d', '#020607') + f'<rect width="960" height="540" fill="url(#bgGlow)" opacity=".75"/>' + runes_ring(480, 250, 230, '#5ff3e0', .32)
    elif cat == 'perform':
        base += f'<ellipse cx="480" cy="540" rx="520" ry="120" fill="#3a1408" stroke="#140a06" stroke-width="5"/>' + f'<path d="M330,0 L630,0 L760,540 L200,540Z" fill="#fff4c2" opacity=".07"/>' + curtains()
    elif cat == 'arena':
        base += colosseum(400) + smoke(seed, '#ffcc88', .08, 440)
    elif cat == 'magic':
        base += stars(120, seed) + smoke(seed, '#b8ff6b', .06, 330) + mountains('#0c0716', 430)
    return base

# Each composition returns SVG for the hero layer. Coordinates assume 960×540; centre ≈ (480, 250).
C = {}
def comp(gid, cat):
    def deco(fn):
        C[gid] = (cat, fn); return fn
    return deco

@comp('coin-of-fate', 'dice')
def _(): return halo(480, 240, 230) + coin(400, 250, 1.25, 'crown', -12) + coin(600, 230, .9, 'dragon', 18) + sparkle(300, 150, .9) + sparkle(690, 330, .6) + embers(30, 2)
@comp('wyrm-s-eye', 'dice')
def _(): return dragon_eye(480, 210, 1.15) + polyhedron(330, 340, .95, 12, 'url(#crimson)', '12', -10) + polyhedron(640, 345, .8, 12, 'url(#violet)', '7', 12) + embers(25, 3)
@comp('serpent-s-seven', 'dice')
def _():
    serpent = f'<path d="M150,330 C220,170 360,380 470,250 C580,120 700,330 800,200" stroke="#2f6b2a" stroke-width="44" fill="none" stroke-linecap="round"/><path d="M150,330 C220,170 360,380 470,250 C580,120 700,330 800,200" stroke="{INK}" stroke-width="4" fill="none"/>'
    head = f'<g transform="translate(800 200) rotate(-25)"><path d="M-20,-30 C40,-40 90,-10 90,10 C90,30 40,40 -20,30Z" fill="#3c8a34" {stroke(5)}/><circle cx="40" cy="-8" r="9" fill="url(#eye)"/><path d="M60,22 L56,46 L66,26Z M74,20 L72,42 L80,22Z" fill="url(#bone)" {stroke(2)}/><path d="M90,10 L120,4 M120,4 L132,-6 M120,4 L132,14" stroke="{CRIMSON}" stroke-width="4"/></g>'
    return halo(480, 260, 220) + serpent + head + die(390, 300, .95, -6, 3, 4, 1) + die(560, 310, .95, 8, 3, 2, 6) + embers(20, 4)
@comp('lucky-kobold', 'dice')
def _(): return halo(480, 240, 220) + kobold(450, 230, 1.15) + polyhedron(250, 340, .55, 4, 'url(#teal)', '4') + polyhedron(700, 330, .7, 8, 'url(#violet)', '8') + polyhedron(600, 380, .75, 12, 'url(#crimson)', '12') + sparkle(330, 140, .8) + embers(26, 5)
@comp('king-s-high-roll', 'dice')
def _(): return halo(480, 210, 220) + crown(480, 150, 1.3) + die(340, 330, .9, -8, 6, 6, 5) + die(480, 350, .9, 0, 6, 4, 2) + die(620, 330, .9, 8, 5, 3, 1) + goblin(800, 330, .55, 10, 'smug', 'top') + embers(20, 6)
@comp('devil-s-knuckles', 'dice')
def _():
    devil = f'<g transform="translate(480 190)"><path d="M-110,-40 C-150,-120 -90,-160 -60,-110 M110,-40 C150,-120 90,-160 60,-110" stroke="#e8d9b0" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M-100,0 C-100,-120 100,-120 100,0 C100,80 50,120 0,120 C-50,120 -100,80 -100,0Z" fill="url(#crimson)" {stroke(7)}/><path d="M-70,-10 L-20,10 L-60,20Z M70,-10 L20,10 L60,20Z" fill="#ffe24a" filter="url(#glow)"/><path d="M-50,60 C-20,90 20,90 50,60 C20,72 -20,72 -50,60Z" fill="#1a0505" {stroke(4)}/><path d="M-30,64 l6,12 l6,-10z M20,64 l6,12 l4,-12z" fill="url(#bone)"/></g>'
    return halo(480, 230, 230) + devil + die(300, 360, .8, -14, 4, 4, 2) + die(410, 380, .8, -4, 4, 1, 3) + die(550, 380, .8, 6, 4, 6, 5) + die(660, 360, .8, 14, 4, 2, 2) + embers(40, 7)
@comp('three-dragon-slots', 'dice')
def _(): return halo(480, 230, 240) + slot_machine(480, 250, 1.05) + coin(180, 380, .45, 'dragon', -20) + coin(780, 390, .5, 'crown', 20) + sparkle(220, 140, .7) + sparkle(760, 130, .9) + embers(40, 8, area=(120, 60, 840, 420))
@comp('seven-skulls', 'dice')
def _():
    out = halo(480, 240, 230)
    for i, (x, y, s, r) in enumerate(((240, 330, .6, -14), (340, 270, .7, -6), (480, 220, .9, 0), (620, 270, .7, 6), (720, 330, .6, 14), (400, 370, .55, -4), (560, 370, .55, 4))):
        out += skull(x, y, s, r, '#b8ff6b' if i == 2 else None)
    return out + embers(30, 9, color='#b8ff6b')
@comp('crown-bones', 'dice')
def _(): return halo(480, 240, 240) + scorecard(330, 240, 1, -6) + crown(620, 140, .8, 10) + skull(650, 320, .75, 8) + die(540, 370, .7, 0, 5, 5, 5) + die(760, 380, .7, 10, 5, 2, 3) + embers(20, 10)
@comp('giant-s-grip', 'dice')
def _():
    hand = f'<g transform="translate(720 210) rotate(-15)"><path d="M-80,-60 C-40,-110 80,-100 100,-40 L120,60 C100,110 -40,120 -90,60Z" fill="#8a7a9a" {stroke(7)}/><path d="M-60,-40 L80,-40 M-60,0 L90,0 M-60,40 L90,40" stroke="{INK}" stroke-width="5"/><path d="M-80,-60 C-120,-40 -130,20 -100,40" fill="#8a7a9a" {stroke(6)}/></g>'
    return halo(480, 250, 230) + chain(200, 260, 1.1, -12, 9) + hand + die(320, 360, .8, -6, 6, 3, 2) + die(470, 390, .75, 8, 5, 1, 4) + embers(20, 11)
@comp('cauldron-craps', 'dice')
def _(): return halo(480, 230, 240) + cauldron(480, 260, 1.15, 'url(#violet)') + die(340, 130, .7, -20, 5, 2, 1) + die(620, 120, .7, 18, 2, 6, 3) + embers(40, 12, color='#d7a8ff')
@comp('witches-triad', 'dice')
def _(): return halo(480, 230, 240) + goblin(480, 210, .95, 0, 'smug', 'witch') + die(320, 380, .75, -8, 3, 2, 3) + die(480, 400, .75, 0, 3, 6, 1) + die(640, 380, .75, 8, 3, 4, 3) + embers(30, 13, color='#d7a8ff')
@comp('goblin-s-bluff', 'dice')
def _(): return halo(480, 230, 240) + goblin(330, 220, .85, -8, 'smug') + goblin(650, 230, .8, 8, 'shock', None, True) + cup(480, 360, .9, 0) + die(380, 400, .5, -10, 6, 2, 3) + die(590, 410, .5, 10, 6, 5, 4) + embers(16, 14)
# cards
@comp('black-dragon', 'cards')
def _():
    wings = f'<g transform="translate(480 180)" opacity=".9"><path d="M0,0 C-120,-120 -300,-100 -360,0 C-280,-30 -200,0 -150,40 C-120,10 -60,0 0,30Z M0,0 C120,-120 300,-100 360,0 C280,-30 200,0 150,40 C120,10 60,0 0,30Z" fill="#0d0a14" {stroke(6)}/></g>'
    return wings + halo(480, 240, 200) + card(400, 270, 1, -12, 'A', '♠') + card(520, 260, 1, 8, '10', '♥', CRIMSON) + chip_stack(250, 360, 5, .8) + chip_stack(720, 370, 4, .8, 'url(#gold)') + embers(16, 15)
@comp('three-card-wyvern', 'cards')
def _(): return halo(480, 230, 220) + card(370, 250, .95, -16, '5', '☀', '#c4860a') + card(480, 235, .95, 0, '5', '☾', '#2b3a8a') + card(590, 250, .95, 16, '5', '🔥', CRIMSON) + goblin(800, 330, .5, 8, 'shock', None, True) + embers(14, 16)
@comp('waterdeep-hold-em', 'cards')
def _():
    out = halo(480, 230, 240)
    for i, (rk, st, col) in enumerate((('A', '♠', INK), ('K', '♠', INK), ('Q', '♠', INK), ('J', '♠', INK), ('10', '♠', INK))):
        out += card(260 + i * 110, 210, .78, (i - 2) * 3, rk, st, col)
    return out + chip_stack(330, 380, 6, .75) + chip_stack(480, 390, 4, .75, 'url(#gold)') + chip_stack(630, 380, 5, .75, '#1f4fa8') + embers(16, 17)
@comp('three-wyrms-ante', 'cards')
def _(): return halo(480, 230, 230) + card(330, 250, .95, -14, '9', '🔥', CRIMSON) + card(480, 230, .95, 0, '7', '💧', '#1f5aa8') + card(630, 250, .95, 14, '10', '⚡', '#a07a00') + flame(250, 120, .5) + droplet(480, 90, .45) + bolt(720, 110, .5) + embers(16, 18)
@comp('dragon-s-trick', 'cards')
def _(): return halo(480, 240, 230) + card(300, 280, .8, -20, '3', '🌿', '#2f7a2a') + card(400, 250, .8, -8, '8', '🌿', '#2f7a2a') + card(520, 250, .8, 6, '12', '🔥', CRIMSON) + card(640, 280, .8, 18, '6', '🌿', '#2f7a2a') + crown(520, 110, .45) + embers(16, 19)
@comp('bard-s-bluff', 'cards')
def _(): return halo(480, 240, 230) + mask(360, 230, .95, -12) + mask(600, 240, .9, 12, 'url(#crimson)', True) + card(480, 370, .65, 0, '?', '🎵', back=True) + note(250, 120, .6) + note(740, 130, .5, 20) + embers(16, 20)
@comp('moonlit-solitaire', 'cards')
def _(): return stars(60, 21) + halo(480, 160, 160) + moon(480, 110, .9) + pyramid_cards(480, 210, 1) + embers(10, 21, color='#cfe0ff')
# board
@comp('runestone-checkers', 'board')
def _():
    out = board_grid(480, 120, 8, 34, '#d9c9a3', '#2a1608')
    for (c, r, col, k) in ((2, 1, 'url(#crimson)', False), (4, 3, 'url(#gold)', True), (5, 2, 'url(#crimson)', False), (3, 5, 'url(#gold)', False), (6, 5, 'url(#crimson)', True)):
        px = 480 + (c - r) * 34; py = 120 + (c + r) * 17 + 17
        out += checker(px, py, .5, col, k)
    return halo(480, 260, 240) + out + embers(14, 22, color='#cfe0ff')
@comp('dwarven-dominoes', 'board')
def _(): return halo(480, 240, 230) + hammer(220, 260, .6, -30) + domino(380, 250, .9, -20, 6, 6) + domino(480, 240, .9, 0, 6, 3) + domino(580, 250, .9, 20, 3, 1) + domino(720, 300, .7, 70, 1, 5) + embers(14, 23)
@comp('goblin-s-bones', 'board')
def _():
    out = halo(480, 240, 230)
    for i, (gl, face) in enumerate((('💀', True), ('', False), ('🐸', True), ('', False), ('💀', True), ('', False), ('🍄', True), ('', False))):
        out += bone_tile(240 + (i % 4) * 160, 180 + (i // 4) * 150, .85, (i % 3 - 1) * 6, gl, face)
    return out + goblin(840, 380, .45, 10, 'shock', None, True)
@comp('king-s-gambit', 'board')
def _(): return halo(480, 230, 240) + lane_cards(480, 260, .95) + crown(480, 70, .45)
@comp('elemental-conquest', 'board')
def _(): return halo(480, 240, 240) + elemental_grid(480, 130, 1.25) + embers(20, 25, color='#ffe24a')
@comp('royal-hunt', 'board')
def _(): return halo(480, 230, 220) + antlers(470, 220, 1) + bow(260, 270, .8, -20) + arrow(700, 330, 1, -24) + embers(14, 26, color='#cfe0ff')
@comp('wyvern-chess', 'board')
def _():
    out = halo(480, 220, 250)
    for i, (y, col) in enumerate(((150, '#5a7ad9'), (250, '#a07a3a'), (350, '#5a2a6a'))):
        out += f'<g opacity=".95">{board_grid(480, y-60, 6, 24, "#e8d9b0" if i==1 else "#9fb4ff" if i==0 else "#b48ad9", "#2a1608" if i==1 else "#1a2a5a" if i==0 else "#2a103a", .45)}</g>'
    return out + '<image href="SPRITE_DRAGON" x="560" y="60" width="200" height="200"/><image href="SPRITE_KING" x="200" y="200" width="180" height="180"/>' + embers(16, 27, color='#cfe0ff')
# tavern
@comp('arm-wrestling-at-the-bar', 'tavern')
def _():
    arms = f'<g transform="translate(480 250)"><path d="M-260,190 C-200,120 -120,40 -40,-20" stroke="{INK}" stroke-width="96" stroke-linecap="round" fill="none"/><path d="M-260,190 C-200,120 -120,40 -40,-20" stroke="#d9a074" stroke-width="86" stroke-linecap="round" fill="none"/><path d="M260,190 C200,120 120,40 40,-20" stroke="{INK}" stroke-width="104" stroke-linecap="round" fill="none"/><path d="M260,190 C200,120 120,40 40,-20" stroke="#7fae35" stroke-width="94" stroke-linecap="round" fill="none"/>'
    arms += f'<path d="M-70,-10 C-80,-90 70,-100 80,-10 C84,40 -64,46 -70,-10Z" fill="#d9a074" {stroke(6)}/><path d="M-40,-70 C-10,-90 50,-80 70,-40 C80,0 40,20 20,4 C40,-10 30,-40 -10,-46Z" fill="#7fae35" {stroke(5)}/>'
    arms += f'<path d="M-30,-60 L-28,-20 M0,-66 L2,-24 M30,-60 L30,-22" stroke="{INK}" stroke-width="4"/><path d="M-150,100 l20,-14 M130,90 l-24,-12" stroke="url(#iron)" stroke-width="22" stroke-linecap="round"/>'
    arms += f'<path d="M-200,120 C-170,90 -140,80 -110,60" stroke="#f3c69b" stroke-width="10" opacity=".5" fill="none" stroke-linecap="round"/><path d="M160,40 l14,-8 M184,74 l10,-10" stroke="#2f4a12" stroke-width="5"/></g>'
    return halo(480, 230, 240) + arms + sparkle(480, 150, 1.3) + sparkle(560, 200, .5) + tankard(150, 330, .55, -6) + tankard(810, 330, .55, 6) + embers(26, 28)
@comp('darts-of-the-deep', 'tavern')
def _():
    dart = lambda x, y, r: g(f'<line x1="0" y1="0" x2="-110" y2="0" stroke="#8a5124" stroke-width="8"/><path d="M0,-5 L22,0 L0,5Z" fill="url(#iron)"/><path d="M-110,0 L-140,-18 L-100,-2Z M-110,0 L-140,18 L-100,2Z" fill="url(#crimson)" {stroke(2)}/>', x, y, 1, r)
    tentacle = f'<path d="M820,540 C760,420 900,340 830,260 C780,210 760,250 780,280" stroke="#3a6a7a" stroke-width="36" fill="none" stroke-linecap="round"/><path d="M820,540 C760,420 900,340 830,260 C780,210 760,250 780,280" stroke="{INK}" stroke-width="3" fill="none"/>'
    return halo(480, 230, 230) + tentacle + dartboard(480, 230, .95) + dart(500, 220, -160) + dart(540, 180, -150) + embers(16, 29)
@comp('giant-s-skittles', 'tavern')
def _():
    out = halo(480, 260, 230)
    for i, (x, y) in enumerate(((560, 200), (520, 230), (600, 230), (480, 260), (560, 260), (640, 260), (520, 290), (600, 290), (560, 320))):
        out += skittle(x, y, .55, (i % 3 - 1) * 8)
    return out + boulder(260, 330, .9) + embers(14, 30)
@comp('goblin-tankard-toss', 'tavern')
def _(): return halo(480, 250, 230) + goblin(230, 290, .7, -10, 'grin') + f'<path d="M290,220 C420,40 600,40 700,240" stroke="#ffe9a6" stroke-width="5" stroke-dasharray="14 12" fill="none" opacity=".8"/>' + tankard(560, 120, .55, 30) + barrel(740, 330, .8) + embers(14, 31)
@comp('barrel-bash', 'tavern')
def _():
    lanes = ''.join(f'<path d="M{380+i*100},540 L{440+i*40},250" stroke="#d58b46" stroke-width="5" opacity=".5"/>' for i in range(3))
    return halo(480, 260, 230) + lanes + barrel(480, 280, 1.05, -14) + skull(700, 340, .4, 10) + f'<path d="M260,300 l40,-20 l-10,40z" fill="url(#iron)"/>' + embers(14, 32)
@comp('sly-fox-s-three-cups', 'tavern')
def _():
    fox = f'<g transform="translate(480 150)"><path d="M-80,-20 L-110,-110 L-30,-60Z M80,-20 L110,-110 L30,-60Z" fill="#d9661f" {stroke(5)}/><path d="M-90,-40 C-90,-90 90,-90 90,-40 C90,20 20,60 0,70 C-20,60 -90,20 -90,-40Z" fill="#e8762a" {stroke(6)}/><path d="M-40,20 C-20,50 20,50 40,20 L0,70Z" fill="#fff4e0"/><path d="M-50,-30 C-40,-40 -24,-40 -18,-28 M50,-30 C40,-40 24,-40 18,-28" stroke="{INK}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="0" cy="56" r="8" fill="{INK}"/></g>'
    return halo(480, 260, 240) + fox + cup(320, 340, .8, -6) + cup(480, 350, .8) + cup(640, 340, .8, 6) + gem(480, 430, .6) + embers(14, 33)
@comp('tavern-trivia', 'tavern')
def _(): return halo(480, 240, 230) + scroll(480, 220, 1.1, -3, text=f'<text x="0" y="-20" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="64" fill="{CRIMSON}">?</text><text x="0" y="40" text-anchor="middle" font-family="EB Garamond" font-style="italic" font-size="22" fill="#4b2410">A · B · C · D</text>') + tankard(200, 330, .55, -8) + quill(760, 230, .7, 20) + embers(14, 34)
@comp('wobblin-goblin-drinking-contest', 'tavern')
def _(): return halo(480, 240, 230) + goblin(480, 210, 1.0, 14, 'grin') + tankard(260, 340, .7, -18) + tankard(700, 340, .7, 22) + f'<g opacity=".7">{note(640, 120, .4)}{note(320, 110, .35, -20)}</g>' + embers(20, 35)
# festival
@comp('kattal-s-hammer', 'festival')
def _():
    tower = f'<rect x="590" y="70" width="40" height="380" fill="url(#wood)" {stroke(5)}/>' + ''.join(f'<rect x="580" y="{100+i*36}" width="60" height="8" fill="url(#gold)" opacity="{.4+i*.06:.2f}"/>' for i in range(9))
    return halo(520, 230, 230) + tower + bell(610, 60, .45) + hammer(380, 230, .85, -35) + sparkle(610, 60, 1.2) + embers(30, 36)
@comp('fizzlenub-s-feast', 'festival')
def _(): return halo(480, 240, 230) + goblin(330, 200, .75, -6, 'grin', 'chef') + pie(560, 330, .9) + mushroom(760, 300, .5) + leaf(700, 380, .35, 30) + embers(20, 37)
@comp('tinker-s-lock-race', 'festival')
def _():
    gear = lambda x, y, s: g(f'<circle r="60" fill="url(#iron)" {stroke(5)}/>' + ''.join(f'<rect x="-10" y="-80" width="20" height="26" fill="url(#iron)" {stroke(3)} transform="rotate({i*45})"/>' for i in range(8)) + f'<circle r="20" fill="#2a2d35" {stroke(4)}/>', x, y, s)
    return halo(480, 240, 230) + gear(250, 170, .9) + gear(720, 320, .7) + lock(480, 250, 1.15) + embers(14, 38)
@comp('potion-sorting-sprint', 'festival')
def _(): return halo(480, 240, 230) + potion(330, 250, .85, -12, 'url(#crimson)') + potion(480, 230, 1, 0, 'url(#teal)') + potion(630, 250, .85, 12, 'url(#slime)') + mushroom(220, 380, .4, 'url(#violet)') + gem(760, 380, .7, '#c77dff') + embers(26, 39, color='#5ff3e0')
# puzzle
@comp('tomb-of-the-restless-grave', 'puzzle')
def _(): return halo(480, 230, 230) + tombstone(480, 250, .95) + f'<g opacity=".45" filter="url(#smoke)"><ellipse cx="480" cy="140" rx="90" ry="140" fill="#dff"/></g>' + skull(250, 400, .35) + embers(24, 40, color='#5ff3e0')
@comp('forgotten-realms-emoji-door-generator', 'puzzle')
def _(): return halo(480, 240, 230) + door(480, 250, .95, ['🌰', '🌱', '🌳', '🍃']) + embers(24, 41, color='#5ff3e0')
@comp('starforge-giant-lore-chain', 'puzzle')
def _(): return mountains('#071518', 470) + halo(480, 220, 240) + anvil(480, 300, 1.0) + hammer(620, 180, .6, 40) + flame(380, 190, .7) + crystal(760, 280, .5) + sparkle(480, 170, 1.4) + embers(40, 42)
@comp('night-serpent-emoji-ritual', 'puzzle')
def _():
    body = f'<path d="M140,390 C260,250 380,430 500,310 C600,210 690,350 770,270" stroke="#123326" stroke-width="54" fill="none" stroke-linecap="round"/><path d="M140,390 C260,250 380,430 500,310 C600,210 690,350 770,270" stroke="{INK}" stroke-width="4" fill="none"/><path d="M140,390 C260,250 380,430 500,310 C600,210 690,350 770,270" stroke="#5ff3e0" stroke-width="3" stroke-dasharray="4 18" fill="none" filter="url(#glow)"/>'
    head = f'<g transform="translate(790 255) rotate(-30)"><path d="M-30,-40 C50,-56 110,-16 110,10 C110,36 50,50 -30,40Z" fill="#1d4a36" {stroke(6)}/><ellipse cx="50" cy="-12" rx="12" ry="9" fill="#5ff3e0" filter="url(#glow)"/><path d="M78,26 L72,58 L86,30Z M94,22 L92,50 L102,26Z" fill="url(#bone)" {stroke(2)}/><path d="M110,10 L150,2 M150,2 L166,-12 M150,2 L166,16" stroke="{CRIMSON}" stroke-width="5"/></g>'
    glyphs = ''.join(f'<circle cx="{x}" cy="{y}" r="22" fill="#071518" stroke="url(#gold)" stroke-width="3"/><text x="{x}" y="{y+8}" text-anchor="middle" font-family="DejaVu Sans" font-size="22" fill="#ffe9a6">{t}</text>' for x,y,t in ((300,170,'☾'),(400,120,'✶'),(560,120,'☀'),(660,170,'✦')))
    return halo(480, 230, 230) + moon(480, 120, .7, .55) + glyphs + body + head + embers(30, 43, color='#5ff3e0')
@comp('scribe-s-riddle-tablet', 'puzzle')
def _():
    tablet = f'<g transform="translate(480 250)"><path d="M-150,-170 C-150,-200 150,-200 150,-170 L150,170 L-150,170Z" fill="#5a5e6a" {stroke(7)}/><text x="0" y="-60" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="80" fill="#5ff3e0" filter="url(#glow)">?</text>' + ''.join(f'<line x1="-110" y1="{10+i*30}" x2="{110-(i%2)*40}" y2="{10+i*30}" stroke="#2a2d35" stroke-width="6" stroke-linecap="round"/>' for i in range(4)) + '<path d="M-60,-130 C-50,-150 -20,-150 -10,-130 M60,-130 C50,-150 20,-150 10,-130" stroke="#5ff3e0" stroke-width="6" fill="none" filter="url(#glow)"/></g>'
    return halo(480, 230, 230) + tablet + quill(760, 280, .6, 25) + embers(20, 44, color='#5ff3e0')
@comp('bone-choir', 'puzzle')
def _():
    out = halo(480, 230, 240)
    for i in range(4):
        out += bell(300 + i * 120, 240 + (i % 2) * 30, .55 + i * .05, (i - 1.5) * 6, 'url(#bone)')
    return out + skull(480, 110, .6, 0, '#5ff3e0') + note(220, 120, .5) + note(760, 130, .45, 15) + embers(20, 45, color='#5ff3e0')
@comp('crystal-gate-tone-lock', 'puzzle')
def _(): return halo(480, 230, 240) + crystal(340, 260, .9, -10) + crystal(480, 220, 1.2) + crystal(620, 260, .9, 10, 'url(#violet)') + crystal(240, 330, .5, -20, 'url(#violet)') + crystal(720, 330, .55, 20) + embers(30, 46, color='#5ff3e0')
@comp('tri-moon-lock', 'puzzle')
def _(): return halo(480, 230, 240) + moon(300, 230, .9, 1) + moon(480, 200, .9, 0.02) + moon(660, 230, .9, .5) + runes_ring(480, 220, 120, '#ffe9a6', .4) + embers(20, 47, color='#cfe0ff')
@comp('grammar-of-grief', 'puzzle')
def _(): return halo(480, 230, 230) + book(480, 280, 1.1) + f'<g opacity=".55" filter="url(#smoke)"><ellipse cx="480" cy="140" rx="80" ry="130" fill="#dff"/></g>' + quill(700, 220, .55, 30) + embers(20, 48, color='#5ff3e0')
@comp('ink-bound-door', 'puzzle')
def _(): return halo(480, 240, 230) + door(480, 250, .95, ['P', 'V', 'B', 'H']) + f'<path d="M260,120 C300,160 280,200 320,240" stroke="#140a06" stroke-width="16" fill="none" stroke-linecap="round"/>' + quill(760, 240, .6, 30) + embers(20, 49, color='#5ff3e0')
@comp('the-three-hungers', 'puzzle')
def _(): return halo(480, 230, 240) + statue(280, 250, .8) + statue(480, 230, .9) + statue(680, 250, .8) + leaf(280, 400, .3, 20) + droplet(480, 410, .3) + gem(680, 410, .5, '#9aa1b0') + embers(20, 50)
@comp('weight-rhythm-echo-bridge', 'puzzle')
def _(): return halo(480, 230, 240) + bridge(480, 260, 1.15) + note(380, 120, .5) + note(560, 110, .45, 20) + f'<text x="480" y="190" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="34" fill="#5ff3e0" opacity=".8" filter="url(#glow)">WALK · walk · walk</text>' + embers(20, 51, color='#5ff3e0')
@comp('the-sluice-sequence', 'puzzle')
def _(): return halo(480, 230, 240) + pipe_grid(480, 240, 1.0) + droplet(250, 170, .4) + droplet(730, 340, .45) + embers(14, 52, color='#56c6ff')
@comp('rotating-gravity-room', 'puzzle')
def _(): return halo(480, 230, 240) + gravity_box(480, 230, .95) + f'<path d="M180,380 C120,250 200,120 320,90" stroke="#ffe9a6" stroke-width="6" fill="none" marker-end=""/><path d="M310,78 L336,88 L314,106Z" fill="#ffe9a6"/>' + embers(20, 53, color='#5ff3e0')
@comp('three-oaths', 'puzzle')
def _(): return halo(480, 230, 240) + shield(480, 230, .9, 0, 'crown') + sword(300, 260, .7, -25) + sword(660, 260, .7, 25) + embers(20, 54)
@comp('keystone-lattice', 'puzzle')
def _(): return halo(480, 230, 240) + lattice(480, 230, 1.0) + embers(20, 55)
@comp('riddle-book-procedural-challenges', 'puzzle')
def _(): return halo(480, 230, 240) + book(480, 280, 1.15) + f'<text x="410" y="230" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="60" fill="{CRIMSON}" opacity=".85">?</text><text x="560" y="230" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="60" fill="{CRIMSON}" opacity=".85">?</text>' + sparkle(480, 130, 1.2) + embers(20, 56, color='#5ff3e0')
@comp('wally-style-original-trap-builder', 'puzzle')
def _(): return halo(480, 230, 240) + f'<g filter="url(#glow)"><circle cx="480" cy="110" r="60" fill="#ffd36b"/>' + ''.join(f'<line x1="480" y1="110" x2="{480+math.cos(i/12*6.283)*120:.0f}" y2="{110+math.sin(i/12*6.283)*120:.0f}" stroke="#ffd36b" stroke-width="5"/>' for i in range(12)) + '</g>' + slide_grid(480, 290, .8) + embers(20, 57)
# performance
@comp('ispin-s-impossible-tale', 'perform')
def _(): return halo(480, 230, 230) + book(480, 300, .95) + f'<g transform="translate(480 160)">{goblin(0,0,.6,0,"grin")}</g>' + quill(700, 200, .55, 30) + sparkle(300, 160, .9) + embers(20, 58)
@comp('goblin-breakdancing-corporation', 'perform')
def _(): return halo(480, 250, 240) + dancer_goblin(480, 230, .85, -12) + f'<g opacity=".8">{note(240, 160, .55, -10)}{note(720, 150, .5, 15)}</g>' + embers(30, 59, color='#ffd36b')
@comp('battle-of-the-bards', 'perform')
def _(): return halo(480, 250, 240) + lute(360, 290, .75, -20) + lute(600, 290, .75, 20) + f'<path d="M420,190 L540,190" stroke="#ffd36b" stroke-width="5" stroke-dasharray="6 8" filter="url(#glow)"/>' + note(480, 130, .6) + note(300, 120, .45, -15) + note(660, 120, .45, 15) + embers(26, 60, color='#ffd36b')
@comp('festival-slam-poetry', 'perform')
def _(): return halo(480, 250, 240) + scroll(480, 260, .9, -4) + quill(650, 220, .75, 24) + f'<text x="320" y="140" font-family="EB Garamond" font-style="italic" font-size="40" fill="#ffd36b" filter="url(#glow)">“Hear me!”</text>' + embers(26, 61, color='#ffd36b')
@comp('trial-by-debate', 'perform')
def _(): return halo(480, 250, 240) + scales(480, 260, .95) + scroll(250, 340, .4, -14) + scroll(720, 330, .4, 12) + embers(20, 62, color='#ffd36b')
@comp('bardic-duet', 'perform')
def _(): return halo(480, 250, 240) + lute(380, 300, .7, -18) + lute(580, 300, .7, 18) + f'<path d="M370,140 C430,90 530,90 590,140" stroke="#ffd36b" stroke-width="6" fill="none" filter="url(#glow)"/><path d="M420,170 C450,150 510,150 540,170" stroke="#ffd36b" stroke-width="4" fill="none" filter="url(#glow)"/>' + note(480, 100, .55) + note(300, 140, .4, -15) + note(660, 140, .4, 15) + f'<text x="480" y="210" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="30" fill="#ffd36b" filter="url(#glow)">♥</text>' + embers(26, 63, color='#ffd36b')
# arena
@comp('fighting-pit-tournament', 'arena')
def _(): return halo(480, 230, 230) + sword(400, 250, .95, -30) + sword(560, 250, .95, 30) + shield(480, 300, .6, 0, 'dragon') + embers(40, 64)
@comp('wizard-duel', 'arena')
def _(): return halo(480, 230, 230) + staff_orb(260, 290, .8, -12, 'url(#crimson)') + staff_orb(700, 290, .8, 12, 'url(#teal)') + f'<path d="M300,200 C400,150 560,250 660,200" stroke="#fff" stroke-width="8" fill="none" filter="url(#glow)"/>' + lightning_crack(470, 120, .6, '#bfe8ff') + wizard_hat(480, 380, .45) + embers(30, 65, color='#bfe8ff')
@comp('monster-wrestler-championship', 'arena')
def _(): return halo(480, 230, 240) + boar(560, 250, .95, True) + fist(300, 260, .75, 30) + f'<rect x="120" y="390" width="720" height="10" fill="url(#crimson)"/><rect x="120" y="420" width="720" height="10" fill="url(#crimson)"/>' + embers(26, 66)
@comp('shield-wall', 'arena')
def _(): return halo(480, 240, 240) + shield(320, 270, .8, -4, 'crown') + shield(480, 260, .9, 0, 'dragon') + shield(640, 270, .8, 4, 'crown') + spear(400, 230, .55, -6) + spear(560, 230, .55, 6) + embers(30, 67)
@comp('arrow-storm', 'arena')
def _():
    out = halo(480, 240, 240)
    for i in range(9):
        out += arrow(140 + i * 85, 70 + (i % 3) * 45, .95, 58)
    return out + shield(480, 330, .7, 0, 'crown') + bow(760, 320, .5, -20) + embers(20, 68)
@comp('gladiator-s-gauntlet', 'arena')
def _(): return halo(480, 230, 240) + f'<g transform="translate(480 230)"><path d="M-90,-60 C-90,-150 90,-150 90,-60 L90,40 C60,80 -60,80 -90,40Z" fill="url(#iron)" {stroke(7)}/><rect x="-70" y="-60" width="140" height="16" fill="#140a06"/><rect x="-8" y="-60" width="16" height="90" fill="#140a06"/><path d="M-6,-150 C-40,-220 40,-220 6,-150Z" fill="url(#crimson)" {stroke(5)}/></g>' + spear(260, 270, .65, -20) + sword(700, 290, .6, 30) + f'<path d="M200,420 L760,420" stroke="#ff3b1f" stroke-width="6" stroke-dasharray="20 14" filter="url(#glow)"/>' + embers(30, 69)
@comp('the-gloop', 'arena')
def _():
    captive = f'<g transform="translate(560 150) rotate(12)"><path d="M-40,40 C-40,0 40,0 40,40 L36,90 L-36,90Z" fill="#6a4a8a" {stroke(5)}/><path d="M-36,30 L-90,-30 M36,30 L90,-30" stroke="#d9a074" stroke-width="20" stroke-linecap="round"/><path d="M-36,30 L-90,-30 M36,30 L90,-30" stroke="{INK}" stroke-width="2" fill="none"/>{goblin(0,-20,.42,0,"shock")}</g>'
    drips = ''.join(f'<path d="M{x},{y} C{x-8},{y+30} {x+8},{y+30} {x},{y}Z" fill="url(#slime)" {stroke(3)}/>' for x,y in ((340,360),(420,372),(600,368),(650,350)))
    return halo(480, 260, 240) + captive + slime_blob(470, 290, 1.05) + drips + chain(250, 120, .55, 30, 6) + embers(30, 70, color='#b8ff6b')
@comp('melee-training-dummy', 'arena')
def _(): return halo(480, 240, 230) + dummy(480, 250, .9) + sword(680, 260, .6, 35) + embers(20, 71)
@comp('arena-beast-rider', 'arena')
def _():
    beast = f'<g transform="translate(470 270)"><path d="M-180,40 C-180,-40 -60,-80 60,-60 C120,-50 170,-90 210,-60 C240,-40 230,0 200,10 C160,20 140,40 120,60 L120,130 L90,130 L80,80 C20,96 -60,96 -110,80 L-120,130 L-150,130 L-150,80 C-170,70 -180,60 -180,40Z" fill="#4a5a3a" {stroke(7)}/><circle cx="200" cy="-46" r="8" fill="url(#eye)"/><path d="M180,-80 L200,-120 L210,-74Z" fill="url(#bone)" {stroke(3)}/></g>'
    wing = f'<path d="M420,200 C380,90 280,60 200,90 C250,110 270,140 270,170 C240,150 200,150 170,170 C230,190 300,220 380,250Z" fill="#2c3a24" {stroke(6)}/>'
    rider = f'<g transform="translate(470 150)"><path d="M-36,40 C-36,0 36,0 36,40 L30,90 L-30,90Z" fill="url(#iron)" {stroke(5)}/>{goblin(0,-24,.42,0,"grin")}<path d="M-34,-60 C-30,-96 30,-96 34,-60Z" fill="url(#iron)" {stroke(4)}/></g>'
    return halo(480, 230, 240) + wing + beast + rider + spear(560, 150, .7, 70) + shield(420, 230, .38, -10) + embers(30, 72)
@comp('shadow-heist', 'magic')
def _(): return halo(480, 240, 220) + hooded(400, 250, .95) + dagger(600, 260, .9, 25) + gem(680, 140, .8, '#b8ff6b') + f'<path d="M0,420 L960,420" stroke="#000" stroke-width="200" opacity=".25"/>' + embers(20, 73, color='#b8ff6b')

def render_svg(gid, title, thumb=False, sprites=None):
    cat, fn = C[gid]
    p = PAL[cat]
    hero = f'<g transform="translate(480 250) scale(1.14) translate(-480 -250)">{fn()}</g>'
    if sprites:
        for k, v in sprites.items():
            hero = hero.replace(k, v)
    vb = '224 0 512 512' if thumb else '0 0 960 540'
    w, h = (512, 512) if thumb else (960, 540)
    seed = sum(map(ord, gid))
    body = scene(cat, seed) + hero + f'<rect width="960" height="540" filter="url(#grain)" opacity=".35"/>' + frame(title, p['label'], thumb)
    if thumb:
        # Square crop: redraw a square frame instead of the landscape one
        body = scene(cat, seed) + hero + f'<rect width="960" height="540" filter="url(#grain)" opacity=".35"/>' + '<rect x="224" y="0" width="512" height="540" fill="url(#vignette)"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="{vb}">{defs(p)}{body}</svg>'

if __name__ == '__main__':
    out = sys.argv[1]; titles = json.load(open(sys.argv[2]))
    sprites = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else None
    os.makedirs(out, exist_ok=True)
    only = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
    for gid in C:
        if only and gid not in only: continue
        open(f'{out}/{gid}.svg', 'w').write(render_svg(gid, titles[gid], False, sprites))
        open(f'{out}/{gid}-thumb.svg', 'w').write(render_svg(gid, titles[gid], True, sprites))
    print(len(C), 'compositions')
