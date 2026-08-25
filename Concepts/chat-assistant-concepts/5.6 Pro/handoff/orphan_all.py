"""Standing orphan gate. Reports every CSS class/id selector across the sheets
that matches no token the renderer can emit (static extraction UNION runtime harvest)."""
import re,json,os,sys
W=os.path.dirname(os.path.abspath(__file__))
BASE="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro"
LIVE=set(json.load(open(W+'/classes.json'))['tokens'])|set(json.load(open(W+'/harvest.json'))['classes'])
IDS=set(json.load(open(W+'/classes.json'))['ids'])
def rules(css):
    out=[];i=0;n=len(css);buf=''
    while i<n:
        c=css[i]
        if c=='{':
            sel=buf.strip();buf=''
            if sel.startswith('@'):
                if re.match(r'@(media|supports|layer|container|scope)',sel): i+=1;continue
                d=1;i+=1
                while i<n and d:
                    if css[i]=='{':d+=1
                    elif css[i]=='}':d-=1
                    i+=1
                continue
            out.append(sel);d=1;i+=1
            while i<n and d:
                if css[i]=='{':d+=1
                elif css[i]=='}':d-=1
                i+=1
            continue
        if c=='}': buf='';i+=1;continue
        buf+=c;i+=1
    return out
total=0
for f in sys.argv[1:] or ['styles.css','motion.css','transcripts.css','variants-a.css','variants-b.css','variants-c.css']:
    css=re.sub(r'/\*.*?\*/','',open(os.path.join(BASE,f),encoding='utf-8').read(),flags=re.S)
    orph=[]
    for sel in rules(css):
        for part in sel.split(','):
            part=part.strip()
            if not part: continue
            dead=[c for c in re.findall(r'\.(-?[A-Za-z_][A-Za-z0-9_-]*)',part) if c not in LIVE]
            dead+=['#'+i for i in re.findall(r'#(-?[A-Za-z_][A-Za-z0-9_-]*)',part) if i not in IDS]
            if dead: orph.append((part,dead))
    print(f"{f}: {len(orph)} orphan selector parts")
    for s,d in orph: print(f"   {s}  -> {', '.join(sorted(set(d)))}")
    total+=len(orph)
print("TOTAL", total)
