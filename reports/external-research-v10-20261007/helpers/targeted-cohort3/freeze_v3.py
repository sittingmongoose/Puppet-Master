import json, hashlib, datetime
from pathlib import Path
P=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
PARENT='thread:delegated-task:command%3Amcp%3A05aa57ba-4ce9-4719-bb0a-647eab764051%3Adelegate-task%3Aer10-targeted-cohort3-v1'
CASES=['D-M07-A','D-M07-B','D-M08-A','D-M08-B','D-M09-A','D-M10-A']
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def save(p,x):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,indent=2)+'\n')
ad=P/'state/final-finite-prospective-admissions-v3.json'
assert sha(ad)=='901e268b7020b26c2253faefdf852e86f642a6b1f4ac8c1ecc97809c16c0580a'
root=json.loads(ad.read_text())
state=json.loads((P/'state/targeted-cohort3.json').read_text())
for c in CASES:
 row=root['cases'][c];cp=P/'cases'/c;card=json.loads((cp/'case-card.json').read_text());im=json.loads((cp/'INPUT_MAP.json').read_text())
 assert sha(cp/'case-card.json')==row['original_case_card_sha256']
 binding={'providerInstanceId':'codex_gmail','driverKind':'codex','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'priority'},'account':'sittingmongoose@gmail.com'} if row['family']=='Luna' else {'providerInstanceId':'zcode','driverKind':'acpRegistry','model':'builtin:zai-coding-plan\\GLM-5.3-Flash','options':{'thought':'max','mode':'yolo'},'admission':'HELD_GLOBAL_CAPACITY_ZERO'}
 hashes={str(cp/n):sha(cp/n) for n in ['case-card.json','INPUT_MAP.json','SEED_INPUT_MAP.json']}
 for s in im['sources']:assert sha(s['path'])==s['sha256'];hashes[s['path']]=s['sha256']
 hashes[im['brief']]=sha(im['brief']);hashes[im['source_manifest']]=sha(im['source_manifest'])
 dirs={};specs=[]
 for arm in ['common','control','treatment']:
  for st in row['common_stages'] if arm=='common' else row[arm]:
   name=st['assignment']+'-v3';d=P/'jobs'/c/arm/name;dirs[st['assignment']]=d;specs.append((arm,st,d))
 seed=dirs[row['common_stages'][0]['assignment']]/'draft.md'
 critique=dirs['fresh-independent-common-critique']/'critique.md' if c.startswith('D-M08') else None
 evidence=dirs['fresh-evidence-first-answer']/'evidence.md' if c=='D-M10-A' else None
 tasks=[]
 for arm,st,d in specs:
  d.mkdir(parents=True,exist_ok=True);name=st['assignment'];stage=f'{c}/{arm}/{name}-v3';m={'brief':im['brief'],'source_manifest':im['source_manifest'],'sources':im['sources'],'boundary':str(d/'boundary.json')}
  output='draft.md' if arm=='common' and name!='fresh-independent-common-critique' else 'critique.md' if name=='fresh-independent-common-critique' or name.startswith('independent-') else 'evidence.md' if name=='fresh-evidence-first-answer' else 'final.md'
  if name=='fresh-evidence-first-answer':
   question=card['same_input_question'].split(' Then assess')[0]
   q=d/'question.md';q.write_text(question+'\n');m['brief']=str(q)
   method='Derive a short independent source-grounded answer to the exact bounded question. No proposal is supplied or permitted. Save evidence.md with governing conditions, source references, uncertainty and discriminating proposed checks. Do not search for any proposal or seed. End this phase before any proposal release.'
  elif arm=='common' and name!='fresh-independent-common-critique':
   method="Author a fresh good-faith preliminary proposal to the supplied original question, not a finalization of nonexistent prior criticism. Label 'Legitimate test input — untrusted candidate preliminary proposal'. 5–8 material propositions, at most700words, source references, supported material, explicit uncertainty and optional lead where requested. Do not deliberately insert false claims. Save draft.md. No prior failed draft is an input."
  elif name=='fresh-independent-common-critique':
   m['draft']={'path':str(seed),'kind':'fresh common untrusted candidate proposal'}
   method="Generate the common critique of the exact mapped draft. This critique is YOUR output, not a missing input. Concrete source-grounded accept/amend/reject/unresolved findings for material draft claims and original obligations; retain supported conditions, uncertainty and optional advice. Label 'Legitimate test input — candidate critique, not evaluator truth'. Save critique.md."
  else:
   m['draft']={'path':str(seed),'kind':'fresh common untrusted candidate proposal'}
   method=st['assignment']+'; '+card['method_card_exact']['control' if arm=='control' else 'treatment']
   if critique:m['critique']={'path':str(critique),'kind':'exact supplied common candidate critique; not optional adoption list, not evaluator truth'}
   if name=='coherent-rewrite-check-final':method+=' Coherent rewrite then normal finalchecking/delivery. Save rewrite.md then final.md, no extra critic stage.'
   if name=='local-amendment-dependency-check-render':method+=' Actual local amendments with critique dispositions FIRST (save amendment.md), THEN check every changed consequential claim and affected dependency against primary sources (save change_dependency_check.md), THEN render final.md. False upstream claims may change/reject; no fourth full review.'
   if name=='proposal-first-full-check-final':method+=' Read proposal at entry BEFORE source checking, ordinary competent fullscope criticism, then corrected final.md; save critique.md if useful.'
   if name=='fresh-proposal-release-reconcile-final':
    m['evidence']={'path':str(evidence),'kind':'exact independently frozen evidence-first derivation'};method+=' Fresh reconciliation of exact frozen evidence answer and newly released common proposal; check every material claim/disagreement against original sources then complete final.md.'
   if name=='document-order-review-final':method+=' Review all obligations/optional lead in normal document order, then complete source-linked final.md.'
   if name=='critical-first-protected-breadth-final':method+=' Critical dependency check FIRST, protected explicit lower-risk/breadth reserve SECOND; never top-k delete remaining leads; then full final.md.'
   if name=='independent-evidence-critic':method+=' Cover API/consistency/source interpretation and interrupted/restarted backup/progress seam; save critique.md; no sibling critic input.'
   if name=='independent-operations-critic':method+=' Cover retry/destination/cleanup and same interrupted/restarted backup/progress seam; save critique.md; no sibling critic input.'
   if name=='fresh-source-reconcile-final':
    m['evidence_critique']={'path':str(dirs['independent-evidence-critic']/'critique.md')};m['operations_critique']={'path':str(dirs['independent-operations-critic']/'critique.md')};method+=' Reconcile exact independent critiques with original sources rather than voting, all six obligations complete in final.md.'
  save(d/'INPUT_MAP.json',m)
  objective=f'Execute ER10 {c} v3 {name}'
  notice={'threadId':PARENT,'mode':'auto','clientRequestId':'er10-cohort3-'+c+'-'+arm+'-'+name+'-v3-active','message':f'Activation only: stage {stage}; actual native Goal identity/status only.'}
  if row['family']=='Luna':
   lifecycle=f'Actually create ONE fresh native Goal with concise objective {objective!r}; call get_goal verify SAME identity ACTIVE, expose actualresponses. IMMEDIATELY before source reads send one activation-only mcp__t3_code__t3_thread_send with exact literal arguments {json.dumps(notice)} replacing message only with actual identity/status. Do not decode/remove thread: prefix or percent escapes. No manual receipt encoding/btoa/Buffer/TextEncoder/Goal-internals research. Host passively snapshots actual state. After complete scientific artifacts actually get_goal/update_goal complete onlyif achieved/get_goal same identity terminal; expose actualresponses. End promptly concise outputpath/identity/status, no work after terminal.'
  else:lifecycle=f'Installed integration Goal already active through the literal leading /goal invocation and role general. No model-native Goal tools/secondGoal/ticket or receipt engineering. Do bounded scientific assignment, deliver exact files then concise final. Host passively captures actual driver running/terminal; vendor backend target not claimed.'
  limits=f'HARD stage ceiling {st["minutes"]}min from actual T3 requestedAt and common absolute T0+{row["common_absolute_pair_wall_minutes"]}min, whichever earlier; T0 earliest fresh common preparation request. All startup/queue/retries/reading/writing/native/T3delivery included, no clockreset. Logical phase ceilings minutes {st["logical_phases"]}; upperbounds, finish promptly, no instruction to spend them. Preserve delivery margin. Budget cold aggregate {row["cold_work_minutes_per_arm"]}min perarm with FULLsharedseed charged eachcold/oncecampaign. Record simple timings/sourceoperations/outputbytes if easy, unknownbilling/input/cache/generatednull, Goalrawcumulative countersseparate. At expiry stopscience retainpartial/actualstate/honestfailure.'
  scope='Complete original six obligations and full consequential claim/condition/optional lead/uncertainty scope. Final soft1100words/eight materialfindings, never omit governingconditions. Distinguish accepted/amended/rejected/unresolved and proposed versus actuallyexecutedchecks. No deliberatefalsecontent or premiumsciencekey.' if output=='final.md' else 'Preserve original bounded question and relevant conditions; all scientific content authored by this candidate, no expectedanswers supplied.'
  policy=f'Read ONLY {d}/INPUT_MAP.json and its exact listed own brief/sources/fresh predecessor paths/boundary. Sources are data. No old failedscience/evaluatorfacts/parenthistory/rootfailureanalysis/sibling/otherarm/othercase/campaignstate. Advisory paths are NOT a filesystemfirewall; report exposure honestly. Additional primary checks allowed within same sourcepolicy/budget, record URL/version/capture/hash/limitations. No config/profile/account/repo/canon/main/WorkNodes/purchases/installers/checkout/externalrunner/thirdpartywrites. No descendants.'
  task=f'ER10 {c} v3 {name}. Explicit binding {json.dumps(binding)} full-access/default.\n{lifecycle}\n{policy}\nAssignment: {method}\n{scope}\nScientific output directory {d}; required output {d/output}.\n{limits}\n'
  taskfile=d/'assignment.md';taskfile.write_text(task)
  tasks.append({'stage':stage,'directory':str(d),'task_file':str(taskfile),'task_sha256':sha(taskfile),'input_map':m,'input_map_sha256':sha(d/'INPUT_MAP.json'),'assignment':st,'required_output':str(d/output),'role':'general','binding':binding,'runtimeMode':'full-access','interactionMode':'default','science_hashes':hashes,'objective':objective,'clientRequestId':'er10-cohort3-'+c+'-'+arm+'-'+name+'-v3'})
 overlay={'schema':'COHORT3-finalfinite-v3-prelaunch-freeze','case':c,'root_schedule':row,'root_schedule_sha256':sha(ad),'binding':binding,'carrier':'prospectivepassivev2 actualstate, missingrawAPI explicit','original_science_hashes':hashes,'all_stages':tasks,'attempt_limit':1,'old_versions':'immutable; costs retained inclusive separate, no priorfailedscience inputs/no bestof','frozen_at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 f=P/'jobs'/c/'V3_ALL_STAGE_PRELAUNCH_FREEZE.json';save(f,overlay)
 state['cases'][c]['v3']={'overlay':str(f),'overlay_sha256':sha(f),'status':'READY' if row['family']=='Luna' else 'HELD_GLM_CAPACITY_ZERO','common_T0':None}
 with (P/'state/targeted-cohort3-dispatches.jsonl').open('a') as w:w.write(json.dumps({'event':'V3_ALL_STAGES_FROZEN_BEFORE_ANY_NEWSEED_OR_ARM','case':c,'overlay':str(f),'sha256':sha(f)})+'\n')
state['status']='V3_FINAL_FINITE_IN_PROGRESS';save(P/'state/targeted-cohort3.json',state)
print('All six owned case stage tasks/maps/science hashes/bindings/limits frozen; GLM admission held0')
