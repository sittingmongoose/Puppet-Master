#!/usr/bin/env python3
"""Generate the DX sweep part 2A and part 2B witnesses (Plans/executor_event_p2a_cases.json).

Usage: python3 scripts/pm-executor-p2a-cases.py [--check]

Each witness starts from a named valid seed of its own family and changes one fact. Every copy of
that fact the seed holds (envelope inline payload, joined owner-record field, transition mirror,
dependency ref) moves with it, and every changed owner record is rehashed, so the only defect is
the named one. The builder runs each witness through the complete checker and keeps it only when
the checker refuses it at exactly its target row (a control: accepts it). Retained-history
witnesses whose complete original changes get their own authenticated custody entry in
Plans/executor_event_recipe_custody_fixtures.json (write_time_edition DX-sweep-p2a); existing
entries are never changed. --check rebuilds both and fails on any difference.
"""
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_executor_event_semantics as sem  # noqa: E402
sys.modules.setdefault('pm_executor_event_semantics', sem)
import pm_executor_event_contracts as con  # noqa: E402

OUT = ROOT / 'Plans/executor_event_p2a_cases.json'
CUSTODY = ROOT / 'Plans/executor_event_recipe_custody_fixtures.json'
EDITION = 'DX-sweep-p2a'
DELETE = object()

CONTRACTS = {c['event_type']: c for c in json.loads((ROOT / 'Plans/executor_event_contracts.json').read_text())['families']}
FIXTURES = json.loads((ROOT / 'Plans/executor_event_semantic_fixtures.json').read_text())
FAMILIES = sem.expand_fixture_literals(FIXTURES['families'])
RAW_FAMILIES = FIXTURES['families']
SHAPES = sem.expand_fixture_literals(json.loads((ROOT / 'Plans/executor_event_contract_fixtures.json').read_text()))['cases']
RAW_SHAPES = json.loads((ROOT / 'Plans/executor_event_contract_fixtures.json').read_text())['cases']
EXISTING = {f['event_type'] for f in json.loads((ROOT / 'Plans/event_family_registry.json').read_text())['families']}
CUSTODY_DOC = json.loads(CUSTODY.read_text())
BASE_CUSTODY = {k: v for k, v in CUSTODY_DOC['records'].items() if v.get('write_time_edition') != EDITION}
ADDED = {}


def overlay_custody(source_sha256):
    return {**BASE_CUSTODY, **ADDED}.get(source_sha256, {})


sem.custody_entry = overlay_custody
# SP-1101 frozen-resource manifests recorded by custody for every modelled write-time edition. The static
# model's assumption, stated in the report: each modelled edition was written against this head's resources.
MANIFESTS = {edition: {name: sem.resource_manifest(contract) for name, contract in sorted(CONTRACTS.items())}
             for edition in sem.OWNER_EDITIONS}
sem.custody_manifests = lambda: MANIFESTS


def encoded(value):
    return sem.fixture_encoding(value)


def diff(a, b, prefix=''):
    """The mutate() changes that turn a into b (dict keys recursively; other values replaced whole)."""
    if type(a) is dict and type(b) is dict:
        out = []
        for k in a:
            if k not in b:
                out.append({'path': prefix + k, 'delete': True})
            else:
                out += diff(a[k], b[k], prefix + k + '/')
        for k in b:
            if k not in a:
                out.append({'path': prefix + k, 'value': copy.deepcopy(b[k])})
        return out
    if encoded(a) == encoded(b):
        return []
    return [{'path': prefix.rstrip('/'), 'value': copy.deepcopy(b)}]


def raw_seed(kind, family, name):
    """The seed exactly as the fixture writes it (authoring notation unexpanded), for frozen changes."""
    if kind == 'capture':
        base = RAW_FAMILIES[family]['baseline']
        if name == 'baseline':
            return copy.deepcopy(base)
        source = next(row for row in RAW_FAMILIES[family]['cases'] if row['case'] == name)
        return sem.mutate(base, source['changes'])
    raise RuntimeError(kind)


class Capture:
    """Coherent edits of one capture document {payload, capture} of a family."""

    def __init__(self, family, doc):
        self.family, self.doc = family, doc
        self.adapter = CONTRACTS[family]['semantic_adapter']
        self.dirty = set()

    @property
    def records(self):
        return self.doc['capture']['records']

    def payload(self, field, value=DELETE):
        targets = [self.doc['payload']]
        envelope = self.doc['capture']['envelope']
        if envelope.get('payload_ref') is None:
            targets.append(envelope['payload'])
        for target in targets:
            if value is DELETE:
                target.pop(field, None)
            else:
                target[field] = copy.deepcopy(value)
        if field in ('project_id', 'run_id', 'thread_id', 'attempt_id') and field in envelope:
            if value is DELETE:
                del envelope[field]
            else:
                envelope[field] = copy.deepcopy(value)
        path = self.adapter['joins'].get(field)
        if path is not None:
            slot, _, *rest = path.split('.')
            self.body(slot, '.'.join(rest), value)
        refs = self.doc['capture']['dependency_refs']
        if value is DELETE and field in refs:
            self.doc['capture']['dependencies'].pop(refs.pop(field), None)
        return self

    def body(self, slot, path, value=DELETE):
        target = self.records[slot]['body']
        parts = path.split('.')
        for part in parts[:-1]:
            target = target[part]
        if value is DELETE:
            target.pop(parts[-1], None)
        else:
            target[parts[-1]] = copy.deepcopy(value)
        self.dirty.add(slot)
        return self

    def set(self, path, value=DELETE):
        """A capture-document field outside payload and record bodies, by mutate() path."""
        change = {'path': path, 'delete': True} if value is DELETE else {'path': path, 'value': copy.deepcopy(value)}
        self.doc = sem.mutate(self.doc, [change])
        return self

    def finish(self):
        for slot in sorted(self.dirty):
            self.records[slot]['sha256'] = sem.digest(self.records[slot]['body'])
        if 'transition' in self.doc['capture']:
            self.doc['capture']['transition']['observed_payload'] = sem.source_observation(self.adapter, self.records)
        return self.doc


def custody_add(doc, edition, family, payload, contract, entry=lambda e: e):
    """An authenticated custody entry for a new complete original under its write-time recipe.

    entry may rewrite the entry (a forged custody fact) or return None (no custody entry at all).
    """
    token = sem._RECIPE.set(edition)
    try:
        sha = sem.digest(doc)
        identity = list(con.identity(contract, payload, doc['capture']['scope']['storage_instance_id']))
    finally:
        sem._RECIPE.reset(token)
    made = entry({'recipe_version': edition, 'family': family, 'source_sha256': sha, 'stored_identity': identity,
                  'write_time_edition': EDITION})
    # One complete original has one authenticated custody entry: a witness whose original equals another's
    # (or an existing entry's) would silently re-authenticate it under another edition.
    if sha in ADDED or sha in BASE_CUSTODY:
        raise RuntimeError('custody entry collision for original ' + sha)
    if made is not None:
        ADDED[sha] = made
    return sha


CASES = []


def add(case_id, family, route, seed, expected, row=None, defect='', **extra):
    CASES.append(dict(id=case_id, family=family, route=route, seed=seed, expected=expected, row=row, defect=defect, **extra))


def capture_case(case_id, family, seed_name, edit, row, defect, expected='reject'):
    seed = sem.mutate(FAMILIES[family]['baseline'], next(r for r in FAMILIES[family]['cases'] if r['case'] == seed_name)['changes']) \
        if seed_name != 'baseline' else copy.deepcopy(FAMILIES[family]['baseline'])
    doc = edit(Capture(family, copy.deepcopy(seed))).finish()
    add(case_id, family, 'capture', {'kind': 'capture', 'name': seed_name}, expected, row, defect, changes=diff(seed, doc))


def history_case(case_id, family, seed_name, edit, row, defect, expected='reject', custody=None, entry=lambda e: e):
    """edit(history doc) -> doc; custody: the write-time edition that authenticates a changed original."""
    case = next(r for r in FAMILIES[family]['history_cases'] if r['case'] == seed_name)
    seed = {'original': sem.mutate(FAMILIES[family]['baseline'], case['original_changes']),
            'payload': {**copy.deepcopy(FAMILIES[family]['baseline']['payload']), **case['event_changes']},
            'retained_source_sha256': case.get('retained_source_sha256', FAMILIES[family]['retained_source_sha256']),
            'disclosure': copy.deepcopy(case['disclosure'])}
    doc = copy.deepcopy(seed)
    doc = edit(doc)
    if custody is not None:
        doc['retained_source_sha256'] = custody_add(doc['original'], custody, family, doc['payload'], CONTRACTS[family], entry)
    add(case_id, family, 'history', {'kind': 'history', 'name': seed_name}, expected, row, defect, changes=diff(seed, doc))


def shape_case(case_id, family, seed_name, edit, row, defect, expected='reject'):
    seed = copy.deepcopy(next(r for r in SHAPES if r['event_type'] == family and r['case'] == seed_name))
    doc = edit(copy.deepcopy(seed))
    add(case_id, family, 'shape', {'kind': 'shape', 'name': seed_name}, expected, row, defect, changes=diff(seed, doc))


def edit_original(doc, edit):
    original = Capture(doc_family(doc), doc['original'])
    edit(original)
    doc['original'] = original.finish()
    return doc


def literal(case_id, family, route, value, expected, row, defect, **extra):
    add(case_id, family, route, {'kind': 'literal', 'value': value}, expected, row, defect, **extra)


def referenced(family):
    return sem.mutate(FAMILIES[family]['baseline'], next(r for r in FAMILIES[family]['cases'] if r['case'] == 'F6-large-referenced-source-positive')['changes'])


def doc_family(doc):
    return doc['original']['capture']['family']


# ============================================================================ capture-route witnesses
def build():
    AC = 'attempt.completed'
    capture_case('AP02-append-once-policy', AC, 'baseline', lambda c: c.set('capture/envelope/replay_policy', 'append_once'),
                 'AP02_family_policy', 'current writer envelope replay_policy append_once (not the family dedupe policy)')
    capture_case('GR01-viewer-integer', AC, 'baseline', lambda c: c.set('capture/viewer', 7),
                 'GR01_subject_type', 'the reading viewer is the integer 7, not a string')
    capture_case('GR02-viewer-empty', AC, 'baseline', lambda c: c.set('capture/viewer', ''),
                 'GR02_subject_nonempty', 'the reading viewer is the empty string')
    capture_case('EF01-effects-list', AC, 'baseline', lambda c: c.set('capture/post_state/effects', []),
                 'EF01_effects_object', 'committed post-state effects are a list, not an object')
    capture_case('EF04-effect-negative', AC, 'baseline', lambda c: c.set('capture/post_state/effects/worker_dispatches', -1),
                 'EF04_observed_nonnegative', 'one committed effect count is -1')
    capture_case('EF07-effect-count', AC, 'baseline', lambda c: c.set('capture/post_state/effects/terminal_publications', 2),
                 'EF07_effects_equal', 'one committed effect count is 2 where the adapter commits 1')
    capture_case('RV02-revision-negative', AC, 'baseline',
                 lambda c: c.set('capture/records/project/revision', -1).set('capture/expected_revisions/project', -1),
                 'RV02_revision_nonnegative', 'the project record and its expected read both carry revision -1')
    capture_case('GJ02-node-graph-revision-0', AC, 'baseline', lambda c: c.body('node', 'workgraph_revision', 0),
                 'GJ02_node_revision_min', 'the node record names graph revision 0')
    capture_case('GJ04-run-graph-revision-0', AC, 'baseline', lambda c: c.body('run', 'workgraph_revision', 0),
                 'GJ04_run_revision_min', 'the run record names graph revision 0')
    NB = 'node.blocked'
    capture_case('NB03-restore-without-anchor', NB, 'baseline', lambda c: c.payload('anchor_ref'),
                 'NB03_restore_anchor', 'a restore-required block keeps its safe point but names no anchor_ref (every copy removed)')
    # ---- retry families
    BS, RS, BE = 'run.node_backoff_started', 'run.node_retry_scheduled', 'run.node_backoff_expired'
    capture_case('RT02-failure-class', BS, 'baseline', lambda c: c.body('failure', 'failure_class', 'rate_limited'),
                 'RT02_failure_class', 'the failure record alone names rate_limited')
    capture_case('RT09-prior-attempt', RS, 'baseline', lambda c: c.payload('prior_attempt_id', 'other-attempt-001'),
                 'RT09_prior_attempt', 'the event and its retry record name another prior attempt than the failure and attempt records')
    capture_case('RT04-used-string', BS, 'baseline', lambda c: c.body('retry', 'used', '0'),
                 'RT04_used_type', 'the retry counter is the string "0"')
    capture_case('RT05-count-string', BS, 'baseline', lambda c: c.body('failure', 'retry_count_before', '0'),
                 'RT05_count_type', 'the failure retry_count_before is the string "0"')
    capture_case('RF02-failure-storage-class', BS, 'baseline', lambda c: c.body('failure', 'storage_io_class', 'interrupted'),
                 'RF02_failure_storage_null', 'the provider_transient failure record alone names a Storage class')
    capture_case('RL02-limit-string', BS, 'baseline', lambda c: c.body('retry', 'limit', '3'),
                 'RL02_limit_type', 'the retry limit is the string "3"')
    capture_case('RK01-received-after-failure', BS, 'baseline', lambda c: c.body('failure', 'response_received_at_utc', '2026-11-04T12:00:00.5Z'),
                 'RK01_received_failed', 'the response is recorded after the failure')
    capture_case('RK03-scheduled-after-observation', BS, 'baseline',
                 lambda c: c.body('retry', 'scheduled_at_utc', '2026-11-04T12:00:00.5Z').body('failure', 'failed_at_utc', '2026-11-04T12:00:00Z'),
                 'RK03_scheduled_observed', 'the retry is scheduled after the observation that reports it')
    capture_case('RH01-header-integer', RS, 'rate-limit-original-Retry-After-delta-seconds',
                 lambda c: c.body('failure', 'retry_after_header', 30), 'RH01_header_type', 'the original Retry-After header is the integer 30')
    capture_case('RA03-refresh-before-failure', RS, 'classified-policy-auth_expired-retry-1',
                 lambda c: c.body('failure', 'refresh.completed_at_utc', '2026-11-04T11:59:59Z'),
                 'RA03_failed_refresh', 'the auth refresh completes before the failure')
    capture_case('RA05-rebuild-after-scheduling', RS, 'classified-policy-auth_expired-retry-1',
                 lambda c: c.body('failure', 'refresh.client_rebuilt_at_utc', '2026-11-04T12:00:02.5Z'),
                 'RA05_rebuild_scheduled', 'the client is rebuilt after the retry is scheduled')
    # ---- scheduler.pass
    SP = 'scheduler.pass'

    def lane_edit(c):
        selected = copy.deepcopy(c.doc['payload']['selected_nodes'])
        selected[0]['lane'] = 'normal'
        c.payload('selected_nodes', selected)
        return c.body('scheduler', 'selected_nodes', selected)
    capture_case('SH08-selected-lane', SP, 'baseline', lane_edit, 'SH08_lane',
                 'the selected node keeps its remediation score tuple but names lane normal (payload, operation and scheduler copies)')

    def partition_edit(c):
        excluded = copy.deepcopy(c.doc['payload']['non_selected_nodes'])
        excluded.append(copy.deepcopy(excluded[0]))
        return c.payload('non_selected_nodes', excluded)
    capture_case('SH03-duplicate-excluded', SP, 'baseline', partition_edit, 'SH03_unique_partition',
                 'one non-selected node is listed twice (payload and operation copies)')
    capture_case('WK01-wakes-object', SP, 'baseline', lambda c: c.body('scheduler', 'wakes', {}),
                 'WK01_wakes_list', 'the scheduler wake list is an object')
    capture_case('WK02-wake-string', SP, 'baseline', lambda c: c.body('scheduler', 'wakes', ['wake-001']),
                 'WK02_wake_objects', 'a scheduler wake is a string')
    capture_case('WK04-no-wake', SP, 'baseline',
                 lambda c: c.body('scheduler', 'wakes', []).payload('coalesced_wake_reasons', []).payload('wake_event_refs', []),
                 'WK04_wake_present', 'the scheduler pass records no wake (coalesced reasons and refs empty with it)')

    capture_case('RM05-generation-string', 'remediation.resolved', 'baseline', lambda c: c.body('lineage', 'generation', '1'),
                 'RM05_generation_type', 'the lineage generation is the string "1"')
    # ---- SP-337 reference route (seeded from each family's accepted referenced positive)
    REF = 'F6-large-referenced-source-positive'
    blake = referenced(AC)['capture']['envelope']['payload_ref']['blake3']
    capture_case('PR02-ref-string', AC, REF, lambda c: c.set('capture/envelope/payload_ref', 'payload:' + blake),
                 'PR02_descriptor_object', 'the payload_ref is a string, not a resolved descriptor')
    capture_case('PR04-ref-size-string', AC, REF, lambda c: c.set('capture/envelope/payload_ref/byte_size', str(
                 referenced(AC)['capture']['envelope']['payload_ref']['byte_size'])), 'PR04_size_type', 'the descriptor byte_size is a string')
    capture_case('PK01-pack-hex-invalid', AC, REF, lambda c: c.set(f'capture/payload_packs/{blake}/bytes_hex', 'zz'),
                 'PK01_hex_decodes', 'the pack bytes are not hex')
    capture_case('PK04-pack-size-string', AC, REF, lambda c: c.set(f'capture/payload_packs/{blake}/byte_size', str(
                 referenced(AC)['capture']['payload_packs'][blake]['byte_size'])), 'PK04_pack_size_type', 'the pack byte_size is a string')

    def other_bytes(c):
        from blake3 import blake3 as b3
        pack = copy.deepcopy(c.doc['capture']['payload_packs'][blake])
        stored = bytes.fromhex(pack['bytes_hex']) + b'\x00'
        other = b3(stored).hexdigest()
        pack.update(bytes_hex=stored.hex(), byte_size=len(stored))
        c.set(f'capture/payload_packs/{blake}')
        c.set(f'capture/payload_packs/{other}', pack)
        return c.set('capture/envelope/payload_ref/blake3', other)
    capture_case('PK06-pack-other-length', AC, REF, other_bytes, 'PK06_pack_size_ref',
                 'the descriptor names a pack whose own bytes, BLAKE3 and size agree but are one byte longer than the logical body')
    # ---- contract-route capture witnesses (a copy of the family contract with one adapter fact changed)
    add('EF05-adapter-effect-string', AC, 'capture', {'kind': 'capture', 'name': 'baseline'}, 'reject', 'EF05_expected_types',
        'the adapter effect terminal_publications is the string "1" (contract copy only)',
        changes=[], contract_changes=[{'path': 'semantic_adapter/effects/terminal_publications', 'value': '1'}])
    add('EF06-adapter-effect-negative', AC, 'capture', {'kind': 'capture', 'name': 'baseline'}, 'reject', 'EF06_expected_nonnegative',
        'the adapter effect worker_dispatches is -1 (contract copy only)',
        changes=[], contract_changes=[{'path': 'semantic_adapter/effects/worker_dispatches', 'value': -1}])
    # ---- retained-history witnesses
    S10 = 'S10-history-valid-after-live-transition'
    history_case('HI02-event-identity', AC, S10, lambda d: sem.mutate(d, [{'path': 'payload/event_sequence', 'value': 2}]),
                 'HI02_custody_identity', 'the retained read names event_sequence 2; the authenticated original identity is for 1')

    def marker(value):
        return lambda d: edit_original(d, lambda c: c.body('project', 'p2a_marker', value))
    history_case('RB-control-new-original', AC, S10, marker('rb-control'), None,
                 'a new current-recipe original (marked project record) with its own authenticated custody entry', expected='accept', custody=sem.CURRENT_RECIPE)
    history_case('RB01-unknown-edition', AC, S10, marker('rb01'), 'RB01_edition_known',
                 'the custody entry of a new original names the unknown recipe executor-v9', custody=sem.CURRENT_RECIPE,
                 entry=lambda e: {**e, 'recipe_version': 'executor-v9'})
    history_case('RB02-no-custody', AC, S10, marker('rb02'), 'RB02_retained_entry',
                 'a new original that Storage custody never authenticated', custody=sem.CURRENT_RECIPE, entry=lambda e: None)
    history_case('RB03-custody-source', AC, S10, marker('rb03'), 'RB03_entry_source',
                 'the custody entry of a new original pins a different complete original', custody=sem.CURRENT_RECIPE,
                 entry=lambda e: {**e, 'source_sha256': '0' * 64})
    history_case('DD01-replaced-resource', AC, S10, marker('dd01-resource'), 'DD01_retained_dispatch',
                 'custody pins a new original to other frozen payload-schema bytes than the installed resource (a replaced same-URI resource)',
                 custody=sem.CURRENT_RECIPE, entry=lambda e: {**e, 'resource_manifest_sha256': '1' * 64})
    history_case('DD01-foreign-family', AC, S10, marker('dd01-family'), 'DD01_retained_dispatch',
                 'custody authenticates a new original as node.started, read as attempt.completed',
                 custody=sem.CURRENT_RECIPE, entry=lambda e: {**e, 'family': 'node.started'})
    history_case('TS03-v0-impossible-date', BS, 'F15-retained-9007199254740991-dedupe_by_idempotency_key',
                 lambda d: edit_original(d, lambda c: c.body('failure', 'failed_at_utc', '2026-11-31T12:00:00Z')),
                 'TS03_parses', 'a retained v0 original whose failure clock is spelled validly but names 31 November',
                 custody=sem.RETAINED_RECIPE)
    # ---- shape oracle witnesses

    def shape_payload(field, value=DELETE):
        def edit(doc):
            for target in (doc['payload'], doc['context']['envelope']['payload']):
                if value is DELETE:
                    target.pop(field, None)
                else:
                    target[field] = copy.deepcopy(value)
            return doc
        return edit
    shape_case('SX01-node-state', 'node.completed', 'positive', lambda d: sem.mutate(d, [{'path': 'context/source_facts/node_state',
               'value': 'verify_pending'}]), 'SX01_node_completion', 'a done completion whose source node state is verify_pending')
    def restore(anchor):
        def edit(doc):
            shape_payload('requires_safe_point_restore', True)(doc)
            shape_payload('safe_point_id', 'safe_point_id-001')(doc)
            doc['context']['source_bindings']['safe_point_id'] = 'safe_point_id-001'
            if anchor:
                shape_payload('anchor_ref', 'anchor_ref-001')(doc)
            return doc
        return edit
    shape_case('SX11-control-restore-anchored', 'node.blocked', 'positive', restore(True), None,
               'a restore-required block naming its safe point (with its source binding) and anchor_ref', expected='accept')
    shape_case('SX11-restore-without-anchor', 'node.blocked', 'positive', restore(False), 'SX11_restore_anchor',
               'the anchored restore control without its anchor_ref')
    shape_case('PV02-lone-surrogate-bytes', AC, 'positive', shape_payload('node_id', '\ud800'), 'PV02_physical_other',
               'node_id is a lone surrogate (payload and inline copy), which has no UTF-8 MessagePack string')
    shape_seed = next(r for r in SHAPES if r['event_type'] == SP and r['case'] == 'score-priority-valid-boundary-50')
    excluded = copy.deepcopy(shape_seed['payload']['non_selected_nodes'])
    shape_case('SY02-duplicate-excluded', SP, 'score-priority-valid-boundary-50', shape_payload('non_selected_nodes', excluded + [excluded[0]]),
               'SY02_unique_partition', 'one non-selected node is listed twice')
    lane_selected = copy.deepcopy(shape_seed['payload']['selected_nodes'])
    lane_selected[0]['lane'] = 'normal'
    shape_case('SY07-selected-lane', SP, 'score-priority-valid-boundary-50', shape_payload('selected_nodes', lane_selected), 'SY07_lane',
               'the selected node keeps its remediation score tuple but names lane normal')
    # ---- helper, trace, route and recipe witnesses
    for case_id, parts, row in [('FL01-part-integer', [5], 'FL01_part_object'), ('FL02-part-keys', [{'text': 'a'}], 'FL02_part_keys'),
                                ('FL03-text-integer', [{'text': 1, 'repeat': 2}], 'FL03_text_type'),
                                ('FL04-repeat-string', [{'text': 'a', 'repeat': '2'}], 'FL04_repeat_type')]:
        literal(case_id, AC, 'helper', {'case': case_id, 'helper': 'fixture_literals', 'value': {'parts': parts}}, 'reject', row,
                'fixture repetition part ' + json.dumps(parts))
    literal('TO01-unknown-operation', AC, 'trace', {'case': 'TO01', 'operations': [{'op': 'teleport'}]}, 'reject', 'TO01_known_operation',
            'a trace operation the receipt model does not define')
    literal('TB01-rebuild-empty', AC, 'trace', {'case': 'TB01', 'operations': [{'op': 'rebuild'}]}, 'reject', 'TB01_rows_present',
            'a rebuild before any append has no first-receipt custody to rebuild from',
            expected_outputs={'outputs': ['source_unavailable'], 'effects': 0})
    literal('FR01-type-route', AC, 'type_route', {'case': 'FR01', 'route': 'wire', 'seed': 'baseline', 'changes': []}, 'reject',
            'FR01_type_route', 'a type case naming the unknown route wire')
    literal('FR02-numeric-boundary', AC, 'numeric', {'case': 'FR02', 'boundary': 'wire', 'spelling': '1'}, 'reject',
            'FR02_numeric_boundary', 'a numeric case naming the unknown boundary wire')
    literal('ID01-enum-identity-field', AC, 'identity', {'payload': FAMILIES[AC]['baseline']['payload'], 'storage_instance_id': 'store-001'},
            'reject', 'ID01_domain_declared', 'a contract copy whose identity fields add terminal_state, an enum with no declared type',
            contract_changes=[{'path': 'identity_fields', 'value': CONTRACTS[AC]['identity_fields'] + ['terminal_state']}])
    literal('IR02-sequence-not-identity', AC, 'identity_replay', {'payload': FAMILIES[AC]['baseline']['payload']}, 'reject', 'IR02_sequence_bearing',
            'a contract copy whose identity fields omit event_sequence',
            contract_changes=[{'path': 'identity_fields', 'value': [f for f in CONTRACTS[AC]['identity_fields'] if f != 'event_sequence']}])
    literal('CN03-nonfinite-spelling', AC, 'numeric', {'case': 'CN03', 'boundary': 'digest', 'spelling': 'NaN'}, 'reject',
            'CN03_json_other', 'the raw spelling NaN (a non-finite JSON constant)')
    literal('PV01-uint64-overflow', AC, 'numeric', {'case': 'PV01', 'boundary': 'payload_bytes', 'spelling': '18446744073709551616'}, 'reject',
            'PV01_integer_range', 'event_sequence 2^64: a valid schema integer with no EVENT_VALUE MessagePack integer')
    literal('JQ03-lone-surrogate-jcs', AC, 'canonical', {'json': '{"text": "\\ud800"}'}, 'reject', 'JQ03_jcs_other',
            'a JCS preimage string holding a lone surrogate')
    literal('PS02-control-stock-schema', AC, 'stock_schema', {'payload': FAMILIES[AC]['baseline']['payload']}, 'accept', None,
            'the family baseline payload under the stock format checker (a control for the isolated schema route)')
    literal('SR01-invalid-schema', AC, 'schema_document', {'schema': {'$schema': 'https://json-schema.org/draft/2020-12/schema', 'type': 5}},
            'reject', 'SR01_meta_schema', 'a schema document whose type keyword is the integer 5')
    # ---- CLI fixture-integrity witnesses
    fams = sorted(CONTRACTS)
    literal('IF01-closure-missing-family', 'attempt.completed', 'integrity_closure',
            {'fixture_families': fams[1:], 'contract_families': fams}, 'reject', 'IF01_family_closure', 'the fixture families omit one contract family')
    tcase = copy.deepcopy(json.loads((ROOT / 'Plans/executor_event_type_fixtures.json').read_text())['families'][AC][0])
    tcase['changes'] = tcase['changes'] * 2
    literal('IF02-type-two-changes', AC, 'integrity_type_case', tcase, 'reject', 'IF02_single_change', 'a type case with two changes')
    seeded = copy.deepcopy(next(r for r in RAW_FAMILIES[NB]['cases'] if r['case'] == 'F10-restore-required-without-anchors-coherently'))
    seeded['defect_changes'] = seeded['defect_changes'][1:]
    literal('IF03-capture-seed-incoherent', NB, 'integrity_capture_seed', seeded, 'reject', 'IF03_capture_seed',
            'a coherent negative whose declared defect changes omit one of its changes')
    disclosed = copy.deepcopy(next(r for f in RAW_FAMILIES.values() for r in f.get('history_cases', []) if 'seed_disclosure' in r))
    disclosed['disclosure_changes'] = disclosed['disclosure_changes'][1:]
    literal('IF04-disclosure-seed-incoherent', AC, 'integrity_disclosure_seed', disclosed, 'reject', 'IF04_disclosure_seed',
            'a disclosure negative whose declared changes omit one change')
    shaped = copy.deepcopy(next(r for r in RAW_SHAPES if 'seed' in r and r['event_type'] == AC))
    shaped['defect_changes'] = []
    literal('IC08-shape-seed-incoherent', AC, 'integrity_shape_seed', shaped, 'reject', 'IC08_shape_seed',
            'a shape negative whose declared defect changes are empty')
    golden = copy.deepcopy(next(r for r in RAW_FAMILIES[AC]['numeric_cases'] if 'expected_value' in r and r['boundary'] == 'digest'))
    golden['expected_value'] = '0' * 64
    literal('IF05-numeric-golden', AC, 'integrity_numeric', golden, 'reject', 'IF05_numeric_golden', 'a numeric golden digest that is not the recomputed digest')
    literal('IC01-fifteen-families', AC, 'integrity_contract_set', {'event_types': fams[1:]}, 'reject', 'IC01_family_count', 'fifteen contract families')
    literal('IC02-duplicate-family', AC, 'integrity_contract_set', {'event_types': fams[1:] + [fams[1]]}, 'reject', 'IC02_unique_families',
            'sixteen contracts naming one family twice')
    literal('IC03-admitted-family', AC, 'contract_integrity', {'admitted': [AC]}, 'reject', 'IC03_unadmitted', 'the registry admits the drafted family')
    literal('IC05-open-schema', AC, 'contract_integrity', {}, 'reject', 'IC05_closed_schema',
            'a contract copy whose schema_ref names a schema without additionalProperties false',
            contract_changes=[{'path': 'schema_ref', 'value': 'Plans/executor_event_source_proofs.schema.json'}])
    literal('IC06-no-accepted-shape', AC, 'contract_integrity', {'keep_expected': ['reject']}, 'reject', 'IC06_accept_fixture',
            'the family shape fixtures without their accepted cases')
    literal('IC07-no-rejected-shape', AC, 'contract_integrity', {'keep_expected': ['accept']}, 'reject', 'IC07_reject_fixture',
            'the family shape fixtures without their rejected cases')
    literal('IT01-swapped-requires', AC, 'integrity_table_order', {'phase': 'transport_storage', 'swap': [0, 1]}, 'reject', 'IT01_require_order',
            'a factory check() that requires its two rows in swapped order')
    build_p2b()


def lower_t(text):
    return text[:10] + 't' + text[11:]


def edit_dependency(c, ref, field, value):
    """Change one field of a stored dependency body and recompute its declared digest (an uncatalogued new body)."""
    dependency = c.doc['capture']['dependencies'][ref]
    dependency['body'][field] = value
    dependency['sha256'] = sem.digest(dependency['body'])
    return c


# ============================================================================ sweep part 2B: CV-1101 date-time witnesses
def build_p2b():
    """Witnesses for the shared CV-1101 date_time adoption, the F19 field-owner profile and the RFC 9110 Retry-After.

    Each is built like the part 2A witnesses: a named valid seed of its own family, one changed fact with every copy
    moved and every changed owner record rehashed, kept only when the complete checker refuses it at exactly its row
    (a control: accepts it).
    """
    AC, SP, NS = 'attempt.completed', 'scheduler.pass', 'node.started'
    BS, BE = 'run.node_backoff_started', 'run.node_backoff_expired'

    # ---- F19: ordinary scheduler clocks admit a lowercase t (CV-515); backoff clock observations do not.
    def ready_lower(c):
        ready = copy.deepcopy(c.doc['payload']['ready_nodes'])
        for node in ready:
            node['ready_since_utc'] = lower_t(node['ready_since_utc'])
        selected = copy.deepcopy(c.doc['payload']['selected_nodes'])
        for item in selected:
            item['score_tuple']['ready_since_utc'] = lower_t(item['score_tuple']['ready_since_utc'])
        c.payload('ready_nodes', ready).payload('selected_nodes', selected)
        return c.body('scheduler', 'selected_nodes', selected)
    capture_case('F19-control-ready-since-lower-t', SP, 'baseline', ready_lower, None,
                 'every copy of every ready-since clock (ready nodes, selected score tuples, operation and scheduler records) '
                 'spelled with a lowercase t', expected='accept')

    def wakes(edit):
        def apply(c):
            listed = copy.deepcopy(c.records['scheduler']['body']['wakes'])
            edit(listed)
            return c.body('scheduler', 'wakes', listed)
        return apply

    def all_lower(listed):
        for wake in listed:
            wake['recorded_at_utc'] = lower_t(wake['recorded_at_utc'])
    capture_case('F19-control-wakes-lower-t', SP, 'baseline', wakes(all_lower), None,
                 'both scheduler wake clocks (prerequisite_resolved, capacity_available) spelled with a lowercase t', expected='accept')

    def first_leap(listed):
        listed[0]['recorded_at_utc'] = '2016-12-31T23:59:60Z'
    capture_case('TC04-wake-announced-leap-second', SP, 'baseline', wakes(first_leap), 'TC04_owner_no_leap_second',
                 'the first wake clock is the announced leap second 2016-12-31T23:59:60Z, which the shared storage_utc_z profile '
                 'admits and the DX owner profile refuses (still the earliest wake)')

    def shape_ready_lower(doc):
        for target in (doc['payload'], doc['context']['envelope']['payload']):
            for node in target['ready_nodes']:
                node['ready_since_utc'] = lower_t(node['ready_since_utc'])
            for item in target['selected_nodes']:
                item['score_tuple']['ready_since_utc'] = lower_t(item['score_tuple']['ready_since_utc'])
        return doc
    shape_case('F19-shape-control-ready-since-lower-t', SP, 'score-priority-valid-boundary-50', shape_ready_lower, None,
               'every ready-since clock of the payload and its inline envelope copy spelled with a lowercase t', expected='accept')
    shape_case('TC05-shape-backoff-now-lower-t', BE, 'positive',
               lambda d: sem.mutate(d, [{'path': 'context/now_utc', 'value': lower_t(d['context']['now_utc'])}]),
               'TC05_backoff_upper_t', 'the backoff-expiry observation now_utc spelled with a lowercase t')
    score_seed = next(r for r in SHAPES if r['event_type'] == SP and r['case'] == 'score-priority-valid-boundary-50')['payload']
    score_doc = {'ready_nodes': copy.deepcopy(score_seed['ready_nodes']), 'selected_nodes': copy.deepcopy(score_seed['selected_nodes'])}
    literal('F19-score-control-lower-t', SP, 'score', shape_ready_lower({'payload': copy.deepcopy(score_doc),
                                                                         'context': {'envelope': {'payload': copy.deepcopy(score_doc)}}})['payload'],
            'accept', None, 'ready and selected score tuples whose ready-since clocks use a lowercase t')

    # ---- SP-1101: a retained original's date-time profile is its authenticated edition's frozen resource
    v0_seed = 'F15-retained-9007199254740991-dedupe_by_idempotency_key'

    def failed_at(value):
        return lambda d: edit_original(d, lambda c: c.body('failure', 'failed_at_utc', value))
    history_case('TS-control-v0-zero-offset', BS, v0_seed, failed_at('2026-11-04T12:00:00+00:00'), None,
                 'a retained v0 original whose failure clock is the same instant written with the zero offset +00:00, '
                 'valid under the frozen v0 spelling', expected='accept', custody=sem.RETAINED_RECIPE)
    history_case('TC02-current-edition-lowercase-z', BS, v0_seed, failed_at('2026-11-04T12:00:00z'), 'TC02_shared_utc_z',
                 'an original authenticated under the current edition whose failure clock ends in a lowercase z (valid v0 '
                 'spelling): the dispatcher selects the CV-1101 profile, which requires a terminal uppercase Z', custody=sem.CURRENT_RECIPE)
    history_case('TS-control-v0-lowercase-z', BS, v0_seed, failed_at('2026-11-04T12:00:00.0z'), None,
                 'a retained v0 original whose failure clock ends in a lowercase z, valid under the frozen v0 spelling',
                 expected='accept', custody=sem.RETAINED_RECIPE)
    history_case('TS01-v0-space-separator', BS, v0_seed, failed_at('2026-11-04 12:00:00Z'), 'TS01_spelling',
                 'a retained v0 original whose failure clock uses a space separator, outside the frozen v0 spelling',
                 custody=sem.RETAINED_RECIPE)

    # ---- the owner clock rows at their helper boundary
    for case_id, helper, value, expected, row, defect in [
            ('TC-control-helper-lower-t', 'instant', '2026-11-04t12:00:00Z', 'accept', None, 'an ordinary owner clock with a lowercase t'),
            ('TC-control-helper-year-0000', 'instant', '0000-02-29T12:00:00Z', 'accept', None,
             'year 0000 (a Gregorian leap year) at an ordinary owner clock, which no host datetime can hold'),
            ('TC-control-helper-long-fraction', 'backoff_instant', '2026-11-04T12:00:00.' + '1' * 5001 + 'Z', 'accept', None,
             'a backoff clock with 5,001 fractional digits'),
            ('TC04-helper-announced-leap-second', 'instant', '2016-12-31T23:59:60Z', 'reject', 'TC04_owner_no_leap_second',
             'the announced leap second 2016-12-31T23:59:60Z at an ordinary owner clock'),
            ('TC05-helper-backoff-lower-t', 'backoff_instant', '2026-11-04t12:00:00Z', 'reject', 'TC05_backoff_upper_t',
             'a backoff clock observation with a lowercase t'),
            ('TC03-helper-unannounced-leap-second', 'instant', '2026-06-30T23:59:60Z', 'reject', 'TC03_shared_calendar',
             'second 60 at a month end where no leap second was announced'),
            ('TC02-helper-zero-offset', 'instant', '2026-11-04T12:00:00+00:00', 'reject', 'TC02_shared_utc_z',
             'the zero offset +00:00 where the owner requires a terminal Z'),
            ('TC01-helper-trailing-LF', 'instant', '2026-11-04T12:00:00Z\n', 'reject', 'TC01_shared_syntax', 'a trailing LF')]:
        literal(case_id, AC, 'helper', {'case': case_id, 'helper': helper, 'value': value}, expected, row, defect)

    # ---- the frozen v0 rows at their helper boundary (no retained rate_limited original is modelled)
    for case_id, helper, value, expected, row, defect in [
            ('RA-control-v0-numeric-zone', 'retry_after_date_v0', 'Wed, 04 Nov 2026 12:00:05 +0000', 'accept', None,
             'a numeric-zone Retry-After, which the frozen v0 route parsed and still reads (10a: no tightening of history)'),
            ('RA01-v0-not-a-date', 'retry_after_date_v0', 'not-a-header', 'reject', 'RA01_date_parses', 'a v0 Retry-After that is no date'),
            ('RA02-v0-naive-date', 'retry_after_date_v0', 'Wed, 04 Nov 2026 12:00:30', 'reject', 'RA02_date_timezone',
             'a v0 Retry-After date without a zone'),
            ('TS-control-v0-helper-offset', 'instant_v0', '2026-11-04t17:00:00+05:00', 'accept', None,
             'a v0 clock with a lowercase t and a +05:00 offset, valid under the frozen v0 spelling')]:
        literal(case_id, AC, 'helper', {'case': case_id, 'helper': helper, 'value': value}, expected, row, defect)

    # ---- the strict payload-schema boundary (the registered format predicate)
    def payload_with(field, value):
        return {'payload': {**copy.deepcopy(FAMILIES[AC]['baseline']['payload']), field: value}}
    literal('PS01-ts-announced-leap-second', AC, 'schema', payload_with('ts', '2016-12-31T23:59:60Z'), 'reject', 'PS01_payload_schema',
            'payload ts is the announced leap second 2016-12-31T23:59:60Z (its pattern admits it; the registered predicate refuses it)')
    literal('PS01-control-ts-lower-t', AC, 'schema', payload_with('ts', '2026-11-04t12:00:00Z'), 'accept', None,
            'payload ts with a lowercase t under the strict schema boundary')

    # ---- an other owner's format date-time keeps that owner's RFC 3339 profile (execution_unit_context.schema.json)
    ref = FAMILIES[NS]['baseline']['capture']['dependency_refs']['execution_unit_context_ref']
    capture_case('DS-control-context-created-offset', NS, 'baseline',
                 lambda c: edit_dependency(c, ref, 'created_at_utc', '2026-11-04T17:00:00+05:00'), None,
                 'the execution context dependency\'s created_at_utc with a +05:00 offset, valid RFC 3339 for that schema', expected='accept')
    capture_case('DS01-context-created-no-zone', NS, 'baseline',
                 lambda c: edit_dependency(c, ref, 'created_at_utc', '2026-11-04T12:00:00'), 'DS01_context_schema',
                 'the execution context dependency\'s created_at_utc without a zone')

    # ---- Retry-After: RFC 9110 HTTP-date (EP-032), each from the accepted IMF-fixdate case, same instant where it parses
    seed = 'rate-limit-original-Retry-After-http-date'
    for case_id, header, expected, row, defect in [
            ('RG-control-rfc850-date', 'Wednesday, 04-Nov-26 12:00:05 GMT', 'accept', None, 'the same instant as an rfc850-date'),
            ('RG-control-asctime-date', 'Wed Nov  4 12:00:05 2026', 'accept', None, 'the same instant as an asctime-date'),
            ('RG01-numeric-zone', 'Wed, 04 Nov 2026 12:00:05 +0000', 'reject', 'RG01_http_date_grammar', 'a numeric zone +0000 instead of GMT'),
            ('RG01-no-weekday', '04 Nov 2026 12:00:05 GMT', 'reject', 'RG01_http_date_grammar', 'no day name'),
            ('RG01-one-digit-day', 'Wed, 4 Nov 2026 12:00:05 GMT', 'reject', 'RG01_http_date_grammar', 'a one-digit day in IMF-fixdate'),
            ('RG01-two-digit-year', 'Wed, 04 Nov 26 12:00:05 GMT', 'reject', 'RG01_http_date_grammar', 'a two-digit year in IMF-fixdate'),
            ('RG01-lowercase-gmt', 'Wed, 04 Nov 2026 12:00:05 gmt', 'reject', 'RG01_http_date_grammar', 'lowercase gmt (HTTP-date is case sensitive)'),
            ('RG02-31-november', 'Wed, 31 Nov 2026 12:00:05 GMT', 'reject', 'RG02_http_date_calendar', 'an IMF-fixdate naming 31 November')]:
        capture_case(case_id, BS, seed, lambda c, header=header: c.body('failure', 'retry_after_header', header), row,
                     'the original Retry-After header: ' + defect, expected=expected)


build()


def emit():
    return {'schema_id': 'pm.dx.sweep_p2a_witnesses.v1',
            'authority': 'Static single-defect witnesses for the DX guard tables; each names its valid seed and target row.',
            'cases': CASES}


def verify(doc):
    import pm_executor_p2a_cases as p2a
    failures, count = p2a.run(doc, CONTRACTS, FAMILIES, SHAPES, EXISTING, ROOT)
    return failures, count


def main():
    check = '--check' in sys.argv[1:]
    doc = emit()
    failures, count = verify(doc)
    custody = dict(CUSTODY_DOC)
    custody['records'] = {**BASE_CUSTODY, **ADDED}
    custody['resource_manifests'] = MANIFESTS
    problems = list(failures)
    if check:
        if not OUT.exists() or json.loads(OUT.read_text()) != doc:
            problems.append('stale ' + OUT.name)
        if json.loads(CUSTODY.read_text()) != custody:
            problems.append('stale ' + CUSTODY.name)
    elif not failures:
        OUT.write_text(json.dumps(doc, indent=2) + '\n')
        CUSTODY.write_text(json.dumps(custody, indent=2) + '\n')
    print(json.dumps({'status': 'fail' if problems else 'pass', 'witnesses': count, 'custody_added': len(ADDED),
                      'problems': problems}, indent=1))
    return 1 if problems else 0


if __name__ == '__main__':
    raise SystemExit(main())
