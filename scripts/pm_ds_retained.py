"""SP-1101 authenticated retained-original dispatch for the DS retained readers (sweep part 2B).

Every DS retained read (the Browser created/reset history facts and the shared
replay projector through `candidate_failures(historical=True)`, compaction
history, and layout history through Home4 `event_checks`) takes its write-time
recipe from Storage's sealed write custody of that exact original and resolves
the original once through the shared `RetainedDispatcher`. Neither the request,
nor the record, nor the reader's source observation selects a recipe: the
sealed recipe fixes the envelope edition, the payload integer domain
(`original-json-schema`: the stock JSON Schema integer the original was
admitted under; `typed-integer`: CV-1100's current integer), the Case-L legacy
source and the frozen CV-1101 date-time profiles (the event_record profile at
format date-time, CV-253 storage_utc_z at the Storage fields), and the site's
own rows then run that recipe's checks. There is no current-then-legacy probing
and no caller override.

`Plans/ds_original_custody.json` is the static stand-in for Storage's SP-1101
custody of the one Storage instance these synthetic readers read: per original
ref (the event id) the SHA-256 of the sealed EVENT_VALUE record bytes (and, for
a Case-L original, of its sealed legacy source), the sealed binding and the
write recipe, plus the SHA-256 manifest of the frozen resources each recipe was
written against. The owner (`DSOriginalOwner`) authenticates the bytes the
reader fetched against what was sealed at that ref; the composition-installed
frozen verifier recomputes the sealed original's edition, family, payload
schema, binding and commitment. If a pinned resource changes, every retained
read refuses (recipe unknown) until the custody is re-recorded.

This is a synthetic contract oracle: it proves no native Storage frame,
receipt, pack or custody.

usage: python3 scripts/pm_ds_retained.py --write-custody   (records the custody from the committed fixture world)
"""
from __future__ import annotations

import argparse
import contextlib
import hashlib
import io
import json
import re
import sys
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))

from pm_ds_tables import Facts  # noqa: E402
from pm_event_numbers import (EVENT_VALUE, FrozenRecipe, OriginalBinding, OriginalCustody, RecipeTuple,  # noqa: E402
                              Refusal, RetainedDispatcher, decode_storage_value, storage_value_bytes)

CUSTODY = 'Plans/ds_original_custody.json'
STORAGE_INSTANCE = 'ds-retained-store'
SERVER = 'ds-synthetic-server'
EDITION = 'ds-retained.v1'
ENVELOPES = {'2.0.0': 'Plans/event_record.schema.json', '3.0.0': 'Plans/event_record_v3.schema.json'}
FAMILY_RESOURCES = {'browser': 'Plans/browser_event_payloads.schema.json',
                    'compaction': 'Plans/event_payload_context_compaction_completed.schema.json',
                    'layout': 'Plans/event_payloads/workspace_layout_changed_v2.schema.json'}
DATETIME_RESOURCE = 'scripts/pm_event_datetime.py'
PAYLOAD_PROFILES = ('original-json-schema', 'typed-integer')
NO_SOURCE, CASE_L = 'none', 'case-l-1.0.0'
# The write recipes DS retained originals were written under (envelope edition, payload integer domain, legacy source).
INSTALLED = (('2.0.0', 'original-json-schema', NO_SOURCE), ('2.0.0', 'typed-integer', NO_SOURCE),
             ('3.0.0', 'original-json-schema', NO_SOURCE), ('3.0.0', 'typed-integer', NO_SOURCE),
             ('2.0.0', 'original-json-schema', CASE_L))

# Recording mode (only `--write-custody`): an unsealed original is recorded under the recipe the reader names
# (the one the pre-SP-1101 code applied) and read as sealed. Never set outside the builder.
RECORDING = None


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def family_of(event_type):
    if event_type == 'context.compaction.completed':
        return 'compaction'
    if event_type == 'workspace.layout_changed':
        return 'layout'
    return 'browser' if event_type in browser_event_types() else None


@lru_cache(maxsize=1)
def browser_event_types():
    return frozenset(row['event_type'] for row in json.loads((ROOT / 'Plans/browser_event_admission.json').read_text())['rows'])


def resource_manifest(family, envelope):
    paths = sorted((ENVELOPES[envelope], FAMILY_RESOURCES[family], DATETIME_RESOURCE))
    return sha256(json.dumps([[p, sha256((ROOT / p).read_bytes())] for p in paths]).encode())


def version_of(schema_id):
    found = re.search(r'(?:/|\.v)(\d+(?:\.\d+\.\d+)?)(?:/|#|$|\.)', schema_id) if isinstance(schema_id, str) else None
    return found.group(1) if found else 'unversioned'


def recipe_id(recipe):
    return '{}/{}/{}/{}'.format(*recipe)


def recipe_tuple(family, event_type, payload_schema_id, recipe, manifest):
    """The RecipeTuple of one (edition, envelope, payload profile, source) write recipe of one family."""
    edition, envelope, payload, source = recipe
    return RecipeTuple(
        envelope_schema_id='pm.event.v0', envelope_schema_version=envelope,
        payload_schema_id=payload_schema_id, payload_schema_version=version_of(payload_schema_id),
        owner_source_id='DS:' + family + ':' + event_type, owner_edition=edition, registry_revision='not-registry-selected',
        identity_recipe=recipe_id(recipe), producer_recipe='CV-317 producer semantic projection',
        physical_profile='SP-236/SP-1100 EVENT_VALUE', full_value_profile='sha256(EVENT_VALUE record bytes)',
        local_source_profile=source, payload_profile=payload, resource_manifest_sha256=manifest)


def frozen_verifier(event_type, payload_schema_id, recipe):
    """Recompute the sealed original under its recipe: edition, family, payload schema id, binding, commitment
    and the presence of the sealed legacy source; no current writer gate and no live state."""
    _, envelope, _, source = recipe

    def verify(custody):
        try:
            event = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
        except Refusal:
            return False
        if type(event) is not dict:
            return False
        if (event.get('schema_id'), event.get('schema_version'), event.get('event_type'), event.get('payload_schema_id')) != (
                'pm.event.v0', envelope, event_type, payload_schema_id):
            return False
        b = custody.binding
        if (event.get('event_id'), event.get('scope_kind'), event.get('project_id'), event.get('idempotency_key'),
                event.get('correlation_id')) != (b.event_id, b.scope_kind, b.project_id, b.idempotency_key, b.owner_operation_id):
            return False
        if sha256(custody.record_bytes) != b.source_commitment:
            return False
        if source == CASE_L:
            try:
                return type(decode_storage_value(custody.result_bytes, profile=EVENT_VALUE)) is dict
            except Refusal:
                return False
        return custody.result_bytes == b''
    return FrozenRecipe(verify)


@lru_cache(maxsize=1)
def installed_recipes():
    """Composition: the exact tuple -> FrozenRecipe map, built from this head's resources outside request data."""
    out = {}
    families = [('compaction', 'context.compaction.completed', 'pm.context_compaction_completed.schema.v1'),
                ('layout', 'workspace.layout_changed', 'https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/2.0.0')]
    admission = json.loads((ROOT / 'Plans/browser_event_admission.json').read_text())
    families += [('browser', row['event_type'], row['payload_schema_ref']['schema_id']) for row in admission['rows']]
    for family, event_type, payload_schema_id in families:
        for envelope, payload, source in INSTALLED:
            recipe = (EDITION, envelope, payload, source)
            out[recipe_tuple(family, event_type, payload_schema_id, recipe, resource_manifest(family, envelope))] = \
                frozen_verifier(event_type, payload_schema_id, recipe)
    return out


@lru_cache(maxsize=1)
def custody():
    path = ROOT / CUSTODY
    raw = json.loads(path.read_text()) if path.exists() else {'resource_manifests': {}, 'sealed': []}
    index = {}
    for entry in raw['sealed']:
        index.setdefault(entry['ref'], []).append(entry)
    return {'manifests': raw['resource_manifests'], 'sealed': index}


def sealed_binding(entry):
    b = entry['binding']
    return OriginalBinding(storage_instance_id=STORAGE_INSTANCE, scope_kind=b['scope_kind'], server_id=SERVER,
                           project_id=b['project_id'], event_type=entry['event_type'], event_id=entry['ref'],
                           idempotency_key=b['idempotency_key'], owner_operation_id=b['owner_operation_id'],
                           source_commitment=entry['record_sha256'])


class DSOriginalOwner:
    """The sealed original custody of the Storage instance read (static stand-in). At one original ref it
    authenticates the record (and Case-L legacy source) bytes the reader fetched against what that instance
    sealed at write time, and returns them with the sealed binding and write-time recipe tuple."""

    def __init__(self, record_bytes, source_bytes):
        self.record_bytes, self.source_bytes = record_bytes, source_bytes

    def authenticated_original(self, original_ref):
        entries = custody()['sealed'].get(original_ref)
        if not entries:
            raise Refusal('original_query')
        if self.record_bytes is None:
            raise Refusal('original_authority')
        record_sha = sha256(self.record_bytes)
        source_sha = sha256(self.source_bytes) if self.source_bytes is not None else None
        matches = [e for e in entries if e['record_sha256'] == record_sha and e['source_sha256'] in (None, source_sha)]
        if not matches:
            raise Refusal('original_authority')
        if len(matches) != 1:
            raise Refusal('original_ambiguous')
        entry = matches[0]
        r = entry['recipe']
        recipe = (r['edition'], r['envelope'], r['payload'], r['source'])
        family = family_of(entry['event_type'])
        manifest = custody()['manifests'].get('{}@{}'.format(family, r['envelope']), '0' * 64)
        tuple_ = recipe_tuple(family or 'unknown', entry['event_type'], entry['payload_schema_id'], recipe, manifest)
        result = self.source_bytes if entry['source_sha256'] is not None else b''
        return OriginalCustody(sealed_binding(entry), tuple_, self.record_bytes, result, b'')


def _bytes(value):
    """EVENT_VALUE bytes of a value the reader fetched, or None when it has no such encoding (it cannot be sealed)."""
    try:
        return storage_value_bytes(value, profile=EVENT_VALUE)
    except Refusal:
        return None


def expected_binding(event, record):
    return OriginalBinding(storage_instance_id=STORAGE_INSTANCE, scope_kind=event['scope_kind'], server_id=SERVER,
                           project_id=event['project_id'], event_type=event['event_type'], event_id=event['event_id'],
                           idempotency_key=event['idempotency_key'], owner_operation_id=event['correlation_id'],
                           source_commitment=sha256(record) if record is not None else '0' * 64)


def _record(event, source, reader_recipe, edition=EDITION):
    """Builder only: seal this original under the recipe the reader names (the pre-SP-1101 selection)."""
    record = storage_value_bytes(event, profile=EVENT_VALUE)
    source_bytes = _bytes(source) if source is not None else None
    expected_binding(event, record)  # an original Storage could seal has a complete binding
    if reader_recipe[2] == CASE_L and (not isinstance(source, dict) or source_bytes is None):
        raise ValueError('a Case-L original is sealed only with its legacy source observation object')
    entry = {'ref': event['event_id'], 'event_type': event['event_type'], 'payload_schema_id': event['payload_schema_id'],
             'recipe': dict(zip(('edition', 'envelope', 'payload', 'source'), (edition, *reader_recipe))),
             'record_sha256': sha256(record),
             'source_sha256': sha256(source_bytes) if reader_recipe[2] == CASE_L and source_bytes is not None else None,
             'binding': {'scope_kind': event['scope_kind'], 'project_id': event['project_id'],
                         'idempotency_key': event['idempotency_key'], 'owner_operation_id': event['correlation_id']}}
    key = json.dumps(entry, sort_keys=True)
    if key not in RECORDING:
        RECORDING[key] = entry
        custody()['sealed'].setdefault(entry['ref'], []).append(entry)


def dispatch_refusal(event, source=None, reader_recipe=None):
    """One selection from sealed custody, then one RetainedDispatcher resolution.

    Returns (refusal reason or None, resolved custody). The ref lookup comes first: an original that
    Storage never sealed at this ref is unsealed (original_query) whatever else is wrong with it.
    """
    if RECORDING is not None and reader_recipe is not None:
        try:
            _record(event, source, reader_recipe)
        except (Refusal, KeyError, TypeError, AttributeError, ValueError):
            pass
    ref = event.get('event_id') if isinstance(event, dict) else None
    if type(ref) is not str or not custody()['sealed'].get(ref):
        return 'original_query', None
    record = _bytes(event)
    try:
        expected = expected_binding(event, record)
    except Refusal:
        return 'original_binding', None
    except (KeyError, TypeError):
        return 'original_binding', None
    source_bytes = None if source is None else (_bytes(source) or b'\x00unencodable-source')
    try:
        resolved = RetainedDispatcher(DSOriginalOwner(record, source_bytes), installed_recipes()).resolve(
            ref, expected, disclose=lambda binding: True)
    except Refusal as exc:
        return exc.reason, None
    return None, resolved


ROWS = (('original_query', 'OX01_original_sealed'), ('original_binding', 'OX02_original_binding'),
        ('original_authority', 'OX03_original_authentic'), ('recipe_unknown', 'OX04_recipe_installed'),
        ('original_verification', 'OX05_original_verified'))


def retained_recipe(event, source=None, reader_recipe=None):
    """Tables ds_retained_custody / ds_retained_custody_entailed: (selected recipe, None) or (None, refusing code).

    The selected recipe is (envelope edition, payload profile, legacy source) from the sealed custody alone;
    `reader_recipe` is consulted only by the custody builder (recording mode), never for selection.
    """
    reason, resolved = dispatch_refusal(event, source, reader_recipe)
    facts = Facts('ds_retained_custody', chain=True)
    for reason_name, row in ROWS:
        if facts.stop(row, lambda r=reason_name: reason != r):
            return None, facts.first_code()
    facts.done()
    other = Facts('ds_retained_custody_entailed', chain=True)
    if other.stop('OX06_dispatch_other', lambda: reason is None):
        return None, other.first_code()
    other.done()
    t = resolved.recipe
    return (t.envelope_schema_version, t.payload_profile, t.local_source_profile), None


def collision_report(sealed):
    """Seals one ref cannot tell apart: the same record (and legacy source) under two recipes or bindings."""
    seen, out = {}, []
    for e in sealed:
        key = (e['ref'], e['record_sha256'], e['source_sha256'])
        if key in seen and seen[key] != e:
            out.append({'ref': e['ref'], 'recipes': [seen[key]['recipe'], e['recipe']]})
        seen.setdefault(key, e)
    return out


def check_custody():
    """The committed custody: no ref has two seals for the same bytes, and every recipe is well formed."""
    if not (ROOT / CUSTODY).exists():
        return {'status': 'fail', 'missing': CUSTODY}
    raw = json.loads((ROOT / CUSTODY).read_text())
    sealed = raw['sealed']
    bad = [e['ref'] for e in sealed if set(e['recipe']) != {'edition', 'envelope', 'payload', 'source'}
           or (e['recipe']['source'] == CASE_L) != (e['source_sha256'] is not None)]
    return {'sealed': len(sealed), 'refs': len({e['ref'] for e in sealed}), 'collisions': len(collision_report(sealed)),
            'malformed': bad, 'status': 'pass' if not collision_report(sealed) and not bad else 'fail'}


def write_custody():
    """Record the custody from the committed fixture world: every retained original a DS witness source reads,
    sealed under the recipe its reader applied before SP-1101, plus the part 2B witness seals."""
    global RECORDING
    sys.path.insert(0, str(ROOT / 'tests'))
    import pm_ds_guard_suites as suites
    import pm_ds_p2b_cases as p2b
    RECORDING = {}
    custody.cache_clear()
    custody()['sealed'].clear()
    for event, source, recipe in p2b.witness_seals():
        _record(event, source, recipe[1:], edition=recipe[0])
    failures = []
    for label, call in suites.sources():
        if label.startswith('p2b/'):
            continue  # the part 2B witnesses seal only through witness_seals(); their unsealed negatives stay unsealed
        try:
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                call()
        except BaseException as exc:  # noqa: BLE001 - a source that fails is reported, never sealed silently
            failures.append((label, repr(exc)[:200]))
    sealed = sorted(RECORDING.values(), key=lambda e: (e['ref'], e['record_sha256'], json.dumps(e['recipe'], sort_keys=True)))
    out = {'schema_id': 'pm.ds.original_custody.v1',
           'description': 'Static stand-in for Storage SP-1101 sealed write custody of the one Storage instance the DS synthetic retained readers read: per original ref, the SHA-256 of the sealed EVENT_VALUE record bytes (and Case-L legacy source), the sealed binding and the write recipe; recorded by scripts/pm_ds_retained.py --write-custody from the committed fixture world. Not native custody.',
           'storage_instance_id': STORAGE_INSTANCE,
           'resource_manifests': {'{}@{}'.format(f, e): resource_manifest(f, e) for f in FAMILY_RESOURCES for e in ENVELOPES},
           'sealed': sealed}
    collisions = collision_report(sealed)
    if not collisions:
        (ROOT / CUSTODY).write_text(json.dumps(out, indent=1, sort_keys=True) + '\n')
    RECORDING = None
    return {'written': not collisions, 'collisions': collisions[:20], 'collision_count': len(collisions),
            'sealed': len(sealed), 'refs': len({e['ref'] for e in sealed}), 'source_failures': failures,
            'recipes': sorted({recipe_id(tuple(e['recipe'][k] for k in ('edition', 'envelope', 'payload', 'source'))) for e in sealed})}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write-custody', action='store_true', required=True)
    parser.parse_args()
    # Drive the module instance the checkers import (`import pm_ds_retained`), not this __main__ copy.
    import pm_ds_retained as checkers_module
    result = checkers_module.write_custody()
    print(json.dumps(result, indent=1))
    return 0 if result['written'] and not result['source_failures'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
