/* ------------------------------ 100 PENGEMBARA AI ------------------------------ */
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const POI = { plaza: { a: [36, 20], area: [29, 17, 15, 11] }, market: { a: [48, 22], area: [43, 19, 12, 4] }, field: { a: [56, 17], area: [58, 15, 8, 6] },
  mine: { a: [16, 10], area: [3, 3, 12, 10] }, slime: { a: [36, 42], area: [27, 40, 18, 8] }, wolf: { a: [53, 45], area: [51, 43, 14, 12] },
  goblin: { a: [22, 46], area: [15, 43, 10, 9] }, boss: { a: [14, 48], area: [5, 47, 10, 8] }, statue: { a: [36, 26], area: [32, 25, 9, 3] }, news: { a: [33, 19], area: [31, 18, 5, 2] },
  door_guild: { a: [19, 21] }, door_smith: { a: [19, 31] }, door_cook: { a: [47, 31] }, door_kuil: { a: [36, 13] },
  karst: { a: [97, 13], area: [89, 10, 16, 7] }, karstmine: { a: [80, 12], area: [76, 4, 12, 24] }, corvel: { a: [125, 34], area: [116, 27, 18, 10] }, mirev: { a: [105, 73], area: [99, 70, 14, 7] },
  distrik: { a: [90, 42], area: [74, 41, 34, 3] }, bandit: { a: [93, 32], area: [74, 32, 34, 2] }, mwolf: { a: [112, 62], area: [108, 57, 14, 9] } };
const INDOOR2 = { tukang: 'h4', karst_inn: 'karst_inn', corvel_inn: 'corvel_inn', serikat: 'corvel_serikat', kantor_tanah: 'kantor_tanah', herbalis: 'mire_herb' };
for (const [rid, bid] of Object.entries(INDOOR2)) { const b = BUILD.find(q => q.id === bid); POI['door_' + rid] = { a: [Math.floor(b.x + b.w / 2), b.y + b.h] }; }
const INDOOR = { guild: 'guild', smith: 'smith', cook: 'cook', kuil: 'kuil', tukang: 'tukang', karst_inn: 'karst_inn', corvel_inn: 'corvel_inn', serikat: 'serikat', kantor_tanah: 'kantor_tanah', herbalis: 'herbalis' };
const HUNT = { slime: 1, wolf: 1, goblin: 1, boss: 1, bandit: 1, mwolf: 1 };
const WORK = { field: 'tani', mine: 'tambang', karstmine: 'tambang', distrik: 'tambang' };
const STAY = { field: [15, 40], mine: [15, 40], market: [10, 40], plaza: [8, 30], news: [5, 14], statue: [10, 35], slime: [20, 45], wolf: [20, 45], goblin: [20, 45], boss: [25, 50], karst: [10, 35], karstmine: [15, 40], corvel: [10, 40], mirev: [10, 35], distrik: [12, 40], bandit: [20, 45], mwolf: [20, 45] };
const ROLES = {
  petani: { n: 'Petani', w: { field: 6, market: 2, plaza: 1, cook: 1, news: 1, mirev: 1 }, items: ['gandum', 'wortel', 'tomat', 'stroberi'] },
  penambang: { n: 'Penambang', w: { mine: 4, karstmine: 4, smith: 2, market: 1, karst: 1 }, items: ['tembaga', 'besi', 'perak', 'batu'] },
  pandai: { n: 'Pandai Besi', w: { smith: 5, mine: 2, market: 2, news: 1, karst: 1 }, items: ['pisau_tembaga', 'pedang_besi', 'beliung_besi', 'busur_besi'] },
  pedagang: { n: 'Pedagang', w: { market: 5, news: 3, plaza: 1, guild: 1, corvel: 2, karst: 1, mirev: 1, distrik: 1 }, items: ['besi', 'gandum', 'roti', 'perak', 'tomat', 'pedang_besi', 'ikan'] },
  pemanah: { n: 'Pemanah', w: { slime: 2, wolf: 3, goblin: 2, guild: 2, cook: 1, mwolf: 2, bandit: 1 }, items: ['busur_besi', 'roti', 'besi'] },
  penyihir: { n: 'Penyihir', w: { wolf: 2, goblin: 3, boss: 1, kuil: 2, guild: 1, news: 1, mwolf: 1, herbalis: 1 }, items: ['tongkat_perak', 'perak', 'sup_wortel'] },
  pendekar: { n: 'Pendekar', w: { slime: 2, wolf: 3, goblin: 3, boss: 2, guild: 2, cook: 1, bandit: 2 }, items: ['pedang_besi', 'roti', 'sup_wortel'] },
  penyembuh: { n: 'Penyembuh', w: { kuil: 4, goblin: 2, wolf: 2, plaza: 1, statue: 1, mirev: 1, herbalis: 1 }, items: ['sup_wortel', 'telur_dadar', 'roti', 'herba'] },
  bayangan: { n: 'Pengembara Bayangan', w: { plaza: 3, market: 3, news: 3, goblin: 1, cook: 1, distrik: 2 }, items: ['belati_besi', 'perak', 'mayones'] },
  sosial: { n: 'Penjelajah Santai', w: { plaza: 4, statue: 3, cook: 2, news: 2, market: 1, kuil: 1, corvel: 2, mirev: 1, corvel_inn: 1 }, items: ['roti', 'telur_dadar', 'mayones', 'ikan'] },
  kurir: { n: 'Kurir Dagang', w: { karst: 3, corvel: 3, mirev: 3, market: 3, serikat: 2, karst_inn: 1 }, items: ['besi', 'ikan', 'herba', 'kayu', 'perak'] },
  tukang: { n: 'Tukang', w: { distrik: 4, tukang: 3, mirev: 2, kantor_tanah: 1, karstmine: 1 }, items: ['kayu', 'papan', 'batu'] },
};
const ROLE_MIX = [['petani', 13], ['penambang', 11], ['pandai', 8], ['pedagang', 10], ['pemanah', 10], ['penyihir', 8], ['pendekar', 12], ['penyembuh', 7], ['bayangan', 5], ['sosial', 8], ['kurir', 5], ['tukang', 3]];
const BOT_WEAPON = { pemanah: 'busur', penyihir: 'tongkat', pendekar: 'pedang', penyembuh: 'tongkat', bayangan: 'belati', penambang: 'pedang', petani: 'pedang', pandai: 'pedang', pedagang: 'belati', sosial: 'pedang', kurir: 'busur', tukang: 'pedang' };
const BOT_FIRST = ['Raka', 'Dimas', 'Putri', 'Bayu', 'Sari', 'Agus', 'Wulan', 'Fajar', 'Nanda', 'Rizky', 'Intan', 'Yoga', 'Laras', 'Tegar', 'Kiki', 'Bima', 'Citra', 'Gilang', 'Mira', 'Ucup', 'Rani', 'Joko', 'Tiara', 'Ilham', 'Salsa', 'Bagas', 'Nisa', 'Andre', 'Vina', 'Doni'];
const BOT_SUF = ['_Tani', 'Slayer', '99', '.exe', 'Gacor', '_ID', 'Jkt', 'Sby', 'Bdg', 'Smg', 'Senpai', 'Kece', 'XD', 'GG', '007', '_Ngopi', 'Lv50', 'Sakti', 'Cuan', 'Mager', 'Santuy', 'Pro'];
const BOT_SPECIAL = ['AyamGeprekLv99', 'NasgorSpesial', 'PejuangSubuh', 'TukangTempaHalu', 'BundaPanen', 'OmBesi', 'MasPerak', 'CilokMaster', 'KopiTubruk', 'SiPalingCuan', 'RajaSlime', 'GoblinHater', 'TehManis', 'BakwanJaya', 'SultanLumiria', 'PanahNyasar', 'MbakHealer', 'BayanganSenja'];
const TIPS = { petani: 'Ladang guild tumbuh lagi sendiri, tapi petak sendiri hasilnya lebih banyak.', penambang: 'Perak cuma bisa ditambang kalau Menambang-mu sudah 15.', pandai: 'Pisau tembaga itu tempaan pertama semua orang.',
  pedagang: 'Jangan percaya semua kabar di papan berita. Lihat dulu kredibilitas penulisnya.', pemanah: 'Busur enak buat serigala: tembak dari jauh sebelum mereka menerjang.', penyihir: 'Bola Api butuh Sihir 5. Latih dulu pakai tongkat.',
  pendekar: 'Raja Goblin lambat, tapi hantamannya sakit. Lihat lingkaran merahnya!', penyembuh: 'Lingkar Penyembuh juga bisa menyembuhkan pengembara lain. Kuil suka itu.',
  bayangan: 'Malam hari ada yang berjualan di gang dekat bengkel. Jangan bilang siapa-siapa.', sosial: 'Patung Dewi di alun-alun bisa dipakai menyimpan perjalanan.', kurir: 'Ikan murah di Corvel, roti mahal di Karst. Jalan kaki hemat, tapi bandit Jalan Timur tidak bercanda.', tukang: 'Kayu ditebang pakai kapak di hutan luar kota. Dua kayu jadi satu papan di meja kerja Bagas.' };
const SHORT = { field: ['panen dulu~', 'gandum lagi', 'capek tapi seneng'], mine: ['tang! tang!', 'bijih mana bijih', 'perak belum respawn'], market: ['WTS!', 'nego?', 'murah2!', 'cek harga dulu'], slime: ['hiyaa!', 'slime lagi'],
  wolf: ['awas serigala', 'heal dong'], goblin: ['goblin bau', 'serbu!'], boss: ['fokus raja!', 'menghindar!'], plaza: ['halo', 'afk bentar', 'cari party'], news: ['hmm kabar ini...', 'valid gak nih'], statue: ['berdoa dulu', 'save dulu'],
  guild: ['ada quest baru?', 'pesanan apa hari ini'], karst: ['dingin di gunung', 'besi murah bgt di sini'], karstmine: ['tang!', 'batu lagi batu lagi'], corvel: ['bau laut~', 'ikan murah!', 'kapal datang'], mirev: ['hutannya gelap', 'herba wangi'], distrik: ['kavling mahal ya', 'bangun bangun!', 'ikut lotre lagi'], bandit: ['BANDIT!', 'jaga barang!'], mwolf: ['serigala hutan ganas'], smith: ['tempa terus', 'panas bgt'], cook: ['laper', 'sup-nya enak'], kuil: ['tenang di sini', 'semoga gacha hoki'] };
let NAVW = null; const NAV = {}, POI_CELLS = {};
let BOTS = [], HUNTERS = [], schedI = 0;
function initNav() {
  NAVW = new Uint8Array(MW * MH);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { let ok = !SOLID_T.has(at(x, y)); const cx = x * T + 8, cy = y * T + 10;
    if (ok) for (const s of SOLIDS) if (cx >= s.x - 3 && cx < s.x + s.w + 3 && cy >= s.y - 2 && cy < s.y + s.h + 4) { ok = false; break; }
    if (ok && ORES.some(o => o[1] === x && o[2] === y)) ok = false; NAVW[y * MW + x] = ok ? 1 : 0; }
  for (const k in POI) { const p = POI[k], d = new Uint16Array(MW * MH).fill(65535), q = [], s = p.a[1] * MW + p.a[0]; NAVW[s] = 1; d[s] = 0; q.push(s);
    for (let h = 0; h < q.length; h++) { const i = q[h], x = i % MW, y = (i / MW) | 0;
      for (const [dx, dy] of N8) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const j = ny * MW + nx; if (!NAVW[j] || d[j] !== 65535) continue;
        if (dx && dy && (!NAVW[y * MW + nx] || !NAVW[ny * MW + x])) continue; d[j] = d[i] + 1; q.push(j); } }
    NAV[k] = d;
    if (p.area) { const [x0, y0, w, h] = p.area, cells = []; for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (NAVW[y * MW + x] && d[y * MW + x] < 65535) cells.push([x, y]); POI_CELLS[k] = cells.length ? cells : [p.a]; } }
}
function initBots() {
  const r = mulberry32(4242), names = new Set(BOT_SPECIAL); while (names.size < 100) names.add(BOT_FIRST[(r() * BOT_FIRST.length) | 0] + BOT_SUF[(r() * BOT_SUF.length) | 0]);
  const nm = [...names].slice(0, 100), roles = []; for (const [k, n] of ROLE_MIX) for (let i = 0; i < n; i++) roles.push(k);
  for (let i = roles.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [roles[i], roles[j]] = [roles[j], roles[i]]; }
  const skins = ['#f3cfaa', '#e8b48f', '#d9a57c', '#c98e66', '#f6d7bd', '#fbe2cc'], hairs = HAIRS.concat(['#202020', '#8a5a3a', '#d6b45a', '#a33c4a', '#5fd0c8']),
    tops = ['#4e8a60', '#7a4ea0', '#c2563e', '#2f6f9f', '#d07a9a', '#a07a4a', '#5a7ac0', '#6a6a6a', '#e0a930', '#3a8a8a'];
  BOTS = nm.map((name, i) => { const role = roles[i], honest = role === 'bayangan' ? r() > .6 : r() > .1, posts = 2 + ((r() * 9) | 0);
    const look = { skin: skins[(r() * skins.length) | 0], hair: hairs[(r() * hairs.length) | 0], style: r() < .45 ? 'long' : 'short', top: tops[(r() * tops.length) | 0], bottom: ['#3b3552', '#4a3a2a', '#2b3466', '#3a3a3a'][(r() * 4) | 0] };
    const ar = r(); if (role === 'pendekar' && ar < .5) look.acc = 'helm'; else if (role === 'bayangan') { look.acc = 'hood'; look.top = '#2a2a3a'; look.top2 = '#1a1a26'; } else if (role === 'penyembuh') { look.top = '#f0ece0'; look.top2 = '#d8cfae'; }
    else if (ar < .18) { look.acc = 'hat'; look.acc2 = ['#6b4a2a', '#b08a4a', '#3a3a5a'][(r() * 3) | 0]; } else if (ar < .26) look.acc = 'ribbon'; else if (ar < .3) look.acc = 'ears';
    return { i, name, role, look, honest, wt: BOT_WEAPON[role], cred: honest ? .72 + r() * .22 : .36 + r() * .26, posts, proven: Math.round(posts * (honest ? .8 + r() * .15 : .2 + r() * .3)),
      x: 0, y: 0, dir: 0, step: 0, stepT: 0, spd: 52 + r() * 18, mode: 'stay', stay: 0, task: null, poi: null, room: null, hp: 20, flash: 0, atkCd: 0, swing: 0, bubble: null, anim: r() * 10, down: 0, scan: 0, foe: null, tx: 0, ty: 0, stuck: 0 }; });
  initBotsV2(); for (const b of BOTS) assignTask(b, true);
}
function pickW(w) { let s = 0; for (const k in w) s += w[k]; let x = rand() * s; for (const k in w) { x -= w[k]; if (x <= 0) return k; } return Object.keys(w)[0]; }
function assignTask(b, spawn) {
  let task = pickW(G ? schedWeights(b) : ROLES[b.role].w); if (G && G.wave && G.wave.active && HUNT[task]) task = 'slime';
  b.task = task; b.work = null; b.foe = null; b.poi = INDOOR[task] ? 'door_' + task : task;
  if (spawn) { if (INDOOR[task]) botEnterRoom(b, task); else { const p = pick(POI_CELLS[b.poi]); b.x = p[0] * T + 8 + rnd(-4, 4); b.y = p[1] * T + 12; b.mode = 'stay'; b.stay = rnd(2, 30); b.work = WORK[task] || null; } return; }
  b.mode = 'path';
}
function botEnterRoom(b, room) { const p = pick(ROOMS[room].cells); b.room = room; b.mode = 'room'; b.x = p[0] * T + 8; b.y = p[1] * T + 12; b.tx = b.x; b.ty = b.y; b.stay = rnd(25, 70); b.rt = rnd(1, 5); }
function botLeaveRoom(b) { const d = DOORS.find(q => q.room === b.room); b.room = null; b.x = d.x + rnd(-4, 4); b.y = d.y + 6; b.dir = 0; assignTask(b); }
const botFace = (b, dx, dy) => { b.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); };
const botWalk = (b, dt) => { b.stepT += dt; if (b.stepT > .17) { b.stepT = 0; b.step ^= 1; } };
const onCam = a => { const rm = G && G.room ? G.room : null; if ((a.room || null) !== rm) return false; return a.x > Cam.x - 24 && a.x < Cam.x + VW + 24 && a.y > Cam.y - 24 && a.y < Cam.y + VH + 30; };
function botArrive(b) { if (INDOOR[b.task]) return botEnterRoom(b, b.task); b.mode = 'local'; const p = pick(POI_CELLS[b.poi]); b.tx = p[0] * T + 8 + rnd(-4, 4); b.ty = p[1] * T + 12; b.stuck = 0; }
function botPath(b, dt) {
  const f = NAV[b.poi], tx = Math.floor(b.x / T), ty = Math.floor((b.y - 4) / T), inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH, here = inb(tx, ty) ? f[ty * MW + tx] : 65535;
  if (here === 0) return botArrive(b);
  let best = -1, bd = here; for (const [dx, dy] of N8) { const nx = tx + dx, ny = ty + dy; if (!inb(nx, ny)) continue; const j = ny * MW + nx;
    if (dx && dy && (!NAVW[ty * MW + nx] || !NAVW[ny * MW + tx])) continue; if (f[j] < bd) { bd = f[j]; best = j; } }
  if (best < 0) { if (here === 65535) { const a = POI[b.poi].a; b.x = a[0] * T + 8; b.y = a[1] * T + 12; } return botArrive(b); }
  const gx = (best % MW) * T + 8, gy = ((best / MW) | 0) * T + 12, dx = gx - b.x, dy = gy - b.y, d = Math.hypot(dx, dy), s = Math.min(d, b.spd * dt);
  if (d > .01) { b.x += dx / d * s; b.y += dy / d * s; botFace(b, dx, dy); } b.moving = true; botWalk(b, dt);
}
function botHunt(b, dt, forced) {
  if (forced) b.foe = forced; else b.scan -= dt; if (!forced && b.scan <= 0) { b.scan = .3; let best = null, bd = 70; for (const e of ENEMIES) { if (e.dead) continue; const d = Math.hypot(e.x - b.x, e.y - b.y); if (d < bd) { bd = d; best = e; } } b.foe = best; }
  const e = b.foe; if (!e || e.dead) return;
  const dx = e.x - b.x, dy = e.y - b.y, d = Math.hypot(dx, dy), range = b.wt === 'busur' ? 70 : b.wt === 'tongkat' ? 55 : 13; b.stay = Math.max(b.stay, 1.5); botFace(b, dx, dy);
  if (d > range) { moveActor(b, dx / d * b.spd * dt, dy / d * b.spd * dt, 'bot', null); b.moving = true; botWalk(b, dt); }
  else if (b.atkCd <= 0) { b.atkCd = rnd(.9, 1.5); b.swing = .2;
    if (b.wt === 'busur' || b.wt === 'tongkat') PROJ.push({ x: b.x, y: b.y - 8, vx: dx / d * (b.wt === 'busur' ? 230 : 160), vy: dy / d * (b.wt === 'busur' ? 230 : 160), dmg: Math.max(1, Math.round(botAtk(b) * .8)), kind: b.wt === 'busur' ? 'arrow' : 'orb', src: 'bot', bot: b, life: .8, aoe: b.wt === 'tongkat' ? 14 : 0 });
    else damageEnemy(e, Math.max(1, Math.round(botAtk(b) * (e.d.boss ? .7 : 1))), false, Math.atan2(dy, dx), 'bot', null, b);
    if (b.role === 'penyembuh') for (const o of HUNTERS) if (o !== b && o.hp < o.hpMax && Math.hypot(o.x - b.x, o.y - b.y) < 50) { o.hp = Math.min(o.hpMax, o.hp + 3 + tierOf(b.skc)); if (onCam(o)) FX.burst(o.x, o.y - 8, 6, '#9fffcf', 25, .6, -40, { add: true }); }
    if (e.dead && rand() < .2) botSay(b, pick(['beres!', 'ez', `${e.d.n} lagi dong`, 'drop-nya zonk wkwk']), rand() < .5); }
}
function hurtBot(b, dmg) { if (b.down) return; dmg = Math.max(1, Math.round(dmg * mitig(b.def || 0))); b.hp -= dmg; b.flash = .12; if (onCam(b)) FX.pop(b.x, b.y - 20, '-' + dmg, '#ffb0b0');
  if (b.hp <= 0) { b.hp = 0; b.down = 18; b.foe = null; b.mode = 'stay'; if (onCam(b)) FX.burst(b.x, b.y - 8, 16, '#ffffff', 40, .7, -20, { add: true }); if (rand() < .5) botSay(b, pick(['yah pingsan :(', 'tolong bangunin dong', 'lag woy', 'sakit bgt hantamannya']), true); } }
function updateBots(dt) {
  HUNTERS = []; let pk = 0; schedI = (schedI + 1) % BOTS.length; if (G && BOTS[schedI]) schedTick(BOTS[schedI]);
  for (const b of BOTS) {
    b.anim += dt; b.flash = Math.max(0, b.flash - dt); b.atkCd -= dt; b.swing = Math.max(0, b.swing - dt); b.moving = false;
    if (b.bubble && (b.bubble.t -= dt) <= 0) b.bubble = null;
    if (b.down > 0) { b.down -= dt; if (b.down <= 0) { b.room = null; b.x = 36.5 * T + rnd(-8, 8); b.y = 14.4 * T; b.hp = b.hpMax; b.mode = 'path'; if (b.task === 'party' && G && G.party.some(p => p.i === b.i)) { b.mode = 'party'; b.x = G.x + rnd(-16, 16); b.y = G.y + 12; b.hp = Math.ceil(b.hpMax / 2); } else assignTask(b); } continue; }
    if (b.mode === 'off') continue;
    if (b.hp < b.hpMax) { b.reg = (b.reg || 0) + dt; if (b.reg > 2) { b.reg = 0; b.hp++; } }
    if (b.mode === 'room') { b.stay -= dt;
      if (G && G.room === b.room) { b.rt -= dt; if (b.rt <= 0) { b.rt = rnd(2, 7); if (rand() < .6) { const p = pick(ROOMS[b.room].cells); b.tx = p[0] * T + 8; b.ty = p[1] * T + 12; } }
        const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy); if (d > 2) { const ox2 = b.x, oy2 = b.y; moveActor(b, dx / d * 34 * dt, dy / d * 34 * dt, 'bot', b.room); botFace(b, dx, dy); b.moving = true; botWalk(b, dt); if (ox2 === b.x && oy2 === b.y) { b.tx = b.x; b.ty = b.y; } } }
      if (b.stay <= 0) botLeaveRoom(b); continue; }
    if (b.mode === 'party') { if (!inSafe(b.x, b.y)) HUNTERS.push(b); botParty(b, dt, pk++); continue; }
    if (b.mode === 'assist') { HUNTERS.push(b); botAssist(b, dt); continue; }
    if (b.mode === 'path') { botPath(b, dt); continue; }
    if (!inSafe(b.x, b.y)) HUNTERS.push(b);
    if (b.mode === 'local') { const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
      if (d < 3) { b.mode = 'stay'; const s = STAY[b.task] || [8, 20]; b.stay = rnd(s[0], s[1]); b.work = WORK[b.task] || null; if (b.work === 'tani') b.dir = 0; continue; }
      const ox2 = b.x, oy2 = b.y; moveActor(b, dx / d * b.spd * .8 * dt, dy / d * b.spd * .8 * dt, 'bot', null); botFace(b, dx, dy); b.moving = true; botWalk(b, dt);
      if (Math.abs(b.x - ox2) + Math.abs(b.y - oy2) < .05) { b.stuck += dt; if (b.stuck > 1) { b.stuck = 0; b.mode = 'stay'; b.stay = rnd(2, 5); } } continue; }
    b.stay -= dt;
    if (HUNT[b.task]) botHunt(b, dt);
    if (b.work === 'tambang' && (b.anim % 1.2) < dt && onCam(b)) FX.burst(b.x + (b.dir === 3 ? 8 : b.dir === 2 ? -8 : 0), b.y - 6, 3, '#d6e2ef', 40, .3, 200, { add: true });
    if (b.stay <= 0) { if (!INDOOR[b.task] && rand() < .45) { const p = pick(POI_CELLS[b.poi]); b.tx = p[0] * T + 8 + rnd(-4, 4); b.ty = p[1] * T + 12; b.mode = 'local'; b.work = null; } else assignTask(b); }
  }
}
function stealBot(b) {
  if (b.robbedAt !== undefined && G.clock - b.robbedAt < 120) return toast('Dia masih waspada', 'Coba lagi nanti');
  b.robbedAt = G.clock; const ch = clamp(.35 + G.sk.bayangan * .01 + (nightAmt() > .5 ? .15 : 0) + (G.align <= -30 ? .1 : 0) + (perk('bayangan', 4) ? .1 : 0) + facRank('gelap') * .03, .1, .9); train('bayangan', 22); addAlign(-6); addAff(b, -30); addRep('warga', -1);
  if (rand() < ch) { const k = irnd(6, 18); G.coin += k; SFX.coin(); toast('Copet berhasil', `+${k} koin dari ${b.name}`); FX.pop(G.x, G.y - 24, `+${k} koin`, '#c8a0ff'); }
  else { const fine = G.align <= -30 ? 40 : 20; G.coin = Math.max(0, G.coin - fine); addAlign(-4); G.rep = Math.max(0, G.rep - 1); SFX.hurt(); FX.shake(.2);
    botSay(b, `COPET!! hati-hati sama ${G.name}!`, true); toast('Ketahuan mencopet!', `Denda penjaga ${fine} koin · reputasi −1`, 'event'); }
}
function reviveBot(b) { addAff(b, 12); addRep('warga', rand() < .5 ? 1 : 0); b.down = 0; b.hp = Math.ceil(b.hpMax * .6); if (b.task === 'party') { b.mode = 'party'; return SFX.skill(); } b.mode = 'stay'; b.stay = 5; botFace(b, G.x - b.x, G.y - b.y); addAlign(4); train('penyembuhan', 10); SFX.skill();
  FX.burst(b.x, b.y - 8, 18, '#fff2b0', 40, .9, -40, { add: true }); const k = irnd(5, 14); G.coin += k;
  botSay(b, pick([`makasih ${G.name}! nih buat jajan`, 'penyelamat! makasih banyak', 'wah baik bgt, ini sedikit koin']), true); toast(`${b.name} bangun lagi`, `Hadiah ${k} koin`, 'good'); }

/* ------------------------------ CHAT DUNIA ------------------------------ */
const CHAT = []; let chatT = 3, chatDirty = true, chatRT = 0;
function chat(who, text, cls = '') { CHAT.push({ who, text, cls }); if (CHAT.length > 30) CHAT.shift(); chatDirty = true; }
function botSay(b, text, world = true) { if (!text) return; if (world) chat(b.name, text); const tb = tr(text); if (onCam(b)) b.bubble = { text: tb.length > 30 ? tb.slice(0, 28) + '…' : tb, t: 3.4 }; }
function genChat(b) {
  const id = pick(ROLES[b.role].items), p = Math.round(price(id)), nm = itemName(id), r = rand();
  const live = G.news.filter(n => n.status === 'beredar');
  if (live.length && r < .22) { const n = pick(live), au = newsAuthor(n), up = n.dir > 0;
    return pick([`kabar ${itemName(n.item)} bakal ${up ? 'naik' : 'turun'} beneran gak sih?`, `udah ${up ? 'borong' : 'buang'} ${itemName(n.item)} duluan wkwk`, `kabar dari ${au} ${credOf(n) > .65 ? 'biasanya valid sih' : 'jangan dipercaya, sering palsu'}`, `${itemName(n.item)} di pasar ${Math.round(price(n.item))} sekarang, gerak nih`]); }
  if (G.events.length && r < .34) { const e = EVENTS[pick(G.events).id]; return pick([`gara2 ${e.n.toLowerCase()}, harga pada gila`, `${e.n}? waktunya cuan`, 'siapa yg nyetok sebelum ini, kaya mendadak dah']); }
  if (G.wave && G.wave.active) return pick(['GERBANG! semua ke selatan!!', 'healer mana healer', 'slime ungu banyak bgt', 'tahan gerbangnya!!']);
  if (G.waveAt && r < .42) { const d = Math.max(0, Math.ceil((G.waveAt - G.clock) / (24 * HOUR_S))); return pick([`gelombang monster ${d} hari lagi, siapin senjata`, 'pas gelombang nanti ketemu di gerbang ya', 'pandai besi pasti panen order sebelum gelombang']); }
  if (G.align <= -40 && r < .5) return pick([`hati2 dompet kalau ada ${G.name} di dekat kalian`, `${G.name} katanya sering ke gang gelap malam2`]);
  if (G.align >= 40 && r < .5) return pick([`${G.name} baik bgt, kemarin bangunin aku pas pingsan`, `respect buat ${G.name}`]);
  if (nightAmt() > .6 && r < .55) return pick(['katanya ada pedagang aneh di gang dekat bengkel tiap malam', 'malem2 gini enaknya farming kunang2', 'kuil malem cakep bgt']);
  const pools = {
    petani: [`WTS ${nm} ${p}/pcs, di pasar`, 'ladang guild lagi rame, antri panen', `tips: jangan jual ${nm} pas panen raya`, 'ada yg punya benih stroberi lebih?'],
    penambang: [`WTS ${nm} ${p}/pcs`, 'perak di pojok tambang belum respawn ya?', 'beliung besi worth bgt', 'goblin kadang bawa besi, lumayan'],
    pandai: ['open order tempa, bawa bahan sendiri', `WTS ${nm} ${p}, kualitas bagus`, 'skill pandai besi naik lama bgt di atas 40', 'WTB besi banyak, harga pasar'],
    pedagang: [`WTS ${nm} ${p}, nego tipis`, `WTB ${nm} di bawah ${Math.max(1, p - 3)}`, 'pajak pasar berat, naikin berdagang dulu', `harga ${nm} ${rand() < .5 ? 'naik' : 'turun'} terus, kenapa ya`],
    pemanah: ['serigala gampang kalau dipanah dari jauh', `WTB ${nm}`, 'Hujan Panah butuh Busur 8, grind dulu', 'LFG serigala seberang jembatan'],
    penyihir: ['Bola Api + Panah Api combo mantap', 'mana habis mulu', 'cari pemanah buat build Panah Api bareng', 'LFG Raja Goblin, butuh tank'],
    pendekar: ['LFG Raja Goblin, butuh 2 lagi', 'party slime santai, gas?', 'Garon tank-nya enak bgt sumpah', `WTB ${nm}`],
    penyembuh: ['ada yg pingsan? aku bangunin', 'healer gratis di perkemahan goblin', 'kuil butuh donasi, ayo bantu', 'Cahaya 30 buka Pedang Suci lho'],
    bayangan: ['...', 'jangan tanya aku dapat perak dari mana', 'kabar di papan itu... ya, percaya aja', 'malam ini ada barang bagus di gang'],
    kurir: [`${nm} di Corvel cuma ${Math.round(priceIn(id, 'corvel'))}, di Lumiria ${p}`, 'kereta pakai asuransi dong, kemarin dicegat bandit', 'WTB ikan buat dibawa ke Karst', 'arbitrase tipis2 yang penting jalan'],
    tukang: ['open jasa bangun rumah wkwk', 'kayu mahal minggu ini', 'kavling niaga deklarasinya jangan kemurahan, nanti dibeli paksa', 'lotre rumah kalah mulu, pity udah 5'],
    sosial: ['afk makan dulu', 'server rame ya hari ini', 'gacha ritual kapan rate up lagi', 'ada yg mau mabar ke danau?'],
  };
  return pick(pools[b.role]);
}
function updateChat(dt) {
  chatT -= dt; if (chatT <= 0) { chatT = rnd(2.2, 5); const ob = onlineBots(); const b = ob.length ? pick(ob) : null; if (b && !b.down) botSay(b, genChat(b), true); }
  if (rand() < dt * .6) { const vis = BOTS.filter(b => !b.down && !b.bubble && onCam(b)); if (vis.length) { const b = pick(vis); botSay(b, pick(SHORT[b.task] || SHORT.plaza), false); } }
  if (!G.greeted && G.clock > 3) { G.greeted = true; botSay(pick(BOTS), `wih ada pengembara baru, salken ${G.name}!`); }
  if (!G.greeted2 && G.clock > 7) { G.greeted2 = true; botSay(pick(BOTS), `${G.name} kalo bingung tanya aja di chat`); }
  chatRT -= dt; if (chatDirty && chatRT <= 0) { chatRT = .25; chatDirty = false;
    $('#chat').innerHTML = CHAT.slice(-6).map(l => `<div class="ln ${l.cls}">${l.who ? `<span class="who">${esc(l.who)}:</span> ` : ''}${esc(l.text)}</div>`).join(''); }
}

/* ------------------------------ PAPAN BERITA ------------------------------ */
const TRADEABLE = () => Object.keys(ITEMS).filter(id => ITEMS[id].tgt);
const EV_KEY = { panen: ['gandum', -1, 'Katanya ladang Ferna panen besar, gandum bakal banjir.'], longsor: ['besi', 1, 'Dengar-dengar dinding Tambang Karst mulai retak.'], festival: ['sup_wortel', 1, 'Panitia Festival Lentera diam-diam borong bahan makanan.'] };
const FAKE_TEXT = ['Pembeli besar dari Corvel datang besok.', 'Guild katanya mau borong buat Gelombang Monster.', 'Ada yang lihat karavan Serikat ditahan di perbatasan.', 'Tambangnya mau ditutup sementara, sumber terpercaya.', 'Kuil butuh banyak untuk ritual musim depan.', 'Gudang Serikat kebanjiran, stok bakal dibuang murah.'];
const newsAuthor = n => n.src === 'serikat' ? 'Serikat Dagang' : n.src === 'player' ? G.name : BOTS[n.bot].name;
const credOf = n => n.src === 'serikat' ? .93 : n.src === 'player' ? G.cred : BOTS[n.bot].cred;
function postRumor(src, item, dir, truth, dur, bot, text) {
  const n = { id: (G.newsId = (G.newsId || 0) + 1), src, bot, item, dir, truth, text, t0: G.clock, due: G.clock + dur, p0: price(item), status: 'beredar', check: null };
  n.believe = clamp(credOf(n) * .95, .05, .95); G.news.unshift(n); if (G.news.length > 16) G.news.length = 16;
  chat('Papan Berita', `${newsAuthor(n)}: harga ${itemName(item)} akan ${dir > 0 ? 'naik' : 'turun'}`, 'nws'); if (src === 'bot') BOTS[bot].posts++;
  return n;
}
function resolveRumor(n) {
  const it = ITEMS[n.item], mk = G.market[n.item];
  let ok = !!n.truth; if (n.src === 'player') ok = G.events.some(e => { const m = EVENTS[e.id].mult[n.item]; return m && Math.sign(m - 1) === n.dir; });
  n.status = ok ? 'terbukti' : 'palsu';
  if (!ok) mk.stock = clamp(mk.stock + n.dir * n.believe * it.tgt * .4, it.tgt * .25, it.tgt * 3);
  if (n.src === 'bot') { const b = BOTS[n.bot]; if (ok) { b.proven++; b.cred = Math.min(.97, b.cred + .04); } else b.cred = Math.max(.08, b.cred - .12);
    if (!ok) { if (!b.honest) botSay(b, pick([`wkwk makasih yg beli ${itemName(n.item)} kemahalan`, 'cuan tipis2', 'namanya juga kabar hehe']), true);
      const v = pick(BOTS); if (v !== b) botSay(v, pick([`kena prank kabar ${itemName(n.item)} dari ${b.name} :(`, `${b.name} nyebar kabar palsu lagi`, `udah borong ${itemName(n.item)}, ternyata hoax`]), true); }
    else botSay(pick(BOTS), `kabar ${b.name} soal ${itemName(n.item)} beneran!`, true); }
  if (n.src === 'player') { if (ok) { G.cred = Math.min(.95, G.cred + .08); G.rep += 1; addAlign(2); toast('Kabarmu terbukti', `Kredibilitas naik jadi ${Math.round(G.cred * 100)}%`, 'good'); }
    else { G.cred = Math.max(.05, G.cred - .2); G.coin = Math.max(0, G.coin - 20); G.rep = Math.max(0, G.rep - 1); addAlign(-8); toast('Kabarmu terbukti palsu', `Denda guild 20 koin · kredibilitas ${Math.round(G.cred * 100)}%`, 'event');
      botSay(pick(BOTS), `${G.name} nyebar kabar palsu ya? ckck`, true); } }
  chat('Papan Berita', `Kabar ${itemName(n.item)} dari ${newsAuthor(n)}: ${ok ? 'TERBUKTI' : 'PALSU'}`, 'nws');
  if (n.src !== 'player' && cnt(n.item) > 0) toast(ok ? 'Kabar terbukti' : 'Kabar ternyata palsu', `${itemName(n.item)} · dari ${newsAuthor(n)}`, ok ? 'good' : 'event');
}
function updateNews(dt) {
  for (const n of G.news) if (n.status === 'beredar') { const it = ITEMS[n.item], mk = G.market[n.item]; mk.stock = clamp(mk.stock - n.dir * n.believe * .32 * dt * (it.tgt / 40), it.tgt * .25, it.tgt * 3); if (G.clock >= n.due) resolveRumor(n); }
  G.nextEvent -= dt;
  if (G.nextEvent <= 0 && !G.pendingEv) { const id = pick(['panen', 'longsor', 'festival', 'karavan', 'wabah', 'bandit', 'turnamen']); G.pendingEv = { id, at: G.clock + 80 }; G.nextEvent = rnd(210, 320);
    if (EV_KEY[id] && rand() < .75) { const [item, dir, text] = EV_KEY[id], ser = rand() < .35; postRumor(ser ? 'serikat' : 'bot', item, dir, true, 80, ser ? null : pick(BOTS.filter(b => b.honest)).i, text); } }
  if (G.pendingEv && G.clock >= G.pendingEv.at) { const id = G.pendingEv.id; G.pendingEv = null; startEvent(id); toast('Peristiwa Dunia', `${EVENTS[id].n}. ${EVENTS[id].d}`, 'event'); chat('Sistem', `Peristiwa: ${EVENTS[id].n}`, 'sys'); }
  G.fakeT -= dt; if (G.fakeT <= 0) { G.fakeT = rnd(80, 140); const b = pick(BOTS.filter(x => !x.honest)), item = pick(['besi', 'perak', 'tembaga', 'gandum', 'tomat', 'stroberi', 'pedang_besi', 'roti', 'wortel']);
    if (!G.news.some(n => n.status === 'beredar' && n.item === item)) { botSay(b, pick(['psst ada info penting di papan berita', 'cek papan berita deh', 'info A1 nih']), true); postRumor('bot', item, rand() < .75 ? 1 : -1, false, 90, b.i, pick(FAKE_TEXT)); } }
}

/* ------------------------------ EKONOMI NPC ------------------------------ */
const ECON = [
  { n: 'Petani Desa Ferna', k: 'NPC', make: { gandum: 5, wortel: 3.5, tomat: 2.5, stroberi: .6 } },
  { n: 'Penambang Karst', k: 'NPC', make: { tembaga: 3, besi: 2, perak: .4 } },
  { n: 'Karavan Corvel', k: 'NPC', make: { telur: 5, minyak: 3 }, use: { perak: .5, stroberi: .5, mayones: .2, sabun: .2, pompa: .1 } },
  { n: 'Bengkel Pak Tarno', k: 'NPC', use: { tembaga: 2, besi: 1.4 }, make: { pisau_tembaga: .6, pedang_besi: .25, beliung_besi: .1, belati: .2, busur_latihan: .2, tongkat_sihir: .1 } },
  { n: 'Kedai Rin', k: 'NPC', use: { gandum: 3, wortel: 1.5, tomat: 1, telur: 2 }, make: { roti: 2.5, sup_wortel: .6, telur_dadar: .8 } },
  { n: 'Penduduk Lumiria', k: 'NPC', use: { gandum: 6, wortel: 4.5, tomat: 3.5, stroberi: .5, telur: 3, minyak: 2.5, roti: 1, sup_wortel: .5, telur_dadar: .5, sabun: .2, mayones: .2, pupuk: .2 } },
  { n: 'Penjaga Gerbang', k: 'NPC', use: { roti: .5, pisau_tembaga: .5, pedang_besi: .25, busur_latihan: .2, tongkat_sihir: .1, belati: .1, ramuan: .1 } },
];
function aiFlows() {
  let tani = 0, tambang = 0, tempa = 0, buru = 0, dagang = 0;
  for (const b of BOTS) { if (b.down) continue; if (b.task === 'field' && b.mode === 'stay') tani++; else if ((b.task === 'mine' || b.task === 'karstmine') && b.mode === 'stay') tambang++; else if (b.room === 'smith') tempa++; else if (HUNT[b.task]) buru++; else if (b.task === 'market') dagang++; }
  return [
    { n: `Pengembara AI bertani (${tani} orang)`, k: 'AI', make: { gandum: tani * .5, wortel: tani * .35, tomat: tani * .25, stroberi: tani * .05 } },
    { n: `Pengembara AI menambang (${tambang} orang)`, k: 'AI', make: { tembaga: tambang * .4, besi: tambang * .25, perak: tambang * .04 } },
    { n: `Pengembara AI menempa (${tempa} orang)`, k: 'AI', use: { tembaga: tempa * .5, besi: tempa * .5 }, make: { pisau_tembaga: tempa * .15, pedang_besi: tempa * .1, busur_besi: tempa * .04, belati_besi: tempa * .04 } },
    { n: `Pengembara AI berburu (${buru} orang)`, k: 'AI', use: { roti: buru * .05, sup_wortel: buru * .01, telur_dadar: buru * .01, pisau_tembaga: buru * .02, pedang_besi: buru * .02 } },
    { n: `Pengembara AI berdagang (${dagang} orang)`, k: 'AI', traders: dagang },
  ];
}
function econTick() {
  const acts = ECON.concat(aiFlows()), net = {}; let traders = 0;
  for (const a of acts) { for (const id in a.make || {}) net[id] = (net[id] || 0) + a.make[id]; for (const id in a.use || {}) net[id] = (net[id] || 0) - a.use[id]; if (a.traders !== undefined) traders = a.traders; }
  for (const id in G.market) { const it = ITEMS[id], mk = G.market[id]; mk.stock = clamp(mk.stock + (net[id] || 0) + (it.tgt - mk.stock) * (.04 + traders * .003), it.tgt * .25, it.tgt * 3); }
  G.flows = net; G.lastActs = acts;
}
