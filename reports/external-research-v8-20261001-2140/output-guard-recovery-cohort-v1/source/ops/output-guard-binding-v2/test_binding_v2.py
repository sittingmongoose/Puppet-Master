"""Auth-free source/metadata scope checks; no ledger/native/SDK/runtime access."""
import ast
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import unittest

HERE=Path(__file__).resolve().parent
LAB=HERE.parents[1]
OLD=LAB/'ops/output-guard-binding-v1'
REPAIR=[LAB/'ops/attempt-control-binding-v1'/n for n in ('HANDOFF.md','MANIFEST.json','FREEZE.json','integrated-controller/SOURCE_FREEZE.json')]
NAMES=('rolling.py','case_supervisor.py','stage_actor.py','external_stage_close.py','external_case_close.py','parent_receipt.py','common.py')

def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):
    spec=importlib.util.spec_from_file_location('fixture_binding',str(p));m=importlib.util.module_from_spec(spec)
    saved=sys.dont_write_bytecode
    try:
        sys.dont_write_bytecode=True;spec.loader.exec_module(m)
    finally:sys.dont_write_bytecode=saved
    return m


class NarrowRepairTests(unittest.TestCase):
    def test_four_exact_metadata_paths_allowed_pinned_selected(self):
        c=read(HERE/'recovery-control.json');d=read(HERE/'DEPENDENCIES.json')['positive_scoped_dependencies']
        closure=read(HERE/'integrated-controller/SOURCE_FREEZE.json')['closure_sha256']
        for p in REPAIR:
            self.assertIn(str(p),c['positive_binding_files']);self.assertEqual(d[str(p)],sha(p));self.assertEqual(closure[str(p)],sha(p))

    def test_original_common_positive_scope_accepts_every_selected_closure_path(self):
        # Execute the exact inherited common scope-filter AST with mock digest
        # lookup. Runtime hashes remain opaque metadata; no selected bytes read.
        common=HERE/'integrated-controller/common.py';tree=ast.parse(common.read_text())
        function=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='check_release')
        loop=next(n for n in function.body if isinstance(n,ast.For) and ast.unparse(n.target)=='(raw, digest)')
        fixture=ast.FunctionDef(name='check_scope',args=ast.arguments(posonlyargs=[],args=[],kwonlyargs=[],kw_defaults=[],defaults=[]),body=[loop,ast.Return(value=ast.Constant(value=True))],decorator_list=[])
        module=ast.fix_missing_locations(ast.Module(body=[fixture],type_ignores=[]))
        closure=read(HERE/'integrated-controller/SOURCE_FREEZE.json')['closure_sha256']
        scope={'Path':Path,'HERE':HERE/'integrated-controller','CAMPAIGN':LAB,
            'CONTROL':read(HERE/'recovery-control.json'),'selected':closure,'release':{},'sha':lambda p:closure[str(p)]}
        exec(compile(module,str(common),'exec'),scope)
        self.assertTrue(scope['check_scope']())
        # The original repair case must fail if the four exact additions vanish.
        scope['CONTROL']['positive_binding_files']=[p for p in scope['CONTROL']['positive_binding_files'] if p not in {str(x) for x in REPAIR}]
        with self.assertRaisesRegex(ValueError,'unselected source scope'):scope['check_scope']()

    def test_seven_modules_and_all_other_control_fields_unchanged(self):
        for n in NAMES:self.assertEqual((HERE/'integrated-controller'/n).read_bytes(),(OLD/'integrated-controller'/n).read_bytes())
        before=read(OLD/'recovery-control.json');after=read(HERE/'recovery-control.json')
        for k in set(before)-{'positive_binding_files'}:self.assertEqual(before[k],after[k])
        self.assertEqual(after['default_queue'],[])
        added=set(after['positive_binding_files'])-set(before['positive_binding_files'])
        self.assertEqual(added,{str(p) for p in REPAIR}|{str(HERE/n) for n in ('control_binding.py','DEPENDENCIES.json','recovery-control.json')})
        self.assertTrue(set(before['positive_binding_files'])<=set(after['positive_binding_files']))

    def test_wholepair_interface_case_sources_and_versioned_acceptance_paths(self):
        b=load(HERE/'control_binding.py');old=load(OLD/'control_binding.py')
        f=b.source_interface(['V8-BIO-COND'])['fields_for_root_release_after_separate_acceptance']
        prior=old.source_interface(['V8-BIO-COND'])['fields_for_root_release_after_separate_acceptance']
        for k in set(prior)-{'production_entry','controller_snapshot'}:self.assertEqual(f[k],prior[k])
        self.assertEqual(f['case_queue'],['V8-BIO-COND-C-Z-S8','V8-BIO-P-Z-S8']);self.assertEqual(len(f['allowed_jobs']),6)
        self.assertEqual(b.ACCEPTANCE,LAB/'ops/recovery-v1/OUTPUT_GUARD_CONTROL_BINDING_ACCEPTANCE_V2.json')
        self.assertEqual(b.BINDING_REVIEW,LAB/'ops/output-guard-binding-review-v2/REVIEW.json')
        expected=(OLD/'control_binding.py').read_text().replace('OUTPUT_GUARD_CONTROL_BINDING_ACCEPTANCE_V1.json','OUTPUT_GUARD_CONTROL_BINDING_ACCEPTANCE_V2.json').replace('ops/output-guard-binding-review-v1/REVIEW.json','ops/output-guard-binding-review-v2/REVIEW.json')
        self.assertEqual((HERE/'control_binding.py').read_text(),expected)
        self.assertIn("parser.add_argument('--pair', action='append', required=True)",expected)
        self.assertNotIn("add_argument('--out'",expected)
        for bad in ([],['V8-BIO-COND']*2,['V8-BIO-P-Z-S8']):
            with self.assertRaises(ValueError):b.source_interface(bad)


if __name__=='__main__':unittest.main(verbosity=2)
