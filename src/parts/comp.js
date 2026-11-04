/* ------------------------------ REKAN: HP, ENERGI, JURUS ------------------------------ */
const COMP_ST = { aira: { hp: 22, sp: 'Hujan Embun', spd: 'Ledakan embun: 4 damage ke semua musuh dekat Aira, pulihkan 3 HP-mu.' },
  garon: { hp: 40, armor: .5, sp: 'Benteng Perisai', spd: 'Selama 6 detik semua musuh dekat mengejar Garon, damage ke Garon −80%.' },
  mimi: { hp: 26, sp: 'Pesta Ikan', spd: 'Pulihkan 8 HP-mu dan 4 HP pengembara di sekitar.' } };
const compMax = () => G.comp ? COMP_ST[G.comp].hp + Math.min(10, Math.floor(G.rep / 3)) : 0;
function compInit() { if (!G.comp) return; if (G.cHp == null) G.cHp = compMax(); if (G.cEn == null) G.cEn = 0; if (G.cDown == null) G.cDown = 0; }
const compUp = () => COMP && G.cDown <= 0;
function compGain(v) { if (COMP && G.cDown <= 0) G.cEn = Math.min(100, (G.cEn || 0) + v); }
function compHurt(dmg) { const c = COMP; if (!c || G.cDown > 0 || G.room) return; const st = COMP_ST[c.id];
  const d = Math.max(1, Math.round(dmg * (1 - (st.armor || 0)) * (c.guard > 0 ? .2 : 1))); G.cHp -= d; c.flash = .15; compGain(4); if (onCam(c)) FX.pop(c.x, c.y - 20, '-' + d, '#ffb0b0');
  if (G.cHp <= 0) { G.cHp = 0; G.cDown = 25; G.cEn = 0; c.guard = 0; FX.burst(c.x, c.y - 8, 14, '#ffffff', 40, .7, -20, { add: true }); toast(`${COMPANIONS[c.id].n} pingsan`, 'Bangun sendiri dalam 25 detik dengan setengah HP, atau istirahat/ke Kuil', 'event'); } }
function compSpecial(target) { const c = COMP; G.cEn = 0; c.spT = .8; SFX.skill(); FX.pop(c.x, c.y - 30, COMP_ST[c.id].sp + '!', '#ffe39a', true);
  if (c.id === 'aira') { for (let k = 0; k < 30; k++) { const a = k / 30 * Math.PI * 2; FX.burst(c.x + Math.cos(a) * 40, c.y - 6 + Math.sin(a) * 24, 1, '#9ff0ff', 25, .6, 0, { add: true }); }
    for (const e of ENEMIES) if (!e.dead && Math.hypot(e.x - c.x, e.y - c.y) < 60) damageEnemy(e, 4, false, Math.atan2(e.y - c.y, e.x - c.x), 'comp'); G.hp = Math.min(G.hpMax, G.hp + 3); FX.shake(.15); }
  else if (c.id === 'garon') { c.guard = 6; for (const e of ENEMIES) if (!e.dead && Math.hypot(e.x - c.x, e.y - c.y) < 90) { e.st = 'chase'; e.taunt = 6; } FX.burst(c.x, c.y - 8, 26, '#cfd8e2', 60, .5, 0, { add: true }); FX.shake(.18); }
  else { G.hp = Math.min(G.hpMax, G.hp + 8); FX.pop(G.x, G.y - 26, '+8', '#9fffcf'); FX.burst(G.x, G.y - 8, 20, '#ffd0e8', 50, .8, -40, { add: true });
    for (const b of BOTS) if (!b.room && !b.down && Math.hypot(b.x - c.x, b.y - c.y) < 60) b.hp = Math.min(b.hpMax, b.hp + 4); }
  void target; }
function compTick(dt, inCombat, target) { const c = COMP; compInit(); c.guard = Math.max(0, (c.guard || 0) - dt); c.spT = Math.max(0, (c.spT || 0) - dt);
  if (G.cDown > 0) { G.cDown -= dt; if (G.cDown <= 0) { G.cDown = 0; G.cHp = Math.ceil(compMax() / 2); toast(`${COMPANIONS[c.id].n} bangun lagi`, 'HP setengah'); } return false; }
  if (!inCombat) { c.reg = (c.reg || 0) + dt; if (c.reg > 3) { c.reg = 0; G.cHp = Math.min(compMax(), G.cHp + 1); } }
  if (G.cEn >= 100 && !G.room && ((c.id === 'mimi' && G.hp < G.hpMax * .6) || (c.id !== 'mimi' && target))) compSpecial(target);
  return true; }
/* ---- potret anime 32×32 ---- */
function drawPortrait(c, o) {
  c.clearRect(0, 0, 32, 32); if (!o) return; const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const sk = o.skin || '#f3cfaa', sk2 = shade(sk, -.13), sk3 = shade(sk, -.3), hr = o.hair || '#3a2a1a', h2 = shade(hr, -.32), h3 = shade(hr, .28), tp = o.top || '#4e8a60', t2 = o.top2 || shade(tp, -.25), ey = o.eye || '#3a2c6a', long = o.style === 'long', A = o.acc;
  if (A === 'hood') { R(5, 4, 22, 24, t2); }
  if (long) { R(6, 8, 20, 21, h2); R(5, 13, 2, 15, h2); R(25, 13, 2, 15, h2); } else R(7, 7, 18, 11, h2);
  R(4, 26, 24, 6, tp); R(6, 24, 20, 3, tp); R(3, 28, 2, 4, t2); R(27, 28, 2, 4, t2); R(4, 30, 24, 2, t2); R(12, 24, 8, 3, t2); R(14, 24, 4, 2, sk2);
  if (A === 'apron') { R(10, 27, 12, 5, '#efe6d4'); R(10, 24, 1, 3, '#efe6d4'); R(21, 24, 1, 3, '#efe6d4'); }
  R(13, 20, 6, 5, sk2); R(13, 22, 6, 1, sk3);
  R(9, 8, 14, 11, sk); R(10, 19, 12, 1, sk); R(11, 20, 10, 1, sk); R(13, 21, 6, 1, sk); R(8, 10, 1, 6, sk); R(23, 10, 1, 6, sk); R(9, 18, 1, 1, sk2); R(22, 18, 1, 1, sk2);
  R(7, 12, 2, 4, sk); R(23, 12, 2, 4, sk); R(7, 13, 1, 2, sk2); R(24, 13, 1, 2, sk2);
  for (const ex of [10, 18]) { R(ex - 1, 12, 6, 1, '#1b1426'); R(ex, 13, 4, 4, ey); R(ex, 13, 4, 1, shade(ey, -.5)); R(ex + 1, 14, 2, 2, shade(ey, -.65)); R(ex, 16, 4, 1, shade(ey, .35));
    R(ex, 13, 2, 1, '#ffffff'); R(ex, 14, 1, 1, '#ffffff'); R(ex + 3, 16, 1, 1, '#ffffff'); R(ex, 17, 4, 1, sk2); }
  R(10, 10, 4, 1, h2); R(18, 10, 4, 1, h2);
  c.fillStyle = 'rgba(255,105,125,.5)'; c.fillRect(9, 17, 3, 1); c.fillRect(20, 17, 3, 1); R(16, 17, 1, 1, sk3); R(15, 19, 3, 1, shade(sk, -.42)); R(16, 19, 1, 1, '#c0505a');
  if (A === 'beard') { R(11, 18, 10, 3, hr); R(12, 21, 8, 1, hr); R(14, 19, 4, 1, shade(sk, -.4)); }
  R(8, 4, 16, 5, hr); R(7, 6, 18, 3, hr); R(6, 8, 3, 8, hr); R(23, 8, 3, 8, hr);
  for (const [x, h] of [[9, 3], [11, 4], [13, 2], [15, 3], [17, 2], [19, 4], [21, 3]]) R(x, 9, 2, h - 1, hr);
  R(10, 5, 7, 1, h3); R(12, 6, 3, 1, h3); R(20, 6, 2, 1, h3); if (long) { R(6, 14, 3, 12, hr); R(23, 14, 3, 12, hr); R(6, 14, 1, 10, h3); }
  if (A === 'hat') { const a2 = o.acc2 || '#6b4a2a'; R(4, 4, 24, 2, a2); R(8, 0, 16, 5, a2); R(8, 3, 16, 1, shade(a2, -.3)); }
  if (A === 'helm') { R(7, 2, 18, 8, '#9aa4b0'); R(7, 2, 18, 1, '#cfd8e2'); R(6, 8, 3, 9, '#7d8a99'); R(23, 8, 3, 9, '#7d8a99'); R(15, 0, 2, 3, '#d24a4a'); }
  if (A === 'hood') { R(5, 3, 22, 5, t2); R(5, 7, 4, 12, t2); R(23, 7, 4, 12, t2); R(8, 3, 16, 1, shade(t2, .2)); }
  if (A === 'veil') { R(6, 2, 20, 4, '#f4f1ea'); R(5, 5, 3, 22, '#f4f1ea'); R(24, 5, 3, 22, '#f4f1ea'); R(6, 5, 20, 1, '#d8cfae'); }
  if (A === 'halo') { R(9, 0, 14, 1, '#f6e08c'); R(8, 1, 1, 1, '#f6e08c'); R(23, 1, 1, 1, '#f6e08c'); }
  if (A === 'ears') { for (const [x, s] of [[8, 1], [22, -1]]) { R(x, 1, 3, 4, hr); R(x + (s > 0 ? 1 : 0), 2, 1, 2, '#ffb0c0'); } }
  if (A === 'ribbon') { R(20, 2, 7, 3, '#e5483f'); R(22, 3, 2, 1, '#ffffff'); }
  if (A === 'crown') { R(9, 1, 14, 3, '#f2c46d'); R(9, 0, 2, 1, '#f2c46d'); R(15, 0, 2, 1, '#f2c46d'); R(21, 0, 2, 1, '#f2c46d'); R(15, 2, 2, 1, '#e5483f'); }
}
