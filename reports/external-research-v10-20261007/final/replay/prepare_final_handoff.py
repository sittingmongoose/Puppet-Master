#!/usr/bin/env python3
"""Prepare Root synthesis, a metadata-only audit, and an explicit final copy list."""
from pathlib import Path
import hashlib,json,copy,datetime

R=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
W=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
H=R/'helpers/final-report'
OUT=H/'final-handoff-v1'
BASE=Path('reports/external-research-v10-20261007')

def sha(b):return hashlib.sha256(b).hexdigest()
def original(v):return v.get('structuredContent') or json.loads(next(c['text'] for c in v['content'] if c['type']=='text'))

def main():
 OUT.mkdir(exist_ok=False)
 def save(name,value):
  p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True)
  with p.open('x') as f:
   f.write(value if isinstance(value,str) else json.dumps(value,indent=2,ensure_ascii=False)+'\n')
  return p
 ledger=json.loads((H/'final-schema-map-v2/FINAL_LEDGER.json').read_bytes())
 flags=json.loads((H/'final-tables-v1/ASSESSMENT_FLAGS.json').read_bytes())
 sdkpath=next((R/'helpers/recorded-usage-final-root-v1').glob('observation-*.json'))
 sdk=json.loads(sdkpath.read_bytes());assert sdk['C02_comparison']['exact_match_count']==5
 audit_path=H/'FINAL_ACTUAL_OWNED_TREE_CAPTURE_V1.json';cap=json.loads(audit_path.read_bytes())
 audit={'schema':'ER10_PUBLIC_ACTUAL_OWNED_QUIET_METADATA_V1','raw_capture_sha256':sha(audit_path.read_bytes()),
        'actual_completed_at':cap['completed_at'],'full_project_pagination_completed':True,
        'page_count':len(cap['project_list_pages']),'foreign_project_thread_metadata_omitted':True,
        'owned_threads':[original(x['response'])['thread'] for x in cap['owned_thread_reads']],
        'direct_tasks':[],'historical_native_qualification_inferred':False}
 for row in cap['root_owned_task_status_reads']:
  v=original(row['response']);audit['direct_tasks'].append({k:v[k] for k in ['taskId','childThreadId','status','workState','hasPendingChildRuns']})
 assert len(audit['owned_threads'])==329 and len(audit['direct_tasks'])==46
 # Thread metadata contains no message bodies or source prose.
 save('ACTUAL_OWNED_QUIET_PUBLIC_METADATA.json',audit)
 conf=json.loads((R/'reviews/confirmation/COMPARISONS.json').read_bytes())['repeat_median_range_all_original_repetitions']
 table=['| Domain / arm (n=2) | Service seconds, median [range] | Occupied seconds, median [range] | Host/handoff seconds, median [range] |','| --- | ---: | ---: | ---: |']
 def stat(d,k):
  v=d[k];return f"{v['median']:.3f} [{v['min']:.3f}–{v['max']:.3f}]"
 for domain in ['A','B']:
  for arm in ['control','treatment']:
   d=conf[domain][arm];table.append(f"| {domain} / {arm} | {stat(d,'failure_inclusive_service_latency_seconds')} | {stat(d,'aggregate_stage_occupied_seconds')} | {stat(d,'host_and_between_stage_elapsed_seconds')} |")
 usage=['| Recorded role | Quiet sessions | Input | Cached input (subset) | Output | Reasoning output (subset) |','| --- | ---: | ---: | ---: | ---: | ---: |']
 for role in ['candidate','independent_source_review','operational_helper','coordination','unattributed']:
  d=sdk['category_totals'][role];f=d['field_sums'];usage.append('| '+role.replace('_',' ')+' | '+str(d['unique_session_count'])+' | '+' | '.join(f"{f[k]:,}" for k in ['input_tokens','cached_input_tokens','output_tokens','reasoning_output_tokens'])+' |')
 usage_text='The one final read-only observation inventoried 329 authorized T3 threads and 258 strongly bound Gmail native sessions. It measured 241 quiet sessions, with 204 stage/role/model groups; 71 other-provider inventories carry null SDK quantities. The live Root session, ambiguous telemetry and the missing exact rollout remain held. The five C02 session totals reproduced the earlier qualified observation exactly. This is a partial telemetry observation, including failed attempts; it is not a complete campaign or billing total.\n\n'+'\n'.join(usage)+'\n\nUnattributed quiet work is shown separately and is not assigned to a candidate or review. Candidate usage does not imply a quota saving; separate review/helper costs are substantial. Raw session transcripts and creator/account identifiers are excluded. See [the observation](usage/'+sdkpath.name+') and its exact authority manifest.'
 counts='Actual final metadata checks cover **329 descendant threads and 46 directly owned tasks**, all terminal/quiet and settled. The ledger has **40 CLOSED / 0 LIVE_HELD**, 80 arms, 226 physical frozen input files, and 4,663 mapping rules. Original terms and grade objects for the preceding 36 closed slots are unchanged. Of 1,120 critical arm cells, 673 are resolved and **447 remain UNKNOWN**.\n\nScientific judgments are available for 74 arms, including standalone diagnostics, with six unassessed arms. Explicit full-science coverage is true for 70 arms, false for seven and unknown for three. Explicit full declared primary-source coverage is true for 63, false for six and unknown for eleven. Both-arm flags are true for 32 full-science pairs and 29 full-primary pairs; these are coverage flags, not quality passes or comparatively qualified wins. Thirty-five slots have judgments for both arms. Different scope partitions, partial process histories and absent numeric defect counts remain separate.'
 cleanup='The essential private archive contains 297 unique fragments / 82,291 bytes, with 334 bound witness records; compressed archive size is 109,507 bytes. Every member was verified against its approved hash. It preserves selected conditions, not a source corpus or complete original-body reconstruction. [The verification receipt](retention/FINAL_PRIVATE_ARCHIVE_VERIFICATION_V1.json) records its exact identity.\n\nSafe compaction runs only after actual GitHub verification, the private archive check and the final queue audit. The executed cleanup receipt and exact residual-size inventory will be published in the final cleanup follow-up. Unqualified unique sources and this still-bound worktree are retained as explicit exceptions; cleanup is not yet claimed complete in this edition.'
 narrative=(H/'final_narrative_template.md').read_text().replace('{{FINAL_CLOSURE_COUNTS}}',counts).replace('{{CONFIRMATION_MEDIAN_RANGE_TABLE}}','\n'.join(table)).replace('{{SDK_USAGE_SECTION}}',usage_text).replace('{{CLEANUP_SECTION}}',cleanup)
 narrative=narrative.replace('The final D-M06-B diagnostic result is preserved in the exact table and case evidence.','Final D-M06-B both arms failed diagnostic full-science review: process receipts passed, while witness/oracle validity was partial and general conditioning/applicability claims failed. Its full cold delivery was 2,313.261142 s control and 2,171.055142 s treatment under the new 50-minute envelope, including the 160.852459 s seed-to-arm handoff.')
 assert '{{' not in narrative
 save('FINAL_RESULTS.md',narrative)
 save('FINAL_REPORT.md','# ER10 final report\n\nThe finite 40-slot campaign is closed, including honest failed and unassessed dispositions. No qualified quality-preserving twofold speedup or affordability improvement was established.\n\nStart with [the final synthesis](final/FINAL_RESULTS.md), [all 40 slots](final/tables/ALL_40_SLOTS.md), and [reproduction](final/REPRODUCE.md). The final cleanup follow-up records actual compaction and remaining exceptions. Earlier batch reports, judgments and failure histories remain immutable.\n')
 save('REPRODUCE.md','''# Reproduce the final evidence ledger

Run from the checked-out `reports/external-research-v10-20261007/final` directory, without network access:

```sh
python3 replay/apply_supplement.py final-replay --final-manifest bundle/FINAL_INPUT_IDENTITIES.json --final-field-map bundle/FINAL_FIELD_MAP.json --output replay/reproduced/FINAL_LEDGER.json
cmp replay/reproduced/FINAL_LEDGER.json FINAL_LEDGER.json
```

The unchanged mapper hashes every one of the 226 physical bundle inputs before reading any field. It validates the fixed 40/80 index, four exact future-case quiet bindings, and unchanged original grade terms/objects for the prior 36 slots. This replays metadata; it does not grade science or infer missing coverage from counts. The input manifest, field map, unresolved-cell export and build validation retain exact original paths, SHA-256 values and JSON pointers. All historical WORKING editions remain unchanged.

The [asset manifest](../FINAL_ASSET_MANIFEST.json) maps exact final artifacts to published paths and hashes. Late candidate tasks, input maps, scientific outputs, executed witnesses, retained failed runs, independent source checks and full reviews are in `late/`; prior exact paths are reused where unchanged. Earlier batches retain the anchors, targeted/integrated originals, confirmation locks and all 24 prebound confirmation input files. [The case locator index](CASE_EVIDENCE_INDEX.json) supplies the new or exact-existing paths.

SDK reproduction is limited to the frozen metadata observation and streaming-parser code. Raw provider rollouts and account identities are deliberately not published. The once-only capture, bounds, role joins, qualification and exclusions remain explicit; a GitHub-only reader cannot fabricate missing other-provider quantities or billing. No recapture or automatic watcher is part of this bundle.

Raw source bodies are identified by exact original URL/version/SHA/offset locators rather than publicly recopied. `retention/FIXED_SOURCE_RECONSTRUCTION_CATALOG.json` and `replay/reconstruct_fixed_sources.py` support only the 49 independently verified fixed-commit whole-body identities; use its dry-run first, then a NEW output directory if reconstruction is needed. Mutable documents, versioned-but-unqualified bodies, mismatched editions and unopened package members remain holds. The small private archive is metadata-located and separately verified; it reconstructs selected governing fragments, not whole sources. The original CISA/Slint transform limitations and the public Slint quote authorization remain unchanged. No new public source quotation is included.

Candidate witness programs can be inspected with their exact frozen input/receipt files. Their independent reviews distinguish valid process execution from witness correctness, oracle independence and applicability. Do not rerun a candidate to replace an original verdict. Static primary-source conclusions do not certify runtime behavior absent an executed fixture. Failure costs and prospective changes are retained rather than selecting the best version.
''')
 files=[]
 def add(p,target,role):
  p=Path(p);b=p.read_bytes();files.append({'source':str(p),'target':str(BASE/target),'sha256':sha(b),'bytes':len(b),'asset_role':role})
 for name in ['FINAL_RESULTS.md','REPRODUCE.md','ACTUAL_OWNED_QUIET_PUBLIC_METADATA.json']:add(OUT/name,'final/'+name,'ROOT_FINAL_SYNTHESIS_OR_METADATA')
 add(OUT/'FINAL_REPORT.md','FINAL_REPORT.md','ROOT_FINAL_ENTRY')
 for p in (H/'final-tables-v1').iterdir():
  if p.is_file():add(p,'final/tables/'+p.name,'EXACT_FINAL_TABLE')
 for name in ['FINAL_LEDGER.json','FINAL_UNRESOLVED_CRITICAL_MAPPINGS.json','FINAL_INPUT_VALIDATION.json']:add(H/'final-schema-map-v2'/name,'final/'+name,'EXACT_FINAL_REPLAY_RESULT')
 bundle=H/'final-metadata-preparation-v1';m=json.loads((bundle/'FINAL_INPUT_IDENTITIES.json').read_bytes())
 for name in ['FINAL_INPUT_IDENTITIES.json','FINAL_FIELD_MAP.json','FINAL_BUILD_VALIDATION.json']:add(bundle/name,'final/bundle/'+name,'FINAL_FROZEN_BUNDLE')
 for f in m['files']:add(bundle/f['bundle_path'],'final/bundle/'+f['bundle_path'],'EXACT_PHYSICAL_FROZEN_METADATA_INPUT')
 for name in ['apply_supplement.py','SUPPLEMENTAL_LEDGER.json']:add(H/'final-schema-map-v2'/name,'final/replay/'+name,'UNCHANGED_OFFLINE_MAPPER_OR_IMMUTABLE_BASE')
 for name in ['build_final_metadata.py','prepare_m06b_final_bindings.py','build_report_tables.py','validate_final_owned_quiet.py','prepare_case_task_registry.py','prepare_closed_lineage_bindings.py','pack_minimal_witnesses.py','prepare_essential_archive_config.py','reconstruct_fixed_sources.py','execute_verified_compaction.py','verify_publication.py','curate_final_assets.py','prepare_final_handoff.py']:add(H/name,'final/replay/'+name,'REPRODUCTION_CODE')
 for name in ['FINAL_ACTUAL_OWNED_TREE_QUIET_VALIDATION_V1.json','PREPARED_ORIGINAL_CASE_TASK_AUTHORITY_REGISTRY_V1.json','FINAL_ACTUAL_ROOT_CONFIGURATION_V1.json','FINAL_SDK_OBSERVATION_CONFIG_V1.json']:add(H/name,'final/'+name,'EXACT_ROOT_METADATA')
 for name in ['FINAL_PRIVATE_ARCHIVE_VERIFICATION_V1.json','FIXED_SOURCE_RECONSTRUCTION_CATALOG.json']:add(H/name,'final/retention/'+name,'RETENTION_METADATA_NO_SOURCE_BODY')
 for p in (R/'helpers/recorded-usage-final-root-v1').iterdir():
  if p.is_file():add(p,'final/usage/'+p.name,'EXACT_ROLE_SEPARATED_USAGE_METADATA')
 add(R/'helpers/recorded-usage-v2/reader.py','final/usage/reader-v2.py','UNCHANGED_USAGE_READER')
 add(R/'helpers/recorded-usage/reader.py','final/usage/reader-original.py','UNCHANGED_USAGE_READER')
 # Explicit late scientific scopes are closed; source bodies/native tickets are excluded.
 evidence=[];excluded=[]
 scopes=['jobs/D-M06-A','jobs/D-M06-B','jobs/D-M09-A','reviews/targeted-cohort2/D-M06-B-v3','reviews/targeted-cohort3/D-M09-A-v3']
 for rel in scopes:
  for p in sorted((R/rel).rglob('*')):
   if not p.is_file():continue
   relative=p.relative_to(R).as_posix();name=p.name.lower();parts=p.relative_to(R/rel).parts
   bad=('sources' in parts or 'source-cache' in parts or p.suffix.lower() in {'.html','.pdf','.cpp','.c','.rst','.pyc','.bin'} or '__pycache__' in parts or name.startswith(('integration-state','native_','passive-','raw-')) or name.endswith('_current_raw.json') or 'census' in name or 'catalog_receipt' in name)
   b=p.read_bytes()
   if bad:
    excluded.append({'original_path':str(p),'sha256':sha(b),'bytes':len(b),'reason':'Raw source, provider/native-state body, foreign census or disposable cache; not a scientific regrade or evidence absence.'});continue
   if p.suffix.lower() not in {'.json','.md','.txt','.py','.csv'}:raise ValueError('Unclassified late artifact '+str(p))
   existing=W/BASE/relative
   if existing.is_file() and existing.read_bytes()==b:target=relative
   else:target='final/late/'+relative
   add(p,target,'EXACT_CLOSED_CANDIDATE_REVIEW_TASK_CHECK_OR_FAILURE_ARTIFACT');evidence.append({'original_path':str(p),'published_path':target,'sha256':sha(b),'bytes':len(b)})
 for rel in ['helpers/targeted-cohort2/COMPARISONS-final-v3-corrected.json','helpers/targeted-cohort2/FINAL_OWNED_AUDIT.json','helpers/targeted-cohort2/GLM2_FINAL_RELEASE.json','reviews/targeted-cohort3/TRACK_COMPLETION.json','reviews/targeted-cohort3/COMPARISONS.json','state/final-M06-v3-conditional-missing-seed-active-diagnostic-authorization-v1.json']:
  add(R/rel,'final/late/'+rel,'EXACT_CLOSED_OWNER_SCOPE_HISTORY')
 save('CASE_EVIDENCE_INDEX.json',{'scope':'Exact late closed science/task/check/history locators; earlier batches unchanged.','entries':evidence,'excluded_raw_identity_records':excluded,'raw_bodies_republished':False})
 add(OUT/'CASE_EVIDENCE_INDEX.json','final/CASE_EVIDENCE_INDEX.json','LOCATOR_METADATA')
 cfg={'schema':'ER10_ROOT_FINAL_EXPLICIT_ASSET_CONFIG_V1','scientific_results_frozen':True,'checkout':str(W),'report_base':str(BASE),'files':files,'manifest_name':'FINAL_ASSET_MANIFEST.json','copy_receipt':str(H/'FINAL_ASSET_COPY_VALIDATION_V1.json'),'scope':'All 40 final finite dispositions, 80 arms, physical offline final metadata, immutable late science/check/review/failure evidence and one qualified partial usage observation. No canon adoption or qualified method win.','source_retention_limits':'No full raw source/API/PDF/code corpus, native tickets or session transcripts. Necessary original source conditions privately archived; only independently verified fixed whole-body alternatives reconstructible. Original source and process remainders unchanged.'}
 save('FINAL_ASSET_CONFIG_V1.json',cfg)
 print(json.dumps({'explicit_assets':len(files),'logical_bytes':sum(v['bytes'] for v in files),'late_evidence':len(evidence),'raw_exclusions':len(excluded)}))

if __name__=='__main__':main()
