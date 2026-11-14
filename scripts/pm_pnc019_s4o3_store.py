"""Executable planning reference store for the S4 batch-3 oracle gap.

The store owns admission rows, a durable append log, a recoverable dedupe index,
immutable first receipts, publication heads, withdrawal records and frame maps.
No scenario supplies an admission/CAS/withdrawal-success boolean. Every refusal
comes from a generated Method B predicate over the actual request and store.
This is deterministic clean-room evidence; native Storage is NOT_RUN.
"""
import copy
import hashlib
import importlib
import pickle

from pm_event_numbers import (EVENT_VALUE, Refusal, producer_semantic_digest,
                              storage_uint64, storage_value_bytes)


# name, refusal, raw input predicate. Eight rows maximum per generated table.
TABLES = {
    'append': (
        ('admission', 'missing_event_registration', "v['edition'] not in v['registry']"),
        ('cutoff', 'writer_cutoff', "v['generation'] != v['live_generation']"),
        ('dedupe_frontier', 'dedupe_unavailable', "v['dedupe_through'] != v['durable_through']"),
        ('dedupe_body', 'idempotency_conflict', "v['prior_digest'] is not None and v['digest'] != v['prior_digest']"),
    ),
    'publish': (
        ('publication_cas', 'checkpoint_cas_failed', "v['expected_head'] != v['stored_head']"),
        ('publication_rows', 'source_prefix_incomplete', "v['proposed_rows'] != v['source_rows']"),
        ('publication_frontier', 'source_prefix_incomplete', "v['through'] != v['durable_through']"),
        ('publication_generation', 'publication_withdrawn', "v['generation'] in v['withdrawn']"),
    ),
    'withdraw': (
        ('withdraw_cutoff', 'writer_cutoff', "v['writer_generation'] != v['expected_cutoff']"),
        ('withdraw_head', 'checkpoint_cas_failed', "v['expected_head'] != v['stored_head']"),
        ('withdraw_successor', 'successor_rebuild', "v['successor_rows'] != v['source_rows']"),
        ('withdraw_generation', 'successor_rebuild', "v['successor_generation'] == v['old_generation']"),
    ),
    'read': (
        ('read_generation', 'publication_withdrawn', "v['generation'] in v['withdrawn']"),
        ('read_publication', 'publication_unavailable', "v['generation'] not in v['publications']"),
        ('read_hold', 'retained_source_unavailable', "v['original_ref'] not in v['retained_refs']"),
        ('read_coverage', 'source_prefix_incomplete', "v['generation'] in v['publications'] and v['original_ref'] in v['retained_refs'] and v['original_ref'] not in v['publication_rows']"),
        ('read_frame', 'relocation_commitment', "v['original_ref'] in v['retained_refs'] and v['frame_bytes'] != v['original_bytes']"),
        ('read_shape', 'retained_shape', "v['shape_errors'] != []"),
    ),
    'relocate': (
        ('relocation_original', 'relocation_binding', "v['original_ref'] != v['mapped_original_ref']"),
        ('relocation_instance', 'relocation_binding', "v['storage_instance'] != v['mapped_instance']"),
        ('relocation_bytes', 'relocation_commitment', "v['original_bytes'] != v['translated_bytes']"),
        ('relocation_prior', 'relocation_binding', "v['expected_locator'] != v['stored_locator']"),
    ),
    'restore': (
        ('restore_commitment', 'restore_commitment', "v['captured_digest'] != v['expected_digest']"),
        ('restore_receipts', 'restore_custody', "v['receipt_refs'] != v['original_refs']"),
        ('restore_holds', 'restore_hold', "v['captured_holds'] != v['expected_holds']"),
        ('restore_instance', 'restore_identity', "v['captured_instance'] != v['expected_instance']"),
    ),
    'destination': (
        ('existing_repository', 'repository_reinitialized', "v['disposition'] == 'use_existing' and v['initialized_repositories'] != []"),
        ('repository_survives_removal', 'repository_authority_changed', "v['repositories_after'] != v['repositories_before']"),
    ),
    'expiry': (
        ('expiry_clock', 'expiry_not_reached', "v['clock'] < v['expires']"),
        ('expiry_observation', 'expiry_observation_mismatch', "v['decision_observation'] != v['observation']"),
        ('expiry_preserves_trust', 'expiry_changed_trust', "v['trust_after'] != v['trust_before']"),
    ),
    'connection': (
        ('connection_session', 'connection_session_unverified', "v['session_id'] != v['verified_session_id']"),
        ('connection_trust', 'connection_trust_stale', "v['trust_generation'] != v['current_trust_generation']"),
        ('connection_cursor', 'connection_cursor_unverified', "v['cursor_ref'] != v['verified_cursor_ref']"),
        ('connection_work', 'connection_created_work', "v['work_after'] != v['work_before']"),
    ),
    'restore_chain': (
        ('restore_phase_order', 'restore_phase_order', "v['phases'] != v['required_phases']"),
        ('restore_evidence', 'restore_evidence_missing', "v['resolved_receipts'] != v['original_receipts']"),
        ('restore_quiesce', 'restore_not_quiesced', "v['active_writers_at_activation'] != []"),
        ('restore_no_revival', 'restore_revived_authority', "v['revived_authority'] != []"),
        ('restore_pause', 'restore_work_not_paused', "v['running_after_restore'] != []"),
    ),
}

RECEIPT_PATHS = tuple((field,) for field in (
    'storage_instance_id', 'scope_partition', 'event_type', 'idempotency_key',
    'producer_semantic_digest', 'group_digest', 'original_segment_ref')) + tuple(
    ('first_append_receipt', field) for field in (
        'event_id', 'sequence_id', 'commit_group_id', 'segment_name', 'segment_generation',
        'byte_offset', 'durability_class', 'durable_end_offset',
        'manifest_generation', 'acknowledged_at_utc'))
for _i, _path in enumerate(RECEIPT_PATHS):
    _name = 'receipt_' + '_'.join(_path)
    _table = 'receipt_' + str(_i // 8)
    TABLES.setdefault(_table, ())
    TABLES[_table] += ((_name, 'retained_receipt_join',
        "type(v['" + _name + "']['seen']) is not type(v['" + _name + "']['first']) or " +
        "v['" + _name + "']['seen'] != v['" + _name + "']['first']"),)

RESULT_FIELDS = ('schema_id', 'schema_version', 'sequence_id', 'status')
TABLES['result_0'] = tuple(('result_' + field, 'retained_result_join',
    "v['applies'] is True and (type(v['result_" + field + "']['seen']) is not type(v['result_" + field +
    "']['first']) or v['result_" + field + "']['seen'] != v['result_" + field + "']['first'])")
    for field in RESULT_FIELDS)

# The upstream owner-domain boundaries have their own raw records and shared
# numeric calls. Each distinct predicate remains its own Method B row.
from pm_pnc019_s4o3_domain_cases import RULES as DOMAIN_RULES, number_fields
_domain_counts = {}
for _family, _short, _predicate, _good, _bad in DOMAIN_RULES:
    _name = 'extra_' + _short
    _numbers = number_fields(_good)
    _definitions = []
    for _field in _numbers:
        _definitions.append((_name + '_number_' + _field, 'number_domain',
            "v[" + repr(_name) + "]['numeric_reasons'][" + repr(_field) + "] is not None"))
    _condition = _predicate.replace('d[', 'v[' + repr(_name) + '][')
    if _numbers:
        _condition = ('v[' + repr(_name) + "]['numeric_reasons'] == " + repr(dict.fromkeys(_numbers)) +
                      ' and (' + _condition + ')')
    _definitions.append((_name, 'owner_predicate_failed', _condition))
    for _definition in _definitions:
        _count = _domain_counts.get(_family, 0)
        _table = 'extra_' + _family.replace('.', '_') + '_' + str(_count // 8)
        TABLES.setdefault(_table, ())
        TABLES[_table] += (_definition,)
        _domain_counts[_family] = _count + 1


def at(value, path):
    for part in path:
        value = value[part]
    return value


def encoded(value):
    return storage_value_bytes(value, profile=EVENT_VALUE)


def commitment(value):
    # Test-store snapshots contain lane fixture graphs (sets, binary packs and
    # tuple keys). This is snapshot custody, never a product serialization or
    # event identity recipe. Product values always use encoded()/shared calls.
    return hashlib.sha256(pickle.dumps(value, protocol=4)).hexdigest()


class Store:
    def __init__(self, adapter, case, trace=None):
        self.adapter = adapter
        event = adapter.event(case)
        self.trace = trace
        self.data = {
            'registry': [self.edition(event)], 'writer_generation': 1,
            'log': [], 'dedupe': {}, 'dedupe_through': 0, 'originals': {},
            'receipts': {}, 'results': {}, 'frames': {}, 'locations': {}, 'holds': {},
            'head': None, 'publications': {}, 'withdrawn': [],
            'storage_instance': adapter.instance(case), 'external_effects': [],
        }

    @staticmethod
    def edition(event):
        return [event['event_type'], event['payload_schema_id'], event['payload']['schema_version'],
                event['scope_kind'], event['project_id']]

    def require(self, table, value):
        module = importlib.import_module('pm_pnc019_s4o3_table_' + table)
        refusals = [(name, code) for name, _reason, _condition in TABLES[table]
                    if (code := getattr(module, name)(value, None)) is not None]
        self.last_refusals = refusals
        if self.trace is not None:
            self.trace.append((table, copy.deepcopy(value), refusals))
        if refusals:
            raise Refusal(refusals[0][1])

    def append(self, case, generation=1, crash=None):
        storage_uint64(generation)
        event = self.adapter.event(case)
        key = event['event_type'] + '\0' + event['idempotency_key']
        digest = producer_semantic_digest(event)
        prior = self.data['dedupe'].get(key)
        self.require('append', {
            'edition': self.edition(event), 'registry': self.data['registry'],
            'generation': generation, 'live_generation': self.data['writer_generation'],
            'dedupe_through': self.data['dedupe_through'], 'durable_through': len(self.data['log']),
            'prior_digest': prior['digest'] if prior else None, 'digest': digest,
            'replay_policy': event['replay_policy'],
        })
        # A retry resolves its immutable first result. It never revalidates live
        # source facts or manufactures another first receipt.
        if prior is not None:
            return copy.deepcopy(self.data['receipts'][prior['original_ref']])
        self.adapter.validate(case, self.require)
        staged = copy.deepcopy(self.data)
        ref = self.adapter.original_ref(case)
        staged['log'].append({'key': key, 'digest': digest, 'original_ref': ref})
        staged['originals'][ref] = self.adapter.persisted(case)
        staged['receipts'][ref] = copy.deepcopy(self.adapter.receipt(case))
        staged['results'][ref] = self.adapter.first_result(case)
        staged['locations'][ref] = 'segment:original:' + ref
        staged['frames'][staged['locations'][ref]] = encoded(event)
        staged['dedupe'][key] = copy.deepcopy(staged['log'][-1])
        staged['dedupe_through'] = len(staged['log'])
        if crash in ('prepared', 'receipt_staged', 'before_commit'):
            return None
        self.data = staged  # atomic reference-model transaction
        if crash == 'lost_ack':
            return None
        return copy.deepcopy(staged['receipts'][ref])

    def recover_dedupe(self):
        self.data['dedupe'] = {r['key']: copy.deepcopy(r) for r in self.data['log']}
        self.data['dedupe_through'] = len(self.data['log'])

    def source_rows(self):
        return [r['original_ref'] for r in self.data['log']]

    def publish(self, expected_head, generation, rows, through, crash=None):
        storage_uint64(through)
        self.require('publish', {
            'expected_head': expected_head, 'stored_head': self.data['head'],
            'proposed_rows': rows, 'source_rows': self.source_rows(),
            'through': through, 'durable_through': len(self.data['log']),
            'generation': generation, 'withdrawn': self.data['withdrawn'],
        })
        for original_ref in rows:
            self.adapter.validate_projection(self.data['originals'][original_ref])
        staged = copy.deepcopy(self.data)
        staged['publications'][generation] = {'rows': copy.deepcopy(rows), 'through': through}
        staged['head'] = generation
        if crash in ('rows_staged', 'checkpoint_staged', 'before_commit'):
            return None
        self.data = staged
        return generation

    def withdraw(self, expected_head, cutoff, successor, rows):
        storage_uint64(cutoff)
        old = self.data['head']
        self.require('withdraw', {
            'writer_generation': self.data['writer_generation'], 'expected_cutoff': cutoff,
            'expected_head': expected_head, 'stored_head': old,
            'successor_rows': rows, 'source_rows': self.source_rows(),
            'successor_generation': successor, 'old_generation': old,
        })
        staged = copy.deepcopy(self.data)
        if old not in staged['withdrawn']:
            staged['withdrawn'].append(old)
        staged['publications'][successor] = {'rows': copy.deepcopy(rows), 'through': len(staged['log'])}
        staged['head'] = successor
        staged['registry'] = []
        self.data = staged

    def read(self, generation, original_ref):
        original = self.data['originals'].get(original_ref)
        locator = self.data['locations'].get(original_ref)
        presented, result, shape_errors = self.adapter.retained_values(original) if original else (None, None, [])
        self.require('read', {'generation': generation, 'withdrawn': self.data['withdrawn'],
                              'publications': list(self.data['publications']),
                              'publication_rows': self.data['publications'].get(generation, {}).get('rows', []),
                              'original_ref': original_ref, 'retained_refs': list(self.data['originals']),
                              'frame_bytes': self.data['frames'].get(locator, b'').hex(),
                              'original_bytes': encoded(self.adapter.event(original)).hex() if original else None,
                              'shape_errors': shape_errors})
        # The actual shared RetainedDispatcher is called by each lane adapter.
        case = copy.deepcopy(self.data['originals'][original_ref])
        case['sealed_store'] = copy.deepcopy(case.get('sealed_store', []))
        first = self.data['receipts'][original_ref]
        values = {'receipt_' + '_'.join(path): {'seen': at(presented, path), 'first': at(first, path)}
                  for path in RECEIPT_PATHS}
        for table in ('receipt_0', 'receipt_1', 'receipt_2'):
            self.require(table, values)
        original_result = self.data['results'][original_ref]
        values = {'applies': self.adapter.lane != 'W3D'}
        values.update({'result_' + field: {'seen': result[field] if result else None,
                       'first': original_result[field] if original_result else None} for field in RESULT_FIELDS})
        self.require('result_0', values)
        return self.adapter.retained(case)

    def relocate(self, original_ref, translation):
        self.require('relocate', {
            'original_ref': original_ref, 'mapped_original_ref': translation['original_ref'],
            'storage_instance': self.data['storage_instance'], 'mapped_instance': translation['storage_instance'],
            'original_bytes': self.data['frames'][self.data['locations'][original_ref]].hex(),
            'translated_bytes': translation['bytes_hex'],
            'expected_locator': translation['prior_locator'],
            'stored_locator': self.data['locations'][original_ref],
        })
        # Physical relocation changes the locator, never the sealed original
        # receipt's first-append segment coordinates or the identity recipe.
        original_locator = self.data['locations'][original_ref]
        self.data['frames'][translation['new_locator']] = self.data['frames'].pop(original_locator)
        self.data['locations'][original_ref] = translation['new_locator']

    def capture(self):
        return copy.deepcopy(self.data)

    def restore(self, captured, manifest):
        self.require('restore', {
            'captured_digest': commitment(captured), 'expected_digest': manifest['sha256'],
            'receipt_refs': sorted(captured['receipts']), 'original_refs': sorted(captured['originals']),
            'captured_holds': captured['holds'], 'expected_holds': manifest['holds'],
            'captured_instance': captured['storage_instance'], 'expected_instance': self.data['storage_instance'],
        })
        self.data = copy.deepcopy(captured)
        self.recover_dedupe()

    def prune_selected(self, eligible_refs):
        # Only the explicitly selected retained set is involved. No expiry
        # duration is inferred for indefinite authority or active holds.
        for ref in eligible_refs:
            if not self.data['holds'].get(ref):
                self.data['originals'].pop(ref)
                self.data['receipts'].pop(ref)
                self.data['results'].pop(ref)
                locator = self.data['locations'].pop(ref)
                self.data['frames'].pop(locator)
