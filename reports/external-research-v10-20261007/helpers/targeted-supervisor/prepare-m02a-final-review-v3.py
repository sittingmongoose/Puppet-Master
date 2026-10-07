import pathlib,json,hashlib,datetime,shutil,sys
R=pathlib.Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5');S=R/'state/targeted-cohort1.json';L=R/'state/targeted-cohort1-dispatches.jsonl'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(p,o):pathlib.Path(p).write_text(json.dumps(o,indent=2)+'\n')
case=sys.argv[1];s=json.loads(S.read_text());slot=next(x for x in s['slots'] if x['case_id']==case);assert case=='D-M02-A';assert slot['final_v3_execution']['review'] is None
assert all(t['status'] in ['completed','interrupted','failed','cancelled'] and t.get('settled') for a in slot['final_v3_execution']['arms'].values() for t in a['stages'])
gate=slot['final_v3_execution'].get('pair_quiet_gate_v2');assert gate and gate['all_tasks_quiet']
d=R/'reviews/targeted'/case/'source-review-v3';d.mkdir(parents=True,exist_ok=False);candidates=[]
for label,arm in [('X','control'),('Y','treatment')]:
 a=slot['final_v3_execution']['arms'][arm];bd=d/'frozen'/label;bd.mkdir(parents=True);items=[]
 for i,t in enumerate(a['stages']):
  p=pathlib.Path(t['output'])
  if p.is_file():
   q=bd/f'intermediate-{i+1}.md';shutil.copyfile(p,q);items.append({'path':str(q),'sha256':sha(q)})
 fp=a['stages'][-1].get('final');final=None
 if fp and pathlib.Path(fp).is_file():
  q=bd/'final.md';shutil.copyfile(fp,q);final={'path':str(q),'sha256':sha(q)}
 candidates.append({'label':label,'final':final,'method_required_intermediates':items,'artifact_scope_limit':'No complete scientific final delivered; assess existing artifacts diagnostically and mark all absent/unassessed final scope explicitly. No comparison win from absence.' if final is None else None})
write(d/'IDENTITY_MAP_PRIVATE.json',{'X':'control','Y':'treatment'})
pm={k:slot['input_map'][k] for k in ['brief','source_manifest','sources']};pm.update(candidates=candidates,writable_review_directory=str(d))
write(d/'REVIEW_INPUT_MAP.json',pm)
now=datetime.datetime.now(datetime.timezone.utc);deadline=(now+datetime.timedelta(minutes=20)).isoformat()
prompt=f'''Jared authorizes this fresh independent source/science assessment of frozen exact-case outputs. You are codex_gmail sittingmongoose@gmail.com / gpt-6.1-sol xhigh priority. No native Goal or Goal receipt engineering required. Both candidate arms' entire task trees are quiet/held; exact outputs frozen and no scored continuations queued. This temporal gate precedes all evaluator work. No candidate rescue, edits, feedback, or new candidates. Incomplete final (if mapped null) is a diagnostic artifact limitation, never source correctness/method-win proof; full review only where complete scientific artifact permits, missing scope explicitly UNASSESSED. Parent evaluates lifecycle separately.
New finite allowance20min includes all source checks, writing and delivery; preparation {now.isoformat()}, hard ceiling {deadline}; no clock reset. Save partials with explicit remaining unassessed scope if exhausted. No delegates. Independently assess each label against ALL declared brief obligations and EVERY consequential claim and condition in final and required intermediates. Check actual pinned primary bytes/sourceIDs/cited ranges, governing conditions, corrections/rejections, preservation, supported optional yield, uncertainty, proposed versus executed checks. Primary public browsing and bounded isolated counterexamples permitted; no installations, arbitrary installers, host credentials or unrelated filesystem scans. Candidate process-history claims stay unverified absent evidence.
Blind to winner, economics, target metrics, other grades, parent analysis and identity map. Visible method clues in output/intermediates limit blinding; disclose them. Do not read case cards/READY, supervisor state, lifecycle/timing files, identity maps, other reviews or other cases. Exact path map is advisory and does not establish filesystem confinement.
Write ONE compact complete REVIEW.json and readable review.md, with independent X/Y semantic conclusions, each obligation/claimgroup disposition and evidence, assessed/unassessed counts, exact reviewed hashes, actual executed checks versus proposals, source integrity, remaining uncertainty and blinding limits. Explicit scientific correctness status must be supported by full scope; no blanket PASS for partial review, no lifecycle/provenance inference and no winner/rank/cost inference. Use compact grouped claim tables, not huge repeated100KB catalogs; scientific scope unchanged. Record actual timing/checks, unknown usage null. Final concise paths/coverage/status.
Exact allowed map: {json.dumps(pm,indent=2)}'''
(d/'PROMPT.txt').write_text(prompt);req={'clientRequestId':f'er10-cohort1-{case}-source-review-v3','mode':'async','role':'review','runtimeMode':'full-access','interactionMode':'default','title':f'ER10 {case} full declared source review v3','target':{'providerInstanceId':'codex_gmail','driverKind':'codex','model':'gpt-6.1-sol','options':{'reasoningEffort':'xhigh','serviceTier':'priority'}},'task':prompt};write(d/'REQUEST.json',req)
slot['final_v3_execution']['review']={'clientRequestId':req['clientRequestId'],'directory':str(d),'request_path':str(d/'REQUEST.json'),'status':'dispatch_prepared','frozen_input_map':pm,'prepared_at':now.isoformat(),'deadline':deadline,'prompt_sha256':sha(d/'PROMPT.txt'),'target':req['target'],'gate':gate};write(S,s)
with L.open('a') as f:f.write(json.dumps({'type':'review_v2_prepared','case':case,'review':slot['final_v3_execution']['review']})+'\n')
print(json.dumps({'request_path':str(d/'REQUEST.json'),'deadline':deadline}))
