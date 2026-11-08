"""Synthetic SP-1101 original-number composition for DCW static oracles.

Only fixture issuance calls install. Request values never supply RecipeTuple or
OriginalCustody. The store is a reference stand-in for the independent native
Storage/owner adapter; it provides no native authentication evidence.
"""
import hashlib

import pm_event_numbers as n

_ISSUED = {}
_RECIPES = {}


def binding(event, storage_instance, operation_ref):
    raw=n.storage_value_bytes(event, profile=n.EVENT_VALUE)
    return n.OriginalBinding(storage_instance, event['scope_kind'], 'dcw-static-owner', event['project_id'],
        event['event_type'], event['event_id'], event['idempotency_key'], operation_ref,
        hashlib.sha256(raw).hexdigest())


def install(event, receipt, storage_instance, operation_ref, resource_manifest, *, legacy=False):
    """Called by a fixture's original issuer, before its negative mutation."""
    raw=n.storage_value_bytes(event, profile=n.EVENT_VALUE)
    result=n.storage_value_bytes(dict(operation_ref=operation_ref),profile=n.EVENT_VALUE)
    receipt_bytes=n.storage_value_bytes(receipt,profile=n.EVENT_VALUE)
    recipe=n.RecipeTuple(event['schema_id'],event['schema_version'],event['payload_schema_id'],
        event['payload'].get('schema_version','1.0.0'), 'dcw-owner-original',
        'dcw-original-v1' if legacy else 'dcw-number-cv1100-v1', 'dcw-prepared-without-admission',
        'dcw-compact-identity-v1', 'dcw-sorted-integer-json-v1' if legacy else 'CV-317/CV-1100',
        n.EVENT_VALUE, n.EVENT_VALUE, 'dcw-source-v1', 'SP-337-original-msgpack',resource_manifest)
    original=n.OriginalCustody(binding(event,storage_instance,operation_ref),recipe,raw,result,receipt_bytes)
    key=event['event_id']+'@'+hashlib.sha256(raw).hexdigest()+'@'+hashlib.sha256(receipt_bytes).hexdigest()
    _ISSUED[key]=original
    # One installed recipe verifies any independently issued original binding.
    def verify_issued(candidate):
        ref=candidate.binding.event_id+'@'+hashlib.sha256(candidate.record_bytes).hexdigest()+'@'+hashlib.sha256(candidate.receipt_bytes).hexdigest()
        authentic=_ISSUED.get(ref)
        return authentic is not None and candidate==authentic and (
            n.storage_value_bytes(n.decode_storage_value(candidate.record_bytes,profile=n.EVENT_VALUE),
                                  profile=n.EVENT_VALUE)==candidate.record_bytes)
    _RECIPES[recipe]=n.FrozenRecipe(verify_issued)


class Owner:
    def authenticated_original(self, reference):
        return _ISSUED.get(reference)


def resolve(event, receipt, storage_instance, operation_ref, *, recipe_override=None):
    raw=n.storage_value_bytes(event,profile=n.EVENT_VALUE)
    reference=event['event_id']+'@'+hashlib.sha256(raw).hexdigest()+'@'+hashlib.sha256(n.storage_value_bytes(receipt,profile=n.EVENT_VALUE)).hexdigest()
    selected=n.RetainedDispatcher(Owner(),_RECIPES).resolve(reference,
        binding(event,storage_instance,operation_ref),disclose=lambda unused:True,
        recipe_override=recipe_override)
    if selected.receipt_bytes!=n.storage_value_bytes(receipt,profile=n.EVENT_VALUE):
        raise n.Refusal('original_verification')
    return selected


def install_scenario(scenario, resource_manifest, *, legacy=False):
    authority=scenario['authority']; source=scenario['source']
    slots=list(source['phases']) if 'phases' in source else [source]
    slots+=list(authority.get('sources',{}).values())
    if 'opened_source' in authority:slots.append(authority['opened_source'])
    for slot in slots:
        if type(slot) is not dict or type(slot.get('prepared_event')) is not dict:
            continue
        event=slot['prepared_event']
        if type(event.get('payload')) is not dict or not all(k in event for k in
                ('event_id','event_type','scope_kind','project_id','idempotency_key','schema_id','schema_version','payload_schema_id')):
            continue
        custody=authority.get('custody',{}).get(event['event_id'])
        if custody is not None and slot.get('source_ref'):
            try:
                install(event,custody['first_append_receipt'],authority['storage_instance_id'],slot['source_ref'],
                        resource_manifest,legacy=legacy)
            except n.Refusal:
                # A deliberately malformed fixture remains available to the
                # full checker, but cannot become an issued catalog original.
                pass
