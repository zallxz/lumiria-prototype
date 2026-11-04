import pathlib, json, re, sys
from playwright.sync_api import sync_playwright
HTML = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').as_uri() + '?test=1&lang=en'
OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(exist_ok=True, parents=True)
ID = re.compile(r'\b(dan|yang|di|ke|dari|koin|untuk|tidak|sudah|belum|harga|kota|pasar|kavling|bangun|jual|beli|hari|detik|dengan|atau|ini|itu|akan|bisa|punya|lagi|kamu|aku|kau|sini|naik|turun|petak|rumah|toko|peti|senjata|skill naik|tanah|serikat|kabar|pengembara|musuh|jalan|tas)\b', re.I)
seen = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu']); pg = b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(HTML); pg.wait_for_function('window.__READY===true'); E = pg.evaluate
    def grab(tag):
        txt = E("""() => { const out=[]; const w=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while(n=w.nextNode()){ const el=n.parentElement; if(!el||el.closest('[hidden]')||el.closest('script,style')) continue; const t=n.data.trim(); if(t) out.push(t);} return out; }""")
        for t in txt:
            if ID.search(t): seen.setdefault(t, tag)
    E('__GAME.step(30)'); grab('title'); pg.screenshot(path=str(OUT/'en_title.png'))
    E("__GAME.go('play')"); E('__GAME.step(20)'); grab('dlg1'); pg.screenshot(path=str(OUT/'en_dialog.png'))
    for _ in range(20):
        if not E('__GAME.state().player.dialog'): break
        E("__GAME.tap('act')"); E('__GAME.step(30)'); grab('dlg')
    for tab in ['status','build','skill','tas','resep']:
        E(f"openPanel('status','{tab}')"); E('__GAME.step(2)'); grab('status-'+tab)
    pg.screenshot(path=str(OUT/'en_status.png'))
    E('__GAME.close()'); E('__GAME.exit()'); E('__GAME.step(30)'); grab('hud'); pg.screenshot(path=str(OUT/'en_town.png'))
    for c in ['lumiria','karst','corvel']:
        for tab in ['panen','bijih','jadi','bahan','banding','arus']:
            E(f"__GAME.market('{c}'); Panel.tab='{tab}'; renderPanel()"); E('__GAME.step(1)'); grab(f'mk-{c}-{tab}')
        E('__GAME.close()')
    pg.screenshot(path=str(OUT/'en_market.png'))
    for k in ['news','board','armory','gelap','forge','cook','bench','tukang','land','peta','pause']:
        E(f"openPanel('{k}')"); E('__GAME.step(1)'); grab(k)
        if k=='news': E("Panel.tab='tulis'; renderPanel()"); grab('news-tulis')
        E('__GAME.close()')
    for pid in ['C1','R2','C3']:
        E(f"openPanel('plot','{pid}')"); grab('plot'); E('__GAME.close()')
    pg.screenshot(path=str(OUT/'en_panel.png'))
    E('__GAME.step(60*40)'); grab('play40')
    E("__GAME.tp(90,42)"); E('__GAME.step(200)'); grab('distrik'); pg.screenshot(path=str(OUT/'en_distrik.png'))
    print('errors', errs)
json.dump(seen, open(OUT/'untranslated.json','w'), ensure_ascii=False, indent=0)
print(len(seen))
for t, tag in list(seen.items())[:400]: print(tag, '|', t[:160])
