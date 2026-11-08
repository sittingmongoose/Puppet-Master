#!/usr/bin/env python3
"""DCW number-scope integration: complete current/retry/history/index paths.

Shared helper credit and lane credit are reported separately. Timestamp checking
is interim only. This file imports no pm_event_datetime code.
"""
import argparse
import copy
import math
from decimal import Decimal
import json
import time
import signal
from pathlib import Path

import pm_dcw_event_oracles as m
import pm_dcw_blockage_events as b
import pm_bundle_revision_events as legacy
import pm_event_numbers as n
import pm_event_numbers_corpus as corpus_api
from pm_dcw_blockage_fixtures import base
from pm_dcw_event_fixtures import event_slots, seal_originals
from pm_dcw_index_fixtures import snapshot, issue
from pm_dcw_registered_cases import registered_original


def complete(row, value, operation):
    try:
        return b.verify(value,operation) if row is None else m.verify(row,value,operation,legacy.validate)
    except m.Refusal as exc:
        return str(exc)


def metadata(row, original, sequence):
    """Reissue one Storage sequence fact and all of its immutable copies."""
    value=copy.deepcopy(original); eid=value['event']['event_id']
    slots=event_slots(value) if row is not None else [*value['authority']['sources'].values(),value['source']]
    value['event']['sequence_id']=sequence
    for slot in slots:
        if slot['prepared_event']['event_id']==eid:
            slot['prepared_event']['sequence_id']=sequence
            slot['first_append_receipt']['sequence_id']=sequence
    custody=value['authority']['custody'][eid]
    custody['first_append_receipt']['sequence_id']=sequence
    custody['producer_semantic_digest']=m.semantic_digest(value['event'])
    custody['original_event_value_commitment']=m.commitment(value['event'])
    for slot in slots:
        if slot['prepared_event']['event_id']==eid:
            slot['original_event_value_commitment']=copy.deepcopy(custody['original_event_value_commitment'])
    value['authority']['events'][eid]=copy.deepcopy(value['event'])
    issue(value)
    return value


def available_memory():
    return int(next(l.split()[1] for l in Path('/proc/meminfo').read_text().splitlines() if l.startswith('MemAvailable:')))/1048576


def run(family=None):
    while available_memory()<13.5:
        print('waiting for 13.5 GiB',flush=True);time.sleep(15)
    corpus=m.load('Plans/event_number_recipe_corpus.json')
    raw_cases=[c for c in corpus['cases'] if corpus_api.number_case(c) and c['op'] in
               ('token','slot','parse_token','current_json','current_json_slot','jcs','parse') and 'raw' in c]
    families=[(r,r['positive']) for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']]
    families += [(None,base(name)) for name in b.NAMES]
    results=[]
    def record(name,case,actual,expected):
        if available_memory()<10:
            while available_memory()<13.5:
                print('paused; waiting for 13.5 GiB',flush=True);time.sleep(15)
        results.append(dict(family=name,case=case,actual=actual,expected=expected,passed=actual==expected))
    for row,original in families:
        name=original['event']['event_type']
        if family and name!=family:continue
        record(name,'baseline',complete(row,copy.deepcopy(original),'publish'),'accept')
        # Every applicable raw corpus input traverses the actual current-caller
        # retry path. Expected code follows its declared nonnegative integer slot.
        for c in raw_cases:
            try:
                parsed=n.loads_current_json(c['raw'])
                if c['op']=='current_json_slot':
                    for key in c['path']:parsed=parsed[key]
            except n.Refusal as exc:
                expected=c.get('error');integer_tokens=[]
                if type(c['raw']) not in (str,bytes):expected='json_input_type'
                else:
                    integer_tokens=[]
                    try:json.loads(c['raw'],parse_int=lambda t:integer_tokens.append(t) or 0)
                    except (ValueError,TypeError):pass
                    if '-0' in integer_tokens:expected='integer_token'
                if expected=='integer_token' and '-0' not in integer_tokens:expected='json_syntax'
                if expected is None:raise AssertionError('No independent raw-refusal oracle for '+c['id'])
                record(name,'shared/'+c['id'],exc.reason,expected)
                continue
            value=copy.deepcopy(original); request=copy.deepcopy(original['event'])
            request['producer_sequence_id']=parsed;value['retry_request']=request
            valid=type(parsed) is int and parsed>=0
            expected=('accept' if m.exact_equal(parsed,original['event']['producer_sequence_id']) else 'idempotency_conflict') if valid or parsed is None else ('integer_range' if type(parsed) is int else 'integer_type')
            # Values outside producer JCS exactness refuse before dedupe, with the
            # shared route's code. Exact independent endpoints are below.
            if valid and abs(parsed)>2**53:
                try:
                    converted=float(parsed)
                    if not math.isfinite(converted) or int(converted)!=parsed:expected='jcs_binary64'
                    elif Decimal(repr(converted))!=Decimal(parsed):expected='jcs_decimal'
                except OverflowError:expected='jcs_binary64'
            record(name,'shared-slot/'+c['id'],complete(row,value,'retry'),expected)
        for sequence in (2**53,2**53+1,2**63,2**64-1):
            value=metadata(row,original,sequence)
            for operation in ('publish','retry','read','rebuild'):
                record(name,'metadata/'+str(sequence)+'/'+operation,complete(row,copy.deepcopy(value),operation),'accept')
        # A genuine registered source frame proves frozen shared-envelope grammar
        # stays separate from current caller admission. Its original float bytes
        # stay in the frame; SP-278 only contains their digest and integer locator.
        retained=registered_original();retained['producer_sequence_id']=1.0
        originals=list(original['authority']['events'].values())
        retained['sequence_id']=max(e['sequence_id'] for e in originals)+1
        value=copy.deepcopy(original)
        value['index'],value['reader']=snapshot(originals+[retained],value['authority']['storage_instance_id'],value['authority']['recovery_epoch'])
        for operation in ('read','rebuild'):
            record(name,'retained-integral-float/'+operation,complete(row,copy.deepcopy(value),operation),'accept')
        forged=copy.deepcopy(value)
        forged['index']['current_source']['frames'][-1]['event']['payload']['unknown']=True
        record(name,'retained-forged-original',complete(row,forged,'read'),'index_source_payload')
        # The exact 4400-digit value must be refused by this physical/JCS route,
        # never crash while schema validation constructs a diagnostic.
        huge=n.loads_current_json('9'*4400)
        probe=copy.deepcopy(original);probe['event']['sequence_id']=huge
        record(name,'4400-digit-integer',complete(row,probe,'publish'),'integer_range')
        probe=copy.deepcopy(original)
        field='phase_sequence' if 'phase_sequence' in probe['event']['payload'] else 'schema_version'
        probe['event']['payload'][field]=huge
        record(name,'4400-digit-owner-route',complete(row,probe,'publish'),'physical_integer_range' if field=='phase_sequence' else 'schema')
        probe=copy.deepcopy(original);probe['event']['schema_version']=huge
        record(name,'4400-digit-schema-diagnostic',complete(row,probe,'publish'),'schema')
        probe=copy.deepcopy(value)
        probe['index']['current_source']['frames'][-1]['event']['payload']['schema_version']=huge
        record(name,'4400-digit-registered-schema-diagnostic',complete(row,probe,'read'),'index_source_payload')
        current=copy.deepcopy(original);current['retry_request']=copy.deepcopy(current['event']);current['retry_request']['producer_sequence_id']=1.0
        record(name,'current-integral-float',complete(row,current,'retry'),'integer_type')
    return dict(status='pass' if all(r['passed'] for r in results) else 'fail',cases=len(results),results=results,
                shared_corpus_raw_inputs=len(raw_cases),timestamp='interim only',native='NOT_RUN',membership='ABSENT')


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--family');parser.add_argument('--output');args=parser.parse_args()
    signal.alarm(5400)
    result=run(args.family)
    text=json.dumps(result,indent=2)+'\n'
    if args.output:Path(args.output).write_text(text)
    else:print(text)
    raise SystemExit(result['status']!='pass')
