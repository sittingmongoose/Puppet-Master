import json, re, sys
root = sys.argv[1]; cites = json.load(open(sys.argv[2]))
def norm(s):
    s = s.replace("''", "'")
    s = re.sub(r'[`*_>]', '', s)
    return re.sub(r'\s+', ' ', s).strip().lower()
ok = 0; out = []
for cid, path, a, b, text in cites:
    lines = open(f'{root}/{path}', errors='replace').read().split('\n')
    span = norm(' '.join(lines[a-1:b]))
    want = norm(text)
    hit = want in span
    where = ''
    if not hit:
        whole = [i+1 for i, l in enumerate(lines) if want[:40] in norm(l)]
        # try a sliding 12-line window over the whole file
        for i in range(len(lines)):
            if want in norm(' '.join(lines[i:i+12])):
                where = f' (found at line {i+1}..)'; break
        else:
            where = f' (first-40-char hits at {whole[:5]})'
    ok += hit
    out.append(f"{'OK  ' if hit else 'MISS'} {cid} {path}:{a}-{b}{where}")
print('\n'.join(out)); print(f'{ok}/{len(cites)} verified in the cited line range')
