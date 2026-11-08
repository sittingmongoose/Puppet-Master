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
    core.require('pt_instant', value_type=type(value).__name__,
                 conforms=core.enforced_formats().conforms(value, 'date-time') if type(value) is str else None)
    fraction, zone = re.fullmatch(r'(?:\.([0-9]+))?([Zz]|[+-][0-9]{2}:[0-9]{2})', value[19:]).groups()
    whole = datetime.fromisoformat(value[:19].replace('t', 'T') + ('+00:00' if zone in ('Z', 'z') else zone))
    offset = whole.utcoffset()
    seconds = (whole.toordinal() * 86400 + whole.hour * 3600 + whole.minute * 60 + whole.second
               - offset.days * 86400 - offset.seconds)
    return seconds + Fraction(Decimal('0.' + fraction)) if fraction else Fraction(seconds)


def selection_observations(core, snapshot, job):
    """Only selected, already resolved originals; no count trigger or cross-scope pool.

    Kind/pin/existence/uniqueness checks stay at the existing archive boundary. Pins are
    excluded here before reading a score. An absent edit/access independently falls back
    to creation, then the later instant wins. Fractional days are compared as durations.
    Yields (phase, facts) lazily in the original order; instants are parsed only when reached.
    """
    days, score, _ = CUTOFFS[job]
    keys = [key for key in snapshot['selected_ids']
            if key in snapshot['memories'] and snapshot['memories'][key]['pinned'] is not True]
    selected = [snapshot['memories'][key] for key in keys]
    project = snapshot['project_id']
    yield 'ps_scope', {'project_type': type(project).__name__,
                       'project_empty': (not project) if type(project) is str else None,
                       'foreign_ids': [k for k, m in zip(keys, selected) if not m.get('project_id') == project]}
    # Exact flag type belongs to archive.memory_flags; this predicate owns active vs archived.
    yield 'ps_active', {'archived_ids': [k for k, m in zip(keys, selected) if type(m['archived']) is bool and m['archived']]}
    captured = instant(core, snapshot['captured_at'])
    starts = [max(instant(core, m.get('created_at') if m.get('updated_at') is None else m['updated_at']),
                  instant(core, m.get('created_at') if m.get('last_access_at') is None else m['last_access_at']))
              for m in selected]
    yield 'ps_age', {'young_ids': [k for k, start in zip(keys, starts) if not captured - start >= days * 86400]}
    values = [m.get('usefulness_score') for m in selected]
    bad = [k for k, v in zip(keys, values)
           if not (type(v) in (int, float, Decimal) and
                   (v.is_finite() if type(v) is Decimal else math.isfinite(v) if type(v) is float else True))]
    yield 'ps_score', {'bad_type_ids': bad, 'high_ids': [] if bad else [k for k, v in zip(keys, values) if not v < score]}


def selection_require(core, snapshot, job):
    for phase, facts in selection_observations(core, snapshot, job):
        core.require(phase, **facts)


def phase_codes(core, phase, facts):
    """The distinct refusal codes of one phase's failing rows (one former check site), in row order."""
    return list(dict.fromkeys(code for _, code in core.table_failures(phase, facts)))


def selection_errors(core, snapshot, job):
    """Lane oracle: every failing selection site, as the former generator listed them."""
    errors = []
    for phase, facts in selection_observations(core, snapshot, job):
        errors += phase_codes(core, phase, facts)
    return errors


def dedup_candidate(core, before):
    """One owner-eligible identical group; eligibility itself is supplied by the owner.

    Selection always uses the oldest original then stable note ID.
    """
    memories = before.get('memories'); ids = before.get('eligible_ids')
    members = memories if type(memories) is dict else {}
    core.require('dc_input', memories_type=type(memories).__name__, merge_records_type=type(before.get('merge_records')).__name__,
                 nonobject_ids=[k for k, m in members.items() if type(m) is not dict],
                 no_evidence_ids=[k for k, m in members.items() if type(m) is dict and 'evidence_refs' not in m],
                 no_versions_ids=[k for k, m in members.items() if type(m) is dict and 'versions' not in m])
    # Exact type before any value test: a string would otherwise read as a group of characters.
    core.require('dc_group_type', ids_type=type(ids).__name__)
    core.require('dc_group_min', count=len(ids))
    # Object keys are strings, so the type test keeps a wrong-type ID out of the lookup and the set below.
    core.require('dc_group_exists', bad_ids=[k for k in ids if not (type(k) is str and k in memories)])
    core.require('dc_group_unique', count=len(ids), distinct_count=len(set(ids)))
    # Work on resolved originals after validating the complete requested group.
    # The caller's eligible_ids remain untouched; existence is owned by the guard above.
    ids = [key for key in ids if key in memories]
    group = [memories[k] for k in ids]
    dedup_flags(core, memories)
    # A pin cannot enter this group, even if its hash matches. No pin is scored or changed.
    core.require('dc_protected', pinned_ids=[k for k, m in zip(ids, group) if m.get('pinned')],
                 archived_ids=[k for k, m in zip(ids, group) if m.get('archived')])
    project = before.get('project_id')
    core.require('dc_scope', project_type=type(project).__name__, project_empty=(not project) if type(project) is str else None,
                 foreign_ids=[k for k, m in zip(ids, group) if not m.get('project_id') == project])
    # Exact type before the set test: 1, True and 1.0 hash alike, and would read as one identical group.
    core.require('dc_hash_type', bad_hash_ids=[k for k, m in zip(ids, group) if type(m.get('embed_text_hash')) is not str])
    core.require('dc_hash', distinct_hashes=len({m['embed_text_hash'] for m in group}))
    # Exact type before the union: 1 and True collapse there, and a string would iterate as characters.
    core.require('dc_evidence_type', bad_evidence_ids=[k for k, m in zip(ids, group) if not string_list(m['evidence_refs'])])
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


def dedup_flags(core, memories):
    core.require('dc_flags', bad_pinned_ids=[k for k, m in memories.items() if type(m.get('pinned')) is not bool],
                 bad_archived_ids=[k for k, m in memories.items() if type(m.get('archived')) is not bool])


def dedup_output_shape(after):
    result = after.get('memories'); records = after.get('merge_records')
    return (type(result) is dict
            and all(type(m) is dict and {'evidence_refs', 'versions', 'archived'} <= set(m) for m in result.values())
            and type(records) is list and bool(records) and type(records[-1]) is dict
            and set(records[-1]) == {'original_ids', 'survivor_id', 'original_evidence_refs'})


def dedup_observations(core, before, after):
    """Independent postconditions as (phase, facts), lazily and in the original order."""
    source = before['memories']
    result = after.get('memories'); records = after.get('merge_records')
    members = result if type(result) is dict else {}
    last = records[-1] if type(records) is list and records else None
    # A malformed output owns this one refusal; the predicates below read its fields by name.
    yield 'dv_shape', {'memories_type': type(result).__name__,
                       'nonobject_ids': [k for k, m in members.items() if type(m) is not dict],
                       'missing_field_ids': [k for k, m in members.items()
                                             if type(m) is dict and not {'evidence_refs', 'versions', 'archived'} <= set(m)],
                       'records_type': type(records).__name__,
                       'records_count': len(records) if type(records) is list else None,
                       'last_type': type(last).__name__ if type(records) is list and records else None,
                       'last_keys': sorted(last) if type(last) is dict else None}
    if not dedup_output_shape(after):
        return
    result = after['memories']
    # The job writes only memories and merge_records; every other snapshot field stays exact.
    state = ('memories', 'merge_records')
    yield 'dv_snapshot', {'snapshot_same': same({k: v for k, v in after.items() if k not in state},
                                                {k: v for k, v in before.items() if k not in state})}
    # Output flags compare to these exact Booleans through same(), or `is` for
    # the selected archived flag. This enforces their types without coercion.
    ids = before['eligible_ids']; common = set(source) & set(result)
    record = after['merge_records'][-1]; survivor = record['survivor_id']
    oldest = min(ids, key=lambda key: (instant(core, source[key]['created_at']), key))
    yield 'dv_survivor', {'survivor_matches': survivor == oldest}
    yield 'dv_originals', {'same_ids': set(result) == set(source)}
    yield 'dv_lineage', {'prior_same': same(after['merge_records'][:-1], before['merge_records']),
                         'ids_same': same(record['original_ids'], sorted(ids)),
                         'evidence_same': same(record['original_evidence_refs'], {k: source[k]['evidence_refs'] for k in sorted(ids)})}
    yield 'dv_evidence', {'changed_ids': sorted(k for k in common if not same(
        result[k]['evidence_refs'], (sorted({r for i in ids for r in source[i]['evidence_refs']})
                                     if k == survivor else source[k]['evidence_refs'])))}
    yield 'dv_versions', {'changed_ids': sorted(k for k in common if not same(result[k]['versions'], source[k]['versions']))}
    yield 'dv_disposition', {'wrong_ids': sorted(k for k in set(ids) & common if result[k]['archived'] is not (k != survivor))}
    yield 'dv_links', {'unlinked_ids': sorted(k for k in set(ids) & common - {survivor} if not result[k].get('survivor_id') == survivor),
                       'survivor_link_same': same({f: v for f, v in result.get(survivor, {}).items() if f == 'survivor_id'},
                                                  {f: v for f, v in source.get(survivor, {}).items() if f == 'survivor_id'})}
    yield 'dv_fields', {'changed_ids': sorted(k for k in set(ids) & common if not same(
        {f: v for f, v in result[k].items() if f not in ('evidence_refs', 'versions', 'archived', 'survivor_id')},
        {f: v for f, v in source[k].items() if f not in ('evidence_refs', 'versions', 'archived', 'survivor_id')}))}
    yield 'dv_unselected', {'changed_ids': sorted(k for k in common - set(ids) if not same(result[k], source[k]))}


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
    dedup_flags(core, before['memories'])
    for phase, facts in dedup_observations(core, before, after):
        core.require(phase, **facts)
    return True


def dedup_errors(core, before, after):
    """Lane oracle: every failing postcondition site, as the former generator listed them."""
    dedup_flags(core, before['memories'])
    errors = []
    for phase, facts in dedup_observations(core, before, after):
        errors += phase_codes(core, phase, facts)
    return errors


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
                    errors = dedup_errors(core, before, after)
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
                    errors += selection_errors(core, before, job)
                except core.Refusal as error:
                    errors.append(str(error))
                try:
                    after = archive.archive_candidate(before, job)
                    after = typed_edits(deepcopy(case.get('after', after)), case.get('after_edits', []))
                    errors += archive.archive_errors(before, after, job)
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
