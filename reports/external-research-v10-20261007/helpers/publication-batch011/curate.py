#!/usr/bin/env python3
"""Finite BATCH011 byte curator. Exact allowlists; no science, network or Git mutation."""
import hashlib,json,os,subprocess,sys,runpy
from pathlib import Path
from datetime import datetime,timezone
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
CFG=json.loads((HERE/'config.json').read_bytes())
R=Path(CFG['campaign_root']); C=Path(CFG['publication_checkout'])
PREFIX='reports/external-research-v10-20261007/'
S=HERE/'staging'/PREFIX
CUT=datetime.fromisoformat(CFG['cutoff']).timestamp()
RES=datetime.fromisoformat(CFG['deadline']).timestamp()-CFG['writing_reserve_seconds']
COMMIT=CFG['prior_verified_commit']
entries=[]; reads=[]; gaps=[]; excluded=[]; docs={}; checks=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def encoded(o):return (json.dumps(o,indent=2,ensure_ascii=False,allow_nan=False)+'\n').encode()
def check(name,value,detail=None):
 checks.append({'check':name,'passed':bool(value),'detail':detail})
 if not value:raise RuntimeError(name+': '+str(detail))
def put(rel,b):
 p=S/rel
 assert p.resolve().is_relative_to(HERE) and not p.exists(),str(p)
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
 return p

def read(rel,kind):
 assert datetime.now(timezone.utc).timestamp()<RES,'read reserve began'
 p=R/rel
 assert p.resolve().is_relative_to(R) and not p.is_symlink(),rel
 st=p.stat();assert st.st_mtime<=CUT,('postcut file',rel,st.st_mtime)
 b=p.read_bytes();assert p.stat().st_mtime_ns==st.st_mtime_ns,('changed during read',rel)
 reads.append({'original_path':str(p),'relative_path':rel,'bytes':len(b),'sha256':sha(b),'mtime_ns':st.st_mtime_ns,'role':kind})
 if p.suffix=='.json':
  try:docs[rel]=json.loads(b)
  except Exception as e:gaps.append({'path':rel,'kind':'ORIGINAL_MALFORMED_JSON_UNCHANGED','error':str(e)})
 return b

def git(args,input=None):
 return subprocess.run(['git','-C',str(C),*args],input=input,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
# Read-only local pinned object lookup. Never fetch, stage, checkout, commit or push.
tree={}
for line in git(['ls-tree','-r','-z',COMMIT,'--',PREFIX]).split(b'\0'):
 if not line:continue
 meta,path=line.split(b'\t',1);mode,kind,oid=meta.decode().split()
 tree[path.decode()]={'git_blob_sha1':oid,'mode':mode,'type':kind}
remote=json.loads(read('state/publication-batch010-remote-tree-v1.json','ROOT_SUPPLIED_PRIOR_GITHUB_TREE_IDENTITY_RECEIPT'))
remote_blobs={PREFIX+x['path']:x for x in remote['tree'] if x['type']=='blob'}
check('prior_root_remote_tree_not_truncated',remote['truncated'] is False)
check('local_pinned_tree_matches_root_remote_blob_identities',all(p in tree and tree[p]['git_blob_sha1']==v['sha'] for p,v in remote_blobs.items()),len(remote_blobs))
# Read only selected allowlisted originals. Preserve mutable-path collisions without overwrite.
def add(rel,kind,force_copy=False):
 b=read(rel,kind);target=rel;dest=PREFIX+target
 ident={'original_path':str(R/rel),'original_relative_path':rel,'sha256':sha(b),'bytes':len(b),'role':kind,'source_mtime_ns':reads[-1]['mtime_ns']}
 if dest in tree:
  prior=git(['cat-file','blob',COMMIT+':'+dest])
  psha=sha(prior);pbytes=len(prior)
  if psha==sha(b) and pbytes==len(b) and not force_copy:
   ident.update({'disposition':'PRIOR_PINNED_REFERENCE','publication_path':dest,'prior_commit':COMMIT,'git_blob_sha1':tree[dest]['git_blob_sha1'],'local_pinned_bytes_verified':True})
   entries.append(ident);return ident
  if psha!=sha(b) or force_copy:
   target='batch011-frozen-originals/'+rel
   ident['collision_original_target']=dest;ident['collision_prior_sha256']=psha
   ident['collision_prior_bytes']=pbytes
   ident['collision_reason']='Preserve exact current permitted original without overwriting earlier published bytes.'
 if (C/PREFIX/target).exists():
  target='batch011-frozen-originals/'+rel
 assert PREFIX+target not in tree and not (C/PREFIX/target).exists(),target
 put(target,b)
 ident.update({'disposition':'NEW_EXACT_COPY','publication_path':PREFIX+target})
 entries.append(ident);return ident

def derived(rel,obj,role='NEW_TRANCHE_ADMIN_METADATA'):
 b=encoded(obj) if not isinstance(obj,str) else obj.encode()
 put(rel,b);entries.append({'disposition':'NEW_DERIVED_METADATA','publication_path':PREFIX+rel,'sha256':sha(b),'bytes':len(b),'role':role})

case_files=['CASE_CARD.md','INPUT_MAP.json','PREDECESSOR.md','SEED_INPUT_MAP.json','case-card.json','inputs/brief.md','inputs/sources.json']
for f in case_files:add('cases/D-M07-B/'+f,'M07B_FROZEN_ORIGINAL_CASE_PROTOCOL')
for f in ['BINDING_CARRIER_OVERLAY.json','V3_ALL_STAGE_PRELAUNCH_FREEZE.json','V3_DIAGNOSTIC_REVIEW_EXCEPTION_GATE.json','V3_DIAGNOSTIC_SEED_CONTINUATION_GATE.json','V3_PAIR_FREEZE.json']:
 add('jobs/D-M07-B/'+f,'M07B_ORIGINAL_FREEZE_OR_FAILURE_GATE')
stages=['common/fresh-untrusted-seed-v3','control/document-order-review-final-v3','treatment/critical-first-protected-breadth-final-v3']
protocol=['INPUT_HASH_BINDING.json','INPUT_MAP.json','assignment.md','boundary.json','dispatch.json','dispatch_original_tool_response.json','dispatch_task.txt','exact_dispatch_request.json','freeze_disposition.json','native_terminal_receipt.json','quiet_task_receipt.json','saved_carrier_t3_freeze.json','settle_receipt.json','startup_event_gate_receipt.json','startup_nomination_pending_receipt.json','t3_terminal_clock_receipt.json']
science={stages[0]:['draft.md'],stages[1]:['review-notes.md','final.md'],stages[2]:['critical_check.md','source_log.md','reserve_check.md','final.md']}
for stage in stages:
 base='jobs/D-M07-B/'+stage
 for f in protocol:
  if (R/base/f).is_file():add(base+'/'+f,'M07B_COMPACT_ORIGINAL_PROTOCOL_LIFECYCLE')
 for f in science[stage]:add(base+'/'+f,'M07B_ORIGINAL_AUTHORED_SCIENTIFIC_OUTPUT')
 # Full raw native projections, activation tickets, catalog/account receipts and census are not publication imports.
 for p in sorted((R/base).iterdir()):
  if p.is_file() and p.name not in protocol+science[stage]:excluded.append({'path':str(p),'reason':'NOT_SELECTED_COMPACT_PROTOCOL; native ticket/raw projection/catalog/census/startup activity omitted; no body read'})
for j in ['J1','J2']:
 for f in ['INPUT_MAP.json','assignment.md','checks.json','dispatch.json','dispatch_original_tool_response.json','exact_dispatch_request.json','freeze_disposition.json','judgment.md','quiet_task_receipt.json','settle_receipt.json','t3_terminal_clock_receipt.json']:
  add('reviews/targeted-cohort3/D-M07-B-v3/'+j+'/'+f,'M07B_ORIGINAL_FIRST_FULL_REVIEW')
add('reviews/targeted-cohort3/D-M07-B-v3/PAIR_COMPARISON.json','M07B_ORIGINAL_DIAGNOSTIC_PAIR')

bundle='helpers/final-report/final-schema-map-v2'
manifest=json.loads(read(bundle+'/INPUT_IDENTITIES.json','DECLARED_FROZEN_REPORT_INPUT_MANIFEST'))
for row in manifest['files']:
 rel=bundle+'/'+row['bundle_path'];e=add(rel,'DECLARED_ORIGINAL_FROZEN_METADATA_INPUT',force_copy=True)
 check('frozen_input_identity_'+row['source'],e['sha256']==row['sha256'] and e['bytes']==row['bytes'])
check('frozen_report_inputs_191_and_13245406B',len(manifest['files'])==191 and sum(f['bytes'] for f in manifest['files'])==13245406)
art=json.loads(read(bundle+'/ARTIFACT_HASHES.json','DECLARED_REPORT_ARTIFACT_MANIFEST'))
for f in sorted({x['path'] for x in art['files']}|{'ARTIFACT_HASHES.json','task.txt','dispatch.json'}):
 add(bundle+'/'+f,'ORIGINAL_REPRODUCIBLE_REPORT_BUNDLE',force_copy=True)
for row in art['files']:
 e=next(e for e in entries if e.get('original_relative_path')==bundle+'/'+row['path'])
 check('report_artifact_identity_'+row['path'],e['sha256']==row['sha256'] and e['bytes']==row['bytes'])
ret_files=['config.json','task.txt','dispatch.json','GAP_OBJECTS.json','SELECTED_SUPPLEMENT.json','ORIGINAL_ASSERTION_COVERAGE.json','READ_IDENTITIES.json','PARSER_READ_IDENTITIES.json','OUTPUT_IDENTITIES.json','RESULT.json','SUMMARY.json','VALIDATION.json','README.md','index_supplement.py','validate_supplement.py','run-read-journal.jsonl']
for f in ret_files:add('helpers/retention-final-gap-v1/'+f,'RETENTION_ALLOWED_SOURCE_NEEDLE_FREE_METADATA_OR_GENERIC_CODE')
for f in ['pack_minimal_witnesses.py','prepare_compact_supplement.py','working-draft-v1/METHODS_DRAFT.md']:
 add('helpers/final-report/'+f,'ORIGINAL_GENERIC_RETENTION_CODE_OR_WORKING_DRAFT')
add('helpers/retention-root-witnesses-v2/COMPACT_SUPPLEMENT_PREVIEW.json','ROOT_VERIFIED_RETENTION_METADATA_ONLY')
state_files=['publication-batch010-local-commit-v1.json','publication-batch010-root-validated-copy-plan-v1.json','publication-batch010-root-copy-and-index-v1.json','publication-batch010-remote-tree-v1.json','publication-batch010-task-terminal-v1.json','publication-batch010.json','cleanup-publication-batch010-staging-prepared-v1.json','cleanup-publication-batch010-staging-v1.json','final-schema-map-root-reproduction-v2.json','retention-final-gap-root-identity-validation-v1.json','retention-final-gap-task-terminal-v1.json','final-schema-map-task-terminal-v1.json']
for f in state_files:
 if f!='publication-batch010-remote-tree-v1.json':add('state/'+f,'EXACT_ROOT_CLOSED_ADMIN_OR_MECHANICAL_RECEIPT')
# Do not reread huge supplied remote-tree receipt; retain exact already-read bytes using the allowlisted source identity.
rel='state/publication-batch010-remote-tree-v1.json';b=(R/rel).read_bytes();rr=next(x for x in reads if x['relative_path']==rel)
check('root_remote_receipt_unchanged_since_initial_read',sha(b)==rr['sha256'])
put(rel,b);entries.append({'disposition':'NEW_EXACT_COPY','publication_path':PREFIX+rel,'original_path':str(R/rel),'original_relative_path':rel,'sha256':rr['sha256'],'bytes':rr['bytes'],'role':'EXACT_ROOT_CLOSED_PRIOR_GITHUB_RECEIPT','source_mtime_ns':rr['mtime_ns']})
for f in ['config.json','task.txt','dispatch.json','curate.py']:
 b=(HERE/f).read_bytes();put('helpers/publication-batch011/'+f,b);entries.append({'disposition':'NEW_EXACT_COPY','publication_path':PREFIX+'helpers/publication-batch011/'+f,'original_path':str(HERE/f),'sha256':sha(b),'bytes':len(b),'role':'BATCH011_CURATOR_PROTOCOL_OR_CODE'})

# Collect only original source identity/locator metadata; do not open any source body.
raw=[]
safe_keys={'id','source_id','path','url','resolved_url','version','version_or_capture','capture_date_utc','sha256','bytes','total_lines','lines','read_lines','read_ranges','printed_ranges','first_capture_utc','capture_utc','status','kind'}
def collect(obj,source,pointer=''):
 if isinstance(obj,dict):
  if 'sha256' in obj and any(k in obj for k in ['url','resolved_url']) or obj.get('kind')=='public primary raw bytes':
   raw.append({'original_metadata_path':source,'original_pointer':pointer,'identity':{k:v for k,v in obj.items() if k in safe_keys},'body_opened_by_curator':False,'body_published':False,'declared_not_newly_rehashed':True})
  for k,v in obj.items():collect(v,source,pointer+'/'+str(k).replace('~','~0').replace('/','~1'))
 elif isinstance(obj,list):
  for i,v in enumerate(obj):collect(v,source,pointer+'/'+str(i))
for source in ['cases/D-M07-B/inputs/sources.json','reviews/targeted-cohort3/D-M07-B-v3/J1/checks.json','reviews/targeted-cohort3/D-M07-B-v3/J2/checks.json']:collect(docs[source],source)
derived('BATCH011_RAW_SOURCE_IDENTITIES.json',{'schema':'ER10_BATCH011_ORIGINAL_SOURCE_IDENTITY_METADATA_V1','source_bodies_read':0,'primary_bodies_published':0,'metadata_bindings':raw,'limits':'Original declarations and locators only. No hashes reconstruct original raw bodies; no fresh Source assessment or full extraction replay.'})

# Identity-check selected scientific authored bytes against original reviewer maps/freeze declarations.
byorig={e.get('original_path'):e for e in entries if e.get('original_path')}
for j in ['J1','J2']:
 m=docs['reviews/targeted-cohort3/D-M07-B-v3/'+j+'/INPUT_MAP.json']
 for p,h in m['scientific_hashes'].items():
  if '/inputs/sources/' in p:continue
  if p in byorig:check('M07B_review_bound_science_'+j+'_'+Path(p).name,byorig[p]['sha256']==h)
for stage in stages:
 f=docs['jobs/D-M07-B/'+stage+'/freeze_disposition.json']
 for name,v in f.get('scientific_files',{}).items():
  p=str(R/'jobs/D-M07-B'/stage/name)
  if p in byorig:check('M07B_stage_frozen_output_'+stage+'_'+name,byorig[p]['sha256']==v['sha256'] and byorig[p]['bytes']==v['bytes'])
for j in ['J1','J2']:
 f=docs['reviews/targeted-cohort3/D-M07-B-v3/'+j+'/freeze_disposition.json']
 for name,v in f['scientific_files'].items():
  p=str(R/'reviews/targeted-cohort3/D-M07-B-v3'/j/name)
  check('M07B_review_frozen_output_'+j+'_'+name,byorig[p]['sha256']==v['sha256'] and byorig[p]['bytes']==v['bytes'])

# Original public retention declarations and output identities only; private entries are deliberately unopened.
ret=docs['helpers/retention-final-gap-v1/RESULT.json']
check('retention_original_no_source_excerpts_declaration',ret['public_metadata_contains_source_body_excerpts'] is False)
check('retention_original_no_archive_deletion_or_regrade',ret['archive_created'] is False and ret['raw_source_deletion_authorized'] is False and ret['semantic_regrading'] is False)
preview=docs['helpers/retention-root-witnesses-v2/COMPACT_SUPPLEMENT_PREVIEW.json']
check('root_preview_counts_and_limits',preview['unique_fragments']==59 and preview['deduplicated_fragment_bytes']==40546 and preview['source_identities']==27 and preview['derived_equivalences_used']==13 and preview['additional_previously_located_ranges_materialized']==7 and preview['archive_created'] is False and preview['source_cleanup_authorized'] is False and preview['whole_assertion_or_science_quality_regraded'] is False and preview['private_fragments_publication_authorized'] is False)
# In-memory, path-relocated offline replay of unchanged authored code; no writes to original bundle.
report_entry=next(e for e in entries if e.get('original_relative_path')==bundle+'/apply_supplement.py')
BD=(S/Path(report_entry['publication_path']).relative_to(PREFIX)).parent
mod=runpy.run_path(str(BD/'apply_supplement.py'),run_name='batch011_offline_replay')
bb=mod['Bundle'](BD/'INPUT_IDENTITIES.json');fm=json.loads((BD/'SUPPLEMENTAL_FIELD_MAP.json').read_bytes())
ledger,unresolved=mod['replay'](bb,fm);validation=mod['validate'](bb,fm,ledger,unresolved)
replay_checks={f:encoded(o)==(BD/f).read_bytes() for f,o in [('SUPPLEMENTAL_LEDGER.json',ledger),('unresolved-critical-mappings.json',unresolved),('validation.json',validation)]}
check('unchanged_report_code_offline_relocated_byte_exact_replay',all(replay_checks.values()),replay_checks)
check('report_all_36_mechanical_checks_pass',validation['passed'] and len(validation['checks'])==36)
rootrep=docs['state/final-schema-map-root-reproduction-v2.json']
check('root_report_independent_replay_receipt',rootrep['status']=='PASS' and rootrep['meaningful_mechanical_checks']==36 and rootrep['ledger_unresolved_validation_all_byte_identical'] is True)
derived('BATCH011_REPRODUCTION.json',{'schema':'ER10_BATCH011_OFFLINE_REPORT_REPLAY_V1','status':'PASS','frozen_input_count':191,'frozen_input_bytes':13245406,'artifact_identities_checked':14,'mapping_entries':4640,'original_unknown_resolutions':22,'historical_snapshot':'WORKING_NOT_TERMINAL; 36 closed / 4 held','unknown_critical_arm_cells':523,'mechanical_checks':36,'byte_exact_outputs':replay_checks,'replay_style':'In-memory original Bundle/replay/validate functions; no original or staged artifact overwritten. All 191 declared inputs retained in full, not a thin manifest.','bundle_publication_directory':PREFIX+str(BD.relative_to(S)),'path_changes':'Bundle container relocated from original helper to public report tree; input bundle_path values and original absolute provenance paths are unchanged. Original capture scripts and retention helpers retain absolute campaign paths and were NOT executed.','source_body_reconstruction':False,'full_source_extraction_replay':False,'new_mapping_inference':False,'scientific_regrade':False,'root_independent_receipt':'state/final-schema-map-root-reproduction-v2.json'})

pair=docs['reviews/targeted-cohort3/D-M07-B-v3/PAIR_COMPARISON.json']
check('M07B_diagnostic_both_FAIL_no_method_comparison',pair['control']=='FullSourceFAIL' and pair['treatment']=='FullSourceFAIL' and pair['is_method_comparison'] is False)
derived('BATCH011_COMPARISON_TRANCHE.json',{'schema':'ER10_BATCH011_CLOSED_TRANCHE_V1','status':'WORKING','logical_owner_dispositions':37,'remaining_logical_owners':3,'logical_denominator':40,'denominator_limit':'Owner dispositions, stage attempts and arm records do not manufacture 40 method comparisons.','M07B_original_pair':{'publication_path':PREFIX+'reviews/targeted-cohort3/D-M07-B-v3/PAIR_COMPARISON.json','sha256':byorig[str(R/'reviews/targeted-cohort3/D-M07-B-v3/PAIR_COMPARISON.json')]['sha256'],'disposition':pair['disposition'],'control':pair['control'],'treatment':pair['treatment'],'is_method_comparison':False,'native_provenance_comparative_disposition':pair['native_provenance_comparative_disposition'],'original_economics':pair['economics']},'report_adapter_history':'36 closed/4 held, unchanged historical working edition; M07B separately published without patching old adapter or old grades.','timing_limit':'Shared seed 488.321; own arm 649.696/680.285; reviews 303.282/388.868 seconds retain original label boundaries. No new sum/ratio, enclosing/nested interval double-sum, twofold or billing/affordability inference.','general_winner':None,'new_SourcePASS':False,'campaign_complete':False,'cleanup_complete':False})
pub=docs['state/publication-batch010.json'];cleanup=docs['state/cleanup-publication-batch010-staging-v1.json']
check('root_prior_commit_and_157_blob_receipt',pub['commit']==COMMIT and pub['all_157_new_blobs_remote_git_identity_and_size_verified'] is True and len(pub['critical_exact_files'])==6)
check('root_B10_duplicate_cleanup_not_campaign_cleanup',cleanup['removed_files']==157 and cleanup['removed_logical_bytes']==38837167 and cleanup['campaign_cleanup_complete'] is False)
event=R/'state/root-orchestration-events.jsonl'
event_limit={'path':str(event),'read':False,'reason':'Not needed for compact tranche admin. Postcut mutable event file not imported.','mtime_ns':event.stat().st_mtime_ns if event.exists() else None}
derived('BATCH011_ADMIN_SUMMARY.json',{'schema':'ER10_BATCH011_DERIVED_CLOSED_TRANCHE_ADMIN_V1','cutoff':CFG['cutoff'],'current_state_basis':'User fixed closed-tranche declaration plus exact pre-cut Root receipts; no postcut checkpoint or live scientific imports.','prior_github':{'commit':COMMIT,'commit_url':'https://github.com/sittingmongoose/Puppet-Master/commit/'+COMMIT,'branch':pub['ref']['ref'],'root_verified_new_blob_count':157,'root_verified_selected_raw_http_body_count':6,'root_receipt':'state/publication-batch010.json','root_receipt_sha256':byorig[str(R/'state/publication-batch010.json')]['sha256'],'curator_fresh_remote_verification':False,'curator_local_pinned_blob_verification':True},'owned_B10_duplicate_cleanup_original_receipt':cleanup,'closed_helpers':{'report_root_reproduction':rootrep,'retention_root_identity_validation':'state/retention-final-gap-root-identity-validation-v1.json','retention_root_preview':{'derived_complete_visible_text_alternatives':13,'additional_located_ranges_materialized':7,'unique_fragments':59,'bytes':40546,'source_identities':27,'archive_created':False,'deletion_authorized':False,'whole_assertion_coverage_verified':False}},'event_log_limit':event_limit,'working_owner_dispositions':37,'remaining':3,'campaign_complete':False,'cleanup_complete':False})
limits={'live_science_excluded':['D-M09-A','D-M06-A','D-M06-B'],'native_goal_tickets_or_raw_projections_imported':False,'private_source_needles_or_fragments_opened':False,'primary_source_bodies_opened':False,'new_source_research':False,'new_mapping_inference':False,'scientific_grading_or_regrading':False,'network_remote_verification':False,'account_server_rollout_calls':False,'git_mutations':False,'checkout_created':False,'cleanup_performed':False,'archive_created':False,'watchers_or_polls':False,'own_goal_or_workers':False,'working_draft_original_four_remaining_text_preserved':True,'current_remaining_three_recorded_separately':True,'inherited_metadata_gaps_preserved':True,'report_historical_36_closed_4_held_preserved':True,'retention_221_identity_census_is_not_full_condition_verification':True,'retention_original_65535B_cap_and_history_unchanged':True,'raw_sources_not_deleted':True,'campaign_complete_claim':False,'cleanup_complete_claim':False}
derived('BATCH011_ABSENCES_AND_DEFERRALS.json',{'schema':'ER10_BATCH011_ABSENCES_LIMITS_V1','scope_limits':limits,'excluded_original_paths':excluded,'original_gaps':gaps,'source_remainder':'Original review scope, supported findings, partial/nonnative provenance limits and economics remain in exact original authored outputs/reviews. No semantic normalization or repair.','seed_ACTIVE':'Original missing/unobserved seed ACTIVE and missing raw API responses remain comparative HOLD; native terminal and quiet do not rescue activation.','reproduction_limits':['Raw source bodies and private fragments are identity/locator metadata only, not publicly reconstructible from hashes.','Retention validation scripts cannot perform parent-byte comparisons after parents are removed. No original parents were read or deleted.','Root preview preserves 13 complete normalized-visible-text alternatives, not full original parser/HTML extraction replay.','Seven helper cap HOLDs were materialized in the separately frozen Root preview; original helper history remains unchanged.','Thin metadata materializer unnecessary: every one of 191 frozen report input paths is physically included.','Old adapter, historic four-held templates and working draft are unchanged. No final promotion.','Inherited malformed JSON/stale hashes/authority-edition gaps from original bundle remain unchanged; no scientific byte repairs.']})
derived('INDEX_BATCH011.md',f'''# BATCH011 — finite closed publication tranche\n\nWORKING snapshot: **37 logical owner dispositions / 3 remaining**, over the immutable 40-slot index. Stage/attempt counts do not become method-comparison counts. No general winner, new SourcePASS, twofold, affordability, campaign-complete or cleanup-complete claim.\n\nThe [manifest](BATCH011_MANIFEST.json) binds every new staged byte and every locally checked prior reference at commit `{COMMIT}`. Its own bytes are outside its self-hash bound; the terminal Root handoff supplies its exact SHA-256.\n\n- [M07B original diagnostic pair](reviews/targeted-cohort3/D-M07-B-v3/PAIR_COMPARISON.json): FullSourceFAIL / FullSourceFAIL; missing seed ACTIVE remains comparative HOLD. Original tasks, authored intermediates/finals, first full judgments/checks, freeze/quiet/settlement receipts are retained without editing scientific bytes.\n- [Report reproduction](BATCH011_REPRODUCTION.json): complete 191-input / 13,245,406-byte frozen metadata bundle; 14 artifact identities; 4,640 map entries; 22 prior unknown resolutions; 36 mechanical checks; three byte-exact replay outputs. The original **36 closed / 4 held** historical edition and 523 unknown critical arm cells remain intact. M07B does not patch that edition.\n- [Retention metadata](helpers/retention-final-gap-v1/README.md) and [Root preview](helpers/retention-root-witnesses-v2/COMPACT_SUPPLEMENT_PREVIEW.json): original 65,535-byte helper cap/history preserved; Root separately materialized seven located ranges plus 13 verified normalized-visible-text alternatives (59 unique / 40,546 bytes / 27 Source identities). No private fragment payload is public. A 221-object identity census does not verify 221 full conditions. Archive=false, deletion=false, whole-assertion coverage=false.\n- [Closed tranche admin](BATCH011_ADMIN_SUMMARY.json): Root's actual BATCH010 GitHub verification and owned duplicate cleanup; no fresh remote verification by this curator and no postcut checkpoint imports.\n- [Absences and limits](BATCH011_ABSENCES_AND_DEFERRALS.json), [raw Source identities](BATCH011_RAW_SOURCE_IDENTITIES.json), [verification](BATCH011_VERIFICATION.json).\n\n## Offline report replay\n\nRun the unchanged report `apply_supplement.py replay` and `validate` inside the published `helpers/final-report/final-schema-map-v2` bundle, with `PYTHONDONTWRITEBYTECODE=1`. All frozen bundle paths are physically retained. BATCH011 itself tested the original functions in memory to avoid overwriting outputs. Container relocation changes no original metadata bytes; absolute provenance strings are preserved. Capture scripts and retention materializers retain original campaign-specific paths and must not be used to reacquire live inputs.\n\nPrimary raw bodies and private witnesses were not opened or copied. Hashes/locators preserve original lineage, not body reconstruction or fresh scientific verification. The exact original working METHODS draft still says four remaining; this newer tranche records three separately. Existing malformed JSON, stale expected hashes and authority-edition gaps are preserved if inherited. Root alone owns commit/push, actual GitHub verification, cleanup and post-terminal settlement.\n''')
derived('BATCH011_CURATION_REPORT.json',{'schema':'ER10_BATCH011_FINITE_CURATION_REPORT_V1','status':'CURATED_LOCAL_PENDING_ROOT_PUBLICATION','fixed_config':CFG,'resolved_paths':{'actual_cwd':str(C),'global_agents':'/home/sittingmongoose/.codex/AGENTS.md','actual_cwd_agents':str(C/'AGENTS.md'),'campaign_root':str(R),'only_write_root':str(HERE),'staging':str(S)},'scope_limits':limits,'original_byte_edits':0,'report_inputs_full_materialized':191,'thin_manifest_used':False,'root_remote_receipt_cited_not_reperformed':True,'curation_read_identities':reads})
derived('BATCH011_VERIFICATION.json',{'schema':'ER10_BATCH011_MECHANICAL_VERIFICATION_V1','status':'PASS','checks':checks,'report_replay':replay_checks,'limits':limits,'mechanical_only':True,'scope_audit_basis':'Exact input allowlists and retained declared frozen report metadata manifest. No Source-body extraction, private fragment read, other live job recursion or raw projection import.'})
derived('BATCH011_VALIDATION.json',{'schema':'ER10_BATCH011_VALIDATION_CONTRACT_V1','status':'LOCAL_CHECKS_PASS_FINAL_MANIFEST_VALIDATOR_REQUIRED','checks_passed':len(checks),'checks_failed':0,'complete_report_bundle':True,'prior_pinned_refs_locally_verified':True,'no_unmanifested_rule':'Final validator compares every regular staged file against NEW manifest entries, with only BATCH011_MANIFEST.json outside the self-hash bound.','safety_and_scope_limits':limits})
derived('BATCH011_ROOT_HANDOFF.json',{'schema':'ER10_BATCH011_ROOT_HANDOFF_V1','status':'READY_FOR_ROOT_AFTER_FINAL_LOCAL_VALIDATION','staging_root':str(S),'manifest_path':PREFIX+'BATCH011_MANIFEST.json','manifest_selfhash_bound':False,'exact_manifest_sha256_and_totals':'Supplied in helper READY_FOR_ROOT.json and terminal result, outside manifest to avoid circular self-hash.','required_root_actions':['Independently validate exact manifest hashes/bytes/path and absence of unmanifested staged files.','Copy only manifest NEW entries; refuse target collisions. Preserve PRIOR_PINNED_REFERENCE commit identities.','Commit/push authorized research branch and perform actual remote verification.','Retain limits and historical snapshots; no regrade, new mapping, final promotion or campaign/cleanup-complete claim.','Settle this task after actual terminal; Root alone owns cleanup.'],'scope_limits':limits})
# Publish exact validator code as part of the final payload before closing the manifest.
validator=HERE/'validate.py'
if validator.exists():
 b=validator.read_bytes();put('helpers/publication-batch011/validate.py',b);entries.append({'disposition':'NEW_EXACT_COPY','publication_path':PREFIX+'helpers/publication-batch011/validate.py','original_path':str(validator),'sha256':sha(b),'bytes':len(b),'role':'FINITE_FINAL_MANIFEST_VALIDATOR'})
new=[e for e in entries if e['disposition'].startswith('NEW_')]
assert len({e['publication_path'] for e in entries})==len(entries)
assert sum(e['bytes'] for e in new)<CFG['max_staged_bytes']
m={'schema':'ER10_FINITE_BATCH011_MANIFEST_V1','status':'WORKING_CLOSED_TRANCHE_LOCAL_CURATED','cutoff':CFG['cutoff'],'prior_verified_commit':COMMIT,'publication_prefix':PREFIX,'entries':entries,'new_file_count_excluding_manifest':len(new),'new_bytes_excluding_manifest':sum(e['bytes'] for e in new),'prior_reference_count':len(entries)-len(new),'manifest_self':{'publication_path':PREFIX+'BATCH011_MANIFEST.json','included_as_owned_staged_file':True,'outside_self_hash_bound':True,'sha256_supplied_in_terminal_root_handoff':True},'scope_limits':limits,'max_staged_bytes':CFG['max_staged_bytes']}
put('BATCH011_MANIFEST.json',encoded(m))
print(json.dumps({'stage':str(S),'new_files_excluding_manifest':len(new),'new_bytes_excluding_manifest':m['new_bytes_excluding_manifest'],'prior_refs':m['prior_reference_count'],'checks':len(checks),'manifest_sha256':sha((S/'BATCH011_MANIFEST.json').read_bytes())}))
