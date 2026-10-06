#!/usr/bin/env python3
"""Typed, metadata-only classifier and opaque copy verifier. Never parses transferred scientific bodies."""
import pathlib,json,hashlib,collections,datetime,re,shutil
LAB=pathlib.Path('/home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005');D=LAB/'consolidation/publication-curation-001';I=LAB/'consolidation/publication-inventory-001'
START='2026-10-06T12:38:15+00:00';DEADLINE='2026-10-06T13:08:15+00:00'
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
sha=lambda x:hashlib.sha256(x).hexdigest()
def hashfile(p):
 h=hashlib.sha256();n=0
 with pathlib.Path(p).open('rb') as f:
  for part in iter(lambda:f.read(1048576),b''):h.update(part);n+=len(part)
 return h.hexdigest(),n
sources=[]
def meta(p):
 p=pathlib.Path(p);raw=p.read_bytes();sources.append({'path':str(p),'sha256':sha(raw),'bytes':len(raw)});return json.loads(raw)
inv=meta(I/'ARM_INVENTORY.json');pending=meta(I/'PENDING_PUBLICATION_REFS.json');ownerpath=LAB/'ops/frozen-exports/observations/PUBLICATION_CURATION_OWNER_CLASSIFICATION_001.json';owner=meta(ownerpath)
assert sha((I/'PENDING_PUBLICATION_REFS.json').read_bytes())==owner['source_inventory']['sha256']
pins=inv['pin_table'];stages={s['job_id']:s for s in inv['stages']};current={j for r in inv['current_selected_arms'] for j in r['stage_ids']}
strata={}
for key,ids in inv['separate_nonlogical_strata'].items():
 for j in ids:strata.setdefault(j,[]).append(key)
uses=collections.defaultdict(list)
for r in pending['refs']:
 uses[r['pin']['pin_ref']].append({'job_id':r['job_id'],'kind':r['kind'],'current_selected':r['job_id'] in current,'lineage_strata':strata.get(r['job_id'],[]),'stage_binding_scope':stages[r['job_id']].get('stage_binding_scope','UNKNOWN')})
# Every pin occurrence gets exact provenance, even beyond the five stage-asset kind list.
def walk(v,jid=None,field=''):
 if isinstance(v,dict):
  if v.get('pin_ref'):
   x={'job_id':jid or 'GLOBAL_NEUTRAL_PROVENANCE','kind':'ADDITIONAL_PIN_REFERENCE','field':field,'current_selected':jid in current if jid else False,'lineage_strata':strata.get(jid,[])}
   if x not in uses[v['pin_ref']]:uses[v['pin_ref']].append(x)
  for k,x in v.items():walk(x,jid,field+'/'+k)
 elif isinstance(v,list):
  for x in v:walk(x,jid,field)
for st in inv['stages']:walk(st,st['job_id'])
# Explicit courier-approved exact source selection, not recursive directory permission.
positive={}
for relative in ['ops/frozen-exports/PUBLIC_SELECTION_059.json','audit/finish-publication-001/PUBLICATION_SELECTOR.json']:
 p=LAB/relative
 if not p.is_file():continue
 sel=meta(p)
 for f in sel.get('files',[]):
  if isinstance(f,dict) and f.get('path') and f.get('sha256'):positive[(f['path'],f['sha256'])]=str(p)
# Exact pending config approval is supplied separately by the owner. No extension/schema guess.
config_approval_path=D/'OWNER_TOOL_CONFIG_APPROVAL_REF.json';config_approvals={};config_proof=None
if config_approval_path.exists():
 ref=meta(config_approval_path);proof=pathlib.Path(ref['path']);assert hashfile(proof)[0]==ref['sha256'];config_proof=meta(proof)
 for row in config_proof.get('files',[]):
  if row.get('classification')=='CREDENTIAL_FREE_APPROVED_EXACT_ACTUAL_TOOL_CONFIG':config_approvals[(row['path'],row['sha256'])]=row
required_names={}
for jid,st in stages.items():required_names[jid]={o['name'][4:] if o['name'].startswith('out/') else o['name'] for o in st['required_outputs'] if o['state']=='PRESENT_PINNED_ARTIFACT'}
rows=[];selected=[];copies={};missing_contracts=[]
for jid,st in stages.items():
 for o in st['required_outputs']:
  if o['state']!='PRESENT_PINNED_ARTIFACT':missing_contracts.append({'job_id':jid,'current_selected':jid in current,'name':o['name'],'state':o['state'],'scope':'Required output status at original matrix cutoff; no new filesystem/scientific adjudication'})
for pid,pin in sorted(pins.items()):
 source=pathlib.Path(pin['path']);kindset={x['kind'] for x in uses.get(pid,[])};rel=source.as_posix();artifact_rel=rel.split('/frozen-output/',1)[-1] if '/frozen-output/' in rel else None
 row={'pin_ref':pid,'source_pin':pin,'uses':uses.get(pid,[]),'classification':'QUARANTINED_UNKNOWN_TYPE','reason':'No exact owner-approved safe source type; opaque pin retained, no copy or semantic inspection','staged':False}
 if pin['publication_state']=='VERIFIED_COMMIT':
  row.update(classification='EXISTING_VERIFIED_CONTENT_ALIAS',reason='Exact immutable036commit-object SHA alias; no inherited job/output/native/scientific credit')
 elif any(part in source.parts for part in ['.git','node_modules','vendor']) or '/native/' in rel or re.search(r'(?:^|/)(?:keys?|auth|credentials|sdk-home)(?:/|\.)',rel,re.I):
  row.update(classification='EXCLUDED_PRIVATE_RAW_NATIVE_VENDOR_FOREIGN',reason='Private/native mixed payload, protocol/modelIO/receipt/result, auth/key/vendor/nestedrepo boundary; metadata locator/SHA only, no pointer traversal')
 elif not source.is_file():row.update(classification='GENUINE_MISSING_AT_CURATION',reason='Source pinned in original matrix is absent; original matrix unchanged')
 elif not source.resolve().is_relative_to(LAB.resolve()):row.update(classification='EXCLUDED_FOREIGN_SOURCE_RESOLUTION',reason='Symlink resolves outside campaign LAB; no foreign/private source read or copy')
 elif artifact_rel and ('/captures/' in '/'+artifact_rel or artifact_rel.startswith('captures/') or source.suffix.lower() in ['.html','.pdf']):
  row.update(classification='EXTERNAL_RAW_PUBLIC_SOURCE_CAPTURE',reason='Raw publicsource capture body outsideGit; existing campaignLAB locator/SHA retained; NAS transfer locator UNKNOWN_NOT_PERFORMED_BY_THIS_TASK')
 elif 'actual_Task' in kindset:
  row.update(classification='ELIGIBLE_AUTHENTIC_ACTUAL_TASK',reason='Exact owner-authenticated stage.prompt_file/Task; preserve launched/prepared/current/history scope; opaque bytes, no reconstruction')
 elif 'actual_tool_config' in kindset:
  approval=config_approvals.get((pin['path'],pin['sha256']))
  if approval:row.update(classification='ELIGIBLE_CREDENTIAL_FREE_ACTUAL_TOOL_CONFIG',reason='Exact sourceowner credential-free type/field approval, matched sourceSHA; preserve actual runtime/version, no template substitution',owner_approval=approval)
  else:row.update(classification='QUARANTINED_TOOL_CONFIG_CREDENTIAL_STATUS_UNKNOWN',reason='No exact credential-free owner/source binding yet; .json presence not permission. Original opaque source pin retained; no secret values read/copied.')
 elif 'OPAQUE_AUTHORED_ARTIFACT' in kindset:
  # Type rules are narrow and source-owner authenticated, never inferred scientific correctness.
  authentic_uses=[u for u in uses[pid] if u['kind']=='OPAQUE_AUTHORED_ARTIFACT']
  isrequired=any(artifact_rel in required_names[u['job_id']] for u in authentic_uses)
  name=source.name.lower()
  canonical_authored=bool(re.match(r'^(proposal|leads|sources|witnesses|review|enrichment|revision|dependencies)(?:[._-].*)?\.(md|json)$',name)) or name in ['final_bundle.json','delivery_manifest.json']
  candidate_check=(artifact_rel and ('/checks/' in '/'+artifact_rel or '/tests/' in '/'+artifact_rel) and source.suffix=='.py')
  candidate_map=(name.endswith('.map') or name.endswith('.line_map') or bool(re.search(r'(?:line[_-]?map|linemap)',name))) and source.suffix.lower() in ['.map','.line_map','.json','.txt']
  if isrequired or canonical_authored or candidate_check or candidate_map:
   row.update(classification='ELIGIBLE_AUTHENTIC_CANDIDATE_OUTPUT_OR_WITNESS',reason='Owner-authenticated frozen candidate output; exact required artifact or declared proposal/catalog/review/amendment/source-check/map type. Opaque transfer, no correctness/nativecompletion inference.',required_output=isrequired,noncanonical_or_partial=not isrequired)
  elif source.suffix.lower() in ['.java']:
   row.update(classification='QUARANTINED_SOURCE_CODE_AUTHORSHIP_UNKNOWN',reason='Potential copied primary/foreign source code; no candidate-authorship type proof. Opaque locator/SHA retained outsideGit; no semantic read')
  else:row.update(classification='QUARANTINED_ARTIFACT_TYPE_OR_RAW_SOURCE_BOUNDARY_UNKNOWN',reason='Nonrequired artifact lacks exact candidate-authored versus rawsource-capture type proof; opaque locator/SHA retained, no semantic inspection')
 elif (pin['path'],pin['sha256']) in positive:
  row.update(classification='ELIGIBLE_EXACT_OWNER_POSITIVE_NEUTRAL_PROJECTION',reason='Exact courier/audit positive owner-selected safe metadata file; no recursivecopy permission',owner_selector=positive[(pin['path'],pin['sha256'])])
 elif 'actual_stage' in kindset:
  row.update(classification='SAFE_NEUTRAL_PROJECTION_ONLY_ORIGINAL_STAGE_QUARANTINED',reason='Full stage.json may mix private native configuration; owner forbids blanketexport. Credential-free original-inventory projection and exact original source pin retained instead; no prompt/tool/template substitution')
 elif 'output_freeze' in kindset:
  row.update(classification='SAFE_NEUTRAL_PROJECTION_ONLY_ORIGINAL_FREEZE_QUARANTINED',reason='Full outputfreeze receipt needs owner-safe field classification. Use existing original-inventory safe projection with exact freeze locator/SHA; no raw receipt/config/IO copy')
 if row['classification'].startswith('ELIGIBLE_'):
  observed,n=hashfile(source)
  if observed!=pin['sha256'] or n!=pin['bytes']:
   row.update(classification='QUARANTINED_SOURCE_PIN_OR_LENGTH_CHANGED',reason='Source bytes differ from original pinned matrix; no substitution or copy',observed_sha256=observed,observed_bytes=n)
  else:
   # Content-addressed staging preserves opaque bytes and links every source/job alias.
   dest=D/'assets'/pin['sha256']/'body'
   if pin['sha256'] not in copies:
    dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest);check,count=hashfile(dest)
    assert check==pin['sha256'] and count==pin['bytes']
    copies[pin['sha256']]={'path':str(dest),'relative_path':str(dest.relative_to(D)),'sha256':check,'bytes':count}
   row['staged']=True;row['staged_asset']=copies[pin['sha256']]
 rows.append(row)
# One consolidated neutral projection keeps private original stage/freezes outside the selected bytes.
projection_fields=['job_id','pair_id','source_slot','arm','stage','status','requested_family','requested_model','requested_effort','family','observed_family','created_utc','start_utc','ended_utc','elapsed_seconds','max_seconds','max_responses','stage_binding_scope','actual_stage','actual_Task','actual_tool_config','output_freeze','required_outputs','input_freeze_pins','opaque_authored_artifact_inventory','runtime_and_tool_source_refs','Goal_proof_scope','direct_native_goal_status_scope','scientific_grade','cost_scope','physical_provider','billing_account']
projections=[{'current_selected':jid in current,'lineage_strata':strata.get(jid,[]),'fields':{k:st[k] for k in projection_fields if k in st}} for jid,st in stages.items()]
(D/'SAFE_STAGE_FREEZE_PROJECTIONS.json').write_text(json.dumps({'schema':'er9.curation-safe-stage-freeze-projection.v1','source_inventory_pin':sources[0],'pin_table':pins,'rows':projections,'qualifications':'Original full mixed stage/receipt schemas remain opaque excluded or quarantined. Safe copied inventory fields do not reconstruct/redact/substitute original executable native config; reproducibility boundary is disclosed.'},separators=(',',':'),sort_keys=True)+'\n')
manifest={'schema':'er9.publication-curation.v1','actual_start_utc':START,'capture_end_utc':now(),'inclusive_deadline_utc':DEADLINE,'clock_reset':False,'source_selection_cutoff_preserved':inv['selected_lineage_cutoff'],'source_matrix_capture_preserved':inv['capture_end_utc'],'source_inventory_immutable':True,'campaign_finished':False,'new_native_or_logical_or_scientific_credit':0,'scientific_body_semantic_inspection':False,'classification_rules_owner_pin':sources[2],'source_metadata_pins':sources,'counts':dict(collections.Counter(r['classification'] for r in rows)),'unique_pin_rows':len(rows),'unique_staged_content_assets':len(copies),'staged_content_bytes':sum(x['bytes'] for x in copies.values()),'rows':rows,'genuine_required_missing_unentered_blocked_contracts':missing_contracts,'safe_projections':'SAFE_STAGE_FREEZE_PROJECTIONS.json','source_boundary':'Rawpubliccapture/foreigncode bodies stay outsideGit at exact source locator/SHA; privateauth/nativeprotocol/result/ModelIO/key bodies never staged; unknown types quarantine, not falsely missing. Full stage/freeze private mixtures have safe metadata projections plus original opaque pins. Existing verified content aliases preserve distinct lineage.'}
(D/'CURATION_MANIFEST.json').write_text(json.dumps(manifest,separators=(',',':'),sort_keys=True)+'\n')
(D/'QUARANTINE_AND_EXTERNAL_REFS.json').write_text(json.dumps({'schema':'er9.curation-exclusions-and-gaps.v1','rows':[r for r in rows if not r['staged'] and r['classification']!='EXISTING_VERIFIED_CONTENT_ALIAS'],'not_body_export_permission':True},indent=2,sort_keys=True)+'\n')
(D/'STAGED_ASSETS.json').write_text(json.dumps({'schema':'er9.curation-staged-opaque-assets.v1','files':list(copies.values()),'source_lineages_preserved_in':'CURATION_MANIFEST.json','not_scientific_grade_or_goal_credit':True},indent=2,sort_keys=True)+'\n')
(D/'README.md').write_text('# Publication curation\n\nExact pinned candidate Tasks, authenticated outputs, and explicitly approved credential-free tools are transferred as opaque content-addressed bytes. Every copy is SHA/length verified. The manifest retains current, historical, prepared, warm, and donor lineage separately. Asset counts are file counts, not Goals or logical arms.\n\nRaw publicsource captures remain outside Git at exact locators and SHA. Private native result/protocol/ModelIO/auth/key bodies are excluded. Unknown credential or authorship types are quarantined with exact reasons. Full mixed coordinator stage and outputfreeze schemas use labeled safe inventory projections and original opaque source pins; those projections do not reconstruct original private runtime configuration.\n\nThe earlier inventory boundary incident and lost drafts remain disclosed in the immutable inventory. This pass makes no scientific grade, native completion, or campaign completion claim.\n')
print(json.dumps({'counts':manifest['counts'],'staged_assets':len(copies),'bytes':manifest['staged_content_bytes'],'capture_end_utc':manifest['capture_end_utc']}))
