#!/usr/bin/env python3
"""Check-11 audit of DMEM's actual predicates and model entry points; native NOT_RUN.

Mutations exist only inside restored context managers. Inputs, receipts and commitments are never
repaired during a probe. The custody corpus is read from the fixtures, including all twelve matrices.
"""
from contextlib import contextmanager
from copy import deepcopy
from pathlib import Path
from functools import lru_cache
import argparse
import ast
import importlib.util
import inspect
import json
import textwrap
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / filename)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    raw = result.load if hasattr(result, 'load') else result.core.load
    cache = {}
    def load(path):
        if path not in cache:
            cache[path] = raw(path)
        return cache[path]
    (result if hasattr(result, 'load') else result.core).load = load
    return result


def replaced_function(mod, name, transform):
    tree = ast.parse(textwrap.dedent(inspect.getsource(getattr(mod, name))))
    tree = transform.visit(tree)
    ast.fix_missing_locations(tree)
    namespace = dict(getattr(mod, name).__globals__)
    exec(compile(tree, '<check11-mutant:' + name + '>', 'exec'), namespace)
    return namespace[getattr(mod, name).__name__]


class RemovePresence(ast.NodeTransformer):
    def visit_Call(self, node):
        node = self.generic_visit(node)
        if ((isinstance(node.func, ast.Name) and node.func.id == 'require') or
            (isinstance(node.func, ast.Attribute) and node.func.attr == 'require')) and node.args:
            source = ast.unparse(node.args[0])
            if source in ('record is not None', 'writer_event != started or canonical is not None',
                          'record is not None or canonical is not None'):
                node.args[0] = ast.Constant(True)
        return node


class IgnoreFamilyConst:
    """Retained-family binding is repeated as consts in the archive gate's payload schema.

    This proxy removes only those const checks; all other schema obligations remain enabled.
    """
    def __init__(self, validator): self.validator = validator
    def is_valid(self, value):
        if inspect.currentframe().f_back.f_code.co_name != 'start_custody_gate':
            return self.validator.is_valid(value)
        return not any(not (e.validator == 'const' and list(e.path) in
                            (['event_type'], ['command_id']))
                       for e in self.validator.iter_errors(value))


@contextmanager
def custody_mutant(m, name, archive=None):
    saved = {}
    def change(key, value):
        saved[key] = getattr(m, key); setattr(m, key, value)
    try:
        functions = {'custody_shape': 'retained_shape', 'custody_flush': 'retained_flush',
                     'custody_digest': 'retained_digest', 'custody_binding': 'retained_binding'}
        if name in functions:
            change(functions[name], (lambda original: isinstance(original, dict)) if name == 'custody_shape' else lambda *args: True)
        elif name == 'custody_presence':
            # No whole-gate replacement. Only the three absence checks are removed.
            change('start_custody_gate', replaced_function(m, 'start_custody_gate', RemovePresence()))
        elif name == 'permission_or_withdrawal':
            real = m.require
            change('require', lambda test, reason: None if reason == 'permission_or_withdrawal' else real(test, reason))
        if archive is not None and name == 'custody_binding':
            # The archive repeats the same retained-family join at its payload-schema boundary.
            real_validator = m.validator
            change('validator', lambda *args: IgnoreFamilyConst(real_validator(*args)))
            change('historical_producer_matches', lambda *args: True)
        yield
    finally:
        for key, value in saved.items(): setattr(m, key, value)
        m._PURE_RESULTS.clear()


def cases_for_matrix(m, fixtures, contracts, matrix, contexts):
    cases = []
    groups = {'missing':'custody_presence', 'digest':'custody_digest', 'not-flushed':'custody_flush',
              'shape':'custody_shape', 'value-rehashed':'custody_binding',
              'operation-rehashed':'custody_binding', 'identity-rehashed':'custody_binding',
              'family-rehashed':'custody_binding', 'payload-rehashed':'custody_binding'}
    for family in matrix:
        event = family['event_type']; context = contexts[event]
        started = event.rsplit('.',1)[0]+'.started'
        for path in family['paths']:
            for record in path['records']:
                location = ['original'] if record == 'canonical' else ['originals',started]
                for defect, guard in groups.items():
                    if defect == 'missing' and record in path.get('lawful_absent', []): continue
                    value = family['replacements'][record][defect]
                    edits = [{'path':location,'delete':True} if value is None and record=='reduced'
                             else {'path':location,'value':value}]
                    cases.append({'name':path['name']+':'+record+':'+defect,'guard':guard,
                                  'path':path,'context':context,'edits':edits})
            cases.append({'name':path['name']+':withdrawn','guard':'permission_or_withdrawal',
                          'path':path,'context':context,'edits':[{'path':['withdrawn'],'value':True}]})
    return cases


def matrix_probe(m, fixtures, contracts, case, control=False):
    path, context = case['path'], case['context']
    edits = [] if control else case['edits']
    if case['guard'] in ('custody_presence', 'permission_or_withdrawal'):
        # Resolution/absence and withdrawal are tested at the actual common gate. A requested-original
        # reader cannot return missing bytes after an absence check is removed; no fake bytes are inserted.
        if path['model'] == 'boundary':
            source = next(c['context'] for c in fixtures['cases'] if c['name']==path['case'])
        else:
            source = context['writer_states' if path['model']=='writer' else 'states'][path['initial']]
        state = m.patch(source, edits); before = deepcopy(state)
        first = (path['model'] == 'phase' and path['action']['op']=='append_started'
                 or path['model'] in ('writer','boundary') and context['event_type'].endswith('.started'))
        try:
            m.start_custody_gate(state, first_start=first,
                                writer_event=context['event_type'] if path['model']=='writer' else None)
        except m.Refusal as error:
            assert state == before
            return ('refused',str(error))
        assert state == before
        return ('ok',)
    result = m.matrix_call(fixtures,context,path,edits,contracts)
    return result[:1] if result[0]=='ok' else result


def prove_matrix(m, fixtures, contracts, matrices, contexts, archive=None):
    cases = cases_for_matrix(m,fixtures,contracts,matrices,contexts)
    baseline = {}
    for case in cases:
        assert matrix_probe(m,fixtures,contracts,case,True)[0]=='ok', (case['name'],'invalid control')
        result = matrix_probe(m,fixtures,contracts,case)
        assert result[0]=='refused', (case['name'],'negative accepted',result)
        baseline[case['name']] = result
    rows = []
    for guard in sorted({c['guard'] for c in cases}):
        flips=[]; stayed=[]
        with custody_mutant(m,guard,archive):
            for case in cases:
                result = matrix_probe(m,fixtures,contracts,case)
                if case['guard']==guard:
                    assert result[0]=='ok', (guard,case['name'],'masked negative',result)
                    flips.append(case['name'])
                else:
                    assert result==baseline[case['name']], (guard,case['name'],'unrelated refusal changed',result,baseline[case['name']])
                    stayed.append(case['name'])
        # Restoring the actual guards must make all their negatives reject again.
        assert all(matrix_probe(m,fixtures,contracts,c)==baseline[c['name']] for c in cases if c['guard']==guard)
        rows.append({'guard':guard,'negatives_that_flip':flips,'negatives_that_stay_rejected':stayed,'restored':True})
    return rows, len(cases)



def foreign_checkpoint_context(m, control, event):
    """An intact retained checkpoint resolved for a coherent foreign operation: only the storage join is wrong."""
    value=deepcopy(control);row=value['operation'];foreign='22222222-2222-4222-8222-222222222222'
    row['storage_instance_id']=foreign
    target=row.get('prepared_target')
    if target is not None:
        target['target_id']='memtarget_'+m.digest(['pm.memory.maintenance.target.v1',foreign,row['project_id'],
            row['operation_id'],target['index_kind'],row['source_revision_sha256'],target['manifest_sha256']])
    for suffix,field in [('started','started_event_id'),('completed','completed_event_id')]:
        if row[field] is not None:row[field]=m.identity(m.event_type(row,suffix),foreign,row['project_id'],row['operation_id'])[0]
    if row['status'] is not None:
        row['result_ref']=m.result_ref(row);row['result_sha256']=m.result_digest(row)
    value['value']=m.canonical_value(row,event.rsplit('.',1)[1])
    value['checkpoint']['checkpoint_key']='event_record_index_checkpoint.v1:'+foreign
    return value


def semantic_cases(m, fixtures, contexts):
    cases=[]
    def add(event, guard, suffix, positive, negative):
        cases.append({'name':event+':guard:'+suffix,'guard':guard,'positive':positive,'negative':negative})
    def call(function, *args):
        before=deepcopy(args)
        try:
            result=function(*deepcopy(args))
        except m.Refusal as error:
            result=('refused',str(error))
        else:
            result=('ok',) if result is not False else ('refused',False)
        assert args==before
        return result
    for event,context in contexts.items():
        states=context['states']; row=states['started']['operation']; index='.index.' in event
        def phase(state, action):
            action=deepcopy(action)
            if action['op'] in ('prepare','swap','settle','advance_completed','advance_started'):
                action.setdefault('expected_operation',deepcopy(state['operation']))
            return call(m.transition,state,action)
        def writer(state,value,event=event):return call(m.append_current,state,value,event)
        before=context['writer_states']['before']; value=m.canonical_value(before['operation'],event.rsplit('.',1)[1])
        for guard,field,new in [('admission','admitted',False),('permission_or_withdrawal','permission',False),
                                ('permission_or_withdrawal','withdrawn',True),('partition','dedupe_key',['wrong',event,value['idempotency_key']])]:
            changed={**before,field:new}
            add(event,guard,field,lambda b=before,v=value,w=writer:w(b,v),lambda b=changed,v=value,w=writer:w(b,v))
        changed={**value,'actor_ref':'component:Other'}
        add(event,'producer_join','producer-actor',lambda b=before,v=value,w=writer:w(b,v),lambda b=before,v=changed,w=writer:w(b,v))
        changed={**value,'replay_policy':'projector_replay_only'}
        add(event,'replay_policy','replay-only',lambda b=before,v=value,w=writer:w(b,v),lambda b=before,v=changed,w=writer:w(b,v))
        # Pure predicate endpoints isolate schema/value constraints from observational copies in other contracts.
        operation=deepcopy(row); operation['unknown']=True
        add(event,'operation_schema','operation-schema',lambda r=row,e=event:call(m.valid_operation,r,m.operation_name(e)),
            lambda r=operation,e=event:call(m.valid_operation,r,m.operation_name(e)))
        for field,guard,new in [('started_event_id','operation_receipt','evt_mem_'+'b'*64),
                                ('result_ref','operation_result_ref','memresult_'+'b'*64),
                                ('result_sha256','operation_result_digest','b'*64)]:
            original=deepcopy(states['completed']['operation']);changed={**original,field:new}
            add(event,guard,field,lambda r=original,e=event:call(m.valid_operation,r,m.operation_name(e)),
                lambda r=changed,e=event:call(m.valid_operation,r,m.operation_name(e)))
        add(event,'inline_cap','inline-cap',lambda:call(m.within_value_cap,{'text':'x'}),
            lambda:call(m.within_value_cap,{'text':'x'*17000}))
        def number(value):
            try:
                m.digest(value)
            except ValueError:
                return ('refused', 'non_integer_commitment_number')
            return ('ok',)
        for label, numeric_value in [('fraction', 1.5), ('infinity', float('inf')), ('nan', float('nan'))]:
            add(event,'commitment_numbers','number-'+label,lambda fn=number:fn(1),
                lambda v=numeric_value,fn=number:fn(v))
        payload=value['payload']; wrong={**payload,'unknown':True}
        path='Plans/memory_maintenance_event_payloads.schema.json';definition=event.replace('.','_')
        add(event,'payload_schema','payload-schema',lambda p=payload,d=definition:call(m.validator(path,d).is_valid,p),
            lambda p=wrong,d=definition:call(m.validator(path,d).is_valid,p))
        wrong={**value,'unknown':True}
        add(event,'envelope_schema','envelope-schema',lambda v=value:call(m.envelope_validator().is_valid,v),
            lambda v=wrong:call(m.envelope_validator().is_valid,v))
        completed=states['completed'];changed={**completed,'request_sha256':'b'*64};action={'op':'recover'}
        add(event,'request','request',lambda st=completed,a=action:phase(st,a),lambda st=changed,a=action:phase(st,a))
        started=states['started']; changed={**started,'current_source_revision_sha256':'b'*64}
        add(event,'source','source',lambda st=started:call(m.effect_fences,st),lambda st=changed:call(m.effect_fences,st))
        terminal=states['terminal_saved'];changed=deepcopy(terminal);del changed['originals'][event.rsplit('.',1)[0]+'.completed']
        action={'op':'advance_completed'}
        add(event,'terminal_custody','terminal-receipt',lambda st=terminal,a=action:phase(st,a),lambda st=changed,a=action:phase(st,a))
        action={'op':'append_started','value':m.full_value(row,'started')}
        add(event,'phase','append-phase',lambda st=states['accepted'],a=action:phase(st,a),lambda st=started,a=action:phase(st,a))
        if index:
            action={'op':'prepare','target':states['prepared']['operation']['prepared_target']}
        else:
            action={'op':'settle','status':'succeeded','completed_occurred_at_utc':'2026-11-04T17:01:00Z'}
        stale={**action,'expected_operation':deepcopy(states['accepted']['operation'])}
        add(event,'operation_cas','cas',lambda st=started,a=action:phase(st,a),lambda st=started,a=stale:phase(st,a))
        if index:
            target=deepcopy(states['prepared']['operation']['prepared_target']);wrong=deepcopy(target);wrong['unknown']=True
            add(event,'target_schema','target-schema',lambda t=target,r=row:call(m.valid_target,t,r),lambda t=wrong,r=row:call(m.valid_target,t,r))
            def reidentify(t,r=row):
                kind=t['index_kind']
                t['target_id']='memtarget_'+m.digest(['pm.memory.maintenance.target.v1',r['storage_instance_id'],r['project_id'],
                                    r['operation_id'],kind,r['source_revision_sha256'],t['manifest_sha256']])
                return t
            for guard,change in [('target_order','order'),('target_manifest','manifest'),
                                 ('target_source','source'),('target_identity','identity')]:
                wrong=deepcopy(target)
                if change=='order':
                    wrong['artifacts']=list(reversed(wrong['artifacts']))
                    wrong['manifest_sha256']=m.digest(wrong['artifacts']);wrong=reidentify(wrong)
                elif change=='manifest':
                    wrong['manifest_sha256']='b'*64;wrong=reidentify(wrong)
                elif change=='source':wrong['source_revision_sha256']='b'*64
                else:wrong['target_id']='memtarget_'+'b'*64
                add(event,guard,guard,lambda t=target,r=row:call(m.valid_target,t,r),
                    lambda t=wrong,r=row:call(m.valid_target,t,r))
            selected=m.selected_value(states['prepared']['operation']);wrong={**selected,'unknown':True}
            add(event,'selector_schema','selector-schema',lambda v=selected,r=row:call(m.valid_selector,v,r),lambda v=wrong,r=row:call(m.valid_selector,v,r))
            wrong={**selected,'project_id':'foreign-project'}
            add(event,'selector_scope','selector-scope',lambda v=selected,r=row:call(m.valid_selector,v,r),
                lambda v=wrong,r=row:call(m.valid_selector,v,r))
            prepared=states['prepared'];wrong={**prepared,'durable_artifacts':[]}
            add(event,'artifacts','artifact-custody',lambda st=prepared:call(m.target_fences,st),lambda st=wrong:call(m.target_fences,st))
            action={'op':'prepare','target':deepcopy(target)};bad=deepcopy(action);bad['target']['prior_selector_sha256']='b'*64
            add(event,'prior_selector','prior-selector',lambda st=started,a=action:phase(st,a),lambda st=started,a=bad:phase(st,a))
            swapped=states['swapped'];wrong={**swapped,'selector':None}
            action={'op':'settle','status':'succeeded','completed_occurred_at_utc':'2026-11-04T17:01:00Z'}
            add(event,'selected_target','selected-target',lambda st=swapped,a=action:phase(st,a),lambda st=wrong,a=action:phase(st,a))
            wrong={**swapped,'effect_count':2}
            add(event,'effect_count','effect-count',lambda st=swapped,a=action:phase(st,a),lambda st=wrong,a=action:phase(st,a))
            action={'op':'swap'};wrong={**prepared,'effect_count':1,'swap_count':1}
            add(event,'effect_once','effect-once',lambda st=prepared,a=action:phase(st,a),lambda st=wrong,a=action:phase(st,a))
            wrong={**prepared,'selector':deepcopy(states['prior_completed']['selector'])}
            add(event,'selector_cas','selector-cas',lambda st=prepared,a=action:phase(st,a),lambda st=wrong,a=action:phase(st,a))
        else:
            action={'op':'settle','status':'succeeded','completed_occurred_at_utc':'2026-11-04T17:01:00Z'}
            wrong={**started,'effect_count':1}
            add(event,'effect_once','effect-once',lambda st=started,a=action:phase(st,a),lambda st=wrong,a=action:phase(st,a))
        failure_state=states['prepared'] if index else started
        failure={'op':'settle','status':'failed','completed_occurred_at_utc':'2026-11-04T17:01:00Z'}
        wrong={**failure_state,'effect_count':1}
        if index:wrong['swap_count']=1
        add(event,'effect_once','committed-effect-cannot-fail',lambda st=failure_state,a=failure:phase(st,a),
            lambda st=wrong,a=failure:phase(st,a))
        bad={**failure,'status':'indeterminate'}
        add(event,'outcome','unknown-outcome',lambda st=failure_state,a=failure:phase(st,a),
            lambda st=failure_state,a=bad:phase(st,a))
        good={'op':'recover'};bad={'op':'unknown_action'}
        add(event,'action','unknown-action',lambda st=completed,a=good:phase(st,a),lambda st=completed,a=bad:phase(st,a))
        original_state=states['effect_committed'];good={'op':'append_completed','value':m.full_value(original_state['operation'],'completed')}
        bad=deepcopy(good);bad['value']['payload']['source_revision_sha256']='b'*64
        add(event,'original_input','append-original-value',lambda st=original_state,a=good:phase(st,a),
            lambda st=original_state,a=bad:phase(st,a))
        # Keep the snapshot and all its records intact; only the requested read family is wrong.
        read=event.rsplit('.',1)[0]+'.started';foreign='memory.other.started';wrong=deepcopy(completed)
        wrong['originals'][foreign]=deepcopy(wrong['originals'][read])
        add(event,'history_event','history-family',lambda st=wrong,e=read:call(m.read_history,st,e),
            lambda st=wrong,e=foreign:call(m.read_history,st,e))
        def refs(broken, e=event):
            documents=deepcopy(m.checked_documents())
            if broken:documents['Plans/memory_maintenance_event_payloads.schema.json']['$defs'][e.replace('.','_')]['$defs']={'dormant':{'$ref':'#/$defs/missing'}}
            return ('refused',False) if m.unresolved_references(documents) else ('ok',)
        add(event,'references_resolve','references',lambda f=refs:f(False),lambda f=refs:f(True))
        own=next(c for c in fixtures['cases'] if c['event_type']==event and c['accepted'])
        payload=own['payload'];context=own['context']
        def boundary(p,c,e=event):return call(m.accept,p,{'event_type':e},c)
        for guard,field,new in [('admission','admitted',False),('permission_or_withdrawal','permission',False),
                                ('permission_or_withdrawal','withdrawn',True),
                                ('boundary_snapshot','request_matches',False),('boundary_snapshot','current_source',False),
                                ('boundary_scope','project_id','other'),('boundary_scope','operation_id','other'),
                                ('boundary_scope','source_revision_sha256','b'*64)]:
            wrong={**context,field:new}
            add(event,guard,'boundary-'+field,lambda p=payload,c=context,b=boundary:b(p,c),
                lambda p=payload,c=wrong,b=boundary:b(p,c))
        fields=('started_receipt','effect_settled','original_full_value') if event.endswith('.completed') else ('acceptance_durable',)
        for field in fields:
            wrong={**context,field:False};guard='boundary_receipts' if event.endswith('.completed') else 'boundary_acceptance'
            add(event,guard,'boundary-'+field,lambda p=payload,c=context,b=boundary:b(p,c),
                lambda p=payload,c=wrong,b=boundary:b(p,c))
        wrong={**context,'request_sha256':'b'*64}
        add(event,'boundary_request','boundary-request-hash',lambda p=payload,c=context,b=boundary:b(p,c),
            lambda p=payload,c=wrong,b=boundary:b(p,c))
        # A schema-valid body agrees with its context but not the immutable operation snapshot.
        wrongp={**payload,'source_revision_sha256':'b'*64};wrongc={**context,'source_revision_sha256':'b'*64}
        add(event,'boundary_payload','boundary-payload-join',lambda p=payload,c=context,b=boundary:b(p,c),
            lambda p=wrongp,c=wrongc,b=boundary:b(p,c))
        if event.endswith('.completed'):
            wrong=deepcopy(context);del wrong['originals'][event];wrong['operation']['phase']='completed'
            wrong['operation']['completed_event_id']=m.full_value(wrong['operation'],'completed')['event_id']
            good=deepcopy(wrong);good['originals'][event]=m.retained(m.full_value(good['operation'],'completed'))
            add(event,'boundary_terminal','boundary-terminal-missing',lambda p=payload,c=good,b=boundary:b(p,c),
                lambda p=payload,c=wrong,b=boundary:b(p,c))
        check=next(c for c in fixtures['checkpoint_families'] if c['event_type']==event)
        generic=m.load('Plans/event_record_index_checkpoint_contract_fixtures.json')['positive']['current_read_without_old_controls']
        for label,guard in [('checkpoint-foreign-storage','checkpoint_storage'),('checkpoint-foreign-key','checkpoint_key'),
                            ('checkpoint-foreign-event-identity','checkpoint_event')]:
            case=next(c for c in check['cases'] if c['name'].endswith(':'+label))
            good={'checkpoint':generic,'operation':check['operation'],'value':check['value']}
            wrong=(foreign_checkpoint_context(m,good,event) if guard=='checkpoint_storage' else m.patch(good,case['edits']))
            def checkpoint(c,e=event):return call(m.checkpoint_identity_matches,c['checkpoint'],c['operation'],c['value'],e)
            add(event,guard,label,lambda c=good,fn=checkpoint:fn(c),lambda c=wrong,fn=checkpoint:fn(c))
    # Bind loop-local dispatch closures. Their only free variable m is the module under mutation.
    return cases


def canonical_history_cases(m, families, archive=False):
    cases = []
    fixtures = m.load('Plans/memory_canonical_history_fixtures.json')
    for family in fixtures['canonical_history_families']:
        event = family['event_type']
        if event not in families:
            continue
        for case in family['cases']:
            if 'refusal' not in case:
                continue
            guard = {'history_binding': 'semantic_binding' if archive else 'custody_binding',
                     'producer_join': 'semantic_binding' if archive else 'producer_join',
                     'history_envelope': 'envelope_schema', 'history_payload': 'payload_schema'}.get(case['guard'], case['guard'])
            def probe(negative, c=case, f=family):
                state = m.patch(f['states'][c['initial']], c['edits'] if negative else [])
                before = deepcopy(state)
                read = c['read'] if negative else f['event_type']
                try:
                    if guard_name(c) == 'custody_presence':
                        # Actual common gate: removing presence cannot manufacture requested bytes.
                        snapshot = {'operation':state['written_operation'], 'originals':state['originals'],
                                    'withdrawn':state['withdrawn']}
                        m.start_custody_gate(snapshot, canonical_history=True)
                    else:
                        if negative and c.get('number_literal') is not None:
                            m.parse_json_number(c['number_literal'])
                        m.read_canonical_history(state, read)
                except (m.Refusal, json.JSONDecodeError) as error:
                    result = ('refused', 'invalid_json_number' if isinstance(error,json.JSONDecodeError) else str(error))
                else:
                    result = ('ok',)
                assert state == before
                return result
            cases.append({'name':event+':canonical-history:'+case['name'].split(':',1)[1], 'guard':guard,
                          'positive':lambda p=probe:p(False), 'negative':lambda p=probe:p(True)})
    return cases


def guard_name(case):
    return case['guard']


class RemoveExpressions(ast.NodeTransformer):
    def __init__(self,replacements):self.replacements=replacements
    def visit(self,node):
        if isinstance(node,ast.AST) and ast.unparse(node) in self.replacements:
            return ast.Constant(self.replacements[ast.unparse(node)])
        return super().visit(node)


BOUNDARY_GUARDS={
 'admission':{"not flag(context['admitted'], True) or not flag(context['withdrawn'], False) or not flag(context['permission'], True)":False},
 'permission_or_withdrawal':{"not flag(context['admitted'], True) or not flag(context['withdrawn'], False) or not flag(context['permission'], True)":False},
 'boundary_scope':{"any((payload[k] != context[k] for k in ('project_id', 'operation_id', 'source_revision_sha256')))":False},
 'boundary_snapshot':{"not flag(context['request_matches'], True) or not flag(context['current_source'], True)":False},
 'boundary_receipts':{"not (flag(context['started_receipt'], True) and flag(context['effect_settled'], True) and flag(context['original_full_value'], True))":False},
 'boundary_acceptance':{"not flag(context['acceptance_durable'], True)":False},
 'boundary_request':{"row['request_sha256'] != context['request_sha256']":False},
 'boundary_payload':{"payload != payload_from(row, suffix)":False},
 'boundary_terminal':{"row['phase'] == 'completed' and suffix == 'completed' and (original is None)":False},
}
CHECKPOINT_GUARDS={
 'checkpoint_storage':{"checkpoint['checkpoint']['storage_instance_id'] == row['storage_instance_id']":True},
 'checkpoint_key':{"checkpoint['checkpoint_key'] == 'event_record_index_checkpoint.v1:' + row['storage_instance_id']":True},
 'checkpoint_event':{"value['event_id'] == expected_id":True},
}

class RemoveUnknownAction(ast.NodeTransformer):
    def visit_Raise(self,node):
        if ast.unparse(node)=="raise Refusal('unknown_action')":return ast.Pass()
        return node


class RemoveUnsupportedNumber(ast.NodeTransformer):
    def visit_Raise(self,node):
        if ast.unparse(node)=="raise ValueError('non_integer_commitment_number')":return ast.Pass()
        return node


class DropReplayField(ast.NodeTransformer):
    def visit_Assign(self,node):
        if any(isinstance(t,ast.Name) and t.id=='producer_fields' for t in node.targets):
            node.value=ast.BinOp(left=node.value,op=ast.Sub(),right=ast.Set(elts=[ast.Constant('replay_policy')]))
        return node


class DropHistoryEditionConstants(ast.NodeTransformer):
    """Envelope schema_id/version constants are deliberately repeated by historical binding."""
    def visit_Assign(self, node):
        if any(isinstance(t, ast.Name) and t.id == 'fields' for t in node.targets):
            node.value = ast.BinOp(left=node.value, op=ast.Sub(), right=ast.Set(
                elts=[ast.Constant('schema_id'), ast.Constant('schema_version')]))
        return node


class WithoutOutcomeEnum:
    def __init__(self,validator):self.validator=validator
    def is_valid(self,value):
        def status(error):return error.validator=='enum' and list(error.path)==['status']
        for error in self.validator.iter_errors(value):
            if status(error):continue
            if error.validator=='oneOf':
                groups={}
                for child in error.context:groups.setdefault(child.schema_path[0],[]).append(child)
                if any(all(status(child) for child in errors) for errors in groups.values()):continue
            return False
        return True


class AlwaysValid:
    def is_valid(self,value):return True


class WithoutStructure:
    """Remove a named structural schema guard while retaining the independent format guard."""
    def __init__(self, validator): self.validator = validator
    def is_valid(self, value):
        return not any(error.validator == 'format' or (
            error.validator == 'pattern' and 'format' in error.schema)
            for error in self.validator.iter_errors(value))


class WithoutFormats:
    """Named duplicates: format enforcement and UTC/end-of-input patterns on formatted leaves.

    Every non-format constraint (including type, length, required fields and identifier patterns)
    stays enabled. Direct format-leaf witnesses do not bypass an envelope or a custody gate.
    """
    def __init__(self, validator): self.validator = validator
    def is_valid(self, value):
        return not any(error.validator != 'format' and not (
            error.validator == 'pattern' and 'format' in error.schema)
            for error in self.validator.iter_errors(value))


REASONS={'outcome':{'outcome_invalid'},'admission':{'not_admitted'},'permission_or_withdrawal':{'permission_or_withdrawal'},
         'partition':{'scope_partition_mismatch'},'producer_join':{'envelope_join','idempotency_conflict'},
         'replay_policy':{'replay_only_not_appendable','replay_policy_mismatch'},'request':{'request_changed'},
         'source':{'source_changed'},'phase':{'wrong_phase'},'operation_cas':{'operation_cas_conflict'},
         'terminal_custody':{'terminal_receipt_missing'},'artifacts':{'artifact_mismatch'},
         'prior_selector':{'prior_selector_mismatch'},'selected_target':{'selected_target_mismatch'},
         'effect_count':{'effect_count_mismatch'},'effect_once':{'repeated_effect','committed_effect_cannot_fail'},
         'selector_cas':{'selector_cas_conflict'},'history_event':{'unknown_event'}}


def numeric_schema_mutant(m):
    """Named duplicate: integer integrality/safe upper bounds in schemas and hash normalization.

    Keep schema lower bounds, required fields, other types and every structural constraint enabled.
    """
    documents=deepcopy(m.checked_documents())
    def remove(node):
        if isinstance(node,dict):
            if node.get('type')=='integer':
                node['type']='number'
                if node.get('maximum')==m.SAFE_INTEGER:del node['maximum']
            for key,value in node.items():
                if key not in m.DATA_KEYWORDS:remove(value)
        elif isinstance(node,list):
            for value in node:remove(value)
    for doc in documents.values():remove(doc)
    registry=m.schema_registry(documents)
    @lru_cache(maxsize=None)
    def validator(path,definition):
        doc=documents[path]
        pointer=definition if definition.startswith('/') else '/$defs/'+definition
        new=m.Draft202012Validator({'$ref':m.document_uri(path,doc)+'#'+pointer},
            registry=registry,format_checker=m.enforced_formats())
        return new
    return validator


@contextmanager
def semantic_mutant(m,name):
    saved={}
    def change(key,value):saved[key]=getattr(m,key);setattr(m,key,value)
    try:
        m._PURE_RESULTS.clear()
        if name in REASONS:
            real=m.require
            change('require',lambda test,reason,real=real:None if reason in REASONS[name] else real(test,reason))
        for guard,fn in [('operation_schema','operation_schema_matches'),('operation_receipt','operation_receipts_match'),
                         ('operation_result_ref','operation_result_ref_matches'),('operation_result_digest','operation_result_digest_matches'),
                         ('target_schema','target_schema_matches'),('target_order','target_order_matches'),
                         ('target_manifest','target_manifest_matches'),('target_source','target_source_matches'),
                         ('target_identity','target_identity_matches'),('inline_cap','within_value_cap'),
                         ('selector_schema','selector_schema_matches'),('selector_scope','selector_scope_matches')]:
            if name==guard:change(fn,lambda *args:True)
        if name=='envelope_schema':
            real_envelope=m.envelope_validator
            change('envelope_validator',lambda:WithoutStructure(real_envelope()))
            real=m.validator
            change('validator',lambda path,definition:WithoutStructure(real(path,definition)) if path in ('Plans/event_record.schema.json','Plans/memory_maintenance_event_record.schema.json') else real(path,definition))
            change('historical_binding',replaced_function(m,'historical_binding',DropHistoryEditionConstants()))
        if name=='payload_schema':
            real=m.validator
            change('validator',lambda path,definition:WithoutStructure(real(path,definition)) if 'event_payloads' in path else real(path,definition))
        if name=='formats_enforced':
            real=m.validator
            change('validator',lambda path,definition:WithoutFormats(real(path,definition)))
            envelope=m.envelope_validator;checkpoint=m.checkpoint_validator
            change('envelope_validator',lambda:WithoutFormats(envelope()))
            change('checkpoint_validator',lambda:WithoutFormats(checkpoint()))
        if name=='references_resolve':change('unresolved_references',lambda *args,**kwargs:[])
        if name=='json_number_grammar':
            real_decoder=m.decode_json_number
            def unchecked_grammar(literal):
                try:return real_decoder(literal)
                except json.JSONDecodeError:return 1
            change('decode_json_number',unchecked_grammar)
        if name in ('producer_join','replay_policy'):
            real=m.retained_binding;field='actor_ref' if name=='producer_join' else 'replay_policy'
            def binding(value,expected):
                if isinstance(value,dict) and isinstance(expected,dict):
                    value={k:v for k,v in value.items() if k!=field};expected={k:v for k,v in expected.items() if k!=field}
                return real(value,expected)
            change('retained_binding',binding)
        if name=='producer_join':change('historical_producer_matches',lambda *args:True)
        if name=='outcome':
            real=m.validator
            change('validator',lambda path,definition:WithoutOutcomeEnum(real(path,definition)) if 'operation.schema' in path else real(path,definition))
        if name in BOUNDARY_GUARDS:
            replacements=BOUNDARY_GUARDS[name]
            # Admission and permission are separate terms of one early boundary condition.
            if name=='admission':replacements={"not flag(context['admitted'], True)":False}
            if name=='permission_or_withdrawal':replacements={"not flag(context['withdrawn'], False)":False,"not flag(context['permission'], True)":False}
            change('accept',replaced_function(m,'accept',RemoveExpressions(replacements)))
        if name in CHECKPOINT_GUARDS:
            change('checkpoint_identity_matches',replaced_function(m,'checkpoint_identity_matches',RemoveExpressions(CHECKPOINT_GUARDS[name])))
        if name=='action':change('_transition',replaced_function(m,'_transition',RemoveUnknownAction()))
        if name=='commitment_numbers':
            numeric_validator=numeric_schema_mutant(m)
            change('validator',numeric_validator)
            change('envelope_validator',lambda:numeric_validator('Plans/memory_maintenance_event_record.schema.json','current'))
            change('canonical_numbers',replaced_function(m,'canonical_numbers',RemoveUnsupportedNumber()))
            change('historical_numbers',replaced_function(m,'historical_numbers',RemoveUnsupportedNumber()))
        if name=='original_input':
            change('_transition',replaced_function(m,'_transition',RemoveExpressions({"action['value'] == value":True})))
        if name=='replay_policy':change('_append_current',replaced_function(m,'_append_current',DropReplayField()))
        yield
    finally:
        for key,value in saved.items():setattr(m,key,value)
        m._PURE_RESULTS.clear()


def prove_semantics(m,cases):
    baseline={}
    for case in cases:
        assert case['positive']()[0]=='ok',(case['name'],'invalid control',case['positive']())
        result=case['negative']();assert result[0]=='refused',(case['name'],'negative accepted',result)
        baseline[case['name']]=result
    rows=[]
    for guard in sorted({c['guard'] for c in cases}):
        flips=[];stayed=[]
        with semantic_mutant(m,guard):
            for c in cases:
                result=c['negative']()
                if c['guard']==guard:
                    assert result[0]=='ok',(guard,c['name'],'masked',result)
                    flips.append(c['name'])
                else:
                    assert result==baseline[c['name']],(guard,c['name'],'unrelated',result,baseline[c['name']])
                    stayed.append(c['name'])
        assert all(c['negative']()==baseline[c['name']] for c in cases if c['guard']==guard)
        rows.append({'guard':guard,'negatives_that_flip':flips,'negatives_that_stay_rejected':stayed,'restored':True})
    return rows



@contextmanager
def archive_mutant(archive, name):
    # Shared core predicates must also be exercised with each of the four new operation schemas.
    with archive.removed(name):
        if name=='semantic_binding':
            yield
            return
        with semantic_mutant(archive.core,name):
            original=archive._original_accept
            try:
                if name in BOUNDARY_GUARDS:
                    replacements=BOUNDARY_GUARDS[name]
                    if name=='admission':replacements={"not flag(context['admitted'], True)":False}
                    if name=='permission_or_withdrawal':replacements={"not flag(context['withdrawn'], False)":False,"not flag(context['permission'], True)":False}
                    archive._original_accept=replaced_function(archive,'_original_accept',RemoveExpressions(replacements))
                    archive.core.accept=archive.accept
                yield
            finally:
                archive._original_accept=original


def prove_complete(m, semantic, matrix, fixtures, contracts, archive=None, guards=None):
    corpus=[]
    for case in semantic:
        corpus.append({'name':case['name'],'guard':case['guard'],'positive':case['positive'],'negative':case['negative']})
    for case in matrix:
        corpus.append({'name':case['name'],'guard':case['guard'],
                       'positive':lambda c=case:matrix_probe(m,fixtures,contracts,c,True),
                       'negative':lambda c=case:matrix_probe(m,fixtures,contracts,c)})
    names = [case['name'] for case in corpus]
    assert len(names) == len(set(names)), ('duplicate_guard_case_ids', sorted({name for name in names if names.count(name)>1}))
    m.check_resources()
    assert {c['guard'] for c in corpus} <= set(guards or {c['guard'] for c in corpus}), 'unlisted guard'
    baseline={}
    for case in corpus:
        assert case['positive']()[0]=='ok',(case['name'],'invalid control')
        result=case['negative']();assert result[0]=='refused',(case['name'],'negative accepted',result)
        baseline[case['name']]=result
    rows=[]
    for guard in sorted(guards or {c['guard'] for c in corpus}):
        m.check_resources()
        flips=[];stayed=[]
        if guard.startswith('custody_'):
            context=custody_mutant(m,guard,archive)
        elif archive is not None:
            context=archive_mutant(archive,guard)
        else:
            context=semantic_mutant(m,guard)
        with context:
            for case in corpus:
                result=case['negative']()
                if case['guard']==guard:
                    assert result[0]=='ok',(guard,case['name'],'masked negative',result)
                    flips.append(case['name'])
                else:
                    assert result==baseline[case['name']],(guard,case['name'],'unrelated negative changed',result,baseline[case['name']])
                    stayed.append(case['name'])
        assert all(c['negative']()==baseline[c['name']] for c in corpus if c['guard']==guard)
        rows.append({'guard':guard,'negatives_that_flip':flips,'negatives_that_stay_rejected':stayed,'restored':True})
        print(json.dumps({'suite':'archive' if archive else 'maintenance','guard':guard,'flip':len(flips),'stay':len(stayed)}),flush=True)
    return rows,len(corpus)


def sequential(out):
    contracts = []
    for path in ('memory_maintenance_contracts.json','memory_archive_contracts.json'):
        contracts += json.loads((ROOT/'Plans'/path).read_text())['families']
    results=[]
    for contract in contracts:
        family=contract['event_type']; target=out.with_name(out.stem+'-'+family+'.json')
        subprocess.run([sys.executable,__file__,'--family',family,'--out',str(target)],check=True)
        results.append(json.loads(target.read_text()))
    merged={'status':'pass','families':sorted(c['event_type'] for c in contracts),
            'custody_matrix_cases':sum(r['custody_matrix_cases'] for r in results),
            'maintenance_cases':sum(r['maintenance_cases'] for r in results),
            'archive_cases':sum(r['archive_cases'] for r in results),
            'execution':'one family and one named guard/duplicate set at a time; no parallel jobs',
            'native':'NOT_RUN','admission':'ABSENT'}
    for key in ('maintenance_guard_table','archive_guard_table'):
        groups={}
        for result in results:
            for row in result[key]:
                merged_row=groups.setdefault(row['guard'],{'guard':row['guard'],'negatives_that_flip':[],
                    'negatives_that_stay_rejected':[],'restored':True})
                for field in ('negatives_that_flip','negatives_that_stay_rejected'):
                    merged_row[field]+=row[field]
        for row in groups.values():
            assert row['negatives_that_flip'], ('unproved guard',row['guard'])
            assert len(set(row['negatives_that_flip']+row['negatives_that_stay_rejected']))==len(row['negatives_that_flip']+row['negatives_that_stay_rejected'])
        merged[key]=[groups[k] for k in sorted(groups)]
    out.write_text(json.dumps(merged,indent=2)+'\n')
    print(json.dumps({'status':'pass','cases':merged['maintenance_cases']+merged['archive_cases'],
                      'guards':len(merged['maintenance_guard_table'])+len(merged['archive_guard_table'])}))


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,required=True);parser.add_argument('--family');args=parser.parse_args()
    if not args.family:
        return sequential(args.out)
    m=module('_check11_maintenance','pm_memory_maintenance_events.py')
    m.check_resources()
    f=m.load('Plans/memory_maintenance_event_fixtures.json');contracts={c['event_type']:c for c in m.load('Plans/memory_maintenance_contracts.json')['families']}
    contexts={c['event_type']:{'event_type':c['event_type'],'states':c['states'],
              'writer_states':next(w['states'] for w in f['writer_families'] if w['event_type']==c['event_type'])}
              for c in f['stateful_families']}
    prior=json.loads((ROOT/'reports/event-authority-20261104/DMEM-check11-guards.json').read_text())
    mg=set(row['guard'] for row in prior['guard_tables']['maintenance'])|{'formats_enforced'}
    ag=set(row['guard'] for row in prior['guard_tables']['archive'])|{'memory_flags','formats_enforced'}
    if args.family in contexts:
        contexts={args.family:contexts[args.family]};f=m.select_family(f,args.family);contracts={args.family:contracts[args.family]}
    else:
        contexts={};contracts={}
        f=m.select_family(f,args.family)
    semantic=semantic_cases(m,f,contexts)+canonical_history_cases(m,contexts)
    semantic+=m.boundary_domains().domain_cases(m,contexts,f['cases'])
    semantic+=m.write_recipes().history_cases(m,contexts)+m.write_recipes().format_cases(m,contexts)
    semantic+=m.write_recipes().retry_cases(m,contexts)
    matrix=cases_for_matrix(m,f,contracts,f['start_custody_matrix']['families'],contexts)
    rows,n=prove_complete(m,semantic,matrix,f,contracts,guards=mg) if contexts else ([],0)
    archive=module('_check11_archive','pm_memory_archive_events.py');am=archive.core
    af=am.load('Plans/memory_archive_event_fixtures.json')
    ac={c['event_type']:c for c in am.load('Plans/memory_archive_contracts.json')['families']}
    if args.family in ac:
        af=am.select_family(af,args.family);ac={args.family:ac[args.family]}
    else:
        af=am.select_family(af,args.family);ac={}
    adapted={'cases':[c for family in af['families'] for c in family['boundary_cases']]}
    actx={family['event_type']:{'event_type':family['event_type'],'states':family['states'],
           'writer_states':family['writer_states']} for family in af['families']}
    amatrix=cases_for_matrix(am,adapted,ac,[family['custody_matrix'] for family in af['families']],actx)
    for case in amatrix:
        if case['guard']=='custody_binding':case['guard']='semantic_binding'
    asemantic=[]
    for case in af['guard_cases']:
        control=deepcopy(case);control['edits']=[];control['matrix_edits']=[]
        if 'control_action' in case:control['action']=case['control_action']
        if case['kind']=='archive':control['after']=case['control_after']
        elif case['kind']=='schema':control['value']=case['control_value']
        elif case['kind']=='checkpoint':
            control['checkpoint']=case['control_checkpoint']
            control['value']=case.get('control_value',case['value'])
        def probe(c):
            result=archive.probe(c,af,ac)
            return ('ok',) if result['accepted'] else ('refused',result['refusal'])
        if case['kind']=='references':
            positive=lambda:('refused',False) if am.unresolved_references(am.checked_documents()) else ('ok',)
        else:positive=lambda c=control:probe(c)
        asemantic.append({'name':case['name'],'guard':case['guard'],'positive':positive,
                          'negative':lambda c=case:probe(c)})
    # Add the same applicable core-guard witnesses for every new exact family, including result/receipt
    # joins, action/outcome domains, phase/CAS and boundary checks; index-only witnesses do not apply.
    generic={'cases':adapted['cases'],'checkpoint_families':[]}
    checkpoint=am.load('Plans/event_record_index_checkpoint_contract_fixtures.json')['positive']['current_read_without_old_controls']
    for event,context in actx.items():
        row=context['writer_states']['before']['operation'];value=am.canonical_value(row,event.rsplit('.',1)[1])
        cases=[{'name':event+':checkpoint-foreign-storage','edits':[{'path':['checkpoint','checkpoint','storage_instance_id'],'value':'22222222-2222-4222-8222-222222222222'}]},
               {'name':event+':checkpoint-foreign-key','edits':[{'path':['checkpoint','checkpoint_key'],'value':'event_record_index_checkpoint.v1:22222222-2222-4222-8222-222222222222'}]},
               {'name':event+':checkpoint-foreign-event-identity','edits':[{'path':['value','event_id'],'value':'evt_mem_'+'0'*64}]}]
        generic['checkpoint_families'].append({'event_type':event,'operation':row,'value':value,'cases':cases})
    for case in asemantic:
        if case['guard']=='operation_valid':case['guard']='operation_schema'
        if case['guard']=='checkpoint_join':
            case['guard']='checkpoint_storage' if case['name'].endswith('checkpoint-storage_instance_id') else 'checkpoint_key'
    extra=semantic_cases(am,generic,actx)
    for case in extra:
        if case['guard']=='producer_join':case['guard']='semantic_binding'
    asemantic+=extra+canonical_history_cases(am,actx,archive=True)
    asemantic+=am.boundary_domains().domain_cases(am,actx,adapted['cases'],archive)
    asemantic+=am.write_recipes().history_cases(am,actx,archive)+am.write_recipes().format_cases(am,actx)
    asemantic+=am.write_recipes().retry_cases(am,actx,archive)
    ar,an=prove_complete(am,asemantic,amatrix,adapted,ac,archive,guards=ag) if actx else ([],0)
    result={'status':'pass','families':sorted(set(contracts)|set(ac)),
            'custody_matrix_cases':len(matrix)+len(amatrix),'maintenance_cases':n,'archive_cases':an,
            'maintenance_guard_table':rows,'archive_guard_table':ar,
            'absence_and_withdrawal_endpoint':'actual start_custody_gate; no fabricated missing bytes',
            'other_custody_endpoints':'complete phase/writer/boundary/reader entry points',
            'native':'NOT_RUN','admission':'ABSENT'}
    assert result['families'] == [args.family], ('unknown or empty family', args.family)
    args.out.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'status':'pass','cases':n+an,'guards':len(rows)+len(ar)}))

if __name__=='__main__': main()
