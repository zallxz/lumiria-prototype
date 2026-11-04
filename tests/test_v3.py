"""Playtest v3: regions, land/Harberger/lottery/auction, building, access & theft, city markets, travel, dungeon, companions."""
import pathlib, sys, json
from playwright.sync_api import sync_playwright
HTML = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').resolve().as_uri() + '?test=1'
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'shots3'); OUT.mkdir(parents=True, exist_ok=True)
fails = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu']); page = b.new_page(viewport={'width': 1280, 'height': 720})
    page.on('pageerror', lambda e: fails.append(f'pageerror: {e}'))
    page.goto(HTML); page.wait_for_function('window.__READY === true', timeout=20000)
    E = page.evaluate; st = lambda: E('__GAME.state()'); pl = lambda: st()['player']
    def run(n): return E(f'__GAME.step({n})')
    def shot(name): page.wait_for_timeout(200); page.screenshot(path=str(OUT / f'{name}.png'))
    def tap(a, n=8): E(f"__GAME.tap('{a}')"); return run(n)
    def adv(limit=40):
        for _ in range(limit):
            s = pl()
            if not s or not s['dialog']: return s
            tap('act', 4); tap('act', 30)
        return pl()
    def check(c, m):
        print(('ok  ' if c else 'FAIL'), m)
        if not c: fails.append(m)
    E("__GAME.go('play')"); run(10); adv(); E('__GAME.close()'); run(5); adv(); E('__GAME.exit()'); run(5)
    E('__GAME.setClock(20*20)'); run(2)  # 11:00 hari 1? START_H 15 -> clock 400 = 35h -> 11:00 day2
    ms = E('__GAME.rebuild()'); print('   rebuild ms', round(ms)); check(ms < 1500, 'rebuild under 1.5 s')
    for name, (x, y) in {'r_east_road': (66, 32), 'r_karst': (97, 13), 'r_karst_mine': (82, 12), 'r_corvel': (125, 33), 'r_distrik': (90, 42), 'r_mire': (105, 72), 'r_ruins': (133, 92)}.items():
        E(f'__GAME.tp({x}, {y})'); run(20); print('   zone', name, E('__GAME.zone()')); shot(name)
    check(E('__GAME.zone()') == 'Reruntuhan Tirai', 'ruins zone named')
    # dungeon
    E('__GAME.dun()'); run(30); check('Instans' in E('__GAME.zone()'), 'entered dungeon instance'); shot('r_dungeon')
    n = E("__ENEMIES().filter(e => e.sp.dungeon && !e.dead).length"); check(n >= 15, f'dungeon spawned {n} monsters')
    E("__ENEMIES().filter(e => e.sp.dungeon).forEach(e => { e.pHit = true; })"); E("__ENEMIES().filter(e => e.sp.dungeon && e.t==='golem').forEach(e => e.hp = 1)")
    gx = E("(()=>{const e=__ENEMIES().find(e=>e.t==='golem');return [e.x/16,e.y/16]})()"); E(f'__GAME.tp({gx[0]}, {gx[1]+1.2})'); shot('r_golem')
    for _ in range(30): tap('attack', 6)
    check(E("__ENEMIES().filter(e=>e.t==='golem'&&!e.dead).length") == 0, 'golem defeated')
    c0 = pl()['coin']; E("(()=>{const o=__GAME.G(); })()")
    ch = E("(()=>{const r=DUN.rooms[DUN.rooms.length-1];return [r.cx, r.cy]})()"); E(f'__GAME.tp({ch[0]+0.5}, {ch[1]+0.4})'); E('__GAME.face(1)'); run(3); print('   interact:', E('__GAME.interact()')); tap('act', 5)
    check(pl()['coin'] > c0 + 100, 'dungeon chest loot'); E('__GAME.dunExit()'); run(5)
    # city markets / arbitrage
    pk = E("__GAME.priceIn('besi','karst')"); pl_ = E("__GAME.priceIn('besi','lumiria')"); pc = E("__GAME.priceIn('perak','corvel')"); plp = E("__GAME.priceIn('perak','lumiria')")
    print(f'   besi karst {pk:.1f} lumiria {pl_:.1f} · perak corvel {pc:.1f} lumiria {plp:.1f}'); check(pk < pl_ * .8 and pc > plp * 1.2, 'arbitrage gaps exist')
    E("__GAME.market('karst')"); run(2); check('PASAR KARST' in E("document.querySelector('#p-title').textContent"), 'Karst market panel'); 
    E("__GAME.give('besi', 0)"); E("__GAME.act('tab','x')") if False else None
    E("Panel.tab='banding'; renderPanel()"); run(2); shot('m_compare'); E('__GAME.close()')
    # travel
    E('__GAME.tp(61, 32.5)'); E("__GAME.give('besi', 10)"); E("__GAME.travel('lumiria','corvel', true)"); run(5)
    check(abs(pl()['x']/16 - 115) < 4 and pl()['inv'].get('besi') == 10, 'insured cart to Corvel keeps cargo')
    # land: lottery
    E("__GAME.G().coin = 2000"); E("__GAME.tp(80.5, 43.6)"); E('__GAME.face(0)'); run(3); print('   interact:', E('__GAME.interact()'))
    tap('act', 5); check(pl()['panel'] == 'plot', 'plot sign opens panel'); shot('l_plot_lotto'); E("__GAME.act('lotto')"); E('__GAME.close()')
    for _ in range(12):
        E('__GAME.daily()')
        if E("Object.values(__GAME.land()).some(s=>s.owner==='me')"): break
    mine = E("Object.entries(__GAME.land()).filter(([k,s])=>s.owner==='me').map(([k])=>k)"); print('   my plots', mine)
    check(len(mine) == 1, 'won a residential plot via lottery (pity)')
    # buy commercial (Harberger) C1 from AI
    E("__GAME.land().C1.protect = 0"); E("__GAME.act('build','x')") if False else None
    E("Panel.pid='C1'; Panel.kind='plot'; buyPlot('C1')"); run(2); check(E("__GAME.land().C1.owner") == 'me', 'Harberger forced purchase of C1')
    # build a shop on C1
    for it, n in (('kayu', 30), ('batu', 20), ('papan', 20), ('besi', 5)): E(f"__GAME.give('{it}', {n})")
    E('__GAME.tp(78.5, 40.6)'); E('__GAME.face(1)'); E("__GAME.build('C1','toko')"); run(3); bm = E('__GAME.bm()'); print('   bm', bm)
    E('__GAME.place()'); run(5); check(len(E("__GAME.land().C1.place")) == 1, 'placed a shop on C1'); shot('l_built_shop')
    rid = E("Object.keys(__GAME.rooms()).find(k=>k.startsWith('pl:C1'))"); check(rid is not None, 'shop room registered')
    E(f"__GAME.enter('{rid}')"); run(5); check(pl()['room'] == rid, 'entered own shop'); shot('l_shop_interior')
    E(f"openPanel('shop','{rid}')"); E("__GAME.give('roti', 10)"); E("__GAME.act('sput','roti:all')"); E("__GAME.act('smult','roti:1')"); E('__GAME.close()')
    E('__GAME.setClock(__GAME.G().clock)');
    for _ in range(8): E('__GAME.hourly()')
    till = E(f"shopOf('{rid}').till"); check(till > 0, f'AI customers bought from shop (till {till})'); E('__GAME.exit()'); run(3)
    # decor placement & ghost shot
    E('__GAME.tp(76.5, 40.6)'); E('__GAME.face(1)'); E("__GAME.build('C1','lampu')"); run(3); shot('l_ghost'); E('__GAME.place()'); run(3)
    check(len(E("__GAME.land().C1.place")) == 2, 'placed decor lamp')
    # declared value low -> AI buyout risk
    E("__GAME.land().C1.decl = 100; __GAME.land().C1.protect = 0"); bought = False
    for _ in range(20):
        E('__GAME.daily()')
        if E("__GAME.land().C1.owner") != 'me': bought = True; break
    check(bought, 'low declaration gets bought out (Harberger)')
    # inactive AI plot goes to auction
    E("__GAME.land().R5.last = -40; __GAME.land().R5.owner = typeof __GAME.land().R5.owner==='number' ? __GAME.land().R5.owner : 3; __GAME.land().R5.auction=null; __GAME.land().R5.idle=true"); E('__GAME.daily()')
    check(E("!!__GAME.land().R5.auction"), 'inactive plot → guild auction')
    # access rules: town house locked at night, break-in
    E('__GAME.setClock(20*20*0 + 8*20)'); run(2)  # 23:00
    E("__GAME.tryEnter('h1')"); run(2); check(pl()['room'] is None, 'town house locked at night')
    E("__GAME.G().sk.bayangan = 60"); E("Math.random=()=>0"); E("rand = () => 0.01"); E("__GAME.breakIn('h1')"); run(2)
    check(pl()['room'] == 'h1' and pl()['thief'], 'break-in success starts thief timer'); shot('a_breakin')
    run(60*23); check(pl()['room'] is None and not pl()['thief'], 'caught when timer runs out')
    E("rand = mulberry32(5)")
    # companion HP/energy
    E("__GAME.comp('garon')"); adv(); run(5); c = E('__GAME.comp2()'); check(c and c['hp'] >= 40, f'companion has HP {c}')
    E("compHurt(200)"); run(2); check(E('__GAME.comp2()')['down'] > 0, 'companion can faint')
    run(60*26); check(E('__GAME.comp2()')['down'] <= 0, 'companion recovers')
    E("__GAME.G().cEn = 100"); E('__GAME.tp(57, 47)'); run(120); print('   comp', E('__GAME.comp2()'))
    check(E('__GAME.state().errors').__len__() == 0, 'no runtime errors')
    # fuzz
    import random; random.seed(3); acts = ['up','down','left','right','act','attack','skill','skill2','build','map','pause']
    for i in range(400):
        a = random.choice(acts); E(f"__GAME.hold('{a}')"); run(random.randint(2, 10)); E(f"__GAME.hold('{a}', false)")
        if i % 40 == 0: E('__GAME.close()'); adv(3)
    check(not fails, 'fuzz clean')
    print('FAILS', fails)
