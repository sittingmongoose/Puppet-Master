"""Read-only run.started adoption/retention fixtures on the Goal guard boundary.

Only pure function definitions from the canon-pinned dependency are loaded;
its top-level fixture generators never execute. Native execution is NOT_RUN.
"""
import ast
import base64
import copy
import datetime
import hashlib
import json
from pathlib import Path
from types import SimpleNamespace
import pm_goal_oracle_common as c
import pm_goal_guard_tables as tables
import pm_event_numbers as numbers
from pm_goal_time import instant

ROOT=Path(__file__).resolve().parents[1]


def run_domain(bundle):
    """SP-265 domain joins after SP-278 separates birth and traversal cursors."""
    e,s,i,cp,q=(bundle[k] for k in ('event','snapshot','index','checkpoint','lookup'))
    p=e['payload'];g=c.Gates()
    def check(ok,label):g.require('run.started/adoption/domain/'+label,ok)
    scope='project~'+base64.urlsafe_b64encode(e['project_id'].encode()).decode().rstrip('=')
    check(e['project_id']==p['project_id']==s['project_id']==i['project_id']==cp['project_id']==q['requested_project_id'],'project_join')
    check(scope==i['scope_partition']==cp['scope_partition'],'scope_encoding')
    check(e['run_id']==p['run_id']==s['run_id']==q['requested_run_id'],'run_lookup_join')
    check(e['thread_id']==s['thread_id']==p.get('thread_id'),'thread_join')
    check(i['event_id']==e['event_id'],'event_identity')
    check(i['sequence_id']==e['sequence_id']==i['source_locator']['sequence_id'],'sequence_join')
    check(cp['first_retained_sequence_id']<=cp['index_through_sequence_id'],'coverage_order')
    # v2 adopted Storage payload recipe, independently qualified JCS for the
    # immutable runtime snapshot and producer semantic preimage.
    check(i['payload_sha256']==hashlib.sha256(numbers.storage_value_bytes(p)).hexdigest(),'source_payload_hash')
    check(i['producer_semantic_digest']==numbers.producer_semantic_digest(e),'producer_semantic_digest')
    check(s['snapshot_sha256']==hashlib.sha256(numbers.qualified_jcs({k:v for k,v in s.items()if k not in ('snapshot_ref','snapshot_sha256')})).hexdigest(),'immutable_snapshot_hash')
    check(p['requested_effective_snapshot_ref']==s['snapshot_ref']==f"requested_effective_runtime.v1:{scope}:{s['snapshot_id']}:{s['snapshot_sha256']}",'immutable_snapshot_ref')
    for k in ('requested_runtime_mode','runtime_mode','requested_mode_overlay','effective_mode_overlay','requested_strategy','strategy','strategy_resolution_reason','requested_platform','effective_platform','requested_model','effective_model','requested_account_id','effective_account_id','requested_persona','effective_persona'):
        check(p[k]==s[k],'snapshot_join_'+k)
    check(q['index_key']==f"event_record_index.v2:{scope}:{e['sequence_id']:020d}:{e['event_id']}",'index_key')
    check(q['checkpoint_key']==f"run_started_index_checkpoint.v1:{cp['storage_instance_id']}:{scope}",'checkpoint_key')
    check(cp['index_checkpoint_ref']==i['publication_locator']['checkpoint_ref'],'global_checkpoint_ref')
    h=lambda x:hashlib.sha256(numbers.qualified_jcs(x)).hexdigest()
    check(e['idempotency_key']=='run-start:'+h([e['project_id'],e['run_id']]),'new_start_key')
    check(e['event_id']=='evt_run_start_'+h([cp['storage_instance_id'],e['project_id'],e['run_id']]),'new_start_id')
    return g.errors


def main():
    import pm_goal_deleted_external_oracles as frozen
    collector=tables.COLLECTOR
    if collector is None:raise RuntimeError('Run with pm_goal_guard_sweep.py')
    if not hasattr(frozen,'FIXTURE_CONTEXT'):frozen.main()
    dep,subject,seeds=frozen.FIXTURE_CONTEXT
    start=len(collector.failures)
    pin=c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')['frozen_joined_subject']
    directory=Path(pin['path']).parent
    source=directory/'check-sources/adoption_v4_check.py'
    manifest=c.load(Path(pin['path']))
    row=next(r for r in manifest['files']if Path(r['path']).name==source.name)
    if hashlib.sha256(source.read_bytes()).hexdigest()!=row['sha256']:raise ValueError('adoption source pin')
    # The adapter's imported dependency namespaces already retain their exact
    # frozen resources, schema keywords, qualified numeric/date-time helpers.
    ns={**vars(dep),**dep.AD}
    from pm_goal_complete_oracles import resources
    registry=resources({ROOT/'Plans/event_index_consumer_adoption.schema.json',ROOT/'Plans/event_record.schema.json',ROOT/'Plans/requested_effective_runtime.schema.json',ROOT/'Plans/event_payload_run_started.schema.json'})
    def validator(schema,**kwargs):
        return c.StrictValidator(c.runtime_schema(schema),registry=registry,format_checker=c.FORMATS)
    ns.update(successor=c.load(ROOT/'Plans/event_index_consumer_adoption.schema.json')['$defs'],
        contracts=c.load(ROOT/'Plans/event_record_index_checkpoint.schema.json'),
        Draft202012Validator=validator,FormatChecker=lambda:c.FORMATS,
        PL=ROOT/'Plans',ns=dep.G,cns=dep.C,created_domain=dep.created_domain,
        run_domain=run_domain,expect=frozen.expect,
        datetime=SimpleNamespace(datetime=SimpleNamespace(fromisoformat=instant),timedelta=datetime.timedelta))
    ns['runvals']={k:validator(v)for k,v in {
        'event':c.load(ROOT/'Plans/event_record.schema.json'),
        'snapshot':c.load(ROOT/'Plans/requested_effective_runtime.schema.json'),
        'checkpoint':ns['successor']['run_started_checkpoint_v2'],
        'index':dep.G['iv'].original.schema if hasattr(dep.G['iv'],'original')else dep.G['iv'].schema}.items()}
    names={'current','selection','token','token_check','cursor','birth_binding','shape','checkpoint_core','check_created_generation_admission','parse_time','run_core','run_retired_entry','check_run_history_shape','check_run_generation_admission','run_retention_eligible','cleanup_run_history','can_reserve_run_successor','validate'}
    tree=ast.parse(source.read_text());nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef)and n.name in names]
    exec(compile(ast.Module(body=nodes,type_ignores=[]),str(source),'exec'),ns)
    ns['parse_time']=instant
    # The original aggregate domain predicate returns labels. Its rows above
    # also run as complete boundaries, so failures retain stable identities.
    def evaluate(value):
        try:ns['validate'](value)
        except frozen.ExpectedRefusal as e:return e.errors
        return set()
    packet=c.load(ROOT/'Plans/event_index_consumer_adoption_fixtures.json')
    for label,value in packet['positive'].items():
        collector.invoke('run.started/adoption/'+label,evaluate,value,True)
    for case in packet['negative']:
        collector.invoke('run.started/adoption/'+case['case_id'],evaluate,case['value'],False)
    retention=c.load(ROOT/'Plans/run_started_checkpoint_retention_fixtures.json')
    def eligible(value):
        try:
            result=ns['run_retention_eligible'](value['root'],value['selection'])
            g=c.Gates();g.require('run.started/retention/eligible',result)
            return g.errors
        except frozen.ExpectedRefusal as e:return e.errors
    for case in retention['cases']:
        collector.invoke('run.started/retention/'+case['case_id'],eligible,
                         {k:case[k]for k in ('root','selection')},case['expected_eligible'])
    globals()['ADOPTION_CONTEXT']=(ns,evaluate,eligible)
    return int(len(collector.failures)>start)
