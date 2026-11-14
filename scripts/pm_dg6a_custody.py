"""SP-1101 retained-original dispatch for the DG6A readers (sweep part 2B).

Every DG6A retained read (the history reader of all sixteen families) and every
retained retry (alert and panel retries of a committed or settled operation)
first resolves its original through the shared RetainedDispatcher
(scripts/pm_event_numbers.py, gated NUMRULE head 58c2816ff3). The dispatcher
asks the composition-installed original owner (DG6AOriginalOwner) for custody of
the original at its event_ref, joins the owner's sealed binding to the binding
the reader expects, and runs the frozen verifier installed for the sealed
RecipeTuple. The recipe, and with it the frozen payload edition and its exact
schema validator, comes from that custody: never from the request, a caller
flag or the original's own copy of its edition. There is no current-then-legacy
probing and no caller override.

Static stand-in (native custody NOT_RUN). Storage's sealed custody is SEALED:
original_ref -> {SHA-256 of the original's SP-1100 EVENT_VALUE bytes: (binding,
recipe)}. Composition seals the committed positive originals of the sixteen
DG6A fixture files on first use (`_install`); a test that models a different
Storage history declares it with `written(...)`. A reader never seals.

Frozen recipes (one per installed payload edition, pinned by the SHA-256 of the
edition's exact schema bytes):
- the DG6A prepared editions (alert x4 1.0.0, panel x2 2.0.0, concern.created
  1.0.0, Card 5 current editions): no original was written before them, so the
  recipe in force is the current one: the lane validator (CV-1100 exact
  integers, CV-1101 EventRecord date-time predicate) and the recomputed event
  identity of the family's owner unit;
- the earlier editions that predate the lane (panel v1 1.0.0 and the Card 5
  concern legacy v1 editions, both unchanged since 2026-09-02): their original
  schema's own Draft 2020-12 type and number validation, so an integral float
  that schema admitted stays readable, with the CV-1101 date-time predicate
  installed (a skipped format check never authenticates invalid history), and
  the original event id retained exactly (no recomputation recipe is recorded
  for those writers).
"""
import contextlib
import copy
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
from jsonschema import Draft202012Validator  # noqa: E402
from pm_event_numbers import (EVENT_VALUE, FrozenRecipe, OriginalBinding, OriginalCustody,  # noqa: E402
                              RecipeTuple, Refusal, RetainedDispatcher, decode_storage_value,
                              loads_current_json, storage_value_bytes)


def _module(name, path):
    module = sys.modules.get(name)
    if module is None:
        spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[name] = module
        spec.loader.exec_module(module)
    return module


domain = _module('pm_dg6a_custody_domain', 'pm-dg6a-domain.py')
_codec = _module('pm_dg6a_custody_codec', 'pm-implementation-readiness.py')

# The static model has one local Server; DG6A's retained original evidence carries no server_id.
SERVER_ID = 'dg6a-static-local-server'
ENVELOPE = ('pm.event.v0', '2.0.0')
IDENTITY_H4 = 'dg6a.event_id.sha256_msgpack[storage_instance_id,project_id,event_type,idempotency_key].v1'
IDENTITY_PANEL = 'dg6a.event_id.sha256_msgpack[storage_instance_id,server_id,scope_partition,app_session_id,event_type,idempotency_key].v1'
IDENTITY_LEGACY = 'legacy.original_event_id.retained_exactly.v1'
PRODUCER = 'cv317-producer-semantic-qualified-rfc8785-v1'
FULL_VALUE = 'pm.storage.original_event_value_commitment.v1'
LOCAL_SOURCE = 'dg6a.original_source.sha256_event_value_bytes.v1'
PAYLOAD_CURRENT = 'dg6a.payload.lane_validator.cv1100_cv1101.v1'
PAYLOAD_LEGACY = 'dg6a.payload.original_draft2020_types.cv1101.v1'
CUSTODY_FACTS = ('original_located', 'original_authentic', 'binding_exact', 'recipe_installed', 'original_verified')
_STEP = {'original_query': 0, 'original_unavailable': 0, 'original_authority': 1, 'original_binding': 2,
         'recipe_selection': 3, 'recipe_unknown': 3, 'original_bytes_type': 4, 'original_verification': 4}


def load(path):
    return loads_current_json((ROOT / path).read_text())


def _text(value):
    """A binding/recipe string field: the value itself, or an explicit marker (never raises)."""
    return value if type(value) is str and value else 'malformed:' + type(value).__name__


class Edition:
    """One installed payload edition: its exact schema resource, owner and frozen recipe parameters."""

    def __init__(self, event_type, path, owner, identity, legacy):
        self.event_type, self.path, self.owner, self.identity, self.legacy = event_type, path, owner, identity, legacy
        raw = (ROOT / path).read_bytes()
        self.schema = loads_current_json(raw.decode('utf-8'))
        self.schema_id = self.schema['properties']['schema_id']['const']
        self.version = self.schema['properties']['schema_version']['const']
        self.resource_sha256 = hashlib.sha256(json.dumps([path, hashlib.sha256(raw).hexdigest()],
                                                         separators=(',', ':')).encode('ascii')).hexdigest()
        if legacy:
            # Original Draft 2020-12 type/number semantics; the CV-1101 predicate is installed explicitly.
            self.validator = domain.ExactSchemaValidator(Draft202012Validator(self.schema, format_checker=domain.FORMATS))
        else:
            self.validator = domain.validator(self.schema)

    def recipe(self, resource_sha256=None):
        return RecipeTuple(
            envelope_schema_id=ENVELOPE[0], envelope_schema_version=ENVELOPE[1], payload_schema_id=self.schema_id,
            payload_schema_version=self.version, owner_source_id=self.owner, owner_edition=self.version,
            registry_revision='prepared_without_admission', identity_recipe=self.identity, producer_recipe=PRODUCER,
            physical_profile=EVENT_VALUE, full_value_profile=FULL_VALUE, local_source_profile=LOCAL_SOURCE,
            payload_profile=PAYLOAD_LEGACY if self.legacy else PAYLOAD_CURRENT,
            resource_manifest_sha256=resource_sha256 or self.resource_sha256)


def _editions():
    editions = []
    for family in load('Plans/alert_event_contracts/manifest.json')['families']:
        editions.append(Edition(family['event_type'], family['payload_schema'], 'Plans/Contracts_V0.md#' + family['cv'],
                                IDENTITY_H4, False))
    for family in load('Plans/panel_event_contracts/manifest.json')['families']:
        owner = 'Plans/Contracts_V0.md#' + family['cv']
        editions.append(Edition(family['event_type'], family['payload_schema'], owner, IDENTITY_PANEL, False))
        editions.append(Edition(family['event_type'], f"Plans/event_payloads/{family['slug']}.schema.json", owner,
                                IDENTITY_LEGACY, True))
    for family in load('Plans/concern_created_contracts/manifest.json')['families']:
        editions.append(Edition(family['event_type'], family['payload_schema'], 'Plans/Contracts_V0.md#' + family['cv'],
                                IDENTITY_H4, False))
    for family in load('Plans/card5_event_contracts/manifest.json')['families']:
        owner = 'Plans/card5_event_contracts/manifest.json#' + family['event_type']
        current = IDENTITY_H4 if family['disposition'] == 'CURRENT_WRITER_PREPARED' else IDENTITY_LEGACY
        editions.append(Edition(family['event_type'], family['payload_schema'], owner, current, False))
        if family['event_type'].startswith('concern.'):
            editions.append(Edition(family['event_type'], f"Plans/event_payloads/concern/{family['slug']}.schema.json",
                                    owner, IDENTITY_LEGACY, True))
    return editions


EDITIONS = {(e.event_type, e.schema_id, e.version): e for e in _editions()}
assert len(EDITIONS) == 24, len(EDITIONS)


def expected_event_id(identity, record):
    """The family owner's event identity recomputed from the original record (current editions only)."""
    payload = record['payload']
    if identity == IDENTITY_H4:
        parts = [record['storage_instance_id'], record['project_id'], record['event_type'], payload['idempotency_key']]
    else:
        parts = [record['storage_instance_id'], payload['server_id'], record['scope_partition'], payload['app_session_id'],
                 record['event_type'], payload['idempotency_key']]
    digest = hashlib.sha256(_codec.canonical_messagepack_bytes(parts)).hexdigest()
    return 'evt_' + record['event_type'].replace('.', '_') + '_' + digest


def _verifier(edition, recipe):
    """The frozen verifier of one edition: recompute the original's commitment, family and identity from its bytes.

    An original whose payload is not an object is not an event of any installed edition and refuses here.

    It applies no current writer or live-state guard; the exact payload validation under the frozen edition runs
    in the reader with this recipe's validator (HG15 / RR04), selected from the same custody."""
    def verify(custody):
        try:
            record = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
        except (Refusal, ValueError, TypeError):
            return False
        if type(record) is not dict or type(record.get('payload')) is not dict:
            return False
        if hashlib.sha256(custody.record_bytes).hexdigest() != custody.binding.source_commitment:
            return False
        if record.get('event_type') != edition.event_type or custody.recipe != recipe:
            return False
        if edition.identity == IDENTITY_LEGACY:
            return True
        try:
            return record.get('event_id') == expected_event_id(edition.identity, record)
        except (KeyError, TypeError, ValueError):
            return False
    return FrozenRecipe(verify)


RECIPES = {}
FROZEN = {}
for _edition in EDITIONS.values():
    _tuple = _edition.recipe()
    RECIPES[_tuple] = _verifier(_edition, _tuple)
    FROZEN[_tuple] = _edition


def recipe_of(original):
    """The write-time recipe tuple Storage records for an original (writer side): its family's installed edition
    tuple, or a tuple naming a resource the composition never installed (an unknown edition)."""
    payload = original.get('payload') if type(original) is dict else None
    payload = payload if type(payload) is dict else {}
    key = (original.get('event_type') if type(original) is dict else None, payload.get('schema_id'), payload.get('schema_version'))
    edition = EDITIONS.get(key) if all(type(k) is str for k in key) else None
    if edition is not None:
        return edition.recipe()
    unknown = hashlib.sha256(json.dumps([_text(k) for k in key], separators=(',', ':')).encode('utf-8')).hexdigest()
    return RecipeTuple(
        envelope_schema_id=ENVELOPE[0], envelope_schema_version=ENVELOPE[1], payload_schema_id=_text(key[1]),
        payload_schema_version=_text(key[2]), owner_source_id='uninstalled#' + _text(key[0]), owner_edition=_text(key[2]),
        registry_revision='prepared_without_admission', identity_recipe='uninstalled', producer_recipe=PRODUCER,
        physical_profile=EVENT_VALUE, full_value_profile=FULL_VALUE, local_source_profile=LOCAL_SOURCE,
        payload_profile='uninstalled', resource_manifest_sha256=unknown)


def record_bytes(original):
    """The original's SP-1100 EVENT_VALUE bytes, or None when it has no such encoding."""
    try:
        return storage_value_bytes(original, profile=EVENT_VALUE)
    except (Refusal, ValueError, TypeError):
        return None


def binding_of(original, raw):
    """The SP-1101 binding of an original, projected from the original itself (never raises)."""
    get = original.get
    payload = get('payload') if type(get('payload')) is dict else {}
    receipt = get('receipt') if type(get('receipt')) is dict else {}
    application = get('scope_partition') == 'app'
    return OriginalBinding(
        storage_instance_id=_text(get('storage_instance_id')), scope_kind='application' if application else 'project',
        server_id=SERVER_ID, project_id=None if application else _text(get('project_id')),
        event_type=_text(get('event_type')), event_id=_text(get('event_id')),
        idempotency_key=_text(payload.get('idempotency_key')),
        owner_operation_id=_text(receipt.get('original_append_result_ref')),
        source_commitment=hashlib.sha256(raw).hexdigest())


SEALED = {}
_INSTALLED = []


def _seal(into, original, recipe=None, binding=None):
    raw = record_bytes(original)
    assert raw is not None, 'a sealed original has EVENT_VALUE bytes'
    into.setdefault(original['event_ref'], {})[hashlib.sha256(raw).hexdigest()] = (
        binding or binding_of(original, raw), recipe or recipe_of(original))


def _card5_positive_originals(fixture):
    yield fixture['bases']['history']['expected']['event']
    for case in fixture['cases']:
        if case['stage'] != 'history' or case['expected']:
            continue
        value = copy.deepcopy(fixture['bases'][case['base']])
        for patch in case['patches']:
            if not patch['path']:
                value = copy.deepcopy(patch['value'])
                continue
            target = value
            for part in patch['path'][:-1]:
                target = target[part]
            target[patch['path'][-1]] = copy.deepcopy(patch['value'])
        yield value['expected']['event']


def committed_originals():
    """The originals the committed DG6A fixture files record as written (positive history and append evidence)."""
    for folder in ('alert_event_contracts', 'panel_event_contracts', 'concern_created_contracts'):
        for family in load(f'Plans/{folder}/manifest.json')['families']:
            fixture = load(f"Plans/{folder}/{family['slug']}.fixtures.json")
            yield fixture['history']['expected']['event']
            yield fixture['append_resolution']
            if 'historical_history' in fixture:
                yield fixture['historical_history']['expected']['event']
    for family in load('Plans/card5_event_contracts/manifest.json')['families']:
        yield from _card5_positive_originals(load(family['fixture']))


def _install():
    """Composition, once per process: seal every committed positive original."""
    if not _INSTALLED:
        for original in committed_originals():
            _seal(SEALED, original)
        _INSTALLED.append(True)


@contextlib.contextmanager
def written(originals, recipe=None, binding=None):
    """A test's Storage history: for the block, Storage also holds these originals at their refs, sealed with
    their own write-time recipe (or the given recipe/binding, to model a mis-sealed or replaced record).
    Only test drivers use it; no reader does."""
    _install()
    saved = {}
    for original in originals:
        ref = original['event_ref']
        if ref not in saved:
            saved[ref] = copy.copy(SEALED.get(ref))
        _seal(SEALED, original, recipe, binding)
    try:
        yield
    finally:
        for ref, entries in saved.items():
            if entries is None:
                SEALED.pop(ref, None)
            else:
                SEALED[ref] = entries


class DG6AOriginalOwner:
    """Storage's custody at one original ref (static stand-in): it authenticates the bytes the reader fetched
    there against what was sealed at write time and returns them with the sealed binding and recipe."""

    def __init__(self, raw):
        self.raw = raw

    def authenticated_original(self, original_ref):
        sealed = SEALED.get(original_ref)
        if not sealed:
            raise Refusal('original_unavailable')
        entry = sealed.get(hashlib.sha256(self.raw).hexdigest())
        if entry is None:
            raise Refusal('original_authority')
        binding, recipe = entry
        return OriginalCustody(binding, recipe, self.raw, self.raw, self.raw)


def resolve(original):
    """(facts, custody) for the original evidence a retained read or retry fetched. Never raises.

    facts holds the five chained CUSTODY_FACTS: every fact before the dispatcher's refusing step holds, the
    refusing step's fact fails, and later facts are False (the chained rows ignore them)."""
    _install()
    facts = dict.fromkeys(CUSTODY_FACTS, False)
    ref = original.get('event_ref') if type(original) is dict else None
    if type(ref) is not str or not ref or not SEALED.get(ref):
        return facts, None
    raw = record_bytes(original)
    if raw is None:
        facts['original_located'] = True
        return facts, None
    try:
        custody = RetainedDispatcher(DG6AOriginalOwner(raw), RECIPES).resolve(
            ref, binding_of(original, raw), disclose=lambda binding: True)
    except Refusal as refusal:
        for fact in CUSTODY_FACTS[:_STEP[refusal.reason]]:
            facts[fact] = True
        return facts, None
    return dict.fromkeys(CUSTODY_FACTS, True), custody


def frozen_validator(custody):
    """The exact schema validator of the custody-selected frozen edition."""
    return FROZEN[custody.recipe].validator


def foreign_recipe(event_type):
    """An installed recipe tuple of another family (a foreign selection for event_type)."""
    return next(e.recipe() for key, e in sorted(EDITIONS.items()) if key[0] != event_type and not e.legacy)


def replaced_resource_recipe(original):
    """The original's own edition tuple pinned to a replaced resource (same name, different bytes)."""
    recipe = recipe_of(original)
    edition = FROZEN.get(recipe)
    assert edition is not None, 'replaced_resource_recipe needs an installed edition'
    return edition.recipe(hashlib.sha256(b'replaced:' + recipe.resource_manifest_sha256.encode('ascii')).hexdigest())


def edition_recipe(event_type, version):
    """The installed tuple of event_type's edition with the given schema_version."""
    return next(e.recipe() for key, e in EDITIONS.items() if key[0] == event_type and key[2] == version)
