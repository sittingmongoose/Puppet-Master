"""Orphan gate: report CSS class selectors in a byte-range of styles.css that
match no class token the renderer can emit (static extraction + runtime harvest)."""
import re, json, sys, os
W="/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves"
BASE="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro"
static=json.load(open(os.path.join(W,'classes.json')))
runtime=json.load(open(os.path.join(W,'harvest.json')))
LIVE=set(static['tokens'])|set(runtime['classes'])
# resolve known interpolated-variable classes seen in the source
for extra in ['model-menu','assistant-grid','history-closed','activity-closed','sidecar']:
    pass
IDS=set(static['ids'])

def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)

def rules(css):
    """yield (selector_text, offset) for every rule, descending into @media."""
    out=[]
    i=0; n=len(css)
    depth_stack=[]
    buf=''
    while i<n:
        c=css[i]
        if c=='{':
            sel=buf.strip(); buf=''
            if sel.startswith('@'):
                if re.match(r'@(media|supports|layer|container|scope)', sel):
                    depth_stack.append('at'); i+=1; continue
                # keyframes / font-face: skip whole block
                d=1; i+=1
                while i<n and d:
                    if css[i]=='{': d+=1
                    elif css[i]=='}': d-=1
                    i+=1
                continue
            out.append(sel)
            d=1; i+=1
            while i<n and d:
                if css[i]=='{': d+=1
                elif css[i]=='}': d-=1
                i+=1
            continue
        if c=='}':
            if depth_stack: depth_stack.pop()
            buf=''; i+=1; continue
        buf+=c; i+=1
    return out

src=open(os.path.join(BASE,'styles.css'),encoding='utf-8',newline='').read()
start=int(sys.argv[1]) if len(sys.argv)>1 else 0
end=int(sys.argv[2]) if len(sys.argv)>2 else len(src)
lines=src.replace('\r\n','\n').split('\n')
seg='\n'.join(lines[start:end])
css=strip_comments(seg)
orphans=[]
for sel in rules(css):
    for part in sel.split(','):
        part=part.strip()
        if not part: continue
        classes=re.findall(r'\.(-?[A-Za-z_][A-Za-z0-9_-]*)', part)
        ids=re.findall(r'#(-?[A-Za-z_][A-Za-z0-9_-]*)', part)
        dead=[c for c in classes if c not in LIVE]
        deadid=[i for i in ids if i not in IDS]
        if dead or deadid:
            orphans.append((part, dead+['#'+x for x in deadid]))
print(f"LIVE tokens: {len(LIVE)}   rules scanned in range")
print(f"ORPHAN selector parts: {len(orphans)}")
for s,d in orphans:
    print(f"  {s}   -> dead: {', '.join(d)}")
