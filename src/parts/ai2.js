/* ------------------------------ PENGEMBARA AI v2: SKILL, PERLENGKAPAN, PARTY, JADWAL, HUBUNGAN ------------------------------ */
const BOT_WT = { pedang: [null, 'pisau_tembaga', 'pedang_besi', 'pedang_perak'], busur: [null, 'busur_latihan', 'busur_besi', 'busur_besi_lb'], tongkat: [null, 'tongkat_sihir', 'tongkat_perak', 'tongkat_perak_lb'], belati: [null, 'belati', 'belati_besi', 'belati_besi_lb'] };
const BOT_AR = [null, 'baju_kain', 'zirah_kulit', 'zirah_besi'], BOT_AR_MAGE = [null, 'baju_kain', 'jubah_sihir', 'jubah_sihir_lb'];
const COMBAT_ROLES = { pemanah: 1, penyihir: 1, pendekar: 1, penyembuh: 1, bayangan: 1, kurir: 1 };
const LIFE_SK = { petani: 'bertani', penambang: 'menambang', pandai: 'pandai', pedagang: 'berdagang', kurir: 'berdagang', tukang: 'pertukangan', sosial: 'memasak' };
const LIKES = { petani: ['pupuk', 'roti', 'benih_stroberi'], penambang: ['roti', 'beliung_besi', 'sup_wortel'], pandai: ['besi', 'perak', 'telur_dadar'], pedagang: ['mayones', 'sabun', 'perak'],
  pemanah: ['busur_besi', 'roti', 'ikan_bakar'], penyihir: ['teh_herba', 'perak', 'herba'], pendekar: ['sup_wortel', 'pedang_besi', 'telur_dadar'], penyembuh: ['herba', 'teh_herba', 'ramuan'],
  bayangan: ['racun', 'perak', 'linggis'], sosial: ['stroberi', 'ikan_bakar', 'mayones'], kurir: ['ikan_bakar', 'roti', 'kain'], tukang: ['papan', 'telur_dadar', 'kayu'] };
function initBotsV2() {
  const r = mulberry32(777);
  for (const b of BOTS) { const combat = COMBAT_ROLES[b.role] ? 1 : 0;
    b.skc = Math.round(5 + r() * (combat ? 35 : 15)); b.skl = Math.round(5 + r() * (combat ? 15 : 35)); b.gw = r() < .5 + combat * .3 ? 1 : 0; if (b.skc > 30 && r() < .4) b.gw = 2; b.ga = r() < .5 ? 1 : 0; if (b.skc > 25 && r() < .3) b.ga = 2;
    b.wallet = Math.round(20 + r() * 100); b.score = { hunt: 0, trade: 0, craft: 0 }; b.kills = 0;
    const owl = b.role === 'bayangan' || r() < .12; b.sched = { wake: owl ? 14 + r() * 3 : 5.5 + r() * 2.5, sleep: owl ? 8 + r() * 2 : (21 + r() * 3.5) % 24, owl };
    botRefresh(b); b.hp = b.hpMax; }
}
const botWeapon = b => BOT_WT[b.wt][b.gw] || null, botArmor = b => (b.role === 'penyihir' || b.role === 'penyembuh' ? BOT_AR_MAGE : BOT_AR)[b.ga] || null;
function botRefresh(b) { const w = botWeapon(b), a = botArmor(b), wi = w && ITEMS[w], ai = a && ITEMS[a];
  b.hpMax = 20 + (ai && ai.hp || 0) + tierOf(b.skc) * 2; b.def = ai && ai.def || 0; b.atk = ((wi ? wi.dmg : 1) + Math.floor(b.skc / 10)) * (1 + tierOf(b.skc) * .06); if (b.hp > b.hpMax) b.hp = b.hpMax; }
const botAtk = b => Math.max(1, Math.round(b.atk * rnd(.8, 1.2)));
function botGain(b, k, diff) { const v = k === 'c' ? b.skc : b.skl; if (v >= 100) return; if (rand() < clamp((diff + 18 - v) / 36, .04, .9)) { if (k === 'c') b.skc++; else b.skl++;
  const nv = k === 'c' ? b.skc : b.skl; if (nv % 20 === 0) { botRefresh(b); if (rand() < .6) botSay(b, `${k === 'c' ? SKILLS[WTYPES[b.wt].sk] : SKILLS[LIFE_SK[b.role] || 'memasak']} ${nv}! akhirnya ${tierName(nv)}`, true); } } }
function botUpgrade(b) { // belanja nyata di pasar Lumiria: permintaan senjata/zirah naik
  const tryBuy = (list, cur, set) => { const nx = list[cur + 1]; if (!nx || !ITEMS[nx] || !G.market[nx]) return false; const p = Math.round(priceIn(nx, 'lumiria')); if (b.wallet < p * 1.2) return false;
    b.wallet -= p; G.market[nx].stock = Math.max(1, G.market[nx].stock - 1); set(); botRefresh(b); if (rand() < .5) botSay(b, pick([`akhirnya kebeli ${itemName(nx)}!`, `upgrade ${itemName(nx)}, ${p} koin melayang`, `${itemName(nx)} baru nih, gas berburu`]), true); return true; };
  if (!tryBuy(BOT_WT[b.wt], b.gw, () => b.gw++)) tryBuy(b.role === 'penyihir' || b.role === 'penyembuh' ? BOT_AR_MAGE : BOT_AR, b.ga, () => b.ga++); }
function botsHourly() {
  const h = hourOf(), meal = [7, 12, 19].includes(Math.floor(h)), food = ['roti', 'sup_wortel', 'telur_dadar', 'ikan_bakar'];
  for (const b of BOTS) { if (b.mode === 'off' || b.down) continue;
    if (b.mode === 'stay' && b.work) { botGain(b, 'l', 14); b.wallet += irnd(2, 6); if (b.role === 'pandai' || b.role === 'tukang') b.score.craft++; }
    if ((b.task === 'market' || b.role === 'kurir') && b.mode !== 'party') { b.wallet += irnd(1, 5); b.score.trade += irnd(3, 12); botGain(b, 'l', 10); }
    if (meal && rand() < .35) { const f = pick(food); const mk = G.market[f]; if (mk && b.wallet > 10) { mk.stock = Math.max(1, mk.stock - .5); b.wallet -= Math.round(priceIn(f, 'lumiria') * .5); } }
    if (rand() < .25) botUpgrade(b); }
}
/* ---- jadwal: pengembara AI juga log off & tidur ---- */
const hourIn = (h, a, b) => a <= b ? h >= a && h < b : h >= a || h < b;
const botOnline = b => hourIn(hourOf(), b.sched.wake, b.sched.sleep);
const onlineBots = () => BOTS.filter(b => b.mode !== 'off');
function schedTick(b) { if (b.down || b.mode === 'party' || b.mode === 'assist') return;
  const on = botOnline(b);
  if (!on && b.mode !== 'off') { if (b.room && G && G.room === b.room) return; b.mode = 'off'; b.room = null; b.task = null; b.work = null; b.x = b.y = -9999; b.bubble = null; }
  else if (on && b.mode === 'off') { const sp = pick([[36.5, 14.4], [36.5, 14.4], [97, 13], [125, 32], [105, 72]]); b.x = sp[0] * T + rnd(-10, 10); b.y = sp[1] * T + rnd(-4, 4); b.room = null; b.hp = b.hpMax; assignTask(b); if (rand() < .08) botSay(b, pick(['pagi semua', 'login dulu', 'halo server', 'baru on, ada event apa?']), true); } }
function schedWeights(b) { const w = { ...ROLES[b.role].w }, h = hourOf();
  if (hourIn(h, 11, 13.5)) { w.cook = (w.cook || 0) + 4; w.market = (w.market || 0) + 2; w.corvel_inn = (w.corvel_inn || 0) + 1; }
  else if (hourIn(h, 17.5, 21.5)) { w.plaza = (w.plaza || 0) + 4; w.news = (w.news || 0) + 2; w.statue = (w.statue || 0) + 2; for (const k in HUNT) if (w[k]) w[k] *= .4; }
  else if (hourIn(h, 21.5, 5)) { for (const k of ['field', 'mine', 'karstmine', 'distrik']) if (w[k]) w[k] *= .3; w.plaza = (w.plaza || 0) + 1; }
  if (G && G.events.some(e => e.id === 'bandit')) { if (COMBAT_ROLES[b.role]) w.bandit = (w.bandit || 0) + 4; }
  return w; }
/* ---- hubungan ---- */
const aff = b => (G.aff && G.aff[b.i]) || 0;
function addAff(b, v) { G.aff = G.aff || {}; const before = relName(aff(b)); G.aff[b.i] = clamp(aff(b) + v, -100, 100); const now = relName(aff(b)); if (now !== before && Math.abs(v) >= 1) toast(`${b.name}: ${now}`, `Hubungan ${aff(b) > 0 ? '+' : ''}${Math.round(aff(b))}`); }
function relName(v) { return v >= 50 ? 'Sahabat' : v >= 20 ? 'Teman' : v > -10 ? 'Kenalan' : v > -40 ? 'Tidak suka' : 'Musuh'; }
function talkBot(b) {
  botFace(b, G.x - b.x, G.y - b.y); if (b.mode === 'path' || b.mode === 'local') { b.mode = 'stay'; b.work = null; } if (b.mode !== 'party') b.stay = Math.max(b.stay, 6);
  const a = aff(b), info = { n: b.name, sub: `${ROLES[b.role].n} · ${relName(a)} (${Math.round(a)})`, look: b.look }, inParty = G.party && G.party.some(p => p.i === b.i), today = dayOf();
  const w = botWeapon(b), ar = botArmor(b), gear = `${w ? itemName(w) : 'Tangan kosong'} · ${ar ? itemName(ar) : 'tanpa zirah'} · ${SKILLS[WTYPES[b.wt].sk]} ${b.skc} (${tierName(b.skc)})`;
  if (a <= -40) return say([{ info, t: pick(['Pergi sana. Aku tidak lupa apa yang kau lakukan.', 'Jangan dekat-dekat dompetku.']), choices: [{ t: 'Minta maaf (hadiah)', f: () => giftMenu(b) }, { t: 'Pergi', f: () => {} }] }]);
  const ch = [];
  if (!inParty) ch.push({ t: 'Ajak ke party', f: () => inviteBot(b) }); else ch.push({ t: 'Keluarkan dari party', f: () => leaveParty(b, true) });
  if ((G.talked || {})[b.i] !== today) ch.push({ t: 'Ngobrol', f: () => chatBot(b) });
  ch.push({ t: 'Beri hadiah', f: () => giftMenu(b) });
  if (a >= 10) ch.push({ t: `Beli dagangannya (−10%)`, f: () => buyFromBot(b) });
  if (a >= 20) ch.push({ t: 'Minta tips dagang', f: () => tipBot(b) });
  ch.push({ t: 'Copet diam-diam (Bayangan)', f: () => stealBot(b) }, { t: 'Sampai jumpa', f: () => {} });
  say([{ info, t: `${pick(a >= 50 ? ['Eh sahabatku! Ada apa?', 'Wah, kamu lagi!'] : a >= 20 ? ['Halo teman! Butuh sesuatu?'] : [`Halo! Aku ${b.name}.`, 'Ya? Ada perlu?'])} ${TIPS[b.role]}`, choices: [{ t: 'Lanjut', f: () => {} }] },
    { info, t: `Perlengkapanku: ${gear}. Kabarku di papan: ${b.posts} dipasang, ${b.proven} terbukti.`, choices: ch }]);
}
function chatBot(b) { G.talked = G.talked || {}; G.talked[b.i] = dayOf(); addAff(b, 2); const info = { n: b.name, sub: ROLES[b.role].n, look: b.look };
  say([{ info, t: pick([`Minggu ini aku sudah ${b.score.hunt} buruan. Kamu?`, `Dompetku tinggal ${b.wallet} koin, mau upgrade ${itemName(BOT_WT[b.wt][b.gw + 1] || 'pedang_perak')}.`, 'Aku biasanya tidur jam ' + Math.floor(b.sched.sleep) + '. Server sepi kalau malam.', `Kata orang Corvel, ${itemName(pick(ROLES[b.role].items))} lagi dicari.`, 'Seru juga ngobrol sama kamu.']) }]); }
function giftMenu(b) { const likes = LIKES[b.role] || [], own = Object.keys(G.inv).filter(id => cnt(id) > 0 && ITEMS[id] && !isGear(ITEMS[id])).sort((x, y) => (likes.includes(y) ? 1 : 0) - (likes.includes(x) ? 1 : 0)).slice(0, 5);
  if ((G.gifted || {})[b.i] === dayOf()) return toast('Sudah memberi hadiah hari ini');
  if (!own.length) return toast('Tidak ada barang untuk dihadiahkan');
  say([{ info: { n: b.name, sub: `Suka: ${likes.map(itemName).join(', ')}`, look: b.look }, t: 'Mau kasih apa?', choices: [...own.map(id => ({ t: `${itemName(id)}${likes.includes(id) ? ' ♥' : ''}`, f: () => giveGift(b, id) })), { t: 'Batal', f: () => {} }] }]); }
function giveGift(b, id) { take(id); G.gifted = G.gifted || {}; G.gifted[b.i] = dayOf(); const liked = (LIKES[b.role] || []).includes(id), food = ITEMS[id].heal; const v = liked ? 12 : food ? 5 : 2; addAff(b, v); addRep('warga', liked ? 1 : 0);
  botSay(b, liked ? pick([`wah ${itemName(id)}! makasih banyak ${G.name}`, 'ini favoritku! kok tau?']) : pick(['makasih ya', 'hehe lumayan']), true); SFX.ui(); }
function buyFromBot(b) { const id = pick(ROLES[b.role].items), p = Math.max(1, Math.round(priceIn(id, 'lumiria') * .9)); if (G.coin < p) return toast('Koin kurang', `${itemName(id)} ${p} koin`);
  G.coin -= p; b.wallet += p; give(id, 1); addAff(b, 1); b.score.trade += p; SFX.coin(); toast(`Beli ${itemName(id)} dari ${b.name}`, `${p} koin (10% di bawah pasar)`); }
function tipBot(b) { const ids = TRADEABLE().filter(i => !ITEMS[i].q), id = ROLES[b.role].items.find(i => ids.includes(i)) || pick(ids), cs = Object.keys(CITY), pr = cs.map(c => [c, priceIn(id, c)]).sort((x, y) => x[1] - y[1]);
  for (const c of cs) peekCity(c); toast('Tips dari ' + b.name, `${itemName(id)} termurah di ${CITY[pr[0][0]].n} (${fmt(pr[0][1])}), termahal di ${CITY[pr[pr.length - 1][0]].n} (${fmt(pr[pr.length - 1][1])})`, 'good'); addAff(b, 1); }
/* ---- party ---- */
const partyCap = () => (G.party || []).some(p => p.raid) ? 5 : 3;
function inviteBot(b) { G.party = G.party || []; if (G.party.length >= partyCap()) return toast('Party penuh', `Maksimal ${partyCap()} pengembara AI`);
  if (b.down) return toast(`${b.name} sedang pingsan`);
  const a = aff(b), ch = clamp(.25 + a / 80 + G.rep * .01 + (COMBAT_ROLES[b.role] ? .2 : -.15) + (a >= 50 ? 1 : 0), 0, .97);
  if (rand() > ch) { addAff(b, -1); return botSay(b, pick(['maaf lagi sibuk', `lain kali ya ${G.name}`, 'aku lagi grinding sendiri', 'belum kenal banget sih hehe']), true); }
  joinParty(b, false); botSay(b, pick(['gas! aku ikut', 'oke party!', `siap ${G.name}, aku di belakangmu`]), true); }
function joinParty(b, raid) { G.party = G.party || []; G.party.push({ i: b.i, until: G.clock + (raid ? 24 : 12) * HOUR_S, raid }); b.mode = 'party'; b.room = null; b.task = 'party'; b.work = null; b.stay = 0; if (b.x < 0) { b.x = G.x + rnd(-20, 20); b.y = G.y + 14; } }
function leaveParty(b, byMe) { G.party = (G.party || []).filter(p => p.i !== b.i); if (b.mode === 'party') { b.mode = 'stay'; b.stay = 3; assignTask(b); } if (byMe) botSay(b, 'oke, sampai ketemu lagi!', true); }
const partyBots = () => (G.party || []).map(p => BOTS[p.i]).filter(Boolean);
function partyTeleport() { partyBots().forEach((b, k) => { if (b.down) return; b.room = null; b.x = G.x + (k - 1) * 14; b.y = G.y + 12; }); }
function raidCall() { const cost = Math.max(15, 30 - facRank('guild') * 4); if (G.coin < cost) return toast('Koin kurang', `Seruan raid ${cost} koin`); G.party = G.party || [];
  const pool = onlineBots().filter(b => COMBAT_ROLES[b.role] && !b.down && b.mode !== 'party' && aff(b) > -10).sort((x, y) => (y.skc + y.gw * 15 + y.ga * 10) - (x.skc + x.gw * 15 + x.ga * 10));
  const n = Math.min(4, 5 - G.party.length); if (!pool.length || n <= 0) return toast('Tidak ada yang menjawab', 'Coba saat server lebih ramai (siang)');
  G.coin -= cost; for (const b of pool.slice(0, n)) { joinParty(b, true); b.x = G.x + rnd(-30, 30); b.y = G.y + rnd(10, 20); }
  for (const p of G.party) p.raid = true; chat('Guild', `${G.name} memanggil raid! ${pool.slice(0, n).map(b => b.name).join(', ')} bergabung.`, 'sys'); SFX.quest(); toast('Party raid terbentuk', `${n} pengembara AI ikut selama 1 hari · party maks 5`, 'good'); }
function botParty(b, dt, k) {
  if (G.room) { return; } const tx = G.x + [-16, 16, -26, 26, 0][k % 5], ty = G.y + [10, 10, 2, 2, 18][k % 5], d = Math.hypot(tx - b.x, ty - b.y);
  if (d > 280) { b.x = tx; b.y = ty; return; }
  b.scan -= dt; if (b.scan <= 0) { b.scan = .3; let best = null, bd = 110; for (const e of ENEMIES) { if (e.dead) continue; const de = Math.hypot(e.x - G.x, e.y - G.y); if (de < bd) { bd = de; best = e; } } b.foe = best; }
  if (b.role === 'penyembuh' && b.atkCd <= 0 && G.hp < G.hpMax * .7) { b.atkCd = 4; const amt = 3 + tierOf(b.skc); G.hp = Math.min(G.hpMax, G.hp + amt); FX.pop(G.x, G.y - 26, '+' + amt, '#9fffcf'); FX.burst(G.x, G.y - 8, 10, '#9fffcf', 30, .7, -40, { add: true }); botGain(b, 'c', 12); }
  if (b.foe && !b.foe.dead) { botHunt(b, dt, b.foe); return; }
  if (d > 8) { moveActor(b, (tx - b.x) / d * Math.min(b.spd * 1.3, d * 6) * dt, (ty - b.y) / d * Math.min(b.spd * 1.3, d * 6) * dt, 'bot', null); botFace(b, tx - b.x, ty - b.y); b.moving = true; botWalk(b, dt); }
}
function partyTick() { if (!G.party || !G.party.length) return; for (const p of [...G.party]) { const b = BOTS[p.i]; if (!b) continue; if (G.clock > p.until) { leaveParty(b); botSay(b, pick(['aku cabut dulu ya, makasih party-nya!', 'capek, log off dulu']), true); } } }
/* ---- bantuan melawan bos ---- */
function bossAssist() { const boss = ENEMIES.find(e => !e.dead && e.d.boss && e.pHit && e.st !== 'idle' && e.st !== 'return' && Math.hypot(e.x - G.x, e.y - G.y) < 200); if (!boss) return;
  if (!boss.called) { boss.called = true; chat(G.name, `${boss.d.n} diserang! yang dekat bantu dong!`); }
  for (const b of BOTS) { if (b.mode === 'off' || b.down || b.mode === 'party' || b.room || !COMBAT_ROLES[b.role] && !HUNT[b.task]) continue; if (Math.hypot(b.x - boss.x, b.y - boss.y) > 420 || b.mode === 'assist') continue;
    if (aff(b) < -20) continue; b.mode = 'assist'; b.foe = boss; b.work = null; if (rand() < .3) botSay(b, pick(['OTW bos!', 'bantu!!', `serbu ${boss.d.n}!`]), true); } }
function botAssist(b, dt) { const e = b.foe; if (!e || e.dead || e.st === 'return' || e.st === 'idle') { if (e && e.dead && rand() < .5) botSay(b, pick(['GG!', 'mantap tim!', 'bos tumbang!']), true); if (e && e.dead) { botGain(b, 'c', 40); b.wallet += irnd(10, 25); addAff(b, 3); } b.mode = 'stay'; b.stay = 2; assignTask(b); return; } botHunt(b, dt, e); }
/* ---- peringkat mingguan ---- */
const weekOf = () => Math.floor((dayOf() - 1) / 7) + 1;
function weekScore(k) { G.week = G.week || { n: weekOf(), hunt: 0, trade: 0, craft: 0 }; return G.week[k]; }
function addScore(k, v) { weekScore(k); G.week[k] += v; }
function rankList(k) { const list = onlineBots().concat(BOTS.filter(b => b.mode === 'off')).map(b => ({ n: b.name, v: b.score[k], b })); list.push({ n: G.name, v: weekScore(k), me: true }); return list.sort((x, y) => y.v - x.v); }
function weekRollover() { G.week = G.week || { n: weekOf(), hunt: 0, trade: 0, craft: 0 }; if (G.week.n === weekOf()) return;
  const prizes = [300, 150, 80].map(v => v * (civic('hadiah') ? 2 : 1)), names = { hunt: 'Pemburu', trade: 'Saudagar', craft: 'Pengrajin' }, msgs = [];
  for (const k of ['hunt', 'trade', 'craft']) { const l = rankList(k), pos = l.findIndex(x => x.me); msgs.push(`${names[k]}: ${l[0].n}`);
    if (pos >= 0 && pos < 3 && l[pos].v > 0) { G.coin += prizes[pos]; addRep('guild', 3 - pos); G.titles = G.titles || []; if (pos === 0) G.titles.push(`Juara ${names[k]} Minggu ${G.week.n}`); toast(`Peringkat ${pos + 1} ${names[k]} minggu ${G.week.n}!`, `+${prizes[pos]} koin`, 'good'); } }
  chat('Guild', `Juara minggu ${G.week.n} · ${msgs.join(' · ')}`, 'sys'); G.week = { n: weekOf(), hunt: 0, trade: 0, craft: 0 }; for (const b of BOTS) b.score = { hunt: 0, trade: 0, craft: 0 }; }
function rankHTML() { const cat = Panel.tab || 'hunt', names = { hunt: 'Pemburu (monster dikalahkan)', trade: 'Saudagar (koin dari dagang)', craft: 'Pengrajin (barang dibuat)' }, l = rankList(cat), me = l.findIndex(x => x.me);
  return `<div class="note" style="margin-top:0">Peringkat minggu ${weekOf()} · reset tiap 7 hari in-game. Juara 1–3 tiap kategori dapat 300/150/80 koin + reputasi Guild, juara 1 dapat gelar.</div><h5>${names[cat]}</h5>` +
    l.slice(0, 10).map((x, i) => `<div class="stat" ${x.me ? 'style="color:var(--gold)"' : ''}><span>${i + 1}. ${esc(x.n)}${x.b ? ` <span class="muted" style="font-size:11px">${ROLES[x.b.role].n}</span>` : ''}</span><span>${fmt(x.v)}</span></div>`).join('') +
    (me >= 10 ? `<div class="stat" style="color:var(--gold)"><span>${me + 1}. ${esc(G.name)}</span><span>${fmt(l[me].v)}</span></div>` : ''); }
function socialHTML() { const party = partyBots(), top = BOTS.filter(b => aff(b) !== 0).sort((x, y) => aff(y) - aff(x)).slice(0, 12);
  const row = b => `<div class="stat"><span>${esc(b.name)} <span class="muted" style="font-size:11px">${ROLES[b.role].n} · ${b.mode === 'off' ? 'offline' : 'online'}</span></span><span>${relName(aff(b))} ${Math.round(aff(b))}</span></div>`;
  return `<h5 style="margin-top:0">Party (${party.length}/${partyCap()})</h5>${party.map(b => `<div class="stat"><span>${esc(b.name)} <span class="muted" style="font-size:11px">${ROLES[b.role].n} · HP ${Math.ceil(b.hp)}/${b.hpMax} · ${SKILLS[WTYPES[b.wt].sk]} ${b.skc}</span></span><span><button class="btn sm ghost" data-do="kick" data-arg="${b.i}">Keluarkan</button></span></div>`).join('') || '<div class="note">Belum ada. Sapa pengembara AI lalu ajak ke party, atau pakai Seruan Raid di papan Guild.</div>'}
    <h5>Hubungan</h5>${top.map(row).join('') || '<div class="note">Belum kenal siapa-siapa. Ngobrol, beri hadiah, bangunkan yang pingsan.</div>'}
    <div class="note">Kenalan → Teman (20): mau berbagi tips harga & menjual dagangannya lebih murah. Sahabat (50): selalu mau diajak party. Mencopet atau membobol membuat mereka membencimu.</div>`; }
