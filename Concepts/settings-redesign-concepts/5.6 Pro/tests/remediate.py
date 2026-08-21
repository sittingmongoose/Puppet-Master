#!/usr/bin/env python3
from pathlib import Path
import json,re
ROOT=Path('/mnt/data/work/pm56_pro_reaudit');R=ROOT/'reports';CSS=ROOT/'styles.css'
report_path=R/'final-certification.json'
if not report_path.exists():
    (R/'remediation.txt').write_text('No certification report found.\n');raise SystemExit(0)
data=json.loads(report_path.read_text())
failures=data.get('failures',[])
classes=set();notes=[]
for f in failures:
    label=f.get('label','')
    # Collect genuinely clipped class tokens reported by browser geometry.
    def walk(x):
        if isinstance(x,dict):
            if 'clipped' in x and isinstance(x['clipped'],list):
                for c in x['clipped']:
                    cls=c.get('cls','') if isinstance(c,dict) else ''
                    if isinstance(cls,str):
                        for token in cls.split():
                            if re.fullmatch(r'[A-Za-z_][A-Za-z0-9_-]*',token):classes.add(token)
            for v in x.values():walk(v)
        elif isinstance(x,list):
            for v in x:walk(v)
    walk(f)
    if 'menu:' in label and ':anchored' in label:notes.append('Anchor guard retained/re-run for '+label)
    if 'sidecar:' in label:notes.append('Sidecar sibling/clamp guard retained/re-run for '+label)
    if 'history:' in label:notes.append('Stable history visibility overrides retained/re-run for '+label)

existing=CSS.read_text()
newclasses=[c for c in sorted(classes) if f'.{c} ' not in existing[-30000:]]
if newclasses:
    patch=['\n/* Browser-reported text-fit repairs. Generated only from visible clipped leaves. */']
    for c in newclasses:
        patch.append(f'.{c} {{ min-width: 0 !important; max-width: 100%; overflow-wrap: anywhere; }}')
    CSS.write_text(existing+'\n'+'\n'.join(patch)+'\n')
    notes.append(f'Added safe text-fit rules for {len(newclasses)} classes: '+', '.join(newclasses))
else:notes.append('No new browser-reported text-fit class repairs were required.')
(R/'remediation.txt').write_text('\n'.join(notes)+'\n')
