#!/usr/bin/env python3
"""Validate the registered terminal command-block family against synthetic contracts.

Pure schema/semantic fixtures; no store migration or native runtime proof.
"""
import argparse
from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import ValidationError as jsonschema_error

PLANS = Path(__file__).resolve().parent.parent / 'Plans'
sys.dont_write_bytecode = True
FACTS = ('command_text', 'cwd', 'start_marker', 'end_marker', 'exit_status', 'lifecycle')
FACT_FIELDS = dict(zip(FACTS, ('command_text_ref', 'cwd_ref', 'start_marker_ref',
                            'end_marker_ref', 'exit_code', 'lifecycle')))


def convert_legacy(old, migration_source_ref):
    """Pure fixture transform; real conversion requires verified coordinator custody."""
    if old.get('schema_id') != 'pm.storage_value.terminal_command_block.v1' or old.get('schema_version') != '1.0.0':
        raise ValueError('Converter requires protected v1 source, not an unversioned/already-target row')
    view = deepcopy(old)
    view.update(schema_id='pm.storage_value.terminal_command_block.v2', schema_version='2.0.0',
                record_origin='legacy_v1', migration_source_ref=migration_source_ref,
                ordinal=None, cwd_ref=None,
                start_marker_ref=None, end_marker_ref=None, duration_ms=None,
                lifecycle=None, integration_source=None, integration_source_ref=None,
                completion_source_ref=None, confidence={fact: None for fact in FACTS})
    view.setdefault('exit_code', None)
    view.setdefault('finished_at_utc', None)
    return view


def validator(schema):
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema, format_checker=FormatChecker())


def canonical_bytes(value):
    # Fixture custody is explicit JSON bytes, NOT a production MessagePack encoder.
    return json.dumps(value, sort_keys=True, separators=(',', ':')).encode()


def value_hash(value):
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def definition(schema, name):
    return validator({**schema['$defs'][name], '$defs': schema['$defs']})


def identity(row):
    return tuple(row[k] for k in ('project_id', 'terminal_session_id', 'command_block_id'))


def row_key(row):
    return 'terminal_command_block.v1:' + ':'.join(identity(row))


def admit(row, schema, context, producer='observation'):
    """Pure synthetic semantic admission; reference targets are explicit fixture mocks."""
    validator(schema).validate(row)
    if producer == 'observation':
        require(row['record_origin'] == 'observed', 'ordinary producer impersonates legacy conversion')
    if row['record_origin'] == 'legacy_v1':
        proof = context['migration_sources'].get(row['migration_source_ref'])
        require(proof is not None, 'unresolved migration source')
        definition(schema, 'migration_source_proof').validate(proof)
        require(identity(proof) == identity(row), 'legacy provenance identity mismatch')
        journal = context['journal']
        require(journal is not None and proof['migration_id'] == journal['migration_id'] and
                proof['journal_ref'] == journal['ref'], 'legacy journal mismatch')
        require(proof['backup_ref'] == context['backup_ref'] and context['backup_protected'] and
                context['backup_verified'], 'missing protected verified original custody')
        source = context['originals'].get(proof['source_key'])
        require(source is not None and proof['source_key'] == row_key(row), 'wrong original row/key')
        raw = bytes.fromhex(source['bytes_hex'])
        require(hashlib.sha256(raw).hexdigest() == proof['source_value_sha256'] == source['sha256'],
                'original bytes/hash mismatch')
        old = json.loads(raw)
        definition(schema, 'legacy_v1').validate(old)
        require(old['schema_id'] == proof['source_schema_id'] and
                old['schema_version'] == proof['source_schema_version'], 'source version mismatch')
        require(row == convert_legacy(old, row['migration_source_ref']), 'conversion invented or lost a source fact')
        if producer == 'coordinator':
            require(context['exclusive_lock'] and journal['phase'] in ('backup_verified', 'applying', 'pre_stamp_verified'),
                    'conversion outside locked nonterminal coordinator')
        return
    # Restoring an exactly previously admitted value must not erase a known outcome
    # merely because references later become unavailable. This is a mock admission proof.
    if producer == 'restore' and value_hash(row) in context.get('admitted_hashes', []):
        return
    sources = []
    for ref_field in ('integration_source_ref', 'completion_source_ref'):
        ref = row[ref_field]
        if ref is None:
            continue
        wrapped = context['evidence'].get(ref)
        require(wrapped is not None and wrapped['redaction_verified'], 'unresolved/unverified observation evidence')
        source = wrapped['value']
        definition(schema, 'observation_evidence').validate(source)
        require(identity(source) == identity(row), 'observation session/block mismatch')
        if ref_field == 'integration_source_ref':
            require(source['source_kind'] == row['integration_source'], 'grouping source category mismatch')
        sources.append(source)
    for ref_field, kind in (('command_text_ref', 'command'), ('cwd_ref', 'cwd'),
                            ('start_marker_ref', 'start_marker'), ('end_marker_ref', 'end_marker')):
        ref = row[ref_field]
        if ref is None:
            continue
        target = context['artifacts'].get(ref)
        require(target is not None and target['redaction_verified'], 'ref spelling is not safe resolved custody')
        require(identity(target) == identity(row) and target['kind'] == kind, 'artifact/marker owner mismatch')
        if 'marker' in kind:
            transcript = context['artifacts'].get(target.get('transcript_ref'))
            require(transcript is not None and transcript['kind'] == 'transcript' and
                    transcript['redaction_verified'], 'marker transcript target unresolved/unverified')
            require(all(transcript[key] == row[key] for key in ('project_id', 'terminal_session_id')),
                    'marker transcript project/session mismatch')
    for fact, field in FACT_FIELDS.items():
        quality = row['confidence'][fact]
        if quality is None:
            continue
        candidates = [source for source in sources if field in source['facts'] and
                      source['confidence'].get(fact) is not None]
        require(candidates, 'confidence without fact evidence')
        rank = lambda source: 1 if source['source_kind'] == 'transcript_heuristic' else 2
        top = [source for source in candidates if rank(source) == max(map(rank, candidates))]
        require(all(source['facts'][field] == row[field] for source in top), 'source precedence/conflicting fact')
        if quality == 'authoritative':
            require(any(rank(source) == 2 and source['confidence'][fact] == 'authoritative' for source in top),
                    'heuristic/unqualified evidence cannot create authoritative fact')
    completion_ref = row['completion_source_ref']
    if row['lifecycle'] == 'completed' or row['exit_code'] is not None or row['finished_at_utc'] is not None:
        require(completion_ref is not None, 'completion/timing without completion evidence')
    if completion_ref:
        completion = context['evidence'][completion_ref]['value']
        require(completion['source_kind'] in ('shell_integration', 'session_runtime'),
                'heuristic cannot authorize completion')
        if completion['event_kind'] == 'session_end':
            require(row['lifecycle'] == 'indeterminate' and row['exit_code'] is None,
                    'session end fabricated command success/exit')
        else:
            require(completion['event_kind'] == 'command_completion', 'wrong completion evidence kind')
            require(row['lifecycle'] == 'completed' and completion['facts'].get('lifecycle') == 'completed' and
                    completion['confidence'].get('lifecycle') == 'authoritative',
                    'command completion requires qualified completed lifecycle')
        if row['lifecycle'] == 'completed':
            require(completion['confidence'].get('lifecycle') == 'authoritative',
                    'completed lifecycle lacks authoritative completion evidence')
        if row['exit_code'] is not None:
            require(completion['confidence'].get('exit_status') == 'authoritative',
                    'exit value lacks authoritative completion evidence')
        for field in ('lifecycle', 'exit_code', 'finished_at_utc', 'duration_ms'):
            if row[field] is not None:
                require(completion['facts'].get(field) == row[field], 'completion fact mismatch')


def late_update(old, new, schema, context):
    admit(old, schema, context)
    admit(new, schema, context)
    require(identity(old) == identity(new) and old['ordinal'] == new['ordinal'], 'late identity changed')
    before = context['evidence'].get(old['completion_source_ref'])
    after = context['evidence'].get(new['completion_source_ref'])
    require(before is not None and after is not None, 'unknown late completion provenance')
    require(before['value']['source_identity'] == after['value']['source_identity'] and
            before['value']['source_kind'] == after['value']['source_kind'], 'different authoritative source')


def mixed_version_gate(context):
    if len(set(context['active_family_versions'])) <= 1:
        return
    journal = context['journal']
    require(journal is not None and context['exclusive_lock'] and
            journal['phase'] in ('backup_verified', 'applying', 'pre_stamp_verified', 'stamp_committed', 'post_stamp_verifying') and
            journal['from_store'] == context['graph']['from_store'] and journal['to_store'] == context['graph']['to_store'],
            'half_migrated_detected')


def validate_ordinal_sequence(rows):
    """Validate an explicitly ordered observed-creation sequence, not a key scan."""
    last = {}
    for row in rows:
        if row['record_origin'] != 'observed':
            continue
        session = identity(row)[:2]
        require(row['ordinal'] is not None and row['ordinal'] > last.get(session, -1),
                'observed session ordinal is duplicated or nonmonotonic')
        last[session] = row['ordinal']


def verify_migration(context, schema, recovery, recovery_module):
    graph, receipt = context['graph'], context['receipt']
    require(graph['fixture_only'] is True, 'fixture graph must not claim production registration')
    require(graph['family_id'] == 'terminal_command_block' and
            graph['from_family'] == schema['$defs']['legacy_v1']['properties']['schema_version']['const'] and
            graph['to_family'] == schema['properties']['schema_version']['const'] and
            set(graph['schema_ids']) == {schema['properties']['schema_id']['const'],
                                       schema['$defs']['legacy_v1']['properties']['schema_id']['const']},
            'graph family/schema transition disagrees with actual value schemas')
    failures = recovery_module.validate_instance(receipt, 'migration_receipt', recovery)
    require(not failures, 'existing migration receipt checks: ' + repr(failures))
    require(receipt['terminal_status'] == 'committed', 'fixture expects verified commit')
    require(receipt['from_version'] == graph['from_store'] and receipt['to_version'] == graph['to_store'], 'wrong receipt store edge')
    require(receipt['store_transitions'] == [{'store_or_family_id': graph['store_id'],
             'from_version': graph['from_store'], 'to_version': graph['to_store']}], 'wrong store transition')
    require(receipt['family_transitions'] == [{'store_or_family_id': graph['family_id'],
             'from_version': graph['from_family'], 'to_version': graph['to_family']}], 'wrong family transition')
    require(set(receipt['schema_ids']) == set(graph['schema_ids']), 'wrong source/target schemas')
    require(context['journal']['migration_id'] == receipt['migration_id'] and
            context['journal']['ref'] == receipt['journal_ref'] and
            context['journal']['phase'] == 'committed', 'terminal journal mismatch')
    require(context['journal']['from_store'] == graph['from_store'] == receipt['from_version'] and
            context['journal']['to_store'] == graph['to_store'] == receipt['to_version'],
            'committed journal endpoints disagree with graph/receipt')
    require(receipt['backup_ref'] == context['backup_ref'], 'receipt/source backup mismatch')
    targets = context['targets']
    require(len(targets) == len(context['originals']) and {row_key(row) for row in targets} == set(context['originals']),
            'every affected row census must match')
    for row in targets:
        admit(row, schema, context, producer='verification')
    expected = {row_key(row): value_hash(row) for row in targets}
    require([step['step_id'] for step in receipt['applied_steps']] == graph['step_ids'], 'step identity/order mismatch')
    require(receipt['applied_steps'][-1]['status'] == 'verified', 'verification step not verified')
    for step in receipt['applied_steps']:
        proof = context['step_evidence'].get(step['evidence_ref'])
        require(proof is not None and proof['step_id'] == step['step_id'] and
                proof['migration_id'] == receipt['migration_id'] and proof['target_hashes'] == expected and
                proof['family_id'] == graph['family_id'] and proof['to_family'] == graph['to_family'], 'step evidence/census mismatch')
    require(context['verification_details'].get(receipt['verification_result']['detail_refs'][0]) == expected,
            'all-row verification evidence mismatch')
    require(context['store_stamp'] == graph['to_store'] and context['post_stamp_reopen_verified'] and
            context['receipt_readback_verified'], 'stamp/reopen/receipt order unverified')
    require(context['active_family_versions'] == [graph['to_family']], 'normal committed mixed versions forbidden')
    mixed_version_gate(context)


def fixture_context(fixture, family):
    receipt, graph = deepcopy(fixture['receipt']), deepcopy(fixture['graph'])
    context = {'graph': graph, 'receipt': receipt, 'evidence': deepcopy(fixture['evidence']),
               'artifacts': deepcopy(fixture['artifacts']), 'migration_sources': {}, 'originals': {},
               'backup_ref': receipt['backup_ref'], 'backup_protected': True, 'backup_verified': True,
               'exclusive_lock': True, 'journal': {'ref': receipt['journal_ref'], 'migration_id': receipt['migration_id'],
                   'phase': 'applying', 'from_store': graph['from_store'], 'to_store': graph['to_store']},
               'active_family_versions': ['1.0.0', '2.0.0'], 'targets': [], 'step_evidence': {},
               'store_stamp': graph['to_store'], 'post_stamp_reopen_verified': True, 'receipt_readback_verified': True}
    for status in fixture['legacy_statuses']:
        for optional in fixture['legacy_optional_shapes']:
            old = deepcopy(fixture['legacy_base'])
            old.update(command_block_id='legacy-' + status + '-' + optional, status=status)
            if optional == 'present':
                old.update(fixture['legacy_optional_values'])
            raw = canonical_bytes(old)
            key, proof_ref = row_key(old), 'proof:conversion:' + old['command_block_id']
            context['originals'][key] = {'bytes_hex': raw.hex(), 'sha256': hashlib.sha256(raw).hexdigest(),
                                         'encoding': 'SYNTHETIC canonical JSON bytes; not production MessagePack'}
            context['migration_sources'][proof_ref] = {
                'migration_id': receipt['migration_id'], 'journal_ref': receipt['journal_ref'],
                'backup_ref': receipt['backup_ref'], 'source_key': key,
                'source_schema_id': family['value_schema_id'], 'source_schema_version': family['schema_version'],
                'source_value_sha256': hashlib.sha256(raw).hexdigest(),
                **{k: old[k] for k in ('project_id', 'terminal_session_id', 'command_block_id')},
            }
            context['targets'].append(convert_legacy(old, proof_ref))
    expected = {row_key(row): value_hash(row) for row in context['targets']}
    for step in receipt['applied_steps']:
        context['step_evidence'][step['evidence_ref']] = {
            'step_id': step['step_id'], 'migration_id': receipt['migration_id'],
            'family_id': graph['family_id'], 'to_family': graph['to_family'], 'target_hashes': expected,
        }
    context['verification_details'] = {receipt['verification_result']['detail_refs'][0]: expected}
    return context


def exercise(family, candidate, fixture, recovery, recovery_module):
    schema = candidate['value_schema']
    context = fixture_context(fixture, family)
    checks = []

    def case(name, action, valid=True):
        try:
            action()
        except (ValueError, KeyError, TypeError, AssertionError, jsonschema_error) as error:
            require(not valid, name + ': unexpected failure: ' + str(error))
            checks.append({'case': name, 'expected': 'reject', 'reason': str(error).splitlines()[0]})
        else:
            require(valid, name + ': unexpectedly accepted')
            checks.append({'case': name, 'expected': 'accept'})

    for name, row in fixture['rows'].items():
        case('observed ' + name, lambda row=row: admit(row, schema, context))
    old = deepcopy(fixture['legacy_base'])
    case('current v1 accepts original shape', lambda: validator(family['value_schema']).validate(old))
    bad = deepcopy(old); bad['command_text_ref'] = None
    case('current v1 rejects unknown command text', lambda: validator(family['value_schema']).validate(bad), False)
    rich_old = deepcopy(old); rich_old['ordinal'] = 1
    case('current v1 rejects missing-metadata additions', lambda: validator(family['value_schema']).validate(rich_old), False)
    unsafe_source = deepcopy(old); unsafe_source['command_text_ref'] = 'echo private-value'
    saved_unsafe_bytes = canonical_bytes(unsafe_source)
    case('unsafe legacy reference cannot pass target validation',
         lambda: validator(schema).validate(convert_legacy(unsafe_source, 'proof:conversion:unsafe')), False)
    require(canonical_bytes(unsafe_source) == saved_unsafe_bytes, 'invalid source was modified or dropped')
    for row in context['targets']:
        case('coordinator conversion ' + row['command_block_id'], lambda row=row: admit(row, schema, context, 'coordinator'))
        source = json.loads(bytes.fromhex(context['originals'][row_key(row)]['bytes_hex']))
        require(convert_legacy(source, row['migration_source_ref']) == row, 'repeat conversion is not idempotent')
        for key, value in source.items():
            if key not in ('schema_id', 'schema_version'):
                require(row[key] == value, 'lost optional legacy field')
    unknown_success = next(row for row in context['targets'] if row['command_block_id'] == 'legacy-succeeded-omitted')
    require(unknown_success['status'] == 'succeeded' and unknown_success['exit_code'] is None and
            unknown_success['lifecycle'] is None and unknown_success['confidence']['exit_status'] is None,
            'legacy summary promoted unknown success')
    checks.append({'case': 'all five legacy statuses / two optional shapes preserve source and repeat equally', 'expected': 'accept'})
    case('already-target row is not reinterpreted as a v1 source',
         lambda: convert_legacy(context['targets'][0], context['targets'][0]['migration_source_ref']), False)
    invented = deepcopy(context['targets'][0]); invented['ordinal'] = 0
    case('legacy ordinal cannot be invented from replay position', lambda: admit(invented, schema, context, 'coordinator'), False)
    strong, weak = deepcopy(fixture['rows']['strong']), deepcopy(fixture['rows']['weak'])
    for name, patch in [('unversioned value', {'schema_version': '1.0.0'}),
                        ('conflicting observed summary', {'status': 'succeeded'}),
                        ('null observed ordinal', {'ordinal': None}),
                        ('raw command property', {'command_text': 'private command body'}),
                        ('raw cwd property', {'cwd': '/private/path'}),
                        ('live runtime property', {'runtime_live': True}),
                        ('unbound legacy exception', {'record_origin': 'legacy_v1', 'ordinal': None, 'lifecycle': None})]:
        row = deepcopy(strong); row.update(patch)
        case(name, lambda row=row: validator(schema).validate(row), False)
    row = deepcopy(strong); del row['exit_code']
    case('omitted exit with known confidence', lambda: validator(schema).validate(row), False)
    row2 = deepcopy(strong); del row2['finished_at_utc']
    case('omitted finish time', lambda: validator(schema).validate(row2), False)
    row3 = deepcopy(weak); row3['confidence']['command_text'] = 'authoritative'
    case('unknown fact with known confidence', lambda: validator(schema).validate(row3), False)
    row4 = deepcopy(strong); row4['completion_source_ref'] = None
    case('authoritative completion with no source', lambda: admit(row4, schema, context), False)
    row5 = deepcopy(strong); row5['command_text_ref'] = 'artifact:plausible:unresolved'
    case('protected-looking ref without target proof', lambda: admit(row5, schema, context), False)
    badctx = deepcopy(context); badctx['artifacts'][strong['start_marker_ref']]['terminal_session_id'] = 'other-session'
    case('marker owning-session mismatch', lambda: admit(strong, schema, badctx), False)
    running = deepcopy(strong); running['lifecycle'] = 'running'
    runningctx = deepcopy(context)
    for ref in (running['integration_source_ref'], running['completion_source_ref']):
        runningctx['evidence'][ref]['value']['facts']['lifecycle'] = 'running'
    case('command completion with consistently running lifecycle', lambda: admit(running, schema, runningctx), False)
    missingtranscript = deepcopy(context)
    missingtranscript['artifacts'][strong['start_marker_ref']]['transcript_ref'] = 'artifact:unrelated:missing-transcript'
    case('missing marker transcript target', lambda: admit(strong, schema, missingtranscript), False)
    wrongtranscript = deepcopy(context)
    wrongtranscript['artifacts']['artifact:transcript:7']['terminal_session_id'] = 'other-session'
    case('wrong-session marker transcript target', lambda: admit(strong, schema, wrongtranscript), False)
    wrongproject = deepcopy(context)
    wrongproject['artifacts']['artifact:transcript:7']['project_id'] = 'other-project'
    case('wrong-project marker transcript target', lambda: admit(strong, schema, wrongproject), False)
    lostbacking = deepcopy(context); lostbacking['admitted_hashes'] = [value_hash(strong)]
    lostbacking['artifacts'] = {}
    case('later marker and transcript loss preserves admitted outcome', lambda: admit(strong, schema, lostbacking, 'restore'))
    badctx2 = deepcopy(context); badctx2['evidence'][strong['completion_source_ref']]['redaction_verified'] = False
    case('evidence without verified redaction', lambda: admit(strong, schema, badctx2), False)
    badctx3 = deepcopy(context); badctx3['evidence'][strong['completion_source_ref']]['value']['source_kind'] = 'transcript_heuristic'
    case('heuristic completion cannot override runtime authority', lambda: admit(strong, schema, badctx3), False)
    badctx4 = deepcopy(context); badctx4['evidence'][strong['completion_source_ref']]['value']['confidence']['exit_status'] = None
    case('runtime category alone cannot prove exit authority', lambda: admit(strong, schema, badctx4), False)
    end = deepcopy(fixture['rows']['session_end']); end['exit_code'] = 0
    case('session end cannot invent command exit', lambda: admit(end, schema, context), False)
    redactedctx = deepcopy(context); redactedctx['artifacts'][strong['command_text_ref']]['state'] = 'redacted'
    case('redacted command retains known exit metadata', lambda: admit(strong, schema, redactedctx))
    unavailablectx = deepcopy(context); unavailablectx['admitted_hashes'] = [value_hash(strong)]; unavailablectx['evidence'] = {}
    case('later evidence loss does not rewrite admitted known outcome', lambda: admit(strong, schema, unavailablectx, 'restore'))
    changed = deepcopy(strong); changed['exit_code'] = 99
    case('changed row cannot borrow prior admission', lambda: admit(changed, schema, unavailablectx, 'restore'), False)
    for life in ('pending_prompt', 'collecting_command', 'running'):
        row = deepcopy(weak); row['lifecycle'] = life
        ctx = deepcopy(context); ctx['evidence'][row['integration_source_ref']]['value']['facts']['lifecycle'] = life
        case('lifecycle ' + life, lambda row=row, ctx=ctx: admit(row, schema, ctx))
    latectx = deepcopy(context)
    before = deepcopy(strong); before['exit_code'] = None; before['confidence']['exit_status'] = None
    before['completion_source_ref'] = 'evidence:completion:earlier'
    prior = deepcopy(latectx['evidence'][strong['completion_source_ref']]); prior['value']['facts']['exit_code'] = None
    prior['value']['confidence']['exit_status'] = None
    latectx['evidence'][before['completion_source_ref']] = prior
    # Earlier integration observation also lacks exit, avoiding a fabricated contradiction.
    before['integration_source_ref'] = 'evidence:integration:earlier'
    integ = deepcopy(latectx['evidence'][strong['integration_source_ref']]); integ['value']['facts']['exit_code'] = None
    integ['value']['confidence']['exit_status'] = None; latectx['evidence'][before['integration_source_ref']] = integ
    case('completed with unknown exit', lambda: admit(before, schema, latectx))
    case('different artifact same stable authoritative source late metadata', lambda: late_update(before, strong, schema, latectx))
    different = deepcopy(latectx); different['evidence'][strong['completion_source_ref']]['value']['source_identity'] = 'source:unrelated'
    case('different stable source late update', lambda: late_update(before, strong, schema, different), False)
    legacy = context['targets'][0]
    case('ordinary producer cannot use converted-legacy exception', lambda: admit(legacy, schema, context), False)
    for name, mutation in [
        ('missing original custody', lambda ctx: ctx.update(backup_protected=False)),
        ('mismatched provenance journal', lambda ctx: ctx['migration_sources'][legacy['migration_source_ref']].update(journal_ref='journal:wrong')),
        ('changed original bytes', lambda ctx: ctx['originals'][row_key(legacy)].update(bytes_hex='7b7d')),
    ]:
        ctx = deepcopy(context); mutation(ctx)
        case(name, lambda ctx=ctx: admit(legacy, schema, ctx, 'coordinator'), False)
    case('locked matching nonterminal mixed versions', lambda: mixed_version_gate(context))
    unjournaled = deepcopy(context); unjournaled['journal'] = None
    case('unjournaled mixed versions', lambda: mixed_version_gate(unjournaled), False)
    final = deepcopy(context); final['journal']['phase'] = 'committed'; final['exclusive_lock'] = False
    final['active_family_versions'] = ['2.0.0']
    case('existing receipt plus synthetic graph all-row verification', lambda: verify_migration(final, schema, recovery, recovery_module))
    for name, mutation in [
        ('wrong committed journal source', lambda ctx: ctx['journal'].update(from_store='900099')),
        ('wrong committed journal target', lambda ctx: ctx['journal'].update(to_store='900099')),
        ('wrong family target', lambda ctx: ctx['receipt']['family_transitions'][0].update(to_version='3.0.0')),
        ('wrong store edge', lambda ctx: ctx['receipt']['store_transitions'][0].update(to_version='900099')),
        ('wrong target schema identity', lambda ctx: ctx['receipt'].update(schema_ids=['pm.storage_value.terminal_command_block.v1'])),
        ('graph inconsistent with actual target schema', lambda ctx: ctx['graph'].update(to_family='3.0.0')),
        ('missing affected target row', lambda ctx: ctx['targets'].pop()),
        ('invalid target before claimed commit', lambda ctx: ctx['targets'][0].update(command_text='raw')),
        ('step evidence mismatch', lambda ctx: ctx['step_evidence']['evidence:synthetic:verify'].update(target_hashes={})),
        ('wrong stamp before commit', lambda ctx: ctx.update(store_stamp='900001')),
        ('ordinary committed mixed versions', lambda ctx: ctx.update(active_family_versions=['1.0.0', '2.0.0'])),
    ]:
        ctx = deepcopy(final); mutation(ctx)
        case(name, lambda ctx=ctx: verify_migration(ctx, schema, recovery, recovery_module), False)
    sequence = list(fixture['rows'].values())
    case('observed creation sequence monotonicity', lambda: validate_ordinal_sequence(sequence))
    case('duplicate observed session ordinal', lambda: validate_ordinal_sequence(sequence + [sequence[0]]), False)
    case('out-of-order observed creation sequence', lambda: validate_ordinal_sequence(list(reversed(sequence))), False)
    return checks


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plans-dir', type=Path, default=PLANS)
    parser.add_argument('--fixtures', type=Path)
    args = parser.parse_args()
    registry_path = args.plans_dir / 'storage_value_registry.json'
    fixture_path = args.fixtures or args.plans_dir / 'terminal_command_block_contract_fixtures.json'
    raw = registry_path.read_bytes(); registry = json.loads(raw)
    matches = [row for row in registry['families'] if row['family_id'] == 'terminal_command_block']
    require(len(matches) == 1, 'terminal family census must be one')
    candidate = matches[0]
    schema = candidate['value_schema']
    legacy = schema['$defs']['legacy_v1']
    family = {'value_schema': legacy, 'value_schema_id': legacy['properties']['schema_id']['const'],
              'schema_version': legacy['properties']['schema_version']['const']}
    recovery = json.loads((args.plans_dir / 'storage_recovery_contracts.schema.json').read_text())
    module_path = Path(__file__).with_name('pm-storage-recovery-contracts.py')
    spec = importlib.util.spec_from_file_location('existing_storage_recovery', module_path)
    recovery_module = importlib.util.module_from_spec(spec); spec.loader.exec_module(recovery_module)
    checks = exercise(family, candidate, json.loads(fixture_path.read_text()), recovery, recovery_module)
    outer = json.loads((args.plans_dir / 'storage_value_registry.schema.json').read_text())
    validator({'$defs': outer['$defs'], '$ref': '#/$defs/family'}).validate(candidate)
    props = schema['properties']
    require(set(candidate['required_fields']) == set(schema['required']), 'required inventory drift')
    require(set(candidate['required_fields']) | set(candidate['optional_fields']) == set(props), 'field inventory incomplete')
    require(registry_path.read_bytes() == raw, 'registry mutated')
    print(json.dumps({'status': 'pass', 'check_count': len(checks), 'checks': checks,
                      'fixture': fixture_path.name, 'fixture_sha256': hashlib.sha256(fixture_path.read_bytes()).hexdigest(),
                      'registry_sha256': hashlib.sha256(raw).hexdigest(),
                      'family_meta_schema_and_inventories': 'pass',
                      'production_store_graph_admission': 'NOT_ESTABLISHED: synthetic edge only',
                      'limits': 'Pure shape/semantic fixtures and JSON byte custody mocks; not a production MessagePack migration, '
                                'backup/security, ref-redaction, lock/crash, native runtime, UI or governance proof.'}, indent=2))


if __name__ == '__main__':
    main()
