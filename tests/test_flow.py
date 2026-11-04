"""Headless playtest for Lumiria prototype v2: full tutorial (now with interiors), 100 AI, news board,
combat paths & skills, Light/Dark actions, economy, plus fuzz and a performance check."""
import pathlib, sys, time, random
from playwright.sync_api import sync_playwright

HTML = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').resolve().as_uri() + '?test=1'
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'shots'); OUT.mkdir(parents=True, exist_ok=True)
fails = []

with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    page = b.new_page(viewport={'width': 1280, 'height': 720})
    page.on('pageerror', lambda e: fails.append(f'pageerror: {e}'))
    page.goto(HTML); page.wait_for_function('window.__READY === true', timeout=20000)
    E = page.evaluate
    st = lambda: E('__GAME.state()')
    pl = lambda: st()['player']
    def run(n): return E(f'__GAME.step({n})')
    def shot(name): page.wait_for_timeout(260); page.screenshot(path=str(OUT / f'{name}.png'))
    def tap(a, n=8): E(f"__GAME.tap('{a}')"); return run(n)
    def adv(limit=40):
        for _ in range(limit):
            s = pl()
            if not s or not s['dialog']: return s
            tap('act', 4); tap('act', 30)
        return pl()
    def talk(): tap('act', 4);
    def check(cond, msg):
        print(('ok  ' if cond else 'FAIL'), msg)
        if not cond: fails.append(msg)

    run(40); shot('01_title')
    E("__GAME.go('play')"); page.wait_for_timeout(50); run(10)
    check(pl()['room'] == 'kuil' and pl()['dialog'], 'wake up inside the Kuil, Sela speaks')
    adv(); check(pl()['panel'] == 'status', 'first Status window'); shot('02_status_first')
    E("__GAME.close()"); run(5); adv(); run(5)
    shot('03_kuil_interior')
    # walk out through the door
    E('__GAME.tp(10, 12.3)'); E('__GAME.face(0)'); E("__GAME.hold('down')"); run(40); E("__GAME.hold('down', false)")
    check(pl()['room'] is None, 'walk out of the Kuil door')
    run(30); shot('04_town_day')
    # walk into the guild
    E('__GAME.tp(20, 21.9)'); E("__GAME.hold('up')"); run(30); E("__GAME.hold('up', false)")
    check(pl()['room'] == 'guild', 'walk into the Guild')
    E('__GAME.tp(14.5, 5.3)'); E('__GAME.face(1)'); run(3); print('   interact:', E('__GAME.interact()'))
    tap('act'); adv(); check(pl()['stage'] == 1, 'Rowan gives Coba Tiga Hidup'); shot('05_guild_interior')
    E('__GAME.exit()'); run(5)
    for x in (60.5, 61.5, 62.5):
        E(f'__GAME.tp({x}, 17.9)'); E('__GAME.face(0)'); run(3); tap('act', 10)
    check(pl()['q']['harvest'] >= 3, 'harvested 3 crops')
    for (ox, oy) in ((12, 10), (9, 11)):
        E(f'__GAME.tp({ox}+0.5, {oy}+1.1)'); E('__GAME.face(1)'); run(3)
        for _ in range(4): tap('act', 12)
    check(pl()['inv'].get('tembaga', 0) >= 2, 'mined 2 copper'); shot('06_mine_with_ai')
    E("__GAME.enter('smith')"); E('__GAME.tp(9, 6.0)'); E('__GAME.face(1)'); run(3); print('   interact:', E('__GAME.interact()')); tap('act', 6)
    check(pl()['panel'] == 'forge', 'forge panel inside the Bengkel'); shot('07_smith_interior')
    E("__GAME.act('craft','forge:pisau_tembaga')"); run(5); E('__GAME.close()'); run(3); E('__GAME.exit()'); run(3)
    check(pl()['q']['forged'], 'forged copper knife')
    for i in range(500):
        if pl()['q']['slimes'] >= 3: break
        tgt = E("(()=>{const g=__GAME.G();let b=null,bd=1e9;for(const e of ENEMIES) if(!e.dead&&e.t==='slime'){const d=Math.hypot(e.x-g.x,e.y-g.y);if(d<bd){bd=d;b=e}} return b?[b.x,b.y]:null})()")
        if not tgt: run(30); continue
        E(f'__GAME.tp({tgt[0]/16}, {(tgt[1]+10)/16})'); run(2); tap('attack', 24)
    check(pl()['q']['slimes'] >= 3, f"defeated 3 slimes alongside AI ({pl()['q']['slimes']})"); shot('08_gate_fight')
    E("__GAME.enter('guild')"); E('__GAME.tp(14.5, 5.3)'); E('__GAME.face(1)'); run(3); tap('act'); adv(); check(pl()['stage'] == 2, 'reported to Rowan'); E('__GAME.exit()')
    E('__GAME.tp(48.6, 21.8)'); E('__GAME.face(1)'); run(3); tap('act'); adv(); check(pl()['panel'] == 'market', 'market opens')
    E("__GAME.act('sell','gandum')"); run(5); check(pl()['stage'] == 3, 'first sale → world event'); shot('09_market')
    E("Panel.tab='arus'; renderPanel()"); shot('10_market_flows'); E('__GAME.close()'); run(30)
    E("__GAME.enter('kuil')"); E('__GAME.tp(13.2, 4.8)'); E('__GAME.face(1)'); run(3); tap('act'); adv(); run(150)
    check(pl()['ritual'], 'ritual opens'); E("__GAME.comp('aira')"); run(5); adv(); check(pl()['stage'] == 4, 'companion chosen'); E('__GAME.exit()')
    E("__GAME.enter('guild')"); E('__GAME.tp(14.5, 5.3)'); E('__GAME.face(1)'); run(3); tap('act'); adv(); check(pl()['stage'] == 5, 'land permit'); E('__GAME.exit()')
    E('__GAME.tp(60.5, 25.6)'); E('__GAME.face(0)'); run(3); tap('act', 10); page.wait_for_timeout(50); run(5); adv(); run(5)
    check(pl()['stage'] == 6, 'planted → omen, tutorial done')
    # combat paths
    E("__GAME.G().coin = 400"); E("__GAME.act('buyarm','busur_latihan')"); E("__GAME.act('buyarm','tongkat_sihir')"); E("__GAME.act('buyarm','belati')")
    check(all(pl()['inv'].get(k) for k in ('busur_latihan', 'tongkat_sihir', 'belati')), 'bought bow, staff, dagger')
    E("__GAME.act('equipw','busur_latihan')"); E('__GAME.tp(56, 46)'); run(20)
    for _ in range(25): tap('attack', 20)
    check(pl()['sk']['busur'] > 0, f"bow trains Busur ({pl()['sk']['busur']})"); shot('11_bow_combat')
    E("__GAME.G().sk.sihir = 12; __GAME.G().sk.busur = 12; __GAME.G().loadout = ['bola_api','panah_api']; __GAME.G().mp = 40")
    E("__GAME.act('equipw','tongkat_sihir')"); run(5); E('__GAME.skill(0)'); run(10); E('__GAME.skill(1)'); run(6); shot('12_fire_skills')
    E("__GAME.G().mp = 40"); E("openPanel('status','build')"); run(2); shot('13_build_tab'); E('__GAME.close()')
    # light & dark
    a0 = E('__GAME.align()')
    E("stealBot(BOTS[3])"); run(5); a1 = E('__GAME.align()'); check(a1 < a0, f'stealing moves toward Bayangan ({a0}→{a1})')
    E("BOTS[5].down = 15; BOTS[5].room=null"); E("reviveBot(BOTS[5])"); a2 = E('__GAME.align()'); check(a2 > a1, f'reviving an AI moves toward Cahaya ({a1}→{a2})')
    # news board: post a false rumor
    E("__GAME.tp(33.5, 18.9)"); E('__GAME.face(1)'); run(3); print('   interact:', E('__GAME.interact()')); tap('act', 4)
    check(pl()['panel'] == 'news', 'news board opens'); shot('14_news_board')
    c0 = E('__GAME.G().cred'); E("Panel.nitem='stroberi'; Panel.ndir=1; __GAME.act('post')"); p0 = E("price('stroberi')"); E('__GAME.close()')
    run(60 * 40); p1 = E("price('stroberi')"); check(p1 > p0 * 1.03, f'believers push price up before verdict ({p0:.1f}→{p1:.1f})')
    run(60 * 55); c1 = E('__GAME.G().cred'); check(c1 < c0, f'false rumor drops credibility ({c0:.2f}→{c1:.2f})')
    # Gagak at night
    E("__GAME.setClock(20*6.5)"); E('__GAME.tp(23.5, 30.9)'); E('__GAME.face(1)'); run(5); print('   interact:', E('__GAME.interact()'))
    check('Gagak' in (E('__GAME.interact()') or ''), 'Si Gagak appears at night'); shot('15_night_alley')
    E('__GAME.tp(36.5, 24.5)'); run(40); shot('16_town_night_crowd')
    E("__GAME.setClock(20*1)"); E('__GAME.tp(20, 23)'); run(40); shot('17_facades_day')
    # economy sanity: prices stay within band after 20 in-game hours
    E('__GAME.tp(36.5, 24.5)'); run(60 * 20 * 20)
    bad = E("TRADEABLE().filter(id => { const r = price(id) / ITEMS[id].base; return r < .4 || r > 3.2 })")
    check(len(bad) <= 2, f'economy stable after 20 in-game hours (outliers: {bad})')
    # perf
    t0 = time.time(); run(600); dt = (time.time() - t0) / 600 * 1000
    check(dt < 6, f'~{dt:.2f} ms per tick (update + render) with 100 AI')
    # fuzz
    r = random.Random(7)
    for i in range(240):
        for a in ['left', 'right', 'up', 'down']: E(f"__GAME.hold('{a}', {str(r.random() < .3).lower()})")
        for a, pr in (('attack', .3), ('act', .15), ('skill', .05), ('skill2', .05)):
            if r.random() < pr: E(f"__GAME.tap('{a}')")
        run(10); s = pl()
        if s['dialog']: adv()
        if s['panel']: E('__GAME.close()')
        if s['ritual']: E("__GAME.comp('mimi')")
    check(not st()['errors'], f"fuzz 40s no errors {st()['errors'][:2]}")
    b.close()
print('FAILURES:', fails) if fails else print('ALL PASSED')
sys.exit(1 if fails else 0)
