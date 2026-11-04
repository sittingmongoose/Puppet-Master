#!/usr/bin/env python3
"""DG6A isolated current-operation vectors and source guard-removal matrix.

Mutation happens only in memory, is restored in finally, and never changes a
production rule. Fixture vectors commit their repaired observations/digests.
"""
import argparse
import ast
import copy
import importlib.util
import inspect
import json
import sys
from pathlib import Path
from jsonschema.exceptions import SchemaError

ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = {}


def module(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / file)
    result = importlib.util.module_from_spec(spec)
    sys.modules[name] = result
    spec.loader.exec_module(result)
    return result


def messages(errors):
    return sorted(str(e) if isinstance(e, str) else 'schema:' + '/'.join(map(str, e.absolute_path)) + ':' + e.validator
                  for e in errors)


def run_case(kind, m, family, fixture, case):
    shared = m if kind == 'alert' else m.shared
    folder = {'alert': 'alert_event_contracts', 'panel': 'panel_event_contracts', 'concern': 'concern_created_contracts'}[kind]
    def schema(path):
        key = (id(m), path)
        if key not in SCHEMAS:
            SCHEMAS[key] = m.load(path)
        return SCHEMAS[key]
    payload_schema = schema(family['payload_schema'])
    op_schema = schema(f'Plans/{folder}/{family["operation"]}.schema.json')
    cp_schema = schema(f'Plans/{folder}/{family["checkpoint"]}.schema.json')
    original = fixture['operation_cases'][0]['value'] if kind == 'alert' else fixture['settled_operation']
    value = copy.deepcopy(case['value'])
    target = case['target']
    if target == 'operation':
        args = (value, op_schema) if kind == 'alert' else ((value, op_schema, payload_schema, family['event_type']) if kind == 'panel' else (value, op_schema, payload_schema))
        return messages(m.operation_errors(*args))
    if target == 'payload':
        return messages(m.errors(value, payload_schema, case['guard']) if kind == 'alert' else m.payload_errors(value, payload_schema))
    if target == 'protocol':
        return messages(m.protocol_errors(value, case.get('original', original)))
    if target == 'checkpoint':
        return messages(m.checkpoint_errors(value, cp_schema, case.get('original', original)))
    if target == 'profile':
        return messages(shared.profile_errors(value, family['operation'], 'redb', 'settings_and_layout' if kind == 'panel' else 'coordination_and_storage'))
    if target == 'policy':
        return messages(shared.writer_policy_errors(value))
    if target == 'refs':
        return messages(shared.schema_ref_errors(value))
    if target == 'comparison':
        return [] if shared.exact_value(value['candidate'], value['source']) else ['immutable source mismatch']
    if target == 'schema':
        try:
            shared.check_schema(value)
        except (AssertionError, SchemaError):
            return ['invalid schema contract']
        return []
    if target == 'pager':
        try:
            result = shared.history_page(**value)
        except ValueError:
            return case['errors']
        mode = case['mode']
        safe = {'scan': result['after_sequence_id'] <= 256,
                'matches': len(result['event_refs']) <= 64,
                'bytes': len(shared.packed(result)) <= 16384,
                'past': 'past' not in result['event_refs'],
                'future': result['after_sequence_id'] <= value['frontier'],
                'family': 'foreign' not in result['event_refs'],
                'project': 'foreign' not in result['event_refs']}.get(mode, False)
        return case['errors'] if safe else []
    raise AssertionError(target)


def vectors(kind, m, family, fixture):
    rows = []
    for case in fixture['isolated_cases']:
        actual = run_case(kind, m, family, fixture, case)
        assert actual == sorted(case['errors']), (family['event_type'], case['name'], actual, case['errors'])
        rows.append(case)
    return len(rows)


def rejection_mutants(m, function):
    """Every explicit rejection site, including schema initializers and catch paths."""
    fn = getattr(m, function)
    source, start = inspect.getsourcelines(fn)
    tree = ast.parse(''.join(source))
    result = []
    for node in ast.walk(tree):
        if function == 'exact_value':
            options = []
            if isinstance(node, ast.If) and ast.unparse(node.test).startswith('type(left)'):
                options.append(('exact JSON value type', ast.Pass()))
            elif isinstance(node, ast.Return) and isinstance(node.value, ast.BoolOp):
                category = 'object' if 'left.keys()' in ast.unparse(node.value) else 'array'
                for i, label in enumerate(('keys' if category=='object' else 'length', 'child values')):
                    replacement = copy.deepcopy(node)
                    replacement.value.values[i] = ast.Constant(value=True)
                    options.append((category + ' ' + label, replacement))
            elif isinstance(node, ast.Return) and isinstance(node.value, ast.Compare):
                options.append(('scalar value', ast.Return(value=ast.Constant(value=True))))
            for label, replacement in options:
                result.append(dict(module=m,function=function,line=start+node.lineno-1,node_line=node.lineno,
                                   label=label,replacement=replacement,tree=tree))
            continue
        replacement = None
        label = None
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            call = node.value
            if isinstance(call.func, ast.Attribute) and call.func.attr == 'append' and isinstance(call.func.value, ast.Name) and call.func.value.id in ('found', 'errors'):
                replacement = ast.Pass()
                label = ast.unparse(call.args[0])
            elif function == 'check_schema':
                replacement = ast.Pass()
                label = 'schema metaschema validity'
        elif isinstance(node, ast.Assert) and function == 'check_schema':
            replacement = ast.Pass()
            label = 'eager resolution of every schema reference'
        elif isinstance(node, ast.Assign) and isinstance(node.value, ast.Call) and ast.unparse(node.value).startswith('list(Draft202012Validator'):
            replacement = copy.deepcopy(node)
            replacement.value = ast.List(elts=[], ctx=ast.Load())
            label = 'schema validation'
        elif isinstance(node, ast.AugAssign) and isinstance(node.value, ast.Call) and ast.unparse(node.value).startswith('list(Draft202012Validator'):
            replacement = ast.Pass()
            label = 'nested payload schema validation'
        elif isinstance(node, ast.If) and function == 'writer_policy_errors':
            replacement = ast.Pass()
            label = 'replay-only rejection (duplicates unsupported-policy rejection)'
        elif isinstance(node, ast.Return) and function in ('profile_errors', 'writer_policy_errors') and isinstance(node.value, (ast.List, ast.IfExp)):
            if isinstance(node.value, ast.List) and not node.value.elts:
                continue
            if function == 'writer_policy_errors' and isinstance(node.value, ast.List):
                continue  # Its containing branch is removed as a whole above.
            replacement = ast.Return(value=ast.List(elts=[], ctx=ast.Load()))
            label = ast.unparse(node.value)
        elif isinstance(node, ast.Raise) and function == 'schema_ref_errors':
            replacement = ast.Pass()
            label = ast.unparse(node.exc)
        elif isinstance(node, ast.If) and function == 'history_page':
            replacement = copy.deepcopy(node)
            replacement.test = ast.Constant(value=False)
            label = ast.unparse(node.test)
        elif isinstance(node, ast.Assign) and function == 'history_page' and any(isinstance(t, ast.Name) and t.id == 'match' for t in node.targets):
            replacement = copy.deepcopy(node)
            replacement.value = ast.Constant(value=True)
            label = 'exact event family and Project filter'
        if replacement is not None:
            result.append(dict(module=m, function=function, line=start + node.lineno - 1, node_line=node.lineno,
                               label=label, replacement=replacement, tree=tree))
    return result


def install(mutants):
    saved = []
    groups = {}
    for mutant in mutants:
        groups.setdefault((mutant['module'], mutant['function']), []).append(mutant)
    for (m, function), group in groups.items():
        tree = copy.deepcopy(group[0]['tree'])
        changes = {x['node_line']: x['replacement'] for x in group}
        class Remove(ast.NodeTransformer):
            def generic_visit(self, node):
                if isinstance(node, ast.stmt) and node.lineno in changes:
                    return ast.copy_location(copy.deepcopy(changes[node.lineno]), node)
                return super().generic_visit(node)
        tree = ast.fix_missing_locations(Remove().visit(tree))
        scope = {}
        exec(compile(tree, inspect.getsourcefile(getattr(m, function)), 'exec'), m.__dict__, scope)
        saved.append((m, function, getattr(m, function)))
        setattr(m, function, scope[function])
    return saved


def restore(saved):
    for m, name, fn in saved:
        setattr(m, name, fn)


def duplicate_proofs(kind, m, mutants, cases, rows):
    """Only named repetitions of the same fact may mask a singleton witness."""
    proofs, matrices = [], {}
    for family, fixture, case in cases:
        name = family['event_type'] + ':' + case['name']
        if any(name in row['negatives_that_flip'] for row in rows if not row['duplicate_pairs']):
            continue
        labels = None
        if case['name'] == 'command_window_join' and family['event_type'] == 'panel.redocked':
            labels = ["'frozen command/payload ' + key", "'frozen command window mismatch'"]
        elif case['name'] == 'nested_payload_schema_only':
            labels = ['schema validation', 'nested payload schema validation']
        elif case['name'].startswith('representation_'):
            field = 'request_digest' if 'request_digest' in case['name'] else 'operation_digest'
            identity = {'alert': "'operation identity digest mismatch'", 'panel': "'original identity mismatch'", 'concern': "'original identity mismatch'"}[kind]
            request = {'alert': "'frozen command digest mismatch'", 'panel': "'frozen command digest mismatch'", 'concern': "'frozen command/payload/record digest mismatch'"}[kind]
            labels = ['schema validation', request if field == 'request_digest' else identity]
        elif case['name'] in ('policy_projector_replay_only', 'protocol_replay_policy'):
            pair = [v for v in mutants if v['function']=='writer_policy_errors']
            assert len(pair) == 2
            labels = [v['label'] for v in pair]
        assert labels is not None, ('masked negative without named duplicate', name, case['errors'])
        pair = [v for v in mutants if v['label'] in labels and
                ((v['module'] is m and v['function']=='operation_errors') or v['function']=='writer_policy_errors')]
        assert len(pair) == 2, (name, labels, pair)
        saved = install(pair)
        try:
            assert not run_case(kind, m, family, fixture, case), ('duplicate removal did not flip', name)
            pair_id = kind + ':' + '+'.join(str(v['line']) for v in pair)
            if pair_id not in matrices:
                flipped, rejected = [], []
                for other_family, other_fixture, other_case in cases:
                    other_name = other_family['event_type'] + ':' + other_case['name']
                    result = run_case(kind, m, other_family, other_fixture, other_case)
                    (rejected if result else flipped).append(other_name)
                matrices[pair_id] = dict(id=pair_id, guards=[dict(function=v['function'],line=v['line'],guard=v['label']) for v in pair],
                                         negatives_that_flip=flipped, negatives_that_stay_rejected=rejected, status='pass')
        finally:
            restore(saved)
        proofs.append(dict(negative=name, guards=[dict(function=v['function'], line=v['line'], guard=v['label']) for v in pair],
                           pair_id=pair_id, status='pass'))
    return proofs, list(matrices.values())


def history_matrix(kind, m, family, fixture):
    shared = m if kind == 'alert' else m.shared
    payload_schema = m.load(family['payload_schema'])
    folder = {'alert': 'alert_event_contracts', 'panel': 'panel_event_contracts', 'concern': 'concern_created_contracts'}[kind]
    cp_schema = m.load(f'Plans/{folder}/{family["checkpoint"]}.schema.json')
    if kind == 'alert':
        reader = lambda r, e: shared.historical_alert_page(r, e, family, payload_schema, cp_schema)
    elif kind == 'panel':
        old_schema = m.load(f'Plans/event_payloads/{family["slug"]}.schema.json')
        reader = lambda r, e: m.historical_panel_page(r, e, family, payload_schema, old_schema, cp_schema)
    else:
        reader = lambda r, e: m.historical_concern_page(r, e, payload_schema, cp_schema)
    histories = [('current', fixture['history'])]
    if kind == 'panel':
        histories.append(('v1', fixture['historical_history']))
    rows, positives = [], []
    for version, history in histories:
        expected = copy.deepcopy(history['expected'])
        base = shared.history_request(dict(history=history), expected['checkpoint'])
        base['checkpoint']['index_read_token']['checkpoint_ref'] = history['case_checkpoint_ref']
        expected['checkpoint']['index_read_token']['checkpoint_ref'] = history['case_checkpoint_ref']
        # Independently supplied original Storage metadata. A caller cannot renew it.
        for key in ('observed_at_utc', 'persisted_at_utc'):
            base['event'][key] = expected['event'][key] = '2026-11-04T18:00:00Z'
        negatives = [c for c in history['cases'] if not c['valid']]
        negatives = copy.deepcopy(negatives)
        for key in ('sequence_id', 'event_type', 'observed_at_utc', 'persisted_at_utc'):
            negatives.append(dict(name='original_storage_' + key, path=['event', key], value=2 if key=='sequence_id' else 'foreign', guard='event_original'))
        def receipt_leaves(value, path):
            for key, child in value.items():
                if isinstance(child, dict):
                    yield from receipt_leaves(child, path+[key])
                else:
                    yield path+[key], child
        for path, value in receipt_leaves(base['event']['receipt'], ['event','receipt']):
            negatives.append(dict(name='storage_'+'_'.join(path[2:]), path=path,
                                  value=value+1 if isinstance(value, int) else 'foreign', guard='original_receipt'))
        for name, path, value, guard in [
                ('typed_event_sequence', ['event', 'sequence_id'], True, 'event_original'),
                ('typed_receipt_sequence', ['event','receipt','sequence_id'], True, 'original_receipt'),
                ('typed_first_receipt_sequence', ['event','receipt','first_append_receipt','sequence_id'], True, 'original_receipt'),
                ('typed_first_receipt_generation', ['event','receipt','first_append_receipt','segment_generation'], False, 'original_receipt'),
                ('typed_original_result_offset', ['event','receipt','original_append_result','byte_offset'], False, 'original_receipt'),
                ('typed_source_generation', ['event','source_selection','manifest_generation'], False, 'original_source')]:
            negatives.append(dict(name=name,path=path,value=value,guard=guard))
        missing_header = copy.deepcopy(base['event']['receipt']['first_append_receipt'])
        del missing_header['sequence_id']
        negatives.append(dict(name='missing_original_receipt_sequence',path=['event','receipt','first_append_receipt'],
                              value=missing_header,guard='original_receipt'))
        def integer_leaf(value, path):
            if type(value) is int:
                return path, value
            if isinstance(value, dict):
                for key, child in value.items():
                    found = integer_leaf(child, path+[key])
                    if found is not None:
                        return found
        payload_path, integer = integer_leaf(base['event']['payload'], ['event','payload'])
        negatives.append(dict(name='typed_original_payload_integer',path=payload_path,value=float(integer),guard='historical_payload'))
        for policy in ('dedupe_by_idempotency_key', 'projector_replay_only'):
            base['event']['replay_policy'] = expected['event']['replay_policy'] = policy
            live = copy.deepcopy(base)
            live.pop('live')
            assert reader(live, expected)['event_refs'] == [expected['event']['event_ref']]
            positives.append(dict(family=family['event_type'], version=version, policy=policy, live_absent=True, status='pass'))
        for case in negatives:
            request = copy.deepcopy(base)
            shared.history_patch(request, case)
            assert shared.changed_leaves(base, request) == 1
            try:
                reader(request, expected)
            except shared.HistoryUnavailable as error:
                assert error.guards == [case['guard']], (case['name'], error.guards)
            else:
                raise AssertionError(case['name'])
        original_guards = shared.historical_guards
        for guard in original_guards(base, expected,
                {(payload_schema['properties']['schema_id']['const'], payload_schema['properties']['schema_version']['const']):payload_schema},
                cp_schema, m.checkpoint_errors):
            def weakened(*args):
                guards = original_guards(*args)
                del guards[guard]
                return guards
            flipped, rejected = [], []
            try:
                shared.historical_guards = weakened
                for case in negatives:
                    request = copy.deepcopy(base)
                    shared.history_patch(request, case)
                    try:
                        reader(request, expected)
                    except shared.HistoryUnavailable as error:
                        assert case['guard'] != guard and error.guards == [case['guard']]
                        rejected.append(case['name'])
                    else:
                        assert case['guard'] == guard
                        flipped.append(case['name'])
            finally:
                shared.historical_guards = original_guards
            assert flipped
            rows.append(dict(kind='history', family=family['event_type'], version=version, function='historical_guards',
                             guard=guard, duplicate_pairs=[], negatives_that_flip=flipped,
                             negatives_that_stay_rejected=rejected, status='pass'))
    return rows, positives


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    rows, cases, pairs, pair_matrices, history_rows, history_positives = [], [], [], [], [], []
    for kind, script, folder in [('alert', 'pm-alert-event-contracts-check.py', 'alert_event_contracts'),
                                 ('panel', 'pm-panel-event-contracts-check.py', 'panel_event_contracts'),
                                 ('concern', 'pm-concern-created-contracts-check.py', 'concern_created_contracts')]:
        m = module('guard_' + kind, script)
        families = m.load(f'Plans/{folder}/manifest.json')['families']
        lane_cases = []
        for family in families:
            fixture = m.load(f'Plans/{folder}/{family["slug"]}.fixtures.json')
            vectors(kind, m, family, fixture)
            for case in fixture['isolated_cases']:
                if case['errors']:
                    lane_cases.append((family, fixture, case))
            historical, positives = history_matrix(kind, m, family, fixture)
            history_rows += historical
            history_positives += positives
        sources = [(m, ['errors', 'operation_errors', 'protocol_errors', 'checkpoint_errors', 'profile_errors', 'writer_policy_errors', 'schema_ref_errors'])] if kind == 'alert' else [
            (m, ['operation_errors', 'protocol_errors', 'checkpoint_errors'] + (['payload_errors'] if kind == 'panel' else [])),
            (m.shared, ['checkpoint_errors', 'profile_errors', 'writer_policy_errors', 'schema_ref_errors'])]
        sources.append((m if kind == 'alert' else m.shared, ['history_page', 'check_schema', 'exact_value']))
        mutants = [v for source, functions in sources for function in functions for v in rejection_mutants(source, function)]
        for mutant in mutants:
            saved = install([mutant])
            flipped, rejected, exceptions, changed_rejections = [], [], [], []
            try:
                for family, fixture, case in lane_cases:
                    name = family['event_type'] + ':' + case['name']
                    try:
                        result = run_case(kind, m, family, fixture, case)
                        (rejected if result else flipped).append(name)
                        if result and result != sorted(case['errors']):
                            changed_rejections.append(dict(negative=name, before=case['errors'], after=result))
                    except Exception as e:
                        exceptions.append(dict(case=name, error=repr(e)))
            finally:
                restore(saved)
            duplicate = []
            if not flipped and mutant['label'] == 'nested payload schema validation':
                duplicate = [v for v in mutants if v['module'] is mutant['module'] and v['function'] == mutant['function'] and v['label'] == 'schema validation']
                saved = install([mutant, *duplicate])
                try:
                    flipped, rejected = [], []
                    for family, fixture, case in lane_cases:
                        name = family['event_type'] + ':' + case['name']
                        (rejected if run_case(kind, m, family, fixture, case) else flipped).append(name)
                finally:
                    restore(saved)
            if not flipped and mutant['function'] == 'writer_policy_errors':
                duplicate = [v for v in mutants if v['module'] is mutant['module'] and v['function']=='writer_policy_errors' and v is not mutant]
                saved = install([mutant, *duplicate])
                try:
                    flipped, rejected = [], []
                    for family, fixture, case in lane_cases:
                        name = family['event_type'] + ':' + case['name']
                        (rejected if run_case(kind, m, family, fixture, case) else flipped).append(name)
                finally:
                    restore(saved)
            rows.append(dict(kind=kind, function=mutant['function'], line=mutant['line'], guard=mutant['label'],
                             duplicate_pairs=[dict(function=v['function'], line=v['line'], guard=v['label']) for v in duplicate],
                             negatives_that_flip=flipped, negatives_that_stay_rejected=rejected, exceptions=exceptions,
                             changed_rejections=changed_rejections,
                             status='pass' if flipped and not exceptions else 'UNPROVED'))
        cases += [(kind, f['event_type'], c['name']) for f, _, c in lane_cases]
        proofs, matrices = duplicate_proofs(kind, m, mutants, lane_cases, [r for r in rows if r['kind']==kind])
        pairs += proofs
        pair_matrices += matrices
    rows += history_rows
    for row in rows:
        for changed in row.get('changed_rejections', []):
            assert any(p['negative']==changed['negative'] for p in pairs), ('unrelated rejection changed', changed)
    output = dict(status='pass' if all(r['status']=='pass' for r in rows) else 'fail', guards=rows, negatives=len(cases),
                  duplicate_proofs=pairs, duplicate_pair_matrices=pair_matrices, history_positives=history_positives)
    Path(args.output).write_text(json.dumps(output, indent=2)+'\n')
    print(json.dumps(dict(status=output['status'], guards=len(rows), proved=sum(r['status']=='pass' for r in rows), negatives=len(cases))))
    for r in rows:
        if r['status'] != 'pass': print(r['kind'], r['function'], r['line'], r['guard'], r['exceptions'][:1])
    return 0 if output['status']=='pass' else 1


if __name__ == '__main__':
    raise SystemExit(main())
