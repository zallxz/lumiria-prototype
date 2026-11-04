/* ------------------------------ RUANGAN TAMBAHAN ------------------------------ */
const TPL = {
  warga: { floor: 'wood', wall: '#d8c4a0', g: ['############', '#K##x##x##K#', '#..........#', '#ZZ....cTc.#', '#ZZ........#', '#......H...#', '#.cTc......#', '#p........p#', '#####DD#####'],
    objs: id => [{ id: 'chest', x: 7.5, y: 5.4, get label() { return chestLabel(id); }, act: () => actChest(id) }, { id: 'bed', x: 2, y: 4.4, get label() { return bedLabel(id); }, act: () => actBed(id) }] },
  gudang: { floor: 'wood2', wall: '#b89a74', g: ['##########', '#K##xx##K#', '#........#', '#HH....HH#', '#........#', '#UU....BB#', '#........#', '####DD####'],
    objs: id => [{ id: 'chest', x: 2, y: 3.4, get label() { return chestLabel(id); }, act: () => actChest(id) }] },
  toko: { floor: 'wood2', wall: '#e8d6b0', g: ['##############', '#K#x##KK##x#K#', '#............#', '#..CCCCCC....#', '#............#', '#.KK.....p.KK#', '#............#', '#p..........p#', '######DD######'],
    objs: id => [{ id: 'counter', x: 6, y: 4.4, get label() { return counterLabel(id); }, act: () => actCounter(id) }] },
  bengkel: { floor: 'stone', wall: '#857565', g: ['############', '#WW#x#x#FF##', '#..........#', '#...AA.....#', '#..........#', '#.JJ....BB.#', '#..........#', '#####DD#####'],
    objs: id => [{ id: 'anvil', x: 5, y: 4.2, label: 'Tempa di landasan', act: () => openPanel('forge') }, { id: 'bench', x: 3, y: 6.2, label: 'Meja kerja: olah kayu', act: () => openPanel('bench') }] },
  dapur: { floor: 'wood2', wall: '#e6d2a8', g: ['############', '#K#x#SS#x#K#', '#..........#', '#..........#', '#.cTc..cTc.#', '#..........#', '#p........p#', '#####DD#####'],
    objs: id => [{ id: 'stove', x: 6, y: 2.3, label: 'Masak di kompor', act: () => openPanel('cook') }] },
  inn: { floor: 'wood', wall: '#d8c4a0', bed: '#a84a4a', g: ['################', '#K#x##b##b##x#K#', '#..............#', '#ZZ..ZZ..ZZ....#', '#ZZ..ZZ..ZZ....#', '#.........CCCC.#', '#..............#', '#.cTc..cTc.....#', '#p............p#', '#######DD#######'],
    objs: id => [{ id: 'inn', x: 12, y: 6.4, label: 'Menginap · 8 koin (pulih penuh, simpan)', act: () => actInn(id) }] },
  kantor: { floor: 'marble', wall: '#d8dce6', g: ['################', '#K#x##QQ##x#K#K#', '#..............#', '#....CCCCCC....#', '#..............#', '#.cTc......cTc.#', '#..............#', '#.KK........KK.#', '#p............p#', '#######DD#######'], objs: () => [] },
  tukang: { floor: 'wood', wall: '#c8a878', banner: '#b0763a', g: ['################', '#K#x##b##x#K#UU#', '#..............#', '#..JJ......CCC.#', '#..............#', '#UU..........B.#', '#..............#', '#.cTc......UU..#', '#p............p#', '#######DD#######'],
    objs: () => [{ id: 'bench', x: 4, y: 4.3, label: 'Meja kerja: olah kayu jadi papan', act: () => openPanel('bench') }] },
  herba: { floor: 'wood2', wall: '#a8b88a', g: ['##############', '#K#x#SS#x#K#p#', '#............#', '#............#', '#pp..cTc...pp#', '#............#', '#............#', '#p..........p#', '######DD######'],
    objs: () => [{ id: 'stove', x: 6, y: 2.3, label: 'Kuali ramuan (masak)', act: () => openPanel('cook') }] },
};
function mkRoom(id, tpl, o) { const t = TPL[tpl]; ROOMS[id] = { tpl, floor: t.floor, wall: t.wall, bed: t.bed, banner: t.banner, g: t.g.slice(), npcs: {}, objs: t.objs(id), ...o }; return ROOMS[id]; }
// bangunan kota yang kini bisa dimasuki
BUILD.find(b => b.id === 'h4').name = 'Toko Tukang Bagas'; Object.assign(BUILD.find(b => b.id === 'h4'), { sign: 'hammer', signCol: '#b0763a', wall: '#e2cfa8' });
BUILD.push({ id: 'kantor_tanah', x: 86, y: 45, w: 4, h: 4, wall: '#e6e0d0', roof: '#4a6a9a', name: 'Kantor Tanah Guild', sign: 'guild', signCol: '#3d6fb0' });
mkRoom('tukang', 'tukang', { n: 'Toko Tukang Bagas', b: 'h4', lock: 'open', npcs: { bagas: [13, 2.6, 30] } });
for (const [id, nm] of [['h1', 'Rumah Keluarga Hadi'], ['h2', 'Rumah Nenek Sumi'], ['h3', 'Rumah Juragan Darto'], ['h5', 'Rumah Pak Ujang'], ['karst_h1', 'Rumah Penambang Tua'], ['corvel_h1', 'Rumah Nelayan Bimo'], ['corvel_h2', 'Rumah Saudagar Lina'], ['corvel_h3', 'Rumah Juru Mudi'], ['mire_h1', 'Pondok Pemburu']])
  mkRoom(id, 'warga', { n: nm, b: id, lock: 'hours', owner: 'npc', ownerName: nm.replace(/^(Rumah|Pondok) /, '') });
mkRoom('karst_inn', 'inn', { n: 'Penginapan Karst', b: 'karst_inn', lock: 'open' });
mkRoom('corvel_inn', 'inn', { n: 'Penginapan Corvel', b: 'corvel_inn', lock: 'open' });
mkRoom('serikat', 'kantor', { n: 'Kantor Serikat Dagang Corvel', b: 'corvel_serikat', lock: 'open', banner: '#2f6f9f', npcs: { laut: [8, 2.6, 34] } });
mkRoom('kantor_tanah', 'kantor', { n: 'Kantor Tanah Guild', b: 'kantor_tanah', lock: 'open', npcs: { wira: [8, 2.6, 34] } });
mkRoom('herbalis', 'herba', { n: 'Rumah Herbalis', b: 'mire_herb', lock: 'open' });
Object.assign(NPC_LOOK, {
  bagas: { n: 'Bagas', sub: 'Toko Tukang', look: { skin: '#d9a57c', hair: '#3a2a1a', top: '#b0763a', bottom: '#4a3a2a', acc: 'apron', eye: '#2a2a2a' } },
  wira: { n: 'Wira', sub: 'Petugas Kantor Tanah', look: { skin: '#f0c8a8', hair: '#2b2b2b', top: '#3d6fb0', bottom: '#2b3466', acc: 'hat', acc2: '#2b3466', eye: '#2a2a4a' } },
  laut: { n: 'Laut', sub: 'Juru Tulis Serikat Dagang', look: { skin: '#c98e66', hair: '#1a1a22', top: '#2f6f9f', top2: '#e8e0cc', bottom: '#2b3466', eye: '#2a2a2a' } },
  doran: { n: 'Doran', sub: 'Pedagang Karst', look: { skin: '#e8b48f', hair: '#8a8a8a', top: '#6a5a4a', bottom: '#3b3330', acc: 'beard', eye: '#2a2a2a' } },
  nara: { n: 'Nara', sub: 'Pedagang Pelabuhan Corvel', look: { skin: '#d9a57c', hair: '#202020', style: 'long', top: '#2f8aa8', bottom: '#e8e0cc', acc: 'ribbon', eye: '#2a4a6a' } },
  herba: { n: 'Mbok Herba', sub: 'Herbalis Mirewood', look: { skin: '#e8b48f', hair: '#d8d8d0', style: 'long', top: '#5a7a4a', bottom: '#4a3a2a', acc: 'veil', eye: '#3a5a2a' } },
});
const ICONS_EXTRA = (icon, R) => {
  if (icon === 'hammer') { R(-1, 2, 3, 11, '#6b4428'); R(-6, 2, 12, 4, '#c9d2dc'); R(-6, 2, 12, 1, '#ffffff'); }
  if (icon === 'coin') { for (let i = -5; i <= 5; i++) { const h = Math.round(Math.sqrt(30 - i * i)); R(i, 8 - h, 1, h * 2, '#f2c46d'); } R(-1, 4, 2, 8, '#a87a2a'); }
  if (icon === 'bed') { R(-8, 7, 16, 5, '#a84a4a'); R(-8, 5, 5, 3, '#f4efe2'); R(-8, 12, 2, 3, '#4a2f1c'); R(6, 12, 2, 3, '#4a2f1c'); }
  if (icon === 'leaf') { for (let i = 0; i < 8; i++) R(-4 + i, 12 - i, 3, 2, '#7ac05a'); R(-5, 12, 2, 2, '#4a7a2a'); }
};
