#!/usr/bin/env python3
"""Offline frozen-only publication builder. Never writes the live report."""
import argparse, ast, collections, hashlib, json, re, subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCHEMA = 'final-freeze-prep-v2'
U = 'UNKNOWN'
MISSING = ('D-R1-03', 'treatment')
CAP = 'publication-source-body-repair-v1'
EXCLUDED = {'private', '__pycache__', 'scratch', 'activity', 'transcripts', 'cache', 'node_modules', '.git'}

PRIVATE_IDENTITY = re.compile(r'(?i)AUTHORIZED_PROVIDER_INSTANCE(?:\.com)?|AUTHORIZED_PROVIDER_INSTANCE')
PUBLIC_EMAIL = r'[A-Za-z0-9._%+\-]+@(?!users\.noreply\.github\.com\b|noreply\.github\.com\b)[A-Za-z0-9.\-]+\.[A-Za-z]{2,}'

def walk_pointers(x, pointer=''):
    if isinstance(x, dict):
        yield pointer, x
        for k,v in x.items(): yield from walk_pointers(v, pointer+'/'+str(k).replace('~','~0').replace('/','~1'))
    elif isinstance(x, list):
        for i,v in enumerate(x): yield from walk_pointers(v,pointer+'/'+str(i))

def pin_record(source, pointer, row, current, strict=False):
    record={'source_path':source,'source_pointer':pointer,'original_reference':row,
            'path':row.get('path',row.get('source_path')),'expected_sha256':row['sha256'],
            'current_sha256':current,'matches':current==row['sha256'],'enforced_current_pin':strict}
    if strict: require(record['matches'], 'current implementation pin mismatch: '+source+pointer)
    return record

META_FIELDS = set(('threadId runId taskId id status latestTerminalStatus hasPendingChildRuns '
    'ordinal createdAt requestedAt startedAt completedAt terminalAt finishedAt endedAt updatedAt '
    'requestAt startAt terminalStatus requestId activeRunId latestRunId pendingRequestCount '
    'providerInstanceId requestedProvider model requestedModel reasoningEffort serviceTier '
    'requestedServiceTier requestedReasoningEffort hasMore nextPosition at at_utc observed_at_utc '
    'created_at requested_at started_at completed_at terminal_at').split())
BODY_FIELDS = {'activity','activities','messages','message','text','body','prompt','assignment','systemPrompt','instructions'}

def extract_meta(raw):
    """Allowlist native lifecycle values; parse structured text solely to project metadata."""
    def project(x):
        if isinstance(x,list):
            return [v for item in x if (v:=project(item)) not in ({},[],None)]
        if not isinstance(x,dict): return None
        result={}
        for k,v in x.items():
            if k in META_FIELDS and isinstance(v,(str,int,float,bool,type(None))): result[k]=v
            elif k=='content' and isinstance(v,list):
                parsed=[]
                for item in v:
                    if isinstance(item,dict) and item.get('type')=='text':
                        try: val=project(json.loads(item.get('text','')))
                        except (ValueError,TypeError): continue
                        if val: parsed.append(val)
                if parsed: result['structured_content_metadata']=parsed
            elif k in {'actual_response','terminal_task_status','raw','structuredContent'} and isinstance(v,str):
                try: val=project(json.loads(v))
                except (ValueError,TypeError): continue
                if val: result[k]=val
            elif k not in BODY_FIELDS and isinstance(v,(dict,list)):
                val=project(v)
                if val: result[k]=val
        return result
    value=project(raw)
    return value if isinstance(value,list) else [value] if value else []

def native_envelope(pub, obj, kind=None):
    if kind=='native_host' or re.search(r'(?i)host_capture|task[-_]status', Path(pub).name): return True
    signatures={'structuredContent','actual_response','terminal_task_status','recentRuns'}
    if isinstance(obj,list): return any(native_envelope('',item) for item in obj)
    return isinstance(obj,dict) and bool(signatures & set(obj) or ('content' in obj and isinstance(obj['content'],list))
        or ('taskId' in obj and 'status' in obj and set(obj)&{'messages','threadId','hasPendingChildRuns','recentRuns'})
        or ('threadId' in obj and set(obj)&{'messages','runs','run'}))

def nested_native_projection(x):
    if isinstance(x,dict) and x.get('schema')=='er12.public-native-lifecycle.v1': return x
    if native_envelope('',x):
        return {'schema':'er12.public-native-lifecycle.v1','actual_lifecycle_metadata':extract_meta(x),
                'omitted_activity_message_bodies':True,'original_json_value_sha256':sha(encode(x))}
    if isinstance(x,dict): return {k:nested_native_projection(v) for k,v in x.items()}
    if isinstance(x,list): return [nested_native_projection(v) for v in x]
    return x


def public_readme(counts, analysis):
    labels=', '.join(f'{k}: {v}' for k,v in sorted(counts['source_labels'].items()))
    return (f"# Current frozen scientific results\n\n"
        f"{counts['attempts']} assigned attempts; {counts['delivered_original_finals']} original finals; "
        f"{counts['original_source_judgments']} original independent judgments; {counts['unassessed']} unassessed. "
        f"Original source labels: {labels}.\n\n"
        f"[Complete supplied analysis]({analysis}) · [80-row results](mechanics/results-table-final/table.json) · "
        f"[Original reviews and delivery whitelist](provenance/FINAL_WHITELIST.json) · "
        f"[Evidence and input dependencies](provenance/SELECTED_INPUT_DEPENDENCIES.json) · "
        f"[Evidence lineage and omissions](provenance/FINAL_PRIVACY_AND_LINEAGE.json)\n\n"
        f"[Portable v2 recipe](recipes/materialize-v2/README.md) (21 files, 236 retained checks); "
        f"[portable v3 recipe](recipes/materialize-v3/README.md) (33 files, 194 retained checks). "
        f"Checks retained without rerun; no scientific or production qualification inferred.\n\n"
        f"Failures and limitations remain in the complete analysis and original reviews. "
        f"D-R1-03 treatment is MISSING_PRE_INPUT_GUARD_FAILURE / UNASSESSED. "
        f"Billing, vendor-effective settings and omitted source coverage remain UNKNOWN. "
        f"Full authored science and requested settings retained; native/source bodies privately archived. "
        f"No live host/source retrieval; original hash reads use actual frozen inputs.\n")

def sha(b): return hashlib.sha256(b).hexdigest()
def load(p): return json.loads(Path(p).read_bytes())
def require(ok, message):
    if not ok: raise ValueError(message)
def relpath(s):
    p = Path(s)
    require(not p.is_absolute() and '..' not in p.parts and str(p) not in ('', '.'), 'unsafe relative path: '+str(s))
    return p.as_posix()
def key(r): return (r['slot'], r['arm'])
def walk(x):
    if isinstance(x, dict):
        yield x
        for v in x.values(): yield from walk(v)
    elif isinstance(x, list):
        for v in x: yield from walk(v)
def capsule(raw):
    try: d = json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        try:
            t = raw.decode(); m = re.search(r'```json\s*(.*?)\s*```', t, re.S)
            d = json.loads(m[1]) if m else None
        except (ValueError, UnicodeDecodeError): return None
    return d if isinstance(d, dict) and d.get('schema') == CAP else None

def functions(path, names, ns):
    # Execute only individually named function definitions, never module orchestration.
    tree = ast.parse(path.read_text()); found = set()
    for n in tree.body:
        if isinstance(n, ast.FunctionDef) and n.name in names:
            exec(compile(ast.Module(body=[n], type_ignores=[]), str(path)+'#'+n.name, 'exec'), ns)
            found.add(n.name)
    require(found == set(names), 'missing pinned function')

def policies(runtime, public, checkpoint):
    mechanics = runtime/'mechanics'
    for p, h in load(HERE/'POLICY_PINS.json').items():
        require(sha((mechanics/p).read_bytes()) == h, 'policy changed: '+p)
    ns = {'re': re, 'R': runtime, 'B': public,
          'email': re.compile(PUBLIC_EMAIL),
          'routes': {'AUTHORIZED_PROVIDER_INSTANCE', 'AUTHORIZED_PROVIDER_INSTANCE', 'AUTHORIZED_PROVIDER_INSTANCE'}}
    functions(mechanics/'publication-cohort3/refresh.py', ['collect', 'clean'], ns)
    ns['collect'](checkpoint)
    base = ns['clean']
    def clean(s):
        s = base(s)
        s = re.sub(r'(?i)AUTHORIZED_PROVIDER_INSTANCE', 'AUTHORIZED_PROVIDER_INSTANCE', s)
        s = re.sub(PRIVATE_IDENTITY.pattern, 'AUTHORIZED_PROVIDER_INSTANCE', s)
        s = re.sub(r'ubuntu-agent-(?:nas1|p1000)|192\.168\.50\.(?:136|179)', 'ER12_RUNTIME', s)
        return re.sub(r'[A-Za-z]:[\\/](?:Users|home)[\\/][^\s"\'<>`),;\]}]+', 'ER12_RUNTIME', s)
    ns.update({'sha': sha, 'json': json, 'bindings': {}})
    functions(mechanics/'publication-cohort4/refresh.py', ['walk', 'classify'], ns)
    functions(mechanics/'publication-cohort4/finalize.py', ['extract_meta'], ns)
    pn = {'re': re}
    for n in ast.parse((mechanics/'publication-cohort3/finalize.py').read_text()).body:
        if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id in {'email','patterns'} for t in n.targets):
            exec(compile(ast.Module(body=[n],type_ignores=[]),'pinned-privacy','exec'), pn)
    pn['patterns']['email'] = re.compile(PUBLIC_EMAIL)
    pn['patterns']['private_identity_prefix'] = PRIVATE_IDENTITY
    ns['pinned_extract_meta'] = ns['extract_meta']
    ns['extract_meta'] = extract_meta
    return clean, ns, pn['patterns']

def normalize(x, clean):
    if isinstance(x, dict): return {clean(k): normalize(v, clean) for k,v in x.items()}
    if isinstance(x, list): return [normalize(v, clean) for v in x]
    if isinstance(x, str):
        if x.strip().startswith(('{','[')):
            try: return json.dumps(normalize(json.loads(x), clean), ensure_ascii=False)
            except ValueError: pass
        return clean(x)
    return x

def encode(d): return (json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode()

def reconcile(f, assessments, results, accounting):
    attempts = f['attempts']; finals = f['delivered_original_finals']; judged = f['original_completed_judgments']
    keys = [key(x) for x in attempts]
    require(len(keys)==80 and len(set(keys))==80, 'exactly 80 unique attempts required')
    require(all(a in {'control','treatment'} for _,a in keys), 'unknown arm')
    require(len({s for s,_ in keys})==40, '40 paired slots required')
    require(len(finals)==79 and len({key(x) for x in finals})==79, '79 unique original deliveries required')
    require(len(judged)==79 and len({key(x) for x in judged})==79, '79 unique original judgments required')
    expected = set(keys)-{MISSING}
    require({key(x) for x in finals}=={key(x) for x in judged}==expected, 'original whitelist mismatch')
    m = next(x for x in attempts if key(x)==MISSING)
    require(m.get('disposition')=='MISSING_PRE_INPUT_GUARD_FAILURE' and m.get('assessment_state')=='UNASSESSED', 'missing guard row contract')
    labels = {}
    for r in judged:
        d = assessments[r['public_path']]
        require(isinstance(d.get('source_judgment'), str), 'original source label missing')
        labels[key(r)] = d['source_judgment']
    rows = results['rows']
    require(len(rows)==80 and {key(x) for x in rows}==set(keys), 'explicit results must contain exact 80 attempts')
    for r in rows:
        require(r.get('source_judgment') == labels.get(key(r), U), 'results label differs from immutable assessment')
        if key(r)==MISSING:
            require(r.get('assessment_state')=='UNASSESSED', 'missing attempt must remain unassessed')
    aa = accounting.get('logical_arms', [])
    require(len(aa)==80 and {key(x) for x in aa}==set(keys), 'accounting must contain exact 80 attempts')
    return {'attempts':80, 'delivered_original_finals':79, 'original_source_judgments':79,
            'unassessed':1, 'source_labels':dict(collections.Counter(labels.values())),
            'missing_attempt':{'slot':MISSING[0],'arm':MISSING[1], 'disposition':'MISSING_PRE_INPUT_GUARD_FAILURE','assessment_state':'UNASSESSED'}}, labels

def actual_config_path(slot, arm):
    # ROLE arms used the saved native dispatch request itself as their actual config.
    return f"runs/{slot}/{arm}/stages/role/request.json" if slot.startswith("B-") else f"configs/{slot}-{arm}.json"

def global_inventory(core, runtime, frozen, args):
    """Finite ownership selection after the root quiet freeze; no source semantics."""
    files={}; deps=[]; hash_records=[]; digests={}
    def dependency_sha(p):
        # Read once per original path during finite selection. Original end-of-build
        # SHA checks still re-read EVERY selected input and refuse mutations.
        p=Path(p);key=str(p)
        if key not in digests:digests[key]=sha(p.read_bytes())
        return digests[key]
    def add(p, pub=None):
        if not p.is_file(): return
        require(not p.is_symlink(), 'selected symlink')
        pub=pub or str(p.relative_to(runtime));pub=relpath(pub)
        require(pub not in files or files[pub]['original_path']==str(p), 'selected collision')
        h=dependency_sha(p)
        files[pub]={'public_path':pub,'original_path':str(p),'source_path':str(p),'sha256':h,'bytes':p.stat().st_size,'kind':'native_host' if 'host' in p.parts and p.suffix=='.json' else 'owned'}
    def tree(d):
        if not d.exists():return
        require(not d.is_symlink(),'selected directory symlink')
        for p in sorted(d.rglob('*')):
            if not set(p.relative_to(d).parts)&EXCLUDED:add(p)
    for arm in core['arms']:
        slot,name=arm['armId'].rsplit('/',1)
        tree(runtime/'runs'/slot/name);tree(runtime/'runs'/slot/'inputs')
        add(runtime/actual_config_path(slot,name))
        for base in ['frozen-inputs','cases','cases-rest','role-cases','role-cases-v2','future-cases']:
            tree(runtime/base/slot)
        if arm['delivery']['disposition']=='DELIVERED':tree(runtime/'assessment'/slot/(name+'-v1'))
    for base in ['methods','helpers','recipes']:tree(runtime/base)
    # Mechanical editions are selected; old publication workspaces/private archives stay out.
    for p in sorted((runtime/'mechanics').iterdir()):
        if p.name.startswith('publication-') or p.name.startswith(('final-freeze-prep-','cleanup-final-prep-','cleanup-inventory-')):continue
        if p.is_file():add(p)
        else:tree(p)
    for name,p in [('accounting',args.accounting),('results',args.results),('analysis',args.analysis)]:
        p=p.resolve();require(p.is_file(),'explicit upstream absent')
        if p.is_relative_to(runtime):
            if name=='analysis':tree(p.parent)
            add(p)
        else:add(p,'analysis/final-inputs/'+name+'/'+p.name)
    # Input-map locators name finite actual dependencies; never infer a scientific grade.
    for p,r in list(files.items()):
        if Path(p).name!='input-map.json':continue
        im=load(r['source_path'])
        locs=[(k,im[k]) for k in ['brief','common_assignment','fixture','revealed_plan'] if isinstance(im.get(k),str)]+[('predecessor',v) for v in im.get('predecessors',[]) if isinstance(v,str)]
        for kind,loc in locs:
            q=Path(loc.removeprefix('ER12_RUNTIME/'));q=q if q.is_absolute() else runtime/q
            require(q.is_relative_to(runtime) and q.is_file(),'actual input-map dependency absent/outside runtime')
            add(q);deps.append({'task_input_map':p,'dependency_kind':kind,'public_path':str(q.relative_to(runtime)),'original_locator':loc})
    # Recursively preserve actual implementation pins from lock/config/mechanical records.
    inspected=set()
    while True:
        pending=[r for r in files.values() if r['public_path'] not in inspected and Path(r['public_path']).suffix=='.json' and r['public_path'].startswith(('methods/','mechanics/','helpers/','configs/'))]
        if not pending:break
        for r in pending:
            inspected.add(r['public_path'])
            try:d=load(r['source_path'])
            except ValueError:continue
            for pointer,row in walk_pointers(d):
                loc=row.get('path',row.get('source_path'));h=row.get('sha256')
                if not isinstance(loc,str) or not isinstance(h,str) or not re.fullmatch('[0-9a-f]{64}',h):continue
                q=Path(loc.removeprefix('ER12_RUNTIME/'));q=q if q.is_absolute() else runtime/q
                if q.is_relative_to(runtime) and q.is_file() and not set(q.relative_to(runtime).parts)&EXCLUDED:
                    strict = bool(re.fullmatch(r'methods/[CD]-R[12]/RECIPE_LOCK\.json',r['public_path']) and pointer.startswith('/frozen_implementation/'))
                    hash_records.append(pin_record(r['public_path'],pointer,row,dependency_sha(q),strict));add(q)
                else:
                    strict = bool(re.fullmatch(r'methods/[CD]-R[12]/RECIPE_LOCK\.json',r['public_path']) and pointer.startswith('/frozen_implementation/'))
                    hash_records.append(pin_record(r['public_path'],pointer,row,None,strict))
    # Root scientific/assessment original references are authoritative and immutable.
    for arm in core['arms']:
        for rec in arm['scientific_artifacts']+[arm['original_assessment'].get('artifact',{})]:
            if not rec:continue
            p=Path(rec['path']);pub=str(p.relative_to(runtime))
            require(pub in files and files[pub]['sha256']==rec['sha256'],'root frozen science hash mismatch: '+pub)
    protected={str(p.relative_to(args.prior_public.resolve())):sha(p.read_bytes()) for p in args.prior_public.resolve().rglob('*') if p.is_file() and capsule(p.read_bytes())}
    roots={'materialize-v2':'provenance/materialize-v2/ROOT_VERIFICATION.json','materialize-v3':'recipes/materialize-v3/ROOT_VERIFICATION.json'}
    add(runtime/'recipes/materialize-v2/private/ROOT_VERIFICATION.json',roots['materialize-v2'])
    add(runtime/'recipes/materialize-v3/ROOT_VERIFICATION.json')
    return {'state':'FROZEN','all_candidates_and_evaluators_quiet':True,'files':list(files.values()),'protected_capsules':protected,'dependencies':deps,'historical_hash_records':hash_records,'recipe_root_verifications':roots,'selection_complete':True,'required_coverage':{'all80_owned_runs_configs_prompts_requests_input_maps_briefs_plans_source_maps_dispositions_checks':True,'all79_original_reviews':True,'all_CD_locks_mechanical_versions_actual_recipes_helper_pins':True}}

def main(args):
    frozen = args.freeze_dir.resolve(); runtime = args.runtime.resolve(); prior = args.prior_public.resolve()
    out = (HERE/relpath(args.output_name)).resolve()
    require(out.is_relative_to(HERE) and out!=HERE and not out.exists(), 'output must be a new child of this preparation directory')
    require(frozen.is_dir() and prior.is_dir(), 'frozen/prior directories required')
    freeze_file = frozen/'FREEZE.json'
    if not freeze_file.exists():
        freeze_file = frozen/'global-root-science-freeze.json'
        core = load(freeze_file)
        require(core.get('schema')=='er12.global-root-science-freeze.v1', 'unsupported global root freeze')
        f = load(frozen/'PUBLICATION_INPUTS.json') if (frozen/'PUBLICATION_INPUTS.json').exists() else global_inventory(core,runtime,frozen,args)
        f['schema'] = SCHEMA
        cpfile = Path(core['checkpoint']['path']).resolve()
        require(cpfile.is_relative_to(frozen), 'global checkpoint must be in frozen directory')
        f['checkpoint'] = {'frozen_path':str(cpfile.relative_to(frozen)), 'sha256':core['checkpoint']['sha256']}
        by_original = {r['original_path']:r for r in f['files']}
        f['attempts']=[]; f['delivered_original_finals']=[]; f['original_completed_judgments']=[]
        for arm in core['arms']:
            slot, name=arm['armId'].rsplit('/',1); a={'slot':slot,'arm':name}
            if (slot,name)==MISSING: a.update(disposition='MISSING_PRE_INPUT_GUARD_FAILURE',assessment_state='UNASSESSED')
            f['attempts'].append(a)
            if arm['delivery']['disposition']=='DELIVERED':
                for field, record in [('delivered_original_finals', arm['delivery']), ('original_completed_judgments', arm['original_assessment']['artifact'])]:
                    path = record['final_path'] if field=='delivered_original_finals' else record['path']
                    require(path in by_original, 'global frozen original absent from publication inventory')
                    r=by_original[path]
                    require(r['sha256']==record['sha256'], 'global selected hash mismatch')
                    f[field].append({**a,'public_path':r['public_path'],'sha256':r['sha256']})
    else:
        f = load(freeze_file)
    initial_freeze_sha = sha(freeze_file.read_bytes())
    supplemental_path=frozen/'PUBLICATION_INPUTS.json'
    supplemental_sha=sha(supplemental_path.read_bytes()) if supplemental_path.is_file() else None
    require(f.get('schema') in {SCHEMA,'final-freeze-prep-v1'} and f.get('state') in {'COMPLETE','FROZEN','READY'}, 'freeze incomplete or wrong schema')
    require(f.get('all_candidates_and_evaluators_quiet') is True, 'root quiet attestation required')
    checkpoint_path = frozen/relpath(f['checkpoint']['frozen_path'])
    require(sha(checkpoint_path.read_bytes())==f['checkpoint']['sha256'], 'checkpoint hash')
    checkpoint_bytes = checkpoint_path.read_bytes()
    checkpoint = json.loads(checkpoint_bytes)
    tasks = checkpoint.get('candidateTasks', [])+checkpoint.get('evaluationTasks', [])+checkpoint.get('setupTasks', [])
    require(tasks and all(x.get('hasPendingChildRuns') is False and x.get('status') in {'completed','failed','cancelled','canceled','complete'} for x in tasks), 'checkpoint not quiet')
    entries = f['files']; selected = {}; raws = {}; input_hashes = {}
    for r in entries:
        pub = relpath(r['public_path']); fp = Path(r['source_path']).resolve() if 'source_path' in r else (frozen/relpath(r['frozen_path'])).resolve()
        require((fp.is_relative_to(frozen) or fp.is_relative_to(runtime)) and fp.is_file() and not fp.is_symlink(), 'frozen file escapes/missing')
        require(pub not in selected, 'duplicate selected public path')
        raw = fp.read_bytes(); require(sha(raw)==r['sha256'], 'frozen hash: '+pub)
        selected[pub]=r; raws[pub]=raw; input_hashes[str(fp)]=sha(raw)
    for version in ['C-R1','C-R2','D-R1','D-R2']:
        lock='methods/'+version+'/RECIPE_LOCK.json'
        require(lock in raws, 'current recipe lock absent: '+lock)
        for pointer,row in walk_pointers(json.loads(raws[lock])):
            if not pointer.startswith('/frozen_implementation/') or 'sha256' not in row: continue
            loc=row.get('path',row.get('source_path')); require(isinstance(loc,str),'current pin path absent')
            dep=loc.removeprefix(str(runtime)+'/').removeprefix('ER12_RUNTIME/')
            require(dep in raws,'current pinned implementation absent: '+dep)
            pin_record(lock,pointer,row,sha(raws[dep]),True)
    if freeze_file.name=='global-root-science-freeze.json':
        for arm in core['arms']:
            for rec in arm['scientific_artifacts']+[arm['original_assessment'].get('artifact',{})]:
                if not rec: continue
                require(rec['path'] in by_original and by_original[rec['path']]['sha256']==rec['sha256'],'root frozen science hash mismatch')
    # Exact explicit upstream products, never discover a newest edition or rerun a builder.
    upstream = {}
    for name,p in [('accounting',args.accounting),('results',args.results),('analysis',args.analysis)]:
        p = p.resolve(); require(p.is_relative_to(frozen) or p.is_relative_to(runtime), 'explicit upstream must be inside frozen directory or frozen runtime')
        require(str(p) in input_hashes, 'explicit upstream must be freeze-inventoried')
        upstream[name] = load(p) if name!='analysis' else None
    assessments = {r['public_path']:json.loads(raws[r['public_path']]) for r in f['original_completed_judgments']}
    for r in f['original_completed_judgments']+f['delivered_original_finals']:
        require(r['public_path'] in selected and selected[r['public_path']]['sha256']==r['sha256'], 'whitelist file/hash mismatch')
    counts, labels = reconcile(f, assessments, upstream['results'], upstream['accounting'])
    for a in f['attempts']:
        s,arm=key(a)
        require(any(p.startswith(f'runs/{s}/{arm}/') for p in selected), 'owned run missing')
        cfg=actual_config_path(s,arm)
        require(cfg in selected, 'actual config missing: '+cfg)
        if s.startswith('B-'):
            req=json.loads(raws[cfg])['args'];dispatch=json.loads(raws[f'runs/{s}/{arm}/stages/role/dispatch.json'])
            require(req==dispatch['args'] and isinstance(req.get('target'),dict) and isinstance(req.get('clientRequestId'),str),'actual role request config/dispatch mismatch')
    require(len({p.split('/')[1]+'/'+p.split('/')[2] for p in selected if p.startswith('assessment/') and p.endswith('/assessment.json')})==79,'exact original review selection required')
    require(f.get('selection_complete') is True and f.get('required_coverage') == {
        'all80_owned_runs_configs_prompts_requests_input_maps_briefs_plans_source_maps_dispositions_checks':True,
        'all79_original_reviews':True, 'all_CD_locks_mechanical_versions_actual_recipes_helper_pins':True}, 'root exact inventory completeness contract missing')
    for prefix in ['methods/C-R1/','methods/C-R2/','methods/D-R1/','methods/D-R2/','recipes/materialize-v2/','recipes/materialize-v3/']:
        require(any(p.startswith(prefix) for p in selected), 'required selected closure: '+prefix)
    clean, ns, patterns = policies(runtime, prior, checkpoint)
    pinned_policy_bytes={p:(runtime/'mechanics'/p).read_bytes() for p in load(HERE/'POLICY_PINS.json')}
    protected = {}
    old = {}
    for p in sorted(prior.rglob('*')):
        if not p.is_file(): continue
        require(not p.is_symlink(), 'prior symlink rejected')
        rel = relpath(str(p.relative_to(prior))); b = p.read_bytes(); old[rel]=b
        if capsule(b): protected[rel]=sha(b)
    baseline=load(HERE/'CURRENT_CAPSULE_BASELINE.json')
    require(protected==baseline['all_capsules'] and len(baseline['json_capsules'])==1980 and len(baseline['additional_fenced_capsules'])==7,'exact committed 1980 JSON plus seven fenced capsule baseline required')
    for p,h in f['protected_capsules'].items(): require(protected.get(p)==h, 'protected freeze capsule differs')
    require(f['protected_capsules']==protected, 'exact protected1980 whitelist required')
    # Binding lookup uses original paths but frozen bytes only. Classifier itself performs no IO.
    for pub,b in raws.items():
        if Path(pub).name=='source-map.json' or re.search('retriev|source-index|download-manifest',Path(pub).name):
            try: d=json.loads(b)
            except ValueError: continue
            parent=str(runtime/Path(pub).parent)
            ns['bindings'].setdefault(parent,[]).extend((pub,row) for row in walk(d) if any(isinstance(v,str) and v.startswith(('https://','http://')) for v in row.values()))
    # Preserve all selected originals and entire prior public edition BEFORE any output mutation.
    out.mkdir(); private=out/'private'; public=out/'public'
    def save(root,rel,b):
        p=root/relpath(rel);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
    save(private,'root-final-freeze.json',freeze_file.read_bytes())
    save(private,'frozen-checkpoint.json',checkpoint_bytes)
    if supplemental_sha is not None:save(private,'PUBLICATION_INPUTS.json',supplemental_path.read_bytes())
    for p,b in old.items(): save(private/'prior-public',p,b)
    for p,b in raws.items(): save(private/'originals',p,b)
    for p,b in old.items(): save(public,p,b)
    projections=[]; omissions=[]; recipe_pins=set()
    # Inherited raw native envelopes are covered too; protected source capsules stay exact.
    for pub,b in old.items():
        if pub in selected or pub in protected or pub.startswith('recipes/'): continue
        try: obj=json.loads(b)
        except (ValueError,UnicodeDecodeError): continue
        if native_envelope(pub,obj):
            result=encode(normalize({'schema':'er12.public-native-lifecycle.v1',
                'actual_lifecycle_metadata':extract_meta(obj),'original_capture_sha256':sha(b),
                'private_archive_lineage':'publication-final-prep-v5/'+args.output_name+'/private/prior-public/'+pub,
                'omitted_activity_message_bodies':True,'omitted_source_coverage':U},clean))
            save(public,pub,result)
            projections.append({'public_path':pub,'original_sha256':sha(b),'public_sha256':sha(result),
                'original_bytes':len(b),'public_bytes':len(result),'operation':'inherited native envelope metadata projection',
                'private_archive_lineage':'publication-final-prep-v5/'+args.output_name+'/private/prior-public/'+pub})
        else:
            projected=nested_native_projection(obj)
            if projected!=obj:
                result=encode(normalize(projected,clean));save(public,pub,result)
                projections.append({'public_path':pub,'original_sha256':sha(b),'public_sha256':sha(result),
                    'original_bytes':len(b),'public_bytes':len(result),'operation':'inherited embedded native envelope metadata projection',
                    'private_archive_lineage':'publication-final-prep-v5/'+args.output_name+'/private/prior-public/'+pub})

    # Authored portable implementations override capture-directory heuristics, as finalize does.
    for v,n,checks in [('materialize-v2',21,236),('materialize-v3',33,194)]:
        base='recipes/'+v+'/'
        manifest=json.loads(raws[base+'bundle-manifest.json'])
        require(len(manifest['files'])==n and manifest['source_dependency_closure_complete'] is True,'COMPLETE recipe bundle')
        for name in ['bundle-manifest.json','public-input-dependency-manifest.json']:
            for r in json.loads(raws[base+name])['files']:
                p=base+relpath(r['relative_path']); require(p in raws and sha(raws[p])==r['sha256'] and len(raws[p])==r['bytes'],'recipe closure pin: '+p);recipe_pins.add(p)
        ck=json.loads(raws[base+'check-results.json']); require(ck['passed'] is True,'retained offline checks failed')
        require((len(ck['checks']) if isinstance(ck['checks'],list) else ck['checks'])==checks,'retained check count')
        require(all(x['passed'] for x in ck.get('details',ck['checks'] if isinstance(ck['checks'],list) else [])), 'retained individual check failed')
        rootrel=f['recipe_root_verifications'][v];require(rootrel in raws,'root verification missing')
        rd=json.loads(raws[rootrel]);require(rd.get('passed',rd.get('all_checks_passed')) is True,'root verification not passed')
        recipe_pins.update([base+'bundle-manifest.json',base+'public-input-dependency-manifest.json',rootrel])
    original_exceptions={r['path']:r for r in load(prior/'validation/JSON_PARSE_EXCEPTIONS.json')['exceptions']}
    for pub,b in raws.items():
        if pub in original_exceptions:
            require(sha(b)==original_exceptions[pub]['sha256'],'selected malformed original changed')
            save(public,pub,b);continue
        if pub in protected: continue
        if set(Path(pub).parts)&EXCLUDED:
            reason='private runtime/tool capture'; hits=[]; d=None
        elif pub in recipe_pins:
            reason=None;hits=[];d=None
        else: reason,hits,d=ns['classify'](runtime/pub,b)
        try: native_obj=json.loads(b)
        except (ValueError,UnicodeDecodeError): native_obj=None
        if native_envelope(pub,native_obj,selected[pub].get('kind')):
            d=json.loads(b); observations=[]
            for r in d.get('reads',[]) if isinstance(d,dict) else []:
                observations.append({'actual_lifecycle_metadata':ns['extract_meta'](r.get('raw')),'observed_at':r.get('at_utc',r.get('at',U))})
            projected={'schema':'er12.public-native-lifecycle.v1','observations':observations,'actual_lifecycle_metadata':ns['extract_meta'](d), 'original_capture_sha256':sha(b),'private_archive_lineage':'publication-final-prep-v5/'+args.output_name+'/private/originals/'+pub,'omitted_activity_message_bodies':True, 'omitted_source_coverage':U}
            result=encode(normalize(projected,clean)); reason='actual native lifecycle projection; full messages private'
        elif reason:
            summaries=[];urls=[];selectors=[]
            for mp,row in hits:
                rr={k:v for k,v in row.items() if re.search(r'(?i)version|condition|applicability|observation|governing|summary|subject_operation',k) and k not in {'body','text','result'}}
                summaries.append({'authored_source_map':mp,'source_id':row.get('id',row.get('source_id',U)),'existing_authored_summary_fields':rr})
                urls += [v for v in row.values() if isinstance(v,str) and v.startswith(('https://','http://'))]
                selectors += [{k:v} for k,v in row.items() if re.search('locator|selector|line|anchor',k)]
            projected={'schema':CAP,'record_type':'source evidence capsule; fetched body private','classification_basis':reason,'primaryURL':sorted(set(urls)) or U,'source_urls':sorted(set(urls)),'version':[r['existing_authored_summary_fields'] for r in summaries if any('version' in k.lower() for k in r['existing_authored_summary_fields'])] or U,'selector':selectors or U,'conditions':[r['existing_authored_summary_fields'] for r in summaries if any(re.search('condition|applicability|subject_operation',k,re.I) for k in r['existing_authored_summary_fields'])] or U,'versions_conditions_and_authored_summaries':summaries,'original_capture_selectors':selectors,'raw_sha256':sha(b),'rawSHA256':sha(b),'original_bytes':len(b),'private_archive_lineage':'publication-final-prep-v5/'+args.output_name+'/private/originals/'+pub,'quoted_body_words':0,'evidence_coverage':'BOUNDED_EXISTING_AUTHORED_SUMMARY; omitted body coverage UNKNOWN' if summaries else U,'byte_exact_replay':False,'omission':'Full source/native capture private; zero new quotations, no invented summary or semantic repair.'}
            result=encode(normalize(projected,clean));omissions.append({'public_path':pub,**normalize(projected,clean)})
        elif pub in recipe_pins: result=b
        else:
            try: obj=json.loads(b);result=encode(normalize(nested_native_projection(obj),clean))
            except (ValueError,UnicodeDecodeError): result=clean(b.decode()).encode()
        save(public,pub,result)
        projections.append({'public_path':pub,'original_sha256':sha(b),'public_sha256':sha(result),'original_bytes':len(b),'public_bytes':len(result),'operation':reason or 'authored content retained; identity/path normalization only','private_archive_lineage':'publication-final-prep-v5/'+args.output_name+'/private/originals/'+pub})
    def jw(p,d): save(public,p,encode(normalize(d,clean)))
    # Preserve historical editions before replacing current projections (already archived above).
    current={'RESULTS.json','mechanics/SCIENTIFIC_PROGRESS.json','provenance/selected-checkpoint.json','README.md'}
    for p in current:
        if p in old: save(public,'historical/pre-final/'+p,old[p])
    jw('mechanics/results-table-final/table.json',upstream['results'])
    jw('RESULTS.json',{'counts':counts,'rows':'mechanics/results-table-final/table.json','original_source_labels_only':True,'source_grading_rerun':False,'billing':U,'vendor_effective':U,'no_aggregate_usage_claim':True})
    statuses=[{'slot':s,'arm':a,'source_judgment':labels.get((s,a),U),'assessment_state':'UNASSESSED' if (s,a)==MISSING else 'COMPLETED_INDEPENDENT_ASSESSMENT','delivery_disposition':'MISSING_PRE_INPUT_GUARD_FAILURE' if (s,a)==MISSING else 'DELIVERED'} for s,a in sorted(key(x) for x in f['attempts'])]
    jw('mechanics/SCIENTIFIC_PROGRESS.json',{'counts':counts,'logical_arms':statuses,'source_grade_from_completion':False,'basis':'root-final immutable original whitelist'})
    jw('provenance/FINAL_WHITELIST.json',{'attempts':f['attempts'],'delivered_original_finals':f['delivered_original_finals'],'original_completed_judgments':f['original_completed_judgments'],'freeze_sha256':initial_freeze_sha,'counts':counts})
    jw('provenance/selected-checkpoint.json',{'counts':counts,'original_checkpoint_sha256':f['checkpoint']['sha256'],'assessment_states':statuses,'quiet_root_attestation':True})
    methodmap=[{'slot':a['slot'],'arm':a['arm'],'config':actual_config_path(a['slot'],a['arm']),'actual_files':[p for p in selected if p.startswith(f"runs/{a['slot']}/{a['arm']}/")],'requested_model_effort_tier':'retained in actual configs/requests','vendor_effective':U,'billing':U} for a in f['attempts']]
    jw('provenance/FINAL_METHOD_CASE_VERSION_MAP.json',{'attempts':methodmap,'historical_map':'METHOD_CASE_VERSION_MAP.json','recipes':['recipes/materialize-v2/README.md','recipes/materialize-v3/README.md'],'production_qualified':False})
    dependencies=[]
    declared_dependencies={r['public_path'] for r in f['dependencies']}
    for p,b in raws.items():
        if Path(p).name!='input-map.json': continue
        im=json.loads(b)
        locators=[im[k] for k in ['brief','common_assignment','fixture','revealed_plan'] if isinstance(im.get(k),str)]+[v for v in im.get('predecessors',[]) if isinstance(v,str)]
        for loc in locators:
            dep=loc.removeprefix(str(runtime)+'/').removeprefix('ER12_RUNTIME/')
            require(dep in declared_dependencies and dep in selected, 'input-map dependency missing from frozen selection: '+dep)
    for r in f['dependencies']:
        p=relpath(r['public_path']); require(p in selected or p in old,'selected dependency absent: '+p)
        dependencies.append({**r,'public_sha256':sha((public/p).read_bytes()),'available':True})
    jw('provenance/SELECTED_INPUT_DEPENDENCIES.json',{'dependencies':dependencies,'original_hash_namespace':'frozen selected original SHA','public_hash_namespace':'sanitized projection SHA','complete_root_inventory':True})
    jw('provenance/FINAL_PRIVACY_AND_LINEAGE.json',{'files':projections,'protected1980':baseline['json_capsules'],'additional7_fenced':baseline['additional_fenced_capsules'],'protected_all_current':protected,'source_body_omissions':omissions,'prior_public_archive':'publication-final-prep-v5/'+args.output_name+'/private/prior-public','native_goal_counters':'structured frozen accounting core only; raw usage, UNKNOWN billing; never campaign aggregate','new_quotes':0,'full_private_originals':True,'source_semantic_repair':False})
    jw('provenance/FINAL_NAVIGATION.json',{'counts':counts,'results':'RESULTS.json','progress':'mechanics/SCIENTIFIC_PROGRESS.json','methodmap':'provenance/FINAL_METHOD_CASE_VERSION_MAP.json','whitelist':'provenance/FINAL_WHITELIST.json','dependencies':'provenance/SELECTED_INPUT_DEPENDENCIES.json','lineage':'provenance/FINAL_PRIVACY_AND_LINEAGE.json','analysis':next(p for p,r in selected.items() if (Path(r['source_path']).resolve() if 'source_path' in r else (frozen/r['frozen_path']).resolve())==args.analysis.resolve()),'historical_editions':'historical/pre-final/'})
    analysis_rel=next(p for p,r in selected.items() if (Path(r['source_path']).resolve() if 'source_path' in r else (frozen/r['frozen_path']).resolve())==args.analysis.resolve())
    save(public,'README.md',public_readme(counts,analysis_rel).encode())
    jw('provenance/HISTORICAL_HASH_REFERENCES.json',{'records':f.get('historical_hash_records',[]),'original_references_preserved':True,'historical_mismatches_rebound':False})
    prior_manifest=load(prior/'SANITIZATION_MANIFEST.json'); merged={r['public_path']:r for r in prior_manifest['files']}
    for r in projections:
        previous=merged.get(r['public_path'],{})
        merged[r['public_path']]={**previous,**r,'prior_packaging_record':previous} if previous else r
    for p,r in merged.items():
        require((public/p).is_file(),'prior manifest path lost');r['sanitized_sha256']=sha((public/p).read_bytes());r['sanitized_bytes']=(public/p).stat().st_size
    jw('SANITIZATION_MANIFEST.json',{'schema':'er12.publication-sanitation.final','files':sorted(merged.values(),key=lambda x:x['public_path']),'original_lineage_preserved':True,'final_lineage':'provenance/FINAL_PRIVACY_AND_LINEAGE.json'})
    exceptions=load(prior/'validation/JSON_PARSE_EXCEPTIONS.json')['exceptions'];require(len(exceptions)==2,'original two exceptions required')
    def validate():
        malformed=[];stats=collections.Counter()
        for p in sorted(public.rglob('*')):
            if not p.is_file():continue
            rel=str(p.relative_to(public)); b=p.read_bytes();t=b.decode()
            for name,pat in patterns.items():require(not pat.search(t), 'privacy: '+rel+' '+name)
            c=capsule(b)
            if p.suffix=='.json':
                try:json.loads(b);stats['json']+=1
                except ValueError:malformed.append(rel)
            if c:stats['typed_capsules']+=1
            if p.suffix=='.py' and not c:ast.parse(t);stats['authored_python']+=1
            if p.suffix=='.js' and not c:
                v=subprocess.run(['node','--input-type=module','--check'],input=b,capture_output=True)
                require(v.returncode==0,'authored JS syntax: '+rel);stats['authored_javascript']+=1
        require(set(malformed)=={r['path'] for r in exceptions},'malformed JSON exceptions changed')
        for r in exceptions: require(sha((public/r['path']).read_bytes())==r['sha256'] and len((public/r['path']).read_bytes())==r['bytes'],'original malformed exception changed')
        for p,h in protected.items():require(sha((public/p).read_bytes())==h,'protected repaired capsule mutated')
        for v in ['materialize-v2','materialize-v3']:
            for name in ['bundle-manifest.json','public-input-dependency-manifest.json']:
                for r in load(public/'recipes'/v/name)['files']:
                    q=public/'recipes'/v/relpath(r['relative_path']);require(sha(q.read_bytes())==r['sha256'] and q.stat().st_size==r['bytes'],'final recipe closure changed')
        return dict(stats)
    checks=validate();jw('validation/FINAL_PUBLICATION_CHECKS.json',{'status':'PASS','checks':checks,'protected_capsules':len(protected),'protected_json_capsules':1980,'protected_additional_fenced_capsules':7,'original_malformed_exceptions':exceptions,'v2_checks_retained':236,'v3_checks_retained':194,'retained_checks_rerun':False,'source_grades_original':79,'selected_original_hashes_before_after':True,'no_live_host_or_source_retrieval':True,'original_hash_reads':'actual frozen inputs','production_qualified':False})
    jw('PRIVACY_SCAN.json',{'status':'PASS','scope':'all final public bytes including private identity prefix','checks':'validation/FINAL_PUBLICATION_CHECKS.json'})
    # Exact changed/new paths for this edition; no inherited staging counts promoted.
    reserved={'STAGING_FILES.txt','SHA256SUMS'}
    changed={str(p.relative_to(public)) for p in public.rglob('*') if p.is_file() and (str(p.relative_to(public)) not in old or p.read_bytes()!=old[str(p.relative_to(public))])}|reserved
    prefix=relpath(args.report_prefix)
    save(public,'STAGING_FILES.txt',('\n'.join(prefix+'/'+p for p in sorted(changed))+'\n').encode())
    files=sorted(str(p.relative_to(public)) for p in public.rglob('*') if p.is_file())
    save(public,'SHA256SUMS',''.join(sha((public/p).read_bytes())+'  '+p+'\n' for p in files if p!='SHA256SUMS').encode())
    validate()
    sums=(public/'SHA256SUMS').read_text().splitlines()
    require({s.split('  ',1)[1] for s in sums}==set(files)-{'SHA256SUMS'},'all-public hash inventory')
    for s in sums:
        h,p=s.split('  ',1);require(sha((public/p).read_bytes())==h,'public inventory hash')
    require(checkpoint_path.read_bytes()==checkpoint_bytes, 'frozen checkpoint changed')
    for p,h in input_hashes.items():require(sha(Path(p).read_bytes())==h,'frozen selected original changed during preparation')
    for p,b in old.items():require((prior/p).read_bytes()==b,'prior public changed concurrently')
    require({str(p.relative_to(prior)) for p in prior.rglob('*') if p.is_file()}==set(old),'prior public inventory changed concurrently')
    for p,b in pinned_policy_bytes.items():require((runtime/'mechanics'/p).read_bytes()==b,'classifier policy changed concurrently')
    require(sha(freeze_file.read_bytes())==initial_freeze_sha,'freeze bytes changed')
    if supplemental_sha is not None:require(sha(supplemental_path.read_bytes())==supplemental_sha,'copied inventory changed')
    save(private,'SELECTED_ORIGINAL_HASHES.json',encode(input_hashes))
    save(private,'SELECTION.json',encode(f))
    ready={'status':'BUNDLE_READY','scope':'offline staged public bundle only; no live report write','counts':counts,'public_files':len(files),'changed_paths':len(changed),'code_sha256':sha(Path(__file__).read_bytes()),'public_SHA256SUMS_sha256':sha((public/'SHA256SUMS').read_bytes()),'staging_inventory_sha256':sha((public/'STAGING_FILES.txt').read_bytes()),'no_commit_push_readback_cleanup':True,'native_preparation_goal_not_candidate':True}
    save(out,'BUNDLE_READY.json',encode(ready));print(json.dumps(ready))

def cli():
    p=argparse.ArgumentParser(description=__doc__)
    for name in ['freeze-dir','runtime','prior-public','accounting','results','analysis']:p.add_argument('--'+name,type=Path,required=True)
    p.add_argument('--output-name',required=True);p.add_argument('--report-prefix',required=True)
    return p.parse_args()
if __name__=='__main__':main(cli())
