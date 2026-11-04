"""Playtest v5: region loading, world map (zoom/pan/fog/pins), off-region freeze, Web3 lab simulation."""
import pathlib, sys
from playwright.sync_api import sync_playwright
HTML = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').resolve().as_uri() + '?test=1'
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'shots5'); OUT.mkdir(parents=True, exist_ok=True)
fails = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu']); page = b.new_page(viewport={'width': 1280, 'height': 720})
    page.on('pageerror', lambda e: fails.append(f'pageerror: {e}'))
    page.goto(HTML); page.wait_for_function('window.__READY === true', timeout=20000)
    E = page.evaluate; pl = lambda: E('__GAME.state()')['player']
    def run(n): return E(f'__GAME.step({n})')
    def shot(name): page.wait_for_timeout(250); page.screenshot(path=str(OUT / f'{name}.png'))
    def adv(limit=40):
        for _ in range(limit):
            s = pl()
            if not s or not s['dialog']: return s
            E("__GAME.tap('act')"); run(4); E("__GAME.tap('act')"); run(30)
        return pl()
    def check(c, m):
        print(('ok  ' if c else 'FAIL'), m)
        if not c: fails.append(m)
    E("__GAME.go('play')"); run(10); adv(); E('__GAME.close()'); run(5); adv(); E('__GAME.exit()'); run(30)
    check(E('G.region') == 'lumiria', 'starts in Lumiria region')
    E('__GAME.tp(125, 33)'); run(40); check(E('G.region') == 'corvel' and E('!!G.seenRegion.corvel'), 'region change detected (Corvel)')
    E("LOAD.force = true; showLoading('mire', true); LOAD.force = false"); run(1); shot('loading_mire'); check(E("!$('#loadscr').hidden"), 'loading screen shows')
    E("LOAD.t = 99"); run(2); check(E("$('#loadscr').hidden"), 'loading screen closes')
    # freeze off-region monsters
    E('__GAME.tp(36, 20)'); run(60); pos = E("__ENEMIES().filter(e=>e.t==='bat' && e.sp.x>72 && !e.dead).map(e=>[e.x,e.y])"); run(120); pos2 = E("__ENEMIES().filter(e=>e.t==='bat' && e.sp.x>72 && !e.dead).map(e=>[e.x,e.y])")
    check(pos and pos == pos2, f'off-region monsters frozen ({len(pos)} bats)')
    # map
    for (x, y) in ((36, 30), (66, 32), (90, 42), (97, 13)): E(f'__GAME.tp({x}, {y})'); run(15)
    E('openMap()'); page.wait_for_timeout(300); run(1); shot('map_fit'); check(E("Panel.kind") == 'peta' and E('seenPct()') > 3, f'map open · explored {E("seenPct()")}%')
    E("mapAction('mall')"); shot('map_all'); E("mapAction('mz', 3); mapAction('mz', 3); mapAction('mcenter')"); shot('map_zoom'); check(E('MAPV.z / mapFit()') > 4, 'zoom in')
    E("G.pins = [{x: 120, y: 30}, {x: 100, y: 70}]; mapAction('mall')"); shot('map_pins'); E("mapAction('mfog')"); shot('map_nofog'); E('__GAME.close()')
    # web3 lab
    E("G.coin = 3000; __GAME.give('pedang_besi_lb', 1); __GAME.give('zirah_kulit_b', 1)"); E("openPanel('web3')"); run(2); shot('w3_ringkas')
    E("doAction('w3connect')"); check(E('!!G.w3.addr'), 'wallet (sim) connected')
    E("Panel.tab='notaris'; renderPanel()"); shot('w3_notaris'); n = E('mintable().length'); check(n >= 2, f'{n} mintable assets')
    E("doAction('w3mint', '0'); doAction('w3mint', '0')"); check(len(E('G.w3.assets')) == 2 and E("cnt('pedang_besi_lb')") == 0, 'minted 2 assets (item moved to vault)')
    uid = E("G.w3.assets[0].uid"); E(f"doAction('w3list', '{uid}:0.85')")
    for _ in range(80): E('w3Hourly()')
    check(E("G.w3.assets.some(a => a.owner !== 'me')"), 'collector AI bought a listed asset')
    for _ in range(400): E('w3Hourly()')
    print('   royalty', E('G.w3.roy')); check(E('G.w3.roy') > 0, 'creator royalty from AI resales')
    E("Panel.tab='pasar'; renderPanel()"); shot('w3_pasar'); E("Panel.tab='lencana'; renderPanel()"); shot('w3_lencana'); check(E('Object.keys(G.w3.badges).length') >= 1, 'soulbound badge earned')
    E("Panel.tab='dao'; renderPanel()"); E("doAction('w3vote', '0:1')"); shot('w3_dao'); E("G.guildKas = 999; G.w3.props.list.forEach(p => { p.yes = 99; p.no = 0 }); resolveProps()")
    check(E("Object.keys(G.civic || {}).length") >= 1, 'DAO proposal passes and funds a civic project')
    E("Panel.tab='dompet'; renderPanel()"); shot('w3_dompet'); E('__GAME.close()')
    E("I18N.set('en'); openPanel('web3')"); run(2); shot('w3_en'); E('__GAME.close(); openMap()'); page.wait_for_timeout(300); shot('map_en'); E("__GAME.close(); I18N.set('id')")
    import random; random.seed(5); acts = ['up','down','left','right','act','attack','skill','map','pause']
    for i in range(250):
        a = random.choice(acts); E(f"__GAME.hold('{a}')"); run(random.randint(2, 10)); E(f"__GAME.hold('{a}', false)")
        if i % 30 == 0: E('__GAME.close()'); adv(3)
    check(not [f for f in fails if f.startswith('pageerror')], 'no runtime errors')
    print('FAILS', fails)
