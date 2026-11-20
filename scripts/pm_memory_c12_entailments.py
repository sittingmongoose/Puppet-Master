#!/usr/bin/env python3
"""Checked DMEM implication ledger for the 26 intentionally unproved C12 rows.

Only schema-valid values are bounded here. Encoded upper bounds use the
unchanged SP-278 codec, closed owner fields and complete schema limits. These
are implications, never mutation kills or extra gated-tool credit.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_memory_maintenance_events as m


def upper(schema):
    """Conservative MessagePack byte bound; infinity means this argument proves nothing."""
    if 'const' in schema:
        return len(m._CODEC.binding_bytes(schema['const']))
    if 'enum' in schema:
        return max(len(m._CODEC.binding_bytes(x)) for x in schema['enum'])
    kind = schema.get('type')
    if kind in ('null', 'boolean'):
        return 1
    if kind in ('integer', 'number'):
        return 9
    if 'maxLength' in schema:
        pattern = schema.get('pattern', '')
        # These exact owner patterns admit ASCII only. Other strings retain the
        # full four-byte UTF-8 bound; format/date-time also admits ASCII only.
        ascii_only = pattern in (r'^[0-9a-f]{64}$', r'^evt_mem_[0-9a-f]{64}$',
            r'^memresult_[0-9a-f]{64}$', r'^memtarget_[0-9a-f]{64}$',
            r'^(?!\.{1,2}$)[A-Za-z0-9_.-]+$(?![\s\S])') or schema.get('format') in ('uuid', 'date-time')
        return 5 + schema['maxLength'] * (1 if ascii_only else 4)
    if kind == 'array' and 'maxItems' in schema:
        return 5 + schema['maxItems'] * upper(schema['items'])
    if kind == 'object' and schema.get('additionalProperties') is False:
        return 5 + sum(len(m._CODEC.binding_bytes(key)) + upper(prop)
                       for key, prop in schema['properties'].items())
    if 'anyOf' in schema or 'oneOf' in schema:
        return max(upper(s) for s in schema.get('anyOf', schema.get('oneOf')))
    return math.inf


def citation(path, token):
    lines = (ROOT / path).read_text().splitlines()
    i = next(i for i, line in enumerate(lines, 1) if token in line)
    return {'path': path, 'line': i, 'quote': lines[i - 1],
            'sha256': hashlib.sha256((ROOT / path).read_bytes()).hexdigest()}


def ledger():
    records = []
    def add(rows, reason, *tokens):
        for row in rows:
            records.append({'row': row, 'classification': 'IMPLIED_NOT_A_KILL', 'reason': reason,
                            'citations': [citation(path, token) for path, token in tokens]})
    core = 'scripts/pm_memory_maintenance_events.py'
    gen = 'scripts/pm-memory-table-generate.py'
    add(['SGC07_reduced'], 'SGC06 compares every producer field before SGC07 compares its reduced subset.',
        (core, "require('sgc_reference'"), (core, "require('sgc_reduced'"))
    add(['AP11_payload_schema'], 'AP10 compares the candidate payload with payload_from of the already schema-valid operation; the constructed payload therefore satisfies the family schema.',
        (core, "require('ap_join'"), (core, "require('ap_payload'"), (core, 'def payload_from'))
    add(['BD16_phase'], 'A completed payload contains the non-null terminal fields of effect_committed/completed; the earlier BD12 payload/operation equality rejects every other phase.',
        (core, "require('bd_payload'"), (core, "require('bd_terminal_phase'"))
    for prefix, function in [('EF', 'def effect_fences'), ('RR', "elif op == 'retry'"), ('RC', "elif op == 'recover'")]:
        add([prefix + '01_permission', prefix + '02_withdrawn'],
            'The same state has already passed TR01_permission/TR02_withdrawn at transition entry. No operation between those reads mutates access flags.',
            (core, "require('tr_access'"), (gen, "access_phase('" + {'EF': 'ef_access', 'RR': 'rr_access', 'RC': 'rc_access'}[prefix]))
    add(['OPA03_started_receipt', 'OPA04_completed_receipt', 'OPA06_result_ref', 'OPA07_result_digest'],
        'The post-state operation is constructed by the transition itself: receipt ids, result_ref and result_digest are computed from the same immutable identity fields before post-state validation.',
        (core, 'def _transition'), (core, 'def committed'), (core, 'def result_digest'), (core, 'def result_ref'))
    add(['OPA02_value_cap', 'OPA05_terminal_reserve'],
        'Pre-state OP02 bounds the original operation and OP05 reserves terminal custody before the prepared swap. Transitions compute only the bounded declared terminal fields; a post-state prepared row carries no new uncontrolled bytes.',
        (core, "terminal = {**row"), (core, "require(prefix + '_reserve'"), (core, 'def _transition'))
    add(['TGO01_schema', 'TGOA01_schema', 'TGS01_schema'],
        'The preceding operation/selector whole-definition schema embeds this identical closed target schema. A malformed embedded target cannot pass the preceding schema row.',
        (core, 'def operation_schema_matches'), (core, 'def selector_schema_matches'), (core, 'def target_check'))
    add(['TGOA02_artifact_order', 'TGOA03_manifest', 'TGOA04_source', 'TGOA05_identity'],
        'The prepared target passed the original target chain before the swap; the transition copies that target unchanged into the post-state operation and does not reconstruct it from a consumer copy.',
        (core, 'def target_check'), (core, 'def _transition'), (gen, "target_chain('tgoa'"))
    operation = m.load('Plans/memory_maintenance_operation.schema.json')['$defs']
    targets = m.load('Plans/memory_maintenance_rebuild_target.schema.json')['$defs']
    payloads = m.load('Plans/memory_maintenance_event_payloads.schema.json')['$defs']
    bounds = {'payloads': {k: upper(v) for k, v in payloads.items()},
              'archive_operations': {k: upper(operation[k]) for k in ('monthly_summary', 'prune_archive')},
              'selectors': {k: upper(targets[k]) for k in ('lexical_selector', 'semantic_selector')}}
    for values in bounds.values():
        assert all(value <= 16384 for value in values.values()), bounds
    add(['AP12_inline_cap'], 'Every family payload is closed and its proven encoded upper bound is below 16,384 bytes; see bounds.payloads.',
        ('Plans/memory_maintenance_event_payloads.schema.json', '"additionalProperties": false'))
    add(['SEL02_value_cap'], 'Every selector is closed and its proven encoded upper bound is below 16,384 bytes; see bounds.selectors.',
        ('Plans/memory_maintenance_rebuild_target.schema.json', '"maxItems": 32'))
    add(['AOP02_value_cap'], 'Both archive operation schemas are closed and their proven encoded upper bounds are below 16,384 bytes; see bounds.archive_operations.',
        ('Plans/memory_maintenance_operation.schema.json', '"monthly_summary":'))
    for job in ('monthly_summary', 'prune_archive'):
        assert 'prepared' not in operation[job]['properties']['phase']['enum']
    add(['AOP05_terminal_reserve'], 'Archive operation schemas admit no prepared phase, so this conditional reservation site is never evaluated.',
        (core, "if row['phase'] == 'prepared':"), ('Plans/memory_maintenance_operation.schema.json', '"monthly_summary":'))
    assert len(records) == 26 and len({r['row'] for r in records}) == 26
    return {'status': 'pass', 'rows': records, 'bounds': bounds, 'extra_mutation_credit': 0}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    result = ledger()
    args.out.write_text(json.dumps(result, indent=1, sort_keys=True) + '\n')
    print(json.dumps({'status': 'pass', 'implied_rows': 26, 'bounds': result['bounds']}))


if __name__ == '__main__':
    main()
