"""Read-only primary-evidence retrieval for this bounded independent assessment."""
from pathlib import Path
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib, json, urllib.request, urllib.error

ROOT = Path(__file__).resolve().parent
MAP = Path('ER12_RUNTIME/runs/A7-02/treatment/stages/investigator/source-map.json')

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip = 0; self.out = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style','noscript'): self.skip += 1
        if tag in ('p','div','li','h1','h2','h3','h4','pre','br','tr','section'): self.out.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script','style','noscript'): self.skip = max(0,self.skip-1)
        if tag in ('p','div','li','h1','h2','h3','h4','pre','tr','section'): self.out.append('\n')
    def handle_data(self, data):
        if not self.skip: self.out.append(data)

def retrieve(source):
    sid = source['id']; url = source['exact_url']
    row = {'id':sid,'requested_url':url,'started_at_utc':datetime.now(timezone.utc).isoformat(),'operation':'Unauthenticated read-only public HTTP GET; no manager/API fixture executed'}
    try:
        request = urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (independent research assessment)'})
        with urllib.request.urlopen(request,timeout=25) as response:
            raw=response.read(); row.update(status=response.status,final_url=response.url,content_type=response.headers.get('Content-Type'))
        if 'html' in (row.get('content_type') or ''):
            parser=Text(); parser.feed(raw.decode('utf-8','replace'))
            lines=[' '.join(line.split()) for line in ''.join(parser.out).splitlines() if line.strip()]
        else:
            lines=raw.decode('utf-8','replace').splitlines()
        text='\n'.join(f'{i+1:04d}: {line}' for i,line in enumerate(lines))+'\n'
        path=ROOT/(sid+'.txt'); path.write_text(text)
        row.update(text_path=str(path),text_sha256=hashlib.sha256(text.encode()).hexdigest(),response_sha256=hashlib.sha256(raw).hexdigest(),response_bytes=len(raw),text_lines=len(lines))
    except Exception as e:
        row.update(error=repr(e),status=getattr(e,'code',None))
    row['finished_at_utc']=datetime.now(timezone.utc).isoformat()
    return row

if __name__ == '__main__':
    ROOT.mkdir(parents=True,exist_ok=True)
    sources=json.loads(MAP.read_text())['sources']
    with ThreadPoolExecutor(max_workers=6) as pool: rows=list(pool.map(retrieve,sources))
    (ROOT/'retrievals.json').write_text(json.dumps(rows,indent=2)+'\n')
    for row in rows: print(row['id'],row.get('status'),row.get('text_lines'),row.get('error',''))
