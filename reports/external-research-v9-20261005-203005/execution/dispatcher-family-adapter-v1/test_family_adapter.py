import json
from pathlib import Path
import unittest
import family_adapter as a

Z={'candidate_family':'GLM','requested_model':'GLM 5.3 Flash','requested_effort':'Max'}
L={'candidate_family':'Luna','requested_model':'GPT-6 Luna','requested_effort':'max'}
ZR={'family':'Z','requested_model':'GLM 5.3 Flash','requested_effort':'max'}
LR={'family':'L','requested_model':'GPT-6 Luna','requested_effort':'Max'}
ZPIN={'family':'Z','model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max','verified':True}
LPIN={'family':'L','model':'gpt-6-luna','effort':'max','verified':True}

class FamilyAdapterTests(unittest.TestCase):
    def test_all_actual_new_cards_and_owner_requests(self):
        data=json.loads(Path(__file__).with_name('ACTUAL_SCHEMA_VECTORS.json').read_text())
        self.assertEqual(len(data['vectors']),73)
        self.assertEqual(len({r['card_source']['path'] for r in data['vectors']}),16)
        for row in data['vectors']:
            with self.subTest(job=row['job_id']):
                self.assertEqual(a.registered_family(row['card_declaration'],row['owner_declaration'],row['registered_family']),row['registered_family'])
    def test_legacy_requested_only(self):
        self.assertEqual(a.declared_family({'requested_family':'GLM'}),'Z')
        self.assertEqual(a.declared_family({'requested_family':'Luna'}),'L')
    def test_both_declared_fields_agree(self):
        self.assertEqual(a.declared_family({'requested_family':'GLM','candidate_family':'glm'}),'Z')
    def test_conflicting_fields_rejected(self):
        with self.assertRaises(a.FamilyBindingError):a.declared_family({'requested_family':'GLM','candidate_family':'Luna'})
    def test_missing_rejected(self):
        with self.assertRaises(a.FamilyBindingError):a.declared_family({})
    def test_label_only_never_infers_family(self):
        with self.assertRaises(a.FamilyBindingError):a.declared_family({'pair_id':'GLM-Luna-Z-L','requested_model':'GLM 5.3 Flash','family':'Z'})
    def test_invalid_declared_values_rejected(self):
        for value in [None,True,{},[],17,'Muse','Z','L','GLM-or-Luna','']:
            with self.subTest(value=value),self.assertRaises(a.FamilyBindingError):a.declared_family({'candidate_family':value})
    def test_invalid_field_not_hidden_by_valid_other(self):
        with self.assertRaises(a.FamilyBindingError):a.declared_family({'requested_family':None,'candidate_family':'GLM'})
    def test_queue_family_mismatch(self):
        with self.assertRaises(a.FamilyBindingError):a.registered_family(Z,ZR,'L')
    def test_owner_family_mismatch(self):
        with self.assertRaises(a.FamilyBindingError):a.registered_family(Z,{**ZR,'family':'L'},'Z')
    def test_owner_model_mismatch(self):
        with self.assertRaises(a.FamilyBindingError):a.registered_family(Z,{**ZR,'requested_model':'GPT-6 Luna'},'Z')
    def test_owner_effort_mismatch(self):
        with self.assertRaises(a.FamilyBindingError):a.registered_family(Z,{**ZR,'requested_effort':'high'},'Z')
    def test_actual_runtime_family_mismatch(self):
        with self.assertRaises(a.FamilyBindingError):a.validate_launch_binding(Z,ZR,'Z',LPIN)
    def test_actual_runtime_model_mismatch(self):
        with self.assertRaises(a.FamilyBindingError):a.validate_launch_binding(Z,ZR,'Z',{**ZPIN,'model':'GLM-5.3'})
    def test_actual_runtime_effort_mismatch(self):
        with self.assertRaises(a.FamilyBindingError):a.validate_launch_binding(L,LR,'L',{**LPIN,'effort':'high'})
    def test_unbound_template_and_unverified_runtime_rejected(self):
        for value in [None,{}, {'luna_runtime':{}},{**ZPIN,'verified':False}, {'family':'Z','model':'GLM-5.3-Flash','effort':'max'}]:
            with self.subTest(value=value),self.assertRaises(a.FamilyBindingError):a.validate_launch_binding(Z,ZR,'Z',value)
    def test_explicit_verified_actual_runtime_bindings(self):
        self.assertEqual(a.validate_launch_binding(Z,ZR,'Z',ZPIN),'Z')
        self.assertEqual(a.validate_launch_binding(L,LR,'L',LPIN),'L')

if __name__=='__main__':unittest.main()
