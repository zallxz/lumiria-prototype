/* ------------------------------ GAMEPLAY ------------------------------ */
function train(k, diff) { const lv = G.sk[k]; if (lv >= 100) return; const ch = clamp((diff + 18 - lv) / 36, .04, .9); if (rand() < ch) { const t0 = tierOf(lv); if (!skillGain(k)) return; if (tierOf(G.sk[k]) > t0) { toast(`${SKILLS[k]}: ${tierName(G.sk[k])}!`, PERKS[k].slice(1).filter(p => p[0] === tierOf(G.sk[k])).map(p => p[1]).join(' · ') || PERKS[k][0], 'skill'); FX.burst(G.x, G.y - 10, 30, '#86dcff', 70, .8, -30, { add: true }); refreshStats(); } SFX.skill(); FX.pop(G.x, G.y - 30, `${SKILLS[k]} ${G.sk[k]}`, '#86dcff');
    if (G.sk[k] % 5 === 0) toast(`Skill naik: ${SKILLS[k]} ${G.sk[k]}`, unlockedBy(k), 'skill'); } }
function unlockedBy(k) { const s = Object.values(ACTS).find(a => a.req[k] === G.sk[k] && skillOpen(a)); return s ? `Skill terbuka: ${s.n} (pasang di Build)` : ''; }
function startEvent(id) { const e = G.events.find(x => x.id === id); if (e) { e.left = EVENTS[id].dur; return; } G.events.push({ id, left: EVENTS[id].dur }); onEventStart(id); }
function facingVec() { return DIRV[G.dir]; }
function findInteract() {
  if (BM.on) { bmUpdate(); return { label: BM.ok ? `Pasang ${CAT[BM.t].n} · Esc selesai` : `${CAT[BM.t].n}: ${BM.why} · Esc batal`, f: BM.ok ? placeConfirm : null }; }
  const [dx, dy] = facingVec(), fx = G.x + dx * 10, fy = G.y - 4 + dy * 10, room = G.room || null; let best = null, bd = 1e9;
  const consider = (d, info) => { if (d < bd) { bd = d; best = info; } };
  for (const n of NPCS) { if ((n.room || null) !== room || !npcVisible(n)) continue; const d = Math.hypot(n.x - fx, n.y - 6 - fy); if (d < (n.reach || 22)) consider(d - 4, { label: 'Bicara: ' + NPC_LOOK[n.id].n, f: n.act, npc: n }); }
  for (const o of OBJS) { if (!o.act || (o.room || null) !== room) continue; const d = Math.hypot(o.x - fx, o.y - 6 - fy); if (d < 20 + (o.r || 0)) consider(d, { label: o.label, f: o.act }); }
  let botBest = null, botD = 14; // pengembara AI: prioritas terendah supaya keramaian tidak menghalangi panen/tambang
  for (const b of BOTS) { if ((b.room || null) !== room) continue; const d = Math.hypot(b.x - fx, b.y - 6 - fy); if (d < botD || (b.down && d < 16)) { botD = d; botBest = b.down ? { label: `Bangunkan ${b.name} (+Cahaya)`, f: () => reviveBot(b), npc: b } : { label: 'Sapa: ' + b.name, f: () => talkBot(b), npc: b }; } }
  if (botBest && botBest.label.startsWith('Bangunkan') && !best) return botBest;
  if (room) { if (best) return best; const r = ROOMS[room]; if (G.y > (r.h - 2) * T + 2 && Math.abs(G.x - r.doorX) < 20) return { label: 'Keluar', f: exitRoom }; return botBest; }
  for (let i = 0; i < ORES.length; i++) { const st = G.ores[i]; if (st.cd > 0) continue; const [type, tx, ty] = ORES[i], x = tx * T + 8, y = ty * T + 8, d = Math.hypot(x - fx, y - fy);
    if (d < 18) consider(d, { label: `Tambang ${ITEMS[type].n} (${st.hits}/${oreHits(type)})`, f: () => mineOre(i) }); }
  if (best) return best;
  const tx = Math.floor(fx / T), ty = Math.floor(fy / T), t = at(tx, ty), key = tx + ',' + ty;
  if (t === TL.SOIL) { const c = G.field[key]; if (c && cropReady(c)) return { label: `Panen ${itemName(c.crop)}`, f: () => harvest(G.field, key, tx, ty, true) }; if (c) return { label: `${itemName(c.crop)} tumbuh ${Math.floor(cropProg(c) * 100)}%`, f: null }; }
  if (t === TL.TREE && canChop(tx, ty)) return cnt('kapak') ? { label: 'Tebang pohon (kayu)', f: () => chopTree(tx, ty) } : botBest || { label: 'Pohon · butuh kapak dari Toko Tukang', f: null };
  if (t === TL.PLOT) { const myp = plotAt(fx, fy); if (myp ? G.land[myp.id].owner !== 'me' : !G.plotOwned) return { label: myp ? 'Petak tanam milik orang lain' : 'Petak terkunci · butuh izin Guild', f: null };
    const c = G.plot[key]; if (c && c.crop) { if (cropReady(c)) return { label: `Panen ${itemName(c.crop)}`, f: () => harvest(G.plot, key, tx, ty, false) }; return { label: `${itemName(c.crop)} tumbuh ${Math.floor(cropProg(c) * 100)}%`, f: null }; }
    const sd = G.seedSel && cnt(G.seedSel) ? G.seedSel : Object.keys(G.inv).find(id => ITEMS[id] && ITEMS[id].seed);
    if (sd) return { label: `Tanam ${ITEMS[sd].n} (${cnt(sd)})`, f: () => plant(key, sd, tx, ty) }; return { label: 'Tidak punya benih · beli di pasar', f: null }; }
  return botBest;
}
/*@@S_farm@@*/
function nearestEnemy(r, fwdOnly) { if (G.room) return null; let best = null, bd = r; const [fx, fy] = facingVec();
  for (const e of ENEMIES) { if (e.dead) continue; const dx = e.x - G.x, dy = e.y - G.y, d = Math.hypot(dx, dy); if (d > bd) continue; if (fwdOnly && (dx * fx + dy * fy) < -6) continue; bd = d; best = e; } return best; }
function faceTo(e) { const dx = e.x - G.x, dy = e.y - G.y; G.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); }
function aimVec(range) { const e = nearestEnemy(range, false); if (e) { faceTo(e); const dx = e.x - G.x, dy = e.y - 4 - G.y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; } return facingVec(); }
function shoot(kind, vx, vy, dmg, opt = {}) { const m = Math.hypot(vx, vy) || 1; PROJ.push({ x: G.x + vx / m * 6, y: G.y - 8 + vy / m * 6, vx, vy, dmg, kind, src: 'player', life: opt.life || .7, aoe: opt.aoe || 0, sk: opt.sk, crit: opt.crit }); }
function meleeHit(reach, radius, mult, sk, critBonus = 0) {
  const [dx, dy] = facingVec(), hx = G.x + dx * reach, hy = G.y - 6 + dy * reach; let hit = 0;
  for (const e of ENEMIES) { if (e.dead) continue; if (Math.hypot(e.x - hx, e.y - 5 - hy) > radius + e.d.r) continue;
    let dmg = Math.round(weaponDmg() * mult * rnd(.9, 1.1)); const crit = P.critNext || rand() < stats().crit + critBonus * 0; if (crit) dmg = Math.round(dmg * 1.6);
    damageEnemy(e, dmg, crit, Math.atan2(e.y - G.y, e.x - G.x), null, sk); hit++; }
  if (hit) { P.critNext = false; FX.stop(.045); FX.shake(.12); } return hit;
}
function playerAttack() {
  if (P.atkCd > 0 || G.room) return; const wt = wtype(), W = WTYPES[wt];
  const wmp = Math.ceil(W.mp * stats().mcost || 0); if (wt === 'tongkat' && G.mp < wmp) { FX.pop(G.x, G.y - 22, 'Mana habis', '#8fc8ff'); P.atkCd = .3; return; }
  P.atkCd = W.cd; P.swing = .2;
  if (wt === 'pedang' || wt === 'belati') { const near = nearestEnemy(46, false); if (near) faceTo(near); SFX.swing(); meleeHit(wt === 'belati' ? 11 : TUNE.attackReach, wt === 'belati' ? 12 : TUNE.attackRadius, 1, W.sk, wt === 'belati' ? .15 + G.sk.bayangan / 200 : 0); }
  else if (wt === 'busur') { const [vx, vy] = aimVec(W.range); shoot('arrow', vx * 260, vy * 260, weaponDmg(), { sk: 'busur', life: .6 }); Snd.play({ type: 'triangle', f0: 600, f1: 200, dur: .08, vol: .12 }); }
  else { G.mp -= wmp; const [vx, vy] = aimVec(W.range); shoot('orb', vx * 170, vy * 170, weaponDmg(), { aoe: 16, sk: 'sihir', life: .75 }); Snd.play({ type: 'sine', f0: 700, f1: 1300, dur: .14, vol: .1 }); }
}
function useSkill(i) {
  const id = G.loadout[i], s = ACTS[id]; if (!s || G.room) return;
  if (!skillOpen(s)) return toast(`${s.n} terkunci`, 'Butuh ' + reqText(s));
  const cost = Math.ceil(s.mp * stats().mcost); if ((P.scd[id] || 0) > 0) return; if (G.mp < cost) { FX.pop(G.x, G.y - 22, 'Mana kurang', '#8fc8ff'); return; }
  G.mp -= cost; P.scd[id] = s.cd - (id === 'tebas_putar' && perk('pedang', 4) ? 1.5 : 0); P.cast = .25;
  const ring = (r, col) => { for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; FX.burst(G.x + Math.cos(a) * r, G.y - 6 + Math.sin(a) * r * .6, 1, col, 15, .45, 0, { add: true }); } };
  if (id === 'tebas_putar' || id === 'pedang_suci') { P.spin = .32; SFX.spin(); let hit = 0;
    for (const e of ENEMIES) { if (e.dead) continue; if (Math.hypot(e.x - G.x, e.y - 5 - (G.y - 6)) > TUNE.spinRadius + e.d.r) continue; damageEnemy(e, Math.round(weaponDmg() * (id === 'pedang_suci' ? 1.8 : 1.5)), false, Math.atan2(e.y - G.y, e.x - G.x), null, 'pedang'); hit++; }
    FX.burst(G.x, G.y - 6, 24, id === 'pedang_suci' ? '#fff2b0' : '#c8f0ff', 110, .35, 0, { add: true }); if (hit) { FX.stop(.07); FX.shake(.22); }
    if (id === 'pedang_suci') { G.hp = Math.min(G.hpMax, G.hp + 4); train('penyembuhan', 12); FX.pop(G.x, G.y - 26, '+4', '#9fffcf'); } }
  else if (id === 'hujan_panah' || id === 'panah_api') { const [vx, vy] = aimVec(160), base = Math.atan2(vy, vx), fire = id === 'panah_api';
    const n = fire ? 3 : perk('busur', 4) ? 7 : 5; for (let k = 0; k < n; k++) { const a = base + (k - (n - 1) / 2) * (fire ? .18 : .16); shoot(fire ? 'fire' : 'arrow', Math.cos(a) * 260, Math.sin(a) * 260, Math.round(weaponDmg() * (fire ? 1.2 : .8)) + (fire ? Math.floor(G.sk.sihir / 8) : 0), { sk: fire ? 'sihir' : 'busur', aoe: fire ? 18 : 0, life: .65 }); }
    Snd.play({ type: 'triangle', f0: 800, f1: 200, dur: .2, vol: .14 }); if (fire) train('busur', 10); }
  else if (id === 'bola_api') { const [vx, vy] = aimVec(140); shoot('fire', vx * 150, vy * 150, 4 + Math.floor(G.sk.sihir / 4) + (G.weapon && wtype() === 'tongkat' ? ITEMS[G.weapon].dmg : 0), { aoe: 28, sk: 'sihir', life: .9 }); Snd.play({ type: 'sawtooth', f0: 220, f1: 90, dur: .3, vol: .12 }); }
  else if (id === 'lingkar_suci') { const amt = Math.round((5 + Math.floor(G.sk.penyembuhan / 5)) * stats().heal); G.hp = Math.min(G.hpMax, G.hp + amt); FX.pop(G.x, G.y - 26, '+' + amt, '#9fffcf'); ring(36, '#fff2b0'); SFX.skill(); let helped = 0;
    if (!G.room) for (const b of BOTS) { if (b.room || Math.hypot(b.x - G.x, b.y - G.y) > 50) continue; if (b.down) { reviveBot(b); helped++; continue; } if (b.hp < b.hpMax) { b.hp = Math.min(b.hpMax, b.hp + amt); helped++; FX.burst(b.x, b.y - 8, 6, '#9fffcf', 25, .6, -40, { add: true }); } }
    train('penyembuhan', 8 + helped * 4); if (helped) { addAlign(Math.min(3, helped)); } }
  else if (id === 'langkah_bayang') { const [dx, dy] = facingVec(); for (let k = 0; k < 18; k++) moveActor(G, dx * 3, dy * 3, 'player', G.room); P.inv = Math.max(P.inv, .45); P.critNext = true;
    FX.burst(G.x, G.y - 8, 18, '#b48aff', 50, .5, 0, { add: true }); Snd.play({ noise: true, f0: 3000, f1: 400, dur: .15, vol: .14, hp: true }); train('bayangan', 14); }
  else if (id === 'tikam_bayang') { const e = nearestEnemy(30, false); if (!e) { P.scd[id] = .5; G.mp += s.mp; return FX.pop(G.x, G.y - 22, 'Tidak ada sasaran', '#c8a0ff'); }
    faceTo(e); damageEnemy(e, Math.round(weaponDmg() * 3), true, Math.atan2(e.y - G.y, e.x - G.x), null, 'bayangan'); FX.burst(e.x, e.y - 8, 20, '#b48aff', 70, .5, 0, { add: true }); FX.stop(.09); FX.shake(.3); train('pedang', 10); }
}
function updateProj(dt) {
  for (const p of PROJ) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.kind !== 'arrow' && rand() < .6) FX.burst(p.x, p.y, 1, p.kind === 'fire' ? '#ffb347' : '#9ff0ff', 10, .3, 0, { add: true });
    let boom = p.life <= 0 || solidPt(p.x, p.y + 6, 'proj', null);
    if (!boom) for (const e of ENEMIES) { if (e.dead) continue; if (Math.hypot(e.x - p.x, e.y - 6 - p.y) < e.d.r + 3) { if (!p.aoe) damageEnemy(e, p.dmg, !!p.crit, Math.atan2(p.vy, p.vx), p.src === 'bot' ? 'bot' : null, p.sk, p.bot); boom = true; break; } }
    if (boom) { p.done = true; if (p.aoe) { for (const e of ENEMIES) if (!e.dead && Math.hypot(e.x - p.x, e.y - 6 - p.y) < p.aoe + e.d.r) damageEnemy(e, p.dmg, false, Math.atan2(e.y - p.y, e.x - p.x), p.src === 'bot' ? 'bot' : null, p.sk, p.bot);
      if (onCam(p)) { FX.burst(p.x, p.y, p.aoe > 20 ? 30 : 14, p.kind === 'fire' ? '#ff9a3a' : '#9ff0ff', 80, .45, 40, { add: true }); if (p.src !== 'bot') FX.shake(p.aoe > 20 ? .2 : .06); } } } }
  PROJ = PROJ.filter(p => !p.done);
}
function damageEnemy(e, dmg, crit, ang, src, sk, bot) {
  if (e.dead) return; if (bot) e.lastBot = bot;
  dmg = Math.max(1, Math.round(dmg * mitig(e.def || 0))); e.hp -= dmg; e.flash = .12; const kb = src === 'bot' ? 60 : 150; e.kx = Math.cos(ang) * (e.d.boss ? 60 : kb); e.ky = Math.sin(ang) * (e.d.boss ? 60 : kb);
  if (e.st === 'wind' && !e.d.boss && src !== 'bot') { e.st = 'chase'; e.cd = .5; } if (e.st === 'idle') e.st = 'chase';
  if (src !== 'bot') e.pHit = true;
  const vis = onCam(e); if (vis && (src !== 'bot' || rand() < .3)) SFX.hit();
  if (vis) { FX.pop(e.x, e.y - 18, crit ? dmg + '!' : '' + dmg, src === 'bot' ? '#c8d4e8' : crit ? '#ffd24a' : '#ffffff', crit); FX.burst(e.x, e.y - 6, src === 'bot' ? 3 : 7, e.t === 'slime' ? '#bff0ff' : '#ffe6e6', 70, .3, 120); }
  if (!src) train(sk || 'pedang', e.d.diff * .6 * (e.elite ? 1.4 : 1));
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e) {
  e.dead = true; e.respawn = e.sp.respawn || (e.t === 'slime' ? 8 : 14); G.kills++;
  if (onCam(e)) { FX.burst(e.x, e.y - 6, e.d.boss ? 50 : 18, { slime: '#7fd8ff', wolf: '#a8adba', bat: '#5a4a6a', golem: '#9a9488', bandit: '#7a5a4a' }[e.t] || '#8ab04a', 90, .7, 220); FX.shake(e.d.boss ? .5 : .1); }
  if (G.wave && G.wave.active && e.wave) { G.wave.left--; if (e.pHit) addAlign(1); if (G.wave.left <= 0) endWave(true); }
  if (e.lastBot) { const b = e.lastBot; b.kills++; b.score.hunt++; botGain(b, 'c', e.d.diff * .6); b.wallet += irnd(e.d.coin[0], e.d.coin[1]); }
  if (e.pHit) { addScore('hunt', 1); missionProgress('turnamen'); if (e.t === 'bandit') missionProgress('bandit'); for (const b of partyBots()) if (!b.down && Math.hypot(b.x - e.x, b.y - e.y) < 160) { botGain(b, 'c', e.d.diff * .5); if (rand() < .3) addAff(b, 1); } }
  if (!e.pHit) { if (e.d.boss) { chat('Sistem', `${e.d.n} dikalahkan party Pengembara AI`, 'sys'); } return; }
  const coins = Math.round(irnd(e.d.coin[0], e.d.coin[1]) * (e.elite ? 2.5 : 1) * (e.dm || 1)); for (let i = 0; i < Math.min(8, Math.ceil(coins / 3)); i++) DROPS.push({ x: e.x, y: e.y - 4, vx: rnd(-50, 50), vy: rnd(-70, -30), z: 0, t: 0, item: 'coin', n: 0 });
  DROPS.push({ x: e.x, y: e.y - 4, vx: 0, vy: -40, t: 0, item: 'coin', n: coins, silent: true });
  if (e.d.drop) for (const id in e.d.drop) if (rand() < e.d.drop[id] * (e.elite ? 2 : 1)) DROPS.push({ x: e.x, y: e.y - 4, vx: rnd(-30, 30), vy: -60, t: 0, item: id, n: e.d.boss ? 3 : 1 });
  if (e.t === 'slime' && G.stage === 1) { G.q.slimes++; if (G.q.slimes === 3) { SFX.quest(); toast('Tiga Hidup: Petualang ✓', 'Gerbang aman untuk sementara', 'good'); } }
  if (e.t === 'golem') { G.golemKills = (G.golemKills || 0) + 1; G.rep += 4; SFX.quest(); FX.shake(.6); toast('Golem Reruntuhan runtuh!', 'Segel peti di ruang terakhir terbuka · +4 reputasi', 'good'); chat('Sistem', `${G.name} merobohkan Golem Reruntuhan!`, 'sys'); }
  else if (e.d.boss) { G.kingKills++; G.rep += 3; SFX.quest(); toast('Raja Goblin tumbang!', '+3 reputasi · gelar Penakluk Goblin terbuka', 'good'); chat('Sistem', `${G.name} menaklukkan Raja Goblin!`, 'sys'); }
}
function hurtPlayer(dmg, fromX, fromY) {
  if (P.inv > 0 || !G || G.hp <= 0 || G.room) return; dmg = Math.max(1, Math.round(dmg * mitig(stats().def))); G.hp -= dmg; P.inv = TUNE.iframes; SFX.hurt(); FX.shake(.32); FX.stop(.06); FX.hurtT = .35;
  const a = Math.atan2(G.y - fromY, G.x - fromX); P.kx = Math.cos(a) * 140; P.ky = Math.sin(a) * 140; FX.pop(G.x, G.y - 20, '-' + dmg, '#ff7a8a', true);
  compGain(5); if (G.hp <= 0) playerDown();
}
function playerDown() {
  const lost = Math.floor(G.coin * .1); G.coin -= lost; G.hp = G.hpMax; G.mp = mpMax(); P.inv = 2; collectDrops(); BM.on = false; G.thief = null; if (G.comp) { G.cHp = compMax(); G.cDown = 0; }
  G.room = 'kuil'; G.x = 10 * T; G.y = 6.5 * T; G.wx = 36.5 * T; G.wy = 13 * T + 12; G.dir = 0; FX.clear(); placeComp(); snapCam(); fade();
  say([{ who: 'sela', t: `Jiwamu ditarik kembali ke Kuil. Tubuhmu sudah kubangun ulang.${lost ? ` Kau kehilangan ${lost} koin di luar sana.` : ''}` },
    { who: 'sela', t: 'Di dunia online, sebagian isi tasmu juga akan tertinggal di tempat kau jatuh. Berhati-hatilah.' }]);
}
/*@@S_wave@@*/
/* ---- ruangan ---- */
function fade() { if (TEST) return; const f = $('#fade'); f.style.transition = 'none'; f.style.opacity = 1; requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity .28s'; f.style.opacity = 0; })); }
function snapCam() { if (G.room) { const r = ROOMS[G.room], RW = r.w * T, RH = r.h * T; Cam.x = RW <= VW ? (RW - VW) / 2 : clamp(G.x - VW / 2, 0, RW - VW); Cam.y = RH <= VH ? (RH - VH) / 2 : clamp(G.y - 8 - VH / 2, 0, RH - VH); }
  else { Cam.x = clamp(G.x - VW / 2, 0, MW * T - VW); Cam.y = clamp(G.y - 8 - VH / 2, 0, MH * T - VH); } }
function collectDrops() { for (const d of DROPS) { if (d.item === 'coin') G.coin += d.n || 0; else give(d.item, d.n, true); } DROPS = []; }
function placeComp() { if (COMP) { COMP.x = G.x + (G.room ? 14 : -12); COMP.y = G.y + (G.room ? -2 : 4); } }
function enterRoom(id) { G.lastWorld = { x: G.x, y: G.y }; const r = ROOMS[id]; collectDrops(); PROJ = []; G.wx = G.x; G.wy = G.y; G.room = id; G.x = r.doorX; G.y = r.exitY - 8; G.dir = 1; P.vx = P.vy = 0; placeComp(); FX.clear(); snapCam(); fade(); SFX.door(); interact = null;
  if (!G.seenRoom) G.seenRoom = {}; if (!G.seenRoom[id]) { G.seenRoom[id] = 1; toast(r.n, { guild: 'Rowan, Papan Pesanan, gudang senjata', smith: 'Landasan & tungku: tempa senjata dan alat', cook: 'Kompor: masak makanan & resep Bumi', kuil: 'Altar Dewi, Pendeta Sela, Ritual Pemanggilan', tukang: 'Bagas jual kayu, batu, papan & kapak · meja kerja', kantor_tanah: 'Wira: lotre rumah, lelang & pajak Harberger', serikat: 'Laut: laporan harga semua kota & asuransi jalan' }[id] || (r.owner === 'me' ? 'Bangunan milikmu' : r.lock === 'hours' ? `Rumah ${r.ownerName || 'warga'} · jangan sentuh barangnya` : '')); } }
function exitRoom() { const d = DOORS.find(q => q.room === G.room) || { x: G.wx, y: G.wy - 8 }; G.room = null; G.x = d.x; G.y = d.y + 8; G.dir = 0; P.vx = P.vy = 0; placeComp(); FX.clear(); snapCam(); fade(); SFX.door(); interact = null; }

/* ---- update ---- */
let interact = null, hudT = 0, miniT = 0, saveT = 0;
function updatePlay(dt) {
  if (Rit.open) return ritualTick(dt);
  if (loadingTick(dt)) { updateHUD(dt); return; }
  if (Dlg.open) { dialogTick(dt); return; }
  if (Panel.open) { if (Input.pressed('pause') || (Input.pressed('menu') && Panel.kind === 'status')) closePanel(); updateHUD(dt); return; }
  if (Input.pressed('pause')) { if (BM.on) { BM.on = false; return toast('Mode bangun selesai'); } return openPanel('pause'); }
  if (Input.pressed('build')) { const pl = !G.room && plotAt(G.x, G.y); if (BM.on) { BM.on = false; return toast('Mode bangun selesai'); } if (pl) return openPanel('plot', pl.id); return toast('Tidak di kavling', 'Mode bangun hanya di kavling milikmu (Distrik Pengembara)'); }
  if (Input.pressed('map')) return openMap();
  if (Input.pressed('menu')) return openPanel('status', 'status');
  G.clock += dt;
  let mx = (Input.held('right') ? 1 : 0) - (Input.held('left') ? 1 : 0), my = (Input.held('down') ? 1 : 0) - (Input.held('up') ? 1 : 0);
  if (Input.axis.x || Input.axis.y) { mx = Input.axis.x; my = Input.axis.y; }
  const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
  const PS = refreshStats(); for (const k in G.buffs) G.buffs[k] = Math.max(0, G.buffs[k] - dt);
  const sp = TUNE.speed * PS.spd * (P.swing > 0 ? .6 : 1) * (G.room ? .85 : 1);
  P.vx = damp(P.vx || 0, mx * sp, TUNE.accel, dt); P.vy = damp(P.vy || 0, my * sp, TUNE.accel, dt);
  P.kx = damp(P.kx || 0, 0, 10, dt); P.ky = damp(P.ky || 0, 0, 10, dt);
  P.moving = m > .15;
  if (P.moving && P.swing <= 0) G.dir = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 2 : 3) : (my < 0 ? 1 : 0);
  moveActor(G, (P.vx + P.kx) * dt, (P.vy + P.ky) * dt, 'player', G.room);
  if (!G.room) { G.x = clamp(G.x, 2 * T, (MW - 2) * T); G.y = clamp(G.y, 2 * T + 6, (MH - 2) * T); }
  if (P.moving) { P.stepT += dt; if (P.stepT > .16) { P.stepT = 0; P.step ^= 1; if (P.step && !G.room && hash(G.x | 0, G.y | 0) < .5) FX.burst(G.x, G.y, 1, at(Math.floor(G.x / T), Math.floor(G.y / T)) === TL.GRASS ? '#7fbf5f' : '#d8c4a0', 10, .3, 0); } } else P.step = 0;
  for (const k of ['swing', 'spin', 'inv', 'atkCd', 'actAnim', 'cast']) P[k] = Math.max(0, P[k] - dt);
  for (const k in P.scd) P.scd[k] = Math.max(0, P.scd[k] - dt);
  // pintu
  if (!G.room) { if (my < -.3 && !BM.on) for (const dr of DOORS) if (Math.abs(G.x - dr.x) < 9 && G.y < dr.y + 7 && G.y > dr.y - 6) { tryEnter(dr.room, false); break; } }
  else if (G.y > ROOMS[G.room].exitY) exitRoom();
  // aksi
  interact = findInteract();
  if (Input.pressed('act')) { if (interact && interact.f) interact.f(); else if (!interact) playerAttack(); }
  if (Input.pressed('attack')) playerAttack();
  if (Input.pressed('skill')) useSkill(0);
  if (Input.pressed('skill2')) useSkill(1);
  // regen
  P.regen += dt; const inCombat = !G.room && ENEMIES.some(e => !e.dead && e.st !== 'idle' && Math.hypot(e.x - G.x, e.y - G.y) < 90);
  const regenEvery = TUNE.regenEvery / PS.hreg / (G.align >= 30 && (G.room || inSafe(G.x, G.y)) ? 2 : 1);
  if (P.regen > regenEvery) { P.regen = 0; if (!inCombat && G.hp < G.hpMax) G.hp = Math.min(G.hpMax, G.hp + 1); }
  P.mpT += dt * PS.mreg; if (P.mpT > 1) { P.mpT = 0; G.mp = Math.min(mpMax(), G.mp + 1); }
  if (G.poison > 0) G.poison -= dt;
  updateCompanion(dt, inCombat); updateEnemies(dt); updateBolts(dt); updateProj(dt); updateDrops(dt); updateVillagers(dt); updateBots(dt);
  for (const o of G.ores) if (o.cd > 0) o.cd -= dt;
  // ekonomi
  G.mT = (G.mT || 0) + dt; if (G.mT > 6) { G.mT = 0; for (const id in G.market) { const mk = G.market[id]; mk.stock += rnd(-.3, .3); mk.hist.push(price(id)); if (mk.hist.length > 40) mk.hist.shift(); }
    for (const c in G.cityMk) for (const id in G.cityMk[c]) { const mk = G.cityMk[c][id]; mk.hist.push(priceIn(id, c)); if (mk.hist.length > 40) mk.hist.shift(); } }
  G.eT = (G.eT || 0) + dt; if (G.eT > HOUR_S) { G.eT = 0; econTick(); cityTick(); landHourly(); botsHourly(); w3Hourly(); }
  partyTick(); bossAssist(); weekRollover(); backupTick();
  const dNow = dayOf(); if (G.lastDay == null) G.lastDay = dNow; if (dNow !== G.lastDay) { G.lastDay = dNow; landDaily(dNow); propTick(); }
  regionTick(dt); G.exT = (G.exT || 0) + dt; if (G.exT > .5) { G.exT = 0; exploreTick(); }
  if (syncPlacementsSoon && !G.room && !BM.on) { syncPlacementsSoon = false; rebuildWorld(); }
  thiefTick(dt); G.actT = (G.actT || 0) + dt; if (G.actT > 2) { G.actT = 0; const pl = !G.room && plotAt(G.x, G.y); if (pl && G.land[pl.id].owner === 'me') G.land[pl.id].last = dNow; const cz = !G.room && cityAt(G.x, G.y); if (cz) peekCity(cz); badgeTick(); }
  for (const e of G.events) e.left -= dt; const ended = G.events.filter(e => e.left <= 0); G.events = G.events.filter(e => e.left > 0); for (const e of ended) { onEventEnd(e.id); if (e.id !== 'wave') toast('Peristiwa berakhir', EVENTS[e.id].n); }
  updateNews(dt); updateChat(dt);
  if (G.discovered) { G.royT = (G.royT || 0) + dt; if (G.royT > HOUR_S) { G.royT = 0; const og = ORIGINS.find(o => o.id === G.origin), n = irnd(1, 4), r = Math.max(1, Math.round(ITEMS[og.rec].base * .01 * n * 3)); G.coin += r; G.royalty += r; } }
  if (G.waveAt && !G.wave && G.clock >= G.waveAt) startWave();
  if (G.wave && G.wave.active) { G.wave.t += dt; if (G.wave.spawned < 14 && G.wave.t > G.wave.spawned * 3.5) { G.wave.spawned++; const t = G.wave.spawned % 5 === 0 ? 'goblin' : G.wave.spawned % 3 === 0 ? 'wolf' : 'slime';
      spawnEnemy({ t, x: 36 + rnd(-6, 6), y: 47, r: 2 }, { wave: true, hpMul: 1.2 }); }
    if (G.wave.t > 150) endWave(false); }
  if (G.omen > 0) G.omen -= dt;
  // kamera
  if (G.room) { const r = ROOMS[G.room], RW = r.w * T, RH = r.h * T, tx = RW <= VW ? (RW - VW) / 2 : clamp(G.x - VW / 2, 0, RW - VW), ty = RH <= VH ? (RH - VH) / 2 : clamp(G.y - 8 - VH / 2, 0, RH - VH);
    Cam.x = damp(Cam.x, tx, 10, dt); Cam.y = damp(Cam.y, ty, 10, dt); }
  else { const lookX = P.vx * .35, lookY = P.vy * .3; Cam.x = clamp(damp(Cam.x, G.x + lookX - VW / 2, 6, dt), 0, MW * T - VW); Cam.y = clamp(damp(Cam.y, G.y - 8 + lookY - VH / 2, 6, dt), 0, MH * T - VH); }
  saveT += dt; if (saveT > 30) { saveT = 0; save(); }
  updateHUD(dt);
}
function updateCompanion(dt, inCombat) {
  const c = COMP; if (!c) return; const [dx, dy] = facingVec();
  let tgt0 = null; if (!G.room) { let td0 = 1e9; for (const e of ENEMIES) { if (e.dead) continue; const d0 = Math.hypot(e.x - G.x, e.y - G.y); if (d0 < 80 && d0 < td0 && e.st !== 'idle') { td0 = d0; tgt0 = e; } } }
  if (!compTick(dt, inCombat, tgt0)) { c.moving = false; return; }
  let tx = G.x - dx * 14 + (dy ? 12 : 0), ty = G.y - dy * 12 + (dx ? 8 : 0);
  let target = null, td = 1e9; if (!G.room) for (const e of ENEMIES) { if (e.dead) continue; const d = Math.hypot(e.x - G.x, e.y - G.y); if (d < 80 && d < td && e.st !== 'idle') { td = d; target = e; } }
  if (target && c.id !== 'aira') { tx = target.x - Math.sign(target.x - c.x) * 10; ty = target.y; }
  const ddx = tx - c.x, ddy = ty - c.y, dist = Math.hypot(ddx, ddy);
  if (dist > 140) { c.x = G.x - 10; c.y = G.y + 2; }
  const spd = dist > 40 ? 92 : 70; c.moving = dist > 6;
  if (c.moving) { moveActor(c, ddx / dist * spd * dt, ddy / dist * spd * dt, 'comp', G.room); c.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx < 0 ? 2 : 3) : (ddy < 0 ? 1 : 0);
    c.stepT += dt; if (c.stepT > .17) { c.stepT = 0; c.step ^= 1; } } else c.step = 0;
  c.cd -= dt; c.heal -= dt; c.atk = Math.max(0, (c.atk || 0) - dt);
  if (target) { const d = Math.hypot(target.x - c.x, target.y - c.y);
    if (c.id === 'aira' && c.cd <= 0 && d < 100) { c.cd = 1.3; BOLTS.push({ x: c.x, y: c.y - 10, tg: target, t: 0 }); c.atk = .2; compGain(7); Snd.play({ type: 'sine', f0: 900, f1: 1400, dur: .12, vol: .08 }); }
    if (c.id !== 'aira' && c.cd <= 0 && d < 18) { c.cd = c.id === 'garon' ? 1.0 : .9; c.atk = .2; compGain(8); damageEnemy(target, c.id === 'garon' ? 3 : 1, false, Math.atan2(target.y - c.y, target.x - c.x), 'comp'); } }
  if (c.id === 'mimi' && inCombat && c.heal <= 0 && G.hp < G.hpMax) { c.heal = 5; G.hp = Math.min(G.hpMax, G.hp + 2); FX.pop(G.x, G.y - 24, '+2', '#9fffcf'); FX.burst(G.x, G.y - 8, 10, '#9fffcf', 30, .7, -40, { add: true }); }
}
/*@@S_drops@@*/
function updateEnemies(dt) {
  const pIn = G && !G.room && G.hp > 0;
  for (const e of ENEMIES) {
    if (e.dead) { e.respawn -= dt; if (e.respawn <= 0 && !e.wave) { const ne = spawnEnemy(e.sp); e.gone = true; ne.respawned = true; } continue; }
    if (!enemyActive(e)) continue;
    e.anim += dt; e.flash = Math.max(0, e.flash - dt); e.cd -= dt;
    const d = e.d; let tgt = null, tdist = 1e9;
    if (pIn) { tgt = G; tdist = Math.hypot(G.x - e.x, G.y - e.y); if (COMP && G.cDown <= 0) { const gd = Math.hypot(COMP.x - e.x, COMP.y - e.y), pull = (e.taunt > 0 && COMP.guard > 0) ? 999 : COMP.id === 'garon' ? 30 : 0; if (gd < d.aggro * 1.4 && gd < tdist + pull - 4) { tgt = COMP; tdist = gd; } } }
    if (e.taunt > 0) e.taunt -= dt;
    for (const b of HUNTERS) { if (b.down) continue; const bd = Math.hypot(b.x - e.x, b.y - e.y); if (bd < tdist - 8) { tdist = bd; tgt = b; } }
    const homeD = Math.hypot(e.x - e.home.x, e.y - e.home.y); let vx = 0, vy = 0;
    if (e.st === 'idle') { e.tm -= dt; if (e.tm <= 0) { e.tm = rnd(1, 2.5); const a = rnd(Math.PI * 2); e.wx = rand() < .5 ? 0 : Math.cos(a); e.wy = rand() < .5 ? 0 : Math.sin(a); if (homeD > 30) { e.wx = (e.home.x - e.x) / homeD; e.wy = (e.home.y - e.y) / homeD; } }
      vx = e.wx * d.spd * .4; vy = e.wy * d.spd * .4; if (tgt && tdist < d.aggro && !inSafe(tgt.x, tgt.y)) { e.st = 'chase'; if (onCam(e)) FX.pop(e.x, e.y - 22, '!', '#ffcf5a'); } }
    else if (e.st === 'chase') { if (!tgt) e.st = 'return'; else { const dx = tgt.x - e.x, dy = tgt.y - e.y; if (tdist > d.reach) { vx = dx / tdist * d.spd; vy = dy / tdist * d.spd; } e.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
      if (e.t === 'slime') { const hop = Math.max(0, Math.sin(e.anim * 6)); vx *= hop * 1.6; vy *= hop * 1.6; }
      if (tdist <= d.reach + 4 && e.cd <= 0) { e.st = 'wind'; e.tm = d.wind; e.ax = tgt.x; e.ay = tgt.y; e.tg = tgt; }
      if (!e.wave && (homeD > 170 || tdist > d.aggro * 2.2)) e.st = 'return'; } }
    else if (e.st === 'wind') { e.tm -= dt; if (e.tm <= 0) { e.st = 'strike'; e.tm = .18; const a = Math.atan2(e.ay - e.y, e.ax - e.x); e.lx = Math.cos(a); e.ly = Math.sin(a);
        if (d.boss) { if (onCam(e)) { FX.shake(.45); FX.burst(e.x, e.y, 30, '#d8b980', 120, .5, 200); SFX.hurt(); } if (pIn && Math.hypot(G.x - e.x, G.y - e.y) < d.reach + 6) hurtPlayer(edmg(e), e.x, e.y);
          for (const b of HUNTERS) if (!b.down && Math.hypot(b.x - e.x, b.y - e.y) < d.reach + 6) hurtBot(b, edmg(e)); if (COMP && Math.hypot(COMP.x - e.x, COMP.y - e.y) < d.reach + 6) compHurt(edmg(e)); } } }
    else if (e.st === 'strike') { e.tm -= dt; const tg = e.tg; if (!d.boss) { vx = e.lx * d.spd * 3.2; vy = e.ly * d.spd * 3.2;
        if (!e.hitDone && tg && Math.hypot(tg.x - e.x, tg.y - e.y) < d.reach) { e.hitDone = true; if (tg === G) { if (pIn) hurtPlayer(edmg(e), e.x, e.y); } else if (tg === COMP) compHurt(edmg(e)); else hurtBot(tg, edmg(e)); } }
      if (e.tm <= 0) { e.st = 'chase'; e.cd = d.cd; e.hitDone = false; } }
    else if (e.st === 'return') { const dx = e.home.x - e.x, dy = e.home.y - e.y; vx = dx / Math.max(1, homeD) * d.spd; vy = dy / Math.max(1, homeD) * d.spd; e.hp = Math.min(e.max, e.hp + dt * 4); if (homeD < 8) e.st = 'idle'; }
    if (e.wave && e.st === 'idle') e.st = 'chase';
    e.kx = damp(e.kx, 0, 9, dt); e.ky = damp(e.ky, 0, 9, dt);
    moveActor(e, (vx + e.kx) * dt, (vy + e.ky) * dt, 'enemy', null); e.moving = Math.abs(vx) + Math.abs(vy) > 1;
  }
  ENEMIES = ENEMIES.filter(e => !e.gone && !(e.dead && e.wave && e.respawn < -1));
}
