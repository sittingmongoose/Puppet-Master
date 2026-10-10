"""Read-only public primary retrieval for the bounded A4-01 treatment review."""
import concurrent.futures
import hashlib
import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
import requests

OUT = Path(__file__).resolve().parent
BASE = Path('ER12_RUNTIME')
RUN = BASE / 'runs/A4-01/treatment'

class Plain(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1
        if tag in ('p','div','h1','h2','h3','h4','li','tr','br','pre','section','article'):
            self.out.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self.skip:
            self.skip -= 1
        if tag in ('p','div','h1','h2','h3','h4','li','tr','pre','section','article'):
            self.out.append('\n')
    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)
    def result(self):
        return '\n'.join(line.strip() for line in ''.join(self.out).splitlines() if line.strip()) + '\n'

sources = json.loads((RUN/'stages/investigator/source-map.json').read_text())['sources']
sources += json.loads((RUN/'stages/reviser/source-map.json').read_text())['reviser_sources']
extra = [
    ('P21','https://raw.githubusercontent.com/tus/tusd/v2.10.1/docs/_storage-backends/aws-s3.md'),
    ('P22','https://api.github.com/repos/tus/tusd/releases/tags/v2.10.1'),
    ('P23','https://api.github.com/repos/tus/tusd/pulls/1385'),
    ('P24','https://api.github.com/repos/tus/tusd/pulls/1385/files'),
    ('P25','https://api.github.com/repos/minio/minio/commits/f246ee7'),
    ('P26','https://api.github.com/repos/minio/minio/pulls/20456'),
    ('P27','https://api.github.com/repos/minio/minio/issues/20455'),
    ('P28','https://raw.githubusercontent.com/tus/tusd/v2.10.1/pkg/s3store/s3store.go'),
]
jobs = [{'id':f'P{i:02d}', 'original_id':s['id'], 'url':s['url']} for i,s in enumerate(sources,1)]
jobs += [{'id':i,'original_id':None,'url':u} for i,u in extra]

def fetch(job):
    record = dict(job, accessed_utc=datetime.now(timezone.utc).isoformat())
    try:
        r = requests.get(job['url'],timeout=35,headers={'User-Agent':'ER12-independent-semantic-review/1.0','Accept':'*/*'})
        suffix = '.json' if 'json' in r.headers.get('Content-Type','') else '.html' if 'html' in r.headers.get('Content-Type','') else '.txt'
        raw = OUT/(job['id']+'-raw'+suffix)
        raw.write_bytes(r.content)
        record.update(status=r.status_code, resolved_url=r.url, content_type=r.headers.get('Content-Type'), raw_path=str(raw), raw_sha256=hashlib.sha256(r.content).hexdigest(), bytes=len(r.content))
        if suffix == '.html':
            parser=Plain(); parser.feed(r.text); plain=parser.result()
        else:
            plain=r.text
        txt=OUT/(job['id']+'-text.txt'); txt.write_text(plain)
        record.update(text_path=str(txt),text_sha256=hashlib.sha256(txt.read_bytes()).hexdigest(), lines=len(plain.splitlines()))
    except Exception as ex:
        record['error']=str(ex)
    return record

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records=list(pool.map(fetch,jobs))
(OUT/'retrieval-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
for r in records:
    print(r['id'],r.get('status','ERROR'),r.get('bytes',0),r['url'],r.get('error',''))
