from pathlib import Path
import json, hashlib, re, datetime, ast
R=Path('ER12_RUNTIME')
REPO=Path('ER12_RUNTIME/repository')
B=REPO/'reports/external-research-v12-20261010'
P=R/'mechanics/publication-cohort1'
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
sha=lambda b:hashlib.sha256(b).hexdigest()
email=re.compile(r'[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}')
public='AUTHORIZED_PROVIDER_INSTANCE'
def clean(s):
 s=s.replace('AUTHORIZED_PROVIDER_INSTANCE','AUTHORIZED_PROVIDER_INSTANCE')
 s=email.sub(lambda m:m.group() if m.group()==public else 'AUTHORIZED_PROVIDER_INSTANCE',s)
 s=s.replace(str(R),'ER12_RUNTIME').replace(str(REPO),'ER12_RUNTIME/repository')
 s=re.sub(r'/(?:home|Users|mnt|Volumes|tmp|var/tmp)/[^\s\"\'<>`),;\]}]+','ER12_RUNTIME',s)
 s=s.replace('AUTHORIZED_PROVIDER_INSTANCE','AUTHORIZED_PROVIDER_INSTANCE').replace('ER12_RUNTIME','ER12_RUNTIME').replace('ER12_RUNTIME/repository','ER12_RUNTIME/repository')
 return s
manifest={}
def write(rel,s):
 p=B/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(clean(s))
def jw(rel,j):write(rel,json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def copy(rel):
 raw=(R/rel).read_bytes();out=clean(raw.decode()).encode();p=B/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(out)
 manifest[rel]={'source_locator':'ER12_RUNTIME/'+rel,'public_path':rel,'original_sha256':sha(raw),'sanitized_sha256':sha(out),'original_bytes':len(raw),'sanitized_bytes':len(out),'byte_identical':raw==out,'operation':'declared sanitation only'}
# Recopy all previously selected originals: no scientific edits, no other arms.
old=json.loads((B/'SANITIZATION_MANIFEST.json').read_text())
for row in old['files']:copy(row['source_locator'].removeprefix('ER12_RUNTIME/'))
cpbytes=(R/'root-checkpoint.json').read_bytes();cp=json.loads(cpbytes)
(P/'root-checkpoint.snapshot.json').write_bytes(cpbytes)
selected=[('B-APPL-G-01','control','PASS_WITH_LIMITATIONS'),('B-DISC-M-01','treatment','FAIL')]
ct=[];et=[]
for slot,arm,grade in selected:
 t=next(x for x in cp['candidateTasks'] if x['slot']==slot and x['arm']==arm and x['stage']=='role')
 e=next(x for x in cp['evaluationTasks'] if x['slot']==slot and x['arm']==arm)
 for x in [t,e]:assert x['status']=='completed' and x.get('hasPendingChildRuns') is False and x.get('latestTerminalStatus')=='completed'
 ct.append(t);et.append(e)
 rel=f'assessment/{slot}/{arm}-v1'
 j=json.loads((R/rel/'assessment.json').read_text());assert j['source_judgment']==grade
 for name in ['assessment.md','assessment.json','source-map.json','reviewer-goal-receipt.json','root-review-request.json']:
  if (R/rel/name).exists():copy(rel+'/'+name)
 jw(rel+'/PUBLICATION_STATUS.json',{'captured_at_utc':now,'source_judgment':grade,'T3_status':'completed','latestTerminalStatus':'completed','hasPendingChildRuns':False,'authored_judgment':'assessment.md','root_review_request_present':(R/rel/'root-review-request.json').exists(),'original_judgment_preserved':True,'native_candidate_status':'UNKNOWN independently; see full judgment','scope':'independent bounded-role source judgment, not pipeline or campaign qualification'})
# Stable methods and helpers only; no synthetic run directories, caches or transcripts.
for p in sorted((R/'methods').rglob('*')):
 if p.is_file():copy(str(p.relative_to(R)))
for d in ['topology-v1','er12-A8-v1']:
 for name in ['VERSION.json','version.diff','README.md','bootstrap.js','prepare.py','test_mechanics.py','config.A2.example.json','config.A7.example.json','config.A8.example.json','evidence/mechanical-verification.json','evidence/READY.json']:
  if (R/'helpers'/d/name).exists():copy(f'helpers/{d}/{name}')
copy('mechanics/BRANCH_BASE_ALIGNMENT.json')
# Retain independent governing passages in compact extracts, with original numbered lines.
extracts=[]
rel='assessment/B-DISC-M-01/treatment-v1'
smap=json.loads((R/rel/'source-map.json').read_text())
copy(rel+'/primary-evidence/retrievals.json')
for src in smap['independent_retrievals']:
 p=Path(src['text_path']);raw=p.read_bytes();assert sha(raw)==src['text_sha256']
 lines=raw.decode().splitlines(keepends=True)
 ranges=[loc['text_lines'] for loc in src.get('locators',[]) if 'text_lines' in loc]
 if not ranges:ranges=[[1,len(lines)]]
 keep=sorted({i for lo,hi in ranges for i in range(lo,min(hi,len(lines))+1)})
 body=''.join(f'{i}: {lines[i-1]}' + ('' if lines[i-1].endswith('\n') else '\n') for i in keep)
 dst=rel+'/primary-evidence/'+src['source_id']+'-governing-excerpt.txt'
 write(dst,f"Source: {src['url']}\nOriginal normalized text SHA256: {sha(raw)}\nOriginal line numbers retained; gaps are omitted; original full response remains private.\n\n"+body)
 item={'source_locator':'ER12_RUNTIME/'+str(p.relative_to(R)),'public_path':dst,'original_sha256':sha(raw),'sanitized_sha256':sha((B/dst).read_bytes()),'original_bytes':len(raw),'sanitized_bytes':(B/dst).stat().st_size,'byte_identical':False,'operation':'numbered governing passage extraction then declared sanitation','line_ranges':ranges,'source_url':src['url']}
 manifest[dst]=item;extracts.append(item)
jw(rel+'/primary-evidence/EXCERPT_MAP.json',{'extraction':'Recorded assessor locator ranges, or complete normalized text where no line range was recorded. No new source research. Full HTML responses remain private.','files':extracts})
# Re-sanitize existing generated material before adding final projections.
for p in B.rglob('*'):
 if p.is_file() and str(p.relative_to(B)) not in manifest:p.write_text(clean(p.read_text()))
tasks=cp['candidateTasks'];arms={(t['slot'],t['arm']) for t in tasks}
counts={'planned_comparison_slots':40,'planned_logical_arms':80,'current_root_checkpoint_logical_arms':len(arms),'candidate_stage_tasks':len(tasks),'T3_completed_candidate_stage_tasks':sum(t['status']=='completed' for t in tasks),'T3_completed_bounded_role_deliveries':sum(t['status']=='completed' and t['stage']=='role' for t in tasks),'T3_completed_nonrole_stage_deliveries':sum(t['status']=='completed' and t['stage']!='role' for t in tasks),'completed_full_pipelines':0,'included_bounded_role_deliveries':2,'included_fully_terminal_independent_judgments':2,'root_checkpoint_terminal_assessments':sum(t['status']=='completed' and t.get('hasPendingChildRuns') is False for t in cp['evaluationTasks'])}
assert not any(t['stage']=='reviser' and t['status']=='completed' for t in tasks)
jw('provenance/selected-checkpoint.json',{'captured_at_utc':now,'checkpoint_updated_at':cp.get('updated_at'),'checkpoint_updated_at_utc':cp.get('updated_at_utc'),'checkpoint_original_sha256':sha(cpbytes),'baseline':cp['baseline'],'candidateTasks':ct,'evaluationTasks':et,'counts':counts,'counting_definition':'Unique (slot,arm) is one logical arm; each candidateTask is a stage task. Reviewer tasks are counted separately. A role delivery is not a full investigator/critic/reviser pipeline.'})
m=json.loads((B/'METHOD_CASE_VERSION_MAP.json').read_text())
for row in m['rows']:
 if row['track']=='A':
  cid=row.get('contrast_id','')
  row['helper_binding']='helpers/topology-v1' if row['slot_id'].startswith(('A2-','A7-')) else 'helpers/er12-A8-v1' if row['slot_id'].startswith('A8-') else 'helpers/er12-v1'
  if row['slot_id'].startswith('A8-'):row['method_freeze']='methods/A8/freeze.json'
m['selection_freeze']='methods/SELECTION_FREEZE.json';m['selection_rules']='methods/SELECTION-v1.md';jw('METHOD_CASE_VERSION_MAP.json',m)
inputmap=json.loads((B/'PORTABLE_INPUT_MAP.json').read_text());inputmap.pop('ER12_RUNTIME/repository',None)
inputmap['ER12_RUNTIME']='Caller-owned runtime directory. ER12_RUNTIME/repository identifies portable repository context; no original machine path is published.'
inputmap['frozen_methods']=['methods/A8/freeze.json','methods/SELECTION-v1.md','methods/SELECTION_FREEZE.json']
jw('PORTABLE_INPUT_MAP.json',inputmap)
write('README.md',f'''# ER12 finite publication snapshot — two independent judgments

Saved {now}; root checkpoint updated_at_utc {cp.get('updated_at_utc')} (legacy updated_at {cp.get('updated_at')} is retained separately). Allocation is finite: **40 comparison slots / 80 logical arms**. Current captured root checkpoint: **{len(arms)} logical arms / {len(tasks)} candidate stage tasks / {counts['T3_completed_candidate_stage_tasks']} T3-completed stage deliveries**. Of those deliveries, **{counts['T3_completed_bounded_role_deliveries']} are bounded roles and {counts['T3_completed_nonrole_stage_deliveries']} are investigator stages**. **0 completed full pipelines at this capture**. Reviewer tasks are separate; {counts['root_checkpoint_terminal_assessments']} are fully terminal. Counts and the exact checkpoint hash are in provenance/selected-checkpoint.json. No stage count is relabeled as a pipeline count.

This bundle includes two completed bounded-role deliveries and TWO fully terminal independent judgments:

- [B-APPL-G-01/control-v1: PASS_WITH_LIMITATIONS](assessment/B-APPL-G-01/control-v1/assessment.md).
- [B-DISC-M-01/treatment-v1: FAIL](assessment/B-DISC-M-01/treatment-v1/assessment.md). The original failure is preserved unchanged except sanitation; no repair or dispute adjudication is supplied.

Both full authored judgments, JSON companions and complete source maps are included. Full associated original candidate science, supplied frozen assignments/corpus/fixtures, source evidence, request/options, metadata and terminal science freezes remain included. These arms belong to different slots and are not a matched pair. No speed advantage, scientific campaign win, full-pipeline result or provider ranking is claimed. Historical scores do not establish a source pass.

T3 terminal delivery, actual native lifecycle, protocol compliance, independent source quality, time eligibility and billing remain separate. Candidate native telemetry and runtime compliance cannot be certified from T3 completion. Proposed service/transfer/crash tests remain unexecuted. Compact independent treatment governing passages retain original source line numbers; full HTML/text source locators and hashes remain in the authored source map. The control reviewer retained independent source summaries/locators and response hashes, but no standalone fetched response files exist in its permitted directory; none are invented. Exact root-review-request.json is included if present; neither selected assessment directory contains one at capture.

Frozen methods/A8, SELECTION-v1 and SELECTION_FREEZE, baseline helpers, stable topology-v1 and er12-A8-v1 version/diff/config/bootstrap/prepare/docs and recorded mechanical checks are included. Synthetic runtime scratch is excluded. Recorded helper checks are engineering checks, not new scientific execution or native runtime proof. BRANCH_BASE_ALIGNMENT.json records root's actual head at the exact ER11 pin 2ad4c32ce3e5fd3890095086823f472983d860e1.

Verified public identity is Sittingmongoose, {public}; mechanics/PUBLIC_IDENTITY.json retains supplied verification with match=true. No account operation was performed. SANITIZATION_MANIFEST.json maps original to public SHA-256. PORTABLE_DEPENDENCY_GRAPH.json distinguishes included, extracted and unavailable dependencies. Original embedded hashes retain their original-byte meaning. Public copies require caller-owned materialization and fresh hashes for replay; no byte-exact public runtime replay is claimed.

See SANITIZATION.md, PRIVACY_SCAN.json and validation/PUBLICATION_CHECKS.json for actual checks and limitations. STAGING_FILES.txt explicitly lists every bundle file. Root owns inspection, commit, push and readback; this is not a user approval step. No Git staging/commit/push, dispatch/delegation, science repair, account action or future C/D case content reads were performed by this publication task.
''')
write('SANITIZATION.md','''# Declared sanitation and custody

Before any public serialization, private email and operational provider identity both become AUTHORIZED_PROVIDER_INSTANCE. The verified public no-reply identity is retained. Absolute personal machine/runtime paths become ER12_RUNTIME (the report worktree becomes ER12_RUNTIME/repository). Scientific source URLs, sections, release tags, symbols and line locators remain unchanged. Prompts, options, science, findings and original source judgments undergo only these recorded textual substitutions.

SANITIZATION_MANIFEST.json records original and sanitized SHA-256, sizes, byte identity and operation for every copied artifact. Compact independent evidence is explicitly marked as numbered passage extraction with original line ranges; it is not misrepresented as a byte-identical copy. Original embedded freeze and source hashes attest original bytes, not sanitized relocation. SHA256SUMS covers every public file except itself. Generated projections have public hashes and checkpoint provenance rather than a fictitious original-byte identity.

Original sources remain untouched in private runtime custody. The exact finite root checkpoint is privately captured at ER12_RUNTIME/mechanics/publication-cohort1/root-checkpoint.snapshot.json. Raw provider transcripts, caches, profiles, operational account state, HTML response corpora and synthetic runtime scratch are excluded. No C/D case content was read. Portable dependency gaps are explicit; no standalone executable public replay is promised. Automated privacy checks are mechanical and do not certify science.
''')
write('INCIDENTS_AND_LIMITATIONS.md','''# Preserved limitations

The treatment original FAIL has two material source/applicability findings: an unsubstantiated receiver-persistent download-resume mechanism and omitted HTTP-date If-Range restrictions. Its original useful findings, uncertainty, 404 retrieval lead and proposed probes are preserved. No original answer or review was repaired. The control PASS_WITH_LIMITATIONS retains minor citation-locator and PTTL sampling precision limits, live-manual versus release-source distinction, failed retrieval leads and unmeasured service p99.

Candidate native lifecycle is independently UNKNOWN; T3 terminal status and narrated native completion are distinct observations. Full protocol compliance, inference/billing and exact occupancy/writing-reserve eligibility are not inferred from saved science, timestamps or self-report. Both reviews give fuller authored boundaries. No paired comparison, speed win, completed full pipeline or campaign success follows.

Control independent fetched response bodies were not retained in its permitted assessment directory; full assessor source summaries/locators/hashes are included. Treatment full fetched responses remain private; compact numbered passages are included and mapped to originals. Neither selected root-review-request exists at capture. Role helper's exact-hash other-arm wrapper dependency remains unbundled. Stable helper mechanical check records use synthetic inputs and do not establish real runtime qualification. Embedded original hashes require the original private bytes, not public relocated bytes. Public identity and branch alignment are supplied recorded evidence; no new account lookup was made.
''')
write('LAUNCH.md',(B/'LAUNCH.md').read_text()+'''\nStable topology-v1 and er12-A8-v1 are provided for inspection with VERSION.json, version.diff, frozen example configs, bootstrap.js, prepare.py, README.md and recorded mechanical checks. See their complete docs and methods/A8/freeze.json; no helper was executed here. SELECTION-v1 and SELECTION_FREEZE are prospective selection authority, not a historical-score pass or permission to inspect future cases. Resolve the dependency graph before any separately authorized fresh execution. Root owns publication and readback; no additional user approval is requested.\n''')
# Build a literal dependency graph from all selected JSON/text references, without opening absent dependencies.
nodes=[];edges=[]
for p in sorted(B.rglob('*')):
 if not p.is_file():continue
 rel=str(p.relative_to(B));nodes.append({'id':rel,'kind':'public_file'})
 for target in sorted(set(re.findall(r'ER12_RUNTIME/[^\s\"\'<>`),;\]}]+',p.read_text()))):
  dep=target.removeprefix('ER12_RUNTIME/').rstrip('.:')
  status='included' if (B/dep).is_file() else 'included_directory' if (B/dep).is_dir() else 'original_private_or_unbundled_locator'
  edges.append({'from':rel,'to':target,'availability':status,'original_hashes':'Original-byte meaning; consult sanitation manifest for public bytes'})
jw('PORTABLE_DEPENDENCY_GRAPH.json',{'schema':'er12-portable-dependency-graph-v1','nodes':nodes,'literal_runtime_reference_edges':edges,'notes':['Textual literal locator extraction; not a claim of executable dependency closure.','Role-v1 original other-arm exact-hash wrapper is intentionally unbundled.','Treatment source-map full raw response paths are private; EXCERPT_MAP gives public substitutes.','Control independently fetched raw response bodies are unavailable; only authored summaries/locators and original response hashes were retained.','No future C/D case contents inspected.']})
jw('SANITIZATION_MANIFEST.json',{'schema':'er12.publication-sanitation.v2','captured_at_utc':now,'transformations':['private email and operational provider identity to AUTHORIZED_PROVIDER_INSTANCE','absolute machine/runtime paths to ER12_RUNTIME','independent primary evidence extraction explicitly recorded; scientific URLs/line locators preserved'],'files':list(manifest.values())})
# All original copied byte mappings and terminal original science verified read-only.
checks=[]
for slot,arm,_ in selected:
 freeze=json.loads((R/f'runs/{slot}/{arm}/stages/role/terminal-science-freeze.json').read_text())
 # Original freeze structure is retained; recurse through path+hash records.
 def visit(x):
  if isinstance(x,dict):
   if 'path' in x and 'sha256' in x:
    p=Path(x['path']);p=p if p.is_absolute() else R/p
    if p.is_file():
     raw=p.read_bytes();ok=sha(raw)==x['sha256'];assert ok,p
     checks.append({'source_locator':clean(str(p)),'original_sha256_match':ok,'original_bytes_match':len(raw)==x.get('bytes',len(raw))})
   for v in x.values():visit(v)
  elif isinstance(x,list):
   for v in x:visit(v)
 visit(freeze)
for row in manifest.values():assert sha((B/row['public_path']).read_bytes())==row['sanitized_sha256']
assert checks and all(x['original_bytes_match'] for x in checks)
jw('validation/PUBLICATION_CHECKS.json',{'executed_at_utc':now,'status':'PASS','terminal_original_integrity':checks,'mapped_original_public_files':len(manifest),'selected_terminal_assessments_checked':2,'counts':counts,'executed':['Read-only original terminal science hash/size checks','Two completed latestTerminalStatus and zero pending child runs verified from one finite checkpoint','Original judgments verified and copied with sanitation only','Copied original/public SHA mappings verified','Independent evidence line-range extraction verified from original normalized text hashes','Complete bundle JSON and Python AST parse','Full-file final privacy and explicit inventory/checksum verification'],'not_executed':['New helper/runtime or science tests','New primary source retrieval or account lookup','Commit/push/readback owned by root'],'root_review_requests_present':0,'source_grades':['PASS_WITH_LIMITATIONS','FAIL'],'scientific_or_runtime_qualification_from_mechanical_checks':False})
# Self-referential records: checksum excludes itself; scan claims final all-file scan below.
jw('PRIVACY_SCAN.json',{'schema':'er12.publication-privacy-scan.v2','executed_at_utc':now,'status':'PASS','scope':'Every final public file, including this scan, staging list and checksum list; scan performed after serialization. Checksum excludes itself.','checks':['Private route/email absent; verified public no-reply only','Absolute personal machine/runtime prefixes absent','Secret-like tokens absent','No raw transcript/cache/profile/nested-repo/synthetic runtime scratch','Every JSON parses and every Python AST parses','All copied mappings and final checksum entries match','Explicit staging list exactly equals final public file inventory'],'findings':[]})
# Generate inventories once final report file set is known.
files=sorted({str(p.relative_to(B)) for p in B.rglob('*') if p.is_file()}|{'STAGING_FILES.txt','SHA256SUMS'})
write('STAGING_FILES.txt',''.join('reports/external-research-v12-20261010/'+x+'\n' for x in files))
scan=json.loads((B/'PRIVACY_SCAN.json').read_text());scan['scanned_files']=len(files);scan['JSON_parse_checks']=sum(x.endswith('.json') for x in files);scan['Python_AST_parse_checks']=sum(x.endswith('.py') for x in files);scan['checksum_entries']=len(files)-1;scan['sanitation_mapping_checks']=len(manifest);jw('PRIVACY_SCAN.json',scan)
write('SHA256SUMS',''.join(f'{sha((B/x).read_bytes())}  {x}\n' for x in files if x!='SHA256SUMS'))
for rel in files:
 p=B/rel;s=p.read_text()
 assert 'AUTHORIZED_PROVIDER_INSTANCE' not in s and 'AUTHORIZED_PROVIDER_INSTANCE' not in s
 assert not re.search(r'/(?:home|Users|mnt|Volumes|tmp|var/tmp)/',s),rel
 assert all(m.group()==public for m in email.finditer(s)),rel
 assert not re.search(r'(?i)(ghp_|github_pat_|sk-[A-Za-z0-9]{20})',s),rel
 assert not any(part in ['.git','__pycache__','node_modules','profile','cache','transcripts'] for part in p.parts),rel
 if p.suffix=='.json':json.loads(s)
 if p.suffix=='.py':ast.parse(s)
assert set((B/'STAGING_FILES.txt').read_text().splitlines())=={'reports/external-research-v12-20261010/'+x for x in files}
for line in (B/'SHA256SUMS').read_text().splitlines():
 h,rel=line.split('  ',1);assert sha((B/rel).read_bytes())==h
(P/'CHECKED_SNAPSHOT.json').write_text(json.dumps({'saved_at_utc':now,'counts':counts,'public_file_count':len(files),'manifest_sha256':sha((B/'SANITIZATION_MANIFEST.json').read_bytes()),'SHA256SUMS_sha256':sha((B/'SHA256SUMS').read_bytes()),'privacy_parse_hash_inventory':'PASS','original_science_checks':len(checks)},indent=2)+'\n')
print(json.dumps({'public_files':len(files),'original_mappings':len(manifest),'original_science_checks':len(checks),'counts':counts,'privacy_parse_hash_inventory':'PASS'},indent=2))
