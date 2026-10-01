"""Exact whole-input/output companion and guarded deterministic delivery only."""
import argparse, hashlib, importlib.util, json, os, pathlib, re, stat, subprocess, time
LAB=pathlib.Path(__file__).absolute().parents[1]
def sha(raw): return hashlib.sha256(raw).hexdigest()
def unique(pairs):
 result={}
 for k,v in pairs:
  if k in result: raise ValueError('duplicate JSON key')
  result[k]=v
 return result
def safe(path,kind='file',immutable=False):
 p=pathlib.Path(path).absolute()
 for q in reversed((p,*p.parents)):
  s=q.lstat()
  if stat.S_ISLNK(s.st_mode): raise ValueError('symlink ancestor')
  if q!=p and not stat.S_ISDIR(s.st_mode): raise ValueError('non-directory ancestor')
 s=p.stat()
 if kind=='file' and (not stat.S_ISREG(s.st_mode) or s.st_nlink!=1): raise ValueError('nonregular/multiply-linked file')
 if kind=='dir' and not stat.S_ISDIR(s.st_mode): raise ValueError('directory required')
 if immutable and s.st_mode&0o222: raise ValueError('immutable file required')
 return p
def raw(p,immutable=False): return safe(p,immutable=immutable).read_bytes()
def load(p): return json.loads(raw(p),object_pairs_hook=unique)
def pinned(p,h):
 b=raw(p)
 if sha(b)!=h: raise ValueError('hash drift')
 return json.loads(b,object_pairs_hook=unique)
def relative(p):
 p=pathlib.PurePosixPath(p)
 if p.is_absolute() or not p.parts or any(x in ('..','.') for x in p.parts): raise ValueError('unsafe relative path')
 return str(p)
def enumerate_tree(root,immutable=False):
 safe(root,'dir');result={}
 for p in sorted(pathlib.Path(root).rglob('*')):
  if p.is_dir(): safe(p,'dir')
  else:
   b=raw(p,immutable);result[str(p.relative_to(root))]={'sha256':sha(b),'bytes':len(b)}
 return result
def quiet(host,integrity):
 if integrity.get('quiescence',{}).get('native_quiescent') is not True: raise ValueError('native quiescence absent')
 r=pinned(host/'native/receipt.json',integrity['quiescence']['native_receipt_sha256'])
 groups=r.get('quiescence_groups')
 if not isinstance(groups,dict) or not groups or any(groups.values()): raise ValueError('native groups not proven quiet')
 groups=set(int(x) for x in groups)|{int(integrity['quiescence']['owned_driver_pgid'])}
 for g in groups:
  if g<=1: raise ValueError('invalid owned group')
  p=subprocess.run(['pgrep','-g',str(g)],capture_output=True,text=True,timeout=5)
  if p.returncode!=1 or p.stdout.strip(): raise ValueError('owned group absence unproven')
 return r
def copy_exact(source,dest,expected,immutable_source=False):
 b=raw(source,immutable_source)
 if sha(b)!=expected: raise ValueError('source hash drift')
 dest.parent.mkdir(parents=True,exist_ok=True)
 safe(dest.parent,'dir')
 with dest.open('xb') as f:f.write(b)
 dest.chmod(0o400)
 if sha(raw(dest,True))!=expected: raise ValueError('copy mismatch')
 return len(b)
def companion(cfg_path,cfg_sha,host,destination):
 started=time.monotonic();cfg=pinned(cfg_path,cfg_sha);host=safe(host,'dir')
 integrity=load(host/'output-integrity.json');receipt=quiet(host,integrity)
 if integrity['label']!=cfg['attempt']['label']:raise ValueError('wrong attempt')
 pre=load(host/'preflight.json')
 if pre['method_config_sha256']!=cfg_sha:raise ValueError('wrong configuration')
 ws=safe(cfg['attempt']['workspace'],'dir');inputs={}
 for row in cfg['input_manifest']:
  rel=relative(row['target'])
  if rel in inputs:raise ValueError('duplicate input target')
  inputs[rel]={'sha256':row['sha256'],'bytes':len(raw(ws/'inputs'/rel,True))}
 actual=enumerate_tree(ws/'inputs',True)
 if actual!=inputs:raise ValueError('whole input scope drift')
 out=host/'frozen-output/out';actual_out=enumerate_tree(out,True)
 if actual_out!=integrity['files']:raise ValueError('whole output scope drift')
 if len(actual_out)>128 or sum(x['bytes'] for x in actual_out.values())>16777216 or any(x['bytes']>524288 for x in actual_out.values()):raise ValueError('output cap drift')
 destination=pathlib.Path(destination).absolute();safe(destination.parent,'dir');destination.mkdir(mode=0o700)
 count=0
 for namespace,base,rows,imm in [('inputs',ws/'inputs',inputs,True),('out',out,actual_out,True)]:
  for rel,x in rows.items():count+=copy_exact(base/rel,destination/namespace/rel,x['sha256'],imm)
 for d in sorted((p for p in destination.rglob('*') if p.is_dir()),key=lambda p:len(p.parts),reverse=True):d.chmod(0o500)
 destination.chmod(0o500)
 return {'schema':'er7.whole_companion.v1','label':cfg['attempt']['label'],'method_config_sha256':cfg_sha,'native_receipt_sha256':sha(raw(host/'native/receipt.json')),'output_integrity_sha256':sha(raw(host/'output-integrity.json')),'workspace':str(destination),'inputs':inputs,'out':actual_out,'copied_bytes':count,'copy_seconds':time.monotonic()-started,'all_inputs_preserved':True,'all_output_versions_preserved':True,'source_and_output_immutable':True,'semantic_assessment':'none','private_client_access':False}
def validate_frozen(root):
 root=safe(root,'dir');rows=enumerate_tree(root,True)
 for rel in rows:
  if rel.endswith('.json'):json.loads(raw(root/rel,True),object_pairs_hook=unique)
 return rows
def seal_delivery(destination):
 for p in sorted(pathlib.Path(destination).rglob('*')):
  if p.is_file():safe(p);p.chmod(0o400)
 for p in sorted((p for p in pathlib.Path(destination).rglob('*') if p.is_dir()),key=lambda p:len(p.parts),reverse=True):p.chmod(0o500)
 pathlib.Path(destination).chmod(0o500)
def deliver(cfg,root,destination):
 validate_frozen(root);destination=pathlib.Path(destination).absolute();safe(destination.parent,'dir')
 if destination.exists() or destination.is_symlink():raise ValueError('exclusive delivery required')
 if cfg['method'] in ('T03','T13'):
  code=LAB/'methods-z-preservation-delivery-v3-repair2/postrender.py'
  if cfg.get('closure_sha256',{}).get(str(code))!=sha(raw(code)):raise ValueError('exact renderer pin missing')
  s=importlib.util.spec_from_file_location('er7_exact_delivery',code);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
  result=m.deliver(cfg['method'],cfg['arm'],root,destination)
  seal_delivery(destination);return result
 if cfg['method'] in ('T04R','T05R'):
  root=pathlib.Path(root);streams={}
  for name,suffix in [('final','.json'),('reports','.md'),('acquisition','.json'),('protocol','.json')]:
   directory=safe(root/'out'/name,'dir');ps=sorted(directory.iterdir())
   if not ps:raise ValueError('required version stream absent')
   for i,p in enumerate(ps,1):
    if p.name!=f'V{i:03d}{suffix}':raise ValueError('noncontiguous/noncanonical stream')
   streams[name]=ps[-1]
  final=load(streams['final'])
  if set(final)!= {'report','acquisition','protocol'}:raise ValueError('exact final binding required')
  for key,name in [('report','reports'),('acquisition','acquisition'),('protocol','protocol')]:
   if final[key]!=str(streams[name].relative_to(root)):raise ValueError('highest stream binding mismatch')
  for name in ('reports','acquisition','protocol'):
   if not raw(streams[name],True).strip():raise ValueError('empty selected current artifact')
  started=time.monotonic();destination.mkdir(mode=0o700)
  for name,outname in [('reports','report.md'),('acquisition','acquisition.json'),('protocol','protocol.json')]:copy_exact(streams[name],destination/outname,sha(raw(streams[name],True)),True)
  seal_delivery(destination)
  return {'schema':'er7.exact_current_selector.v1','report_sha256':sha(raw(destination/'report.md',True)),'selected_final_sha256':sha(raw(streams['final'],True)),'selector_seconds':time.monotonic()-started,'semantic_assessment':'none'}
 raise ValueError('delivery method outside exact scope')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--config',required=True);p.add_argument('--config-sha256',required=True);p.add_argument('--host',required=True);p.add_argument('--companion',required=True);p.add_argument('--receipt',required=True);p.add_argument('--delivery');a=p.parse_args()
 r=companion(a.config,a.config_sha256,a.host,a.companion)
 if a.delivery:r['delivery']=deliver(pinned(a.config,a.config_sha256),a.companion,a.delivery)
 rp=pathlib.Path(a.receipt);safe(rp.parent,'dir')
 with rp.open('x') as f:f.write(json.dumps(r,indent=2)+'\n')
 rp.chmod(0o400);print(json.dumps({'receipt':str(rp),'sha256':sha(raw(rp,True))}))
