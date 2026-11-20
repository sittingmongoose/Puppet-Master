"""CH1 authored, exact-first-refusal worktree and copy witnesses.

Only the named (phase, row, code) counts. A different refusal or an exception
is a failed test, never a mutation kill. Each case owns distinct deep copies.
"""
import copy
import json
from dataclasses import dataclass
from pathlib import Path

from pm_dch_worktree import FAMILIES, fixtures, INPUT_FIELDS
from pm_event_numbers import full_value_commitment

ROOT = Path(__file__).resolve().parents[1]


@dataclass
class Witness:
    name: str
    family: str
    original_ref: str
    originals: dict
    record: dict
    expected: object
    clause: str


def branch_originals(base):
    """Independently frozen original branch worlds; no receipts are built on read."""
    ref=base['record']['event_type']+'/'+base['record']['scope_kind']
    data=json.loads((ROOT/'tests/fixtures/dch_c12_ch1/branches.json').read_text())
    for row in data[ref]:yield row['name'],copy.deepcopy(row['original'])


def owner_cases(ref,base):
    family=base['record']['event_type'];action=family.removeprefix('chat.thread_worktree_')
    rows=[]
    def add(name,path,replacement,phase,row):rows.append((name,path,replacement,phase,row))
    out=('operation','outcome')
    if action=='bound':
        add('created',out+('status',),'failed','wt_bound','WB01_created')
        add('inflight',out+('inflight_turn',),True,'wt_bound','WB02_no_inflight')
        for field,row in [('worktree_id','WB03_worktree'),('worktree_path','WB04_path'),('branch_name','WB05_branch')]:
            add(field,('after','worktree',field),'foreign','wt_bound',row)
    elif action=='create_failed':
        add('failed',out+('status',),'created','wt_create_failed','WC01_failed')
        add('error',out+('error',),'other_error','wt_create_failed','WC02_error')
    elif action in ('merged','merge_failed'):
        prefix='WM' if action=='merged' else 'WF';phase='wt_'+action
        add('lock',out+('lock_owner',),'other_operation',phase,prefix+'01_lock')
        strategy=base['operation']['outcome']['strategy']
        add('strategy',out+('strategy',),'rebase' if strategy!='rebase' else 'merge',phase,prefix+'02_strategy')
        add('status',out+('status',),'unknown',phase,prefix+'03_'+('completed' if action=='merged' else 'failed'))
        if action=='merged':
            for guard in ('dirty','conflicts','active_run','detached'):
                add('guard_'+guard,out+('guards',guard),True,phase,'WM04_guards')
            if base['operation']['owner_context']['tests_enabled']:
                add('tests',out+('tests',),'failed',phase,'WM05_tests')
            add('commit',out+('result_commit_sha',),'f'*40,phase,'WM06_commit')
            if strategy=='rebase':add('rebase_steps',out+('rebase_steps',),[],phase,'WM07_rebase_steps')
        else:
            add('error',out+('error',),'other_error',phase,'WF04_error')
            add('conflicts',out+('has_conflicts',),not base['result']['has_conflicts'],phase,'WF05_conflicts')
            add('no_commit',out+('result_commit_sha',),'f'*40,phase,'WF06_no_commit')
            if strategy=='rebase' and base['result']['has_conflicts'] and base['operation']['owner_context']['failure_stage']=='rebase_conflict':
                add('auto_abort',out+('rebase_steps',),[],phase,'WF07_abort')
    elif action=='pr_created':
        for name,path,value,row in [('push',('push',),'failed','WP01_push'),('api',('api','status'),'failed','WP02_api'),
            ('url',('api','pr_url'),'https://example.test/pull/2','WP03_url'),('number',('api','pr_number'),base['result']['pr_number']+1,'WP04_number')]:
            add(name,out+path,value,'wt_pr_created',row)
    elif action=='pr_failed':
        add('error',out+('error',),'other_error','wt_pr_failed','WX01_error')
        add('push',out+('push',),'succeeded' if base['result']['phase']=='push' else 'failed','wt_pr_failed','WX02_push')
        if base['result']['phase']=='push':add('api_absent',out+('api',),dict(status='failed'),'wt_pr_failed','WX03_api_absent')
        else:add('api_failed',out+('api','status'),'created','wt_pr_failed','WX04_api_failed')
    elif action=='pre_merge_test_started':
        for name,key,value,row in [('lock','lock_owner','other_operation','WS01_lock'),('target','target','other_target','WS02_target'),
            ('strategy','strategy','merge' if base['result']['strategy']!='merge' else 'squash','WS03_strategy'),
            ('snapshot','safe_point_ref','missing_snapshot','WS05_snapshot'),('rebase_conflict','rebase_conflict',True,'WS06_rebase_conflict')]:
            add(name,out+(key,),value,'wt_test_started',row)
        for guard in ('dirty','conflicts','active_run','detached'):
            add('guard_'+guard,out+('guards',guard),True,'wt_test_started','WS04_guards')
    elif action in ('pre_merge_test_failed','pre_merge_test_passed'):
        for key,value in base['operation']['outcome'].items():
            if key=='scope':new={**value,'server_id':value['server_id']+':other'}
            elif key=='kind':new='timeout' if value!='timeout' else 'exit'
            elif type(value) is int:new=value+1
            elif value is None:new='pmref:fixture:other' if key=='error_ref' else 1
            else:new=value+':other'
            if key=='thread_id':new=value[:-1]+('0' if value[-1]!='0' else '1')
            if key=='strategy':new='rebase' if value!='rebase' else 'merge'
            add('terminal_'+key,out+(key,),new,'wt_terminal','WT13_owner_outcome')
    elif action=='renamed':
        add('renamed',out+('status',),'failed','wt_renamed','WR01_renamed')
        add('old_branch',('before','worktree','branch_name'),'other_old','wt_renamed','WR02_old_branch')
        add('new_branch',('after','worktree','branch_name'),'other_new','wt_renamed','WR03_new_branch')
    elif action=='unbound':
        add('origin',out+('origin',),'other_origin','wt_unbound','WU01_origin')
        if base['result']['reason']=='path_missing':add('path_exists',out+('path_exists',),True,'wt_unbound','WU02_missing_path')
    for name,path,replacement,phase,row in rows:
        o=copy.deepcopy(base);target=o
        for key in path[:-1]:target=target[key]
        target[path[-1]]=replacement
        if name=='strategy' and action in ('merged','merge_failed') and replacement=='rebase':
            # One coherently wrong independently held completion: a claimed
            # rebase also carries its required completed/aborted rebase steps.
            # Only the strategy copy disagrees with the original accepted intent.
            o['operation']['outcome']['rebase_steps']=(['worktree_rebase','main_ff_merge'] if action=='merged'
                else ['auto_abort'] if base['result']['has_conflicts'] else [])
        yield Witness(ref+'/owner/'+name,family,ref,{ref:[o]},copy.deepcopy(base['record']),
                      (phase,row,'worktree_refused'),'ACD '+family+' '+name)


def state_cases(ref,base):
    family=base['record']['event_type'];action=family.removeprefix('chat.thread_worktree_')
    p=base['result'];thread=p['thread_id'];worktree=base['before']['worktree']['worktree_id']
    changes=[]
    if action=='bound':
        changes=[('before_binding',('before','bindings',thread),worktree),('before_reverse',('before','reverse',worktree),thread),
            ('after_binding',('after','bindings',thread),'other_worktree'),('after_reverse',('after','reverse',worktree),'other_thread'),
            ('duplicate_binding',('after','bindings','other_thread'),worktree),('duplicate_reverse',('after','reverse','other_worktree'),thread)]
    elif action=='unbound':
        changes=[('before_binding',('before','bindings',thread),'other_worktree'),('before_reverse',('before','reverse',worktree),'other_thread'),
            ('after_binding',('after','bindings',thread),worktree),('after_reverse',('after','reverse',worktree),thread),
            ('no_recreate',('after','worktree','worktree_path'),'recreated_path')]
    else:
        changes=[('binding',('after','bindings',thread),'other_worktree'),('reverse',('after','reverse',worktree),'other_thread')]
        for field in ('worktree_id','worktree_path','temp_branch_name'):
            changes.append((field,('after','worktree',field),'foreign'))
    for name,path,value in changes:
        o=copy.deepcopy(base);target=o
        for k in path[:-1]:target=target[k]
        target[path[-1]]=value
        # For merged/pr/test/failed creation no owner outcome reads these
        # state copies; renamed preserves these exact identity fields.
        yield Witness(ref+'/state/'+name,family,ref,{ref:[o]},copy.deepcopy(base['record']),
            ('wt_state','WT14_state_transition','worktree_refused'),'ACD atomic state '+name)


def protocol_cases(ref,base):
    from pm_dch_worktree_protocol import ACTIONS,expected_trace
    family=base['record']['event_type'];action=family.removeprefix('chat.thread_worktree_')
    if action not in ACTIONS:return
    ctx=base['operation']['owner_context'];changes=[]
    if action in ('merged','pre_merge_test_started'):
        changes.append(('target_deleted','target_branch_exists',False,'WG01_context'))
        if ctx['tests_enabled'] and ctx['test_target']=='merged_result' and base['result']['strategy'] in ('squash','merge'):
            changes.append(('main_dirty','main_repo_dirty',True,'WG01_context'))
    if action.startswith('pr_'):
        changes.extend([('remote_missing','github_remote_configured',False,'WG01_context'),('detached','head_detached',True,'WG01_context')])
    if action.startswith('pre_merge_test_'):
        changes.append(('disabled_test','tests_enabled',False,'WG01_context'))
        changes.append(('target_copy','test_target','branch_only' if ctx['test_target']=='merged_result' else 'merged_result','WG02_target'))
    requested=base['result'].get('user_override',False) or action=='merged' and base['operation']['outcome']['tests']=='explicit_override'
    if requested:changes.append(('unauthorized_override','override_authorized',False,'WG03_override'))
    for name,key,value,row in changes:
        o=copy.deepcopy(base);o['operation']['owner_context'][key]=value
        if key=='test_target':o['operation']['execution_trace']=expected_trace(action,o['result'],o['operation']['owner_context'])
        yield Witness(ref+'/protocol/'+name,family,ref,{ref:[o]},copy.deepcopy(base['record']),
            ('wt_protocol',row,'worktree_refused'),'W.8/W.9 '+name)
    if action=='merge_failed' and ctx['failure_stage']=='guard' and base['operation']['outcome']['guards']['conflicts']:
        o=copy.deepcopy(base)
        o['result']['has_conflicts']=o['record']['payload']['has_conflicts']=o['operation']['outcome']['has_conflicts']=False
        o['commitment']['sha256']=full_value_commitment(o['record'])
        yield Witness(ref+'/protocol/guard_conflict_copy',family,ref,{ref:[o]},copy.deepcopy(o['record']),
            ('wt_protocol','WG05_guard_conflicts','worktree_refused'),'W.8 pre-existing conflict copy')
    for i,step in enumerate(base['operation']['execution_trace']):
        o=copy.deepcopy(base);o['operation']['execution_trace'][i]='wrong_root_or_step:'+step
        yield Witness(ref+'/protocol/trace/'+str(i),family,ref,{ref:[o]},copy.deepcopy(base['record']),
            ('wt_protocol','WG04_trace','worktree_refused'),'W.8/W.9 actual trace '+step)


def cases(selected=None):
    source = fixtures()
    for ref, values in source.items():
        base = values[0]
        family = base['record']['event_type']
        if selected is not None and family != selected:
            continue

        def case(name, mutate, target, clause):
            data = {ref: copy.deepcopy(values)}
            r = copy.deepcopy(base['record'])
            mutate(data, data[ref][0], r)
            phase, row, code = target
            return Witness(ref+'/'+name, family, ref, data, r, (phase, row, code), clause)

        def original(name, mutate, row, clause):
            return case(name, lambda d,o,r: mutate(o), ('wt_original', row, 'worktree_refused'), clause)

        yield Witness(ref+'/control', family, ref, {ref: copy.deepcopy(values)}, copy.deepcopy(base['record']), None, 'complete original')
        for branch_name, branch in branch_originals(base):
            branch_ref=ref+'/branch/'+branch_name
            yield Witness(branch_ref, family, branch_ref, {branch_ref:[branch]}, copy.deepcopy(branch['record']), None, 'ACD branch '+branch_name)
            # Earlier recipe/type/format starts and genuine guard failures are
            # separate positive routes. Existing full suites own their negatives.
            if not branch_name.startswith(('retained_start/','guard_failure/','hook_failure')):
                yield from owner_cases(branch_ref,branch)
            yield from protocol_cases(branch_ref,branch)
        yield from owner_cases(ref,base)
        yield from protocol_cases(ref,base)
        yield from state_cases(ref,base)
        yield case('no_original', lambda d,o,r: d[ref].clear(), ('wt_presence','WT01_original_present','source_unavailable'), 'SP-286 missing original')
        yield case('ambiguous_original', lambda d,o,r: d[ref].append(copy.deepcopy(o)), ('wt_presence','WT01_original_present','source_unavailable'), 'SP-286 unique original')
        yield original('source_store', lambda o:o.update(storage_instance_id='00000000-0000-4000-8000-000000000099'), 'WT02_original_store','actual original Store')

        def foreign_record(o):
            o['record']['actor_ref']='pmref:fixture:other_actor'
            o['record']['payload']['actor_ref']='pmref:fixture:other_actor'
            o['commitment']['sha256']=full_value_commitment(o['record'])
        yield original('original_record_copy', foreign_record,'WT03_original_event','independent original EventRecord')
        for key in base['intent']:
            def change_intent(o, key=key):
                v=o['intent'][key]
                if type(v) is str:
                    if key=='thread_id':o['intent'][key]=v[:-1]+('0' if v[-1]!='0' else '1')
                    elif key=='strategy':o['intent'][key]='rebase' if v!='rebase' else 'squash'
                    elif key=='binding_origin':o['intent'][key]='auto_create' if v!='auto_create' else 'manual'
                    elif key=='reason':o['intent'][key]='path_missing' if v!='path_missing' else 'user_unbind'
                    elif key=='test_target':o['intent'][key]='branch_only' if v!='branch_only' else 'merged_result'
                    else:o['intent'][key]=v+':foreign'
                else:
                    o['intent'][key]=copy.deepcopy(v);o['intent'][key]['server_id']+=':foreign'
                if key=='operation_id':o['operation']['operation_id']=o['intent'][key]
            yield original('intent_'+key, change_intent,'WT04_intent_copies','frozen input '+key)
        yield original('result_copy', lambda o:o['result'].update(actor_ref='pmref:fixture:other_actor'), 'WT05_result_copies','committed result body')
        def receipt_event(o):
            o['receipt']['event_id']+=':other';o['first_receipt']=copy.deepcopy(o['receipt'])
        yield original('receipt_event',receipt_event,'WT06_receipt_event','first receipt event identity')
        def receipt_sequence(o):
            o['receipt']['sequence_id']+=1;o['first_receipt']=copy.deepcopy(o['receipt'])
        yield original('receipt_sequence',receipt_sequence,'WT07_receipt_sequence','first receipt Storage sequence')
        for field in ('segment_generation','byte_offset','durable_end_offset','manifest_generation'):
            for name, number in [('float',1.0),('overflow',1<<64)]:
                def receipt_number(o,field=field,number=number):
                    o['receipt'][field]=number;o['first_receipt']=copy.deepcopy(o['receipt'])
                yield case('receipt_'+field+'_'+name,lambda d,o,r,fn=receipt_number:fn(o),
                    ('wt_receipt','WT08_receipt_numbers','worktree_refused'),'SP-1100 receipt '+field)
        for component in ('receipt','first_receipt'):
            yield case(component+'_sequence_float',lambda d,o,r,component=component:o[component].update(sequence_id=1.0),
                ('wt_receipt','WT08_receipt_numbers','worktree_refused'),'SP-1100 independent '+component+' sequence type')
        def unsupported_producer(d,o,r):
            r['producer_sequence_id']=o['record']['producer_sequence_id']=(1<<53)+1
            o['commitment']['sha256']=full_value_commitment(o['record'])
        yield case('unsupported_producer_route',unsupported_producer,
            ('nw_producer','NW01_producer_route','producer_route_refused'),'CV-1100 current producer-semantic route qualification')
        yield case('original_sequence_float',lambda d,o,r:o['record'].update(sequence_id=1.0),
            ('ty_a','TY03_integer_type','type_refused'),'current original record exact integer type')
        for field in ('duration_ms','pr_number'):
            if field in base['result']:
                yield case('result_'+field+'_float',lambda d,o,r,field=field:o['result'].update({field:float(o['result'][field])}),
                    ('ty_a','TY03_integer_type','type_refused'),'current original result exact '+field+' integer type')
        yield case('full_value_commitment',lambda d,o,r:o['commitment'].update(sha256='0'*64),
            ('wt_receipt','WT09_original_commitment','worktree_refused'),'CV-339 whole original value')
        yield case('first_receipt_copy',lambda d,o,r:o['first_receipt'].update(commit_group_id='different_group'),
            ('wt_receipt','WT10_receipt_identity','worktree_refused'),'independent first receipt copy')
        yield case('operation_identity',lambda d,o,r:o['operation'].update(event_type='chat.thread_worktree_bound' if family!=FAMILIES[0] else FAMILIES[1]),
            ('wt_transaction','WT11_operation_identity','worktree_refused'),'exact family original operation')
        yield case('operation_order',lambda d,o,r:o['operation']['actions'].reverse(),
            ('wt_transaction','WT12_operation_order','worktree_refused'),'intent/effect/commit/readback/append/first receipt/publication order')
        action=family.removeprefix('chat.thread_worktree_')
        # Every owner predicate has its own authored negative above.
        def bad_state(o):
            if action in ('bound','unbound'):o['after']['reverse'][o['before']['worktree']['worktree_id']]='wrong_thread'
            else:o['after']['worktree']['worktree_path']+=':foreign'
        yield case('atomic_state',lambda d,o,r:bad_state(o),
            ('wt_state','WT14_state_transition','worktree_refused'),'ACD binding/reverse/worktree atomicity')
        for component in ('result','record','receipt','first_receipt','commitment'):
            yield case('schema_'+component,lambda d,o,r,component=component:o[component].update(unexpected=True),
                ('sd_complete','SD01_complete_definition','schema_refused'),'complete '+component+' schema')
        yield case('schema_source',lambda d,o,r:o.update(unexpected=True),
            ('sd_complete','SD01_complete_definition','schema_refused'),'closed original source wrapper')
        for key in ('intent','before','after','operation'):
            yield case('missing_'+key,lambda d,o,r,key=key:o.pop(key),
                ('sd_complete','SD01_complete_definition','schema_refused'),'source required '+key)


def checks(m):
    rows = {r['event_type']:r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    for c in cases(getattr(m,'SELECTED_FAMILY',None)):
        before = copy.deepcopy(c.originals)
        got = m.worktree_event_outcome(c.record,rows[c.family],c.original_ref,c.originals)
        yield c.family+': CH1 '+c.name, got == c.expected and before == c.originals
