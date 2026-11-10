import re, sys, glob, os, json
root = sys.argv[1]  # the repository checkout
def norm(s):
    s = s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    s = s.replace("''", "'")  # yaml single-quote escaping
    s = re.sub(r'[`*_>|]', '', s)
    s = s.replace('- "', ' ').replace('"', '')
    return re.sub(r'\s+', ' ', s).strip().lower()
corpus = {}
paths = glob.glob('/mnt/Cursor/Tools/browser-check/**/*.md', recursive=True) + glob.glob('/mnt/Cursor/share/puppet-master/2026-1*/**/*.md', recursive=True) + glob.glob(root + '/Plans/*.md') + glob.glob(root + '/Plans/*.json') + glob.glob(root + '/docs/*.md') + glob.glob(root + '/AGENTS.md') + glob.glob(root + '/.claude/CLAUDE.md') + glob.glob(root + '/reports/*/README.md') + glob.glob(root + '/reports/*/*.md') + glob.glob(root + '/Concepts/pm7-tools/**/*.md', recursive=True) + glob.glob('/mnt/Cursor/Agent-Guides/*.md')
for p in paths:
    try:
        if os.path.getsize(p) > 40_000_000: continue
        corpus[p] = norm(open(p, errors='replace').read())
    except Exception as e: pass
big = ' \n '.join(corpus.values())
for f in sys.argv[2:]:
    text = open(f).read()
    quotes = set(re.findall(r'"([^"\n]{40,400})"', text)) | set(re.findall(r'“([^”\n]{40,400})”', text))
    hit = miss = 0; misses = []
    for q in quotes:
        if not re.match(r'[A-Za-z\[]', q) or q.rstrip()[-1:] in '(:,': continue
        qn = norm(q)
        # allow ellipsis-split quotes: check each segment >= 25 chars
        segs = [s.strip() for s in re.split(r'\.\.\.|…|\[\.\.\.\]', qn) if len(s.strip()) >= 25]
        if not segs: continue
        ok = all(s in big for s in segs)
        if ok: hit += 1
        else:
            miss += 1; misses.append(q)
    print(f'{os.path.basename(f)}: quotes>=40ch {hit+miss}, verbatim found {hit}, not found {miss}')
    for m in misses[:60]: print('   MISS:', m[:230])
