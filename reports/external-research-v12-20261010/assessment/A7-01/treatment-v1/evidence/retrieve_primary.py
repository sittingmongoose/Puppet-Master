"""Read-only primary retrieval for this single bounded assessment. No fetched code runs."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from datetime import datetime, timezone
import hashlib, json

OUT = Path(__file__).parent
JOBS = [
 ('P01-core', 'https://raw.githubusercontent.com/3MFConsortium/spec_core/master/3MF%20Core%20Specification.md'),
 ('P02-materials', 'https://raw.githubusercontent.com/3MFConsortium/spec_materials/master/3MF%20Materials%20Extension.md'),
 ('P03-index', 'https://3mf.io/spec/'),
 ('P04-fusion-mesh', 'https://help.autodesk.com/view/fusion360/ENU/?contextId=MESH-SAVE-AS-MESH'),
 ('P05-fusion-export', 'https://help.autodesk.com/view/fusion360/ENU/?contextId=ASM-EXPORT-DESIGN'),
 ('P06-prusa-formats', 'https://help.prusa3d.com/article/supported-file-formats_1772?product=cw1'),
 ('P07-prusa-project', 'https://help.prusa3d.com/article/saving-projects-as-3mf_1773?product=sl1'),
 ('P08-prusa250', 'https://api.github.com/repos/prusa3d/PrusaSlicer/releases/tags/version_2.5.0'),
 ('P09-cura570', 'https://api.github.com/repos/Ultimaker/Cura/releases/tags/5.7.0'),
 ('P10-cura514alpha', 'https://api.github.com/repos/Ultimaker/Cura/releases/tags/5.14.0-alpha.0'),
 ('P11-cura-releases', 'https://api.github.com/repos/Ultimaker/Cura/releases?per_page=10'),
 ('P12-prusa-releases', 'https://api.github.com/repos/prusa3d/PrusaSlicer/releases?per_page=10'),
 ('P13-step-issue', 'https://api.github.com/repos/prusa3d/PrusaSlicer/issues/8998'),
 ('P13-step-comments', 'https://api.github.com/repos/prusa3d/PrusaSlicer/issues/8998/comments?per_page=100'),
 ('P14-unit-issue', 'https://api.github.com/repos/prusa3d/PrusaSlicer/issues/15545'),
 ('P14-unit-comments', 'https://api.github.com/repos/prusa3d/PrusaSlicer/issues/15545/comments?per_page=100'),
 ('P15-bambu-issue', 'https://api.github.com/repos/prusa3d/PrusaSlicer/issues/15662'),
 ('P15-bambu-comments', 'https://api.github.com/repos/prusa3d/PrusaSlicer/issues/15662/comments?per_page=100'),
 ('P16-cura-position', 'https://api.github.com/repos/Ultimaker/Cura/issues/19456'),
 ('P16-cura-position-comments', 'https://api.github.com/repos/Ultimaker/Cura/issues/19456/comments?per_page=100'),
 ('P17-cura-names', 'https://api.github.com/repos/Ultimaker/Cura/issues/17110'),
 ('P17-cura-names-comments', 'https://api.github.com/repos/Ultimaker/Cura/issues/17110/comments?per_page=100'),
 ('P18-core-commit', 'https://api.github.com/repos/3MFConsortium/spec_core/commits?path=3MF%20Core%20Specification.md&per_page=1'),
 ('P19-materials-commit', 'https://api.github.com/repos/3MFConsortium/spec_materials/commits?path=3MF%20Materials%20Extension.md&per_page=1'),
 ('P20-prusa3mf-code', 'https://raw.githubusercontent.com/prusa3d/PrusaSlicer/version_2.9.6/src/libslic3r/Format/3mf.cpp'),
 ('P21-prusa-step-code', 'https://raw.githubusercontent.com/prusa3d/PrusaSlicer/version_2.9.6/src/libslic3r/Format/STEP.cpp'),
 ('P22-cura-reader-code', 'https://raw.githubusercontent.com/Ultimaker/Cura/5.13.0/plugins/3MFReader/ThreeMFReader.py'),
]

def retrieve(job):
 ident, url = job
 row = {'source_id':ident,'retrieval_url':url,'accessed_at_utc':datetime.now(timezone.utc).isoformat(),'operation':'unauthenticated HTTP GET; read-only; no retrieved code execution'}
 try:
  with urlopen(Request(url, headers={'User-Agent':'ER12-independent-bounded-review','Accept':'application/vnd.github+json' if 'api.github.com' in url else '*/*'}), timeout=35) as response:
   data=response.read(); row.update({'http_status':response.status,'final_url':response.url,'content_type':response.headers.get('Content-Type'),'etag':response.headers.get('ETag'),'link':response.headers.get('Link')})
  suffix = '.json' if 'api.github.com' in url else ('.md' if 'spec_' in url else ('.txt' if 'raw.githubusercontent.com' in url else '.html'))
  path=OUT/(ident+suffix); path.write_bytes(data)
  row.update({'path':str(path),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
  if suffix=='.json':
   parsed=json.loads(data); text=[]
   for item in parsed if isinstance(parsed,list) else [parsed]:
    if isinstance(item,dict):
     text.append(json.dumps({k:item.get(k) for k in ['html_url','tag_name','name','prerelease','published_at','created_at','updated_at','closed_at','state','state_reason','sha','target_commitish','title'] if k in item},ensure_ascii=False))
     if item.get('body'): text.append(item['body'])
   (OUT/(ident+'.txt')).write_text('\n\n'.join(text)+'\n')
 except Exception as exc: row['error']=repr(exc)
 return row

if __name__ == '__main__':
 with ThreadPoolExecutor(max_workers=6) as pool: rows=list(pool.map(retrieve,JOBS))
 (OUT/'retrieval-record.json').write_text(json.dumps(rows,indent=2)+'\n')
 for row in rows: print(row['source_id'],row.get('http_status',row.get('error')),row.get('bytes'))
