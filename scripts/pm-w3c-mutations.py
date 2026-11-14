#!/usr/bin/env python3
"""Mutation proof for the W3C checker (wave 3 phase 2): delete or weaken one guard at a time; the suite must fail.

Each mutation is an exact text replacement in a scratch copy of ``scripts/`` (with a copy of ``Plans`` beside it), applied
alone. The complete checker (pm_w3c_event_oracles.py, unmodified driver) then runs over the fixture subset that holds
the guard's witnesses (``--family``/``--path``); the run must exit nonzero. The same subset runs unmutated first and
must pass, so every failure is the mutation's. A mutation whose text is not found exactly once is itself an error.
Usage: python3 scripts/pm-w3c-mutations.py --scratch <dir> [--only <id>]...
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
O = 'scripts/pm_w3c_event_oracles.py'

# (id, guard, file, old text, new text, family, path, kind)
MUTATIONS = [
    ('M01', 'scope_partition_recipe', O,
     "'eq', R3(lambda c, m: [P(c)['scope']['scope_partition'], partition(c['scope'], O(c)['project_id'])]), AR)",
     "'eq', R3(lambda c, m: NA), AR)", 'testing.capture.bookmarked', 'append', 'delete the observation'),
    ('M02', 'receipt_barrier', 'scripts/pm_w3c_table_receipt_2.py',
     'v[0] not in ("barrier",)', 'v[0] not in ("barrier", "ordinary")', 'testing.capture.bookmarked', 'append', 'weaken the table predicate'),
    ('M03', 'ck_token_authentic', O,
     "else [canon(TOKEN(c)), canon(c['checkpoint']['storage_token'])]), KPATH)",
     "else [TOKEN(c)['storage_instance_id'], c['checkpoint']['storage_token']['storage_instance_id']]), KPATH)",
     'testing.capture.bookmarked', 'checkpoint', 'compare one token field only'),
    ('M04', 'retry_request_same', O,
     "else [canon(c['retry']['request']), canon(EX(c)['intent']['value'])]), 'retry')",
     "else NA), 'retry')", 'testing.capture.bookmarked', 'retry', 'delete the observation'),
    ('M05', 'fence_single_execution', O,
     "'le', AC(lambda c, a: [a['executions'], 1]), OPATH)",
     "'le', AC(lambda c, a: [a['executions'], 2]), OPATH)", 'testing.capture.bookmarked', 'operation', 'weaken the bound'),
    ('M06', 'recipe_unique', O,
     "        if len(binding) != 1:\n            raise Refusal('recipe_ambiguous')",
     "        if len(binding) < 1:\n            raise Refusal('recipe_ambiguous')", 'testing.capture.bookmarked', 'history', 'weaken the sealed-receipt uniqueness'),
    ('M07', 'read_no_receipt_created', O,
     "        return 'ok', before, canon(store['sealed_receipts']), original",
     "        return 'ok', before, before, original", 'testing.capture.bookmarked', 'history', 'snapshot the store before only'),
    ('M08', 'op_cas', O,
     "'eq', O1(lambda c, m: [canon(c['operation']['cas_expected']), canon(None if OPP(c) is None else sha(OPP(c)))]), OPATH)",
     "'eq', O1(lambda c, m: NA), OPATH)", 'testing.capture.bookmarked', 'operation', 'delete the observation'),
    ('M09', 'dvc_manifest_immutable', 'scripts/pm_w3c_table_clause_dvc_1.py',
     '        table.require("dvc_manifest_immutable", value, context)\n', '', 'artifacts.demonstration_video.created', 'append',
     'delete the table row\'s require'),
    ('M10', 'storage_utc_observed_at_utc', O,
     "'ok', gate('r0', 'env_valid', 'env_numbers')(lambda c, m, k=_k: date_time_ok(E(c)[k], STORAGE_UTC_Z)), AR)",
     "'ok', gate('r0', 'env_valid', 'env_numbers')(lambda c, m, k=_k: date_time_ok(E(c)[k], EVENT_RECORD)), AR)",
     'testing.capture.bookmarked', 'append', 'weaken the date-time profile'),
    ('M11', 'frozen_full_value', O,
     "            'full_value': [canon(held.get('full_value_sha256')), canon(full_value_commitment(record))],",
     "            'full_value': [canon(held.get('full_value_sha256')), canon(held.get('full_value_sha256'))],",
     'testing.capture.bookmarked', 'history', 'replace the recomputed commitment by the held one'),
    ('M12', 'cov_nonmatching_counted', 'scripts/pm_w3c_table_coverage_1.py',
     'return "coverage_incomplete" if v[0] != v[1] else None', 'return None', 'testing.capture.bookmarked', 'checkpoint',
     'delete the table predicate'),
    ('M13', 'envelope_numbers', O,
     "        for value in found:\n            current_integer(value)",
     "        for value in found:\n            pass", 'testing.capture.bookmarked', 'append', 'drop current_integer at integer slots'),
    ('M14', 'sequence_u64', O,
     "def u64_ok(value):\n    try:\n        storage_uint64(value)",
     "def u64_ok(value):\n    try:\n        current_integer(value, minimum=0, maximum=2 ** 65)", 'testing.capture.bookmarked', 'append',
     'replace storage_uint64 by a looser lane bound'),
    ('M15', 'install_refs', O,
     "                    except Exception:  # noqa: BLE001 - any resolution failure is this row's refusal\n                        ok[0] = False",
     "                    except Exception:  # noqa: BLE001 - any resolution failure is this row's refusal\n                        pass",
     'artifacts.capture_provenance.inspected', 'install', 'ignore unresolved references'),
    ('M16', 'request_before_join', O,
     "row('request', 'request_before_join', 'before_record', '/owner/request/before_record', 'the request pre-state is the owner predecessor snapshot (with its stored hash)',\n    'eq', O1(",
     "row('request', 'request_before_join', 'before_record', '/owner/request/before_record', 'the request pre-state is the owner predecessor snapshot (with its stored hash)',\n    'eq', lambda c, m: NA if True else O1(",
     'testing.capture.paused', 'operation', 'delete the observation'),
    ('M17', 'op_uuid', O,
     "UUID = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')",
     "UUID = re.compile(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}')",
     'testing.capture.bookmarked', 'operation', 'weaken the full-match grammar'),
    ('M18', 'payload_schema (format)', O,
     "    return Draft202012Validator({'$ref': ref}, registry=registry(), format_checker=DATETIME_FORMATS)",
     "    return Draft202012Validator({'$ref': ref}, registry=registry())", 'testing.runtime_enabled_for_adapter', 'append',
     'drop the shared date-time format checker'),
    ('M19', 'tgc_monotonic', 'scripts/pm_w3c_table_clause_tgc_1.py',
     'return "switch_order" if v[0] > v[1] else None', 'return "switch_order" if v[0] > v[1] + 1000 else None',
     'testing.capture.target_changed', 'append', 'weaken the comparison'),
    ('M20', 'op_event_frozen', O,
     "(OPS(c) if OPP(c) is None or OPP(c)['producer_semantics'] is None else OPP(c))['producer_semantics']['record_sha256']]), OPATH)",
     "producer_semantic_digest(resolved(c, OPS(c)['original_event']))]), OPATH)", 'testing.capture.bookmarked', 'operation',
     'compare the appended event with itself'),
]


def run(cmd, cwd):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    tail = (p.stdout.strip().splitlines() or [''])[-1]
    return p.returncode, tail


def summary(tail):
    try:
        r = json.loads(tail)
        if 'stale_table_modules' in r:
            return {'status': r['status'], 'killed_by': 'table_source_check', 'stale_table_modules': r['stale_table_modules']}
        return {'status': r['status'], 'counts': r['counts'], 'killed_by': 'judged_cases' if r['status'] != 'pass' else None}
    except (ValueError, KeyError):
        return {'raw': tail[:300]}


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--scratch', type=Path, required=True)
    parser.add_argument('--only', action='append')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    work = args.scratch / 'w3c-mutation-tree'
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    shutil.copytree(ROOT / 'scripts', work / 'scripts')
    # The Corpus registry refuses symlinked paths: copy Plans without its derived trees (shards, index, audits, migration, evidence).
    shutil.copytree(ROOT / 'Plans', work / 'Plans', ignore=shutil.ignore_patterns('_shards', '.plan_index', '.audits', '.plan_migration', '.evidence'))
    results, baselines, bad = [], {}, False
    for mid, guard, path, old, new, family, scenario_path, kind in MUTATIONS:
        if args.only and mid not in args.only:
            continue
        cmd = [sys.executable, '-B', 'scripts/pm_w3c_event_oracles.py', '--family', family, '--path', scenario_path]
        # A predicate mutation inside a generated table runs with --skip-table-check so the kill is behavioural; M09
        # (a deleted require) keeps the table-source check, which is the suite's guard against check() drifting.
        if path.startswith('scripts/pm_w3c_table_') and mid != 'M09':
            cmd.append('--skip-table-check')
        key = (family, scenario_path, tuple(cmd))
        if key not in baselines:
            baselines[key] = run(cmd, work)
        target = work / path
        text = target.read_text()
        found = text.count(old)
        entry = {'id': mid, 'guard': guard, 'file': path, 'kind': kind, 'subset': {'family': family, 'path': scenario_path},
                 'baseline_exit': baselines[key][0], 'baseline': summary(baselines[key][1]), 'text_found': found}
        if found != 1:
            entry['result'] = 'MUTATION_NOT_APPLIED'
            bad = True
        else:
            target.write_text(text.replace(old, new))
            code, tail = run(cmd, work)
            target.write_text(text)
            entry.update(mutated_exit=code, mutated=summary(tail),
                         result='KILLED' if code != 0 and baselines[key][0] == 0 else 'SURVIVED')
            bad = bad or entry['result'] != 'KILLED'
        results.append(entry)
        print(mid, guard, entry['result'], json.dumps(entry.get('mutated', {}))[:160], file=sys.stderr, flush=True)
    restored = all([(work / 'scripts' / p.name).read_bytes() == p.read_bytes() for p in (ROOT / 'scripts').glob('pm_w3c*.py')])
    report = {'status': 'pass' if not bad and restored else 'fail', 'killed': sum(r['result'] == 'KILLED' for r in results),
              'total': len(results), 'scratch_restored_identical': restored, 'mutations': results}
    text = json.dumps(report, indent=1)
    if args.json:
        args.json.write_text(text + '\n')
    print(json.dumps({k: report[k] for k in ('status', 'killed', 'total', 'scratch_restored_identical')}))
    shutil.rmtree(work)
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
