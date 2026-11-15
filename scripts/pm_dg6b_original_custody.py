"""DG6B SP-1101 retained-original dispatch (sweep part 2B): Storage's custody stand-in and the frozen recipes.

A retained original's recipe is selected by its sealed custody, never by the history case. The reader asks the
composition-installed shared `RetainedDispatcher` (scripts/pm_event_numbers.py, unchanged) for the original at its
seglog ref with the binding it expects from the case. `DG6BOriginalOwner` returns custody only for EventRecord bytes
Storage sealed at that ref, with the recipe tuple recorded when they were written. The frozen verifier of that tuple
recomputes the original's identity, payload join, Storage instance and source commitment from the sealed bytes, with
no current-writer gate and no live state. The checker turns the result into one observation (`custody_refusal`);
its guard row HR01 decides (pm_dg6b_table_history_custody). Nothing here refuses a case directly.

Static stand-in, as in DO's part 2B: `ORIGINAL_CUSTODY` is sealed at composition from the committed fixture pack's
positive retained originals (`install_original_custody`), and by the lane's own writer-side builders for originals
that appear only inside negatives (`seal_original`). The case under check never adds to it, and an alternate
`--fixtures` pack never seals anything. Native custody, frame authentication and edition resources: NOT_RUN.

Every DG6B family has exactly one write-time edition (pm.event.v0 2.0.0 with the family payload at 1.0.0, the
compact-JSON identity recipe of SP-670/671/672), so the frozen map has one tuple per family. A custody tuple with no
frozen verifier refuses (`recipe_unknown`); a caller cannot pass a recipe (`caller_recipe_override`).
"""
import copy
from functools import lru_cache
import hashlib
import json
from pathlib import Path

from pm_event_numbers import (
    EVENT_VALUE, FrozenRecipe, OriginalBinding, OriginalCustody, RecipeTuple, Refusal, RetainedDispatcher,
    decode_storage_value, full_value_commitment, loads_current_json, storage_uint64, storage_value_bytes)
from pm_event_datetime import EVENT_RECORD, datetime_validator

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL_CUSTODY = {}
RECIPE_VERIFIERS = {}
INSTALLED = []
_NO_RECEIPT = object()
RECEIPT_REQUIRE = None
CHECKER_REFUSAL = ()
IDENTITY_RECIPE = 'dg6b-compact-json-sha256-v1'
RECIPE_PRODUCER = 'cv317-producer-semantic-qualified-rfc8785-v1'
RECIPE_FULL_VALUE = 'pm.storage.original_event_value_commitment.v1'
RECIPE_LOCAL_SOURCE = 'dg6b-frozen-source-exact-typed-event-value-v1'
RECIPE_PAYLOAD = 'sp337-application-msgpack-event-value-v1'
FROZEN_RESOURCES = ('Plans/dg6b_event_contracts.schema.json', 'Plans/event_record.schema.json',
                    'Plans/shared_integration_runtime.schema.json',
                    'Plans/shared_integration_runtime_expansion_contracts.schema.json',
                    'Plans/event_record_index_checkpoint.schema.json',
                    'Plans/event_append_receipt_contracts.schema.json',
                    'Plans/event_append_receipt_contract_fixtures.json')
FAMILIES = ('auth.github.authenticated', 'auth.github.device_code.issued', 'auth.github.disconnected',
            'auth.github.failed', 'auth.github.token.polling', 'plugin.hook.blocked', 'plugin.hook.error',
            'plugin.hook.invoked', 'plugin.load_failed', 'plugin.loaded', 'plugin.permission.override',
            'plugin.tool.collision', 'plugin.tool.registered', 'persona.created', 'persona.deleted',
            'persona.exported', 'persona.imported', 'persona.selected', 'persona.updated')


def storage_unit(name):
    return 'SP-670' if name.startswith('auth.') else 'SP-671' if name.startswith('plugin.') else 'SP-672'


@lru_cache(maxsize=1)
def resource_manifest():
    """SHA-256 of the frozen resources a DG6B recipe tuple names (schema documents, file bytes)."""
    digests = [hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in FROZEN_RESOURCES]
    return hashlib.sha256(json.dumps(digests, separators=(',', ':')).encode('ascii')).hexdigest()


@lru_cache(maxsize=1)
def payload_schema_base():
    return json.loads((ROOT / 'Plans/dg6b_event_contracts.schema.json').read_text())['$id']


def recipe_tuple(name, event):
    """The write-time recipe tuple of one DG6B original: its own editions and the family recipes."""
    def text(key):
        value = event.get(key) if type(event) is dict else None
        return value if type(value) is str and value else 'missing'
    return RecipeTuple(
        envelope_schema_id=text('schema_id'), envelope_schema_version=text('schema_version'),
        payload_schema_id=text('payload_schema_id'), payload_schema_version=payload_schema_base().split('/')[-2],
        owner_source_id='Plans/storage-plan.md#' + storage_unit(name) + '/' + name, owner_edition='1.0.0',
        registry_revision='prepared_without_admission', identity_recipe=IDENTITY_RECIPE,
        producer_recipe=RECIPE_PRODUCER, physical_profile=EVENT_VALUE, full_value_profile=RECIPE_FULL_VALUE,
        local_source_profile=RECIPE_LOCAL_SOURCE, payload_profile=RECIPE_PAYLOAD,
        resource_manifest_sha256=resource_manifest())


def written_tuple(name):
    """The one edition each family's writer uses (pm.event.v0 2.0.0, family payload 1.0.0)."""
    return recipe_tuple(name, {'schema_id': 'pm.event.v0', 'schema_version': '2.0.0',
                               'payload_schema_id': payload_schema_base() + '#/$defs/' + name.replace('.', '_')})


def record_bytes_of(event):
    return storage_value_bytes(event, profile=EVENT_VALUE)


def original_binding(name, original):
    """The binding the reader expects, from the history case it was asked about."""
    event, payload = original['event_record'], original['payload']
    scope = payload['scope'] if name.startswith('persona.') else original['source']['scope']
    return OriginalBinding(
        storage_instance_id=payload['storage_instance_id'], scope_kind=event['scope_kind'], server_id=scope['server_id'],
        project_id=event['project_id'], event_type=event['event_type'], event_id=event['event_id'],
        idempotency_key=event['idempotency_key'], owner_operation_id=payload['operation_id'],
        source_commitment=hashlib.sha256(record_bytes_of(event)).hexdigest())


class DG6BOriginalOwner:
    """Storage's custody at one seglog ref (static stand-in): it authenticates the bytes the reader fetched there
    against what was sealed at write time and returns them with the sealed binding and recipe tuple."""

    def __init__(self, record_bytes, result_bytes, read_token_bytes):
        self.record_bytes, self.result_bytes, self.read_token_bytes = record_bytes, result_bytes, read_token_bytes

    def authenticated_original(self, original_ref):
        sealed = ORIGINAL_CUSTODY.get(original_ref)
        if not sealed:
            raise Refusal('original_query')
        entry = sealed.get(hashlib.sha256(self.record_bytes).hexdigest())
        if entry is None:
            raise Refusal('original_authority')
        # The reader supplies a query, never the receipt/result to authenticate.
        # These bytes belong to the write-side sealed store. A missing or
        # ambiguous receipt cannot select an edition, even for matching IDs.
        receipts = entry.get('receipts', ())
        if len(receipts) != 1:
            raise Refusal('original_receipt_unavailable')
        if (self.record_bytes != entry['record_bytes'] or self.result_bytes != entry['result_bytes']
                or self.read_token_bytes != entry['read_token_bytes']
                or receipts[0] != entry['issued_receipt_bytes']):
            raise Refusal('original_authority')
        return OriginalCustody(entry['binding'], entry['recipe'], entry['record_bytes'], entry['result_bytes'],
                               receipts[0])


@lru_cache(maxsize=1)
def receipt_validator():
    """The existing CV-339 full-value result, including all eleven receipt fields.

    acknowledged_at_utc uses the broad EventRecord profile (E5-2); it is not
    one of Storage's two strict-Z EventRecord fields.
    """
    from referencing import Registry, Resource
    schema = loads_current_json((ROOT / 'Plans/event_append_receipt_contracts.schema.json').read_text())
    registry = Registry().with_resource(schema['$id'], Resource.from_contents(schema))
    wrapper = {'$schema': schema['$schema'], '$ref': schema['$id'] + '#/$defs/full_value_result'}
    return datetime_validator(wrapper, registry=registry, profile=EVENT_RECORD)


@lru_cache(maxsize=1)
def receipt_archetype():
    fixtures = loads_current_json((ROOT / 'Plans/event_append_receipt_contract_fixtures.json').read_text())
    return next(c['value']['first_append_receipt'] for c in fixtures['cases']
                if c['id'] == 'complete_original_eleven_field_receipt')


def receipt_result(original):
    """Writer-side static issuance fixture, never called by the reader.

    Reuse the authored eleven-field AppendReceipt archetype and the existing
    full_value_result schema. Geometry is fixture geometry, not native frame
    issuance/durability evidence. The exact EventRecord and original full-value
    commitment make each result original-specific. The read token is separate.
    """
    receipt = copy.deepcopy(receipt_archetype())
    event = original['event_record']
    selection = original['durable_read_token']['source_selection']
    receipt.update(event_id=event['event_id'], sequence_id=event['sequence_id'],
                   segment_generation=selection['selected_segment_generation'],
                   manifest_generation=selection['manifest_generation'])
    commitment = full_value_commitment(event)
    return {'first_append_receipt': receipt, 'original_segment_ref': 'segment:dg6b-fixture/' + commitment,
            'original_event_value_commitment': {
                'schema_id': 'pm.storage.original_event_value_commitment.v1', 'schema_version': '1.0.0',
                'codec': EVENT_VALUE, 'domain': 'pm.storage.original_event_value_commitment.v1',
                'event_schema_id': event['schema_id'], 'event_schema_version': event['schema_version'],
                'sha256': commitment}}


def identity_recipe(name, payload, scope_key, server_id):
    """The family's frozen identity recipe (SP-670/671/672 at 1.0.0): compact JSON preimage, SHA-256."""
    preimage = [name, payload['storage_instance_id'], scope_key, payload['operation_id'], payload['revision']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return digest


def frozen_verifier(name):
    """The frozen verifier of one family edition: recompute the original's joins from its sealed bytes."""
    def verify(custody):
        try:
            event = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
            payload = decode_storage_value(custody.result_bytes, profile=EVENT_VALUE)
            receipt = decode_storage_value(custody.receipt_bytes, profile=EVENT_VALUE)
        except Refusal:
            return False
        binding = custody.binding
        if type(event) is not dict or type(payload) is not dict or type(receipt) is not dict:
            return False
        try:
            if RECEIPT_REQUIRE is None:
                return False
            RECEIPT_REQUIRE('receipt_schema', {'errors': 0 if receipt_validator().is_valid(receipt) else 1})
            first = receipt['first_append_receipt']
            numbers = {}
            for field in ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation'):
                try:
                    storage_uint64(first[field])
                    numbers['valid_' + field] = True
                except Refusal:
                    numbers['valid_' + field] = False
            RECEIPT_REQUIRE('receipt_numbers', numbers)
            receipt_tuple = [first['event_id'], first['sequence_id'], receipt['original_event_value_commitment']['sha256']]
            original_tuple = [event['event_id'], event['sequence_id'], full_value_commitment(event)]
            RECEIPT_REQUIRE('receipt_join', {
                'receipt_binding_digest': hashlib.sha256(storage_value_bytes(receipt_tuple, profile=EVENT_VALUE)).hexdigest(),
                'original_binding_digest': hashlib.sha256(storage_value_bytes(original_tuple, profile=EVENT_VALUE)).hexdigest()})
            inline = event['payload_ref'] is None and storage_value_bytes(event['payload'], profile=EVENT_VALUE) == custody.result_bytes
            referenced = type(event['payload_ref']) is str and event['payload'] == {}
            if not (inline or referenced):
                return False
            if name.startswith('persona.'):
                scope = payload['scope']
                if scope['server_id'] != binding.server_id:
                    return False
                scope_key = json.dumps([scope['server_id'], scope['scope_partition']], ensure_ascii=False,
                                       separators=(',', ':'))
            else:
                scope_key = 'application' if event['scope_kind'] == 'application' else 'project:' + event['project_id']
            digest = identity_recipe(name, payload, scope_key, binding.server_id)
            key = ('application@1:' + binding.server_id.encode().hex() + ':' + payload['operation_id'].encode().hex()
                   if event['scope_kind'] == 'application' else name + ':' + digest)
            event_id = 'evt_' + name.replace('.', '_') + '_' + digest
        except CHECKER_REFUSAL:
            raise
        except (KeyError, TypeError, ValueError, AttributeError, Refusal):
            return False
        return (event['event_type'] == name == binding.event_type
                and event_id == event['event_id'] == binding.event_id
                and key == event['idempotency_key'] == binding.idempotency_key
                and payload.get('storage_instance_id') == binding.storage_instance_id
                and payload.get('operation_id') == binding.owner_operation_id
                and event['scope_kind'] == binding.scope_kind and event['project_id'] == binding.project_id
                and hashlib.sha256(custody.record_bytes).hexdigest() == binding.source_commitment
                and custody.recipe == recipe_tuple(name, event))
    return FrozenRecipe(verify)


def install_recipe_verifiers():
    """Composition: the frozen recipe map, one FrozenRecipe per family edition."""
    if not RECIPE_VERIFIERS:
        for name in FAMILIES:
            RECIPE_VERIFIERS[written_tuple(name)] = frozen_verifier(name)


def seal_original(name, original, recipe=None, *, receipt=_NO_RECEIPT):
    """The writer's side (static stand-in): Storage seals an original's EventRecord bytes at its seglog ref with
    its write-time recipe tuple. Only composition and the lane's writer-side builders call this, never a reader."""
    binding = original_binding(name, original)
    issued = storage_value_bytes(receipt_result(original) if receipt is _NO_RECEIPT else receipt, profile=EVENT_VALUE)
    entry = {'binding': binding, 'recipe': recipe if recipe is not None else written_tuple(name),
             'record_bytes': record_bytes_of(original['event_record']),
             'result_bytes': storage_value_bytes(original['payload'], profile=EVENT_VALUE),
             'read_token_bytes': storage_value_bytes(original['durable_read_token'], profile=EVENT_VALUE),
             'issued_receipt_bytes': issued, 'receipts': (issued,)}
    ORIGINAL_CUSTODY.setdefault('seglog:' + original['event_record']['event_id'], {})[binding.source_commitment] = entry
    return original


def install_original_custody():
    """Composition: install the frozen recipe map and seal the committed positive retained originals."""
    install_recipe_verifiers()
    if INSTALLED:
        return
    fixtures = loads_current_json((ROOT / 'Plans/dg6b_event_contract_fixtures.json').read_text())
    for row in fixtures['families']:
        for case in row['history_cases']:
            if 'expected_error' not in case:
                seal_original(row['event_type'], case['original'])
    INSTALLED.append(True)


def resolve_original(name, original):
    """SP-1101 resolution of one retained original: (custody, None) or (None, refusal reason). Never raises."""
    try:
        event = original['event_record']
        owner = DG6BOriginalOwner(record_bytes_of(event), storage_value_bytes(original['payload'], profile=EVENT_VALUE),
                                  storage_value_bytes(original['durable_read_token'], profile=EVENT_VALUE))
        custody = RetainedDispatcher(owner, RECIPE_VERIFIERS).resolve(
            'seglog:' + event['event_id'], original_binding(name, original), disclose=lambda binding: True)
        return custody, None
    except CHECKER_REFUSAL:
        raise
    except Refusal as refusal:
        return None, refusal.reason
    except (KeyError, TypeError, AttributeError, ValueError):
        return None, 'original_query'
