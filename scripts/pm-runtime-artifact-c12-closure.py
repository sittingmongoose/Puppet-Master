#!/usr/bin/env python3
"""DR criterion-12 closure replay over the unmodified DR checker; writes explicit evidence.

Parts (each per exact family, --family repeatable):
  schema    reachable owner-schema keyword inventory per occurrence, directed
            whole-occurrence clause witnesses, complete-boundary first refusal,
            single-row cut and restoration; INVALID proposals listed apart.
  pairs     every causal witness pair of the full checker: declared legacy
            label, exact first refusal, complete-path cut and restoration.
  retained  SP-1101 retained reads (history; restore_point predecessor) with
            declared expected rows and sealed-store snapshots before/after.
  datetime  the shared timestamp battery through the complete boundary at every
            DR timestamp field, expected from pm_event_datetime.date_time.

The gated guard tool stays separate (pm-runtime-artifact-guard-tables.py). This
driver never credits a refusal other than the declared one.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_runtime_artifact_c12 as c12  # noqa: E402
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time  # noqa: E402
from pm_event_numbers import Refusal  # noqa: E402

dr, suites = c12.dr, c12.suites
MAX_LOCATIONS = 2
ERASED = object()


def family_context(row, fixtures):
    family = row['event_type']
    full = copy.deepcopy(fixtures['positive_events'][family])
    receipt = fixtures['first_append_receipts'][family]
    template = fixtures['custody_template']
    first = dr.AppendModel(row, {}, receipt, template).append(copy.deepcopy(full), admission=True)
    history = [c for c in fixtures['historical_originals']['cases'] + fixtures['historical_numeric_originals']['cases']
               if c['event_type'] == family]
    return dict(family=family, row=row, full=full, receipt=receipt, template=template, first=first,
                bundle=fixtures['checkpoint_positives'][family], history=history, fixtures=fixtures)


def occurrences(ctx):
    """Every schema occurrence one family's complete checker validates, with its complete route."""
    row, full, first, bundle = ctx['row'], ctx['full'], ctx['first'], ctx['bundle']
    doc = row['payload_schema_ref']
    schema = dr.load(doc)
    receipt_doc, cp_doc = 'Plans/event_append_receipt_contracts.schema.json', 'Plans/event_record_index_checkpoint.schema.json'
    cp = dr.load(cp_doc)
    fixtures = ctx['fixtures']
    seeds = [full['payload']]
    if ctx['family'].endswith('.restore_point'):
        seeds += [fixtures['restore_successor']['payload']] + [t['payload'] for t in fixtures['restore_terminal_observations'].values()]
    inline_history = [c for c in ctx['history'] if c['route'] in ('inline', 'numeric_inline')]

    def payload_route(instance):
        event = copy.deepcopy(full)
        event['payload'] = instance
        return lambda: dr.decode(row, event, {})

    def packed_route(instance):
        large = dict(instance, summary='x' * 17000)
        packs = {}
        event = copy.deepcopy(full)
        try:
            event['payload'], event['payload_ref'] = dr.storage_form(large, packs)
        except dr.TableRefusal:
            return None
        if event['payload_ref'] is None:
            return None
        # A defect the RFC 8785 body cannot carry (an integral float is written as an integer) never
        # reaches the packed boundary: that input is not a single-defect witness there.
        body = packs[dr.PACK_REF.fullmatch(event['payload_ref']).group(1)]['body']
        if c12.store_digest(dr.parse_pack_body(body)[1]) != c12.store_digest(large):
            return ERASED
        return lambda: dr.decode(row, event, packs)

    def envelope_route(instance):
        return lambda: dr.AppendModel(row, {}, ctx['receipt'], ctx['template']).append(copy.deepcopy(instance), True)

    def receipt_route(instance):
        original = copy.deepcopy(first)
        original['result']['first_append_receipt'] = copy.deepcopy(instance)
        original['custody']['first_append_receipt'] = copy.deepcopy(instance)
        return lambda: dr.full_value_matches(full, original, original['result'], original['custody'])

    def custody_route(instance):
        original = copy.deepcopy(first)
        original['custody'] = copy.deepcopy(instance)
        return lambda: dr.full_value_matches(full, original, original['result'], original['custody'])

    def result_route(instance):
        original = copy.deepcopy(first)
        original['result'] = copy.deepcopy(instance)
        return lambda: dr.full_value_matches(full, original, original['result'], original['custody'])

    def checkpoint_route(key):
        def route(instance):
            changed = copy.deepcopy(bundle)
            changed[key] = copy.deepcopy(instance)
            return lambda: dr.checkpoint_matches(row, full, first, changed)
        return route

    def history_route(case, place):
        """Sealed as written: the authenticated original is the same mutated original."""
        def route(instance):
            original = copy.deepcopy(case['original'])
            if place == 'event':
                original['event'] = copy.deepcopy(instance)
            elif place == 'payload':
                original['event']['payload'] = copy.deepcopy(instance)
            elif place == 'receipt':
                original['result']['first_append_receipt'] = copy.deepcopy(instance)
                original['custody']['first_append_receipt'] = copy.deepcopy(instance)
            else:
                original[place] = copy.deepcopy(instance)
            packs = {k: dict(v, body=v['body'].encode()) for k, v in case['packs'].items()}
            source = dr.history_source_for(row, case['logical_payload'], original)
            return lambda: dr.resolve_history(row, original, source, packs)
        return route

    hist = dr.HISTORICAL_V1
    result = [
        dict(role='payload', document=doc, pointer='', tv=dr.validator(schema), seeds=seeds,
             routes=dict(inline=payload_route, packed=packed_route)),
        dict(role='envelope', document='Plans/event_record.schema.json', pointer='', tv=dr.EVENT_VALIDATOR, seeds=[full],
             routes=dict(append=envelope_route)),
        dict(role='receipt', document=receipt_doc, pointer='/$defs/AppendReceipt', tv=dr.RECEIPT_VALIDATOR,
             seeds=[first['result']['first_append_receipt']], routes=dict(full_value=receipt_route)),
        dict(role='custody', document=receipt_doc, pointer='/$defs/custody_v2', tv=dr.CUSTODY_VALIDATOR,
             seeds=[first['custody']], routes=dict(full_value=custody_route)),
        dict(role='result', document=receipt_doc, pointer='/$defs/full_value_result', tv=dr.RESULT_VALIDATOR,
             seeds=[first['result']], routes=dict(full_value=result_route)),
        dict(role='checkpoint', document=cp_doc, pointer='/$defs/checkpoint', tv=dr.validator(cp, 'checkpoint'),
             seeds=[bundle['checkpoint']], routes=dict(checkpoint=checkpoint_route('checkpoint'))),
        dict(role='read_token', document=cp_doc, pointer='/$defs/read_token', tv=dr.validator(cp, 'read_token'),
             seeds=[bundle['read_token']], routes=dict(checkpoint=checkpoint_route('read_token'))),
    ]
    if inline_history:
        case = inline_history[0]
        result += [
            dict(role='payload_historical_v1', document=doc, pointer='', tv=dr.validator(schema, validation=hist),
                 seeds=[c['original']['event']['payload'] for c in inline_history], routes=dict(history=history_route(case, 'payload'))),
            dict(role='envelope_historical_v1', document='Plans/event_record.schema.json', pointer='',
                 tv=dr.validator(dr.EVENT_VALIDATOR.schema, validation=hist),
                 seeds=[c['original']['event'] for c in inline_history], routes=dict(history=history_route(case, 'event'))),
            dict(role='receipt_historical_v1', document=receipt_doc, pointer='/$defs/AppendReceipt',
                 tv=dr.validator(dr.RECEIPT_SCHEMA, 'AppendReceipt', validation=hist),
                 seeds=[c['original']['result']['first_append_receipt'] for c in inline_history], routes=dict(history=history_route(case, 'receipt'))),
            dict(role='custody_historical_v1', document=receipt_doc, pointer='/$defs/custody_v2',
                 tv=dr.validator(dr.RECEIPT_SCHEMA, 'custody_v2', validation=hist),
                 seeds=[c['original']['custody'] for c in inline_history], routes=dict(history=history_route(case, 'custody'))),
            dict(role='result_historical_v1', document=receipt_doc, pointer='/$defs/full_value_result',
                 tv=dr.validator(dr.RECEIPT_SCHEMA, 'full_value_result', validation=hist),
                 seeds=[c['original']['result'] for c in inline_history], routes=dict(history=history_route(case, 'result'))),
        ]
    return result


def overlay_sites(ctx):
    """CV-526/CV-537 current-writer provider-hash overlay (lane overlay, not an owner-document keyword)."""
    path = dr.PROVIDER_HASH_PATHS.get(ctx['family'])
    if path is None:
        return []
    return [dict(role='payload', document='overlay:' + ctx['row']['payload_schema_ref'], schema_pointer='/provider_payload_hash/allOf/1/pattern',
                 keyword='pattern', instance=list(path), predicate=['S03_provider_hash_overlay'], rule_sha256='overlay:' + ctx['family'],
                 rule={'pattern': '^sha256:[0-9a-f]{64}$', 'minLength': 71, 'maxLength': 71, 'type': ['string', 'null']})]


def schema_part(ctx, references, out):
    """Inventory, clause witnesses and complete-boundary schema kills for one family."""
    graph = c12.Graph(references)
    sites, attempts, invalid, boundary, reached, local_probes = [], [], [], [], set(), []
    for occ in occurrences(ctx):
        tv = occ['tv']
        # Every seed is a validated control of this exact occurrence validator.
        controls = [s for s in occ['seeds'] if tv.refusal(s) is None]
        seen_sites = set()
        nodes = list(graph.walk(occ['document'], occ['pointer']))
        for entry in nodes:
            reached.add((entry['document'], entry['pointer']))
            node = entry['node']
            if not isinstance(node, dict):
                sites.append(dict(role=occ['role'], document=entry['document'], schema_pointer=entry['pointer'],
                                  instance=list(entry['instance']), keyword='<boolean schema>', status='BOOLEAN_SCHEMA',
                                  rule_sha256=c12.fingerprint(node), predicate=['S07_structural']))
                continue
            for keyword in sorted(node):
                kind = ('assertion' if keyword in c12.ASSERTIONS else 'applicator' if keyword in c12.APPLICATORS
                        else 'annotation' if keyword in c12.ANNOTATIONS else 'non_keyword')
                if kind in ('assertion', 'applicator') and entry['mode'] != 'assert':
                    kind = entry['mode']  # an 'if' condition selects a branch; a 'not' body is inverted
                key = (entry['document'], entry['pointer'], keyword, entry['instance'])
                if key in seen_sites:
                    continue
                seen_sites.add(key)
                site = dict(role=occ['role'], document=entry['document'], schema_pointer=entry['pointer'] + '/' + c12.esc(keyword),
                            instance=[str(x) for x in entry['instance']], keyword=keyword, kind=kind,
                            rule_sha256=c12.fingerprint(node), cycle=entry['cycle'],
                            predicate=c12.predicate_for(keyword, node) if kind in ('assertion', 'applicator') else [],
                            branch_depth=len(entry['branches']), witnesses=[], invalid=0, locations=0)
                sites.append(site)
                if kind not in ('assertion', 'applicator') or entry['cycle']:
                    continue
                for seed_index, seed in enumerate(controls):
                    for location, value in list(c12.locations(seed, entry['instance']))[:MAX_LOCATIONS]:
                        if entry['branches']:
                            # The control must itself take the branch whose keyword the witness names.
                            parent, applicator, index, inst = entry['branches'][-1]
                            branch_value = c12.value_at(seed, location[:len(inst)])
                            if not tv.structural.evolve(schema=parent[applicator][index]).is_valid(branch_value):
                                continue
                        site['locations'] += 1
                        if len(entry['branches']) > 1:
                            site['nested_branches'] = True
                            continue
                        for target, label, expected, replacement in c12.proposals(keyword, node, value):
                            if expected == 'N01_integer_slots' and tv.integer_slot is None:
                                continue  # historical editions keep the recorded recipe: no current integer-slot rule
                            mutated = c12.set_at(seed, location, replacement)
                            code = c12.ROW_CODES[expected]
                            refusal = tv.refusal(mutated)
                            ok, errors = c12.isolated(tv, mutated, target, expected, location, node, entry['branches'])
                            record = dict(role=occ['role'], schema_pointer=site['schema_pointer'], instance_location=[str(x) for x in location],
                                          target_keyword=target, proposal=label, expected=[c12.SCHEMA_ROW, expected, code],
                                          actual=list(refusal) if refusal else None, isolated=ok, error_count=errors,
                                          control_sha256=c12.fingerprint(seed), negative_sha256=c12.fingerprint(mutated))
                            if refusal != (c12.SCHEMA_ROW, expected, code) or not ok:
                                record['status'] = 'INVALID'
                                invalid.append(record)
                                site['invalid'] += 1
                                continue
                            record['status'] = 'CLAUSE_WITNESS'
                            for route_name, route_for in occ['routes'].items():
                                if route_name == 'packed' and location[:1] == ('summary',):
                                    continue
                                route = route_for(mutated)
                                if route is None:
                                    continue
                                if route is ERASED:
                                    boundary.append(dict(family=ctx['family'], role=occ['role'], route=route_name,
                                                         schema_pointer=site['schema_pointer'], instance_location=record['instance_location'],
                                                         proposal=label, expected=[c12.SCHEMA_ROW, expected, code], actual=None,
                                                         status='NOT_A_BOUNDARY_INPUT',
                                                         reason='the stored RFC 8785 pack body carries no defect (the mutation does not survive serialization)'))
                                    continue
                                result, first, _ = c12.run_route(route)
                                expected_first = [c12.SCHEMA_ROW, expected, code]
                                entry_b = dict(family=ctx['family'], role=occ['role'], route=route_name, schema_pointer=site['schema_pointer'],
                                               instance_location=record['instance_location'], proposal=label,
                                               expected=expected_first, actual=first, result=str(result)[:80])
                                if first != expected_first or c12.accepted_result(result):
                                    entry_b['status'] = 'INVALID'
                                else:
                                    cut, restored = c12.cut_and_restore(route, c12.SCHEMA_ROW, expected, expected_first)
                                    entry_b.update(cut=cut, restored=restored,
                                                   status='KILLED' if cut == 'accepted' and restored else
                                                   'COVERED_LATER' if restored else 'INVALID')
                                boundary.append(entry_b)
                                record.setdefault('boundary', []).append(entry_b['status'] + ':' + route_name)
                            site['witnesses'].append(record['negative_sha256'][:16] + ':' + expected)
                            attempts.append(record)
        for site in [s for s in sites if s['role'] == occ['role'] and s.get('kind') in ('assertion', 'applicator') and not s['witnesses']]:
            site['status'] = 'NO_SEED_LOCATION' if not site['locations'] else 'NO_ISOLATED_WITNESS'
            if site['locations'] or 'status_local' in site:
                continue
            # No seed reaches this rule: build a locally valid control for the rule body, then a
            # local clause probe. Covering evidence only, never a whole-occurrence or gated kill.
            node = c12.resolve_pointer(references.documents[site['document']], site['schema_pointer'].rsplit('/', 1)[0])
            control, ok = c12.representative(tv.structural, node)
            site['local_control'] = ok
            site['status_local'] = 'NO_LOCAL_CONTROL'
            if not ok:
                continue
            site['status_local'] = 'LOCAL_CONTROL_ONLY'
            for target, label, expected, replacement in c12.proposals(site['keyword'], node, control):
                if expected != 'S07_structural':
                    continue
                isolated_ok, count = c12.local_isolated(tv.structural, node, replacement, target)
                record = dict(role=occ['role'], schema_pointer=site['schema_pointer'], target_keyword=target, proposal=label,
                              expected=[c12.SCHEMA_ROW, expected, c12.ROW_CODES[expected]], isolated=isolated_ok, error_count=count,
                              control_sha256=c12.fingerprint(control), negative_sha256=c12.fingerprint(replacement),
                              status='LOCAL_CLAUSE_WITNESS' if isolated_ok else 'INVALID', counted_as_gated_kill=False)
                local_probes.append(record)
                if isolated_ok:
                    site['status_local'] = 'LOCAL_CLAUSE_WITNESS'
    payload_routes = occurrences(ctx)[0]['routes']
    for site in overlay_sites(ctx):
        sites.append(dict(site, kind='overlay', witnesses=[], invalid=0, locations=1))
        seed = ctx['full']['payload']
        tv = dr.validator(dr.load(ctx['row']['payload_schema_ref']))
        mutated = copy.deepcopy(seed)
        dr.set_path(mutated, site['instance'], 'sha256:' + 'A' * 64)
        refusal = tv.refusal(mutated)
        ok, errors = c12.isolated(tv, mutated, 'pattern', 'S03_provider_hash_overlay', tuple(site['instance']), None)
        expected = ['schema.overlay', 'S03_provider_hash_overlay', c12.ROW_CODES['S03_provider_hash_overlay']]
        record = dict(role='payload', schema_pointer=site['schema_pointer'], instance_location=[str(x) for x in site['instance']],
                      target_keyword='pattern', proposal='uppercase_hex', expected=expected, actual=list(refusal) if refusal else None,
                      isolated=ok, error_count=errors, control_sha256=c12.fingerprint(seed), negative_sha256=c12.fingerprint(mutated),
                      status='CLAUSE_WITNESS' if refusal and list(refusal) == expected and ok else 'INVALID')
        if record['status'] == 'CLAUSE_WITNESS':
            for route_name, route_for in payload_routes.items():
                route = route_for(mutated)
                if route is None or route is ERASED:
                    continue
                result, first, _ = c12.run_route(route)
                entry_b = dict(family=ctx['family'], role='payload', route=route_name, schema_pointer=site['schema_pointer'],
                               instance_location=record['instance_location'], proposal='uppercase_hex', expected=expected,
                               actual=first, result=str(result)[:80])
                if first != expected or c12.accepted_result(result):
                    entry_b['status'] = 'INVALID'
                else:
                    cut, restored = c12.cut_and_restore(route, 'schema.overlay', 'S03_provider_hash_overlay', expected)
                    entry_b.update(cut=cut, restored=restored, status='KILLED' if cut == 'accepted' and restored else
                                   'COVERED_LATER' if restored else 'INVALID')
                boundary.append(entry_b)
            attempts.append(record)
            sites[-1]['witnesses'].append(record['negative_sha256'][:16] + ':S03_provider_hash_overlay')
        else:
            invalid.append(record)
    witnessed = {(s['role'], s['document'], s['schema_pointer'].rsplit('/', 1)[0], tuple(s['instance']), s['keyword'])
                 for s in sites if s.get('witnesses')}
    for site in sites:
        # A type keyword beside a witnessed const/enum is implied by it: every literal has an allowed
        # type, so any value of another type already fails the literal (no independent kill claimed).
        if site.get('keyword') == 'type' and not site['witnesses'] and site.get('kind') == 'assertion':
            node = c12.resolve_pointer(references.documents[site['document']], site['schema_pointer'].rsplit('/', 1)[0])
            for literal in ('const', 'enum'):
                if literal in node and (site['role'], site['document'], site['schema_pointer'].rsplit('/', 1)[0], tuple(site['instance']), literal) in witnessed:
                    site['status'] = 'IMPLIED_BY_WITNESSED_' + literal.upper()
                    site['cover'] = ('type is implied by the witnessed sibling ' + literal + ' at the same rule and location; '
                                     'a wrong-type value necessarily fails both, so it cannot be isolated; no independent kill is claimed')
        if site.get('kind') in ('condition', 'negated'):
            site['status'] = 'CONDITION' if site['kind'] == 'condition' else 'NEGATED_BODY'
            site['cover'] = ('an if-condition only selects then/else; its consequences are witnessed at the then/else sites'
                             if site['kind'] == 'condition' else 'a not-body is inverted; witnessed at the not site')
    for site in sites:
        if site.get('kind') in ('assertion', 'applicator', 'overlay'):
            site.setdefault('status', 'WITNESSED' if site['witnesses'] else 'NO_WITNESS')
            if site['status'] != 'WITNESSED' and 'cover' not in site:
                site['cover'] = ('Whole-definition Method B: the unchanged owner rule is evaluated intact by the checker '
                                 'TableValidator (S07 stock Draft 2020-12 with every format except date-time, S08 shared '
                                 'date-time, S02/S04 identifier full-match, N01 CV-1100 integer slots); the gated tool proves '
                                 'each of those rows; this site has no single-site isolated witness, so no keyword-independent '
                                 'kill is claimed.')
    documents = sorted({d for d, _ in reached})
    unreached = {d: c12.unreachable_defs(references, d, reached) for d in documents}
    out('schema-sites.json', sites)
    out('schema-witnesses.json', attempts)
    out('schema-invalid.json', invalid)
    out('schema-boundary.json', boundary)
    out('schema-local-probes.json', local_probes)
    controlled = {s['rule_sha256'] for s in sites if s.get('locations') or s.get('local_control')}
    out('schema-unreached-defs.json', dict(unresolved_refs=graph.unresolved, unreachable_defs=unreached))
    validation_sites = [s for s in sites if s.get('kind') in ('assertion', 'applicator', 'overlay')]
    return dict(sites=len(sites), validation_sites=len(validation_sites),
                witnessed_sites=sum(s['status'] == 'WITNESSED' for s in validation_sites),
                distinct_rules=len({s['rule_sha256'] for s in validation_sites}),
                distinct_witnessed_rules=len({s['rule_sha256'] for s in validation_sites if s['status'] == 'WITNESSED'}),
                clause_witnesses=len(attempts), invalid_proposals=len(invalid),
                boundary_killed=sum(b['status'] == 'KILLED' for b in boundary),
                boundary_covered_later=sum(b['status'] == 'COVERED_LATER' for b in boundary),
                boundary_invalid=sum(b['status'] == 'INVALID' for b in boundary),
                boundary_not_input=sum(b['status'] == 'NOT_A_BOUNDARY_INPUT' for b in boundary),
                non_keyword_sites=sum(s.get('kind') == 'non_keyword' for s in sites),
                local_clause_witnesses=sum(r['status'] == 'LOCAL_CLAUSE_WITNESS' for r in local_probes),
                local_invalid=sum(r['status'] == 'INVALID' for r in local_probes),
                uncontrolled_rules=len({s['rule_sha256'] for s in validation_sites if s.get('kind') != 'overlay'} - controlled),
                unresolved_refs=len(graph.unresolved))


def pairs_part(families, out):
    """Every causal witness pair: declared label, exact first refusal, complete-path cut, restoration."""
    codes = {}
    for phase in dr.TABLE_PHASES:
        module_name, factory = dr.TABLE_PHASES[phase]
        module = __import__('pm_runtime_artifact_table_' + module_name)
        case = getattr(module, factory)(None)
        for name, guard in case.table.guards.items():
            codes[phase, name] = guard.refusal_code
    ledger = []
    for guard, family, name, good, bad in suites.witness_pairs():
        if family not in families:
            continue
        pair = f'{guard}/{family}/{name}'
        declared = suites.LEGACY.get(guard, (guard,))
        entry = dict(pair=pair, family=family, label=guard, declared_prefixes=list(declared))
        reason = suites.excluded(guard, family, name)
        ok, _ = suites.run_recorded(good)
        bad_ok, bad_records = suites.run_recorded(bad)
        refusals = [[p, *r] for p, _, r in bad_records if r is not None]
        first = refusals[0] if refusals else None
        entry.update(control_accepted=ok, negative_accepted=bad_ok, first=first)
        if reason:
            entry.update(status='EXCLUDED_FROM_TABLE_PROOF', reason=reason, refusing_rows=[r[:2] for r in refusals][:4])
        elif not ok:
            entry['status'] = 'INVALID_CONTROL_REFUSED'
        elif bad_ok:
            entry['status'] = 'INVALID_NEGATIVE_ACCEPTED'
        elif first is None:
            entry['status'] = 'INVALID_UNTRACKED'
        elif not first[1].startswith(declared):
            entry['status'] = 'INVALID_OUTSIDE_DECLARED_LABEL'
        elif codes.get((first[0], first[1])) != first[2]:
            entry['status'] = 'INVALID_CODE'
        else:
            phase_rows = [n for n, _, _ in dr.table_rows(first[0])]
            entry['declared_rows_in_phase'] = [n for n in phase_rows if n.startswith(declared)]
            flip = suites.complete_boundary_flip(bad, first[0], first[1])
            _, restored_records = suites.run_recorded(bad)
            restored = next(([p, *r] for p, _, r in restored_records if r is not None), None)
            entry.update(cut=flip, restored=restored == first)
            entry['status'] = ('KILLED' if flip == 'accepted' and entry['restored'] else
                               'COVERED_LATER' if entry['restored'] else 'INVALID_RESTORATION')
        ledger.append(entry)
    out('pair-ledger.json', ledger)
    summary = {}
    for e in ledger:
        summary[e['status']] = summary.get(e['status'], 0) + 1
    return dict(pairs=len(ledger), statuses=summary,
                single_declared_row=sum(len(e.get('declared_rows_in_phase', [])) == 1 for e in ledger if e['status'] in ('KILLED', 'COVERED_LATER')))


def retained_part(ctx, out):
    """SP-1101 retained reads with declared expected outcomes and sealed-store snapshots."""
    row, full, first, fixtures = ctx['row'], ctx['full'], ctx['first'], ctx['fixtures']
    observations = []
    rows_codes = {}

    def observe(route_name, label, original, source, packs, expected_result, expected_row, override=None):
        store = dict(original=original, source=source, packs=packs)
        before, receipts_before = c12.store_digest(store), c12.receipt_count(store)
        snapshot = copy.deepcopy(store)
        route = lambda: dr.resolve_history(row, original, source, packs, recipe_override=override)  # noqa: E731
        result, refusal, _ = c12.run_route(route)
        ok = result == expected_result and (refusal[:2] if refusal else None) == expected_row
        cut = restored = None
        if ok and expected_row:
            # The declared row alone, cut in the complete checker, then restored (store re-snapshotted below).
            cut, restored = c12.cut_and_restore(route, expected_row[0], expected_row[1], refusal)
        after, receipts_after = c12.store_digest(store), c12.receipt_count(store)
        observations.append(dict(family=ctx['family'], route=route_name, case=label, expected_result=expected_result,
                                 expected_first_row=expected_row, result=result, first_refusal=refusal, cut=cut, restored=restored,
                                 store_before_sha256=before, store_after_sha256=after,
                                 store_unchanged=before == after and store == snapshot,
                                 receipts_before=receipts_before, receipts_after=receipts_after,
                                 appends=0, status='PASS' if ok and before == after and receipts_before == receipts_after
                                 and restored is not False else 'FAIL'))

    other = copy.deepcopy(first)
    other['event']['event_id'] += '-other-original'
    other['result']['first_append_receipt']['event_id'] = other['event']['event_id']
    other['custody']['first_append_receipt']['event_id'] = other['event']['event_id']
    originals = [('first', copy.deepcopy(first), {}, full['payload'])]
    for case in ctx['history']:
        packs = {k: dict(v, body=v['body'].encode()) for k, v in case['packs'].items()}
        originals.append((case['route'], copy.deepcopy(case['original']), packs, case['logical_payload']))
    for route_name, original, packs, payload in originals:
        source = dr.history_source_for(row, payload, original)
        source['current_live_state'] = {'owner_active': False, 'status': 'deleted', 'revision': 999}
        observe(route_name, 'accepted', original, source, packs, 'metadata_and_authorized_refs', None)
        observe(route_name, 'body_deleted', original, dict(source, body_deleted=True), packs, 'metadata_only', None)
        # inspect returns its row's own code: unavailable for withdrawal/authority/validity, identity_conflict
        # for another Project, family or original payload (scripts/pm_runtime_artifact_table_inspect_*.py).
        for flag, value, expected, code in (('withdrawn', True, 'H01a_withdrawn', 'unavailable'),
                                            ('authorized', False, 'H01b_authorized', 'unavailable'),
                                            ('source_valid', False, 'H02a_source_valid', 'unavailable'),
                                            ('receipt_valid', False, 'H02b_receipt_valid', 'unavailable'),
                                            ('project_id', 'another-project', 'H03a_project', 'identity_conflict'),
                                            ('event_type', 'other', 'H03b_family', 'identity_conflict')):
            observe(route_name, 'source_' + flag, original, dict(source, **{flag: value}), packs, code, ['inspect_flags', expected])
        observe(route_name, 'changed_original_payload', original, dict(source, original_payload=dict(payload, summary='changed')),
                packs, 'identity_conflict', ['inspect_payload', 'H04_original_payload'])
        observe(route_name, 'caller_recipe_override', original, source, packs, 'unavailable', ['history', 'H05c_no_caller_recipe'],
                override=dr.HISTORICAL_V1)
        for label, decoder in (('recipe_absent', None), ('recipe_unknown', 'historical-v9'),
                               ('recipe_ambiguous', [dr.HISTORICAL_V1, dr.CURRENT_WRITER]), ('recipe_current_writer', dr.CURRENT_WRITER)):
            if route_name == 'first' and label == 'recipe_current_writer':
                continue  # the history route installs only the historical edition: current writer is recipe_unknown below
            observe(route_name, label, original, dict(source, recorded_decoder=decoder), packs, 'unavailable', ['history', 'H05_decoder'])
        for label, fact, value in dr.FOREIGN_PLACEMENTS:
            observe(route_name, label, original, dict(source, **{fact: value}), packs, 'unavailable', ['history', 'H05b_original_binding'])
        foreign = copy.deepcopy(source)
        foreign['authenticated_original']['event']['event_id'] += '-foreign'
        observe(route_name, 'authenticated_other_original', original, foreign, packs, 'unavailable', ['history', 'H05b_original_binding'])
        # Requested-side receipt faults: the sealed original is intact; the supplied copies are not.
        missing = copy.deepcopy(original)
        del missing['result']['first_append_receipt']
        observe(route_name, 'requested_receipt_missing', missing, source, packs, 'unavailable', ['schema.case', 'S07_structural'])
        ambiguous = copy.deepcopy(original)
        ambiguous['custody']['first_append_receipt']['acknowledged_at_utc'] = '2026-07-03T00:00:00Z'
        observe(route_name, 'requested_receipt_ambiguous', ambiguous, source, packs, 'unavailable', ['full_value_bytes', 'F13_custody_bytes'])
        foreign_receipt = copy.deepcopy(original)
        for place in ('result', 'custody'):
            foreign_receipt[place]['first_append_receipt']['event_id'] = original['event']['event_id'] + '-other-original'
        observe(route_name, 'requested_receipt_other_original', foreign_receipt, source, packs, 'unavailable', ['full_value_bytes', 'F12_result_bytes'])
        # Sealed-side receipt faults: the authenticated original itself is missing, ambiguous or another original's.
        for label, edit, expected in (
                ('sealed_receipt_missing', lambda o: o['result'].pop('first_append_receipt'), ['schema.case', 'S07_structural']),
                ('sealed_receipt_ambiguous', lambda o: o['custody']['first_append_receipt'].update(acknowledged_at_utc='2026-07-03T00:00:00Z'),
                 ['full_value_bytes', 'F10_receipt_copy']),
                ('sealed_receipt_other_original', lambda o: [o[p]['first_append_receipt'].update(event_id=o['event']['event_id'] + '-other-original')
                                                            for p in ('result', 'custody')], ['full_value_ids_a', 'F11a_receipt_event'])):
            sealed = copy.deepcopy(source)
            edit(sealed['authenticated_original'])
            observe(route_name, label, original, sealed, packs, 'unavailable', expected)
    if ctx['family'].endswith('.restore_point'):
        packs = {}
        successor = copy.deepcopy(fixtures['restore_successor'])
        base = dict(proof_valid=True, predecessor_complete=True, snapshot_current=True,
                    canonical_point=successor['payload']['type_payload'])
        from pm_runtime_artifact_round8_cases import observation_source
        from types import SimpleNamespace
        proof = observation_source(SimpleNamespace(**vars(dr)), fixtures, row, full, packs, base)

        def observe_predecessor(label, proof_source, expected_result, expected_row):
            store = dict(proof=proof_source, previous=full, candidate=successor)
            before, snapshot = c12.store_digest(store), copy.deepcopy(store)
            route = lambda: dr.observation_admissible(successor, full, row, packs, proof_source)  # noqa: E731
            result, refusal, _ = c12.run_route(route)
            ok = result is expected_result and (refusal[:2] if refusal else None) == expected_row
            cut = restored = None
            if ok and expected_row:
                cut, restored = c12.cut_and_restore(route, expected_row[0], expected_row[1], refusal)
            after = c12.store_digest(store)
            observations.append(dict(family=ctx['family'], route='restore_predecessor', case=label, expected_result=expected_result,
                                     expected_first_row=expected_row, result=result, first_refusal=refusal, cut=cut, restored=restored,
                                     store_before_sha256=before, store_after_sha256=after,
                                     store_unchanged=before == after and store == snapshot,
                                     receipts_before=c12.receipt_count(snapshot), receipts_after=c12.receipt_count(store),
                                     appends=0, status='PASS' if ok and before == after and restored is not False else 'FAIL'))
        observe_predecessor('accepted', proof, True, None)
        for label, decoder in (('recipe_absent', None), ('recipe_unknown', 'historical-v9'),
                               ('recipe_ambiguous', [dr.HISTORICAL_V1, dr.CURRENT_WRITER])):
            changed = copy.deepcopy(proof)
            changed['predecessor_source']['recorded_decoder'] = decoder
            observe_predecessor(label, changed, False, ['observation_recipe', 'O12_recorded_recipe'])
        for label, fact, value in dr.FOREIGN_PLACEMENTS:
            changed = copy.deepcopy(proof)
            changed['predecessor_source'][fact] = value
            observe_predecessor(label, changed, False, ['observation_recipe', 'O14_predecessor_binding'])
        changed = copy.deepcopy(proof)
        changed['predecessor_source']['authenticated_original']['event']['event_id'] += '-foreign'
        observe_predecessor('authenticated_other_original', changed, False, ['observation_recipe', 'O14_predecessor_binding'])
        changed = copy.deepcopy(proof)
        changed['predecessor_source']['authenticated_original']['custody']['first_append_receipt']['acknowledged_at_utc'] = '2026-07-03T00:00:00Z'
        observe_predecessor('sealed_receipt_ambiguous', changed, False, ['full_value_bytes', 'F10_receipt_copy'])
        changed = copy.deepcopy(proof)
        del changed['predecessor_result']['first_append_receipt']
        observe_predecessor('requested_receipt_missing', changed, False, ['schema.case', 'S07_structural'])
    out('retained-store-observations.json', observations)
    return dict(reads=len(observations), passed=sum(o['status'] == 'PASS' for o in observations),
                failed=[o['route'] + '/' + o['case'] for o in observations if o['status'] != 'PASS'],
                store_changes=sum(not o['store_unchanged'] for o in observations),
                receipts_created=sum(o['receipts_after'] != o['receipts_before'] for o in observations))


def datetime_part(ctx, out):
    """The shared timestamp battery at every DR timestamp field, through the complete boundary."""
    row, full, first, fixtures = ctx['row'], ctx['full'], ctx['first'], ctx['fixtures']
    battery = json.loads((ROOT / 'scripts/pm_event_datetime_timestamp_battery.json').read_text())['samples']
    # The shared battery holds valid spellings; add the lane's round-10 valid/invalid sets and single-defect
    # derivations of battery samples. Every expectation still comes from the shared date_time call alone.
    from pm_runtime_artifact_round10_cases import BROAD_INVALID, BROAD_VALID, STORAGE_INVALID, STORAGE_VALID
    extra = [*BROAD_VALID.values(), *BROAD_INVALID.values(), *STORAGE_VALID.values(), *STORAGE_INVALID.values()]
    for sample in battery[:60]:
        v = sample['value']
        extra += [v + '\n', v.replace('T', ' ', 1), v[:-1], '2026-02-30' + v[10:], v[:11] + '24' + v[13:], v[:4] + v[5:]]
    known = {sample['value'] for sample in battery}
    battery = battery + [dict(value=v, features=['c12-derived']) for v in dict.fromkeys(extra) if v not in known]
    ledger = []

    def expect(value, profile):
        try:
            date_time(value, profile=profile)
            return True
        except (Refusal, ValueError, TypeError):
            return False

    def append_with(event, receipt=None):
        model = dr.AppendModel(row, {}, receipt or ctx['receipt'], ctx['template'])
        return lambda: model.append(event, True)

    fields = [('occurred_at_utc', EVENT_RECORD), ('observed_at_utc', STORAGE_UTC_Z), ('persisted_at_utc', STORAGE_UTC_Z),
              ('acknowledged_at_utc', EVENT_RECORD)]
    restore = ctx['family'].endswith('.restore_point')
    if restore:
        fields.append(('type_payload.retention.expires_at_utc', EVENT_RECORD))
    for field, profile in fields:
        for sample in battery:
            value = sample['value']
            if type(value) is not str:
                continue
            accept = expect(value, profile)
            event = copy.deepcopy(full)
            receipt = None
            if field == 'occurred_at_utc':
                event['occurred_at_utc'] = value
                event['payload']['created_at_utc'] = value  # the D15 authored-time copy moves with it
            elif field in ('observed_at_utc', 'persisted_at_utc'):
                event[field] = value
            elif field == 'acknowledged_at_utc':
                receipt = dict(ctx['receipt'], acknowledged_at_utc=value)
            else:
                if 'retention' not in event['payload']['type_payload'] or 'expires_at_utc' not in event['payload']['type_payload']['retention']:
                    break
                event['payload']['type_payload']['retention']['expires_at_utc'] = value
            result, refusal, _ = c12.run_route(append_with(event, receipt))
            appended = isinstance(result, dict)
            expected_row = None if accept else ['schema.case', 'S08_date_time']
            ok = appended if accept else (not appended and refusal is not None and refusal[:2] == expected_row)
            ledger.append(dict(family=ctx['family'], field=field, profile=profile, value=value, expected='accepted' if accept else 'refused',
                               expected_first_row=expected_row, actual='accepted' if appended else 'refused',
                               first_refusal=refusal, status='CONTROL' if ok and accept else 'KILLED' if ok else 'MISMATCH'))
    # Checkpoint generation/frontier instants at the checkpoint schema occurrence (CV-1101 broad, EventRecord profile).
    cp = dr.load('Plans/event_record_index_checkpoint.schema.json')
    tv = dr.validator(cp, 'checkpoint')
    checkpoint = ctx['bundle']['checkpoint']
    node = checkpoint['generations'][checkpoint['current_generation_id']]
    for path in [('generations', checkpoint['current_generation_id'], k) for k in ('first_prepared_at_utc', 'activated_at_utc')
                 if k in node] + [('generations', checkpoint['current_generation_id'], 'frontier', 'indexed_at_utc')]:
        if dr.at(checkpoint, *path) is None:
            continue
        for sample in battery:
            value = sample['value']
            if type(value) is not str:
                continue
            accept = expect(value, EVENT_RECORD)
            changed = c12.set_at(checkpoint, path, value)
            refusal = tv.refusal(changed)
            if not accept:
                bundle = dict(copy.deepcopy(ctx['bundle']), checkpoint=changed)
                result, first_ref, _ = c12.run_route(lambda: dr.checkpoint_matches(row, full, first, bundle))
                ok = refusal is not None and refusal[1] == 'S08_date_time' and first_ref is not None and first_ref[1] == 'S08_date_time' and result is False
            else:
                first_ref = None
                ok = refusal is None
            ledger.append(dict(family=ctx['family'], field='checkpoint/' + '/'.join(path[2:]), profile=EVENT_RECORD, value=value,
                               expected='accepted' if accept else 'refused', actual='accepted' if refusal is None else 'refused',
                               first_refusal=first_ref, status='CONTROL' if ok and accept else 'KILLED' if ok else 'MISMATCH'))
    out('datetime-battery.json', ledger)
    counts = {}
    for e in ledger:
        counts[e['status']] = counts.get(e['status'], 0) + 1
    return dict(cases=len(ledger), statuses=counts, fields=sorted({e['field'] for e in ledger}),
                mismatches=[e['field'] + '=' + repr(e['value']) for e in ledger if e['status'] == 'MISMATCH'][:40])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--family', action='append')
    parser.add_argument('--part', action='append', choices=('schema', 'pairs', 'retained', 'datetime'))
    args = parser.parse_args()
    parts = args.part or ['schema', 'pairs', 'retained', 'datetime']
    document = dr.load('Plans/runtime_artifact_event_drafts.json')
    fixtures = dr.load('Plans/runtime_artifact_event_drafts.fixtures.json')
    rows = [r for r in document['rows'] if not args.family or r['event_type'] in args.family]
    references = dr.SchemaReferences()
    summary = dict(checker_sha256=hashlib.sha256((ROOT / 'scripts/pm-runtime-artifact-event-drafts.py').read_bytes()).hexdigest(),
                   module_sha256=hashlib.sha256((ROOT / 'scripts/pm_runtime_artifact_c12.py').read_bytes()).hexdigest(),
                   driver_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), families={})
    for row in rows:
        family = row['event_type']
        target = args.out / family
        target.mkdir(parents=True, exist_ok=True)

        def write(name, value, target=target):
            (target / name).write_text(json.dumps(value, indent=1, sort_keys=True, default=repr) + '\n')
        ctx = family_context(row, fixtures)
        result = {}
        for part in parts:
            started = time.monotonic()
            print(f'C12 {family} {part}', file=sys.stderr, flush=True)
            if part == 'schema':
                result['schema'] = schema_part(ctx, references, write)
            elif part == 'pairs':
                result['pairs'] = pairs_part({family}, write)
            elif part == 'retained':
                result['retained'] = retained_part(ctx, write)
            elif part == 'datetime':
                result['datetime'] = datetime_part(ctx, write)
            result[part]['seconds'] = round(time.monotonic() - started, 1)
        write('summary.json', result)
        summary['families'][family] = result
    if args.family and 'shared' in args.family and 'pairs' in parts:
        # Shared witnesses (toy schemas, codec and failure-oracle helpers) ride with every family's gated
        # suites; their complete-boundary cut and restoration is recorded once here.
        target = args.out / 'shared'
        target.mkdir(parents=True, exist_ok=True)

        def write_shared(name, value):
            (target / name).write_text(json.dumps(value, indent=1, sort_keys=True, default=repr) + '\n')
        summary['families']['shared'] = dict(pairs=pairs_part({'shared'}, write_shared))
    (args.out / ('summary-' + '-'.join(parts) + '.json')).write_text(json.dumps(summary, indent=1, sort_keys=True) + '\n')
    print(json.dumps(summary, indent=1, sort_keys=True))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
