#!/usr/bin/env python3
"""Lossless numeric and exact-Boolean oracles shared by each complete DMEM checker and check 11."""
from copy import deepcopy
import json


def finite_positive(m, value):
    return type(value) in (int, float, m.Decimal) and (value.is_finite() if isinstance(value,m.Decimal)
        else (True if type(value) is int else m.math.isfinite(value))) and value >= 0


def domain_cases(m, contexts, boundaries, archive=None):
    """Every negative derives from its own intact control; no evaluation-time input repair."""
    fixtures = m.load('Plans/memory_maintenance_boundary_fixtures.json')
    history = {f['event_type']: f for f in m.load('Plans/memory_canonical_history_fixtures.json')['canonical_history_families']}
    cases = []
    def probe(fn, *args):
        original = deepcopy(args)
        try:
            value = fn(*deepcopy(args))
        except (ValueError, TypeError) as error:
            result = ('refused', str(error))
        else:
            result = ('refused', False) if value is False else ('ok',)
        assert args == original, 'boundary-domain input mutation'
        return result
    def add(event, guard, name, fn, good, bad):
        cases.append({'name': event + ':domains:' + name, 'guard': guard,
                      'positive': lambda f=fn,a=good:probe(f,*a),
                      'negative': lambda f=fn,a=bad:probe(f,*a)})
    for event, context in contexts.items():
        before = context['writer_states']['before']
        value = m.canonical_value(before['operation'], event.rsplit('.', 1)[1])
        for field in fixtures['writer_flags']:
            guard = 'admission' if field == 'admitted' else 'permission_or_withdrawal'
            for wrong in fixtures['wrong_boolean_values']:
                changed = {**before, field: wrong['value']}
                add(event, guard, 'writer-'+field+'-'+wrong['name'], lambda *a:m.append_current(*a),
                    (before,value,event), (changed,value,event))
        for own in [c for c in boundaries if c['event_type'] == event and c.get('accepted', True)][:1]:
            payload, context = own['payload'], own['context']
            fields = ['permission','admitted','withdrawn','request_matches','current_source']
            fields += ['started_receipt','effect_settled','original_full_value'] if event.endswith('.completed') else ['acceptance_durable']
            for field in fields:
                guard = ('admission' if field == 'admitted' else 'permission_or_withdrawal' if field in ('permission','withdrawn')
                         else 'boundary_snapshot' if field in ('request_matches','current_source')
                         else 'boundary_acceptance' if field == 'acceptance_durable' else 'boundary_receipts')
                for wrong in fixtures['wrong_boolean_values']:
                    changed = {**context,field:wrong['value']}
                    add(event,guard,'boundary-'+field+'-'+wrong['name'],lambda *a:m.accept(*a),
                        (payload,{'event_type':event},context),(payload,{'event_type':event},changed))
        for mode, original in history[event]['states'].items():
            for field in fixtures['reader_flags']:
                for wrong in fixtures['wrong_boolean_values']:
                    changed = {**original,field:wrong['value']}
                    add(event,'permission_or_withdrawal','reader-'+mode+'-'+field+'-'+wrong['name'],lambda *a:m.read_canonical_history(*a),
                        (original,event),(changed,event))
        # Unsupported numeric history is checked at its real decoder/hash/envelope predicates;
        # no fictitious retained commitment is manufactured for an unencodable number.
        for number in fixtures['numeric_cases']:
            literal = number['literal']
            if not number['commitment_valid']:
                guard = 'commitment_numbers' if number['valid_json'] else 'json_number_grammar'
                add(event,guard,'parse-'+literal,lambda *a:m.parse_json_number(*a),('1',),(literal,))
            if number['valid_json'] and not number['sequence_valid']:
                invalid = {**value,'sequence_id':m.json_numbers(literal)}
                if finite_positive(m,invalid['sequence_id']):
                    add(event,'commitment_numbers','writer-number-'+literal,lambda *a:m.append_current(*a),
                        (before,value,event),(before,invalid,event))
        for mode,source in history[event]['states'].items():
            control = source['originals'][event]['full_value']
            for number in fixtures['numeric_cases']:
                if number['valid_json'] and not number['commitment_valid']:
                    parsed = m.json_numbers(number['literal'])
                    if finite_positive(m,parsed):
                        bad = {**control,'sequence_id':parsed}
                        add(event,'commitment_numbers','historical-envelope-'+mode+'-'+number['literal'],
                            lambda v:m.historical_envelope_matches(v),(control,),(bad,))
        for field in ('sequence_id', 'producer_sequence_id'):
            for label,wrong in [('bool-true', True),('bool-false', False)] + [
                    (r['name'],r['value']) for r in fixtures['wrong_boolean_values']
                    if type(r['value']) is not int and r['value'] is not None]:
                bad = {**value,field:wrong}
                add(event,'envelope_schema','numeric-type-'+field+'-'+label,
                    lambda v:m.envelope_validator().is_valid(v),(value,),(bad,))
        if archive is not None:
            state = contexts[event]['states']['started']
            action = {'op':'settle','status':'succeeded','completed_occurred_at_utc':'2026-11-04T17:01:00Z',
                      'expected_operation':deepcopy(state['operation'])}
            for field in fixtures['memory_flags']:
                for memory in fixtures['memory_ids']:
                    for wrong in fixtures['wrong_boolean_values']:
                        bad = deepcopy(state); bad['archive']['memories'][memory][field] = wrong['value']
                        add(event,'memory_flags','settle-'+memory+'-'+field+'-'+wrong['name'],lambda *a:archive.transition(*a),
                            (state,action),(bad,action))
            # Both sides of an unselected original are coherent; only that memory's flag type is invalid.
            good = state['archive']; job = archive.COMMANDS[state['operation']['command_id']]
            after = archive.archive_candidate(good,job)
            for field in fixtures['memory_flags']:
                for wrong in fixtures['wrong_boolean_values']:
                    bad_before,bad_after = deepcopy(good),deepcopy(after)
                    bad_before['memories']['recent-note'][field] = wrong['value']
                    bad_after['memories']['recent-note'][field] = wrong['value']
                    add(event,'memory_flags','post-state-'+field+'-'+wrong['name'],lambda *a:archive.archive_validate(*a),
                        (good,after,job),(bad_before,bad_after,job))
    return cases


def run(m, contexts, boundaries, archive=None):
    fixtures=m.load('Plans/memory_maintenance_boundary_fixtures.json')
    assert set(contexts) <= set(fixtures['families'])
    cases=domain_cases(m,contexts,boundaries,archive)
    for case in cases:
        assert case['positive']()[0]=='ok',(case['name'],'invalid control')
        assert case['negative']()[0]=='refused',(case['name'],'negative accepted')
    counts={'isolated_negative_cases':len(cases),'numeric_writer_cases':0,'numeric_reader_cases':0,'numeric_commitment_cases':0}
    history={f['event_type']:f for f in m.load('Plans/memory_canonical_history_fixtures.json')['canonical_history_families']}
    for event,context in contexts.items():
        m.check_resources()
        before=context['writer_states']['before'];untouched=deepcopy(before)
        for case in fixtures['numeric_cases']:
            literal=case['literal']
            try:
                number=m.json_numbers(literal)
            except json.JSONDecodeError:
                assert not case['valid_json'];continue
            try:
                actual=m.digest({'nested':[number]})
            except ValueError:
                assert not case['commitment_valid'],literal
            else:
                assert case['commitment_valid'],literal
                assert actual==m.digest({'nested':[case['canonical']]}),literal
                if case['sequence_valid']:
                    assert m._CODEC.binding_bytes(m.canonical_numbers(number))==m._CODEC.binding_bytes(case['canonical']),literal
            counts['numeric_commitment_cases']+=1
            value=m.canonical_value(before['operation'],event.rsplit('.',1)[1]);value['sequence_id']=number
            if case['sequence_valid'] or finite_positive(m,number):
                try:
                    after,output=m.append_current(before,value,event)
                except (ValueError,TypeError):
                    assert not case['sequence_valid'],(event,literal)
                else:
                    assert case['sequence_valid'],(event,literal,'writer accepted')
                    assert output==value and after['original']['full_value_sha256']==m.digest({**value,'sequence_id':case['canonical']})
                assert before==untouched
                counts['numeric_writer_cases']+=1
            if not case['sequence_valid']:
                continue
            for mode,source in history[event]['states'].items():
                state=deepcopy(source);record=state['originals'][event]
                record['full_value']['sequence_id']=number
                record['full_value_sha256']=m.digest(record['full_value'])
                snapshot=deepcopy(state)
                result=m.read_canonical_history(state,event)
                assert result==record['full_value']
                assert state==snapshot
                counts['numeric_reader_cases']+=1
    return counts
