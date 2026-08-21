from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import math,re,json
ROOT=Path('/mnt/data/work/pm56_pro_reaudit');E=ROOT/'evidence';OUT=E/'contact-sheets';OUT.mkdir(parents=True,exist_ok=True)
source_dirs=[E/'production-browser',E/'final-certification',E/'critical-browser']
images=[]
for d in source_dirs:
 if d.exists():images += [p for p in d.rglob('*.png') if 'contact-sheets' not in p.parts]
# de-dupe by file name preference production > final > critical
seen={}
for p in images:seen.setdefault(p.name,p)
images=list(seen.values())

def sheet(paths,out,title,cols=4,cell=(330,230),limit=40):
 paths=paths[:limit]
 if not paths:return None
 cw,ch=cell;header=40;rows=math.ceil(len(paths)/cols);canvas=Image.new('RGB',(cols*cw,header+rows*ch),'#0c0e13');draw=ImageDraw.Draw(canvas);draw.text((14,12),title,fill='white')
 for i,p in enumerate(paths):
  try:im=Image.open(p).convert('RGB');im.thumbnail((cw-12,ch-32));x=(i%cols)*cw+(cw-im.width)//2;y=header+(i//cols)*ch+25+(ch-32-im.height)//2;canvas.paste(im,(x,y));draw.text(((i%cols)*cw+7,header+(i//cols)*ch+6),p.stem[:48],fill='#d8dbe5')
  except:pass
 canvas.save(out,quality=91);return out

groups={
 'recipes':[p for p in images if p.stem.startswith('recipe-')],
 'menus-sidecars':[p for p in images if 'sidecar' in p.stem or 'menu' in p.stem],
 'triggers':[p for p in images if p.stem.startswith('trigger-')],
 'options':[p for p in images if p.stem.startswith('option-')],
 'history-activity':[p for p in images if any(k in p.stem for k in ['history','activity','thread-search'])],
 'baseline-responsive':[p for p in images if any(k in p.stem for k in ['baseline','final-state','resized'])],
}
created=[]
for name,paths in groups.items():
 paths=sorted(paths)
 # sample evenly if enormous
 if len(paths)>40:
  paths=[paths[round(i*(len(paths)-1)/39)] for i in range(40)]
 p=sheet(paths,OUT/f'{name}.jpg',name.replace('-',' ').title());
 if p:created.append(p)
# Per option-family sheets based on filename token, using audit inventory.
try: inv=json.loads((ROOT/'reports/audit-inventory.json').read_text())
except: inv={}
for fam in inv.get('families',[]):
 fid=str(fam.get('id',''))
 paths=sorted([p for p in images if p.stem.startswith('option-') and re.sub(r'[^a-z0-9]','',fid.lower()) in re.sub(r'[^a-z0-9]','',p.stem.lower())])
 p=sheet(paths,OUT/f'family-{re.sub(r"[^a-z0-9]+","-",fid.lower()).strip("-")}.jpg',f'Component Family: {fid}',cols=4,limit=16)
 if p:created.append(p)
(ROOT/'reports/contact-sheet-index.json').write_text(json.dumps([str(p.relative_to(ROOT)) for p in created],indent=2))
