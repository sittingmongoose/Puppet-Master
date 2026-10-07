"""Read public sources as text only; retain bounded evidence in this review directory."""
import urllib.request, datetime, hashlib, json, re
from pathlib import Path
from html.parser import HTMLParser
OUT = Path(__file__).resolve().parent
class TextParser(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]; self.skip=0
    def handle_starttag(self,t,a):
        if t in ('script','style'): self.skip+=1
        if t in ('p','div','br','li','h1','h2','h3','h4','tr','pre'): self.parts.append('\n')
    def handle_endtag(self,t):
        if t in ('script','style'): self.skip=max(0,self.skip-1)
        if t in ('p','div','li','h1','h2','h3','h4','tr'): self.parts.append('\n')
    def handle_data(self,d):
        if not self.skip: self.parts.append(d)
def capture(id,url,patterns=(),kind='html',before=3,after=12,maxhits=20):
    start=datetime.datetime.now(datetime.timezone.utc).isoformat()
    meta={'id':id,'requested_url':url,'retrieved_started_utc':start,'retrieval_identity':'direct HTTPS GET; complete response hashed; bounded text retained; no source execution'}
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 Independent-Source-Review','Accept':'application/vnd.github+json' if kind=='json' else '*/*'})
        with urllib.request.urlopen(req,timeout=30) as r: data=r.read(5000000); final=r.url; headers=dict(r.headers); status=r.status
        raw=data.decode('utf-8','replace')
        if kind=='html':
            p=TextParser();p.feed(raw);lines=[re.sub(r'\s+',' ',l).strip() for l in ''.join(p.parts).splitlines() if l.strip()]
        elif kind=='json': lines=json.dumps(json.loads(raw),indent=2,ensure_ascii=False).splitlines()
        else: lines=raw.splitlines()
        selected=set()
        if patterns:
            for pattern in patterns:
                for i in [i for i,l in enumerate(lines) if re.search(pattern,l,re.I)][:maxhits]: selected.update(range(max(0,i-before),min(len(lines),i+after)))
        else: selected=set(range(len(lines)))
        text='\n'.join(f'L{i+1}: {lines[i]}' for i in sorted(selected))+'\n'
        (OUT/(id+'.txt')).write_text(text)
        meta.update({'resolved_url':final,'http_status':status,'response_bytes':len(data),'response_sha256':hashlib.sha256(data).hexdigest(),'response_headers':{k:v for k,v in headers.items() if k.lower() in ['date','last-modified','etag','content-type']},'response_text_lines':len(lines),'normalization':kind,'selection_patterns':list(patterns),'context_before':before,'context_after':after,'max_hits_per_pattern':maxhits,'selected_line_ranges':compress(sorted(selected)),'bounded_evidence_file':id+'.txt','bounded_evidence_sha256':hashlib.sha256(text.encode()).hexdigest(),'bounded_evidence_bytes':len(text.encode())})
    except Exception as e: meta.update({'error':str(e)})
    meta['retrieved_finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    (OUT/(id+'.json')).write_text(json.dumps(meta,indent=2)+'\n')
    print(json.dumps({k:meta.get(k) for k in ['id','http_status','response_bytes','bounded_evidence_bytes','error']}))
    return meta
def compress(ns):
    if not ns:return []
    out=[];s=e=ns[0]
    for n in ns[1:]:
        if n==e+1:e=n
        else:out.append([s+1,e+1]);s=e=n
    out.append([s+1,e+1]);return out
