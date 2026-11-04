"""Extract translatable Indonesian text segments from index.html (script string/template literals + HTML text)."""
import re, json, sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text()
i0 = src.index('<script>'); i1 = src.rindex('</script>')
html, js = src[:i0], src[i0 + 8:i1]
out = []
def add(s, origin):
    out.append((s, origin))
# --- JS literal scanner with nesting ---
def scan(code):
    i, n = 0, len(code)
    while i < n:
        c = code[i]
        if c == '/' and i + 1 < n and code[i+1] == '/':
            j = code.find('\n', i); i = n if j < 0 else j; continue
        if c == '/' and i + 1 < n and code[i+1] == '*':
            j = code.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in '\'"':
            j = i + 1; buf = []
            while j < n and code[j] != c:
                if code[j] == '\\': buf.append(code[j+1]); j += 2; continue
                buf.append(code[j]); j += 1
            add(''.join(buf), 'str'); i = j + 1; continue
        if c == '`':
            i = tmpl(code, i + 1); continue
        if c == '/' and prev_allows_regex(code, i):
            j = i + 1; cls = False
            while j < n:
                if code[j] == '\\': j += 2; continue
                if code[j] == '[': cls = True
                elif code[j] == ']': cls = False
                elif code[j] == '/' and not cls: break
                elif code[j] == '\n': break
                j += 1
            i = j + 1; continue
        i += 1
def prev_allows_regex(code, i):
    k = i - 1
    while k >= 0 and code[k] in ' \t\n': k -= 1
    return k < 0 or code[k] in '(,=:[!&|?{};+-*%<>~^'
def tmpl(code, i):
    n = len(code); buf = []
    while i < n:
        c = code[i]
        if c == '\\': buf.append(code[i+1]); i += 2; continue
        if c == '`': add(''.join(buf), 'tpl'); return i + 1
        if c == '$' and code[i+1] == '{':
            depth = 1; j = i + 2; start = j
            while j < n and depth:
                ch = code[j]
                if ch in '\'"':
                    q = ch; j += 1
                    while code[j] != q:
                        j += 2 if code[j] == '\\' else 1
                elif ch == '`':
                    # nested template: skip, scanned separately
                    k = j + 1; d2 = 0
                    while True:
                        if code[k] == '\\': k += 2; continue
                        if code[k] == '`' and d2 == 0: break
                        if code[k] == '$' and code[k+1] == '{': d2 += 1; k += 2; continue
                        if code[k] == '}' and d2: d2 -= 1
                        k += 1
                    j = k
                elif ch == '{': depth += 1
                elif ch == '}': depth -= 1
                j += 1
            scan(code[start:j-1]); buf.append('\x00'); i = j; continue
        buf.append(c); i += 1
    return i
scan(js)
# --- HTML text ---
for m in re.finditer(r'>([^<>]+)<', re.sub(r'<style>[\s\S]*?</style>', '', html)):
    add(m.group(1), 'html')
for m in re.finditer(r'(?:title|placeholder|aria-label)="([^"]+)"', html): add(m.group(1), 'attr')
# --- segment & filter ---
ID_WORDS = set('dan yang di ke dari untuk dengan tidak ini itu kamu aku ada akan bisa sudah belum harga koin hari jam pasar beli jual masuk kota rumah tanah pajak sewa kabar guild skill senjata musuh pemain pengembara barang batu kayu besi tembaga perak buka tutup terkunci milik peti kasur toko bangun bongkar lelang lotre tiket sedang kecil besar niaga hunian peluang denda reputasi cahaya bayangan jalan tengah kuil pendeta tas resep tempa masak panen tanam benih ladang petak izin hidup status jeda simpan keluar lanjut baru main nama asal pilih bicara sapa bangunkan tebang tambang serang aksi mana zona aman kuning merah gelombang monster peristiwa dunia mulai selesai berhasil gagal ketahuan rekan energi jurus pingsan istirahat'.split())
segs = {}
for s, o in out:
    for part in re.split(r'<[^>]*>', s) if o in ('tpl', 'str') else [s]:
        t = re.sub(r'\s+', ' ', part).strip()
        if not t or '\x00' == t: continue
        letters = re.sub(r'\x00', '', t)
        if not re.search(r'[A-Za-z]{2}', letters): continue
        words = re.findall(r'[a-zA-Z]+', letters.lower())
        if not words: continue
        if re.fullmatch(r'[a-z_0-9.:#\-]+', letters) and ' ' not in letters and not any(w in ID_WORDS for w in words): continue  # identifiers
        if re.search(r'[{};]|=>|\bconst\b|rgba?\(|#[0-9a-f]{3}|px\b|var\(--|function', letters): continue
        if letters.startswith(('Key', 'Arrow', 'Digit')): continue
        if len(words) == 1 and words[0] not in ID_WORDS and not letters[0].isupper(): continue
        segs.setdefault(t, o)
json.dump(segs, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
print(len(segs), 'segments')
