"""DG6B sweep part 2B witnesses: the gated shared date-time, number and retained-original rules.

Each witness starts from a valid case of its own family and changes one source fact. Observational copies that
follow from it (identities, keys, envelope copies, stored carriers, Storage record bytes) are re-derived with the
lane builder (rebuild) before the call. Raw number spellings are written into the case's JSON text and parsed by the
checker's own raw ingress (strict_json, the shared loads_current_json). Every call is a complete checker boundary
(append, retry, retained history) or the named stage the row lives in, and every negative names the row that must
refuse it first. Expectations for the shared corpus are composed from the shared helpers alone (loads_current_json,
current_integer with the slot's owner bounds, storage_uint64, qualified_jcs), never from the checker.

Writer-side originals (retained timestamps at another profile, the custody controls) are sealed with
pm_dg6b_original_custody.seal_original, standing for Storage sealing what the writer wrote (SP-1101). A forgery is
never sealed.
"""
import dataclasses
import hashlib
import json
from pathlib import Path

from pm_event_numbers import (EVENT_VALUE, Refusal, current_integer, loads_current_json, qualified_jcs,
                              storage_uint64, storage_value_bytes)
import pm_dg6b_original_custody as custody_store
from pm_dg6b_full_oracles import clone, rebuild

ROOT = Path(__file__).resolve().parents[1]

# CV-1101 EventRecord profile (occurred_at_utc, payload ts, expires_at): RFC 3339 5.6/5.7.
EVENT_RECORD_ACCEPTED = (
    '2026-11-04t12:00:00z', '2026-11-04T17:30:00+05:30', '2026-11-04T07:00:00-05:00', '2016-12-31T23:59:60Z',
    '2017-01-01T05:29:60+05:30', '2026-11-04T12:00:00.000000000000000000001Z', '0000-01-01T00:00:00Z')
EVENT_RECORD_REFUSED = (
    '2026-11-04T24:00:00Z', '2026-11-04T12:00:00Z\n', '2026-11-04T12:00:60Z', '2026-11-04T12:00:00,5Z',
    '2026-11-04T12:00:00+24:00', '2026-11-04T12:00:00+05:60', '2026-11-04T12:00:00', '2026-02-29T12:00:00Z',
    '2016-12-31T23:59:60+01:00', ' 2026-11-04T12:00:00Z', '2026-11-04T12:00:00.Z')
# CV-253 storage_utc_z (Storage-assigned observed_at_utc and persisted_at_utc): terminal uppercase Z only.
STORAGE_ACCEPTED = ('2026-11-04T13:00:00Z', '2026-11-04T13:00:00.123456789012Z', '2016-12-31T23:59:60Z')
STORAGE_REFUSED = ('2026-11-04T13:00:00+00:00', '2026-11-04T13:00:00-00:00', '2026-11-04T13:00:00z',
                   '2026-11-04T18:30:00+05:30', '2026-11-04T24:00:00Z', '2026-11-04T13:00:00Z\n')
LONG_POSITIVE = '1' + '0' * 4399
LONG_NEGATIVE = '-1' + '0' * 4399
PLACEHOLDER = '@@dg6b-p2b-raw-slot@@'


class StrSubclass(str):
    """A str subclass: the shared predicate refuses it (date_time_type)."""


def corpus_spellings():
    """Every number-scope spelling of the shared corpus, as raw JSON text, plus the 4,400-digit integers.

    Raw spellings from token, parse, parse_token, slot and json_number cases; exact integers (their digit strings)
    and the other typed values of integer and uint64 cases, written as JSON. The three byte-input parse cases are
    whole-document byte encodings, not slot spellings, and stay with the shared self-test.
    """
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    raws = []
    for case in corpus['cases']:
        op = case.get('op')
        if op in ('token', 'parse', 'parse_token', 'slot') and 'raw' in case:
            raws.append(case['raw'] if type(case['raw']) is str else json.dumps(case['raw']))
        elif op == 'json_number':
            raws.append(case['token'] if type(case['token']) is str else json.dumps(case['token']))
        elif op in ('integer', 'uint64'):
            value = case['value']
            raws.append(value['@int'] if type(value) is dict and set(value) == {'@int'} else json.dumps(value))
    raws.extend((LONG_POSITIVE, LONG_NEGATIVE))
    return sorted(set(raws), key=lambda raw: (len(raw), raw))


def corpus_expectation(raw, slot):
    """(row, code) the complete route must refuse with, or None to accept; shared helpers only."""
    try:
        value = loads_current_json(raw)
    except Refusal as refusal:
        return ('J01_unique_keys', 'duplicate_json_key') if refusal.reason == 'duplicate_key' else ('J02_valid_json', 'invalid_json')
    if slot == 'producer_sequence_id':
        # EventRecord nullable_non_negative_integer; a producer field (CV-317 projection).
        if value is None:
            return None
        try:
            current_integer(value, minimum=0)
        except Refusal:
            return ('ER01_event_record', 'event_record_schema')
        try:
            qualified_jcs(value)
        except Refusal:
            return ('PQ01_producer_jcs', 'producer_number_domain')
        return None
    # Storage sequence_id: exact uint64 (SP-1100), outside the producer projection.
    try:
        storage_uint64(value)
    except Refusal:
        return ('ER01_event_record', 'event_record_schema')
    return None


def set_path(value, path, item):
    for key in path[:-1]:
        value = value[key]
    value[path[-1]] = item


def raw_text(case, paths, raw):
    """The case as JSON text with the raw spelling written at each path (one placeholder per path)."""
    marked = clone(case)
    for path in paths:
        set_path(marked, path, PLACEHOLDER)
    text = json.dumps(marked, ensure_ascii=False)
    assert text.count('"' + PLACEHOLDER + '"') == len(paths), paths
    return text.replace('"' + PLACEHOLDER + '"', raw)


def storage_hex(original):
    return storage_value_bytes(original['event_record'], profile=EVENT_VALUE).hex()


def family_cases(m, row, schema):
    """[(label, target_row, code, call)] for one family; target None means the call must succeed."""
    name = row['event_type']
    valid = row['append_valid']
    base = clone(valid[0])
    external = clone(next(c for c in valid if c['event_record']['payload_ref'] is not None))
    hbase = clone(next(c for c in row['history_cases'] if c['label'] == 'retained_after_live_state_changed'))
    hbase.pop('label', None)
    out = []

    def add(label, target, code, call):
        out.append(('p2b/' + label, target, code, call))

    def append(case):
        return lambda: m['complete_append_contract'](name, case, schema)

    def append_raw(text):
        return lambda: m['complete_append_contract'](name, m['strict_json'](text), schema)

    def payload_stage(payload):
        return lambda: m['payload_contract'](name, payload, schema)

    def history(case):
        return lambda: m['history_contract'](name, case, schema)

    def with_payload(field, value):
        bad = clone(base)
        bad['payload'][field] = value
        return rebuild(m, name, bad)

    def retained(edit):
        """A writer-built retained original: one source fact changed, copies and Storage bytes re-derived."""
        case = clone(hbase)
        edit(case['original'])
        case['original'] = rebuild(m, name, case['original'])
        case['storage_record']['event_record_bytes_hex'] = storage_hex(case['original'])
        return case

    # ---- CV-1101 EventRecord profile: payload ts (occurred_at_utc is its copy) and device-code expires_at.
    fields = ('ts', 'expires_at') if 'expires_at' in base['payload'] else ('ts',)
    for field in fields:
        for index, form in enumerate(EVENT_RECORD_ACCEPTED):
            add(f'datetime/{field}/accepted/{index}', None, None, append(with_payload(field, form)))
        for index, form in enumerate(EVENT_RECORD_REFUSED):
            bad = clone(base['payload']); bad[field] = form
            add(f'datetime/{field}/refused/{index}', 'PS01_payload', 'payload_schema', payload_stage(bad))
        bad = clone(base['payload']); bad[field] = StrSubclass(base['payload'][field])
        add(f'datetime/{field}/str_subclass', 'PS01_payload', 'payload_schema', payload_stage(bad))
    # occurred_at_utc is checked by the enforced EventRecord validator first (ER01); ts is its copy.
    for index, form in enumerate(EVENT_RECORD_REFUSED):
        add(f'datetime/occurred_at_utc/refused/{index}', 'ER01_event_record', 'event_record_schema',
            append(with_payload('ts', form)))
    # ---- CV-253 storage_utc_z on Storage-assigned fields (no copy; outside the producer projection).
    for field in custody_store_fields():
        for index, form in enumerate(STORAGE_ACCEPTED):
            good = clone(base); good['event_record'][field] = form
            add(f'datetime/{field}/accepted/{index}', None, None, append(good))
        for index, form in enumerate(STORAGE_REFUSED):
            bad = clone(base); bad['event_record'][field] = form
            add(f'datetime/{field}/refused/{index}', 'ER01_event_record', 'event_record_schema', append(bad))
    # ---- Retained originals keep their owner profile per field (CV-1101 under SP-1101).
    for index, form in enumerate(EVENT_RECORD_ACCEPTED[:3]):
        case = retained(lambda original, form=form: original['payload'].__setitem__('ts', form))
        custody_store.seal_original(name, case['original'])
        add(f'history_datetime/ts/accepted/{index}', None, None, history(case))
    for index, form in enumerate(STORAGE_REFUSED[:3]):
        for field in custody_store_fields():
            case = clone(hbase)
            case['original']['event_record'][field] = form
            case['storage_record']['event_record_bytes_hex'] = storage_hex(case['original'])
            custody_store.seal_original(name, case['original'])
            add(f'history_datetime/{field}/refused/{index}', 'ER01_event_record', 'event_record_schema', history(case))

    # ---- CV-1100 producer qualification and SP-1100 physical domains.
    for label, value, target in [('2^53', 2 ** 53, None), ('2^53+1', 2 ** 53 + 1, 'PQ01_producer_jcs'),
                                 ('2^60', 2 ** 60, 'PQ01_producer_jcs'), ('uint64_max', 2 ** 64 - 1, 'PQ01_producer_jcs')]:
        case = clone(base); case['event_record']['producer_sequence_id'] = value
        add('numbers/producer_sequence_id/' + label, target, 'producer_number_domain' if target else None, append(case))
        if target is not None:
            add('numbers/revision/' + label, target, 'producer_number_domain', append(with_payload('revision', value)))
    for label, value, target in [('2^53', 2 ** 53, None), ('uint64_max', 2 ** 64 - 1, None),
                                 ('uint64_max+1', 2 ** 64, 'ER01_event_record')]:
        case = clone(base); case['event_record']['sequence_id'] = value
        add('numbers/sequence_id/' + label, target, 'event_record_schema' if target else None, append(case))
    # An externalized payload leaves the integer outside the projection; its physical bytes still refuse (PQ02).
    bad = clone(external)
    bad['payload']['revision'] = 2 ** 64
    bad['source']['frozen_payload'] = clone(bad['payload'])
    add('numbers/external_revision/uint64_max+1', 'PQ02_payload_physical', 'payload_number_domain', append(bad))

    # ---- The 4,400-digit integer: raw ingress, append, retry and history refuse with a code; nothing raises.
    for label, raw, target, code in [
            ('producer_sequence_id', LONG_POSITIVE, 'PQ01_producer_jcs', 'producer_number_domain'),
            ('producer_sequence_id_negative', LONG_NEGATIVE, 'ER01_event_record', 'event_record_schema'),
            ('sequence_id', LONG_POSITIVE, 'ER01_event_record', 'event_record_schema')]:
        slot = 'sequence_id' if label == 'sequence_id' else 'producer_sequence_id'
        add('long_integer/' + label, target, code, append_raw(raw_text(base, [('event_record', slot)], raw)))
    paths = [('payload', 'revision'), ('source', 'frozen_payload', 'revision')]
    if base['event_record']['payload_ref'] is None:
        paths.append(('event_record', 'payload', 'revision'))
    add('long_integer/revision', 'PQ01_producer_jcs', 'producer_number_domain',
        append_raw(raw_text(base, paths, LONG_POSITIVE)))
    original = clone(base)
    candidate_text = raw_text(base, [('event_record', 'producer_sequence_id')], LONG_POSITIVE)
    add('long_integer/retry_candidate', 'PQ01_producer_jcs', 'producer_number_domain',
        lambda: m['complete_append_contract'](name, m['strict_json'](candidate_text), schema, original=original))
    history_text = raw_text(hbase, [('original', 'event_record', 'producer_sequence_id')], LONG_POSITIVE)
    add('long_integer/retained_original', 'HR01_original_custody', 'historical_original_recipe',
        lambda: m['history_contract'](name, m['strict_json'](history_text), schema))

    # ---- The shared corpus through the complete append route, at a producer slot and the Storage slot.
    for slot in ('producer_sequence_id', 'sequence_id'):
        for index, raw in enumerate(corpus_spellings()):
            expected = corpus_expectation(raw, slot)
            text = raw_text(base, [('event_record', slot)], raw)
            label = f'corpus/{slot}/{index}/' + hashlib.sha256(raw.encode('utf-8', 'surrogatepass')).hexdigest()[:12]
            add(label, None if expected is None else expected[0], None if expected is None else expected[1],
                append_raw(text))

    # ---- SP-1101 custody (HR01) and the Storage record join it no longer masks (HS04).
    forged = retained(lambda original: original['payload'].__setitem__('ts', '2026-11-04T12:00:30Z'))
    add('custody/coherent_forgery', 'HR01_original_custody', 'historical_original_recipe', history(forged))
    sealed = clone(forged)
    add('custody/writer_sealed', None, None,
        lambda: (custody_store.seal_original(name, sealed['original']), m['history_contract'](name, sealed, schema)))
    unknown = retained(lambda original: original['payload'].__setitem__('ts', '2026-11-04T12:00:45Z'))
    custody_store.seal_original(name, unknown['original'],
                                dataclasses.replace(custody_store.written_tuple(name), identity_recipe='dg6b-unrecorded-recipe'))
    add('custody/recipe_unknown', 'HR01_original_custody', 'historical_original_recipe', history(unknown))
    miswritten = clone(hbase)
    event = miswritten['original']['event_record']
    event['event_id'] = event['event_id'][:-1] + ('0' if event['event_id'][-1] != '0' else '1')
    miswritten['storage_record']['event_record_bytes_hex'] = storage_hex(miswritten['original'])
    custody_store.seal_original(name, miswritten['original'])
    add('custody/frozen_verification', 'HR01_original_custody', 'historical_original_recipe', history(miswritten))
    stale = clone(hbase)
    other = clone(hbase['original']['event_record']); other['observed_at_utc'] = '2026-11-04T19:00:00Z'
    stale['storage_record']['event_record_bytes_hex'] = storage_value_bytes(other, profile=EVENT_VALUE).hex()
    add('history_storage/record_bytes', 'HS04_record_bytes', 'historical_storage_record', history(stale))
    return out


def custody_store_fields():
    return ('observed_at_utc', 'persisted_at_utc')
