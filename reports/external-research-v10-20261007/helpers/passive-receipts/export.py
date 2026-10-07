#!/usr/bin/env python3
"""One bounded read-only harvest; no provider calls, launch, Goal writes or watchers."""
import argparse, datetime, hashlib, json, re, sqlite3
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DB = Path('/home/sittingmongoose/.t3/userdata/statev2.sqlite')
MAX_STAGES, MAX_FILE, MAX_ROWS = 12, 16 * 1024 * 1024, 512
GOAL_TOOL = re.compile(r'^(?:muse\.|functions\.)?(create_goal|get_goal|update_goal)(?::|$)')
TEXT_FIELDS = {'objective', 'current_work', 'next_work', 'currentWork', 'nextWork',
               'reason', 'message', 'title', 'acceptance', 'notes'}
STATE_FILES = ['checkpoint.json', 'anchor-supervisor.json', 'targeted-supervisor.json',
               'targeted-cohort1.json', 'targeted-cohort2.json', 'targeted-cohort3.json',
               'targeted-cohort4.json', 'integrated-methods.json']
DISPATCH_FILES = ['dispatches.jsonl', 'anchor-dispatches.jsonl', 'targeted-dispatches.jsonl',
                  'targeted-cohort1-dispatches.jsonl', 'targeted-cohort2-dispatches.jsonl',
                  'targeted-cohort3-dispatches.jsonl', 'targeted-cohort4-dispatches.jsonl',
                  'integrated-methods-dispatches.jsonl']

def sha(b): return hashlib.sha256(b).hexdigest()
def canonical(v): return json.dumps(v, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
def redact(v):
    if isinstance(v, list): return [redact(x) for x in v]
    if not isinstance(v, dict): return v
    out = {}
    for k, x in v.items():
        if k in TEXT_FIELDS and x is not None:
            out[k + '_sha256'] = sha(x.encode() if isinstance(x, str) else canonical(x))
        else: out[k] = redact(x)
    return out

def read(p):
    if p.stat().st_size > MAX_FILE: raise ValueError('source exceeds finite byte bound: ' + str(p))
    return p.read_bytes()
def walk(v):
    if isinstance(v, dict):
        yield v
        for k, x in v.items():
            if k not in {'summary', 'latestTerminalSummary', 'task', 'prompt', 'input_tool_policy', 'findings', 'answer'}:
                yield from walk(x)
    elif isinstance(v, list):
        for x in v: yield from walk(x)
def source(path, raw, kind, record=None, call=None, time=None, version=None):
    return dict(path=str(path), type=kind, version=version, record_id=record,
                call_id=call, time=time, sha256=sha(raw))
def ro(p):
    c = sqlite3.connect(p.resolve().as_uri() + '?mode=ro', uri=True, timeout=2)
    c.execute('PRAGMA query_only=ON')
    c.execute('BEGIN')
    return c

def authority():
    ids, records, sources = set(), [], []
    for name in STATE_FILES + DISPATCH_FILES:
        p = ROOT / 'state' / name
        if not p.exists(): continue
        raw = read(p); sources.append(source(p, raw, 'campaign_authority', time=None))
        values = [json.loads(x) for x in raw.splitlines() if x.strip()] if p.suffix == '.jsonl' else [json.loads(raw)]
        for v in values:
            for obj in walk(v):
                for key in ('root_thread', 'childThreadId', 'threadId', 'thread_id'):
                    if isinstance(obj.get(key), str): ids.add(obj[key])
                if obj.get('childThreadId'): records.append(obj)
    return ids, records, sources

def parse_output(v):
    if isinstance(v, str):
        try: return [json.loads(v)]
        except ValueError: return []
    if isinstance(v, list): return [b for x in v for b in parse_output(x)]
    if isinstance(v, dict):
        if 'goal' in v or ('status' in v and ('threadId' in v or 'goal_id' in v)): return [v]
        return [b for k in ('content', 'text', 'output', 'result') if k in v for b in parse_output(v[k])]
    return []

def harvest(stage, db, ids, records, auth_sources, now):
    rel = Path(stage)
    if len(rel.parts) != 3 or any(not re.fullmatch(r'[A-Za-z0-9_-]+', x) for x in rel.parts):
        raise ValueError('stage must be exact CASE/ARM/STAGE-VERSION')
    directory = ROOT / 'jobs' / rel
    dispatch = directory / 'dispatch.json'
    if dispatch.exists():
        raw = read(dispatch); d = json.loads(raw)
        provenance = source(dispatch, raw, 'stage_dispatch')
    else:
        matches = [x for x in records if x.get('directory') == str(directory)]
        if not matches: raise ValueError('no exact stage dispatch authority: ' + stage)
        d = matches[-1]; provenance = {'type':'owned_supervisor_dispatch', 'record_sha256':sha(canonical(d))}
    tid = d.get('childThreadId')
    if tid not in ids: raise ValueError('thread absent from campaign root/owned supervisor authority')
    out = dict(schema='pm.er10.passive-receipts.v1', stage=stage, observed_at_utc=now,
               thread_id=tid, task_id=d.get('taskId'), dispatch=provenance,
               authority_sources=auth_sources, binding=[], observations=[], limitations=[],
               usage={'input':None, 'cached_input':None, 'generated_output':None,
                      'reasoning_subset':None, 'provider_billing':None,
                      'semantics':'Unknown unless explicitly exposed. Native cumulative Goal/context counters remain in their original states; no sums or billing estimates.'},
               scope_audit='incomplete_unknown; advisory map is not a filesystem firewall')
    obs = out['observations']
    def add(path, raw, kind, body, record=None, call=None, time=None, tool=None, version=None):
        obs.append(dict(source=source(path, raw, kind, record, call, time, version), tool=tool,
                        native_response=redact(body), response_sha256=sha(canonical(body)),
                        redaction='Text fields replaced by UTF-8 SHA-256; all observed scalar states/counters/identities unchanged'))
    thread = db.execute('SELECT payload_json FROM orchestration_v2_projection_threads WHERE thread_id=?', (tid,)).fetchone()
    if not thread: raise ValueError('exact thread projection missing')
    tr = json.loads(thread[0])
    out['thread_metadata'] = {k:tr.get(k) for k in ['modelSelection','providerInstanceId','runtimeMode','interactionMode','lineage']}
    # Do not follow lineage to any thread not explicitly present in campaign state authority.
    parent = (tr.get('lineage') or {}).get('parentThreadId')
    out['parent_in_campaign_authority'] = parent in ids
    providers = db.execute('SELECT payload_json FROM orchestration_v2_projection_provider_threads WHERE thread_id=? LIMIT 13', (tid,)).fetchall()
    if len(providers) > 12: raise ValueError('provider binding bound exceeded')
    for (raw,) in providers:
        p = json.loads(raw)
        out['binding'].append({k:p.get(k) for k in ['id','driver','providerInstanceId','providerSessionId','nativeThreadRef','status','updatedAt','contextUsage']})
        out['binding'][-1]['source']=source(DB,raw.encode(),'t3_provider_thread_projection',p['id'],time=p.get('updatedAt'),version='statev2')
        if p.get('goal') is not None:
            add(DB, raw.encode(), 't3_native_goal_projection', p['goal'], p['id'], time=p.get('updatedAt'), version='statev2')
        session = db.execute('SELECT payload_json FROM orchestration_v2_projection_provider_sessions WHERE provider_session_id=? AND thread_id=?', (p.get('providerSessionId'),tid)).fetchone()
        if session:
            s=json.loads(session[0]);out['binding'][-1]['provider_session']={k:s.get(k) for k in ['id','driver','providerInstanceId','model','status','createdAt','updatedAt']}
    rows = db.execute("SELECT payload_json FROM orchestration_v2_projection_turn_items WHERE thread_id=? AND type='dynamic_tool' AND (json_extract(payload_json,'$.toolName') LIKE '%create_goal%' OR json_extract(payload_json,'$.toolName') LIKE '%get_goal%' OR json_extract(payload_json,'$.toolName') LIKE '%update_goal%') ORDER BY ordinal LIMIT ?", (tid,MAX_ROWS+1)).fetchall()
    if len(rows)>MAX_ROWS: raise ValueError('native tool row bound exceeded')
    for (raw,) in rows:
        item=json.loads(raw);m=GOAL_TOOL.match(item.get('toolName',''))
        if not m: continue
        for body in parse_output(item.get('output')):
            add(DB, raw.encode(), 't3_actual_native_goal_tool_response', body, item['id'],
                (item.get('nativeItemRef') or {}).get('nativeId'), item.get('completedAt'), m[1], 'statev2')
    # Muse durable native log fills responses absent from T3; no whole log or DB retained.
    if tr.get('providerInstanceId') == 'muse':
        for p in out['binding']:
            sid=(p.get('nativeThreadRef') or {}).get('nativeId','')
            if not re.fullmatch(r'[0-9a-f-]{36}',sid): continue
            paths=list(Path('/home/sittingmongoose/.local/share/muse/sessions').glob('*/*/*/'+sid+'/session.jsonl'))
            for path in paths[:1]:
                if path.stat().st_size>MAX_FILE:
                    out['limitations'].append('Muse log exceeds finite bound; not read');continue
                calls={}
                with path.open('rb') as fp:
                    for line_no,raw in enumerate(fp,1):
                        if b'assistant_tool_calls_committed' not in raw and b'tool_result_batch_committed' not in raw:continue
                        j=json.loads(raw);ev=j.get('payload',{}).get('event',{})
                        if ev.get('kind')=='assistant_tool_calls_committed':
                            for call in ev.get('tool_calls',[]):
                                if GOAL_TOOL.fullmatch(call.get('name','')):calls[call['call_id']]=call['name'].split('.')[-1]
                        elif ev.get('kind')=='tool_result_batch_committed':
                            for result in ev.get('results',[]):
                                call=result.get('tool_call_id')
                                if call not in calls:continue
                                for body in parse_output(result.get('text')):
                                    add(path,raw,'muse_actual_native_goal_tool_response',body,j.get('id'),call,
                                        {'recorded_at':j.get('recorded_at'),'unit':'microseconds_since_unix_epoch','line':line_no,'sequence':j.get('sequence')},calls[call],'muse-session-jsonl')
                gp=path.parent/'goals.db'
                if gp.exists():
                    with ro(gp) as native:
                        cols='session_id,goal_id,revision,objective,status,percent_complete,token_budget,tokens_used,created_at_ms,updated_at_ms,llm_steps_used'
                        for row in native.execute('SELECT '+cols+' FROM goals WHERE session_id=? LIMIT 8',(sid,)):
                            body=dict(zip(cols.split(','),row));add(gp,canonical(body),'muse_native_goal_state',body,body['goal_id'],time=body.get('updated_at_ms'),version='goals.db')
    if tr.get('providerInstanceId')=='zcode':
        # Exact stage objective association, including prior actual snapshots. No driver mutation.
        assignment=str(directory/'assignment.md')
        paths=[]
        historical=[ROOT/'state'/n for n in ['glm-v2-integration-goal-state-active.json','glm-v2-integration-activation-observation.json','glm-v2-integration-paused-after-steer.json','glm-control-v2-integration-active-observation.json']]
        historical += list(directory.glob('integration-state-*.json'))[:12]
        for path in historical:
            if path.exists():
                raw=read(path)
                if assignment.encode() in raw:
                    value=json.loads(raw)
                    if assignment in value.get('actual_state',{}).get('objective','') and value.get('path'):
                        nominated=Path(value['path'])
                        expected=Path(tr.get('worktreePath') or '')/'.zcode/scratch/goals'
                        if nominated.parent.parent==expected and nominated.name=='state.json':paths.append(nominated)
        paths=list(dict.fromkeys(paths))
        if len(paths)>1:
            out['limitations'].append('Multiple native driver paths nominated for exact objective: association ambiguous')
        for path in paths+historical:
            if not path.exists():continue
            raw=read(path)
            if assignment.encode() not in raw:continue
            value=json.loads(raw);body=value.get('actual_state',value)
            if assignment not in body.get('objective',''):continue
            native_path=Path(value.get('path',str(path)))
            add(path,raw,'glm_installed_integration_driver_state',body,str(native_path),time=value.get('observed_at',body.get('updatedAt')),version='zcode-acp-0.65.1-GoalLoopDriver')
            obs[-1]['binding']={'backend_session_directory':native_path.parent.name,
                               'exact_assignment':assignment,'objective_sha256':sha(body['objective'].encode()),
                               'association':'exact unique assignment objective; ACP alias/backend mapping independently unknown',
                               't3_thread_id':tid,'acp_refs':[(x.get('nativeThreadRef') or {}).get('nativeId') for x in out['binding']]}
        out['limitations'].append('Installed integration driver state is not a vendor backend target. No inferred active/terminal state from T3 completed turns. Root owns continuation repair.')
    out['native_timestamp_units']={'*_ms':'milliseconds_since_unix_epoch','createdAt/updatedAt_in_GLM_driver':'milliseconds_since_unix_epoch','Codex_goal_createdAt/updatedAt':'seconds_since_unix_epoch','T3_source_times':'ISO-8601; native values preserved'}
    tools=[x['tool'] for x in obs]
    states=[(x.get('native_response') or {}).get('goal',x.get('native_response') or {}) for x in obs]
    out['lifecycle_observations']={'states_in_source_order':[x.get('status') for x in states],
        'active_get_response':any(x.get('tool')=='get_goal' and x['native_response'].get('goal',x['native_response']).get('status')=='active' for x in obs),
        'terminal_get_response':any(x.get('tool')=='get_goal' and x['native_response'].get('goal',x['native_response']).get('status')=='complete' for x in obs),
        'meaning':'Observed source fields only; no order adjudication or inferred lifecycle transition.'}
    out['capture']={name:('observed_actual_response' if name in tools else 'missing_actual_response') for name in ['create_goal','get_goal','update_goal']}
    out['limitations'] += ['No generated/cached/provider billing fields exposed by selected sources; bounded absence only. No additional quota probes.',
                            'No continuous Goal reasoning certification. Fresh native state plus binding is an observed state, never a replacement create receipt.',
                            'SQLite record hashes identify observed payloads, not immutable whole DB snapshots. Source can change immediately after observation.',
                            'File access names/hashes not harvested on this route; scope audit remains incomplete_unknown.']
    return out

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--stage',action='append',required=True);args=ap.parse_args()
    if not 1<=len(args.stage)<=MAX_STAGES or len(set(args.stage))!=len(args.stage):ap.error('1..12 unique exact stages required')
    now=datetime.datetime.now(datetime.timezone.utc).isoformat();ids,records,sources=authority()
    outdir=HERE/'receipts';outdir.mkdir(exist_ok=True)
    entries=[]
    with ro(DB) as db:
        for stage in args.stage:
            value=harvest(stage,db,ids,records,sources,now);raw=json.dumps(value,indent=2,ensure_ascii=False).encode()+b'\n'
            # Content-addressed observations cannot overwrite prior field states.
            path=outdir/(stage.replace('/','--')+'--'+sha(raw)[:16]+'.json');path.write_bytes(raw)
            entries.append({'stage':stage,'path':str(path),'sha256':sha(raw),'bytes':len(raw),'capture':value['capture']})
    index={'schema':'pm.er10.passive-receipts-index.v1','observed_at_utc':now,'entries':entries,
           'policy':'Engineering observations only; prospective admissions owned by root; no retrospective rescue, SourcePASS, comparison or speed claim.'}
    (ROOT/'state/passive-receipts-index-v1.json').write_text(json.dumps(index,indent=2)+'\n')
    print(json.dumps(index,indent=2))
if __name__=='__main__':main()
