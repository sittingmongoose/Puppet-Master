import re, sys, os, json, collections
BASE = "/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro"
files = ["app.js","data.js","motion.js","variants-a.js","variants-b.js","variants-c.js","shell.html","audit-inventory.js"]
for f in sorted(os.listdir(BASE)):
    if f.endswith(".js") and f not in files: files.append(f)
tokens = collections.defaultdict(set)   # token -> files
interp = collections.defaultdict(set)   # pattern with ${} -> files

attr_re = re.compile(r'''class\s*=\s*(?:"([^"]*)"|'([^']*)'|\\"([^\\]*?)\\")''')
cl_re = re.compile(r'''classList\s*\.\s*(?:add|remove|toggle|contains|replace)\s*\(([^)]*)\)''')
cn_re = re.compile(r'''className\s*=\s*([`"'][^`"']*[`"'])''')
str_re = re.compile(r'''[`"']([^`"']*)[`"']''')

def add(chunk, f):
    chunk = chunk.strip()
    if not chunk: return
    if '${' in chunk:
        interp[chunk].add(f)
        # also add static tokens outside interpolations
        stat = re.sub(r'\$\{[^}]*\}', ' \x00 ', chunk)
        for t in stat.split():
            if t != '\x00' and re.fullmatch(r'[A-Za-z0-9_-]+', t): tokens[t].add(f)
    else:
        for t in chunk.split():
            if re.fullmatch(r'[A-Za-z0-9_-]+', t): tokens[t].add(f)

for f in files:
    p = os.path.join(BASE,f)
    if not os.path.exists(p): continue
    src = open(p, encoding='utf-8', errors='replace').read()
    for m in attr_re.finditer(src):
        add(m.group(1) or m.group(2) or m.group(3) or '', f)
    for m in cl_re.finditer(src):
        for s in str_re.finditer(m.group(1)): add(s.group(1), f)
    for m in cn_re.finditer(src):
        add(m.group(1)[1:-1], f)

# ids
id_re = re.compile(r'''id\s*=\s*(?:"([^"]*)"|'([^']*)')''')
ids=set()
for f in files:
    p=os.path.join(BASE,f)
    if not os.path.exists(p): continue
    src=open(p,encoding='utf-8',errors='replace').read()
    for m in id_re.finditer(src):
        v=(m.group(1) or m.group(2) or '').strip()
        if v and '${' not in v: ids.add(v)
    for m in re.finditer(r'''getElementById\(\s*['"]([^'"]+)['"]''', src): ids.add(m.group(1))

out = {"tokens": {k: sorted(v) for k,v in sorted(tokens.items())},
       "interp": {k: sorted(v) for k,v in sorted(interp.items())},
       "ids": sorted(ids)}
json.dump(out, open(sys.argv[1],'w'), indent=1)
print("tokens", len(tokens), "interp", len(interp), "ids", len(ids))
