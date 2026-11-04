/* ------------------------------ QUESTS & NPC TALK ------------------------------ */
const QT = { rowan: { room: 'guild', x: 14.5, y: 3.4 }, sela: { room: 'kuil', x: 13.2, y: 3.3 }, anvil: { room: 'smith', x: 9, y: 4.6 }, bram: { x: 48.6, y: 20.4 }, field: { x: 61.5, y: 17.5 },
  mine: { x: 11, y: 9 }, gate: { x: 36, y: 42 }, plot: { x: 61.5, y: 26.5 }, king: { x: 8, y: 52 } };
function markerPos(worldOnly) { const qi = questInfo(); if (!qi.target) return null; const t = QT[qi.target], room = G.room || null, troom = t.room || null;
  if (!worldOnly && troom === room) return [t.x * T, t.y * T];
  if (!worldOnly && room) { const r = ROOMS[room]; return [r.doorX, (r.h - 1) * T + 6]; }
  if (troom) { const d = DOORS.find(q => q.room === troom); return [d.x, d.y]; } return [t.x * T, t.y * T]; }
function questInfo() {
  const q = G.q, s = G.stage;
  if (s === 0) return { items: [{ t: 'Keluar dari Kuil, lalu temui Ketua Guild Rowan di dalam Guild Petualang (barat alun-alun)' }], target: 'rowan' };
  if (s === 1) { const all = q.harvest >= 3 && q.forged && q.slimes >= 3;
    const items = [{ t: `Panen 3 tanaman di Ladang Guild (${Math.min(3, q.harvest)}/3)`, done: q.harvest >= 3 }, { t: 'Tempa Pisau Tembaga di Bengkel (bijih di tambang barat laut)', done: q.forged }, { t: `Kalahkan 3 Slime di luar gerbang (${Math.min(3, q.slimes)}/3)`, done: q.slimes >= 3 }];
    if (all) items.push({ t: 'Lapor ke Rowan di Guild' });
    const target = all ? 'rowan' : q.harvest < 3 ? 'field' : !q.forged ? (cnt('tembaga') >= 2 ? 'anvil' : 'mine') : 'gate'; return { items, target }; }
  if (s === 2) return { items: [{ t: 'Jual satu barang di Pasar (Bram, timur alun-alun)' }], target: 'bram' };
  if (s === 3) return { items: [{ t: 'Kuil memanggilmu: temui Pendeta Sela di dalam Kuil' }], target: 'sela' };
  if (s === 4) return { items: [{ t: 'Minta izin tanah ke Rowan di Guild' }], target: 'rowan' };
  if (s === 5) return { items: [{ t: 'Tanam benih di Petak Pengembara (tenggara)' }], target: 'plot' };
  const og = ORIGINS.find(o => o.id === G.origin);
  return { items: [{ t: 'Pilih jalurmu: beli senjata latihan di Guild, rakit skill di Jendela Status › Build' }, { t: `Ciptakan resep Bumi: ${itemName(og.rec)}`, done: G.discovered }, { t: 'Baca Papan Berita sebelum berdagang' }, { t: 'Taklukkan Raja Goblin (zona merah, barat daya)', done: G.kingKills > 0 }], target: null };
}
function setStage(n) { G.stage = n; SFX.quest(); save(); }
function talkRowan() {
  const s = G.stage, q = G.q, arm = { t: 'Gudang senjata latihan', f: () => openPanel('armory') };
  if (s === 0) return say([
    { who: 'rowan', t: 'Pengembara baru, ya? Aku Rowan, ketua Guild Petualang Lumiria.' },
    { who: 'rowan', t: 'Di sini tidak ada kelas yang mengikatmu. Pedang, busur, sihir, penyembuhan, atau jalan bayangan: pilih dan latih sendiri.' },
    { who: 'rowan', t: 'Tapi sebelum memilih, coba tiga hidup dulu. Panen tiga tanaman di ladang guild timur. Tempa pisau tembaga di bengkel; bijihnya di tambang barat laut. Lalu bereskan tiga slime di luar gerbang selatan.' },
    { who: 'rowan', t: 'Ini beliung tua. Kalau mau senjata lain, gudang senjata latihan guild terbuka untukmu.' }], () => { setStage(1); toast('Quest: Coba Tiga Hidup', 'Petani · Pandai besi · Petualang', 'good'); });
  if (s === 1) { if (q.harvest >= 3 && q.forged && q.slimes >= 3) return say([
      { who: 'rowan', t: 'Tiga hidup, tiga rasa. Petani, pandai besi, petualang... semuanya pekerjaan terhormat di sini.' },
      { who: 'rowan', t: 'Ini 40 koin. Sekarang coba jual sesuatu di pasar. Bram di timur alun-alun akan memberimu harga yang... jujur, katanya.' }], () => { G.coin += 40; G.rep += 1; SFX.coin(); setStage(2); });
    return say([{ who: 'rowan', t: 'Belum selesai? Ladang di timur, tambang di barat laut, slime di selatan. Butuh senjata lain?', choices: [arm, { t: 'Nanti saja', f: () => {} }] }]); }
  if (s === 2 || s === 3) return say([{ who: 'rowan', t: s === 2 ? 'Pasar ada di timur alun-alun. Bram tidak menggigit.' : 'Pendeta Sela mencarimu. Kuil ada di utara.' }]);
  if (s === 4) return say([
    { who: 'rowan', t: 'Kudengar kau sudah punya rekan. Waktunya punya tanah sendiri.' },
    { who: 'rowan', t: 'Tanah di Lumiria tidak dijual. Kavling pengembara ada di Distrik Pengembara, timur kota, diatur Kantor Tanah supaya tidak ada yang memborong.' },
    { who: 'rowan', t: 'Ini Surat Pengantar Guild: kau langsung terdaftar di lotre rumah dengan tiga tiket tambahan. Sambil menunggu, petak latihan dekat ladang guild boleh kau tanami. Ambil benih ini.' }], () => {
      give('benih_gandum', 5, true); give('benih_wortel', 3, true); give('benih_tomat', 2, true); G.seedSel = 'benih_gandum'; G.lotto = true; G.lottoPity = Math.max(G.lottoPity || 0, 3);
      toast('Surat Pengantar Guild', 'Terdaftar lotre rumah · 4 tiket · +10 benih', 'good'); setStage(5); });
  const og = ORIGINS.find(o => o.id === G.origin), choices = [{ t: 'Lihat Papan Pesanan', f: () => openPanel('board') }, arm];
  if (G.crafted[og.rec] && !G.discovered) choices.push({ t: `Daftarkan resep ${itemName(og.rec)}`, f: () => registerRecipe() });
  else choices.push({ t: 'Sampai jumpa', f: () => {} });
  const line = G.wave && G.wave.active ? 'Monster di gerbang! Semua yang bisa memegang senjata, ke selatan!' : G.align <= -40 ? 'Kudengar kabar tidak enak tentangmu. Pesanan guild tetap boleh, tapi upahnya kupotong.' : G.align >= 40 ? 'Pengembara yang dibicarakan semua orang! Ada perlu apa?' : 'Ada perlu apa, Pengembara?';
  say([{ who: 'rowan', t: line, choices }]);
}
function registerRecipe() { const og = ORIGINS.find(o => o.id === G.origin); G.discovered = true; G.rep += 2; SFX.quest(); addAlign(2);
  say([{ who: 'rowan', t: `${itemName(og.rec)}? Belum pernah ada yang mendaftarkannya. Mulai hari ini namamu tercatat di Arsip Guild sebagai penemunya.` },
    { who: 'rowan', t: 'Setiap kali pengrajin lain membuatnya, kau dapat royalti 1% dari biaya guild. Cek Jendela Status-mu.' }], () => toast('Resep Bumi terdaftar', `Royalti ${itemName(og.rec)} aktif`, 'good')); }
function talkBram() {
  if (!G.firstMarket) { G.firstMarket = true; return say([{ who: 'bram', t: 'Bram, saudagar. Harga di sini naik turun mengikuti pasokan, penduduk, karavan, dan kejadian di dunia.' },
    { who: 'bram', t: 'Tiap barang yang kau jual menambah stok kota, jadi harganya turun sedikit. Tab Arus Ekonomi menunjukkan siapa yang memproduksi dan siapa yang menghabiskan.' }], () => openPanel('market')); }
  if (G.align <= -40) return say([{ who: 'bram', t: 'Hmm. Serikat bilang aku harus hati-hati denganmu. Harga jualmu kupotong sedikit.' }], () => openPanel('market'));
  openMarket('lumiria');
}
function talkSela() {
  if (G.stage === 3) return say([{ who: 'sela', t: 'Dewi merasakan tekadmu. Saatnya Ritual Pemanggilan pertamamu.' },
    { who: 'sela', t: 'Jiwa-jiwa lain terjebak di Tirai. Panggil satu untuk menemanimu. Yang pertama ini gratis.' }], () => openRitual());
  if (G.align <= -30) return say([{ who: 'sela', t: 'Bayanganmu pekat, Pengembara. Dewi tidak memberi takdir, tapi Ia juga tidak buta. Aku tidak bisa menyembuhkanmu sampai kau menebusnya.' },
    { who: 'sela', t: 'Sumbangan di altar, membangunkan pengembara yang pingsan, atau pesanan guild akan menerangi jalanmu lagi.' }]);
  const heal = G.hp < G.hpMax; if (heal) { G.hp = G.hpMax; G.mp = mpMax(); FX.burst(G.x, G.y - 8, 16, '#bfe6ff', 40, .8, -30, { add: true }); }
  say([{ who: 'sela', t: heal ? 'Lukamu kusembuhkan dengan berkat Dewi. Hati-hati di luar gerbang.' : pick(['Dewi tidak memberi takdir, tapi Ia selalu mendengar.', 'Cahaya dan bayangan sama-sama jalan. Yang penting kau sadar ke mana melangkah.', 'Ritual berikutnya butuh Kristal Tirai. Itu cerita untuk lain hari.']) }]);
}
function actAltar() {
  say([{ who: null, n: 'Altar Dewi Lumiria', t: G.align <= -30 ? 'Altar terasa dingin di bawah tanganmu.' : 'Cahaya hangat jatuh dari jendela kaca patri.', choices: [
    { t: 'Berdoa (pulihkan & simpan)', f: () => actStatue() },
    { t: 'Sumbang 20 koin (+Cahaya)', f: () => { if (G.coin < 20) return toast('Koin tidak cukup'); G.coin -= 20; addAlign(5); addRep('kuil', 1); SFX.skill(); FX.burst(G.x, G.y - 20, 20, '#fff2b0', 40, 1, -40, { add: true }); toast('Terima kasih, Pengembara', 'Kuil menerima sumbanganmu', 'good'); } },
    { t: 'Pergi', f: () => {} }] }]);
}
function actStatue() { if (G.align > -30) { G.hp = G.hpMax; G.mp = mpMax(); } save(true); FX.burst(G.x, G.y - 30, 24, '#fff2b0', 50, 1, -40, { add: true }); SFX.skill();
  say([{ who: null, n: 'Dewi Lumiria', t: G.align > -30 ? 'Kamu berdoa sejenak. HP dan mana pulih, perjalananmu tersimpan.' : 'Doamu terasa hampa, tapi perjalananmu tetap tersimpan.' }]); }
function talkGagak() {
  const intro = !G.metGagak; G.metGagak = true;
  const choices = [
    { t: 'Jual barang (tanpa pajak, +20%)', f: () => openPanel('gelap') },
    { t: 'Bubuk Racun · 35 koin', f: () => { if (G.coin < 35) return toast('Koin tidak cukup'); G.coin -= 35; give('racun', 1); addAlign(-3); SFX.coin(); } },
    { t: 'Bocoran kabar · 30 koin', f: () => buyLeak() }];
  say([...(intro ? [{ who: 'gagak', t: 'Ssst. Pelan-pelan. Aku Gagak. Yang dijual di sini tidak tercatat di buku Serikat.' }] : []),
    { who: 'gagak', t: 'Mau apa malam ini? Ingat, Kuil tidak suka orang yang sering mampir ke sini.', choices }]);
}
function buyLeak() { if (G.coin < 30) return toast('Koin tidak cukup'); const live = G.news.filter(n => n.status === 'beredar' && n.src !== 'player'); if (!live.length) return toast('Tidak ada kabar beredar', 'Gagak mengangkat bahu');
  G.coin -= 30; addAlign(-4); train('bayangan', 14); for (const n of live) n.check = n.truth ? 'BOCORAN: benar' : 'BOCORAN: palsu'; SFX.coin();
  say([{ who: 'gagak', t: `Dari orang dalam Serikat: ${live.map(n => `${itemName(n.item)} ${n.truth ? 'benar' : 'palsu'}`).join(', ')}. Kau tidak dengar dari aku.` }]); }
function openingDialog() {
  say([{ who: 'sela', t: `Kau sudah bangun, ${G.name}. Selamat datang di Kuil Lumiria.` },
    { who: 'sela', t: 'Dewi memanggilmu tanpa takdir. Di sini kau bebas jadi petani, pandai besi, saudagar, pemanah, penyihir... bahkan pencuri. Cahaya atau bayangan, itu pilihanmu.' },
    { who: 'sela', t: 'Coba ucapkan "Status" dalam hati.' }], () => { openPanel('status', 'status', true); });
}
function afterFirstStatus() { if (G.seenStatus) return; G.seenStatus = true;
  say([{ who: 'sela', t: 'Itu Jendela Status-mu. Penduduk asli tidak bisa melihatnya. Hanya para Pengembara.' },
    { who: 'sela', t: 'Sekarang keluar lewat pintu selatan dan temui Ketua Guild Rowan. Gedung berpanji biru di barat alun-alun.' }], () => toast('Tujuan baru', 'Temui Rowan di Guild Petualang', 'good')); }
