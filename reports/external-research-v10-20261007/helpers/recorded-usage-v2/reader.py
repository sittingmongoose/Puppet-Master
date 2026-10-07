#!/usr/bin/env python3
"""One bounded ER10 metadata/SDK snapshot. No API, watch, recapture or task-status calls."""
import argparse
import collections
import datetime as dt
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import sqlite3
import sys

sys.dont_write_bytecode = True
ROOT = Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
HERE = ROOT / 'helpers/recorded-usage-v2'
ROOT_ID = '5a126dd5-9c71-4cc2-83d6-9ad1985bacad'
DB = Path('/home/sittingmongoose/.t3/userdata/statev2.sqlite')
OLD = ROOT / 'helpers/recorded-usage/reader.py'
OLD_SHA = '0b8f03c8df464ad1a827395a994b03d0e27ce053b1aaebc974e751fea356f557'
CATEGORIES = ('candidate', 'independent_source_review', 'coordination',
              'operational_helper', 'root_partial', 'unattributed')
STATES = ('checkpoint', 'anchor-supervisor', 'targeted-cohort1', 'targeted-cohort2',
          'targeted-cohort3', 'targeted-cohort4', 'integrated-methods', 'confirmation-supervisor')
DISPATCHES = ('dispatches', 'anchor-dispatches', 'targeted-dispatches',
              'targeted-cohort1-dispatches', 'targeted-cohort2-dispatches',
              'targeted-cohort3-dispatches', 'targeted-cohort4-dispatches',
              'integrated-methods-dispatches', 'confirmation-dispatches')
HELPERS = ('allowance-repair-v1', 'anchor-supervisor', 'case-design',
           'confirmation-case-design', 'confirmation-supervisor', 'essential-witness-selection-v1',
           'final-report', 'glm-route-repair', 'integrated-case-design', 'integrated-execution',
           'm14-renderer', 'mechanical', 'native-route', 'passive-receipts',
           'publication-batch002', 'publication-batch003', 'publication-batch004',
           'publication-batch005', 'publication-batch006', 'publication-batch007',
           'publication-batch008', 'publication-batch009', 'recorded-usage', 'recorded-usage-v2',
           'retention-plan-v1', 'retention-root-witnesses-v1', 'retention-working-scope-v2',
           'targeted-cohort2', 'targeted-cohort3', 'targeted-cohort4', 'targeted-supervisor')
COORD_HELPERS = {'anchor-supervisor', 'confirmation-supervisor', 'integrated-execution',
                 'targeted-cohort2', 'targeted-cohort3', 'targeted-cohort4', 'targeted-supervisor'}
COORD_KINDS = {'anchor_supervisor', 'targeted_supervisor', 'targeted_cohort',
               'targeted_cohort_supervisor', 'integrated_method_supervisor',
               'integrated_supervisor', 'confirmation_supervisor'}
OP_KINDS = {'engineering', 'case_design', 'integrated_case_design', 'route_repair',
            'm14_renderer', 'publication_curation', 'publication_curator',
            'generic_receipt_repair', 'recorded_usage_helper'}
REVIEW_ROLES = {'independent_review', 'review', 'source-review', 'independent-source-review',
                'standalone_independent_diagnostic_review', 'standalone_diagnostic'}
MAX_AUTH = 64 * 1024 * 1024
MAX_THREADS = 500
SKIP = {'summary', 'latestTerminalSummary', 'prompt', 'task', 'findings', 'answer',
        'assessment_category_annotation', 'actual_raw_API_bodies', 'native_observations',
        'native_activation', 'native_terminal', 'actual_native_goal', 'native_goal',
        'observations', 'contextUsage', 'usage', 'comparison', 'comparisons', 'artifacts',
        'sources', 'input_map', 'input_map_path', 'path_map', 'input_tool_policy', 'policy',
        'scope', 'qualification', 'account', 'credits', 'rate_limits', 'census', 'capacity',
        'health', 'thread_inventory', 'provider_threads', 'native_startup', 'source_setup',
        'research_freeze', 'research_freezes', 'review_freeze', 'freeze', 'frozen_outputs',
        'delivery_freeze', 'terminal_freeze', 'source_grade', 'source_quality', 'material_defects',
        'assessment_disposition', 'comparison_aggregate', 'final_results', 'assessment_counts',
        'current_inflight_summary', 'next_actions', 'counts', 'current_counts', 'metrics_unknown',
        'completed_assessed_pairs', 'source_content', 'body', 'messages', 'output_text'}
LABELS = ('case', 'case_id', 'slot_id', 'arm', 'role', 'stage', 'version', 'kind',
          'directory', 'config_path', 'request_path', 'output_dir', 'output_directory',
          'dispatch_path', 'raw_dispatch_path', 'request', 'clientRequestId', 'status',
          'recorded_at', 'record_at', 'actual_requestedAt', 'actual_t3_startedAt',
          'prepared_at', 'dispatch_at', 'deadline', 'whole_arm_deadline', 'taskId',
          'childRunId', 'childNodeId', 'providerInstanceId', 'model')
IDENTITY_FIELDS = ('taskId', 'childThreadId', 'threadId', 'childRunId', 'childNodeId',
                   'providerInstanceId', 'model', 'status', 'workState', 'hasPendingChildRuns',
                   'latestTerminalRunId', 'latestTerminalStatus', 'waitTimedOut')
FIELDS = ('input_tokens', 'cached_input_tokens', 'cache_write_input_tokens',
          'output_tokens', 'reasoning_output_tokens', 'total_tokens')
NATIVE = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')

def sha(raw): return hashlib.sha256(raw).hexdigest()
def canon(v): return json.dumps(v, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
def utc(): return dt.datetime.now(dt.timezone.utc)
def stamp(s): return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
def pointer(p, k): return p + '/' + str(k).replace('~', '~0').replace('/', '~1')
def select(v, keys): return {k: v[k] for k in keys if k in v}
def actual_thread(v): return isinstance(v, str) and (v == ROOT_ID or v.startswith('thread:'))


def original_functions():
    if sha(OLD.read_bytes()) != OLD_SHA:
        raise ValueError('Original reader hash differs: refusing unverified function reuse')
    spec = importlib.util.spec_from_file_location('er10_verified_original_reader', OLD)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    # Explicit current paths; the original code is imported without executing main.
    module.ROOT, module.ROOT_ID, module.DB = ROOT, ROOT_ID, DB
    module.SESSION_ROOT = Path('/home/sittingmongoose/.codex/sessions')
    return module


def config_check(v, output, current=None):
    current = current or utc()
    if v.get('campaign_root') != str(ROOT) or v.get('root_owner') != ROOT_ID:
        raise ValueError('Exact current ROOT/owner required')
    start, deadline = stamp(v['predispatch_at']), stamp(v['deadline'])
    if start.tzinfo is None or deadline.tzinfo is None or (deadline-start).total_seconds() != 1800:
        raise ValueError('Explicit frozen fixed 30-minute window required')
    if v.get('writing_reserve_seconds') != 300:
        raise ValueError('Explicit five-minute writing reserve required')
    cutoff = deadline - dt.timedelta(seconds=300)
    if current < start or current >= cutoff:
        raise ValueError('Configuration is future/expired or already in protected writing reserve')
    output = Path(output).resolve()
    if not output.is_relative_to(ROOT) or output.is_relative_to(ROOT/'helpers/recorded-usage'):
        raise ValueError('Output must be inside campaign and outside immutable original reader directory')
    for key, bound in [('max_sessions', 500), ('max_file_bytes', 268435456),
                       ('max_total_selected_bytes', 2147483648), ('max_line_bytes', 8388608)]:
        if type(v.get(key)) is not int or not 0 < v[key] <= bound:
            raise ValueError('Missing/invalid finite bound: '+key)
    return cutoff


class Authority:
    """Metadata-only walker. Every selected field cites its exact file hash and JSON pointer."""
    def __init__(self, cutoff):
        self.cutoff = cutoff
        self.sources, self.records = [], collections.defaultdict(list)
        self.refs = collections.defaultdict(list)
        self.variants, self.omissions = [], []
        self.ids, self.bytes = set(), 0
        self.stopped = None
        self.cache = {}

    def load(self, path, kind):
        path = Path(path)
        if not path.is_file():
            self.omissions.append({'path': str(path), 'reason': 'missing_named_metadata'})
            return None, None
        if not path.resolve().is_relative_to(ROOT):
            self.omissions.append({'path': str(path), 'reason': 'outside_current_ROOT'})
            return None, None
        if str(path) in self.cache: return self.cache[str(path)]
        if utc() >= self.cutoff or self.bytes + path.stat().st_size > MAX_AUTH:
            self.stopped = 'metadata_deadline_or_64MiB_bound'
            return None, None
        before = path.stat()
        raw = path.read_bytes()
        self.bytes += len(raw)
        idx = len(self.sources)
        self.sources.append({'path': str(path), 'sha256': sha(raw), 'bytes': len(raw),
                             'mtime_ns': before.st_mtime_ns, 'kind': kind,
                             'stable_during_read': (before.st_size, before.st_mtime_ns) ==
                             (path.stat().st_size, path.stat().st_mtime_ns)})
        value = [json.loads(x) for x in raw.splitlines() if x.strip()] if path.suffix == '.jsonl' else json.loads(raw)
        self.cache[str(path)] = (value, idx)
        return value, idx

    def reference(self, idx, p):
        s = self.sources[idx]
        return {'source_index': idx, 'path': s['path'], 'sha256': s['sha256'], 'json_pointer': p}

    def add(self, tid, idx, p, labels, origins, variant, receipt_location=None):
        if not actual_thread(tid): return
        if tid not in self.ids and len(self.ids) >= MAX_THREADS:
            self.stopped = '500_explicit_thread_bound'
            self.omissions.append({'thread_id': tid, 'reason': self.stopped, 'source': self.reference(idx, p)})
            return
        self.ids.add(tid)
        ref = self.reference(idx, p)
        self.refs[tid].append(ref)
        self.records[tid].append({'fields': dict(labels), 'field_sources': dict(origins),
                                 'source': ref, 'mechanical_variant': variant,
                                 'receipt_output_directory': receipt_location})

    def walk(self, v, idx, p='', inherited=None, origins=None, variant='direct', location=None):
        if self.stopped: return
        if isinstance(v, list):
            for i, x in enumerate(v): self.walk(x, idx, pointer(p,i), inherited, origins, variant, location)
            return
        if not isinstance(v, dict): return
        labels, src = dict(inherited or {}), dict(origins or {})
        for k in LABELS:
            x = v.get(k)
            if k == 'version' and not any(v.get(z) for z in ('case','case_id','slot_id','arm','stage','role','childThreadId','directory')):
                continue  # A top-level state-format version is not a scientific version.
            if k == 'request' and (not isinstance(x,str) or not x.startswith(str(ROOT)+'/')):
                continue  # Never retain a free-text request/prompt as a metadata label.
            if isinstance(x, (str, int)) and not isinstance(x, bool):
                labels[k], src[k] = x, self.reference(idx, pointer(p,k))
        tid = v.get('childThreadId')
        if actual_thread(tid):
            self.add(tid, idx, pointer(p,'childThreadId'), labels, src, variant, location)
            self.variants.append({'thread_id': tid, 'variant': variant,
                                  'source': self.reference(idx,p), 'metadata': select(v,IDENTITY_FIELDS),
                                  'full_variant_is_metadata_whitelist_only': True})
        for k in ('root_thread', 'root_thread_id', 'owner_thread', 'supervisor_thread_id'):
            if actual_thread(v.get(k)):
                self.add(v[k], idx, pointer(p,k), {'explicit_ownership_key': k}, {}, 'explicit_owner_reference')
        # Native Goal threadId and census entries never authorize a T3 thread.
        if actual_thread(v.get('threadId')) and (v.get('taskId') or Path(self.sources[idx]['path']).name == 'checkpoint.json'):
            self.add(v['threadId'], idx, pointer(p,'threadId'), labels, src, variant, location)
        for k, x in v.items():
            if k in SKIP: continue
            q = pointer(p,k)
            if k == 'content':
                # Only mechanical JSON receipt wrappers, never a transcript/content answer.
                if isinstance(x, list):
                    for j, block in enumerate(x):
                        if not isinstance(block,dict) or block.get('type') != 'text': continue
                        text = block.get('text')
                        if not isinstance(text,str) or len(text.encode()) > 8*1024*1024: continue
                        try: decoded = json.loads(text)
                        except ValueError: continue
                        if isinstance(decoded,dict) and ('childThreadId' in decoded or 'structuredContent' in decoded):
                            self.walk(decoded, idx, pointer(pointer(q,j),'text'), labels, src,
                                      'raw_wrapper_text_json', location)
                continue
            if k in ('cases','jobs') and isinstance(x,dict):
                for case, body in x.items():
                    cp=pointer(q,case)
                    self.walk(body,idx,cp,{**labels,'case':case},
                              {**src,'case':self.reference(idx,cp)},variant,location)
            elif k == 'arms' and isinstance(x,dict):
                for arm, body in x.items():
                    ap=pointer(q,arm)
                    self.walk(body,idx,ap,{**labels,'arm':arm},
                              {**src,'arm':self.reference(idx,ap)},variant,location)
            else:
                self.walk(x,idx,q,labels,src,'structuredContent' if k=='structuredContent' else variant,location)

    def collect(self):
        for name in STATES:
            v,idx=self.load(ROOT/'state'/(name+'.json'),'named_state')
            if idx is not None:self.walk(v,idx)
        for name in DISPATCHES:
            v,idx=self.load(ROOT/'state'/(name+'.jsonl'),'exact_scoped_dispatch_jsonl')
            if idx is not None:self.walk(v,idx)
        # Filename enumeration only; no candidate/reviewer/config/prompt/map bodies opened.
        paths = list(ROOT.glob('jobs/*/*/*/dispatch.json'))
        paths += list(ROOT.glob('reviews/*/*/*/dispatch.json'))
        paths += list(ROOT.glob('reviews/*/*/*/*/dispatch.json'))
        paths += [ROOT/'helpers'/h/'dispatch.json' for h in HELPERS]
        for path in sorted(set(paths)):
            v,idx=self.load(path,'exact_saved_dispatch_receipt')
            if idx is not None:self.walk(v,idx,location=str(path.parent))
        if ROOT_ID not in self.ids:raise ValueError('Root is not explicitly recorded in named authority')
        for tid, rows in self.records.items():
            # Preserve all mechanically distinct receipt variants, consolidate exact duplicates only.
            unique={canon(x):x for x in rows}
            self.records[tid]=list(unique.values())
        return self


def split_version(value):
    value=str(value)
    m=re.fullmatch(r'(.+)-v([0-9]+)', value)
    return (m[1], 'v'+m[2]) if m else (value,None)


def path_labels(directory):
    p=Path(directory)
    if not p.is_absolute() or not p.is_relative_to(ROOT):return None
    x=p.relative_to(ROOT).parts
    if len(x)==4 and x[0]=='jobs':
        case,cv=split_version(x[1]); arm,av=split_version(x[2]); stage,sv=split_version(x[3])
        return {'category':'candidate','case':case,'arm':arm,'stage':stage,
                'versions':[v for v in (cv,av,sv) if v], 'common_seed':arm=='common',
                'review_track':None, 'review_label':None}
    if len(x) in (4,5) and x[0]=='reviews':
        case,cv=split_version(x[2]); label,lv=split_version(x[3])
        stage,sv=split_version(x[4]) if len(x)==5 else (None,None)
        # J/X/Y/neutral labels carry no candidate-arm evidence.
        arm=label if label in ('control','treatment') else 'paired_or_unattributed'
        return {'category':'independent_source_review','case':case,'arm':arm,
                'stage':stage,'versions':[v for v in (cv,lv,sv) if v], 'common_seed':False,
                'review_track':x[1], 'review_label':label}
    if len(x)==2 and x[0]=='helpers' and x[1] in HELPERS:
        return {'category':'coordination' if x[1] in COORD_HELPERS else 'operational_helper',
                'case':None,'arm':None,'stage':x[1], 'versions':[], 'common_seed':False,
                'review_track':None,'review_label':None}
    return None


def role_mapping(records, thread_id=None):
    if thread_id==ROOT_ID:
        return {'category':'root_partial','case':None,'arm':None,'version':None,'stage':'root',
                'status':'ROOT_overhead_only','common_seed':False,'conflicts':{},'evidence':[]}
    paths,explicit= [], collections.defaultdict(set)
    evidence=[]
    for rec in records:
        segments=rec.get('source',{}).get('json_pointer','').split('/')
        if 'gate' in segments or any(re.fullmatch(r'[A-Za-z0-9_]*quiet_gate(?:_v[0-9]+)?',x) for x in segments):
            # Gate receipts are references to tasks being checked. Their enclosing
            # review directory is not the referenced task's dispatch/output directory.
            evidence.append({'rule':'quiet_gate_task_reference_only_no_inherited_path_attribution',
                             'source':rec['source']})
            continue
        f=rec['fields']
        for key in ('case','case_id','slot_id'):
            if f.get(key):
                case,v=split_version(f[key]);explicit['case'].add(case)
                if v:explicit['version'].add(v)
        if f.get('arm'):
            arm,v=split_version(f['arm']);explicit['arm'].add(arm)
            if v:explicit['version'].add(v)
        for key in ('stage','role'):
            if f.get(key):
                role,v=split_version(f[key]);explicit[key].add(role)
                if v:explicit['version'].add(v)
        if f.get('version') is not None:
            v=str(f['version']);explicit['version'].add(v if v.startswith('v') else 'v'+v)
        if f.get('kind'):explicit['kind'].add(str(f['kind']))
        if f.get('explicit_ownership_key') in ('owner_thread','supervisor_thread_id'):
            explicit['category'].add('coordination');evidence.append({'rule':'explicit_supervisor_ownership', 'source':rec['source']})
        locations=[]
        if rec.get('receipt_output_directory'):
            locations.append((rec['receipt_output_directory'],rec['source'],'saved_dispatch_receipt_directory'))
        for key in ('directory','output_dir','output_directory','config_path','request_path'):
            if isinstance(f.get(key),str):
                p=Path(f[key]);p=p.parent if key in ('config_path','request_path') else p
                locations.append((str(p),rec.get('field_sources',{}).get(key,rec['source']),key))
        # Location requires an actual saved childThreadId receipt or its enclosing recorded metadata.
        for directory,source,rule in locations:
            label=path_labels(directory)
            if label:
                paths.append(label);evidence.append({'rule':rule,'directory':directory,'source':source,'selected':label})
    cats={p['category'] for p in paths}|explicit['category']
    if explicit['kind'] & COORD_KINDS:cats.add('coordination')
    if explicit['kind'] & OP_KINDS:cats.add('operational_helper')
    if 'candidate' in explicit['kind']:cats.add('candidate')
    if (explicit['role']|explicit['stage']) & REVIEW_ROLES:cats.add('independent_source_review')
    conflicts={}
    category=next(iter(cats)) if len(cats)==1 else 'unattributed'
    if len(cats)>1:conflicts['category']=sorted(cats)
    selected={'category':category,'case':None,'arm':None,'stage':None,'version':None,
              'common_seed':False,'review_track':None,'review_labels':[]}
    for key in ('case','arm','version','stage'):
        pv={p[key] for p in paths if key!='version' and p.get(key) is not None} if key!='version' else {v for p in paths for v in p['versions']}
        # Saved directory is authoritative for stage, while recorded aliases remain visible.
        values=pv if pv else explicit[key]
        if key in ('case','version'):values=values|explicit[key]
        if key=='arm' and category=='independent_source_review':
            if any(p['arm']=='paired_or_unattributed' for p in paths):values={'paired_or_unattributed'}
            elif not values:values={'paired_or_unattributed'}
            if explicit['arm']-{'control','treatment','paired','paired_or_unattributed'}:values={'paired_or_unattributed'}
        elif key=='arm':values=values|explicit[key]
        if len(values)==1:selected[key]=next(iter(values))
        elif len(values)>1:conflicts[key]=sorted(values)
    if category in ('coordination','operational_helper'):
        selected['case']=selected['arm']=None
        # Broad operational role may be reused across stages; never charge it to a case.
        conflicts={k:v for k,v in conflicts.items() if k not in ('stage','case','arm','version')}
    selected['common_seed']=category=='candidate' and selected['arm']=='common'
    selected['review_track']=next(iter({p['review_track'] for p in paths if p['review_track']}),None)
    selected['review_labels']=sorted({p['review_label'] for p in paths if p['review_label']})
    if category=='candidate' and not all(selected[k] for k in ('case','arm','version','stage')):
        conflicts['missing_candidate_path_labels']=[k for k in ('case','arm','version','stage') if not selected[k]]
    if category=='independent_source_review' and not selected['case']:
        conflicts['missing_review_case']=['case']
    if conflicts or category=='unattributed':
        selected.update({'category':'unattributed','case':None,'arm':None,'version':None,'stage':None,'common_seed':False})
    evidence.extend({'rule':'explicit_metadata_labels','source':r['source'],
                     'fields':select(r['fields'],('kind','role','stage','case','case_id','slot_id','arm','version'))}
                    for r in records if any(k in r['fields'] for k in ('kind','role','stage')))
    selected.update({'status':'HOLD_unattributed_or_conflicting_metadata' if selected['category']=='unattributed' else 'EXPLICIT_unique_role',
                     'conflicts':conflicts,'evidence':evidence,
                     'original_stage_aliases':sorted(explicit['stage']), 'original_role_aliases':sorted(explicit['role'])})
    return selected


def clean_projection(thread, bindings, runs):
    if thread:
        thread['lineage']=select(thread.get('lineage') or {},('rootThreadId','parentThreadId','depth'))
        if isinstance(thread.get('forkedFrom'),dict):
            thread['forkedFrom']=select(thread['forkedFrom'],('type','nodeId','threadId','runId'))
    for b in bindings:
        b['nativeThreadRef']=select(b.get('nativeThreadRef') or {},('driver','nativeId','strength'))
        if isinstance(b.get('forkedFrom'),dict):b['forkedFrom']=select(b['forkedFrom'],('type','nodeId','threadId','runId'))
    return thread,bindings,runs


def make_groups(sessions):
    groups={}
    seen=set()
    for s in sessions:
        if s['native_id'] in seen:raise ValueError('duplicate native session')
        seen.add(s['native_id'])
        if s.get('measurement_status')!='QUIET_SESSION_OBSERVED':continue
        a=s['role_mapping']
        if a['category']=='root_partial':continue
        if any(type(s['reported_total_token_usage'].get(f)) is not int for f in FIELDS):
            raise ValueError('Missing quantities cannot enter sums')
        # Include stage + actual model in primary groups: no combined case-arm candidate-stage total.
        key=(a['category'],a.get('case'),a.get('arm'),a.get('version'),a.get('stage'),tuple(s.get('recorded_models',[])))
        g=groups.setdefault(key,{'category':key[0],'case':key[1],'scientific_arm':key[2],
            'version':key[3],'stage':key[4],'models':list(key[5]),'native_ids':[],
            'field_sums':{f:0 for f in FIELDS}, 'complete_case_arm_or_campaign_claim':False})
        g['native_ids'].append(s['native_id'])
        for f in FIELDS:g['field_sums'][f]+=s['reported_total_token_usage'][f]
    for g in groups.values():g['unique_session_count']=len(g['native_ids'])
    return list(groups.values())


def sum_categories(groups):
    out={k:{'unique_session_count':0,'field_sums':None} for k in CATEGORIES}
    for g in groups:
        o=out[g['category']]
        if o['field_sums'] is None:o['field_sums']={f:0 for f in FIELDS}
        o['unique_session_count']+=g['unique_session_count']
        for f in FIELDS:o['field_sums'][f]+=g['field_sums'][f]
    return out


def write_immutable(path, value):
    raw=json.dumps(value,indent=2,ensure_ascii=False).encode()+b'\n'
    with Path(path).open('xb') as fp:fp.write(raw)
    Path(path).chmod(0o444)
    return {'path':str(path),'sha256':sha(raw),'bytes':len(raw)}


class ReadingCutoff(Exception):
    pass


class DeadlineFile:
    def __init__(self, fp, cutoff): self.fp, self.cutoff = fp, cutoff
    def __enter__(self): return self
    def __exit__(self, *args): self.fp.close()
    def readline(self, size):
        if utc() >= self.cutoff: raise ReadingCutoff()
        return self.fp.readline(size)


class DeadlinePath:
    """Keep the verified original streaming parser, add a deadline before each line."""
    def __init__(self, path, cutoff): self.path, self.cutoff = path, cutoff
    def __str__(self): return str(self.path)
    def stat(self): return self.path.stat()
    def open(self, mode): return DeadlineFile(self.path.open(mode), self.cutoff)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config',required=True,type=Path)
    parser.add_argument('--out',required=True,type=Path)
    args=parser.parse_args()
    cfgraw=args.config.read_bytes();cfg=json.loads(cfgraw)
    cutoff=config_check(cfg,args.out)
    out=args.out.resolve()
    initial_config=HERE/'config.json'
    if args.config.resolve()!=initial_config.resolve() or out!=HERE:
        if sha(cfgraw)==sha(initial_config.read_bytes()):
            raise SystemExit('Reuse requires a DIFFERENT explicitly frozen configuration')
        if not cfg.get('explicitly_frozen') or not actual_thread(cfg.get('executor_thread_id')):
            raise SystemExit('Later reuse requires explicitly_frozen=true and an exact executor_thread_id')
    out.mkdir(parents=True,exist_ok=True)
    if any(out.glob('observation-*.json')):raise SystemExit('Output already has an immutable observation; no recapture')
    # An O_EXCL receipt consumes this invocation/output even if a later extraction fails.
    write_immutable(out/'run-receipt.json',{'schema':'ER10-single-observation-invocation-v2',
        'started_at':utc().isoformat(),'config_path':str(args.config.resolve()),'config_sha256':sha(cfgraw),
        'deadline':cfg['deadline'],'reading_cutoff':cutoff.isoformat(),'automatic_reset_or_recapture':False})
    original=original_functions()
    original.MAX_FILE_BYTES=cfg['max_file_bytes'];original.MAX_LINE_BYTES=cfg['max_line_bytes']
    original_before={str(p):sha(p.read_bytes()) for p in sorted((ROOT/'helpers/recorded-usage').iterdir()) if p.is_file()}
    A=Authority(cutoff).collect()
    expected,expected_idx=A.load(ROOT/'state/C-02-actual-Codex-session-usage-observation-v1.json','C02_qualification')
    prior,prior_idx=A.load(ROOT/'state/recorded-usage-root-validation-v1.json','original_root_validation')
    if expected is None or prior is None:raise SystemExit('Qualification unavailable within bound')
    if prior.get('reader_sha256')!=OLD_SHA or not prior.get('C02_qualification_5_of_5_exact'):
        raise SystemExit('Original independent qualification not confirmed')
    frozen=expected['original_comparison_unchanged'];comparison=Path(frozen['path'])
    frozen_before=sha(comparison.read_bytes()) # Hash only; never JSON-decoded, graded or modified.
    observation={'schema':'ER10-role-separated-owned-recorded-SDK-usage-v2',
        'observed_at_utc':utc().isoformat(),'root_thread_id':ROOT_ID,
        'config':{'path':str(args.config.resolve()),'sha256':sha(cfgraw),'deadline':cfg['deadline'],
                  'protected_reading_cutoff':cutoff.isoformat()},
        'reader_sha256':sha(Path(__file__).read_bytes()),'original_reader_sha256':OLD_SHA,
        'inventory':[],'sessions':[],'omissions':[], 'stop_reason':A.stopped,
        'limits':{'max_explicit_threads':500,'max_authority_bytes':MAX_AUTH,
                  **select(cfg,('max_sessions','max_file_bytes','max_total_selected_bytes','max_line_bytes'))},
        'database':{'path':str(DB),'mode':'ro','pragma_query_only':True,
                    'exact_authorized_thread_and_provider_thread_run_queries':True,'one_transaction':True},
        'not_complete_campaign_or_final_count_report':True,
        'native_Goal_or_context_cumulative_usage_used':False,
        'scientific_nulls_or_grades_modified':False,
        'financial_rates_billing_quota_or_scientific_claim':False,
        'raw_transcripts_or_creator_account_identifiers_retained':False}
    session_bindings=collections.defaultdict(list)
    db=sqlite3.connect(DB.as_uri()+'?mode=ro',uri=True,timeout=2)
    db.execute('PRAGMA query_only=ON');db.execute('BEGIN')
    executor_tid=cfg.get('executor_thread_id')
    for tid in sorted(A.ids):
        if utc()>=cutoff:observation['stop_reason']='reading_cutoff';break
        t,bindings,runs,issues=original.projection(db,tid)
        t,bindings,runs=clean_projection(t,bindings,runs)
        item={'thread_id':tid,'authority_refs':A.refs[tid],'thread':t,'bindings':bindings,'runs':runs,
              'role_mapping':role_mapping(A.records[tid],tid),'issues':issues,
              'SDK_quantities':None}
        observation['inventory'].append(item)
        if not t:item['disposition']='HOLD_missing_projection';continue
        if (t.get('lineage') or {}).get('rootThreadId')!=ROOT_ID:
            item['disposition']='HOLD_foreign_lineage_no_session_read';continue
        if tid!=ROOT_ID and (t.get('lineage') or {}).get('parentThreadId') not in A.ids:
            item['disposition']='HOLD_parent_not_explicitly_authorized';continue
        item['liveness']=original.classify_liveness(runs,bindings)
        ms=t.get('modelSelection') or {}
        if t.get('providerInstanceId')!='codex_gmail' or ms.get('instanceId')!='codex_gmail':
            item['disposition']='INVENTORY_non_Codex_Gmail_SDK_quantities_null';continue
        if issues:item['disposition']='HOLD_projection_bounds';continue
        item['disposition']='OWNED_strong_binding_inventory'
        for b in bindings:
            n=b.get('nativeThreadRef') or {};sid=n.get('nativeId')
            if b.get('providerInstanceId')!='codex_gmail' or b.get('driver')!='codex' or n.get('driver')!='codex' or n.get('strength')!='strong' or not isinstance(sid,str) or not NATIVE.fullmatch(sid):
                item['issues'].append('HOLD_missing_strong_owned_native_binding');continue
            session_bindings[sid].append((item,b))
    observation['database']['projection_snapshot_selected_at_utc']=utc().isoformat()
    db.close()
    # Actual executor target proof comes from the recorded helper receipt, never task-name inference.
    if executor_tid is None:
        own=[tid for tid in A.ids if any(r.get('receipt_output_directory')==str(HERE) for r in A.records[tid])]
        if len(own)!=1:raise SystemExit('Actual V2 executor receipt unavailable; supply explicit executor_thread_id in a new frozen config')
        executor_tid=own[0]
    executor=next((i for i in observation['inventory'] if i['thread_id']==executor_tid),None)
    target=cfg['target']
    target_expected={'instanceId':target['providerInstanceId'],'model':target['model']}
    actual=(executor or {}).get('thread',{}).get('modelSelection') or {}
    options={o.get('id'):o.get('value') for o in actual.get('options',[])}
    executor_match=all(actual.get(k)==v for k,v in target_expected.items()) and all(options.get(k)==v for k,v in target.get('options',{}).items())
    executor_runs=(executor or {}).get('runs',[])
    latest_run=max(executor_runs,key=lambda r:r['ordinal']) if executor_runs else None
    run_selection=(latest_run or {}).get('modelSelection') or {}
    run_options={o.get('id'):o.get('value') for o in run_selection.get('options',[])}
    executor_match=executor_match and (executor or {}).get('thread',{}).get('providerInstanceId')==target['providerInstanceId'] and (latest_run or {}).get('providerInstanceId')==target['providerInstanceId'] and all(run_selection.get(k)==v for k,v in target_expected.items()) and all(run_options.get(k)==v for k,v in target.get('options',{}).items())
    observation['executor_configuration_check']={'thread_id':executor_tid,'expected':target,'actual':actual,
        'actual_latest_run_id':(latest_run or {}).get('id'),'actual_latest_run_model_selection':run_selection,
        'exact_match':executor_match}
    if not executor_match:raise SystemExit('Actual executor model/provider/options do not match frozen configuration')
    expected_index={s['native_id']:s for s in expected['sessions']}
    order=list(expected_index)+[sid for sid in sorted(session_bindings) if sid not in expected_index]
    creator_reference=None;reference_checks=[];selected_bytes=0
    for sid in order:
        if utc()>=cutoff:observation['stop_reason']='reading_cutoff';break
        if len(observation['sessions'])>=cfg['max_sessions']:observation['stop_reason']='500_session_bound';break
        joined=session_bindings.get(sid,[])
        if not joined:
            observation['omissions'].append({'native_id':sid,'reason':'missing_C02_owned_strong_join'});continue
        items={i['thread_id']:i for i,b in joined}
        live=any(i['liveness']!='quiet_terminal_runs_and_bindings' for i in items.values())
        records=[r for i in items.values() for r in A.records[i['thread_id']]]
        mapping=role_mapping(records,ROOT_ID if set(items)=={ROOT_ID} else None)
        session={'native_id':sid,'thread_ids':sorted(items),'provider_binding_ids':sorted({b['id'] for i,b in joined}),
                 'binding_row_count':len(joined),'duplicate_binding_rows_removed':len(joined)-1,
                 'role_mapping':mapping,'liveness':'live_or_unknown' if live else 'quiet_terminal_runs_and_bindings',
                 'reported_total_token_usage':None,'measurement_status':None,'issues':[]}
        observation['sessions'].append(session)
        if live and mapping['category']!='root_partial':
            session['measurement_status']='SKIP_live_or_unknown_no_body_read';continue
        is_c02=sid in expected_index
        if not is_c02 and not (len(reference_checks)==5 and all(not c['issues'] for c in reference_checks)):
            session['measurement_status']='HOLD_C02_route_reference_not_qualified';continue
        exp=expected_index.get(sid);check={'native_id':sid,'issues':[]}
        if is_c02:
            v,idx=A.load(Path(exp['binding_receipt']),'C02_independent_saved_binding_receipt')
            if idx is None:check['issues'].append('missing_saved_receipt')
            else:
                check['binding_receipt_source']=A.reference(idx,'')
                if A.sources[idx]['sha256']!=exp['binding_sha256']:check['issues'].append('saved_receipt_sha_mismatch')
                matching=[b for b in v.get('binding',[]) if (b.get('nativeThreadRef') or {}).get('nativeId')==sid and b.get('providerInstanceId')=='codex_gmail' and (b.get('nativeThreadRef') or {}).get('strength')=='strong']
                if v.get('thread_id') not in items or not matching:check['issues'].append('independent_receipt_binding_mismatch')
                if len(items)!=1 or next(iter(items.values()))['thread']['modelSelection']!=exp['T3_model_selection']:check['issues'].append('C02_exact_model_binding_mismatch')
            reference_checks.append(check)
            if check['issues']:
                session['measurement_status']='HOLD_C02_identity';session['issues']+=check['issues'];continue
        paths=original.locate(sid)
        if len(paths)!=1:
            session['measurement_status']='HOLD_missing_or_ambiguous_exact_rollout';session['rollout_match_count']=len(paths)
            if is_c02:check['issues'].append('missing_unique_exact_rollout')
            continue
        size=paths[0].stat().st_size
        if size>cfg['max_file_bytes']:
            session['measurement_status']='HOLD_256MiB_file_bound'
            if is_c02:check['issues'].append('file_bound')
            continue
        if selected_bytes+size>cfg['max_total_selected_bytes']:
            session['measurement_status']='HOLD_2GiB_selected_byte_bound';observation['stop_reason']='selected_byte_bound';break
        cwd={i['thread'].get('worktreePath') for i in items.values()}
        if len(cwd)!=1 or not next(iter(cwd)):
            session['measurement_status']='HOLD_conflicting_or_missing_expected_cwd';continue
        selected_bytes+=size
        try:
            parsed,creator=original.read_session(DeadlinePath(paths[0],cutoff),sid,next(iter(cwd)),creator_reference)
        except ReadingCutoff:
            session['measurement_status']='HOLD_reading_cutoff_partial_stream'
            observation['stop_reason']='reading_cutoff_during_stream'
            break
        # Exactly one full stream per native session; the five qualification streams also establish route reference.
        if is_c02:
            if creator is None:check['issues'].append('C02_creator_route_missing')
            elif creator_reference is None:creator_reference=creator
            elif creator!=creator_reference:check['issues'].append('C02_creator_route_disagreement')
            check['issues'] += parsed['issues']
        session.update(parsed)
        session['binding_checks']={'native_ref_strength':'strong','provider_instance':'codex_gmail',
            'same_creator_route_as_independent_C02':creator is not None and creator==creator_reference,
            'creator_reference_transient_only':True}
        creator=None
        if not session['binding_checks']['same_creator_route_as_independent_C02']:session['issues'].append('creator_route_mismatch')
        models={x['fields'].get('model') for x in session['recorded_turn_contexts'] if x['fields'].get('model')}
        efforts={str(x['fields'][k]) for x in session['recorded_turn_contexts'] for k in ('effort','reasoning_effort','reasoningEffort') if x['fields'].get(k) is not None}
        native_binding_ids={b['id'] for i,b in joined}
        runs={r['id']:r for i,b in joined for r in i['runs'] if r.get('providerThreadId') in native_binding_ids}
        session['run_ids']=sorted(runs)
        if not runs:session['issues'].append('no_exact_provider_thread_run_join')
        configured_models={r['modelSelection'].get('model') for r in runs.values() if r.get('modelSelection')}
        opts=[o for r in runs.values() for o in (r.get('modelSelection') or {}).get('options',[])]
        configured_efforts={str(o['value']) for o in opts if o.get('id')=='reasoningEffort' and o.get('value') is not None}
        if not models or not models.issubset(configured_models):session['issues'].append('recorded_model_not_bound_to_exact_owned_run')
        if not efforts or not efforts.issubset(configured_efforts):session['issues'].append('recorded_effort_missing_or_unmatched')
        if not all(r.get('providerInstanceId')=='codex_gmail' and (r.get('modelSelection') or {}).get('instanceId')=='codex_gmail' for r in runs.values()):session['issues'].append('exact_run_route_mismatch')
        session['recorded_models']=sorted(models)
        session['binding_checks']['configured_service_tiers']=sorted({str(o['value']) for o in opts if o.get('id')=='serviceTier' and o.get('value') is not None})
        session['binding_checks']['recorded_model_and_effort_match_exact_native_runs']=not any(x in session['issues'] for x in ('recorded_model_not_bound_to_exact_owned_run','recorded_effort_missing_or_unmatched'))
        allowed_nodes={r['fields'].get('taskId') for r in records}
        app_origin=all(not i['thread'].get('forkedFrom') or (i['thread']['forkedFrom'].get('type')=='node' and i['thread']['forkedFrom'].get('nodeId') in allowed_nodes) for i in items.values())
        fork_provider=any(b.get('forkedFrom') for i,b in joined)
        session['fork_resume_context']={'app_delegation_origin_bound_to_saved_task':app_origin,
            'provider_fork_present':fork_provider,'context_handoff_present':any(r.get('contextHandoffId') for r in runs.values()),
            'exact_native_session_T3_run_count':len(runs), 'each_native_cumulative_final_counted_once':True}
        if not app_origin or fork_provider:session['issues'].append('fork_scope_ambiguity_HOLD')
        requested=[stamp(r['requestedAt']) for r in runs.values() if r.get('requestedAt')]
        completed=[stamp(r['completedAt']) for r in runs.values() if r.get('completedAt')]
        first,last=session.get('first_token_count_event'),session.get('last_token_count_event')
        session['request_complete_boundaries']={'first_requestedAt':min(requested).isoformat() if requested else None,
            'last_completedAt':max(completed).isoformat() if completed else None,
            'first_token_timestamp':first.get('timestamp') if first else None,'final_token_timestamp':last.get('timestamp') if last else None,
            'complete_native_session_history_not_per_run_deltas':True}
        if first and requested and stamp(first['timestamp'])<min(requested):session['issues'].append('usage_precedes_request_HOLD')
        if last and completed and not live and stamp(last['timestamp'])>max(completed):session['issues'].append('usage_after_completed_boundary_HOLD')
        if not live and not session.get('snapshot',{}).get('stable_during_read'):session['issues'].append('quiet_file_changed_during_single_read')
        if len(items)>1:session['issues'].append('same_native_session_multiple_T3_threads_HOLD')
        # Normalize missing final fields to null, preserve actual first/final event syntax unchanged.
        if isinstance(session.get('reported_total_token_usage'),dict):
            session['reported_total_token_usage']={f:session['reported_total_token_usage'].get(f) for f in FIELDS}
        session['issues']=list(dict.fromkeys(session['issues']))
        if mapping['category']=='root_partial':
            session['measurement_status']='HOLD_PARTIAL_root_overhead' if session['issues'] else 'PARTIAL_root_overhead'
        else:session['measurement_status']='HOLD_telemetry_or_binding_ambiguity' if session['issues'] else 'QUIET_SESSION_OBSERVED'
    creator_reference=None
    observation['selected_session_bytes']=selected_bytes
    observation['account_route_qualification']={'checks':reference_checks,'five_strong_independent_bindings_same_transient_route':len(reference_checks)==5 and all(not c['issues'] for c in reference_checks),'creator_or_account_identifiers_retained':False}
    index={s['native_id']:s for s in observation['sessions']};checks=[];c02_sums={}
    for exp in expected['sessions']:
        s=index.get(exp['native_id']);diff=[]
        if s is None:diff.append('missing')
        else:
            for key in ('reported_total_token_usage','token_count_event_count'):
                if s.get(key)!=exp[key]:diff.append(key)
            if (s.get('snapshot') or {}).get('sha256')!=exp['raw_session_snapshot_sha256']:diff.append('snapshot_sha256')
            if (s.get('snapshot') or {}).get('bytes')!=exp['snapshot_bytes']:diff.append('snapshot_bytes')
            for key in ('first_token_count_event','last_token_count_event'):
                event=s.get(key) or {}
                if event.get('timestamp')!=exp[key]['timestamp'] or event.get('info')!=exp[key]['info']:diff.append(key)
            if s.get('measurement_status')!='QUIET_SESSION_OBSERVED':diff.append('not_quiet_valid')
            if not diff:
                totals=c02_sums.setdefault(exp['arm'],{f:0 for f in FIELDS})
                for f in FIELDS:totals[f]+=s['reported_total_token_usage'][f]
        checks.append({'native_id':exp['native_id'],'arm':exp['arm'],'stage':exp['role'],'exact_match':not diff,'differences':diff})
    observation['C02_comparison']={'checks':checks,'exact_match_count':sum(c['exact_match'] for c in checks),
        'expected_count':5,'selected_five_sums_by_arm':c02_sums,'sums_equal_original_reference':c02_sums==expected['recorded_session_field_sums_by_arm'],
        'not_an_arm_completion_or_scientific_claim':True}
    observation['groups']=make_groups(observation['sessions'])
    observation['category_totals']=sum_categories(observation['groups'])
    grouped=[sid for g in observation['groups'] for sid in g['native_ids']]
    observation['campaign_selected_quiet_SDK_work']={'native_ids':grouped,'unique_session_count':len(grouped),
        'field_sums':{f:sum(index[sid]['reported_total_token_usage'][f] for sid in grouped) for f in FIELDS} if grouped else None,
        'complete_campaign_total':False,'stage_groups_are_partition_not_additional_usage':True}
    observation['common_seed_ledger']=[{'native_id':s['native_id'],'case':s['role_mapping']['case'],
        'stage':s['role_mapping']['stage'],'version':s['role_mapping']['version'],
        'measurement_status':s['measurement_status'],'included_once_in_campaign_sum':s['native_id'] in grouped,
        'reported_total_token_usage':s['reported_total_token_usage'],
        'presentation_only_cold_arm_charge_requires_explicit_root_policy':True,
        'ledger_is_reference_not_an_additional_sum':True}
        for s in observation['sessions'] if s['role_mapping'].get('common_seed')]
    observation['omissions'] += A.omissions
    processed=set(index)
    observation['omissions'] += [{'native_id':sid,'reason':'not_processed_before_bound_or_cutoff'} for sid in sorted(set(session_bindings)-processed)]
    observation['coverage']={'authorized_T3_threads':len(A.ids),'projection_inventory_threads':len(observation['inventory']),
        'unique_strong_owned_Gmail_native_sessions':len(session_bindings),'native_session_inventory':len(index),
        'measurement_statuses':dict(collections.Counter(s['measurement_status'] for s in index.values())),
        'inventory_dispositions':dict(collections.Counter(i['disposition'] for i in observation['inventory'])),
        'role_categories':dict(collections.Counter(s['role_mapping']['category'] for s in index.values())),
        'quiet_grouped_native_sessions':len(grouped),'stage_role_model_groups':len(observation['groups']),
        'binding_rows_deduplicated':sum(s['duplicate_binding_rows_removed'] for s in index.values()),
        'selected_token_count_events':sum(s.get('token_count_event_count',0) for s in index.values()),
        'partial_observation':True,'bounds_hit':observation['stop_reason'] is not None}
    original_after={str(p):sha(p.read_bytes()) for p in sorted((ROOT/'helpers/recorded-usage').iterdir()) if p.is_file()}
    observation['immutable_original_inputs']={'before':original_before,'after':original_after,'all_unchanged':original_before==original_after,
        'comparison_path':str(comparison),'comparison_reference_sha256':frozen['sha256'],
        'comparison_before_sha256':frozen_before,'comparison_after_sha256':sha(comparison.read_bytes()),
        'comparison_content_decoded_or_graded':False}
    observation['config']['unchanged_through_observation']=sha(args.config.read_bytes())==sha(cfgraw)
    manifest={'schema':'ER10-exact-metadata-authority-and-role-map-v2','root_thread_id':ROOT_ID,
        'authority_bytes':A.bytes,'sources':A.sources,'explicit_thread_ids':sorted(A.ids),
        'thread_metadata_records':dict(A.records),'mechanical_variants':A.variants,
        'role_map':{i['thread_id']:i['role_mapping'] for i in observation['inventory']},
        'selection_rules':{'named_state_files':list(STATES),'exact_dispatch_jsonls':list(DISPATCHES),
            'supplement_dispatch_globs':['jobs/*/*/*/dispatch.json','reviews/*/*/*/dispatch.json','reviews/*/*/*/*/dispatch.json'],
            'known_helper_directories':list(HELPERS),'categories':list(CATEGORIES),
            'path_attribution_requires_actual_saved_child_receipt':True,'task_name_to_label_or_ID_inference':False,
            'raw_wrapper_text_json_pointers_use_decoded_text_extension':True},'omissions':A.omissions}
    # All extraction finished before reserve; publication and independent validation use saved metadata only.
    observation['reading_finished_at_utc']=utc().isoformat()
    mf=write_immutable(out/'authority-manifest.json',manifest)
    observation['authority_manifest']=mf
    observation['finished_at_utc']=utc().isoformat()
    raw=json.dumps(observation,indent=2,ensure_ascii=False).encode()+b'\n'
    dest=out/('observation-'+utc().strftime('%Y%m%dT%H%M%SZ')+'-'+sha(raw)[:16]+'.json')
    receipt=write_immutable(dest,observation)
    print(json.dumps({'observation':receipt,'authority_manifest':mf,'coverage':observation['coverage'],
                      'C02_exact':observation['C02_comparison']['exact_match_count'],
                      'deadline':cfg['deadline']},indent=2))

if __name__=='__main__':
    try:main()
    except (ValueError, OSError, sqlite3.Error) as error:
        raise SystemExit('Bounded reader refused: '+str(error))
