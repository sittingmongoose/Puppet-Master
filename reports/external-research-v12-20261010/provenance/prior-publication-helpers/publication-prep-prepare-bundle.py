from pathlib import Path
import json, hashlib, re, datetime, shutil, ast
R=Path('ER12_RUNTIME')
P=R/'publication-prep'
REPO=Path('ER12_RUNTIME/repository')
B=REPO/'reports/external-research-v12-20261010'
B.mkdir(parents=True,exist_ok=True)
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
sha=lambda b:hashlib.sha256(b).hexdigest()
cpbytes=(R/'root-checkpoint.json').read_bytes(); cp=json.loads(cpbytes)
(P/'private').mkdir(exist_ok=True)
(P/'private/root-checkpoint.snapshot.json').write_bytes(cpbytes)
manifest=[]
email_re=re.compile(r'[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}')
public_email='42017982+sittingmongoose@users.noreply.github.com'
# Replacements are textual only; original inputs and execution remain untouched.
def clean(s):
 s=s.replace('AUTHORIZED_PROVIDER_INSTANCE','AUTHORIZED_PROVIDER_INSTANCE')
 s=s.replace(str(R),'ER12_RUNTIME').replace(str(REPO),'ER12_RUNTIME/repository')
 s=email_re.sub(lambda m: m.group() if m.group()==public_email else 'PRIVATE_EMAIL_REDACTED',s)
 s=re.sub(r'/(?:home|Users|mnt|Volumes)/[^\s\"\'<>`),;\]}]+','ER12_RUNTIME',s)
 return s

def write(rel,text):
 path=B/rel;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(clean(text))
def jwrite(rel,obj): write(rel,json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def copy(rel):
 src=R/rel; raw=src.read_bytes(); text=raw.decode('utf-8'); sanitized=clean(text).encode()
 dst=B/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(sanitized)
 private=P/'private/originals'/rel;private.parent.mkdir(parents=True,exist_ok=True);private.write_bytes(raw)
 manifest.append({'source_locator':'ER12_RUNTIME/'+rel,'public_path':rel,'original_sha256':sha(raw),'sanitized_sha256':sha(sanitized),'original_bytes':len(raw),'sanitized_bytes':len(sanitized),'byte_identical':raw==sanitized})

for f in ['packet/ER12_T3_EXECUTE_HANDOFF.md','packet/START_PROMPT.txt','packet/README.md','packet/EXPERIMENT_QUEUE.json','packet/PACKET_VALIDATION.json','mechanics/PUBLIC_IDENTITY.json','mechanics/READY_VERSION.json','mechanics/SOURCE_MANIFEST.json','mechanics/REQUEST_PREPARATION.md','mechanics/ER12_V1.diff','helpers/er12-screen-v1/VERSION.json','helpers/role-v1/VERSION.json','helpers/role-v1/VERSION_NOTE.md','helpers/role-v1/CHECKS.json','helpers/role-v1/prepare-role.py','helpers/role-v1/check-role.py','assessment/RUBRIC-v1.md','assessment/RUBRIC_FREEZE.json']:
 copy(f)
# Include baseline code/configuration, not ER11 historical scores or authored outputs.
for d in ['helpers/er11','helpers/er12-v1']:
 for p in sorted((R/d).iterdir()):
  if p.is_file() and (p.name in ['prepare.py','reveal.py','bootstrap.js'] or p.name.startswith('config.')): copy(str(p.relative_to(R)))
selected=[('B-DISC-M-01','treatment','discovery.md'),('B-APPL-G-01','control','verification.md')]
selected_tasks=[]; assessments=[]; checks=[]
for slot,arm,out in selected:
 task=next(x for x in cp['candidateTasks'] if x['slot']==slot and x['arm']==arm and x['stage']=='role')
 assert task['status']=='completed' and task.get('hasPendingChildRuns') is False
 selected_tasks.append(task)
 stage=f'runs/{slot}/{arm}/stages/role'
 # ONLY full outputs and records of these completed two arms.
 for p in sorted((R/stage).rglob('*')):
  if p.is_file(): copy(str(p.relative_to(R)))
 for p in sorted((R/'frozen-inputs'/slot).rglob('*')):
  if p.is_file(): copy(str(p.relative_to(R)))
 freeze=json.loads((R/stage/'terminal-science-freeze.json').read_text())
 for row in freeze['files']:
  path=Path(row['path']);raw=path.read_bytes()
  checks.append({'path':'ER12_RUNTIME/'+str(path.relative_to(R)),'terminal_original_hash_matches':sha(raw)==row['sha256'],'terminal_original_bytes_match':len(raw)==row['bytes']})
 ev=next((x for x in cp.get('evaluationTasks',[]) if x.get('slot')==slot and x.get('arm')==arm),None)
 confirmed=bool(ev and ev.get('status')=='completed' and ev.get('hasPendingChildRuns') is False and ev.get('latestTerminalStatus')=='completed')
 assessrel=f'assessment/{slot}/{arm}-v1'
 files=[]
 if confirmed:
  # Compact authored assessment only; no raw evidence pages or transcripts.
  for p in sorted((R/assessrel).glob('*')):
   if p.is_file() and p.suffix in ['.md','.json']:
    copy(str(p.relative_to(R)));files.append(str(p.relative_to(R)))
 state='completion confirmed; compact assessment files copied' if confirmed and files else 'independent assessment pending'
 assessments.append({'slot':slot,'arm':arm,'state':state,'checkpoint_T3_status':ev.get('status') if ev else 'UNKNOWN','checkpoint_latestTerminalStatus':ev.get('latestTerminalStatus') if ev else None,'checkpoint_hasPendingChildRuns':ev.get('hasPendingChildRuns') if ev else None,'copied_assessment_files':files,'source_pass':None,'scientific_inference_performed':False})
 jwrite(assessrel+'/PUBLICATION_STATUS.json',assessments[-1])

jwrite('provenance/selected-checkpoint.json',{'captured_at_utc':now,'checkpoint_updated_at':cp.get('updated_at'),'checkpoint_original_sha256':sha(cpbytes),'baseline':cp['baseline'],'candidateTasks':selected_tasks,'evaluation_completion_gate':assessments,'counts_scope':'All candidateTasks in root checkpoint; no other run outputs included','campaign_checkpoint_counts':{'attempted_candidate_tasks':len(cp['candidateTasks']),'completed_candidate_tasks':sum(x.get('status')=='completed' for x in cp['candidateTasks']),'completed_full_pipeline_arms':0,'attempted_independent_assessments':len(cp.get('evaluationTasks',[])),'T3_completed_independent_assessments':sum(x.get('status')=='completed' and x.get('hasPendingChildRuns') is False for x in cp.get('evaluationTasks',[]))}})
queue=json.loads((R/'packet/EXPERIMENT_QUEUE.json').read_text())
rows=[]
for s in queue['slots']:
 item={'slot_id':s['slot_id'],'track':s['track'],'contrast_id':s.get('contrast_id'),'prospective_case_id':s.get('prospective_case_id'),'control':s['control'],'treatment':s['treatment'],'whole_arm_seconds':s.get('whole_arm_seconds'),'occupied_arm_seconds':s.get('occupied_arm_seconds'),'allocation_status':'prospective original allocation; not a result','frozen_case_bundled':s['slot_id'] in {x[0] for x in selected}}
 if s['track']=='A': item['method_version']=s['treatment'].get('recipe');item['helper_binding']='helpers/er12-v1 (R0/A1/A3/A4/A5/A6); other method implementation not included or qualified by this publication task'
 elif s['track']=='B': item['method_version']='matched bounded role; frozen request role-v1 protocol';item['helper_binding']='original root-frozen wrappers/requests for selected arms; later helpers/role-v1 is not their execution launcher'
 else:item['method_version']=s['treatment'].get('recipe');item['helper_binding']='selection/lock prospective; no inferred recipe version or case freeze'
 rows.append(item)
jwrite('METHOD_CASE_VERSION_MAP.json',{'authority':'packet/EXPERIMENT_QUEUE.json and original frozen selected-arm requests; prospective map, no retroactive assignment','baseline_commit':cp['baseline'],'rows':rows})
jwrite('PORTABLE_INPUT_MAP.json',{'ER12_RUNTIME':'Caller-selected absolute directory outside the repository. Copy bundled frozen-inputs/, helpers/, and selected runs/ preserving relative layout for inspection. Never reuse completed run roots for a fresh launch.','ER12_RUNTIME/repository':'Caller-selected repository checkout; repository paths are evidence locators only.','AUTHORIZED_PROVIDER_INSTANCE':'Private authorized Codex route supplied locally by root; this public placeholder is not callable. No account lookup or switch performed.','notation':'Literal ER12_RUNTIME/... in sanitized JSON/code/prose is a portable locator, not automatic environment interpolation. Materialize locally in caller-owned copies and record all new bytes/hashes.','inputs':[{'slot':s,'common_assignment':f'ER12_RUNTIME/frozen-inputs/{s}/assignment.md','fixture':f'ER12_RUNTIME/frozen-inputs/{s}/fixture.json','stage':f'ER12_RUNTIME/runs/{s}/{a}/stages/role','request':f'runs/{s}/{a}/stages/role/request.json'} for s,a,_ in selected],'unbundled_dependencies':['role-v1 references the B-DISC-M-01/control original wrapper and freeze by original hash. Those other-arm records are outside this bundle. Do not bypass its exact-hash guard or infer that the sanitized helper is standalone runnable.','Other A/C/D fresh cases and mutable operational configs are not included. Baseline example configs are frozen examples, not executed configurations.']})
jwrite('validation/PUBLICATION_CHECKS.json',{'executed_at_utc':now,'executed':['selected completed T3 statuses checked in captured root checkpoint','full selected role files and compact sources copied, no scientific correction','original selected role file hashes checked against terminal-science-freeze','sanitized JSON parsing and Python AST parsing','public file privacy scan and explicit staging list generated'],'terminal_original_integrity':checks,'proposed_not_executed':['root substantive independent assessment review','root inspection and explicit staging/commit/push after substantive assessed cohort','future fresh-run local route/path materialization and live supported-tool check','scientific acceptance probes listed in authored outputs'],'not_claimed':['successful source assessment','native lifecycle independently verified from T3 task status','same-quality speedup','billing/resource qualification','complete campaign','byte-exact unsanitized replay from sanitized copies']})
assert all(x['terminal_original_hash_matches'] and x['terminal_original_bytes_match'] for x in checks)
write('INCIDENTS_AND_LIMITATIONS.md','''# Preserved incidents and limits

B-DISC-M-01/treatment source-map.json records an HTTP 404 for the everything.curl.dev resume URL, five successful primary pages and one failed fetch. The complete original answer, all five excerpts, and source map remain included without repairs. Its proposed discriminating probes were not executed.

B-APPL-G-01/control source-map.json records zero-line opens for Redis latency and replication pages; these are not evidence. Both acceptance checks remain proposed, with no Redis service observations or benchmark supplied. The p99 claim remains unverified. The source-map local-corpus UTC precedes the recorded request UTC; both original anchors are preserved, not corrected or reconciled into an invented timing result.

Both T3 terminal deliveries are confirmed in the captured checkpoint and terminal science freezes. Native completion is narrated in terminal summaries, but direct activation/completion tool receipts are absent from the selected role directories. Native lifecycle verification remains UNKNOWN here. Protocol validity and independent source assessment remain pending; T3 delivery alone establishes neither. The 900-second deadline and 300-second writing reserve are prospective wrapper requirements. File mtimes, preparation, dispatch, T3 harvest and narrated native durations have different meanings and must not be substituted for one another.

The later role-v1 freezer was saved after these original requests. Its setup checks are mechanical, not science, execution, or a retrospective native qualification. Sanitized helpers contain literal route/path placeholders and original hash guards; local rematerialization must be recorded as new bytes. No runner was created. Other-arm live state, raw transcripts, private account/profile state, large evidence corpora and caches are excluded.
''')
write('LAUNCH.md','''# Portable launch notes (instructions only; no dispatch performed)

Set ER12_RUNTIME to a caller-owned absolute directory outside canon, and restore the selected relative input layout from PORTABLE_INPUT_MAP.json. Resolve AUTHORIZED_PROVIDER_INSTANCE locally from the already authorized root route. These substitutions change bytes: keep original hashes as provenance and record materialized hashes separately. Existing selected run deadlines are historical and expired; never replay them as new starts or reset their clocks.

For a **fresh R0 pipeline**, use the existing helpers/er12-v1/config.R0.example.json, prepare.py, reveal.py and bootstrap.js. Make caller-owned copies, materialize route/path placeholders, provide a fresh frozen brief/plan, unique run ID, dedicated runtime root and prospectively fixed whole UTC deadline. Keep 1800/720/1080 budgets. At intended start:

```bash
python3 "$ER12_RUNTIME/helpers/er12-v1/prepare.py" prepare --config "$ER12_CONFIG" --stage investigator
```

Preparation starts the clock. Inspect the complete request and frozen input map. In a root-owned copy of existing bootstrap.js, set RECIPE_DIR, CONFIG and STAGE, then use supported T3 functions code mode (not Node). Root checks the live catalog and capacity and retains exact clientRequestId and returned IDs. Critic/reviser follow sequentially only after their actual predecessor T3 completion, zero pending runs and complete outputs. Capture actual native Goal receipts independently, save authored science before completion, and retain all failures. This publication task executed none of these operations.

For **bounded roles**, inspect the original selected assignment.md, input-map.json, freeze.json and request.json. They are the actual frozen configurations of the published executions, not new requests. The pipeline helper does not implement role mode. Later helpers/role-v1/prepare-role.py is an existing preparation/recording utility, not a dispatcher; it requires the original exact-hash control wrapper dependency excluded from this two-arm bundle. Use it only in the authorized private baseline layout where that dependency already exists, with its documented prepare --slot --arm --fixture --runtime-root --started-at-utc arguments. Do not patch the guard to make a sanitized public copy appear replayable. Preserve one 900-second origin including setup/queue/delivery and the 300-second writing reserve. Root performs any future supported dispatch separately. No new runner or cross-provider route qualification is supplied here.
''')
counts={'attempted':len(cp['candidateTasks']),'delivered':sum(x.get('status')=='completed' for x in cp['candidateTasks']),'assessed':sum(x.get('status')=='completed' and x.get('hasPendingChildRuns') is False for x in cp.get('evaluationTasks',[]))}
write('README.md',f'''# ER12 publication preparation — partial checkpoint

Saved {now}; root checkpoint updated {cp.get('updated_at')}. This is a mechanical publication bundle awaiting root inspection, not campaign completion. No Git staging, commit, push, dispatch, delegation, account action, source-answer correction or old ER11 regrading occurred.

At the captured root checkpoint: **{counts['attempted']} attempted candidate tasks / {counts['delivered']} T3-delivered candidate tasks / {counts['assessed']} T3-completed independent assessments**. These are task/arm-start observations, not complete pipeline counts or scientific passes. There are no completed full-pipeline arms recorded in this checkpoint. Planned allocation remains 40 comparison slots / 80 logical arms; those targets are not deliveries. This bundle includes **2 completed bounded-role deliveries**, and their independent assessment states are recorded under corresponding assessment paths. No pending assessment is inferred to pass.

Included outputs: [B-DISC-M-01 treatment discovery](runs/B-DISC-M-01/treatment/stages/role/discovery.md) and [B-APPL-G-01 control verification](runs/B-APPL-G-01/control/stages/role/verification.md), each with its full source map, compact source excerpts, exact frozen assignment/request/options, input map, terminal records and science freeze. The 2 selected arms are from different comparison slots and do not form a matched pair. No paired speed/quality result follows. Original model/effort/tier and scientific text are preserved apart from declared sanitation. Source URLs/version notes/locators, retrieval failures, unknowns and proposed checks remain as authored.

The sanitized packet handoff/start prompt and original prospective queue remain governing prospective instructions, not performed actions. METHOD_CASE_VERSION_MAP.json maps that allocation without inventing C selections or D locks. Existing baseline and versioned helper code/config examples are included; historical ER11 scores/outputs are not republished. The later role freezer is explicitly separate from the original executions. See LAUNCH.md for concise baseline instructions and PORTABLE_INPUT_MAP.json for dependencies and literal path mapping.

T3 delivery, actual native Goal lifecycle, protocol validity, independent source quality, resource/billing and timing eligibility are separate. Native completion is narrated; absent direct role receipts remain UNKNOWN. Original deadlines and all measurement anchors are retained without grading. See INCIDENTS_AND_LIMITATIONS.md and validation/PUBLICATION_CHECKS.json for executed versus proposed validation.

Public author identity: **Sittingmongoose**, **{public_email}**, from the supplied verified identity and included mechanics/PUBLIC_IDENTITY.json. No account lookup or Git identity mutation was performed.

SANITIZATION.md and SANITIZATION_MANIFEST.json document each original/sanitized hash pair. Original source bytes and exact execution remain private; sanitized copies cannot establish byte-exact unsanitized replay. SHA256SUMS verifies public deliverables, STAGING_FILES.txt is the explicit named file staging list for root (no staging performed), and PRIVACY_SCAN.json reports the actual scan. Root decides publication after substantive assessment; this preparer stops at bundle readiness.
''')
write('SANITIZATION.md','''# Sanitation and private custody

All copied text is UTF-8 and undergoes only declared textual substitutions: private account email to PRIVATE_EMAIL_REDACTED; private Codex provider routing identifier to AUTHORIZED_PROVIDER_INSTANCE; original absolute runtime prefix to ER12_RUNTIME; original worktree prefix to ER12_RUNTIME/repository; any remaining personal machine home/share absolute prefix to ER12_RUNTIME. Model, reasoning effort, service tier, options, substantive prompts, authored outputs, failures and source applicability are not edited. The verified public no-reply address is retained.

Every copied file has both original and sanitized SHA-256, byte lengths and byte-identical status in SANITIZATION_MANIFEST.json. Embedded hashes in original freezes/fixtures/version manifests retain their original-byte meaning; they do not attest relocated sanitized files. Consult the paired manifest for sanitized bytes. All original selected source bytes were preserved privately under ER12_RUNTIME/publication-prep/private/originals; exact execution records in original runtime paths were not modified. The checkpoint snapshot remains private; only a selected evidence projection and aggregate counts are public. The projection's sanitized hash is covered by SHA256SUMS; its source checkpoint hash is in provenance/selected-checkpoint.json.

No raw transcripts, provider internals, profile/account state, nested repositories/caches, large mutable corpora or other-arm authored outputs are bundled. Assessment copy is gated by T3 completion confirmed in the single captured root checkpoint; unfinished folders do not imply an assessment result. This is a preparation snapshot, with no watcher or polling loop. Portable names are declared locators, not executable substitutions. Reconstituting paths/routes requires caller-owned materialization with new hashes and permitted dependencies; no byte-exact unsanitized public replay is claimed.
''')
jwrite('SANITIZATION_MANIFEST.json',{'schema':'er12.publication-sanitation.v1','captured_at_utc':now,'transformations':['private email redacted','private Codex route placeholder','absolute runtime/worktree and personal machine path mappings'],'files':manifest})
# Actual checks of every public text file (not an imported helper's execution).
parse=[]
for p in sorted(B.rglob('*')):
 if not p.is_file(): continue
 if p.suffix=='.json':json.loads(p.read_text());parse.append(str(p.relative_to(B)))
 if p.suffix=='.py':ast.parse(p.read_text());parse.append(str(p.relative_to(B)))
# Avoid leaking the forbidden private strings into the report itself.
findings=[]
for p in sorted(B.rglob('*')):
 if not p.is_file():continue
 s=p.read_text()
 patterns=[('private_route',r'AUTHORIZED_PROVIDER_INSTANCE'),('private_absolute_path',r'/(?:home|Users|mnt|Volumes)/[^\s]+'),('unexpected_email',None),('secret_like',r'(?i)(?:ghp_|github_pat_|sk-[A-Za-z0-9]{20})')]
 for kind,pat in patterns:
  hits=[m.group() for m in email_re.finditer(s) if m.group()!=public_email] if pat is None else re.findall(pat,s)
  if hits:findings.append({'path':str(p.relative_to(B)),'kind':kind,'count':len(hits)})
 forbidden=[str(p.relative_to(B)) for p in B.rglob('*') if p.name in ['.git','__pycache__','node_modules'] or p.suffix in ['.log','.jsonl','.pyc']]
assert not findings and not forbidden,(findings,forbidden)
jwrite('PRIVACY_SCAN.json',{'schema':'er12.publication-privacy-scan.v1','executed_at_utc':now,'status':'PASS','scanned_files':len([p for p in B.rglob('*') if p.is_file()]),'checks':['private route identifier absent','personal-machine absolute path prefixes absent','only permitted verified public email remains','common token patterns absent','raw transcript/log/cache/nested-repo filename exclusions'],'findings':findings,'excluded_file_findings':forbidden,'JSON_and_Python_parse_checks':len(parse),'scope':'All public bundle files existing before this generated scan report; final file-list and hash-list receive a final privacy verification separately. Automated scan does not establish scientific validity.'})
# Lists name themselves; hashes exclude the self-referential checksum file.
files=sorted(str(p.relative_to(REPO)) for p in B.rglob('*') if p.is_file())
files.extend(['reports/external-research-v12-20261010/STAGING_FILES.txt','reports/external-research-v12-20261010/SHA256SUMS'])
write('STAGING_FILES.txt','\n'.join(sorted(set(files)))+'\n')
write('SHA256SUMS',''.join(f'{sha(p.read_bytes())}  {p.relative_to(B)}\n' for p in sorted(B.rglob('*')) if p.is_file() and p.name!='SHA256SUMS'))
private_manifest={'saved_at_utc':now,'checkpoint_sha256':sha(cpbytes),'public_bundle':str(B),'files':manifest,'writes':'Only allowed report path and runtime/publication-prep. No git mutation.'}
(P/'PRIVATE_ORIGINAL_MANIFEST.json').write_text(json.dumps(private_manifest,indent=2)+'\n')
print(json.dumps({'saved':str(B),'public_files':len([p for p in B.rglob('*') if p.is_file()]),'copied_files':len(manifest),'counts':counts,'assessment_status':assessments,'integrity_checks':len(checks),'privacy':'PASS'},indent=2))
