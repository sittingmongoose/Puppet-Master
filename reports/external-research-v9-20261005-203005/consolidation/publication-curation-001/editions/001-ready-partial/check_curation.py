#!/usr/bin/env python3
import json,pathlib,hashlib,datetime,collections
D=pathlib.Path(__file__).parent;I=D.parent/'publication-inventory-001'
def digest(p):
 h=hashlib.sha256();n=0
 with pathlib.Path(p).open('rb') as f:
  for part in iter(lambda:f.read(1048576),b''):h.update(part);n+=len(part)
 return h.hexdigest(),n
raw=(D/'CURATION_MANIFEST.json').read_bytes();m=json.loads(raw);i=json.loads((I/'ARM_INVENTORY.json').read_bytes());a=json.loads((D/'STAGED_ASSETS.json').read_bytes());checks={};errors=[]
checks['original_matrix_immutable']=digest(I/'ARM_INVENTORY.json')[0]=='0ca13bd84503b1e138f5d9b0b22a677b30254abf6c38ad1fdb8d259ca3612cb5'
checks['all_original_pin_rows_exactly_accounted']=len(m['rows'])==len(i['pin_table']) and {r['pin_ref'] for r in m['rows']}==set(i['pin_table'])
checks['all_source_sha_and_length_pins_preserved']=all(r['source_pin']==i['pin_table'][r['pin_ref']] for r in m['rows'])
checks['explicit_type_reason_every_pin']=all(r.get('classification') and r.get('reason') for r in m['rows'])
checks['no_native_private_excluded_body_staged']=all(not r['staged'] for r in m['rows'] if '/native/' in r['source_pin']['path'] or r['classification'].startswith(('EXCLUDED_','EXTERNAL_','QUARANTINED_','SAFE_NEUTRAL_')))
checks['staged_rows_have_positive_typed_authority']=all(r['classification'].startswith('ELIGIBLE_') and r.get('staged_asset') for r in m['rows'] if r['staged'])
checks['nonrequired_outputs_need_exact_owner_type']=all(r.get('owner_approval',{}).get('classification')=='AUTHENTIC_CANDIDATE_AUTHORED_OUTPUT_WITNESS_OR_CHECK' for r in m['rows'] if r['classification']=='ELIGIBLE_AUTHENTIC_CANDIDATE_OUTPUT_OR_WITNESS' and not r.get('required_output'))
checks['toolconfigs_need_exact_credential_free_ownerproof']=all(r.get('owner_approval',{}).get('classification')=='CREDENTIAL_FREE_APPROVED_EXACT_ACTUAL_TOOL_CONFIG' for r in m['rows'] if r['classification']=='ELIGIBLE_CREDENTIAL_FREE_ACTUAL_TOOL_CONFIG')
checks['all_asset_paths_in_owned_new_directory']=all(pathlib.Path(f['path']).resolve().is_relative_to(D.resolve()) for f in a['files'])
checks['selected_content_index_unique']=len({f['sha256'] for f in a['files']})==len(a['files'])
for f in a['files']:
 h,n=digest(f['path'])
 if h!=f['sha256'] or n!=f['bytes']:errors.append({'path':f['path'],'expected_sha256':f['sha256'],'observed_sha256':h,'expected_bytes':f['bytes'],'observed_bytes':n})
checks['every_staging_copy_sha_length_exact']=not errors
checks['index_matches_manifest_staged_content']=set(f['sha256'] for f in a['files'])=={r['staged_asset']['sha256'] for r in m['rows'] if r['staged']}
checks['no_campaign_native_scientific_credit']=m['campaign_finished'] is False and m['new_native_or_logical_or_scientific_credit']==0
checks['original_selected_cutoffs_preserved']=m['source_selection_cutoff_preserved']==i['selected_lineage_cutoff'] and m['source_matrix_capture_preserved']==i['capture_end_utc']
source_changes=[]
for r in m['rows']:
 if not r['staged']:continue
 h,n=digest(r['source_pin']['path'])
 if h!=r['source_pin']['sha256'] or n!=r['source_pin']['bytes']:source_changes.append({'pin_ref':r['pin_ref'],'path':r['source_pin']['path'],'sha256_at_later_check':h,'bytes_at_later_check':n,'scope':'Stagedoriginalpinnedbytes remain immutable; later source change does not replace selected bytes'})
checks['staged_sources_still_match_pins_at_check']=not source_changes
out={'schema':'er9.curation-checks.v1','checked_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'curation_manifest_sha256':hashlib.sha256(raw).hexdigest(),'checks':checks,'deterministic_pass':all(checks.values()),'copy_errors':errors,'later_source_changes':source_changes,'counts':{'classified_pins':len(m['rows']),'eligible_staged_pin_rows':sum(r['staged'] for r in m['rows']),'unique_staged_content_assets':len(a['files']),'staged_bytes':sum(f['bytes'] for f in a['files']),'classes':dict(collections.Counter(r['classification'] for r in m['rows']))},'scope':'Cryptographiccopy/typeauthority/originalcutoff metadata only; no semanticreading/execution of transferred outputs, scientificgrade/nativeGoalproof/reproductionexperiment or campaigncompleteness claim.'}
(D/'CHECKS.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n');print(json.dumps({'pass':out['deterministic_pass'],'unique_assets':len(a['files']),'errors':len(errors),'later_source_changes':len(source_changes)}))
