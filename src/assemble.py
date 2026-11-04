import re, pathlib
D = pathlib.Path(__file__).parent
old = (D / 'index.v1.html').read_text()

def between(s, a, b, inc_a=True):
    i = s.index(a); j = s.index(b, i + len(a))
    return s[i if inc_a else i + len(a):j]
def rep(s, a, b, n=1):
    if a not in s: raise SystemExit('MISSING:\n' + a[:200])
    return s.replace(a, b, n)

M = lambda name: f'/* ------------------------------ {name} ------------------------------ */'
head = old[:old.index(M('CORE'))]
core = between(old, M('CORE'), M('DATA'))
data = between(old, M('DATA'), M('WORLD'))
world = between(old, M('WORLD'), M('GAME STATE'))
gs = between(old, M('GAME STATE'), M('SAVE'))
tail = old[old.index(M('SAVE')):]

# ---------- HTML / CSS ----------
head = rep(head, '#prompt{pointer-events:auto;cursor:pointer;position:absolute;', '#prompt{pointer-events:auto;cursor:pointer;position:absolute;')
head = rep(head, '@media (max-width:600px)', '''.bar.mp{height:8px;margin-top:3px}.bar.mp>i{background:linear-gradient(90deg,#3a7fff,#8fc8ff)}.bar.mp>span{font-size:8px;line-height:7px}
#h-align{margin-top:6px;font-size:11px;display:flex;align-items:center;gap:6px;font-family:var(--f-display);letter-spacing:.04em}#h-alignt{min-width:74px}
.abar{position:relative;flex:1;height:6px;border-radius:3px;background:linear-gradient(90deg,#7a4ac8,#3a3a4a 50%,#d8b45a)}.abar i{position:absolute;top:-2px;width:3px;height:10px;background:#fff;border-radius:1px;transform:translateX(-50%);box-shadow:0 0 4px #fff}
.abar.big{height:10px;margin:6px 0}.abar.big i{height:16px;top:-3px}
#h-online{font-size:11px;color:var(--muted);margin-top:2px}
#chat{position:absolute;left:calc(10px + env(safe-area-inset-left,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));width:min(380px,40vw);padding:6px 9px;font-size:12px;line-height:1.35;max-height:128px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;cursor:pointer}
#chat .ln{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#chat .who{font-weight:800;color:var(--line)}#chat .sys{color:var(--gold)}#chat .nws{color:#ffb38a}
#chat.mini{max-height:26px}
#h-comp{display:flex;gap:6px;align-items:center;margin-top:6px;padding-top:6px;border-top:1px solid rgba(134,220,255,.15)}#h-comp canvas{width:34px;height:34px;image-rendering:pixelated;border-radius:4px;background:radial-gradient(circle at 50% 40%,#2c5c9c,#0b1c3a);flex:none}
#h-comp>div{flex:1;min-width:0}#h-compn{font:700 11px var(--f-display);letter-spacing:.04em;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h-comp .bar{height:6px;margin-top:3px}#h-comp .bar.ce>i{background:linear-gradient(90deg,#d8a030,#ffe08a)}#h-comp.full .bar.ce>i{box-shadow:0 0 6px #ffe08a}#h-comp.down{opacity:.55}
#mini{cursor:pointer}
#loadscr{position:fixed;inset:0;z-index:8;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#0d1e3d,#04070f);padding:16px}
#loadscr .ld{width:min(640px,92vw);display:grid;gap:10px;text-align:center}#ld-art{width:100%;aspect-ratio:12/5;image-rendering:pixelated;border:1px solid var(--rc);border-radius:6px;box-shadow:0 0 40px color-mix(in srgb,var(--rc) 35%,transparent)}
#ld-name{font:700 clamp(20px,4vw,30px) var(--f-display);letter-spacing:.06em;color:var(--rc);text-shadow:0 0 14px color-mix(in srgb,var(--rc) 60%,transparent)}#ld-tier{font:700 12px var(--f-display);letter-spacing:.1em;color:var(--muted)}
#ld-tip,#ld-hot{font-size:13px;color:var(--ink);opacity:.9}#ld-hot{color:var(--gold)}#ld-first{font:700 11px var(--f-display);letter-spacing:.14em;color:var(--rc)}
.ldbar{height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}.ldbar i{display:block;height:100%;width:0;background:var(--rc);transition:width .1s linear}
#panel.wide{width:min(1100px,96vw);max-height:94vh}.mapbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px}#mapwrap{height:min(62vh,560px);border:1px solid var(--line-dim);border-radius:6px;overflow:hidden}
#worldmap{width:100%;height:100%;display:block;touch-action:none;cursor:grab}.maplegend{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;margin-top:6px}.maplegend i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:4px;vertical-align:-1px}
.w3warn{border:1px dashed #b48aff;color:#d8c4ff;border-radius:5px;padding:6px 10px;font-size:12px;margin-bottom:10px}.w3grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
#h-party{margin-top:6px;display:grid;gap:3px}#h-party .pm{display:grid;grid-template-columns:minmax(0,1fr) 54px;gap:6px;align-items:center;font-size:11px}#h-party .pm span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#h-party .bar{height:5px}#h-party .bar>i{background:linear-gradient(90deg,#3a8adf,#86dcff)}#h-party .pm.down{opacity:.45}\n#lang-sw{display:flex;gap:6px;justify-content:center;margin-top:14px;pointer-events:auto}#lang-sw .btn{opacity:.6}#lang-sw .btn.on{opacity:1;border-color:var(--gold);color:var(--gold)}
body.touch #chat{bottom:auto;top:calc(150px + env(safe-area-inset-top,0px));width:min(300px,36vw);max-height:80px;font-size:11px}
.badge{display:inline-block;font:700 10px var(--f-display);letter-spacing:.06em;padding:1px 6px;border-radius:3px;background:#2a5a9a;color:#dff1ff}
.badge.off{background:#7a5a1a;color:#ffe9b8}.badge.p{background:#4a3a6a;color:#e8dcff}.badge.me{background:#2a6a4a;color:#d8ffe8}
.stamp{font:700 11px var(--f-display);letter-spacing:.08em;padding:1px 6px;border:1px solid;border-radius:3px;white-space:nowrap}
.stamp.ok{color:var(--ok)}.stamp.bad{color:var(--danger)}.stamp.wait{color:var(--warn)}
.news{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;padding:8px 10px;border:1px solid rgba(134,220,255,.14);border-radius:5px;margin-bottom:6px;background:rgba(255,255,255,.025)}
.news .meta{font-size:11px;color:var(--muted)}.news .claim{font-weight:700;margin:3px 0;display:flex;align-items:center;gap:6px}
#fade{position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:3}
select.inp{background:rgba(0,0,0,.35);color:var(--ink);border:1px solid var(--line-dim);border-radius:5px;padding:6px 8px;font:inherit;min-height:34px}
.sbtn.lock{opacity:.55}
@media (max-width:600px)''')
head = rep(head, '<div class="bar"><i id="h-hp"></i><span id="h-hpt"></span></div>',
           '<div class="bar"><i id="h-hp"></i><span id="h-hpt"></span></div>\n    <div class="bar mp"><i id="h-mp"></i><span id="h-mpt"></span></div>')
head = rep(head, '<div id="h-zone"></div>', '<div id="h-align"><span id="h-alignt"></span><div class="abar"><i id="h-alignm"></i></div></div>\n    <div id="h-zone"></div><div id="h-online"></div>\n    <div id="h-comp" hidden><canvas id="h-compp" width="32" height="32"></canvas><div><b id="h-compn"></b><div class="bar"><i id="h-comphp"></i></div><div class="bar ce"><i id="h-compen"></i></div></div></div>\n    <div id="h-party" hidden></div>')
head = rep(head, '<div id="toasts"></div>', '<div id="toasts"></div>\n  <div id="chat" class="glass" title="Ketuk untuk mengecilkan chat"></div>')
head = rep(head, '<canvas id="portrait" width="12" height="12"></canvas>', '<canvas id="portrait" width="32" height="32"></canvas>')
head = rep(head, '<button class="btn" id="t-cont" hidden>Lanjutkan</button>\n  </div>', '<button class="btn" id="t-cont" hidden>Lanjutkan</button>\n  </div>\n  <div id="lang-sw" role="group" aria-label="Bahasa"><button class="btn sm" data-lang="id">Bahasa Indonesia</button><button class="btn sm" data-lang="en">English</button></div>')
head = rep(head, '<div id="hurt"></div>', '<div id="hurt"></div>\n<div id="fade"></div>\n<div id="loadscr" hidden><div class="ld"><div id="ld-first">DAERAH BARU</div><canvas id="ld-art" width="480" height="200"></canvas><div id="ld-name"></div><div id="ld-tier"></div><div class="ldbar"><i id="ld-bar"></i></div><div id="ld-tip"></div><div id="ld-hot"></div></div></div>')
head = rep(head, '''<button class="sbtn" id="b-skill" data-a="skill"><span class="ic">Tebas<br>Putar</span><span class="k">K</span><i class="cd"></i></button>''',
           '''<button class="sbtn" id="b-skill" data-a="skill"><span class="ic">Skill 1</span><span class="k">K</span><i class="cd"></i></button>
    <button class="sbtn" id="b-skill2" data-a="skill2"><span class="ic">Skill 2</span><span class="k">L</span><i class="cd"></i></button>''')
head = rep(head, 'PC: WASD gerak · E aksi · J serang · K tebasan · I status · Esc jeda', 'PC: WASD gerak · E aksi/masuk · J serang · K/L skill · I status · B bangun · M peta · Esc jeda')

# ---------- CORE ----------
core = rep(core, "skill: ['KeyK', 'KeyC'],", "skill: ['KeyK', 'KeyC'], skill2: ['KeyL', 'KeyV'], build: ['KeyB'], map: ['KeyM'],")
core = rep(core, "const T = 16, MW = 72, MH = 58,", "const T = 16, MW = 150, MH = 100,")
import json as _json
_dict = _json.load(open('/tmp/claude-0/-home-claude/4c85927b-5aad-50b2-ad03-3e26771245c5/scratchpad/dict.json')) if not (D / 'i18n_dict.json').exists() else _json.load(open(D / 'i18n_dict.json'))
(D / 'i18n_dict.json').write_text(_json.dumps(_dict, ensure_ascii=False))
core = rep(core, "const fmt = n => Math.round(n).toLocaleString('id-ID');", "const fmt = n => Math.round(n).toLocaleString(LANG.cur === 'en' ? 'en-US' : 'id-ID');\n" + (D / 'parts/i18n.js').read_text().replace('/*@@DICT@@*/[]', _json.dumps(_dict, ensure_ascii=False)))
core = rep(core, "  c.font = `bold ${size}px ui-monospace, Menlo, Consolas, monospace`; c.textAlign = align; c.textBaseline = 'middle';", "  str = tr(str); c.font = `bold ${size}px ui-monospace, Menlo, Consolas, monospace`; c.textAlign = align; c.textBaseline = 'middle';")
core = rep(core, "  shake(a) { this.trauma", "  clear() { for (const p of this.parts) p.live = false; this.texts = []; },\n  shake(a) { this.trauma")
core = rep(core, "  spin: () =>", "  door: () => Snd.play({ noise: true, f0: 500, f1: 120, dur: .18, vol: .14 }),\n  spin: () =>")

# ---------- DATA ----------
data = rep(data, "dmg: 2 },\n  pedang_besi:", "dmg: 2, wt: 'pedang' },\n  pedang_besi:")
data = rep(data, "e: .7, dmg: 4 },\n  pedang_perak:", "e: .7, dmg: 4, wt: 'pedang' },\n  pedang_perak:")
data = rep(data, "e: .8, dmg: 6 },", """e: .8, dmg: 6, wt: 'pedang' },
  busur_latihan: { n: 'Busur Latihan', k: 'senjata', base: 28, tgt: 12, e: .6, dmg: 2, wt: 'busur' },
  busur_besi: { n: 'Busur Besi', k: 'senjata', base: 90, tgt: 8, e: .7, dmg: 4, wt: 'busur' },
  tongkat_sihir: { n: 'Tongkat Sihir', k: 'senjata', base: 30, tgt: 12, e: .6, dmg: 3, wt: 'tongkat' },
  tongkat_perak: { n: 'Tongkat Perak', k: 'senjata', base: 230, tgt: 5, e: .8, dmg: 6, wt: 'tongkat' },
  belati: { n: 'Belati', k: 'senjata', base: 22, tgt: 12, e: .6, dmg: 2, wt: 'belati' },
  belati_besi: { n: 'Belati Besi', k: 'senjata', base: 80, tgt: 8, e: .7, dmg: 3, wt: 'belati' },
  racun: { n: 'Bubuk Racun', k: 'gelap', base: 35 },""")
data = rep(data, "    { out: 'pompa', need:", """    { out: 'busur_besi', need: { besi: 2, tembaga: 2 }, diff: 18 },
    { out: 'belati_besi', need: { besi: 2 }, diff: 12 },
    { out: 'tongkat_perak', need: { perak: 2, tembaga: 2 }, diff: 36 },
    { out: 'pompa', need:""")
data = rep(data, "const SKILLS = { pedang: 'Pedang', bertani: 'Bertani', menambang: 'Menambang', pandai: 'Pandai Besi', memasak: 'Memasak', berdagang: 'Berdagang' };",
"""const SKILLS = { pedang: 'Pedang', busur: 'Busur', sihir: 'Sihir', penyembuhan: 'Penyembuhan', bayangan: 'Bayangan', bertani: 'Bertani', menambang: 'Menambang', pandai: 'Pandai Besi', memasak: 'Memasak', berdagang: 'Berdagang', pertukangan: 'Pertukangan' };
const SKILL_TEMPUR = ['pedang', 'busur', 'sihir', 'penyembuhan', 'bayangan'], SKILL_HIDUP = ['bertani', 'menambang', 'pandai', 'memasak', 'berdagang', 'pertukangan'];
const WTYPES = { pedang: { n: 'Pedang', sk: 'pedang', cd: .36, d: 'Tebasan jarak dekat yang seimbang.' }, busur: { n: 'Busur', sk: 'busur', cd: .55, range: 150, d: 'Panah jarak jauh; aman, tapi damage per detik lebih kecil.' },
  tongkat: { n: 'Tongkat Sihir', sk: 'sihir', cd: .7, mp: 3, range: 120, d: 'Bola sihir yang meledak kecil; butuh mana.' }, belati: { n: 'Belati', sk: 'bayangan', cd: .24, d: 'Sangat cepat, peluang kritikal tinggi, jangkauan pendek.' } };
const ACTS = {
  tebas_putar: { n: 'Tebasan Putar', short: 'Tebas Putar', d: 'Serangan memutar mengenai semua musuh di sekelilingmu.', req: {}, cd: 4, mp: 0, k: 'pedang' },
  lingkar_suci: { n: 'Lingkar Penyembuh', short: 'Lingkar Suci', d: 'Pulihkan HP-mu dan pengembara di sekitar; membangunkan yang pingsan (+Cahaya).', req: {}, cd: 8, mp: 6, k: 'penyembuhan' },
  hujan_panah: { n: 'Hujan Panah', short: 'Hujan Panah', d: 'Lima anak panah menyebar ke depan.', req: { busur: 8 }, cd: 5, mp: 4, k: 'busur' },
  bola_api: { n: 'Bola Api', short: 'Bola Api', d: 'Bola api besar yang meledak luas.', req: { sihir: 5 }, cd: 4, mp: 8, k: 'sihir' },
  langkah_bayang: { n: 'Langkah Bayangan', short: 'Langkah Bayang', d: 'Melesat ke depan tanpa terluka; serangan berikutnya pasti kritikal.', req: { bayangan: 5 }, cd: 5, mp: 3, k: 'bayangan' },
  panah_api: { n: 'Panah Api', short: 'Panah Api', d: 'Hibrida Busur + Sihir: tiga panah yang meledak membakar.', req: { busur: 12, sihir: 12 }, cd: 3, mp: 6, k: 'busur', hybrid: true },
  pedang_suci: { n: 'Pedang Suci', short: 'Pedang Suci', d: 'Hibrida Cahaya: tebasan putar yang juga menyembuhkan.', req: { pedang: 12, penyembuhan: 10 }, align: 30, cd: 6, mp: 8, k: 'pedang', hybrid: true },
  tikam_bayang: { n: 'Tikaman Bayangan', short: 'Tikam Bayang', d: 'Hibrida Bayangan: satu tikaman ×3 damage, pasti kritikal.', req: { bayangan: 12, pedang: 8 }, align: -30, cd: 6, mp: 5, k: 'bayangan', hybrid: true },
};""")
data = rep(data, "{ id: 'silat', n: 'Atlet Silat', d: 'Juara antar-kampung tiga kali.', sk: { pedang: 10 }, rec: 'ramuan' },",
           "{ id: 'silat', n: 'Atlet Silat', d: 'Juara antar-kampung tiga kali.', sk: { pedang: 8, bayangan: 4 }, rec: 'ramuan' },")
data = rep(data, "{ id: 'farmasi', n: 'Mahasiswa Farmasi', d: 'Skripsi tentang minyak atsiri.', sk: { memasak: 5 }, rec: 'sabun' },",
           "{ id: 'farmasi', n: 'Mahasiswa Farmasi', d: 'Skripsi tentang minyak atsiri.', sk: { penyembuhan: 8, sihir: 4 }, rec: 'sabun' },")
data = rep(data, "  dewi: {", "  gagak: { n: 'Si Gagak', sub: 'Pasar Gelap', look: { skin: '#d9b08c', hair: '#1a1a22', top: '#2a2a3a', top2: '#1a1a26', bottom: '#1a1a22', acc: 'hood', eye: '#c03a3a' } },\n  dewi: {")

data = data.replace(' lvl: ', ' diff: ')
# ---------- WORLD ----------
world = rep(world, "  if (A === 'halo' && !back) { R(2, 1, 8, 1, '#f6e08c'); }",
            "  if (A === 'halo' && !back) { R(2, 1, 8, 1, '#f6e08c'); }\n  if (A === 'hood') { const hc = o.top2 || shade(tp, -.3); if (back) R(1, -1, 10, 10, hc); else { R(1, -1, 10, 3, hc); R(1, 0, 1, 8, hc); R(10, 0, 1, 8, hc); if (!side) R(2, 2, 8, 1, hc); } }")
s0 = world.index('  // bengkel: tungku + landasan'); s1 = world.index('  // tiang gerbang')
world = world[:s0] + """  // papan berita di alun-alun
  const nx = 33 * T + 8, ny = 17 * T + 12; addSolid(nx - 11, ny - 3, 22, 3, 'news');
  pellipse(bx, nx, ny, 12, 2, 'rgba(0,0,0,.25)'); bx.fillStyle = '#5a3b22'; bx.fillRect(nx - 10, ny - 18, 2, 18); bx.fillRect(nx + 8, ny - 18, 2, 18);
  bx.fillStyle = '#4a3020'; bx.fillRect(nx - 13, ny - 26, 26, 14); bx.fillStyle = '#d9c49a'; bx.fillRect(nx - 12, ny - 25, 24, 12);
  const papers = ['#f4ead6', '#ffe9a8', '#f4ead6', '#ffd0d0', '#e6f0ff']; for (let i = 0; i < 5; i++) { bx.fillStyle = papers[i]; bx.fillRect(nx - 11 + i * 5, ny - 24 + (i % 2) * 2, 4, 6); bx.fillStyle = '#7a6a5a'; bx.fillRect(nx - 10 + i * 5, ny - 22 + (i % 2) * 2, 2, 1); }
  ox.fillStyle = '#8a3a2a'; ox.fillRect(nx - 15, ny - 30, 30, 4); ox.fillStyle = '#a84a36'; ox.fillRect(nx - 15, ny - 30, 30, 1);
  OBJS.push({ id: 'news', x: nx, y: ny, r: 12, label: 'Baca Papan Berita', act: () => openPanel('news') });
  // gang gelap (Pasar Gelap malam hari)
  LIGHTS.push({ x: 23.5 * T, y: 29.7 * T - 14, r: 34, col: [170, 110, 255], gagak: true });
""" + world[s1:]
world = rep(world, "  drawStatue();\n", "  drawStatue();\n  drawFacades();\n")
world = rep(world, "  drawProps();\n", "  drawProps();\n  drawRegions();\n")
world = rep(world, "for (let x = 2; x < MW - 2; x++) if (x < 34 || x > 38) setT(x, 38, TL.FENCE);", "for (let x = 2; x < 70; x++) if (x < 34 || x > 38) setT(x, 38, TL.FENCE);")
world = rep(world, "  // pohon kota\n", "  buildRegions();\n  // pohon kota\n")
world = rep(world, "    if (at(x, y) !== TL.GRASS || nearOpen(x, y)) continue;\n    const wild = y >= 40, h = hash(x, y, 7);\n    const nearSpawn = SPAWNERS.some(s => Math.hypot(s.x - x, s.y - y) < s.r + 2) || SIGN_POS.some(([sx, sy]) => Math.abs(sx - x) <= 1 && Math.abs(sy - y) <= 1);",
  "    const nearSpawn = SPAWNERS.some(s => Math.hypot(s.x - x, s.y - y) < s.r + 2) || SIGN_POS.some(([sx, sy]) => Math.abs(sx - x) <= 1 && Math.abs(sy - y) <= 1) || PLOTS.some(p => x >= p.x - 1 && x <= p.x + p.w && y >= p.y - 1 && y <= p.y + p.h);\n    if (x >= 70 || y >= 56) { regionDeco(x, y, nearOpen, nearSpawn); continue; }\n    if (at(x, y) !== TL.GRASS || nearOpen(x, y)) continue;\n    const wild = y >= 40, h = hash(x, y, 7);")
world = rep(world, "  const px = tx * T, py = ty * T, t = at(tx, ty), H = (s) => hash(tx, ty, s);\n", "  const px = tx * T, py = ty * T, t = at(tx, ty), H = (s) => hash(tx, ty, s);\n  if (drawRegionTile(c, tx, ty, t)) return;\n")
world = rep(world, "  const cols = ['#579541', '#5f9f48', '#68a94f', '#72b356'];", "  const cols = tx >= 72 && ty >= 54 ? ['#2f5a3a', '#35603f', '#3b6844', '#447049'] : ['#579541', '#5f9f48', '#68a94f', '#72b356'];")
world = rep(world, "12: '#5d5144', 13: '#a98c62' };", "12: '#5d5144', 13: '#a98c62', 14: '#3a6a44', 15: '#1c1a22', 16: '#5a5660' };")
world = rep(world, "|| ZONES[4]; };", "|| ZONES[ZONES.length - 1]; };")
world = rep(world, "for (const b of BUILD) { mc.fillStyle = b.kind === 'kuil' ? '#f2c46d' : b.roof; mc.fillRect(b.x, b.y, b.w, b.h); }",
            "for (const b of BUILD) { mc.fillStyle = { kuil: '#f2c46d', guild: '#4a8ae0', smith: '#ff8a3a', cook: '#ff5a5a' }[b.id] || shade(b.roof, -.2); mc.fillRect(b.x, b.y, b.w, b.h); }\n  mc.fillStyle = '#ffffff'; mc.fillRect(33, 17, 2, 1); mc.fillStyle = '#ffe08a'; mc.fillRect(44, 17, 10, 2);")
sp0 = world.index('const solidPt = '); sp1 = world.index('/*', sp0) if '/*' in world[sp0:] else len(world)
world = world[:sp0] + """const solidPt = (x, y, who, room) => {
  if (room) return roomSolid(room, x, y);
  if (SOLID_T.has(at(Math.floor(x / T), Math.floor(y / T)))) return true;
  if (who === 'enemy' && inSafe(x, y)) return true;
  if (who === 'proj') return false;
  for (const s of SOLIDS) if (x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h) return true;
  if (G) for (let i = 0; i < ORES.length; i++) { const o = G.ores[i]; if (o.cd > 0) continue; const ox2 = ORES[i][1] * T + 8, oy2 = ORES[i][2] * T + 12; if (x > ox2 - 7 && x < ox2 + 7 && y > oy2 - 6 && y < oy2) return true; }
  return false;
};
const blocked = (x, y, who, room) => solidPt(x - 4, y - 4, who, room) || solidPt(x + 4, y - 4, who, room) || solidPt(x - 4, y, who, room) || solidPt(x + 4, y, who, room);
function moveActor(a, dx, dy, who, room) {
  if (dx) { if (!blocked(a.x + dx, a.y, who, room)) a.x += dx; else if (!dy) { for (const n of [1, -1]) if (!blocked(a.x + dx, a.y + n * 1.2, who, room)) { a.y += n * .8; break; } } }
  if (dy) { if (!blocked(a.x, a.y + dy, who, room)) a.y += dy; else if (!dx) { for (const n of [1, -1]) if (!blocked(a.x + n * 1.2, a.y + dy, who, room)) { a.x += n * .8; break; } } }
}

""" + ''.join((D / f'parts/{n}.js').read_text() + '\n' for n in ['interior', 'regions', 'rooms2'])

# ---------- GAMEPLAY (parts + reused slices) ----------
def g(a, b): return between(gs, a, b)
S = {
 'S_time': g('const hourOf', 'function newGame'),
 'S_market': g('function initMarket', 'const taxRate'),
 'S_spawn': g('function spawnEnemy', M('UI: toast, prompt, dialog')),
 'S_ui': g(M('UI: toast, prompt, dialog'), M('QUESTS & NPC TALK')),
 'S_icons': g('const ICON = {};', 'const img = '),
 'S_craft': g('function craftHTML', 'function pauseHTML'),
 'S_pause': g('function pauseHTML', 'function doAction'),
 'S_esc': g('const esc =', M('RITUAL')),
 'S_ritual': g(M('RITUAL'), M('GAMEPLAY')),
 'S_farm': g('const cropProg', 'function playerAttack'),
 'S_wave': g('function waveOmen', '/* ---- update ---- */'),
 'S_drops': g('function updateBolts', 'function updateEnemies'),
 'S_crop': g('function drawCrop', 'function drawActors'),
 'S_enemydraw': g('function drawEnemy', 'function ambient'),
}
S['S_ui'] = rep(S['S_ui'], "const info = l.who === 'me'", "const info = l.info || (l.who === 'me'")
S['S_ui'] = rep(S['S_ui'], ": NPC_LOOK[l.who];", ": NPC_LOOK[l.who]);")
S['S_ui'] = rep(S['S_ui'], "function say(lines, done) { Dlg.q = lines.slice();", "function say(lines, done) { Dlg.q = lines.map(l => ({ ...l, t: tr(l.t), choices: l.choices && l.choices.map(c => ({ ...c, t: tr(c.t) })) }));")
S['S_ui'] = rep(S['S_ui'], "pc.clearRect(0, 0, 12, 12); if (info) drawChar(pc, 0, 2, info.look, 0, 0); else { pc.fillStyle = '#c7a46c'; pc.fillRect(2, 2, 8, 8); pc.fillStyle = '#5a3b22'; pc.fillRect(3, 4, 6, 1); pc.fillRect(3, 6, 4, 1); }",
  "pc.clearRect(0, 0, 32, 32); if (info && info.look) drawPortrait(pc, info.look); else { pc.fillStyle = '#c7a46c'; pc.fillRect(6, 6, 20, 20); pc.fillStyle = '#5a3b22'; pc.fillRect(9, 11, 14, 2); pc.fillRect(9, 16, 10, 2); pc.fillRect(9, 21, 12, 2); }")
S['S_ritual'] = rep(S['S_ritual'], '<canvas width="14" height="18"></canvas>', '<canvas width="32" height="32" style="width:96px;height:96px;image-rendering:pixelated"></canvas>')
S['S_ritual'] = rep(S['S_ritual'], "drawChar(x, 1, 2, COMPANIONS[b.dataset.comp].look, 0, 0);", "drawPortrait(x, COMPANIONS[b.dataset.comp].look);")
S['S_ritual'] = rep(S['S_ritual'], "<p style=\"color:var(--rose)\">Sifat: ", "<p>HP ${COMP_ST[id].hp} · Jurus: ${COMP_ST[id].sp}</p><p style=\"color:var(--rose)\">Sifat: ")
S['S_pause'] = rep(S['S_pause'], '<button class="btn ghost" data-do="title">', '<div style="display:flex;gap:6px"><button class="btn sm ${LANG.cur === \'id\' ? \'gold\' : \'ghost\'}" data-do="lang" data-arg="id" style="flex:1">Bahasa Indonesia</button><button class="btn sm ${LANG.cur === \'en\' ? \'gold\' : \'ghost\'}" data-do="lang" data-arg="en" style="flex:1">English</button></div>\n  <button class="btn ghost" data-do="title">')
S['S_craft'] = rep(S['S_craft'], "sk = k === 'forge' ? 'pandai' : 'memasak';", "sk = { forge: 'pandai', cook: 'memasak', bench: 'pertukangan' }[k];")
S['S_craft'] = rep(S['S_craft'], "${k === 'forge' ? 'Tempa' : 'Masak'}</button>", "${{ forge: 'Tempa', cook: 'Masak', bench: 'Buat' }[k]}</button>")
S['S_craft'] = rep(S['S_craft'], "${k === 'cook' ? 'Telur dan minyak kelapa bisa dibeli di pasar.'", "${k === 'bench' ? 'Kayu didapat dengan menebang pohon liar memakai kapak, atau dibeli di Toko Tukang.' : k === 'cook' ? 'Telur dan minyak kelapa bisa dibeli di pasar. Ikan murah di Corvel, herba di Mirewood.'")
S['S_icons'] = rep(S['S_icons'], "    case 'coin':", """    case 'busur_latihan': case 'busur_besi': { const c2 = id === 'busur_besi' ? '#9fb0c4' : '#a07a4a'; for (let i = 0; i < 11; i++) R(4 + Math.round(Math.sin(i / 10 * Math.PI) * 4), 2 + i, 2, 1, c2); R(5, 2, 1, 11, '#e8e0d0'); break; }
    case 'tongkat_sihir': case 'tongkat_perak': R(7, 5, 2, 10, id === 'tongkat_perak' ? '#c9d2dc' : '#7a5130'); pcircle(c, 8, 4, 3, id === 'tongkat_perak' ? '#ffffff' : '#7fe8ff'); R(7, 3, 1, 1, '#ffffff'); break;
    case 'belati': case 'belati_besi': for (let i = 0; i < 5; i++) R(6 + i, 9 - i, 2, 2, id === 'belati_besi' ? '#c9d2dc' : '#b0a090'); R(4, 10, 3, 1, '#5a3b22'); R(3, 11, 2, 3, '#3a2a3a'); break;
    case 'racun': R(6, 2, 4, 3, '#3a2a3a'); pcircle(c, 8, 10, 5, '#7a3ac8'); R(6, 8, 2, 2, '#c8a0ff'); R(9, 11, 1, 1, '#c8a0ff'); break;
    case 'coin':""")
S['S_craft'] = rep(S['S_craft'], "Upah ${fmt(o.reward)} koin", "Upah ${fmt(Math.ceil(o.reward * orderMul()))} koin")
S['S_enemydraw'] = rep(S['S_enemydraw'], "  for (const b of BOLTS) lights.push([b.x - cx, b.y - cy, 18, [120, 230, 255], .5]);",
  "  for (const b of BOLTS) lights.push([b.x - cx, b.y - cy, 18, [120, 230, 255], .5]);\n  for (const p of PROJ) if (p.kind !== 'arrow') lights.push([p.x - cx, p.y - cy, p.kind === 'fire' ? 30 : 18, p.kind === 'fire' ? [255, 150, 60] : [120, 230, 255], .5]);")
S['S_enemydraw'] = rep(S['S_enemydraw'], "  else { const sc = e.d.boss ? 2 : 1;", "  else if (e.t === 'bat') drawBat(e, t, f); else if (e.t === 'golem') drawGolem(e, t, f);\n  else { const sc = e.d.boss ? 2 : 1;")
S['S_enemydraw'] = rep(S['S_enemydraw'], "{ skin: '#8ab04a', hair: e.d.boss", "e.t === 'bandit' ? BANDIT_LOOK : { skin: '#8ab04a', hair: e.d.boss")
S['S_enemydraw'] = rep(S['S_enemydraw'], "if (e.d.boss) ptext(ctx, 'Raja Goblin',", "if (e.d.boss) ptext(ctx, e.d.n,")
S['S_enemydraw'] = rep(S['S_enemydraw'], "const n = nightAmt(), du = duskAmt()", "const n = worldDark(), du = G && !G.room && inDungeon(G.x, G.y) ? 0 : duskAmt()")
S['S_enemydraw'] = rep(S['S_enemydraw'], "if (x < -L.r || y < -L.r", "if (L.gagak && nightAmt() < .55) continue; if (x < -L.r || y < -L.r")
S['S_wave'] = rep(S['S_wave'], "function startWave() {", "function startWave() { for (const b of BOTS) if (HUNT[b.task] || b.role === 'pendekar' || b.role === 'pemanah') { if (b.mode !== 'room' && !b.down) { b.task = 'slime'; b.poi = 'slime'; b.mode = 'path'; } }")


S['S_spawn'] = rep(S['S_spawn'], "  if (opt.wave) e.st = 'chase';", "  scaleEnemy(e, opt); if (opt.wave) e.st = 'chase';")
S['S_farm'] = rep(S['S_farm'], "  if (G.comp === 'aira' && rand() < .15) { n *= 2; dbl = true; }", "  if ((G.comp === 'aira' && rand() < .15) || rand() < (perk('bertani', 4) ? .35 : perk('bertani', 2) ? .2 : 0)) { n *= 2; dbl = true; }")
S['S_farm'] = rep(S['S_farm'], "if (G.comp === 'garon' && rand() < .15) { n = 2;", "if ((G.comp === 'garon' && rand() < .15) || rand() < (perk('menambang', 4) ? .25 : perk('menambang', 2) ? .1 : 0)) { n = 2;")
S['S_craft'] = rep(S['S_craft'], "  <button class=\"btn sm ${ok ? 'gold' : ''}\" data-do=\"order\" data-arg=\"${i}\" ${ok ? '' : 'disabled'}>Serahkan</button></div>`; }).join(''); }",
  "  <button class=\"btn sm ${ok ? 'gold' : ''}\" data-do=\"order\" data-arg=\"${i}\" ${ok ? '' : 'disabled'}>Serahkan</button></div>`; }).join('') + `<h5>Seruan Raid</h5><div class=\"rec\"><span class=\"tag\">RAID</span><div style=\"min-width:0\"><b>Panggil party raid</b><div class=\"note\" style=\"margin:0\">Hingga 4 pengembara AI tempur terkuat yang sedang online ikut selama 1 hari (party maks 5). Cocok untuk Raja Goblin dan Golem Reruntuhan.</div></div><button class=\"btn sm gold\" data-do=\"raid\" ${G.coin >= Math.max(15, 30 - facRank('guild') * 4) ? '' : 'disabled'}>${Math.max(15, 30 - facRank('guild') * 4)} koin</button></div><button class=\"btn sm ghost\" data-do=\"rankpanel\">Papan Peringkat Mingguan</button>`; }")
S['S_pause'] = rep(S['S_pause'], '<button class="btn" data-do="save">Simpan sekarang</button>', '<button class="btn" data-do="save">Simpan sekarang</button><button class="btn" data-do="backuppanel">Cadangan & ekspor simpanan</button><button class="btn" data-do="w3open">Lab Web3 (simulasi potensi online)</button>')
S['S_enemydraw'] = rep(S['S_enemydraw'], "function drawEnemy(e) {\n  const t = e.anim, f = e.flash > 0;", "function drawEnemy(e) {\n  const t = e.anim, f = e.flash > 0;\n  if (e.elite) { ctx.globalCompositeOperation = 'lighter'; pellipse(ctx, e.x, e.y - 1, 9 + Math.sin(t * 6), 4, 'rgba(255,190,70,.35)'); ctx.globalCompositeOperation = 'source-over'; ptext(ctx, 'Elit', e.x, e.y - (e.d.boss ? 50 : 28), '#ffcf5a', 7, 'center'); }")
parts = ''.join((D / f'parts/{n}.js').read_text() + '\n' for n in ['state', 'society']) + S['S_ui'] + ''.join((D / f'parts/{n}.js').read_text() + '\n' for n in ['talk', 'panels'])
parts += S['S_ritual'] + ''.join((D / f'parts/{n}.js').read_text() + '\n' for n in ['play', 'land', 'travel', 'rpg', 'ai2', 'world2', 'meta', 'explore', 'web3', 'comp', 'render'])
for k, v in S.items():
    if k in ('S_ritual', 'S_ui'): continue
    tag = f'/*@@{k}@@*/'
    if tag not in parts: raise SystemExit('tag missing ' + k)
    parts = parts.replace(tag, v)
assert '/*@@' not in parts

# ---------- TAIL ----------
tail = rep(tail, "if (!s || s.v !== 1) return false;", "if (!s || s.v !== 3) return false;")
tail = rep(tail, "G = s; G.ores = G.ores && G.ores.length === ORES.length ? G.ores : ORES.map(() => ({ hits: 0, cd: 0 })); startWorld();", "G = s; G.ores = G.ores && G.ores.length === ORES.length ? G.ores : ORES.map(() => ({ hits: 0, cd: 0 })); G.thief = null; rebuildWorld(); if (G.room && !ROOMS[G.room]) { G.room = null; G.x = G.wx; G.y = G.wy; } startWorld();")
tail = rep(tail, "    update(dt) { this.t += dt; Cam.x = 26 * T", "    update(dt) { this.t += dt; updateBots(dt); Cam.x = 26 * T")
tail = rep(tail, "    draw() { renderWorld(); },", "    draw() { if (G.room) renderRoom(); else renderWorld(); },")
tail = rep(tail, "enter() { show('#hud', true); G.lastTier = 'aman';", "enter() { show('#hud', true); G.lastTier = 'aman'; snapCam(); chatDirty = true;")
tail = rep(tail, "  tp(tx, ty) { G.x = tx * T; G.y = ty * T; Cam.x = clamp(G.x - VW / 2, 0, MW * T - VW); Cam.y = clamp(G.y - VH / 2, 0, MH * T - VH); },",
  "  tp(tx, ty) { G.x = tx * T; G.y = ty * T; snapCam(); }, enter(id) { enterRoom(id); }, exit() { exitRoom(); }, skill(i) { useSkill(i); }, bots: () => BOTS, news: () => G.news, align: () => G.align, land: () => G.land, plots: () => PLOTS, build(pid, t) { startBuild(pid, t); }, place() { placeConfirm(); }, bm: () => ({ ...BM }), daily() { G.lastDay = dayOf(); landDaily(dayOf()); }, hourly() { landHourly(); cityTick(); }, rebuild() { rebuildWorld(); return rebuildWorld.ms; }, market(c) { openMarket(c); }, priceIn: (id, c) => priceIn(id, c), travel(a, b, ins) { travel(a, b, 0, ins); }, dun() { enterDungeon(); }, dunExit() { exitDungeon(); }, rooms: () => ROOMS, tryEnter(id) { tryEnter(id, false); }, breakIn(id) { breakIn(id); }, comp2: () => COMP ? { hp: G.cHp, en: G.cEn, down: G.cDown, x: COMP.x, y: COMP.y, guard: COMP.guard } : null, panelHTML: () => $('#p-body').innerHTML, zone: () => zoneAt(G.x, G.y).n,")
tail = rep(tail, "fit(); prerender();", "fit(); prerender(); initRooms(); initNav(); initBots();\n$('#chat').addEventListener('click', () => $('#chat').classList.toggle('mini'));\nI18N.watch(); I18N.set(LANG.cur); for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', e => { e.stopPropagation(); I18N.set(b.dataset.lang); });\n$('#mini').addEventListener('click', () => { if (G && Game.scene === Scenes.play && !Panel.open && !Dlg.open) openMap(); });")
tail = rep(tail, "player: G ? { x: +G.x.toFixed(1), y: +G.y.toFixed(1),", "player: G ? { room: G.room, thief: G.thief, bm: BM.on, align: G.align, mp: G.mp, x: +G.x.toFixed(1), y: +G.y.toFixed(1),")

import re as _re
tail = _re.sub(r"function load\(\) \{.*?return true; \}", "function load() { return loadFrom(store.get('save', null)); }", tail, count=1)
tail = rep(tail, "try { store.set('save', G); store.set('hasSave', true); } catch {}", "try { writeSave(); } catch {}")
out = head + core + data + world + parts + tail
(D / 'index.html').write_text(out)
print('ok', len(out.splitlines()), 'lines')
