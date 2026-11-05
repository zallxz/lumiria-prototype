import numpy as np
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]; A = ROOT / '_src' / 'art'; O = ROOT / 'assets'; W = O / 'world'; S = 4
def trim(i, th=16):
    return i.crop(i.getchannel('A').point(lambda v: 255 if v > th else 0).getbbox())
def clean(i, th=12):
    a = np.array(i); a[a[..., 3] < th] = 0; return Image.fromarray(a)
def save(i, n): i.save(W / f'{n}.webp', quality=88, method=6, exact=False); print(n, i.size)
def fit(i, wpx):
    w = int(wpx * S); return i.resize((w, round(i.height * w / i.width)), Image.LANCZOS)
for src, n, w in [('b_stoneinn', 'stoneinn', 8), ('b_stonehouse', 'stonehouse', 5.2), ('b_seahall', 'seahall', 9.4), ('b_seainn', 'seainn', 8), ('b_seahouse', 'seahouse', 5.2), ('b_forest', 'forest', 5.6), ('b_herb', 'herb', 8), ('b_office', 'office', 5.4), ('b_shop', 'shop', 5.6)]:
    i = clean(trim(Image.open(A / f'{src}.png').convert('RGBA'))); save(fit(i, w * 16), n)
def grid(src, cols, rows, names, th=16, keep=True):
    i = Image.open(A / f'{src}.png').convert('RGBA'); cw, ch = i.width / cols, i.height / rows
    for k, (n, wpx) in enumerate(names):
        c, r = k % cols, k // cols
        cell = i.crop((int(c * cw), int(r * ch), int((c + 1) * cw), int((r + 1) * ch)))
        a = np.array(cell)
        if th > 16: a[a[..., 3] < th] = 0
        cell = clean(trim(Image.fromarray(a), th)); save(fit(cell, wpx), n)
grid('p_sheet2', 4, 2, [('ore_tembaga', 20), ('ore_besi', 20), ('ore_perak', 20), ('tent', 42), ('torch', 11), ('sign', 22), ('fence', 22), ('chest', 20)], th=150)
grid('m_1', 4, 1, [('m_slime1', 20), ('m_slime2', 24), ('m_bat1', 34), ('m_bat2', 28)])
grid('m_2', 4, 1, [('m_wolf1', 44), ('m_wolf2', 44), ('m_golem1', 46), ('m_golem2', 50)])
def tex(src, n, sat=1., val=1., size=512):
    i = Image.open(A / f'{src}.png').convert('RGB'); s = i.width
    a = np.array(i).astype(float); m = s // 8; r = np.roll(np.roll(a, s // 2, 0), s // 2, 1)
    w = np.minimum(np.minimum(np.arange(s), np.arange(s)[::-1]), m) / m; X = np.minimum.outer(w, w)[..., None]; a = a * X + r * (1 - X)
    img = Image.fromarray(a.astype('uint8')).resize((size, size), Image.LANCZOS)
    h = np.array(img.convert('HSV')).astype(float); h[..., 1] *= sat; h[..., 2] = np.clip(h[..., 2] * val, 0, 255)
    Image.fromarray(h.astype('uint8'), 'HSV').convert('RGB').save(W / f'{n}.webp', quality=86, method=6); print(n)
tex('t_rock', 'rock'); tex('t_mire', 'mire', sat=.8); tex('t_dfloor', 'dfloor'); tex('t_soil', 'soil', sat=.9); tex('t_wood', 'wood', sat=.85)

# Character atlases: 9 columns (idle + 8 walk) x 4 rows
C = O / 'chars'
def hue_variants(base, band, targets):
    """Recolor pixels whose hue falls in band; targets are new hues in degrees."""
    a = np.array(Image.open(C / f'{base}.webp').convert('RGBA'))
    rgb = Image.fromarray(a[..., :3]).convert('HSV'); h = np.array(rgb).astype(float); hd = h[..., 0] / 255 * 360
    lo, hi = band; m = ((hd >= lo) & (hd <= hi) if lo < hi else ((hd >= lo) | (hd <= hi))) & (h[..., 1] > 55)
    for k, t in enumerate(targets, 1):
        g = h.copy(); g[..., 0][m] = t / 360 * 255; g[..., 1][m] = np.clip(g[..., 1][m] * .86, 0, 255)
        out = np.array(Image.fromarray(g.astype('uint8'), 'HSV').convert('RGB')); r = np.dstack([out, a[..., 3]])
        Image.fromarray(r.astype('uint8')).save(C / f'{base}_{k}.webp', quality=90, method=6, exact=False); print(base, k)
# Portraits: head and shoulders from the front pose
P = O / 'chars'
for art, n in [('hero_front', 'hero'), ('lady_front', 'lady'), ('merchant_front', 'merchant'), ('priest_front', 'priest'), ('knight_front', 'knight'), ('farmer_front', 'farmer'), ('mage_front', 'mage'), ('goblin_front', 'goblin')]:
    i = Image.open(A / f'{art}.png').convert('RGBA'); b = i.getchannel('A').point(lambda v: 255 if v > 30 else 0).getbbox(); w = b[2] - b[0]; hh = b[3] - b[1]
    s = int(hh * .46); cx = (b[0] + b[2]) // 2; c = i.crop((cx - s // 2, b[1] - int(hh * .02), cx + s // 2, b[1] - int(hh * .02) + s)).resize((192, 192), Image.LANCZOS); c.save(P / f'p_{n}.webp', quality=88, method=6, exact=False); print('portrait', n)
hue_variants('lady', (340, 16), [212, 150]); hue_variants('merchant', (340, 12), [218, 150]); hue_variants('mage', (255, 300), [185, 345])
