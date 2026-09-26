"""Closed schema discriminators and actual record identity regressions."""
import copy
import importlib.util
import json
import sys
import unittest
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
spec=importlib.util.spec_from_file_location('packet_gate',ROOT/'scripts/pm-new-contracts-verify.py')
gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)
SCHEMA=json.loads((ROOT/'Plans/commands_shortcuts_contracts.schema.json').read_text())
ONB=json.loads((ROOT/'Plans/product_onboarding_contracts.schema.json').read_text())

class IdentityRules(unittest.TestCase):
    def members(self,schema,token):
        return [(n,gate.const_fingerprint(d).get('record_kind')) for n,d in schema['$defs'].items() if gate.const_fingerprint(d).get('schema_id')==token]
    def test_current_action_families_disjoint(self):
        for token in ['pm.commands_shortcuts.action_request.v1','pm.commands_shortcuts.action_result.v1']:
            self.assertTrue(gate.closed_action_family_is_disjoint(SCHEMA,self.members(SCHEMA,token)))
    def test_policy_missing_rejects(self):
        s=copy.deepcopy(SCHEMA);s.pop('x-runtime-schema-id-policy')
        self.assertFalse(gate.closed_action_family_is_disjoint(s,self.members(s,'pm.commands_shortcuts.action_request.v1')))
    def test_duplicate_action_rejects(self):
        s=copy.deepcopy(SCHEMA);s['$defs']['Duplicate']=copy.deepcopy(s['$defs']['CreateRequest'])
        self.assertFalse(gate.closed_action_family_is_disjoint(s,self.members(s,'pm.commands_shortcuts.action_request.v1')))
    def test_unbounded_action_rejects(self):
        s=copy.deepcopy(SCHEMA);s['$defs']['CreateRequest']['properties']['action_id']={'type':'string'}
        self.assertFalse(gate.closed_action_family_is_disjoint(s,self.members(s,'pm.commands_shortcuts.action_request.v1')))
    def test_enum_overlap_rejects(self):
        s=copy.deepcopy(SCHEMA);s['$defs']['Duplicate']=copy.deepcopy(s['$defs']['SaveResult']);s['$defs']['Duplicate']['properties']['action_id']={'const':'commands.update'}
        self.assertFalse(gate.closed_action_family_is_disjoint(s,self.members(s,'pm.commands_shortcuts.action_result.v1')))
    def duplicate_findings(self,definition,records):
        locations=defaultdict(list)
        for i,r in enumerate(records):
            key,value=gate.primary_identity('definition',definition,r)
            locations[('schema','definition',key+'='+value)].append(str(i))
        return gate.duplicate_runtime_id_findings(locations)
    def test_onboarding_session_is_not_instance(self):
        for name,key in [('onboarding_action_request','action_instance_id'),('onboarding_project_recovery_route_projection','projection_id')]:
            d=ONB['$defs'][name];a={'onboarding_session_id':'same',key:'one'};b={**a,key:'two'}
            self.assertEqual([],self.duplicate_findings(d,[a,b]));self.assertTrue(self.duplicate_findings(d,[a,a]))
    def test_control_composite_retains_duplicate_detection(self):
        d=SCHEMA['$defs']['ControlRoute'];a={'manager_route':'commands','route_via':'owner_action','control_label':'Import','setting_id':'shared'};b={**a,'route_via':'settings_transaction'}
        self.assertEqual([],self.duplicate_findings(d,[a,b]));self.assertTrue(self.duplicate_findings(d,[a,a]))
    def test_invalid_identity_annotation_rejects(self):
        for fields in [[],['missing'],['route_via','route_via']]:
            d=copy.deepcopy(SCHEMA['$defs']['ControlRoute']);d['x-primary-identity-fields']=fields
            with self.assertRaises(ValueError):gate.primary_identity('ControlRoute',d,{'route_via':'owner_action'})
        d=copy.deepcopy(SCHEMA['$defs']['ControlRoute'])
        with self.assertRaises(ValueError):gate.primary_identity('ControlRoute',d,{'manager_route':'','route_via':'owner_action','control_label':'Import'})

if __name__=='__main__':unittest.main()
