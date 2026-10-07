"""Generic pinned local-byte acquisition: no semantic extraction or claims."""
import argparse,pathlib,hashlib,json,time,datetime
p=argparse.ArgumentParser();p.add_argument('operation',choices=['cold','warm']);p.add_argument('source');p.add_argument('--sha256',required=True);p.add_argument('--cache',required=True);p.add_argument('--receipt',required=True);a=p.parse_args()
t=time.monotonic();cache=pathlib.Path(a.cache);cache.mkdir(parents=True,exist_ok=True);obj=cache/a.sha256
source=pathlib.Path(a.source) if a.operation=='cold' else obj
b=source.read_bytes();assert hashlib.sha256(b).hexdigest()==a.sha256
if a.operation=='cold':
 if obj.exists(): assert obj.read_bytes()==b
 else:
  with obj.open('xb') as f:f.write(b)
  obj.chmod(0o444)
r={'operation':a.operation,'source':str(source),'sha256':a.sha256,'bytes':len(b),'object':str(obj),'network_requests':0,'extraction':'identity-v1','ended_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsed_seconds':time.monotonic()-t,'boundary':'frozen local bytes; not Internet download'}
with pathlib.Path(a.receipt).open('x') as f:json.dump(r,f,indent=2)
print(json.dumps(r))
