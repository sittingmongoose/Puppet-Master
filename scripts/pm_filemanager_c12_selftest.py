#!/usr/bin/env python3
"""Negative checks for DFM C12 evidence accounting on actual DFM schema inputs.

Stopping bar: only a demonstrated real false acceptance or product defect blocks.
Wrong rows/codes, invalid controls, ineffective cuts and failed restorations never
earn mutation credit. This does not replace the lead's independent review.
"""
import copy
import importlib.util
import json
from pathlib import Path
import unittest
from unittest import mock
import sys

sys.path.insert(0,str(Path(__file__).resolve().parent))
import pm_filemanager_c12_runtime as runtime

_spec=importlib.util.spec_from_file_location('c12',Path(__file__).with_name('pm-filemanager-c12-closure.py'))
c12=importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(c12)


class EvidenceAccounting(unittest.TestCase):
    def setUp(self):
        self.accepted={'status':'accepted'}
        self.expected={'status':'refused','phase':'rule_payload','row':'RP01_payload_definition',
                       'code':'schema','schema':{'validator':'const','path':[]}}

    def credit(self,control=None,negative=None,cut=None,restored=None,expected=None):
        return c12.credited_trial(control or self.accepted,negative or self.expected,
               cut or self.accepted,restored or self.expected,expected or self.expected)

    def test_exact_credit(self):
        self.assertTrue(self.credit())

    def test_wrong_code(self):
        self.assertFalse(self.credit(negative=dict(self.expected,code='unrelated')))

    def test_wrong_row(self):
        self.assertFalse(self.credit(negative=dict(self.expected,row='other')))

    def test_wrong_phase(self):
        self.assertFalse(self.credit(negative=dict(self.expected,phase='other')))

    def test_wrong_clause(self):
        self.assertFalse(self.credit(negative=dict(self.expected,schema={'validator':'type','path':[]})))

    def test_wrong_instance_path(self):
        self.assertFalse(self.credit(negative=dict(self.expected,schema={'validator':'const','path':['other']})))

    def test_no_defect(self):
        self.assertFalse(self.credit(negative=self.accepted))

    def test_refused_control(self):
        self.assertFalse(self.credit(control=self.expected))

    def test_unrelated_exception(self):
        self.assertFalse(self.credit(negative={'status':'INVALID','type':'KeyError'}))

    def test_ineffective_cut(self):
        self.assertFalse(self.credit(cut=self.expected))

    def test_failed_restoration(self):
        self.assertFalse(self.credit(restored=self.accepted))

    def test_changed_restoration(self):
        self.assertFalse(self.credit(restored=dict(self.expected,row='other')))

    def test_acceptance_cannot_be_declared_refusal(self):
        self.assertFalse(self.credit(expected=self.accepted,negative=self.accepted,restored=self.accepted))

    def test_real_clause_cut_and_restoration(self):
        dfm=c12.dfm
        doc='event_payloads/file_manager/file_copied.schema.json'
        ptr='#/properties/schema_id'
        documents=dfm.schema_documents()
        before=copy.deepcopy(documents)
        control=c12.outcome(lambda:dfm.validate_shape(doc,ptr,documents[doc]['properties']['schema_id']['const']))
        negative=c12.outcome(lambda:dfm.validate_shape(doc,ptr,'wrong'))
        with c12.schema_cut(documents,[{'document':doc,'pointer':ptr+'/const'}]):
            cut=c12.outcome(lambda:dfm.validate_shape(doc,ptr,'wrong'))
        restored=c12.outcome(lambda:dfm.validate_shape(doc,ptr,'wrong'))
        self.assertTrue(c12.credited_trial(control,negative,cut,restored,self.expected))
        self.assertEqual(documents,before)

    def test_restored_eventrecord_type_preempts_stale_const_cut(self):
        dfm=c12.dfm
        doc='event_record.schema.json'
        ptr='#/properties/schema_id'
        negative=c12.outcome(lambda:dfm.validate_shape(doc,ptr,None))
        with c12.schema_cut(dfm.schema_documents(),[{'document':doc,'pointer':ptr+'/const'}]):
            cut=c12.outcome(lambda:dfm.validate_shape(doc,ptr,None))
        self.assertEqual(negative['schema']['validator'],'type')
        self.assertEqual(cut,negative)
        self.assertFalse(c12.credited_trial(self.accepted,negative,cut,negative,negative))

    def test_fixed_width_implication(self):
        projector=c12.LocalSamples(c12.dfm.schema_documents())
        result=c12.clause_entailment(projector,'unused','#',{'type':'string','pattern':'^a{4}$','minLength':4},'minLength',None)
        self.assertEqual(result['checked_width'],[4,4])

    def test_weakened_width_does_not_entail(self):
        projector=c12.LocalSamples(c12.dfm.schema_documents())
        result=c12.clause_entailment(projector,'unused','#',{'type':'string','pattern':'^a*$','minLength':1},'minLength',None)
        self.assertIsNone(result)

    def test_required_selector_implication_has_checked_premises(self):
        projector=c12.LocalSamples(c12.dfm.schema_documents())
        ptr='#/$defs/operation_custody'
        node=copy.deepcopy(projector.nodes[(c12.dfm.CONTRACTS,ptr)])
        member=node['required'].index('phase')
        result=c12.clause_entailment(projector,c12.dfm.CONTRACTS,ptr,node,'required',member)
        self.assertEqual(result['conflicting_field'],'settlement')
        node['allOf'][0]['then']['properties']['settlement']={'type':'object'}
        with self.assertRaises(AssertionError):
            c12.clause_entailment(projector,c12.dfm.CONTRACTS,ptr,node,'required',member)

    def test_nullable_receipt_reports_exact_anyof(self):
        row=runtime.dfm.integrity_inputs()['fixtures']['rows'][0]
        value='2026-01-01T00:00:00'
        payload,trace=runtime.coherent_time(row,'acknowledged_at_utc',value)
        actual=runtime.c12.outcome(lambda:runtime.dfm.validate_case(row['event_type'],payload,trace))
        expected=runtime.time_refusal(row['event_type'],'acknowledged_at_utc',value,runtime.dfm.EVENT_RECORD)
        self.assertEqual(actual,expected)
        self.assertEqual(actual['schema'],{'validator':'anyOf','path':['first_append_receipt']})

    def test_receipt_offset_keeps_eventrecord_profile(self):
        row=runtime.dfm.integrity_inputs()['fixtures']['rows'][0]
        payload,trace=runtime.coherent_time(row,'acknowledged_at_utc','2026-01-01T01:00:00+01:00')
        actual=runtime.c12.outcome(lambda:runtime.dfm.validate_case(row['event_type'],payload,trace,historical=True))
        self.assertEqual(actual,{'status':'accepted'})

    def test_storage_offset_reports_exact_overlay_format(self):
        row=runtime.dfm.integrity_inputs()['fixtures']['rows'][0]
        value='2026-01-01T00:00:00+00:00'
        payload,trace=runtime.coherent_time(row,'observed_at_utc',value)
        actual=runtime.c12.outcome(lambda:runtime.dfm.validate_case(row['event_type'],payload,trace))
        expected=runtime.time_refusal(row['event_type'],'observed_at_utc',value,runtime.dfm.STORAGE_UTC_Z)
        self.assertEqual(actual,expected)
        self.assertEqual(actual['schema'],{'validator':'format','path':['complete_event','observed_at_utc']})

    def test_duplicate_invalid_fixture_cannot_become_a_proved_alias(self):
        row=copy.deepcopy(c12.dfm.integrity_inputs()['fixtures']['rows'][0])
        groups={}
        for case in row['boundary_cases']:
            if (case.get('scenario')=='schema-rule' and case.get('guards')==[
                {'document':'event_record.schema.json','pointer':'#/properties/schema_id/const'}]
                and case.get('expected_schema')=={'validator':'type','path':[]}):
                control,negative=c12.rule_values(row,case)
                groups.setdefault(c12.digest([control,negative,case['guards']]),[]).append(case)
        duplicate=next(cases for cases in groups.values() if len(cases)>1)
        row['boundary_cases']=duplicate[:2]
        with mock.patch.object(c12.dfm,'integrity_inputs',return_value={'fixtures':{'rows':[row]}}), \
             mock.patch.object(c12,'extend_coverage',return_value=([],[],[],[],[])):
            result=c12.run_schema()
        self.assertEqual(len(result['invalid']),2)
        self.assertEqual(result['ledger'],[])


if __name__=='__main__':
    suite=unittest.defaultTestLoader.loadTestsFromTestCase(EvidenceAccounting)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    print(json.dumps({'status':'pass' if result.wasSuccessful() else 'fail','tests':result.testsRun}))
    raise SystemExit(not result.wasSuccessful())
