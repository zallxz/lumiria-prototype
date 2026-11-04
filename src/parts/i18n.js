/* ------------------------------ BAHASA / LANGUAGE ------------------------------ */
const LANG = { cur: (() => { try { const q = new URLSearchParams(location.search).get('lang'); return q || localStorage.getItem('lumiria:lang') || 'id'; } catch { return 'id'; } })() };
const I18N_DICT = /*@@DICT@@*/[];
const I18N = (() => {
  const exact = new Map(), pats = [], cache = new Map(), TOK = /(\{(?:\d+|p)\})/, esc2 = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const [a, b] of I18N_DICT) {
    if (!TOK.test(a)) { exact.set(a, b); continue; }
    const lit = a.replace(/\{(?:\d+|p)\}/g, ''); if ((lit.match(/[A-Za-zÀ-ÿ]/g) || []).length < 3) continue;
    const toks = []; const src = a.replace(/(\{(?:\d+|p)\})(?=\{(?:\d+|p)\})/g, '$1\u0001').split(/\u0001/).join('').split(/((?:\{(?:\d+|p)\})+)/).filter(x => x !== '').map(part => { if (/^(?:\{(?:\d+|p)\})+$/.test(part)) { toks.push(part); return '([\\s\\S]*?)'; } return esc2(part); }).join('');
    pats.push({ re: new RegExp('^' + src + '$'), toks, en: b, w: lit.length });
  }
  pats.sort((x, y) => y.w - x.w);
  function core(s, depth) {
    const e = exact.get(s); if (e !== undefined) return e;
    if (depth > 3 || s.length > 600) return s;
    for (const p of pats) { const m = p.re.exec(s); if (!m) continue; let out = p.en; const used = new Set();
      p.toks.forEach((tk, i) => { const v = trw(m[i + 1], depth + 1); if (tk === '{p}') out = out.replace('{p}', () => v); else if (!used.has(tk)) { used.add(tk); out = out.split(tk).join(v); } });
      return out; }
    if (s.includes(' · ')) { const parts = s.split(' · '), t2 = parts.map(x => trw(x, depth + 1)); if (t2.some((x, i) => x !== parts[i])) return t2.join(' · '); }
    const q = /^([“"(])([\s\S]+)([”")])$/.exec(s); if (q) return q[1] + trw(q[2], depth + 1) + q[3];
    return s;
  }
  function trw(s, depth = 0) { if (!s) return s; const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s); if (!m[2]) return s; return m[1] + core(m[2], depth) + m[3]; }
  function tr(s) { if (LANG.cur !== 'en' || typeof s !== 'string' || !/[A-Za-z]/.test(s)) return s; let r = cache.get(s); if (r !== undefined) return r; r = trw(s); if (cache.size > 6000) cache.clear(); cache.set(s, r); return r; }
  const ATTRS = ['title', 'placeholder', 'aria-label'];
  function node(n) {
    if (n.nodeType === 3) { if (n.__tr === n.data) return; const pe = n.parentNode; if (pe && (pe.nodeName === 'SCRIPT' || pe.nodeName === 'STYLE')) return;
      const orig = n.data; const t = tr(orig); n.__orig = orig; n.__tr = t; if (t !== orig) n.data = t; return; }
    if (n.nodeType !== 1 || n.nodeName === 'SCRIPT' || n.nodeName === 'STYLE') return;
    for (const a of ATTRS) if (n.hasAttribute(a)) { const v = n.getAttribute(a); if (n['__a' + a] === v) continue; const t = tr(v); n['__o' + a] = v; n['__a' + a] = t; if (t !== v) n.setAttribute(a, t); }
    for (let c = n.firstChild; c; c = c.nextSibling) node(c);
  }
  function restore(n) { if (n.nodeType === 3) { if (n.__orig !== undefined && n.data === n.__tr) n.data = n.__orig; n.__tr = undefined; return; }
    if (n.nodeType !== 1) return; for (const a of ATTRS) if (n['__o' + a] !== undefined && n.getAttribute(a) === n['__a' + a]) { n.setAttribute(a, n['__o' + a]); n['__a' + a] = undefined; }
    for (let c = n.firstChild; c; c = c.nextSibling) restore(c); }
  let obs = null;
  function watch() { if (obs) return; obs = new MutationObserver(list => { if (LANG.cur !== 'en') return; for (const m of list) { if (m.type === 'characterData') node(m.target); else if (m.type === 'attributes') node(m.target); else for (const a of m.addedNodes) node(a); } });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS }); }
  function set(l) { LANG.cur = l; try { localStorage.setItem('lumiria:lang', l); } catch {} document.documentElement.lang = l; cache.clear();
    if (l === 'en') node(document.body); else restore(document.body); for (const b of document.querySelectorAll('[data-lang]')) b.classList.toggle('on', b.dataset.lang === l); }
  return { tr, set, watch, node, size: () => [exact.size, pats.length] };
})();
const tr = I18N.tr;
