#!/usr/bin/env python3
"""Bounded, local, read-only ER10 Codex telemetry reader. No provider/API calls."""
import argparse
import collections
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ROOT_ID = '5a126dd5-9c71-4cc2-83d6-9ad1985bacad'
DB = Path('/home/sittingmongoose/.t3/userdata/statev2.sqlite')
SESSION_ROOT = Path('/home/sittingmongoose/.codex/sessions')
STATES = ['checkpoint', 'anchor-supervisor', 'targeted-cohort1', 'targeted-cohort2',
          'targeted-cohort3', 'targeted-cohort4', 'integrated-methods', 'confirmation-supervisor']
DISPATCHES = ['dispatches', 'anchor-dispatches', 'targeted-dispatches',
              'targeted-cohort1-dispatches', 'targeted-cohort2-dispatches',
              'targeted-cohort3-dispatches', 'targeted-cohort4-dispatches',
              'integrated-methods-dispatches', 'confirmation-dispatches']
FIELDS = ('input_tokens', 'cached_input_tokens', 'cache_write_input_tokens',
          'output_tokens', 'reasoning_output_tokens', 'total_tokens')
MAX_SESSIONS = 500
MAX_AUTH_BYTES = 16 * 1024 * 1024
MAX_FILE_BYTES = 256 * 1024 * 1024
MAX_TOTAL_BYTES = 2 * 1024 * 1024 * 1024
MAX_LINE_BYTES = 8 * 1024 * 1024
MAX_BINDINGS = 512
MAX_RUNS = 512
SKIP_WALK = {'summary', 'latestTerminalSummary', 'prompt', 'findings', 'answer',
             'assessment_category_annotation', 'actual_raw_API_bodies', 'native_observations',
             'native_activation', 'native_terminal', 'actual_native_goal', 'native_goal',
             'observations', 'contextUsage', 'usage', 'comparison', 'comparisons', 'artifacts',
             'sources', 'input_map', 'input_map_path', 'path_map', 'output', 'outputs',
             'input_tool_policy', 'policy', 'scope', 'qualification', 'account', 'credits', 'rate_limits',
             'census', 'capacity', 'health', 'thread_inventory', 'provider_threads'}
LABELS = ('case', 'case_id', 'slot_id', 'arm', 'role', 'stage', 'version', 'kind', 'directory',
          'config_path', 'request_path', 'clientRequestId', 'request', 'recorded_at', 'record_at',
          'actual_requestedAt', 'actual_t3_startedAt', 'prepared_at', 'dispatch_at',
          'cold_predispatch_at', 'deadline', 'whole_arm_deadline', 'observed_terminal_at',
          'terminal_observed_at', 'taskId', 'childRunId', 'childNodeId', 'status')
META_FIELDS = ('id', 'session_id', 'timestamp', 'cwd', 'originator', 'cli_version', 'source',
               'model_provider', 'history_mode', 'parent_thread_id', 'parent_session_id',
               'forked_from_id', 'forked_from', 'resumed_from', 'resume_from')
CONTEXT_FIELDS = ('model', 'effort', 'reasoning_effort', 'reasoningEffort', 'service_tier')
TYPE_RE = re.compile(rb'^\s*\{[^\n]{0,256}?"type"\s*:\s*"([a-z_]+)"')
TOKEN_RE = re.compile(rb'"payload"\s*:\s*\{\s*"type"\s*:\s*"token_count"')
NATIVE_RE = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
TERMINAL = {'completed', 'failed', 'cancelled', 'canceled', 'interrupted'}
QUIET_BINDING = {'idle', 'closed', 'completed', 'failed', 'cancelled', 'canceled', 'stopped'}


def now(): return dt.datetime.now(dt.timezone.utc)
def iso(): return now().isoformat()
def sha(raw): return hashlib.sha256(raw).hexdigest()
def canonical(v): return json.dumps(v, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
def stamp(s): return dt.datetime.fromisoformat(s.replace('Z', '+00:00')) if s else None

def read_json(path):
    if path.stat().st_size > MAX_AUTH_BYTES: raise ValueError('authority file byte bound')
    raw = path.read_bytes()
    return json.loads(raw), {'path': str(path), 'sha256': sha(raw), 'bytes': len(raw),
                             'mtime_ns': path.stat().st_mtime_ns}


def authority():
    ids = {ROOT_ID}
    sources, records = [], collections.defaultdict(list)
    references = collections.defaultdict(list)
    def walk(v, path, source_index, inherited=None):
        if isinstance(v, list):
            for i, x in enumerate(v): walk(x, path + f'[{i}]', source_index, inherited)
            return
        if not isinstance(v, dict): return
        labels = dict(inherited or {})
        for k in LABELS:
            if isinstance(v.get(k), (str, int)) and not isinstance(v.get(k), bool): labels[k] = v[k]
        tid = v.get('childThreadId')
        if isinstance(tid, str):
            ids.add(tid)
            ref = {'source_index': source_index, 'json_path': path, 'record_sha256': sha(canonical(labels))}
            records[tid].append({'fields': labels, 'source': ref})
            references[tid].append(ref)
        for k in ('root_thread', 'root_thread_id', 'owner_thread', 'supervisor_thread_id'):
            tid2 = v.get(k)
            if isinstance(tid2, str):
                ids.add(tid2); references[tid2].append({'source_index': source_index, 'json_path': path+'.'+k})
        # Only explicit T3 thread IDs, never native Goal threadId fields or taskId conversion.
        if (isinstance(v.get('threadId'), str) and
            (v.get('taskId') or Path(sources[source_index]['path']).name == 'checkpoint.json') and
            (v['threadId'].startswith('thread:') or v['threadId'] == ROOT_ID)):
            ids.add(v['threadId']); references[v['threadId']].append({'source_index': source_index, 'json_path': path+'.threadId'})
        for k, x in v.items():
            if k in SKIP_WALK or (k == 'task' and not isinstance(x, (dict, list))): continue
            child = dict(labels)
            # cases/jobs and arms maps are explicit attribution, not classification from names.
            if k in ('cases', 'jobs') and isinstance(x, dict):
                for case, body in x.items(): walk(body, path+'.'+k+'.'+case, source_index, {**child, 'case': case})
            elif k == 'arms' and isinstance(x, dict):
                for arm, body in x.items(): walk(body, path+'.arms.'+arm, source_index, {**child, 'arm': arm})
            else: walk(x, path+'.'+k, source_index, child)
    for filename in [n+'.json' for n in STATES] + [n+'.jsonl' for n in DISPATCHES]:
        path = ROOT/'state'/filename
        if not path.exists(): continue
        if path.stat().st_size > MAX_AUTH_BYTES: raise ValueError('authority bound: '+str(path))
        raw = path.read_bytes(); idx = len(sources)
        sources.append({'path': str(path), 'sha256': sha(raw), 'bytes': len(raw), 'mtime_ns': path.stat().st_mtime_ns})
        values = [json.loads(x) for x in raw.splitlines() if x.strip()] if path.suffix == '.jsonl' else [json.loads(raw)]
        for i, v in enumerate(values): walk(v, '$' if path.suffix == '.json' else f'$line[{i+1}]', idx)
    for tid,rows in records.items():
        distinct={}
        for row in rows:
            key=canonical(row['fields'])
            if key not in distinct:distinct[key]={'fields':row['fields'],'sources':[]}
            distinct[key]['sources'].append(row['source'])
        records[tid]=list(distinct.values())
    if len(ids) > 500: raise ValueError('authorized T3 thread bound exceeded')
    return sorted(ids), sources, records, references


def attribution(records):
    sets = collections.defaultdict(set)
    explicit = []
    for record in records:
        f = record['fields']; explicit.append(record)
        for key in ('case', 'case_id', 'slot_id'):
            if f.get(key): sets['case'].add(str(f[key]))
        for key in ('arm', 'kind'):
            if f.get(key): sets[key].add(str(f[key]))
        for key in ('role', 'stage'):
            if f.get(key):
                value = str(f[key]); match = re.fullmatch(r'(.+)-v(\d+)', value)
                sets[key].add(match[1] if match else value)
                if match: sets['version'].add('v'+match[2])
        if f.get('version') is not None:
            value = str(f['version']); sets['version'].add(value if value.startswith('v') else 'v'+value)
        for key in ('directory', 'config_path', 'request_path'):
            if not f.get(key): continue
            path = Path(f[key])
            if key != 'directory': path = path.parent
            if not path.is_relative_to(ROOT): continue
            parts = path.relative_to(ROOT).parts
            # Exact recorded layout only. A paired review has no arm component.
            case=arm=stage=None
            if parts[0]=='jobs' and len(parts)==4: case,arm,stage=parts[1:]
            elif parts[0]=='reviews' and len(parts)==5: case,arm,stage=parts[2:]
            elif parts[0]=='reviews' and len(parts)==4: case,stage=parts[2:]
            m = re.fullmatch(r'(.+)-v(\d+)', stage or '')
            if m:
                sets['case'].add(case)
                if arm is not None:sets['arm'].add(arm)
                sets['stage'].add(m[1]); sets['version'].add('v'+m[2])
    if not sets.get('role') and len(sets.get('stage',set()))==1:
        sets['role']=set(sets['stage'])
    conflicts = {k: sorted(v) for k,v in sets.items() if len(v)>1}
    selected = {k: next(iter(v)) if len(v)==1 else None for k,v in sets.items()}
    return {'selected': selected, 'conflicts': conflicts, 'original_records': explicit,
            'arm_attribution': 'explicit_unique' if all(selected.get(k) for k in ('case','arm','version')) and not any(k in conflicts for k in ('case','arm','version')) else 'HOLD_missing_or_conflicting_labels'}


def projection(db, tid):
    # This is the only thread/provider-thread join; parameter is an exact recorded ID.
    rows = db.execute('''SELECT t.payload_json, p.payload_json
        FROM orchestration_v2_projection_threads AS t
        LEFT JOIN orchestration_v2_projection_provider_threads AS p ON p.thread_id=t.thread_id
        WHERE t.thread_id=? LIMIT ?''', (tid, MAX_BINDINGS+1)).fetchall()
    if not rows: return None, [], [], ['missing_thread_projection']
    if len(rows)>MAX_BINDINGS: return None, [], [], ['provider_binding_bound']
    t = json.loads(rows[0][0])
    thread = {k:t.get(k) for k in ('id','providerInstanceId','modelSelection','lineage','worktreePath',
                                   'forkedFrom','createdAt','updatedAt','archivedAt','deletedAt','activeProviderThreadId')}
    bindings = []
    for _, raw in rows:
        if raw is None: continue
        p = json.loads(raw)
        bindings.append({k:p.get(k) for k in ('id','driver','providerInstanceId','providerSessionId','appThreadId',
                     'ownerNodeId','nativeThreadRef','status','firstRunOrdinal','lastRunOrdinal','forkedFrom',
                     'pendingBackgroundTasks','createdAt','updatedAt')})
    runs = db.execute('''SELECT run_id, ordinal, provider_instance_id, provider_thread_id, status,
        requested_at, completed_at, json_extract(payload_json,'$.startedAt'),
        json_extract(payload_json,'$.modelSelection'), json_extract(payload_json,'$.contextHandoffId')
        FROM orchestration_v2_projection_runs WHERE thread_id=? ORDER BY ordinal LIMIT ?''',
        (tid, MAX_RUNS+1)).fetchall()
    if len(runs)>MAX_RUNS: return thread, bindings, [], ['run_bound']
    keys = ('id','ordinal','providerInstanceId','providerThreadId','status','requestedAt','completedAt','startedAt','modelSelection','contextHandoffId')
    selected = []
    for row in runs:
        d = dict(zip(keys,row)); d['modelSelection'] = json.loads(d['modelSelection']) if d['modelSelection'] else None
        selected.append(d)
    return thread, bindings, selected, []


def locate(native_id):
    if not NATIVE_RE.fullmatch(native_id): return []
    result = subprocess.run(['rg','--files','--hidden','-g','rollout-*'+native_id+'*.jsonl',str(SESSION_ROOT)],
                            capture_output=True, text=True, timeout=20, check=False)
    if result.returncode not in (0,1): raise ValueError('rg exact-session lookup failed')
    if len(result.stdout)>65536: raise ValueError('path listing bound')
    return [Path(x) for x in result.stdout.splitlines() if x and Path(x).name.endswith(native_id+'.jsonl')]


def usage_issues(value):
    issues=[]
    if not isinstance(value,dict): return ['missing_usage_object']
    for k in FIELDS:
        if k not in value: issues.append('missing:'+k)
        elif not isinstance(value[k],int) or isinstance(value[k],bool) or value[k]<0: issues.append('invalid:'+k)
    if issues: return issues
    if value['input_tokens']+value['output_tokens'] != value['total_tokens']: issues.append('input_plus_output_ne_total')
    if value['cached_input_tokens']>value['input_tokens']: issues.append('cache_gt_input')
    if value['cache_write_input_tokens']>value['input_tokens']: issues.append('cache_write_gt_input')
    if value['reasoning_output_tokens']>value['output_tokens']: issues.append('reasoning_gt_output')
    return issues


def read_session(path, native_id, expected_cwd, account_reference=None, metadata_only=False):
    before=path.stat(); limit=before.st_size
    out={'native_id':native_id,'snapshot':{'path':str(path),'bytes':limit,'mtime_ns':before.st_mtime_ns,
           'device':before.st_dev,'inode':before.st_ino,'opened_at_utc':iso()},'issues':[],
         'first_token_count_event':None,'last_token_count_event':None,'token_count_event_count':0,
         'recorded_turn_contexts':[],'session_meta':None,'reported_total_token_usage':None,
         'selected_violation_excerpts':[], 'valid_cumulative_snapshot_count':0, 'repeated_cumulative_snapshot_count':0}
    if limit>MAX_FILE_BYTES: out['issues'].append('file_byte_bound'); return out,None
    digest=hashlib.sha256(); read_bytes=0; line_number=0; previous=None; contexts=set(); account=None
    with path.open('rb') as fp:
        while read_bytes<limit:
            raw=fp.readline(min(MAX_LINE_BYTES+1,limit-read_bytes)); read_bytes+=len(raw); digest.update(raw); line_number+=1
            if len(raw)>MAX_LINE_BYTES:
                out['issues'].append('line_byte_bound');break
            if not raw.endswith(b'\n'):
                out['issues'].append('partial_final_line');break
            match=TYPE_RE.match(raw[:400]); event_type=match.group(1).decode() if match else None
            if event_type not in ('session_meta','turn_context','event_msg'): continue
            if event_type=='event_msg' and not TOKEN_RE.search(raw[:600]): continue
            try: event=json.loads(raw)
            except ValueError: out['issues'].append('malformed_selected_event');break
            body=event.get('payload') or {}
            if event_type=='session_meta':
                if out['session_meta'] is not None: out['issues'].append('multiple_session_meta');break
                out['session_meta']={k:body[k] for k in META_FIELDS if k in body}
                out['session_meta_line']=line_number
                account=body.get('creator_account_id') # Never serialized, hashed or retained.
                if body.get('id')!=native_id: out['issues'].append('session_meta_id_mismatch');break
                if body.get('cwd')!=expected_cwd: out['issues'].append('session_meta_cwd_mismatch');break
                if account_reference is not None and account!=account_reference:
                    out['issues'].append('creator_account_binding_mismatch_or_missing');break
                if metadata_only: break
                if any(body.get(k) for k in ('parent_thread_id','parent_session_id','forked_from_id','forked_from','resumed_from','resume_from')):
                    out['issues'].append('fork_resume_metadata_requires_adjudication')
            elif event_type=='turn_context':
                ctx={k:body[k] for k in CONTEXT_FIELDS if k in body}; key=canonical(ctx)
                if key not in contexts:
                    contexts.add(key)
                    if len(contexts)>64: out['issues'].append('turn_context_variant_bound');break
                    out['recorded_turn_contexts'].append({'timestamp':event.get('timestamp'),'line':line_number,'fields':ctx})
            else:
                info=body.get('info')
                if not isinstance(info,dict): out['issues'].append('token_count_missing_info');continue
                selected={k:{f:v[f] for f in FIELDS if f in v} if isinstance(v,dict) else None
                          for k,v in ((k,info.get(k)) for k in ('total_token_usage','last_token_usage'))}
                if 'model_context_window' in info:selected['model_context_window']=info['model_context_window']
                excerpt={'timestamp':event.get('timestamp'),'line':line_number,'ordinal':event.get('ordinal'),'info':selected}
                out['token_count_event_count']+=1
                if out['first_token_count_event'] is None: out['first_token_count_event']=excerpt
                out['last_token_count_event']=excerpt
                event_issues=[]
                for key in ('total_token_usage','last_token_usage'):
                    for issue in usage_issues(selected.get(key)):event_issues.append(key+':'+issue)
                out['issues']+=event_issues
                if event_issues and len(out['selected_violation_excerpts'])<8:
                    out['selected_violation_excerpts'].append({'issues':event_issues,'event':excerpt})
                current=selected.get('total_token_usage')
                if not usage_issues(current):out['valid_cumulative_snapshot_count']+=1
                if current==previous:out['repeated_cumulative_snapshot_count']+=1
                if isinstance(previous,dict) and isinstance(current,dict):
                    for k in FIELDS:
                        if isinstance(previous.get(k),int) and isinstance(current.get(k),int) and current[k]<previous[k]:
                            out['issues'].append('cumulative_decrease:'+k+':line:'+str(line_number))
                            if len(out['selected_violation_excerpts'])<8:out['selected_violation_excerpts'].append({'issues':['cumulative_decrease:'+k],'event':excerpt})
                previous=current
    after=path.stat()
    out['snapshot'].update({'bytes_read':read_bytes,'sha256':digest.hexdigest() if read_bytes==limit else None,
                           'closed_at_utc':iso(),'bytes_after':after.st_size,'mtime_ns_after':after.st_mtime_ns,
                           'stable_during_read':(limit,before.st_mtime_ns,before.st_ino)==(after.st_size,after.st_mtime_ns,after.st_ino),
                           'line_count_read':line_number})
    if not metadata_only:
        if not out['session_meta']:out['issues'].append('missing_session_meta')
        if not account:out['issues'].append('missing_creator_account_binding')
        if not previous:out['issues'].append('missing_token_count')
        out['reported_total_token_usage']=previous
        first=out['first_token_count_event']
        out['initial_cumulative_equals_initial_last']=bool(first and first['info'].get('total_token_usage')==first['info'].get('last_token_usage'))
        if first and not out['initial_cumulative_equals_initial_last']:out['issues'].append('initial_context_carry_or_cumulative_origin_ambiguous')
        out['issues']=list(dict.fromkeys(out['issues']))
    return out,account


def classify_liveness(runs, bindings):
    if not runs:return 'unknown_no_run_projection'
    if any(r['status'] not in TERMINAL or not r['completedAt'] for r in runs):return 'live_or_pending_run'
    if any(b.get('pendingBackgroundTasks') for b in bindings):return 'live_pending_background_tasks'
    if any(b.get('status') not in QUIET_BINDING for b in bindings):return 'unknown_or_active_binding'
    return 'quiet_terminal_runs_and_bindings'


def sums(sessions):
    if len(sessions)!=len({s['native_id'] for s in sessions}):raise ValueError('duplicate native session passed to sums')
    groups={}
    for s in sessions:
        if s.get('measurement_status')!='QUIET_SESSION_OBSERVED':continue
        labels=s['attribution']['selected']
        if s['attribution']['arm_attribution']=='explicit_unique':
            key=('case_arm_version',labels['case'],labels['arm'],labels['version'])
        elif labels.get('kind') and not labels.get('case'):
            key=('campaign_role',labels['kind'])
        else:continue
        group=groups.setdefault(key,{'scope':list(key),'native_ids':[],'observed_roles':[],
                    'field_sums':{f:0 for f in FIELDS},'meaning':'Unique quiet-session final cumulative telemetry only; selected coverage, no complete arm/bill claim.'})
        group['native_ids'].append(s['native_id'])
        if labels.get('stage') not in group['observed_roles']:group['observed_roles'].append(labels.get('stage'))
        for f in FIELDS:group['field_sums'][f]+=s['reported_total_token_usage'][f]
    for group in groups.values():group['unique_session_count']=len(group['native_ids'])
    return list(groups.values())


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--observe',action='store_true',required=True)
    args=parser.parse_args()
    cfg,config_src=read_json(HERE/'config.json');deadline=stamp(cfg['deadline']);reserve=dt.timedelta(minutes=cfg['writing_reserve_minutes'])
    if cfg.get('root_owner')!=ROOT_ID or Path(cfg.get('writes','')).resolve()!=HERE:raise SystemExit('Configuration ownership/output scope mismatch')
    cutoff=deadline-reserve
    if now()>=cutoff:raise SystemExit('Substantive reading cutoff passed; protected writing reserve.')
    observed=iso();expected,expected_src=read_json(ROOT/'state/C-02-actual-Codex-session-usage-observation-v1.json')
    ids,auth_sources,records,refs=authority()
    output={'schema':'ER10-owned-recorded-usage-supplement-v1','observed_at_utc':observed,'root_thread_id':ROOT_ID,
            'deadline':cfg['deadline'],'protected_reading_cutoff':cutoff.isoformat(),'authority_sources':auth_sources,
            'qualification_reference':expected_src,'reader_sha256':sha(Path(__file__).read_bytes()),'reader_config_snapshot':{k:config_src[k] for k in config_src},'database':{'path':str(DB),'mode':'ro','pragma_query_only':True,
              'scope':'Exact authorized thread_id queries only; single read transaction. No task_status or provider calls.'},
            'inventory':[],'sessions':[],'limits':{'max_sessions':MAX_SESSIONS,'max_session_bytes':MAX_FILE_BYTES,
              'max_line_bytes':MAX_LINE_BYTES,'max_total_session_bytes':MAX_TOTAL_BYTES},
            'interpretation':['Provider-reported Codex token_count telemetry, not billing or quota.',
              'One final total per distinct native session. Never sum cumulative snapshots or last-token events.',
              'Cached input is an input subset; reasoning output is an output subset. No rates/charges inferred.',
              'No native Goal counters included. Original published/frozen null metrics and grades unchanged.',
              'Only explicitly recorded IDs with this actual root lineage. Non-Gmail session bodies are not read.',
              'Account-route binding is codex_gmail in independent T3 thread/model/provider bindings and run selection; creator_account_id equality is checked transiently against separately joined C-02 sessions. No account identifiers retained.',
              'This does not verify billing-account identity from credentials or a provider account service.',
              'Live candidate/reviewer bodies skipped. Live root/coordinator use is PARTIAL overhead only.',
              'Quiet means terminal run projections plus idle/closed bindings at this SQL snapshot; later runs remain possible.',
              'Reading raw bytes to hash a snapshot retains no transcript; only whitelisted metadata and first/final token excerpts serialized.'],
            'stop_reason':None}
    db=sqlite3.connect(DB.as_uri()+'?mode=ro',uri=True,timeout=2);db.execute('PRAGMA query_only=ON');db.execute('BEGIN')
    session_bindings=collections.defaultdict(list);thread_map={}
    for tid in ids:
        if now()>=cutoff:output['stop_reason']='reading_cutoff';break
        thread,bindings,runs,issues=projection(db,tid)
        item={'thread_id':tid,'authority_refs':refs.get(tid,[]),'thread':thread,'bindings':bindings,
              'runs':runs,'attribution':attribution(records.get(tid,[])),'issues':issues}
        output['inventory'].append(item);thread_map[tid]=item
        if not thread: item['disposition']='HOLD_missing_projection';continue
        if (thread.get('lineage') or {}).get('rootThreadId')!=ROOT_ID:
            item['disposition']='HOLD_root_lineage_mismatch';continue
        parent=(thread.get('lineage') or {}).get('parentThreadId')
        if tid!=ROOT_ID and parent not in ids:item['disposition']='HOLD_parent_not_explicitly_recorded';continue
        item['liveness']=classify_liveness(runs,bindings)
        ms=thread.get('modelSelection') or {}
        if thread.get('providerInstanceId')!='codex_gmail' or ms.get('instanceId')!='codex_gmail':
            item['disposition']='SKIP_non_gmail_provider_no_session_body_read';continue
        if issues:item['disposition']='HOLD_projection_bounds';continue
        item['disposition']='gmail_projection_joined'
        for b in bindings:
            n=b.get('nativeThreadRef') or {}; sid=n.get('nativeId')
            if b.get('providerInstanceId')!='codex_gmail' or b.get('driver')!='codex' or n.get('driver')!='codex' or n.get('strength')!='strong' or not isinstance(sid,str) or not NATIVE_RE.fullmatch(sid):
                item['issues'].append('HOLD_non_strong_or_mismatched_binding');continue
            session_bindings[sid].append((item,b))
    output['database']['snapshot_selected_at_utc']=iso();db.close()
    # Verify the reference account only after independent owned/projection/native joins.
    account_reference=None;reference_checks=[]
    for exp in expected['sessions']:
        sid=exp['native_id'];joined=session_bindings.get(sid,[]);check={'native_id':sid,'joined':bool(joined),'issues':[]}
        if len({i['thread_id'] for i,b in joined})!=1:check['issues'].append('expected_single_owned_thread_join')
        paths=locate(sid) if joined else []
        if len(paths)!=1:check['issues'].append('expected_unique_rollout')
        if joined and paths:
            item,b=joined[0]
            if item['thread']['modelSelection']!=exp['T3_model_selection']:check['issues'].append('model_selection_differs_reference')
            # Independent saved terminal binding receipt, limited to selected identity fields.
            receipt,src=read_json(Path(exp['binding_receipt']));check['binding_receipt']=src
            if src['sha256']!=exp['binding_sha256']:check['issues'].append('binding_receipt_hash_differs')
            match=[x for x in receipt.get('binding',[]) if (x.get('nativeThreadRef') or {}).get('nativeId')==sid]
            if receipt.get('thread_id')!=item['thread_id'] or not any(x.get('providerInstanceId')=='codex_gmail' and (x.get('nativeThreadRef') or {}).get('strength')=='strong' for x in match):check['issues'].append('saved_receipt_binding_mismatch')
            meta,account=read_session(paths[0],sid,item['thread']['worktreePath'],metadata_only=True)
            check['issues']+=meta['issues']
            if not account:check['issues'].append('reference_creator_account_missing')
            elif account_reference is None:account_reference=account
            elif account!=account_reference:check['issues'].append('reference_creator_account_disagreement')
        reference_checks.append(check)
    account_verified=all(not x['issues'] for x in reference_checks) and len(reference_checks)==5
    output['account_reference_qualification']={'checks':reference_checks,'five_independently_joined_same_creator_account':account_verified,'raw_account_identifiers_retained':False}
    if not account_verified: account_reference=None
    total_bytes=0
    for sid,joined in sorted(session_bindings.items()):
        if now()>=cutoff:output['stop_reason']='reading_cutoff';break
        if len(output['sessions'])>=MAX_SESSIONS:output['stop_reason']='session_bound';break
        items={i['thread_id']:i for i,b in joined};live=any(i['liveness']!='quiet_terminal_runs_and_bindings' for i in items.values())
        at=attribution([record for i in items.values() for record in i['attribution']['original_records']])
        coordinator=all(i['thread_id']==ROOT_ID or (at['selected'].get('kind') in {'anchor_supervisor','targeted_supervisor','targeted_cohort','integrated_supervisor','integrated_method_supervisor','confirmation_supervisor','targeted_cohort_supervisor'} or any(ref['json_path'].endswith(('.owner_thread','.supervisor_thread_id')) for ref in i['authority_refs'])) for i in items.values())
        session={'native_id':sid,'thread_ids':list(items),'provider_binding_ids':[b['id'] for i,b in joined],
                 'binding_row_count':len(joined),'duplicate_binding_rows_removed':len(joined)-1,
                 'attribution':at,'liveness':'live_or_unknown' if live else 'quiet_terminal_runs_and_bindings',
                 'binding_checks':{'instance':'codex_gmail','native_ref_strength':'strong','same_creator_account_as_qualified_C02':None},
                 'issues':[],'reported_total_token_usage':None}
        output['sessions'].append(session)
        if live and not coordinator:session['measurement_status']='SKIP_live_or_unknown_non_coordinator';continue
        if not account_verified:session['measurement_status']='HOLD_account_reference_unverified';continue
        paths=locate(sid)
        if len(paths)!=1:session['measurement_status']='HOLD_missing_or_ambiguous_rollout';session['rollout_match_count']=len(paths);continue
        size=paths[0].stat().st_size
        if total_bytes+size>MAX_TOTAL_BYTES:session['measurement_status']='HOLD_total_byte_bound';output['stop_reason']='total_byte_bound';break
        total_bytes+=size
        cwd_values={i['thread'].get('worktreePath') for i in items.values()}
        if len(cwd_values)!=1:session['measurement_status']='HOLD_conflicting_cwd_bindings';continue
        observed_session,account=read_session(paths[0],sid,next(iter(cwd_values)),account_reference)
        session.update(observed_session);session['binding_checks']['same_creator_account_as_qualified_C02']=account==account_reference
        recorded_models={x['fields'].get('model') for x in session['recorded_turn_contexts'] if x['fields'].get('model')}
        run_models={r['modelSelection'].get('model') for i in items.values() for r in i['runs'] if r.get('modelSelection')}
        if not recorded_models:session['issues'].append('missing_recorded_model')
        elif not recorded_models.issubset(run_models):session['issues'].append('recorded_models_not_in_owned_run_selections')
        run_bindings_match=all(r.get('providerInstanceId')=='codex_gmail' and (r.get('modelSelection') or {}).get('instanceId')=='codex_gmail' for i in items.values() for r in i['runs'])
        session['binding_checks']['independent_run_model_selection_matches_gmail']=run_bindings_match
        options=[option for i in items.values() for r in i['runs'] for option in (r.get('modelSelection') or {}).get('options',[])]
        configured_efforts={str(o['value']) for o in options if o.get('id')=='reasoningEffort' and o.get('value') is not None}
        recorded_efforts={str(ctx['fields'][key]) for ctx in session['recorded_turn_contexts'] for key in ('effort','reasoning_effort','reasoningEffort') if ctx['fields'].get(key) is not None}
        session['binding_checks']['recorded_efforts_match_owned_run_options']=bool(recorded_efforts) and recorded_efforts.issubset(configured_efforts)
        session['binding_checks']['configured_service_tiers']=sorted({str(o['value']) for o in options if o.get('id')=='serviceTier' and o.get('value') is not None})
        session['binding_checks']['configured_tier_is_not_provider_execution_or_billing_evidence']=True
        if recorded_efforts and not recorded_efforts.issubset(configured_efforts):session['issues'].append('recorded_effort_not_in_owned_run_options')
        if not run_bindings_match:session['issues'].append('run_instance_binding_mismatch')
        session['fork_resume_context']={'thread_forkedFrom_present':any(i['thread'].get('forkedFrom') for i in items.values()),
            'binding_forkedFrom_present':any(b.get('forkedFrom') for i,b in joined),
            'run_context_handoff_present':any(r.get('contextHandoffId') for i in items.values() for r in i['runs']),
            'reused_native_session_run_count':len({r['id'] for i in items.values() for r in i['runs']}),
            'meaning':'Selected native final cumulative total covers this session history; run totals are never inferred.'}
        app_delegation_origin=all(
            not i['thread'].get('forkedFrom') or
            ((i['thread']['forkedFrom'].get('type')=='node') and
             i['thread']['forkedFrom'].get('nodeId') in {r['fields'].get('taskId') for r in i['attribution']['original_records']})
            for i in items.values())
        session['fork_resume_context']['app_node_fork_is_own_delegation_origin']=app_delegation_origin
        session['fork_resume_context']['native_counter_origin_evidence']='initial cumulative equals initial last, native metadata has no parent/fork/resume field, and provider fork is absent' if session.get('initial_cumulative_equals_initial_last') else 'HOLD_origin_ambiguous'
        if not app_delegation_origin or session['fork_resume_context']['binding_forkedFrom_present']:
            session['issues'].append('forked_session_scope_HOLD')
        allruns=[r for i in items.values() for r in i['runs']]
        requested=[stamp(r['requestedAt']) for r in allruns if r.get('requestedAt')];completed=[stamp(r['completedAt']) for r in allruns if r.get('completedAt')]
        first=session.get('first_token_count_event');last=session.get('last_token_count_event')
        timing={'first_requestedAt':min(requested).isoformat() if requested else None,'last_completedAt':max(completed).isoformat() if completed else None,
                'first_token_event_at':first.get('timestamp') if first else None,'last_token_event_at':last.get('timestamp') if last else None}
        if first and requested and stamp(first['timestamp'])<min(requested):session['issues'].append('usage_precedes_first_stage_request')
        if last and completed and not live and stamp(last['timestamp'])>max(completed):session['issues'].append('usage_after_last_stage_completion')
        session['stage_timing_checks']=timing
        if not session['snapshot']['stable_during_read'] and not live:session['issues'].append('quiet_log_changed_during_read')
        session['arithmetic_checks']={
            'cumulative_fields_monotonic':not any(x.startswith('cumulative_decrease:') for x in session['issues']) if session['valid_cumulative_snapshot_count'] else None,
            'all_selected_usage_arithmetic_valid':not any(x.startswith(('total_token_usage:','last_token_usage:')) for x in session['issues']),
            'missing_fields_are_zero':False}
        session['measurement_status']=('HOLD_PARTIAL_live_coordinator_overhead' if live else 'HOLD_telemetry_or_identity_ambiguity') if session['issues'] else ('PARTIAL_live_coordinator_overhead' if live else 'QUIET_SESSION_OBSERVED')
        if live:session['interpretation']='PARTIAL overhead snapshot: entire reused native-session history at prefix time; not an arm total or complete campaign usage.'
        else:session['interpretation']='One final provider-reported cumulative total for this distinct quiet native session. Attribution remains separately assessed.'
    output['session_bytes_selected']=total_bytes
    output['unique_session_sums']=sums(output['sessions'])
    for group in output['unique_session_sums']:
        labels=group['scope']
        matching=[]
        for session in output['sessions']:
            at=session['attribution']['selected']
            if labels[0]=='case_arm_version':
                matched=all(at.get(k)==value for k,value in zip(('case','arm','version'),labels[1:]))
            else:matched=at.get('kind')==labels[1] and not at.get('case')
            if matched:matching.append(session)
        group['matching_session_measurement_statuses']=dict(collections.Counter(x['measurement_status'] for x in matching))
        group['excluded_native_ids']=[x['native_id'] for x in matching if x['native_id'] not in group['native_ids']]
        group['complete_arm_attribution_claimed']=False
    indexed={s['native_id']:s for s in output['sessions']};checks=[]
    for exp in expected['sessions']:
        actual=indexed.get(exp['native_id']);diff=[]
        if actual is None:diff.append('missing_measurement')
        else:
            for a,b in [('reported_total_token_usage','reported_total_token_usage'),('token_count_event_count','token_count_event_count')]:
                if actual.get(a)!=exp.get(b):diff.append(a)
            if (actual.get('snapshot') or {}).get('sha256')!=exp['raw_session_snapshot_sha256']:diff.append('snapshot_sha256')
            if (actual.get('snapshot') or {}).get('bytes')!=exp['snapshot_bytes']:diff.append('snapshot_bytes')
            for key in ('first_token_count_event','last_token_count_event'):
                value=actual.get(key) or {};reference=exp[key]
                if value.get('timestamp')!=reference['timestamp'] or value.get('info')!=reference['info']:diff.append(key)
            if actual.get('measurement_status')!='QUIET_SESSION_OBSERVED':diff.append('not_quiet_valid')
        checks.append({'native_id':exp['native_id'],'case':exp['case'],'arm':exp['arm'],'role':exp['role'],'exact_match':not diff,'differences':diff})
    c02_sums={}
    for exp in expected['sessions']:
        actual=indexed.get(exp['native_id'])
        if actual and not next(x for x in checks if x['native_id']==exp['native_id'])['differences']:
            arm=c02_sums.setdefault(exp['arm'],{f:0 for f in FIELDS})
            for f in FIELDS:arm[f]+=actual['reported_total_token_usage'][f]
    frozen=expected.get('original_comparison_unchanged') or {}
    frozen_path=Path(frozen['path'])
    frozen_sha=sha(frozen_path.read_bytes()) if frozen_path.is_file() and frozen_path.stat().st_size<=MAX_AUTH_BYTES else None
    output['frozen_result_integrity']={'path':str(frozen_path),'current_sha256':frozen_sha,
        'expected_sha256':frozen.get('sha256'),'unchanged_since_qualification':frozen_sha==frozen.get('sha256'),
        'content_inspected_or_edited':False}
    output['C02_independent_verification']={'checks':checks,'exact_match_count':sum(c['exact_match'] for c in checks),
            'expected_count':5,'selected_five_field_sums_by_arm':c02_sums,
            'arm_sums_equal_reference':c02_sums==expected['recorded_session_field_sums_by_arm'],
            'meaning':'Verification of the exact five qualified native-session telemetry records only; no scientific regrade.'}
    output['coverage']={'authorized_t3_threads':len(ids),'inventory_threads':len(output['inventory']),
            'thread_dispositions':dict(collections.Counter(i.get('disposition') for i in output['inventory'])),
            'unique_strong_gmail_native_sessions':len(session_bindings),'session_inventory_count':len(output['sessions']),
            'session_measurement_statuses':dict(collections.Counter(s.get('measurement_status') for s in output['sessions'])),
            'quiet_session_missing_or_conflicting_attribution':sum(s.get('measurement_status')=='QUIET_SESSION_OBSERVED' and s['attribution']['arm_attribution']!='explicit_unique' for s in output['sessions']),
            'duplicate_binding_rows_removed':sum(s['duplicate_binding_rows_removed'] for s in output['sessions']),
            'quiet_explicit_case_arm_version_session_count':sum(s.get('measurement_status')=='QUIET_SESSION_OBSERVED' and s['attribution']['arm_attribution']=='explicit_unique' for s in output['sessions']),
            'quiet_sessions_in_campaign_role_sums':sum(g['unique_session_count'] for g in output['unique_session_sums'] if g['scope'][0]=='campaign_role'),
            'total_selected_token_events':sum(s.get('token_count_event_count',0) for s in output['sessions']),
            'selected_issue_counts':dict(collections.Counter(x for s in output['sessions'] for x in s.get('issues',[]))),
            'not_a_complete_campaign_measurement':True}
    # Session attribution cites the full original label records in the thread inventory;
    # avoid retaining the same identity records twice.
    for session in output['sessions']:
        session['attribution'].pop('original_records',None)
        session['attribution']['original_records_location']='inventory entries for thread_ids'
    output['finished_at_utc']=iso()
    raw=json.dumps(output,indent=2,ensure_ascii=False).encode()+b'\n'
    dest=HERE/('observation-'+now().strftime('%Y%m%dT%H%M%SZ')+'-'+sha(raw)[:16]+'.json')
    with dest.open('xb') as f:f.write(raw)
    dest.chmod(0o444)
    print(json.dumps({'path':str(dest),'sha256':sha(raw),'bytes':len(raw),'coverage':output['coverage'],
                      'C02_exact_match_count':output['C02_independent_verification']['exact_match_count'],
                      'C02_arm_sums_equal':output['C02_independent_verification']['arm_sums_equal_reference']},indent=2))

if __name__=='__main__':main()
