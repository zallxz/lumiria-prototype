import pathlib
from playwright.sync_api import sync_playwright
HTML = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').as_uri() + '?test=1'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu']); errs=[]
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:'+m.text) if m.type in ('error','warning') and 'ERR_TUNNEL' not in m.text else None)
    pg.goto(HTML)
    try: pg.wait_for_function('window.__READY===true', timeout=8000)
    except Exception as e: print('not ready', e)
    print('errors', errs[:5])
    if not errs:
        pg.evaluate('__GAME.step(120)'); print(pg.evaluate('__GAME.state().errors'))
        pg.evaluate("__GAME.go('play')"); pg.wait_for_timeout(50); pg.evaluate('__GAME.step(60)'); print(pg.evaluate('JSON.stringify(__GAME.state().player)')[:300]); print('errors', errs[:5], pg.evaluate('__GAME.state().errors'))
