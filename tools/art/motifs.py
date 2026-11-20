"""Hand-built vector motif library for Fantasy Arcade covers.
Ink outlines (#140a06), gold highlights, light from upper-left. Every function returns an SVG fragment.
"""
import math, random

INK = '#140a06'
GOLD = '#e8b14a'
GOLD_D = '#9a6a1c'
BONE = '#efe2c4'
CRIMSON = '#a3172b'

def g(content, x=0, y=0, s=1, r=0, extra=''):
    return f'<g transform="translate({x:.1f} {y:.1f}) rotate({r:.1f}) scale({s:.3f})" {extra}>{content}</g>'

def stroke(w=4):
    return f'stroke="{INK}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"'

# ───────────────────────────── shared defs ─────────────────────────────
def defs(pal):
    a, b, c = pal['bg1'], pal['bg2'], pal['glow']
    return f'''<defs>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".35" stop-color="{GOLD}"/><stop offset="1" stop-color="{GOLD_D}"/></linearGradient>
<linearGradient id="goldH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{GOLD_D}"/><stop offset=".5" stop-color="#ffe9a6"/><stop offset="1" stop-color="{GOLD_D}"/></linearGradient>
<linearGradient id="bone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="{BONE}"/><stop offset="1" stop-color="#b9a47c"/></linearGradient>
<linearGradient id="ivory" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#d9c9a3"/></linearGradient>
<linearGradient id="crimson" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2434f"/><stop offset=".55" stop-color="{CRIMSON}"/><stop offset="1" stop-color="#4a0710"/></linearGradient>
<linearGradient id="iron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9ced6"/><stop offset=".5" stop-color="#7d8592"/><stop offset="1" stop-color="#2d323b"/></linearGradient>
<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8642c"/><stop offset="1" stop-color="#4b2410"/></linearGradient>
<linearGradient id="goblin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8d65a"/><stop offset=".55" stop-color="#6f9a2c"/><stop offset="1" stop-color="#2f4a12"/></linearGradient>
<linearGradient id="kobold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f08a4b"/><stop offset=".6" stop-color="#b44a1f"/><stop offset="1" stop-color="#5a1d0a"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".4" stop-color="#9fd8ff" stop-opacity=".18"/><stop offset="1" stop-color="#0d2a3d" stop-opacity=".5"/></linearGradient>
<linearGradient id="slime" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7ff6b"/><stop offset=".5" stop-color="#6fd12a"/><stop offset="1" stop-color="#1e5a0c"/></linearGradient>
<linearGradient id="violet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7a8ff"/><stop offset=".5" stop-color="#7a3cc4"/><stop offset="1" stop-color="#28104a"/></linearGradient>
<linearGradient id="teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9fff4"/><stop offset=".5" stop-color="#2fb3a3"/><stop offset="1" stop-color="#0c3b3a"/></linearGradient>
<linearGradient id="felt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{pal.get('felt1','#1f6b45')}"/><stop offset="1" stop-color="{pal.get('felt2','#0b2a1b')}"/></linearGradient>
<radialGradient id="bgGlow" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="{c}" stop-opacity=".85"/><stop offset=".45" stop-color="{b}" stop-opacity=".9"/><stop offset="1" stop-color="{a}"/></radialGradient>
<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="{c}" stop-opacity=".9"/><stop offset=".5" stop-color="{c}" stop-opacity=".25"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></radialGradient>
<radialGradient id="ember" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffb347"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
<radialGradient id="vignette" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
<radialGradient id="eye" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#fff7b0"/><stop offset=".45" stop-color="#ffb627"/><stop offset="1" stop-color="#8a2a00"/></radialGradient>
<radialGradient id="orb" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="{c}"/><stop offset="1" stop-color="{b}"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .3  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="smoke" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="60"/><feGaussianBlur stdDeviation="6"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="softglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#000" flood-opacity=".7"/></filter>
<filter id="hatch" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".02 .9" numOctaves="1" seed="11"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.25"/><feComposite in2="SourceGraphic" operator="in"/></filter>
</defs>'''

# ───────────────────────────── atmosphere ─────────────────────────────
def embers(n, seed, color='url(#ember)', area=(0, 0, 960, 540), rmax=5):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        x = rnd.uniform(area[0], area[2]); y = rnd.uniform(area[1], area[3]); r = rnd.uniform(1.2, rmax)
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{color}" opacity="{rnd.uniform(.35,.95):.2f}"/>')
    return ''.join(out)

def stars(n, seed, area=(0, 0, 960, 330)):
    rnd = random.Random(seed); out = []
    for _ in range(n):
        x = rnd.uniform(area[0], area[2]); y = rnd.uniform(area[1], area[3]); r = rnd.uniform(.6, 2.2)
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="#fff8dc" opacity="{rnd.uniform(.3,1):.2f}"/>')
    return ''.join(out)

def sparkle(x, y, s=1, color='#fff4c2'):
    p = 'M0,-22 C3,-4 4,-3 22,0 C4,3 3,4 0,22 C-3,4 -4,3 -22,0 C-4,-3 -3,-4 0,-22Z'
    return g(f'<path d="{p}" fill="{color}" filter="url(#glow)"/>', x, y, s)

def halo(x, y, r):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="url(#halo)"/>'

def smoke(seed, color='#ffffff', opacity=.08, y=380):
    rnd = random.Random(seed)
    blobs = ''.join(f'<ellipse cx="{rnd.uniform(0,960):.0f}" cy="{y+rnd.uniform(-120,80):.0f}" rx="{rnd.uniform(120,260):.0f}" ry="{rnd.uniform(30,70):.0f}" fill="{color}"/>' for _ in range(7))
    return f'<g opacity="{opacity}" filter="url(#smoke)">{blobs}</g>'

# ───────────────────────────── primitives ─────────────────────────────
PIPS = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)], 4: [(-1, -1), (1, -1), (-1, 1), (1, 1)],
        5: [(-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)], 6: [(-1, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)]}

def die(x, y, s=1, r=0, top=6, left=3, right=2, body='url(#ivory)', pip=INK, red_one=True):
    """Isometric d6: top/left/right faces with pips."""
    def face(pts, fill, shade):
        return f'<polygon points="{pts}" fill="{fill}" {stroke(4)}/>' + (f'<polygon points="{pts}" fill="#000" opacity="{shade}"/>' if shade else '')
    top_pts = '0,-60 52,-30 0,0 -52,-30'; left_pts = '-52,-30 0,0 0,60 -52,30'; right_pts = '52,-30 0,0 0,60 52,30'
    out = face(top_pts, body, 0) + face(left_pts, body, .18) + face(right_pts, body, .34)
    def pips(n, ox, oy, ux, uy, vx, vy):
        res = ''
        for a, b in PIPS[n]:
            cx = ox + a * ux * .55 + b * vx * .55; cy = oy + a * uy * .55 + b * vy * .55
            col = CRIMSON if (n == 1 and red_one) else pip
            res += f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="7" ry="5" fill="{col}" transform="rotate(0)"/>'
        return res
    out += pips(top, 0, -30, 26, 15, -26, 15)
    out += pips(left, -26, 15, 0, 30, 26, -15) if False else pips(left, -26, 15, -26, -15, 0, 30)
    out += pips(right, 26, 15, 26, -15, 0, 30)
    out += '<path d="M-44,-34 L0,-56 L40,-36" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>'
    return g(out, x, y, s, r, 'filter="url(#shadow)"')

def polyhedron(x, y, s=1, sides=12, fill='url(#crimson)', label='12', r=0):
    """Stylised d12/d20 silhouette with facets."""
    pts = [(math.cos(2*math.pi*i/10 - math.pi/2)*70, math.sin(2*math.pi*i/10 - math.pi/2)*70) for i in range(10)]
    poly = ' '.join(f'{a:.1f},{b:.1f}' for a, b in pts)
    inner = [(math.cos(2*math.pi*i/5 - math.pi/2)*38, math.sin(2*math.pi*i/5 - math.pi/2)*38) for i in range(5)]
    ip = ' '.join(f'{a:.1f},{b:.1f}' for a, b in inner)
    lines = ''.join(f'<line x1="{inner[i][0]:.1f}" y1="{inner[i][1]:.1f}" x2="{pts[i*2][0]:.1f}" y2="{pts[i*2][1]:.1f}" {stroke(3)}/>' for i in range(5))
    lines += ''.join(f'<line x1="{inner[i][0]:.1f}" y1="{inner[i][1]:.1f}" x2="{pts[(i*2+1)%10][0]:.1f}" y2="{pts[(i*2+1)%10][1]:.1f}" stroke="{INK}" stroke-width="2" opacity=".5"/>' for i in range(5))
    body = f'<polygon points="{poly}" fill="{fill}" {stroke(5)}/><polygon points="{ip}" fill="#fff" opacity=".18" {stroke(3)}/>{lines}'
    body += f'<text x="0" y="12" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="34" fill="url(#gold)" stroke="{INK}" stroke-width="1.5">{label}</text>'
    body += '<path d="M-50,-40 L-10,-66" stroke="#fff" stroke-width="5" opacity=".45" stroke-linecap="round"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def coin(x, y, s=1, face='crown', r=0, edge=True):
    rim = f'<ellipse cx="0" cy="8" rx="78" ry="78" fill="{GOLD_D}" {stroke(5)}/>' if edge else ''
    body = rim + f'<circle r="78" fill="url(#gold)" {stroke(5)}/><circle r="62" fill="none" stroke="{GOLD_D}" stroke-width="4"/>'
    body += ''.join(f'<circle cx="{math.cos(i/24*6.283)*70:.1f}" cy="{math.sin(i/24*6.283)*70:.1f}" r="2.4" fill="{GOLD_D}"/>' for i in range(24))
    if face == 'crown':
        body += crown_path(0, 4, .62, fill=GOLD_D)
    elif face == 'dragon':
        body += f'<path d="M-30,20 C-40,-10 -10,-40 18,-34 C34,-30 40,-14 30,-4 C46,-2 44,22 22,24 C10,40 -20,40 -30,20Z" fill="{GOLD_D}" {stroke(2)}/><circle cx="16" cy="-14" r="5" fill="#fff6c8"/>'
    body += '<path d="M-52,-36 A64,64 0 0 1 -10,-62" stroke="#fffbe0" stroke-width="7" fill="none" opacity=".75" stroke-linecap="round"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def crown_path(x, y, s=1, fill='url(#gold)'):
    d = 'M-60,30 L-70,-30 L-35,0 L0,-50 L35,0 L70,-30 L60,30Z'
    body = f'<path d="{d}" fill="{fill}" {stroke(5)}/><rect x="-62" y="26" width="124" height="20" rx="4" fill="{fill}" {stroke(5)}/>'
    body += f'<circle cx="0" cy="-50" r="8" fill="url(#crimson)" {stroke(3)}/><circle cx="-70" cy="-30" r="6" fill="#4fb3ff" {stroke(3)}/><circle cx="70" cy="-30" r="6" fill="#4fb3ff" {stroke(3)}/>'
    body += f'<circle cx="0" cy="36" r="6" fill="url(#crimson)" {stroke(2)}/><circle cx="-34" cy="36" r="5" fill="#53d48a" {stroke(2)}/><circle cx="34" cy="36" r="5" fill="#53d48a" {stroke(2)}/>'
    return g(body, x, y, s)

def crown(x, y, s=1, r=0):
    return g(crown_path(0, 0, 1), x, y, s, r, 'filter="url(#shadow)"')

def skull(x, y, s=1, r=0, glow=None):
    body = f'<path d="M-62,-10 C-66,-70 66,-70 62,-10 C62,18 48,30 40,34 L40,58 L-40,58 L-40,34 C-48,30 -62,18 -62,-10Z" fill="url(#bone)" {stroke(5)}/>'
    eye = glow or '#120805'
    body += f'<path d="M-40,-8 C-40,-30 -10,-30 -10,-6 C-10,12 -40,14 -40,-8Z" fill="{eye}"/><path d="M40,-8 C40,-30 10,-30 10,-6 C10,12 40,14 40,-8Z" fill="{eye}"/>'
    if glow:
        body += f'<circle cx="-25" cy="-8" r="6" fill="#fff" filter="url(#glow)"/><circle cx="25" cy="-8" r="6" fill="#fff" filter="url(#glow)"/>'
    body += f'<path d="M0,10 L-9,28 L9,28Z" fill="#120805"/>'
    body += ''.join(f'<line x1="{-30+i*15}" y1="40" x2="{-30+i*15}" y2="58" stroke="{INK}" stroke-width="3"/>' for i in range(5))
    body += f'<path d="M-30,-48 C-14,-58 14,-58 26,-52" stroke="#fff" stroke-width="5" opacity=".6" fill="none" stroke-linecap="round"/><path d="M30,-30 l12,-6 l-4,14z" fill="{INK}" opacity=".5"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def goblin(x, y, s=1, r=0, expr='grin', hat=None, flip=False):
    """Grotesque chibi goblin head (Grukk): huge ears, bulging eyes, crooked teeth, warts."""
    sx = -1 if flip else 1
    body = f'<g transform="scale({sx} 1)">'
    # ears
    body += f'<path d="M-58,-20 C-120,-60 -150,-40 -170,-70 C-150,-10 -110,10 -60,20Z" fill="url(#goblin)" {stroke(5)}/><path d="M-70,-6 C-110,-30 -130,-30 -148,-52" stroke="#2f4a12" stroke-width="5" fill="none"/>'
    body += f'<path d="M58,-20 C120,-60 150,-40 170,-70 C150,-10 110,10 60,20Z" fill="url(#goblin)" {stroke(5)}/><path d="M70,-6 C110,-30 130,-30 148,-52" stroke="#2f4a12" stroke-width="5" fill="none"/>'
    # head
    body += f'<path d="M-72,0 C-80,-80 80,-80 72,0 C70,50 40,82 0,84 C-40,82 -70,50 -72,0Z" fill="url(#goblin)" {stroke(6)}/>'
    body += f'<path d="M-60,-30 C-40,-62 20,-66 44,-50" stroke="#e6ff9c" stroke-width="7" fill="none" opacity=".45" stroke-linecap="round"/>'
    # brow ridge + eyes
    body += f'<path d="M-58,-14 C-40,-34 -14,-30 -6,-16" stroke="{INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M58,-18 C40,-38 14,-32 6,-18" stroke="{INK}" stroke-width="7" fill="none" stroke-linecap="round"/>'
    body += f'<ellipse cx="-30" cy="2" rx="22" ry="20" fill="#fff8c0" {stroke(4)}/><ellipse cx="32" cy="0" rx="25" ry="23" fill="#fff8c0" {stroke(4)}/>'
    body += f'<circle cx="-26" cy="4" r="10" fill="url(#eye)" {stroke(2)}/><circle cx="36" cy="2" r="12" fill="url(#eye)" {stroke(2)}/><ellipse cx="-25" cy="4" rx="3" ry="7" fill="{INK}"/><ellipse cx="37" cy="2" rx="3.5" ry="8" fill="{INK}"/>'
    body += '<circle cx="-30" cy="-2" r="3" fill="#fff"/><circle cx="31" cy="-5" r="3.5" fill="#fff"/>'
    # nose
    body += f'<path d="M-4,10 C-20,26 -10,44 6,40 C22,38 18,22 4,10Z" fill="#7fae35" {stroke(4)}/><circle cx="-2" cy="34" r="3" fill="{INK}"/><circle cx="8" cy="33" r="3" fill="{INK}"/>'
    # warts
    body += f'<circle cx="44" cy="34" r="6" fill="#8fb847" {stroke(2)}/><circle cx="-48" cy="-38" r="4" fill="#8fb847" {stroke(2)}/><circle cx="52" cy="40" r="3" fill="#8fb847" {stroke(1.5)}/>'
    # mouth
    if expr == 'grin':
        body += f'<path d="M-46,50 C-20,74 26,74 50,46 C30,60 -24,62 -46,50Z" fill="#3a0d0d" {stroke(4)}/>'
        body += f'<path d="M-30,56 l5,12 l5,-11z M-8,61 l4,14 l5,-13z M18,59 l3,11 l6,-12z M36,52 l2,9 l5,-10z" fill="url(#bone)" {stroke(2)}/>'
        body += f'<path d="M-40,52 l-3,-12 l9,6z M44,48 l4,-13 l-9,7z" fill="url(#bone)" {stroke(2)}/>'
    elif expr == 'shock':
        body += f'<ellipse cx="4" cy="60" rx="16" ry="14" fill="#3a0d0d" {stroke(4)}/><path d="M-6,48 l4,8 l4,-8z" fill="url(#bone)"/>'
    elif expr == 'smug':
        body += f'<path d="M-36,56 C-10,66 20,62 44,48" stroke="{INK}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30,54 l4,10 l5,-11z" fill="url(#bone)" {stroke(2)}/>'
    body += '</g>'
    if hat == 'top':
        body += f'<g transform="translate(0 -62) rotate(-8)"><rect x="-44" y="-70" width="88" height="70" rx="6" fill="#1d1420" {stroke(5)}/><rect x="-64" y="-6" width="128" height="16" rx="6" fill="#1d1420" {stroke(5)}/><rect x="-44" y="-22" width="88" height="12" fill="url(#crimson)" {stroke(3)}/></g>'
    elif hat == 'chef':
        body += f'<g transform="translate(0 -70)"><path d="M-46,10 C-80,-10 -60,-60 -24,-46 C-20,-80 30,-80 30,-46 C70,-60 84,-8 46,10Z" fill="#fffaf0" {stroke(5)}/><rect x="-44" y="4" width="88" height="22" rx="4" fill="#f2ead7" {stroke(5)}/></g>'
    elif hat == 'witch':
        body += f'<g transform="translate(-6 -60) rotate(-12)"><path d="M-80,10 C-30,0 30,0 80,10 C40,22 -40,22 -80,10Z" fill="#2a1336" {stroke(5)}/><path d="M-40,8 C-30,-40 0,-80 40,-110 C30,-70 30,-30 40,8Z" fill="#2a1336" {stroke(5)}/><rect x="-38" y="-6" width="76" height="12" fill="url(#violet)" {stroke(3)}/></g>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def kobold(x, y, s=1, r=0):
    body = f'<path d="M-50,-10 C-60,-60 30,-80 60,-40 L120,-30 C130,-24 128,-8 116,-6 L64,6 C56,40 20,56 -10,50 C-40,44 -54,20 -50,-10Z" fill="url(#kobold)" {stroke(6)}/>'
    body += f'<path d="M-34,-48 L-60,-96 L-14,-62Z M0,-58 L-6,-110 L26,-62Z" fill="#f3d3a2" {stroke(5)}/>'
    body += f'<ellipse cx="20" cy="-22" rx="18" ry="17" fill="#fff6b5" {stroke(4)}/><circle cx="24" cy="-22" r="9" fill="url(#eye)"/><ellipse cx="25" cy="-22" rx="2.5" ry="8" fill="{INK}"/><circle cx="20" cy="-27" r="3" fill="#fff"/>'
    body += f'<path d="M70,-2 l6,10 l5,-11z M90,-6 l4,9 l5,-10z" fill="url(#bone)" {stroke(2)}/><circle cx="110" cy="-22" r="3" fill="{INK}"/>'
    body += f'<path d="M-36,0 C-28,-8 -16,-8 -10,0" stroke="#5a1d0a" stroke-width="4" fill="none"/><path d="M-30,-40 C-10,-60 20,-64 40,-54" stroke="#ffc08a" stroke-width="6" opacity=".5" fill="none" stroke-linecap="round"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def dragon_eye(x, y, s=1):
    body = f'<path d="M-200,0 C-120,-110 120,-110 200,0 C120,110 -120,110 -200,0Z" fill="#2a0a06" {stroke(7)}/>'
    body += f'<ellipse cx="0" cy="0" rx="150" ry="82" fill="url(#eye)" {stroke(5)}/>'
    body += ''.join(f'<line x1="0" y1="0" x2="{math.cos(i/30*6.283)*150:.0f}" y2="{math.sin(i/30*6.283)*82:.0f}" stroke="#7a2400" stroke-width="2" opacity=".55"/>' for i in range(30))
    body += f'<path d="M0,-78 C-26,-30 -26,30 0,78 C26,30 26,-30 0,-78Z" fill="{INK}"/><ellipse cx="-60" cy="-34" rx="22" ry="12" fill="#fff" opacity=".7" transform="rotate(-20 -60 -34)"/>'
    body += f'<path d="M-210,-6 C-120,-150 120,-150 210,-6" stroke="#5a1b0c" stroke-width="16" fill="none"/>'
    body += ''.join(f'<path d="M{-170+i*42},{-92+abs(i-4)*14} l18,-26 l12,30z" fill="#4c160a" {stroke(3)}/>' for i in range(9))
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def card(x, y, s=1, r=0, rank='A', suit='♠', color=INK, back=False, art=None):
    if back:
        body = f'<rect x="-60" y="-85" width="120" height="170" rx="12" fill="url(#crimson)" {stroke(5)}/><rect x="-48" y="-73" width="96" height="146" rx="8" fill="none" stroke="url(#gold)" stroke-width="4"/>'
        body += f'<path d="M0,-50 L30,0 L0,50 L-30,0Z" fill="url(#gold)" {stroke(3)}/><circle r="10" fill="url(#crimson)" {stroke(2)}/>'
    else:
        body = f'<rect x="-60" y="-85" width="120" height="170" rx="12" fill="url(#ivory)" {stroke(5)}/><rect x="-50" y="-75" width="100" height="150" rx="8" fill="none" stroke="{GOLD_D}" stroke-width="2"/>'
        body += f'<text x="-40" y="-46" font-family="Cinzel" font-weight="900" font-size="30" fill="{color}">{rank}</text><text x="-40" y="-20" font-family="DejaVu Sans" font-size="22" fill="{color}">{suit}</text>'
        body += f'<g transform="rotate(180)"><text x="-40" y="-46" font-family="Cinzel" font-weight="900" font-size="30" fill="{color}">{rank}</text></g>'
        body += art if art else f'<text x="6" y="26" text-anchor="middle" font-family="DejaVu Sans" font-size="64" fill="{color}">{suit}</text>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def chip(x, y, s=1, color='url(#crimson)'):
    body = f'<ellipse cx="0" cy="10" rx="50" ry="22" fill="#3b0a10" {stroke(4)}/><ellipse cx="0" cy="0" rx="50" ry="22" fill="{color}" {stroke(4)}/>'
    body += ''.join(f'<rect x="{math.cos(i/6*6.283)*40-5:.0f}" y="{math.sin(i/6*6.283)*17-3:.0f}" width="10" height="6" fill="#fff" opacity=".85"/>' for i in range(6))
    body += f'<ellipse cx="0" cy="0" rx="26" ry="11" fill="none" stroke="url(#gold)" stroke-width="3"/>'
    return g(body, x, y, s)

def chip_stack(x, y, n=5, s=1, color='url(#crimson)'):
    return ''.join(chip(x, y - i * 12 * s, s, color) for i in range(n))

def tankard(x, y, s=1, r=0, foam=True):
    body = f'<path d="M60,-40 C110,-40 110,40 60,40" stroke="{INK}" stroke-width="22" fill="none"/><path d="M60,-40 C104,-40 104,40 60,40" stroke="url(#wood)" stroke-width="12" fill="none"/>'
    body += f'<path d="M-60,-70 L60,-70 L54,80 L-54,80Z" fill="url(#wood)" {stroke(6)}/>'
    body += ''.join(f'<rect x="-62" y="{yy}" width="124" height="12" fill="url(#iron)" {stroke(3)}/>' for yy in (-50, 50))
    body += ''.join(f'<line x1="{xx}" y1="-60" x2="{xx*0.9:.0f}" y2="78" stroke="#2a1206" stroke-width="3" opacity=".6"/>' for xx in (-30, 0, 30))
    if foam:
        body += f'<path d="M-70,-66 C-80,-100 -40,-110 -20,-96 C-10,-120 30,-116 34,-96 C60,-110 86,-86 66,-66 C70,-50 40,-56 30,-64 C10,-56 -20,-56 -36,-64 C-50,-52 -76,-52 -70,-66Z" fill="#fffaf0" {stroke(5)}/>'
        body += f'<path d="M-54,-60 C-58,-30 -40,-30 -42,-60" fill="#fffaf0" {stroke(3)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def barrel(x, y, s=1, r=0):
    body = f'<path d="M-60,-80 C-80,-30 -80,30 -60,80 L60,80 C80,30 80,-30 60,-80Z" fill="url(#wood)" {stroke(6)}/>'
    body += ''.join(f'<path d="M{-74 if abs(yy)<50 else -66},{yy} C-20,{yy+8} 20,{yy+8} {74 if abs(yy)<50 else 66},{yy}" stroke="url(#iron)" stroke-width="11" fill="none"/><path d="M{-74 if abs(yy)<50 else -66},{yy} C-20,{yy+8} 20,{yy+8} {74 if abs(yy)<50 else 66},{yy}" stroke="{INK}" stroke-width="2" fill="none" opacity=".7"/>' for yy in (-58, -18, 22, 62))
    body += ''.join(f'<path d="M{xx},-80 C{xx*1.25:.0f},-20 {xx*1.25:.0f},20 {xx},80" stroke="#2a1206" stroke-width="3" fill="none" opacity=".55"/>' for xx in (-30, 0, 30))
    body += f'<ellipse cx="0" cy="-80" rx="60" ry="14" fill="#8a5124" {stroke(5)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def cup(x, y, s=1, r=0, color='url(#crimson)'):
    body = f'<path d="M-50,-60 L50,-60 L64,60 L-64,60Z" fill="{color}" {stroke(6)}/><ellipse cx="0" cy="60" rx="64" ry="14" fill="{color}" {stroke(5)}/><ellipse cx="0" cy="-60" rx="50" ry="10" fill="#3b0a10" {stroke(4)}/>'
    body += f'<path d="M-36,-46 L-46,48" stroke="#fff" stroke-width="6" opacity=".35" stroke-linecap="round"/><path d="M-56,20 C-20,30 20,30 56,20" stroke="url(#gold)" stroke-width="6" fill="none"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def gem(x, y, s=1, color='#4fd2ff'):
    body = f'<polygon points="0,-40 34,-14 22,30 -22,30 -34,-14" fill="{color}" {stroke(4)}/><polygon points="0,-40 14,-14 0,30 -14,-14" fill="#fff" opacity=".35"/><polyline points="-34,-14 34,-14" stroke="{INK}" stroke-width="2"/>'
    return g(body, x, y, s, 0, 'filter="url(#glow)"')

def potion(x, y, s=1, r=0, liquid='url(#teal)'):
    body = f'<path d="M-16,-90 L16,-90 L16,-50 C60,-36 70,30 40,64 C20,84 -20,84 -40,64 C-70,30 -60,-36 -16,-50Z" fill="url(#glass)" {stroke(5)}/>'
    body += f'<path d="M-58,0 C-30,-10 30,10 58,0 C62,30 50,60 30,72 C10,82 -20,82 -38,68 C-56,54 -62,24 -58,0Z" fill="{liquid}" opacity=".95"/>'
    body += f'<rect x="-22" y="-112" width="44" height="26" rx="6" fill="url(#wood)" {stroke(4)}/><path d="M-40,-20 C-50,10 -40,40 -24,56" stroke="#fff" stroke-width="7" opacity=".55" fill="none" stroke-linecap="round"/>'
    body += '<circle cx="10" cy="30" r="6" fill="#fff" opacity=".6"/><circle cx="26" cy="12" r="4" fill="#fff" opacity=".5"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def cauldron(x, y, s=1, brew='url(#slime)'):
    body = f'<path d="M-110,-30 C-120,60 -60,100 0,100 C60,100 120,60 110,-30Z" fill="#1c1c22" {stroke(7)}/>'
    body += f'<ellipse cx="0" cy="-30" rx="112" ry="26" fill="{brew}" {stroke(6)}/>'
    body += f'<path d="M-80,90 L-96,124 M80,90 L96,124 M0,100 L0,128" stroke="{INK}" stroke-width="14" stroke-linecap="round"/>'
    body += f'<path d="M-90,10 C-80,50 -50,74 -20,80" stroke="#6b6f7c" stroke-width="7" fill="none" opacity=".6" stroke-linecap="round"/>'
    body += ''.join(f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="{brew}" {stroke(3)}/>' for cx, cy, rr in ((-30, -50, 14), (20, -62, 10), (50, -44, 8), (-60, -40, 6), (4, -86, 7)))
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def hammer(x, y, s=1, r=0):
    body = f'<rect x="-10" y="-40" width="20" height="200" rx="8" fill="url(#wood)" {stroke(5)}/>'
    body += f'<path d="M-90,-90 L90,-90 L104,-40 L-104,-40Z" fill="url(#iron)" {stroke(6)}/><rect x="-24" y="-100" width="48" height="70" rx="6" fill="url(#iron)" {stroke(5)}/>'
    body += f'<path d="M-80,-80 L70,-80" stroke="#fff" stroke-width="5" opacity=".5"/><rect x="-14" y="120" width="28" height="44" rx="6" fill="#3b2412" {stroke(4)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def bell(x, y, s=1, r=0, fill='url(#gold)'):
    body = f'<path d="M-70,50 C-60,-10 -60,-70 0,-80 C60,-70 60,-10 70,50 C80,60 80,70 70,70 L-70,70 C-80,70 -80,60 -70,50Z" fill="{fill}" {stroke(6)}/>'
    body += f'<circle cx="0" cy="84" r="16" fill="{fill}" {stroke(5)}/><rect x="-12" y="-104" width="24" height="26" rx="8" fill="{fill}" {stroke(5)}/><path d="M-44,-40 C-50,0 -52,30 -56,48" stroke="#fffbe0" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def lock(x, y, s=1, r=0):
    body = f'<path d="M-50,-20 L-50,-70 C-50,-130 50,-130 50,-70 L50,-20" stroke="url(#iron)" stroke-width="26" fill="none"/><path d="M-50,-20 L-50,-70 C-50,-130 50,-130 50,-70 L50,-20" stroke="{INK}" stroke-width="4" fill="none"/>'
    body += f'<rect x="-90" y="-30" width="180" height="140" rx="18" fill="url(#gold)" {stroke(6)}/>'
    for i, rune in enumerate('☀☾✶◆'):
        body += f'<rect x="{-76+i*38}" y="0" width="32" height="54" rx="6" fill="#2a1206" {stroke(3)}/><text x="{-60+i*38}" y="38" text-anchor="middle" font-family="DejaVu Sans" font-size="24" fill="#ffe9a6">{rune}</text>'
    body += f'<circle cx="0" cy="86" r="10" fill="{INK}"/><path d="M-4,86 L-6,104 L6,104 L4,86Z" fill="{INK}"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def scroll(x, y, s=1, r=0, lines=5, text=None):
    body = f'<path d="M-120,-80 L120,-80 L120,90 L-120,90Z" fill="url(#ivory)" {stroke(5)}/>'
    body += f'<rect x="-136" y="-100" width="272" height="30" rx="15" fill="url(#wood)" {stroke(5)}/><rect x="-136" y="80" width="272" height="30" rx="15" fill="url(#wood)" {stroke(5)}/>'
    if text:
        body += text
    else:
        body += ''.join(f'<line x1="-90" y1="{-46+i*26}" x2="{90 - (i%2)*40}" y2="{-46+i*26}" stroke="#6b4a2a" stroke-width="5" stroke-linecap="round" opacity=".7"/>' for i in range(lines))
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def book(x, y, s=1, r=0):
    body = f'<path d="M0,-70 C-50,-90 -110,-86 -150,-70 L-150,90 C-110,74 -50,70 0,90Z" fill="url(#ivory)" {stroke(5)}/><path d="M0,-70 C50,-90 110,-86 150,-70 L150,90 C110,74 50,70 0,90Z" fill="url(#ivory)" {stroke(5)}/>'
    body += ''.join(f'<path d="M-130,{-50+i*24} C-90,{-60+i*24} -40,{-58+i*24} -16,{-48+i*24}" stroke="#6b4a2a" stroke-width="4" fill="none" opacity=".6"/><path d="M130,{-50+i*24} C90,{-60+i*24} 40,{-58+i*24} 16,{-48+i*24}" stroke="#6b4a2a" stroke-width="4" fill="none" opacity=".6"/>' for i in range(5))
    body += f'<path d="M-160,92 C-110,76 -50,72 0,100 C50,72 110,76 160,92 L160,104 L-160,104Z" fill="url(#crimson)" {stroke(5)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def quill(x, y, s=1, r=0):
    body = f'<path d="M0,-150 C40,-110 50,-40 10,40 L0,70 L-6,40 C-30,-30 -20,-110 0,-150Z" fill="#fffaf0" {stroke(4)}/><path d="M0,-140 L0,70" stroke="{INK}" stroke-width="3"/>'
    body += ''.join(f'<path d="M0,{-120+i*22} L{14+i%2*6},{-128+i*22}" stroke="#bfae8a" stroke-width="2"/>' for i in range(8))
    body += f'<path d="M0,70 L-5,100 L5,100Z" fill="url(#gold)" {stroke(3)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def sword(x, y, s=1, r=0):
    body = f'<path d="M-8,-200 L0,-220 L8,-200 L10,40 L-10,40Z" fill="url(#iron)" {stroke(5)}/><path d="M0,-210 L0,36" stroke="#fff" stroke-width="2" opacity=".6"/>'
    body += f'<path d="M-60,40 C-40,30 40,30 60,40 C40,56 -40,56 -60,40Z" fill="url(#gold)" {stroke(5)}/><rect x="-8" y="48" width="16" height="56" rx="4" fill="#3b2412" {stroke(4)}/><circle cx="0" cy="112" r="12" fill="url(#gold)" {stroke(4)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def shield(x, y, s=1, r=0, emblem='crown'):
    body = f'<path d="M-90,-100 L90,-100 C90,0 60,70 0,110 C-60,70 -90,0 -90,-100Z" fill="url(#crimson)" {stroke(7)}/><path d="M-72,-84 L72,-84 C72,-4 46,52 0,86 C-46,52 -72,-4 -72,-84Z" fill="none" stroke="url(#gold)" stroke-width="6"/>'
    if emblem == 'crown':
        body += crown_path(0, -10, .55)
    elif emblem == 'dragon':
        body += f'<path d="M-40,20 C-50,-30 0,-60 30,-40 C50,-30 50,0 30,10 C50,20 40,50 10,40 C0,60 -30,50 -40,20Z" fill="url(#gold)" {stroke(3)}/>'
    body += '<path d="M-70,-90 L-10,-90" stroke="#fff" stroke-width="5" opacity=".35"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def bow(x, y, s=1, r=0):
    body = f'<path d="M0,-170 C90,-110 90,110 0,170" stroke="url(#wood)" stroke-width="16" fill="none"/><path d="M0,-170 C90,-110 90,110 0,170" stroke="{INK}" stroke-width="3" fill="none"/><line x1="0" y1="-170" x2="0" y2="170" stroke="#efe2c4" stroke-width="3"/>'
    body += f'<line x1="-140" y1="0" x2="80" y2="0" stroke="#8a5124" stroke-width="7"/><path d="M80,-12 L110,0 L80,12Z" fill="url(#iron)" {stroke(3)}/><path d="M-140,0 L-160,-16 L-130,-2Z M-140,0 L-160,16 L-130,2Z" fill="url(#crimson)" {stroke(2)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def arrow(x, y, s=1, r=0):
    body = f'<line x1="-100" y1="0" x2="80" y2="0" stroke="#8a5124" stroke-width="7"/><path d="M80,-12 L112,0 L80,12Z" fill="url(#iron)" {stroke(3)}/><path d="M-100,0 L-120,-14 L-90,-2Z M-100,0 L-120,14 L-90,2Z" fill="#efe2c4" {stroke(2)}/>'
    return g(body, x, y, s, r)

def staff_orb(x, y, s=1, r=0, orb='url(#orb)'):
    body = f'<rect x="-8" y="-40" width="16" height="240" rx="6" fill="url(#wood)" {stroke(5)}/><path d="M-30,-40 C-40,-90 40,-90 30,-40Z" fill="url(#gold)" {stroke(5)}/>'
    body += f'<circle cx="0" cy="-90" r="44" fill="{orb}" {stroke(5)} filter="url(#glow)"/><circle cx="-14" cy="-104" r="10" fill="#fff" opacity=".8"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def lute(x, y, s=1, r=0):
    body = f'<path d="M0,-40 C70,-40 90,40 60,90 C40,124 -40,124 -60,90 C-90,40 -70,-40 0,-40Z" fill="url(#wood)" {stroke(6)}/><circle cx="0" cy="40" r="22" fill="#1c0e05" {stroke(4)}/>'
    body += f'<rect x="-12" y="-200" width="24" height="170" fill="#4b2410" {stroke(5)}/><path d="M-16,-200 L-30,-250 L30,-250 L16,-200Z" fill="#4b2410" {stroke(5)}/>'
    body += ''.join(f'<line x1="{-8+i*5}" y1="-196" x2="{-8+i*5}" y2="96" stroke="#efe2c4" stroke-width="1.5"/>' for i in range(4))
    body += f'<rect x="-30" y="92" width="60" height="10" fill="url(#gold)" {stroke(3)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def note(x, y, s=1, r=0, color='url(#gold)'):
    body = f'<ellipse cx="0" cy="40" rx="20" ry="15" transform="rotate(-20 0 40)" fill="{color}" {stroke(4)}/><rect x="14" y="-50" width="8" height="90" fill="{color}" {stroke(3)}/><path d="M22,-50 C50,-30 50,0 34,10 C44,-10 38,-24 22,-30Z" fill="{color}" {stroke(3)}/>'
    return g(body, x, y, s, r, 'filter="url(#glow)"')

def mask(x, y, s=1, r=0, color='url(#gold)', sad=False):
    body = f'<path d="M-90,-60 C-40,-90 40,-90 90,-60 C100,10 60,90 0,100 C-60,90 -100,10 -90,-60Z" fill="{color}" {stroke(6)}/>'
    body += f'<path d="M-60,-20 C-50,-40 -20,-40 -14,-18 C-30,-10 -50,-8 -60,-20Z" fill="{INK}"/><path d="M60,-20 C50,-40 20,-40 14,-18 C30,-10 50,-8 60,-20Z" fill="{INK}"/>'
    body += (f'<path d="M-40,60 C-20,30 20,30 40,60" stroke="{INK}" stroke-width="8" fill="none" stroke-linecap="round"/>' if sad else f'<path d="M-46,30 C-20,70 20,70 46,30 C20,44 -20,44 -46,30Z" fill="{INK}"/>')
    body += '<path d="M-60,-56 C-20,-74 20,-74 50,-60" stroke="#fff" stroke-width="6" opacity=".45" fill="none" stroke-linecap="round"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def tombstone(x, y, s=1):
    body = f'<path d="M-110,140 L-110,-40 C-110,-150 110,-150 110,-40 L110,140Z" fill="#5a5e6a" {stroke(7)}/><path d="M-90,130 L-90,-36 C-90,-126 90,-126 90,-36 L90,130Z" fill="#6f7482" opacity=".6"/>'
    body += f'<text x="0" y="-40" text-anchor="middle" font-family="Cinzel" font-weight="700" font-size="30" fill="#2a2d35">R · I · P</text>'
    body += ''.join(f'<line x1="-70" y1="{0+i*24}" x2="{70-(i%3)*20}" y2="{0+i*24}" stroke="#2a2d35" stroke-width="5" stroke-linecap="round" opacity=".7"/>' for i in range(5))
    body += f'<path d="M30,-110 L10,-70 L26,-60 L6,-20" stroke="{INK}" stroke-width="4" fill="none"/><path d="M-160,140 L160,140 L170,160 L-170,160Z" fill="#2c1a10" {stroke(5)}/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def door(x, y, s=1, glyphs=None):
    body = f'<path d="M-130,170 L-130,-60 C-130,-200 130,-200 130,-60 L130,170Z" fill="#3a2a22" {stroke(8)}/><path d="M-100,170 L-100,-50 C-100,-160 100,-160 100,-50 L100,170Z" fill="url(#wood)" {stroke(6)}/>'
    body += ''.join(f'<line x1="{xx}" y1="-150" x2="{xx}" y2="170" stroke="#2a1206" stroke-width="4" opacity=".6"/>' for xx in (-50, 0, 50))
    body += ''.join(f'<rect x="-104" y="{yy}" width="208" height="16" fill="url(#iron)" {stroke(3)}/>' for yy in (-60, 60))
    if glyphs:
        for i, gl in enumerate(glyphs):
            body += f'<circle cx="{-60+i*40}" cy="0" r="18" fill="#140a06" stroke="url(#gold)" stroke-width="3"/><text x="{-60+i*40}" y="9" text-anchor="middle" font-family="DejaVu Sans" font-size="22" fill="#ffe9a6" filter="url(#glow)">{gl}</text>'
    body += f'<circle cx="70" cy="110" r="10" fill="url(#gold)" {stroke(3)}/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def moon(x, y, s=1, phase=1.0):
    """phase 0=new,1=full; drawn as lit disc with shadow ellipse."""
    body = f'<circle r="60" fill="#e9ecf7" {stroke(5)}/>'
    body += '<circle cx="-18" cy="-12" r="10" fill="#c7cbe0"/><circle cx="20" cy="18" r="14" fill="#c7cbe0"/><circle cx="14" cy="-26" r="6" fill="#c7cbe0"/>'
    if phase < 1:
        off = 120 * phase
        body += f'<path d="M0,-60 A60,60 0 0 0 0,60 A{abs(60-off):.0f},60 0 0 {1 if off<60 else 0} 0,-60Z" fill="#141526" opacity=".88"/>'
    return g(body, x, y, s, 0, 'filter="url(#glow)"')

def crystal(x, y, s=1, r=0, fill='url(#teal)'):
    body = f'<polygon points="0,-120 40,-40 26,90 -26,90 -40,-40" fill="{fill}" {stroke(5)}/><polygon points="0,-120 14,-40 0,90 -14,-40" fill="#fff" opacity=".35"/>'
    return g(body, x, y, s, r, 'filter="url(#glow)"')

def anvil(x, y, s=1):
    body = f'<path d="M-160,-40 L120,-40 C170,-40 190,-20 200,0 L60,0 L50,40 L80,90 L-80,90 L-50,40 L-60,0 L-160,0Z" fill="url(#iron)" {stroke(7)}/><path d="M-150,-30 L110,-30" stroke="#fff" stroke-width="5" opacity=".5"/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def slime_blob(x, y, s=1):
    body = f'<path d="M-160,80 C-170,-20 -110,-120 0,-120 C110,-120 170,-20 160,80 C120,100 90,70 60,92 C30,110 -30,110 -60,92 C-90,70 -130,100 -160,80Z" fill="url(#slime)" {stroke(7)} opacity=".95"/>'
    body += f'<ellipse cx="-50" cy="-30" rx="26" ry="30" fill="#fff8c0" {stroke(4)}/><ellipse cx="44" cy="-40" rx="20" ry="24" fill="#fff8c0" {stroke(4)}/><circle cx="-44" cy="-26" r="12" fill="{INK}"/><circle cx="48" cy="-36" r="9" fill="{INK}"/>'
    body += f'<path d="M-50,30 C-20,60 30,60 60,24" stroke="{INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-100,-60 C-80,-90 -40,-104 -10,-104" stroke="#fff" stroke-width="10" opacity=".45" fill="none" stroke-linecap="round"/>'
    body += ''.join(f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="#d7ff6b" opacity=".6"/>' for cx, cy, rr in ((80, 20, 10), (-100, 40, 7), (20, -80, 6)))
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def dummy(x, y, s=1):
    body = f'<rect x="-8" y="40" width="16" height="140" fill="url(#wood)" {stroke(4)}/><rect x="-120" y="20" width="240" height="20" rx="8" fill="url(#wood)" {stroke(4)}/>'
    body += f'<path d="M-60,-30 C-70,-90 70,-90 60,-30 L64,100 C40,130 -40,130 -64,100Z" fill="#c9a66b" {stroke(6)}/>'
    body += ''.join(f'<path d="M-62,{yy} C-20,{yy+10} 20,{yy+10} 62,{yy}" stroke="#6b4a2a" stroke-width="5" fill="none"/>' for yy in (0, 40, 80))
    body += f'<circle cx="0" cy="-110" r="44" fill="#c9a66b" {stroke(6)}/><path d="M-22,-120 l12,12 m0,-12 l-12,12 M10,-120 l12,12 m0,-12 l-12,12" stroke="{INK}" stroke-width="5"/>'
    body += f'<circle cx="0" cy="40" r="26" fill="none" stroke="url(#crimson)" stroke-width="8"/><circle cx="0" cy="40" r="10" fill="url(#crimson)"/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def boar(x, y, s=1, flip=False):
    sx = -1 if flip else 1
    body = f'<g transform="scale({sx} 1)"><path d="M-90,-20 C-100,-90 40,-110 90,-50 L140,-20 C150,0 140,30 120,30 L80,40 C60,90 -40,100 -80,60 C-100,40 -96,10 -90,-20Z" fill="#5a3a2a" {stroke(7)}/>'
    body += f'<path d="M-60,-70 L-90,-130 L-30,-86Z M-10,-90 L-6,-150 L30,-92Z" fill="#3a2418" {stroke(5)}/>'
    body += f'<ellipse cx="130" cy="4" rx="22" ry="26" fill="#d98a8a" {stroke(5)}/><circle cx="124" cy="0" r="5" fill="{INK}"/><circle cx="138" cy="2" r="5" fill="{INK}"/>'
    body += f'<path d="M96,26 C110,60 90,80 70,84 C88,64 86,48 82,34Z" fill="url(#bone)" {stroke(4)}/><circle cx="40" cy="-40" r="14" fill="#ff3b1f" filter="url(#glow)"/><circle cx="42" cy="-42" r="5" fill="#fff"/>'
    body += f'<path d="M-80,-40 C-60,-70 -20,-80 20,-76" stroke="#8a6040" stroke-width="7" opacity=".6" fill="none" stroke-linecap="round"/></g>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def fist(x, y, s=1, r=0, skin='#d9a074'):
    body = f'<path d="M-60,40 L-60,-30 C-60,-60 -30,-70 -20,-60 C-10,-80 20,-80 26,-60 C40,-74 66,-64 64,-40 C80,-44 96,-26 90,0 L84,40 C70,80 -40,90 -60,40Z" fill="{skin}" {stroke(6)}/>'
    body += f'<path d="M-20,-60 L-22,-20 M26,-60 L24,-18 M64,-40 L60,-4" stroke="{INK}" stroke-width="4" fill="none"/><path d="M-60,-6 C-30,-10 -10,0 0,20" stroke="{INK}" stroke-width="5" fill="none"/>'
    body += f'<rect x="-70" y="40" width="150" height="160" rx="30" fill="{skin}" {stroke(6)}/><rect x="-74" y="60" width="158" height="24" rx="8" fill="url(#iron)" {stroke(4)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def dartboard(x, y, s=1):
    rings = [(150, '#1b1b1b'), (140, '#e8d9b0'), (128, '#1b1b1b'), (90, '#e8d9b0'), (80, '#1b1b1b'), (26, '#2f8f4e'), (12, CRIMSON)]
    body = f'<circle r="168" fill="#2a1206" {stroke(7)}/>'
    for i in range(20):
        a0 = i / 20 * 6.283 - 3.1416 / 2 - 6.283 / 40; a1 = a0 + 6.283 / 20
        col = '#1b1b1b' if i % 2 else '#e8d9b0'; col2 = CRIMSON if i % 2 else '#2f8f4e'
        for (ro, ri, c) in ((150, 140, col2), (140, 92, col), (92, 80, col2), (80, 26, col)):
            p = f'M{math.cos(a0)*ri:.1f},{math.sin(a0)*ri:.1f} L{math.cos(a0)*ro:.1f},{math.sin(a0)*ro:.1f} A{ro},{ro} 0 0 1 {math.cos(a1)*ro:.1f},{math.sin(a1)*ro:.1f} L{math.cos(a1)*ri:.1f},{math.sin(a1)*ri:.1f} A{ri},{ri} 0 0 0 {math.cos(a0)*ri:.1f},{math.sin(a0)*ri:.1f}Z'
            body += f'<path d="{p}" fill="{c}" stroke="#c9b27a" stroke-width="1"/>'
    body += f'<circle r="26" fill="#2f8f4e" stroke="#c9b27a" stroke-width="2"/><circle r="12" fill="{CRIMSON}" stroke="#c9b27a" stroke-width="2"/>'
    nums = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
    body += ''.join(f'<text x="{math.cos(i/20*6.283-1.5708)*158:.0f}" y="{math.sin(i/20*6.283-1.5708)*158+5:.0f}" text-anchor="middle" font-family="Cinzel" font-weight="700" font-size="13" fill="#efe2c4">{n}</text>' for i, n in enumerate(nums))
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def skittle(x, y, s=1, r=0):
    body = f'<path d="M-14,-90 C-30,-90 -30,-50 -18,-40 C-40,0 -44,60 -24,90 L24,90 C44,60 40,0 18,-40 C30,-50 30,-90 14,-90Z" fill="url(#ivory)" {stroke(5)}/><rect x="-22" y="-36" width="44" height="10" fill="url(#crimson)"/><rect x="-26" y="-20" width="52" height="8" fill="url(#crimson)"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def boulder(x, y, s=1):
    body = f'<path d="M-90,10 C-100,-60 -20,-100 40,-84 C100,-70 110,0 90,40 C70,90 -40,100 -80,64 C-96,50 -92,30 -90,10Z" fill="#6c6e78" {stroke(7)}/><path d="M-50,-50 C-30,-70 10,-76 40,-66" stroke="#b9bcc8" stroke-width="8" opacity=".6" fill="none" stroke-linecap="round"/>'
    body += f'<path d="M-30,0 L0,-20 L30,10 L0,30Z" fill="none" stroke="#7df9ff" stroke-width="5" filter="url(#glow)"/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def chain(x, y, s=1, r=0, n=6):
    body = ''.join(f'<ellipse cx="{i*44}" cy="0" rx="30" ry="{18 if i%2 else 22}" fill="none" stroke="url(#iron)" stroke-width="{12 if i%2==0 else 9}"/><ellipse cx="{i*44}" cy="0" rx="30" ry="{18 if i%2 else 22}" fill="none" stroke="{INK}" stroke-width="2"/>' for i in range(n))
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def domino(x, y, s=1, r=0, a=6, b=3):
    body = f'<rect x="-46" y="-92" width="92" height="184" rx="12" fill="url(#ivory)" {stroke(5)}/><line x1="-36" y1="0" x2="36" y2="0" stroke="{INK}" stroke-width="4"/><circle r="6" fill="url(#gold)"/>'
    for v, oy in ((a, -46), (b, 46)):
        for u, w in PIPS.get(v, []):
            body += f'<circle cx="{u*22}" cy="{oy+w*22}" r="8" fill="{INK}"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def bone_tile(x, y, s=1, r=0, glyph='💀', face=True):
    body = f'<rect x="-50" y="-60" width="100" height="120" rx="14" fill="{"url(#bone)" if face else "#3a2a22"}" {stroke(5)}/>'
    body += (f'<text x="0" y="18" text-anchor="middle" font-family="Noto Color Emoji" font-size="52">{glyph}</text>' if face else f'<path d="M-24,-24 L24,24 M24,-24 L-24,24" stroke="url(#gold)" stroke-width="6"/>')
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def checker(x, y, s=1, color='url(#crimson)', king=False):
    body = f'<ellipse cx="0" cy="12" rx="56" ry="24" fill="#1a0a05" {stroke(4)}/><ellipse cx="0" cy="0" rx="56" ry="24" fill="{color}" {stroke(4)}/><ellipse cx="0" cy="0" rx="36" ry="14" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>'
    if king:
        body += crown_path(0, -26, .32)
    return g(body, x, y, s)

def board_grid(x, y, n=8, size=40, c1='#e8d9b0', c2='#3a1f12', skew=0.5):
    cells = ''
    for r in range(n):
        for c in range(n):
            px = (c - r) * size; py = (c + r) * size * skew
            pts = f'{px},{py} {px+size},{py+size*skew} {px},{py+2*size*skew} {px-size},{py+size*skew}'
            cells += f'<polygon points="{pts}" fill="{c1 if (r+c)%2==0 else c2}" stroke="{INK}" stroke-width="1"/>'
    return g(cells, x, y)

def pipe_grid(x, y, s=1):
    body = f'<rect x="-150" y="-150" width="300" height="300" rx="14" fill="#1a2a30" {stroke(6)}/>'
    for i in range(9):
        cx = -100 + (i % 3) * 100; cy = -100 + (i // 3) * 100
        body += f'<rect x="{cx-46}" y="{cy-46}" width="92" height="92" rx="10" fill="#24404a" stroke="#0c1a1f" stroke-width="3"/>'
        if i in (0, 3, 6, 7, 8, 4):
            d = {0: 'M-46,0 L0,0 L0,46', 3: 'M0,-46 L0,46', 6: 'M0,-46 L0,0 L46,0', 7: 'M-46,0 L46,0', 8: 'M-46,0 L46,0', 4: 'M-46,0 L46,0'}[i]
            body += f'<path d="{d}" transform="translate({cx} {cy})" stroke="url(#iron)" stroke-width="30" fill="none" stroke-linecap="square"/><path d="{d}" transform="translate({cx} {cy})" stroke="#56d6ff" stroke-width="12" fill="none" filter="url(#glow)"/>'
        else:
            body += f'<path d="M0,-46 L0,0 L46,0" transform="translate({cx} {cy})" stroke="url(#iron)" stroke-width="30" fill="none"/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def lattice(x, y, s=1, lit=(1, 0, 1, 1, 1, 0, 1, 0, 1)):
    body = f'<rect x="-150" y="-150" width="300" height="300" rx="20" fill="#20202c" {stroke(6)}/>'
    for i, on in enumerate(lit):
        cx = -95 + (i % 3) * 95; cy = -95 + (i // 3) * 95
        body += f'<rect x="{cx-38}" y="{cy-38}" width="76" height="76" rx="12" fill="{"url(#gold)" if on else "#33334a"}" {stroke(4)} {"filter=\"url(#glow)\"" if on else ""}/>'
        body += f'<text x="{cx}" y="{cy+11}" text-anchor="middle" font-family="DejaVu Sans" font-size="30" fill="{INK if on else "#55556e"}">ᚱ</text>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def slide_grid(x, y, s=1, order=(1, 2, 3, 4, 0, 6, 7, 5, 8)):
    body = f'<rect x="-150" y="-150" width="300" height="300" rx="16" fill="#2a1a12" {stroke(6)}/>'
    for i, v in enumerate(order):
        if not v:
            continue
        cx = -95 + (i % 3) * 95; cy = -95 + (i // 3) * 95
        body += f'<rect x="{cx-42}" y="{cy-42}" width="84" height="84" rx="10" fill="url(#gold)" {stroke(4)}/><text x="{cx}" y="{cy+14}" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="40" fill="{INK}">{v}</text>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def gravity_box(x, y, s=1):
    body = f'<rect x="-150" y="-150" width="300" height="300" rx="10" fill="#151a2a" {stroke(6)}/>'
    body += ''.join(f'<rect x="{-150+c*60}" y="{-150+r*60}" width="60" height="60" fill="#3a3f55" {stroke(2)}/>' for r, c in ((1, 1), (2, 3), (3, 0), (0, 3), (4, 2)))
    body += f'<circle cx="-120" cy="120" r="22" fill="url(#teal)" {stroke(4)} filter="url(#glow)"/><rect x="96" y="-144" width="48" height="48" rx="8" fill="none" stroke="url(#gold)" stroke-width="5"/>'
    body += f'<path d="M-120,90 L-120,-100 L60,-100" stroke="#7df9ff" stroke-width="4" stroke-dasharray="12 10" fill="none"/>'
    return g(body, x, y, s, 15, 'filter="url(#shadow)"')

def statue(x, y, s=1, mouth='open', head='ram'):
    body = f'<rect x="-70" y="80" width="140" height="40" fill="#4a4d58" {stroke(5)}/><path d="M-60,80 L-50,-40 C-50,-110 50,-110 50,-40 L60,80Z" fill="#6c6f7c" {stroke(6)}/>'
    body += f'<ellipse cx="-20" cy="-50" rx="10" ry="8" fill="#ff7a1a" filter="url(#glow)"/><ellipse cx="20" cy="-50" rx="10" ry="8" fill="#ff7a1a" filter="url(#glow)"/>'
    body += f'<path d="M-24,-10 C-10,10 10,10 24,-10 L18,20 L-18,20Z" fill="#1a0a05" {stroke(4)}/>'
    if head == 'ram':
        body += f'<path d="M-46,-80 C-110,-110 -110,-20 -60,-30" stroke="#8a8d9a" stroke-width="18" fill="none"/><path d="M46,-80 C110,-110 110,-20 60,-30" stroke="#8a8d9a" stroke-width="18" fill="none"/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def bridge(x, y, s=1):
    body = f'<path d="M-300,40 C-150,-60 150,-60 300,40 L300,80 C150,0 -150,0 -300,80Z" fill="#5d5f6a" {stroke(7)}/>'
    body += ''.join(f'<rect x="{-260+i*48}" y="{-28+abs(i-5)*abs(i-5)*1.8:.0f}" width="44" height="26" rx="3" fill="#7a7d8a" {stroke(3)}/>' for i in range(11))
    body += f'<path d="M-300,120 C-200,100 -100,140 0,120 C100,100 200,140 300,120" stroke="#56c6ff" stroke-width="10" fill="none" opacity=".7"/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def pie(x, y, s=1):
    body = f'<ellipse cx="0" cy="20" rx="140" ry="40" fill="#eee4cf" {stroke(6)}/><path d="M-130,0 C-120,-60 120,-60 130,0 C110,30 -110,30 -130,0Z" fill="#d68b3c" {stroke(6)}/>'
    body += ''.join(f'<path d="M{-100+i*40},-6 C{-90+i*40},-30 {-70+i*40},-30 {-60+i*40},-6" stroke="#8a4a14" stroke-width="5" fill="none"/>' for i in range(5))
    body += f'<path d="M-20,-40 C-30,-90 10,-100 20,-130 C30,-90 50,-80 30,-40" fill="none" stroke="#fff" stroke-width="5" opacity=".5" filter="url(#glow)"/>'
    body += ''.join(f'<circle cx="{cx}" cy="{cy}" r="10" fill="#7a2ac4" {stroke(3)}/>' for cx, cy in ((-60, -22), (40, -26), (0, -12)))
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def mushroom(x, y, s=1, cap='url(#crimson)'):
    body = f'<path d="M-24,0 L-30,90 L30,90 L24,0Z" fill="url(#ivory)" {stroke(5)}/><path d="M-90,10 C-90,-80 90,-80 90,10Z" fill="{cap}" {stroke(6)}/>'
    body += ''.join(f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="#fffaf0" {stroke(2)}/>' for cx, cy, rr in ((-40, -20, 12), (10, -46, 10), (50, -14, 9)))
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def leaf(x, y, s=1, r=0, fill='#4f9a3a'):
    body = f'<path d="M0,-80 C60,-40 60,40 0,80 C-60,40 -60,-40 0,-80Z" fill="{fill}" {stroke(4)}/><path d="M0,-70 L0,74" stroke="{INK}" stroke-width="3"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def flame(x, y, s=1, r=0):
    body = f'<path d="M0,-120 C40,-60 80,-40 60,20 C50,70 -50,70 -60,20 C-76,-30 -30,-50 -20,-90 C-10,-60 0,-60 0,-120Z" fill="#ff7a1a" {stroke(5)}/><path d="M0,-40 C20,-10 30,10 20,30 C10,50 -20,50 -26,30 C-32,10 -10,-10 0,-40Z" fill="#ffe36b"/>'
    return g(body, x, y, s, r, 'filter="url(#glow)"')

def droplet(x, y, s=1, r=0):
    body = f'<path d="M0,-90 C40,-30 60,0 60,30 C60,70 -60,70 -60,30 C-60,0 -40,-30 0,-90Z" fill="#3aa0ff" {stroke(5)}/><path d="M-30,10 C-34,30 -24,44 -10,50" stroke="#fff" stroke-width="7" fill="none" opacity=".6" stroke-linecap="round"/>'
    return g(body, x, y, s, r, 'filter="url(#glow)"')

def bolt(x, y, s=1, r=0):
    body = f'<path d="M20,-100 L-50,10 L0,10 L-20,100 L60,-20 L10,-20Z" fill="#ffe24a" {stroke(5)}/>'
    return g(body, x, y, s, r, 'filter="url(#glow)"')

def spear(x, y, s=1, r=0):
    body = f'<rect x="-6" y="-200" width="12" height="380" fill="url(#wood)" {stroke(4)}/><path d="M0,-260 L22,-200 L0,-180 L-22,-200Z" fill="url(#iron)" {stroke(4)}/><path d="M-6,-170 L-40,-130 L-6,-150Z" fill="url(#crimson)" {stroke(3)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def dagger(x, y, s=1, r=0):
    body = f'<path d="M-6,-120 L0,-140 L6,-120 L8,10 L-8,10Z" fill="url(#iron)" {stroke(4)}/><rect x="-36" y="10" width="72" height="12" rx="5" fill="#2a1336" {stroke(4)}/><rect x="-6" y="22" width="12" height="40" fill="#1a0f14" {stroke(3)}/><circle cx="0" cy="68" r="8" fill="url(#violet)" {stroke(3)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def hooded(x, y, s=1, r=0):
    body = f'<path d="M-90,120 C-100,0 -70,-110 0,-120 C70,-110 100,0 90,120Z" fill="#1d1426" {stroke(7)}/><path d="M-50,10 C-50,-60 50,-60 50,10 C40,50 -40,50 -50,10Z" fill="#05030a"/>'
    body += f'<ellipse cx="-20" cy="-4" rx="9" ry="5" fill="#b8ff6b" filter="url(#glow)"/><ellipse cx="20" cy="-4" rx="9" ry="5" fill="#b8ff6b" filter="url(#glow)"/>'
    body += f'<path d="M-70,-40 C-50,-90 0,-110 40,-100" stroke="#4a3a5a" stroke-width="8" opacity=".6" fill="none" stroke-linecap="round"/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def wizard_hat(x, y, s=1, r=0):
    body = f'<path d="M-130,30 C-60,10 60,10 130,30 C60,56 -60,56 -130,30Z" fill="#2a1a5a" {stroke(6)}/><path d="M-70,24 C-50,-60 0,-150 60,-190 C40,-120 50,-40 70,24Z" fill="#2a1a5a" {stroke(6)}/>'
    body += ''.join(f'<path d="M{cx},{cy} l4,10 l10,0 l-8,6 l3,10 l-9,-6 l-9,6 l3,-10 l-8,-6 l10,0Z" fill="url(#gold)"/>' for cx, cy in ((-20, -20), (20, -90), (0, 0), (30, -40)))
    body += f'<rect x="-66" y="6" width="132" height="16" fill="url(#crimson)" {stroke(3)}/>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def scales(x, y, s=1):
    body = f'<rect x="-8" y="-120" width="16" height="230" fill="url(#gold)" {stroke(4)}/><rect x="-80" y="100" width="160" height="20" rx="6" fill="url(#gold)" {stroke(4)}/><rect x="-170" y="-130" width="340" height="14" rx="6" fill="url(#gold)" {stroke(4)}/>'
    for sx, dy in ((-150, 20), (150, -10)):
        body += f'<path d="M{sx},-116 L{sx-50},{dy} M{sx},-116 L{sx+50},{dy}" stroke="{GOLD_D}" stroke-width="3"/><path d="M{sx-70},{dy} C{sx-50},{dy+50} {sx+50},{dy+50} {sx+70},{dy}Z" fill="url(#gold)" {stroke(4)}/>'
    body += f'<circle cx="0" cy="-136" r="16" fill="url(#gold)" {stroke(4)}/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def slot_machine(x, y, s=1, symbols=('🐉', '🔥', '🐉')):
    body = f'<rect x="-180" y="-140" width="360" height="280" rx="30" fill="url(#crimson)" {stroke(7)}/><rect x="-156" y="-80" width="312" height="140" rx="12" fill="#140a06" {stroke(5)}/>'
    for i, sym in enumerate(symbols):
        cx = -100 + i * 100
        body += f'<rect x="{cx-44}" y="-72" width="88" height="124" rx="8" fill="url(#ivory)" {stroke(3)}/><text x="{cx}" y="10" text-anchor="middle" font-family="Noto Color Emoji" font-size="56">{sym}</text>'
    body += f'<rect x="-160" y="-130" width="320" height="40" rx="10" fill="url(#gold)" {stroke(4)}/><text x="0" y="-100" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="26" fill="#3b0a10">✦ JACKPOT ✦</text>'
    body += f'<rect x="196" y="-110" width="16" height="140" rx="8" fill="url(#iron)" {stroke(4)}/><circle cx="204" cy="-120" r="22" fill="url(#crimson)" {stroke(4)}/>'
    body += ''.join(f'<circle cx="{-150+i*30}" cy="100" r="7" fill="url(#gold)" filter="url(#glow)"/>' for i in range(11))
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def scorecard(x, y, s=1, r=0):
    body = f'<rect x="-110" y="-150" width="220" height="300" rx="10" fill="url(#ivory)" {stroke(5)}/><text x="0" y="-116" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="22" fill="{CRIMSON}">CROWN &amp; BONES</text>'
    for i in range(9):
        yy = -96 + i * 26
        body += f'<line x1="-96" y1="{yy+16}" x2="96" y2="{yy+16}" stroke="#b9a47c" stroke-width="2"/><rect x="-90" y="{yy}" width="{60+(i*37)%60}" height="8" rx="3" fill="#6b4a2a" opacity=".55"/><text x="88" y="{yy+12}" text-anchor="end" font-family="Cinzel" font-size="14" fill="{INK}">{[3,8,12,0,25,30,40,50,21][i]}</text>'
    return g(body, x, y, s, r, 'filter="url(#shadow)"')

def pyramid_cards(x, y, s=1):
    out = ''
    for row in range(5):
        for col in range(row + 1):
            px = (col - row / 2) * 64; py = row * 52
            out += card(px, py, .44, 0, ['K', 'Q', 'J', '10', '9', '8', '7'][(row + col) % 7], '☾', '#2b3a8a' if (row+col) % 2 else CRIMSON)
    return g(out, x, y, s)

def lane_cards(x, y, s=1):
    out = ''
    for i, lane in enumerate(('GATE', 'KEEP', 'SPIRE')):
        lx = -220 + i * 220
        out += f'<rect x="{lx-90}" y="-150" width="180" height="300" rx="14" fill="#140a06" opacity=".55" stroke="url(#gold)" stroke-width="3"/><text x="{lx}" y="-118" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="24" fill="url(#gold)">{lane}</text>'
        out += card(lx - 20, -20 + i * 6, .55, -8, str(3 + i * 2), '🔥', CRIMSON) + card(lx + 24, 40 - i * 4, .55, 8, str(9 - i), '💧', '#1f5aa8')
    return g(out, x, y, s)

def elemental_grid(x, y, s=1):
    els = [('🔥', '#ff6a2a'), ('💧', '#3aa0ff'), ('🌿', '#4fbf4a'), ('⚡', '#ffe24a')]
    body = ''
    for r in range(4):
        for c in range(4):
            sym, col = els[(r * 3 + c * 2 + r * c) % 4]
            px = (c - r) * 58; py = (c + r) * 30
            body += f'<polygon points="{px},{py} {px+58},{py+30} {px},{py+60} {px-58},{py+30}" fill="{col}" opacity=".85" {stroke(3)}/><text x="{px}" y="{py+42}" text-anchor="middle" font-family="Noto Color Emoji" font-size="28">{sym}</text>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def antlers(x, y, s=1):
    body = f'<path d="M-30,60 C-60,0 -120,-20 -150,-90 M-90,-20 C-120,-30 -140,-10 -170,-30 M-120,-60 C-110,-100 -130,-120 -120,-150 M30,60 C60,0 120,-20 150,-90 M90,-20 C120,-30 140,-10 170,-30 M120,-60 C110,-100 130,-120 120,-150" stroke="#e9d6ac" stroke-width="16" fill="none" stroke-linecap="round"/>'
    body += f'<path d="M-40,40 C-40,120 40,120 40,40 C30,0 -30,0 -40,40Z" fill="#7a5134" {stroke(6)}/><circle cx="-16" cy="60" r="6" fill="{INK}"/><circle cx="16" cy="60" r="6" fill="{INK}"/>'
    return g(body, x, y, s, 0, 'filter="url(#shadow)"')

def dancer_goblin(x, y, s=1, r=0):
    body = f'<path d="M-40,40 C-30,0 30,0 40,40 L50,140 L-50,140Z" fill="#5a2a7a" {stroke(6)}/><path d="M-40,60 L-130,0 M40,60 L140,120 M-30,140 L-90,210 M30,140 L120,170" stroke="url(#goblin)" stroke-width="24" stroke-linecap="round"/><path d="M-40,60 L-130,0 M40,60 L140,120 M-30,140 L-90,210 M30,140 L120,170" stroke="{INK}" stroke-width="3" stroke-linecap="round" fill="none"/>'
    body += goblin(0, -40, .62, 0, 'grin')
    body += f'<path d="M-70,30 C-50,20 -30,30 -20,40" stroke="url(#gold)" stroke-width="10" fill="none"/>'
    return g(body, x, y, s, r)

def lightning_crack(x, y, s=1, color='#bfe8ff'):
    return g(f'<path d="M0,0 L30,60 L10,70 L50,150 L20,160 L70,260" stroke="{color}" stroke-width="7" fill="none" filter="url(#glow)"/>', x, y, s)

def colosseum(y=380, color='#2a1a12', light='#5a3a22'):
    out = f'<path d="M0,{y} C200,{y-160} 760,{y-160} 960,{y} L960,540 L0,540Z" fill="{color}"/>'
    for i in range(14):
        ax = 40 + i * 66; ay = y - 120 + abs(i - 6.5) ** 2 * 2.2
        out += f'<path d="M{ax},{ay+70} L{ax},{ay+20} C{ax},{ay} {ax+40},{ay} {ax+40},{ay+20} L{ax+40},{ay+70}Z" fill="#0d0705" stroke="{light}" stroke-width="3"/>'
    return out

def curtains(color='url(#crimson)'):
    left = f'<path d="M0,0 L300,0 C260,120 230,300 180,540 L0,540Z" fill="{color}"/>' + ''.join(f'<path d="M{40+i*50},0 C{30+i*48},200 {20+i*40},360 {10+i*34},540" stroke="#3b0a10" stroke-width="10" fill="none" opacity=".6"/>' for i in range(5))
    right = f'<g transform="translate(960 0) scale(-1 1)">{left}</g>'
    valance = f'<path d="M0,0 L960,0 L960,60 C880,100 800,60 720,90 C640,60 560,100 480,80 C400,100 320,60 240,90 C160,60 80,100 0,60Z" fill="{color}" {stroke(4)}/><path d="M0,58 C80,98 160,58 240,88 C320,58 400,98 480,78 C560,98 640,58 720,88 C800,58 880,98 960,58" stroke="url(#gold)" stroke-width="8" fill="none"/>'
    return left + right + valance

def beams():
    return ''.join(f'<rect x="{x}" y="0" width="38" height="540" fill="#24120a" opacity=".85"/><rect x="{x+4}" y="0" width="6" height="540" fill="#4a2814" opacity=".6"/>' for x in (70, 880)) + '<rect x="0" y="40" width="960" height="34" fill="#24120a" opacity=".9"/><rect x="0" y="44" width="960" height="5" fill="#4a2814"/>'

def table_edge(y=420, fill='url(#wood)'):
    return f'<path d="M0,{y} L960,{y} L960,540 L0,540Z" fill="{fill}" {stroke(5)}/><path d="M0,{y+6} L960,{y+6}" stroke="#d58b46" stroke-width="4" opacity=".5"/>'

def felt_table(y=330):
    return f'<ellipse cx="480" cy="{y+300}" rx="760" ry="320" fill="url(#felt)" {stroke(8)}/><ellipse cx="480" cy="{y+300}" rx="730" ry="296" fill="none" stroke="url(#gold)" stroke-width="4" opacity=".7"/>'

def stone_wall(seed=1, color='#1b1d26', mortar='#0a0b10'):
    rnd = random.Random(seed); out = f'<rect width="960" height="540" fill="{color}"/>'
    for row in range(12):
        off = (row % 2) * 40
        for col in range(14):
            w = 80; x = col * 80 - off; y = row * 46
            shade = rnd.uniform(.0, .25)
            out += f'<rect x="{x+2}" y="{y+2}" width="{w-4}" height="42" rx="4" fill="#000" opacity="{shade:.2f}" stroke="{mortar}" stroke-width="2"/>'
    return out

def runes_ring(x, y, r=200, color='#7df9ff', opacity=.5):
    glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'
    out = f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{color}" stroke-width="3" opacity="{opacity}"/><circle cx="{x}" cy="{y}" r="{r-34}" fill="none" stroke="{color}" stroke-width="2" opacity="{opacity*.7}"/>'
    for i, ch in enumerate(glyphs):
        a = i / len(glyphs) * 6.283
        out += f'<text x="{x+math.cos(a)*(r-17):.0f}" y="{y+math.sin(a)*(r-17)+8:.0f}" text-anchor="middle" font-family="DejaVu Sans" font-size="22" fill="{color}" opacity="{opacity}" transform="rotate({math.degrees(a)+90:.0f} {x+math.cos(a)*(r-17):.0f} {y+math.sin(a)*(r-17):.0f})">{ch}</text>'
    return f'<g filter="url(#glow)">{out}</g>'

def mountains(color='#120e1c', y=360):
    return f'<path d="M0,{y} L120,{y-140} L210,{y-60} L330,{y-200} L460,{y-50} L560,{y-170} L700,{y-40} L820,{y-180} L960,{y-70} L960,540 L0,540Z" fill="{color}"/>'

def lanterns(seed=4, n=7):
    rnd = random.Random(seed); out = '<path d="M0,90 C240,150 720,150 960,90" stroke="#3a2412" stroke-width="3" fill="none"/>'
    for i in range(n):
        t = (i + .5) / n; x = t * 960; y = 90 + math.sin(t * 3.1416) * 60
        col = rnd.choice(['#ff9f1c', '#ff4d6d', '#ffd166', '#c77dff'])
        out += f'<line x1="{x:.0f}" y1="{y-10:.0f}" x2="{x:.0f}" y2="{y+6:.0f}" stroke="#3a2412" stroke-width="2"/><ellipse cx="{x:.0f}" cy="{y+26:.0f}" rx="16" ry="22" fill="{col}" {stroke(3)} filter="url(#glow)"/>'
    return out
