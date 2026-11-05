"""Tes regresi renderer HD (reskin Istana Gading).
1. Goblin dan bandit memutar animasi jalan (tiap musuh punya objek look sendiri).
2. Kalau aset dunia gagal dimuat, game tetap jalan dengan grafis pixel, bukan macet di loading."""
import pathlib, sys
from playwright.sync_api import sync_playwright

HTML = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').resolve().as_uri() + '?test=1'
fails = []
def check(cond, msg):
    print(('ok  ' if cond else 'FAIL'), msg)
    if not cond: fails.append(msg)

with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])

    pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(HTML); pg.wait_for_function('window.__READY === true', timeout=20000)
    frames = pg.evaluate("""(() => {
      const mk = t => ({ t, d: MON[t], x: 400, y: 400, dir: 3, moving: true, anim: 0, flash: 0, hp: 1, max: 1, st: 'chase' });
      const es = [mk('goblin'), mk('bandit'), mk('bandit')]; es[2].x = 700;
      const cols = es.map(() => new Set()), orig = HD.char.bind(HD); let cur = -1;
      HD.char = function (c) { const d = c.drawImage; let col = null; c.drawImage = function (img, sx) { if (col === null) col = Math.round(sx / HD.CELL); return d.apply(this, arguments); };
        try { return orig(...arguments); } finally { c.drawImage = d; if (col !== null) cols[cur].add(col); } };
      for (let i = 0; i < 60; i++) { Game.time += 1 / 60; es.forEach((e, k) => { e.x += 1; e.anim += 1 / 60; cur = k; drawEnemy(e); }); }
      HD.char = orig; return cols.map(s => s.size);
    })()""")
    check(all(n >= 4 for n in frames), f'goblin, bandit, bandit kedua memutar frame jalan {frames}')
    check(not errs, f'tanpa error halaman {errs[:2]}')
    pg.close()

    pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if '/assets/' in r.request.url else r.continue_())
    pg.goto(HTML)
    try: pg.wait_for_function('window.__READY === true', timeout=15000); ready = True
    except Exception: ready = False
    check(ready, 'tanpa folder assets/ game tetap selesai loading')
    if ready:
        pg.evaluate("__GAME.go('play')"); pg.evaluate('__GAME.step(10)'); pg.evaluate('__GAME.exit()'); pg.evaluate('__GAME.step(30)')
        check(pg.evaluate('HD.off === true && !HD.ready'), 'renderer kembali ke grafis pixel')
        check(not pg.evaluate('__GAME.state().errors') and not errs, f'tanpa error saat main {errs[:2]}')
    b.close()

print('FAILURES:', fails) if fails else print('ALL PASSED')
sys.exit(1 if fails else 0)
