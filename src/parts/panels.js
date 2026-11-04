/* ------------------------------ PANELS ------------------------------ */
const Panel = { kind: null, tab: null, first: false, open: false, sel: null, ndir: 1, nitem: 'besi' };
/*@@S_icons@@*/
const img = (id, cls = 'ic16') => `<img class="${cls}" src="${itemIcon(id)}" alt="">`;
function openPanel(kind, tab, first) { if (kind === 'rank' && !tab) tab = 'hunt'; if (kind === 'plot') { Panel.pid = tab; tab = 'info'; } if (kind === 'stash' || kind === 'shop') { Panel.rid = tab; tab = null; } if (kind === 'market' && !tab) tab = 'panen'; Panel.kind = kind; $('#panel').classList.toggle('wide', kind === 'peta' || kind === 'web3'); if (kind === 'web3' && !tab) tab = 'ringkas'; Panel.tab = tab || { status: 'status', market: 'panen', news: 'kabar' }[kind] || null; Panel.first = !!first; Panel.open = true; Panel.sel = null;
  $('#panel').hidden = false; SFX.ui(); renderPanel(); }
function closePanel() { if (!Panel.open) return; $('#panel').hidden = true; Panel.open = false; const k = Panel.kind, first = Panel.first; Panel.kind = null; SFX.ui(); CUR_CITY = 'lumiria';
  if (k === 'status' && first) afterFirstStatus();
  if (k === 'market' && G.stage === 3 && !G.flags_ritualCall) { G.flags_ritualCall = true; setTimeout(() => toast('Kuil memanggilmu', 'Pendeta Sela ingin bicara', 'good'), 200); } }
$('#p-close').onclick = closePanel;
$('#prompt').addEventListener('pointerdown', e => { e.preventDefault(); Input.hits.add('act'); Snd.unlock(); });
function renderPanel() {
  const k = Panel.kind, T2 = $('#p-tabs'), B = $('#p-body'), titleEl = $('#p-title');
  const tabs = list => T2.innerHTML = list.map(([id, n]) => `<button class="tab ${Panel.tab === id ? 'on' : ''}" data-tab="${id}">${n}</button>`).join('');
  T2.innerHTML = '';
  if (k === 'status') { titleEl.textContent = 'JENDELA STATUS'; tabs([['status', 'Status'], ['build', 'Build'], ['skill', 'Skill'], ['tas', 'Tas'], ['resep', 'Resep'], ['rep', 'Reputasi'], ['sosial', 'Sosial']]); B.innerHTML = statusHTML(); drawStatusCanvases(); }
  else if (k === 'market') { titleEl.textContent = 'PASAR ' + CITY[CUR_CITY].n.toUpperCase(); tabs([['panen', 'Hasil Bumi'], ['bijih', 'Bijih & Bahan'], ['jadi', 'Barang Jadi'], ['bahan', 'Dapur & Benih'], ['banding', 'Bandingkan Kota'], ...(CUR_CITY === 'lumiria' ? [['arus', 'Arus Ekonomi']] : [])]); B.innerHTML = Panel.tab === 'arus' ? flowHTML() : Panel.tab === 'banding' ? compareHTML() : marketHTML(); drawSparks(); }
  else if (k === 'plot') { const mine = G.land[Panel.pid].owner === 'me'; titleEl.textContent = 'PAPAN KAVLING'; if (mine) tabs([['info', 'Kavling'], ['bangun', 'Bangun']]); B.innerHTML = plotHTML(); }
  else if (k === 'rank') { titleEl.textContent = 'PAPAN PERINGKAT MINGGUAN'; tabs([['hunt', 'Pemburu'], ['trade', 'Saudagar'], ['craft', 'Pengrajin']]); B.innerHTML = rankHTML(); }
  else if (k === 'backup') { titleEl.textContent = 'CADANGAN & EKSPOR'; B.innerHTML = backupHTML(); }
  else if (k === 'land') { titleEl.textContent = 'KANTOR TANAH GUILD'; B.innerHTML = landHTML(); }
  else if (k === 'stash') { titleEl.textContent = 'PETI PENYIMPANAN'; B.innerHTML = stashHTML(); }
  else if (k === 'shop') { titleEl.textContent = 'KELOLA TOKO'; B.innerHTML = shopHTML(); }
  else if (k === 'tukang') { titleEl.textContent = 'TOKO TUKANG BAGAS'; B.innerHTML = tukangHTML(); }
  else if (k === 'bench') { titleEl.textContent = 'MEJA KERJA'; B.innerHTML = craftHTML('bench'); }
  else if (k === 'peta') { titleEl.textContent = 'PETA ELNORIA'; B.innerHTML = mapHTML(); requestAnimationFrame(() => { mapBind(); drawWorldMap(); }); }
  else if (k === 'web3') { titleEl.textContent = 'LAB WEB3 · SIMULASI'; tabs([['ringkas', 'Potensi'], ['dompet', 'Dompet'], ['notaris', 'Notaris'], ['pasar', 'Pasar Aset'], ['lencana', 'Lencana'], ['dao', 'Kas & Voting']]); B.innerHTML = web3HTML(); }
  else if (k === 'forge' || k === 'cook') { titleEl.textContent = k === 'forge' ? 'BENGKEL TEMPA' : 'DAPUR KEDAI RIN'; B.innerHTML = craftHTML(k); }
  else if (k === 'board') { titleEl.textContent = 'PAPAN PESANAN GUILD'; B.innerHTML = boardHTML(); }
  else if (k === 'news') { titleEl.textContent = 'PAPAN BERITA'; tabs([['kabar', 'Kabar'], ['tulis', 'Tulis Kabar']]); B.innerHTML = newsHTML(); }
  else if (k === 'armory') { titleEl.textContent = 'GUDANG SENJATA LATIHAN'; B.innerHTML = armoryHTML(); }
  else if (k === 'gelap') { titleEl.textContent = 'PASAR GELAP'; B.innerHTML = gelapHTML(); }
  else if (k === 'pause') { titleEl.textContent = 'JEDA'; B.innerHTML = pauseHTML(); }
}
$('#p-tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; Panel.tab = b.dataset.tab; Panel.sel = null; SFX.ui(); renderPanel(); });
$('#p-body').addEventListener('click', e => { const b = e.target.closest('[data-do]'); if (!b || b.disabled) return; doAction(b.dataset.do, b.dataset.arg); });
$('#p-body').addEventListener('change', e => { if (e.target.id === 'n-item') Panel.nitem = e.target.value; });
const reqText = s => [...Object.entries(s.req).map(([k, v]) => `${SKILLS[k]} ${v}`), ...(s.align ? [s.align > 0 ? `Cahaya ${s.align}` : `Bayangan ${-s.align}`] : [])].join(' · ') || 'Terbuka sejak awal';
const skillOpen = s => Object.entries(s.req).every(([k, v]) => G.sk[k] >= v) && (!s.align || (s.align > 0 ? G.align >= s.align : G.align <= s.align));
function statusHTML() {
  const t = Panel.tab, og = ORIGINS.find(o => o.id === G.origin), comp = G.comp && COMPANIONS[G.comp];
  const head = Panel.first ? `<div class="card" style="margin-bottom:10px;border-color:var(--line)"><b class="px glow" style="color:var(--line)">Jendela Status terbuka untuk pertama kalinya.</b><div class="note" style="margin:2px 0 0">Tekan I atau tombol Status kapan saja. Tab Build untuk merakit senjata dan skill sendiri.</div></div>` : '';
  const ap = (G.align + 100) / 2;
  if (t === 'status') return head + `<div class="grid2"><div class="card" style="display:flex;gap:12px;align-items:center"><canvas id="st-por" width="32" height="32" style="width:96px;height:96px;image-rendering:pixelated;background:radial-gradient(circle at 50% 40%,#2c5c9c,#0b1c3a);border-radius:5px"></canvas>
    <div><div class="px" style="font-size:20px">${esc(G.name)}</div><div class="tag">${gelar()}</div><div class="note" style="margin-top:6px">Jalur: <b style="color:var(--ink)">${pathName()}</b><br>Kenangan Bumi: <b style="color:var(--ink)">${og.n}</b></div></div></div>
    <div class="card"><div class="stat"><span>HP / Mana</span><span>${Math.ceil(G.hp)}/${G.hpMax} · ${Math.floor(G.mp)}/${mpMax()}</span></div>
    <div class="stat"><span>Senjata</span><span>${G.weapon ? itemName(G.weapon) : 'Tongkat Kayu'} · ${WTYPES[wtype()].n} · ${weaponDmg()} dmg</span></div>
    <div class="stat"><span>Koin</span><span style="color:var(--gold)">${fmt(G.coin)}</span></div><div class="stat"><span>Reputasi Guild</span><span>${tr(FRANK_N[facRank('guild')])} (${G.rep})</span></div>${(G.titles || []).length ? `<div class="stat"><span>Gelar juara</span><span>${G.titles.slice(-2).map(tr).join(' · ')}</span></div>` : ''}
    <div class="stat"><span>Kredibilitas kabar</span><span>${Math.round(G.cred * 100)}%</span></div>
    <div class="stat"><span>Kavling</span><span>${myPlots().map(p => p.id).join(', ') || 'Belum punya'}</span></div><div class="stat"><span>Royalti resep Bumi</span><span>${G.discovered ? fmt(G.royalty) + ' koin' : '—'}</span></div></div>
    ${attrHTML()}<div class="card"><h5 style="margin-top:0">${alignName()}</h5><div class="abar big"><i style="left:${ap}%"></i></div><div class="stat" style="border:0"><span style="color:#c8a0ff">Bayangan</span><span>${G.align > 0 ? 'Cahaya ' + G.align : G.align < 0 ? 'Bayangan ' + (-G.align) : 'Netral'}</span><span style="color:var(--gold)">Cahaya</span></div>
    <div class="note" style="margin:0">${ALIGN_D[alignName()]}</div><div class="note">Cahaya: pesanan guild, sumbangan Kuil, membangunkan pengembara pingsan, kabar jujur. Bayangan: mencopet, kabar palsu, Pasar Gelap, racun.</div></div>
    <div class="card"><h5 style="margin-top:0">Rekan</h5>${comp ? `<div style="display:flex;gap:10px;align-items:center"><canvas id="st-comp" width="32" height="32" style="width:64px;height:64px;image-rendering:pixelated;background:radial-gradient(circle at 50% 40%,#2c5c9c,#0b1c3a);border-radius:5px"></canvas><div><b>${comp.n}</b> <span class="muted">${comp.title}</span><div style="color:var(--gold)">${'★'.repeat(comp.stars)}</div><div class="note" style="margin:0">${comp.role}<br>Sifat: ${comp.trait} (${comp.traitD})</div><div class="stat" style="border:0;padding:2px 0"><span>HP · Energi</span><span>${Math.ceil(G.cHp)}/${compMax()} · ${Math.floor(G.cEn)}%${G.cDown > 0 ? ' · pingsan' : ''}</span></div><div class="note" style="margin:0">Jurus energi: <b>${COMP_ST[G.comp].sp}</b>. ${COMP_ST[G.comp].spd}</div></div></div>` : '<div class="note" style="margin:0">Belum ada. Ritual Pemanggilan pertama ada di Kuil.</div>'}</div></div>`;
  if (t === 'build') { const ws = Object.keys(G.inv).filter(id => ITEMS[id] && ITEMS[id].dmg);
    const wrow = (id) => { const it = id ? ITEMS[id] : { n: 'Tongkat Kayu', dmg: 1, wt: 'pedang' }, on = (G.weapon || null) === id; return `<div class="rec">${id ? img(id) : '<span class="ic16"></span>'}<div><b>${it.n}</b> <span class="muted">${WTYPES[it.wt].n} · ${it.dmg} dmg dasar · melatih ${SKILLS[WTYPES[it.wt].sk]}</span><div class="note" style="margin:0">${WTYPES[it.wt].d}</div></div><button class="btn sm ${on ? 'gold' : ''}" data-do="equipw" data-arg="${id || ''}" ${on ? 'disabled' : ''}>${on ? 'Dipakai' : 'Pakai'}</button></div>`; };
    const slot = i => { const id = G.loadout[i], s = ACTS[id]; return `<div class="card"><span class="tag">Slot ${i + 1} · ${i ? 'L' : 'K'}</span><div style="margin-top:4px"><b>${s ? s.n : '—'}</b></div><div class="note" style="margin:0">${s ? s.d : 'Kosong'}</div></div>`; };
    return head + `<h5>Senjata · menentukan cara menyerang</h5>${wrow(null)}${ws.map(wrow).join('')}<div class="note">Beli senjata latihan di Guild, tempa versi kuatnya di Bengkel. Tiap senjata melatih skill tempurnya sendiri.</div>
      ${gearHTML()}<h5>Slot skill aktif</h5><div class="grid2">${slot(0)}${slot(1)}</div>
      <h5>Semua skill · rakit build-mu sendiri</h5>${Object.entries(ACTS).map(([id, s]) => { const open = skillOpen(s);
        return `<div class="rec"><span class="tag" style="min-width:34px;text-align:center">${s.hybrid ? 'HIB' : SKILLS[s.k].slice(0, 3).toUpperCase()}</span><div style="min-width:0"><b>${s.n}</b>${s.hybrid ? '<span class="bumi">HIBRIDA</span>' : ''} <span class="muted" style="font-size:12px">· ${s.mp} mana · jeda ${s.cd} dtk</span><div class="note" style="margin:0">${s.d}</div><div class="ings"><span class="${open ? '' : 'lack'}">${open ? '✓ ' : 'Butuh '}${reqText(s)}</span></div></div>
        <div class="act" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end"><button class="btn sm" data-do="slot" data-arg="${id}:0" ${open && G.loadout[0] !== id ? '' : 'disabled'}>Slot 1</button><button class="btn sm" data-do="slot" data-arg="${id}:1" ${open && G.loadout[1] !== id ? '' : 'disabled'}>Slot 2</button></div></div>`; }).join('')}
      <div class="note">Tidak ada kelas. Skill naik karena dipakai, total maksimal 700 poin. Skill hibrida muncul dari gabungan dua jalur, dan dua di antaranya butuh Jalan Cahaya atau Bayangan.</div>`; }
  if (t === 'rep') return head + repHTML();
  if (t === 'sosial') return head + socialHTML();
  if (t === 'skill') { const row = k => { const lk = (G.skLock || {})[k] || 'up', nx = PERKS[k].slice(1).find(p => p[0] > tierOf(G.sk[k])); return `<div class="skill" style="grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) auto auto"><span>${SKILLS[k]} <span class="muted" style="font-size:11px">${tr(tierName(G.sk[k]))}${nx ? ` · ${tr(TIERS[nx[0]])} (${nx[0] * 20}): ${tr(nx[1])}` : ''}</span></span><div class="sbar"><i style="width:${G.sk[k]}%"></i></div><b style="text-align:right">${G.sk[k]}</b><span style="display:flex;gap:2px">${[['up', '↑'], ['down', '↓'], ['lock', '■']].map(([v, s]) => `<button class="btn sm ${lk === v ? 'gold' : 'ghost'}" style="padding:2px 6px;min-height:0" data-do="lock" data-arg="${k}:${v}" title="${v === 'up' ? 'Naik' : v === 'down' ? 'Turun saat batas' : 'Kunci'}">${s}</button>`).join('')}</span></div>`; };
    return head + `<div class="note" style="margin-top:0">Skill naik saat dipakai. Total maksimal 700 poin, jadi tidak ada yang bisa menguasai semuanya.</div><h5>Tempur</h5>${SKILL_TEMPUR.map(row).join('')}<h5>Kehidupan</h5>${SKILL_HIDUP.map(row).join('')}
    <div class="stat" style="margin-top:8px"><span>Total skill</span><span>${totalSkill()} / ${SKILL_CAP}</span></div><div class="note">Tingkatan: ${TIERS.map((n, i) => `${n} ${i * 20}`).join(' · ')}. Tiap tingkatan membuka bonus. ↑ naik · ↓ turun untuk memberi ruang saat total mencapai 700 · ■ kunci.</div><div class="note">Gelar muncul dari kombinasi skill dan jalan yang kamu tempuh. Ambangnya diturunkan untuk prototype.</div>`; }
  if (t === 'tas') { const ids = Object.keys(G.inv).filter(id => cnt(id) > 0); const sel = Panel.sel;
    let html = head + `<div class="inv">${ids.map(id => `<button class="slot ${sel === id ? 'sel' : ''} ${G.weapon === id || G.seedSel === id ? 'eq' : ''}" data-do="sel" data-arg="${id}" title="${itemName(id)}">${img(id)}<span class="n">${cnt(id)}</span></button>`).join('') || '<div class="note">Tas kosong.</div>'}</div>`;
    if (sel && cnt(sel)) { const it = ITEMS[sel]; let acts = '';
      if (it.heal) acts += `<button class="btn sm" data-do="eat" data-arg="${sel}">Makan (+${it.heal >= 99 ? 'penuh' : it.heal} HP)</button>`;
      if (it.dmg) acts += `<button class="btn sm" data-do="equipw" data-arg="${sel}" ${G.weapon === sel ? 'disabled' : ''}>Pakai</button>`;
      if (it.seed) acts += `<button class="btn sm" data-do="seed" data-arg="${sel}" ${G.seedSel === sel ? 'disabled' : ''}>Pilih untuk ditanam</button>`;
      if (sel === 'pupuk') acts += `<button class="btn sm" data-do="pupuk">Tabur di Petak Pengembara</button>`;
      if (sel === 'racun') acts += `<button class="btn sm" data-do="oil">Oleskan ke senjata (+3 dmg, 90 dtk)</button>`;
      html += `<div class="detail card">${img(sel)}<div style="flex:1;min-width:140px"><b>${it.n}</b> ×${cnt(sel)}<div class="note" style="margin:0">${itemDesc(sel)}</div></div>${acts}</div>`; }
    return html + `<div class="note">Isi tas bisa jatuh saat kalah dari pemain lain di zona kuning atau merah (fitur online). Barang di bank selalu aman.</div>`; }
  if (t === 'resep') { const r = (list, place) => list.filter(x => !x.bumi || x.bumi === G.origin).map(x => `<div class="stat"><span>${itemName(x.out)}${x.bumi ? '<span class="bumi">RESEP BUMI</span>' : ''}</span><span>${Object.entries(x.need).map(([i, n]) => `${n} ${itemName(i)}`).join(' + ')} · ${place}</span></div>`).join('');
    return head + `<h5>Tempa</h5>${r(RECIPES.forge, 'Bengkel')}<h5>Masak</h5>${r(RECIPES.cook, 'Kedai')}<div class="note">Resep Bumi berasal dari Kenangan Bumi-mu. Buat sekali, lalu daftarkan ke Rowan untuk royalti.</div>`; }
}
function itemDesc(id) { const it = ITEMS[id]; if (it.seed) return `Tumbuh dalam ${CROPS[it.seed].grow} detik (dipercepat untuk prototype).`; if (it.dmg) return `${WTYPES[it.wt].n}, ${it.dmg} damage dasar. ${WTYPES[it.wt].d}`; if (it.heal) return 'Makanan pemulih HP.';
  if (id === 'kapak') return 'Alat. Tebang pohon liar di luar kota untuk kayu (melatih Pertukangan).'; if (id === 'linggis') return 'Alat Pasar Gelap. +15% peluang membobol pintu.'; if (id === 'pupuk') return 'Memotong sisa waktu tumbuh semua tanaman di petakmu sebesar 40%.'; if (id === 'racun') return 'Barang Pasar Gelap. Senjata beracun +3 damage selama 90 detik. Menggeser ke Bayangan.'; if (it.k === 'bumi') return 'Penemuan dari dunia asalmu. Laku mahal di pasar.'; return `Harga pasar sekarang ±${fmt(sellPrice(id))} koin.`; }
function drawStatusCanvases() { const c = $('#st-por'); if (c) drawPortrait(c.getContext('2d'), G.look);
  const d = $('#st-comp'); if (d) drawPortrait(d.getContext('2d'), COMPANIONS[G.comp].look); }
const MARKET_TABS = { panen: ['gandum', 'wortel', 'tomat', 'stroberi', 'ikan', 'herba'], bijih: ['tembaga', 'besi', 'perak', 'batu', 'kayu', 'papan', 'inti'],
  jadi: ['pisau_tembaga', 'pedang_besi', 'pedang_perak', 'busur_latihan', 'busur_besi', 'tongkat_sihir', 'tongkat_perak', 'belati', 'belati_besi', 'beliung_besi', 'roti', 'sup_wortel', 'telur_dadar', 'mayones', 'pupuk', 'pompa', 'ramuan', 'sabun', 'teh_herba', 'ikan_bakar', 'baju_kain', 'zirah_kulit', 'zirah_besi', 'jubah_sihir', 'jubah_bayangan', 'jimat_perak', 'cincin_embun', 'kalung_taring'],
  bahan: ['telur', 'minyak', 'benih_gandum', 'benih_wortel', 'benih_tomat', 'benih_stroberi'] };
function marketHTML() {
  const ev = G.events.map(e => `<span class="chip ${EVENTS[e.id].good ? 'good' : ''}">${EVENTS[e.id].n}</span>`).join(' ');
  const rows = [...MARKET_TABS[Panel.tab], ...(Panel.tab === 'jadi' ? Object.keys(G.inv).filter(i => ITEMS[i] && ITEMS[i].q && cnt(i)) : []), ...(Panel.tab === 'bijih' ? ['kulit', 'taring', 'kain'] : [])].map(id => { const it = ITEMS[id], seed = !it.tgt, p = price(id), m = it.tgt ? mkC(id) : null, rum = CUR_CITY === 'lumiria' && G.news.find(n => n.status === 'beredar' && n.item === id);
    const old = m ? m.hist[Math.max(0, m.hist.length - 20)] : p, ch = m ? (p / old - 1) * 100 : 0, buyable = seed || it.k !== 'bumi', bp = seed ? p : buyPrice(id);
    return `<div class="row">${img(id)}<div class="nm"><b>${it.n}</b><small>Punya ${cnt(id)}${m ? ` · stok ${CITY[CUR_CITY].n} ${Math.round(m.stock)}` : ' · harga tetap'}${rum ? ` · <span style="color:var(--warn)">kabar ${rum.dir > 0 ? 'naik' : 'turun'} beredar</span>` : ''}</small></div>
      <canvas data-spark="${id}" width="64" height="20"></canvas><div class="pr">${fmt(p)}</div><div class="ch ${ch > .5 ? 'up' : ch < -.5 ? 'down' : 'muted'}">${seed ? '' : (ch > 0 ? '▲' : ch < 0 ? '▼' : '') + Math.abs(ch).toFixed(1) + '%'}</div>
      <div class="act">${!seed ? `<button class="btn sm" data-do="sell" data-arg="${id}" ${cnt(id) ? '' : 'disabled'}>Jual ${fmt(sellPrice(id))}</button><button class="btn sm ghost" data-do="sellall" data-arg="${id}" ${cnt(id) > 1 ? '' : 'disabled'}>Semua</button>` : ''}
      ${buyable ? `<button class="btn sm ghost" data-do="buy" data-arg="${id}" ${G.coin >= bp ? '' : 'disabled'}>Beli ${fmt(bp)}</button>` : ''}</div></div>`; }).join('');
  return `${ev ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${ev}</div>` : ''}<div class="rows">${rows}</div>
    <div class="note">Pajak transaksi ${(taxRate() * 100).toFixed(1)}% (turun dengan skill Berdagang)${alignSell() !== 1 ? ` · ${alignSell() > 1 ? 'bonus Cahaya +5%' : 'Serikat curiga −5%'}` : ''}. Pajak kota ${CITY[CUR_CITY].n} ×${CITY[CUR_CITY].tax}. Harga = harga dasar × (stok target kota ÷ stok kota)<sup>e</sup> × pengali event. Stok bergerak karena NPC, Pengembara AI, kabar, dan kamu.</div>`;
}
function flowHTML() {
  const acts = G.lastActs || [], li = o => Object.entries(o || {}).filter(([, v]) => v > .04).map(([id, v]) => `${itemName(id)} ${v.toFixed(1)}`).join(', ') || '—';
  const top = Object.entries(G.flows || {}).filter(([id]) => ITEMS[id] && ITEMS[id].tgt).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 10);
  return `<div class="note" style="margin-top:0">Setiap jam in-game, aktor di bawah memproduksi dan mengonsumsi barang. Selisihnya menggeser stok kota, lalu stok menggeser harga. Kamu dan 100 Pengembara AI ikut memutar roda yang sama.</div>
    <div class="rows">${acts.map(a => `<div class="rec" style="grid-template-columns:44px minmax(0,1fr)"><span class="badge ${a.k === 'AI' ? 'p' : 'off'}" style="text-align:center">${a.k}</span><div style="min-width:0"><b>${a.n}</b>
      <div class="ings">${a.traders !== undefined ? '<span>Menyeimbangkan harga antar pembeli dan penjual</span>' : `<span class="up">Hasilkan: ${li(a.make)}</span><span class="down">Pakai: ${li(a.use)}</span>`}</div></div></div>`).join('')}</div>
    <h5>Selisih bersih per jam</h5>${top.map(([id, v]) => `<div class="stat"><span>${itemName(id)}</span><span class="${v > 0 ? 'up' : 'down'}">${v > 0 ? '+' : ''}${v.toFixed(1)} → harga ${v > 0 ? 'cenderung turun' : 'cenderung naik'}</span></div>`).join('')}`;
}
function drawSparks() { for (const c of document.querySelectorAll('[data-spark]')) { const id = c.dataset.spark, m = ITEMS[id].tgt ? mkC(id) : null, x = c.getContext('2d'); x.clearRect(0, 0, 64, 20); if (!m) { x.fillStyle = '#86dcff44'; x.fillRect(0, 10, 64, 1); continue; }
  const hs = m.hist.concat([price(id)]), lo = Math.min(...hs), hi = Math.max(...hs), rg = Math.max(.001, hi - lo); x.strokeStyle = hs[hs.length - 1] >= hs[0] ? '#86e3a0' : '#ff8a8a'; x.lineWidth = 1.2; x.beginPath();
  hs.forEach((v, i) => { const px = i / (hs.length - 1) * 62 + 1, py = 18 - (v - lo) / rg * 16; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke();
  x.fillStyle = '#ffffff'; const ly = 18 - (hs[hs.length - 1] - lo) / rg * 16; x.fillRect(61, ly - 1, 2, 2); } }
const ARMORY = ['busur_latihan', 'tongkat_sihir', 'belati'];
function armoryHTML() { return `<div class="note" style="margin-top:0">Senjata latihan untuk mencoba jalur baru. Versi kuatnya ditempa di Bengkel. Kamu bisa ganti senjata kapan saja di Jendela Status › Build.</div>` +
  ARMORY.map(id => { const it = ITEMS[id], has = cnt(id) > 0; return `<div class="rec">${img(id)}<div><b>${it.n}</b> <span class="muted">${WTYPES[it.wt].n} · ${it.dmg} dmg</span><div class="note" style="margin:0">${WTYPES[it.wt].d} Melatih ${SKILLS[WTYPES[it.wt].sk]}.</div></div>
  <button class="btn sm gold" data-do="buyarm" data-arg="${id}" ${has || G.coin < it.base ? 'disabled' : ''}>${has ? 'Sudah punya' : 'Beli ' + it.base}</button></div>`; }).join('') +
  `<div class="note">Penyembuhan tidak butuh senjata khusus: pasang Lingkar Penyembuh di slot skill dan gunakan saat bertarung.</div>`; }
function gelapHTML() { const ids = Object.keys(G.inv).filter(id => ITEMS[id] && ITEMS[id].tgt && cnt(id) > 0);
  return `<div class="note" style="margin-top:0">Si Gagak membeli 20% di atas harga pasar, tanpa pajak, tanpa catatan Serikat. Setiap transaksi menggeser jalanmu ke Bayangan.</div>` +
  (ids.map(id => `<div class="rec">${img(id)}<div><b>${itemName(id)}</b> <span class="muted">punya ${cnt(id)}</span></div><button class="btn sm" data-do="sellgelap" data-arg="${id}">Jual ${fmt(Math.ceil(price(id) * 1.2))}</button></div>`).join('') || '<div class="note">Tidak ada barang yang bisa dijual.</div>') +
  `<h5>Dijual</h5><div class="rec">${img('linggis')}<div><b>Linggis Senyap</b> <span class="muted">${cnt('linggis') ? 'sudah punya' : '40 koin'}</span><div class="note" style="margin:0">+15% peluang membobol pintu. Bayangan +3.</div></div><button class="btn sm" data-do="buylinggis" ${cnt('linggis') || G.coin < 40 ? 'disabled' : ''}>Beli</button></div>`; }
function newsRow(n) {
  const au = newsAuthor(n), cr = credOf(n), left = Math.max(0, Math.ceil(n.due - G.clock)), now = price(n.item), ch = (now / n.p0 - 1) * 100;
  const badge = n.src === 'serikat' ? '<span class="badge off">SERIKAT DAGANG</span>' : n.src === 'player' ? '<span class="badge me">KABARMU</span>' : '<span class="badge p">PENGEMBARA</span>';
  const stamp = n.status === 'beredar' ? `<span class="stamp wait">BEREDAR · ${left} dtk</span>` : n.status === 'terbukti' ? '<span class="stamp ok">TERBUKTI</span>' : '<span class="stamp bad">PALSU</span>';
  return `<div class="news"><div style="min-width:0">${badge} <span class="meta">${esc(au)} · kredibilitas ${Math.round(cr * 100)}%</span>
    <div class="claim">${img(n.item)} Harga ${itemName(n.item)} akan ${n.dir > 0 ? 'NAIK' : 'TURUN'}</div>${n.text ? `<div class="meta" style="color:var(--ink)">“${esc(n.text)}”</div>` : ''}
    <div class="meta">Saat dipasang ${fmt(n.p0)} → sekarang ${fmt(now)} (<span class="${ch > 0 ? 'up' : 'down'}">${ch > 0 ? '+' : ''}${ch.toFixed(0)}%</span>) · ${Math.round(n.believe * 100)}% pengembara percaya${n.check ? ` · <b style="color:var(--warn)">${n.check}</b>` : ''}</div></div>
    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">${stamp}${n.status === 'beredar' && n.src !== 'player' && !n.check ? `<button class="btn sm ghost" data-do="check" data-arg="${n.id}" ${G.coin < 5 ? 'disabled' : ''}>Periksa · 5 koin</button>` : ''}</div></div>`;
}
function newsHTML() {
  if (Panel.tab === 'tulis') { const mine = G.news.find(n => n.src === 'player' && n.status === 'beredar');
    const opts = TRADEABLE().map(id => `<option value="${id}" ${Panel.nitem === id ? 'selected' : ''}>${itemName(id)} (${fmt(price(id))})</option>`).join('');
    return `<div class="card"><div class="stat" style="border:0"><span>Kredibilitasmu</span><span>${Math.round(G.cred * 100)}%</span></div><div class="note" style="margin:4px 0 0">Kabar dipercaya sebanding kredibilitasmu. Pengembara lain membeli atau menjual sesuai kabar, jadi harga bergerak sebelum kabar terbukti.</div></div>
      <h5>Tulis kabar baru</h5><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select id="n-item" class="inp" aria-label="Barang">${opts}</select>
      <button class="btn sm ${Panel.ndir > 0 ? 'gold' : 'ghost'}" data-do="ndir" data-arg="1">Akan NAIK</button><button class="btn sm ${Panel.ndir < 0 ? 'gold' : 'ghost'}" data-do="ndir" data-arg="-1">Akan TURUN</button>
      <button class="btn sm" data-do="post" ${mine || G.coin < 25 ? 'disabled' : ''}>Pasang kabar · 25 koin</button></div>
      <div class="note">${mine ? 'Kabarmu masih beredar. Tunggu sampai terbukti atau terbantah.' : 'Aturan: kabar terbukti hanya jika peristiwa dunia yang cocok benar-benar terjadi dalam 90 detik. Kabar palsu → kredibilitas −20, denda guild 20 koin, reputasi −1, Bayangan +8. Kabar terbukti → kredibilitas +8, reputasi +1, Cahaya +2.'}</div>`; }
  const off = [];
  if (G.waveAt && !G.wave) off.push(`Gelombang Monster diperkirakan tiba dalam ${Math.max(0, Math.ceil((G.waveAt - G.clock) / (24 * HOUR_S)))} hari. Pandai besi diminta menyiapkan senjata.`);
  if (G.wave && G.wave.active) off.push('Gelombang Monster sedang menyerang Gerbang Selatan!');
  for (const e of G.events) off.push(`Dikonfirmasi: ${EVENTS[e.id].n}.`);
  if (G.align <= -60) off.push(`DICARI: ${esc(G.name)}, diduga mencopet dan menyebar kabar palsu. Laporkan ke penjaga.`);
  if (!off.length) off.push('Tidak ada pengumuman resmi saat ini.');
  const live = G.news.filter(n => n.status === 'beredar'), done = G.news.filter(n => n.status !== 'beredar').slice(0, 6);
  return `<div class="card" style="margin-bottom:10px"><span class="badge">RESMI GUILD · SELALU BENAR</span><div style="margin-top:4px">${off.map(t => `<div>${t}</div>`).join('')}</div></div>
    <div class="note" style="margin:0 0 8px">Kabar di bawah ditulis pengembara dan Serikat Dagang. Tidak semuanya benar: ada yang sengaja menyebar kabar palsu untuk menggoreng harga. Lihat kredibilitas penulisnya, periksa dengan skill Berdagang, atau... beli bocoran di tempat yang gelap.</div>
    <h5>Kabar beredar</h5>${live.map(newsRow).join('') || '<div class="note">Belum ada kabar beredar.</div>'}<h5>Arsip</h5>${done.map(newsRow).join('') || '<div class="note">Belum ada.</div>'}`;
}
/*@@S_craft@@*/
/*@@S_pause@@*/
function doAction(a, arg) {
  if (a === 'sel') { Panel.sel = arg; SFX.ui(); return renderPanel(); }
  if (a === 'eat') { if (G.hp >= G.hpMax && !FOOD_BUFF[arg]) return toast('HP sudah penuh'); eatFood(arg); return renderPanel(); }
  if (['mz', 'mcenter', 'mall', 'mfog', 'mpin'].includes(a)) return mapAction(a, arg);
  if (a.startsWith('w3')) return web3Action(a, arg);
  if (['restore', 'export', 'copycode', 'import', 'kick', 'raid', 'lock', 'equip', 'unequip', 'rankpanel', 'backuppanel'].includes(a)) return metaAction(a, arg);
  if (a === 'equipw') { G.weapon = arg || null; SFX.ui(); toast(`Dipakai: ${G.weapon ? itemName(G.weapon) : 'Tongkat Kayu'}`, `${WTYPES[wtype()].n} · melatih ${SKILLS[WTYPES[wtype()].sk]}`); return renderPanel(); }
  if (a === 'slot') { const [id, s] = arg.split(':'); const o = 1 - +s; if (G.loadout[o] === id) G.loadout[o] = G.loadout[+s]; G.loadout[+s] = id; SFX.ui(); return renderPanel(); }
  if (a === 'seed') { G.seedSel = arg; SFX.ui(); toast('Benih dipilih', itemName(arg)); return renderPanel(); }
  if (a === 'oil') { take('racun'); G.poison = 90; addAlign(-2); SFX.sizzle(); toast('Senjata beracun', '+3 damage selama 90 detik'); return renderPanel(); }
  if (a === 'pupuk') { if (!G.plotOwned) return toast('Belum punya petak', 'Minta izin ke Rowan dulu'); take('pupuk'); let n = 0;
    for (const k in G.plot) { const p = G.plot[k]; if (!p.crop) continue; const g = CROPS[p.crop].grow, left = Math.max(0, g - (G.clock - p.t)); p.t -= left * .4; n++; }
    toast('Pupuk ditabur', `${n} tanaman tumbuh lebih cepat`, 'good'); SFX.plant(); return renderPanel(); }
  if (a === 'sell' || a === 'sellall') { const n = a === 'sellall' ? cnt(arg) : 1; let got = 0; for (let i = 0; i < n; i++) { const p = sellPrice(arg); take(arg); got += p; mkC(arg).stock += 1; if (arg === 'perak' && CUR_CITY === 'corvel') missionProgress('karavan'); train('berdagang', 8 + ITEMS[arg].base / 10); }
    G.coin += got; saleRep(got); SFX.coin(); FX.pop(G.x, G.y - 24, `+${got} koin`, '#f4c869');
    if (G.stage === 2) { setStage(3); startEvent('slime'); toast('Peristiwa Dunia', 'Slime menyerbu Gerbang Selatan! Harga pisau melonjak 70%.', 'event'); chat('Sistem', 'Peristiwa: Slime menyerbu Gerbang Selatan', 'sys'); Panel.tab = 'jadi'; }
    return renderPanel(); }
  if (a === 'buy') { const it = ITEMS[arg], p = it.tgt ? buyPrice(arg) : price(arg); if (G.coin < p) return; G.coin -= p; give(arg, 1, true); if (it.tgt) mkC(arg).stock = Math.max(1, mkC(arg).stock - 1); if (it.seed && !G.seedSel) G.seedSel = arg; SFX.coin(); return renderPanel(); }
  if (a === 'buy5') { for (let i = 0; i < 5; i++) doAction('buy', arg); return; }
  if (a === 'buykapak') { if (G.coin < 25) return; G.coin -= 25; give('kapak', 1, true); SFX.coin(); toast('Kapak dibeli', 'Hadap pohon liar di luar kota lalu tekan E'); return renderPanel(); }
  if (a === 'buylinggis') { if (G.coin < 40) return; G.coin -= 40; give('linggis', 1, true); addAlign(-3); SFX.coin(); return renderPanel(); }
  if (['build', 'tab', 'demolish', 'decl', 'release', 'lotto', 'bid', 'buyplot', 'put', 'takeout', 'gembok', 'till', 'sput', 'smult', 'sback'].includes(a)) return landAction(a, arg);
  if (a === 'buyarm') { const it = ITEMS[arg]; if (G.coin < it.base || cnt(arg)) return; G.coin -= it.base; G.inv[arg] = 1; G.weapon = arg; SFX.coin(); toast(`Dipakai: ${it.n}`, `Jalur ${WTYPES[it.wt].n} terbuka · ubah di Build`, 'good'); return renderPanel(); }
  if (a === 'sellgelap') { const p = Math.ceil(price(arg) * (1.2 + facRank('gelap') * .05)); take(arg); G.coin += p; G.market[arg].stock += 1; addAlign(-2); train('bayangan', 6); addRep('gelap', rand() < .34 ? 1 : 0); SFX.coin(); FX.pop(G.x, G.y - 24, `+${p} koin`, '#c8a0ff'); return renderPanel(); }
  if (a === 'craft') { const [k, out] = arg.split(':'), r = RECIPES[k].find(x => x.out === out); if (!Object.entries(r.need).every(([i, n]) => cnt(i) >= n)) return;
    for (const [i, n] of Object.entries(r.need)) take(i, n); const qv = k !== 'cook' && isGear(ITEMS[out]) ? qualityRoll(k === 'forge' ? 'pandai' : 'pertukangan') : 0, oid = out + QUAL[qv].s; give(oid, 1, true); G.crafted[out] = (G.crafted[out] || 0) + 1; addScore('craft', 1); if (k === 'cook') missionProgress('festival');
    if (qv) toast(`Kualitas ${qv === 2 ? 'Luar Biasa' : 'Bagus'}!`, `${itemName(oid)} · ${gearDesc(ITEMS[oid])}`, 'good');
    train({ forge: 'pandai', cook: 'memasak', bench: 'pertukangan' }[k], r.diff);
    if (k !== 'cook') { SFX.clang(); FX.shake(.12); FX.burst(G.x, G.y - 26, 22, '#ffcf6a', 90, .5, 260, { add: true }); } else { SFX.sizzle(); FX.burst(G.x, G.y - 30, 10, '#ffffff', 25, 1, -40); }
    if (!qv) toast(`${{ forge: 'Ditempa', cook: 'Dimasak', bench: 'Dibuat' }[k]}: ${itemName(out)}`, r.bumi && !G.discovered ? 'Resep Bumi! Daftarkan ke Rowan untuk royalti.' : '', r.bumi ? 'good' : '');
    if (out === 'pisau_tembaga' && G.stage === 1 && !G.q.forged) { G.q.forged = true; SFX.quest(); toast('Tiga Hidup: Pandai besi ✓', 'Pisau pertamamu!', 'good'); }
    return renderPanel(); }
  if (a === 'order') { const o = G.orders[+arg]; if (!o || cnt(o.id) < o.qty) return; const rw = Math.ceil(o.reward * orderMul()); take(o.id, o.qty); G.coin += rw; G.rep += 1; addAlign(3); SFX.quest(); toast('Pesanan selesai', `+${fmt(rw)} koin · +1 reputasi`, 'good');
    G.orders.splice(+arg, 1); rollOrders(); return renderPanel(); }
  if (a === 'ndir') { Panel.ndir = +arg; SFX.ui(); return renderPanel(); }
  if (a === 'post') { const sel = $('#n-item'); const item = (sel && sel.value) || Panel.nitem; if (G.coin < 25 || G.news.some(n => n.src === 'player' && n.status === 'beredar')) return;
    G.coin -= 25; const n = postRumor('player', item, Panel.ndir || 1, null, 90, null, ''); SFX.quest(); toast('Kabar dipasang', `${Math.round(n.believe * 100)}% pengembara percaya`, 'good');
    for (let k = 0; k < 2; k++) { const b = pick(BOTS); botSay(b, rand() < n.believe ? pick([`wah ${itemName(item)} mau ${n.dir > 0 ? 'naik' : 'turun'}, gas ${n.dir > 0 ? 'borong' : 'jual'}`, `kabar dari ${G.name} nih`]) : pick([`${G.name} siapa? belum tentu valid`, 'hmm skip dulu']), true); }
    Panel.tab = 'kabar'; return renderPanel(); }
  if (a === 'check') { const n = G.news.find(x => x.id === +arg); if (!n || G.coin < 5 || n.check) return; G.coin -= 5; const acc = Math.min(.95, .55 + G.sk.berdagang * .012), real = !!n.truth, says = rand() < acc ? real : !real;
    n.check = `Analisismu (${Math.round(acc * 100)}% akurat): ${says ? 'kemungkinan benar' : 'mencurigakan'}`; train('berdagang', 14); SFX.ui(); return renderPanel(); }
  if (a === 'lang') { I18N.set(arg); return renderPanel(); }
  if (a === 'resume') return closePanel();
  if (a === 'save') { save(true); return; }
  if (a === 'mute') { Snd.toggle(); return renderPanel(); }
  if (a === 'reduce') { FX.reduce = !FX.reduce; store.set('reduce', FX.reduce); return renderPanel(); }
  if (a === 'title') { save(); closePanel(); Game.go(Scenes.title); }
}
/*@@S_esc@@*/
