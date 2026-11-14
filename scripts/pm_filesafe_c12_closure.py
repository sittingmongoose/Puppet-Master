#!/usr/bin/env python3
"""DF-only C12 whole-definition schema coverage and retained-store witnesses.

This adapter uses the original SlotValidator and the original Method B rows.
It does not replace schemas, introduce acceptance predicates or credit a
non-targeting mutation. Clause cuts are in memory and always restored. The
whole-definition cut is explicitly a schema-boundary cut, not lifecycle credit.
Run under the lane's capped long-job. Evidence belongs outside the repository.
"""
from __future__ import annotations

import argparse
import copy
from contextlib import contextmanager
import hashlib
import importlib.util
import json
from pathlib import Path
import re
from referencing import Resource
from referencing.jsonschema import DRAFT202012

import pm_filesafe_event_authority as A
import pm_filesafe_event_contracts as C
import pm_filesafe_schema_graph as SG
import pm_filesafe_tables as T
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time
from pm_event_numbers import Refusal

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PHASES = frozenset((
    'contract_payload_schema', 'mat_schema', 'mat_payload_schema',
    'selected_source_schema', 'issued_schema', 'issued_payload_schema',
    'app_body_schema', 'proto_body_schema', 'payload_ref_descriptor'))
# Applicators delegate to the unchanged complete definition. They are not
# independent scalar assertions and receive no invented isolated-row credit.
APPLICATORS = frozenset(('$ref', '$dynamicRef', 'properties', 'patternProperties',
                        'items', 'prefixItems', 'allOf', 'anyOf', 'oneOf',
                        'if', 'then', 'else', 'dependentSchemas', 'not', 'contains'))


def digest(value):
    with SG.exact_integer_text():
        raw = json.dumps(value, sort_keys=True, ensure_ascii=True).encode()
    return hashlib.sha256(raw).hexdigest()


def write(path, value):
    with SG.exact_integer_text():
        path.write_text(json.dumps(value, indent=1, sort_keys=True) + '\n')


def walk(value, path=()):
    yield path, value
    if isinstance(value, dict):
        for k, v in value.items():
            yield from walk(v, path + (k,))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from walk(v, path + (i,))


def pointer(path):
    return '/' + '/'.join(str(x).replace('~', '~0').replace('/', '~1') for x in path)


def at(value, path):
    for k in path:
        value = value[k]
    return value


def replaced(value, path, replacement):
    value = copy.deepcopy(value)
    if not path:
        return copy.deepcopy(replacement)
    at(value, path[:-1])[path[-1]] = copy.deepcopy(replacement)
    return value


def fresh(validator):
    return SG.SlotValidator(validator.schema, registry=validator._registry,
                            _resolver=validator._resolver,
                            format_checker=SG.format_checker())


def errors(validator, value):
    slots = list(SG._SLOTS)
    try:
        with SG.exact_integer_text():
            return list(fresh(validator).iter_errors(value))
    finally:
        SG._SLOTS[:] = slots


def leaves(found):
    for error in found:
        yield error
        yield from leaves(error.context)


def expected_error(found, node, keyword, path):
    return any(e.schema is node and e.validator == keyword
               and tuple(e.absolute_path) == path for e in leaves(found))


class Trace:
    """Observe unchanged DF validators at their real complete-checker calls."""
    def __init__(self, family):
        self.family = family
        self.path = ()
        self.events = None
        self.pending = None
        self.calls = []
        self.locations = {}
        for name, doc in SG.context(family)[1].items():
            self.index(doc, name)

    def index(self, value, name):
        for path, node in walk(value):
            if isinstance(node, dict):
                self.locations.setdefault(id(node), (name, pointer(path)))

    @contextmanager
    def installed(self):
        old_split, old_descend, old_refusals = SG.split_errors, SG.SlotValidator.descend, T.refusals
        old_keywords = dict(SG.SlotValidator.VALIDATORS)

        def split(validator, value):
            self.path, self.events = (), []
            self.index(validator.schema, 'inline:' + digest(validator.schema))
            result = old_split(validator, value)
            self.pending = (validator, copy.deepcopy(value), self.events)
            self.events = None
            return result

        def descend(validator, instance, schema, path=None, *args, **kwargs):
            previous = self.path
            if path is not None:
                self.path += (path,)
            try:
                yield from old_descend(validator, instance, schema, path=path, *args, **kwargs)
            finally:
                self.path = previous

        def wrapped(keyword, original):
            def check(validator, constraint, instance, schema):
                current = self.path
                found = list(original(validator, constraint, instance, schema))
                if self.events is not None:
                    self.events.append((schema, keyword, current, len(found)))
                yield from found
            return check

        def refusals(phase, facts):
            if phase in SCHEMA_PHASES and self.pending is not None:
                validator, value, events = self.pending
                self.calls.append((phase, validator, value, events, dict(facts)))
                self.pending = None
            return old_refusals(phase, facts)

        SG.split_errors, SG.SlotValidator.descend, T.refusals = split, descend, refusals
        SG.SlotValidator.VALIDATORS.update({k: wrapped(k, v) for k, v in old_keywords.items()})
        try:
            yield self
        finally:
            SG.split_errors, SG.SlotValidator.descend, T.refusals = old_split, old_descend, old_refusals
            SG.SlotValidator.VALIDATORS.clear()
            SG.SlotValidator.VALIDATORS.update(old_keywords)


def observations(family):
    row = next(r for r in A.load('Plans/filesafe_event_authority_fixtures.json')['families']
               if r['event_type'] == family)
    trace = Trace(family)
    controls = []
    with trace.installed():
        for case in row['positive']:
            if case['id'].endswith(('.format.offset', '.format.lowercase')):
                continue
            candidate, bank = copy.deepcopy((case['candidate'], case['bank']))
            expected = {k: candidate[k] for k in ('event', 'custody')}
            results = [A.materialization_failures(family, candidate, bank),
                       A.issued_failures(family, bank['issued'][expected['event']['event_id']], expected, bank),
                       A.selected_source_failures(family, candidate['source'], bank)]
            oracle = A.ProtocolOracle(family, candidate, bank)
            read = oracle.step('read_body')
            if any(results) or read != 'original_history_no_effect':
                raise AssertionError((case['id'], results, read))
            controls.append(case['id'])
        for value in C.contract_row(family)['positive_payloads']:
            result = C.payload_failures(family, value, 'semantic')
            if result:
                raise AssertionError((family, 'payload control', result))
    return trace, controls


def proposals(keyword, node, value):
    """Finite DF clause probes. Failed targeting is recorded without kill credit."""
    constraint = node[keyword]
    if keyword == 'required' and isinstance(value, dict):
        for key in constraint:
            if key in value:
                result = copy.deepcopy(value); del result[key]
                yield key, result
    elif keyword == 'additionalProperties' and constraint is False and isinstance(value, dict):
        yield 'extra', {**value, '__c12_df_unknown__': 1}
    elif keyword == 'type':
        for result in (None, False, 0, 1.5, '', [], {}):
            if not fresh(SG.SlotValidator({'type': constraint})).is_valid(result):
                yield 'primitive_' + type(result).__name__, result
    elif keyword in ('const', 'enum'):
        for result in ('__c12_df_other__', None, False, 2):
            if not SG.SlotValidator({keyword: constraint}).is_valid(result):
                yield 'value', result
                break
    elif keyword in ('minimum', 'exclusiveMinimum'):
        yield 'below', constraint - 1
    elif keyword in ('maximum', 'exclusiveMaximum'):
        yield 'above', constraint + 1
    elif keyword == 'multipleOf':
        yield 'off_multiple', constraint + 0.5
    elif keyword == 'minLength' and constraint > 0:
        yield 'short', 'a' * (constraint - 1)
    elif keyword == 'maxLength':
        yield 'long', 'a' * (constraint + 1)
    elif keyword == 'pattern' and isinstance(value, str):
        for tag, result in (('invalid_ascii', '!' * max(len(value), node.get('minLength', 1))),
                            ('empty', ''), ('trailing_lf', value + '\n'), ('newline', '\n')):
            if not re.search(constraint, result):
                yield tag, result
    elif keyword == 'format' and constraint == 'date-time':
        for result in ('2026-02-30T12:00:00Z', '2026-11-04T12:00:00', '2026-11-04T12:00:00Z\n'):
            yield 'invalid_time', result
    elif keyword == 'minItems' and constraint > 0 and isinstance(value, list):
        yield 'short', value[:constraint - 1]
    elif keyword == 'maxItems' and isinstance(value, list):
        yield 'long', (value or [None]) * (constraint + 1)
    elif keyword == 'uniqueItems' and constraint and isinstance(value, list) and value:
        yield 'duplicate', value + [copy.deepcopy(value[0])]
    elif keyword == 'minProperties' and constraint > 0 and isinstance(value, dict):
        yield 'small', {}
    elif keyword == 'maxProperties' and isinstance(value, dict):
        yield 'large', {str(i): None for i in range(constraint + 1)}


def definition_inventory(phase, validator, trace):
    """Follow every schema/ref branch from the actual selected boundary root.

    Unreferenced $defs are checked by DF's existing eager reference closure;
    they are not incorrectly counted as executed acceptance assertions.
    """
    result = []
    maps = ('properties', 'patternProperties', 'dependentSchemas')
    sequences = ('allOf', 'anyOf', 'oneOf', 'prefixItems')
    single = ('additionalProperties', 'unevaluatedProperties', 'items',
              'unevaluatedItems', 'contains', 'propertyNames', 'not', 'if', 'then', 'else')

    def visit(node, resolver, route, active):
        if not isinstance(node, dict) or id(node) in active:
            return
        active = active | {id(node)}
        if '$id' in node:
            resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
        location = trace.locations.get(id(node), ('inline:' + digest(node), '/'))
        for keyword in node:
            if keyword in SG.SlotValidator.VALIDATORS:
                result.append(dict(phase=phase, schema=location[0], pointer=location[1],
                                   route=route, keyword=keyword, node_sha256=digest(node),
                                   constraint_sha256=digest(node[keyword])))
        for keyword in ('$ref', '$dynamicRef'):
            if keyword in node:
                resolved = resolver.lookup(node[keyword])
                visit(resolved.contents, resolved.resolver, route + '/' + keyword + ':' + node[keyword], active)
        for keyword in maps:
            for name, child in node.get(keyword, {}).items():
                visit(child, resolver, route + '/' + keyword + '/' + name, active)
        for keyword in sequences:
            for index, child in enumerate(node.get(keyword, [])):
                visit(child, resolver, route + '/' + keyword + '/' + str(index), active)
        for keyword in single:
            if keyword in node:
                visit(node[keyword], resolver, route + '/' + keyword, active)

    visit(validator.schema, validator._resolver, '', set())
    return result


def schema_coverage(family, out):
    trace, controls = observations(family)
    matrix, ledger, seen, calls, definitions = [], [], set(), [], []
    roots = set()
    for call_index, (phase, validator, value, events, facts) in enumerate(trace.calls):
        if facts.get('errors', 0) or facts.get('slot_type', 0):
            raise AssertionError(('invalid schema control', family, phase, facts))
        call_id = f'{family}/{phase}/{call_index}'
        calls.append(dict(id=call_id, phase=phase, root_sha256=digest(validator.schema),
                          control_sha256=digest(value), facts=facts))
        root = phase, digest(validator.schema)
        if root not in roots:
            roots.add(root)
            definitions.extend(definition_inventory(phase, validator, trace))
        for node, keyword, path, error_count in events:
            location = trace.locations.get(id(node), ('inline:' + digest(node), '/'))
            occurrence = (phase, location, keyword, path)
            if occurrence in seen or error_count:
                continue
            seen.add(occurrence)
            row = dict(family=family, phase=phase, schema=location[0], schema_pointer=location[1],
                       keyword=keyword, instance_pointer=pointer(path), control=call_id,
                       constraint_sha256=digest(node[keyword]), method='whole_definition', witnesses=[])
            matrix.append(row)
            if keyword in APPLICATORS:
                row['coverage'] = 'complete_definition_applicator'
                row['reason'] = 'Original validator dispatches this applicator to its unchanged referenced/child assertions; the original whole-definition row consumes the complete error count. No independent scalar-row credit.'
                continue
            if keyword == 'additionalProperties' and node[keyword] is True:
                row['coverage'] = 'explicitly_unrestricted'
                row['reason'] = 'The owner explicitly permits additional properties here. There is no refusal to isolate; the unchanged keyword remains in the complete definition.'
                continue
            if '/if/' in location[1] or location[1].endswith('/if'):
                row['coverage'] = 'conditional_selector'
                row['reason'] = 'This physical clause is inside if. JSON Schema uses it only to select then/else; it cannot itself cause an acceptance refusal. Branch assertions stay in the complete definition. Project/application controls exercise the selected branches.'
                continue
            try:
                original_value = at(value, path)
            except (KeyError, IndexError, TypeError):
                raise AssertionError(('trace path drift', call_id, path))
            candidates = list(proposals(keyword, node, original_value))
            for tag, changed in candidates:
                mutant = replaced(value, path, changed)
                found = errors(validator, mutant)
                target = expected_error(found, node, keyword, path)
                entry = dict(id=f'{family}/clause/{len(ledger)}', phase=phase,
                             schema=location[0], schema_pointer=location[1], keyword=keyword,
                             instance_pointer=pointer(path), tag=tag,
                             mutant_sha256=digest(mutant), expected_code=T.rows(phase)[0][0],
                             status='INVALID', reason='complete definition did not refuse at the expected clause')
                ledger.append(entry)
                if not target:
                    local = SG.SlotValidator({keyword: node[keyword]}, format_checker=SG.format_checker())
                    entry['local_clause_refuses'] = bool(errors(local, changed))
                    entry['full_definition_accepts'] = not found
                    continue
                # Exact structural refusal; do not count an unrelated exception or keyword.
                codes = T.codes(phase, C.schema_facts(fresh(validator), mutant))
                structural = [n for n, code in T.refusals(phase, {'errors': len(found), 'slot_type': 0})]
                if not structural:
                    raise AssertionError(('clause refusal absent from actual row', entry))
                entry.update(status='KILLED_EXPECTED', expected_code=codes[0], guard_rows=structural)
                entry['covering_clauses'] = [dict(schema=trace.locations.get(id(e.schema), ('inline:' + digest(e.schema), '/')),
                                                 keyword=str(e.validator), instance_pointer=pointer(e.absolute_path))
                                              for e in leaves(found)]
                # Cut exactly this clause on the observed physical node, restore even on failure.
                saved = node.pop(keyword)
                try:
                    cut_errors = errors(validator, mutant)
                    entry['clause_cut_accepts'] = not cut_errors
                    entry['clause_cut_remaining'] = sorted({str(e.validator) for e in leaves(cut_errors)})
                finally:
                    node[keyword] = saved
                restored = errors(validator, mutant)
                entry['restored_exact_refusal'] = expected_error(restored, node, keyword, path)
                entries = T.rows(phase)
                T._ROWS[phase] = [(n, (lambda v, c: None) if n in structural else p, ctx)
                                  for n, p, ctx in entries]
                try:
                    entry['whole_definition_cut_accepts'] = not T.codes(phase, C.schema_facts(fresh(validator), mutant))
                finally:
                    T._ROWS[phase] = entries
                entry['control_restored'] = not errors(validator, value)
                if not all(entry[k] for k in ('restored_exact_refusal', 'whole_definition_cut_accepts', 'control_restored')):
                    raise AssertionError(('cut/restoration failed', entry))
                row['witnesses'].append(entry['id'])
                if keyword == 'type':
                    break
            row['coverage'] = 'clause_witness' if row['witnesses'] else 'complete_definition_covering'
            if not row['witnesses']:
                alternatives = [x['id'] for x in ledger[-len(candidates):] if candidates
                                and x.get('local_clause_refuses') and x.get('full_definition_accepts')]
                row['alternative_branch_witnesses'] = alternatives
                if alternatives:
                    row['coverage'] = 'alternative_branch_witness'
                    row['reason'] = 'These controls violate the local clause but satisfy the full original definition: the clause belongs to a branch/selector, not an unconditional refusal. The unchanged complete definition selects the applicable branch. No mutation kill credit.'
                elif not candidates and keyword in ('minLength', 'minItems', 'minProperties') and node[keyword] == 0:
                    row['coverage'] = 'vacuous_lower_bound'
                    row['reason'] = 'Cardinality cannot be negative; zero is a vacuous lower bound under the declared type.'
                else:
                    row['reason'] = 'Unresolved clause witness: no covering credit. See complete definition and invalid ledger.'
    covered = {}
    for entry in ledger:
        if entry['status'] == 'KILLED_EXPECTED':
            for clause in entry.get('covering_clauses', []):
                key = entry['phase'], *clause['schema'], clause['keyword']
                covered.setdefault(key, []).append(entry['id'])
    observed = {(r['phase'], r['schema'], r['schema_pointer'], r['keyword']) for r in matrix}
    for item in definitions:
        key = item['phase'], item['schema'], item['pointer'], item['keyword']
        item['observed'] = key in observed
        item['covering_witnesses'] = covered.get(key, [])
        item['covered'] = item['observed'] or bool(item['covering_witnesses'])
    uncovered = [x for x in definitions if not x['covered']]
    summary = dict(family=family, controls=controls, calls=len(calls), occurrences=len(matrix),
                   killed=sum(x['status'] == 'KILLED_EXPECTED' for x in ledger),
                   invalid=sum(x['status'] == 'INVALID' for x in ledger),
                   covering=sum(x['coverage'] == 'complete_definition_covering' for x in matrix),
                   reachable_clauses=len(definitions), uncovered_clauses=len(uncovered),
                   failures=len(uncovered) + sum(x['coverage'] == 'complete_definition_covering' for x in matrix),
                   phases=sorted({c['phase'] for c in calls}),
                   method='original whole-definition Method B; no per-keyword guard-row claim')
    write(out / f'{family}.schema-matrix.json', matrix)
    write(out / f'{family}.schema-calls.json', calls)
    write(out / f'{family}.definition-inventory.json', definitions)
    write(out / f'{family}.uncovered-clauses.json', uncovered)
    write(out / f'{family}.mutation-ledger.json', ledger)
    write(out / f'{family}.schema-summary.json', summary)
    return summary


def retained_checks(family, out):
    row = next(r for r in A.load('Plans/filesafe_event_authority_fixtures.json')['families'] if r['event_type'] == family)
    observations = []
    base = row['positive'][0]
    for index, case in enumerate(row['positive']):
        if case['id'].endswith(('.format.offset', '.format.lowercase')):
            continue
        for variant in ('original', 'missing_receipt', 'ambiguous_edition', 'other_original',
                        'replaced_resource', 'issued_only', 'expectation_only', 'receipt_only'):
            candidate, bank = copy.deepcopy((case['candidate'], case['bank']))
            event_id = candidate['event']['event_id']
            expected = {k: copy.deepcopy(candidate[k]) for k in ('event', 'custody')}
            if variant == 'missing_receipt':
                bank['original_custody'].pop(event_id)
            elif variant == 'ambiguous_edition':
                bank['original_custody'][event_id]['write_time_edition'] = ['DF-prepared-v2', 'other']
            elif variant == 'other_original':
                other = copy.deepcopy(bank['issued'][event_id]); other['event']['event_id'] += '-other'
                bank['issued'][event_id] = other
            elif variant == 'replaced_resource':
                bank['original_custody'][event_id]['resource_manifest_sha256'] = '0' * 64
            elif variant == 'issued_only':
                bank['issued'][event_id]['event']['occurred_at_utc'] = '2000-01-01T00:00:00Z'
            elif variant == 'expectation_only':
                expected['event']['occurred_at_utc'] = '2000-01-01T00:00:00Z'
            elif variant == 'receipt_only':
                bank['issued'][event_id]['custody']['first_append_receipt']['sequence_id'] += 1
            before = digest(bank)
            # Unknown/malformed recipes must be unavailable, never auto-created or restamped.
            try:
                found = A.retained_failures(family, event_id, expected, bank)
            except (TypeError, ValueError, KeyError) as error:
                found = ['UNTRACKED:' + type(error).__name__]
            after = digest(bank)
            observations.append(dict(seed=case['id'], variant=variant, before=before, after=after,
                                     outcome=found, accepted=not found,
                                     expected_accept=variant == 'original'))
    failures = [x for x in observations if x['before'] != x['after'] or x['accepted'] != x['expected_accept']
                or any(code.startswith('UNTRACKED:') for code in x['outcome'])]
    write(out / f'{family}.retained.json', dict(observations=observations, failures=failures))
    return dict(family=family, observations=len(observations), failures=len(failures))


def datetime_checks(family, out):
    trace, controls = observations(family)
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())['cases']
    battery = json.loads((ROOT / 'scripts/pm_event_datetime_timestamp_battery.json').read_text())['samples']
    samples = {digest(c['value']): c['value'] for c in battery}
    for case in corpus:
        if case['op'] in ('datetime', 'datetime_direct'):
            samples[digest(case['value'])] = case['value']
    inventory, failures, seen = [], [], set()
    for phase, validator, value, events, facts in trace.calls:
        for node, keyword, path, count in events:
            if keyword != 'format' or node[keyword] != 'date-time' or count:
                continue
            location = trace.locations.get(id(node), ('inline:' + digest(node), '/'))
            key = phase, location, path
            if key in seen:
                continue
            seen.add(key)
            checked, accepted = 0, 0
            for sample in samples.values():
                # Nullability belongs to type/anyOf; this corpus probes strings
                # through the complete selected definition and leaves types intact.
                if type(sample) is not str:
                    continue
                try:
                    date_time(sample, profile=EVENT_RECORD)
                    want = True
                except Refusal:
                    want = False
                candidate = replaced(value, path, sample)
                found = errors(validator, candidate)
                got = not found
                checked += 1
                accepted += got
                if got != want:
                    failures.append(dict(phase=phase, schema=location, path=pointer(path),
                                         value=sample, expected=want, actual=got,
                                         errors=sorted({str(e.validator) for e in leaves(found)})))
            inventory.append(dict(phase=phase, schema=location[0], pointer=location[1],
                                  instance_pointer=pointer(path), profile=EVENT_RECORD,
                                  checks=checked, accepted=accepted))
    # Actual complete materialization + authenticated retained read at the
    # stricter Storage field boundary, with independently refreshed issued copies.
    spec = importlib.util.spec_from_file_location('df_c12_numbers', ROOT / 'scripts/pm-filesafe-number-corpus.py')
    numbers = importlib.util.module_from_spec(spec); spec.loader.exec_module(numbers)
    base = next(r for r in A.load('Plans/filesafe_event_authority_fixtures.json')['families']
                if r['event_type'] == family)['positive'][0]
    complete = []
    for field in SG.STORAGE_TIMESTAMP_FIELDS:
        for sample in samples.values():
            if type(sample) is not str:
                continue
            candidate, bank = numbers.coherent(base, lambda event, custody: event.__setitem__(field, sample))
            try:
                date_time(sample, profile=STORAGE_UTC_Z)
                want = True
            except Refusal:
                want = False
            found = A.materialization_failures(family, candidate, bank)
            expected = {k: candidate[k] for k in ('event', 'custody')}
            before = digest(bank)
            retained = A.retained_failures(family, candidate['event']['event_id'], expected, bank)
            after = digest(bank)
            if (not found) != want or (not retained) != want or before != after:
                failures.append(dict(field=field, value=sample, expected=want,
                                     materialization=found, retained=retained, mutated=before != after))
            complete.append(dict(field=field, value_sha256=digest(sample), expected=want,
                                 materialization=found, retained=retained,
                                 before=before, after=after))
    write(out / f'{family}.datetime.json', dict(inventory=inventory, complete=complete, failures=failures))
    return dict(family=family, inventory_nodes=len(inventory),
                schema_checks=sum(r['checks'] for r in inventory),
                complete_checks=len(complete), failures=len(failures))


def mutation_checks(family, out):
    import pm_filesafe_p2a_cases as P
    ledger = []
    for case in P.cases():
        if case.get('family') != family:
            continue
        outcome, first = P.first_refusal(case)
        expected = case.get('expected_results') if case['kind'] == 'protocol' else case['expected_error']
        exact = (outcome == expected if case['kind'] == 'protocol'
                 else isinstance(outcome, list) and expected in outcome)
        target = first is not None and first[1] == case['target_row']
        # OS01 is explicitly excluded even if its short-circuit observation
        # looks isolated: the scope schemas plus OS02 entail it.
        credited = exact and target and case['target_row'] != 'OS01_kind'
        ledger.append(dict(id=case['id'], kind=case['kind'], target=case['target_row'],
                           expected=expected, actual=outcome, first=first,
                           status='KILLED_EXPECTED' if credited else 'INVALID',
                           boundary_credit='original complete checker; table proof reported separately'))
    failures = [x for x in ledger if x['status'] == 'INVALID' and x['target'] != 'OS01_kind']
    write(out / f'{family}.original-mutation-ledger.json', dict(ledger=ledger, failures=failures))
    return dict(family=family, attempts=len(ledger),
                killed=sum(x['status'] == 'KILLED_EXPECTED' for x in ledger),
                invalid=sum(x['status'] == 'INVALID' for x in ledger), failures=len(failures))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=A.FAMILIES, action='append')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--mode', choices=('schema', 'retained', 'datetime', 'mutations'), default='schema')
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    result = []
    for family in args.family or A.FAMILIES:
        runner = {'schema': schema_coverage, 'retained': retained_checks,
                  'datetime': datetime_checks, 'mutations': mutation_checks}[args.mode]
        row = runner(family, args.out)
        result.append(row)
        print(json.dumps(row), flush=True)
    write(args.out / f'{args.mode}-summary.json', result)
    return int(any(r.get('failures', 0) for r in result))


if __name__ == '__main__':
    raise SystemExit(main())
