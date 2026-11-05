/* ------------------------------ HD PAINTED RENDERER ------------------------------ */
// Logika game tetap memakai koordinat 480x270 (tile 16). Lapisan ini hanya mengganti cara dunia digambar:
// tanah dilukis per chunk dari tekstur, objek jadi sprite lukisan yang diurutkan kedalaman bersama aktor.
const mapC = document.createElement('canvas'); mapC.width = MW * T; mapC.height = MH * T;
const hdNull = document.createElement('canvas').getContext('2d');
const HD = {
  S: 3, skip: false, ready: false, img: {}, chunks: new Map(), statics: new Map(), stamps: [], shadow: null,
  CH: 16, MAXCH: 14,
  SPAN: { grass: 176, path: 112, plaza: 128, water: 144, dirt: 128, rock: 160, mire: 176, dfloor: 128, soil: 96, wood: 64 },
  LAYER: { [TL.PATH]: 'path', [TL.PLAZA]: 'plaza', [TL.WATER]: 'water', [TL.DIRT]: 'dirt', [TL.SAND]: 'dirt', [TL.ROCK]: 'rock', [TL.MIRE]: 'mire', [TL.DFLOOR]: 'dfloor', [TL.SOIL]: 'soil', [TL.PLOT]: 'soil', [TL.BRIDGE]: 'wood', [TL.CLIFF]: 'cliff', [TL.DWALL]: 'dwall' },
  PAINTED: new Set([TL.GRASS, TL.FLOWER, TL.TREE, TL.PATH, TL.PLAZA, TL.WATER, TL.DIRT, TL.SAND, TL.ROCK, TL.MIRE, TL.DFLOOR, TL.SOIL, TL.PLOT, TL.BRIDGE, TL.CLIFF, TL.DWALL, TL.FENCE]),
  // id bangunan -> [sprite, lebar logika]
  BLD: { kuil: ['kuil', 176], guild: ['guild', 142], smith: ['smith', 112], cook: ['cook', 112], h1: ['house1', 70], h2: ['house1', 70], h3: ['house1', 86], h4: ['house1', 86], h5: ['house1', 70],
    karst_inn: ['stoneinn', 116], karst_h1: ['stonehouse', 76], corvel_serikat: ['seahall', 138], corvel_inn: ['seainn', 116], corvel_h1: ['seahouse', 76], corvel_h2: ['seahouse', 76], corvel_h3: ['seahouse', 76], mire_herb: ['herb', 116], mire_h1: ['forest', 80], kantor_tanah: ['office', 78] },
  FILES: ['rock', 'mire', 'dfloor', 'soil', 'wood', 'stoneinn', 'stonehouse', 'seahall', 'seainn', 'seahouse', 'forest', 'herb', 'office', 'shop', 'ore_tembaga', 'ore_besi', 'ore_perak', 'tent', 'torch', 'sign', 'fence', 'chest', 'm_slime1', 'm_slime2', 'm_bat1', 'm_bat2', 'm_wolf1', 'm_wolf2', 'm_golem1', 'm_golem2', 'grass', 'path', 'plaza', 'water', 'dirt', 'guild', 'kuil', 'smith', 'cook', 'house1', 'fountain', 'tree', 'cypress', 'rose', 'lamp', 'bench', 'board', 'stall1', 'stall2', 'stall3'],
  CHARS: ['hero', 'lady', 'lady_1', 'lady_2', 'merchant', 'merchant_1', 'merchant_2', 'priest', 'knight', 'farmer', 'mage', 'mage_1', 'mage_2', 'goblin'], VARS: { lady: 3, merchant: 3, mage: 3 }, BASES: ['hero', 'lady', 'merchant', 'priest', 'knight', 'farmer', 'mage', 'goblin'], CELL: 128, FOOT: 114,
  spr(b) { const m = this.BLD[b.id]; if (m) return m; if (String(b.id).startsWith('pl_')) return /Toko|Bengkel|Kedai|Shop/.test(b.name || '') ? ['shop', b.w * 20] : ['house1', b.w * 17]; return null; },
  b(b) { return this.skip && !!this.spr(b); },
  mute(f) { const a = bx, b = ox; bx = ox = hdNull; try { f(); } finally { bx = a; ox = b; } },
  flush() { for (const c of this.chunks.values()) c.width = c.height = 0; this.chunks.clear(); },
  load() {
    const one = (n, src) => new Promise(r => { const i = new Image(); i.onload = () => { this.img[n] = i; r(); }; i.onerror = () => r(); i.src = src; });
    const all = this.FILES.map(n => one(n, `assets/world/${n}.webp`)).concat(this.CHARS.map(n => one('c_' + n, `assets/chars/${n}.webp`))).concat(this.BASES.map(n => one('p_' + n, `assets/chars/p_${n}.webp`)));
    return Promise.all(all).then(() => {
      // Aset dunia tidak lengkap (mis. folder assets/ tidak ikut terupload): kembali ke grafis pixel, jangan macet.
      const miss = this.FILES.filter(n => !this.img[n]);
      if (miss.length) { console.warn('HD: aset dunia gagal dimuat, memakai grafis pixel.', miss.slice(0, 5)); this.off = true; prerender(); return; }
      this.makeStamps(); this.indexStatics(); this.ready = true; this.flush(); for (const id in ROOMS) one('r_' + id, `assets/rooms/${id}.webp`); });
  },
  makeStamps() {
    for (let k = 0; k < 4; k++) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.beginPath();
      for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 25 + 6 * Math.sin(a * 3 + k * 2) + 3 * Math.sin(a * 7 + k); x[i ? 'lineTo' : 'moveTo'](32 + Math.cos(a) * r, 32 + Math.sin(a) * r); }
      x.closePath(); x.fill(); this.stamps.push(c); }
    const s = document.createElement('canvas'); s.width = 128; s.height = 64; const x = s.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(58,40,34,.5)'); g.addColorStop(.6, 'rgba(58,40,34,.26)'); g.addColorStop(1, 'rgba(58,40,34,0)'); x.setTransform(1, 0, 0, .5, 0, 0); x.fillStyle = g; x.fillRect(0, 0, 128, 128); this.shadow = s;
  },
  pattern(c, n) { const p = c.createPattern(this.img[n], 'repeat'); if (p) p.setTransform(new DOMMatrix().scale(this.SPAN[n] / 512)); return p || '#9fb27c'; },
  add(st) { const k = (st.x / (this.CH * T) | 0) + ',' + (st.y / (this.CH * T) | 0); (this.statics.get(k) || this.statics.set(k, []).get(k)).push(st); },
  sprite(n, cx, by, w, o = {}) { const i = this.img[n]; if (!i) return; const h = w * i.naturalHeight / i.naturalWidth; this.add({ i, x: cx - w / 2, y: by - h, w, h, by, cx, sh: o.sh ?? w * .56 }); },
  indexStatics() {
    this.statics.clear();
    for (const b of BUILD) { const m = this.spr(b); if (m) this.sprite(m[0], (b.x + b.w / 2) * T, (b.y + b.h) * T + 3, m[1], { sh: m[1] * .86 }); }
    STALLS.forEach((s, i) => this.sprite('stall' + (i % 3 + 1), s.x * T + 24, s.y * T + 28, 54));
    this.sprite('fountain', 36.5 * T, 22.5 * T + 18, 72, { sh: 66 });
    for (const [x, y] of LAMPS) this.sprite('lamp', x * T + 8, y * T + 13, 7, { sh: 9 });
    this.sprite('board', 33 * T + 8, 17 * T + 13, 30, { sh: 22 });
    for (const [x, y] of this.SIGNS) this.sprite('sign', x * T + 8, y * T + 14, 20, { sh: 14 });
    for (const [x, y] of [[6, 50], [12, 49], [4, 54], [13, 54]]) this.sprite('tent', x * T + 8, y * T + 14, 42, { sh: 36 });
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (at(x, y) === TL.FENCE) { const hz = at(x - 1, y) === TL.FENCE || at(x + 1, y) === TL.FENCE; if (hz) this.sprite('fence', x * T + 8, y * T + 15, 19, { sh: 0 }); else if (this.img.fence) { const i = this.img.fence; this.add({ i, sx: 0, sw: i.naturalWidth * .18, x: x * T + 5, y: y * T - 6, w: 6, h: 22, by: y * T + 15, cx: x * T + 8, sh: 0 }); } }
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (at(x, y) === TL.TREE) { const h = hash(x, y, 77), edge = !(at(x - 1, y) === TL.TREE && at(x + 1, y) === TL.TREE && at(x, y + 1) === TL.TREE && at(x, y - 1) === TL.TREE);
      if (!edge && (x + y) % 2) continue; const cyp = h < .22, w = cyp ? 18 + h * 14 : 40 + h * 22; this.sprite(cyp ? 'cypress' : 'tree', x * T + 8 + (hash(x, y, 78) - .5) * 5, y * T + 15, w, { sh: cyp ? 16 : w * .62 }); }
  },
  chunk(ix, iy) {
    const key = ix + ',' + iy; let e = this.chunks.get(key); if (e) { this.chunks.delete(key); this.chunks.set(key, e); return e; }
    const S = this.S, CH = this.CH, px = CH * T, c = document.createElement('canvas'); c.width = c.height = px * S; const x = c.getContext('2d'), ox0 = ix * px, oy0 = iy * px;
    const m = this.mask || (this.mask = document.createElement('canvas')); if (m.width !== px * S) m.width = m.height = px * S; const mx = m.getContext('2d'); mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.clearRect(0, 0, m.width, m.height);
    x.setTransform(S, 0, 0, S, -ox0 * S, -oy0 * S); mx.setTransform(S, 0, 0, S, -ox0 * S, -oy0 * S);
    x.fillStyle = this.pattern(x, 'grass'); x.fillRect(ox0, oy0, px, px);
    const X0 = ix * CH - 2, Y0 = iy * CH - 2, X1 = X0 + CH + 4, Y1 = Y0 + CH + 4;
    for (let ty = Y0; ty < Y1; ty++) for (let tx = X0; tx < X1; tx++) { const n = vnoise(tx / 11, ty / 11, 6); x.fillStyle = n > .5 ? `rgba(226,214,140,${(n - .5) * .34})` : `rgba(58,92,60,${(.5 - n) * .36})`; x.fillRect(tx * T, ty * T, T, T); }
    const stampAll = (want, grow, solid) => { mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.clearRect(0, 0, m.width, m.height); mx.setTransform(S, 0, 0, S, -ox0 * S, -oy0 * S);
      for (let ty = Y0; ty < Y1; ty++) for (let tx = X0; tx < X1; tx++) { if (!want(at(tx, ty))) continue; if (!solid) { mx.fillStyle = '#fff'; mx.fillRect(tx * T - 1, ty * T - 1, T + 2, T + 2); } if (solid) { mx.fillStyle = '#fff'; mx.fillRect(tx * T - grow, ty * T - grow, T + grow * 2, T + grow * 2); continue; }
        const s = T * (1.62 + grow), r = hash(tx, ty, 9) * 6.28; mx.save(); mx.translate(tx * T + 8, ty * T + 8); mx.rotate(r); mx.drawImage(this.stamps[(tx * 3 + ty * 5) & 3], -s / 2, -s / 2, s, s); mx.restore(); } };
    const paint = (fill, a = 1) => { mx.globalCompositeOperation = 'source-in'; mx.fillStyle = fill; mx.fillRect(ox0 - 64, oy0 - 64, px + 128, px + 128); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = a; x.drawImage(m, 0, 0); x.globalAlpha = 1; x.setTransform(S, 0, 0, S, -ox0 * S, -oy0 * S); };
    const is = t => k => this.LAYER[k] === t;
    const has = n => { for (let ty = Y0; ty < Y1; ty++) for (let tx = X0; tx < X1; tx++) if (this.LAYER[at(tx, ty)] === n) return true; return false; };
    if (has('mire')) { stampAll(is('mire'), .2); paint(this.pattern(mx, 'mire')); }
    if (has('rock')) { stampAll(is('rock'), .2); paint(this.pattern(mx, 'rock')); }
    if (has('soil')) { stampAll(is('soil'), 0, true); paint(this.pattern(mx, 'soil')); }
    if (has('dfloor')) { stampAll(is('dfloor'), .1); paint(this.pattern(mx, 'dfloor')); }
    stampAll(is('dirt'), 0); paint(this.pattern(mx, 'dirt'));
    stampAll(is('path'), .28); paint('rgba(120,92,62,.55)'); stampAll(is('path'), 0); paint(this.pattern(mx, 'path'));
    stampAll(is('water'), .3); paint('#e8dcc4'); stampAll(is('water'), .06); paint('rgba(70,110,120,.8)'); stampAll(is('water'), 0); paint(this.pattern(mx, 'water'));
    stampAll(is('plaza'), 2.4, true); paint('rgba(84,62,44,.34)'); stampAll(is('plaza'), 1.3, true); paint('#d8b878'); stampAll(is('plaza'), 0, true); paint(this.pattern(mx, 'plaza'));
    if (has('wood')) { stampAll(is('wood'), 1.2, true); paint('rgba(60,40,28,.5)'); stampAll(is('wood'), 0, true); paint(this.pattern(mx, 'wood')); }
    if (has('cliff')) { stampAll(is('cliff'), .5, true); paint(this.pattern(mx, 'rock')); stampAll(is('cliff'), .5, true); paint('rgba(52,42,38,.46)'); }
    if (has('dwall')) { stampAll(is('dwall'), .5, true); paint(this.pattern(mx, 'dfloor')); stampAll(is('dwall'), .5, true); paint('rgba(16,12,24,.72)'); }
    for (let ty = Y0; ty < Y1; ty++) for (let tx = X0; tx < X1; tx++) if (at(tx, ty) === TL.FLOWER && this.img.rose) { const r = this.img.rose, w = 9 + hash(tx, ty, 31) * 7; x.drawImage(r, tx * T + hash(tx, ty, 32) * 7, ty * T + hash(tx, ty, 33) * 8, w, w * r.naturalHeight / r.naturalWidth); }
    e = c; this.chunks.set(key, e); while (this.chunks.size > this.MAXCH) { const k = this.chunks.keys().next().value, old = this.chunks.get(k); old.width = old.height = 0; this.chunks.delete(k); } return e;
  },
  eachVisible(cx, cy, f) { const px = this.CH * T, x0 = Math.floor((cx - 200) / px), y0 = Math.floor((cy - 200) / px), x1 = Math.floor((cx + VW + 30) / px), y1 = Math.floor((cy + VH + 30) / px);
    for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) { const l = this.statics.get(ix + ',' + iy); if (l) for (const s of l) if (s.x < cx + VW + 4 && s.x + s.w > cx - 4 && s.y < cy + VH + 4 && s.y + s.h > cy - 30) f(s); } },
  ground(cx, cy) {
    if (this.off) { ctx.imageSmoothingEnabled = false; ctx.drawImage(baseC, cx, cy, VW, VH, 0, 0, VW, VH); ctx.imageSmoothingEnabled = true; return; }
    if (!this.ready) { ctx.fillStyle = '#8fa574'; ctx.fillRect(0, 0, VW, VH); return; }
    const px = this.CH * T, x0 = Math.floor(cx / px), y0 = Math.floor(cy / px), x1 = Math.floor((cx + VW) / px), y1 = Math.floor((cy + VH) / px);
    ctx.imageSmoothingEnabled = true;
    for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) { if (ix < 0 || iy < 0) continue; ctx.drawImage(this.chunk(ix, iy), ix * px - cx, iy * px - cy, px, px); }
    ctx.imageSmoothingEnabled = false; ctx.drawImage(baseC, cx, cy, VW, VH, 0, 0, VW, VH); ctx.imageSmoothingEnabled = true;
    this.eachVisible(cx, cy, s => { if (s.sh > 0) ctx.drawImage(this.shadow, s.cx - s.sh / 2 - cx, s.by - s.sh * .13 - cy, s.sh, s.sh * .26); });
  },
  pushStatics(list, cx, cy) { if (!this.ready) return; this.eachVisible(cx, cy, s => list.push({ y: s.by, f: () => { ctx.imageSmoothingEnabled = true; if (s.sw) ctx.drawImage(s.i, s.sx, 0, s.sw, s.i.naturalHeight, s.x, s.y, s.w, s.h); else ctx.drawImage(s.i, s.x, s.y, s.w, s.h); } })); },
  // Karakter: atlas 4 baris (0 depan, 1 belakang, 2 kiri, 3 kanan) x 9 kolom (0 diam, 1-8 jalan)
  track: new WeakMap(),
  SIGNS: [[16, 12], [54, 26], [32, 39], [16, 46], [54, 15]],
  hashOf(s) { let n = 0; s = String(s); for (let i = 0; i < s.length; i++) n = n * 31 + s.charCodeAt(i) | 0; return Math.abs(n); },
  baseOf(o) { if (G && o === G.look) return o.style === 'long' ? 'lady' : 'hero'; const a = o.acc; if (a === 'veil' || a === 'halo') return 'priest'; if (a === 'helm') return 'knight'; if (a === 'hat') return 'farmer'; if (a === 'hood') return 'mage'; if (a === 'goblin' || a === 'crown') return 'goblin'; if (a === 'apron' || a === 'beard') return 'merchant'; if (o.style === 'long') return this.hashOf(o.hair + o.top) % 3 === 0 ? 'mage' : 'lady'; return ['hero', 'farmer', 'merchant', 'knight'][this.hashOf(String(o.hair) + o.top + (o.bottom || '')) % 4]; },
  key(o) { const b = this.baseOf(o), n = this.VARS[b]; if (!n) return 'c_' + b; const v = this.hashOf(o.top) % n; return v ? `c_${b}_${v}` : 'c_' + b; },
  portrait(c, o) { if (!this.ready || !o) return false; const i = this.img['p_' + this.baseOf(o)]; if (!i) return false; const cv = c.canvas, r = cv.height / cv.width; if (cv.width < 96) { cv.width = 192; cv.height = Math.round(192 * r); } c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = true; const sh = 192 / Math.max(1, r), off = (192 - Math.min(192, sh)) / 2; c.drawImage(i, 0, 0, 192, Math.min(192, 192 * r), 0, 0, cv.width, cv.height); void off; return true; },
  preview(c, o, dir) { const a = this.img[this.key(o)]; if (!a) return false; const cv = c.canvas; if (cv.width < 120) { cv.width = 240; cv.height = 320; } c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = true; const C = this.CELL; c.drawImage(a, 0, dir * C, C, C, -40, 0, 320, 320); return true; },
  mon(n, x, by, w, flip, flash) { const i = this.img[n]; if (!i) return false; const h = w * i.naturalHeight / i.naturalWidth; ctx.save(); ctx.imageSmoothingEnabled = true; ctx.translate(x, by); if (flip) ctx.scale(-1, 1); ctx.drawImage(i, -w / 2, -h, w, h); if (flash) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .5; ctx.drawImage(i, -w / 2, -h, w, h); } ctx.restore(); return true; },
  enemy(e, t, f) { const sh = (w) => { ctx.fillStyle = 'rgba(40,28,24,.26)'; ctx.beginPath(); ctx.ellipse(e.x, e.y, w, w * .3, 0, 0, 6.3); ctx.fill(); };
    if (e.t === 'slime') { const k = Math.sin(t * (e.moving ? 13 : 6)); sh(9); return this.mon(k > .55 ? 'm_slime2' : 'm_slime1', e.x, e.y + 1, k > .55 ? 24 : 20 + k, false, f); }
    if (e.t === 'bat') { sh(5); return this.mon(Math.sin(t * 22) > 0 ? 'm_bat1' : 'm_bat2', e.x, e.y - 8 + Math.sin(t * 6) * 3, 26, false, f); }
    if (e.t === 'wolf') { sh(13); return this.mon(Math.floor(t * (e.moving ? 9 : 1.5)) % 2 ? 'm_wolf2' : 'm_wolf1', e.x, e.y + 1, 40, e.dir === 2, f); }
    if (e.t === 'golem') { sh(16); return this.mon(e.st === 'wind' ? 'm_golem2' : 'm_golem1', e.x, e.y + 2, e.d && e.d.boss ? 72 : 46, e.dir === 2, f); }
    return false; },
  char(c, X, Y, o, dir, sc, flash) {
    const atlas = this.img[this.key(o)]; if (!atlas) return false;
    let t = this.track.get(o); if (!t) { t = { x: X, y: Y, ph: 0, mv: 0 }; this.track.set(o, t); } const d = Math.abs(X - t.x) + Math.abs(Y - t.y); t.x = X; t.y = Y;
    if (d > .16 && d < 12) { t.ph += d; t.mv = Game.time + .14; } const moving = Game.time < t.mv, col = moving ? 1 + (Math.floor(t.ph / 3.6) % 8) : 0, row = dir === 0 ? 0 : dir === 1 ? 1 : dir === 2 ? 2 : 3;
    const C = this.CELL, k = sc / 4, size = C * k, fx = X + 6 * sc - size / 2, fy = Y + 16 * sc - this.FOOT * k; c.imageSmoothingEnabled = true;
    c.drawImage(atlas, col * C, row * C, C, C, fx, fy, size, size);
    if (flash) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = .45; c.drawImage(atlas, col * C, row * C, C, C, fx, fy, size, size); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
    return true;
  },
};
