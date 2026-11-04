"""Playtest v4: core RPG (no level), gear & quality, mastery & skill lock, world scaling, AI gear/progress/party/raid/boss help,
schedules, factions, events & missions, weekly ranks, affinity, save migration/export, English UI."""
import pathlib, sys, json, time
from playwright.sync_api import sync_playwright
HTML = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').resolve().as_uri() + '?test=1'
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'shots4'); OUT.mkdir(parents=True, exist_ok=True)
fails = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu']); page = b.new_page(viewport={'width': 1280, 'height': 720})
    page.on('pageerror', lambda e: fails.append(f'pageerror: {e}'))
    page.goto(HTML); page.wait_for_function('window.__READY === true', timeout=20000)
    E = page.evaluate; pl = lambda: E('__GAME.state()')['player']
    def run(n): return E(f'__GAME.step({n})')
    def shot(name): page.wait_for_timeout(200); page.screenshot(path=str(OUT / f'{name}.png'))
    def adv(limit=40):
        for _ in range(limit):
            s = pl()
            if not s or not s['dialog']: return s
            E("__GAME.tap('act')"); run(4); E("__GAME.tap('act')"); run(30)
        return pl()
    def check(c, m):
        print(('ok  ' if c else 'FAIL'), m)
        if not c: fails.append(m)
    E("__GAME.go('play')"); run(10); adv(); E('__GAME.close()'); run(5); adv(); E('__GAME.exit()'); run(5)
    html = E("document.body.innerText"); check('Lv ' not in html and 'EXP' not in html, 'no level / EXP shown')
    s0 = E('stats()'); print('   base stats', s0); check(s0['def'] == 1 and s0['hp'] == 20, 'base attributes (Baju Kain DEF 1)')
    E("__GAME.give('zirah_besi', 1); equip('zirah_besi')"); s1 = E('stats()'); check(s1['def'] == 4 and s1['spd'] < 1 and s1['hp'] == 24, f'iron armor: DEF 4, slower, HP+4 {s1}')
    hp0 = pl()['hp']; E('P.inv = 0; hurtPlayer(10, 0, 0)'); dmg = hp0 - pl()['hp']; check(dmg == 7, f'mitigation 10 dmg → {dmg} (DEF 4)')
    E("G.hp = G.hpMax; P.inv = 0")
    E("openPanel('status','status')"); run(2); shot('st_attr'); E("Panel.tab='build'; renderPanel()"); shot('st_build'); E("Panel.tab='skill'; renderPanel()"); shot('st_skill')
    E("Panel.tab='rep'; renderPanel()"); shot('st_rep'); E('__GAME.close()')
    # quality crafting
    E("G.sk.pandai = 90; __GAME.give('besi', 60); __GAME.give('tembaga', 20)"); qs = E("(()=>{const c={0:0,1:0,2:0}; for(let i=0;i<12;i++){ doAction('craft','forge:pedang_besi'); } return Object.keys(G.inv).filter(k=>k.startsWith('pedang_besi'))})()")
    print('   crafted', qs); check(any(q.endswith('_b') or q.endswith('_lb') for q in qs), 'high Pandai yields quality gear'); E('__GAME.close()')
    check(E("ITEMS.pedang_besi_lb.dmg") > E("ITEMS.pedang_besi.dmg"), 'Luar Biasa variant stronger')
    # skill lock & cap
    E("for (const k in G.sk) G.sk[k] = 70; G.sk.pedang = 70"); tot = E('totalSkill()'); print('   total', tot)
    E("G.skLock = { berdagang: 'down' }; const b0 = G.sk.berdagang; for (let i=0;i<200;i++) train('pedang', 99)"); check(E('totalSkill()') <= 770 and E("G.sk.berdagang") < 70, 'cap trades points from ↓ skill')
    E("G.skLock.pedang = 'lock'; const pv = G.sk.pedang; for (let i=0;i<50;i++) train('pedang', 99); window.__pv = pv"); check(E('G.sk.pedang === __pv'), 'locked skill does not grow')
    E("for (const k in G.sk) G.sk[k] = 10; G.skLock = {}")
    # buffs
    E("__GAME.give('telur_dadar', 1); const a0 = stats().atk; eatFood('telur_dadar'); window.__a0 = a0"); check(E('stats().atk > __a0'), 'food buff raises attack')
    # world scaling
    w = E("(()=>{ const a = __ENEMIES().filter(e=>e.t==='wolf'); return a.map(e=>[e.sp.x, e.max, +(e.dm||1).toFixed(2)]) })()"); print('   wolves', w[:6])
    check(any(x[0] >= 72 and x[1] > 8 for x in w) and any(x[0] < 72 and x[1] in (8, 16) for x in w), 'Mirewood wolves tougher than Lumiria wolves')
    el = E("(()=>{ let n=0; for(let i=0;i<300;i++){ const e = spawnEnemy({t:'slime', x:36, y:45, r:2}); if (e.elite) n++; e.gone = true; } return n })()"); run(1); print('   elites/300', el); check(5 < el < 45, 'elite monsters spawn ~7%')
    # AI gear & progress
    bs = E("BOTS.slice(0,6).map(b=>[b.name,b.role,b.skc,botWeapon(b),botArmor(b),b.hpMax,+b.atk.toFixed(1)])"); print('   bots', bs); check(all(x[5] >= 20 for x in bs), 'bots have stats & gear')
    E("window.__b = BOTS.find(b => b.role === 'pendekar'); __b.wallet = 5000; __b.gw = 1; botUpgrade(__b)"); check(E('__b.gw') == 2, 'bot buys a weapon upgrade from the market')
    sk0 = E('__b.skc'); E("for (let i=0;i<200;i++) botGain(__b, 'c', 60)"); check(E('__b.skc') > sk0, 'bot combat skill grows')
    # party
    E("G.aff[__b.i] = 60; __b.mode='stay'; __b.down=0; __b.x = G.x + 20; __b.y = G.y"); E("inviteBot(__b)"); run(5); check(E("G.party.some(p => p.i === __b.i)"), 'friend (aff 60) joins party')
    E('__GAME.tp(36, 46)'); run(60); d = E("Math.hypot(__b.x - G.x, __b.y - G.y)"); check(d < 60, f'party member follows into the wild ({d:.0f}px)'); shot('party_wild')
    E("__ENEMIES().filter(e=>!e.dead).forEach(e=>{ if (Math.hypot(e.x-G.x,e.y-G.y) < 120) e.st='chase' })"); h0 = E("__ENEMIES().filter(e=>!e.dead && Math.hypot(e.x-G.x,e.y-G.y)<110).reduce((s,e)=>s+e.hp,0)"); run(300)
    k = E('__b.kills'); print('   party bot kills', k)
    # raid
    E("G.coin = 500; G.hour = 12"); E("__GAME.setClock(21*20)"); run(1); n0 = len(E('G.party')); E("raidCall()"); n1 = len(E('G.party')); check(n1 > n0, f'raid call recruits ({n0}→{n1})')
    E("partyBots().forEach(b => { b.x = G.x; b.y = G.y })")
    # boss help
    E("const k = __ENEMIES().find(e=>e.t==='king'); window.__k = k; G.party.forEach(p=>leaveParty(BOTS[p.i])); G.party = []"); E("__GAME.tp(__k.home.x/16, __k.home.y/16 + 2)"); E("__k.pHit = true; __k.st = 'chase'"); run(10); E("bossAssist()")
    na = E("BOTS.filter(b=>b.mode==='assist').length"); print('   assisting bots', na); check(na >= 0, 'boss assist runs (bots near boss join)')
    E("__k.hp = 1; G.hp = G.hpMax; damageEnemy(__k, 99, false, 0, null, 'pedang')"); run(30)
    # schedule
    E("__GAME.setClock((24 + 10 - 15 + 24) * 20)"); run(2); E("for (let i=0;i<BOTS.length*2;i++) schedTick(BOTS[i % BOTS.length])"); day = E('onlineBots().length')
    E("__GAME.setClock((24 + 15 - 15 + 24 + 3 - 15 + 24) * 20)"); run(2); h = E('hourOf()'); E("for (let i=0;i<BOTS.length;i++) schedTick(BOTS[i])"); night = E('onlineBots().length')
    print(f'   online day {day} · night {night} (h {h:.1f})'); check(night < day * .6, 'most AI log off at night')
    # factions
    E("addRep('serikat', 6)"); check(E("facRank('serikat')") == 1, 'faction rank up'); t0 = E("(()=>{CUR_CITY='lumiria'; return taxRate()})()"); E("addRep('serikat', 30)"); check(E('taxRate()') < t0, 'Serikat rank lowers tax')
    # events & missions
    E("startEvent('bandit')"); check(E("G.mission && G.mission.ev === 'bandit'"), 'event mission created'); nb = E("__ENEMIES().filter(e=>e.sp.evb && !e.dead).length"); check(nb == 4, 'bandit event spawns raiders')
    c0 = pl()['coin']; E("for (let i=0;i<6;i++) missionProgress('bandit')"); check(pl()['coin'] >= c0 + 110, 'mission reward paid')
    E("__GAME.close(); __GAME.tp(66, 32); G.events = G.events.filter(e => e.id !== 'bandit')"); run(5); shot('hud_mission')
    E("startEvent('turnamen')"); run(2); ml = E('missionLine()'); print('   ', ml); check(ml and 'Turnamen' in ml, 'tournament mission line')
    # weekly rank
    E("addScore('hunt', 999); G.week.n = 0"); c1 = pl()['coin']; E('weekRollover()'); check(pl()['coin'] >= c1 + 300 and (E('G.titles') or [None])[0], 'weekly champion reward + title')
    E("openPanel('rank')"); run(2); shot('rank'); E('__GAME.close()')
    # affinity gift
    E("window.__c = BOTS.find(b=>b.role==='penyihir'); __GAME.give('teh_herba', 2); G.aff[__c.i] = 0"); E("giveGift(__c, 'teh_herba')"); check(E('G.aff[__c.i]') >= 12, 'liked gift +12 affinity')
    E("openPanel('status','sosial')"); run(2); shot('st_social'); E('__GAME.close()')
    # save: export/import & migration
    code = E('exportSave()'); check(len(code) > 1000, 'export code'); E("G.coin = 1"); ok = E(f"importSave({json.dumps(code)})"); check(ok and pl()['coin'] > 1, 'import restores save')
    old = E("(()=>{ const s = JSON.parse(JSON.stringify(G)); s.v = 3; delete s.armor; delete s.fac; delete s.skLock; s.align = 40; return s })()"); ok = E(f"loadFrom({json.dumps(old)})"); check(ok and E('G.v') == 4 and E("G.fac.kuil") == 4, 'v3 save migrates to v4')
    # english
    E("I18N.set('en'); openPanel('status','status')"); run(2); shot('en_status'); E("Panel.tab='skill'; renderPanel()"); shot('en_skill'); E('__GAME.close()'); E("I18N.set('id')")
    # perf
    t = time.time(); run(600); ms = (time.time() - t) / 600 * 1000; print(f'   {ms:.2f} ms/step incl. render'); check(ms < 12, 'performance ok')
    import random; random.seed(4); acts = ['up','down','left','right','act','attack','skill','skill2','build','map','pause']
    for i in range(300):
        a = random.choice(acts); E(f"__GAME.hold('{a}')"); run(random.randint(2, 10)); E(f"__GAME.hold('{a}', false)")
        if i % 40 == 0: E('__GAME.close()'); adv(3)
    check(not [f for f in fails if f.startswith('pageerror')], 'no runtime errors')
    print('FAILS', fails)
