/* ------------------------------ GAME STATE ------------------------------ */
let G = null;
const P = { swing: 0, spin: 0, inv: 0, step: 0, stepT: 0, moving: false, atkCd: 0, regen: 0, actAnim: 0, scd: {}, mpT: 0, critNext: false, holy: 0, cast: 0 };
let ENEMIES = [], DROPS = [], BOLTS = [], PROJ = [], NPCS = [], VILL = [], COMP = null;
const Cam = { x: 0, y: 0 };
const itemName = id => ITEMS[id] ? ITEMS[id].n : id;
const cnt = id => G.inv[id] || 0;
function give(id, n = 1, quiet) { G.inv[id] = cnt(id) + n; if (!quiet) FX.pop(G.x, G.y - 22, `+${n} ${itemName(id)}`, '#bff3ff'); autoEquip(id); }
function take(id, n = 1) { if (cnt(id) < n) return false; G.inv[id] -= n; if (G.inv[id] <= 0) delete G.inv[id]; if (!cnt(id)) { if (G.weapon === id) G.weapon = null; if (G.armor === id) G.armor = null; if (G.charm === id) G.charm = null; } return true; }
const wtype = () => G.weapon ? ITEMS[G.weapon].wt : 'pedang';
function autoEquip(id) { const it = ITEMS[id]; if (!it) return;
  if (it.dmg && (!G.weapon || (ITEMS[G.weapon].wt === it.wt && it.dmg > ITEMS[G.weapon].dmg))) { G.weapon = id; toast(`Dipakai: ${it.n}`, `${WTYPES[it.wt].n} · ${weaponDmg()} dmg`, 'good'); }
  if (it.slot && !G[it.slot === 'armor' ? 'armor' : 'charm']) { equip(id); toast(`Dipakai: ${it.n}`, gearDesc(it), 'good'); }
  if (id === 'beliung_besi' && G.tool !== 'beliung_besi') { G.tool = 'beliung_besi'; toast('Dipakai: Beliung Besi', 'Menambang lebih cepat', 'good'); } }
const weaponDmg = () => stats().atk;
const mpMax = () => stats().mp;
const totalSkill = () => Object.values(G.sk).reduce((a, b) => a + b, 0);
function gelar() { const s = G.sk, a = G.align;
  if (a >= 50) return 'Pembawa Cahaya'; if (a <= -50) return 'Bayang Lumiria';
  if (s.busur >= 12 && s.sihir >= 12) return 'Pemanah Api'; if (s.pedang >= 12 && s.penyembuhan >= 10 && a >= 30) return 'Paladin Lumiria'; if (s.bayangan >= 12 && a <= -30) return 'Pembunuh Bayangan';
  if (s.pandai >= 30 && s.menambang >= 20) return 'Pandai Besi Gunung'; if (s.bertani >= 30 && s.memasak >= 20) return 'Petani Dapur'; if (s.berdagang >= 30) return 'Saudagar Muda';
  if (s.sihir >= 20) return 'Penyihir Muda'; if (s.penyembuhan >= 20) return 'Penyembuh Kuil'; if (s.busur >= 20) return 'Pemanah Gerbang'; if (s.bayangan >= 20) return 'Tangan Licin'; if (s.pedang >= 30) return 'Pendekar Gerbang';
  if (G.kingKills) return 'Penakluk Goblin'; return 'Pengembara Baru'; }
function pathName() { const c = ['pedang', 'busur', 'sihir', 'penyembuhan', 'bayangan'].map(k => [k, G.sk[k]]).sort((a, b) => b[1] - a[1]); if (c[0][1] < 3) return 'Belum memilih jalur';
  const N = { pedang: 'Pendekar', busur: 'Pemanah', sihir: 'Penyihir', penyembuhan: 'Penyembuh', bayangan: 'Bayangan' }; return c[1][1] >= 5 ? `${tr(N[c[0][0]])} + ${tr(N[c[1][0]])}` : N[c[0][0]]; }
const alignName = () => G.align >= 30 ? 'Jalan Cahaya' : G.align <= -30 ? 'Jalan Bayangan' : 'Jalan Tengah';
const ALIGN_D = { 'Jalan Cahaya': 'Regen HP di kota ×2, harga jual +5%, upah pesanan +10%, Pedang Suci terbuka.', 'Jalan Bayangan': 'Copet lebih mudah, Tikaman Bayangan terbuka. Serikat curiga: harga jual −5%, Kuil menolak menyembuhkan.', 'Jalan Tengah': 'Tidak ada bonus atau hukuman khusus. Semua pintu masih terbuka.' };
function addAlign(v) { alignRep(v); const before = alignName(); G.align = clamp(G.align + v, -100, 100); FX.pop(G.x, G.y - 34, v > 0 ? `Cahaya +${v}` : `Bayangan +${-v}`, v > 0 ? '#ffe39a' : '#c8a0ff');
  const now = alignName(); if (now !== before) toast(now === 'Jalan Cahaya' ? 'Kamu menapaki Jalan Cahaya' : now === 'Jalan Bayangan' ? 'Kamu menapaki Jalan Bayangan' : 'Kembali ke Jalan Tengah', ALIGN_D[now], now === 'Jalan Bayangan' ? 'event' : 'good'); }
/*@@S_time@@*/
function newGame(o) {
  G = { v: SAVE_V, name: o.name || 'Pengembara', look: o.look, origin: o.origin, room: 'kuil', x: 10 * T, y: 7 * T, wx: 36.5 * T, wy: 13 * T + 12, dir: 1, hp: TUNE.playerHp, hpMax: TUNE.playerHp, mp: 20, coin: 20,
    inv: {}, sk: { pedang: 0, busur: 0, sihir: 0, penyembuhan: 0, bayangan: 0, bertani: 0, menambang: 0, pandai: 0, memasak: 0, berdagang: 0, pertukangan: 0 }, weapon: null, armor: null, charm: null, skLock: {}, buffs: {}, fac: {}, aff: {}, party: [], tool: 'beliung_tua', loadout: ['tebas_putar', 'lingkar_suci'], align: 0, poison: 0,
    stage: 0, q: { harvest: 0, forged: false, slimes: 0 }, comp: null, plotOwned: true, plotUntil: 0, plot: {}, field: {}, ores: ORES.map(() => ({ hits: 0, cd: 0 })),
    market: {}, flows: {}, lastActs: [], clock: 0, rep: 0, discovered: false, crafted: {}, royalty: 0, events: [], nextEvent: 320, pendingEv: { id: 'festival', at: 150 }, fakeT: 95, waveAt: null, wave: null, kills: 0, kingKills: 0,
    seedSel: null, orders: [], seenStatus: false, firstMarket: false, news: [], cred: .6, newsId: 0, metGagak: false, chop: {}, lastDay: null };
  const og = ORIGINS.find(x => x.id === o.origin) || ORIGINS[0]; for (const k in og.sk) G.sk[k] += og.sk[k];
  for (let y = 15; y <= 20; y++) for (let x = 58; x <= 65; x++) G.field[x + ',' + y] = { crop: y <= 16 ? 'gandum' : y <= 18 ? 'wortel' : 'tomat', t: -999 };
  initMarket(); initCities(); initLand(); rollOrders(); give('roti', 2, true); give('baju_kain', 1, true); G.armor = 'baju_kain'; G.week = { n: 1, hunt: 0, trade: 0, craft: 0 };
  const hb = BOTS.filter(b => b.honest), lb = BOTS.filter(b => !b.honest);
  postRumor('bot', 'sup_wortel', 1, true, 150, pick(hb).i, EV_KEY.festival[2]); postRumor('bot', 'perak', 1, false, 100, pick(lb).i, FAKE_TEXT[0]);
  rebuildWorld(); startWorld(); econTick();
}
/*@@S_market@@*/
const taxRate = () => { let t = .08 - G.sk.berdagang * .0005; if (G.comp === 'mimi') t -= .01; t *= CITY[CUR_CITY].tax; t -= facRank('serikat') * .005; if (civic('pajak') && CUR_CITY === 'lumiria') t -= .01; if (G.events.some(e => EVENTS[e.id].tax)) t *= .5; return Math.max(.02, t); };
const alignSell = () => G.align >= 30 ? 1.05 : G.align <= -30 ? .95 : 1;
const sellPrice = id => Math.max(1, Math.floor(price(id) * (1 - taxRate()) * alignSell()));
const buyPrice = id => Math.ceil(price(id) * 1.12 * (perk('berdagang', 4) ? .92 : perk('berdagang', 2) ? .96 : 1) * wargaDisc());
const orderMul = () => (G.align >= 30 ? 1.1 : G.align <= -30 ? .9 : 1) * (1 + facRank('guild') * .05);
function rollOrders() { const pool = ['gandum', 'wortel', 'tomat', 'tembaga', 'besi', 'roti', 'pisau_tembaga', 'sup_wortel', 'stroberi'];
  while (G.orders.length < 3) { const id = pick(pool); if (G.orders.some(o => o.id === id)) continue; const qty = ITEMS[id].k === 'senjata' || id === 'stroberi' || id === 'sup_wortel' ? irnd(1, 2) : irnd(3, 6);
    G.orders.push({ id, qty, reward: Math.ceil(price(id) * qty * 1.45) }); } }
function startWorld() {
  const ACT = { rowan: () => talkRowan(), sela: () => talkSela(),
    tarno: () => say([{ who: 'tarno', t: 'Landasan sudah panas. Bawa bijihmu, kita tempa sesuatu yang berguna.' }], () => openPanel('forge')),
    rin: () => say([{ who: 'rin', t: 'Lapar? Kompornya boleh kau pakai. Bahan bawa sendiri, ya.' }], () => openPanel('cook')),
    bagas: () => talkBagas(), laut: () => talkLaut(), wira: () => talkWira() };
  NPCS = [{ id: 'bram', room: null, x: 48.6 * T, y: 20.4 * T, dir: 0, act: () => talkBram() }, { id: 'gagak', room: null, x: 23.5 * T, y: 29.7 * T, dir: 3, night: true, act: () => talkGagak() },
    { id: 'doran', room: null, x: 98.6 * T, y: 14.4 * T, dir: 0, act: () => talkTrader('doran', 'karst') }, { id: 'nara', room: null, x: 123.6 * T, y: 31.2 * T, dir: 0, act: () => talkTrader('nara', 'corvel') },
    { id: 'herba', room: null, x: 105.6 * T, y: 75.4 * T, dir: 0, act: () => talkTrader('herba', 'mire') }];
  for (const rid in ROOMS) for (const id in ROOMS[rid].npcs) { const [x, y, reach] = ROOMS[rid].npcs[id]; NPCS.push({ id, room: rid, x: x * T, y: y * T, reach, dir: 0, act: ACT[id] }); }
  VILL = [
    { look: { skin: '#f0c8a8', hair: '#8a5a3a', top: '#6a9a6a', bottom: '#4a4a5a' }, x: 33 * T, y: 24 * T, home: [30, 18, 12, 9] },
    { look: { skin: '#d9a57c', hair: '#202020', style: 'long', top: '#d07a9a', bottom: '#4a3a5a' }, x: 40 * T, y: 20 * T, home: [30, 18, 12, 9] },
    { look: { skin: '#e8b48f', hair: '#5a3a2a', top: '#a07a4a', bottom: '#4a3a2a' }, x: 60 * T, y: 22.5 * T, home: [55, 22, 10, 1] },
  ].map(v => ({ ...v, dir: 0, t: 0, tx: v.x, ty: v.y, step: 0 }));
  ENEMIES = []; DROPS = []; BOLTS = []; PROJ = [];
  for (const s of SPAWNERS) for (let i = 0; i < s.n; i++) spawnEnemy(s);
  compInit(); COMP = G.comp ? { id: G.comp, x: G.x - 12, y: G.y, dir: 0, cd: 0, heal: 0, step: 0, stepT: 0 } : null; placeComp(); snapCam();
}
const npcVisible = n => !n.night || nightAmt() > .55;
/*@@S_spawn@@*/
