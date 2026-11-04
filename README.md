# Lumiria — prototype MMORPG pixel isekai

Prototype offline satu file (`index.html`), jalan langsung di browser PC & mobile. Bahasa Indonesia / English.

**Main:** buka `index.html`, atau deploy folder ini ke Vercel sebagai situs statis (tanpa build).

## Isi prototype
- Core RPG tanpa level & EXP: atribut dari perlengkapan, mastery skill (Pemula → Grandmaster), kunci skill, kualitas tempa
- 4 kota + distrik kavling + hutan + dungeon instans, layar loading per daerah, peta besar dengan zoom & kabut jelajah
- 100 pengembara AI dengan skill, perlengkapan, jadwal harian, party, raid, dan hubungan
- Ekonomi per kota (arbitrase), papan berita dengan kabar palsu, tanah Harberger + lotre + lelang, toko pemain
- Event dunia + misi, reputasi 5 faksi, peringkat mingguan
- Lab Web3 (simulasi offline): dompet, notaris aset, royalti pembuat, lencana soulbound, kas Guild & voting

## Struktur
- `index.html` — hasil build, inilah yang dideploy
- `src/assemble.py` — merakit `index.html` dari `src/index.v1.html` + `src/parts/*.js` + `src/i18n_dict.json`
- `tests/` — playtest headless Playwright (`python tests/test_v5.py`)

Build ulang: `cd src && python assemble.py && cp index.html ..` (skrip menulis `index.html` di folder `src`).
