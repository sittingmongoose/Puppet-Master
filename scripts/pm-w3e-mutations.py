#!/usr/bin/env python3
"""W3E checker mutations: each deletes or weakens one guard of scripts/pm_w3e_event_oracles.py; the suite must fail for
every one.

Each mutation is one exact source edit on a different row (a row's inputs, a gate the row owns, a frozen-verifier
component, the owner-schema keyword set the checker validates in full, or a shared-call site). For every mutation a
scratch tree gets a mutated copy of the checker and a fresh copy of the lane's table generator; the shared modules
and Plans/ are linked read-only. The suite is: regenerate the tables from the mutated spec, then run the complete
checker with --fail-fast. A mutation is killed when the suite exits non-zero; the first failure is recorded.

Usage: python3 scripts/pm-w3e-mutations.py --scratch DIR [--json OUT] [--only ID ...]
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORACLE = 'scripts/pm_w3e_event_oracles.py'

# (id, what the mutation breaks, the row it targets, exact old source, new source)
MUTATIONS = [
    ('W1', 'Storage partition compared with itself', 'append_partition',
     "EQ(c['scope_partition'], partition_of(P(c)['scope_kind'], P(c)['project_id']))",
     "EQ(c['scope_partition'], c['scope_partition'])"),
    ('W2', 'event_id compared with itself', 'append_event_id',
     "'eq', lambda c, m: EQ(E(c)['event_id'], event_id_of(",
     "'eq', lambda c, m: EQ(E(c)['event_id'], E(c)['event_id'] or event_id_of("),
    ('W3', 'owner issuance check compares the manifest digest with itself', 'append_source_authentic',
     "EQ(record_digest(S(c)), c['owner']['issued_digest'])", "EQ(record_digest(S(c)), record_digest(S(c)))"),
    ('W4', 'genuine-role check reads only the first role', 'append_roles_genuine',
     "lambda c, m: EQ([ROLE(c, r) for r in ROLES[c['family']][2:]],\n"
     "                    [c['owner']['roles'][r] for r in ROLES[c['family']][2:]])",
     "lambda c, m: EQ([ROLE(c, r) for r in ROLES[c['family']][2:3]],\n"
     "                    [c['owner']['roles'][r] for r in ROLES[c['family']][2:3]])"),
    ('W5', 'writer fence compared with itself', 'append_writer_fence',
     "EQ(ROLE(c, 'writer_fence'), c['writer']['lease_ref'])", "EQ(ROLE(c, 'writer_fence'), ROLE(c, 'writer_fence'))"),
    ('W6', 'predecessor currentness compared with itself', 'append_before_current',
     "EQ(record_digest(BEFORE(c)), c['owner']['current_before'])",
     "EQ(record_digest(BEFORE(c)), record_digest(BEFORE(c)))"),
    ('W7', 'revocation generation rule compared with itself', 'dom_revoked_generation',
     "EQ(AFTER(c)['effective_trust_generation'], AFTER(c)['previous_trust_generation'] + 1)",
     "EQ(AFTER(c)['effective_trust_generation'], AFTER(c)['effective_trust_generation'])"),
    ('W8', 'revoked sessions compared with themselves (caller set trusted)', 'dom_revoked_sessions',
     "EQ(sorted(AFTER(c)['revoked_session_ids']), sorted(c['owner']['active_sessions']))",
     "EQ(sorted(AFTER(c)['revoked_session_ids']), sorted(AFTER(c)['revoked_session_ids']))"),
    ('W9', 'Catalog revision floor lowered by one (equal accepted)', 'dom_catalog_increases',
     "{'presented': AFTER(c)['catalog_revision'], 'floor': BEFORE(c)['catalog_revision']}",
     "{'presented': AFTER(c)['catalog_revision'], 'floor': BEFORE(c)['catalog_revision'] - 1}"),
    ('W10', 'payload integer slots lose their owner minimum', 'append_slot_*',
     "lambda c, m: V(reason_of(current_integer, P(c)[k], minimum=slot_bounds(c['family'], k)[0],",
     "lambda c, m: V(reason_of(current_integer, P(c)[k], minimum=None,"),
    ('W11', 'Storage observed time checked on the event_record profile', 'append_observed_utc_z',
     "V(reason_of(date_time, E(c)['observed_at_utc'], profile=STORAGE_UTC_Z))",
     "V(reason_of(date_time, E(c)['observed_at_utc'], profile=EVENT_RECORD))"),
    ('W12', 'first-receipt joins read the receipt itself', 'append_receipt_*',
     "(lambda k: lambda c, m: EQ(FR(c)[k], c['storage_record'][k]))(_k), gates=('rc_strict_ok',))",
     "(lambda k: lambda c, m: EQ(FR(c)[k], FR(c)[k]))(_k), gates=('rc_strict_ok',))"),
    ('W13', 'custody joins read the custody itself', 'append_custody_*',
     "'eq', (lambda k, x: lambda c, m: EQ(CUS(c)[k], x(c)))(_k, _x),",
     "'eq', (lambda k, x: lambda c, m: EQ(CUS(c)[k], CUS(c)[k]))(_k, _x),"),
    ('W14', 'history joins read the history itself', 'history_*',
     "(lambda k, x: lambda c, m: EQ(H(c)[k], x(c)))(_k, _x), gates=('hist_strict_ok',))",
     "(lambda k, x: lambda c, m: EQ(H(c)[k], H(c)[k]))(_k, _x), gates=('hist_strict_ok',))"),
    ('W15', 'durable token joins read the token itself', 'checkpoint_token_*',
     "(lambda k: lambda c, m: EQ(TOKEN(m)[k], c['index_state'][k]))(_k)",
     "(lambda k: lambda c, m: EQ(TOKEN(m)[k], TOKEN(m)[k]))(_k)"),
    ('W16', 'uuid restoration accepts any string', 'checkpoint_uuid_*',
     "UUID_RE = re.compile(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', re.ASCII)",
     "UUID_RE = re.compile(r'.+', re.ASCII | re.DOTALL)"),
    ('W17', 'publication revision compared with itself', 'checkpoint_revision_cas',
     "EQ(m.get('body')['publication_revision'], c['prior_publication_revision'] + 1)",
     "EQ(m.get('body')['publication_revision'], m.get('body')['publication_revision'])"),
    ('W18', 'inline wrapper limit doubled', 'checkpoint_inline_size',
     "lambda c, m: {'presented': len(pack_value(CK(c))), 'limit': INLINE_LIMIT},\n    gates=('ck_wrapper_ok',)",
     "lambda c, m: {'presented': len(pack_value(CK(c))), 'limit': 2 * INLINE_LIMIT},\n    gates=('ck_wrapper_ok',)"),
    ('W19', 'owner: ambiguous-receipt refusal removed', 'retained_receipt_unique',
     "        if len(matches) > 1:\n            raise Refusal('original_receipt_ambiguous')\n", ''),
    ('W20', 'no-receipt-on-read compares the store snapshot with itself', 'retained_no_receipt_creation',
     "EQ(m.get('retained')['store_after'], m.get('retained')['store_before'])",
     "EQ(m.get('retained')['store_before'], m.get('retained')['store_before'])"),
    ('W21', 'current-gate instrumentation removed', 'retained_no_current_gate',
     "    pm_event_numbers.current_append_policy = counting\n    module.current_append_policy = counting\n", ''),
    ('W22', 'caller override no longer passed to the shared dispatcher', 'retained_recipe_override',
     "recipe_override=case['retained_recipe_override'])", "recipe_override=None)"),
    ('W23', 'installed frozen verifier always returns True', 'retained_dispatcher_verdict',
     "    components = frozen_components(custody)\n    return all(component_holds(name, value) for name, value in "
     "components.items())",
     "    components = frozen_components(custody)\n    return True"),
    ('W24', 'frozen identity compared with itself', 'frozen_identity',
     "            out['identity'] = (record['event_id'], event_id_of(family, partition, payload['server_id'],",
     "            out['identity'] = (record['event_id'], record['event_id'] or event_id_of(family, partition, "
     "payload['server_id'],"),
    ('W25', 'frozen payload full consumption skipped', 'frozen_payload_full_consumption',
     "            out['payload_full_consumption'] = strict_errors(PAYLOAD_ID[family], '', record['payload'])",
     "            out['payload_full_consumption'] = []"),
    ('W26', 'full-consumption copy validates with the stock registry (trailing LF accepted)',
     'append_payload_full_consumption',
     "registry=STRICT_REGISTRY if strict else REGISTRY,", "registry=REGISTRY,"),
    ('W27', 'owner schema keyword dropped: the owner records lose their allOf', 'append_source_schema',
     "RESOURCES = {rel: _load(rel) for rel in RESOURCE_FILES}\n",
     "RESOURCES = {rel: _load(rel) for rel in RESOURCE_FILES}\n"
     "for _rel in ('Plans/server_system_contracts.schema.json', 'Plans/remote_access_system_contracts.schema.json',\n"
     "             'Plans/backup_restore_system_contracts.schema.json'):\n"
     "    for _d in RESOURCES[_rel]['$defs'].values():\n"
     "        if isinstance(_d, dict):\n"
     "            _d.pop('allOf', None)\n"),
    ('W28', 'owner schemas validated without the shared date-time format checker', 'append_source_schema',
     "DATETIME_FORMATS = format_checker(profile=EVENT_RECORD)\n", "DATETIME_FORMATS = None\n"),
    ('W29', 'record Server compared with itself', 'append_record_server',
     "lambda c, m: EQ(SUBJECT(c)[RECORD_SERVER[c['family']]], P(c)['server_id'])",
     "lambda c, m: EQ(P(c)['server_id'], P(c)['server_id'])"),
    ('W30', 'payload joins read the before record for after-record fields', 'append_join_*',
     "    if kind == 'after':\n        return after[arg] if type(after) is dict else None",
     "    if kind == 'after':\n        return (before if type(before) is dict else after)[arg] if type(after) is dict "
     "else None"),
    ('W31', 'source custody ref compared with itself', 'append_source_custody_ref',
     "EQ(P(c)['source_custody_ref'], c['owner']['custody_refs']['custody_ref'])",
     "EQ(P(c)['source_custody_ref'], P(c)['source_custody_ref'])"),
    ('W32', 'writer Server compared with itself', 'append_writer_server',
     "EQ(P(c)['server_id'], c['writer']['server_id'])", "EQ(P(c)['server_id'], P(c)['server_id'])"),
    ('W33', 'retry semantic comparison never applies', 'retry_semantic',
     "    when=lambda c, m: (RE_(c).get('event_id') == E(c)['event_id'] and",
     "    when=lambda c, m: False and (RE_(c).get('event_id') == E(c)['event_id'] and"),
    ('W34', 'Storage metadata joins read the event itself', 'append_storage_*',
     "(lambda k: lambda c, m: EQ(E(c)[k], c['storage_record'][k]))(_k), gates=('env_ok',))",
     "(lambda k: lambda c, m: EQ(E(c)[k], E(c)[k]))(_k), gates=('env_ok',))"),
    ('W35', 'inclusive-restart cursor joins read the cursor itself', 'checkpoint_cursor_*',
     "(lambda k, s: lambda c, m: EQ(CURSOR(m)[k], c['storage_record'][s]))(_k, _s)",
     "(lambda k, s: lambda c, m: EQ(CURSOR(m)[k], CURSOR(m)[k]))(_k, _s)"),
    ('W36', 'expected fingerprint not recomputed from the held material', 'dom_mismatch_expected_material',
     "EQ(AFTER(c)['expected_fingerprint'], _sha(c['owner']['identity_material']['expected']))",
     "EQ(AFTER(c)['expected_fingerprint'], AFTER(c)['expected_fingerprint'])"),
    ('W37', 'receipt slots use an unbounded current_integer instead of storage_uint64', 'append_receipt_slot_*',
     "(lambda k: lambda c, m: V(reason_of(storage_uint64, FR(c)[k])))(_k)",
     "(lambda k: lambda c, m: V(reason_of(current_integer, FR(c)[k])))(_k)"),
    ('W38', 'event physical encoding skips the payload', 'append_event_physical',
     "'none', lambda c, m: V(physical_reason(E(c))), gates=('seq_ok',))",
     "'none', lambda c, m: V(physical_reason(dict(E(c), payload={}))), gates=('seq_ok',))"),
    ('W39', 'owner ignores original_ref (returns any sealed row)', 'retained_receipt_present',
     "        matches = [r for r in self._store if type(r) is dict and r.get('original_ref') == original_ref]",
     "        matches = [r for r in self._store if type(r) is dict]"),
    ('W40', 'eq template drops its type check (True == 1, 1.0 == 1)', 'eq rows',
     "\"type(record['presented']) is not type(record['expected']) or record['presented'] != record['expected']\"",
     "\"record['presented'] != record['expected']\""),
    ('W41', 'payload schema keyword dropped: payload `not` control-character rule removed', 'append_payload_schema',
     "STRICT_REGISTRY = _registry({rel: _strict(doc) for rel, doc in RESOURCES.items()})\n",
     "STRICT_REGISTRY = _registry({rel: _strict(doc) for rel, doc in RESOURCES.items()})\n"
     "def _drop_not(node):\n"
     "    if isinstance(node, dict):\n"
     "        node.pop('not', None)\n"
     "        for v in node.values():\n"
     "            _drop_not(v)\n"
     "    elif isinstance(node, list):\n"
     "        for v in node:\n"
     "            _drop_not(v)\n"
     "for _f in FAMILIES:\n"
     "    _drop_not(PAYLOAD_SCHEMA[_f]['properties'])\n"
     "REGISTRY = _registry(RESOURCES)\n"),
    ('W42', 'public-route test security rule never applies', 'dom_test_public_security',
     "    when=lambda c, m: AFTER(c)['terminal_status'] == 'passed' and AFTER(c)['route_type'] in PUBLIC_ROUTES)",
     "    when=lambda c, m: AFTER(c)['terminal_status'] == 'passed' and AFTER(c)['route_type'] in [])"),
]

LANE_COPIES = ('scripts/pm_w3e_event_oracles.py', 'scripts/pm-w3e-table-generate.py')


def scratch_tree(scratch):
    """A tree whose lane files are real copies and whose shared files are links (never written)."""
    if scratch.exists():
        shutil.rmtree(scratch)
    (scratch / 'scripts').mkdir(parents=True)
    os.symlink(ROOT / 'Plans', scratch / 'Plans')
    for path in sorted((ROOT / 'scripts').iterdir()):
        if path.name.startswith(('pm_w3e_', 'pm-w3e-')) or path.is_dir():
            continue
        os.symlink(path, scratch / 'scripts' / path.name)
    for rel in LANE_COPIES:
        shutil.copyfile(ROOT / rel, scratch / rel)


def run_suite(scratch):
    gen = subprocess.run([sys.executable, '-B', 'scripts/pm-w3e-table-generate.py'], cwd=scratch,
                         capture_output=True, text=True)
    if gen.returncode != 0:
        return gen.returncode, None, (gen.stderr or gen.stdout)[-400:]
    chk = subprocess.run([sys.executable, '-B', ORACLE, '--fail-fast'], cwd=scratch, capture_output=True, text=True)
    detail = (chk.stdout or chk.stderr)[-600:]
    return gen.returncode, chk.returncode, detail


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--scratch', type=Path, required=True)
    parser.add_argument('--json', type=Path)
    parser.add_argument('--only', nargs='*')
    args = parser.parse_args()
    original = (ROOT / ORACLE).read_text()
    scratch = args.scratch.resolve()
    assert ROOT not in scratch.parents and scratch != ROOT, 'scratch must be outside the repository'
    selected = [m for m in MUTATIONS if not args.only or m[0] in args.only]
    scratch_tree(scratch)
    baseline = run_suite(scratch)
    results = [{'id': 'baseline', 'generator_exit': baseline[0], 'checker_exit': baseline[1],
                'detail': baseline[2][-200:]}]
    print('baseline generator=%s checker=%s' % baseline[:2], flush=True)
    killed = 0
    for mid, words, row, old, new in selected:
        count = original.count(old)
        if count != 1:
            results.append({'id': mid, 'row': row, 'words': words, 'error': 'anchor occurs %d times' % count})
            print('%-4s ANCHOR %d' % (mid, count), flush=True)
            continue
        scratch_tree(scratch)
        (scratch / ORACLE).write_text(original.replace(old, new))
        gen, chk, detail = run_suite(scratch)
        dead = gen != 0 or chk != 0
        killed += dead
        results.append({'id': mid, 'row': row, 'words': words, 'generator_exit': gen, 'checker_exit': chk,
                        'killed': dead, 'first_failure': detail})
        print('%-4s %-34s generator=%s checker=%s %s' % (mid, row, gen, chk, 'KILLED' if dead else 'SURVIVED'),
              flush=True)
    shutil.rmtree(scratch)
    summary = {'baseline_clean': baseline[0] == 0 and baseline[1] == 0, 'mutations': len(selected),
               'killed': killed, 'rows': sorted({m[2] for m in selected}), 'results': results}
    if args.json:
        args.json.write_text(json.dumps(summary, indent=1) + '\n')
    print(json.dumps({k: v for k, v in summary.items() if k != 'results'}))
    return 0 if summary['baseline_clean'] and killed == len(selected) else 1


if __name__ == '__main__':
    sys.exit(main())
