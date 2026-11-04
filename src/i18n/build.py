"""Build parts/i18n_dict.js from keys.json + en*.txt + en_extra.txt (lines 'Indonesian|English', § = placeholder)."""
import json, pathlib, re
D = pathlib.Path(__file__).parent
keys = json.load(open(D / 'keys.json'))
pairs = {}
for f in sorted(D.glob('en[0-9]*.txt')):
    for line in f.read_text().splitlines():
        if not line.strip(): continue
        i, en = line.split('|', 1); k = keys[int(i)].replace('\x00', '§')
        if k.count('§') != en.count('§'): print('PLACEHOLDER MISMATCH', i, k, '=>', en)
        pairs[k] = en
ex = D / 'en_extra.txt'
if ex.exists():
    for line in ex.read_text().splitlines():
        if '|' not in line or line.startswith('#'): continue
        k, en = line.split('|', 1)
        if k.count('§') != en.count('§'): print('PLACEHOLDER MISMATCH extra', k, '=>', en)
        pairs[k] = en
(D.parent / 'parts' / 'i18n_dict.js').write_text('const I18N_EN = ' + json.dumps(list(pairs.items()), ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(pairs), 'pairs')
