/* ------------------------------ DUNIA HIDUP: REPUTASI FAKSI, EVENT & MISI ------------------------------ */
const FAC = { guild: { n: 'Guild Petualang', d: 'Upah pesanan +5% per peringkat, Seruan Raid lebih murah.' }, serikat: { n: 'Serikat Dagang', d: 'Pajak pasar −0,5% per peringkat.' },
  kuil: { n: 'Kuil Lumiria', d: 'HP maks +2 per peringkat (maks +6), HP maks rekan naik.' }, warga: { n: 'Warga Elnoria', d: 'Harga beli −1% per peringkat. Peringkat 3+: rumah warga menerimamu sampai larut (22.00).' },
  gelap: { n: 'Jaringan Gelap', d: 'Si Gagak membayar +5% per peringkat, membobol +3% per peringkat.' } };
const FRANK = [0, 5, 15, 30, 60], FRANK_N = ['Asing', 'Dikenal', 'Dihormati', 'Terkemuka', 'Legenda'];
const facVal = f => f === 'guild' ? G.rep : ((G.fac || {})[f] || 0);
const facRank = f => { if (!G) return 0; const v = facVal(f); let r = 0; for (let i = 0; i < FRANK.length; i++) if (v >= FRANK[i]) r = i; return r; };
function addRep(f, v) { if (!v) return; const before = facRank(f); if (f === 'guild') G.rep = Math.max(0, G.rep + v); else { G.fac = G.fac || {}; G.fac[f] = Math.max(0, (G.fac[f] || 0) + v); }
  const now = facRank(f); if (now > before) { toast(`${FAC[f].n}: ${FRANK_N[now]}`, FAC[f].d, 'good'); SFX.quest(); } }
function alignRep(v) { G.facAcc = G.facAcc || { kuil: 0, gelap: 0 }; const k = v > 0 ? 'kuil' : 'gelap'; G.facAcc[k] += Math.abs(v) / 4; const n = Math.floor(G.facAcc[k]); if (n) { G.facAcc[k] -= n; addRep(k, n); } }
function saleRep(coins) { G.sellAcc = (G.sellAcc || 0) + coins; addScore('trade', coins); while (G.sellAcc >= 400) { G.sellAcc -= 400; addRep('serikat', 1); } }
const wargaDisc = () => 1 - facRank('warga') * .01;
function repHTML() { return `<div class="note" style="margin-top:0">Reputasi tidak memberi level, tapi membuka keringanan dan akses. Peringkat: ${FRANK_N.map((n, i) => `${n} (${FRANK[i]})`).join(' · ')}.</div>` +
  Object.entries(FAC).map(([f, F]) => { const v = facVal(f), r = facRank(f), nx = FRANK[r + 1], pct = nx ? Math.round((v - FRANK[r]) / (nx - FRANK[r]) * 100) : 100;
    return `<div class="card"><div class="stat" style="border:0"><span><b>${F.n}</b></span><span>${FRANK_N[r]} · ${Math.floor(v)}</span></div><div class="sbar"><i style="width:${pct}%"></i></div><div class="note" style="margin:4px 0 0">${F.d}${nx ? ` Berikutnya di ${nx}.` : ''}</div></div>`; }).join('') +
  `<div class="note">Guild: pesanan, bos, juara mingguan. Serikat: berdagang (tiap 400 koin terjual) & kabar jujur. Kuil: tindakan Cahaya. Warga: misi event & hadiah ke pengembara. Jaringan Gelap: tindakan Bayangan.</div>`; }
/* ---- event dunia baru + misi ---- */
Object.assign(EVENTS, {
  karavan: { n: 'Karavan seberang laut tiba di Corvel', d: 'Pedagang kapal memborong perak dan barang Bumi.', mult: { perak: 1.35, mayones: 1.3, sabun: 1.3, pompa: 1.25 }, dur: 200, good: true },
  wabah: { n: 'Demam hutan menyebar di Mirewood', d: 'Herba, teh herba, dan ramuan dicari di mana-mana.', mult: { herba: 1.6, teh_herba: 1.7, ramuan: 1.4 }, dur: 210 },
  bandit: { n: 'Gerombolan bandit di Jalan Timur', d: 'Jalan antarkota berbahaya. Pandai besi kebanjiran pesanan.', mult: { pedang_besi: 1.25, busur_besi: 1.25, zirah_kulit: 1.3, kulit: 1.2 }, dur: 200 },
  turnamen: { n: 'Turnamen Pemburu Guild', d: 'Siapa yang mengalahkan monster terbanyak selama turnamen?', mult: { roti: 1.15, sup_wortel: 1.15 }, dur: 180, good: true },
});
Object.assign(EV_KEY, { karavan: ['perak', 1, 'Dengar-dengar ada kapal besar mau berlabuh di Corvel.'], wabah: ['herba', 1, 'Katanya banyak warga Mirewood demam.'] });
const MISSION = {
  wabah: { t: 'Antar 3 Teh Herba atau Ramuan ke Mbok Herba (Mirewood)', need: 3, rw: 120, fac: 'warga', fv: 3 },
  bandit: { t: 'Usir 6 bandit di Jalan Timur', need: 6, rw: 110, fac: 'guild', fv: 2 },
  karavan: { t: 'Jual 3 Bijih Perak di pasar Corvel', need: 3, rw: 70, fac: 'serikat', fv: 3 },
  festival: { t: 'Masak 3 makanan untuk Festival Lentera', need: 3, rw: 60, fac: 'warga', fv: 2 },
  turnamen: { t: 'Turnamen: kalahkan monster lebih banyak dari pengembara AI terbaik', need: 0, rw: 200, fac: 'guild', fv: 3 },
};
function onEventStart(id) { if (!MISSION[id]) return; G.mission = { ev: id, have: 0, done: false, t0: G.clock }; if (id === 'turnamen') { G.mission.bot0 = Object.fromEntries(BOTS.map(b => [b.i, b.kills])); }
  if (id === 'bandit') for (let k = 0; k < 4; k++) spawnEnemy({ t: 'bandit', x: 78 + k * 8, y: 31.5, r: 1.5, respawn: 1e9, evb: true }, {});
  toast('Misi event', MISSION[id].t, 'event'); }
function missionProgress(kind, n = 1) { const m = G.mission; if (!m || m.done) return; if (m.ev !== kind) return; m.have += n; const M = MISSION[m.ev]; if (M.need && m.have >= M.need) finishMission(true); }
function finishMission(win) { const m = G.mission, M = MISSION[m.ev]; m.done = true; if (!win) return; G.coin += M.rw; addRep(M.fac, M.fv); SFX.quest(); toast('Misi event selesai!', `+${M.rw} koin · reputasi ${FAC[M.fac].n} +${M.fv}`, 'good'); chat('Sistem', `${G.name} menyelesaikan misi: ${M.t}`, 'sys'); }
function tourneyTop() { const m = G.mission; if (!m || m.ev !== 'turnamen') return null; let best = null, bv = -1; for (const b of BOTS) { const v = b.kills - (m.bot0[b.i] || 0); if (v > bv) { bv = v; best = b; } } return { b: best, v: bv }; }
function onEventEnd(id) { const m = G.mission; if (!m || m.ev !== id || m.done) return; if (id === 'turnamen') { const top = tourneyTop(); const win = m.have > (top ? top.v : 0); finishMission(win);
    chat('Guild', win ? `${G.name} juara Turnamen Pemburu dengan ${m.have} buruan!` : `${top.b.name} juara Turnamen Pemburu (${top.v} buruan)`, 'sys'); if (!win) toast('Turnamen berakhir', `Juara: ${top.b.name} (${top.v}) · kamu ${m.have}`); }
  else { m.done = true; toast('Misi event gagal', 'Peristiwanya sudah berakhir'); }
  for (const e of ENEMIES) if (e.sp.evb) { e.dead = true; e.gone = true; } }
function missionLine() { const m = G.mission; if (!m || m.done || !G.events.some(e => e.id === m.ev)) return null; const M = MISSION[m.ev];
  if (m.ev === 'turnamen') { const top = tourneyTop(); return `${M.t} · kamu ${m.have}, teratas ${top ? `${top.b.name} ${top.v}` : '-'}`; } return `${M.t} (${m.have}/${M.need})`; }
function deliverHerba() { const ids = ['teh_herba', 'ramuan'].filter(i => cnt(i)); if (!ids.length) return toast('Tidak punya Teh Herba / Ramuan'); const m = G.mission; let n = 0;
  for (const id of ids) while (cnt(id) && m.have + n < MISSION.wabah.need) { take(id); n++; } missionProgress('wabah', n); addAlign(2); toast('Diantar', `${n} obat untuk warga Mirewood`); }
