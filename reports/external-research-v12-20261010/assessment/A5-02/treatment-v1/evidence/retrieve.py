"""Read-only independent primary-source retrieval. No candidate files are written."""
import concurrent.futures, datetime, hashlib, html.parser, json, pathlib, re, subprocess
import requests

ROOT = pathlib.Path('ER12_RUNTIME/assessment/A5-02/treatment-v1')
RUN = pathlib.Path('ER12_RUNTIME/runs/A5-02/treatment')
EVID = ROOT / 'evidence'
EVID.mkdir(parents=True, exist_ok=True)

class TextParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.skip=0; self.out=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1
        if tag in ('p','div','li','h1','h2','h3','h4','tr','br','section','article'): self.out.append('\n')
    def handle_endtag(self,tag):
        if tag in ('script','style') and self.skip: self.skip-=1
    def handle_data(self,data):
        if not self.skip: self.out.append(data)

sources = json.loads((RUN/'stages/reviser/source-map.json').read_text())['sources']
jobs={}
for source in sources:
    url=source['url']
    if url not in jobs: jobs[url]={'id':'E-'+source['id'],'url':url,'candidate_aliases':[], 'candidate_version':source['version_or_commit']}
    jobs[url]['candidate_aliases'].append(source['id'])
extras={
 'E-S05-api':'https://api.github.com/repos/grokability/snipe-it/issues/19515',
 'E-S06-api':'https://api.github.com/repos/grokability/snipe-it/pulls/19633',
 'E-S06-files':'https://api.github.com/repos/grokability/snipe-it/pulls/19633/files',
 'E-S04-api':'https://api.github.com/repos/grokability/snipe-it/releases/tags/v8.8.0',
 'E-S07-api':'https://api.github.com/repos/grokability/snipe-it/pulls/19679',
 'E-Z01-api':'https://api.github.com/repos/zxing/zxing/pulls/1681',
 'E-Z01-files':'https://api.github.com/repos/zxing/zxing/pulls/1681/files',
 'E-Z02-api':'https://api.github.com/repos/zxing/zxing/releases/tags/zxing-3.5.3',
 'E-Z03-api':'https://api.github.com/repos/zxing/zxing/pulls/1839',
 'E-Z03-files':'https://api.github.com/repos/zxing/zxing/pulls/1839/files',
 'E-Z04-api':'https://api.github.com/repos/zxing/zxing/releases/tags/zxing-3.5.4',
}
for id,url in extras.items(): jobs[url]={'id':id,'url':url,'candidate_aliases':[]}

def retrieve(job):
    result=dict(job); result['requested_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        response=requests.get(job['url'], timeout=50, headers={'User-Agent':'ER12 independent semantic reviewer/1.0'})
        result.update(status=response.status_code, final_url=response.url, content_type=response.headers.get('Content-Type'), retrieved_at_utc=datetime.datetime.now(datetime.timezone.utc).isoformat())
        suffix='.pdf' if response.content.startswith(b'%PDF') else '.json' if 'json' in response.headers.get('Content-Type','') else '.html'
        raw=EVID/(job['id']+suffix); raw.write_bytes(response.content)
        result.update(raw_path=str(raw),raw_sha256=hashlib.sha256(response.content).hexdigest(),raw_bytes=len(response.content))
        textpath=EVID/(job['id']+'.txt')
        if suffix=='.pdf':
            subprocess.run(['pdftotext','-layout',str(raw),str(textpath)],check=True)
        elif suffix=='.json':
            data=response.json()
            if isinstance(data,list): text='\n\n'.join(json.dumps(x,indent=2,ensure_ascii=False) for x in data)
            else: text=json.dumps(data,indent=2,ensure_ascii=False)
            textpath.write_text(text)
        else:
            html=response.text
            article=re.search(r'<article\b[^>]*>(.*?)</article>',html,re.S)
            if article: html=article.group(1)
            parser=TextParser(); parser.feed(html)
            text=''.join(parser.out)
            text=re.sub(r'[ \t]+',' ',text); text=re.sub(r'\n\s*\n+','\n',text).strip()
            textpath.write_text(text)
        result.update(text_path=str(textpath),text_sha256=hashlib.sha256(textpath.read_bytes()).hexdigest())
    except Exception as error: result['error']=str(error)
    return result

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(retrieve,jobs.values()))
(EVID/'retrieval-manifest.json').write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n')
for r in results: print(r['id'],r.get('status'),r.get('raw_bytes'),r.get('error',''),flush=True)
