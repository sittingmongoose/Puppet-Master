#!/usr/bin/env python3
"""Read-only finite manifest byte/path verifier; optional receipt in this helper only."""
import hashlib,json,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
PREFIX='reports/external-research-v10-20261007/'
def sha(b):return hashlib.sha256(b).hexdigest()
def validate(stage,checkout):
 stage=Path(stage).resolve();checkout=Path(checkout).resolve()
 mp=stage/'BATCH011_MANIFEST.json';mb=mp.read_bytes();m=json.loads(mb)
 errors=[];new=[];refs=[];names=set()
 def need(ok,msg):
  if not ok:errors.append(msg)
 for e in m['entries']:
  target=e['publication_path'];need(target.startswith(PREFIX),'prefix '+target)
  rel=target.removeprefix(PREFIX);need('..' not in Path(rel).parts and not Path(rel).is_absolute(),'unsafe path '+target)
  need(target not in names,'duplicate '+target);names.add(target)
  if e['disposition'].startswith('NEW_'):
   p=stage/rel;need(p.is_file() and not p.is_symlink(),'missing/symlink '+target)
   if p.is_file():
    b=p.read_bytes();need(sha(b)==e['sha256'] and len(b)==e['bytes'],'byte identity '+target)
   need(not (checkout/target).exists(),'existing target '+target)
   new.append(e)
  else:
   need(e['disposition']=='PRIOR_PINNED_REFERENCE','unexpected disposition '+target)
   r=subprocess.run(['git','-C',str(checkout),'cat-file','blob',m['prior_verified_commit']+':'+target],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
   need(r.returncode==0,'missing pinned blob '+target)
   if r.returncode==0:
    b=r.stdout;need(sha(b)==e['sha256'] and len(b)==e['bytes'],'pinned byte identity '+target)
    need(hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==e['git_blob_sha1'],'pinned git blob identity '+target)
   refs.append(e)
 actual={PREFIX+str(p.relative_to(stage)) for p in stage.rglob('*') if p.is_file()}
 expected={e['publication_path'] for e in new}|{PREFIX+'BATCH011_MANIFEST.json'}
 need(actual==expected,'unmanifested/missing '+str(sorted(actual^expected)))
 need(not any(p.is_symlink() for p in stage.rglob('*')),'staged symlink')
 need(sum(e['bytes'] for e in new)==m['new_bytes_excluding_manifest'],'new byte total')
 need(len(new)==m['new_file_count_excluding_manifest'],'new file count')
 staged_bytes=sum(p.stat().st_size for p in stage.rglob('*') if p.is_file())
 need(staged_bytes<=m['max_staged_bytes'],'64MiB staged bound')
 declared_report_manifest=stage/'helpers/final-report/final-schema-map-v2/INPUT_IDENTITIES.json'
 declared_frozen_metadata=set()
 if declared_report_manifest.exists():
  declared_frozen_metadata={'helpers/final-report/final-schema-map-v2/'+f['bundle_path'] for f in json.loads(declared_report_manifest.read_bytes())['files']}
 disallowed=[]
 for e in new:
  rel=e['publication_path'].removeprefix(PREFIX)
  # Historical frozen metadata within the explicitly declared report bundle is allowed;
  # standalone live answers, raw bodies, private payload and native projections are not.
  if (any(x in Path(rel).parts for x in ['private','fragments','sources']) and rel not in declared_frozen_metadata) or rel.endswith('.bin') or '_current_raw' in rel or '/scratch/goals/' in rel:
   disallowed.append(rel)
  if any('/'+x+'/' in '/'+rel+'/' for x in ['D-M09-A','D-M06-A','D-M06-B']) and '/final-schema-map-v2/inputs/' not in '/'+rel:
   disallowed.append(rel)
 need(not disallowed,'excluded payload '+str(disallowed))
 scope=m['scope_limits']
 need(scope['primary_source_bodies_opened'] is False and scope['private_source_needles_or_fragments_opened'] is False,'source/private read declarations')
 need(scope['campaign_complete_claim'] is False and scope['cleanup_complete_claim'] is False,'completion claims')
 return {'schema':'ER10_BATCH011_FINAL_LOCAL_VALIDATION_V1','status':'PASS' if not errors else 'FAIL','manifest_sha256':sha(mb),'manifest_bytes':len(mb),'new_files_excluding_manifest':len(new),'new_bytes_excluding_manifest':sum(e['bytes'] for e in new),'staged_files_including_manifest':len(actual),'staged_bytes_including_manifest':staged_bytes,'prior_pinned_reference_count':len(refs),'prior_pinned_reference_bytes':sum(e['bytes'] for e in refs),'all_pinned_refs_actual_local_bytes_checked':True,'no_unmanifested_files':actual==expected,'no_existing_target_overwrites':not any((checkout/e['publication_path']).exists() for e in new),'scope_payload_audit_pass':not disallowed,'errors':errors,'remote_verification_performed':False,'root_actions_pending':['GitHub commit/push','actual remote verification','cleanup','settlement after terminal']}
if __name__=='__main__':
 cfg=json.loads((HERE/'config.json').read_bytes())
 out=validate(HERE/'staging'/PREFIX,cfg['publication_checkout'])
 if '--write-receipt' in sys.argv:
  p=HERE/'READY_FOR_ROOT.json';assert not p.exists()
  out['staging_root']=str(HERE/'staging'/PREFIX)
  out['scope_limits']=json.loads((HERE/'staging'/PREFIX/'BATCH011_MANIFEST.json').read_bytes())['scope_limits']
  p.write_text(json.dumps(out,indent=2)+'\n')
 print(json.dumps(out,indent=2));sys.exit(0 if out['status']=='PASS' else 1)
