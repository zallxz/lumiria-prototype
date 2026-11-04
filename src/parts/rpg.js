/* ------------------------------ INTI RPG: ATRIBUT, PERLENGKAPAN, MASTERY ------------------------------ */
// Tidak ada level & EXP karakter. Kekuatan = perlengkapan + mastery skill + buff makanan + reputasi.
Object.assign(ITEMS, {
  kulit: { n: 'Kulit Serigala', k: 'bahan', base: 14, tgt: 30, e: .6 }, taring: { n: 'Taring', k: 'bahan', base: 18, tgt: 20, e: .6 }, kain: { n: 'Kain Tenun', k: 'bahan', base: 12, tgt: 30, e: .6 },
  baju_kain: { n: 'Baju Kain', k: 'zirah', slot: 'armor', base: 20, tgt: 12, e: .6, def: 1, d2: 'Ringan. Tanpa penalti.' },
  zirah_kulit: { n: 'Zirah Kulit', k: 'zirah', slot: 'armor', base: 70, tgt: 10, e: .7, def: 2, hp: 2, d2: 'Seimbang untuk semua jalur.' },
  zirah_besi: { n: 'Zirah Besi', k: 'zirah', slot: 'armor', base: 160, tgt: 6, e: .8, def: 4, hp: 4, spd: -.08, mreg: -.5, d2: 'Paling tebal, tapi lambat dan menghambat aliran mana.' },
  jubah_sihir: { n: 'Jubah Penyihir', k: 'zirah', slot: 'armor', base: 120, tgt: 6, e: .8, def: 1, mp: 10, mreg: .5, mag: .12, d2: 'Mana +10, sihir +12%.' },
  jubah_bayangan: { n: 'Jubah Bayangan', k: 'zirah', slot: 'armor', base: 120, tgt: 6, e: .8, def: 1, crit: .06, spd: .05, d2: 'Kritikal +6%, gerak +5%.' },
  jimat_perak: { n: 'Jimat Perak', k: 'aksesori', slot: 'charm', base: 140, tgt: 5, e: .8, hp: 5, d2: 'HP +5.' },
  cincin_embun: { n: 'Cincin Embun', k: 'aksesori', slot: 'charm', base: 110, tgt: 5, e: .8, mreg: 1, mp: 4, d2: 'Regen mana ×2.' },
  kalung_taring: { n: 'Kalung Taring', k: 'aksesori', slot: 'charm', base: 90, tgt: 6, e: .8, atk: 1, crit: .03, d2: 'Serangan +1, kritikal +3%.' },
});
RECIPES.forge.push({ out: 'zirah_besi', need: { besi: 5 }, diff: 26 }, { out: 'jimat_perak', need: { perak: 2 }, diff: 30 }, { out: 'cincin_embun', need: { perak: 1, herba: 2 }, diff: 24 });
RECIPES.bench.push({ out: 'baju_kain', need: { kain: 2 }, diff: 4 }, { out: 'zirah_kulit', need: { kulit: 4 }, diff: 14 }, { out: 'jubah_sihir', need: { kain: 3, herba: 2 }, diff: 22 },
  { out: 'jubah_bayangan', need: { kain: 3, kulit: 1 }, diff: 22 }, { out: 'kalung_taring', need: { taring: 3, tembaga: 1 }, diff: 16 });
Object.assign(MON.wolf, { def: 1, drop: { kulit: .45, taring: .2 } }); Object.assign(MON.bandit, { def: 2, drop: { besi: .2, kulit: .25, kain: .3 } });
Object.assign(MON.goblin, { def: 1 }); Object.assign(MON.king, { def: 3 }); Object.assign(MON.golem, { def: 5 });
CITY.corvel.tm.kain = 3; CITY.karst.tm.kulit = .5; CITY.mire.tm.kulit = 1.6; CITY.mire.tm.taring = 1.5;
// kualitas hasil tempa: Biasa / Bagus / Luar Biasa (varian item sungguhan, bisa dijual)
const QUAL = [{ s: '', n: '', m: 1 }, { s: '_b', n: ' (Bagus)', m: 1.15 }, { s: '_lb', n: ' (Luar Biasa)', m: 1.3 }];
const isGear = it => it && (it.dmg || it.slot);
for (const id of Object.keys(ITEMS)) { const it = ITEMS[id]; if (!isGear(it) || it.q) continue;
  for (const q of [1, 2]) { const v = { ...it, n: it.n + QUAL[q].n, base: Math.round(it.base * (q === 1 ? 1.45 : 2)), tgt: Math.max(2, Math.round((it.tgt || 6) * .3)), baseId: id, q };
    for (const k of ['dmg', 'def', 'hp', 'mp', 'atk']) if (it[k]) v[k] = Math.round(it[k] * QUAL[q].m * 10) / 10; if (it.crit) v.crit = +(it.crit * QUAL[q].m).toFixed(3); ITEMS[id + QUAL[q].s] = v; } }
const baseOf = id => (ITEMS[id] && ITEMS[id].baseId) || id;
/* ---- mastery: tingkatan skill (bukan level karakter) ---- */
const TIERS = ['Pemula', 'Murid', 'Mahir', 'Ahli', 'Master', 'Grandmaster'];
const tierOf = v => Math.min(5, Math.floor(v / 20)), tierName = v => TIERS[tierOf(v)];
const PERKS = {
  pedang: ['+6% damage pedang per tingkatan', [2, 'HP maks +4'], [4, 'Jeda Tebasan Putar −1,5 dtk']],
  busur: ['+6% damage busur per tingkatan', [2, 'Kritikal +5%'], [4, 'Hujan Panah +2 anak panah']],
  sihir: ['+6% damage sihir per tingkatan', [2, 'Mana maks +10'], [4, 'Biaya mana −25%']],
  penyembuhan: ['Penyembuhan makin besar', [2, 'Regen HP ×1,5'], [4, 'Semua penyembuhan +50%']],
  bayangan: ['+6% damage belati per tingkatan', [2, 'Kritikal +5%'], [4, 'Copet & bobol +10%']],
  bertani: ['Panen lebih mudah', [2, '20% peluang panen ganda'], [4, '35% peluang panen ganda']],
  menambang: ['Tambang lebih cepat', [2, '10% peluang bijih ganda'], [4, '25% peluang bijih ganda']],
  pandai: ['Peluang tempaan Bagus/Luar Biasa', [2, 'Kualitas Bagus lebih sering'], [4, 'Kualitas Luar Biasa terbuka penuh']],
  memasak: ['Buff makanan', [2, 'Durasi buff +50%'], [4, 'Makanan memulihkan ×1,5']],
  berdagang: ['Pajak pasar turun', [2, 'Harga beli −4%'], [4, 'Harga beli −8%']],
  pertukangan: ['Biaya bangunan turun', [2, '+1 kayu saat menebang (30%)'], [4, 'Kualitas zirah/aksesori meja kerja naik']],
};
const perk = (k, t) => tierOf(G.sk[k]) >= t;
/* ---- buff makanan ---- */
const FOOD_BUFF = { roti: ['kenyang', 'Kenyang: pertahanan +1', 120], sup_wortel: ['hangat', 'Hangat: regen HP ×2', 150], telur_dadar: ['tenaga', 'Bertenaga: serangan +1', 120],
  teh_herba: ['jernih', 'Pikiran jernih: regen mana ×2', 150], ikan_bakar: ['lincah', 'Lincah: gerak +8%', 120], mayones: ['tenaga', 'Bertenaga: serangan +1', 90] };
function eatFood(id) { const it = ITEMS[id]; take(id); const mul = perk('memasak', 4) ? 1.5 : 1; G.hp = Math.min(G.hpMax, G.hp + Math.round(it.heal * mul)); const b = FOOD_BUFF[id];
  if (b) { G.buffs = G.buffs || {}; G.buffs[b[0]] = b[2] * (perk('memasak', 2) ? 1.5 : 1); toast(b[1], `${Math.round(G.buffs[b[0]])} dtk`); } SFX.harvest(); FX.burst(G.x, G.y - 8, 10, '#ff9fbe', 40, .6, 60); }
const buff = k => G.buffs && G.buffs[k] > 0;
/* ---- atribut ---- */
function gearOf() { return [G.weapon, G.armor, G.charm].filter(id => id && ITEMS[id] && cnt(id) > 0).map(id => ITEMS[id]); }
function stats() {
  const g = gearOf(), sum = k => g.reduce((s, it) => s + (it[k] || 0), 0), wt = wtype(), wsk = WTYPES[wt].sk;
  const hp = TUNE.playerHp + sum('hp') + (perk('pedang', 2) ? 4 : 0) + Math.min(6, facRank('kuil') * 2);
  const mp = 20 + Math.floor(G.sk.sihir / 4) + Math.floor(G.sk.penyembuhan / 4) + sum('mp') + (perk('sihir', 2) ? 10 : 0);
  const wdmg = G.weapon && ITEMS[G.weapon] ? ITEMS[G.weapon].dmg : 1, tierMul = 1 + tierOf(G.sk[wsk]) * .06 + (wt === 'tongkat' ? sum('mag') : 0);
  const atk = (wdmg + Math.floor(G.sk[wsk] / 10) + sum('atk') + (buff('tenaga') ? 1 : 0) + (G.poison > 0 ? 3 : 0)) * tierMul;
  const def = sum('def') + (buff('kenyang') ? 1 : 0);
  const crit = .06 + G.sk[wsk] / 300 + sum('crit') + (perk('busur', 2) && wt === 'busur' ? .05 : 0) + (perk('bayangan', 2) ? .05 : 0) + (wt === 'belati' ? .15 + G.sk.bayangan / 200 : 0);
  const spd = 1 + sum('spd') + (buff('lincah') ? .08 : 0);
  const mreg = Math.max(.25, 1 + sum('mreg') + (buff('jernih') ? 1 : 0)), hreg = (perk('penyembuhan', 2) ? 1.5 : 1) * (buff('hangat') ? 2 : 1);
  return { hp, mp, atk: Math.round(atk * 10) / 10, def, crit: Math.min(.6, crit), spd, mreg, hreg, mcost: perk('sihir', 4) ? .75 : 1, heal: perk('penyembuhan', 4) ? 1.5 : 1 };
}
function refreshStats() { const s = stats(); if (s.hp !== G.hpMax) { G.hp = Math.min(s.hp, G.hp + Math.max(0, s.hp - G.hpMax)); G.hpMax = s.hp; } if (G.mp > s.mp) G.mp = s.mp; return s; }
const mitig = def => 10 / (10 + Math.max(0, def));
function equip(id) { const it = ITEMS[id]; if (!id) { G.weapon = null; return; } if (!it) return;
  if (it.dmg) G.weapon = id; else if (it.slot === 'armor') G.armor = id; else if (it.slot === 'charm') G.charm = id; refreshStats(); }
function unequip(slot) { if (slot === 'armor') G.armor = null; else if (slot === 'charm') G.charm = null; else G.weapon = null; refreshStats(); }
const gearScore = it => (it.def || 0) * 3 + (it.hp || 0) + (it.mp || 0) * .4 + (it.atk || 0) * 3 + (it.crit || 0) * 40;
/* ---- kunci skill: naik / turun / kunci, total 700 ---- */
const SKILL_CAP = 700;
function skillGain(k) { const lk = (G.skLock || {})[k] || 'up'; if (lk !== 'up' || G.sk[k] >= 100) return false;
  if (totalSkill() >= SKILL_CAP) { const down = Object.keys(G.sk).find(s => s !== k && (G.skLock || {})[s] === 'down' && G.sk[s] > 0); if (!down) { if (!G.capWarn) { G.capWarn = 1; toast('Total skill 700 tercapai', 'Tandai skill lain ↓ di tab Skill supaya bisa ditukar'); } return false; } G.sk[down]--; }
  G.sk[k]++; return true; }
/* ---- skala dunia: monster tidak mengikuti pemain, tapi wilayah ---- */
function dangerAt(tx, ty) { if (tx < 72 && ty > 58) return { m: 1.6, n: 'Instans' }; if (tx >= 124 && ty >= 82) return { m: 1.6, n: 'Reruntuhan' }; if (tx >= 72 && ty >= 53) return { m: 1.45, n: 'Mirewood' };
  if (tx >= 72 && ty < 31) return { m: 1.2, n: 'Karst' }; if (tx >= 70) return { m: 1.2, n: 'Jalan Timur' }; return { m: 1, n: 'Lumiria' }; }
const edmg = e => Math.max(1, Math.round(e.d.dmg * (e.dm || 1)));
function scaleEnemy(e, opt) { const z = dangerAt(e.sp.x, e.sp.y); let hm = z.m * (opt.hpMul || 1), dm = z.m > 1 ? 1 + (z.m - 1) * .7 : 1;
  if (!e.d.boss && !opt.wave && rand() < .07) { e.elite = true; hm *= 2; dm *= 1.4; } e.hp = e.max = Math.round(e.d.hp * hm); e.dm = dm; e.def = (e.d.def || 0) + (z.m > 1.3 ? 1 : 0); }
function qualityRoll(sk) { const v = G.sk[sk], lb = clamp((v - 35) / 180, 0, .35) + (sk === 'pertukangan' && perk('pertukangan', 4) ? .08 : 0), b = clamp((v - 5) / 110, .05, .6) + (sk === 'pandai' && perk('pandai', 2) ? .1 : 0);
  const r = rand(); return r < lb ? 2 : r < lb + b ? 1 : 0; }
function attrHTML() { const s = stats();
  const row = (n, v, d) => `<div class="stat"><span>${n}${d ? ` <span class="muted" style="font-size:11px">${d}</span>` : ''}</span><span>${v}</span></div>`;
  return `<div class="card"><h5 style="margin-top:0">Atribut</h5>${row('HP maks', s.hp)}${row('Mana maks', s.mp)}${row('Serangan', s.atk, WTYPES[wtype()].n)}${row('Pertahanan', s.def, `kurangi damage ${Math.round((1 - mitig(s.def)) * 100)}%`)}
    ${row('Kritikal', Math.round(s.crit * 100) + '%')}${row('Kecepatan gerak', Math.round(s.spd * 100) + '%')}${row('Regen mana', '×' + s.mreg.toFixed(2).replace(/\.?0+$/, ''))}${row('Regen HP', '×' + s.hreg)}
    ${Object.keys(G.buffs || {}).filter(buff).map(k => `<span class="chip good">${k} · ${Math.ceil(G.buffs[k])} dtk</span>`).join(' ')}
    <div class="note" style="margin-bottom:0">Tanpa level dan EXP. Atribut datang dari perlengkapan, tingkatan skill, buff makanan, dan reputasi Kuil.</div></div>`; }
function gearHTML() { const slotRow = (slot, label) => { const id = { weapon: G.weapon, armor: G.armor, charm: G.charm }[slot], it = id && ITEMS[id];
    const own = Object.keys(G.inv).filter(i => cnt(i) > 0 && ITEMS[i] && (slot === 'weapon' ? ITEMS[i].dmg : ITEMS[i].slot === slot));
    return `<div class="card"><span class="tag">${label}</span><div style="margin-top:4px"><b>${it ? it.n : '—'}</b></div><div class="note" style="margin:0">${it ? gearDesc(it) : 'Kosong'}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${own.filter(i => i !== id).map(i => `<button class="btn sm ghost" data-do="equip" data-arg="${i}">${img(i)} ${ITEMS[i].n}</button>`).join('')}${it && slot !== 'weapon' ? `<button class="btn sm ghost" data-do="unequip" data-arg="${slot}">Lepas</button>` : ''}</div></div>`; };
  return `<h5>Perlengkapan</h5><div class="grid2">${slotRow('weapon', 'Senjata')}${slotRow('armor', 'Zirah')}${slotRow('charm', 'Aksesori')}</div>`; }
function gearDesc(it) { const p = []; if (it.dmg) p.push(`${it.dmg} dmg`); if (it.def) p.push(`DEF ${it.def}`); if (it.hp) p.push(`HP +${it.hp}`); if (it.mp) p.push(`Mana +${it.mp}`); if (it.atk) p.push(`Serangan +${it.atk}`);
  if (it.crit) p.push(`Krit +${Math.round(it.crit * 100)}%`); if (it.spd) p.push(`Gerak ${it.spd > 0 ? '+' : ''}${Math.round(it.spd * 100)}%`); if (it.mreg) p.push(`Regen mana ${it.mreg > 0 ? '+' : ''}${Math.round(it.mreg * 100)}%`); if (it.mag) p.push(`Sihir +${Math.round(it.mag * 100)}%`);
  return p.join(' · ') + (it.d2 ? ` · ${it.d2}` : ''); }
