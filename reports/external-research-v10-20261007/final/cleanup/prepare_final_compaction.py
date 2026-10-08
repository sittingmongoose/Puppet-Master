#!/usr/bin/env python3
"""Bind exact duplicate/source cleanup to completed publication/archive gates."""
from pathlib import Path
import hashlib,json,datetime

R=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
W=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
H=R/'helpers/final-report'

def sha(b):return hashlib.sha256(b).hexdigest()
def bound(p):return {'path':str(p),'sha256':sha(p.read_bytes())}

def main():
 actions={};holds=[]
 prior=json.loads((H/'PUBLISHED_METADATA_ALIAS_PREPARATION_V1.json').read_bytes())
 def alias(p,target,digest,size,scope):
  p,target=Path(p),Path(target)
  if not p.is_relative_to(R) or p.is_symlink() or not p.is_file():return
  if p==R/'state/checkpoint.json' or p.is_relative_to(H/'final-handoff-v1'):return
  b=p.read_bytes()
  if sha(b)!=digest or len(b)!=size:return
  if not target.is_file() or target.resolve()==p.resolve():return
  tb=target.read_bytes();assert sha(tb)==digest and len(tb)==size
  actions[str(p)]={'action':'relative_alias','original_path':str(p),'sha256':digest,'bytes':size,'retained_path':str(target.resolve()),'scope':scope}
 for row in prior['proposals']:
  alias(row['original_path'],row['retained_publication_path'],row['sha256'],row['bytes'],'Previously verified exact publication duplicate; immediate owner/hash recheck required.')
 final=json.loads((W/'reports/external-research-v10-20261007/FINAL_ASSET_MANIFEST.json').read_bytes())
 for row in final['files']:
  alias(row['source'],W/row['target'],row['sha256'],row['bytes'],'Exact final published artifact duplicate; unchanged original scientific hashes retained.')
 # Extend byte-identical metadata retention to duplicate physical frozen inputs.
 # Only already approved published source identities are used; source bodies and
 # native state are not selected merely from a matching filename.
 identities={(x['sha256'],x['bytes']):Path(x['retained_publication_path']) for x in prior['proposals']}
 identities.update({(x['sha256'],x['bytes']):W/x['target'] for x in final['files']})
 sourceprep=json.loads((H/'source-removal-qualification-preparation-v3.json').read_bytes())
 sources=sourceprep['selected_candidates']+sourceprep['held_candidates']
 sourcepaths={x['original_path'] for x in sources}
 for p in R.rglob('*'):
  if not p.is_file() or p.is_symlink() or str(p) in sourcepaths or p.is_relative_to(H/'final-handoff-v1'):continue
  if p.suffix.lower() not in {'.json','.md','.py','.txt','.csv','.jsonl'}:continue
  if p==R/'state/checkpoint.json' or 'integration-state' in p.name or 'current_raw' in p.name:continue
  b=p.read_bytes();key=(sha(b),len(b))
  if key in identities:alias(p,identities[key],*key,'Exact metadata duplicate matched to independently verified published bytes; filenames do not establish science.')
 fixed=json.loads((H/'FIXED_SOURCE_RECONSTRUCTION_CATALOG.json').read_bytes())
 fixedkeys={(x['sha256'],x['bytes']) for x in fixed['sources'] if x['whole_original_body_identity_verified'] is True}
 for row in sources:
  p=Path(row['original_path']);key=(row['sha256'],row['size_bytes'])
  if not p.is_file() or p.is_symlink():continue
  if key in fixedkeys:
   assert sha(p.read_bytes())==key[0] and p.stat().st_size==key[1]
   actions[str(p)]={'action':'remove_exact_reconstructible_source_cache','source_role':'raw_source_cache','whole_original_source_reconstruction':True,'original_path':str(p),'sha256':key[0],'bytes':key[1],'scope':'Only an independently verified fixed 40-hex commit whole-body identity; fragment identity alone is insufficient.'}
 dup=json.loads((H/'protected-source-duplicate-compaction-preparation-v3.json').read_bytes())
 for group in dup['proposals']:
  key=(group['sha256'],group['size_bytes'])
  if key in fixedkeys:continue
  canonical=Path(group['retained_canonical_path'])
  assert canonical.is_file() and sha(canonical.read_bytes())==key[0] and canonical.stat().st_size==key[1]
  assert str(canonical) not in actions,'Protected canonical body must not be removed'
  for p in group['duplicate_paths']:alias(p,canonical,*key,'One exact original unqualified body retained; duplicate paths remain readable aliases. No reconstruction/necessity qualification inferred.')
  holds.append({'retained_path':str(canonical),'sha256':key[0],'bytes':key[1],'reason':'Unique unqualified original Source retained. Necessary fragment preservation is not whole-assertion or whole-body reconstruction.'})
 assert len(actions)==len(set(actions))
 # Every retained alias target stays independent of a destructive action.
 for row in actions.values():
  if row['action']=='relative_alias':assert actions.get(row['retained_path'],{}).get('action')!='remove_exact_reconstructible_source_cache'
 plan=H/'FINAL_EXACT_COMPACTION_ACTION_PLAN_V1.json';plan.write_text(json.dumps({'schema':'ER10_ROOT_EXACT_FINAL_COMPACTION_PLAN_V1','actions':list(actions.values()),'retained_source_holds':holds,'full_corpus_deletion_authorized':False},indent=2)+'\n')
 cfg={'schema':'ER10_ROOT_EXACT_VERIFIED_COMPACTION_CONFIG_V1','owned_runtime_root':str(R),'publication_checkout':str(W),'full_corpus_deletion_authorized':False,'actual_quiet_receipt':bound(H/'FINAL_ACTUAL_OWNED_TREE_QUIET_VALIDATION_V1.json'),'verified_publication_receipt':bound(H/'FINAL_GITHUB_PUBLICATION_VERIFICATION_V1.json'),'verified_private_archive_receipt':bound(H/'FINAL_PRIVATE_ARCHIVE_VERIFICATION_V1.json'),'fixed_source_reconstruction_catalog':bound(H/'FIXED_SOURCE_RECONSTRUCTION_CATALOG.json'),'exact_action_plan':bound(plan),'limits':'No directory-wide deletion, shared provider-state cleanup, source hash repair, semantic repair, source requalification, main/canon change or current T3-bound worktree removal. Unique unqualified sources remain narrow explicit holds; only exact duplicate aliases and independently verified fixed whole-source cache removals are admitted.'}
 out=H/'FINAL_EXACT_COMPACTION_CONFIG_V1.json';assert not out.exists();out.write_text(json.dumps(cfg,indent=2)+'\n')
 print(json.dumps({'actions':len(actions),'planned_logical_bytes':sum(x['bytes'] for x in actions.values()),'fixed_source_removals':sum(x['action']=='remove_exact_reconstructible_source_cache' for x in actions.values()),'no_mutations':True}))

if __name__=='__main__':main()
