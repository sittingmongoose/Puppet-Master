#!/usr/bin/env python3
"""Whole-checker DDBG regressions in a disposable, bounded input tree.

Runs every standing check for each prepared family. This is static oracle
verification, never native append, external-payload or SP-278 execution proof.
"""
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = 'Plans/debug_investigation_event_fixtures.json'
CHECKER = 'scripts/pm-debug-investigation-events.py'
CONSTANTS = 'scripts/pm_debug_investigation_guard_constants.py'
RETAINED = 'scripts/pm_debug_investigation_guards_retained.py'
INPUTS = (FIXTURE, CHECKER, 'Plans/debug_investigation_event_payloads.schema.json',
          'Plans/event_family_registry.json', 'scripts/pm_debug_investigation_transitions.py',
          'scripts/pm_guard_isolation.py', CONSTANTS, RETAINED,
          *('scripts/pm_debug_investigation_guards_' + phase + '.py' for phase in (
              'admission', 'envelope', 'family', 'instrumentation', 'instrumentation_detail',
              'instrumentation_detail_values_a', 'instrumentation_detail_values_b', 'instrumentation_detail_values_c',
              'instrumentation_source', 'lifecycle', 'payload', 'references', 'retry', 'target_payload')))


def patch(case, patches):
    for path, value in patches.items():
        target = case
        parts = path.split('.')
        for key in parts[:-1]:
            target = target[key]
        target[parts[-1]] = value


def main():
    fixture = json.loads((ROOT / FIXTURE).read_text())
    families = {case['event_type'] for case in fixture['cases']}
    rows, failures = [], []
    with tempfile.TemporaryDirectory(prefix='pm-ddbg-standing-') as directory:
        scratch = Path(directory)
        for relative in INPUTS:
            destination = scratch / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, destination)
        originals = {relative: (scratch / relative).read_text() for relative in (CONSTANTS, RETAINED)}

        def run(label, data, event=None, reject=False, mutate=None):
            # mutate: (relative source path, exact old text, new text), applied to this run only.
            (scratch / FIXTURE).write_text(json.dumps(data))
            for relative, text in originals.items():
                (scratch / relative).write_text(text)
            if mutate:
                relative, old, new = mutate
                if old not in originals[relative]:
                    raise SystemExit('standing-check mutation target missing: ' + old)
                (scratch / relative).write_text(originals[relative].replace(old, new))
            # A probe that corrupts one family runs that family's complete oracles; the
            # baseline, restored and reference runs check every family.
            environment = dict(os.environ)
            environment.pop('PM_DDBG_FAMILY', None)
            if event in families:
                environment['PM_DDBG_FAMILY'] = event
            result = subprocess.run([sys.executable, '-B', str(scratch / CHECKER)],
                                    capture_output=True, text=True, timeout=600, env=environment)
            try:
                output = json.loads(result.stdout)
            except ValueError:
                output = {'status': 'INVALID_OUTPUT', 'failures': [result.stderr]}
            # A crash/nonzero alone is not proof: require the checker's own FAIL
            # and a diagnostic naming the family whose input was corrupted.
            okay = (result.returncode != 0 and output['status'] == 'FAIL'
                    and any(event in item for item in output['failures'])) if reject else (
                        result.returncode == 0 and output['status'] == 'PASS')
            row = {'event_type': event, 'probe': label, 'expected': 'FAIL' if reject else 'PASS',
                   'exit': result.returncode, 'status': output['status'],
                   'matched_failures': [x for x in output.get('failures', []) if event and event in x],
                   'pass': okay}
            rows.append(row)
            if not okay:
                failures.append(row)

        run('baseline', fixture)
        for index, original in enumerate(fixture['cases']):
            if original.get('outcome') == 'held_for_jared':
                continue
            event = original['event_type']

            def corrupted(label, patches):
                data = copy.deepcopy(fixture)
                patch(data['cases'][index], patches)
                run(label, data, event, reject=True)

            for policy in ('projector_replay_only', 'append_once', 'dedupe_by_event_id'):
                corrupted('C1 policy ' + policy, {'envelope.replay_policy': policy})
            corrupted('C2 application edition refused', {
                'envelope.scope_kind': 'application', 'envelope.project_id': None,
                'scope_partition': 'app'})
            corrupted('C3 raw Project partition', {'scope_partition': original['project_id']})
            oversized = [n for n in original['negative_cases']
                         if n['expected_refusal'] == 'payload_reference_required']
            if oversized:
                for negative in oversized:
                    corrupted('C4 schema-valid encoded body above 16 KiB', negative['patches'])
            else:
                # These closed bounded shapes have no large-body positive. An
                # oversized scalar is refused by the schema, not a pack-store
                # simulation; SP-337 success remains a native obligation.
                corrupted('C4 oversized scalar fails closed schema',
                          {'payload.operation_id': 'a' * 16385})
            corrupted('C5 trailing LF in encoded partition',
                      {'scope_partition': original['scope_partition'] + '\n'})
            if event.endswith('target_bound'):
                for label, value in [('LF', 'a' * 64 + '\n'), ('uppercase', 'A' * 64),
                                     ('short', 'a' * 63), ('nonhex', 'g' * 64)]:
                    corrupted('C5 SHA-256 ' + label,
                              {'payload.target_bindings.source_sha256': value})
            for key, value in [('sequence_id', 99), ('observed_at_utc', '2026-11-04T01:00:00Z'),
                               ('persisted_at_utc', '2026-11-04T01:00:01Z')]:
                data = copy.deepcopy(fixture)
                patch(data['cases'][index], {'envelope.' + key: value})
                run('C6 Storage metadata preserves original receipt: ' + key, data, event)
                # A checker regression hashing Storage assignments must itself
                # be rejected by every family's authored retry vectors.
                run('C6 reject digest that includes ' + key, fixture, event, reject=True,
                    mutate=(CONSTANTS, "DIGEST_FIELDS = ('scope_kind',", "DIGEST_FIELDS = ('" + key + "', 'scope_kind',"))
            # The inverse bug (hashing only payload) must also fail each family.
            run('C6 reject payload-only semantic digest', fixture, event, reject=True,
                mutate=(RETAINED, "body = dict(pairs + [('event_type', case['event_type']), ('payload', case['payload'])])",
                        "body = {'payload': case['payload']}"))
            data = copy.deepcopy(fixture)
            retry = data['cases'][index]['retry_cases'][0]
            retry['expected_result'] = 'semantic_digest_changed'
            run('C6 reject oracle that conflicts on Storage metadata', data, event, reject=True)
            corrupted('C7 transient reader cannot claim a mismatched durable checkpoint', {
                'family_checkpoint': {'scope_partition': 'project~b3RoZXI',
                                      'event_type': 'other.family', 'source_generation': 'other'}})
            corrupted('C8 invalid positive version exits failure', {'payload.schema_version': '2.0.0'})
            data = copy.deepcopy(fixture)
            data['cases'][index]['negative_cases'].append({
                'case': 'C8 success cannot masquerade as failure', 'patches': {},
                'expected_refusal': None, 'expected_appends': 0})
            run('C8 success disguised as negative exits failure', data, event, reject=True)
            if event.endswith('started'):
                data = copy.deepcopy(fixture)
                patch(data['cases'][index], {
                    'payload.requested_mode_overlay': 'crew',
                    'payload.effective_mode_overlay': 'crew',
                    'payload.runtime_mode': 'plan'})
                run('B1 full checker accepts read-only Crew positive', data, event)
                # Restoring only the old universal regular/yolo restriction
                # must fail the independently cited read-only Crew oracle.
                schema_path = scratch / INPUTS[2]
                schema_bytes = schema_path.read_bytes()
                schema = json.loads(schema_bytes)
                schema['$defs']['started']['allOf'].append({
                    'if': {'properties': {'effective_mode_overlay': {'const': 'crew'}}},
                    'then': {'properties': {'runtime_mode': {'enum': ['regular', 'yolo']}}}})
                try:
                    schema_path.write_text(json.dumps(schema))
                    run('B1 reject old universal Crew restriction', fixture, event, reject=True)
                finally:
                    schema_path.write_bytes(schema_bytes)
        # New decisions retain independently executable fixture negatives. A
        # promoted bad positive must fail the whole checker for its own family.
        for index, original in enumerate(fixture['cases']):
            if not original.get('transition_cases'):
                continue
            event = original['event_type']
            data = copy.deepcopy(fixture)
            data['cases'][index]['retention_policy_ref'] = 'invented-policy'
            run('reject wrong G02 Project policy', data, event, reject=True)
            # The ordinary checker already executes every negative and proves
            # its starting candidate is valid. Promote the boundaries most
            # likely to regress; repeating every wrong-type spelling here
            # would rerun the same complete suite hundreds of times.
            promoted = {'stale previous collector state', 'stale previous cleanup result',
                        'retry count must increment', 'scope taxonomy is exactly N2-133',
                        'uncertain handoff preserves prior responsibility',
                        'all temporary changes need a recovery snapshot',
                        'unproved whole lane', 'detail independently exceeds inline limit',
                        'second handoff waits for acceptance', 'Cleaned cannot restart',
                        'Failed requires reason', 'terminal cannot resume',
                        'cleanup still owed', 'no original verification qualification'}
            for negative in original['negative_cases']:
                if negative['case'] not in promoted:
                    continue
                data = copy.deepcopy(fixture)
                patch(data['cases'][index], negative.get('base_patches', {}))
                patch(data['cases'][index], negative['patches'])
                run('decision negative: ' + negative['case'], data, event, reject=True)
        # A dangling reference in an unvisited branch must produce explicit
        # FAIL, rather than a success exit or an unrelated schema exception.
        schema_path = scratch / INPUTS[2]
        schema_bytes = schema_path.read_bytes()
        schema = json.loads(schema_bytes)
        schema['$defs']['unvisited'] = {'$ref': '#/$defs/no_such_definition'}
        try:
            schema_path.write_text(json.dumps(schema))
            run('C9 unresolved reference in unvisited definition', fixture,
                'unresolved_schema_reference', reject=True)
        finally:
            schema_path.write_bytes(schema_bytes)
        # Restore and verify once after all deliberately corrupted copies.
        run('restored baseline', fixture)
    print(json.dumps({'status': 'FAIL' if failures else 'PASS', 'probes': len(rows),
                      'rows': rows, 'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return bool(failures)


if __name__ == '__main__':
    raise SystemExit(main())
