#!/usr/bin/env python3
"""Read-only mechanical metering of terminal I2 originals. Writes evidence/meter only."""
import argparse
import ast
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT.parent
sys.path[:0] = [str(LAB / 'tools'), str(LAB / 'tools/r1b')]
from audit_tools import audit
from meter import muse_trace
from meter_r1b import zcode_tool_result_bytes

UNKNOWN = 'unknown (not exposed or not established)'
SLOTS = ('I2-M-control', 'I2-M-maintained', 'I2-Z-control', 'I2-Z-maintained')
TOKEN_KEYS = ('inputTokens', 'outputTokens', 'reasoningTokens', 'cacheReadTokens', 'cacheWriteTokens', 'cachedTokens', 'totalTokens')


def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        while chunk := f.read(1024 * 1024):
            h.update(chunk)
    return h.hexdigest()


def value(d, key):
    return d[key] if key in d and d[key] is not None else UNKNOWN


def subset(d, keys):
    return {k: value(d, k) for k in keys}


def rows(path):
    with path.open(encoding='utf-8') as f:
        for line in f:
            yield json.loads(line)


def byte_len(v):
    return len((v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)).encode('utf-8'))


def tool_metadata(app, log):
    """Never emit content; classify only explicit fields. Missing success stays unknown."""
    calls, results, offsets, conflicts = {}, {}, Counter(), []
    offset_ok = True
    raw_call_rows = 0
    for row_no, o in enumerate(rows(log)):
        if app == 'muse':
            e = (o.get('payload') or {}).get('event') or {}
            batch = e.get('tool_calls', []) if e.get('kind') == 'assistant_tool_calls_committed' else []
            for c in batch:
                raw_call_rows += 1
                cid = c.get('call_id') or c.get('id')
                args = c.get('args')
                try:
                    args = json.loads(args) if isinstance(args, str) else args
                except ValueError:
                    args = None
                calls[cid or ('missing', row_no, raw_call_rows)] = (c.get('name'), args or {})
            if e.get('kind') == 'tool_result_batch_committed':
                for i, r in enumerate(e.get('results') or []):
                    rid = r.get('tool_call_id')
                    results[rid or ('missing', row_no, i)] = {
                        'bytes': byte_len(r['text']) if 'text' in r else None,
                        'isError': r.get('isError') if isinstance(r.get('isError'), bool) else None,
                        'call_id': rid,
                    }
        else:
            response = o.get('response') or {}
            for i, c in enumerate(response.get('toolCalls') or []):
                raw_call_rows += 1
                calls[c.get('id') or ('missing', row_no, i)] = (c.get('name'), c.get('input') or {})
            rq = o.get('request') or {}
            messages = rq.get('messages') or []
            kind = rq.get('messagesKind')
            offsets[str(kind)] += 1
            off = rq.get('messageOffset', 0)
            if not isinstance(off, int) or off < 0 or (kind in ('delta', 'tail') and 'messageOffset' not in rq) or (kind == 'full' and off != 0) or kind not in ('full', 'delta', 'tail') or not isinstance(rq.get('messageCount'), int) or off + len(messages) != rq['messageCount']:
                offset_ok = False
                continue
            for i, m in enumerate(messages):
                if m.get('role') != 'tool':
                    continue
                idx = off + i
                ident = {'call_id': m.get('toolCallId'), 'digest': hashlib.sha256((m['content'] if isinstance(m.get('content'), str) else json.dumps(m.get('content'), ensure_ascii=False)).encode()).hexdigest()}
                if idx in results and any(results[idx].get(k) != v for k, v in ident.items()):
                    conflicts.append(idx)
                results[idx] = dict(ident, bytes=byte_len(m['content']) if 'content' in m else None,
                                    isError=m.get('isError') if isinstance(m.get('isError'), bool) else None)
    result_by_call = {r['call_id']: r for r in results.values() if r.get('call_id')}
    writes = Counter(); operations = Counter(); explicit_failures = Counter(); result_unknown = Counter()
    payload_bytes = Counter(); unknown_payload = Counter()
    for cid, (name, args) in calls.items():
        lower = (name or '').lower()
        kind = 'Write' if lower in ('write', 'write_file') else 'Edit' if lower in ('edit', 'edit_file') else None
        if not kind:
            continue
        operations[kind] += 1
        path = args.get('file_path') or args.get('path')
        if isinstance(path, str):
            writes[path] += 1
        content = args.get('content') if kind == 'Write' else args.get('replace') if lower == 'edit_file' else args.get('new_string')
        if isinstance(content, str):
            payload_bytes[kind] += byte_len(content)
        else:
            unknown_payload[kind] += 1
        status = result_by_call.get(cid, {}).get('isError')
        if status is True:
            explicit_failures[kind] += 1
        elif status is None:
            result_unknown[kind] += 1
    result_bytes = sum(r['bytes'] for r in results.values() if r['bytes'] is not None)
    complete_bytes = all(r['bytes'] is not None for r in results.values())
    if app == 'zcode':
        complete_bytes = complete_bytes and offset_ok and not conflicts
        helper = zcode_tool_result_bytes(log) if complete_bytes else {'bytes': UNKNOWN, 'tool_results': UNKNOWN}
        result_bytes = helper['bytes']
    return {
        'deduplicated_tool_calls': len(calls), 'raw_tool_call_rows': raw_call_rows,
        'tool_results_observed': len(results) if app == 'muse' or offset_ok and not conflicts else UNKNOWN,
        'returned_tool_text_bytes': result_bytes if complete_bytes else UNKNOWN,
        'tool_result_byte_basis': 'UTF-8 returned text; structured content serialized; spill artifact contents excluded',
        'zcode_offsets': {'kinds': dict(offsets), 'assumptions_checked': offset_ok, 'conflicting_absolute_indexes': sorted(set(conflicts))} if app == 'zcode' else None,
        'write_edit': {'calls': dict(operations), 'explicit_error_results': dict(explicit_failures),
                       'result_success_unknown_calls': dict(result_unknown),
                       'attempted_content_or_new_string_bytes': dict(payload_bytes), 'payload_bytes_unknown_calls': dict(unknown_payload),
                       'actual_cumulative_written_bytes': UNKNOWN, 'actual_overwrites': UNKNOWN,
                       'repeated_write_or_edit_path_calls': sum(n - 1 for n in writes.values()),
                       'note': 'Attempted payload bytes are not successful file-write volume; Edit new_string/replace excludes unchanged content. Repeated path calls do not prove an overwrite.'},
    }


def meter_slot(slot):
    arm = ROOT / 'runs' / slot
    status_path = arm / 'status.json'
    if not status_path.exists() or json.loads(status_path.read_text()).get('state') != 'terminal':
        return None
    sources = {status_path, Path(__file__), LAB / 'tools/audit_tools.py', LAB / 'tools/meter.py', LAB / 'tools/r1b/meter_r1b.py', LAB / 'tools/run_goal.py'}
    def load(rel):
        p = arm / rel
        if not p.exists():
            return {}
        sources.add(p)
        return json.loads(p.read_text())
    host, receipt, dispatch = load('arm-receipt.json'), load('native/receipt.json'), load('dispatch.json')
    app = host.get('app') or receipt.get('app')
    if app not in ('muse', 'zcode'):
        raise ValueError('terminal slot lacks native application identity')
    native = arm / 'native'
    driver_source = LAB / 'tools' / (app + '_goal_driver.py')
    sources.add(driver_source)
    requested = {}
    for node in ast.parse(driver_source.read_text()).body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id in ('MODEL', 'EFFORT') for t in node.targets):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id in ('MODEL', 'EFFORT'):
                    requested[t.id] = ast.literal_eval(node.value)
    log = native / ('muse-session.jsonl' if app == 'muse' else 'zcode-model-io.jsonl')
    result = {
        'schema': 'er6.i2.original-meter.v2', 'slot': slot, 'app': app, 'semantic_interpretation': False,
        'time': subset(host, ('start_epoch', 'end_epoch', 'active_span_seconds', 'native_process_seconds', 'host_prepare_seconds', 'host_terminal_seconds', 'store_poll_seconds', 'store_close_seconds')),
        'native': subset(receipt, ('session_id', 'model_id', 'provider_id', 'effort_effective', 'native_goal_entry', 'fresh_session', 'goal_submitted_utc', 'end_utc', 'elapsed_seconds', 'native_responses', 'stop_reason', 'goal_status_final', 'caps', 'usage_requests_with_delta', 'request_status_counts')),
        'requested_settings_argv': dispatch.get('argv', UNKNOWN),
        'requested_driver_settings': requested,
        'observed_settings': subset(receipt, ('model_id', 'provider_id', 'effort_ack', 'effort_effective', 'tool_allowlist')),
        'host_outcome': subset(host, ('native_outcome', 'process_exit', 'native_stop')),
        'store_attempts': host.get('attempt_counts', UNKNOWN if host.get('carrier') == 'maintained' else 'not applicable (control)'),
        'children': {'tokens': UNKNOWN, 'physical_attempts': UNKNOWN},
    }
    tokens = receipt.get('counters' if app == 'muse' else 'usage_totals') or {}
    exposed_events = tokens.get('token_usage_events') if app == 'muse' else receipt.get('usage_requests_with_delta')
    result['parent_tokens'] = subset(tokens, TOKEN_KEYS) if isinstance(exposed_events, int) and exposed_events > 0 else {k: UNKNOWN for k in TOKEN_KEYS}
    result['parent_token_usage_event_count'] = exposed_events if exposed_events is not None else UNKNOWN
    result['parent_tokens']['uncached_input'] = tokens['inputTokens'] - tokens['cacheReadTokens'] if isinstance(exposed_events, int) and exposed_events > 0 and isinstance(tokens.get('inputTokens'), int) and isinstance(tokens.get('cacheReadTokens'), int) else UNKNOWN
    if app == 'muse' and (native / 'muse-msp.jsonl').exists() and receipt.get('session_id'):
        sources.add(native / 'muse-msp.jsonl')
        trace = muse_trace(receipt['session_id'], native / 'muse-msp.jsonl')
        sources.update(Path(p) for p in trace['trace_logs'])
        if trace['trace_logs']:
            result['children'].update(trace)
            result['children']['physical_attempts'] = trace['attempts_terminal_children']
        else:
            result['children']['trace_logs'] = []
            result['children']['note'] = 'No matching trace file; terminal attempt counts unknown.'
    if log.exists():
        sources.add(log)
        a = audit(app, log, arm / 'ws')
        result['tool_audit'] = {k: a[k] for k in ('tool_calls', 'tool_call_names', 'responses_seen_in_log', 'source_read_calls', 'unique_sources_read', 'repeat_source_reads', 'reads_per_source')}
        result['tool_audit'].update(web_call_records=len(a['web_tool_calls']), shell_call_records=len(a['shell_calls']), outside_path_records=len(a['paths_outside_workspace']))
        result['tool_metadata'] = tool_metadata(app, log)
    else:
        result['tool_audit'] = result['tool_metadata'] = UNKNOWN
    for p in (native / 'progress.jsonl', native / 'usage-events.jsonl', native / 'zcode-stdout.jsonl'):
        if p.exists():
            sources.add(p)
    result['limitations'] = [
        'Missing values remain unknown. No account snapshot is treated as per-slot cost; zero-valued synthesized receipt totals may reflect absent telemetry.',
        'Muse receipt counters cover exposed parent events; child tokens are not exposed. Physical terminal attempts are not successful response counts; matched trace files can include unrelated attempts in other.',
        'Zcode usage receipt keeps the latest usage.delta per requestId; multiple incremental events per request could lose prior deltas.',
        'Zcode full/delta/tail absolute indexes require one stable conversation; offset checks and collision detection cannot establish missing history completeness.',
        'Source reads classify explicit tool/path arguments, not shell reads, nested paths, fulfilled content, or all child tools. Audit tool rows are not independently deduplicated.',
        'Tool result bytes are retained returned text, not billed bytes or physical artifact sizes. Muse result is a session-log measure, not proven provider-input coverage.',
        'Failure classification uses explicit isError only; absent structured error flags remain unknown. Native filesystem overwrite and cumulative successful write volume are not exposed by these logs.',
        'No chronology or semantic grade is inferred; Store attempt counts describe host observations and cannot recover vanished/unsubmitted writes.',
    ]
    result['raw_sources'] = [{'path': str(p), 'bytes': p.stat().st_size, 'sha256': sha(p)} for p in sorted(sources)]
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--slot', action='append', choices=SLOTS)
    args = ap.parse_args()
    out = ROOT / 'evidence/meter'
    reports = []
    for slot in args.slot or SLOTS:
        report = meter_slot(slot)
        if report is None:
            print(json.dumps({'slot': slot, 'meter': 'skipped_nonterminal_or_missing'}))
            continue
        out.mkdir(parents=True, exist_ok=True)
        target = out / (slot + '.json')
        target.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
        reports.append({'slot': slot, 'path': str(target), 'sha256': sha(target)})
    for report in reports:
        print(json.dumps(report))


if __name__ == '__main__':
    main()
