"""W3G phase-2 complete checker (stream E, wave 3; ATS-1260..1263; CV/SP-1500..1518).

Synthetic reference checks of the 19 prepared W3G owner contracts. No native execution, admission or
durability proof: native owner facts are synthetic oracle facts (pm_w3g_spec), never native results.

Every refusal is decided only by the Method B guard rows of scripts/pm_w3g_table_<phase>.py, generated
by scripts/pm-w3g-table-generate.py from the row specification in this module (ROWS, py_rows, fx_rows),
evaluated in declared order on an observation derived from the complete boundary input (the world:
native original, owner issuance, stored EventRecord and SP-337 pack, Storage-issued metadata and first
receipt, independent request, writer, reader, checkpoint and restore state). The derivation code
computes observations; it never decides acceptance.

Shared foundations (never re-implemented here):
- numbers: pm_event_numbers (CV-1100, SP-1100, SP-1101): current_integer, storage_uint64,
  current_append_policy, producer_semantic_bytes/_digest, qualified_jcs, storage_value_bytes,
  decode_storage_value, full_value_commitment, verify_payload_bytes, RecipeTuple, OriginalBinding,
  OriginalCustody, FrozenRecipe and RetainedDispatcher;
- timestamps: pm_event_datetime.date_time with the explicit owner profile per field (CV-1101:
  EventRecord occurred_at_utc broad `event_record`; CV-253 Storage observed_at_utc, persisted_at_utc
  and the SP-347 receipt acknowledged_at_utc strict `storage_utc_z`). datetime_validator and the
  inventory gate run at batch-3 integration (SWEEP-P2B addendum 2).
- schema resources: Plans/event_authority_w3g/schema_resources.json (closed offline map, SHA-256 pinned).
"""
import copy
import hashlib
import importlib
import json
import re
import sys
from contextlib import contextmanager
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from blake3 import blake3  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402
from referencing import Registry, Resource  # noqa: E402
from referencing.exceptions import Unresolvable  # noqa: E402
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, FrozenRecipe, OriginalBinding, OriginalCustody, RecipeTuple, Refusal, RetainedDispatcher,
    current_append_policy, current_integer, decode_storage_value, full_value_commitment, producer_semantic_bytes,
    producer_semantic_digest, storage_uint64, storage_value_bytes, verify_payload_bytes,
)
import pm_w3g_spec as spec  # noqa: E402

INLINE_LIMIT = 16384
MEDIA = 'application/msgpack'
CONTRACTS = json.loads((ROOT / 'Plans/event_authority_w3g/contracts.json').read_text())
FAM = {row['event_type']: row for row in CONTRACTS['families']}
FAMILIES = tuple(sorted(FAM))
SCOPES = {f: ('project', 'application') if FAM[f]['scope_policy'] == 'application_or_project' else ('project',)
          for f in FAMILIES}
PRODUCER = {f: FAM[f]['emitter'].split(' ')[0] for f in FAMILIES}
SOURCE_SCHEMA = {f: {s: (refs[0], '1.0.0') for s, refs in FAM[f]['source_schema_refs'].items() if refs} for f in FAMILIES}
SUBJECT = {f: next(iter(spec.PAYLOAD[f])) for f in FAMILIES}
RESOURCES = json.loads((ROOT / 'Plans/event_authority_w3g/schema_resources.json').read_text())
CHECKPOINT_SCHEMA = json.loads((ROOT / 'Plans/event_record_index_checkpoint.schema.json').read_text())
READ_TOKEN_FIELDS = tuple(CHECKPOINT_SCHEMA['$defs']['read_token']['required'])
DURABLE_TOKEN_FIELDS = tuple(k for k in READ_TOKEN_FIELDS if k != 'redb_snapshot_id')
INSTANCE = '6f1d2c3a-5b7e-4c1d-8e2f-000000000001'
PROJECT = 'proj-alpha'
SERVER = 'server-1'
COMPUTER = 'computer-1'
THREAD = 'thread-1'
OCCURRED = '2026-11-05T10:00:00.250Z'
OBSERVED = '2026-11-05T10:00:01Z'
PERSISTED = '2026-11-05T10:00:01.5Z'
ACKED = '2026-11-05T10:00:02Z'
REF_GRAMMAR = re.compile(r'[^\x00-\x1f\x7f]+')
HEX64 = re.compile(r'[0-9a-f]{64}')
APP_KEY = re.compile(r'application@1:((?:[0-9a-f]{2})+):((?:[0-9a-f]{2})+)')
LEGACY = 'legacy'


# --- closed schema registry ------------------------------------------------------------------------
def _read(path):
    return json.loads((ROOT / path).read_text())


def _discover():
    """Offline discovery (schema_resources.json offline_discovery): every Plans/**/*.schema.json under its actual $id and
    its filename retrieval URI https://puppetmaster.local/<path>. uri -> {sha256: ({paths}, doc)} (identical bytes
    under several paths are one resource)."""
    index = {}
    for path in sorted((ROOT / 'Plans').rglob('*.schema.json')):
        raw = path.read_bytes()
        try:
            doc = json.loads(raw)
        except ValueError:
            continue
        rel = path.relative_to(ROOT).as_posix()
        sha = hashlib.sha256(raw).hexdigest()
        uris = {'https://puppetmaster.local/' + rel}
        if type(doc) is dict and type(doc.get('$id')) is str:
            uris.add(doc['$id'])
        for uri in uris:
            entry = index.setdefault(uri, {}).setdefault(sha, (set(), doc))
            entry[0].add(rel)
    for res in RESOURCES['resources']:     # the hash-pinned seeds and their declared retrieval URIs
        raw = (ROOT / res['path']).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == res['sha256'], ('schema resource drift', res['path'])
        for uri in res['retrieval_uris']:
            index.setdefault(uri, {}).setdefault(res['sha256'], (set(), json.loads(raw)))[0].add(res['path'])
    return index


INDEX = _discover()


def _owner_pins():
    """uri -> {(path, sha256)} from the existing owners' canonical resource maps (Plans/*schema_resources*.json, other
    than this lane's companion). They disambiguate a discovered URI that more than one Plans file claims."""
    pins = {}
    for path in sorted((ROOT / 'Plans').glob('*schema_resources*.json')):
        doc = json.loads(path.read_text())
        for r in doc.get('resources', []):
            uris = r.get('retrieval_uris') or ([r['retrieval_uri']] if 'retrieval_uri' in r else [])
            for uri in uris:
                pins.setdefault(uri, set()).add((r['path'], r.get('sha256')))
    return pins


OWNER_PINS = _owner_pins()


class ClosureRefused(Exception):
    pass


def _retriever(excluded, got):
    def retrieve(uri):
        found = {sha: v for sha, v in INDEX.get(uri, {}).items() if v[0] - set(excluded)}
        if len(found) > 1:
            # Ambiguous bytes under one URI: resolve only when the existing owner pins agree on exactly one SHA-256 and
            # those exact bytes are a discovered candidate; otherwise refuse (offline_discovery: no guessing). A pin
            # selects bytes, not a path: PIN_DRIFT lists every pinned path whose current bytes differ.
            pinned = {h for _p, h in OWNER_PINS.get(uri, set())}
            choice = {sha: v for sha, v in found.items() if sha in pinned}
            found = choice if len(pinned) == 1 and len(choice) == 1 else found
        if len(found) != 1:
            raise ClosureRefused(('missing' if not found else 'ambiguous', uri, sorted(sorted(v[0]) for v in found.values())))
        got[uri] = Resource.from_contents(next(iter(found.values()))[1])
        return got[uri]
    return retrieve


def selected_roots():
    """Every selected schema/selector of the 19 contracts: payload selectors, source selections (current and
    historical) and the EventRecord envelope."""
    roots = [('https://puppetmaster.local/' + ENVELOPE_PATH, '')]
    for f in FAMILIES:
        doc = json.loads((ROOT / FAM[f]['payload_path']).read_text())
        for name in doc['$defs']:
            roots.append((doc['$id'], '#/$defs/' + name))
        refs = [r for v in FAM[f]['source_schema_refs'].values() for r in v]
        refs += [v for k, v in FAM[f].get('historical_source_schema_refs', {}).items() if k != 'selection_rule']
        for ref in refs:
            path, frag = ref.split('#', 1)
            roots.append(('https://puppetmaster.local/' + path, '#' + frag))
    return roots


_CLOSURE = {}


def closure(excluded=()):
    """Eager traversal of every $ref and branch reachable from the selected roots, including branches no fixture
    visits (check 9). Returns (ok, resources) where resources is the closed {uri: Resource} map; a missing,
    ambiguous or unresolved reachable resource fails closed (no network)."""
    key = tuple(sorted(excluded))
    if key in _CLOSURE:
        return _CLOSURE[key]
    got = {}
    registry = Registry(retrieve=_retriever(set(excluded), got))
    seen = set()
    try:
        for uri, frag in selected_roots():
            resolved = registry.resolver().lookup(uri + frag)
            stack = [(resolved.contents, resolved.resolver)]
            while stack:
                node, resolver = stack.pop()
                if isinstance(node, dict):
                    if id(node) in seen:
                        continue
                    seen.add(id(node))
                    if type(node.get('$id')) is str:
                        resolver = resolver.in_subresource(Resource.from_contents(node))
                    if '$ref' in node:
                        target = resolver.lookup(node['$ref'])
                        stack.append((target.contents, target.resolver))
                    for k, v in node.items():
                        if k not in ('const', 'enum', 'examples', 'default'):
                            stack.append((v, resolver))
                elif isinstance(node, list):
                    stack.extend((x, resolver) for x in node)
        result = (True, dict(got))
    except (Unresolvable, ClosureRefused):
        result = (False, None)
    _CLOSURE[key] = result
    return result


def reference_closure(excluded):
    return closure(tuple(excluded))[0]


def resource_registry():
    ok, resources = closure(())
    assert ok, 'the shipped W3G schema closure does not resolve'
    return Registry().with_resources(list(resources.items()))   # closed: no retrieve callback


def pin_drift():
    """Owner resource-map pins in the W3G closure whose named path no longer holds the pinned bytes (integration
    items for those owners; the closure resolves such a URI only by the pinned bytes, never by the drifted path)."""
    out = []
    for uri in sorted(closure(())[1]):
        for path, sha in sorted(OWNER_PINS.get(uri, set())):
            current = hashlib.sha256((ROOT / path).read_bytes()).hexdigest() if (ROOT / path).exists() else None
            if current != sha:
                out.append(dict(uri=uri, pinned_path=path, pinned_sha256=sha, current_sha256=current,
                                pinned_bytes_at=sorted(INDEX.get(uri, {}).get(sha, (set(), None))[0])))
    return out


def resolve_symbolic(ref, registry_doc):
    """N2: Plans/storage_value_registry.json#/families/<family_id>/value_schema resolves by exact unique family_id in
    the families array; missing or duplicate ids refuse; never a JSON Pointer array position."""
    m = re.fullmatch(r'Plans/storage_value_registry\.json#/families/([^/]+)/value_schema', ref)
    if m is None:
        raise ClosureRefused(('not_symbolic', ref))
    rows = [r for r in registry_doc['families'] if r.get('family_id') == m.group(1)]
    if len(rows) != 1:
        raise ClosureRefused(('missing' if not rows else 'duplicate', m.group(1)))
    return rows[0]['value_schema']


ENVELOPE_PATH = 'Plans/event_record.schema.json'
ENVELOPE = _read(ENVELOPE_PATH)
REGISTRY = resource_registry()
V_ENVELOPE = Draft202012Validator(ENVELOPE, registry=REGISTRY)
SCHEMAS = {f: _read(FAM[f]['payload_path']) for f in FAMILIES}
SELECTOR = {f: {'project': 'ProjectPayloadV1', 'application': 'ApplicationPayloadV1'} for f in FAMILIES}
V_SELECTED = {(f, s): Draft202012Validator({'$ref': SCHEMAS[f]['$id'] + '#/$defs/' + SELECTOR[f][s]}, registry=REGISTRY)
              for f in FAMILIES for s in SCOPES[f]}
V_SCOPE = Draft202012Validator({'$ref': 'https://puppetmaster.local/Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2'},
                               registry=REGISTRY)
CLOSURE_NEGATIVE_EXCLUSION = ('Plans/shared_integration_runtime.schema.json',)


def assert_schema_closure():
    """Check 9 for the shipped set: every reachable $ref resolves offline, no network fallback, and a resource set
    missing a reachable resource fails closed."""
    assert RESOURCES['network_fallback'] is False
    ok, resources = closure(())
    assert ok is True
    assert closure(CLOSURE_NEGATIVE_EXCLUSION)[0] is False
    for uri, res in resources.items():
        Draft202012Validator.check_schema(res.contents)
    return len(resources)


# --- recipes ------------------------------------------------------------------------------------------
def hx(text):
    return text.encode('utf-8').hex()


def partition_of(scope_kind, project_id):
    if scope_kind == 'application':
        return 'app'
    import base64
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


def event_id_of(instance, partition, f, operation):
    return f'w3g@1:{hx(instance)}:{hx(partition)}:{hx(f)}:{hx(operation)}'


def idempotency_key_of(f, scope_kind, server_id, operation):
    if scope_kind == 'application':
        return f'application@1:{hx(server_id)}:{hx(operation)}'   # CV-366 exactly
    return f'{f}@1:{hx(operation)}'


def payload_schema_id(f, scope_kind):
    d = SCHEMAS[f]['$defs'].get(SELECTOR[f][scope_kind])
    return d['properties']['schema_id']['const'] if d else f'pm.event_payload.{f}.application.v1'


def recipe_tuple(f, scope_kind, edition='current'):
    manifest = hashlib.sha256((ROOT / FAM[f]['payload_path']).read_bytes()
                              + (ROOT / 'Plans/event_record.schema.json').read_bytes()).hexdigest()
    producer = 'cv317-producer-jcs-cv1100' if edition == 'current' else 'cv317-producer-jcs-pre-cv1100'
    return RecipeTuple('pm.event.v0', '2.0.0', payload_schema_id(f, scope_kind), '1.0.0', PRODUCER[f], scope_kind,
                       'w3g-prepared-1', 'w3g@1', producer, EVENT_VALUE, 'cv339-original-event-value-commitment-v1',
                       'none', 'sp337-payload-v1-blake3-msgpack', manifest)


RECIPES = {(f, s, e): recipe_tuple(f, s, e) for f in FAMILIES for s in SCOPES[f] for e in ('current', LEGACY)}


@contextmanager
def exact_integer_digits():
    """CV-1100 sets no global cap: a 4,400-digit integer must reach a refusal row, never crash."""
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(previous)


def exact(value, expected):
    """Typed equality: bool is never a number, 1.0 is never 1, -0.0 is never 0.0, key sets and list order agree
    (JSON object member order is not semantic: canonical msgpack sorts keys)."""
    if type(value) is not type(expected):
        return False
    if type(expected) is dict:
        return value.keys() == expected.keys() and all(exact(value[k], v) for k, v in expected.items())
    if type(expected) is float:
        return value == expected and str(value) == str(expected)
    if type(expected) is list:
        return len(value) == len(expected) and all(exact(a, b) for a, b in zip(value, expected))
    return value == expected


def _ok(fn):
    """One observation clause: True only when it evaluates truthy; an exception never passes."""
    try:
        with exact_integer_digits():
            return bool(fn())
    except Exception:
        return False


def clock(value, profile):
    """The shared CV-1101 predicate accepts the exact string and returns it unchanged."""
    if type(value) is not str:
        return False
    try:
        return date_time(value, profile=profile) == value
    except Refusal:
        return False


def canonical_source(native):
    return storage_value_bytes(native, profile=EVENT_VALUE)


# --- world construction -------------------------------------------------------------------------------
def _scope(f, scope_kind):
    project = PROJECT if scope_kind == 'project' else None
    computer = COMPUTER if scope_kind == 'application' or f.startswith('notebook.') else None
    return dict(scope_kind=scope_kind, scope_partition=partition_of(scope_kind, project), project_id=project,
                server_id=SERVER, computer_id=computer)


def _subject(f, facts):
    thread = None if f.startswith('external_research.') else THREAD
    run = None
    if f in ('assistant_plan.build_started', 'assistant_plan.completed'):
        run = facts['run']['plan_run_id']
    if f == 'assistant_plan.cancelled':
        run = facts['settle']['run_ref']
    subject = spec.payload_value(facts, spec.PAYLOAD[f][SUBJECT[f]], thread)
    return dict(subject_id=subject, thread_id=thread, run_id=run)


def workflow_scope(scope):
    return dict(schema_id='pm.workflow_scope.v2', schema_version='2.0.0', scope_kind=scope['scope_kind'],
                scope_partition=scope['scope_partition'], project_id=scope['project_id'],
                project_home_server_id=SERVER if scope['scope_kind'] == 'project' else None, named_plan_id=None,
                server_id=scope['server_id'])


def build_world(f, scope='project', variant='base', boundary='append', neg=None, form='inline', pad=0, edition='current',
                native_patch=None, corr_pad=0):
    """One coherent original and its boundary context, all derived once from the native facts.

    neg: (kind, changes) from pm_w3g_spec: 'pre' base-fact overrides before derive, 'post' independent
    expectation overrides after derive, 'payload' / 'payload_jcs' stored-payload field substitutions.
    Every dependent copy, key, hash, pack and commitment is derived after the change."""
    neg = neg or ('pre', {})
    facts = spec.facts_for(f, variant, neg[1] if neg[0] == 'pre' else None)
    if neg[0] == 'post':
        for path, value in neg[1].items():
            spec._set(facts, path, copy.deepcopy(value))
    op = f'op:{f}:1'
    sc = _scope(f, scope)
    subj = _subject(f, facts)
    record_ref = f'src:{f}:1' + ('x' * pad)
    schema_ref = SOURCE_SCHEMA[f].get(scope, (f'none:{scope}', '1.0.0'))
    native = dict(issuer=PRODUCER[f], schema_id=schema_ref[0], schema_version=schema_ref[1], record_ref=record_ref,
                  receipt_ref=f'srcrcpt:{f}:1', result_ref=f'result:{f}:1', operation_id=op, intent=f'intent:{f}:1',
                  scope=sc, subject=subj, actor_ref='user:alice', accepted_at_utc=OCCURRED, producer_sequence_id=7,
                  correlation_id='corr-1' + 'c' * corr_pad, restrictions=['internal'], facts=facts)
    native.update(copy.deepcopy(native_patch or {}))
    with exact_integer_digits():
        source_bytes = canonical_source(native)
    digest = hashlib.sha256(source_bytes).hexdigest()
    payload = dict(schema_id=payload_schema_id(f, scope), schema_version='1.0.0', event_type=f, owner_operation_id=op,
                   scope=workflow_scope(sc), source_record_ref=record_ref, source_record_sha256=digest,
                   source_schema_id=native['schema_id'], source_schema_version=native['schema_version'],
                   source_receipt_ref=native['receipt_ref'])
    for field, path in spec.PAYLOAD[f].items():
        payload[field] = spec.payload_value(facts, path, subj['thread_id'])
    if neg[0] == 'payload':
        payload.update(copy.deepcopy(neg[1]))
    if neg[0] == 'payload_jcs':
        from pm_event_numbers import qualified_jcs
        for field, value in neg[1].items():
            payload[field] = hashlib.sha256(qualified_jcs(value)).hexdigest()
    event_id = event_id_of(INSTANCE, sc['scope_partition'], f, op)
    event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind=scope, event_id=event_id, event_type=f,
                 project_id=sc['project_id'], thread_id=subj['thread_id'], run_id=subj['run_id'], node_id=None,
                 attempt_id=None, actor_ref=native['actor_ref'], requested_account_ref=None, effective_account_ref=None,
                 occurred_at_utc=native['accepted_at_utc'], observed_at_utc=OBSERVED, persisted_at_utc=PERSISTED, sequence_id=41,
                 producer_sequence_id=native['producer_sequence_id'], correlation_id=native['correlation_id'],
                 causation_event_id=None, parent_event_id=None,
                 idempotency_key=idempotency_key_of(f, scope, SERVER, op), payload_schema_id=payload['schema_id'],
                 payload=payload, payload_ref=None, redaction_profile='secret_refs_only',
                 replay_policy='dedupe_by_idempotency_key',
                 migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                                compatibility_event_type=None))
    w = dict(family=f, scope=scope, variant=variant, boundary=boundary, form=form, edition=edition, native=native,
             source_bytes=source_bytes, issued=dict(records={record_ref: digest}, receipts={native['receipt_ref']: record_ref}),
             event=event)
    w['registry'] = dict(family_admitted=True, selectors={payload_schema_id(f, s): True for s in SCOPES[f]},
                         retention={f: RETENTION[f][scope] if scope in RETENTION[f] else None}, withdrawn=[],
                         resources=[])
    return finish_world(w)


def finish_world(w):
    """Storage, receipt, group, pack, request, writer, reader, checkpoint, retry and restore state for the event."""
    f, ev = w['family'], w['event']
    stored = copy.deepcopy(ev)
    packs = {}
    if w['form'] == 'ref':
        with exact_integer_digits():
            body = storage_value_bytes(ev['payload'], profile=EVENT_VALUE)
        digest = blake3(body).hexdigest()
        packs[digest] = dict(bytes=body, media_type=MEDIA, pack_synced=True, index_synced=True)
        stored['payload'] = None
        stored['payload_ref'] = 'payload:v1:' + digest
        ev['payload_ref'] = 'payload:v1:' + digest
    event_id = ev['event_id']
    with exact_integer_digits():
        commitment = _ok(lambda: True) and _commit(ev)
    receipt = dict(receipt_id=f'rcpt:{event_id}', event_id=event_id, sequence_id=ev['sequence_id'] if type(ev['sequence_id']) is int else 41,
                   commit_group_id='grp-1', durability_state='synced', acknowledged_at_utc=ACKED,
                   full_value_commitment=commitment)
    w['stored'] = stored
    w['storage'] = dict(instance=INSTANCE, issued={event_id: dict(sequence_id=41, observed_at_utc=OBSERVED, persisted_at_utc=PERSISTED)},
                        receipts={event_id: receipt}, groups={'grp-1': [event_id]}, packs=packs, effects=[w['native']['operation_id']],
                        tombstones=[], current_bytes=b'CURRENT:gen-3', sealed=[])
    native = w['native']
    recipe_id = event_id_of(INSTANCE, native['scope']['scope_partition'], f, native['operation_id'])
    w['request'] = dict(   # the independent caller's selectors, from the original operation, never from the stored event
        scope=copy.deepcopy(native['scope']), subject=copy.deepcopy(native['subject']), source_record_ref=native['record_ref'],
        source_record_sha256=hashlib.sha256(w['source_bytes']).hexdigest(), intent=native['intent'], event_id=recipe_id,
        expected_currentness='currentness-7', receipt_selector=f'rcpt:{recipe_id}', expected_group='grp-1',
        checkpoint=dict(storage_instance_id=INSTANCE, generation_id='eig_' + 'a' * 64, frontier_revision=41,
                        checkpoint_key=f'event_record_index_checkpoint.v1:{INSTANCE}'),
        dispatch=dict(event_type=f, payload_schema_id=payload_schema_id(f, w['scope']), payload_scope=w['scope'],
                      payload_edition='1.0.0'))
    w['writer'] = dict(lease=dict(held=True, partition=native['scope']['scope_partition'], store=INSTANCE), permission=True,
                       owner=native['issuer'], captured_epoch=5, expected_preimage=spec.H('preimage-7'), captured_stop_epoch=2,
                       fence_after=dict(lease_held=True),
                       current=dict(owner=native['issuer'], epoch=5, preimage=spec.H('preimage-7'), stop_epoch=2,
                                    currentness='currentness-7', stop=None))
    w['reader'] = dict(permission=True, clearances=['internal'], effects=dict(domain=0, external=0, notification=0, charge=0))
    selection = dict(storage_instance_id=INSTANCE, current_bytes_sha256=hashlib.sha256(w['storage']['current_bytes']).hexdigest())
    durable = dict(storage_instance_id=INSTANCE, checkpoint_key=f'event_record_index_checkpoint.v1:{INSTANCE}',
                   checkpoint_ref='ckpt-ref-3', generation_id='eig_' + 'a' * 64, generation_anchor_sha256=spec.H('anchor-3'),
                   frontier_revision=41, frontier_sha256=spec.H('frontier-41'), index_dataset_name='event_record_index_v2',
                   source_selection=selection)
    w['checkpoint'] = dict(stored_token=durable, live_token=dict(copy.deepcopy(durable), redb_snapshot_id='snap-tx-1'),
                           read_txn=dict(snapshot_id='snap-tx-1'), coverage=[[0, 20], [21, 41]])
    w['query'] = dict(subject_id=native['subject']['subject_id'])
    w['retry'] = dict(incoming=copy.deepcopy(ev), resolution=dict(result_ref=native['result_ref'], receipt=copy.deepcopy(receipt),
                                                                  effects_delta=0))
    w['restore'] = dict(native_sha256=w['issued']['records'][native['record_ref']], result_ref=native['result_ref'],
                        group=['grp-1', event_id], payload_digests=sorted(packs), identity={event_id: native['operation_id']},
                        visible=[event_id])
    seal_write_receipt(w)
    return w


def refinish(w):
    """Re-derive Storage, receipt, pack, sealed receipt and boundary state after a change to the stored event: every
    dependent commitment follows the changed event (a negative's other copies never go stale)."""
    return finish_world(w)


def _commit(ev):
    try:
        return full_value_commitment(ev)
    except Exception:
        return None


# --- retention (bound to the decisions on main; see RETENTION_SOURCES) ----------------------------------
RETENTION = {}
for _f in FAMILIES:
    RETENTION[_f] = {}
for _f in ('assistant_plan.build_started', 'assistant_plan.completed', 'notebook.transition_state_changed'):
    RETENTION[_f] = {'project': 'RP-RUNTIME-365D@1.0.0', 'application': 'RP-RUNTIME-365D@1.0.0'}
for _f in ('assistant_plan.cancelled', 'assistant_plan.created', 'assistant_plan.exported', 'assistant_plan.version_created',
           'assistant_plan.wizard_handoff_created', 'goal.paused', 'goal.resumed', 'notebook.checkpoint_committed',
           'notebook.entry_committed', 'notebook.entry_superseded'):
    RETENTION[_f] = {'project': 'RP-AUTHORITY-INDEFINITE@1.0.0', 'application': 'RP-AUTHORITY-INDEFINITE@1.0.0'}
for _f in ('external_research.finding_classified', 'external_research.packet_delivered', 'external_research.topic_started'):
    RETENTION[_f] = {'project': 'RP-AUTHORITY-INDEFINITE@1.0.0'}
for _f in ('external_research.budget_denied', 'external_research.job_terminal'):
    RETENTION[_f] = {'project': 'RP-OPERATIONAL-2555D@1.0.0'}
RETENTION['notebook.checkpoint_failed'] = {'project': 'RP-OPERATIONAL-2555D@1.0.0',
                                           'application': 'RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0'}
assert all(set(RETENTION[f]) == set(SCOPES[f]) for f in FAMILIES)


# --- retained originals: the independently sealed receipt -------------------------------------------------
def binding_of(w):
    ev = w['event']
    return OriginalBinding(w['storage']['instance'], ev['scope_kind'], w['native']['scope']['server_id'], ev['project_id'],
                           ev['event_type'], ev['event_id'], ev['idempotency_key'], w['native']['operation_id'],
                           hashlib.sha256(w['source_bytes']).hexdigest())


def seal_write_receipt(w):
    """Writer side only: Storage seals, at the original append, the binding and the recipe the writer used.
    Readers never create one."""
    if (w['family'], w['scope'], w['edition']) not in RECIPES:
        return w      # no installed recipe for a scope the family does not have: nothing is sealed
    with exact_integer_digits():
        b = binding_of(w)
    w['storage']['sealed'].append(dict(locator=w['event']['event_id'], binding=dict(b.__dict__),
                                       recipe=dict(RECIPES[(w['family'], w['scope'], w['edition'])].__dict__),
                                       admitted=True))
    return w


def sealed_at(w):
    return [r for r in w['storage']['sealed'] if type(r) is dict and r.get('locator') == w['event']['event_id']]


class W3GOriginalOwner:
    """Answers only from the one sealed receipt of the exact original locator; never a default."""

    def __init__(self, w):
        self._w = w

    def authenticated_original(self, original_ref):
        receipts = [r for r in self._w['storage']['sealed'] if r.get('locator') == original_ref]
        if len(receipts) != 1:
            raise Refusal('original_unavailable' if not receipts else 'recipe_ambiguous')
        r = receipts[0]
        return OriginalCustody(OriginalBinding(**r['binding']), RecipeTuple(**r['recipe']),
                               storage_value_bytes(self._w['event'], profile=EVENT_VALUE), self._w['source_bytes'],
                               storage_value_bytes(self._w['storage']['receipts'][original_ref], profile=EVENT_VALUE))


def _frozen(f, scope, edition):
    """The frozen verifier of one recipe edition: recomputes identity, source commitment and full-value commitment
    from the original resources; the legacy edition does not apply the CV-1100 producer qualification."""
    def verify(custody):
        b = custody.binding
        ev = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
        if b.event_id != event_id_of(b.storage_instance_id, partition_of(b.scope_kind, b.project_id), f, b.owner_operation_id):
            return False
        if hashlib.sha256(custody.result_bytes).hexdigest() != b.source_commitment:
            return False
        receipt = decode_storage_value(custody.receipt_bytes, profile=EVENT_VALUE)
        if receipt.get('full_value_commitment') != full_value_commitment(ev):
            return False
        if edition == 'current':
            producer_semantic_bytes(ev)
        return custody.recipe == RECIPES[(f, scope, edition)]
    return FrozenRecipe(verify)


FROZEN = {RECIPES[(f, s, e)]: _frozen(f, s, e) for f in FAMILIES for s in SCOPES[f] for e in ('current', LEGACY)}


# --- Method B tables ----------------------------------------------------------------------------------------
TABLE_PREFIX = 'pm_w3g_table_'
RECORDER = None
_ROWS = {}
_FIELDS = {}


def table_rows(phase):
    rows = _ROWS.get(phase)
    if rows is None:
        module = importlib.import_module(TABLE_PREFIX + phase)
        case = module.case(None)
        rows = _ROWS[phase] = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
        _FIELDS[phase] = module.FIELDS
        assert list(module.FIELDS) == [r[1] for r in all_phases()[phase][2]], (
            'table out of date; run scripts/pm-w3g-table-generate.py', phase)
    return rows


def refusal(phase, facts):
    """First refusing row of one phase as (phase, row, code), or None."""
    rows = table_rows(phase)
    missing = set(_FIELDS[phase]) - set(facts)
    assert not missing, (phase, sorted(missing))
    observed = {k: facts[k] is True for k in _FIELDS[phase]}
    first = None
    for name, predicate, context in rows:
        code = predicate(observed, context)
        if code is not None:
            first = (phase, name, code)
            break
    if RECORDER is not None:
        RECORDER.append((phase, dict(observed), first))
    return first


# --- row specification (the generator renders the tables from this) ---------------------------------------
# phase: (title, applies-default, [(row, field, invariant, code[, applies]), ...]); applies: boundaries where the
# row's predicate is evaluated (append = current write, retry = current retry, history = retained original read,
# restore = coherent restore). Outside them the observation is vacuously true.
A, RT, HI, RS = 'append', 'retry', 'history', 'restore'
CUR = (A, RT)
ALLB = (A, RT, HI)
ROWS = {
    'ad': ('Current admission, retention and withdrawal (CV/SP-15xx admission clauses)', [
        ('AD01_membership', 'membership', 'the exact family has current append admission', 'missing_event_registration', CUR),
        ('AD02_membership_selector', 'membership_selector', 'the selected scope/schema selector has current append admission', 'missing_event_registration', CUR),
        ('AD03_retention', 'retention', 'the event has its own exact retention assignment before append', 'retention_incomplete', CUR),
        ('AD04_withdrawal', 'withdrawal', 'an exactly withdrawn selector cannot produce consumption or effects', 'selector_withdrawn', ALLB),
    ]),
    'sc': ('Schema resources and independent request selectors', [
        ('SC01_reference_closure', 'reference_closure', 'every schema reference of the installed resource set resolves eagerly', 'unresolved_schema_ref', ALLB),
        ('SC02_exact_types', 'exact_types', 'every independent request value has its exact native type before comparison', 'invalid_type', ALLB),
        ('SC03_identifier_fullmatch', 'identifier_fullmatch', 'every request identifier/digest full-matches its owner grammar (no trailing LF)', 'invalid_identifier', ALLB),
        ('SC04_identifier_spelling', 'identifier_spelling', 'the request source selector preserves the exact original source spelling', 'source_spelling_mismatch', ALLB),
    ]),
    'pf': ('Stored payload form and SP-337 / SP-340 sizes', [
        ('PF01_form_exclusive', 'form_exclusive', 'exactly one of an inline object body or a payload:v1 reference is stored', 'payload_mismatch', ALLB),
        ('PF02_route_id', 'route_id', 'a reference is payload:v1: followed by a 64-hex BLAKE3 id', 'payload_mismatch', ALLB),
        ('PF03_pack_present', 'pack_present', 'authentic pack custody holds the referenced id', 'payload_mismatch', ALLB),
        ('PF04_pack_synced', 'pack_synced', 'the pack bytes and index entry are synced', 'payload_mismatch', ALLB),
        ('PF05_payload_form', 'payload_form', 'resolved pack bytes equal the genuine payload commitment (BLAKE3)', 'payload_mismatch', ALLB),
        ('PF06_pack_media', 'pack_media', 'the pack media is the SP-236 application/msgpack encoding', 'payload_mismatch', ALLB),
        ('PF07_pack_decodes', 'pack_decodes', 'the pack bytes decode under SP-1100 EVENT_VALUE to an object', 'payload_mismatch', ALLB),
        ('PF08_physical_value', 'physical_value', 'the stored EventRecord encodes under SP-236/SP-1100 EVENT_VALUE (no unsupported number)', 'number_route_refused', ALLB),
        ('PF09_value_size', 'value_size', 'an inline payload body is at most 16,384 encoded bytes', 'value_too_large', ALLB),
        ('PF10_stored_size', 'stored_size', 'the stored EventRecord value is at most 16,384 encoded bytes', 'value_too_large', ALLB),
    ]),
    'en': ('Resolved logical EventRecord (Contracts_V0 EventRecord 2.0.0, CV-317)', [
        ('EN01_envelope_schema', 'envelope_schema', 'the logical event validates EventRecord 2.0.0', 'invalid_payload', ALLB),
        ('EN02_family_type', 'family_type', 'event_type is exactly this family', 'payload_dispatch_mismatch', ALLB),
        ('EN03_payload_schema_id', 'payload_schema_id', 'payload_schema_id equals the payload schema_id', 'payload_dispatch_mismatch', ALLB),
        ('EN04_replay_only_writer', 'replay_only_writer', 'a current writer or retry refuses projector_replay_only', 'replay_only_not_appendable', CUR),
        ('EN05_replay_family', 'replay_family', 'replay_policy is dedupe_by_idempotency_key (history also reads projector_replay_only)', 'replay_only_not_appendable', ALLB),
        ('EN06_migration_null', 'migration_null', 'every migration field is null', 'invalid_payload', ALLB),
        ('EN07_redaction_family', 'redaction_family', 'redaction_profile is secret_refs_only', 'invalid_payload', ALLB),
    ]),
    'nm': ('Numbers through the shared NUMRULE calls (CV-1100, SP-1100)', [
        ('NM01_sequence_uint64', 'sequence_uint64', 'sequence_id is an exact SP-1100 storage_uint64', 'number_route_refused', ALLB),
        ('NM02_producer_sequence', 'producer_sequence', 'producer_sequence_id is null or an exact current integer >= 0', 'number_route_refused', ALLB),
        ('NM03_payload_integers', 'payload_integers', 'every payload integer slot passes current_integer with the schema bounds', 'number_route_refused', ALLB),
        ('NM04_producer_route', 'producer_route', 'the CV-317 producer projection qualifies (producer_semantic_bytes) under the sealed current recipe', 'number_route_refused', ALLB),
        ('NM05_receipt_uint64', 'receipt_uint64', 'the first receipt sequence_id is an exact storage_uint64', 'number_route_refused', ALLB),
        ('NM06_frontier_uint64', 'frontier_uint64', 'the read token frontier_revision is an exact storage_uint64', 'number_route_refused', (HI,)),
    ]),
    'tm': ('Timestamps through the shared date-time predicate (CV-1101, CV-253, SP-347)', [
        ('TM01_occurred_clock', 'occurred_clock', 'occurred_at_utc passes date_time with event_record', 'invalid_timestamp', ALLB),
        ('TM02_observed_clock', 'observed_clock', 'observed_at_utc passes date_time with storage_utc_z', 'invalid_timestamp', ALLB),
        ('TM03_persisted_clock', 'persisted_clock', 'persisted_at_utc passes date_time with storage_utc_z', 'invalid_timestamp', ALLB),
        ('TM04_ack_clock', 'ack_clock', 'the first receipt acknowledged_at_utc passes date_time with storage_utc_z', 'invalid_timestamp', ALLB),
    ]),
    'src': ('Native source custody (owner issuance, never caller data)', [
        ('SR01_source_custody', 'source_custody', 'the complete native source has authenticated original owner issuance of its exact bytes', 'source_unavailable', ALLB),
        ('SR02_source_receipt_issued', 'source_receipt_issued', 'the native source receipt has authenticated original owner issuance', 'source_unavailable', ALLB),
        ('SR03_source_digest', 'source_digest', 'the independently expected source commitment equals the whole original physical source', 'source_mismatch', ALLB),
        ('SR04_source_issuer', 'source_issuer', 'the native source issuer is the family sole producer', 'source_unavailable', ALLB),
        ('SR05_source_schema', 'source_schema', 'the native source carries the contract-selected source schema for its scope', 'source_unavailable', ALLB),
    ]),
    'pj': ('Common payload joins to the authentic native source', [
        ('PJ01_operation', 'payload_operation', 'payload owner_operation_id is the original operation', 'source_mismatch', ALLB),
        ('PJ02_scope', 'payload_scope', 'payload scope is the WorkflowScopeV2 of the authentic original scope', 'scope_mismatch', ALLB),
        ('PJ03_record_ref', 'payload_record_ref', 'payload source_record_ref is the original record', 'source_mismatch', ALLB),
        ('PJ04_record_sha256', 'payload_record_sha256', 'payload source_record_sha256 is the SHA-256 of the whole original source bytes', 'source_mismatch', ALLB),
        ('PJ05_schema_id', 'payload_source_schema_id', 'payload source_schema_id is the native source schema', 'source_mismatch', ALLB),
        ('PJ06_schema_version', 'payload_source_schema_version', 'payload source_schema_version is the native source schema version', 'source_mismatch', ALLB),
        ('PJ07_receipt_ref', 'payload_receipt_ref', 'payload source_receipt_ref is the original source receipt', 'source_mismatch', ALLB),
    ]),
    'ej': ('Envelope joins to the authentic native source', [
        ('EJ01_project_id', 'env_project_id', 'event project_id equals the source scope', 'scope_mismatch', ALLB),
        ('EJ02_thread_id', 'env_thread_id', 'event thread_id equals the source subject', 'subject_mismatch', ALLB),
        ('EJ03_run_id', 'env_run_id', 'event run_id equals the source subject (null stays null)', 'subject_mismatch', ALLB),
        ('EJ04_node_id', 'env_node_id', 'event node_id equals the source (null)', 'subject_mismatch', ALLB),
        ('EJ05_attempt_id', 'env_attempt_id', 'event attempt_id equals the source (null)', 'subject_mismatch', ALLB),
        ('EJ06_actor', 'env_actor', 'event actor_ref equals the source actor', 'source_mismatch', ALLB),
        ('EJ07_requested_account', 'env_requested_account', 'event requested_account_ref equals the source (null)', 'source_mismatch', ALLB),
        ('EJ08_effective_account', 'env_effective_account', 'event effective_account_ref equals the source (null)', 'source_mismatch', ALLB),
        ('EJ09_occurred_at', 'env_occurred_at', 'occurred_at_utc is the original accepted time', 'source_mismatch', ALLB),
        ('EJ10_producer_sequence', 'env_producer_sequence', 'producer_sequence_id is the original producer sequence', 'source_mismatch', ALLB),
        ('EJ11_correlation', 'env_correlation', 'event correlation_id equals the source', 'source_mismatch', ALLB),
        ('EJ12_causation', 'env_causation', 'event causation_event_id equals the source (null)', 'source_mismatch', ALLB),
        ('EJ13_parent', 'env_parent', 'event parent_event_id equals the source (null)', 'source_mismatch', ALLB),
    ]),
    # By-construction row, alone in its own table (W3-P2 step 1): never reached first. Proof in ENTAILED.
    'en_scope_kind': ('Entailed: event scope_kind equals the source scope', [
        ('EJ00_scope_kind', 'env_scope_kind', 'event scope_kind equals the source scope_kind', 'scope_mismatch', ALLB),
    ]),
    'sj': ('Independent request scope and subject components (plan rows scope*/subject*)', [
        ('SJ01_scope', 'req_scope_kind', 'the requested scope_kind equals the authentic original scope component', 'scope_mismatch', ALLB),
        ('SJ02_scope_partition', 'req_scope_partition', 'the requested scope_partition equals the authentic original scope component', 'scope_mismatch', ALLB),
        ('SJ03_scope_project_id', 'req_project_id', 'the requested project_id equals the authentic original scope component', 'scope_mismatch', ALLB),
        ('SJ04_scope_server_id', 'req_server_id', 'the requested server_id equals the authentic original scope component', 'scope_mismatch', ALLB),
        ('SJ05_scope_computer_id', 'req_computer_id', 'the requested computer_id equals the authentic original scope component', 'scope_mismatch', ALLB),
        ('SJ06_subject', 'req_subject_id', 'the requested subject_id equals the authentic original subject component', 'subject_mismatch', ALLB),
        ('SJ07_subject_thread_id', 'req_thread_id', 'the requested thread_id equals the authentic original subject component', 'subject_mismatch', ALLB),
        ('SJ08_subject_run_id', 'req_run_id', 'the requested run_id equals the authentic original subject component', 'subject_mismatch', ALLB),
    ]),
    'wr': ('Current writer and retry authority (plan writer_* rows; current_write and current_retry only)', [
        ('WR01_writer_currentness', 'writer_currentness', 'the expected currentness equals the actual owner currentness', 'stale_currentness', CUR),
        ('WR02_write_lease', 'write_lease', 'the writer holds the exact native writer/maintenance lease', 'writer_lease_unavailable', CUR),
        ('WR03_write_lease_scope', 'write_lease_scope', 'the live lease covers this mutation partition and native store', 'writer_lease_mismatch', CUR),
        ('WR04_write_permission', 'write_permission', 'the writer has mutation permission independently of read permission', 'permission_denied', CUR),
        ('WR05_writer_owner', 'writer_owner', 'the mutation belongs to its authentic current owner', 'owner_mismatch', CUR),
        ('WR06_writer_epoch', 'writer_epoch', 'the captured owner epoch equals the current native owner epoch', 'owner_epoch_mismatch', CUR),
        ('WR07_writer_cas', 'writer_cas', 'the complete expected preimage equals the actual current owner preimage', 'cas_conflict', CUR),
        ('WR08_writer_intent', 'writer_intent', 'the requested intent equals the original accepted native intent', 'intent_mismatch', CUR),
        ('WR09_writer_stop_epoch', 'writer_stop_epoch', 'the captured Stop epoch equals the actual owner fence epoch', 'stop_epoch_mismatch', CUR),
        ('WR10_writer_stop_blocked', 'writer_stop_blocked', 'the owner permits this exact action under its effective Stop/Pause/Cancel fence', 'stop_fenced', CUR),
        ('WR11_writer_final_fence', 'writer_final_fence', 'the lease is still held when rechecked after the last returning helper', 'writer_lease_unavailable', CUR),
    ]),
    'id': ('Identity recipes (CV-15xx; CV-366 for application keys)', [
        ('ID01_identity_recipe', 'identity_recipe', 'event_id is w3g@1 over instance, partition, event_type and operation', 'identity_mismatch', ALLB),
        ('ID02_identity_request', 'identity_request', 'the requested event id equals the original recipe', 'identity_mismatch', ALLB),
        ('ID03_application_key', 'application_key', 'an application key full-matches CV-366 application@1:{hex}:{hex}', 'idempotency_mismatch', ALLB),
        ('ID04_identity_recipe_idempotency', 'identity_idempotency', 'idempotency_key is the Project or CV-366 application recipe over the original', 'identity_mismatch', ALLB),
    ]),
    'st': ('Storage-issued metadata and the SP-286/SP-347 first receipt', [
        ('ST01_storage_metadata', 'sequence_issued', "sequence_id is Storage's issued value", 'storage_mismatch', ALLB),
        ('ST02_storage_metadata_observed_at_utc', 'observed_issued', "observed_at_utc is Storage's issued value", 'storage_mismatch', ALLB),
        ('ST03_storage_metadata_persisted_at_utc', 'persisted_issued', "persisted_at_utc is Storage's issued value", 'storage_mismatch', ALLB),
        ('ST04_receipt_custody', 'receipt_custody', 'the requested first-receipt selector resolves the authentic receipt of this event', 'receipt_mismatch', ALLB),
        ('ST05_receipt_custody_event', 'receipt_event', 'the receipt full-value commitment equals CV-339 over the complete event', 'receipt_mismatch', ALLB),
        ('ST06_receipt_custody_group', 'receipt_group', 'the expected append group equals the receipt commit group', 'receipt_mismatch', ALLB),
        ('ST07_group_member', 'group_member', 'the receipt commit group actually holds this event', 'receipt_mismatch', ALLB),
        ('ST08_receipt_sequence', 'receipt_sequence', 'the receipt sequence_id equals the event sequence_id', 'receipt_mismatch', ALLB),
    ]),
    'ry': ('Retry of the same original (current_retry only)', [
        ('RY01_retry_conflict', 'retry_conflict', 'same identity with a different caller semantic body (CV-317 digest) conflicts', 'idempotency_conflict', (RT,)),
        ('RY02_no_second_effect', 'no_second_effect', 'a same-request resolution performs no second native effect', 'duplicate_effect', (RT,)),
        ('RY03_retry_original_result', 'retry_original_result', 'the resolution returns the complete original result', 'result_mismatch', (RT,)),
        ('RY04_retry_first_receipt', 'retry_first_receipt', 'the resolution returns the original first receipt', 'receipt_mismatch', (RT,)),
    ]),
    'rr': ('Retained original: recipe only from the independently sealed receipt (SP-1101)', [
        ('RR01_receipt_present', 'sealed_present', 'a sealed write receipt exists for this exact original', 'original_unavailable', (HI,)),
        ('RR02_receipt_unique', 'sealed_unique', 'exactly one sealed receipt names this original', 'recipe_ambiguous', (HI,)),
        ('RR03_receipt_binding', 'sealed_binding', 'the sealed binding is this original (instance, scope, identity, operation, source commitment)', 'original_unavailable', (HI,)),
        ('RR04_recipe_known', 'recipe_known', 'the sealed recipe is an installed frozen recipe', 'recipe_unsupported', (HI,)),
        ('RR05_recipe_edition', 'recipe_edition', 'the sealed recipe is this family/scope edition', 'invalid_history_edition', (HI,)),
        ('RR06_historical_recipe_admission', 'original_admission', 'the original had genuine family/selector admission when written', 'invalid_history_edition', (HI,)),
    ]),
    'en_original_verified': ('Entailed: the frozen verifier of the sealed edition accepts the original custody', [
        ('RR07_original_verified', 'original_verified', 'the frozen verifier of that edition accepts the original custody', 'invalid_history_edition', (HI,)),
    ]),
    'rd': ('Passive history reader over SP-278 (no projector, projection or private checkpoint)', [
        ('RD01_read_visibility', 'read_permission', 'the current reader has disclosure permission', 'permission_denied', (HI,)),
        ('RD02_read_visibility_deletion', 'not_deleted', 'current deletion policy permits disclosure of the original', 'permission_denied', (HI,)),
        ('RD03_read_visibility_restriction', 'restriction_ok', 'current source restrictions permit disclosure to this reader', 'permission_denied', (HI,)),
        ('RD04_payload_dispatch', 'dispatch_event_type', 'the selected event_type matches the original', 'payload_dispatch_mismatch', (HI,)),
        ('RD05_payload_dispatch_schema_id', 'dispatch_schema_id', 'the selected payload_schema_id matches the original', 'payload_dispatch_mismatch', (HI,)),
        ('RD06_payload_dispatch_scope', 'dispatch_scope', 'the selected payload scope matches the original', 'payload_dispatch_mismatch', (HI,)),
        ('RD07_payload_dispatch_edition', 'dispatch_edition', 'the selected payload edition matches the original', 'payload_dispatch_mismatch', (HI,)),
        ('RD08_checkpoint_identity', 'ckpt_instance', 'the expected checkpoint storage_instance_id equals the token', 'checkpoint_mismatch', (HI,)),
        ('RD09_checkpoint_identity_generation', 'ckpt_generation', 'the expected checkpoint generation equals the token', 'checkpoint_mismatch', (HI,)),
        ('RD10_checkpoint_identity_frontier', 'ckpt_frontier', 'the expected checkpoint frontier equals the token', 'checkpoint_mismatch', (HI,)),
        ('RD11_checkpoint_identity_scope', 'ckpt_scope', 'the expected checkpoint key equals the token', 'checkpoint_mismatch', (HI,)),
        ('RD12_durable_token', 'durable_token', 'the stored resume token has exactly the nine durable fields', 'invalid_stored_snapshot', (HI,)),
        ('RD13_durable_token_snapshot', 'token_snapshot', "the live token uses this read transaction's actual snapshot", 'invalid_stored_snapshot', (HI,)),
        ('RD14_token_durable_join', 'token_join', 'the live token is the stored durable token plus the snapshot', 'invalid_stored_snapshot', (HI,)),
        ('RD15_coverage', 'coverage', 'the captured global range is contiguous from 0 through the frontier', 'coverage_unavailable', (HI,)),
        ('RD16_coverage_current', 'coverage_current', 'the captured CURRENT selection is authenticated by its bytes', 'coverage_unavailable', (HI,)),
        ('RD17_reader_passivity', 'passive_domain', 'the passive reader emits no domain mutation', 'reader_effect_forbidden', (HI,)),
        ('RD18_reader_passivity_external', 'passive_external', 'the passive reader emits no external request', 'reader_effect_forbidden', (HI,)),
        ('RD19_reader_passivity_notification', 'passive_notification', 'the passive reader emits no notification', 'reader_effect_forbidden', (HI,)),
        ('RD20_reader_passivity_charge', 'passive_charge', 'the passive reader emits no charge', 'reader_effect_forbidden', (HI,)),
    ]),
    'rs': ('Coherent restore of the mandatory original set', [
        ('RS01_coherent_restore', 'restore_native', 'restore resolves the original native source bytes', 'restore_unavailable', (RS,)),
        ('RS02_coherent_restore_operation_result', 'restore_result', 'restore resolves the original operation result', 'restore_unavailable', (RS,)),
        ('RS03_coherent_restore_first_receipt_group', 'restore_group', 'restore resolves the original first receipt group', 'restore_unavailable', (RS,)),
        ('RS04_coherent_restore_referenced_payload', 'restore_payload', 'restore resolves every referenced SP-337 payload', 'restore_unavailable', (RS,)),
        ('RS05_coherent_restore_identity_custody', 'restore_identity', 'restore resolves the original identity custody', 'restore_unavailable', (RS,)),
        ('RS06_coherent_restore_tombstones', 'restore_tombstones', 'restore applies the current deletion boundary before disclosure', 'restore_unavailable', (RS,)),
    ]),
}
def cite(path, needle, start_after=None):
    """path:line of the unique line holding needle (after the first line holding start_after, when given)."""
    lines = (ROOT / path).read_text().split('\n')
    first = 0
    if start_after is not None:
        first = next(n for n, line in enumerate(lines) if start_after in line)
    hits = [n + 1 for n, line in enumerate(lines) if n >= first and needle in line]
    assert hits, (path, needle)
    return f'{path}:{hits[0]}'


EV = 'scripts/pm_w3g_events.py'
ENTAILED = {
    'EJ00_scope_kind': lambda: (
        'Always refused first by EN01 or EJ01. EN01 validates the logical event against EventRecord 2.0.0, whose root allOf '
        f'({cite("Plans/event_record.schema.json", chr(34) + "allOf" + chr(34))}, if/then at '
        f'{cite("Plans/event_record.schema.json", chr(34) + "then" + chr(34))} and the second then) makes scope_kind=application '
        'require project_id=null and scope_kind=project require a nonempty project_id; EJ01 '
        f'({cite(EV, "for field, src in ((" + chr(39) + "env_project_id" + chr(39))}) requires event project_id == the authentic '
        f'source project_id; the source scope is coherent ({cite(EV, "project = PROJECT if scope_kind == " + chr(39) + "project" + chr(39))}: '
        'application has project_id None, project has PROJECT). With EN01 and EJ01 holding, a null project_id forces both scopes '
        'to application and a nonempty one forces both to project, so EJ00 cannot be the first refusal.'),
    'RR07_original_verified': lambda: (
        'Always refused first by ID01, RR03, ST05, NM04 or RR05. The frozen verifier recomputes exactly: (1) the w3g@1 event_id '
        f'({cite(EV, "if b.event_id != event_id_of(")}), the predicate of ID01 ({cite(EV, "obs[" + chr(39) + "identity_recipe" + chr(39) + "] = ")}); '
        f'(2) sha256(source bytes) = binding.source_commitment ({cite(EV, "if hashlib.sha256(custody.result_bytes)")}), which RR03 '
        f'already requires ({cite(EV, "obs[" + chr(39) + "sealed_binding" + chr(39) + "] = ")}) by comparing the sealed binding with '
        f'binding_of(w), whose source_commitment is that hash; (3) the receipt commitment ({cite(EV, "if receipt.get(" + chr(39) + "full_value_commitment" + chr(39) + ") != full_value_commitment(ev)")}), '
        f'the predicate of ST05 ({cite(EV, "obs[" + chr(39) + "receipt_event" + chr(39) + "] = ")}); (4) for the current edition '
        f'producer_semantic_bytes ({cite(EV, "            producer_semantic_bytes(ev)")}), the predicate of NM04 '
        f'({cite(EV, "obs[" + chr(39) + "producer_route" + chr(39) + "] = ")}), which runs on history exactly when the sealed recipe is '
        f'the current edition ({cite(EV, "current_recipe = b not in (HI, RS)")}); (5) the installed tuple of that family/scope/edition '
        f'({cite(EV, "return custody.recipe == RECIPES[(f, scope, edition)]")}), the predicate of RR05 '
        f'({cite(EV, "obs[" + chr(39) + "recipe_edition" + chr(39) + "] = ")}). Every predicate RR07 evaluates is an earlier row, so '
        'RR07 is never the first refusal.'),
}


def _state_proof(f, field, path, keyword):
    payload = FAM[f]['payload_path']
    return (f'Always refused first by the py {keyword} row of {field} or its join row FJ<n>_{field}. The payload field {field} '
            f'is built from the native fact {path} ({cite("scripts/pm_w3g_spec.py", field + "=" + chr(39) + path + chr(39))}); the '
            f'join row ({cite(EV, "obs[f" + chr(39) + "join.{k}" + chr(39) + "] = ")}) requires the stored payload to equal that fact; '
            f'the closed selector pins {field} by {keyword} ({cite(payload, chr(34) + keyword + chr(34), start_after=chr(34) + field + chr(34) + ": {")} '
            f'in ProjectPayloadV1, the same in ApplicationPayloadV1). A fact outside the {keyword} either reaches the payload (the py '
            f'{keyword} row refuses) or not (the join row refuses), so this row is never the first refusal.')


PY_CODE = 'invalid_payload'


def _sanitize(text):
    return re.sub(r'[^0-9A-Za-z]+', '_', text).strip('_')


def _implied_min_length(prop):
    """minLength sites the same property's pattern already refuses first (proof per pattern in IMPLIED_SITES)."""
    p = prop.get('pattern')
    m = prop.get('minLength')
    if m is None:
        return False
    if p == '^[^\\u0000-\\u001f\\u007f]+(?![\\s\\S])' and m == 1:
        return True
    if p == '^[0-9a-f]{64}$' and m == 64:
        return True
    return False


def py_spec(f):
    """(row, field, kw, prop_field) for the family's selected payload, from ProjectPayloadV1 (the application selector
    has the same keyword structure; its own consts are read per scope)."""
    d = SCHEMAS[f]['$defs']['ProjectPayloadV1']
    # The selector's root type:object site is enforced by PF01 (only an inline object body or a payload:v1 reference is
    # stored; a decoded pack body must be an object, PF07), so it is not a separate row: see IMPLIED_SITES.
    out = [('closed', None)] + [('required', k) for k in d['required']]
    for k in d['required']:
        prop = d['properties'][k]
        if 'const' in prop:
            out.append(('const', k))
        if 'allOf' in prop:
            out += [('scope_ref', k), ('scope_kind_const', k)]
        if '$ref' in prop:
            out.append(('ref', k))
        if 'type' in prop and not ('enum' in prop and all(type(x) is str for x in prop['enum']) and prop['type'] == 'string'):
            # (a string enum already refuses every non-string, so its type site is implied by the enum row: IMPLIED_SITES)
            out.append(('type', k))
            for kw in ('maxLength', 'pattern', 'minimum', 'enum', 'minItems', 'uniqueItems'):
                if kw in prop:
                    out.append((kw, k))
            if 'minLength' in prop and not _implied_min_length(prop):
                out.append(('minLength', k))
            if 'items' in prop:
                out += [('items_type', k), ('items_pattern', k)]
        elif 'enum' in prop:
            out.append(('enum', k))
        if 'anyOf' in prop:
            out.append(('anyOf_type', k))
            b0 = prop['anyOf'][0]
            for kw in ('pattern', 'minimum'):
                if kw in b0:
                    out.append((f'anyOf_{kw}', k))
    return out


def py_rows(f):
    rows = []
    for n, (kw, k) in enumerate(py_spec(f), 1):
        field = f'{kw}.{k}' if k else kw
        words = f'payload {k} satisfies {kw} of the selected selector' if k else f'payload satisfies {kw} of the selected selector'
        rows.append((f'PY{n:02d}_{_sanitize(kw)}{"_" + _sanitize(k) if k else ""}', field, words, PY_CODE, ALLB))
    return rows


def join_fields(f):
    """Payload family fields joined to a native fact path, const fields included (a forged copy of the const over an owner
    fact outside it is refused here); '@'/'derived.' paths are bound by their own domain rows."""
    return [k for k, path in spec.PAYLOAD[f].items() if not path.startswith('derived.') and path not in ('@null', '@card_count')]


def fx_rows(f):
    rows = []
    for n, k in enumerate(join_fields(f), 1):
        rows.append((f'FJ{n:02d}_{_sanitize(k)}', f'join.{k}', f'payload {k} equals the authentic native source value', 'source_join_mismatch', ALLB))
    for n, r in enumerate(spec.DOMAIN[f], 1):
        if r.get('entailed'):
            continue
        rows.append((f'FD{n:02d}_{_sanitize(r["suffix"])}', f'dom.{r["suffix"]}', f'{f}:{r["suffix"]} ({r["kind"]} {r["args"]!r:.120})',
                     r['code'], tuple(r['applies'])))
    return rows


CHUNK = 8   # rows per family table: the gated tool's proof cost grows with the cube of table size


def chunked(prefix, rows):
    """Consecutive chunks of at most CHUNK rows, in row order: <prefix>_1, <prefix>_2, ... The complete checker visits
    them in this order, so the first-refusal order of the rows is unchanged."""
    return [(f'{prefix}_{i + 1}', rows[i * CHUNK:(i + 1) * CHUNK]) for i in range((len(rows) + CHUNK - 1) // CHUNK)]


def family_tables(f, kind):
    slug = FAM[f]['slug']
    rows = py_rows(f) if kind == 'py' else fx_rows(f)
    return chunked(f'{kind}_{slug}', rows)


def all_phases():
    phases = {k: (v[0], None, v[1]) for k, v in ROWS.items()}
    for f in FAMILIES:
        slug = FAM[f]['slug']
        for name, rows in family_tables(f, 'py'):
            phases[name] = (f'{f} closed payload selector keywords ({FAM[f]["cv"]}), part {name.rsplit("_", 1)[1]}', None, rows)
        for name, rows in family_tables(f, 'fx'):
            phases[name] = (f'{f} native joins and owner predicates ({FAM[f]["owner_unit"]}), part {name.rsplit("_", 1)[1]}', None, rows)
        for n, r in enumerate(spec.DOMAIN[f], 1):
            if r.get('entailed'):
                phases[entailed_phase(f, r)] = (f'Entailed: {f}:{r["suffix"]}', None, [
                    (f'FD{n:02d}_{_sanitize(r["suffix"])}', f'dom.{r["suffix"]}', f'{f}:{r["suffix"]} ({r["kind"]} {r["args"]!r:.120})',
                     r['code'], tuple(r['applies']))])
    return phases


def entailed_phase(f, r):
    return f'en_{FAM[f]["slug"]}_{_sanitize(r["suffix"])}'


def entailed_proofs():
    out = {k: v() for k, v in ENTAILED.items()}
    for f in FAMILIES:
        for n, r in enumerate(spec.DOMAIN[f], 1):
            if r.get('entailed'):
                field, path, keyword = r['entailed']
                out[f'{f}:FD{n:02d}_{_sanitize(r["suffix"])}'] = _state_proof(f, field, path, keyword)
    return out


def _applies():
    out = {f: {} for f in FAMILIES}
    for phase, (_t, _a, rows) in all_phases().items():
        for r in rows:
            for f in FAMILIES:
                slug = FAM[f]['slug']
                if phase.startswith(('py_', 'fx_', 'en_')) and slug not in phase and phase not in ROWS:
                    continue
                out[f][r[1]] = r[4]
    return out


def row_applies():
    out = {}
    for phase, (_t, _a, rows) in all_phases().items():
        for r in rows:
            out[(phase, r[0])] = r[4]
    return out


# --- observation derivation --------------------------------------------------------------------------------
_KV = {}


def _kv(schema):
    """A validator for one keyword subschema (exact jsonschema semantics per keyword); cached."""
    key = json.dumps(schema, sort_keys=True)
    v = _KV.get(key)
    if v is None:
        v = _KV[key] = Draft202012Validator(schema, registry=REGISTRY)
    return v


def _py_obs(f, scope, payload):
    """Per-keyword observations of the selected payload selector; cross-checked against jsonschema on every case."""
    sel = SCHEMAS[f]['$defs'].get(SELECTOR[f][scope])
    obs = {}
    if sel is None:
        return {(f'{kw}.{k}' if k else kw): True for kw, k in py_spec(f)}, True
    is_obj = type(payload) is dict
    for kw, k in py_spec(f):
        name = f'{kw}.{k}' if k else kw
        if kw == 'closed':
            obs[name] = not is_obj or set(payload) <= set(sel['properties'])
            continue
        if kw == 'required':
            obs[name] = not is_obj or k in payload
            continue
        if not is_obj or k not in payload:
            obs[name] = True
            continue
        v, prop = payload[k], sel['properties'][k]
        if kw in ('const', 'type', 'maxLength', 'pattern', 'minimum', 'enum', 'minItems', 'uniqueItems', 'minLength'):
            obs[name] = _ok(lambda: _kv({kw: prop[kw]}).is_valid(v))
        elif kw == 'ref':
            obs[name] = _ok(lambda: _kv({'$ref': prop['$ref']}).is_valid(v))
        elif kw == 'scope_ref':
            obs[name] = _ok(lambda: V_SCOPE.is_valid(v))
        elif kw == 'scope_kind_const':
            obs[name] = _ok(lambda: _kv(prop['allOf'][1]).is_valid(v))
        elif kw == 'items_type':
            obs[name] = _ok(lambda: _kv({'items': {'type': prop['items']['type']}}).is_valid(v))
        elif kw == 'items_pattern':
            obs[name] = _ok(lambda: _kv({'items': {'pattern': prop['items']['pattern']}}).is_valid(v))
        elif kw == 'anyOf_type':
            obs[name] = _ok(lambda: _kv({'type': [b['type'] for b in prop['anyOf']]}).is_valid(v))
        elif kw.startswith('anyOf_'):
            key = kw[len('anyOf_'):]
            b0 = prop['anyOf'][0]
            obs[name] = _ok(lambda: not _kv({'type': b0['type']}).is_valid(v) or _kv({key: b0[key]}).is_valid(v))
        else:
            raise AssertionError(kw)
    whole = V_SELECTED[(f, scope)].is_valid(payload)
    assert whole == all(obs.values()), ('keyword decomposition disagrees with jsonschema', f, scope,
                                        sorted(k for k, x in obs.items() if not x))
    return obs, whole


def _int_slots(f, scope):
    """(field, minimum, maximum, nullable) of every integer slot of the selected payload, read from the schema (a const
    integer slot has minimum = maximum = the const)."""
    sel = SCHEMAS[f]['$defs'].get(SELECTOR[f][scope])
    out = []
    for k, prop in (sel or {}).get('properties', {}).items():
        if prop.get('type') == 'integer':
            out.append((k, prop.get('minimum'), prop.get('maximum'), False))
        elif type(prop.get('const')) is int:
            out.append((k, prop['const'], prop['const'], False))
        elif 'anyOf' in prop and prop['anyOf'][0].get('type') == 'integer':
            out.append((k, prop['anyOf'][0].get('minimum'), prop['anyOf'][0].get('maximum'), True))
    return tuple(out)


def _payload_integers(f, scope, payload):
    for k, minimum, maximum, nullable in _int_slots(f, scope):
        v = payload.get(k)
        if v is None and nullable:
            continue
        current_integer(v, minimum=minimum, maximum=maximum)
    return True


def _rel(kind, args, facts, payload):
    def val(path):
        if path.startswith('@payload.'):
            return payload[path[len('@payload.'):]]
        return spec._get(facts, path)
    if kind == 'is':
        return exact(val(args[0]), args[1])
    if kind == 'eq':
        return exact(val(args[0]), val(args[1]))
    if kind == 'succ':
        a, b = val(args[0]), val(args[1])
        return type(a) is int and type(b) is int and b == a + 1
    if kind == 'inn':
        return any(exact(val(args[0]), x) for x in args[1])
    if kind == 'inlist':
        return any(exact(val(args[0]), x) for x in val(args[1]))
    if kind == 'imp':
        return not exact(val(args[0]), args[1]) or exact(val(args[2]), args[3])
    if kind == 'implet':
        v = val(args[2])
        return not exact(val(args[0]), args[1]) or (type(v) is int and v <= args[3])
    if kind == 'impin':
        return not any(exact(val(args[0]), x) for x in args[1]) or exact(val(args[2]), args[3])
    if kind == 'alltrue':
        node = val(args[0])
        items = list(node.values()) if type(node) is dict else node
        return type(items) is list and len(items) > 0 and all(x is True for x in items)
    if kind == 'alleq':
        items = val(args[0])
        ref = items[0] if args[1] is None and items else (val(args[1]) if args[1] else None)
        return type(items) is list and all(exact(x, ref) for x in items)
    if kind == 'allin':
        items = val(args[0])
        return type(items) is list and len(items) > 0 and all(any(exact(x, y) for y in args[1]) for x in items)
    if kind == 'notin':
        return type(val(args[0])) is list and not any(exact(x, args[1]) for x in val(args[0]))
    if kind == 'sub':
        a, b = val(args[0]), val(args[1])
        return type(a) is list and type(b) is list and all(any(exact(x, y) for y in b) for x in a)
    if kind == 'len':
        a, b = val(args[0]), val(args[1])
        return type(a) is list and type(b) is int and len(a) == b
    if kind == 'lt':
        a, b = val(args[0]), val(args[1])
        return type(a) is int and type(b) is int and a < b
    if kind == 'noneoreq':
        a = val(args[0])
        return a is None or exact(a, val(args[1]))
    if kind == 'mapeq':
        m = val(args[0])
        return type(m) is dict and exact(m.get(val(args[1])), val(args[2]))
    if kind == 'edge':
        return (val(args[0]), val(args[1])) in args[2]
    if kind == 'jcs_sha':
        from pm_event_numbers import qualified_jcs
        return exact(val(args[1]), hashlib.sha256(qualified_jcs(val(args[0]))).hexdigest())
    raise AssertionError(kind)


_REQ_NULLABLE = {('scope', 'project_id'), ('scope', 'computer_id'), ('subject', 'thread_id'), ('subject', 'run_id')}
_REQ_DIGESTS = {('source_record_sha256',)}


def _req_leaves(node, path=()):
    if type(node) is dict:
        for k, v in node.items():
            yield from _req_leaves(v, path + (k,))
    else:
        yield path, node


def _authentic_request(w):
    """What an independent caller of this exact original would send (types and spellings only)."""
    native, ev = w['native'], w['event']
    return dict(scope=native['scope'], subject=native['subject'], source_record_ref=native['record_ref'],
                source_record_sha256=hashlib.sha256(w['source_bytes']).hexdigest(), intent=native['intent'],
                event_id=ev['event_id'], expected_currentness=w['writer']['current']['currentness'],
                receipt_selector=w['storage']['receipts'].get(ev['event_id'], {}).get('receipt_id', ''), expected_group='grp-1',
                checkpoint=dict(storage_instance_id=INSTANCE, generation_id='', frontier_revision=0, checkpoint_key=''),
                dispatch=dict(event_type='', payload_schema_id='', payload_scope='', payload_edition=''))


def observe(w):
    """Observations for every table of one boundary input. Returns (obs, logical_event_or_None)."""
    f, scope, b = w['family'], w['scope'], w['boundary']
    ev, stored, sto, native, req = w['event'], w['stored'], w['storage'], w['native'], w['request']
    reg = w['registry']
    obs = {}
    selected = payload_schema_id(f, scope)
    # ad --------------------------------------------------------------------------------------------------
    obs['membership'] = reg['family_admitted'] is True
    obs['membership_selector'] = reg['selectors'].get(selected) is True
    obs['retention'] = type(reg['retention'].get(f)) is str and reg['retention'][f] in RETENTION_POLICIES
    obs['withdrawal'] = selected not in reg['withdrawn']
    # sc --------------------------------------------------------------------------------------------------
    obs['reference_closure'] = reference_closure(tuple(reg['resources']))  # world 'resources': excluded paths
    auth = _authentic_request(w)
    leaves = dict(_req_leaves(req))
    auth_leaves = dict(_req_leaves(auth))
    obs['exact_types'] = set(leaves) == set(auth_leaves) and all(
        type(v) is type(auth_leaves[p]) or (p in _REQ_NULLABLE and type(v) in (str, type(None))) for p, v in leaves.items())
    types_ok = obs['exact_types']
    obs['identifier_fullmatch'] = not types_ok or all(
        (HEX64 if p in _REQ_DIGESTS else REF_GRAMMAR).fullmatch(v) is not None
        for p, v in leaves.items() if type(v) is str and p[0] != 'dispatch')
    req_ok = types_ok and obs['identifier_fullmatch']
    obs['identifier_spelling'] = not req_ok or req['source_record_ref'] == native['record_ref']
    # pf --------------------------------------------------------------------------------------------------
    sp, sref = stored.get('payload'), stored.get('payload_ref')
    inline = type(sp) is dict and sref is None
    external = sp is None and type(sref) is str
    obs['form_exclusive'] = inline or external
    m = re.fullmatch(r'payload:v1:([0-9a-f]{64})', sref) if external else None
    obs['route_id'] = not external or m is not None
    pack = sto['packs'].get(m.group(1)) if m else None
    obs['pack_present'] = m is None or type(pack) is dict
    p_ok = m is not None and type(pack) is dict
    obs['pack_synced'] = not p_ok or (pack['pack_synced'] is True and pack['index_synced'] is True)
    obs['payload_form'] = not p_ok or blake3(pack['bytes']).hexdigest() == m.group(1)
    obs['pack_media'] = not p_ok or pack['media_type'] == MEDIA
    obs['pack_decodes'] = not p_ok or _ok(lambda: type(decode_storage_value(pack['bytes'], profile=EVENT_VALUE)) is dict)
    if p_ok and all(obs[k] for k in ('pack_synced', 'payload_form', 'pack_media', 'pack_decodes')):
        verify_payload_bytes(pack['bytes'], byte_size=len(pack['bytes']), payload_id=m.group(1), media_type=pack['media_type'],
                             expected_media_type=MEDIA)   # shared SP-337 arithmetic must agree (no custody proof)
    obs['physical_value'] = _ok(lambda: storage_value_bytes(stored, profile=EVENT_VALUE) is not None)
    obs['value_size'] = not inline or not obs['physical_value'] or _ok(
        lambda: len(storage_value_bytes(sp, profile=EVENT_VALUE)) <= INLINE_LIMIT)
    obs['stored_size'] = not obs['physical_value'] or not obs['value_size'] or _ok(
        lambda: len(storage_value_bytes(stored, profile=EVENT_VALUE)) <= INLINE_LIMIT)
    form_ok = all(obs[k] for k in ('form_exclusive', 'route_id', 'pack_present', 'pack_synced', 'payload_form', 'pack_media',
                                   'pack_decodes', 'physical_value', 'value_size', 'stored_size'))
    # the logical event: inline body, or the decoded pack body with the payload:v1 ref kept
    logical = None
    if form_ok:
        logical = copy.deepcopy(stored)
        if external:
            logical['payload'] = decode_storage_value(pack['bytes'], profile=EVENT_VALUE)
        assert exact_or_float(logical['payload'], ev['payload']), 'materialized payload is not the event payload'
    payload = logical['payload'] if logical is not None else None
    # py --------------------------------------------------------------------------------------------------
    if logical is not None:
        pobs, py_ok = _py_obs(f, scope, payload)
    else:
        pobs, py_ok = {(f'{kw}.{k}' if k else kw): True for kw, k in py_spec(f)}, False
    obs.update(pobs)
    # en --------------------------------------------------------------------------------------------------
    have = logical is not None and py_ok
    lev = logical if have else {}
    obs['envelope_schema'] = not have or V_ENVELOPE.is_valid(lev)
    obs['family_type'] = not have or lev.get('event_type') == f
    obs['payload_schema_id'] = not have or exact(lev.get('payload_schema_id'), payload.get('schema_id'))
    policy = lev.get('replay_policy')
    current = b in CUR
    obs['replay_only_writer'] = not have or not current or _ok(lambda: current_append_policy(policy) is not None) \
        or policy != 'projector_replay_only'
    obs['replay_family'] = not have or policy == 'dedupe_by_idempotency_key' or (policy == 'projector_replay_only' and
                                                                                 (b == HI or current))
    obs['migration_null'] = not have or (type(lev.get('migration')) is dict and all(v is None for v in lev['migration'].values()))
    obs['redaction_family'] = not have or lev.get('redaction_profile') == 'secret_refs_only'
    env_ok = have and all(obs[k] for k in ('envelope_schema', 'family_type', 'payload_schema_id', 'replay_only_writer',
                                           'replay_family', 'migration_null', 'redaction_family'))
    # nm --------------------------------------------------------------------------------------------------
    sealed = sealed_at(w)
    current_recipe = b not in (HI, RS) or (len(sealed) == 1 and _ok(lambda: RecipeTuple(**sealed[0]['recipe']) == RECIPES[(f, scope, 'current')]))
    receipt = sto['receipts'].get(lev.get('event_id')) if env_ok else None
    obs['sequence_uint64'] = not env_ok or _ok(lambda: storage_uint64(lev['sequence_id']) is not None)
    psq = lev.get('producer_sequence_id')
    obs['producer_sequence'] = not env_ok or psq is None or _ok(lambda: current_integer(psq, minimum=0) is not None)
    obs['payload_integers'] = not env_ok or not current_recipe or _ok(lambda: _payload_integers(f, scope, payload))
    pre_route = env_ok and obs['sequence_uint64'] and obs['producer_sequence'] and obs['payload_integers']
    obs['producer_route'] = not pre_route or not current_recipe or _ok(lambda: producer_semantic_bytes(lev) is not None)
    obs['receipt_uint64'] = type(receipt) is not dict or _ok(lambda: storage_uint64(receipt['sequence_id']) is not None)
    token = w['checkpoint']['live_token']
    obs['frontier_uint64'] = b not in (HI, RS) or _ok(lambda: storage_uint64(token.get('frontier_revision')) is not None)
    nm_ok = env_ok and all(obs[k] for k in ('sequence_uint64', 'producer_sequence', 'payload_integers', 'producer_route',
                                           'receipt_uint64', 'frontier_uint64'))
    # tm --------------------------------------------------------------------------------------------------
    obs['occurred_clock'] = not env_ok or clock(lev['occurred_at_utc'], EVENT_RECORD)
    obs['observed_clock'] = not env_ok or clock(lev['observed_at_utc'], STORAGE_UTC_Z)
    obs['persisted_clock'] = not env_ok or clock(lev['persisted_at_utc'], STORAGE_UTC_Z)
    obs['ack_clock'] = type(receipt) is not dict or clock(receipt.get('acknowledged_at_utc'), STORAGE_UTC_Z)
    full = nm_ok and all(obs[k] for k in ('occurred_clock', 'observed_clock', 'persisted_clock', 'ack_clock')) \
        and obs['reference_closure']
    # src -------------------------------------------------------------------------------------------------
    digest = hashlib.sha256(w['source_bytes']).hexdigest()
    obs['source_custody'] = w['issued']['records'].get(native['record_ref']) == digest
    obs['source_receipt_issued'] = w['issued']['receipts'].get(native['receipt_ref']) == native['record_ref']
    obs['source_digest'] = not req_ok or req['source_record_sha256'] == digest
    obs['source_issuer'] = native['issuer'] == PRODUCER[f]
    obs['source_schema'] = (native['schema_id'], native['schema_version']) == SOURCE_SCHEMA[f].get(scope)
    # pj / ej (event-side joins; need a complete well-formed event) ---------------------------------------------
    nscope, nsubj = native['scope'], native['subject']
    obs['payload_operation'] = not full or payload['owner_operation_id'] == native['operation_id']
    obs['payload_scope'] = not full or exact(payload['scope'], workflow_scope(nscope))
    obs['payload_record_ref'] = not full or payload['source_record_ref'] == native['record_ref']
    obs['payload_record_sha256'] = not full or payload['source_record_sha256'] == digest
    obs['payload_source_schema_id'] = not full or payload['source_schema_id'] == native['schema_id']
    obs['payload_source_schema_version'] = not full or payload['source_schema_version'] == native['schema_version']
    obs['payload_receipt_ref'] = not full or payload['source_receipt_ref'] == native['receipt_ref']
    for field, src in (('env_project_id', nscope['project_id']), ('env_thread_id', nsubj['thread_id']),
                       ('env_run_id', nsubj['run_id']), ('env_node_id', None), ('env_attempt_id', None),
                       ('env_actor', native['actor_ref']), ('env_requested_account', None), ('env_effective_account', None),
                       ('env_occurred_at', native['accepted_at_utc']), ('env_producer_sequence', native['producer_sequence_id']),
                       ('env_correlation', native['correlation_id']), ('env_causation', None), ('env_parent', None),
                       ('env_scope_kind', nscope['scope_kind'])):
        key = {'env_project_id': 'project_id', 'env_thread_id': 'thread_id', 'env_run_id': 'run_id', 'env_node_id': 'node_id',
               'env_attempt_id': 'attempt_id', 'env_actor': 'actor_ref', 'env_requested_account': 'requested_account_ref',
               'env_effective_account': 'effective_account_ref', 'env_occurred_at': 'occurred_at_utc',
               'env_producer_sequence': 'producer_sequence_id', 'env_correlation': 'correlation_id',
               'env_causation': 'causation_event_id', 'env_parent': 'parent_event_id', 'env_scope_kind': 'scope_kind'}[field]
        obs[field] = not full or exact(lev[key], src)
    # sj (request components) ---------------------------------------------------------------------------------
    for field, (grp, key) in (('req_scope_kind', ('scope', 'scope_kind')), ('req_scope_partition', ('scope', 'scope_partition')),
                              ('req_project_id', ('scope', 'project_id')), ('req_server_id', ('scope', 'server_id')),
                              ('req_computer_id', ('scope', 'computer_id')), ('req_subject_id', ('subject', 'subject_id')),
                              ('req_thread_id', ('subject', 'thread_id')), ('req_run_id', ('subject', 'run_id'))):
        obs[field] = not req_ok or exact(req[grp][key], native[grp][key])
    # wr --------------------------------------------------------------------------------------------------
    wr, cur = w['writer'], w['writer']['current']
    obs['writer_currentness'] = not current or not req_ok or req['expected_currentness'] == cur['currentness']
    obs['write_lease'] = not current or wr['lease']['held'] is True
    obs['write_lease_scope'] = not current or wr['lease']['held'] is not True or (
        wr['lease']['partition'] == nscope['scope_partition'] and wr['lease']['store'] == sto['instance'])
    obs['write_permission'] = not current or wr['permission'] is True
    obs['writer_owner'] = not current or wr['owner'] == cur['owner']
    obs['writer_epoch'] = not current or exact(wr['captured_epoch'], cur['epoch'])
    obs['writer_cas'] = not current or wr['expected_preimage'] == cur['preimage']
    obs['writer_intent'] = not current or not req_ok or req['intent'] == native['intent']
    obs['writer_stop_epoch'] = not current or exact(wr['captured_stop_epoch'], cur['stop_epoch'])
    obs['writer_stop_blocked'] = not current or cur['stop'] is None or f in spec.STOP_PERMITTED
    obs['writer_final_fence'] = not current or wr['lease']['held'] is not True or wr['fence_after']['lease_held'] is True
    # id --------------------------------------------------------------------------------------------------
    recipe_id = event_id_of(sto['instance'], nscope['scope_partition'], f, native['operation_id'])
    obs['identity_recipe'] = not full or lev['event_id'] == recipe_id
    obs['identity_request'] = not req_ok or req['event_id'] == recipe_id
    key = lev.get('idempotency_key')
    app_grammar = scope != 'application' or (type(key) is str and APP_KEY.fullmatch(key) is not None)
    obs['application_key'] = not full or app_grammar
    obs['identity_idempotency'] = not full or not app_grammar or key == idempotency_key_of(f, nscope['scope_kind'],
                                                                                            nscope['server_id'], native['operation_id'])
    full = full and obs['identity_recipe'] and obs['application_key'] and obs['identity_idempotency']
    # st --------------------------------------------------------------------------------------------------
    issued = sto['issued'].get(lev.get('event_id'), {}) if full else {}
    obs['sequence_issued'] = not full or exact(lev['sequence_id'], issued.get('sequence_id'))
    obs['observed_issued'] = not full or exact(lev['observed_at_utc'], issued.get('observed_at_utc'))
    obs['persisted_issued'] = not full or exact(lev['persisted_at_utc'], issued.get('persisted_at_utc'))
    has_r = full and type(receipt) is dict
    obs['receipt_custody'] = not full or not req_ok or (has_r and req['receipt_selector'] == receipt['receipt_id'])
    obs['receipt_event'] = not has_r or receipt['full_value_commitment'] == _commit(lev)
    obs['receipt_group'] = not has_r or not req_ok or req['expected_group'] == receipt['commit_group_id']
    obs['group_member'] = not has_r or lev['event_id'] in sto['groups'].get(receipt['commit_group_id'], [])
    obs['receipt_sequence'] = not has_r or exact(receipt['sequence_id'], lev['sequence_id'])
    # ry --------------------------------------------------------------------------------------------------
    retry = b == RT and full
    res = w['retry']['resolution']
    obs['retry_conflict'] = not retry or _ok(lambda: producer_semantic_digest(w['retry']['incoming']) == producer_semantic_digest(lev))
    obs['no_second_effect'] = not retry or exact(res['effects_delta'], 0)
    obs['retry_original_result'] = not retry or res['result_ref'] == native['result_ref']
    obs['retry_first_receipt'] = not retry or not has_r or exact(res['receipt'], receipt)
    # fx (family joins and owner predicates) -------------------------------------------------------------------
    facts = native['facts']
    for k in join_fields(f):
        obs[f'join.{k}'] = not full or exact(payload[k], spec.payload_value(facts, spec.PAYLOAD[f][k], nsubj['thread_id']))
    for r in spec.DOMAIN[f]:
        obs[f'dom.{r["suffix"]}'] = b not in r['applies'] or not full or _ok(lambda: _rel(r['kind'], r['args'], facts, payload))
    # rr (retained original: sealed receipt only) ---------------------------------------------------------------
    hist = b in (HI, RS) and full
    s = sealed[0] if len(sealed) == 1 else None
    obs['sealed_present'] = not hist or len(sealed) >= 1
    obs['sealed_unique'] = not hist or len(sealed) <= 1
    bound = s is not None and _ok(lambda: OriginalBinding(**s['binding']) == binding_of(w))
    obs['sealed_binding'] = not hist or s is None or bound
    known = s is not None and _ok(lambda: RecipeTuple(**s['recipe']) in FROZEN)
    obs['recipe_known'] = not hist or s is None or not bound or known
    tuple_ok = known and _ok(lambda: RecipeTuple(**s['recipe']) in (RECIPES[(f, scope, 'current')], RECIPES[(f, scope, LEGACY)]))
    obs['recipe_edition'] = not hist or s is None or not bound or not known or tuple_ok
    obs['original_admission'] = not hist or s is None or not bound or s.get('admitted') is True
    obs['original_verified'] = not hist or not tuple_ok or not obs['original_admission'] or _ok(
        lambda: RetainedDispatcher(W3GOriginalOwner(w), FROZEN).resolve(lev['event_id'], binding_of(w), disclose=lambda x: True)
        is not None)
    # rd --------------------------------------------------------------------------------------------------
    rd = b in (HI, RS) and full
    rdr, ck = w['reader'], w['checkpoint']
    obs['read_permission'] = not rd or rdr['permission'] is True
    obs['not_deleted'] = not rd or lev['event_id'] not in sto['tombstones']
    obs['restriction_ok'] = not rd or all(x in rdr['clearances'] for x in native['restrictions'])
    disp = req['dispatch']
    obs['dispatch_event_type'] = not rd or not req_ok or disp['event_type'] == lev['event_type']
    obs['dispatch_schema_id'] = not rd or not req_ok or disp['payload_schema_id'] == lev['payload_schema_id']
    obs['dispatch_scope'] = not rd or not req_ok or disp['payload_scope'] == lev['scope_kind']
    obs['dispatch_edition'] = not rd or not req_ok or disp['payload_edition'] == payload['schema_version']
    live, stored_token = ck['live_token'], ck['stored_token']
    exp = req['checkpoint']
    obs['ckpt_instance'] = not rd or not req_ok or exp['storage_instance_id'] == live.get('storage_instance_id')
    obs['ckpt_generation'] = not rd or not req_ok or exp['generation_id'] == live.get('generation_id')
    obs['ckpt_frontier'] = not rd or not req_ok or exact(exp['frontier_revision'], live.get('frontier_revision'))
    obs['ckpt_scope'] = not rd or not req_ok or exp['checkpoint_key'] == live.get('checkpoint_key')
    obs['durable_token'] = not rd or tuple(stored_token) == DURABLE_TOKEN_FIELDS
    obs['token_snapshot'] = not rd or live.get('redb_snapshot_id') == ck['read_txn']['snapshot_id']
    obs['token_join'] = not rd or not obs['durable_token'] or exact({k: v for k, v in live.items() if k != 'redb_snapshot_id'},
                                                                    stored_token)
    cov = ck['coverage']
    frontier = live.get('frontier_revision')
    obs['coverage'] = not rd or (type(cov) is list and len(cov) > 0 and cov[0][0] == 0 and type(frontier) is int
                                 and all(cov[i][1] + 1 == cov[i + 1][0] for i in range(len(cov) - 1)) and cov[-1][1] >= frontier)
    obs['coverage_current'] = not rd or live.get('source_selection', {}).get('current_bytes_sha256') == \
        hashlib.sha256(sto['current_bytes']).hexdigest()
    for k in ('domain', 'external', 'notification', 'charge'):
        obs[f'passive_{k}'] = not rd or exact(rdr['effects'][k], 0)
    # rs --------------------------------------------------------------------------------------------------
    rsb = b == RS
    rest = w['restore']
    obs['restore_native'] = not rsb or rest['native_sha256'] == digest
    obs['restore_result'] = not rsb or rest['result_ref'] == native['result_ref']
    obs['restore_group'] = not rsb or rest['group'] == ['grp-1', ev['event_id']]
    obs['restore_payload'] = not rsb or sorted(sto['packs']) == rest['payload_digests']
    obs['restore_identity'] = not rsb or rest['identity'] == {ev['event_id']: native['operation_id']}
    obs['restore_tombstones'] = not rsb or not any(x in sto['tombstones'] for x in rest['visible'])
    for field, applies in APPLIES[f].items():
        if not (b in applies or (b == RS and HI in applies)):
            obs[field] = True
    return obs, (lev if full else None)


def exact_or_float(a, b):
    """Materialized-payload agreement (msgpack keeps every typed value; floats stay floats)."""
    return exact(a, b)


APPLIES = _applies()
RETENTION_POLICIES = frozenset(p for v in RETENTION.values() for p in v.values())
COMMON_ORDER = ('ad', 'sc', 'pf')


def order(w):
    b = w['boundary']
    seq = COMMON_ORDER + tuple(n for n, _ in family_tables(w['family'], 'py')) + ('en', 'nm', 'tm', 'src', 'pj', 'ej',
                                                                                  'en_scope_kind', 'sj')
    if b in CUR:
        seq += ('wr',)
    seq += ('id', 'st')
    if b == RT:
        seq += ('ry',)
    seq += tuple(n for n, _ in family_tables(w['family'], 'fx')) + tuple(
        entailed_phase(w['family'], r) for r in spec.DOMAIN[w['family']] if r.get('entailed'))
    if b in (HI, RS):
        seq += ('rr', 'en_original_verified', 'rd')
    if b == RS:
        seq = ('rs',) + seq
    return seq


def check(w):
    """Complete check of one boundary input: None (accepted) or the first refusal (phase, row, code)."""
    with exact_integer_digits():
        obs, _ = observe(w)
        for phase in order(w):
            first = refusal(phase, obs)
            if first is not None:
                return first
    return None


def retained_read(w):
    """('available', event) or ('unavailable'|'unsupported', refusal). Never creates a receipt or alters bytes.
    The recipe comes only from the independently sealed receipt of this exact original."""
    assert w['boundary'] == HI
    first = check(w)
    if first is not None:
        return ('unsupported' if first[2] in ('recipe_unsupported', 'recipe_ambiguous') else 'unavailable', first)
    custody = RetainedDispatcher(W3GOriginalOwner(w), FROZEN).resolve(w['event']['event_id'], binding_of(w), disclose=lambda x: True)
    assert custody.binding == binding_of(w)
    return ('available', w['event'] if w['query']['subject_id'] == w['native']['subject']['subject_id'] else None)


def assert_fields_unique():
    seen = {}
    for phase, (_t, _a, rows) in all_phases().items():
        for r in rows:
            fam = phase.split('_', 1)[1] if phase.startswith(('py_', 'fx_')) else None
            key = (fam, r[1])
            assert key not in seen, ('observation field shared by two rows', r[0], seen.get(key))
            seen[key] = r[0]
    return True


# --- timestamp inventory (item 12): every date-time field the lane's stored values carry ------------------------
TIMESTAMP_FIELDS = {
    ('EventRecord', 'occurred_at_utc'): (EVENT_RECORD, 'TM01_occurred_clock', 'CV-1101 broad EventRecord profile'),
    ('EventRecord', 'observed_at_utc'): (STORAGE_UTC_Z, 'TM02_observed_clock', 'CV-253 Storage strict profile'),
    ('EventRecord', 'persisted_at_utc'): (STORAGE_UTC_Z, 'TM03_persisted_clock', 'CV-253 Storage strict profile'),
    ('AppendReceipt', 'acknowledged_at_utc'): (STORAGE_UTC_Z, 'TM04_ack_clock', 'SP-347 / CV-253 Storage strict profile'),
}


def timestamp_inventory():
    """The W3G payload selectors declare no timestamp (CV-15xx: "No payload timestamp is added"); the envelope's three
    date-time fields and the receipt acknowledgement are the only clocks a W3G stored value carries."""
    found = set()

    def formats(node, path=()):
        if isinstance(node, dict):
            if type(node.get('format')) is str:
                yield path, node['format']
            for k, v in node.items():
                if k in ('properties', '$defs'):
                    for name, sub in v.items():
                        yield from formats(sub, path + (name,))
                elif k not in ('const', 'enum', 'format'):
                    yield from formats(v, path)
        elif isinstance(node, list):
            for x in node:
                yield from formats(x, path)
    for f in FAMILIES:
        declared = list(formats(SCHEMAS[f]))
        assert declared == [], ('payload format declared', f, declared)
        names = [k for d in SCHEMAS[f]['$defs'].values() for k in d['properties']]
        assert not any(k.endswith('_at_utc') or k.endswith('_at') for k in names), ('payload clock field', f)
    for k, v in ENVELOPE['properties'].items():
        if v.get('$ref') == '#/$defs/date_time_string':
            found.add(('EventRecord', k))
    found.add(('AppendReceipt', 'acknowledged_at_utc'))
    assert found == set(TIMESTAMP_FIELDS), sorted(found ^ set(TIMESTAMP_FIELDS))
    return {f'{a}.{b}': dict(profile=v[0], row=v[1], owner=v[2]) for (a, b), v in TIMESTAMP_FIELDS.items()}
