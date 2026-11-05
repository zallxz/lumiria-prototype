/* ------------------------------ RENDER ------------------------------ */
/*@@S_crop@@*/
const ITEM_IMG = {};
function drawActors(room = null) {
  const list = [], world = room === null, inView = (a, m = 20) => a.x > Cam.x - m && a.x < Cam.x + VW + m && a.y > Cam.y - 10 && a.y < Cam.y + VH + 30;
  for (const n of NPCS) if ((n.room || null) === room && npcVisible(n)) list.push({ y: n.y, f: () => { pellipse(ctx, n.x, n.y, 5, 2, 'rgba(0,0,0,.25)'); drawChar(ctx, n.x - 6, n.y - 16 + Math.round(Math.sin(Game.time * 2 + n.x) * .4), NPC_LOOK[n.id].look, n.dir, 0); } });
  if (world) { for (const v of VILL) list.push({ y: v.y, f: () => { pellipse(ctx, v.x, v.y, 5, 2, 'rgba(0,0,0,.25)'); drawChar(ctx, v.x - 6, v.y - 16, v.look, v.dir, v.moving ? v.step : 0); } });
    for (const e of ENEMIES) if (!e.dead && inView(e, 40)) list.push({ y: e.y, f: () => drawEnemy(e) });
    for (const d of DROPS) list.push({ y: d.y, f: () => { if (d.item === 'coin') { if (d.silent) return; pcircle(ctx, d.x | 0, d.y | 0, 2, '#f4c869'); ctx.fillStyle = '#fff3c0'; ctx.fillRect((d.x | 0) - 1, (d.y | 0) - 1, 1, 1); } else { const im = ITEM_IMG[d.item]; if (im) ctx.drawImage(im, (d.x | 0) - 6, (d.y | 0) - 6, 12, 12); } } }); }
  for (const b of BOTS) if ((b.room || null) === room && inView(b)) list.push({ y: b.y, f: () => drawBot(b) });
  if (G && (G.room || null) === room) {
    if (COMP) list.push({ y: COMP.y, f: () => { const c = COMP; pellipse(ctx, c.x, c.y, 5, 2, 'rgba(0,0,0,.25)');
      if (G.cDown > 0) { ctx.save(); ctx.translate(Math.round(c.x), Math.round(c.y - 3)); ctx.rotate(-Math.PI / 2); ctx.globalAlpha = .75; drawChar(ctx, -8, -6, COMPANIONS[c.id].look, 0, 0); ctx.restore(); ctx.globalAlpha = 1; ptext(ctx, 'z', c.x + 6 + Math.sin(Game.time * 2) * 2, c.y - 14 - (Game.time * 6 % 6), '#cfe8ff', 7, 'center'); return; }
      if (c.guard > 0) { ctx.strokeStyle = `rgba(200,220,255,${.5 + Math.sin(Game.time * 10) * .3})`; ctx.beginPath(); ctx.ellipse(c.x, c.y - 7, 11, 13, 0, 0, Math.PI * 2); ctx.stroke(); }
      if (G.cHp < compMax()) { ctx.fillStyle = '#1a1020'; ctx.fillRect(c.x - 7, c.y - 22, 14, 3); ctx.fillStyle = '#7ee08a'; ctx.fillRect(c.x - 6, c.y - 21, 12 * G.cHp / compMax(), 1); }
      const lunge = c.atk > 0 ? 1 : 0; drawChar(ctx, c.x - 6 + (c.dir === 3 ? lunge : c.dir === 2 ? -lunge : 0), c.y - 16, COMPANIONS[c.id].look, c.dir, c.moving ? c.step : 0, 1, c.flash > 0 ? 1 : 0); c.flash = Math.max(0, (c.flash || 0) - TICK);
      if (c.id === 'garon') { const sx = c.dir === 2 ? c.x - 9 : c.dir === 3 ? c.x + 4 : c.x + 3; ctx.fillStyle = '#5d6877'; ctx.fillRect(sx, c.y - 10, 5, 7); ctx.fillStyle = '#cfd8e2'; ctx.fillRect(sx + 1, c.y - 9, 3, 5); ctx.fillStyle = '#d24a4a'; ctx.fillRect(sx + 2, c.y - 8, 1, 3); } } });
    list.push({ y: G.y, f: drawPlayer }); }
  if (world) HD.pushStatics(list, Cam.x, Cam.y);
  list.sort((a, b) => a.y - b.y); for (const it of list) it.f();
  if (world) { for (const b of BOLTS) { ctx.globalCompositeOperation = 'lighter'; pcircle(ctx, b.x | 0, b.y | 0, 2, '#7fe8ff'); ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x | 0, b.y | 0, 1, 1); ctx.globalCompositeOperation = 'source-over'; } drawProj(); }
  for (const b of BOTS) if ((b.room || null) === room && inView(b) && (b.bubble || b.down || (G && Math.hypot(b.x - G.x, b.y - G.y) < 56))) drawTag(b);
}
function drawBot(b) {
  pellipse(ctx, b.x, b.y, 5, 2, 'rgba(0,0,0,.25)');
  if (b.down) { ctx.save(); ctx.translate(Math.round(b.x), Math.round(b.y - 3)); ctx.rotate(-Math.PI / 2); ctx.globalAlpha = .75; drawChar(ctx, -8, -6, b.look, 0, 0); ctx.restore(); ctx.globalAlpha = 1;
    ptext(ctx, 'z', b.x + 6 + Math.sin(Game.time * 2) * 2, b.y - 14 - (Game.time * 6 % 6), '#cfe8ff', 7, 'center'); return; }
  const wk = b.mode === 'stay' && b.work, bob = wk && Math.floor(b.anim * 3) % 2 ? 1 : 0;
  drawChar(ctx, b.x - 6, b.y - 16 + bob, b.look, b.dir, b.moving ? b.step : 0, 1, b.flash > 0 ? 1 : 0);
  if (wk) { const hx = b.x + (b.dir === 2 ? -8 : b.dir === 3 ? 6 : 3), hy = b.y - 10 - bob * 3; ctx.fillStyle = '#7a5130'; ctx.fillRect(hx, hy, 2, 6); ctx.fillStyle = b.work === 'tambang' ? '#b8c6d6' : '#9aa84a'; ctx.fillRect(hx - 2, hy, 6, 2); }
  else drawWeaponInHand(b.x, b.y, b.dir, b.wt);
  if (b.swing > 0 && (b.wt === 'pedang' || b.wt === 'belati')) { const [dx, dy] = DIRV[b.dir], k = 1 - b.swing / .2, a0 = Math.atan2(dy, dx) - 1.2 + k * 2.4; ctx.fillStyle = '#e8f4ff';
    for (let i = 0; i < 4; i++) { const a = a0 - i * .2; ctx.globalAlpha = 1 - i / 5; ctx.fillRect(Math.round(b.x + Math.cos(a) * 14) - 1, Math.round(b.y - 7 + Math.sin(a) * 14) - 1, 2, 2); } ctx.globalAlpha = 1; }
  if (b.hp < b.hpMax) { ctx.fillStyle = '#1a1020'; ctx.fillRect(b.x - 7, b.y - 21, 14, 3); ctx.fillStyle = b.mode === 'party' ? '#86dcff' : '#7ee08a'; ctx.fillRect(b.x - 6, b.y - 20, 12 * b.hp / b.hpMax, 1); }
}
function drawWeaponInHand(x, y, dir, wt) {
  if (dir === 1) return; const s = dir === 2 ? -1 : 1, hx = Math.round(x + (dir === 0 ? 5 : s * 5)), hy = Math.round(y - 6);
  if (wt === 'busur') { ctx.fillStyle = '#8a5a34'; ctx.fillRect(hx, hy - 6, 1, 10); ctx.fillRect(hx + s, hy - 7, 1, 2); ctx.fillRect(hx + s, hy + 3, 1, 2); ctx.fillStyle = '#e8e0d0'; ctx.fillRect(hx - s, hy - 5, 1, 8); }
  else if (wt === 'tongkat') { ctx.fillStyle = '#7a5130'; ctx.fillRect(hx, hy - 8, 1, 12); pcircle(ctx, hx, hy - 9, 1, '#7fe8ff'); }
  else if (wt === 'belati') { ctx.fillStyle = '#c9d2dc'; ctx.fillRect(hx, hy - 1, 1, 3); }
}
function drawTag(b) {
  const y = b.y - (b.hp < b.hpMax ? 25 : 21);
  if (b.bubble && !b.down) { ctx.font = "600 7.5px 'Cormorant Garamond', Georgia, serif"; const txt = b.bubble.text, w = Math.ceil(ctx.measureText(txt).width) + 9, x = b.x - w / 2, yy = y - 16;
    ctx.fillStyle = 'rgba(253,247,236,.96)'; ctx.strokeStyle = 'rgba(176,138,74,.8)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.roundRect(x, yy, w, 11, 5); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(b.x - 2, yy + 10.6); ctx.lineTo(b.x, yy + 13); ctx.lineTo(b.x + 2, yy + 10.6); ctx.fill(); ctx.fillStyle = '#4a3726'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x + 4.5, yy + 5.8); }
  ptext(ctx, b.name, b.x, y, b.down ? '#ffc4b8' : '#fff4dc', 7, 'center');
}
function drawProj() {
  for (const p of PROJ) { if (p.kind === 'arrow') { const a = Math.atan2(p.vy, p.vx); ctx.strokeStyle = p.src === 'bot' ? '#c8b89a' : '#f2e2c4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x - Math.cos(a) * 6, p.y - Math.sin(a) * 6); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x | 0, p.y | 0, 1, 1); continue; }
    ctx.globalCompositeOperation = 'lighter'; pcircle(ctx, p.x | 0, p.y | 0, p.kind === 'fire' ? (p.aoe > 20 ? 4 : 3) : 2, p.kind === 'fire' ? '#ff8a3a' : '#7fe8ff'); ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x | 0, p.y | 0, 1, 1); ctx.globalCompositeOperation = 'source-over'; }
}
function drawPlayer() {
  const blink = P.inv > 0 && Math.floor(P.inv * 16) % 2 === 0; if (blink) return;
  pellipse(ctx, G.x, G.y, 5, 2, 'rgba(0,0,0,.28)');
  if (G.poison > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(160,80,255,.35)'; ctx.fillRect(G.x - 7, G.y - 17, 14, 17); ctx.globalCompositeOperation = 'source-over'; }
  const bob = P.actAnim > 0 ? 1 : 0; drawChar(ctx, G.x - 6, G.y - 16 + bob, G.look, G.dir, P.moving ? P.step : 0);
  const wt = wtype(); drawWeaponInHand(G.x, G.y, G.dir, G.weapon ? wt : null);
  const [dx, dy] = facingVec();
  if (P.swing > 0 && (wt === 'pedang' || wt === 'belati')) { const k = 1 - P.swing / .2, base = Math.atan2(dy, dx), a0 = base - 1.3 + k * 2.6, col = G.poison > 0 ? '#c8a0ff' : G.weapon ? (G.weapon === 'pisau_tembaga' ? '#ffcf9a' : '#e8f4ff') : '#c9a46a', R2 = (wt === 'belati' ? 11 : TUNE.attackReach) + 4;
    ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const a = a0 - i * .16, r = R2 - i * .3; ctx.fillStyle = i === 0 ? '#ffffff' : col; ctx.globalAlpha = 1 - i / 8; ctx.fillRect(Math.round(G.x + Math.cos(a) * r) - 1, Math.round(G.y - 7 + Math.sin(a) * r) - 1, 3, 3); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (P.spin > 0) { const k = 1 - P.spin / .32; ctx.strokeStyle = `rgba(200,240,255,${1 - k})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(G.x, G.y - 5, TUNE.spinRadius * (.4 + k * .6), TUNE.spinRadius * (.25 + k * .4), 0, 0, Math.PI * 2); ctx.stroke(); }
  if (P.cast > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(180,220,255,${P.cast * 3})`; ctx.beginPath(); ctx.ellipse(G.x, G.y, 9, 4, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
  if (P.actAnim > 0 && P.swing <= 0) { const k = P.actAnim / .25, hx = G.x + dx * 9, hy = G.y - 8 + dy * 6 - k * 4; ctx.fillStyle = '#7a5130'; ctx.fillRect(Math.round(hx), Math.round(hy), 2, 6); ctx.fillStyle = '#b8c6d6'; ctx.fillRect(Math.round(hx) - 3, Math.round(hy), 8, 2); }
}
/*@@S_enemydraw@@*/
function ambient(dt) {
  if (G && G.room) { const r = ROOMS[G.room]; for (const f of r.fires) if (rand() < dt * 3) FX.burst(f.x + rnd(-3, 3), f.y - 6, 1, '#ffb347', 15, .6, -50, { add: true });
    if (r.steam && rand() < dt * 3) FX.burst(r.steam.x + rnd(-3, 3), r.steam.y, 1, 'rgba(255,255,255,.5)', 5, 1.4, -18, { up: 0, size: 2, sky: true });
    if (r.circle && rand() < dt * 4) FX.burst(r.circle.x + rnd(-24, 24), r.circle.y + rnd(-10, 10), 1, pick(['#9fc8ff', '#f2c46d']), 6, 1.2, -20, { add: true }); return; }
  for (const b of BUILD) if (b.smoke && rand() < dt * 3) FX.burst(b.smoke.x + rnd(-2, 2), b.smoke.y, 1, b.id === 'smith' ? 'rgba(120,110,110,.7)' : 'rgba(220,220,230,.6)', 6, 2.2, -14, { up: 0, size: 2, sky: true });
  for (const o of OBJS) { if (o.torch && rand() < dt * 2) FX.burst(o.x + rnd(-1, 1), o.y, 1, '#ffb347', 10, .5, -40, { add: true }); if (o.spark && rand() < dt * 1.5) FX.burst(o.x, o.y, 4, '#ffcf6a', 50, .35, 200, { add: true }); }
  if (rand() < dt * 5) FX.burst(9 * T + rnd(-3, 3), 52 * T - 6, 1, '#ffb347', 18, .8, -60, { add: true });
  if (nightAmt() < .5 && rand() < dt * 1.5) FX.burst(Cam.x + rnd(VW), Cam.y - 4, 1, pick(['#7fbf5f', '#a6d66a', '#ff9fbe']), 20, 6, 8, { up: -10, size: 2, sky: true });
}
function drawLabels() {
  ctx.font = "700 6.5px 'Cinzel', Georgia, serif"; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const near = G ? Math.hypot : null;
  for (const L of LABELS) { const x = Math.round(L.x - Cam.x), y = Math.round(L.y - Cam.y); if (x < -60 || x > VW + 60 || y < -10 || y > VH + 10) continue;
    const lt = tr(L.t), w = Math.ceil(ctx.measureText(lt).width) + 12; ctx.fillStyle = 'rgba(253,247,236,.94)'; ctx.strokeStyle = 'rgba(176,138,74,.9)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 5.5, w, 11, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#6b4e2a'; ctx.fillText(lt, x, y + .5); }
  void near;
}
function drawQuestMarker() {
  const mp = markerPos(); if (!mp) return; const x = mp[0], y = mp[1] - 22, sx = x - Cam.x, sy = y - Cam.y;
  if (sx > 10 && sx < VW - 10 && sy > 10 && sy < VH - 10) { const b = Math.sin(Game.time * 4) * 1.6; ctx.fillStyle = '#e8c56e'; ctx.strokeStyle = '#7a5a1e'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(sx, sy + b + 4); ctx.lineTo(sx - 4, sy + b - 2); ctx.lineTo(sx, sy + b - 5); ctx.lineTo(sx + 4, sy + b - 2); ctx.closePath(); ctx.fill(); ctx.stroke(); return; }
  const ang = Math.atan2(sy - VH / 2, sx - VW / 2), ex = clamp(VW / 2 + Math.cos(ang) * VW, 16, VW - 16), ey = clamp(VH / 2 + Math.sin(ang) * VH, 16, VH - 16);
  ctx.save(); ctx.translate(Math.round(ex), Math.round(ey)); ctx.rotate(ang); ctx.fillStyle = '#e8c56e'; ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-4, -5); ctx.lineTo(-2, 0); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill(); ctx.restore();
}
function renderWorld() {
  const cx = Math.round(Cam.x * HD.S) / HD.S, cy = Math.round(Cam.y * HD.S) / HD.S;
  HD.ground(cx, cy);
  ctx.save(); ctx.translate(-cx, -cy);
  const t = Game.time, tx0 = Math.floor(cx / T), ty0 = Math.floor(cy / T);
  for (let ty = ty0; ty <= ty0 + Math.ceil(VH / T); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VW / T); tx++) if (at(tx, ty) === TL.WATER) { const ph = hash(tx, ty, 3) * 6.28; const k = (Math.sin(t * 1.6 + ph) + 1) / 2;
    if (k > .6) { ctx.fillStyle = `rgba(200,235,255,${(k - .6) * 1.6})`; ctx.fillRect(tx * T + 3 + (hash(tx, ty, 4) * 8 | 0), ty * T + 4 + (hash(tx, ty, 5) * 8 | 0), 4, 1); } }
  if (G) drawEntitiesGround();
  drawActors(null);
  if (G && BM.on) drawGhost();
  FX.draw(ctx, false);
  ctx.restore();
  ctx.imageSmoothingEnabled = false; ctx.drawImage(overC, cx, cy, VW, VH, 0, 0, VW, VH); ctx.imageSmoothingEnabled = true;
  ctx.save(); ctx.translate(-cx, -cy); FX.draw(ctx, true); ctx.restore();
  lighting();
  if (G) drawLabels();
  ctx.save(); ctx.translate(-cx, -cy); FX.drawTexts(ctx);
  if (G && interact && interact.npc) { const n = interact.npc; ptext(ctx, '…', n.x, n.y - 24 + Math.sin(t * 6), '#ffffff', 8, 'center'); }
  ctx.restore();
  if (G) drawQuestMarker();
}
function renderRoom() {
  const r = ROOMS[G.room], cx = Math.round(Cam.x), cy = Math.round(Cam.y), t = Game.time;
  ctx.fillStyle = '#07060c'; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.translate(-cx, -cy); const rp = HD.img['r_' + G.room]; if (rp) ctx.drawImage(rp, 0, 0, r.w * T, r.h * T); else { ctx.imageSmoothingEnabled = false; ctx.drawImage(r.canvas, 0, 0); ctx.imageSmoothingEnabled = true; }
  for (const f of r.fires) for (let i = 0; i < 4; i++) { const h = 3 + Math.abs(Math.sin(t * 10 + i * 1.7 + f.x)) * (f.small ? 3 : 6); ctx.fillStyle = i % 2 ? '#ffb347' : '#ff6a2a'; ctx.fillRect(f.x - 4 + i * 2, f.y - h, 2, h); }
  if (r.circle) for (let i = 0; i < 6; i++) { const a = t * .6 + i / 6 * Math.PI * 2; ctx.fillStyle = '#e8f4ff'; ctx.fillRect(Math.round(r.circle.x + Math.cos(a) * 24), Math.round(r.circle.y + Math.sin(a) * 11), 1, 1); }
  drawActors(G.room);
  FX.draw(ctx, false); FX.draw(ctx, true);
  ctx.globalCompositeOperation = 'lighter';
  for (const L of r.lights) { const fl = L.fire ? 1 + Math.sin(t * 13 + L.x) * .07 : 1, rr = L.r * fl, g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, rr); g.addColorStop(0, `rgba(${L.col},${L.a ?? .3})`); g.addColorStop(1, `rgba(${L.col},0)`); ctx.fillStyle = g; ctx.fillRect(L.x - rr, L.y - rr, rr * 2, rr * 2); }
  ctx.globalCompositeOperation = 'source-over';
  FX.drawTexts(ctx);
  if (interact && interact.npc) { const n = interact.npc; ptext(ctx, '…', n.x, n.y - 24 + Math.sin(t * 6), '#ffffff', 8, 'center'); }
  ctx.restore();
  const g = ctx.createRadialGradient(VW / 2, VH / 2, VH * .3, VW / 2, VH / 2, VW * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(5,3,2,.6)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  ptext(ctx, r.n.toUpperCase(), VW / 2, 10, '#f4c869', 8, 'center');
  drawQuestMarker();
}

/* ------------------------------ HUD ------------------------------ */
let lastPrompt = '';
function updateHUD(dt) {
  hudT -= dt; miniT -= dt;
  if (hudT <= 0) { hudT = .12;
    $('#h-name').textContent = G.name; $('#h-title').textContent = gelar(); $('#h-hp').style.width = (G.hp / G.hpMax * 100) + '%'; $('#h-hpt').textContent = `HP ${Math.ceil(G.hp)}/${G.hpMax}`;
    $('#h-mp').style.width = (G.mp / mpMax() * 100) + '%'; $('#h-mpt').textContent = `MANA ${Math.floor(G.mp)}/${mpMax()}`;
    $('#h-coin').textContent = `● ${fmt(G.coin)} koin`; $('#h-clock').textContent = clockStr();
    $('#h-alignt').textContent = G.align >= 30 ? `Cahaya ${G.align}` : G.align <= -30 ? `Bayangan ${-G.align}` : `Tengah ${G.align > 0 ? '+' : ''}${G.align}`; $('#h-alignm').style.left = ((G.align + 100) / 2) + '%';
    $('#h-alignt').style.color = G.align >= 30 ? 'var(--gold)' : G.align <= -30 ? '#c8a0ff' : 'var(--muted)';
    const z = G.room ? { n: ROOMS[G.room].n, tier: 'aman' } : zoneAt(G.x, G.y); $('#h-zone').className = 'z-' + z.tier; $('#h-zone').textContent = `${z.n} · ${z.tier === 'aman' ? 'Aman' : z.tier === 'kuning' ? 'Zona Kuning' : 'ZONA MERAH'}`;
    const on = onlineBots().length; $('#h-online').textContent = `${on + 1} pengembara online · ${on} AI`;
    if (!G.room && z.tier !== G.lastTier) { if (z.tier === 'merah') toast('Memasuki ZONA MERAH', 'Saat online: PK aktif, 30% isi tas bisa jatuh', 'event'); else if (z.tier === 'kuning' && G.lastTier === 'aman') toast('Zona Kuning', 'Saat online: PK aktif, 10% isi tas bisa jatuh'); G.lastTier = z.tier; }
    const qi = questInfo(); let html = qi.items.map(i => `<div class="qi ${i.done ? 'done' : ''}"><b>${i.done ? '✓' : '›'}</b><span>${i.t}</span></div>`).join('');
    if (G.waveAt && !G.wave) { const left = G.waveAt - G.clock, d = Math.floor(left / (24 * HOUR_S)), h = Math.floor((left % (24 * HOUR_S)) / HOUR_S); html += `<div class="qi" style="color:#ffb38a"><b>!</b><span>Gelombang Monster: ${d}h ${h}j lagi</span></div>`; }
    if (G.wave && G.wave.active) html += `<div class="qi" style="color:#ff8a8a"><b>!</b><span>Tahan gerbang: ${G.wave.left} monster tersisa</span></div>`;
    const ml = missionLine(); if (ml) html += `<div class="qi" style="color:#ffe08a"><b>★</b><span>${ml}</span></div>`; partyHUD();
    if ($('#q-body').innerHTML !== html) $('#q-body').innerHTML = html;
    const ev = G.events.map(e => `<div class="chip ${EVENTS[e.id].good ? 'good' : ''}">${EVENTS[e.id].n} · ${Math.ceil(e.left)} dtk</div>`).join(''); if ($('#events').innerHTML !== ev) $('#events').innerHTML = ev;
    const pr = !Panel.open && !Dlg.open && interact ? (interact.f ? `<span class="key">${document.body.classList.contains('touch') ? 'Aksi' : 'E'}</span>${interact.label}` : `<span class="muted">${interact.label}</span>`) : '';
    if (pr !== lastPrompt) { lastPrompt = pr; $('#prompt').innerHTML = pr; $('#prompt').hidden = !pr; }
    const W = WTYPES[wtype()]; $('#b-attack .ic').textContent = { pedang: 'Tebas', busur: 'Panah', tongkat: 'Sihir', belati: 'Tikam' }[wtype()]; $('#b-attack .cd').style.height = (P.atkCd / W.cd * 100) + '%';
    for (const [i, id] of [[0, 'b-skill'], [1, 'b-skill2']]) { const sid = G.loadout[i], s = ACTS[sid], el = $('#' + id); el.querySelector('.ic').textContent = s ? s.short : '—'; el.querySelector('.cd').style.height = s ? ((P.scd[sid] || 0) / s.cd * 100) + '%' : '0%';
      el.classList.toggle('lock', !s || !skillOpen(s) || G.mp < s.mp); }
    $('#hurt').style.opacity = FX.hurtT > 0 ? 1 : (G.hp < G.hpMax * .3 ? .35 : 0);
    const cc = $('#h-comp'); if (COMP) { cc.hidden = false; const m = compMax(); $('#h-compn').textContent = `${COMPANIONS[COMP.id].n}${G.cDown > 0 ? ` · pingsan ${Math.ceil(G.cDown)}s` : ''}`; $('#h-comphp').style.width = (G.cHp / m * 100) + '%'; $('#h-compen').style.width = G.cEn + '%';
      cc.classList.toggle('down', G.cDown > 0); cc.classList.toggle('full', G.cEn >= 100); if (cc.dataset.id !== COMP.id) { cc.dataset.id = COMP.id; drawPortrait($('#h-compp').getContext('2d'), COMPANIONS[COMP.id].look); } } else cc.hidden = true;
    if (G.thief) $('#prompt').innerHTML = `<span class="key" style="background:#a03a3a">!</span>Kabur sebelum ketahuan: ${Math.ceil(G.thief.t)} dtk`, $('#prompt').hidden = false, lastPrompt = '';
  }
  if (Panel.open && Panel.kind === 'peta') { G.mapT = (G.mapT || 0) - dt; if (G.mapT <= 0) { G.mapT = .25; drawWorldMap(); } }
  if (miniT <= 0) { miniT = .25; const m = $('#mini').getContext('2d'), px = G.room ? G.wx : G.x, py = G.room ? G.wy : G.y, MX = 72, MY = 58;
    const ox0 = clamp(Math.round(px / T - MX / 2), 0, MW - MX), oy0 = clamp(Math.round(py / T - MY / 2), 0, MH - MY); m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, MX, MY); m.setTransform(1, 0, 0, 1, -ox0, -oy0); m.drawImage(miniBase, 0, 0);
    m.fillStyle = 'rgba(10,20,40,' + (.45 * nightAmt()) + ')'; m.fillRect(0, 0, MW, MH);
    if (!G.room) { m.strokeStyle = 'rgba(255,255,255,.6)'; m.lineWidth = 1; m.strokeRect(Math.floor(Cam.x / T) + .5, Math.floor(Cam.y / T) + .5, Math.round(VW / T), Math.round(VH / T)); }
    for (const b of BOTS) if (!b.room && !b.down && b.mode !== 'off') { m.fillStyle = b.mode === 'party' ? '#86dcff' : 'rgba(200,220,255,.55)'; m.fillRect(Math.floor(b.x / T), Math.floor(b.y / T), b.mode === 'party' ? 2 : 1, b.mode === 'party' ? 2 : 1); }
    const mp = markerPos(true); if (mp) { m.fillStyle = '#f4c869'; m.fillRect(Math.floor(mp[0] / T) - 1, Math.floor(mp[1] / T) - 1, 3, 3); }
    for (const e of ENEMIES) if (!e.dead && e.d.boss) { m.fillStyle = '#ff5a5a'; m.fillRect(Math.floor(e.x / T), Math.floor(e.y / T), 2, 2); }
    for (const pl of PLOTS) if (G.land[pl.id].owner === 'me') { m.strokeStyle = '#ffe08a'; m.strokeRect(pl.x + .5, pl.y + .5, pl.w - 1, pl.h - 1); }
    m.fillStyle = '#ffffff'; m.fillRect(Math.floor(px / T) - 1, Math.floor(py / T) - 1, 3, 3); m.fillStyle = '#ff6f86'; m.fillRect(Math.floor(px / T), Math.floor(py / T), 1, 1); m.setTransform(1, 0, 0, 1, 0, 0); }
}
