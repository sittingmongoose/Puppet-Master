#!/usr/bin/env python3
"""Mutation proof for the W3B complete checker: delete or weaken one guard at a time; the suite must fail each time.

Each mutation is one exact source edit (old text that occurs exactly once, its replacement) in a generated table
module (a row's predicate) or in the checker's derive/shared-call seams. For every mutation the runner copies
``scripts/`` into a scratch root beside symlinks to the real ``Plans/`` and ``reports/``, applies the edit there
(the repository is never touched), and runs ``pm_w3b_event_oracles.py --fail-fast`` in a fresh interpreter. A
mutation is killed when that run exits non-zero with a judged finding; the first finding is recorded. The baseline
(no edit) must pass. Usage: python3 scripts/pm-w3b-mutation-proof.py --scratch <dir> [--jobs N] [--json <file>]
"""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
T = 'scripts/pm_w3b_table_'
C = 'scripts/pm_w3b_event_oracles.py'

MUTATIONS = [
    ('M01', T + 'identity_1.py', 'return "event_identity" if (v[\'ev\'].get(\'event_id\') != v[\'x_event_id\']) else None',
     'return None', 'event_identity', 'delete the event-id recipe comparison'),
    ('M02', T + 'identity_1.py', 'return "idempotency_key" if (v[\'ev\'].get(\'idempotency_key\') != v[\'x_key\']) else None',
     'return "idempotency_key" if (v[\'ev\'].get(\'idempotency_key\')[:4] != v[\'x_key\'][:4]) else None', 'key_recipe',
     'weaken the key recipe comparison to its first four characters'),
    ('M03', T + 'source_join_2.py', 'return "source_join" if (v[\'src\'].get(\'repo_id\') != v[\'native\'].get(\'repo_id\')) else None',
     'return None', 'source_join_repo_id', 'delete the repo_id source join'),
    ('M04', T + 'copies_1.py', 'return "source_join" if (v[\'payload_hex\'] != v[\'src_payload_hex\']) else None',
     'return "source_join" if (len(v[\'payload_hex\']) != len(v[\'src_payload_hex\'])) else None', 'payload_copy',
     'weaken the event-payload / source-payload copy join to a length comparison'),
    ('M05', T + 'acceptance_1.py', 'return "original_acceptance" if (v[\'op\'].get(\'source_commitment\') != v[\'src_commitment\']) else None',
     'return None', 'acceptance_commitment', 'delete the native acceptance commitment join'),
    ('M06', T + 'retry_1.py', 'return "idempotency_conflict" if (v[\'cand_producer_digest\'] != v[\'orig_held\'].get(\'producer_semantic_sha256\')) else None',
     'return None', 'retry_conflict', 'delete the CV-317 retry semantic-digest comparison'),
    ('M07', T + 'dispatch_1.py', 'return "original_unavailable" if (v[\'dispatch\'] == \'original_other_receipt\') else None',
     'return None', 'recipe_receipt_binding', 'delete the other-original receipt refusal'),
    ('M08', T + 'frozen_2.py', 'return "original_verification" if (v[\'orig_held\'].get(\'full_value_sha256\') != v[\'orig_x_full_value\']) else None',
     'return None', 'frozen_full_value', 'delete the frozen full-value commitment check'),
    ('M09', T + 'ck_cover_1.py', 'return "checkpoint_coverage" if (v[\'ck_scanned\'] != v[\'ck_index_seqs\']) else None',
     'return "checkpoint_coverage" if (v[\'ck_scanned\'][-1:] != v[\'ck_index_seqs\'][-1:]) else None', 'ck_coverage',
     'weaken global coverage to the last scanned row'),
    ('M10', T + 'ck_token_2.py', 'return "checkpoint_token" if (v[\'ck_token\'].get(\'source_selection\') != v[\'ck_pub\'].get(\'source_selection\')) else None',
     'return None', 'ck_token_source_selection', 'delete the durable-token source_selection join'),
    ('M11', T + 'transition_backend_detected_1.py',
     'return "transition" if (set(v[\'native\'].get(\'detected_backends\', [])) != set(v[\'wf\'].get(\'setup_state.observed_backends\', []))) else None',
     'return "transition" if (len(v[\'native\'].get(\'detected_backends\', [])) != len(v[\'wf\'].get(\'setup_state.observed_backends\', []))) else None',
     't_detect_set', 'weaken the detected-backends set join to a count'),
    ('M12', T + 'publication_2.py', 'return "receipt_custody" if (v[\'receipt\'] != v[\'issued\'].get(\'receipt\')) else None',
     'return None', 'receipt_storage', 'delete the Storage-issued receipt join'),
    ('M13', T + 'cas_1.py', 'return "source_phase_cas" if (v[\'fact_after\'].get(\'first_append_receipt_ref\') != v[\'x_receipt_ref\']) else None',
     'return None', 'cas_after_receipt', 'delete the issued-fact first-receipt join'),
    ('M14', T + 'acceptance_1.py', "'access_token', 'access-token', ", '', 'no_secret', 'weaken the secret scan (drop access_token)'),
    ('M15', T + 'authority_2.py', 'return "authority_credential" if (v[\'authority\'][\'credential\'].get(\'generation\') != v[\'current_generation\'].get(\'credential\')) else None',
     'return None', 'auth_credential_current', 'delete the credential currentness check'),
    ('M16', T + 'order_1.py', "    return \"publication_order\" if (v['order'].get('receipt_resolved') > v['order'].get('expose')) else None",
     '    return None', 'order_receipt_before_expose', 'delete the receipt-before-exposure order check'),
    ('M17', C, """def uint64_refusal(value):
    try:
        storage_uint64(value)""", """def uint64_refusal(value):
    try:
        int(value)""", 'sequence_u64 / receipt_u64', 'replace the shared storage_uint64 call with a bare int()'),
    ('M18', C, """    if validator.is_type(instance, 'string') and re.fullmatch(pattern, instance) is None:""",
     """    if validator.is_type(instance, 'string') and re.search(pattern, instance) is None:""", 'payload/fact/ck fullmatch',
     'weaken full-match identifiers to Python re.search (trailing LF passes)'),
    ('M19', C, """    return Draft202012Validator(_ref_schema(uri), registry=REGISTRY, format_checker=DATETIME_FORMATS)""",
     """    return Draft202012Validator(_ref_schema(uri), registry=REGISTRY)""", 'timestamp rows (owner format)',
     'drop the shared pm_event_datetime format checker from owner validation'),
    ('M20', C, """        binding = [r for r in at_id if r['source_commitment'] == commitment]""",
     """        binding = at_id""", 'recipe_receipt_binding / recipe_unique', 'select a receipt by id alone (ignore the bytes it binds)'),
    ('M21', C, """        if not at_id:
            raise Refusal('original_unavailable')""", """        if not at_id:
            self.store['sealed_receipts'].append({'storage_instance_id': sid, 'event_type': event_type, 'event_id': event_id,
                                                  'recipe': 'w3b@1', 'server_id': 'srv.home', 'resource_manifest_sha256': '0' * 64,
                                                  'admission': {}, 'source_commitment': ''})
            raise Refusal('original_unavailable')""", 'no receipt created while reading', 'seal a receipt when a read finds none'),
    ('M22', C, """    try:
        for value in found:
            current_integer(value)
    except Refusal:
        return False
    return True""", """    return True""", 'envelope/payload/fact/ck numbers', 'drop the shared current_integer check at integer slots'),
    ('M23', C, """FullMatchValidator = validators.extend(Draft202012Validator, {'pattern': _fullmatch_pattern})""",
     """FullMatchValidator = validators.extend(Draft202012Validator, {'pattern': _fullmatch_pattern})
_NOPATTERN = validators.extend(Draft202012Validator, {'pattern': lambda *a: iter(())})""", 'owner pattern keyword (setup)',
     'setup only, used by M23b'),
    ('M24', C, """    return Draft202012Validator(_ref_schema(uri), registry=REGISTRY, format_checker=DATETIME_FORMATS)""",
     """    return validators.extend(Draft202012Validator, {'allOf': lambda *a: iter(())})(_ref_schema(uri), registry=REGISTRY,
                                                                                         format_checker=DATETIME_FORMATS)""",
     'owner allOf keyword (fact phase/receipt, request conditionals)', 'drop the owner allOf keyword from validation'),
    ('M25', C, """    return Draft202012Validator(_ref_schema(uri), registry=REGISTRY, format_checker=DATETIME_FORMATS)""",
     """    return validators.extend(Draft202012Validator, {'pattern': lambda *a: iter(())})(_ref_schema(uri), registry=REGISTRY,
                                                                                         format_checker=DATETIME_FORMATS)""",
     'owner pattern keyword', 'drop the owner pattern keyword from validation'),
    ('M26', C, """            f['g_body'] = f['inline_bytes'] is not None and f['inline_bytes'] <= INLINE_LIMIT""",
     """            f['g_body'] = f['inline_bytes'] is not None""", 'inline_size readiness', 'let an oversize inline body reach the joins'),
    ('M27', C, """    return Draft202012Validator(_ref_schema(uri), registry=REGISTRY, format_checker=DATETIME_FORMATS)""",
     """    return validators.extend(Draft202012Validator, {'pattern': lambda v, p, i, s: iter(()) if p == '^[^\\r\\n]+$' else
                             Draft202012Validator.VALIDATORS['pattern'](v, p, i, s)})(_ref_schema(uri), registry=REGISTRY,
                                                                                     format_checker=DATETIME_FORMATS)""",
     'owner pattern of the W3B id/ref definitions', 'drop only the W3B id/ref CR/LF pattern from owner validation'),
    ('M28', T + 'frozen_2.py', 'return "original_verification" if (v[\'orig_receipt_errors\'] != 0) else None', 'return None',
     'frozen_receipt_schema', 'delete the held first-receipt verdict of the frozen verifier'),
    ('M29', T + 'order_1.py', 'return "publication_order" if (any([x not in v[\'order\'] for x in v[\'order_required\']])) else None',
     'return None', 'order_steps_present', 'delete the required-publication-steps check'),
    ('M30', T + 'checkpoint_1.py', 'return "checkpoint_identity" if (v[\'ck_next\'].get(\'project_id\') != v[\'owner_project\']) else None',
     'return None', 'ck_project', 'delete the checkpoint Project identity join'),
]
# M23 is a no-op setup line kept out of the list of guards
MUTATIONS = [m for m in MUTATIONS if m[0] != 'M23']


def run_one(scratch, m, timeout):
    mid, path, old, new, row, words = m
    root = scratch / mid
    if root.exists():
        shutil.rmtree(root)
    root.mkdir(parents=True)
    shutil.copytree(ROOT / 'scripts', root / 'scripts', ignore=shutil.ignore_patterns('__pycache__'))
    (root / 'Plans').symlink_to(ROOT / 'Plans')
    (root / 'reports').symlink_to(ROOT / 'reports')
    result = {'id': mid, 'file': path, 'row': row, 'mutation': words}
    if old is not None:
        target = root / path
        text = target.read_text()
        if text.count(old) != 1:
            result.update(status='not_applied', reason='old text occurs %d times' % text.count(old))
            return result
        target.write_text(text.replace(old, new))
    t = time.monotonic()
    try:
        proc = subprocess.run([sys.executable, '-B', str(root / C), '--fail-fast', '--limit-findings', '1'], cwd=root,
                              capture_output=True, text=True, timeout=timeout)
        out = proc.stdout
        first = [json.loads(x) for x in out.splitlines() if x.startswith('{"case"')]
        status_line = [x for x in out.splitlines() if '"status"' in x]
        result.update(exit=proc.returncode, seconds=round(time.monotonic() - t, 1), first_finding=first[0] if first else None,
                      status=('killed' if proc.returncode != 0 and first else
                              'crashed' if proc.returncode != 0 else 'survived'),
                      stderr_tail=proc.stderr[-400:] if proc.returncode != 0 and not first else '')
        if old is None:
            result['status'] = 'baseline_pass' if proc.returncode == 0 else 'baseline_fail'
    except subprocess.TimeoutExpired:
        result.update(status='timeout')
    shutil.rmtree(root)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--scratch', type=Path, required=True)
    parser.add_argument('--jobs', type=int, default=2)
    parser.add_argument('--json', type=Path)
    parser.add_argument('--only', action='append')
    parser.add_argument('--timeout', type=int, default=1500)
    args = parser.parse_args()
    args.scratch.mkdir(parents=True, exist_ok=True)
    todo = [('BASE', None, None, None, '-', 'no edit (baseline)')] + [m for m in MUTATIONS if not args.only or m[0] in args.only]
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        for r in pool.map(lambda m: run_one(args.scratch, m, args.timeout), todo):
            results.append(r)
            print(json.dumps({k: r.get(k) for k in ('id', 'status', 'row', 'seconds', 'first_finding')})[:400], flush=True)
    killed = sum(1 for r in results if r['status'] == 'killed')
    mutants = len(results) - 1
    ok = results[0]['status'] == 'baseline_pass' and killed == mutants
    report = {'status': 'pass' if ok else 'fail', 'mutants': mutants, 'killed': killed, 'results': results}
    if args.json:
        args.json.write_text(json.dumps(report, indent=1, sort_keys=True) + '\n')
    print(json.dumps({'status': report['status'], 'mutants': mutants, 'killed': killed}))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
