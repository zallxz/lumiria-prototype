/* ------------------------------ KOTA, ARBITRASE, PERJALANAN, DUNGEON ------------------------------ */
const CITY = {
  lumiria: { n: 'Lumiria', tax: 1, tm: {}, d: 'Kota awal. Harga dipengaruhi kabar & peristiwa dunia.' },
  karst: { n: 'Karst', tax: 1, d: 'Kota tambang: bijih & batu murah, makanan mahal.', tm: { tembaga: 2.4, besi: 2.4, perak: 2, batu: 2.6, beliung_besi: 1.6, inti: 1.5, roti: .5, sup_wortel: .5, telur_dadar: .5, gandum: .55, wortel: .5, tomat: .5, stroberi: .45, kayu: .6, papan: .6, ikan: .4, ikan_bakar: .4, herba: .6, teh_herba: .5 } },
  corvel: { n: 'Corvel', tax: .6, d: 'Pelabuhan: ikan, telur & minyak murah. Perak dan barang Bumi dicari pedagang laut. Pajak Serikat rendah.', tm: { ikan: 3, telur: 2.2, minyak: 2.5, perak: .35, besi: .6, tembaga: .6, mayones: .4, sabun: .4, pompa: .4, ramuan: .5, stroberi: .5, pedang_besi: .7, pedang_perak: .6, herba: .6, papan: .7, inti: .4 } },
  mire: { n: 'Mirewood', tax: .75, d: 'Desa hutan: kayu & herba melimpah, barang logam langka.', tm: { herba: 3, kayu: 3, papan: 1.7, teh_herba: 2, tembaga: .5, besi: .5, pisau_tembaga: .6, beliung_besi: .6, roti: .6, telur: .6, minyak: .6, ramuan: .45 } },
};
let CUR_CITY = 'lumiria';
const tgtIn = (id, c) => ITEMS[id].tgt * (CITY[c].tm[id] || 1);
function priceIn(id, c) { const it = ITEMS[id]; if (!it.tgt) return it.base; if (c === 'lumiria') return priceFrom(id, G.market[id].stock, evMult(id));
  return clamp(it.base * Math.pow(CITY[c].tm[id] || 1, -.6) * Math.pow(tgtIn(id, c) / Math.max(1, G.cityMk[c][id].stock), it.e) * Math.sqrt(evMult(id)), it.base * .25, it.base * 4); }
const mkC = id => CUR_CITY === 'lumiria' ? G.market[id] : G.cityMk[CUR_CITY][id];
function initCities() { G.cityMk = {}; G.peek = {}; const r = mulberry32(99);
  for (const c in CITY) { if (c === 'lumiria') continue; const m = G.cityMk[c] = {}; for (const id in ITEMS) { const it = ITEMS[id]; if (!it.tgt) continue; const tg = tgtIn(id, c); let s = tg * (.8 + r() * .4); const hist = [];
    for (let i = 0; i < 30; i++) { s += (tg - s) * .08 + (r() - .5) * tg * .08; hist.push(clamp(it.base * Math.pow(CITY[c].tm[id] || 1, -.6) * Math.pow(tg / Math.max(1, s), it.e), it.base * .25, it.base * 4)); } m[id] = { stock: s, hist }; } } peekCity('lumiria'); }
function cityTick() {
  const kurir = BOTS.filter(b => b.role === 'kurir' && !b.down).length;
  for (const c in G.cityMk) for (const id in G.cityMk[c]) { const mk = G.cityMk[c][id], tg = tgtIn(id, c); mk.stock = clamp(mk.stock + (tg - mk.stock) * .06 + rnd(-.03, .03) * tg, tg * .25, tg * 3);
    const lm = G.market[id]; if (lm && kurir) { const gap = priceIn(id, c) / priceIn(id, 'lumiria'); if (gap > 1.15) { mk.stock += tg * .0015 * kurir; lm.stock = Math.max(1, lm.stock - ITEMS[id].tgt * .0008 * kurir); } else if (gap < .87) { mk.stock = Math.max(1, mk.stock - tg * .0015 * kurir); lm.stock += ITEMS[id].tgt * .0008 * kurir; } } }
  if (G.events.some(e => e.id === 'longsor')) for (const id of ['besi', 'tembaga']) G.cityMk.karst[id].stock *= .97;
}
const CITY_RECT = { lumiria: [0, 0, 70, 38], karst: [88, 3, 19, 16], corvel: [112, 16, 28, 30], mire: [98, 63, 18, 17] };
function cityAt(x, y) { const tx = x / T, ty = y / T; for (const c in CITY_RECT) { const [x0, y0, w, h] = CITY_RECT[c]; if (tx >= x0 && tx < x0 + w && ty >= y0 && ty < y0 + h) return c; } return null; }
function openMarket(city) { CUR_CITY = city; peekCity(city); openPanel('market'); }
function peekCity(c) { const p = {}; for (const id of TRADEABLE()) p[id] = Math.round(priceIn(id, c)); G.peek[c] = { day: dayOf(), h: Math.floor(hourOf()), p }; }
function compareHTML() {
  const ids = TRADEABLE().filter(id => !ITEMS[id].q && !ITEMS[id].slot && (!ITEMS[id].dmg || id === 'pedang_besi')), cs = Object.keys(CITY);
  const head = `<div class="row" style="grid-template-columns:minmax(0,1.4fr) repeat(4,minmax(0,1fr));font-weight:800"><span>Barang</span>${cs.map(c => `<span style="text-align:right">${CITY[c].n}${c === CUR_CITY ? ' ●' : ''}<br><small class="muted">${G.peek[c] ? (c === CUR_CITY ? 'sekarang' : `H${G.peek[c].day} ${String(G.peek[c].h).padStart(2, '0')}.00`) : 'belum tahu'}</small></span>`).join('')}</div>`;
  const rows = ids.map(id => { const vals = cs.map(c => c === CUR_CITY ? Math.round(priceIn(id, c)) : G.peek[c] ? G.peek[c].p[id] : null), kn = vals.filter(v => v != null), lo = Math.min(...kn), hi = Math.max(...kn);
    return `<div class="row" style="grid-template-columns:minmax(0,1.4fr) repeat(4,minmax(0,1fr))"><span>${img(id)} ${itemName(id)}</span>${vals.map(v => `<span style="text-align:right;${v == null ? 'color:var(--muted)' : v === lo && hi > lo * 1.2 ? 'color:var(--ok);font-weight:800' : v === hi && hi > lo * 1.2 ? 'color:var(--gold);font-weight:800' : ''}">${v == null ? '?' : fmt(v)}</span>`).join('')}</div>`; }).join('');
  return `<div class="note" style="margin-top:0">Harga kota lain hanya kamu ketahui dari kunjungan terakhir (atau laporan Serikat di Corvel). <b style="color:var(--ok)">Hijau</b> = termurah untuk dibeli, <b style="color:var(--gold)">emas</b> = termahal untuk dijual, kalau selisihnya di atas 20%. Ingat ongkos kereta, pajak kota, dan bandit di jalan.</div><div class="rows">${head}${rows}</div>
    <div class="note">${Object.values(CITY).map(c => `<b>${c.n}</b>: ${c.d} Pajak ×${c.tax}.`).join('<br>')}<br>Kurir AI ikut berdagang antarkota, jadi selisih harga pelan-pelan menyempit. Siapa cepat, dia untung.</div>`; }
/* ---- kereta kuda ---- */
const FARE = { lumiria: { karst: 12, corvel: 14, mire: 12 }, karst: { lumiria: 12, corvel: 12, mire: 16 }, corvel: { lumiria: 14, karst: 12, mire: 14 }, mire: { lumiria: 12, karst: 16, corvel: 14 } };
const CITY_STABLE = { lumiria: 'lumiria', karst: 'karst', corvel: 'corvel', mire: 'mirewood' };
const cargoValue = () => Object.keys(G.inv).filter(id => ITEMS[id] && ITEMS[id].tgt && !ITEMS[id].dmg).reduce((s, id) => s + cnt(id) * priceIn(id, 'lumiria'), 0);
function talkStable(stCity) { const from = Object.keys(CITY_STABLE).find(c => CITY_STABLE[c] === stCity), cv = Math.round(cargoValue()), ins = Math.max(2, Math.ceil(cv * .05));
  say([{ t: `Kereta kuda ${CITY[from].n}. Perjalanan memakan 2 jam. Tanpa asuransi, ada peluang 12% dicegat bandit dan kehilangan 25% barang dagangan (muatanmu ±${fmt(cv)} koin).`,
    choices: [...Object.entries(FARE[from]).map(([to, f]) => [to, f - ((to === 'mire' || from === 'mire') && civic('jembatan') ? 4 : 0)]).map(([to, f]) => ({ t: `${CITY[to].n} · ${f} koin`, f: () => setTimeout(() => say([{ t: `Asuransi muatan ke ${CITY[to].n}: ${ins} koin (5% nilai barang).`, choices: [{ t: `Berangkat + asuransi (${f + ins})`, f: () => travel(from, to, f + ins, true) }, { t: `Berangkat tanpa asuransi (${f})`, f: () => travel(from, to, f, false) }, { t: 'Batal', f: () => {} }] }]), 0) })), { t: 'Tidak jadi', f: () => {} }] }]); }
function travel(from, to, cost, insured) { if (G.coin < cost) return toast('Koin kurang', `Butuh ${cost} koin`); G.coin -= cost; collectDrops(); PROJ = [];
  let lost = ''; if (!insured && cargoValue() > 0 && rand() < (civic('pos') ? .06 : .12)) { const ls = []; for (const id of Object.keys(G.inv)) { const it = ITEMS[id]; if (!it || !it.tgt || it.dmg) continue; const n = Math.ceil(cnt(id) * .25); if (n) { take(id, n); ls.push(`${n} ${it.n}`); } } lost = ls.join(', '); }
  const s = STABLES.find(q => q.city === CITY_STABLE[to]); G.x = s.x * T + 18; G.y = s.y * T + 14; G.dir = 0; advanceTime(2); placeComp(); FX.clear(); snapCam(); fade(); SFX.door();
  if (lost) { toast('Bandit mencegat kereta!', `Hilang: ${lost}. Asuransi akan mencegah ini.`, 'event'); chat('Kabar Jalan', `Kereta ${CITY[from].n}–${CITY[to].n} dicegat bandit`, 'nws'); }
  else toast(`Tiba di ${CITY[to].n}`, insured ? 'Muatan diasuransikan' : '2 jam perjalanan'); peekCity(to); }
/* ---- reruntuhan (dungeon instans) ---- */
function enterDungeon() { collectDrops(); PROJ = []; ENEMIES = ENEMIES.filter(e => !e.sp.dungeon); for (const s of SPAWNERS) if (s.dungeon) for (let i = 0; i < s.n; i++) spawnEnemy(s);
  const r0 = DUN.rooms[0]; G.x = r0.cx * T + 8; G.y = (r0.cy + 1.6) * T; G.dir = 1; placeComp(); FX.clear(); snapCam(); fade(); SFX.door();
  toast('Reruntuhan Tirai · instans', 'Hanya untukmu & rekanmu. Monster tidak muncul lagi sampai kamu masuk ulang. Peti di ruang terakhir terbuka sekali sehari.', 'event'); }
function exitDungeon() { collectDrops(); PROJ = []; G.x = 133 * T + 8; G.y = 93 * T + 4; G.dir = 0; placeComp(); FX.clear(); snapCam(); fade(); SFX.door(); }
function openDunChest() { if (ENEMIES.some(e => e.t === 'golem' && !e.dead)) return toast('Peti tersegel', 'Kalahkan Golem Reruntuhan dulu');
  if (G.dunChest === dayOf()) return toast('Peti kosong', 'Isi lagi besok (reset harian instans)'); G.dunChest = dayOf();
  const k = irnd(120, 180); G.coin += k; give('perak', 2, true); give('papan', 3, true); let extra = ''; if (rand() < .4) { const w = pick(['busur_besi', 'tongkat_perak', 'belati_besi', 'pedang_perak']); give(w, 1, true); extra = ` + ${itemName(w)}`; }
  G.rep += 2; SFX.quest(); FX.burst(G.x, G.y - 20, 40, '#f4c869', 90, .9, 120, { add: true }); toast('Peti Reruntuhan terbuka!', `+${k} koin, 2 Perak, 3 Papan${extra} · +2 reputasi`, 'good'); chat('Sistem', `${G.name} menaklukkan Reruntuhan Tirai`, 'sys'); }
/* ---- menebang ---- */
function canChop(tx, ty) { if (at(tx, ty) !== TL.TREE) return false; if (tx < 2 || ty < 2 || tx >= MW - 2 || ty >= MH - 2) return false; if (plotAt(tx * T + 8, ty * T + 8)) return false;
  const inTown = tx < 70 && ty < 38; if (inTown && !(tx < 14 || ty < 5)) return false; return true; }
function chopTree(tx, ty) { const k = tx + ',' + ty; G.chop = G.chop || {}; if ((G.chop[k] || 0) > G.clock) return toast('Pohon ini baru ditebang', 'Tunas tumbuh lagi sebentar lagi');
  G.chop[k] = G.clock + 120; P.actAnim = .25; const n = 1 + (rand() < .2 + G.sk.pertukangan / 200 ? 1 : 0) + (perk('pertukangan', 2) && rand() < .3 ? 1 : 0); give('kayu', n); train('pertukangan', 8); SFX.harvest();
  FX.burst(tx * T + 8, ty * T + 2, 12, pick(['#4f8a3a', '#7ac05a', '#a07a4a']), 50, .6, 120); FX.shake(.06); }
/* ---- pedagang kota & tukang ---- */
function talkTrader(id, city) { const lines = { doran: 'Bijih di sini murah, roti mahal. Bawa makanan dari Lumiria, pulang bawa besi. Gampang, kan?', nara: 'Kapal dari seberang mencari perak dan barang-barang aneh dari "Bumi". Ikan? Murah meriah di sini.', herba: 'Herba dan kayu kami melimpah. Logam? Itu barang mewah di hutan.' };
  if (id === 'herba' && G.mission && G.mission.ev === 'wabah' && !G.mission.done) return say([{ who: id, t: 'Warga demam semua... Kau bawa teh herba atau ramuan?', choices: [{ t: 'Antar obat', f: () => deliverHerba() }, { t: 'Buka pasar', f: () => openMarket(city) }] }]);
  say([{ who: id, t: lines[id] }], () => openMarket(city)); }
function talkLaut() { say([{ who: 'laut', t: 'Serikat Dagang Corvel mencatat harga semua kota setiap pagi. Laporannya 10 koin. Pedagang yang pintar tidak berjalan buta.', choices: [
  { t: 'Beli laporan harga · 10 koin', f: () => { if (G.coin < 10) return toast('Koin kurang'); G.coin -= 10; for (const c in CITY) peekCity(c); train('berdagang', 10); SFX.ui(); CUR_CITY = 'corvel'; openPanel('market', 'banding'); } },
  { t: 'Buka pasar Corvel', f: () => openMarket('corvel') }, { t: 'Notaris Aset (Lab Web3 · simulasi)', f: () => openPanel('web3', 'notaris') }, { t: 'Tentang asuransi jalan', f: () => say([{ who: 'laut', t: 'Bandit suka menyergap kereta yang membawa banyak barang. Asuransi 5% nilai muatan menjamin barangmu utuh. Jalan kaki? Itu urusanmu sendiri dengan bandit Jalan Timur.' }]) }, { t: 'Pergi', f: () => {} }] }]); }
function talkWira() { say([{ who: 'wira', t: 'Kantor Tanah Guild. Kavling hunian lewat lotre, kavling niaga lewat pajak Harberger. Tidak ada yang boleh memborong Distrik.' }], () => openPanel('land')); }
function talkBagas() { say([{ who: 'bagas', t: 'Mau bangun rumah? Kayu, batu, papan, kapak, semua ada. Meja kerja di pojok boleh dipakai: dua kayu jadi satu papan.' }], () => openPanel('tukang')); }
const TUKANG_ITEMS = ['kayu', 'batu', 'papan'];
function tukangHTML() { const sellK = cnt('kapak') ? '' : `<div class="rec">${img('kapak')}<div><b>Kapak</b> <span class="muted">alat · 25 koin</span><div class="note" style="margin:0">Tebang pohon liar di luar kota untuk kayu. Melatih Pertukangan.</div></div><button class="btn sm gold" data-do="buykapak" ${G.coin >= 25 ? '' : 'disabled'}>Beli 25</button></div>`;
  return `<div class="note" style="margin-top:0">Harga bahan mengikuti pasar Lumiria. Pertukangan ${G.sk.pertukangan}: memotong biaya koin bangunan sampai 40%.</div>${sellK}` +
    TUKANG_ITEMS.map(id => { const bp = buyPrice(id); return `<div class="rec">${img(id)}<div><b>${itemName(id)}</b> <span class="muted">punya ${cnt(id)} · pasar ${fmt(price(id))}</span></div><div class="act" style="display:flex;gap:4px"><button class="btn sm" data-do="buy" data-arg="${id}" ${G.coin >= bp ? '' : 'disabled'}>Beli ${fmt(bp)}</button><button class="btn sm ghost" data-do="buy5" data-arg="${id}" ${G.coin >= bp * 5 ? '' : 'disabled'}>×5</button><button class="btn sm ghost" data-do="sell" data-arg="${id}" ${cnt(id) ? '' : 'disabled'}>Jual ${fmt(sellPrice(id))}</button></div></div>`; }).join('') +
    `<div class="note">Paket rumah pertama: 8 kayu, 6 batu, 4 papan + 40 koin. Kavling didapat dari Kantor Tanah di Distrik Pengembara (timur kota).</div>`; }
