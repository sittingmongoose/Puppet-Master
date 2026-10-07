#!/usr/bin/env python3
"""Finite publication curation, original bytes preserved, no science or Git writes."""
import collections, datetime as dt, hashlib, json, re, subprocess
from pathlib import Path

R = Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
W = Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
H = R / 'helpers/publication-batch006'
S = H / 'staging'
BASE = 'reports/external-research-v10-20261007'
P = S / BASE
CFG = json.loads((H/'config.json').read_bytes())
CUTOFF = CFG['cutoff']
TS = dt.datetime.fromisoformat(CUTOFF).timestamp()
COMMIT = CFG['baseline_github_commit']
selected, raw, omissions, checks, gates, collisions = {}, {}, [], [], [], []
scopes, protocol_scopes, explicit = set(), set(), set()
sha = lambda b: hashlib.sha256(b).hexdigest()
def dump(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes((json.dumps(obj, indent=2, ensure_ascii=False)+'\n').encode())
def git(*args):
    return subprocess.check_output(['git','-C',str(W),*args], timeout=50)
def under(p, root):
    return p == root or root in p.parents
def parse(b):
    try: return json.loads(b)
    except (ValueError, UnicodeError): return None
def stable(p):
    if not p.is_file() or p.is_symlink(): return None
    st=p.stat()
    if st.st_mtime > TS: return None
    b=p.read_bytes(); end=p.stat()
    if (st.st_size,st.st_mtime_ns)!=(end.st_size,end.st_mtime_ns): return None
    return b, st
def forbidden(p):
    return bool(re.search(r'(^|/)(\.git|__pycache__|profiles?|databases?|transcripts?|history|logs?|scratch|node_modules)(/|$)|\.(sqlite|db|pyc|jsonl|log)$|approval[-_]|capabilities', str(p.relative_to(R)), re.I))
def allowed(p):
    return under(p,R) and not forbidden(p) and (p in explicit or any(under(p,q) for q in scopes))
def kind(p,b):
    parts=p.relative_to(R).parts; name=p.name.lower()
    if p.suffix.lower()=='.pdf':return 'RAW_BODY_EXCLUDED'
    if 'source-cache' in parts:
        return 'RAW_BODY_EXCLUDED' if 'objects' in parts else 'SOURCE_OPERATION_METADATA'
    if not any(x in ['sources','reviewer-source-checks','primary-source-checks'] for x in parts):
        return 'AUTHORED_RESULT_OR_PROTOCOL'
    j=parse(b) if p.suffix.lower()=='.json' else None
    if isinstance(j,dict) and ('sha' in j and 'commit' in j and isinstance(j.get('files'),list) or isinstance(j.get('body'),str) or 'encoding' in j and 'content' in j):
        return 'RAW_BODY_EXCLUDED'
    # Authored indexes/checks and compact upstream identity metadata, never bodies.
    if name in ['index.json','source-index.json','sources.json','sources.md','checksums.txt','input-identities.json','primary-checks.json','claim-assessments.json','analytic-counterexamples.json','retrievals.json','checks.json','source-checks.json','admitted-inputs.json','derived-provenance.json','capture-link-check.json','artifact-manifest.json','reviewer-executed-checks.json','output-validation.json','review-evidence.md','checks.py','retrieve.py','reproduce.py','finalize.py','validate.py'] or name.endswith('-read.json'):
        return 'AUTHORED_SOURCE_CHECK_OR_IDENTITY'
    if p.suffix.lower()=='.json':
        j=parse(b)
        if isinstance(j,dict) and ('sha256' in j and any(k in j for k in ['url','captured_at','retrieved_at','capture_date_utc','http_status','response_bytes'])):
            return 'RETRIEVAL_IDENTITY_METADATA'
        if isinstance(j,dict) and ('object' in j and 'sha' in j or 'commit' in j and 'sha' in j) and len(b)<16384:
            return 'UPSTREAM_VERSION_IDENTITY_METADATA'
        if re.fullmatch(r'p\d+.*\.json',name): return 'RETRIEVAL_IDENTITY_METADATA'
    if p.suffix.lower()=='.txt':
        m=p.with_suffix('.json'); saved=stable(m)
        j=parse(saved[0]) if saved else None
        if isinstance(j,dict) and re.search('bounded|excerpt',json.dumps(j),re.I) and isinstance(j.get('response_bytes'),int) and len(b)<j['response_bytes'] and len(b)<=16384:
            return 'EXISTING_AUTHORED_BOUNDED_WITNESS'
    return 'RAW_BODY_EXCLUDED'
def select(p, why, force=False):
    p=Path(p)
    if str(p) in selected or str(p) in raw: return
    if not under(p,R) or forbidden(p):
        omissions.append({'path':str(p),'status':'EXCLUDED_UNSAFE_OR_RAW_FORMAT','why':why}); return
    if not force and not allowed(p): return
    saved=stable(p)
    if not saved:
        omissions.append({'path':str(p),'status':'ABSENT_OR_AFTER_CUTOFF_OR_UNSTABLE','exists_at_selection':p.exists(),'why':why}); return
    b,st=saved; k=kind(p,b)
    item={'path':str(p),'sha256':sha(b),'bytes':len(b),'mtime_ns':st.st_mtime_ns,'why':why,'kind':k}
    if k=='RAW_BODY_EXCLUDED':
        raw[str(p)]={**item,'github_body_published_in_batch006':False,'archive_verified':False,'retained_status':'UNKNOWN_UNVERIFIED','source_locators':[]};return
    if re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:sk-proj-|ghp_|github_pat_)[A-Za-z0-9_-]{20,}',b):
        omissions.append({'path':str(p),'sha256':sha(b),'status':'SECRET_PATTERN_EXCLUDED_NO_SCIENTIFIC_REWRITE'});return
    selected[str(p)]={**item,'data':b}
def add(s,why):
    p=R/s;explicit.add(p);select(p,why,True)
def scan(p,why):
    for q in sorted(p.rglob('*')):
        if q.is_file() and not forbidden(q): select(q,why)
def unwrap(j):
    if isinstance(j,dict): return j.get('structuredContent',j)
    return j
def stage_scope(p,why,allow_pair_derived=False):
    names=['freeze.json','freeze_disposition.json','frozen-delivery.json','host/scientific-files-terminal-freeze.json','HOST_REVIEW_FREEZE.json','frozen-review.json','frozen-standalone-review.json']
    terminals=['task-terminal.json','TASK_TERMINAL.json','quiet_task_receipt.json','terminal-task-status.json','host/task-terminal.json']
    witness=None; closed=False
    for n in names+terminals:
        q=p/n;saved=stable(q)
        if not saved:continue
        j=unwrap(parse(saved[0]))
        if not isinstance(j,dict):continue
        status=j.get('status') or j.get('task_terminal') or j.get('task_status')
        task=j.get('quiet_task_state') or j.get('quiet') or j.get('actual_task_status') or j.get('dispatch')
        if isinstance(task,dict):status=task.get('status',status)
        quiet=j.get('hasPendingChildRuns') is False or j.get('T3_children_quiet') is True or j.get('descendants_quiet') is True or j.get('all_review_descendants_quiet') is True or j.get('quiet') is True
        if isinstance(task,dict):quiet=quiet or task.get('hasPendingChildRuns') is False
        if status in ['completed','interrupted','failed','cancelled'] and quiet or j.get('T3_children_quiet') is True or j.get('descendants_quiet') is True:
            witness=q;closed=True;break
    if closed or allow_pair_derived:
        scopes.add(p);gates.append({'scope':str(p),'status':'CLOSED_FROZEN_SCOPE' if closed else 'EXPLICIT_COMPLETED_PAIR_DERIVED_SCOPE','admission_witness':str(witness) if witness else why,'no_source_grade_inferred':True});scan(p,why)
    else:
        gates.append({'scope':str(p),'status':'NO_PRE_CUTOFF_CLOSED_GATE_PROTOCOL_ONLY','admission_witness':None});protocol(p,why)
def protocol(p,why):
    protocol_scopes.add(p)
    names=['config.json','dispatch.json','dispatch-config.json','actual-dispatch-config.json','dispatch-request.json','stage-envelope.json','request.json','REQUEST.json','input-map.json','INPUT_MAP.json','REVIEW_INPUT_MAP.json','task.txt','task-template.txt','PROMPT.txt','assignment.md','scope.md','runtime-budget.json','prospective-timing.json']
    for n in names:
        q=p/n
        if q.is_file():explicit.add(q);select(q,'PROTOCOL_ONLY_NOT_COMPLETION: '+why,True)

if not (P/'BATCH006_MANIFEST.json').exists():
    # Explicit requested versions; no latest/best-grade or supervisor-count selection.
    for case,version in [('D-M12-A','v3'),('D-M14-A','v3')]:
        for p in sorted((R/'jobs'/case).glob('*/*')):
            if p.is_dir():stage_scope(p,'exact selected matched-version candidate/failure evidence')
        for arm in ['control','treatment']:
            stage_scope(R/'reviews/targeted-cohort4'/case/(arm+'-'+version),'independent completed original six-axis review and actual freeze')
        scopes.add(R/'helpers/targeted-cohort4'/case);scan(R/'helpers/targeted-cohort4'/case,'original versioned gates/comparison/budgets/failure-inclusive accounting')
    for p in sorted((R/'jobs/D-M08-A').glob('*/*')):
        if p.is_dir():stage_scope(p,'M08A original v1/v2 failures and exact v3 pair stages')
    for reviewer in ['J1','J2']:
        stage_scope(R/'reviews/targeted-cohort3/D-M08-A-v3'/reviewer,'M08Av3 completed independent review freeze')
    add('reviews/targeted-cohort3/D-M08-A-v3/PAIR_COMPARISON.json','exact original v3 comparison')
    for case in ['D-M02-B','D-M03-B','D-M01-B','D-M03-A']:
        for p in sorted((R/'jobs'/case).glob('*/*')):
            if p.is_dir():stage_scope(p,'completed original targeted candidate attempts',allow_pair_derived=case=='D-M02-B' and p.name=='finalize-v3')
    for s in ['reviews/targeted/D-M02-B/source-review-v2','reviews/targeted/D-M03-B/source-review-v2','reviews/targeted/D-M01-B/source-review-v2-paired','reviews/targeted/D-M03-A/source-review-v2-X','reviews/targeted/D-M03-A/source-review-v2-Y']:
        stage_scope(R/s,'completed exact original targeted source assessment')
    for case in ['I-METHOD-01','I-METHOD-03','I-METHOD-05','I-METHOD-06','I-METHOD-02','I-METHOD-04','I-FAST-01']:
        for p in sorted((R/'jobs'/case).glob('*/*')):
            if not p.is_dir():continue
            if p.name.endswith('-v1'):
                stage_scope(p,'exact original integrated candidate or terminal failure evidence',allow_pair_derived=case=='I-METHOD-05' and p.name=='research-v1')
            else:protocol(p,'LASTv2 prospective input/task/config only; outputs excluded even when locally saved')
    for case in ['I-METHOD-01','I-METHOD-03','I-METHOD-05','I-METHOD-06']:
        for arm in ['control','treatment']:
            stage_scope(R/'reviews/integrated-methods'/case/arm/'review-v1','completed original full scientific review; chronology/fulfillment separately retained')
    stage_scope(R/'reviews/integrated-methods/I-FAST-01/treatment/standalone-diagnostic-v1','authorized standalone review; original paired gate remains incomplete')
    for case in ['C-02','C-01']:
        for p in sorted((R/'jobs'/case).glob('*/*')):
            if p.is_dir():stage_scope(p,'actual original confirmation candidate freeze/chronology/inputs')
        for arm in ['control','treatment']:
            stage_scope(R/'reviews/confirmation'/case/arm/'source-review-v1','independent confirmation review only with actual completed quiet gate')
        for name in ['PAIR_FINAL_FREEZE.json','PAIR_QUIET.json']:
            add('reviews/confirmation/'+case+'/'+name,'original confirmation pair delivery gate distinct from scientific full assessment')
    add('reviews/confirmation/C-02/COMPARISON.json','ONE delivered comparison disposition, treatment O1 unassessed remainder; original FAIL/HOLD')
    # Case authored input packets, not full public source bodies.
    cases=['D-M12-A','D-M14-A','D-M08-A','D-M02-B','D-M03-B','D-M01-B','D-M03-A','I-METHOD-01','I-METHOD-03','I-METHOD-05','I-METHOD-06','I-METHOD-02','I-METHOD-04','I-FAST-01','C-01','C-02']
    for case in cases:
        d=R/'cases'/case
        for p in sorted(d.iterdir()) if d.exists() else []:
            if p.is_file():explicit.add(p);select(p,'exact original case task, scope and source identity metadata',True)
        for n in ['inputs','input','source']:
            if (d/n).exists():scopes.add(d/n);scan(d/n,'exact declared authored inputs; vendor source bodies excluded')
    for s in ['state/final-finite-prospective-admissions-v3.json','state/final-finite-t0-interpretation-before-starts-v1.json','state/logical-slot-index-v1.json','state/prospective-activation-notice-registration-order-v1.json','state/owner-summary-working-reference-snapshot-v1.json','state/I-FAST-01-treatment-only-diagnostic-gate-exception-v1.json','state/I-METHOD-02-v2-treatment-only-diagnostic-gate-exception-v1.json','state/D-M12-A-prospective-v3-root-binding.json','state/D-M02-B-prospective-v3-root-binding.json','state/I-METHOD-02-prospective-v2-root-binding.json','state/I-METHOD-04-prospective-v2-root-binding.json','state/m12-native-active-root-nominations.json','state/m14-renderer-root-qualification.json','state/m14-renderer-timing.json','state/review-boundary-annotation-v1.json','state/review-carrier-prospective-v2.json','state/C-02-actual-Codex-session-usage-observation-v1.json','state/recorded-usage-service-observation-v1.json','state/publication-batch005.json','locks/confirmation-selection.json','locks/speed-budget-selection-v1.json','helpers/mechanical/clock_guard.py','helpers/passive-receipts/PROSPECTIVE_CARRIER_V2.md','helpers/passive-receipts/ROOT_ADMISSION_V2.json','helpers/passive-receipts/export.py','helpers/m14-renderer/render.py','helpers/final-report/resolve_public_evidence.py']:
        add(s,'immutable root/admin/protocol/helper evidence; no new scientific completion claim')
    for s in ['helpers/targeted-supervisor/COMPARISONS.json','helpers/targeted-supervisor/D-M02-B-pair-quiet-gate-v3.json','helpers/targeted-supervisor/D-M03-B-pair-quiet-gate-v2.json','helpers/targeted-supervisor/carrier-D-M02-B-v2.json','helpers/targeted-supervisor/carrier-D-M03-B-v2.json','helpers/targeted-supervisor/sameauthor-D-M02-B-v2.json','helpers/targeted-supervisor/candidate-common-v2.txt','helpers/targeted-supervisor/reviewer-common-v2.txt','helpers/targeted-cohort4/COMPARISONS.json','reviews/targeted-cohort3/COMPARISONS.json','helpers/targeted-cohort4/m14-cost-accounting-v1.json','helpers/targeted-cohort4/freeze_stage.py','helpers/targeted-cohort3/freeze_v3.py','helpers/targeted-cohort3/prepare_reviews_v3.py','helpers/confirmation-supervisor/protocol-freeze.json','helpers/confirmation-supervisor/all-inputs-and-carriers-freeze.json','helpers/confirmation-supervisor/manage.py','helpers/confirmation-supervisor/review.py','helpers/confirmation-supervisor/finish_review.py','helpers/confirmation-supervisor/compare.py']:
        add(s,'exact original comparison/generic helper/protocol; outside selected scientific paths are metadata only')
    for p in sorted((R/'helpers/integrated-execution').iterdir()):
        if not p.is_file() or forbidden(p):continue
        # Current aggregate is a point-time snapshot; LASTv2 records are protocol only.
        if p.name=='COMPARISONS.json' or p.suffix in ['.py','.md'] or p.name in ['selection-v1.json','carrier-v2-admission-annotation.json','review-carrier-v2-admission.json','speed-lock-received.json','passive-active-host-cost.json'] or re.search(r'(method0[1356]|i-method-0[1356]|fast01|i-fast-01)',p.name,re.I) or re.search(r'method0[24].*(v1|prospective|overlay|preparation)',p.name,re.I) or re.search(r'i-method-0[24]-terminal-economics-v1|method02-pair-quiet-statuses|method04-terminal-quiet-tasks|method04-arm-envelope',p.name):
            add(str(p.relative_to(R)),'exact completed original integrated comparison/failure/helper or explicitly prospective policy')

    def resolve(loc,owner,h=None):
        p=Path(loc)
        if p.is_absolute():return p
        if loc.startswith('reports/'):return W/p
        if loc.startswith(('jobs/','reviews/','cases/','helpers/','state/','locks/')):return R/p
        candidates=[owner.parent/p]
        # Exact metadata+SHA resolution within its bound source/stage scope.
        for parent in [owner.parent,*list(owner.parents)[:3]]:
            if loc.startswith('sources/') and parent.name=='sources':candidates.append(parent.parent/p)
            if parent.name=='sources':candidates.extend([parent/'raw'/p,parent/'objects'/p])
        found=[]
        for q in dict.fromkeys(candidates):
            if h and allowed(q):
                saved=stable(q)
                if saved and sha(saved[0])==h:found.append(q)
        return found[0] if len(found)==1 else candidates[0]
    def identities(o,owner,pointer=''):
        if isinstance(o,dict):
            loc=o.get('path') or o.get('original_path') or o.get('file') or o.get('capture_path') or o.get('local_path') or o.get('local_file')
            h=o.get('sha256') or o.get('hash') or o.get('original_sha256')
            if isinstance(loc,str) and (isinstance(h,str) and re.fullmatch('[0-9a-f]{64}',h) or o.get('exists') is False):
                yield resolve(loc,owner,h),h,o.get('bytes'),o.get('exists'),pointer,{k:v for k,v in o.items() if k in ['url','urls','version','version_or_capture','commit','tag','ref','locator','locators','line_range','accessed_at_utc','captured_at','source_id','license']}
            for field in ['bounded_evidence','excerpt']:
                if isinstance(o.get(field+'_file'),str):yield resolve(o[field+'_file'],owner,o.get(field+'_sha256')),o.get(field+'_sha256'),o.get(field+'_bytes'),True,pointer+'/'+field,{}
            for k,v in o.items():
                if isinstance(v,dict) and ('sha256' in v or v.get('exists') is False) and not any(t in v for t in ['path','file','capture_path']) and ('.' in k or '/' in k):
                    yield resolve(k,owner,v.get('sha256')),v.get('sha256'),v.get('bytes'),v.get('exists'),pointer+'/'+k,{}
                if isinstance(v,str) and re.fullmatch('[0-9a-f]{64}',v) and ('/' in k or '.' in k) and not k.endswith('sha256'):
                    yield resolve(k,owner,v),v,None,True,pointer+'/'+k,{}
                if isinstance(v,(dict,list)):yield from identities(v,owner,pointer+'/'+k)
        elif isinstance(o,list):
            for i,v in enumerate(o):yield from identities(v,owner,pointer+'/'+str(i))
    processed=set()
    while True:
        pending=[x for x in selected.values() if x['path'].endswith('.json') and x['path'] not in processed]
        if not pending:break
        for entry in pending:
            processed.add(entry['path']);owner=Path(entry['path']);obj=parse(entry['data'])
            if obj is None:checks.append({'record':str(owner),'status':'JSON_PARSE_FAILED_ORIGINAL_PRESERVED'});continue
            for p,h,n,exists,pointer,locators in identities(obj,owner):
                row={'record':str(owner),'locator':str(p),'expected_sha256':h,'expected_bytes':n,'identity_pointer':pointer}
                if exists is False:
                    row['status']='DECLARED_FROZEN_ABSENCE';row['current_exists_not_completion']=p.exists();checks.append(row);continue
                if not allowed(p):
                    row['status']='OUTSIDE_SELECTED_FROZEN_SCOPE_NOT_READ';checks.append(row);continue
                select(p,'exact path+hash referenced by '+str(owner.relative_to(R)))
                item=selected.get(str(p)) or raw.get(str(p))
                if item:
                    row.update({'observed_sha256':item['sha256'],'observed_bytes':item['bytes']})
                    row['status']='MATCH' if (not h or h==item['sha256']) and (n is None or n==item['bytes']) else 'MISMATCH_ORIGINAL_BYTES_PRESERVED'
                    if str(p) in raw and locators:
                        raw[str(p)]['source_locators'].append({'record':str(owner),'pointer':pointer,**locators})
                else:row['status']='ABSENT_OR_DEFERRED_AT_CUTOFF'
                checks.append(row)
            if isinstance(obj,dict):
                for name in obj.get('required',[]) if isinstance(obj.get('required',[]),list) else []:
                    if isinstance(name,str):
                        q=owner.parent/name
                        checks.append({'record':str(owner),'locator':str(q),'status':'REQUIRED_NONEMPTY' if str(q) in selected and selected[str(q)]['bytes']>0 else 'REQUIRED_ABSENT_OR_UNASSESSED'})
    # Immutable-card references are administrative, not a request to read live results.
    index=selected.get(str(R/'state/logical-slot-index-v1.json'))
    if index:
        j=parse(index['data']);assert j['logical_slots']==40 and j['logical_arms']==80 and len(j['slots'])==40
        for row in j['slots']:
            if row.get('card_sha256'):
                p=R/row['card_path'];explicit.add(p);select(p,'immutable 40-slot card identity; no completion inferred',True)
                item=selected.get(str(p));checks.append({'record':str(R/'state/logical-slot-index-v1.json'),'locator':str(p),'expected_sha256':row['card_sha256'],'observed_sha256':item['sha256'] if item else None,'status':'MATCH' if item and item['sha256']==row['card_sha256'] else 'IMMUTABLE_CARD_MISSING_OR_MISMATCH'})
else:
    # Revisions refine only this helper's captured bytes; never chase later results.
    previous=json.loads((P/'BATCH006_MANIFEST.json').read_bytes())
    for e in previous['entries']:
        if not e.get('original_path'):continue
        if e.get('source_kind')=='HISTORICAL_EXACT_IDENTITY_REFERENCE':continue
        q=S/e['target_path']
        b=q.read_bytes() if q.exists() else git('show',COMMIT+':'+e['target_path'])
        assert sha(b)==e['original_sha256']
        selected[e['original_path']]={'path':e['original_path'],'sha256':sha(b),'bytes':len(b),'mtime_ns':e['selection_mtime_ns'],'data':b,'why':e['why'],'kind':e['source_kind']}
    raw={x['path']:x for x in json.loads((P/'BATCH006_RAW_SOURCE_IDENTITIES.json').read_bytes())['identities']}
    state=json.loads((H/'selection-state.json').read_bytes())
    omissions,checks,gates=state['omissions'],state['checks'],state['gates']

# Complete bounded dependency closure from already captured freeze references.
# Read only explicit authored owner snapshots and exact immutable passive receipts.
# No live stage output is admitted during refinement.
for row in gates:
    if row['status'] in ['CLOSED_FROZEN_SCOPE','EXPLICIT_COMPLETED_PAIR_DERIVED_SCOPE']:
        scopes.add(Path(row['scope']))
for path in selected:explicit.add(Path(path))
for case in ['I-METHOD-05','I-METHOD-06']:
    d=R/'cases'/case/'source'
    if d.exists():
        scopes.add(d);scan(d,'exact frozen authored owner-context input snapshots')
for row in checks:
    p=Path(row.get('locator',''))
    if under(p,R/'helpers/passive-receipts/receipts') and row.get('expected_sha256'):
        explicit.add(p);select(p,'exact immutable passive receipt bound by a captured completed stage freeze',True)
        item=selected.get(str(p))
        if item:
            row.update({'observed_sha256':item['sha256'],'observed_bytes':item['bytes'],'status':'MATCH' if item['sha256']==row['expected_sha256'] and (row.get('expected_bytes') is None or item['bytes']==row['expected_bytes']) else 'MISMATCH_ORIGINAL_BYTES_PRESERVED'})
    if str(p) in selected and row.get('status')=='OUTSIDE_SELECTED_FROZEN_SCOPE_NOT_READ':
        item=selected[str(p)]
        row.update({'observed_sha256':item['sha256'],'observed_bytes':item['bytes'],'status':'MATCH' if (not row.get('expected_sha256') or item['sha256']==row['expected_sha256']) and (row.get('expected_bytes') is None or item['bytes']==row['expected_bytes']) else 'MISMATCH_ORIGINAL_BYTES_PRESERVED'})

# Canonicalize aliases mechanically, retaining exact authored locators in checks.
for path in list(selected):
    canonical=str(Path(path).resolve())
    if canonical!=path:
        old=selected.pop(path);old['path']=canonical
        if canonical in selected:assert selected[canonical]['sha256']==old['sha256']
        else:selected[canonical]=old
for path in list(raw):
    canonical=str(Path(path).resolve())
    if canonical!=path:
        old=raw.pop(path);old['path']=canonical
        if canonical in raw:
            assert raw[canonical]['sha256']==old['sha256']
            raw[canonical]['source_locators']+=old.get('source_locators',[])
        else:raw[canonical]=old
for path in list(selected):
    item=selected[path]
    if kind(Path(path),item['data'])=='RAW_BODY_EXCLUDED':
        selected.pop(path);j=parse(item['data']) or {}
        raw[path]={k:v for k,v in item.items() if k!='data'}
        raw[path].update({'kind':'RAW_BODY_EXCLUDED','github_body_published_in_batch006':False,'archive_verified':False,'retained_status':'UNKNOWN_UNVERIFIED','source_locators':[{'url':j.get('html_url') or j.get('url'),'version_or_commit':j.get('sha'),'note':'Full upstream API response includes source body/patches; not published.'}]})

parse_limits=[]
for path,item in selected.items():
    if path.endswith('.json') and parse(item['data']) is None:
        try:
            _,end=json.JSONDecoder().raw_decode(item['data'].decode().lstrip())
            suffix=item['data'].decode().lstrip()[end:]
            status='PREFIX_JSON_WITH_LITERAL_ESCAPED_NEWLINE_SUFFIX' if suffix.strip()=='\\n' else 'PREFIX_JSON_WITH_NONSTANDARD_TRAILING_CONTENT'
        except (ValueError,UnicodeError):status='ORIGINAL_JSON_PARSE_FAILED'
        parse_limits.append({'original_path':path,'sha256':item['sha256'],'bytes':item['bytes'],'parse_status':status,'original_bytes_unchanged':True})

# Read immutable commit tree/manifests, not latest filenames or best grades.
tree={}
for line in git('ls-tree','-r','-z',COMMIT,'--',BASE).split(b'\0'):
    if line:
        meta,path=line.split(b'\t',1);tree[path.decode()]=meta.split()[2].decode()
prior=collections.defaultdict(list); prior_checks=[]; verified={}
def committed(path):
    if path not in verified:
        b=git('cat-file','blob',tree[path]);verified[path]=(sha(b),len(b))
    return verified[path]
for i in range(1,6):
    path=f'{BASE}/BATCH{i:03d}_MANIFEST.json';b=git('cat-file','blob',tree[path]);j=parse(b)
    prior_checks.append({'path':path,'sha256':sha(b),'bytes':len(b),'reference_commit':COMMIT,'commit_blob_verified':True,'local_bytes_match':(W/path).is_file() and sha((W/path).read_bytes())==sha(b)})
    for e in j.get('entries',j.get('files',[])):
        op=e.get('original_path') or e.get('source_original_path') or e.get('source_runtime_relative_path')
        oh=e.get('original_sha256') or e.get('source_original_sha256') or e.get('sha256')
        tp=e.get('target_path') or e.get('target_repo_relative_path') or (BASE+'/'+e['public_path'] if e.get('public_path') else None)
        th=e.get('target_sha256') or e.get('sha256')
        if op and oh and tp and th==oh and tp in tree:
            if not op.startswith('/'):op=str(R/op)
            prior[(op,oh)].append(tp)

P.mkdir(parents=True,exist_ok=True)
entries=[]; new_count=0;copy_bytes=0
for item in sorted(selected.values(),key=lambda x:x['path']):
    p=Path(item['path']);b=item['data'];h=item['sha256'];n=item['bytes'];normal=BASE+'/'+str(p.relative_to(R))
    targets=sorted(set(prior.get((str(p),h),[])))
    if normal in tree:targets += [normal]
    target=next((t for t in dict.fromkeys(targets) if committed(t)==(h,n)),None)
    disposition='EXISTING_EXACT_COMMIT_REFERENCE' if target else 'NEW_EXACT_COPY'
    if target is None:
        target=normal
        if target in tree or (W/target).exists():
            target=BASE+'/batch006-frozen-originals/'+str(p.relative_to(R));collisions.append({'original':str(p),'preserved_existing_target':normal,'new_exact_target':target})
        assert target not in tree and not (W/target).exists(),target
        out=S/target;out.parent.mkdir(parents=True,exist_ok=True)
        if out.exists():assert out.read_bytes()==b,target
        else:out.write_bytes(b)
        new_count+=1;copy_bytes+=n
    entries.append({'original_path':str(p),'original_sha256':h,'original_bytes':n,'target_path':target,'target_sha256':h,'target_bytes':n,'source_kind':item['kind'],'why':item['why'],'disposition':disposition,'reference_commit':COMMIT if disposition=='EXISTING_EXACT_COMMIT_REFERENCE' else None,'selection_mtime_ns':item['mtime_ns'],'selection_mtime_utc':dt.datetime.fromtimestamp(item['mtime_ns']/1e9,dt.timezone.utc).isoformat(),'json_parse_status':next((x['parse_status'] for x in parse_limits if x['original_path']==str(p)), 'PARSEABLE' if p.suffix=='.json' else 'NOT_JSON')})

# Earlier aggregate hashes resolve to their exact historical manifest identities.
historical=[]
for row in checks:
    if row.get('status')!='MISMATCH_ORIGINAL_BYTES_PRESERVED':continue
    op,h=row['locator'],row.get('expected_sha256')
    targets=prior.get((op,h),[])
    target=next((t for t in sorted(set(targets)) if committed(t)[0]==h),None)
    if target:
        n=committed(target)[1];historical.append({'original_path':op,'original_sha256':h,'target_path':target,'target_sha256':h,'bytes':n,'reference_commit':COMMIT,'referencing_record':row['record']})
        if not any(e.get('original_path')==op and e.get('original_sha256')==h for e in entries):
            entries.append({'original_path':op,'original_sha256':h,'original_bytes':n,'target_path':target,'target_sha256':h,'target_bytes':n,'source_kind':'HISTORICAL_EXACT_IDENTITY_REFERENCE','why':'Resolve a captured older aggregate hash without replacing either version','disposition':'EXISTING_EXACT_COMMIT_REFERENCE','reference_commit':COMMIT,'selection_mtime_ns':0,'selection_mtime_utc':None,'json_parse_status':'PARSEABLE'})

def generate(name,obj):
    b=(json.dumps(obj,indent=2,ensure_ascii=False)+'\n').encode() if not isinstance(obj,str) else obj.encode()
    target=BASE+'/'+name;assert target not in tree and not (W/target).exists(),target
    out=S/target;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(b)
    entries.append({'original_path':None,'original_sha256':None,'original_bytes':None,'target_path':target,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':'CURATOR_ADMINISTRATIVE','why':'publication organization and mechanical verification only; no new scientific judgment','disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None})
def entry(s):return next((e for e in entries if e.get('original_path')==str(R/s)),None)
def link(s,label=None):
    e=entry(s)
    return f'[{label or s}]({e["target_path"][len(BASE)+1:]})' if e else f'{label or s}: excluded/absent at cutoff (see validation)'

dump(H/'selection-state.json',{'cutoff':CUTOFF,'omissions':omissions,'checks':checks,'gates':gates})
generate('BATCH006_RAW_SOURCE_IDENTITIES.json',{'schema':'ER10-batch006-raw-source-identities-v1','cutoff':CUTOFF,'github_raw_bodies_in_batch006':False,'private_archive_verified':False,'reconstruction_limit':'Hashes alone cannot reconstruct bytes. Exact original indexes/checks carry URLs, releases, commits and locators; upstream availability/license and changing captures limit replay. Full bodies/PDFs/corpora are excluded.','identities':sorted(raw.values(),key=lambda x:x['path'])})
generate('BATCH006_ABSENCES_AND_DEFERRALS.json',{'schema':'ER10-batch006-absences-v1','cutoff':CUTOFF,'campaign_complete':False,'omissions':omissions,'explicit_remainders':['C01 control review not completed/frozen at cutoff; no findings read','C02 treatment O1 discovery remainder is original HOLD, not both-arm full-source assessed','METHOD02/04 LASTv2 prospective tasks/configs only; science/reviews excluded','FAST01 original control critic interrupted, no control final; paired gate incomplete; standalone treatment review separate','P27 GLM historical witness original absence remains absent; no reconstruction invented','All after-cutoff writes and all live candidates/reviewer drafts excluded','Recorded-usage live reader outputs excluded; only immutable completed root C02 telemetry supplement included','Non-selected logical slots and earlier original versions remain available in BATCH001..005 without replacement']})
counts=collections.Counter(x['status'] for x in checks)
generate('BATCH006_VERIFICATION.json',{'schema':'ER10-batch006-mechanical-verification-v1','cutoff':CUTOFF,'reference_commit':COMMIT,'reference_branch':'t3/research/er10-research-efficiency-campaign','remote_verification':'Root-provided previously verified GitHub commit; curator independently verifies exact local Git commit blobs, no new remote verification claimed','prior_manifest_checks':prior_checks,'admission_gates':gates,'identity_check_counts':dict(counts),'freeze_and_input_identity_checks':checks,'historical_exact_identity_resolutions':historical,'original_json_parse_limits':parse_limits,'collisions_preserved':collisions,'no_source_grade_inferred':True,'no_governance_run':True,'native_cumulative_counter_summing':False,'advisory_input_maps_are_firewall_certification':False})

rows=[
 ('D-M12-A','matched v3', 'FAIL / FAIL', 'Full declared six-axis assessments; changed 30min budget, original failures retained','helpers/targeted-cohort4/D-M12-A/comparison-v3.json'),
 ('D-M14-A','matched v3','FAIL / FAIL','Structural preservation separate; expanded budgets are not original 15/45 success','helpers/targeted-cohort4/D-M14-A/comparison-v3.json'),
 ('D-M08-A','matched v3','FullSourcePASS / FullSourceFAIL','Exact source comparison; no treatment speed win or general causal estimate','reviews/targeted-cohort3/D-M08-A-v3/PAIR_COMPARISON.json'),
 ('D-M02-B','candidate v3 / review v2','X/Y finals supported with stated conditions','X intermediate defect corrected later; Y minor wording limit; same-author/provenance remains separate','reviews/targeted/D-M02-B/source-review-v2/REVIEW.json'),
 ('D-M03-B','v2','X qualification required / Y consequential errors','Both original full-artifact scientific-pass fields false; separate method/carrier limits','reviews/targeted/D-M03-B/source-review-v2/REVIEW.json'),
 ('D-M01-B','paired assessment v2','Conditional support with precision/intermediate issues','No numeric or pass/fail grade invented; original byte-identity/condition limits retained','reviews/targeted/D-M01-B/source-review-v2-paired/REVIEW.json'),
 ('D-M03-A','assessment v2 X/Y','Material corrections required, each original review','Independent assessment outputs and exact mapped original candidates','reviews/targeted/D-M03-A/source-review-v2-X/REVIEW.json'),
 ('I-METHOD-01','original v1','FAIL / PASS_WITH_LIMITATIONS','Diagnostic qualification separate from all six axes/full obligations','helpers/integrated-execution/method01-pair-disposition-v1.json'),
 ('I-METHOD-03','original v1','FAIL / FAIL','Different inventories/defects; missing active final proofs and overrun retained','helpers/integrated-execution/method03-pair-disposition-v1.json'),
 ('I-METHOD-05','original v1','FAIL / FAIL','Full assessment differs from fulfilled requirements; discovery/history gaps retained','helpers/integrated-execution/method05-pair-disposition-v1.json'),
 ('I-METHOD-06','original v1','PASS_WITH_LIMITATIONS / FAIL','Control requirement and chronology limits retained; no treatment source-correct win','helpers/integrated-execution/method06-pair-disposition-v1.json'),
 ('I-METHOD-02 / 04','original v1 failures; LASTv2 protocol','UNASSESSED paired source result','Original infrastructure/native/failed-cost records preserved; new policy not completion','helpers/integrated-execution/method02-pair-disposition-v1.json'),
 ('I-FAST-01','original paired gate + standalone treatment','Paired incomplete; treatment PASS_WITH_LIMITATIONS','Standalone SourcePASS with fulfillment limits is not paired speed win','reviews/integrated-methods/I-FAST-01/treatment/standalone-diagnostic-v1/frozen-standalone-review.json'),
 ('C-02','actual original Source6','FAIL / HOLD','ONE delivered disposition; treatment O1 remainder; not both-arm full-source assessed','reviews/confirmation/C-02/COMPARISON.json'),
 ('C-01','original treatment only','Treatment FAIL','Control reviewer not frozen; no completed-pair claim','reviews/confirmation/C-01/treatment/source-review-v1/REVIEW_FREEZE.json'),
]
generate('BATCH006_COMPARISON_TRANCHE.json',{'schema':'ER10-batch006-completed-comparison-tranche-v1','cutoff':CUTOFF,'campaign_complete':False,'rows':[{'case':a,'version':b,'display_original_grade_only':c,'limits':d,'exact_original_record':str(R/e),'published_record':entry(e)['target_path'] if entry(e) else None} for a,b,c,d,e in rows],'count_rule':'These index rows are not final campaign denominators or necessarily eligible method comparisons. Forty immutable slots/eighty arms are protocol counts; attempts/critics/helpers/reviews do not add logical comparisons.'})
notes='''The fixed cutoff is a publication boundary while queues continue. Original scientific judgments, scope inventories, remainders, requirement-fulfillment limits, and failed costs remain in exact bytes. Completed assessment does not mean satisfied requirements. Six scientific axes, SourcePASS, native active/terminal state, T3 delivery, review deadline, method/provenance eligibility and economics remain separate. Different FAIL defect counts establish neither equality nor ranking. No new scientific evaluation or source research was performed.

Cold-arm/request-to-delivery, occupied/service, queue, parent handoff gaps, helper preparation and reviewer time are separately observable where original records expose them. Native Goal cumulative counters remain unsummed, distinct from Codex token_count usage. Original null input/cache/generated/reasoning/billing fields are unchanged. The completed root C02 session observation is separate telemetry, with its own session coverage and binding limits; billing and remaining quota remain unknown. Filenames and capture bytes are not source-operation counts.

Only original files unchanged during bounded reading with modification time at or before the fixed cutoff were selected, after inspecting frozen/quiet stage receipts. A completed turn ID or file alone never supplies a source assessment or native activation proof. Frozen predispatch tasks/config/maps for later stages are marked PROTOCOL_ONLY_NOT_COMPLETION; their live outputs and unfinished review findings were not opened. Advisory maps remain advisory, with original scope audits retained. Original trailing whitespace was not changed. Three original JSON files have nonstandard trailing content (two literal escaped newline suffixes and one extra brace); exact bytes remain published with explicit parse limits, rather than claimed strict-JSON validity. Out-of-scope, unresolved relative locators, missing and mismatched identities are recorded without patching original science. Four working-summary references bind earlier aggregate versions; exact historical identities are separately resolved where available, never replaced by current hashes.

Raw public vendor articles/code/source bodies, PDFs, complete corpus/derived text, full model transcripts, logs, databases/profiles, credentials, nested clones and run scratch are excluded from new payload. Small already-authored bounded witnesses and authored check/fixture code may be retained where distinctly identified. Raw identity records retain exact hashes/bytes and metadata locators; private retention is UNKNOWN/unverified. A hash is not reconstruction and no private archive verification is claimed. P27 GLM historical witness absence remains an original limitation in earlier publications, not a new invented witness. Earlier published bodies and historical files are not deleted or replaced by this append-only tranche.
'''
lines=['# ER10 publication BATCH006',f'\nFixed cutoff `{CUTOFF}`. Campaign incomplete. Verified existing reference commit `{COMMIT}` on `t3/research/er10-research-efficiency-campaign`.\n',notes,'\n| Case | Exact version | Original grade/disposition | Coverage/eligibility limit | Evidence |\n|---|---|---|---|---|\n']
for a,b,c,d,e in rows:lines.append(f'| {a} | {b} | {c} | {d} | {link(e,"original record")} |\n')
lines+=['\nThe immutable count contract is '+link('state/logical-slot-index-v1.json','40 slots / 80 arms')+'. Its 24 targeted, 12 integrated and 4 confirmation slots are declared design counts, not completed assessment denominators. Versions remain attempts within each slot.\n','\nRoot schedule: '+link('state/final-finite-prospective-admissions-v3.json','finite prospective schedule')+'; '+link('state/final-finite-t0-interpretation-before-starts-v1.json','T0 clarification')+'. New 40/20/30-minute expanded versions are not original-budget success.\n','\nActual confirmation lock: '+link('locks/confirmation-selection.json','exact 9ba0418… original')+'. The earlier same-named historical lock remains unchanged. Resolve by exact original path + SHA, never filename/latest/best-grade.\n','\nSeparate usage supplement: '+link('state/C-02-actual-Codex-session-usage-observation-v1.json','completed root C02 raw Codex token_count observation')+'. The live recorded-usage reader outputs are excluded.\n','\nReproduction: checkout the pinned existing commit, overlay only the new payload paths listed in [manifest](BATCH006_MANIFEST.json), and verify every target SHA/byte count with the included [validator](helpers/publication-batch006/validate.py). Existing references bind immutable commit blobs; new collision bytes live under `batch006-frozen-originals/<original-relative>`. Use '+link('helpers/final-report/resolve_public_evidence.py','exact identity resolver')+' with the original path and SHA to find the precise published version. Re-run authored scientific fixtures only according to their original tasks and input maps; source/API/runtime availability and licenses must be respected. No scientific fixture was re-executed for this publication. Full excluded raw source bodies must be lawfully retrieved from the original URL/version/commit/locator; exact replay may be impossible where upstream capture/version metadata is incomplete or mutable.\n','\n[Mechanical validation](BATCH006_VERIFICATION.json), [absences and deferrals](BATCH006_ABSENCES_AND_DEFERRALS.json), [raw identities](BATCH006_RAW_SOURCE_IDENTITIES.json), [machine-readable comparison tranche](BATCH006_COMPARISON_TRANCHE.json). Root alone writes Git and publishes; this helper only stages new paths.\n']
generate('INDEX_BATCH006.md',''.join(lines))

validator='''#!/usr/bin/env python3
"""Verify every exact BATCH006 payload/reference byte; no scientific grading."""
import argparse, hashlib, json, subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('manifest',type=Path);p.add_argument('--repo',type=Path,required=True);p.add_argument('--staging',type=Path);a=p.parse_args()
m=json.loads(a.manifest.read_bytes());bad=[];counts={};original_parse_limits=[]
for e in m['entries']:
    disposition=e['disposition'];counts[disposition]=counts.get(disposition,0)+1
    target=e['target_path'];path=(a.repo/target).resolve()
    if a.repo.resolve() not in path.parents:bad.append({'target':target,'error':'path_escape'});continue
    staged=a.staging/target if a.staging else None
    try:
        if disposition=='EXISTING_EXACT_COMMIT_REFERENCE':
            b=subprocess.check_output(['git','-C',str(a.repo),'show',e['reference_commit']+':'+target])
        else:b=(staged if staged and staged.is_file() else path).read_bytes()
        if hashlib.sha256(b).hexdigest()!=e['target_sha256'] or len(b)!=e['target_bytes']:bad.append({'target':target,'error':'identity_mismatch'})
        if target.endswith('.json'):
            try:json.loads(b)
            except ValueError:
                if e.get('original_path') and e.get('json_parse_status','').startswith(('PREFIX_JSON','ORIGINAL_JSON')):original_parse_limits.append({'target':target,'status':e['json_parse_status'],'exact_identity_verified':True})
                else:raise
    except Exception as ex:bad.append({'target':target,'error':type(ex).__name__})
print(json.dumps({'entries':len(m['entries']),'counts':counts,'failures':bad,'original_parse_limits':original_parse_limits,'science_regraded':False},indent=2));raise SystemExit(bool(bad))
'''
generate('helpers/publication-batch006/validate.py',validator)
manifest={'schema':'ER10-publication-batch006-manifest-v1','cutoff':CUTOFF,'verified_reference_commit':COMMIT,'repository_url':'https://github.com/sittingmongoose/Puppet-Master','branch':'t3/research/er10-research-efficiency-campaign','campaign_complete':False,'scientific_regrading':False,'entries':entries,'self_hash':'EXCLUDED_SELF_HASH_MANIFEST_IDENTITY_IN_CURATION_REPORT'}
dump(P/'BATCH006_MANIFEST.json',manifest)
# Remove only our unmanifested staging files (e.g. initially classified API patches).
needed={str((S/e['target_path']).resolve()) for e in entries if e['disposition']!='EXISTING_EXACT_COMMIT_REFERENCE'}|{str((P/'BATCH006_MANIFEST.json').resolve())}
for p in S.rglob('*'):
    if p.is_file() and str(p.resolve()) not in needed:p.unlink()
payload=[p for p in S.rglob('*') if p.is_file()];total=sum(p.stat().st_size for p in payload)
assert total<=512*1024*1024,total
report={'schema':'ER10-publication-batch006-curation-report-v1','status':'STAGED_FINITE_CUTOFF_TRANCHE_NO_GIT_WRITES','cutoff':CUTOFF,'deadline':CFG['deadline'],'writing_reserve_minutes':CFG['writing_reserve_minutes'],'finished_at':dt.datetime.now(dt.timezone.utc).isoformat(),'staging_root':str(S),'report_root':str(P),'manifest_path':str(P/'BATCH006_MANIFEST.json'),'manifest_sha256':sha((P/'BATCH006_MANIFEST.json').read_bytes()),'index_path':str(P/'INDEX_BATCH006.md'),'raw_source_identities_path':str(P/'BATCH006_RAW_SOURCE_IDENTITIES.json'),'validation_path':str(P/'BATCH006_VERIFICATION.json'),'entries':len(entries),'entry_dispositions':dict(collections.Counter(e['disposition'] for e in entries)),'new_exact_copies':new_count,'new_exact_copy_bytes':copy_bytes,'staged_files':len(payload),'staged_bytes':total,'max_staging_bytes':512*1024*1024,'raw_source_identity_count':len(raw),'freeze_check_counts':dict(counts),'collision_count':len(collisions),'campaign_complete':False,'git_edits':False,'git_commit_or_push':False,'raw_transcripts_or_reader_outputs_published':False,'validation_command':f'python3 {P}/helpers/publication-batch006/validate.py {P}/BATCH006_MANIFEST.json --repo {W} --staging {S}'}
dump(H/'curation-report.json',report)
print(json.dumps(report,indent=2))
