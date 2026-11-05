"""Cari penyebab crash renderer di tests/test_flow.py (reskin Istana Gading).

Menjalankan test_flow.py berkali-kali, tiap kali dengan satu fitur HD dimatikan lewat page.evaluate,
lalu mencatat apakah renderer crash, di sampel ke berapa, dan puncak memori proses Chrome.

    pip install playwright psutil
    python tests/crash_hunt.py                      # semua konfigurasi, 1x
    python tests/crash_hunt.py base portrait 3      # konfigurasi tertentu, ulang 3x
    FUZZ=600 python tests/crash_hunt.py base        # fuzz lebih panjang (default 240 = sama dengan test_flow)

Hasil ringkas tercetak di akhir dan disimpan ke crash_hunt.csv.
"""
import os, sys, re, time, pathlib, traceback

ROOT = pathlib.Path(__file__).resolve().parent.parent
try:
    import psutil
except ImportError:
    psutil = None

# Satu fitur dimatikan per konfigurasi. 'base' = tidak ada yang dimatikan.
CONFIGS = {
    'base': '',
    'portrait': "HD.portrait = () => false;",
    'char': "HD.char = () => false; HD.preview = () => false;",
    'enemy': "HD.enemy = () => false;",
    'stroke': "CanvasRenderingContext2D.prototype.strokeText = function () {};",
    'roundrect': "CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };",
    'statics': "HD.pushStatics = () => {};",
    'ground': "HD.ground = function () { ctx.fillStyle = '#8fa574'; ctx.fillRect(0, 0, VW, VH); };",
    'rooms': "for (const k in HD.img) if (k.startsWith('r_')) delete HD.img[k]; HD.img = new Proxy(HD.img, { get: (o, k) => String(k).startsWith('r_') ? undefined : o[k] });",
    'flushstep': "hdNull.drawImage = function () {};",
    'allhd': "HD.ready = false;",
}

def renderer_mib():
    if not psutil: return -1
    tot = 0
    for c in psutil.Process().children(recursive=True):
        try:
            if '--type=renderer' in ' '.join(c.cmdline()): tot += c.memory_info().rss
        except Exception: pass
    return round(tot / 2**20)

def run_one(name, js):
    src = (ROOT / 'tests' / 'test_flow.py').read_text(encoding='utf-8')
    src = src.replace("pathlib.Path(__file__).resolve().parent.parent", f"pathlib.Path({str(ROOT)!r})")
    src = src.replace("page.goto(HTML); page.wait_for_function('window.__READY === true', timeout=20000)",
                      "page.on('crash', lambda *_: CRASH.append(SAMPLES[0])); page.goto(HTML); page.wait_for_function('window.__READY === true', timeout=20000); page.evaluate(" + repr(js or 'void 0') + ")")
    src = src.replace("def run(n): return E(f'__GAME.step({n})')", "def run(n): r = E(f'__GAME.step({n})'); TICK(); return r")
    src = src.replace("for i in range(240):", "for i in range(int(os.environ.get('FUZZ', 240))):")
    src = src.replace("sys.exit(1 if fails else 0)", "RESULT.extend(fails)")
    CRASH, RESULT, SAMPLES, PEAK = [], [], [0], [0]
    def TICK():
        SAMPLES[0] += 1
        if SAMPLES[0] % 25 == 0: PEAK[0] = max(PEAK[0], renderer_mib())
    t0 = time.time(); err = ''
    old = sys.argv; sys.argv = [old[0], str(ROOT / 'shots_hunt' / name)]
    try:
        exec(compile(src, 'test_flow', 'exec'), {'__name__': '__main__', 'CRASH': CRASH, 'RESULT': RESULT, 'SAMPLES': SAMPLES, 'TICK': TICK, 'os': os})
    except Exception as e:
        err = (str(e).splitlines() or [''])[0][:120]
        if 'crash' in err.lower() and not CRASH: CRASH.append(SAMPLES[0])
    finally:
        sys.argv = old
    status = 'CRASH' if CRASH else ('FAIL' if (RESULT or err) else 'ok')
    return dict(config=name, status=status, at_step_call=CRASH[0] if CRASH else '', secs=round(time.time() - t0), peak_renderer_mib=PEAK[0], note=err or '; '.join(RESULT)[:120])

if __name__ == '__main__':
    args = sys.argv[1:]; reps = 1
    if args and args[-1].isdigit(): reps = int(args.pop())
    names = args or list(CONFIGS)
    bad = [n for n in names if n not in CONFIGS]
    if bad: sys.exit(f'konfigurasi tidak dikenal: {bad}. Pilihan: {list(CONFIGS)}')
    rows = []
    for r in range(reps):
        for n in names:
            print(f'\n=== {n} (ulang {r + 1}/{reps}) ===', flush=True)
            row = run_one(n, CONFIGS[n]); rows.append(row); print('>>>', row, flush=True)
    out = ROOT / 'crash_hunt.csv'
    with open(out, 'w', encoding='utf-8') as f:
        f.write('config,status,at_step_call,secs,peak_renderer_mib,note\n')
        for x in rows: f.write(','.join(str(x[k]).replace(',', ';') for k in ('config', 'status', 'at_step_call', 'secs', 'peak_renderer_mib', 'note')) + '\n')
    print('\nRINGKASAN')
    for n in names:
        rs = [x for x in rows if x['config'] == n]
        print(f"  {n:10s} crash {sum(x['status'] == 'CRASH' for x in rs)}/{len(rs)}  puncak renderer {max(x['peak_renderer_mib'] for x in rs)} MiB")
    print('Disimpan ke', out)
