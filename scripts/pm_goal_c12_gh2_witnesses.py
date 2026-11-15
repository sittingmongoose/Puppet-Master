"""C12-GH2 (lane 16) declared-target witnesses for five Goal history families; TEST_ONLY.

Families: goal.evidence_captured, goal.receipt_recorded, goal.stopped,
goal.tool_check_recorded, goal.verification_decided. This source extends
C12-GH1's shared sweep (scripts/pm_goal_guard_sweep.py) without editing it or
scripts/pm_goal_oracle_common.py; it reuses GH1's coherent-copy builder
(pm_goal_c12_witnesses.coherent) and number-corpus slots and expectations
(pm_goal_c12_numbers).

Every negative names its target before it runs, fixed from the row's
invariant (scripts/pm_goal_history_reader_fixtures.py, original_row_guards
and joins; scripts/pm_goal_own_d_oracles.py, establish) or from the owner
keyword at its exact location, never from an observed refusal. Routes:

  protocol    history_guards over the complete ATS-211 protocol case;
  own_d       ReaderOracles._guarded (ATS-1119 complete owner-adapter read);
  payload     the complete owner payload-schema boundary (the history
              reader's own `<key>/payload` route);
  own_d numbers  the shared number corpus through the ATS-1119 reader.

Distinct-copy joins: each selector witness changes the answer selector copy
alone; the event copy, source copy, digest, receipt and index key stay as the
original. `earlier_clause_proof` adds one checked entailment proof (an owner
`required` inside a union alternative, entailed on the same instance by an
unconditional owner `required`). Native execution NOT_RUN.

Run through pm_goal_guard_sweep.py --source pm_goal_c12_gh2_witnesses.
"""
import copy
import hashlib

import pm_event_numbers as numbers
import pm_goal_c12_numbers as gh1_numbers
import pm_goal_c12_witnesses as gh1
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as common
import pm_goal_own_d_oracles as d
from pm_goal_history_reader_fixtures import (CKPT_SCHEMA, ER_SCHEMA, FAMILIES, OUT_SCHEMA, PAYLOAD_FILE,
                                             history_guards)
from pm_goal_oracle_common import Gates, guard_for_location, load, materialize_cases, schema_registry, validator

PLANS = d.PLANS
GH2 = ('stopped', 'verification_decided', 'evidence_captured', 'receipt_recorded', 'tool_check_recorded')


def payload_path(key):
    return PLANS / 'event_payloads/goal_runtime' / f"{PAYLOAD_FILE.get(key, 'goal_' + key)}.schema.json"


def lawful_bases(key):
    fixture = load(PLANS / f'goal_{key}_history_contract_fixtures.json')
    return [c['input'] for c in materialize_cases(fixture['protocol_cases']) if c['valid']]


# --- protocol route: distinct-copy selector joins ---------------------------
def selector_witnesses(base):
    """(label, value, target): the answer selector copy changed alone."""
    event = base['answer']['original_event']
    selector = base['answer']['selector']
    out = [
        ('selector_event_id_copy', gh1.coherent(base, selector={'event_id': event['event_id'] + ':c12-other'}),
         'join/selector/event_id'),
        ('selector_sequence_id_copy', gh1.coherent(base, selector={'sequence_id': event['sequence_id'] + 1}),
         'join/selector/sequence_id'),
        ('selector_project_id_copy', gh1.coherent(base, selector={'project_id': event['project_id'] + ':c12-other'}),
         'join/selector/project_id'),
    ]
    if 'goal_id' in selector:
        out.append(('selector_goal_id_copy', gh1.coherent(base, selector={'goal_id': selector['goal_id'] + ':c12-other'}),
                    'join/selector/goal_id'))
    return out


def protocol_route(collector, registry, out_doc):
    count = 0
    for key in GH2:
        family = FAMILIES[key][0]
        pv = validator(load(payload_path(key)), registry)
        av = validator({'$ref': out_doc['$id'] + '#/$defs/goal_' + key + '_history_answer'}, registry)
        base = lawful_bases(key)[0]

        def evaluate(value, pv=pv, av=av):
            return history_guards(value, pv, av)
        collector.invoke(f'gh2/{key}/protocol/control', evaluate, base, True, family=family)
        for label, value, target in selector_witnesses(base):
            collector.invoke(f'gh2/{key}/protocol/{label}', evaluate, value, False, target=target, family=family)
            count += 1
    return count


# --- own-D route: provenance member set -------------------------------------
def own_d_witnesses(key, base, store):
    """(label, presented, store, target)."""
    out = []
    changed = copy.deepcopy(store)
    if key == 'evidence_captured':
        # No later row reads an unknown member: only the member-set row refuses.
        changed['provenance']['c12_extra_member'] = 'TEST_ONLY extra provenance member'
        out.append(('provenance_extra_member', copy.deepcopy(base), changed, 'evidence_captured/provenance_members'))
    elif key in ('stopped', 'tool_check_recorded'):
        # An extra member whose value equals the payload's absent member (None):
        # the per-member exact rows hold, only the member-set row refuses.
        changed['provenance']['c12_extra_member'] = None
        out.append(('provenance_extra_absent_member', copy.deepcopy(base), changed, key + '/provenance_members'))
    return out


def own_d_route(collector, suite):
    count = 0
    for key in GH2:
        family = FAMILIES[key][0]
        base = d.provenance_original(key, lawful_bases(key)[0])
        store = d.logical_store(key, base)

        def evaluate(value, key=key):
            return suite._guarded('entry', key, value['presented'], value['store'])
        collector.invoke(f'gh2/{key}/own_d/control', evaluate, dict(presented=base, store=store), True, family=family)
        for label, presented, changed, target in own_d_witnesses(key, base, store):
            collector.invoke(f'gh2/{key}/own_d/{label}', evaluate, dict(presented=presented, store=changed), False,
                             target=target, family=family)
            count += 1
    return count


# --- payload-schema boundary --------------------------------------------------
def payload_route(collector, registry):
    count = 0
    for key in ('receipt_recorded', 'tool_check_recorded', 'verification_decided'):
        family = FAMILIES[key][0]
        document = load(payload_path(key))
        pv = validator(document, registry)
        lawful = copy.deepcopy(lawful_bases(key)[0]['answer']['original_event']['payload'])

        def check(value, pv=pv, key=key):
            gate = Gates()
            gate.schema(pv, value, key + '/payload')
            return gate.errors

        def control(label, value):
            collector.invoke(f'gh2/{key}/payload/{label}/control', check, value, True, family=family)

        def negative(label, value, target):
            nonlocal count
            collector.invoke(f'gh2/{key}/payload/{label}', check, value, False, target=target, family=family,
                             generated=True)
            count += 1
        root = document['$id']
        if key == 'receipt_recorded':
            # $defs/event_payload/type: both top-level conditionals select on
            # payload.certifier_decision and are vacuously selected by a
            # non-object payload, so their `then` members are made to hold.
            variant = copy.deepcopy(lawful)
            variant['approval_refs'] = ['approval:c12-original']
            variant['evidence_refs'] = ['risk:c12-original']
            control('event_payload_type', variant)
            target = guard_for_location(root + '/$defs/event_payload/type')
            for label, item in (('string', 'c12'), ('integer', 7), ('null', None), ('array', []), ('boolean', True)):
                changed = copy.deepcopy(variant)
                changed['payload'] = item
                negative('event_payload_type/' + label, changed, target)
        elif key == 'tool_check_recorded':
            # passed + allow selects allOf/0; its then is anyOf(output_ref | log_ref).
            target = guard_for_location(root + '/$defs/event_payload/allOf/0/then/anyOf')
            with_output = copy.deepcopy(lawful)
            with_output['payload'].pop('log_ref', None)
            with_output['payload']['output_ref'] = 'output:c12-original'
            with_log = copy.deepcopy(lawful)
            with_log['payload'].pop('output_ref', None)
            with_log['payload']['log_ref'] = 'log:c12-original'
            for label, variant, member in (('output_only', with_output, 'output_ref'), ('log_only', with_log, 'log_ref')):
                for decision in ('allow', 'not_applicable'):
                    seed = copy.deepcopy(variant)
                    seed['payload']['policy_decision'] = decision
                    control(f'evidence_ref_union/{label}/{decision}', seed)
                    changed = copy.deepcopy(seed)
                    del changed['payload'][member]
                    negative(f'evidence_ref_union/{label}/{decision}/remove_{member}', changed, target)
        else:
            # Corroboration of the entailment proof below (closure_refs inside
            # allOf/0/then/anyOf/0): every input that falsifies that clause is
            # refused by $defs/event_payload/required on the same instance.
            cover = guard_for_location(root + '/$defs/event_payload/required')
            union = guard_for_location(root + '/allOf/0/then/anyOf')
            passed = copy.deepcopy(lawful)
            passed['payload']['decision'] = 'passed'
            control('closure_union/passed', passed)
            changed = copy.deepcopy(passed)
            del changed['payload']['closure_refs']
            # evidence_refs present and non-empty: the second alternative holds,
            # so the union holds and only the unconditional required refuses.
            changed['evidence_refs'] = ['evidence:c12-original']
            negative('closure_union/remove_closure_refs/evidence_present', changed, cover)
            # evidence_refs empty: both alternatives fail. The union and the
            # unconditional required refuse together, each alone under the
            # other's cut (a declared duplicate set of two sites).
            changed = copy.deepcopy(passed)
            del changed['payload']['closure_refs']
            changed['evidence_refs'] = []
            negative('closure_union/remove_closure_refs/evidence_empty', changed, tuple(sorted((cover, union))))
    return count


# --- the shared number corpus through the ATS-1119 reader ---------------------
def stored_original(key, case):
    """Presented and owner store for a corpus case, or the codec's refusal.

    An original whose producer digest, full-value commitment or physical
    frame the shared codecs cannot form cannot exist at rest: no custody record
    can carry it, so there is nothing to read (listed apart, never a kill).
    """
    try:
        presented = d.provenance_original(key, case)
        store = d.logical_store(key, presented)
    except numbers.Refusal as refusal:
        return None, None, 'codec_refusal:' + refusal.reason
    except (TypeError, ValueError, OverflowError) as exc:
        return None, None, 'codec_exception:' + type(exc).__name__
    return presented, store, None


# ATS-1119 alone bounds a line-range span by the original evidence bytes
# (pm_goal_own_d_oracles.establish, `evidence/source_line_bounds`); ATS-211 has
# no such row. GH1's corpus builder sets the span's companion line to the same
# value, so start <= end holds and only the line count decides.
EVIDENCE_LINES = len(d.evidence_bytes().splitlines())
SPAN_SLOTS = {('payload', 'source_spans', 0, 'start_line'), ('payload', 'source_spans', 0, 'end_line')}


def own_d_expectation(key, where, path, value, valid, reason):
    """GH1's history expectation plus the ATS-1119 owner rules at the same slot."""
    if valid and key == 'evidence_captured' and where == 'payload' and tuple(path) in SPAN_SLOTS \
            and value > EVIDENCE_LINES:
        return False, ('own_d', 'evidence/source_line_bounds')
    return valid, reason


def own_d_numbers(collector, suite, registry, out_doc):
    values = gh1_numbers.corpus_values()
    summary = {}
    start = len(collector.failures)
    for key in GH2:
        family = FAMILIES[key][0]
        pv = validator(load(payload_path(key)), registry)
        ev = validator(load(ER_SCHEMA), registry)
        bases = lawful_bases(key)
        found = {}
        for candidate in bases:
            item = candidate['answer']['original_event']
            for path, nodes in gh1_numbers.integer_nodes(pv, item['payload']).items():
                found.setdefault(('payload', path), (nodes, candidate))
            for path, nodes in gh1_numbers.integer_nodes(ev, item).items():
                if len(path) == 1:
                    found.setdefault(('event', path), (nodes, candidate))
        top = gh1_numbers.integer_nodes(pv, bases[0]['answer']['original_event']['payload'])
        companion_nodes = {name: top.get((name,), []) for name in ('goal_revision', 'expected_goal_revision')}

        def evaluate(value, key=key):
            return suite._guarded('entry', key, value['presented'], value['store'])
        stats = dict(slots=[], cases=0, read=0, accepted=0, refused=0, agree=0, disagree=[], crashes=0,
                     not_storable=[], route='ATS-1119 ReaderOracles._guarded(entry)')
        for (where, path), (nodes, owner) in found.items():
            slot = '/'.join(map(str, (where,) + path))
            stats['slots'].append(slot)
            for label, value in values:
                case, placed, representable = gh1_numbers.build(owner, where, path, value)
                # Expectation fixed before the read (GH1's frozen grammar, owner
                # bounds and producer representability), then the stored form.
                valid, reason = gh1_numbers.expectation(value, nodes, placed, representable, companion_nodes, (where, path))
                valid, reason = own_d_expectation(key, where, path, value, valid, reason)
                stats['cases'] += 1
                presented, store, refusal = stored_original(key, case)
                name = f'gh2-numbers-own-d/{key}/{slot}/{label}'
                if store is None:
                    stats['not_storable'].append(dict(case=name, expected_valid=valid, reason=refusal))
                    if valid:
                        # A value the frozen read grammar accepts but no custody
                        # could hold is reported, never silently dropped.
                        stats.setdefault('valid_but_not_storable', []).append(name)
                    continue
                before = len(collector.ledger)
                result = collector.invoke(name, evaluate, dict(presented=presented, store=store), valid,
                                          family=family, generated=True)
                record = collector.ledger[-1] if len(collector.ledger) > before else None
                stats['read'] += 1
                if record is None or record.get('outcome') == 'exception':
                    stats['crashes'] += 1
                    collector.failures.append(dict(kind='gh2_number_corpus_crash', case=name,
                                                   exception=record and record.get('exception')))
                    continue
                errors = set(result['errors'] if isinstance(result, dict) else result)
                stats['accepted' if not errors else 'refused'] += 1
                record['number_expectation'] = dict(valid=valid, reason=list(reason) if reason else None, route='own_d')
                if valid == (not errors):
                    stats['agree'] += 1
                else:
                    stats['disagree'].append(dict(case=name, expected_valid=valid, reason=reason, errors=sorted(errors)))
                    collector.failures.append(dict(kind='gh2_number_corpus_disagreement', case=name,
                                                   expected_valid=valid, errors=sorted(errors)))
        summary[family] = stats
    collector.generator_stats['gh2_own_d_number_corpus'] = summary
    return len(collector.failures) - start


def main():
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_guard_sweep.py --source pm_goal_c12_gh2_witnesses')
    start = len(collector.failures)
    paths = [OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA] + [payload_path(k) for k in FAMILIES if payload_path(k).exists()]
    registry = schema_registry(paths)
    out_doc = load(OUT_SCHEMA)
    suite = d.ReaderOracles()
    stats = dict(protocol=protocol_route(collector, registry, out_doc), own_d=own_d_route(collector, suite),
                 payload=payload_route(collector, registry))
    own_d_numbers(collector, suite, registry, out_doc)
    collector.generator_stats['gh2_bank'] = stats
    return int(len(collector.failures) > start)


# --- checked entailment proof -------------------------------------------------
def _resolve(document, node):
    seen = 0
    while isinstance(node, dict) and '$ref' in node:
        ref = node['$ref']
        if not ref.startswith('#/') or seen > 16:
            return None, None
        target = document
        for part in ref[2:].split('/'):
            target = target[part.replace('~1', '/').replace('~0', '~')]
        node, location = target, document['$id'] + '/' + ref[2:]
        seen += 1
        if '$ref' not in node:
            return node, location
    return node, None


def entailment(name):
    """The unconditional owner `required` that entails this union-member `required`, or None.

    Checked on the owner document: the row is a `required` reached through a
    conditional or union; the instance it applies to is reached from the root
    by `properties` only; the root reaches that same instance unconditionally
    through `properties` (and local $ref) to a node whose own `required`
    contains every member the row requires; that cover is reached outside
    every union. Then every instance falsifying the row falsifies the cover.
    """
    info = common._SCHEMA_ASSERTION_INFO.get(name)
    if not info or info['keyword'] != 'required':
        return None
    for key in GH2:
        path = payload_path(key)
        document = load(path)
        prefix = document['$id'] + '/'
        if info['location'].startswith(prefix):
            break
    else:
        return None
    segments = info['location'][len(prefix):].split('/')
    node, instance, guarded, index = document, [], False, 0
    while index < len(segments):
        word = segments[index]
        if word in ('allOf', 'anyOf', 'oneOf'):
            node = node[word][int(segments[index + 1])]
            guarded = guarded or word != 'allOf'
            index += 2
        elif word in ('then', 'else'):
            node, guarded, index = node[word], True, index + 1
        elif word == 'properties':
            node = node['properties'][segments[index + 1]]
            instance.append(segments[index + 1])
            index += 2
        else:
            return None
    if not guarded or node.get('required') != info['value'] or not instance:
        return None
    cover_node, cover_location = document, document['$id']
    for member in instance:
        child = cover_node.get('properties', {}).get(member)
        if child is None:
            return None
        cover_node, location = _resolve(document, child)
        if cover_node is None or location is None:
            return None
        cover_location = location
    if not set(info['value']) <= set(cover_node.get('required', [])):
        return None
    cover = guard_for_location(cover_location + '/required')
    if common._SCHEMA_UNION_CONTEXTS.get(cover) != {None}:
        return None
    unions = sorted(u for u in common._SCHEMA_UNION_CONTEXTS.get(name, ()) if u)
    return dict(key=key, path=path, cover=cover, cover_location=cover_location, instance=instance, unions=unions)


def earlier_clause_proof(name, reports):
    found = entailment(name)
    if found is None:
        return None
    earlier = sorted({found['cover'], *found['unions']})
    passed = {r['guard'] for r in reports if r['status'] == 'PASS'}
    if not set(earlier) <= passed:
        return None
    source = common.ROOT / 'scripts/pm_goal_oracle_common.py'
    lines = [i for i, x in enumerate(source.read_text().splitlines(), 1)
             if 'if union_errors:' in x or "out={e.oracle_guard for e in errors}" in x]
    me = common.ROOT / 'scripts/pm_goal_c12_gh2_witnesses.py'
    owner = found['path'].relative_to(common.ROOT)
    return dict(kind='entailed_by_unconditional_required', earlier_guards=earlier,
                owner=f'{owner}#' + common._SCHEMA_ASSERTION_INFO[name]['location'].split('/', 1)[1] + '/required',
                owner_sha256=hashlib.sha256(found['path'].read_bytes()).hexdigest(),
                cover=dict(guard=found['cover'], location=found['cover_location'] + '/required',
                           instance='/' + '/'.join(found['instance'])),
                checker='scripts/pm_goal_oracle_common.py:' + ','.join(map(str, lines)),
                checker_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                proof_checker='scripts/pm_goal_c12_gh2_witnesses.py:entailment',
                proof_checker_sha256=hashlib.sha256(me.read_bytes()).hexdigest(),
                corroboration=[f'gh2/{found["key"]}/payload/closure_union/remove_closure_refs/evidence_present',
                               f'gh2/{found["key"]}/payload/closure_union/remove_closure_refs/evidence_empty'],
                proof=('This required sits inside a union alternative under a conditional and applies to the instance '
                       '/' + '/'.join(found['instance']) + ', which the schema root also reaches unconditionally (properties '
                       'and local $ref only) at ' + found['cover_location'] + '; that node\'s own required contains every '
                       'member this clause requires and is reached outside every union. So every instance falsifying this '
                       'clause is refused by ' + found['cover'] + ' on the same instance: the clause is never the sole '
                       'refusal. Where the other alternatives also fail, schema_guards reports the composed union ('
                       + ', '.join(found['unions']) + ') for it, never this keyword. The cover and the union are each '
                       'separately proved; the corroboration witnesses show the cover alone, and the cover and union as a '
                       'declared two-site duplicate set.'))
