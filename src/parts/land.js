/* ------------------------------ TANAH, BANGUNAN & AKSES ------------------------------ */
const PLOTS = [
  { id: 'C1', k: 'com', sz: 'L', x: 75, y: 35, w: 7, h: 6 }, { id: 'C2', k: 'com', sz: 'M', x: 83, y: 35, w: 6, h: 6 },
  { id: 'C3', k: 'com', sz: 'M', x: 93, y: 35, w: 6, h: 6 }, { id: 'C4', k: 'com', sz: 'L', x: 100, y: 35, w: 7, h: 6 },
  { id: 'R1', k: 'res', sz: 'S', x: 74, y: 45, w: 5, h: 5 }, { id: 'R2', k: 'res', sz: 'S', x: 80, y: 45, w: 5, h: 5 },
  { id: 'R3', k: 'res', sz: 'S', x: 93, y: 45, w: 5, h: 5 }, { id: 'R4', k: 'res', sz: 'M', x: 99, y: 45, w: 6, h: 6 }, { id: 'R5', k: 'res', sz: 'S', x: 106, y: 45, w: 5, h: 5 },
].map(p => ({ ...p, sx: p.x, sy: p.k === 'com' ? p.y + p.h : p.y - 1 }));
const PLOT_BY = Object.fromEntries(PLOTS.map(p => [p.id, p]));
const SZ = { S: { n: 'Kecil', rent: 6, base: 200, bmax: 2 }, M: { n: 'Sedang', rent: 10, base: 300, bmax: 3 }, L: { n: 'Besar', rent: 14, base: 450, bmax: 4 } };
const CAT = {
  rumah: { n: 'Rumah', w: 3, h: 3, cost: { kayu: 8, batu: 6, papan: 4 }, coin: 40, room: 'warga', wall: '#efe2c8', roof: '#a85f8c', chimney: true, d: 'Kasur untuk istirahat & menyimpan, peti penyimpanan pribadi.' },
  toko: { n: 'Toko', w: 4, h: 3, cost: { kayu: 6, batu: 4, papan: 6, besi: 1 }, coin: 60, room: 'toko', com: true, wall: '#f0e1c4', roof: '#e0a930', sign: 'coin', signCol: '#c0902a', d: 'Pajang barang, pembeli AI datang tiap jam. Hanya di kavling niaga.' },
  bengkel: { n: 'Bengkel', w: 4, h: 3, cost: { kayu: 4, batu: 6, besi: 2 }, coin: 40, room: 'bengkel', wall: '#cdb79a', roof: '#8a4b3a', chimney: true, sign: 'anvil', signCol: '#b0622a', d: 'Landasan tempa + meja kerja pribadi.' },
  dapur: { n: 'Dapur', w: 3, h: 3, cost: { kayu: 4, batu: 4, papan: 2 }, coin: 30, room: 'dapur', wall: '#f0e1c4', roof: '#c06a3c', chimney: true, d: 'Kompor pribadi untuk memasak.' },
  gudang: { n: 'Gudang', w: 2, h: 3, cost: { kayu: 6, papan: 2 }, coin: 20, room: 'gudang', wall: '#c8a878', roof: '#6a5a3a', d: 'Akses peti penyimpanan bersama.' },
  pagar: { n: 'Pagar', w: 1, h: 1, cost: { kayu: 1 }, coin: 0, decor: true, d: 'Membatasi jalan. Bisa dilewati? Tidak.' },
  lampu: { n: 'Lampu Taman', w: 1, h: 1, cost: { kayu: 1, besi: 1 }, coin: 0, decor: true, d: 'Menyala saat malam. Dekorasi menaikkan pengunjung toko.' },
  bangku: { n: 'Bangku', w: 1, h: 1, cost: { kayu: 2 }, coin: 0, decor: true, d: 'Tempat duduk. Dekorasi.' },
  pohon: { n: 'Pohon', w: 1, h: 1, cost: {}, coin: 5, decor: true, tile: TL.TREE, d: 'Bibit pohon dewasa.' },
  bunga: { n: 'Petak Bunga', w: 1, h: 1, cost: {}, coin: 2, decor: true, tile: TL.FLOWER, d: 'Dekorasi murah.' },
  jalan: { n: 'Jalan Batu', w: 1, h: 1, cost: { batu: 1 }, coin: 0, decor: true, tile: TL.PATH, d: 'Ubin jalan setapak.' },
  ladang: { n: 'Petak Tanam', w: 1, h: 1, cost: {}, coin: 1, decor: true, tile: TL.PLOT, d: 'Tanah garapan untuk menanam benih.' },
};
const ownerName = st => st.owner === 'me' ? G.name : st.owner === 'guild' ? 'Guild (dijual)' : st.owner == null ? 'Lowong' : BOTS[st.owner] ? BOTS[st.owner].name : '?';
const myPlots = k => PLOTS.filter(p => G.land[p.id].owner === 'me' && (!k || p.k === k));
const plotAt = (x, y) => { const tx = x / T, ty = y / T; return PLOTS.find(p => tx >= p.x && tx < p.x + p.w && ty >= p.y && ty < p.y + p.h); };
function botOf(role, n = 0) { const l = BOTS.filter(b => b.role === role); return l[n % l.length].i; }
function initLand() {
  const d = dayOf(), L = {}, own = (bi, place, ex) => ({ owner: bi, last: d, since: d - 10, place: place.map(([t, x, y]) => ({ t, x, y })), decl: 0, protect: 0, unpaid: 0, ...ex });
  L.C1 = own(botOf('pedagang', 0), [['toko', 76, 36], ['lampu', 75, 40], ['bunga', 80, 40], ['bunga', 81, 40], ['lampu', 81, 36]], { decl: 520 });
  L.C2 = own(botOf('pandai', 0), [['bengkel', 84, 36], ['jalan', 85, 39], ['jalan', 85, 40]], { decl: 340 });
  L.C3 = { owner: 'guild', last: d, place: [], decl: 300, protect: 0, unpaid: 0 };
  L.C4 = own(botOf('pedagang', 1), [['toko', 101, 36], ['bunga', 100, 40]], { decl: 480, last: d - 27, idle: true });
  L.R1 = own(botOf('petani', 0), [['rumah', 75, 45], ['ladang', 78, 47], ['ladang', 78, 48], ['pohon', 74, 49]]);
  L.R2 = { owner: null, last: d, place: [], decl: 0, protect: 0, unpaid: 0 };
  L.R3 = own(botOf('sosial', 0), [['rumah', 94, 45], ['pohon', 93, 49], ['bunga', 97, 49]]);
  L.R4 = { owner: null, last: d, place: [], decl: 0, protect: 0, unpaid: 0 };
  L.R5 = own(botOf('penambang', 0), [['rumah', 107, 45]], { last: d - 29, idle: true });
  G.land = L; G.lotto = false; G.lottoPity = 0; G.stash = {}; G.guildKas = 0;
}
/* ---- penempatan → peta ---- */
function placementTiles(pl) { if (!G || !G.land) return; for (const p of G.land[pl.id].place) { const c = CAT[p.t]; if (c.tile !== undefined) setT(p.x, p.y, c.tile); } }
function syncPlacements() {
  for (let i = BUILD.length - 1; i >= 0; i--) if (BUILD[i].dyn) BUILD.splice(i, 1);
  for (const id in ROOMS) if (ROOMS[id].dyn) delete ROOMS[id];
  if (!G || !G.land) return;
  for (const pl of PLOTS) { const st = G.land[pl.id]; st.place.forEach((p, i) => { const c = CAT[p.t]; if (!c.room) return; const bid = `pl_${pl.id}_${i}`, rid = `pl:${pl.id}:${i}`, me = st.owner === 'me';
    BUILD.push({ id: bid, dyn: true, x: p.x, y: p.y, w: c.w, h: c.h, wall: c.wall, roof: c.roof, chimney: c.chimney, sign: c.sign, signCol: c.signCol, name: c.n });
    mkRoom(rid, c.room, { n: me ? `${c.n}mu · ${pl.id}` : `${c.n} ${ownerName(st)}`, b: bid, dyn: true, plot: pl.id, pi: i, owner: st.owner, ownerName: ownerName(st), lock: me ? 'own' : p.t === 'toko' ? 'shop' : 'own', gembok: !!p.gembok }); }); }
}
function drawPlacedDecor() {
  if (!G || !G.land) return;
  for (const pl of PLOTS) for (const p of G.land[pl.id].place) { const x = p.x * T + 8, y = p.y * T + 12;
    if (p.t === 'lampu') drawLamp(p.x, p.y);
    else if (p.t === 'pagar') { addSolid(p.x * T + 1, y - 4, 14, 4, 'pagar'); bx.fillStyle = '#7a5130'; bx.fillRect(p.x * T + 2, y - 12, 2, 12); bx.fillRect(p.x * T + 12, y - 12, 2, 12); bx.fillStyle = '#a0703f'; bx.fillRect(p.x * T, y - 10, 16, 2); bx.fillRect(p.x * T, y - 5, 16, 2); }
    else if (p.t === 'bangku') { addSolid(x - 7, y - 4, 14, 4, 'bangku'); pellipse(bx, x, y, 8, 2, 'rgba(0,0,0,.25)'); bx.fillStyle = '#6b4428'; bx.fillRect(x - 7, y - 4, 2, 4); bx.fillRect(x + 5, y - 4, 2, 4); bx.fillStyle = '#a0703f'; bx.fillRect(x - 8, y - 7, 16, 3); bx.fillRect(x - 8, y - 12, 16, 2); }
  }
}
function rebuildWorld() { const t0 = performance.now(); syncPlacements(); prerender(); initRooms(); initNav(); rebuildWorld.ms = performance.now() - t0; }
/* ---- mode bangun ---- */
const BM = { on: false, t: null, plot: null, x: 0, y: 0, ok: false, why: '' };
const costText = c => [...Object.entries(c.cost).map(([i, n]) => `${n} ${itemName(i)}`), ...(c.coin ? [`${coinCost(c)} koin`] : [])].join(' · ') || 'Gratis';
const coinCost = c => Math.ceil(c.coin * (1 - G.sk.pertukangan / 250));
const canAfford = c => Object.entries(c.cost).every(([i, n]) => cnt(i) >= n) && G.coin >= coinCost(c);
function footprints(st, skip = -1) { const occ = new Set(); st.place.forEach((p, i) => { if (i === skip) return; const c = CAT[p.t];
  for (let y = p.y; y < p.y + c.h; y++) for (let x = p.x; x < p.x + c.w; x++) occ.add(x + ',' + y); if (c.room) for (const dx of doorCols(p.x, c.w)) occ.add(dx + ',' + (p.y + c.h)); }); return occ; }
const doorCols = (x, w) => [...new Set([Math.floor(x + w / 2 - .5), Math.floor(x + w / 2)])];
function canPlace(pl, t, x, y) {
  const c = CAT[t], st = G.land[pl.id];
  if (st.owner !== 'me') return [false, 'bukan kavlingmu'];
  if (x < pl.x || y < pl.y || x + c.w > pl.x + pl.w || y + c.h > pl.y + pl.h) return [false, 'di luar kavling'];
  if (c.com && pl.k !== 'com') return [false, 'toko hanya di kavling niaga'];
  if (c.room && st.place.filter(p => CAT[p.t].room).length >= SZ[pl.sz].bmax) return [false, `batas ${SZ[pl.sz].bmax} bangunan untuk kavling ${SZ[pl.sz].n.toLowerCase()}`];
  if (c.decor && st.place.filter(p => CAT[p.t].decor).length >= 30) return [false, 'batas 30 dekorasi'];
  const occ = footprints(st), ptx = Math.floor(G.x / T), pty = Math.floor((G.y - 2) / T);
  for (let yy = y; yy < y + c.h; yy++) for (let xx = x; xx < x + c.w; xx++) { if (occ.has(xx + ',' + yy)) return [false, 'bertabrakan dengan bangunan lain']; if (xx === ptx && yy === pty) return [false, 'kamu berdiri di sana']; }
  if (c.room) for (const dx of doorCols(x, c.w)) { const dy = y + c.h; if (occ.has(dx + ',' + dy) || SOLID_T.has(at(dx, dy))) return [false, 'depan pintu terhalang']; }
  if (!canAfford(c)) return [false, 'butuh ' + costText(c)];
  return [true, ''];
}
function startBuild(pid, t) { closePanel(); BM.on = true; BM.t = t; BM.plot = pid; toast(`Mode bangun: ${CAT[t].n}`, `${costText(CAT[t])} · hadap ke tempat kosong lalu tekan E · Esc selesai`); }
function bmUpdate() { const c = CAT[BM.t], pl = PLOT_BY[BM.plot], [dx, dy] = facingVec(), px = G.x / T, py = (G.y - 2) / T;
  const cx = px + dx * (c.w / 2 + .55), cy = py + dy * (c.h / 2 + .55); BM.x = Math.round(cx - c.w / 2); BM.y = Math.round(cy - c.h / 2); [BM.ok, BM.why] = canPlace(pl, BM.t, BM.x, BM.y); }
function placeConfirm() {
  const c = CAT[BM.t], pl = PLOT_BY[BM.plot], st = G.land[pl.id]; bmUpdate(); if (!BM.ok) return;
  for (const [i, n] of Object.entries(c.cost)) take(i, n); G.coin -= coinCost(c);
  st.place.push({ t: BM.t, x: BM.x, y: BM.y }); st.last = dayOf(); train('pertukangan', c.room ? 22 : 6); rebuildWorld();
  SFX.clang(); FX.burst((BM.x + c.w / 2) * T, (BM.y + c.h / 2) * T, c.room ? 40 : 10, '#e8d6b2', 70, .6, 120); FX.shake(c.room ? .2 : .05);
  toast(`${c.n} dibangun`, c.room ? 'Masuk lewat pintunya. Kelola di papan kavling.' : '');
  if (c.room) { BM.on = false; if (!G.flags_firstBuild) { G.flags_firstBuild = true; chat('Sistem', `${G.name} membangun ${c.n.toLowerCase()} pertamanya di Distrik Pengembara`, 'sys'); } }
  if (c.room && !canAfford(c)) BM.on = false;
}
function demolish(pid, i) { const st = G.land[pid], p = st.place[i], c = CAT[p.t]; if (!p) return;
  if (G.room && ROOMS[G.room] && ROOMS[G.room].plot === pid) return toast('Keluar dulu dari bangunan');
  const back = refundOf([p]); for (const [id, n] of Object.entries(back)) give(id, n, true); st.place.splice(i, 1); st.last = dayOf(); rebuildWorld(); SFX.ui();
  toast(`${c.n} dibongkar`, Object.keys(back).length ? 'Dikembalikan: ' + Object.entries(back).map(([id, n]) => `${n} ${itemName(id)}`).join(', ') : ''); }
function refundOf(list) { const back = {}; for (const p of list) { const c = CAT[p.t]; for (const [i, n] of Object.entries(c.cost)) { const k = Math.floor(n * .5); if (k) back[i] = (back[i] || 0) + k; }
  if (p.shop) for (const [id, s] of Object.entries(p.shop.items)) if (s.n) back[id] = (back[id] || 0) + s.n; } return back; }
function drawGhost() {
  const c = CAT[BM.t]; bmUpdate(); const X = BM.x * T, Y = BM.y * T, W = c.w * T, H = c.h * T, a = .35 + Math.sin(Game.time * 6) * .1;
  ctx.fillStyle = BM.ok ? `rgba(120,255,160,${a})` : `rgba(255,90,90,${a})`; ctx.fillRect(X, Y, W, H); ctx.strokeStyle = BM.ok ? '#9fffcf' : '#ff8a8a'; ctx.lineWidth = 1; ctx.strokeRect(X + .5, Y + .5, W - 1, H - 1);
  if (c.room) for (const dx of doorCols(BM.x, c.w)) { ctx.fillStyle = 'rgba(255,230,140,.5)'; ctx.fillRect(dx * T + 2, (BM.y + c.h) * T + 2, T - 4, T - 4); }
  const pl = PLOT_BY[BM.plot]; ctx.strokeStyle = 'rgba(255,224,138,.9)'; ctx.setLineDash([4, 3]); ctx.strokeRect(pl.x * T + .5, pl.y * T + .5, pl.w * T - 1, pl.h * T - 1); ctx.setLineDash([]);
}
/* ---- aturan sewa & pajak ---- */
function rentOf(pl) { const st = G.land[pl.id]; if (pl.k === 'res') return SZ[pl.sz].rent;
  const mine = st.owner === 'me' ? myPlots('com').sort((a, b) => G.land[a.id].since - G.land[b.id].since) : [pl]; const idx = Math.max(0, mine.indexOf(pl));
  return Math.ceil(st.decl * .02) * (idx === 0 ? 1 : 2); }
function fairValue(pl) { const st = G.land[pl.id]; let v = SZ[pl.sz].base; for (const p of st.place) { const c = CAT[p.t]; v += c.coin + Object.entries(c.cost).reduce((s, [i, n]) => s + n * (ITEMS[i].base || 5), 0) * .6; } return Math.round(v); }
function plotLabel(pl) { const st = G.land ? G.land[pl.id] : null; if (!st) return 'Papan kavling';
  if (st.auction) return `Kavling ${pl.id} · DILELANG · tawaran ${fmt(st.auction.top || st.auction.reserve)}`;
  if (st.owner === 'me') return `Kavlingmu ${pl.id} · kelola & bangun`; if (st.owner === null) return `Kavling ${pl.id} · lowong · lotre rumah`; if (st.owner === 'guild') return `Kavling ${pl.id} · dijual Guild ${fmt(st.decl)}`;
  return `Kavling ${pl.id} · ${ownerName(st)}${pl.k === 'com' ? ` · nilai ${fmt(st.decl)}` : ''}`; }
function landDaily(d) {
  const msgs = [];
  for (const pl of PLOTS) { const st = G.land[pl.id];
    if (st.auction) { if (st.auction.day < d) resolveAuction(pl, st, msgs); continue; }
    if (st.owner === 'me') { const r = rentOf(pl); if (G.coin >= r) { G.coin -= r; G.guildKas += r; st.unpaid = 0; msgs.push(`Sewa ${pl.id} −${r}`); } else { st.unpaid++; toast(`Sewa ${pl.id} tertunggak (${st.unpaid}/3)`, 'Tiga hari menunggak = kavling disita dan dilelang', 'event'); }
      if (st.unpaid >= 3) { startAuction(pl, st, 'sewa menunggak 3 hari', true); continue; }
      const idle = d - st.last; if (idle === 23) toast(`Kavling ${pl.id} jarang dikunjungi`, 'Tidak aktif 30 hari = dilelang Guild. Kunjungi atau bangun sesuatu.', 'event');
      if (idle >= 30) { startAuction(pl, st, 'tidak aktif 30 hari', true); continue; }
      if (pl.k === 'com' && d > st.protect && st.decl < fairValue(pl) * .75 && rand() < .35) { aiBuyout(pl, st); continue; } }
    else if (typeof st.owner === 'number') { if (!st.idle) st.last = d; else if (rand() < .1) { st.idle = false; st.last = d; }
      if (d - st.last >= 30) { startAuction(pl, st, 'pemilik tidak aktif 30 hari'); continue; }
      if (!st.idle && rand() < .03) st.idle = true;
      if (pl.k === 'res' && !st.idle && rand() < .03) { chat('Kantor Tanah', `${ownerName(st)} pindah ke ${pick(['Corvel', 'Karst', 'Mirewood'])}. Kavling ${pl.id} kembali ke lotre.`, 'sys'); Object.assign(st, { owner: null, place: [], decl: 0 }); } }
    else if (st.owner === 'guild') { if (rand() < .12) { const bi = pick(BOTS.filter(b => b.role === 'pedagang' || b.role === 'pandai')).i; st.owner = bi; st.since = d; st.last = d; st.decl = Math.round(SZ[pl.sz].base * rnd(1.1, 1.5)); st.place = [{ t: 'toko', x: pl.x + 1, y: pl.y + 1 }];
      chat('Kantor Tanah', `${BOTS[bi].name} membeli kavling ${pl.id} dari Guild`, 'sys'); } } }
  lottery(d); burglary(d);
  if (msgs.length) chat('Kantor Tanah', msgs.join(' · '), 'sys');
  syncPlacementsSoon = true;
}
let syncPlacementsSoon = false;
function startAuction(pl, st, why, mine) {
  if (mine) { const back = refundOf(st.place); for (const [id, n] of Object.entries(back)) give(id, n, true);
    toast(`Kavling ${pl.id} disita Guild`, `Alasan: ${why}. 50% bahan bangunan dikembalikan ke tasmu.`, 'event'); }
  const reserve = Math.round(SZ[pl.sz].base * (pl.k === 'res' ? .4 : .8)), bidders = [];
  for (let k = 0; k < irnd(1, 3); k++) bidders.push({ bi: pick(BOTS).i, max: Math.round(reserve * rnd(1.05, 1.7)) });
  st.auction = { day: dayOf(), reserve, top: 0, by: null, bidders, why, mine: 0 }; st.owner = 'guild'; st.place = []; st.unpaid = 0;
  chat('Kantor Tanah', `LELANG: kavling ${pl.id} (${why}). Harga awal ${reserve} koin, ditutup pergantian hari.`, 'sys');
}
function bidAuction(pid) { const st = G.land[pid], a = st.auction; if (!a) return; const pl = PLOT_BY[pid];
  if (a.by === 'me') return toast('Kamu sudah penawar tertinggi');
  if (pl.k === 'res' && myPlots('res').length) return toast('Batas 1 kavling hunian', 'Lepas kavling hunianmu dulu');
  if (pl.k === 'com' && myPlots('com').length >= 2) return toast('Batas 2 kavling niaga');
  const next = a.top ? Math.ceil(a.top * 1.1) : a.reserve; if (G.coin < next) return toast('Koin kurang', `Butuh ${next} koin (ditahan Guild sampai lelang selesai)`);
  G.coin -= next; a.top = next; a.by = 'me'; a.mine = next; SFX.coin(); toast(`Tawaranmu ${next} koin`, 'Koin ditahan. Dikembalikan kalau kamu disalip.', 'good'); }
function landHourly() {
  for (const pl of PLOTS) { const a = G.land[pl.id].auction; if (!a) continue;
    for (const b of a.bidders) { const next = a.top ? Math.ceil(a.top * 1.1) : a.reserve; if (a.by !== b.bi && next <= b.max && rand() < .35) {
      if (a.by === 'me') { G.coin += a.mine; a.mine = 0; toast(`Tawaranmu di ${pl.id} disalip`, `${BOTS[b.bi].name} menawar ${next}. Koinmu dikembalikan.`, 'event'); }
      a.top = next; a.by = b.bi; break; } } }
  shopTick();
}
function resolveAuction(pl, st, msgs) { const a = st.auction, d = dayOf(); st.auction = null;
  if (a.by === 'me') { Object.assign(st, { owner: 'me', since: d, last: d, decl: pl.k === 'com' ? a.top : 0, protect: d + 3, place: [], unpaid: 0 }); G.guildKas += a.top;
    toast(`Lelang ${pl.id} dimenangkan!`, `Kavling ${pl.k === 'com' ? 'niaga' : 'hunian'} ${SZ[pl.sz].n.toLowerCase()} milikmu. Terlindung dari beli-paksa 3 hari.`, 'good'); SFX.quest(); }
  else if (typeof a.by === 'number') { Object.assign(st, { owner: a.by, since: d, last: d, decl: pl.k === 'com' ? a.top : 0, protect: d + 3, idle: false, place: [{ t: pl.k === 'com' ? 'toko' : 'rumah', x: pl.x + 1, y: pl.y + 1 }] });
    msgs.push(`${BOTS[a.by].name} menang lelang ${pl.id} (${a.top})`); }
  else { st.owner = pl.k === 'com' ? 'guild' : null; st.decl = SZ[pl.sz].base; msgs.push(`Lelang ${pl.id} tanpa penawar`); }
}
function lottery(d) {
  const open = PLOTS.filter(p => p.k === 'res' && G.land[p.id].owner === null && !G.land[p.id].auction); if (!open.length) return;
  let won = false;
  for (const pl of open) { const st = G.land[pl.id], me = G.lotto && !won && !myPlots('res').length ? 1 + G.lottoPity : 0, lastFree = PLOTS.filter(p => p.k === 'res' && G.land[p.id].owner === null && !G.land[p.id].auction).length === 1, ai = me && lastFree ? 0 : irnd(0, 5); if (!ai && !me) continue;
    if (rand() * (ai + me) < me) { won = true; G.lotto = false; G.lottoPity = 0; Object.assign(st, { owner: 'me', since: d, last: d, protect: d + 3, place: [], unpaid: 0 });
      toast(`Kamu memenangkan lotre rumah ${pl.id}!`, `Kavling hunian ${SZ[pl.sz].n.toLowerCase()} · sewa ${SZ[pl.sz].rent} koin/hari. Bangun lewat papan kavling.`, 'good'); SFX.quest(); chat('Kantor Tanah', `Lotre rumah: ${pl.id} jatuh ke ${G.name}`, 'sys'); }
    else if (ai) { const bi = pick(BOTS).i; Object.assign(st, { owner: bi, since: d, last: d, idle: false, place: [{ t: 'rumah', x: pl.x + 1, y: pl.y }] }); chat('Kantor Tanah', `Lotre rumah: ${pl.id} jatuh ke ${BOTS[bi].name}`, 'sys'); } }
  if (G.lotto && !won) { G.lottoPity = Math.min(6, G.lottoPity + 1); toast('Belum beruntung di lotre rumah', `Tiket tambahan besok: ${1 + G.lottoPity} (pity)`); }
}
function aiBuyout(pl, st) { const bi = pick(BOTS.filter(b => b.role === 'pedagang' || b.role === 'kurir')).i, price = st.decl; G.coin += price; const back = refundOf(st.place); for (const [id, n] of Object.entries(back)) give(id, n, true);
  Object.assign(st, { owner: bi, since: dayOf(), last: dayOf(), decl: Math.round(fairValue(pl) * 1.15), protect: dayOf() + 3, place: [{ t: 'toko', x: pl.x + 1, y: pl.y + 1 }] });
  toast(`Kavling ${pl.id} dibeli paksa!`, `${BOTS[bi].name} membayar nilai deklarasimu (${price} koin). Aturan Harberger: nilai terlalu rendah = siapa pun boleh membeli. 50% bahan kembali.`, 'event');
  chat('Kantor Tanah', `${BOTS[bi].name} membeli paksa kavling ${pl.id} milik ${G.name} seharga ${price}`, 'sys'); }
function buyPlot(pid) { const pl = PLOT_BY[pid], st = G.land[pid], d = dayOf();
  if (pl.k !== 'com' || st.owner === 'me' || st.owner === null || st.auction) return;
  if (myPlots('com').length >= 2) return toast('Batas 2 kavling niaga', 'Aturan anti-monopoli Guild');
  if (st.protect > d) return toast('Kavling masih terlindung', `Pemilik baru terlindung sampai Hari ${st.protect}`);
  const fee = st.owner === 'guild' ? 0 : Math.ceil(st.decl * .05), total = st.decl + fee; if (G.coin < total) return toast('Koin kurang', `Butuh ${total} koin`);
  G.coin -= total; G.guildKas += fee; const prev = st.owner; Object.assign(st, { owner: 'me', since: d, last: d, protect: d + 3, place: [], unpaid: 0 }); st.idle = false; rebuildWorld(); SFX.quest();
  toast(`Kavling ${pid} milikmu`, prev === 'guild' ? 'Dibeli dari Guild.' : `Dibeli paksa dari ${BOTS[prev].name} (+5% biaya Guild). Bangunannya dibongkar.`, 'good');
  if (typeof prev === 'number') { botSay(BOTS[prev], pick([`yah kavling ${pid}-ku dibeli ${G.name}...`, 'harusnya nilai deklarasiku kunaikkan', 'ok fair, aturan Harberger']), true); } }
function releasePlot(pid) { const st = G.land[pid]; const back = refundOf(st.place); for (const [id, n] of Object.entries(back)) give(id, n, true);
  Object.assign(st, { owner: PLOT_BY[pid].k === 'com' ? 'guild' : null, place: [], decl: SZ[PLOT_BY[pid].sz].base }); rebuildWorld(); toast(`Kavling ${pid} dilepas`, '50% bahan bangunan kembali ke tas'); }
/* ---- toko pemain ---- */
function shopOf(rid) { const r = ROOMS[rid]; if (!r || r.plot == null) return null; const p = G.land[r.plot].place[r.pi]; if (!p.shop) p.shop = { items: {}, till: 0, sold: 0 }; return p.shop; }
const decorCount = pl => G.land[pl.id].place.filter(p => CAT[p.t].decor).length;
function shopTick() {
  for (const pl of myPlots()) { const st = G.land[pl.id]; for (const p of st.place) { if (p.t !== 'toko' || !p.shop) continue;
    const traffic = (pl.k === 'com' ? 1 : .5) * (pl.sz === 'L' ? 1.2 : 1) * (1 + Math.min(.4, decorCount(pl) * .04)) * (nightAmt() > .5 ? .3 : 1);
    for (const [id, s] of Object.entries(p.shop.items)) { if (!s.n) continue; const ch = clamp(traffic * .5 * (1.6 - s.mult), 0, .92);
      let k = 0; while (k < 3 && s.n > 0 && rand() < ch) { k++; s.n--; const got = Math.round(priceIn(id, 'lumiria') * s.mult); p.shop.till += got; p.shop.sold++; if (G.market[id]) G.market[id].stock += 1; }
      if (k) train('berdagang', 6); } } }
}
/* ---- peti, kasur, penginapan ---- */
function chestLabel(id) { const r = ROOMS[id]; if (r.owner === 'me') return 'Peti penyimpanan'; if (G.thief && G.thief.room === id) return 'Geledah peti!'; return `Peti milik ${r.ownerName || 'penghuni'}`; }
function bedLabel(id) { return ROOMS[id].owner === 'me' ? 'Tidur (pulih penuh, simpan, lewati malam)' : 'Kasur orang lain'; }
function counterLabel(id) { return ROOMS[id].owner === 'me' ? 'Kelola toko' : 'Belanja di toko ini'; }
function actChest(id) { const r = ROOMS[id];
  if (r.owner === 'me') return openPanel('stash', id);
  if (G.thief && G.thief.room === id) return lootChest(id);
  say([{ t: `Peti ini milik ${r.ownerName || 'penghuni rumah'}.`, choices: [{ t: 'Biarkan', f: () => {} }, { t: 'Ambil diam-diam (Bayangan)', f: () => sneakTake(id) }] }]); }
function lootChest(id) { const r = ROOMS[id]; if (r.robbedDay === dayOf()) return toast('Peti sudah kosong');
  r.robbedDay = dayOf(); const k = irnd(15, 45); G.coin += k; const it = pick(['besi', 'perak', 'roti', 'telur', 'papan', 'tembaga']); give(it, irnd(1, 2), true); train('bayangan', 18); SFX.coin();
  toast('Peti digeledah', `+${k} koin, +${itemName(it)} · cepat kabur!`, 'event'); }
function sneakTake(id) { const r = ROOMS[id]; if (r.robbedDay === dayOf()) return toast('Penghuninya masih waspada');
  r.robbedDay = dayOf(); addAlign(-5); train('bayangan', 16);
  if (rand() < .35 + G.sk.bayangan * .01 + (G.align <= -30 ? .1 : 0)) { const k = irnd(8, 25); G.coin += k; SFX.coin(); toast('Tidak ada yang melihat', `+${k} koin`); }
  else { const fine = Math.min(G.coin, 30); G.coin -= fine; G.rep = Math.max(0, G.rep - 1); addAlign(-4); SFX.hurt(); FX.shake(.2); toast('Ketahuan penghuni!', `Denda ${fine} koin · reputasi −1`, 'event'); chat('Penjaga', `${G.name} ketahuan mengambil barang di ${r.n}`, 'sys'); exitRoom(); } }
function actBed(id) { if (ROOMS[id].owner !== 'me') return toast('Bukan kasurmu'); rest(); }
function actInn() { if (G.coin < 8) return toast('Koin kurang', 'Menginap 8 koin'); G.coin -= 8; rest(); }
function rest() { G.hp = G.hpMax; G.mp = mpMax(); if (G.comp) { G.cHp = compMax(); G.cDown = 0; } const h = hourOf(); let skip = 0; if (h >= 19 || h < 5) skip = Math.ceil(((h >= 19 ? 30 : 6) - h)); if (skip > 0) advanceTime(skip);
  save(); SFX.quest(); fade(); toast('Istirahat penuh', `${skip ? `Tidur ${skip} jam · ` : ''}HP & mana pulih · tersimpan`, 'good'); }
function advanceTime(h) { for (let i = 0; i < h; i++) { G.clock += HOUR_S; econTick(); cityTick(); landHourly(); } }
/* ---- akses bangunan & membobol ---- */
function roomAccess(id) { const r = ROOMS[id]; if (!r || !r.lock || r.lock === 'open' || r.owner === 'me') return 'ok'; const h = hourNow();
  if (r.lock === 'hours') return h >= 7 && h < 19 ? 'ok' : 'locked'; if (r.lock === 'shop') return h >= 8 && h < 20 ? 'ok' : 'locked'; return 'locked'; }
function doorLabel(id) { const r = ROOMS[id]; return roomAccess(id) === 'ok' ? 'Masuk: ' + r.n : `Terkunci: ${r.n}`; }
function tryEnter(id, viaAct) { if (roomAccess(id) === 'ok') return enterRoom(id);
  if (!viaAct) { if (G.clock - (G.lockMsg ?? -9) > 3) { G.lockMsg = G.clock; toast('Pintu terkunci', `${ROOMS[id].n} · tekan E di depan pintu untuk pilihan`); } return; }
  const r = ROOMS[id]; say([{ t: `${r.n} terkunci${r.lock === 'hours' ? ' (buka 07.00–19.00)' : r.lock === 'shop' ? ' (buka 08.00–20.00)' : ''}. Pemilik: ${r.ownerName || '—'}.${r.gembok ? ' Ada gembok besi.' : ''}`,
    choices: [{ t: 'Pergi', f: () => {} }, { t: `Bobol kunci (Bayangan · ${Math.round(breakChance(id) * 100)}%)`, f: () => breakIn(id) }] }]); }
const breakChance = id => clamp(.2 + G.sk.bayangan * .012 + (nightAmt() > .5 ? .15 : 0) + (cnt('linggis') ? .15 : 0) - (ROOMS[id].gembok ? .35 : 0), .05, .85);
function breakIn(id) { const r = ROOMS[id];
  if (r.robbedDay === dayOf()) return toast('Penghuni masih waspada', 'Rumah ini baru dibobol hari ini');
  if (G.clock < (G.breakCd || 0)) return toast('Terlalu berisik', 'Tunggu sebentar sebelum mencoba lagi');
  train('bayangan', 25); addAlign(-6);
  if (rand() < breakChance(id)) { G.thief = { room: id, t: 22 }; enterRoom(id); Snd.play({ noise: true, f0: 2400, f1: 600, dur: .12, vol: .12, hp: true }); toast('Kunci terbuka', 'Geledah peti, lalu kabur sebelum 22 detik habis', 'event'); return; }
  G.breakCd = G.clock + 20;
  if (rand() < .55) caughtThief(`mencoba membobol ${r.n}`, 60); else toast('Gagal membobol', 'Tidak ada yang mendengar... kali ini'); }
function caughtThief(what, fine) { const f = Math.min(G.coin, fine); G.coin -= f; G.rep = Math.max(0, G.rep - 2); addAlign(-6); SFX.hurt(); FX.shake(.3); G.thief = null;
  toast('Tertangkap penjaga!', `Denda ${f} koin · reputasi −2`, 'event'); chat('Penjaga', `${G.name} tertangkap ${what}`, 'sys'); for (let k = 0; k < 2; k++) botSay(pick(BOTS), pick([`awas ada maling, ${G.name}!`, `${G.name} maling rumah ckck`, 'kunci rumah kalian woy']), true); }
function thiefTick(dt) { if (!G.thief) return; if (G.room !== G.thief.room) { const r = ROOMS[G.thief.room]; G.thief = null; chat('Kabar Kota', `${r ? r.n : 'Sebuah rumah'} kebobolan. Pelakunya belum diketahui.`, 'nws'); return; }
  G.thief.t -= dt; if (G.thief.t <= 0) { const r = ROOMS[G.room]; exitRoom(); caughtThief(`di dalam ${r.n}`, 80); } }
function burglary() { for (const pl of myPlots()) G.land[pl.id].place.forEach(p => { if (!['rumah', 'gudang'].includes(p.t)) return; if (rand() > (p.gembok ? .03 : .14)) return;
  const ids = Object.keys(G.stash).filter(i => G.stash[i] > 0); if (!ids.length) return; const id = pick(ids), n = Math.max(1, Math.floor(G.stash[id] * .25)); G.stash[id] -= n; if (G.stash[id] <= 0) delete G.stash[id];
  const thief = pick(BOTS.filter(b => b.role === 'bayangan')); toast(`${CAT[p.t].n}mu kebobolan semalam!`, `${n} ${itemName(id)} hilang dari peti. Pasang gembok di peti untuk mengurangi risiko.`, 'event');
  chat('Kabar Kota', `${CAT[p.t].n} milik ${G.name} di ${pl.id} kebobolan`, 'nws'); if (rand() < .4) botSay(thief, 'malam yang sukses hehe', true); }); }
/* ---- panel tanah ---- */
function plotHTML() {
  const pl = PLOT_BY[Panel.pid], st = G.land[pl.id], d = dayOf(), me = st.owner === 'me', sz = SZ[pl.sz];
  const head = `<div class="card"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b class="px" style="font-size:18px">Kavling ${pl.id}</b><span class="badge ${pl.k === 'com' ? 'off' : 'me'}">${pl.k === 'com' ? 'NIAGA' : 'HUNIAN'}</span><span class="badge p">${sz.n.toUpperCase()} · ${pl.w}×${pl.h} petak</span></div>
    <div class="stat"><span>Pemilik</span><span>${esc(ownerName(st))}</span></div>${pl.k === 'com' && st.owner !== null ? `<div class="stat"><span>Nilai deklarasi (Harberger)</span><span>${fmt(st.decl)} koin</span></div>` : ''}
    <div class="stat"><span>Sewa / pajak harian</span><span>${pl.k === 'com' ? (st.owner === 'me' ? rentOf(pl) : Math.ceil(st.decl * .02)) + ' koin (2% nilai)' : sz.rent + ' koin'}</span></div>
    ${typeof st.owner === 'number' || me ? `<div class="stat"><span>Terakhir aktif</span><span>Hari ${st.last} (${d - st.last} hari lalu)</span></div>` : ''}${st.protect > d ? `<div class="stat"><span>Terlindung dari beli-paksa</span><span>s.d. Hari ${st.protect}</span></div>` : ''}</div>`;
  if (Panel.tab === 'bangun' && me) return head + `<h5>Katalog bangunan & dekorasi</h5>` + Object.entries(CAT).map(([id, c]) => { const ok = canAfford(c) && (!c.com || pl.k === 'com');
    return `<div class="rec"><span class="tag" style="min-width:34px;text-align:center">${c.w}×${c.h}</span><div style="min-width:0"><b>${c.n}</b>${c.com ? '<span class="bumi">NIAGA</span>' : ''}<div class="note" style="margin:0">${c.d}</div><div class="ings">${Object.entries(c.cost).map(([i, n]) => `<span class="${cnt(i) >= n ? '' : 'lack'}">${img(i)} ${cnt(i)}/${n}</span>`).join('')}${c.coin ? `<span class="${G.coin >= coinCost(c) ? '' : 'lack'}">${coinCost(c)} koin</span>` : ''}</div></div>
      <button class="btn sm ${ok ? 'gold' : ''}" data-do="build" data-arg="${id}" ${ok ? '' : 'disabled'}>Pasang</button></div>`; }).join('') + `<div class="note">Kayu, batu, papan & kapak ada di Toko Tukang Bagas (utara Kuil). Kayu juga bisa ditebang pakai kapak, batu ditambang. Skill Pertukangan memotong biaya koin.</div>`;
  let body = '';
  if (st.auction) { const a = st.auction, next = a.top ? Math.ceil(a.top * 1.1) : a.reserve;
    body = `<div class="card"><span class="badge off">LELANG GUILD</span><div class="stat"><span>Alasan</span><span>${a.why}</span></div><div class="stat"><span>Tawaran tertinggi</span><span>${a.top ? `${fmt(a.top)} · ${a.by === 'me' ? 'KAMU' : esc(BOTS[a.by].name)}` : 'belum ada'}</span></div><div class="stat"><span>Ditutup</span><span>pergantian ke Hari ${a.day + 1}</span></div>
      <button class="btn gold" data-do="bid" data-arg="${pl.id}" ${a.by === 'me' || G.coin < next ? 'disabled' : ''}>Tawar ${fmt(next)} koin</button><div class="note">Koin ditahan Guild dan dikembalikan bila disalip. Penawar AI menaikkan tawaran tiap jam sampai batas pribadinya.</div></div>`; }
  else if (me) { const bl = st.place.map((p, i) => `<div class="stat"><span>${CAT[p.t].n} <span class="muted">(${p.x - pl.x},${p.y - pl.y})</span></span><span><button class="btn sm ghost" data-do="demolish" data-arg="${pl.id}:${i}">Bongkar</button></span></div>`).join('');
    body = `${pl.k === 'com' ? `<div class="card"><h5 style="margin-top:0">Deklarasi nilai (pajak Harberger)</h5><div class="note" style="margin:0">Kamu sendiri yang menentukan nilai kavling. Pajak = 2% nilai per hari. Tapi siapa pun boleh membeli paksa seharga nilai itu. Nilai wajar sekarang ±${fmt(fairValue(pl))}. Di bawah 75% nilai wajar, pedagang AI mulai mengincar.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button class="btn sm ghost" data-do="decl" data-arg="${pl.id}:-50">−50</button><button class="btn sm ghost" data-do="decl" data-arg="${pl.id}:-10">−10</button><b style="align-self:center;min-width:70px;text-align:center">${fmt(st.decl)}</b><button class="btn sm ghost" data-do="decl" data-arg="${pl.id}:10">+10</button><button class="btn sm ghost" data-do="decl" data-arg="${pl.id}:50">+50</button></div></div>` : ''}
      <div class="card"><h5 style="margin-top:0">Bangunan & dekorasi (${st.place.length})</h5>${bl || '<div class="note" style="margin:0">Masih kosong. Buka tab Bangun.</div>'}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn gold" data-do="tab" data-arg="bangun">Bangun di sini</button><button class="btn ghost" data-do="release" data-arg="${pl.id}">Lepas kavling</button></div>`; }
  else if (st.owner === null) body = `<div class="card"><span class="badge me">LOTRE RUMAH</span><div class="note">Kavling hunian dibagikan lewat undian tiap pergantian hari, bukan dijual, supaya tidak bisa diborong. Satu orang satu kavling hunian. Kalah undian menambah tiket besok (pity, maks 7 tiket).</div>
    <div class="stat"><span>Status pendaftaranmu</span><span>${myPlots('res').length ? 'Sudah punya kavling hunian' : G.lotto ? `Terdaftar · ${1 + G.lottoPity} tiket` : 'Belum terdaftar'}</span></div>
    <button class="btn gold" data-do="lotto" ${G.lotto || myPlots('res').length || G.coin < 5 ? 'disabled' : ''}>Daftar lotre · 5 koin</button></div>`;
  else if (pl.k === 'com') { const fee = st.owner === 'guild' ? 0 : Math.ceil(st.decl * .05), lock = st.protect > d;
    body = `<div class="card"><div class="note" style="margin-top:0">${st.owner === 'guild' ? 'Kavling niaga milik Guild, dijual seharga nilai dasar.' : `Aturan Harberger: kamu boleh membeli paksa kavling ini seharga nilai yang dideklarasikan pemiliknya, ditambah 5% biaya Guild. Bangunannya dibongkar.`}</div>
      <button class="btn gold" data-do="buyplot" data-arg="${pl.id}" ${lock || G.coin < st.decl + fee || myPlots('com').length >= 2 ? 'disabled' : ''}>${lock ? `Terlindung s.d. Hari ${st.protect}` : `Beli · ${fmt(st.decl + fee)} koin`}</button></div>`; }
  else body = `<div class="card"><div class="note" style="margin:0">Kavling hunian tidak bisa dibeli paksa. Kalau pemiliknya tidak aktif 30 hari, Guild akan melelangnya.${st.idle ? ` <b style="color:var(--warn)">Pemilik sudah ${d - st.last} hari tidak aktif.</b>` : ''}</div></div>`;
  return head + body;
}
function landHTML() {
  const d = dayOf(), rows = PLOTS.map(pl => { const st = G.land[pl.id];
    return `<div class="stat"><span><b>${pl.id}</b> <span class="muted">${pl.k === 'com' ? 'Niaga' : 'Hunian'} ${SZ[pl.sz].n}</span></span><span>${st.auction ? `<span style="color:var(--warn)">Lelang · ${fmt(st.auction.top || st.auction.reserve)}</span>` : esc(ownerName(st))}${typeof st.owner === 'number' && d - st.last > 20 ? ` <span style="color:var(--warn)">(${d - st.last} hr tidak aktif)</span>` : ''}</span></div>`; }).join('');
  const mine = myPlots(); const bill = mine.reduce((s, p) => s + rentOf(p), 0);
  return `<div class="grid2"><div class="card"><h5 style="margin-top:0">Daftar kavling Distrik</h5>${rows}</div><div class="card"><h5 style="margin-top:0">Milikmu</h5>${mine.map(p => `<div class="stat"><span>${p.id}</span><span>sewa ${rentOf(p)}/hari</span></div>`).join('') || '<div class="note" style="margin:0">Belum punya kavling.</div>'}
    <div class="stat"><span>Tagihan harian</span><span>${bill} koin</span></div><div class="stat"><span>Lotre rumah</span><span>${G.lotto ? `${1 + G.lottoPity} tiket` : 'tidak ikut'}</span></div><div class="stat"><span>Kas Guild (dari sewa)</span><span>${fmt(G.guildKas)}</span></div>
    <button class="btn sm gold" data-do="lotto" ${G.lotto || myPlots('res').length || G.coin < 5 || !PLOTS.some(p => p.k === 'res' && G.land[p.id].owner === null) ? 'disabled' : ''}>Daftar lotre rumah · 5 koin</button></div></div>
    <h5>Aturan tanah Lumiria</h5><div class="note" style="margin-top:0">1. Kavling hunian (S/M) dibagi lewat lotre harian dengan tiket pity; sewa tetap 6/10 koin per hari. Maks 1 per orang. Kavling hunian terakhir yang tersisa hanya diundi untuk pengembara yang belum punya rumah (kuota pendatang).<br>2. Kavling niaga (M/L) memakai pajak Harberger: pemilik menetapkan nilai sendiri, bayar 2%/hari, dan siapa pun boleh membeli paksa seharga nilai itu (+5% biaya Guild). Maks 2 per orang; kavling niaga kedua bayar pajak ×2.<br>3. Pemilik baru terlindung dari beli-paksa 3 hari.<br>4. Tidak aktif 30 hari atau menunggak sewa 3 hari → kavling disita & dilelang Guild; 50% bahan bangunan dikembalikan.<br>5. Bangunan orang lain terkunci. Rumah warga buka 07–19, toko pemain 08–20. Membobol = jalan Bayangan, risiko denda.<br>6. Hasil sewa masuk Kas Guild untuk perawatan jalan dan hadiah event.</div>`;
}
function stashHTML() { const inv = Object.keys(G.inv).filter(i => cnt(i) > 0 && ITEMS[i]), st = Object.keys(G.stash).filter(i => G.stash[i] > 0), r = ROOMS[Panel.rid], p = r && r.plot != null ? G.land[r.plot].place[r.pi] : null;
  const row = (id, n, a) => `<div class="rec">${img(id)}<div><b>${itemName(id)}</b> <span class="muted">×${n}</span></div><div class="act" style="display:flex;gap:4px"><button class="btn sm" data-do="${a}" data-arg="${id}:1">1</button><button class="btn sm ghost" data-do="${a}" data-arg="${id}:all">Semua</button></div></div>`;
  return `<div class="grid2"><div><h5 style="margin-top:0">Tas</h5>${inv.map(i => row(i, cnt(i), 'put')).join('') || '<div class="note">Kosong.</div>'}</div><div><h5 style="margin-top:0">Peti</h5>${st.map(i => row(i, G.stash[i], 'takeout')).join('') || '<div class="note">Kosong.</div>'}</div></div>
    <div class="note">Peti dipakai bersama oleh semua rumah & gudangmu. Isi peti tidak jatuh saat kalah, tapi bisa dibobol maling malam hari.${p ? ` ${p.gembok ? '<b>Gembok besi terpasang</b> (risiko kebobolan turun dari 14% ke 3% per malam).' : ''}` : ''}</div>
    ${p && !p.gembok ? `<button class="btn sm gold" data-do="gembok" ${cnt('besi') >= 2 && G.coin >= 15 ? '' : 'disabled'}>Pasang gembok · 2 Besi + 15 koin</button>` : ''}`; }
function shopHTML() { const s = shopOf(Panel.rid); if (!s) return ''; const inv = Object.keys(G.inv).filter(i => cnt(i) > 0 && ITEMS[i] && ITEMS[i].tgt), MULTS = [.9, 1, 1.1, 1.25, 1.5];
  const listed = Object.entries(s.items).filter(([, v]) => v.n > 0);
  return `<div class="card"><div class="stat"><span>Kas toko</span><span style="color:var(--gold)">${fmt(s.till)} koin</span></div><div class="stat"><span>Terjual total</span><span>${s.sold}</span></div><button class="btn sm gold" data-do="till" ${s.till ? '' : 'disabled'}>Ambil kas</button>
    <div class="note">Pembeli AI datang tiap jam in-game. Peluang laku naik kalau harga murah, kavling niaga besar, dan banyak dekorasi. Malam hari sepi. Tidak ada pajak pasar; pajakmu adalah sewa kavling.</div></div>
    <h5>Etalase</h5>${listed.map(([id, v]) => `<div class="rec">${img(id)}<div style="min-width:0"><b>${itemName(id)}</b> ×${v.n} <span class="muted">· ${fmt(Math.round(priceIn(id, 'lumiria') * v.mult))}/pcs</span><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${MULTS.map(m => `<button class="btn sm ${v.mult === m ? 'gold' : 'ghost'}" data-do="smult" data-arg="${id}:${m}">${Math.round(m * 100)}%</button>`).join('')}</div></div><button class="btn sm ghost" data-do="sback" data-arg="${id}">Tarik</button></div>`).join('') || '<div class="note">Etalase kosong.</div>'}
    <h5>Taruh dari tas</h5>${inv.map(id => `<div class="rec">${img(id)}<div><b>${itemName(id)}</b> <span class="muted">punya ${cnt(id)}</span></div><div class="act" style="display:flex;gap:4px"><button class="btn sm" data-do="sput" data-arg="${id}:1">1</button><button class="btn sm ghost" data-do="sput" data-arg="${id}:all">Semua</button></div></div>`).join('') || '<div class="note">Tidak ada barang dagangan di tas.</div>'}`; }
function actCounter(id) { const r = ROOMS[id]; if (r.owner === 'me') return openPanel('shop', id); say([{ info: BOTS[r.owner] ? { n: BOTS[r.owner].name, sub: 'Pemilik toko · Pengembara AI', look: BOTS[r.owner].look } : null, t: 'Selamat datang! Harga mengikuti pasar Lumiria.' }], () => openMarket('lumiria')); }
function landAction(a, arg) {
  if (a === 'build') return startBuild(Panel.pid, arg);
  if (a === 'tab') { Panel.tab = arg; return renderPanel(); }
  if (a === 'demolish') { const [pid, i] = arg.split(':'); demolish(pid, +i); return renderPanel(); }
  if (a === 'decl') { const [pid, v] = arg.split(':'), st = G.land[pid]; st.decl = Math.max(SZ[PLOT_BY[pid].sz].base * .5, st.decl + +v); st.last = dayOf(); SFX.ui(); return renderPanel(); }
  if (a === 'release') { releasePlot(arg); return closePanel(); }
  if (a === 'lotto') { if (G.lotto || G.coin < 5) return; G.coin -= 5; G.lotto = true; G.guildKas += 5; SFX.coin(); toast('Terdaftar lotre rumah', 'Undian tiap pergantian hari (00.00)', 'good'); return renderPanel(); }
  if (a === 'bid') { bidAuction(arg); return renderPanel(); }
  if (a === 'buyplot') { buyPlot(arg); return renderPanel(); }
  if (a === 'put' || a === 'takeout') { const [id, q] = arg.split(':'); const have = a === 'put' ? cnt(id) : (G.stash[id] || 0), n = q === 'all' ? have : Math.min(1, have); if (!n) return;
    if (a === 'put') { take(id, n); G.stash[id] = (G.stash[id] || 0) + n; } else { G.stash[id] -= n; if (G.stash[id] <= 0) delete G.stash[id]; give(id, n, true); } SFX.ui(); return renderPanel(); }
  if (a === 'gembok') { const r = ROOMS[Panel.rid], p = G.land[r.plot].place[r.pi]; if (cnt('besi') < 2 || G.coin < 15) return; take('besi', 2); G.coin -= 15; p.gembok = true; r.gembok = true; SFX.clang(); toast('Gembok terpasang', 'Maling jauh lebih sulit masuk', 'good'); return renderPanel(); }
  const s = shopOf(Panel.rid);
  if (a === 'till') { G.coin += s.till; SFX.coin(); FX.pop(G.x, G.y - 24, `+${s.till} koin`, '#f4c869'); s.till = 0; return renderPanel(); }
  if (a === 'sput') { const [id, q] = arg.split(':'), n = q === 'all' ? cnt(id) : 1; take(id, n); const it = s.items[id] || (s.items[id] = { n: 0, mult: 1 }); it.n += n; SFX.ui(); return renderPanel(); }
  if (a === 'smult') { const [id, m] = arg.split(':'); s.items[id].mult = +m; SFX.ui(); return renderPanel(); }
  if (a === 'sback') { const it = s.items[arg]; give(arg, it.n, true); it.n = 0; SFX.ui(); return renderPanel(); }
}
