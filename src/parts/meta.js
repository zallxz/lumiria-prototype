/* ------------------------------ SIMPAN, CADANGAN, MIGRASI ------------------------------ */
const SAVE_V = 4;
function botsSnapshot() { return BOTS.map(b => [b.skc, b.skl, b.gw, b.ga, b.wallet, b.score.hunt, b.score.trade, b.score.craft, b.kills]); }
function botsRestore(a) { if (!Array.isArray(a)) return; a.forEach((r, i) => { const b = BOTS[i]; if (!b || !r) return; [b.skc, b.skl, b.gw, b.ga, b.wallet] = r; b.score = { hunt: r[5] || 0, trade: r[6] || 0, craft: r[7] || 0 }; b.kills = r[8] || 0; botRefresh(b); b.hp = b.hpMax; }); }
function migrate(s) { // v3 → v4: tidak menghapus progres lama
  if (s.v === 3) { s.v = 4; s.sk.pertukangan = s.sk.pertukangan || 0; s.armor = null; s.charm = null; s.skLock = {}; s.buffs = {}; s.fac = { serikat: 0, kuil: Math.floor(Math.max(0, s.align) / 10), warga: 0, gelap: Math.floor(Math.max(0, -s.align) / 10) };
    s.aff = {}; s.party = []; s.week = null; s.plotOwned = true; s.migrated = 3; }
  s.party = (s.party || []).filter(p => p && BOTS[p.i]); s.buffs = s.buffs || {}; s.skLock = s.skLock || {}; s.fac = s.fac || {}; s.aff = s.aff || {}; return s; }
function writeSave() { G.bs = botsSnapshot(); G.savedAt = Date.now(); store.set('save', G); store.set('hasSave', true); }
function backupTick() { if (TEST || !G) return; const now = Date.now(), last = store.get('bakAt', 0); if (now - last < 5 * 60 * 1000) return;
  for (let i = 3; i > 1; i--) { const prev = store.get('bak' + (i - 1), null); if (prev) store.set('bak' + i, prev); } store.set('bak1', G); store.set('bakAt', now); }
function backupList() { const out = []; for (let i = 1; i <= 3; i++) { const s = store.get('bak' + i, null); if (s) out.push({ i, day: s.clock != null ? Math.floor((START_H * HOUR_S + s.clock) / (24 * HOUR_S)) + 1 : '?', name: s.name, at: s.savedAt, coin: s.coin }); } return out; }
function loadFrom(s) { if (!s || (s.v !== 3 && s.v !== 4)) return false; G = migrate(s); G.ores = G.ores && G.ores.length === ORES.length ? G.ores : ORES.map(() => ({ hits: 0, cd: 0 })); G.thief = null;
  botsRestore(G.bs); for (const p of G.party) { const b = BOTS[p.i]; if (b) { b.mode = 'party'; b.task = 'party'; } }
  rebuildWorld(); if (G.room && !ROOMS[G.room]) { G.room = null; G.x = G.wx; G.y = G.wy; } startWorld(); refreshStats(); return true; }
function exportSave() { G.bs = botsSnapshot(); try { return btoa(unescape(encodeURIComponent(JSON.stringify(G)))); } catch { return ''; } }
function importSave(txt) { try { const s = JSON.parse(decodeURIComponent(escape(atob(txt.trim())))); if (!loadFrom(s)) return false; writeSave(); return true; } catch { return false; } }
function backupHTML() { const l = backupList();
  return `<div class="note" style="margin-top:0">Permainan tersimpan otomatis tiap 30 detik. Setiap 5 menit, simpanan terakhir disalin ke cadangan (3 terakhir disimpan). Simpanan versi lama (v3) dimigrasikan, tidak dihapus.</div>
    <h5>Cadangan otomatis</h5>${l.map(b => `<div class="stat"><span>Cadangan ${b.i} · ${esc(b.name || '')} · Hari ${b.day} · ${fmt(b.coin || 0)} koin${b.at ? ` <span class="muted" style="font-size:11px">${new Date(b.at).toLocaleString(LANG.cur === 'en' ? 'en-US' : 'id-ID')}</span>` : ''}</span><span><button class="btn sm ghost" data-do="restore" data-arg="${b.i}">Pulihkan</button></span></div>`).join('') || '<div class="note">Belum ada cadangan.</div>'}
    <h5>Ekspor / impor</h5><div class="note" style="margin-top:0">Salin kode ini untuk memindahkan simpanan ke perangkat lain.</div>
    <textarea id="save-code" class="inp" rows="3" style="width:100%;font:11px ui-monospace,monospace" readonly>${Panel.exp || ''}</textarea>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0"><button class="btn sm" data-do="export">Buat kode</button><button class="btn sm ghost" data-do="copycode">Salin</button></div>
    <textarea id="import-code" class="inp" rows="3" style="width:100%;font:11px ui-monospace,monospace" placeholder="Tempel kode simpanan di sini"></textarea><div style="margin-top:6px"><button class="btn sm gold" data-do="import">Impor & muat</button></div>`; }
function metaAction(a, arg) {
  if (a === 'restore') { const s = store.get('bak' + arg, null); if (s && loadFrom(s)) { closePanel(); toast('Cadangan dipulihkan', `Hari ${dayOf()}`, 'good'); } else toast('Cadangan tidak bisa dibuka'); return; }
  if (a === 'export') { Panel.exp = exportSave(); return renderPanel(); }
  if (a === 'copycode') { const t = $('#save-code'); if (!t || !t.value) return; navigator.clipboard && navigator.clipboard.writeText(t.value).then(() => toast('Kode disalin'), () => { t.select(); toast('Pilih & salin manual'); }); return; }
  if (a === 'import') { const t = $('#import-code'); if (t && importSave(t.value)) { closePanel(); toast('Simpanan diimpor', `Selamat datang kembali, ${G.name}`, 'good'); } else toast('Kode tidak valid'); return; }
  if (a === 'rankpanel') return openPanel('rank');
  if (a === 'backuppanel') return openPanel('backup');
  if (a === 'kick') { const b = BOTS[+arg]; if (b) leaveParty(b, true); return renderPanel(); }
  if (a === 'raid') { raidCall(); return renderPanel(); }
  if (a === 'lock') { const [k, v] = arg.split(':'); G.skLock = G.skLock || {}; G.skLock[k] = v; SFX.ui(); return renderPanel(); }
  if (a === 'equip') { equip(arg); SFX.ui(); return renderPanel(); }
  if (a === 'unequip') { unequip(arg); SFX.ui(); return renderPanel(); }
}
/* ---- HUD party ---- */
function partyHUD() { const el = $('#h-party'); if (!el) return; const pb = partyBots(); el.hidden = !pb.length; if (!pb.length) return;
  const html = pb.map(b => `<div class="pm ${b.down ? 'down' : ''}"><span>${esc(b.name)}</span><div class="bar"><i style="width:${b.hp / b.hpMax * 100}%"></i></div></div>`).join(''); if (el.innerHTML !== html) el.innerHTML = html; }
