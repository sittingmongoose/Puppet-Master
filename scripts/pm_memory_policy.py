#!/usr/bin/env python3
"""Card 6 owner-policy model. Scores are captured owner values, never identity inputs.

No serializer, score normalization, number cap or maintenance admission is defined here.
"""
from copy import deepcopy
from datetime import datetime
from decimal import Decimal
from fractions import Fraction
import json
import math
import re

CUTOFFS = {'monthly_summary': (90, Decimal('0.10'), 'DL-446'),
           'prune_archive': (180, Decimal('0.05'), 'DL-447')}


def same(left, right):
    """Preservation compares primitive types before values, recursively; no coercion."""
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(same(left[k], right[k]) for k in left)
    if isinstance(left, (list, tuple)):
        return len(left) == len(right) and all(same(a, b) for a, b in zip(left, right))
    return left == right


def string_list(value):
    """An exact list of exact strings; a string, object or Boolean/number alias is not one."""
    return type(value) is list and all(type(item) is str for item in value)


def instant(core, value):
    """Exact rational seconds for policy ordering only; retain the original spelling.

    datetime parses only the whole-second calendar/zone. Decimal construction and
    Fraction conversion retain every fractional digit without context rounding or
    an integer-string conversion limit. No timestamp precision cap is introduced.
    """
    core.require(type(value) is str and core.enforced_formats().conforms(value, 'date-time'),
                 'selection_timestamp')
    fraction, zone = re.fullmatch(r'(?:\.([0-9]+))?([Zz]|[+-][0-9]{2}:[0-9]{2})', value[19:]).groups()
    whole = datetime.fromisoformat(value[:19].replace('t', 'T') + ('+00:00' if zone in ('Z', 'z') else zone))
    offset = whole.utcoffset()
    seconds = (whole.toordinal() * 86400 + whole.hour * 3600 + whole.minute * 60 + whole.second
               - offset.days * 86400 - offset.seconds)
    return seconds + Fraction(Decimal('0.' + fraction)) if fraction else Fraction(seconds)


def selection_checks(core, snapshot, job):
    """Only selected, already resolved originals; no count trigger or cross-scope pool.

    Kind/pin/existence/uniqueness checks stay at the existing archive boundary. Pins are
    excluded here before reading a score. An absent edit/access independently falls back
    to creation, then the later instant wins. Fractional days are compared as durations.
    """
    days, score, _ = CUTOFFS[job]
    selected = [snapshot['memories'][key] for key in snapshot['selected_ids']
                if key in snapshot['memories'] and snapshot['memories'][key]['pinned'] is not True]
    yield 'selection_scope', (type(snapshot['project_id']) is str and bool(snapshot['project_id'])
                              and all(m.get('project_id') == snapshot['project_id'] for m in selected))
    # Exact flag type belongs to archive.memory_flags; this predicate owns active vs archived.
    yield 'selection_active', all(not m['archived'] for m in selected if type(m['archived']) is bool)
    captured = instant(core, snapshot['captured_at'])
    starts = [max(instant(core, m.get('created_at') if m.get('updated_at') is None else m['updated_at']),
                  instant(core, m.get('created_at') if m.get('last_access_at') is None else m['last_access_at']))
              for m in selected]
    yield 'selection_age', all(captured - start >= days * 86400 for start in starts)
    values = [m.get('usefulness_score') for m in selected]
    valid = all(type(v) in (int, float, Decimal) and
                (v.is_finite() if type(v) is Decimal else math.isfinite(v) if type(v) is float else True)
                for v in values)
    yield 'selection_score_type', valid
    yield 'selection_score', all(v < score for v in values) if valid else True


def dedup_candidate(core, before):
    """One owner-eligible identical group; eligibility itself is supplied by the owner.

    Selection always uses the oldest original then stable note ID.
    """
    memories = before.get('memories'); ids = before.get('eligible_ids')
    core.require(type(memories) is dict and type(before.get('merge_records')) is list
                 and all(type(m) is dict and 'evidence_refs' in m and 'versions' in m for m in memories.values()),
                 'dedup_input_shape')
    # Exact type before any value test: a string would otherwise read as a group of characters.
    core.require(type(ids) is list, 'dedup_eligible_group')
    core.require(len(ids) >= 2, 'dedup_eligible_group')
    # Object keys are strings, so the type test keeps a wrong-type ID out of the lookup and the set below.
    core.require(all(type(k) is str and k in memories for k in ids), 'dedup_eligible_group')
    core.require(len(ids) == len(set(ids)), 'dedup_eligible_group')
    # Work on resolved originals after validating the complete requested group.
    # The caller's eligible_ids remain untouched; existence is owned by the guard above.
    ids = [key for key in ids if key in memories]
    group = [memories[k] for k in ids]
    core.require(all(type(m.get('pinned')) is bool and type(m.get('archived')) is bool
                     for m in memories.values()), 'dedup_flags')
    # A pin cannot enter this group, even if its hash matches. No pin is scored or changed.
    core.require(all(not m.get('pinned') and not m.get('archived') for m in group
                     if type(m.get('pinned')) is bool and type(m.get('archived')) is bool), 'dedup_protected')
    core.require(type(before.get('project_id')) is str and bool(before['project_id'])
                 and all(m.get('project_id') == before['project_id'] for m in group), 'dedup_scope')
    # Exact type before the set test: 1, True and 1.0 hash alike, and would read as one identical group.
    core.require(all(type(m.get('embed_text_hash')) is str for m in group), 'dedup_identical')
    core.require(len({m['embed_text_hash'] for m in group}) == 1, 'dedup_identical')
    # Exact type before the union: 1 and True collapse there, and a string would iterate as characters.
    core.require(all(string_list(m['evidence_refs']) for m in group), 'dedup_evidence_type')
    oldest = min(ids, key=lambda key: (instant(core, memories[key].get('created_at')), key))
    survivor = oldest
    after = deepcopy(before)
    refs = sorted({ref for m in group for ref in m['evidence_refs']})
    after['memories'][survivor]['evidence_refs'] = refs
    for key in ids:
        if key != survivor:
            after['memories'][key]['archived'] = True
            after['memories'][key]['survivor_id'] = survivor
    after['merge_records'].append({'original_ids': sorted(ids), 'survivor_id': survivor,
                                    'original_evidence_refs': {k: deepcopy(memories[k]['evidence_refs']) for k in sorted(ids)}})
    return after


def dedup_output_shape(after):
    result = after.get('memories'); records = after.get('merge_records')
    return (type(result) is dict
            and all(type(m) is dict and {'evidence_refs', 'versions', 'archived'} <= set(m) for m in result.values())
            and type(records) is list and bool(records) and type(records[-1]) is dict
            and set(records[-1]) == {'original_ids', 'survivor_id', 'original_evidence_refs'})


def dedup_checks(core, before, after):
    """Independent postconditions; a malformed outcome can violate more than one."""
    source = before['memories']
    core.require(all(type(m.get('pinned')) is bool and type(m.get('archived')) is bool
                     for m in source.values()), 'dedup_flags')
    # A malformed output owns this one refusal; the predicates below read its fields by name.
    shape = dedup_output_shape(after)
    yield 'dedup_output_shape', shape
    if not shape:
        return
    result = after['memories']
    # The job writes only memories and merge_records; every other snapshot field stays exact.
    state = ('memories', 'merge_records')
    yield 'dedup_snapshot', same({k: v for k, v in after.items() if k not in state},
                                 {k: v for k, v in before.items() if k not in state})
    # Output flags compare to these exact Booleans through same(), or `is` for
    # the selected archived flag. This enforces their types without coercion.
    ids = before['eligible_ids']; common = set(source) & set(result)
    record = after['merge_records'][-1]; survivor = record['survivor_id']
    oldest = min(ids, key=lambda key: (instant(core, source[key]['created_at']), key))
    yield 'dedup_survivor', survivor == oldest
    yield 'dedup_originals', set(result) == set(source)
    yield 'dedup_lineage', (same(after['merge_records'][:-1], before['merge_records'])
                            and same(record['original_ids'], sorted(ids))
                            and same(record['original_evidence_refs'], {k: source[k]['evidence_refs'] for k in sorted(ids)}))
    yield 'dedup_evidence', all(same(result[k]['evidence_refs'],
                                (sorted({r for i in ids for r in source[i]['evidence_refs']})
                                 if k == survivor else source[k]['evidence_refs'])) for k in common)
    yield 'dedup_versions', all(same(result[k]['versions'], source[k]['versions']) for k in common)
    yield 'dedup_disposition', all(result[k]['archived'] is (k != survivor) for k in set(ids) & common)
    yield 'dedup_links', (all(result[k].get('survivor_id') == survivor for k in set(ids) & common - {survivor})
                          and same({f: v for f, v in result.get(survivor, {}).items() if f == 'survivor_id'},
                                   {f: v for f, v in source.get(survivor, {}).items() if f == 'survivor_id'}))
    yield 'dedup_original_fields', all(same(
        {f: v for f, v in result[k].items() if f not in ('evidence_refs', 'versions', 'archived', 'survivor_id')},
        {f: v for f, v in source[k].items() if f not in ('evidence_refs', 'versions', 'archived', 'survivor_id')})
        for k in set(ids) & common)
    yield 'dedup_unselected', all(same(result[k], source[k]) for k in common - set(ids))


def typed_edits(value, edits):
    """Fixture-only literals preserve deliberate float/Boolean type errors; delete removes a field."""
    for edit in edits:
        parent = value
        for key in edit['path'][:-1]:
            parent = parent[key]
        if edit.get('delete') is True:
            del parent[edit['path'][-1]]
        else:
            parent[edit['path'][-1]] = json.loads(edit['json'])
    return value


def dedup_validate(core, before, after):
    for name, valid in dedup_checks(core, before, after):
        core.require(valid, name)
    return True


def run(core, families, archive=None):
    fixtures = core.load('Plans/memory_card6_policy_fixtures.json')
    result = {}
    for event in families:
        job = event.split('.')[1]
        if job not in (*CUTOFFS, 'dedup_sweep'):
            continue
        counts = {'positives': 0, 'negatives': 0, 'one_defect_negatives': []}
        for case in fixtures['cases']:
            if case['job'] != job:
                continue
            before = typed_edits(deepcopy(case['before']), case.get('before_edits', []))
            frozen = deepcopy(before)
            if job == 'dedup_sweep':
                if case.get('candidate_refusal'):
                    try:
                        dedup_candidate(core, before)
                    except core.Refusal as error:
                        assert str(error) == case['candidate_refusal'], case['name']
                    else:
                        raise AssertionError((case['name'], 'accepted invalid merge'))
                    errors = [case['candidate_refusal']]
                else:
                    after = typed_edits(deepcopy(case.get('after', dedup_candidate(core, before))),
                                        case.get('after_edits', []))
                    errors = [name for name, valid in dedup_checks(core, before, after) if not valid]
                    try:
                        dedup_validate(core, before, after)
                    except core.Refusal as error:
                        assert str(error) == case.get('refusal'), (case['name'], str(error))
                    else:
                        assert 'refusal' not in case, case['name']
                    if not errors:
                        assert same(after, case['expected']), case['name']
            else:
                assert archive is not None
                if case.get('candidate_refusal'):
                    try:
                        archive.archive_candidate(before, job)
                    except core.Refusal as error:
                        assert str(error) == case['candidate_refusal'], case['name']
                    else:
                        raise AssertionError((case['name'], 'accepted invalid selection'))
                    assert same(before, frozen), (case['name'], 'mutated caller input')
                    assert case['refusal'] == case['candidate_refusal'], case['name']
                    counts['negatives'] += 1
                    counts['one_defect_negatives'].append(case['name'])
                    continue
                errors = []
                if any(before['memories'][key]['pinned'] for key in before['selected_ids']):
                    errors.append('selection_pinned')
                if job == 'monthly_summary' and any(before['memories'][key].get('kind') != 'Note'
                                                    for key in before['selected_ids']):
                    errors.append('selection_kind')
                try:
                    errors += [name for name, valid in selection_checks(core, before, job) if not valid]
                except core.Refusal as error:
                    errors.append(str(error))
                try:
                    after = archive.archive_candidate(before, job)
                    after = typed_edits(deepcopy(case.get('after', after)), case.get('after_edits', []))
                    errors += [name for name, valid in archive.archive_checks(before, after, job) if not valid]
                    archive.archive_validate(before, after, job)
                except core.Refusal as error:
                    assert str(error) == case.get('refusal'), (case['name'], str(error))
                else:
                    assert 'refusal' not in case and same(after, case['expected']), case['name']
            assert same(before, frozen), (case['name'], 'mutated caller input')
            assert errors == ([case['refusal']] if 'refusal' in case else []), (case['name'], errors)
            counts['negatives' if errors else 'positives'] += 1
            if errors:
                counts['one_defect_negatives'].append(case['name'])
        result[event] = counts
    return result
