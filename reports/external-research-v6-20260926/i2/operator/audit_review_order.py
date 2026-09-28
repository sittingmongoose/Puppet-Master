"""Offline Claude stream-json chronology only; never emits assessment/tool contents.

Result presence alone is not success. Missing result/error flags remain unknown
unless native create/update metadata binds the successful write to its path.
Tool-call list order inside one assistant response is not execution order.
"""
import argparse
import hashlib
import json
import posixpath
from pathlib import Path

FIRST = (
    'first_view/case/brief.md', 'first_view/case/plan/Viewer.md',
    'first_view/key/SCORING.md', 'first_view/key/ome-reference.json',
    'first_view/results/X1/current.md', 'first_view/results/X2/current.md',
)
FIXED = ('out/final-assessment.json', 'out/final-assessment.md')


def relative(value, workspace):
    if not isinstance(value, str) or not value:
        return None
    value = posixpath.normpath(value)
    if value.startswith('/'):
        if value == workspace:
            return '.'
        if not value.startswith(workspace + '/'):
            return '!outside:' + value
        value = value[len(workspace) + 1:]
    return value


def first_scope(path):
    return bool(path and (path.startswith('first_view/case/') or
                          path.startswith('first_view/key/') or
                          path in FIRST[4:]))


def access(call, workspace):
    args, name = call['arguments'], call['tool'].lower()
    path = relative(args.get('file_path', args.get('path')), workspace)
    if name not in {'read', 'grep', 'glob'}:
        return path, None
    if name == 'glob':
        pattern = relative(args.get('pattern'), workspace)
        if path and (path == 'deferred' or path.startswith('deferred/')):
            return path, 'deferred'
        if pattern and (pattern == 'deferred' or pattern.startswith('deferred/')):
            return pattern, 'deferred'
        # A rooted/unscoped enumeration is exposure even when output is counts.
        if path is not None and not first_scope(path + '/' if path.endswith(('case', 'key')) else path):
            return path, 'root_or_outside_scope'
        if pattern and first_scope(pattern):
            return pattern, None
        if path and first_scope(path + '/'):
            return path, 'missing_exact_glob_prefix'
        return pattern, 'root_or_unscoped_glob'
    if path and (path == 'deferred' or path.startswith('deferred/')):
        return path, 'deferred'
    if first_scope(path) or (name == 'grep' and path in {'first_view/case', 'first_view/key'}):
        return path, None
    return path, 'root_or_unscoped_access'


def audit_bytes(raw, workspace):
    workspace = str(Path(workspace).absolute()).rstrip('/')
    calls, by_id, results, unknown, violations = [], {}, {}, [], []
    for line_number, line in enumerate(raw.splitlines(), 1):
        try:
            event = json.loads(line)
        except (ValueError, UnicodeError):
            unknown.append({'line': line_number, 'reason': 'non_json_stream_line'})
            continue
        if not isinstance(event, dict):
            unknown.append({'line': line_number, 'reason': 'nonobject_stream_event'})
            continue
        message = event.get('message') or {}
        if not isinstance(message, dict):
            unknown.append({'line': line_number, 'reason': 'nonobject_message'})
            continue
        blocks = message.get('content') or []
        if not isinstance(blocks, list):
            continue
        for block in blocks:
            if not isinstance(block, dict):
                continue
            if event.get('type') == 'assistant' and block.get('type') == 'tool_use':
                tid = block.get('id')
                if tid in by_id:
                    if by_id[tid]['tool'] != block.get('name') or by_id[tid]['arguments'] != block.get('input'):
                        unknown.append({'line': line_number, 'reason': 'conflicting_repeated_tool_id'})
                    continue
                args = block.get('input')
                call = {'line': line_number, 'response': message.get('id') or f'unknown-response-{line_number}',
                        'id': tid, 'tool': block.get('name') or 'unknown',
                        'arguments': args if isinstance(args, dict) else {}, 'result': 'unknown'}
                if not tid or not message.get('id') or not isinstance(args, dict):
                    unknown.append({'line': line_number, 'reason': 'incomplete_tool_identity_or_arguments'})
                calls.append(call)
                if tid:
                    by_id[tid] = call
            elif event.get('type') == 'user' and block.get('type') == 'tool_result':
                tid = block.get('tool_use_id')
                native = event.get('tool_use_result')
                flag = block.get('is_error')
                result = 'failure' if flag is True else 'success' if flag is False else 'unknown'
                if isinstance(native, dict):
                    if native.get('is_error') is True or native.get('error'):
                        result = 'failure'
                    elif result == 'unknown' and native.get('type') in {'create', 'update'}:
                        call = by_id.get(tid)
                        if call and call['tool'].lower() in {'write', 'edit'}:
                            target = relative(call['arguments'].get('file_path'), workspace)
                            if target is not None and relative(native.get('filePath'), workspace) == target:
                                result = 'success'
                results.setdefault(tid, []).append((line_number, result))
    response_counts = {}
    for tid in results:
        if tid not in by_id:
            unknown.append({'reason': 'tool_result_without_observed_tool_call', 'id': tid})
    for call in calls:
        response_counts[call['response']] = response_counts.get(call['response'], 0) + 1
        matches = results.get(call['id'], [])
        if len(matches) == 1 and matches[0][0] > call['line']:
            call['result_line'], call['result'] = matches[0]
        else:
            unknown.append({'line': call['line'], 'reason': 'missing_duplicate_or_misordered_tool_result'})
        if call['result'] != 'success':
            unknown.append({'line': call['line'], 'reason': 'failed_or_unconfirmed_tool_execution'})
        if call['tool'].lower() not in {'read', 'grep', 'glob', 'write', 'edit'}:
            unknown.append({'line': call['line'], 'reason': 'tool_outside_audited_file_catalogue'})
        call['path'], call['scope_issue'] = access(call, workspace)
        mode = call['arguments'].get('output_mode')
        call['output_mode'] = mode if mode in {'count', 'files_with_matches', 'content'} else None

    # Never publish tool inputs, result bodies, source prose, or assessment content.
    def public(call):
        return {k: call.get(k) for k in ('line', 'response', 'id', 'tool', 'path', 'result', 'result_line', 'scope_issue', 'output_mode')}

    initial = calls[:6]
    first_reads = 'confirmed'
    if len(initial) != 6:
        first_reads = 'unknown'
    for index, call in enumerate(initial):
        if call['tool'].lower() != 'read' or call['path'] != FIRST[index]:
            if call['result'] == 'success' and (response_counts[call['response']] == 1 or call['tool'].lower() != 'read' or call['path'] not in FIRST):
                violations.append({'line': call['line'], 'reason': 'initial_named_read_sequence_mismatch'})
            else:
                first_reads = 'unknown'
        if call['result'] != 'success' or response_counts[call['response']] != 1:
            first_reads = 'unknown'
        if index and initial[index - 1].get('result_line', float('inf')) >= call['line']:
            first_reads = 'unknown'
    if any(v['reason'] == 'initial_named_read_sequence_mismatch' for v in violations):
        first_reads = 'violation'

    exposures = [c for c in calls if c['scope_issue'] and c['scope_issue'] != 'missing_exact_glob_prefix']
    first_exposure = exposures[0] if exposures else None
    fixed = {path: [c for c in calls if c['tool'].lower() == 'write' and c['path'] == path] for path in FIXED}
    saved = {}
    for path, writes in fixed.items():
        eligible = [c for c in writes if c['result'] == 'success' and
                    (first_exposure is None or (c.get('result_line', float('inf')) < first_exposure['line'] and
                                                c['response'] != first_exposure['response']))]
        saved[path] = public(eligible[0]) if eligible else None
    fixed_before = 'confirmed' if all(saved.values()) else 'unknown'
    if first_exposure and first_exposure['result'] == 'success' and not all(saved.values()):
        # Same-response, missing/failed writes cannot establish which operation ran first.
        ambiguous = any(c['response'] == first_exposure['response'] or c['result'] != 'success'
                        for writes in fixed.values() for c in writes if c['line'] <= first_exposure['line'])
        missing = any(not writes for writes in fixed.values())
        if not ambiguous and missing:
            fixed_before = 'violation'
            violations.append({'line': first_exposure['line'], 'reason': 'exposure_before_both_fixed_writes'})
    changes = []
    for call in calls:
        if call['tool'].lower() not in {'write', 'edit'} or call['path'] not in FIXED or not first_exposure:
            continue
        if call['line'] >= first_exposure['line'] or call['response'] == first_exposure['response']:
            changes.append(public(call))
            if call['response'] == first_exposure['response'] or call['result'] != 'success' or first_exposure['result'] != 'success':
                unknown.append({'line': call['line'], 'reason': 'fixed_mutation_exposure_order_or_execution_unknown'})
            else:
                violations.append({'line': call['line'], 'reason': 'successful_fixed_file_mutation_after_exposure'})
    for call in calls:
        if call['scope_issue'] and call['scope_issue'] != 'deferred' and call['result'] == 'success':
            violations.append({'line': call['line'], 'reason': call['scope_issue']})
    if any(response_counts[c['response']] > 1 for c in calls):
        unknown.append({'reason': 'same_response_tool_list_order_is_not_execution_order'})
    return {'schema': 'er6.i2.evaluator_chronology.v1', 'stream_sha256': hashlib.sha256(raw).hexdigest(),
            'workspace': workspace, 'status': 'violation' if violations else 'unknown' if unknown or fixed_before != 'confirmed' or first_reads != 'confirmed' else 'confirmed_mechanical',
            'first_named_reads': first_reads, 'initial_tool_calls': [public(c) for c in initial],
            'first_possible_deferred_or_broad_exposure': public(first_exposure) if first_exposure else None,
            'exposure_calls': [public(c) for c in exposures], 'both_fixed_writes_before_exposure': fixed_before,
            'successful_fixed_writes': saved, 'fixed_mutations_at_or_after_exposure': changes,
            'violations': violations, 'unknowns': unknown, 'tool_call_count': len(calls),
            'limitations': ['Mechanical paths/results/order only; no semantic grading or file-content completeness proof.',
                'Same-response tool order, failed tools, and missing results are not certified.',
                'Root/unscoped reads/searches/counts are possible deferred exposure; successful scope violations do not prove which deferred bytes were returned.',
                'No filesystem isolation, hidden-tool completeness, symlink-target, or provider-payload proof.',
                'Final on-disk files cannot establish an earlier successful save; exact trace records are required.']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('stream', type=Path)
    parser.add_argument('--workspace', type=Path, required=True)
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    report = audit_bytes(args.stream.read_bytes(), args.workspace)
    report['stream_path'] = str(args.stream.absolute())
    body = json.dumps(report, indent=2) + '\n'
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(body)
    else:
        print(body, end='')


if __name__ == '__main__':
    main()
