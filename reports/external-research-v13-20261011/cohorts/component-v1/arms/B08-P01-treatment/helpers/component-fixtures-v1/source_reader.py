#!/usr/bin/env python3
"""Read exact primary source context; performs no semantic retrieval or summarization."""
import argparse,pathlib,json,hashlib,sys
p=argparse.ArgumentParser()
p.add_argument('--case',required=True,choices=['B01-P01','B01-P02','B04-P01','B04-P02','B05-P01','B05-P02','B08-P01','B08-P02'])
p.add_argument('--source',required=True)
p.add_argument('--arm',required=True,choices=['control','treatment'])
p.add_argument('--start',type=int,default=1)
p.add_argument('--end',type=int)
a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[2]/'inputs'/a.case
if a.case.startswith('B05') and a.arm!='treatment':
 sys.exit('B05 control has ordinary independent primary lookup; shared cache expansion is treatment-only.')
index=root/('treatment-cache/navigation.json' if a.case.startswith('B05') else 'source-index.json')
rows=json.loads(index.read_text())['sources'];matches=[r for r in rows if r['id']==a.source]
if len(matches)!=1:sys.exit('Unknown/nonunique source ID')
r=matches[0];body=(root/r['cached_body']).read_bytes()
if hashlib.sha256(body).hexdigest()!=r['sha256']:sys.exit('Frozen primary source hash mismatch')
lines=body.decode('utf-8',errors='replace').splitlines()
end=a.end or len(lines)
if not 1<=a.start<=end<=len(lines):sys.exit('Invalid one-based inclusive range')
print(json.dumps({'case':a.case,'source':a.source,'url':r['url'],'sha256':r['sha256'],'range_1based':[a.start,end],'full_lines':len(lines)},ensure_ascii=False))
for i in range(a.start-1,end):print(f'{i+1}: {lines[i]}')
