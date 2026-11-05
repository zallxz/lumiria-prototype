# Lanjutin Reskin Istana Gading

Panduan buat pemilik repo. Isinya status terakhir, cara kerja, resource, dan daftar kerjaan yang tersisa.

## Status

Branch: `visual-istana-gading`. Belum di-merge ke `main`.

**Sudah jadi**
- Dunia lukisan: tanah per chunk, bangunan semua region, pohon, lampu, kios, air mancur, ore, tenda, pagar
- 19 interior, dilukis ulang dari denah asli jadi posisi perabot cocok dengan collision
- 8 tipe karakter dengan animasi jalan 4 arah, plus varian warna untuk lady, merchant, mage
- Monster: slime, wolf, bat, golem. Goblin dan bandit memakai atlas karakter
- Potret dialog dan UI gading-emas
- Bug `doctype` dan `meta charset` yang hilang sudah diperbaiki

**Belum jadi** (urut prioritas)
1. **Crash `tests/test_flow.py`, wajib beres sebelum merge.** Lihat bagian Masalah Terbuka.
2. Ikon item masih pixel 16px (`drawItem`, panel Tas, Resep, dll.).
3. Tanaman ladang (`drawCrop`), papan kavling (`drawPlots`), kandang kuda, gerbang selatan, dan portal dungeon masih pixel.
4. Layar ritual dan prolog masih memakai gambar lama.
5. 14 rekan belum punya art sendiri. Sekarang mereka dipetakan ke 8 tipe karakter lewat `HD.baseOf`.
6. Warna kreator karakter belum mengubah sprite secara presisi. Sekarang dipilih dari varian terdekat lewat hash, bukan warna persis.
7. `mapC` di peta dunia dan layar loading masih memakai versi pixel.
8. Efek serangan dan partikel (`FX`) masih kotak kecil.

## Cara Jalanin

```bash
python -m http.server 8765
```

Buka `http://localhost:8765/index.html`. Mode tes: tambahkan `?test=1`.

Deploy tetap statis. Pastikan folder `assets/` ikut terupload bersama `index.html`.

## Cara Build

`index.html` adalah hasil build, jangan diedit langsung. Edit `src/parts/*.js` atau `src/assemble.py`.

```bash
cd src
PYTHONUTF8=1 python assemble.py
mv index.html ..
```

`PYTHONUTF8=1` wajib di Windows. Tanpa itu teks bisa rusak.

## Peta Kode

| File | Isi |
|---|---|
| `src/parts/hd.js` | Renderer utama. Objek `HD`: daftar aset, chunk tanah, sprite statis, atlas karakter, monster, potret |
| `src/parts/render.js` | `renderWorld`, `renderRoom`, label, bubble, marker quest |
| `src/assemble.py` | Patch teks ke kode lama. Blok `HD PAINTED RENDERER`, `ISTANA GADING UI`, dan `HD: entitas` ada di akhir file |

Hal yang perlu dipahami di `HD`:
- Logika game tetap memakai koordinat 480×270 dan tile 16. Hanya skala kanvas yang berubah lewat `HD.S`.
- `prerender()` jalan dua kali. Pass pertama mengisi `mapC` untuk peta. Pass kedua (`HD.skip`) hanya menyisakan objek yang belum dilukis.
- `HD.mute()` menjalankan fungsi gambar lama tanpa menggambar, jadi solid, cahaya, dan objek interaksi tetap terdaftar.
- Tambah bangunan di `HD.BLD`, tipe tanah di `HD.LAYER`, `HD.SPAN`, dan `HD.PAINTED`, file gambar di `HD.FILES`.
- Pilih tipe karakter di `HD.baseOf`, varian warna di `HD.VARS`.

## Resource

**Art mentah dan model 3D:** Release [`art-source-istana-gading`](https://github.com/zallxz/lumiria-prototype/releases/tag/art-source-istana-gading), file `lumiria-art-source.zip`. Ekstrak di root repo jadi folder `_src/` (sudah di-ignore git).

```text
_src/art/    PNG mentah ChatGPT dan crop pose
_src/meshy/  GLB model, rig, animasi jalan dan lari
_src/rooms/  denah pixel tiap ruangan, dipakai sebagai referensi repaint
```

**Tools** ada di `tools/`:

| Tool | Fungsi |
|---|---|
| `bake.py` | Bangunan kota, properti, tekstur, 19 interior |
| `bake2.py` | Bangunan region, sheet properti, monster, tekstur tambahan, potret, varian warna |
| `crop.py` + `char.mjs` | Potong 4 pose, kirim ke Meshy, rig |
| `render.js` | Render GLB ke sprite sheet di sudut kamera game |

Install sekali:

```bash
pip install pillow numpy scipy
cd tools && npm install
```

**Akun yang dibutuhkan:** ChatGPT dengan image generation, dan Meshy Pro. API key Meshy pakai punya sendiri, simpan di `_src/.env` sebagai `MESHY_API_KEY=...`. Jangan di-commit.

**Biaya Meshy:** sekitar 35 credit per karakter, sudah termasuk rig.

## Resep Aset

Lampirkan dulu `_src/art/b_guild.png` sebagai acuan gaya di ChatGPT, lalu pakai template ini.

**Bangunan** (langsung PNG, tidak perlu Meshy)
```text
Generate one image only, same painted style, palette and slightly-from-above front camera as the Guild Hall. One standalone building asset: <DESKRIPSI>. Main door exactly at bottom center. Entire building visible. No ground, no plants at the base, no shadow, no text. Transparent background (real alpha PNG), no checkerboard.
```

**Tekstur tanah**
```text
Generate one image only. Top-down seamless tiling texture filling the entire square canvas, no transparency: <DESKRIPSI>, same hand-painted storybook style. Viewed straight down. No objects, no shadow, no vignette, even lighting, edges must tile seamlessly.
```

**Karakter** (hasilnya masuk Meshy)
```text
Generate one image only, same painted style and proportions as the first traveler character sheet. Game character sheet for a top-down 2D RPG: <DESKRIPSI>, soft stylized proportions. The SAME character in 4 poses in one horizontal row, evenly spaced, not overlapping: facing camera, facing away, facing left, facing right. Arms relaxed slightly away from the body, legs slightly apart, standing straight, no long cape. Full body, same size in every pose, no shadow, no text. Transparent background (real alpha PNG), no checkerboard.
```

**Interior** (lampirkan denah dari `_src/rooms/<id>.png`)
```text
Generate one image only. Repaint the attached pixel-art game room in exactly the same soft hand-painted storybook style and ivory, champagne gold and dusty rose palette as before. This is the top-down interior floor plan of <RUANGAN>. CRITICAL: keep the exact same layout and camera. Every wall, door gap, piece of furniture, window and object must stay in exactly the same position and the same proportional size, because the game collision depends on it. Outer border stays dark. Make it luxurious: <DETAIL>. No characters, no text, full canvas with the same aspect ratio as the input.
```

Selalu minta transparan untuk aset dan karakter, lalu cek file PNG-nya. Sheet properti kedua sempat punya latar semi-transparan, jadi `bake2.py` memotongnya dengan ambang alpha 150.

## Alur Karakter Baru

```bash
cd _src
node ../tools/char.mjs <nama>
cd ..
```

File `_src/art/c_<nama>.png` harus sudah ada. Lalu render dari root repo:

```bash
PITCH=32 Q="fix=1.05&w=0.6&h=1.55&d=1.5" node tools/render.js "$PWD/_src/meshy/<nama>_walking.glb" _src/art/s_<nama>_walk.png 8 128
```

```bash
PITCH=32 Q="fix=1.05&h=1.55&d=1.5" node tools/render.js "$PWD/_src/meshy/<nama>_rig.glb" _src/art/s_<nama>_idle.png 1 128
```

`w` mengatur lebar langkah. Pakai sekitar `0.6` untuk celana dan `0.32` untuk rok atau jubah panjang, supaya kain tidak robek.

Gabungkan jadi atlas `assets/chars/<nama>.webp` ukuran 1152×512: kolom pertama frame diam, 8 kolom berikutnya frame jalan, 4 baris arah (depan, belakang, kiri, kanan). Lalu daftarkan di `HD.CHARS` dan `HD.BASES`, dan tambahkan potret `p_<nama>.webp`.

## Masalah Terbuka

**`tests/test_flow.py` membuat renderer Chrome crash (`Target crashed`) di bagian fuzz, sekitar baris 112.**

Yang sudah diketahui:
- Versi `main` lolos, jadi ini regresi dari reskin.
- Crash terjadi saat loop `adv()` dengan dialog tetap terbuka, misalnya iterasi fuzz ke-142. Iterasinya bisa berubah.
- Sempat lolos sekali pada build sebelum perubahan memori chunk.
- Tidak ada exception JavaScript.
- Soak main sungguhan 170 detik di semua region bersih tanpa crash.

Yang sudah dicoba dan belum menyelesaikan:
- Memakai ulang kanvas mask, membebaskan chunk lama, menurunkan `MAXCH` ke 14
- Flush kanvas di `__GAME.step` (`hdNull.drawImage`). `getImageData` tidak bisa dipakai karena kanvas tainted di `file://`

Langkah berikutnya: pantau memori proses renderer selama tes, lalu matikan fitur satu per satu dari `page.evaluate` (`HD.portrait`, `HD.char`, `HD.enemy`, stroke teks di `ptext`, `roundRect` di label) sampai crash hilang.

## Catatan Tes

```bash
pip install playwright
python tests/test_v5.py
```

Tes memakai Chromium dari Playwright, jadi jalankan `playwright install chromium` sekali. `tests/en_sweep.py` butuh argumen folder output.

Hasil terakhir: `smoke`, `test_v3`, `test_v4`, `test_v5` lolos. `test_flow` crash. `en_sweep` belum dijalankan dengan argumen yang benar.

Performa terakhir: sekitar 54 fps di 1600×900.
