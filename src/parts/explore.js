/* ------------------------------ DAERAH, LAYAR LOADING & PETA BESAR ------------------------------ */
const REGIONS = {
  lumiria: { n: 'Kota Lumiria', tier: 'Aman · Bahaya ×1', c: '#86dcff', at: [36, 20], tip: 'Kuil, Guild, pasar, dan Papan Berita ada di sini. Monster tidak bisa melewati Gerbang Selatan.' },
  distrik: { n: 'Distrik Pengembara & Jalan Timur', tier: 'Aman (jalan: Kuning ×1,2)', c: '#ffe08a', at: [90, 40], tip: 'Kavling pemain diatur Kantor Tanah. Bandit berkeliaran di Jalan Timur.' },
  karst: { n: 'Kota Karst & Pegunungan', tier: 'Kota aman · gunung Kuning ×1,2', c: '#c9c1b0', at: [97, 12], tip: 'Bijih dan batu murah, makanan mahal. Bawa roti dari Lumiria.' },
  corvel: { n: 'Pelabuhan Corvel', tier: 'Aman · pajak ×0,6', c: '#8fd0ff', at: [125, 32], tip: 'Ikan, kain, dan telur murah. Perak dicari kapal seberang. Laut menjual laporan harga.' },
  mire: { n: 'Hutan Mirewood', tier: 'Kuning · Bahaya ×1,45', c: '#a8f08a', at: [107, 72], tip: 'Lebih gelap dan lebih ganas. Herba dan kayu melimpah di desa.' },
  ruins: { n: 'Reruntuhan Tirai', tier: 'ZONA MERAH · Bahaya ×1,6', c: '#c8a0ff', at: [133, 90], tip: 'Gerbang menuju instans pribadi. Bawa party dan makanan.' },
  dungeon: { n: 'Reruntuhan Tirai · Instans', tier: 'Instans · Bahaya ×1,6', c: '#c8a0ff', at: [34, 78], tip: 'Monster tidak muncul lagi sampai kamu masuk ulang. Golem menjaga peti di ruang terakhir.' },
};
function regionOf(tx, ty) { if (tx < 72 && ty >= 58) return 'dungeon'; if (tx >= 124 && ty >= 82) return 'ruins'; if (tx >= 72 && ty >= 53) return 'mire';
  if (tx < 70 || (tx < 72 && ty < 58)) return 'lumiria'; if (tx >= 112 && ty < 53) return 'corvel'; if (ty < 31) return 'karst'; return 'distrik'; }
const regionAt = (x, y) => regionOf(Math.floor(x / T), Math.floor(y / T));
const LOAD = { on: false, t: 0, dur: 0, id: null, pend: null, pendT: 0 };
function regionTick(dt) {
  if (G.room) return; const r = regionAt(G.x, G.y); if (!G.region) { G.region = r; return; }
  if (r === G.region) { LOAD.pend = null; return; }
  if (LOAD.pend !== r) { LOAD.pend = r; LOAD.pendT = 0; } LOAD.pendT += dt; if (LOAD.pendT < .3) return;
  G.region = r; LOAD.pend = null; G.seenRegion = G.seenRegion || {}; const first = !G.seenRegion[r]; G.seenRegion[r] = 1; showLoading(r, first);
}
function showLoading(r, first) { if (TEST && !LOAD.force) return; const R = REGIONS[r]; LOAD.on = true; LOAD.t = 0; LOAD.dur = first ? 1.3 : .75; LOAD.id = r;
  const el = $('#loadscr'); el.hidden = false; el.style.setProperty('--rc', R.c); $('#ld-name').textContent = tr(R.n); $('#ld-tier').textContent = tr(R.tier); $('#ld-tip').textContent = tr(R.tip);
  const city = { lumiria: 'lumiria', karst: 'karst', corvel: 'corvel', mire: 'mire' }[r]; let hot = '';
  if (city && G.cityMk) { const ids = TRADEABLE().filter(i => !ITEMS[i].q && !ITEMS[i].slot), lo = ids.map(i => [i, priceIn(i, city) / priceIn(i, 'lumiria')]).sort((a, b) => a[1] - b[1]); hot = city === 'lumiria' ? '' : `${tr('Murah di sini')}: ${lo.slice(0, 3).map(x => tr(itemName(x[0]))).join(', ')} · ${tr('Mahal di sini')}: ${lo.slice(-3).map(x => tr(itemName(x[0]))).join(', ')}`; }
  $('#ld-hot').textContent = hot; $('#ld-bar').style.width = '0%'; $('#ld-first').hidden = !first;
  const c = $('#ld-art'), x = c.getContext('2d'), [ax, ay] = R.at, sx = clamp(ax * T - 240, 0, MW * T - 480), sy = clamp(ay * T - 100, 0, MH * T - 200);
  x.imageSmoothingEnabled = false; x.clearRect(0, 0, 480, 200); x.drawImage(baseC, sx, sy, 480, 200, 0, 0, 480, 200); x.drawImage(overC, sx, sy, 480, 200, 0, 0, 480, 200);
  const g = x.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, 'rgba(6,12,28,0)'); g.addColorStop(1, 'rgba(6,12,28,.85)'); x.fillStyle = g; x.fillRect(0, 0, 480, 200);
  SFX.door(); }
function loadingTick(dt) { if (!LOAD.on) return false; LOAD.t += dt; const k = Math.min(1, LOAD.t / LOAD.dur); $('#ld-bar').style.width = Math.round(k * 100) + '%';
  if (k >= 1) { LOAD.on = false; $('#loadscr').hidden = true; if (G.seenRegion && Object.keys(G.seenRegion).length >= 7) addBadge('penjelajah'); } return true; }
// simulasi ringan: monster di daerah lain dibekukan (tidak dihitung) sampai pemain datang
const enemyActive = e => e.wave || e.sp.evb || !G || G.room || regionOf(Math.floor(e.home.x / T), Math.floor(e.home.y / T)) === G.region || Math.hypot(e.x - G.x, e.y - G.y) < 420;
/* ---- kabut jelajah (sel 5×5 petak) ---- */
const FOGW = Math.ceil(MW / 5), FOGH = Math.ceil(MH / 5);
function seenArr() { if (!G.seen || G.seen.length !== FOGW * FOGH) { const a = '0'.repeat(FOGW * FOGH).split(''); G.seen = a.join(''); } return G.seen; }
function exploreTick() { if (G.room) return; const s = seenArr().split(''), cx = Math.floor(G.x / T / 5), cy = Math.floor(G.y / T / 5); let ch = false;
  for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 3; x <= cx + 3; x++) { if (x < 0 || y < 0 || x >= FOGW || y >= FOGH) continue; const i = y * FOGW + x; if (s[i] !== '1') { s[i] = '1'; ch = true; } }
  if (ch) G.seen = s.join(''); }
const seenPct = () => { const s = seenArr(); let n = 0; for (const c of s) if (c === '1') n++; return Math.round(n / s.length * 100); };
/* ---- peta besar: zoom, geser, penanda ---- */
const MAPV = { z: 0, cx: 75, cy: 50, fog: true, pin: false, drag: null, pts: new Map() };
function mapHTML() { return `<div class="mapbar"><button class="btn sm ghost" data-do="mz" data-arg="1.4">＋</button><button class="btn sm ghost" data-do="mz" data-arg="0.7">－</button><button class="btn sm ghost" data-do="mcenter">⌖ ${'Posisiku'}</button><button class="btn sm ghost" data-do="mall">${'Seluruh peta'}</button>
  <button class="btn sm ${MAPV.fog ? 'gold' : 'ghost'}" data-do="mfog">${MAPV.fog ? 'Kabut jelajah: nyala' : 'Kabut jelajah: mati'}</button><button class="btn sm ${MAPV.pin ? 'gold' : 'ghost'}" data-do="mpin">${MAPV.pin ? 'Ketuk peta untuk pasang pin' : 'Pasang pin'}</button>
  <span class="muted" style="font-size:12px">${'Dijelajahi'} ${seenPct()}% · ${'Daerah'}: ${REGIONS[G.room ? regionAt(G.wx, G.wy) : regionAt(G.x, G.y)] ? REGIONS[G.room ? regionAt(G.wx, G.wy) : regionAt(G.x, G.y)].n : ''}</span></div>
  <div id="mapwrap"><canvas id="worldmap"></canvas></div>
  <div class="maplegend"><span><i style="background:#ff6f86"></i>${'Kamu'}</span><span><i style="background:#86dcff"></i>${'Party'}</span><span><i style="background:#ffe08a"></i>${'Kavlingmu'}</span><span><i style="background:#c08a4a"></i>${'Kereta kuda'}</span><span><i style="background:#ff5a5a"></i>${'Bos'}</span><span><i style="background:#f4c869"></i>${'Tujuan'}</span><span><i style="background:#b48aff"></i>${'Pin'}</span></div>
  <div class="note">${'Geser dengan seret, zoom dengan roda tetikus, cubit, atau tombol. Daerah yang belum pernah kamu datangi tetap terlihat tapi tertutup kabut. Ketuk pin untuk menghapusnya.'}</div>`; }
function mapFit() { const c = $('#worldmap'); if (!c) return 1; return Math.min(c.clientWidth / MW, c.clientHeight / MH); }
function drawWorldMap() {
  const c = $('#worldmap'); if (!c) return; const dpr = Math.min(2, window.devicePixelRatio || 1), W = c.clientWidth, H = c.clientHeight; if (!W) return;
  if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); } if (!MAPV.z) MAPV.z = mapFit();
  const x = c.getContext('2d'), z = MAPV.z; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.imageSmoothingEnabled = false; x.fillStyle = '#060c1c'; x.fillRect(0, 0, W, H);
  MAPV.cx = clamp(MAPV.cx, 0, MW); MAPV.cy = clamp(MAPV.cy, 0, MH); const ox = W / 2 - MAPV.cx * z, oy = H / 2 - MAPV.cy * z, P = (tx, ty) => [ox + tx * z, oy + ty * z];
  x.drawImage(miniBase, ox, oy, MW * z, MH * z);
  if (z > 6) { x.globalAlpha = .9; x.drawImage(baseC, ox, oy, MW * z, MH * z); x.drawImage(overC, ox, oy, MW * z, MH * z); x.globalAlpha = 1; }
  if (MAPV.fog) { const s = seenArr(); x.fillStyle = 'rgba(6,12,28,.62)'; for (let fy = 0; fy < FOGH; fy++) for (let fx = 0; fx < FOGW; fx++) if (s[fy * FOGW + fx] !== '1') { const [a, b] = P(fx * 5, fy * 5); x.fillRect(Math.floor(a), Math.floor(b), Math.ceil(5 * z) + 1, Math.ceil(5 * z) + 1); }
    x.strokeStyle = 'rgba(134,220,255,.08)'; x.lineWidth = 1; x.beginPath(); for (let fy = 0; fy < FOGH; fy++) for (let fx = 0; fx < FOGW; fx++) if (s[fy * FOGW + fx] !== '1') { const [a, b] = P(fx * 5, fy * 5); x.moveTo(a, b + 5 * z); x.lineTo(a + 5 * z, b); } x.stroke(); }
  const dot = (tx, ty, col, r = 4, ring) => { const [a, b] = P(tx, ty); x.fillStyle = col; x.beginPath(); x.arc(a, b, r, 0, Math.PI * 2); x.fill(); if (ring) { x.strokeStyle = '#ffffff'; x.lineWidth = 1.5; x.stroke(); } };
  for (const pl of PLOTS) if (G.land[pl.id].owner === 'me') { const [a, b] = P(pl.x, pl.y); x.strokeStyle = '#ffe08a'; x.lineWidth = 2; x.strokeRect(a, b, pl.w * z, pl.h * z); }
  for (const s of STABLES) dot(s.x, s.y, '#c08a4a', 3.5);
  for (const e of ENEMIES) if (!e.dead && e.d.boss) dot(e.x / T, e.y / T, '#ff5a5a', 4.5, true);
  const mp = markerPos(true); if (mp) dot(mp[0] / T, mp[1] / T, '#f4c869', 4, true);
  for (const p of G.pins || []) { const [a, b] = P(p.x, p.y); x.fillStyle = '#b48aff'; x.beginPath(); x.moveTo(a, b); x.lineTo(a - 5, b - 9); x.lineTo(a + 5, b - 9); x.fill(); x.beginPath(); x.arc(a, b - 10, 4, 0, Math.PI * 2); x.fill(); }
  for (const b of partyBots()) if (!b.down) dot(b.x / T, b.y / T, '#86dcff', 3);
  x.font = `bold ${clamp(Math.round(z * 3.2), 9, 14)}px ui-monospace, monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (const id in REGIONS) { if (id === 'dungeon' && !(G.seenRegion || {}).dungeon) continue; const R = REGIONS[id], [a, b] = P(R.at[0], R.at[1] - 4), t = tr(R.n).toUpperCase(), w = x.measureText(t).width + 10; x.fillStyle = 'rgba(8,16,34,.78)'; x.fillRect(a - w / 2, b - 9, w, 18); x.fillStyle = R.c; x.fillText(t, a, b + 1); }
  if (z > 4) { x.font = `bold ${Math.min(12, Math.round(z * 1.4))}px ui-monospace, monospace`; for (const L of LABELS) { const [a, b] = P(L.x / T, L.y / T); if (a < -50 || a > W + 50 || b < -10 || b > H + 10) continue; x.fillStyle = 'rgba(8,16,34,.7)'; const t = tr(L.t), w = x.measureText(t).width + 6; x.fillRect(a - w / 2, b - 7, w, 14); x.fillStyle = L.c; x.fillText(t, a, b); } }
  const px = (G.room ? G.wx : G.x) / T, py = (G.room ? G.wy : G.y) / T, [a, b] = P(px, py), pulse = 6 + Math.sin(performance.now() / 180) * 2;
  x.strokeStyle = 'rgba(255,111,134,.6)'; x.lineWidth = 2; x.beginPath(); x.arc(a, b, pulse + 4, 0, Math.PI * 2); x.stroke(); dot(px, py, '#ff6f86', 5, true);
  const [dx, dy] = DIRV[G.dir]; x.strokeStyle = '#ffffff'; x.beginPath(); x.moveTo(a, b); x.lineTo(a + dx * 11, b + dy * 11); x.stroke();
  x.fillStyle = 'rgba(8,16,34,.8)'; x.fillRect(8, H - 26, 150, 18); x.fillStyle = '#cfe8ff'; x.font = 'bold 11px ui-monospace, monospace'; x.textAlign = 'left'; x.fillText(`${tr('Zoom')} ${(z / mapFit()).toFixed(1)}× · ${Math.floor(px)},${Math.floor(py)}`, 14, H - 16);
}
function mapBind() { const c = $('#worldmap'); if (!c || c.__bound) return; c.__bound = true;
  const toTile = (e) => { const r = c.getBoundingClientRect(), z = MAPV.z; return [MAPV.cx + (e.clientX - r.left - r.width / 2) / z, MAPV.cy + (e.clientY - r.top - r.height / 2) / z]; };
  const zoomAt = (f, e) => { const before = e ? toTile(e) : [MAPV.cx, MAPV.cy], fit = mapFit(); MAPV.z = clamp(MAPV.z * f, fit, fit * 14); if (e) { const after = toTile(e); MAPV.cx += before[0] - after[0]; MAPV.cy += before[1] - after[1]; } drawWorldMap(); };
  c.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, e); }, { passive: false });
  c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); MAPV.pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); MAPV.drag = { x: e.clientX, y: e.clientY, moved: 0, d0: null }; });
  c.addEventListener('pointermove', e => { if (!MAPV.pts.has(e.pointerId) || !MAPV.drag) return; const prev = MAPV.pts.get(e.pointerId); MAPV.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (MAPV.pts.size >= 2) { const [p1, p2] = [...MAPV.pts.values()], d = Math.hypot(p1.x - p2.x, p1.y - p2.y); if (MAPV.drag.d0) zoomAt(d / MAPV.drag.d0, { clientX: (p1.x + p2.x) / 2, clientY: (p1.y + p2.y) / 2 }); MAPV.drag.d0 = d; MAPV.drag.moved = 99; return; }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y; MAPV.drag.moved += Math.abs(dx) + Math.abs(dy); MAPV.cx -= dx / MAPV.z; MAPV.cy -= dy / MAPV.z; drawWorldMap(); });
  const up = e => { if (!MAPV.pts.has(e.pointerId)) return; MAPV.pts.delete(e.pointerId); const d = MAPV.drag; if (MAPV.pts.size) return; MAPV.drag = null; if (!d || d.moved > 6) return;
    const [tx, ty] = toTile(e); G.pins = G.pins || []; const hit = G.pins.findIndex(p => Math.hypot(p.x - tx, p.y - ty) * MAPV.z < 12);
    if (hit >= 0) { G.pins.splice(hit, 1); SFX.ui(); drawWorldMap(); return; }
    if (MAPV.pin && tx >= 0 && ty >= 0 && tx < MW && ty < MH) { G.pins.push({ x: tx, y: ty }); if (G.pins.length > 12) G.pins.shift(); SFX.ui(); drawWorldMap(); } };
  c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up); }
function mapAction(a, arg) { if (a === 'mz') { const fit = mapFit(); MAPV.z = clamp(MAPV.z * +arg, fit, fit * 14); }
  if (a === 'mcenter') { MAPV.cx = (G.room ? G.wx : G.x) / T; MAPV.cy = (G.room ? G.wy : G.y) / T; MAPV.z = Math.max(MAPV.z, mapFit() * 5); }
  if (a === 'mall') { MAPV.z = mapFit(); MAPV.cx = MW / 2; MAPV.cy = MH / 2; }
  if (a === 'mfog') { MAPV.fog = !MAPV.fog; return renderPanel(); } if (a === 'mpin') { MAPV.pin = !MAPV.pin; return renderPanel(); } drawWorldMap(); }
function openMap() { openPanel('peta'); requestAnimationFrame(() => { if (!MAPV.z0) { MAPV.z0 = 1; MAPV.z = mapFit() * 3; MAPV.cx = (G.room ? G.wx : G.x) / T; MAPV.cy = (G.room ? G.wy : G.y) / T; } mapBind(); drawWorldMap(); }); }
