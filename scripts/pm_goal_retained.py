"""TEST_ONLY SP-1101 composition for the conditional Goal history oracles.

Receipt issuance is fixture construction. A read never issues or repairs a
receipt. The owner snapshot is supplied independently of the candidate answer.
There is one exact original binding, one sealed receipt and one frozen recipe;
neither the live schema, a Store id nor a request chooses the recipe.
"""
import hashlib
import json
from dataclasses import asdict
from pathlib import Path
import pm_event_numbers as n

ROOT = Path(__file__).resolve().parents[1]
def recipe(event):
    # Fixture issuance freezes the complete envelope and payload resource bytes.
    # A read uses only the already installed tuples below.
    payload_name = event['event_type'].replace('.', '_') + '.schema.json'
    payload = ROOT / 'Plans/event_payloads/goal_runtime' / payload_name
    if event['event_type'] == 'run.started':
        payload = ROOT / 'Plans/event_payload_run_started.schema.json'
    if event['event_type'] == 'restore_point.deleted':
        row = next(r for r in json.loads((ROOT/'Plans/event_family_registry.json').read_text())['families']
                   if r['event_type'] == 'restore_point.deleted')
        payload_bytes = n.qualified_jcs(row['payload_schema'])
    else:
        payload_bytes = payload.read_bytes()
    resources = (ROOT / 'Plans/event_record.schema.json').read_bytes() + payload_bytes
    return n.RecipeTuple(
        event['schema_id'], event['schema_version'], event['payload_schema_id'],
        event['payload']['schema_version'] if 'schema_version' in event['payload'] else {'pm.goal_runtime_event.goal_created.schema.v3':'3.0.0'}[event['payload_schema_id']], event['event_type'], 'conditional-original',
        'original-receipt-checkpoint', 'original-identity', 'CV-339/RFC8785', n.EVENT_VALUE,
        'SP-286/original-full-value-v1', 'event_record', 'owner-schema',
        hashlib.sha256(resources).hexdigest())


def binding(event, storage):
    return n.OriginalBinding(storage, event['scope_kind'], 'TEST_ONLY-owner-server',
        event['project_id'], event['event_type'], event['event_id'], event['idempotency_key'],
        event['event_id'], n.producer_semantic_digest(event))


def issue(event, storage, receipt):
    """Called only when constructing a lawful conditional original fixture."""
    original = n.OriginalCustody(binding(event, storage), recipe(event),
        n.storage_value_bytes(event), n.qualified_jcs(receipt), n.qualified_jcs(receipt))
    return dict(original=asdict(original), seal=seal(original))


def seal(original):
    metadata = n.qualified_jcs(dict(binding=asdict(original.binding),recipe=asdict(original.recipe)))
    chunks = (metadata, original.record_bytes, original.result_bytes, original.receipt_bytes)
    return hashlib.sha256(b''.join(len(chunk).to_bytes(8,'big')+chunk for chunk in chunks)).hexdigest()


class Owner:
    def __init__(self, snapshot):
        self.snapshot = snapshot

    def authenticated_original(self, ref):
        try:
            matches = [row for row in self.snapshot['sealed_receipts']
                       if row['original']['binding']['event_id'] == ref]
        except (KeyError, TypeError):
            raise n.Refusal('original_receipt_shape')
        if len(matches) != 1:
            raise n.Refusal('original_receipt_missing' if not matches else 'original_receipt_ambiguous')
        row = matches[0]
        value = row['original']
        try:
            original = n.OriginalCustody(n.OriginalBinding(**value['binding']),
                n.RecipeTuple(**value['recipe']), value['record_bytes'], value['result_bytes'], value['receipt_bytes'])
        except (KeyError, TypeError):
            raise n.Refusal('original_receipt_shape')
        if any(type(raw) is not bytes for raw in (original.record_bytes,original.result_bytes,original.receipt_bytes)):
            raise n.Refusal('original_receipt_shape')
        if seal(original) != row['seal']:
            raise n.Refusal('original_receipt_seal')
        return original


def resolve(snapshot, event, storage, *, recipe_override=None):
    """Read exact receipt-selected bytes, preserving the supplied snapshot."""
    def verify(original):
        decoded = n.decode_storage_value(original.record_bytes)
        return (n.producer_semantic_digest(decoded) == original.binding.source_commitment
                and original.record_bytes == n.storage_value_bytes(snapshot['original_value'])
                and original.result_bytes == original.receipt_bytes
                and original.receipt_bytes == n.qualified_jcs(snapshot['custody']))
    if type(event) is not dict:
        raise n.Refusal('original_missing')
    try:
        installed = {n.RecipeTuple(**row): n.FrozenRecipe(verify)
                     for row in snapshot['installed_recipes']}
    except (KeyError, TypeError):
        raise n.Refusal('recipe_catalog')
    dispatcher = n.RetainedDispatcher(Owner(snapshot), installed)
    return dispatcher.resolve(event['event_id'], binding(event, storage),
                              disclose=lambda _: snapshot['content_permitted'] is True,
                              recipe_override=recipe_override)
