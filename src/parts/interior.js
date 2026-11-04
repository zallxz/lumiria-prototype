/* ------------------------------ INTERIOR ------------------------------ */
const ROOM_SOLID = new Set(['#', 'K', 'b', 'x', 'Q', 'F', 'W', 'S', 'C', 'T', 'B', 'P', 'L', 'p', 'A', 'Z', 'H', 'J', 'U']);
const ROOMS = {
  guild: { n: 'Guild Petualang', b: 'guild', floor: 'wood', wall: '#c8b48c', g: [
    '######################',
    '#Kb##x##QQ#b#x##F#bK##',
    '#....................#',
    '#....................#',
    '#.cTc.......CCCCCC...#',
    '#....................#',
    '#.cTc...RRRRRR...cTc.#',
    '#.......RRRRRR.......#',
    '#.cTc...RRRRRR...cTc.#',
    '#....................#',
    '#p..................p#',
    '#....................#',
    '##########DD##########'],
    npcs: { rowan: [14.5, 3.4, 34] }, objs: [{ id: 'board', x: 9, y: 2.3, label: 'Lihat Papan Pesanan', act: () => openPanel('board') }] },
  smith: { n: 'Bengkel Tempa', b: 'smith', floor: 'stone', wall: '#857565', g: [
    '##################',
    '#WW#x##FF##x#WW#B#',
    '#................#',
    '#BB..............#',
    '#.......AA.....BB#',
    '#................#',
    '#..TT........WW..#',
    '#................#',
    '#B..............B#',
    '#................#',
    '########DD########'],
    npcs: { tarno: [6, 4.7, 26] }, objs: [{ id: 'anvil', x: 9, y: 5.2, label: 'Tempa di landasan', act: () => openPanel('forge') }] },
  cook: { n: 'Kedai Rin', b: 'cook', floor: 'wood2', wall: '#e6d2a8', g: [
    '##################',
    '#K#x##SS##x#K#bb##',
    '#................#',
    '#..CCCCCC........#',
    '#................#',
    '#.cTc....cTc..cTc#',
    '#................#',
    '#.cTc....cTc..cTc#',
    '#................#',
    '#p..............p#',
    '########DD########'],
    npcs: { rin: [4.5, 2.6, 34] }, objs: [{ id: 'stove', x: 7, y: 2.3, label: 'Masak di kompor', act: () => openPanel('cook') }] },
  kuil: { n: 'Kuil Lumiria', b: 'kuil', floor: 'marble', wall: '#e4e6ee', g: [
    '####################',
    '#x###x###LL###x###x#',
    '#.......OOOO.......#',
    '#.......OOOO.......#',
    '#..................#',
    '#.PPPP..RRRR..PPPP.#',
    '#.......RRRR.......#',
    '#.PPPP..RRRR..PPPP.#',
    '#.......RRRR.......#',
    '#.PPPP..RRRR..PPPP.#',
    '#.......RRRR.......#',
    '#p......RRRR......p#',
    '#.......RRRR.......#',
    '#########DD#########'],
    npcs: { sela: [13.2, 3.3, 26] }, objs: [{ id: 'altar', x: 10, y: 2.6, label: 'Altar Dewi', act: () => actAltar() }] },
};
const DOORS = [];
function roomFloor(c, kind, px, py, x, y) {
  const H = s => hash(x + 300, y + 300, s);
  if (kind === 'wood' || kind === 'wood2') { const b = kind === 'wood' ? '#946538' : '#ad7a49', d = shade(b, -.22), l = shade(b, .14); c.fillStyle = b; c.fillRect(px, py, T, T);
    for (let r = 0; r < 4; r++) { c.fillStyle = d; c.fillRect(px, py + r * 4 + 3, T, 1); c.fillStyle = l; c.fillRect(px, py + r * 4, T, 1); c.fillStyle = d; c.fillRect(px + ((H(r) * 16) | 0), py + r * 4, 1, 3); } }
  else if (kind === 'stone') { c.fillStyle = '#5f5852'; c.fillRect(px, py, T, T); for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) { c.fillStyle = H(sx + sy * 2) < .4 ? '#77706a' : '#6c655e'; c.fillRect(px + sx * 8 + 1, py + sy * 8 + 1, 7, 7); c.fillStyle = '#857d76'; c.fillRect(px + sx * 8 + 1, py + sy * 8 + 1, 7, 1); } }
  else { c.fillStyle = '#e8e5de'; c.fillRect(px, py, T, T); c.fillStyle = '#d3cfc5'; c.fillRect(px, py, T, 1); c.fillRect(px, py, 1, T); if (H(1) < .3) { c.fillStyle = '#d9d5cc'; c.fillRect(px + 3, py + 5, 8, 1); c.fillRect(px + 10, py + 6, 3, 1); } }
}
function drawRoomCanvas(r) {
  const c = document.createElement('canvas'); c.width = r.w * T; c.height = r.h * T; const x2 = c.getContext('2d'); r.canvas = c;
  const g = r.g, W = r.w, H = r.h, at2 = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? '#' : g[y][x];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const ch = g[y][x], px = x * T, py = y * T;
    const border = y === 0 || x === 0 || x === W - 1 || (y === H - 1 && ch !== 'D');
    if (border) { x2.fillStyle = '#2b211c'; x2.fillRect(px, py, T, T); x2.fillStyle = '#433329'; if (y === H - 1) x2.fillRect(px, py, T, 3); if (x === 0 && y > 0) x2.fillRect(px + T - 3, py, 3, T); if (x === W - 1 && y > 0) x2.fillRect(px, py, 3, T); continue; }
    if (y === 1) { const w = r.wall; x2.fillStyle = w; x2.fillRect(px, py, T, T); x2.fillStyle = shade(w, -.1); x2.fillRect(px, py, T, 2); if (x % 2) x2.fillRect(px + 15, py + 2, 1, 10); x2.fillStyle = shade(w, -.38); x2.fillRect(px, py + 12, T, 4); x2.fillStyle = shade(w, -.2); x2.fillRect(px, py + 12, T, 1); }
    else roomFloor(x2, r.floor, px, py, x, y);
    if (y === 2) { x2.fillStyle = 'rgba(0,0,0,.18)'; x2.fillRect(px, py, T, 3); }
  }
  const lights = r.lights, fires = r.fires;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const ch = g[y][x], px = x * T, py = y * T, first = at2(x - 1, y) !== ch, R = (a, b, w, h, col) => { x2.fillStyle = col; x2.fillRect(px + a, py + b, w, h); };
    switch (ch) {
      case 'x': if (r.id === 'kuil') { R(4, 1, 8, 11, '#2a3f7a'); R(5, 2, 6, 9, '#5a8fe0'); R(7, 2, 2, 9, '#f2c46d'); R(5, 6, 6, 1, '#f2c46d'); lights.push({ x: px + 8, y: py + 14, r: 34, col: '140,190,255', a: .22 }); }
        else { R(2, 2, 12, 9, '#5a3b22'); R(3, 3, 10, 7, '#9fd0f0'); R(3, 3, 4, 3, '#dff2ff'); R(7, 3, 1, 7, '#5a3b22'); R(3, 6, 10, 1, '#5a3b22'); R(1, 10, 14, 2, '#b5814f'); lights.push({ x: px + 8, y: py + 16, r: 28, col: '255,240,210', a: .14 }); } break;
      case 'b': { const bc = r.banner || (r.id === 'guild' ? '#3d6fb0' : '#a83a3a'); R(3, 0, 10, 11, bc); R(3, 11, 4, 2, bc); R(9, 11, 4, 2, bc); R(3, 0, 10, 1, '#f2c46d'); R(7, 3, 2, 5, '#f2c46d'); R(5, 4, 6, 1, '#f2c46d'); break; }
      case 'K': R(1, 0, 14, 14, '#4a2f1c'); for (let s = 0; s < 3; s++) { R(2, 1 + s * 4, 12, 1, '#6b4428'); for (let k = 0; k < 6; k++) R(2 + k * 2, 2 + s * 4, 2, 3, ['#a83a3a', '#3d6fb0', '#e0b356', '#4a8a5a', '#8a5aa8', '#d9d2c4'][(x * 3 + y + k + s) % 6]); } break;
      case 'Q': if (first) { R(1, 1, 30, 12, '#5a3b22'); R(2, 2, 28, 10, '#c7a46c'); const ps = ['#f4ead6', '#ffe9a8', '#f4ead6', '#ffd0d0', '#e6f0ff']; for (let k = 0; k < 5; k++) { R(3 + k * 5 + (k % 2), 3 + (k % 2) * 2, 4, 5, ps[k]); R(4 + k * 5 + (k % 2), 3 + (k % 2) * 2, 1, 1, '#d24a4a'); } } break;
      case 'F': if (first) { R(1, 0, 30, 16, '#6f6253'); R(1, 0, 30, 2, '#8a7c6b'); R(8, 5, 16, 11, '#1a0f0a'); pcircle(x2, px + 16, py + 6, 8, '#1a0f0a'); R(3, 2, 2, 12, '#5d5144'); R(27, 2, 2, 12, '#5d5144');
        fires.push({ x: px + 16, y: py + 15 }); lights.push({ x: px + 16, y: py + 12, r: 70, col: '255,140,60', a: .4, fire: true }); } break;
      case 'S': if (first) { R(1, 3, 30, 13, '#5a4a3e'); R(1, 3, 30, 3, '#7a6a5c'); R(5, 8, 7, 5, '#1a0f0a'); R(20, 8, 7, 5, '#1a0f0a'); R(4, -2, 9, 6, '#3a3a44'); R(3, -2, 11, 2, '#5a5a66'); R(19, 0, 9, 4, '#8a4a2a'); R(18, 0, 11, 1, '#a86a3a');
        fires.push({ x: px + 8, y: py + 13, small: true }); fires.push({ x: px + 23, y: py + 13, small: true }); lights.push({ x: px + 16, y: py + 12, r: 46, col: '255,150,70', a: .3, fire: true }); r.steam = { x: px + 8, y: py - 3 }; } break;
      case 'W': R(2, 3, 12, 2, '#6b4a2e'); R(2, 12, 12, 2, '#6b4a2e'); for (let k = 0; k < 3; k++) { R(4 + k * 4, 0, 1, 12, '#c9d2dc'); R(4 + k * 4, 0, 1, 2, '#ffffff'); R(3 + k * 4, 10, 3, 1, '#7a5130'); } break;
      case 'B': pellipse(x2, px + 8, py + 14, 6, 2, 'rgba(0,0,0,.25)'); R(3, 2, 10, 12, '#8a5a34'); R(4, 1, 8, 1, '#a06a40'); R(3, 4, 10, 1, '#4a3a2a'); R(3, 10, 10, 1, '#4a3a2a'); R(4, 2, 2, 12, '#a06a40'); break;
      case 'C': R(0, 1, 16, 7, '#a06c40'); R(0, 1, 16, 1, '#c08a58'); R(0, 8, 16, 7, '#6b4428'); R(0, 14, 16, 2, '#4a2f1c'); if (at2(x - 1, y) !== 'C') R(0, 1, 1, 15, '#4a2f1c'); if (at2(x + 1, y) !== 'C') R(15, 1, 1, 15, '#4a2f1c');
        if ((x + y) % 3 === 0) { R(5, -1, 4, 3, '#d9d2c4'); R(6, -1, 2, 1, '#8a5a34'); } break;
      case 'T': pellipse(x2, px + 8, py + 13, 7, 2, 'rgba(0,0,0,.25)'); R(7, 8, 2, 6, '#5a3b22'); pellipse(x2, px + 8, py + 6, 7, 4, '#6b4428'); pellipse(x2, px + 8, py + 5, 7, 4, '#9a6a40'); R(5, 3, 3, 2, '#d9d2c4'); R(9, 4, 2, 2, '#e5483f'); break;
      case 'c': pcircle(x2, px + 8, py + 9, 3, '#6b4428'); pcircle(x2, px + 8, py + 8, 3, '#8a5a34'); break;
      case 'P': R(0, 3, 16, 3, '#5a3b22'); R(0, 7, 16, 5, '#7a5130'); R(0, 7, 16, 1, '#9b6b40'); R(1, 12, 2, 3, '#4a2f1c'); R(13, 12, 2, 3, '#4a2f1c'); break;
      case 'L': if (first) { R(4, 4, 24, 12, '#d7dae3'); R(4, 4, 24, 2, '#ffffff'); R(13, -10, 6, 15, '#f4f5f8'); R(17, -10, 2, 15, '#dfe2ea'); R(9, -14, 2, 8, '#f4f5f8'); R(21, -14, 2, 8, '#f4f5f8'); pcircle(x2, px + 16, py - 13, 3, '#f4f5f8'); R(11, -17, 10, 1, '#f2c46d');
        R(6, 9, 4, 4, '#f2c46d'); R(22, 9, 4, 4, '#f2c46d'); lights.push({ x: px + 16, y: py - 6, r: 80, col: '255,230,160', a: .35 }); lights.push({ x: px + 8, y: py + 8, r: 18, col: '255,200,120', a: .4, fire: true }); lights.push({ x: px + 24, y: py + 8, r: 18, col: '255,200,120', a: .4, fire: true }); } break;
      case 'R': { const e = (dx, dy) => at2(x + dx, y + dy) !== 'R'; R(0, 0, 16, 16, r.id === 'kuil' ? '#2f4f9a' : '#8a2a3a'); const gc = '#d8b45a'; if (e(0, -1)) R(0, 1, 16, 1, gc); if (e(0, 1)) R(0, 14, 16, 1, gc); if (e(-1, 0)) R(1, 0, 1, 16, gc); if (e(1, 0)) R(14, 0, 1, 16, gc); if ((x + y) % 2) R(7, 7, 2, 2, gc); break; }
      case 'p': pellipse(x2, px + 8, py + 15, 5, 1, 'rgba(0,0,0,.25)'); R(4, 9, 8, 6, '#b0623a'); R(4, 9, 8, 1, '#c97a4a'); pcircle(x2, px + 8, py + 5, 5, '#3f7f3a'); pcircle(x2, px + 6, py + 4, 2, '#5aa04a'); pcircle(x2, px + 10, py + 2, 2, '#5aa04a'); break;
      case 'A': if (first) { pellipse(x2, px + 16, py + 14, 11, 2, 'rgba(0,0,0,.3)'); R(12, 7, 8, 7, '#3d3f48'); R(4, 2, 24, 5, '#5a5e6c'); R(28, 3, 4, 2, '#5a5e6c'); R(4, 2, 24, 1, '#9aa0b0'); R(9, 12, 14, 2, '#2a2c34'); } break;
      case 'Z': { const top = at2(x, y - 1) !== 'Z', left = at2(x - 1, y) !== 'Z', bc = r.bed || '#4a7ac0'; if (top) { R(0, 2, 16, 14, '#6b4428'); R(left ? 2 : 0, 3, left ? 14 : 14, 6, '#f4efe2'); R(0, 9, 16, 7, bc); R(0, 9, 16, 1, shade(bc, .25)); }
        else { R(0, 0, 16, 13, bc); R(0, 13, 16, 3, '#4a2f1c'); R(0, 4, 16, 1, shade(bc, -.2)); } if (left) R(0, 0, 2, 16, '#4a2f1c'); if (at2(x + 1, y) !== 'Z') R(14, 0, 2, 16, '#4a2f1c'); break; }
      case 'H': pellipse(x2, px + 8, py + 14, 7, 2, 'rgba(0,0,0,.3)'); R(1, 4, 14, 10, '#6b4428'); R(2, 5, 12, 4, '#a07a3a'); R(1, 9, 14, 1, '#4a2f1c'); R(2, 10, 12, 3, '#8a5a34'); R(1, 7, 14, 1, '#f2c46d'); R(7, 8, 2, 3, '#f2c46d'); break;
      case 'J': { const first2 = at2(x - 1, y) !== 'J'; R(0, 5, 16, 4, '#a07a4a'); R(0, 5, 16, 1, '#c09a64'); R(first2 ? 1 : 13, 9, 2, 6, '#6b4428'); if (first2) { R(3, 2, 8, 3, '#d9c49a'); R(4, 1, 6, 1, '#efe2c4'); } else { R(2, 3, 9, 2, '#c9d2dc'); R(10, 2, 3, 4, '#7a5130'); } break; }
      case 'U': for (let k = 0; k < 3; k++) for (let m = 0; m < 3 - k; m++) { const cx2 = px + 4 + m * 4 + k * 2, cy2 = py + 13 - k * 4; pcircle(x2, cx2, cy2, 2, '#8a5a34'); x2.fillStyle = '#d9b07a'; x2.fillRect(cx2 - 1, cy2 - 1, 2, 2); } break;
      case 'D': R(1, 2, 14, 10, '#6a3a2a'); R(2, 4, 12, 1, '#8a5a3a'); R(2, 7, 12, 1, '#8a5a3a'); lights.push({ x: px + 8, y: py + 14, r: 26, col: '255,236,200', a: .16 }); break;
    }
  }
  if (r.id === 'kuil') { const cx = 10 * T, cy = 3 * T; r.circle = { x: cx, y: cy };
    for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; x2.fillStyle = i % 2 ? '#86b8ff' : '#e0c070'; x2.fillRect(Math.round(cx + Math.cos(a) * 28), Math.round(cy + Math.sin(a) * 13), 1, 1); x2.fillRect(Math.round(cx + Math.cos(a) * 19), Math.round(cy + Math.sin(a) * 9), 1, 1); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; x2.fillStyle = '#9fc8ff'; x2.fillRect(Math.round(cx + Math.cos(a) * 24) - 1, Math.round(cy + Math.sin(a) * 11) - 1, 2, 2); } }
}
function initRooms() {
  DOORS.length = 0;
  for (const id in ROOMS) { const r = ROOMS[id]; r.id = id; r.h = r.g.length; r.w = r.g[0].length; for (const row of r.g) if (row.length !== r.w) console.warn('Baris ruangan tidak rata:', id, row);
    r.lights = []; r.fires = []; drawRoomCanvas(r);
    const dx = r.g[r.h - 1].indexOf('D'); r.doorX = (dx + 1) * T; r.exitY = (r.h - 1) * T + 2; r.cells = [];
    for (let y = 2; y < r.h - 1; y++) for (let x = 1; x < r.w - 1; x++) if ('.R'.includes(r.g[y][x])) r.cells.push([x, y]);
    for (const o of r.objs) { const ob = Object.defineProperties({}, Object.getOwnPropertyDescriptors(o)); Object.assign(ob, { room: id, x: o.x * T, y: o.y * T, r: 8 }); OBJS.push(ob); }
    const b = BUILD.find(q => q.id === r.b); if (!b) { console.warn('ruangan tanpa bangunan', id); continue; } DOORS.push({ room: id, x: (b.x + b.w / 2) * T, y: (b.y + b.h) * T + 4 });
    OBJS.push({ id: 'door:' + id, x: (b.x + b.w / 2) * T, y: (b.y + b.h) * T + 8, r: 4, get label() { return doorLabel(id); }, act: () => tryEnter(id, true) }); }
}
const roomSolid = (room, x, y) => { const r = ROOMS[room], tx = Math.floor(x / T), ty = Math.floor(y / T); if (tx < 0 || ty < 0 || tx >= r.w || ty >= r.h) return true; return ROOM_SOLID.has(r.g[ty][tx]); };

/* ---- fasad: bangunan penting langsung dikenali ---- */
const LABELS = [
  { t: 'GUILD PETUALANG', x: 20 * T, y: 15 * T - 14, c: '#86dcff' }, { t: 'BENGKEL TEMPA', x: 20 * T, y: 26 * T - 14, c: '#ffb35a' }, { t: 'KEDAI RIN', x: 48 * T, y: 26 * T - 14, c: '#ff9a8a' },
  { t: 'KUIL LUMIRIA', x: 36.5 * T, y: 5 * T - 34, c: '#f4c869' }, { t: 'PASAR', x: 48.5 * T, y: 16 * T + 4, c: '#ffe08a' }, { t: 'PAPAN BERITA', x: 33.5 * T, y: 15 * T + 12, c: '#ffffff' },
  { t: 'LADANG GUILD', x: 61.5 * T, y: 14 * T - 2, c: '#a8f08a' }, { t: 'PETAK PENGEMBARA', x: 61.5 * T, y: 24 * T - 2, c: '#d8c49a' }, { t: 'TAMBANG KARST', x: 9 * T, y: 2 * T + 2, c: '#c9c1b0' },
  { t: 'GERBANG SELATAN', x: 36.5 * T, y: 37 * T - 8, c: '#ffd0a0' },
];
function signboard(b, icon, col) {
  const X = b.x * T, W = b.w * T, H = b.h * T, cx = X + W / 2, sy = b.y * T + Math.round(H * .5) - 20;
  ox.fillStyle = '#2a1a10'; ox.fillRect(cx - 15, sy - 1, 30, 18); ox.fillStyle = col; ox.fillRect(cx - 14, sy, 28, 16); ox.fillStyle = shade(col, .25); ox.fillRect(cx - 14, sy, 28, 2); ox.fillStyle = '#f2c46d'; ox.fillRect(cx - 15, sy + 16, 30, 1);
  const R = (x, y, w, h, c) => { ox.fillStyle = c; ox.fillRect(cx + x, sy + y, w, h); };
  if (icon === 'guild') { for (let i = 0; i < 10; i++) { R(-5 + i, 3 + i, 1, 1, '#eef4ff'); R(4 - i, 3 + i, 1, 1, '#eef4ff'); } R(-7, 12, 3, 1, '#f2c46d'); R(4, 12, 3, 1, '#f2c46d'); R(-2, 6, 4, 4, '#f2c46d'); }
  if (icon === 'anvil') { R(-8, 7, 14, 3, '#2a2c34'); R(6, 8, 3, 1, '#2a2c34'); R(-3, 10, 5, 3, '#2a2c34'); R(-7, 13, 12, 1, '#2a2c34'); R(2, 2, 2, 6, '#6b4428'); R(-1, 2, 8, 2, '#c9d2dc'); }
  if (icon === 'pot') { R(-7, 8, 14, 6, '#2a2c34'); R(-8, 7, 16, 2, '#4a4c58'); R(-4, 2, 1, 4, '#ffffff'); R(0, 1, 1, 5, '#ffffff'); R(4, 2, 1, 4, '#ffffff'); }
  ICONS_EXTRA(icon, R);
}
function drawFacades() {
  const gb = BUILD.find(b => b.id === 'guild'), sb = BUILD.find(b => b.id === 'smith'), kb = BUILD.find(b => b.id === 'cook');
  signboard(gb, 'guild', '#3d6fb0'); signboard(sb, 'anvil', '#b0622a'); signboard(kb, 'pot', '#c0463c');
  for (const b of [gb, sb, kb]) { const X = b.x * T, W = b.w * T, Y2 = (b.y + b.h) * T, cx = X + W / 2;
    for (const s of [-1, 1]) { const lx = cx + s * 11; bx.fillStyle = '#3a3a4a'; bx.fillRect(lx - 1, Y2 - 12, 2, 4); bx.fillStyle = '#ffd98a'; bx.fillRect(lx - 2, Y2 - 9, 4, 4); LIGHTS.push({ x: lx, y: Y2 - 7, r: 26, col: [255, 200, 120], lamp: true }); } }
  // Guild: tiang panji biru di depan pintu
  { const cx = (gb.x + gb.w / 2) * T, y = (gb.y + gb.h) * T + 2; for (const s of [-1, 1]) { const x = cx + s * 30; addSolid(x - 2, y + 9, 4, 3, 'pole'); bx.fillStyle = '#6b4a2e'; bx.fillRect(x - 1, y - 10, 2, 22);
      ox.fillStyle = '#3d6fb0'; ox.fillRect(x + (s > 0 ? -9 : 1), y - 10, 8, 13); ox.fillStyle = '#2c5390'; ox.fillRect(x + (s > 0 ? -9 : 1), y + 3, 3, 2); ox.fillRect(x + (s > 0 ? -4 : 6), y + 3, 3, 2); ox.fillStyle = '#f2c46d'; ox.fillRect(x + (s > 0 ? -6 : 4), y - 7, 2, 6); } }
  // Bengkel: mulut tungku menyala, landasan & rak senjata di luar
  { const X = sb.x * T, W = sb.w * T, Y = sb.y * T, H = sb.h * T, wy = Y + Math.round(H * .5);
    bx.fillStyle = '#4a3a30'; bx.fillRect(X + 6, wy + 2, 18, 16); bx.fillStyle = '#ff8a3a'; bx.fillRect(X + 9, wy + 6, 12, 10); bx.fillStyle = '#ffd27a'; bx.fillRect(X + 11, wy + 10, 8, 6); LIGHTS.push({ x: X + 15, y: wy + 12, r: 46, col: [255, 140, 60], fire: true, always: true });
    const ax = X + W - 6, ay = Y + H + 14; addSolid(ax - 7, ay - 4, 14, 4, 'anvil-out'); pellipse(bx, ax, ay, 8, 2, 'rgba(0,0,0,.25)'); bx.fillStyle = '#3d3f48'; bx.fillRect(ax - 3, ay - 6, 6, 6); bx.fillStyle = '#5a5e6c'; bx.fillRect(ax - 8, ay - 10, 15, 4); bx.fillRect(ax + 7, ay - 9, 3, 2); bx.fillStyle = '#8a90a0'; bx.fillRect(ax - 8, ay - 10, 15, 1);
    OBJS.push({ id: 'spark', x: ax, y: ay - 11, spark: true });
    const rx = X + 2, ry = Y + H + 12; addSolid(rx, ry - 3, 14, 3, 'rack'); bx.fillStyle = '#6b4a2e'; bx.fillRect(rx, ry - 14, 14, 2); bx.fillRect(rx, ry - 4, 14, 2); for (let k = 0; k < 3; k++) { bx.fillStyle = '#c9d2dc'; bx.fillRect(rx + 2 + k * 4, ry - 18, 1, 14); bx.fillStyle = '#7a5130'; bx.fillRect(rx + 1 + k * 4, ry - 6, 3, 1); } }
  // Kedai: meja luar dengan payung + papan menu
  { const X = kb.x * T, W = kb.w * T, Y2 = (kb.y + kb.h) * T, tx = X + 10, ty = Y2 + 16; addSolid(tx - 7, ty - 4, 14, 4, 'table');
    pellipse(bx, tx, ty, 9, 2, 'rgba(0,0,0,.25)'); bx.fillStyle = '#5a3b22'; bx.fillRect(tx - 1, ty - 8, 2, 8); pellipse(bx, tx, ty - 8, 7, 3, '#9a6a40'); bx.fillStyle = '#d9d2c4'; bx.fillRect(tx - 3, ty - 10, 3, 2);
    ox.fillStyle = '#5a3b22'; ox.fillRect(tx, ty - 26, 1, 18); for (let i = -10; i < 10; i += 4) { ox.fillStyle = (i / 4) % 2 ? '#f6efe2' : '#c0463c'; ox.fillRect(tx + i, ty - 27 + Math.abs(i) / 4, 4, 3); }
    const mx = X + W - 4, my = Y2 + 12; addSolid(mx - 5, my - 3, 10, 3, 'menu'); bx.fillStyle = '#5a3b22'; bx.fillRect(mx - 5, my - 14, 10, 11); bx.fillStyle = '#2a3a2a'; bx.fillRect(mx - 4, my - 13, 8, 8); bx.fillStyle = '#e8e8e0'; bx.fillRect(mx - 3, my - 11, 6, 1); bx.fillRect(mx - 3, my - 9, 4, 1); bx.fillRect(mx - 3, my - 7, 5, 1); }
}
