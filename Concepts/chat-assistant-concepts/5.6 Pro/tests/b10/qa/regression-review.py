"""Bounded Review integration checks. No copied visibility/review algorithms.
Exercises registered UI actions, Review ingress, real editor/export/To-Do owner.
"""
from pathlib import Path
import json, hashlib
from playwright.sync_api import sync_playwright
W=Path(__file__).resolve().parents[1];C=W/'repo/Concepts/chat-assistant-concepts/5.6 Pro';O=W/'qa/review-regression-results';O.mkdir(exist_ok=True)
checks=[];errors=[]
def check(name,v,detail=None):
 checks.append({'name':name,'pass':bool(v),'detail':detail});assert v,name
SNAP="""() => {const a=PM56_REVIEW_DEMOS.snapshot(),r=a&&PM56_COLLAB.run(a.runId);return {a,r,todos:a?(PM56_TODOS.get(a.threadId)||[]):[],state: {dialog:PM56_EXT.ctx().state.dialog,activeEditor:PM56_EXT.ctx().state.activeEditor,selectedThread:PM56_EXT.ctx().state.selectedThread}};}"""
def snap(p):return p.evaluate(SNAP)
def action(p,name,ds={}):return p.evaluate("([a,ds])=>{const b=document.createElement('button');Object.assign(b.dataset,ds);return PM56_EXT.run(a,b,new Event('click'));}",[name,ds])
def boot(b,kind='multi',width=1280):
 p=b.new_page(viewport={'width':width,'height':900},accept_downloads=True);p.set_default_timeout(6000);p.on('pageerror',lambda e:errors.append(str(e)));p.set_content((C/'index.html').read_text(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');p.locator('[data-action="open-demo"]').click();p.locator(f'[data-action="review-demo-start"][data-flow="{kind}"]').click();return p
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for kind in ['single','multi']:
   p=boot(b,kind);d=p.evaluate('PM56_COLLAB.draft()');check(kind+': configured roster',len(d['rows'])==(1 if kind=='single' else 3));check(kind+': no run before commit',snap(p)['r'] is None)
   check(kind+': picker presentation',p.locator('[data-action="collab-pick-model"]').count()==len(d['rows']) and p.locator('[data-action="collab-pick-persona"]').count()==len(d['rows']))
   before=p.evaluate('PM56_EXT.ctx().state.model');p.locator('[data-action="collab-pick-model"]').first.click();p.keyboard.press('Escape');check(kind+': cancel picker preserves main model',p.evaluate('PM56_EXT.ctx().state.model')==before)
   p.locator('[data-action="collab-modal-commit"]').click();s=snap(p);rid=s['r']['id'];n=len(s['r']['participants']);initial=json.dumps(s['r']['review']['targetPack'],sort_keys=True)
   check(kind+': frozen timestamp',s['r']['review']['targetPack']['frozenAt'] is not None);check(kind+': target deep frozen',p.evaluate('(id)=>Object.isFrozen(PM56_COLLAB.run(id).review.targetPack.evidence[0])',rid))
   check(kind+': distinct participant IDs',len(set(x['id'] for x in s['r']['participants']))==n);check(kind+': distinct attempt IDs',len(set(x['id'] for x in s['r']['review']['passes']))==n)
   check(kind+': no peer material in initial input',all(not a['input']['peerFindings'] and not a['input']['peerIdentities'] for a in s['r']['review']['passes']))
   if kind=='multi':check('Same model retains three slots',len(set(x['effectiveModelId'] for x in s['r']['participants']))==1)
   check(kind+': normalize refuses incomplete passes',p.evaluate('(id)=>PM56_REVIEW.normalize(id)',rid)['error']=='initial_passes_incomplete')
   p.locator('[data-action="review-demo-play"]').click();action(p,'review-demo-play');p.wait_for_function("PM56_COLLAB.run(PM56_REVIEW_DEMOS.snapshot().runId).status==='completed'",timeout=12000)
   s=snap(p);r=s['r'];a=r['review']['report'];check(kind+': complete once',r['status']=='completed' and len(r['artifacts'])==1);check(kind+': unchanged frozen source',json.dumps(r['review']['targetPack'],sort_keys=True)==initial)
   check(kind+': no auto tasks',len(s['todos'])==0);check(kind+': auto repair off',r['config']['autoRepair'] is False);check(kind+': report read-only',p.evaluate('(id)=>Object.isFrozen(PM56_COLLAB.run(id).review.report.findings[0])',rid))
   check(kind+': same target hash every pass',all(x['targetHash']==a['target']['targetHashes']['primary'] for x in a['passes']));check(kind+': independent passes completed',all(x['status']=='completed' for x in a['passes']))
   resolution=p.evaluate('(id)=>JSON.parse(PM56_COLLAB.run(id).review.resolutionFingerprint)',rid)
   check(kind+': finalization idempotent',p.evaluate('([id,x])=>PM56_REVIEW.finalize(id,x)',[rid,resolution])['reused'])
   check(kind+': conflicting finalization refused',p.evaluate('(id)=>PM56_REVIEW.finalize(id,[])',rid)['error']=='conflicting_finalization')
   if kind=='single':check('Single reviewer does not claim votes',all(not x['reviewerVotes'] for x in a['findings']))
   else:
    check('Duplicate observations normalized',len(a['duplicates'])==1 and len(a['findings'])==3 and sum(len(x['findings']) for x in a['passes'])==4)
    f=next(x for x in a['findings'] if x['findingKey']=='trim-query');check('Duplicate origins retained',len(f['originatingReviewerIds'])==2 and len(f['originalFindingIds'])==2)
    f=next(x for x in a['findings'] if x['findingKey']=='preserve-ranking');check('Dissent retained on confirmed finding',bool(f['dissent']) and f['disposition']=='confirmed');check('Uncertain suggestion not hidden',any(x['disposition']=='uncertain' for x in a['findings']))
   p.locator('[data-action="review-open-report"]').first.click();p.wait_for_timeout(450);p.screenshot(path=str(O/(kind+'-report.png')))
   check(kind+': stable editor identity',snap(p)['state']['activeEditor']=='review:'+rid)
   action(p,'review-open-report',{'run':rid});check(kind+': report tab reused',p.evaluate('(id)=>PM56_EXT.ctx().state.editorTabs.filter(x=>x==="review:"+id).length',rid)==1)
   p.locator('[data-action="review-open-evidence"][data-evidence="tests"]').first.click();check(kind+': actual frozen fixture test visible','Actual IDs: []' in p.locator('.review-source').inner_text())
   p.locator('[data-action="review-open-report"]').first.click();p.locator('[data-action="review-report-view"][data-view="markdown"]').click();md=p.locator('.review-markdown').inner_text()
   check(kind+': Markdown same target',a['target']['targetHashes']['primary'] in md);check(kind+': Markdown retains every finding',all(f['claim'] in md for f in a['findings']))
   with p.expect_download() as di:p.locator('[data-action="review-export-report"]').click()
   dl=di.value;out=O/(kind+'-report.md');dl.save_as(out);check(kind+': actual exported Markdown equals visible content',out.read_text()==md)
   if kind=='single':check('No fake single-agent agreement matrix','## Agreement matrix' not in md)
   else:check('Agreement and dissent exported','## Agreement matrix' in md and 'Alphabetical ordering could be intentional' in md)
   p.locator('[data-action="review-report-view"][data-view="rich"]').click()
   confirmed=[f for f in a['findings'] if f['disposition']=='confirmed'];all_ids=[f['id'] for f in a['findings']]
   if kind=='multi':
    bad=next(f['id'] for f in a['findings'] if f['disposition']=='uncertain')
    res=p.evaluate('([id,fs])=>PM56_TODOS.materializeForReview(PM56_COLLAB.run(id),fs)',[rid,[confirmed[0]['id'],bad]])
    check('Mixed valid/uncertain conversion atomic refusal',not res['ok'] and not snap(p)['todos'])
   check(kind+': no selection refused',not p.evaluate('(id)=>PM56_TODOS.materializeForReview(PM56_COLLAB.run(id),[])',rid)['ok'])
   check(kind+': unknown finding refused',not p.evaluate('(id)=>PM56_TODOS.materializeForReview(PM56_COLLAB.run(id),["unknown"])',rid)['ok'])
   # Keep a real unrelated in-progress task, including its revision/work binding.
   p.evaluate("""id=>{
    const tid=PM56_COLLAB.run(id).threadId,T=PM56_TODOS,D=PM56_DATA,ref='existing-work:'+id;
    const source={id:ref,threadId:tid,projectId:'pm',version:1,status:'ready',content:'Preserve the existing task while Review findings are promoted.'};D.artifacts.push(source);
    T.registerOutcomeOwner(ref,()=>({ok:false,error:'No outcome computed in this setup'}),{admit:(owner,item,b,cause)=>({ok:owner===ref&&cause===ref&&D.artifacts.find(a=>a.id===ref)?.content===item.expected_outcome&&b.work_id==='existing-work'})});
    const made=T.replaceThreadList(tid,{items:[{todo_id:'unrelated',thread_id:tid,title:'Existing task',status:'pending',revision:1,active_work_ids:[],depends_on:[],expected_outcome:source.content,outcome_owner:ref,workflow_ref:ref,run_id:ref,run_epoch:1}]},{});
    if(!made.ok)throw Error('Existing work materialization failed: '+made.error);
    const b={binding_id:ref+':binding',todo_id:'unrelated',work_id:'existing-work',attempt_id:id,work_kind:'primary_segment',expected_outcome:source.content};
    const admitted=T.applyTransition(tid,{...T.capture(tid,'unrelated'),to_status:'in_progress',cause_kind:'work_admitted',cause_ref:ref,work_binding:b.binding_id,binding:b});
    if(!admitted.ok)throw Error('Existing work admission failed: '+admitted.error);
   }""",rid)
   old=p.evaluate('(id)=>JSON.stringify(PM56_TODOS.get(PM56_COLLAB.run(id).threadId)[0])',rid)
   for f in confirmed:p.locator(f'[data-action="collab-review-toggle-finding"][data-finding="{f["id"]}"]').check()
   p.locator('[data-action="collab-review-create-todos"]').click();s=snap(p);made=[t for t in s['todos'] if t.get('source_review_run_id')==rid]
   check(kind+': real pending To-Dos created',len(made)==len(confirmed) and all(t['status']=='pending' and not t['active_work_ids'] for t in made))
   check(kind+': exact finding lineage',set(t['source_finding_id'] for t in made)==set(f['id'] for f in confirmed));check(kind+': target hash lineage',all(t['source_target_hash']==a['target']['targetHashes']['primary'] for t in made))
   check(kind+': unrelated task byte unchanged',p.evaluate('(id)=>JSON.stringify(PM56_TODOS.get(PM56_COLLAB.run(id).threadId)[0])',rid)==old)
   check(kind+': conversion replay reuses task IDs',p.evaluate('([id,fs])=>PM56_TODOS.materializeForReview(PM56_COLLAB.run(id),fs)',[rid,[f['id'] for f in confirmed]])['reused'])
   check(kind+': report still immutable after conversion',json.dumps(snap(p)['r']['review']['report'],sort_keys=True)==json.dumps(a,sort_keys=True))
   p.locator('[data-action="review-open-todos"]').click();check(kind+': pinned To-Do panel',p.evaluate('PM56_EXT.ctx().state.activity.pinned && PM56_EXT.ctx().state.activity.open && PM56_EXT.ctx().state.activity.domain==="todo"'))
   check(kind+': no horizontal thread overflow',p.evaluate('() => [...document.querySelectorAll(".transcript")].every(x=>x.scrollWidth<=x.clientWidth+1)'))
   p.screenshot(path=str(O/(kind+'-todos.png')))
   before_count=len(p.evaluate('PM56_COLLAB.runs()'));action(p,'collab-review-run-again',{'run':rid});check(kind+': rerun opens configuration, no silent run',len(p.evaluate('PM56_COLLAB.runs()'))==before_count and p.locator('[data-action="collab-modal-commit"]').is_visible());check(kind+': rerun not in-place edit',p.evaluate('PM56_COLLAB.draft().reconfigureRunId') is None);check(kind+': old guide is absent from rerun configuration',p.locator('.collab-configure .review-demo-guide:visible').count()==0)
   p.locator('[data-action="collab-modal-cancel"]').first.click();check(kind+': rerun cancel retains report',json.dumps(snap(p)['r']['review']['report'],sort_keys=True)==json.dumps(a,sort_keys=True))
   p.evaluate('PM56_COLLAB.openConfigure("crew")');check(kind+': Review guide is absent from another kind modal',p.locator('.collab-configure .review-demo-guide:visible').count()==0)
   p.close()
  # Fresh, manually driven ingress counterexamples (no recorded playback).
  p=boot(b);p.locator('[data-action="collab-modal-commit"]').click();s=snap(p);rid=s['r']['id'];r=s['r'];a=r['review']['passes'][0]
  payload={'attemptId':a['id'],'assignmentRevision':a['assignmentRevision'],'epoch':r['stopEpoch'],'targetHash':a['targetHash'],'findings':[{'id':'x','findingKey':'x','severity':'minor','claim':'Inspect source','evidenceRefs':['source']}]}
  def submit(x):return p.evaluate('([id,x])=>PM56_REVIEW.submitPass(id,x)',[rid,x])
  for label,change,expected in [('wrong hash',{'targetHash':'stale'},'different_target_hash'),('stale epoch',{'epoch':99},'stale_epoch'),('stale assignment',{'assignmentRevision':99},'stale_assignment'),('unknown attempt',{'attemptId':'other'},'unknown_attempt'),('missing evidence',{'findings':[{'id':'x','findingKey':'x','severity':'minor','claim':'x','evidenceRefs':['no']} ]},'invalid_finding_evidence')]:
   check('Ingress rejects '+label,submit({**payload,**change})['error']==expected)
  check('Ingress accepts current evidence',submit(payload)['ok']);count=len(snap(p)['r']['messages']);check('Duplicate pass idempotent',submit(payload)['reused']);check('Duplicate pass adds no messages',len(snap(p)['r']['messages'])==count)
  different={**payload,'findings':[{**payload['findings'][0],'claim':'different'}]};check('Conflicting pass refused',submit(different)['error']=='conflicting_duplicate_pass')
  check('Early peer round refused',p.evaluate('([id,pid,f,hash])=>PM56_REVIEW.vote(id,pid,f,{epoch:0,targetHash:hash})',[rid,a['participantId'],'x',a['targetHash']])['error']=='no_peer_round')
  for attempt in r['review']['passes'][1:]:check('Other independent pass accepted',submit({**payload,'attemptId':attempt['id'],'assignmentRevision':attempt['assignmentRevision']})['ok'])
  check('Normalized when all arrived',p.evaluate('(id)=>PM56_REVIEW.normalize(id)',rid)['ok']);f=snap(p)['r']['review']['findings'][0]
  check('Finalization refuses missing peer responses',p.evaluate('([id,f])=>PM56_REVIEW.finalize(id,[{findingId:f,disposition:"confirmed",reason:"source"}])',[rid,f['id']])['error']=='peer_round_incomplete')
  action(p,'collab-cancel',{'run':rid});check('Canceled run rejects results',submit(payload)['error']=='run_not_running');check('Canceled run creates no report',snap(p)['r']['review']['report'] is None);p.close()
  # Real cancel modal and narrow layouts.
  for width in [900,700]:
   p=boot(b,'single',width);before=len(p.evaluate('PM56_COLLAB.runs()'));p.wait_for_timeout(500)
   check(str(width)+': modal inside viewport',p.locator('.collab-configure').evaluate('(e)=>{let r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1}'))
   check(str(width)+': footer inset',p.locator('.collab-configure-foot').evaluate('(e)=>parseFloat(getComputedStyle(e).paddingLeft)>=12'))
   p.locator('[data-action="collab-modal-cancel"]').first.click();check(str(width)+': cancel creates no run',len(p.evaluate('PM56_COLLAB.runs()'))==before);p.close()
  check('No browser page errors',not errors,errors)
 finally:
  (O/'RESULTS.json').write_text(json.dumps({'html_sha256':hashlib.sha256((C/'index.html').read_bytes()).hexdigest(),'checks':checks,'page_errors':errors},indent=2));b.close()
print('PASS',len(checks),'checks')
