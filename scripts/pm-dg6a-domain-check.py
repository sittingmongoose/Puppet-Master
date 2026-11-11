#!/usr/bin/env python3
"""Serial DG6A numeric/format/type sweep and isolated domain guard proof.

Every authored schema node is visited, including nullable/optional/const leaves.
The source guard matrix remains a separate, unabridged serial run.
"""
import argparse
import copy
import importlib.util
import json
from pathlib import Path
from decimal import Decimal

ROOT = Path(__file__).resolve().parents[1]
import sys as _sys
_sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dg6a_custody as custody  # noqa: E402
BAD_TYPES = ['false', 'true', '0', None, [], {}, {'nested': False}, True, False, 0, 1, 1.0]
BAD_DATES = ['false', '0', '', '2026-11-04', '2026-11-04T18:00:00',
             '2026/11/04T18:00:00Z', '2026-11-04 18:00:00Z', '2026-11-04T18-00-00Z',
             '2026-13-04T18:00:00Z', '2026-00-04T18:00:00Z', '2026-11-00T18:00:00Z',
             '2026-11-31T18:00:00Z', '2025-02-29T18:00:00Z',
             '2026-11-04T24:00:00Z', '2026-11-04T18:60:00Z', '2026-11-04T18:00:60Z',
             '2016-12-31T23:59:60+01:00', '2026-06-30T23:59:60Z',
             '2026-11-04T18:00:00+24:00', '2026-11-04T18:00:00+00:60',
             '2026-11-04T18:00:00+0000', '2026-11-04T18:00:00.Z',
             '2026-11-04T18:00:00,1Z', '2026-11-04T18:00:00Z\n',
             '2026-11-04T18:00:00Z ', '2026-11-04T18:00:00.1.2Z']
# CV-1101 (sweep part 2B): year 0000 and real (offset-adjusted) leap seconds are owner-valid; the shared
# predicate refuses an illegitimate second 60 (BAD_DATES).
GOOD_DATES = ['2024-02-29T23:59:59Z', '2026-11-04t18:00:00z',
              '2026-11-04T18:00:00.0Z', '2026-11-04T18:00:00.123456789012345678901234567890Z',
              '2026-11-04T18:00:00+23:59', '2026-11-04T18:00:00-23:59', '0000-01-01T00:00:00Z',
              '2016-12-31T23:59:60Z', '2017-01-01T01:59:60+02:00', '2016-12-31T23:59:60.999Z']


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / path)
    m = importlib.util.module_from_spec(spec)
    import sys
    sys.modules[name] = m
    spec.loader.exec_module(m)
    return m


def nodes(value, path=()):
    yield path, value
    if type(value) is dict:
        for key, child in value.items():
            yield from nodes(child, path+(key,))
    elif type(value) is list:
        for i, child in enumerate(value):
            yield from nodes(child, path+(i,))


def changed(value, path, candidate):
    result = copy.deepcopy(value)
    if not path:
        return copy.deepcopy(candidate)
    parent = result
    for key in path[:-1]:
        parent = parent[key]
    parent[path[-1]] = copy.deepcopy(candidate)
    return result


def schema_nodes(schema):
    return [(p, v) for p, v in nodes(schema) if type(v) is dict and
            ('type' in v or 'const' in v or 'enum' in v or 'format' in v)]


def sample(contract, root):
    if '$ref' in contract:
        target = root
        for key in contract['$ref'][2:].split('/'):
            target = target[key]
        return sample(target, root)
    if 'const' in contract:
        return copy.deepcopy(contract['const'])
    if 'enum' in contract:
        return copy.deepcopy(contract['enum'][0])
    if 'anyOf' in contract:
        return sample(contract['anyOf'][0], root)
    kind = contract.get('type')
    if type(kind) is list:
        kind = next((k for k in kind if k != 'null'), 'null')
    if kind == 'integer': return contract.get('minimum', 0)
    if kind == 'boolean': return False
    if kind == 'null': return None
    if kind == 'object':
        return {k:sample(contract['properties'][k], root) for k in contract.get('required', [])}
    if kind == 'array':
        return [sample(contract['items'], root) for _ in range(contract.get('minItems', 0))]
    if contract.get('format') == 'date-time': return '2026-11-04T18:00:00Z'
    if contract.get('format') == 'uuid': return '00000000-0000-4000-8000-000000000001'
    for value in ('fixture', 'pmref:test:fixture', 'a'*64, 'eig_'+'a'*64):
        import re
        if len(value) >= contract.get('minLength',0) and ('pattern' not in contract or re.fullmatch(contract['pattern'], value)):
            return value
    raise AssertionError(contract)


def run(kind, m, family, fixture):
    shared = m if kind == 'alert' else m.shared
    domain = shared.domain
    rows, observations = [], []
    def record(name, passed, **detail):
        assert passed, (family['event_type'], name, detail)
        observations.append(dict(name=name, passed=True, **detail))
    def reject(schema, value):
        return bool(list(shared.Draft202012Validator(schema).iter_errors(value)))
    folder = {'alert':'alert_event_contracts', 'panel':'panel_event_contracts', 'concern':'concern_created_contracts'}[kind]
    paths = [family['payload_schema']] + [f'Plans/{folder}/{family[k]}.schema.json' for k in ('operation','checkpoint')]
    if kind == 'concern': paths += ['Plans/concern_created_contracts/concern_record.schema.json']
    if kind == 'alert': paths += [f'Plans/alert_event_contracts/{n}.schema.json' for n in ('shared_alert_state','shared_alert_rule_state')]
    for path in paths:
        schema = m.load(path)
        shared.check_schema(schema)
        for field, contract in schema_nodes(schema):
            # Retain local refs for a subtree validator.
            leaf = dict(contract, **{'$defs':schema.get('$defs',{})})
            good = sample(contract, schema)
            if contract.get('type') in ('object', 'array'):
                leaf = {'type':contract['type']}
                good = {} if contract['type']=='object' else []
            record('field positive', not reject(leaf, good), schema=path, field=field)
            negatives=[]
            for bad in BAD_TYPES:
                # Same type/value may be a positive; nullable and union alternatives
                # are tested against their declared branch, never blanket-refused.
                errors=list(shared.Draft202012Validator(leaf).iter_errors(bad))
                if errors:
                    negatives.append((bad, errors))
                declared = contract.get('type')
                declared = declared if type(declared) is list else [declared] if declared else []
                if not declared and 'const' in contract:
                    same_type = type(bad) is type(contract['const'])
                elif not declared and 'enum' in contract:
                    same_type = any(type(bad) is type(v) for v in contract['enum'])
                else:
                    json_type = {str:'string',dict:'object',list:'array',int:'integer',float:'number',bool:'boolean',type(None):'null'}[type(bad)]
                    same_type = json_type in declared
                record('field type classified', bool(errors) or same_type, schema=path, field=field)
            if 'integer' in (contract.get('type') if type(contract.get('type')) is list else [contract.get('type')]):
                nums=[float(good), float(f'{good}e0'), -0.0, 2**53, 2**53+1, 2**64, -(2**53), True, False]
                for bad in nums:
                    # CV-1100: an integer slot admits exact integers within the slot's own
                    # schema bounds only; there is no lane or default cap (Storage uint64
                    # fields declare their 0..2^64-1 bounds in the schema itself).
                    valid = (type(bad) is int and (contract.get('minimum') is None or bad >= contract['minimum'])
                             and (contract.get('maximum') is None or bad <= contract['maximum'])
                             and ('const' not in contract or bad == contract['const']))
                    record('number field', reject(leaf,bad) != valid, schema=path, field=field, value=repr(bad))
                    if reject(leaf,bad): negatives.append((bad,list(shared.Draft202012Validator(leaf).iter_errors(bad))))
            if contract.get('format') in ('date-time','uuid'):
                bads=BAD_DATES if contract['format']=='date-time' else ['false','0','00000000-0000-4000-8000-000000000001\n','not-a-uuid']
                for bad in bads:
                    record('format negative', reject(leaf,bad), schema=path, field=field, value=bad)
                    negatives.append((bad,list(shared.Draft202012Validator(leaf).iter_errors(bad))))
                if contract['format']=='date-time':
                    for good_date in GOOD_DATES: record('format positive', not reject(leaf,good_date), schema=path,field=field)
    # Exact semantic codec domain, not merely schema validation.
    # CV-1100: one numeric form (exact integers) and no lane cap; integers outside the
    # canonical MessagePack recipe domain are refused by that recipe.
    for bad in (1.0,1e0,-0.0,Decimal('1'),2**64,-(2**63)-1):
        try: shared.semantic_packed({'number':bad})
        except ValueError: record('semantic number rejection',True,value=repr(bad))
        else: record('semantic number rejection',False,value=repr(bad))
    for good in (2**53,2**53+1,-(2**53),2**64-1,-(2**63)):
        try: shared.semantic_packed({'number':good})
        except ValueError: record('semantic number admission',False,value=repr(good))
        else: record('semantic number admission',True,value=repr(good))
    for raw in ('-0','01','-01','NaN','Infinity','-Infinity'):
        try: domain.loads('{"number":'+raw+'}')
        except ValueError: record('lexical number rejection',True,value=raw)
        else: record('lexical number rejection',False,value=raw)
    # Each recursive domain predicate has its own direct guard witness, with
    # an unrelated predicate's complete negative set still rejecting unchanged.
    number_negatives=[{'number':v} for v in (1.0,1e0,-0.0,Decimal('1'))]
    format_negatives=[{'ts':v} for v in BAD_DATES]
    def predicate_rejects(fn,v):
        try:fn(v)
        except ValueError:return True
        return False
    # Case generation only: guard removal is the guard tool's row cut, not a patch here.
    for function,own,other,other_fn in [('semantic_numbers',number_negatives,format_negatives,domain.semantic_formats),
                                       ('semantic_formats',format_negatives,number_negatives,domain.semantic_numbers)]:
        record('recursive domain predicate',all(predicate_rejects(getattr(domain,function),v) for v in own))
        record('other predicate independent',not any(predicate_rejects(getattr(domain,function),v) for v in other))
    # Same actual composed validators used by the family checker. One leaf changes;
    # schema/domain rejection must happen before comparisons/encoding (no exception).
    op = fixture['operation_cases'][0]['value'] if kind=='alert' else fixture['settled_operation']
    payload_schema=m.load(family['payload_schema']); op_schema=m.load(paths[1]); cp_schema=m.load(paths[2])
    payload=op['payload']; cp=fixture['checkpoint_cases'][0]['value'] if kind=='alert' else fixture['checkpoint']
    guard=fixture.get('payload_cases',[{}])[0].get('guard',{})
    def payload_errors(v):
        return m.errors(v,payload_schema,guard) if kind=='alert' else m.payload_errors(v,payload_schema)
    def operation_errors(v):
        return m.operation_errors(v,op_schema) if kind=='alert' else (m.operation_errors(v,op_schema,payload_schema,family['event_type']) if kind=='panel' else m.operation_errors(v,op_schema,payload_schema))
    protocol_original = fixture['append_operations']['settled']
    proof=copy.deepcopy(next(c['value'] for c in fixture['isolated_cases'] if c['name']=='valid_protocol'))
    contexts=[('protocol',proof,lambda v:m.protocol_errors(v,protocol_original)),('payload',payload,payload_errors),('operation',op,operation_errors),('checkpoint',cp,lambda v:m.checkpoint_errors(v,cp_schema,op))]
    if kind=='panel':
        old=m.load(f'Plans/event_payloads/{family["slug"]}.schema.json')
        reader=lambda r,e:m.historical_panel_page(r,e,family,payload_schema,old,cp_schema)
    elif kind=='alert':reader=lambda r,e:m.historical_alert_page(r,e,family,payload_schema,cp_schema)
    else:reader=lambda r,e:m.historical_concern_page(r,e,payload_schema,cp_schema)
    histories=[('current',fixture['history'])]+([('v1',fixture['historical_history'])] if kind=='panel' else [])
    for version,history in histories:
        expected=history['expected']; request=shared.history_request(dict(history=history),expected['checkpoint'])
        def history_errors(v,expected=expected):
            try:reader(v,expected)
            except shared.HistoryUnavailable as e:return e.guards
            except ValueError as e:return [str(e)]
            return []
        # Coherent malformed timestamp originals prove the format guard itself,
        # without a stale observational copy masking the schema/format check.
        for field,value in nodes(request['event']):
            if type(value) is str and domain.instant(value):
                for bad in BAD_DATES:
                    candidate=changed(request,('event',)+field,bad)
                    independent=changed(expected,('event',)+field,bad)
                    # Part 2B: the malformed original is Storage history (a writer that skipped format
                    # enforcement), so SP-1101 custody resolves it and the timestamp row itself refuses.
                    try:
                        with custody.written([independent['event']]):reader(candidate,independent)
                    except shared.HistoryUnavailable as e:
                        owner='historical_payload' if field[:1]==('payload',) else 'original_receipt' if field[:1]==('receipt',) else 'event_original'
                        record('coherent retained timestamp domain',e.guards==[owner],version=version,field=field)
                    else:record('coherent retained timestamp domain',False,version=version,field=field)
        contexts.append(('history/'+version,request,history_errors))
    for state in ('prepared', 'committed', 'settled'):
        state_operation=copy.deepcopy(fixture['append_operations'].get(state,op))
        state_operation['state']=state
        if state=='prepared':
            for key in ('owner_commit_ref','result_ref','dispatch_receipt_ref','original_append_result_ref'):state_operation[key]=None
        contexts.append(('operation/'+state,state_operation,operation_errors))
    for name,original,checker in contexts:
        record('composed positive',not checker(original),context=name)
        for field,value in nodes(original):
            for bad in BAD_TYPES:
                if type(bad) is type(value):continue
                candidate=changed(original,field,bad)
                # live is explicitly nonauthoritative; nullable fields are evaluated
                # by their schema. Acceptance is recorded rather than overclaimed.
                try: result=checker(candidate)
                except Exception as e: raise AssertionError((name,field,repr(bad))) from e
                record('composed wrong type classified', bool(result) or (name.startswith('history/') and field[:1]==('live',)) or (name=='protocol' and field[:1]==('append_family',)) or (name.split('/')[0] in ('payload','operation','checkpoint') and not reject({'payload':payload_schema,'operation':op_schema,'checkpoint':cp_schema}[name.split('/')[0]],candidate)),context=name,field=field,rejected=bool(result),value=repr(bad))
            if type(value) is int:
                for bad in (float(value),float(str(value)+'e0'),-0.0,Decimal(value),2**64):
                    candidate=changed(original,field,bad)
                    result=checker(candidate)
                    allowed = (name=='protocol' and kind=='panel' and field==('frontier',) and type(bad) is int and proof['cursor']<=bad<=2**64-1) or (name=='checkpoint' and type(bad) is int and bad<=2**64-1) or (name.startswith('history/') and field[:1]==('live',))
                    record('composed numeric domain',bool(result) or allowed,context=name,field=field,value=repr(bad),rejected=bool(result))
            if type(value) is str and domain.instant(value):
                for bad in BAD_DATES:
                    record('composed timestamp',bool(checker(changed(original,field,bad))),context=name,field=field,value=bad)
    # New navigation predicate guard proof: removing it admits its exact wrong
    # container/missing-member cases; the real reader must refuse without an exception.
    expected=histories[-1][1]['expected'];base=shared.history_request(dict(history=histories[-1][1]),expected['checkpoint']);bad_shapes=[]
    for field in ((),('event',),('checkpoint',),('disclosure',),('event','payload')):
        for bad in ('false','0',None,[],[{}]):bad_shapes.append(changed(base,field,bad))
    for section in ('checkpoint','event','disclosure'):
        for key in base[section]:
            if section=='checkpoint' and key not in ('state','through_sequence_id','publication_id','index_read_token'):continue
            bad=copy.deepcopy(base);del bad[section][key];bad_shapes.append(bad)
    for bad in bad_shapes:
        record('history navigation rejected',not shared.history_shape(bad,expected))
        try:reader(bad,expected)
        except shared.HistoryUnavailable as e:record('history modeled unavailable',e.guards==['history_shape'])
        else:record('history modeled unavailable',False)
    # CV-1101 exact order across a leap second and year 0000 (exact comparison stays with the lane, offsets applied).
    record('leap second order',domain.instant_le('2016-12-31T23:59:59.999Z','2016-12-31T23:59:60Z') and domain.instant_le('2016-12-31T23:59:60.5Z','2017-01-01T00:00:00Z') and not domain.instant_le('2017-01-01T00:00:00Z','2016-12-31T23:59:60.5Z') and domain.instant_le('2017-01-01T01:59:60+02:00','2016-12-31T23:59:60Z') and domain.instant_le('2016-12-31T23:59:60Z','2017-01-01T01:59:60+02:00'))
    record('year 0000 order',domain.instant_le('0000-01-01T00:00:00Z','0001-01-01T00:00:00Z') and not domain.instant_le('0000-12-31T23:59:59Z','0000-01-01T00:00:00Z'))
    record('extreme calendar offsets',domain.instant_le('0001-01-01T00:00:00+23:59','0001-01-01T00:00:00Z') and domain.instant_le('9999-12-31T23:59:59Z','9999-12-31T23:59:59-23:59'))
    # Long fractional comparisons keep every digit, including after digit six.
    record('fraction precision', not domain.instant_le('2026-11-04T18:00:00.0000001Z','2026-11-04T18:00:00.0000000Z'))
    return dict(status='pass',family=family['event_type'],guards=rows,observations=observations)


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--family',required=True);parser.add_argument('--output',required=True);args=parser.parse_args()
    for kind,folder,script in [('alert','alert_event_contracts','pm-alert-event-contracts-check.py'),('panel','panel_event_contracts','pm-panel-event-contracts-check.py'),('concern','concern_created_contracts','pm-concern-created-contracts-check.py')]:
        m=module('domain_'+kind,script)
        for family in m.load(f'Plans/{folder}/manifest.json')['families']:
            if family['event_type']!=args.family:continue
            shared=m if kind=='alert' else m.shared
            memory=next(int(l.split()[1]) for l in Path('/proc/meminfo').read_text().splitlines() if l.startswith('MemAvailable:'))
            if memory<6*1024*1024:raise RuntimeError('paused: under 6 GiB available')
            output=run(kind,m,family,m.load(f'Plans/{folder}/{family["slug"]}.fixtures.json'))
            Path(args.output).write_text(json.dumps(output,indent=2)+'\n')
            print(json.dumps(dict(status=output['status'],family=args.family,observations=len(output['observations']),guards=len(output['guards']))));return
    raise ValueError(args.family)

if __name__=='__main__':main()
