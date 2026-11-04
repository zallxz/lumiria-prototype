/* ------------------------------ REGION BARU ------------------------------ */
TL.MIRE = 14; TL.DWALL = 15; TL.DFLOOR = 16; SOLID_T.add(TL.DWALL);
ORE_T.batu = { hits: 2, col: '#b4aea2', col2: '#dcd8ce', respawn: 15, req: 0, diff: 4 };
Object.assign(ITEMS, {
  kayu: { n: 'Kayu', k: 'bahan', base: 6, tgt: 60, e: .5 }, batu: { n: 'Batu', k: 'bahan', base: 5, tgt: 60, e: .5 }, papan: { n: 'Papan', k: 'bahan', base: 16, tgt: 30, e: .6 },
  kapak: { n: 'Kapak', k: 'alat', base: 25, tgt: 10, e: .6 }, inti: { n: 'Inti Golem', k: 'langka', base: 180, tgt: 4, e: .8 } });
Object.assign(MON, {
  bat: { n: 'Kelelawar', hp: 4, dmg: 1, spd: 64, aggro: 72, reach: 11, wind: .3, cd: 1, coin: [2, 5], diff: 14, r: 5 },
  bandit: { n: 'Bandit', hp: 14, dmg: 3, spd: 44, aggro: 92, reach: 14, wind: .45, cd: 1.2, coin: [10, 18], diff: 30, r: 6, drop: { besi: .2 } },
  golem: { n: 'Golem Reruntuhan', hp: 160, dmg: 6, spd: 26, aggro: 120, reach: 34, wind: 1.0, cd: 2.6, coin: [120, 160], diff: 70, r: 13, boss: true, drop: { perak: 1, inti: 1 } } });
SPAWNERS.push({ t: 'bandit', x: 80, y: 31, r: 2, n: 2 }, { t: 'bandit', x: 105, y: 31, r: 2, n: 2 }, { t: 'bat', x: 80, y: 7, r: 3, n: 3 },
  { t: 'wolf', x: 118, y: 61, r: 4, n: 3 }, { t: 'wolf', x: 96, y: 86, r: 4, n: 3 }, { t: 'goblin', x: 127, y: 84, r: 3, n: 3 }, { t: 'bat', x: 138, y: 93, r: 2, n: 2 });
BUILD.push(
  { id: 'karst_inn', x: 90, y: 4, w: 6, h: 5, wall: '#cdbfa8', roof: '#7a5a4a', name: 'Penginapan Karst', chimney: true, sign: 'bed', signCol: '#a84a4a' },
  { id: 'karst_h1', x: 99, y: 5, w: 4, h: 4, wall: '#d8ccb4', roof: '#5a6a7a' },
  { id: 'corvel_serikat', x: 117, y: 20, w: 7, h: 6, wall: '#e8e0cc', roof: '#2f6f9f', name: 'Kantor Serikat Dagang', sign: 'coin', signCol: '#2f6f9f' },
  { id: 'corvel_inn', x: 127, y: 20, w: 6, h: 6, wall: '#efe4cc', roof: '#a0523a', name: 'Penginapan Corvel', chimney: true, sign: 'bed', signCol: '#a84a4a' },
  { id: 'corvel_h1', x: 116, y: 41, w: 4, h: 4, wall: '#efe8d8', roof: '#3a8a9a' }, { id: 'corvel_h2', x: 122, y: 41, w: 4, h: 4, wall: '#efe8d8', roof: '#c0703a' },
  { id: 'corvel_h3', x: 128, y: 41, w: 4, h: 4, wall: '#efe8d8', roof: '#5a7a4a' },
  { id: 'mire_herb', x: 101, y: 64, w: 6, h: 5, wall: '#b8a888', roof: '#4a6a3a', name: 'Rumah Herbalis', chimney: true, sign: 'leaf', signCol: '#4a7a3a' }, { id: 'mire_h1', x: 109, y: 64, w: 4, h: 5, wall: '#b8a888', roof: '#6a5a3a' });
STALLS.push({ x: 96, y: 11, c: '#8a6a4a' }, { x: 100, y: 11, c: '#5a7a9a' }, { x: 119, y: 29, c: '#2f8aa8' }, { x: 123, y: 29, c: '#e0a930' }, { x: 127, y: 29, c: '#2f8aa8' }, { x: 103, y: 72, c: '#6a8a3a' }, { x: 107, y: 72, c: '#8a5aa8' });
LAMPS.push([117, 28], [133, 28], [117, 37], [133, 37], [93, 17], [104, 17], [100, 70], [110, 70], [89, 42], [92, 42], [74, 33], [108, 33]);
ORES.push(['tembaga', 78, 5], ['tembaga', 82, 8], ['tembaga', 77, 13], ['tembaga', 85, 15], ['besi', 80, 18], ['besi', 84, 21], ['besi', 78, 24], ['besi', 86, 26], ['perak', 81, 27], ['perak', 76, 21],
  ['batu', 83, 4], ['batu', 87, 11], ['batu', 79, 16], ['batu', 84, 25], ['batu', 88, 28], ['batu', 5, 4], ['batu', 8, 9]);
SIGN_POS.push([114, 31], [104, 16], [98, 71], [60, 31], [133, 88]);
ZONES.unshift(
  { n: 'Reruntuhan Tirai · Instans', tier: 'merah', x0: 0, y0: 58, x1: 72, y1: 100 }, { n: 'Reruntuhan Tirai', tier: 'merah', x0: 124, y0: 82, x1: 142, y1: 98 },
  { n: 'Desa Mirewood', tier: 'aman', x0: 98, y0: 63, x1: 116, y1: 80 }, { n: 'Hutan Mirewood', tier: 'kuning', x0: 72, y0: 53, x1: 150, y1: 100 },
  { n: 'Kota Karst', tier: 'aman', x0: 88, y0: 3, x1: 107, y1: 19 }, { n: 'Pegunungan Karst', tier: 'kuning', x0: 72, y0: 0, x1: 112, y1: 31 },
  { n: 'Pelabuhan Corvel', tier: 'aman', x0: 112, y0: 3, x1: 150, y1: 53 }, { n: 'Distrik Pengembara', tier: 'aman', x0: 72, y0: 34, x1: 112, y1: 53 },
  { n: 'Jalan Timur', tier: 'kuning', x0: 70, y0: 31, x1: 112, y1: 34 });
ZONES.splice(ZONES.length - 1, 0, { n: 'Alam Liar Elnoria', tier: 'kuning', x0: 70, y0: 0, x1: 150, y1: 100 });
const SAFE_RECTS = [[0, 0, 70, 38.6], [72, 34, 40, 19], [88, 3, 19, 16], [112, 3, 38, 50], [98, 63, 18, 17]].map(([x, y, w, h]) => ({ x: x * T, y: y * T, w: w * T, h: h * T }));
const inSafe = (x, y) => SAFE_RECTS.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
const inDungeon = (x, y) => x < 72 * T && y > 58 * T;
const DUN = { rooms: [], made: false };
function genDungeon() {
  const r = mulberry32(777), order = [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [1, 1], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2]];
  DUN.rooms = [];
  for (const [c, rw] of order) { const w = 8 + ((r() * 5) | 0), h = 6 + ((r() * 3) | 0), x = 3 + c * 16 + ((r() * (14 - w)) | 0), y = 63 + rw * 11 + ((r() * (9 - h)) | 0);
    fillT(x, y, w, h, TL.DFLOOR); DUN.rooms.push({ x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) }); }
  for (let i = 1; i < DUN.rooms.length; i++) { const a = DUN.rooms[i - 1], b = DUN.rooms[i];
    fillT(Math.min(a.cx, b.cx), a.cy - 1, Math.abs(a.cx - b.cx) + 2, 3, TL.DFLOOR); fillT(b.cx - 1, Math.min(a.cy, b.cy), 3, Math.abs(a.cy - b.cy) + 2, TL.DFLOOR); }
  if (!DUN.made) { DUN.made = true; DUN.rooms.forEach((rm, i) => { if (i === 0) return; const last = i === DUN.rooms.length - 1;
    SPAWNERS.push(last ? { t: 'golem', x: rm.cx, y: rm.cy, r: 1, n: 1, respawn: 1e9, dungeon: true } : { t: i % 3 === 0 ? 'goblin' : i % 2 ? 'bat' : 'wolf', x: rm.cx, y: rm.cy, r: 2, n: i > 6 ? 3 : 2, respawn: 1e9, dungeon: true }); }); }
}
function buildRegions() {
  for (let y = 0; y < 58; y++) for (const x of [70, 71]) if (y < 32 || y > 33) setT(x, y, TL.TREE);
  for (let x = 0; x < 72; x++) { setT(x, 56, TL.TREE); setT(x, 57, TL.TREE); }
  fillT(55, 27, 3, 6, TL.PATH); fillT(55, 32, 92, 2, TL.PATH);
  // Karst
  for (let y = 0; y < 31; y++) for (let x = 72; x < 112; x++) { if (y < 2) { setT(x, y, TL.TREE); continue; } setT(x, y, vnoise(x / 5, y / 5, 21) > .78 ? TL.CLIFF : TL.ROCK); }
  fillT(88, 9, 18, 9, TL.DIRT); fillT(96, 18, 2, 14, TL.DIRT); fillT(76, 9, 13, 2, TL.DIRT); fillT(80, 3, 2, 27, TL.DIRT); fillT(76, 20, 12, 2, TL.DIRT); fillT(88, 3, 18, 6, TL.ROCK);
  for (const o of ORES) if (o[1] >= 72 && o[2] < 31) { setT(o[1], o[2], TL.ROCK); for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0]]) if (at(o[1] + dx, o[2] + dy) === TL.CLIFF) setT(o[1] + dx, o[2] + dy, TL.ROCK); }
  // Distrik
  fillT(74, 42, 35, 2, TL.PATH); fillT(90, 34, 2, 19, TL.PATH); fillT(86, 49, 4, 1, TL.PATH); fillT(87, 44, 2, 1, TL.PATH);
  for (const pl of PLOTS) { fillT(pl.x, pl.y, pl.w, pl.h, TL.GRASS); placementTiles(pl); }
  // Mirewood
  for (let x = 72; x < 150; x++) { setT(x, 53, TL.TREE); setT(x, 54, TL.TREE); }
  for (let y = 55; y < 98; y++) for (let x = 72; x < 148; x++) setT(x, y, vnoise(x / 6, y / 6, 31) > .74 ? TL.WATER : TL.MIRE);
  fillT(90, 53, 2, 17, TL.DIRT); fillT(90, 69, 24, 2, TL.DIRT); fillT(112, 69, 2, 20, TL.DIRT); fillT(112, 87, 22, 2, TL.DIRT);
  fillT(98, 63, 18, 16, TL.DIRT);
  for (let y = 82; y < 98; y++) for (let x = 124; x < 142; x++) { const d = ((x - 133) / 8) ** 2 + ((y - 90) / 6) ** 2; if (d < 1) setT(x, y, TL.DFLOOR); }
  for (const [x, y] of [[128, 87], [138, 87], [127, 93], [139, 93], [131, 85], [135, 95]]) setT(x, y, TL.CLIFF);
  // Corvel
  for (let y = 3; y < 53; y++) for (let x = 112; x < 150; x++) { const s = Math.round(Math.sin(y * .3) * 1.5); if (x >= 141 + s) setT(x, y, TL.WATER); else if (x >= 137 + s) setT(x, y, TL.SAND); }
  for (let y = 24; y < 41; y++) for (let x = 113; x < 138; x++) { const d = ((x + .5 - 125) / 11) ** 2 + ((y + .5 - 32.5) / 7.6) ** 2; if (d < 1) setT(x, y, TL.PLAZA); }
  fillT(137, 31, 10, 2, TL.BRIDGE);
  // tebing & dungeon
  for (let x = 0; x < 72; x++) for (let y = 58; y < 62; y++) setT(x, y, TL.CLIFF);
  for (let x = 0; x < 72; x++) for (let y = 62; y < 100; y++) setT(x, y, TL.DWALL);
  genDungeon();
}
function regionDeco(x, y, nearOpen, nearSpawn) {
  const t = at(x, y), h = hash(x, y, 17);
  if (t === TL.MIRE) { if (!nearOpen(x, y) && !nearSpawn && h < .2) setT(x, y, TL.TREE); return; }
  if (t !== TL.GRASS || nearOpen(x, y) || nearSpawn) return;
  if (x >= 72 && x < 112 && y >= 34 && y < 53) { if (hash(x, y, 9) < .04) setT(x, y, TL.FLOWER); return; }
  if (x >= 112 && y < 53) { if (h < .04 && !(x > 112 && x < 138 && y > 16 && y < 47)) setT(x, y, TL.TREE); else if (hash(x, y, 9) < .04) setT(x, y, TL.FLOWER); return; }
  if (h < .1) setT(x, y, TL.TREE); else if (hash(x, y, 9) < .05) setT(x, y, TL.FLOWER);
}
function drawRegionTile(c, tx, ty, t) {
  const px = tx * T, py = ty * T, H = s => hash(tx, ty, s);
  if (t === TL.DWALL) { c.fillStyle = '#1c1a22'; c.fillRect(px, py, T, T); if (at(tx, ty + 1) === TL.DFLOOR) { c.fillStyle = '#4a4552'; c.fillRect(px, py + 4, T, 12); c.fillStyle = '#5c5766'; c.fillRect(px, py + 4, T, 2);
      for (let i = 0; i < 16; i += 5) { c.fillStyle = '#3a3642'; c.fillRect(px + i + ((ty % 2) ? 2 : 0), py + 6, 1, 10); } } return true; }
  if (t === TL.DFLOOR) { c.fillStyle = '#4e4a54'; c.fillRect(px, py, T, T); for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) { c.fillStyle = H(sx + sy * 2) < .4 ? '#57535e' : '#48444f'; c.fillRect(px + sx * 8 + 1, py + sy * 8 + 1, 7, 7); }
    if (H(9) < .08) { c.fillStyle = '#6a8a5a'; c.fillRect(px + 4, py + 9, 3, 2); } return true; }
  return false;
}
function drawRegions() {
  drawFacades2(); drawPlots(); drawPlacedDecor();
  // dungeon: obor, portal keluar, peti
  for (const rm of DUN.rooms) for (const [ox2, oy2] of [[rm.x + 1, rm.y], [rm.x + rm.w - 2, rm.y]]) { const x = ox2 * T + 8, y = oy2 * T + 8; bx.fillStyle = '#5a3b22'; bx.fillRect(x - 1, y - 6, 2, 8); ox.fillStyle = '#ffb347'; ox.fillRect(x - 1, y - 10, 2, 4);
    LIGHTS.push({ x, y: y - 8, r: 54, col: [255, 150, 70], fire: true, always: true, dun: true }); OBJS.push({ id: 'torch', x, y: y - 9, torch: true }); }
  const s = DUN.rooms[0], b = DUN.rooms[DUN.rooms.length - 1];
  const px = s.cx * T + 8, py = s.cy * T + 8; pcircle(bx, px, py, 9, '#2a3f7a'); pcircle(bx, px, py, 7, '#5a8fe0'); pcircle(bx, px, py, 4, '#bfe2ff');
  LIGHTS.push({ x: px, y: py, r: 50, col: [140, 190, 255], always: true, dun: true });
  OBJS.push({ id: 'dun_exit', x: px, y: py + 10, r: 10, label: 'Keluar ke Mirewood', act: () => exitDungeon() });
  const cxp = b.cx * T + 8, cyp = b.cy * T - 8; addSolid(cxp - 8, cyp + 2, 16, 6, 'chest'); bx.fillStyle = '#5a3b22'; bx.fillRect(cxp - 8, cyp - 4, 16, 12); bx.fillStyle = '#a07a3a'; bx.fillRect(cxp - 7, cyp - 3, 14, 10); bx.fillStyle = '#f2c46d'; bx.fillRect(cxp - 8, cyp + 1, 16, 2); bx.fillRect(cxp - 1, cyp, 2, 4);
  OBJS.push({ id: 'dun_chest', x: cxp, y: cyp + 10, r: 8, label: 'Peti Reruntuhan', act: () => openDunChest() });
  // reruntuhan: gerbang ke instans
  const ex = 133 * T + 8, ey = 90 * T + 8; pcircle(bx, ex, ey, 12, '#2a2440'); pcircle(bx, ex, ey, 9, '#5a3a9a'); pcircle(bx, ex, ey, 5, '#c8a0ff');
  ox.fillStyle = '#6a6474'; ox.fillRect(ex - 16, ey - 26, 6, 26); ox.fillRect(ex + 10, ey - 26, 6, 26); ox.fillRect(ex - 18, ey - 30, 36, 6); ox.fillStyle = '#8a8494'; ox.fillRect(ex - 18, ey - 30, 36, 1);
  LIGHTS.push({ x: ex, y: ey, r: 56, col: [180, 120, 255], always: true });
  OBJS.push({ id: 'dun_enter', x: ex, y: ey + 12, r: 12, label: 'Masuk Reruntuhan Tirai (instans · Zona Merah)', act: () => enterDungeon() });
  // dermaga Corvel: perahu
  { const x = 145 * T, y = 34 * T; bx.fillStyle = '#6b4428'; bx.fillRect(x - 14, y - 2, 28, 8); bx.fillStyle = '#8a5a34'; bx.fillRect(x - 12, y - 2, 24, 3); ox.fillStyle = '#f4efe2'; ox.fillRect(x - 1, y - 22, 1, 20); for (let i = 0; i < 12; i++) ox.fillRect(x, y - 21 + i, Math.max(1, 10 - i), 1); }
  // kereta kuda
  for (const s2 of STABLES) { const x = s2.x * T, y = s2.y * T; addSolid(x - 10, y - 4, 20, 4, 'stable'); pellipse(bx, x, y, 12, 2, 'rgba(0,0,0,.25)');
    bx.fillStyle = '#6b4428'; bx.fillRect(x - 10, y - 12, 14, 8); bx.fillStyle = '#8a5a34'; bx.fillRect(x - 10, y - 12, 14, 2); pcircle(bx, x - 7, y - 3, 3, '#3a2a1a'); pcircle(bx, x + 1, y - 3, 3, '#3a2a1a');
    bx.fillStyle = '#8a5a3a'; bx.fillRect(x + 5, y - 10, 7, 5); bx.fillRect(x + 10, y - 13, 3, 4); bx.fillStyle = '#5a3a2a'; bx.fillRect(x + 6, y - 5, 1, 4); bx.fillRect(x + 10, y - 5, 1, 4);
    OBJS.push({ id: 'stable:' + s2.city, x, y, r: 10, label: 'Kereta Kuda · perjalanan cepat', act: () => talkStable(s2.city) }); }
}
const STABLES = [{ city: 'lumiria', x: 61, y: 31.2 }, { city: 'karst', x: 103, y: 17.4 }, { city: 'corvel', x: 115, y: 30.6 }, { city: 'mirewood', x: 98, y: 72.4 }];

function worldDark() { if (!G || G.room) return nightAmt(); if (inDungeon(G.x, G.y)) return .78; const n = nightAmt(); if (G.x > 72 * T && G.y > 54 * T) return Math.max(n, .4); return n; }
LABELS.push({ t: 'TOKO TUKANG', x: 22.5 * T, y: 3 * T - 14, c: '#e8b070' }, { t: 'KOTA KARST', x: 97 * T, y: 9 * T + 2, c: '#c9c1b0' }, { t: 'PEGUNUNGAN KARST', x: 82 * T, y: 3 * T, c: '#a8a090' },
  { t: 'PELABUHAN CORVEL', x: 125 * T, y: 25 * T + 4, c: '#8fd0ff' }, { t: 'SERIKAT DAGANG', x: 120.5 * T, y: 20 * T - 14, c: '#8fd0ff' }, { t: 'DISTRIK PENGEMBARA', x: 90.5 * T, y: 33 * T + 10, c: '#ffe08a' },
  { t: 'KANTOR TANAH', x: 88 * T, y: 45 * T - 14, c: '#86dcff' }, { t: 'DESA MIREWOOD', x: 107 * T, y: 63 * T, c: '#a8f08a' }, { t: 'RERUNTUHAN TIRAI', x: 133 * T, y: 85 * T - 12, c: '#c8a0ff' },
  { t: 'JALAN TIMUR', x: 66 * T, y: 31 * T + 6, c: '#ffd0a0' });
function drawFacades2() {
  for (const b of BUILD) { if (!b.sign || ['guild', 'smith', 'cook'].includes(b.id) || b.dyn) continue; signboard(b, b.sign, b.signCol || shade(b.roof, -.1));
    const cx = (b.x + b.w / 2) * T, Y2 = (b.y + b.h) * T; for (const s2 of [-1, 1]) { const lx = cx + s2 * 11; bx.fillStyle = '#3a3a4a'; bx.fillRect(lx - 1, Y2 - 12, 2, 4); bx.fillStyle = '#ffd98a'; bx.fillRect(lx - 2, Y2 - 9, 4, 4); LIGHTS.push({ x: lx, y: Y2 - 7, r: 24, col: [255, 200, 120], lamp: true }); } }
}
function drawPlots() {
  for (const pl of PLOTS) { const X = pl.x * T, Y = pl.y * T, W = pl.w * T, H = pl.h * T;
    bx.strokeStyle = pl.k === 'com' ? 'rgba(255,224,138,.55)' : 'rgba(168,240,138,.5)'; bx.setLineDash([3, 3]); bx.lineWidth = 1; bx.strokeRect(X + .5, Y + .5, W - 1, H - 1); bx.setLineDash([]);
    for (const [cx, cy] of [[X + 2, Y + 3], [X + W - 3, Y + 3], [X + 2, Y + H - 2], [X + W - 3, Y + H - 2]]) { bx.fillStyle = '#6b4428'; bx.fillRect(cx - 1, cy - 6, 2, 6); bx.fillStyle = pl.k === 'com' ? '#e0a930' : '#7ac05a'; bx.fillRect(cx - 1, cy - 7, 2, 2); }
    const sx = pl.sx * T + 8, sy = pl.sy * T + 12; addSolid(sx - 2, sy - 3, 4, 3, 'plotsign'); bx.fillStyle = '#5a3b22'; bx.fillRect(sx - 1, sy - 14, 2, 14); bx.fillStyle = '#6b4428'; bx.fillRect(sx - 8, sy - 18, 16, 8);
    bx.fillStyle = pl.k === 'com' ? '#e0a930' : '#7ac05a'; bx.fillRect(sx - 7, sy - 17, 14, 6); ptext(bx, pl.id, sx, sy - 14, '#1b2033', 6, 'center');
    OBJS.push({ id: 'plot:' + pl.id, x: sx, y: sy, r: 8, get label() { return plotLabel(pl); }, act: () => openPanel('plot', pl.id) }); }
}
Object.assign(ITEMS, {
  ikan: { n: 'Ikan Laut', k: 'makanan', base: 9, tgt: 40, e: .6, heal: 3 }, herba: { n: 'Herba Hutan', k: 'bahan', base: 12, tgt: 30, e: .6 },
  teh_herba: { n: 'Teh Herba', k: 'makanan', base: 34, tgt: 15, e: .6, heal: 14 }, ikan_bakar: { n: 'Ikan Bakar', k: 'makanan', base: 26, tgt: 20, e: .55, heal: 10 },
  linggis: { n: 'Linggis Senyap', k: 'gelap', base: 40 } });
RECIPES.cook.push({ out: 'teh_herba', need: { herba: 2 }, diff: 10 }, { out: 'ikan_bakar', need: { ikan: 1, minyak: 1 }, diff: 8 });
RECIPES.bench = [{ out: 'papan', need: { kayu: 2 }, diff: 6 }, { out: 'kapak', need: { besi: 1, kayu: 2 }, diff: 14 }];
const BANDIT_LOOK = { skin: '#d9a57c', hair: '#2a2a2a', top: '#5a3a3a', top2: '#3a2a2a', bottom: '#3a3a3a', acc: 'hood', eye: '#c03a3a' };
function drawBat(e, t, f) { const x = e.x | 0, y = (e.y - 10 + Math.sin(t * 6) * 3) | 0, w = Math.sin(t * 22) > 0 ? 1 : 0, col = f ? '#ffffff' : '#3a2a4a';
  pellipse(ctx, e.x, e.y, 4, 1, 'rgba(0,0,0,.25)'); ctx.fillStyle = col; ctx.fillRect(x - 2, y - 2, 4, 4); ctx.fillRect(x - 2, y - 4, 1, 2); ctx.fillRect(x + 1, y - 4, 1, 2);
  if (w) { ctx.fillRect(x - 7, y - 4, 5, 2); ctx.fillRect(x + 2, y - 4, 5, 2); ctx.fillRect(x - 8, y - 6, 2, 2); ctx.fillRect(x + 6, y - 6, 2, 2); } else { ctx.fillRect(x - 7, y, 5, 2); ctx.fillRect(x + 2, y, 5, 2); ctx.fillRect(x - 8, y + 2, 2, 2); ctx.fillRect(x + 6, y + 2, 2, 2); }
  ctx.fillStyle = '#ff5a5a'; ctx.fillRect(x - 1, y - 1, 1, 1); ctx.fillRect(x + 1, y - 1, 1, 1); }
function drawGolem(e, t, f) { const x = e.x | 0, y = e.y | 0, st = e.moving ? Math.round(Math.sin(t * 5) * 2) : 0, c1 = f ? '#ffffff' : '#7a7468', c2 = f ? '#ffffff' : '#5a554c', c3 = f ? '#ffffff' : '#9a9488';
  pellipse(ctx, x, y, 14, 4, 'rgba(0,0,0,.35)');
  ctx.fillStyle = c2; ctx.fillRect(x - 10, y - 10 + st, 7, 10 - st); ctx.fillRect(x + 3, y - 10 - st, 7, 10 + st);
  ctx.fillStyle = c1; ctx.fillRect(x - 13, y - 30, 26, 20); ctx.fillStyle = c3; ctx.fillRect(x - 13, y - 30, 26, 3); ctx.fillStyle = '#6a8a5a'; ctx.fillRect(x - 11, y - 27, 6, 2); ctx.fillRect(x + 4, y - 14, 5, 2);
  ctx.fillStyle = c2; ctx.fillRect(x - 20, y - 28 - st, 7, 18); ctx.fillRect(x + 13, y - 28 + st, 7, 18); ctx.fillStyle = c3; ctx.fillRect(x - 20, y - 12 - st, 7, 4); ctx.fillRect(x + 13, y - 12 + st, 7, 4);
  ctx.fillStyle = c1; ctx.fillRect(x - 7, y - 40, 14, 10); ctx.fillStyle = c3; ctx.fillRect(x - 7, y - 40, 14, 2);
  const gl = e.st === 'wind' ? '#ff5a3a' : '#7fe8ff'; ctx.fillStyle = gl; ctx.fillRect(x - 5, y - 36, 3, 2); ctx.fillRect(x + 2, y - 36, 3, 2); ctx.fillRect(x - 2, y - 22, 4, 4);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = e.st === 'wind' ? 'rgba(255,90,58,.35)' : 'rgba(127,232,255,.25)'; ctx.fillRect(x - 6, y - 37, 12, 4); ctx.globalCompositeOperation = 'source-over'; }
