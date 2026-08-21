from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import re,math,json
SRC=Path('/mnt/data/work/pm56_source_review/repo')
ROOT=Path('/mnt/data/work/pm56_pro_reaudit');OUT=ROOT/'evidence'/'prior-concepts';OUT.mkdir(parents=True,exist_ok=True)
names=['5-6-sol','CursorAuto','fable','glm-5-2','kimi','kimi-k3','Opus 5','Qwen 5.8']
# discover candidate dirs case-insensitively and tolerate punctuation/spacing.
def norm(s):return re.sub(r'[^a-z0-9]','',s.lower())
all_dirs=[p for p in SRC.rglob('*') if p.is_dir()]
rows=[]
for name in names:
 target=norm(name);cands=[p for p in all_dirs if target in norm(p.name) or target in norm(str(p.relative_to(SRC)))]
 # prefer concept directories with source/evidence and shortest path.
 cands.sort(key=lambda p:(0 if 'concept' in str(p).lower() else 1,len(p.parts)))
 d=cands[0] if cands else None
 files=list(d.rglob('*')) if d else []
 source=[p for p in files if p.is_file() and p.suffix.lower() in {'.html','.css','.js','.ts','.tsx','.jsx'}]
 shots=[p for p in files if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.webp'}]
 videos=[p for p in files if p.is_file() and p.suffix.lower() in {'.mov','.mp4','.webm'}]
 reports=[p for p in files if p.is_file() and p.suffix.lower() in {'.md','.txt','.json'}]
 corpus=''
 for p in source[:80]:
  try:corpus+='\n'+p.read_text(errors='ignore')[:500000]
  except:pass
 patterns={k:bool(re.search(v,corpus,re.I)) for k,v in {
  'timeline/spine metaphor':r'timeline|spine',
  'folio/stage metaphor':r'folio|stage|signal house|concourse',
  'component switcher':r'concept mixer|variant|component option|switch',
  'thread history':r'thread history|thread-history',
  'working animation':r'working animation|thinking|tool use',
  'questionnaire':r'questionnaire|question surface',
  'activity bar':r'activity bar|activity-bar',
  'visualizer/Mermaid':r'visualizer|mermaid',
  'motion tests':r'animation|motion|video',
 }.items()}
 rows.append({'name':name,'path':str(d) if d else 'not found','source':len(source),'screenshots':len(shots),'videos':len(videos),'reports':len(reports),'patterns':patterns})
 # contact sheet: up to 8 images spread through inventory
 if shots:
  idx=[round(i*(len(shots)-1)/min(7,len(shots)-1)) for i in range(min(8,len(shots)))] if len(shots)>1 else [0]
  selected=[shots[i] for i in sorted(set(idx))]
  cells=[]
  for p in selected:
   try:
    im=Image.open(p).convert('RGB');im.thumbnail((420,280));canvas=Image.new('RGB',(430,320),'#15171c');x=(430-im.width)//2;y=28+(280-im.height)//2;canvas.paste(im,(x,y));draw=ImageDraw.Draw(canvas);draw.text((10,8),p.name[:58],fill='white');cells.append(canvas)
   except:pass
  if cells:
   cols=2;rows_n=math.ceil(len(cells)/cols);sheet=Image.new('RGB',(cols*430,rows_n*320),'#0b0d12')
   for i,c in enumerate(cells):sheet.paste(c,((i%cols)*430,(i//cols)*320))
   sheet.save(OUT/(re.sub(r'[^a-z0-9]+','-',name.lower()).strip('-')+'-contact.jpg'),quality=90)

lines=['# Prior Assistant Concept Review','',
'The failed work was not limited to `5-6-sol`. This sweep inventories the other assistant concept implementations called out in the review: CursorAuto, Fable, GLM 5.2, Kimi, Kimi-K3, Opus 5, Qwen 5.8, and 5-6-sol. Their source, evidence, reports, and available screenshots were treated as a requirement-recovery and failure-analysis corpus—not as a design foundation.','',
'## Inventory','', '| Concept | Located path | Source files | Screenshots | Videos | Reports/data |','|---|---|---:|---:|---:|---:|']
for r in rows:lines.append(f"| {r['name']} | `{r['path']}` | {r['source']} | {r['screenshots']} | {r['videos']} | {r['reports']} |")
lines += ['', '## Cross-concept findings','',
'- The earlier work optimized for independent novelty and mechanical requirement counts rather than a coherent PMConcept7-derived assistant.',
'- Multiple concepts introduced spatial metaphors, timelines, spines, stages, folios, or other structures that consumed scarce horizontal space and weakened ordinary transcript reading.',
'- Passing click/screenshot matrices did not prevent basic visual defects: clipping, incorrect overlay ownership, hover-dependent content, panel collision, and menu/submenu separation.',
'- Requirements were fragmented across concept-local implementations instead of one shared state and command contract, making feature parity and mix-and-match review unreliable.',
'- Demo fixtures often proved that a label existed rather than showing a complete user workflow with restoration, editor handoff, artifact identity, and durable state.',
'- The new 5.6 Pro lab therefore keeps one shared PMConcept7-derived shell and state model, isolates experimentation to seven renderer families, and gates packaging on rendered geometry, scrolling, interaction, and motion evidence.','',
'## Feature-presence inventory (not a quality score)','', '| Concept | Timeline/spine | Folio/stage | Switcher | History | Work | Questions | Activity | Visuals | Motion refs |','|---|---|---|---|---|---|---|---|---|---|']
for r in rows:
 p=r['patterns'];mark=lambda k:'yes' if p[k] else '—'
 lines.append(f"| {r['name']} | {mark('timeline/spine metaphor')} | {mark('folio/stage metaphor')} | {mark('component switcher')} | {mark('thread history')} | {mark('working animation')} | {mark('questionnaire')} | {mark('activity bar')} | {mark('visualizer/Mermaid')} | {mark('motion tests')} |")
lines += ['', '## Disposition','',
'- **Retained:** useful fixture scenarios, requirement clues, reference-path corrections, and any deterministic test idea that survived independent review.',
'- **Reimplemented:** history, selectors, menus, Working Animation, Activity Bar, questions/decisions, artifacts, editor handoff, resizing, and demo controls under a shared contract.',
'- **Rejected:** unrelated application metaphors, timeline/spine transcript structures, duplicated shells, concept-local fake behavior, and tests that treated DOM presence as visual certification.',
'- **Deferred:** production Plan normalization and native Rust/Slint implementation until a preferred component mix is selected.','',
'Contact sheets for any available prior screenshots are retained under `evidence/prior-concepts/` for side-by-side review.','']
(ROOT/'reports/PRIOR_CONCEPT_REVIEW.md').write_text('\n'.join(lines))
(ROOT/'reports/prior-concept-inventory.json').write_text(json.dumps(rows,indent=2))
