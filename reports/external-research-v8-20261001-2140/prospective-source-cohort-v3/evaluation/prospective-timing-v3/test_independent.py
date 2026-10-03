"""Independent frozen-source and prospective integration tests; no live admission."""
import ast
import copy
import hashlib
import importlib.util
import json
import pathlib
import sys
import types
import unittest
from contextlib import contextmanager
from unittest.mock import patch

HERE = pathlib.Path(__file__).resolve().parent
LAB = HERE.parents[1]
SOURCE = LAB / 'dev/prospective-timing-v3'
OLD = LAB / 'dev/resume-execution-v2'
EXPECTED = {
    SOURCE / 'SOURCE_FREEZE.json': 'bafc1d00f5d6590f6821847517e20c322ac1ea9e10ac4438cd67cca23fc25acf',
    SOURCE / 'integrated-controller/SOURCE_FREEZE.json': '38f31e444c6dde29f2498a69ba2c1769506b0c4384a048afb25b7882df3f7cb2',
    SOURCE / 'CASE_SOURCE_FREEZE.json': 'b65fcce1cb1398cff2a9e4bdadc2c9d41faa753e8d52a6a92fe31e1097624448',
    LAB / 'ops/execution-resume-v1/PROSPECTIVE_ALLOCATION_V3.json': '8ae738d3b3f3ef2355a7b19ebec5404865aa689e53d1a26f618ebe353e9f697c',
}


def audit(event, args):
    if event in {'subprocess.Popen', 'os.system', 'os.posix_spawn', 'os.kill', 'os.killpg', 'socket.connect', 'socket.bind'}:
        raise RuntimeError('Independent source review forbids live process/network actions')
    if event == 'open' and isinstance(args[0], (str, bytes)):
        raw = str(args[0])
        if any(token in raw for token in ('/auth/', '/credentials/', '/private-runtime/', '/jobs/', 'evaluation-scope', 'scoring-only')):
            raise RuntimeError('Independent source review forbids private/runtime/candidate bodies')
        if '/ops/accounting-v1/state.json' in raw or raw.endswith('journal.jsonl'):
            raise RuntimeError('Independent source review forbids live ledger state/journals')
        mode = args[1]
        flags = args[2]
        writing = isinstance(mode, str) and any(ch in mode for ch in 'wax+')
        writing |= isinstance(flags, int) and bool(flags & (1 | 2 | 64 | 512))
        if writing and not pathlib.Path(raw).is_relative_to(HERE):
            raise RuntimeError('Independent test writes confined to evaluation ownership')


sys.addaudithook(audit)
sys.dont_write_bytecode = True
sys.path.insert(0, str(SOURCE / 'integrated-controller'))
import common
import stage_actor


def read(path):
    return json.loads(pathlib.Path(path).read_text())


def sha(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class IndependentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.v4 = read(LAB / 'ops/execution-resume-v1/root-production-release-v4.json')
        cls.proposal = read(SOURCE / 'ROOT_RELEASE_PATCH.json')
        cls.mapping = read(SOURCE / 'INPUT_MAP.json')['cases']
        cls.old_mapping = read(LAB / 'dev/route-recovery-v2/INPUT_MAP.json')['cases']
        cls.inputs = load('independent_assigned_inputs', SOURCE / 'candidate_inputs.py')
        cls.release = copy.deepcopy(cls.v4)
        cls.release.update(cls.proposal['fields_to_replace_in_new_root_release'])
        cls.release['selected_positive_files'].update(cls.proposal['selected_positive_files_to_add'])

    def test_exact_freeze_and_complete_predecessor_closure(self):
        for path, expected in EXPECTED.items():
            self.assertEqual(sha(path), expected, str(path))
        bundle = read(SOURCE / 'SOURCE_FREEZE.json')
        controller = read(SOURCE / 'integrated-controller/SOURCE_FREEZE.json')
        original = read(OLD / 'integrated-controller/SOURCE_FREEZE.json')
        lineage = read(SOURCE / 'LINEAGE.json')
        for collection in (bundle['positive_source_bundle_sha256'], bundle['unchanged_dependencies_sha256'], controller['closure_sha256'], lineage['predecessor_sha256']):
            for path, digest in collection.items():
                self.assertFalse(pathlib.Path(path).is_symlink())
                self.assertEqual(sha(path), digest, path)
        for path, digest in original['closure_sha256'].items():
            self.assertEqual(controller['closure_sha256'][path], digest)
        self.assertEqual(set(self.v4['planning_input_sha256']) - set(lineage['predecessor_sha256']), set())
        for path, digest in self.v4['planning_input_sha256'].items():
            self.assertEqual(lineage['predecessor_sha256'][path], digest)
        cases = read(SOURCE / 'CASE_SOURCE_FREEZE.json')
        self.assertEqual(cases['planning_input_sha256'], self.release['planning_input_sha256'])
        for path, digest in cases['case_source_sha256'].items():
            self.assertEqual(sha(path), digest, path)

    def test_ast_executable_delta_and_control_mapping_only(self):
        roles = [('research-proposal', 1200, 'PROPOSAL.md'), ('independent-candidate-critic', 1200, 'CRITIQUE.md'), ('final-correction', 900, 'FINAL_PROPOSAL.md')]
        old_files = {p.name for p in (OLD / 'integrated-controller').glob('*.py')}
        new_files = {p.name for p in (SOURCE / 'integrated-controller').glob('*.py')}
        self.assertEqual(old_files, new_files)
        for name in old_files:
            old = (OLD / 'integrated-controller' / name).read_bytes()
            new = (SOURCE / 'integrated-controller' / name).read_bytes()
            if name != 'common.py':
                self.assertEqual(old, new)
                continue
            before, after = ast.parse(old), ast.parse(new)
            before_roles = [n for n in before.body if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'ROLES' for t in n.targets)]
            after_roles = [n for n in after.body if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'ROLES' for t in n.targets)]
            self.assertEqual(len(before_roles), 1)
            self.assertEqual(ast.literal_eval(after_roles[0].value), roles)
            before_roles[0].value = copy.deepcopy(after_roles[0].value)
            self.assertEqual(ast.dump(before), ast.dump(after))
        old_control, new_control = read(OLD / 'recovery-control.json'), read(SOURCE / 'recovery-control.json')
        old_control['planning_map'] = str(SOURCE / 'INPUT_MAP.json')
        old_control['default_queue'] = self.v4['case_queue']
        self.assertEqual(old_control, new_control)
        for case, item in self.mapping.items():
            expected = copy.deepcopy(self.old_mapping[case])
            expected.update(root=str(LAB / 'cases/prospective-timing-v3'), case_dir=str(LAB / 'cases/prospective-timing-v3/candidates' / case), manifest=str(LAB / 'cases/prospective-timing-v3/candidates' / case / 'manifest.json'), objectives=str(SOURCE / 'OBJECTIVES.json'))
            self.assertEqual(item, expected)

    def test_case_pair_family_account_model_and_limits_preserved(self):
        self.assertEqual(list(self.mapping), self.v4['case_queue'])
        self.assertEqual(self.release['allowed_jobs'], self.v4['allowed_jobs'])
        self.assertEqual(len(self.mapping), 12)
        self.assertEqual(len(self.release['allowed_jobs']), 36)
        pairs = {}
        for case, item in self.mapping.items():
            old = read(self.old_mapping[case]['manifest'])
            new = read(item['manifest'])
            expected = copy.deepcopy(old)
            for index, stage in enumerate(expected['stages']):
                stage['seconds'] = (1200, 1200, 900)[index]
            expected['caps'].update(research_proposal_seconds=1200, candidate_critic_seconds=1200, final_correction_seconds=900, summed_stage_hard_seconds=3300)
            self.assertEqual(new, expected)
            self.assertEqual([s['reservation_id'] for s in new['stages']], [case + '-' + role for role, _, _ in common.ROLES])
            self.assertEqual(sum(s['seconds'] for s in new['stages']) + new['caps']['host_overhead_hard_seconds'], new['caps']['case_wall_hard_seconds'])
            self.assertEqual(new['caps']['case_occupied_hard_seconds'], 5400)
            self.assertEqual(new['caps']['native_goal_starts_for_complete_case'], 3)
            self.assertTrue(new['caps']['no_reset'])
            pairs.setdefault(new['pair_id'], []).append(new)
        self.assertEqual(len(pairs), 6)
        for pair, cases in pairs.items():
            self.assertEqual(len(cases), 2)
            self.assertEqual(len({c['pair_arm'] for c in cases}), 2)
            bound = self.v4['pair_bindings'][pair]
            self.assertEqual(sha(bound['path']), bound['sha256'])
            binding = read(bound['path'])
            self.assertEqual(set(binding['cases']), {c['case_id'] for c in cases})
            self.assertTrue(binding['root_authority'])
            self.assertEqual(binding['family'], 'Z')
            self.assertEqual(binding['account_identity'], common.ACCOUNT)
            self.assertEqual(binding['route'], self.v4['route'])
            self.assertEqual(binding['pins'], self.v4['pins'])
        config = read(self.v4['config']['path'])
        self.assertEqual(config['account_identity'], common.ACCOUNT)
        self.assertEqual(config['native_model'], {'provider_id': 'builtin:zai-coding-plan', 'model_id': 'GLM-5.3-Flash', 'effort': 'max', 'session_mode': 'build'})
        self.assertEqual(self.v4['max_component_seconds'], 1800)
        self.assertEqual(self.v4['max_component_responses'], 160)
        self.assertEqual(common.STOP_EPOCH, self.v4['campaign_deadline_epoch'])

    def test_each_assigned_pin_required_by_real_planning_gate(self):
        checked = 0
        for case in self.mapping:
            self.assertEqual([s['seconds'] for s in common.check_planning(self.release, case)['stages']], [1200, 1200, 900])
            item = self.mapping[case]
            manifest = read(item['manifest'])
            root, directory = pathlib.Path(item['root']), pathlib.Path(item['case_dir'])
            # Test the real planning gate. The unchanged resolver's unused
            # required_files helper has a pre-existing Path-subscript typo.
            needed = [SOURCE / 'INPUT_MAP.json', pathlib.Path(item['objectives']), pathlib.Path(item['manifest']), root / manifest['brief'], root / manifest['thin_plan'], root / manifest['source_access'], directory / 'METHOD.md', directory / 'TASK.md', *(root / stage['task_template'] for stage in manifest['stages'])]
            for path in needed:
                bad = copy.deepcopy(self.release)
                bad['planning_input_sha256'][str(path)] = '0' * 64
                with self.assertRaisesRegex(ValueError, 'assigned prospective planning source drift'):
                    common.check_planning(bad, case)
                checked += 1
        self.assertEqual(checked, 132)

    def test_all_task_objective_and_input_deltas_numeric_only(self):
        previous_objectives = read(LAB / 'dev/route-recovery-v2/OBJECTIVES.json')
        objectives = read(SOURCE / 'OBJECTIVES.json')
        expected = copy.deepcopy(previous_objectives)
        expected['objectives'] = {job: copy.deepcopy(previous_objectives['objectives'][job]) for job in self.v4['allowed_jobs']}
        for case, item in self.mapping.items():
            previous = self.old_mapping[case]
            old_root, new_root = pathlib.Path(previous['root']), pathlib.Path(item['root'])
            old_dir, new_dir = pathlib.Path(previous['case_dir']), pathlib.Path(item['case_dir'])
            manifest = read(item['manifest'])
            # Compare body bytes only; no scoring keys or candidate outputs are read.
            for key in ('brief', 'thin_plan', 'source_access'):
                self.assertEqual(sha(old_root / manifest[key]), sha(new_root / manifest[key]))
            self.assertEqual(sha(old_dir / 'METHOD.md'), sha(new_dir / 'METHOD.md'))
            self.assertEqual((new_dir / 'TASK.md').read_text(), (old_dir / 'TASK.md').read_text().replace('Research ≤1800s; critic ≤600s; correction ≤600s;', 'Research ≤1200s; critic ≤1200s; correction ≤900s;'))
            for index, stage in enumerate(manifest['stages']):
                old_cap = 1800 if index == 0 else 600
                new_cap = (1200, 1200, 900)[index]
                task = stage['task_template']
                self.assertEqual((new_root / task).read_text(), (old_root / task).read_text().replace(str(old_cap) + ' seconds', str(new_cap) + ' seconds'))
                objective = expected['objectives'][stage['reservation_id']]
                objective['objective'] = objective['objective'].replace('at most ' + str(old_cap) + 's ', 'at most ' + str(new_cap) + 's ')
                objective['characters'] = len(objective['objective'])
        self.assertEqual(objectives, expected)

    def test_release_proposal_rejected_without_root_authority(self):
        self.assertFalse(self.proposal['accepted'])
        self.assertFalse(self.proposal['root_authority'])
        self.assertEqual(self.proposal['launch_authority'], 'NONE_SOURCE_ONLY')
        for key in ('accepted', 'root_authority'):
            release = copy.deepcopy(self.release)
            release[key] = False
            with patch.object(common, 'ledger_module', side_effect=AssertionError('real ledger forbidden')):
                with self.assertRaisesRegex(ValueError, 'explicit accepted root release required'):
                    common.check_release(release)

    def test_synthetic_integration_requires_complete_new_closure(self):
        # The transaction below is an in-memory fake; no accounting module is loaded.
        @contextmanager
        def fake_transaction():
            yield {'route_reviews': {self.release['route']: {'qualification_scope': 'NATIVE_ACCEPTED', 'accepted': True, 'pins': self.release['pins']}}, 'reservation_by_case': {c: {'native_starts': 3, 'final_job': c + '-final-correction'} for c in self.mapping}}
        fake = types.SimpleNamespace(transaction=fake_transaction)
        with patch.object(common, 'ledger_module', return_value=fake):
            self.assertEqual(common.check_release(self.release)['route'], self.v4['route'])
            bad = copy.deepcopy(self.release)
            del bad['selected_positive_files'][str(SOURCE / 'integrated-controller/common.py')]
            with self.assertRaisesRegex(ValueError, 'exact frozen controller closure must be selected'):
                common.check_release(bad)
        for key in self.proposal['unchanged_fields']:
            self.assertEqual(self.release[key], self.v4[key], key)

    def test_full_cap_edge_case_and_global_refusal_for_each_role(self):
        class BeforeLedger(Exception):
            pass
        case = next(iter(self.mapping))
        birth = 10 ** 9
        def args(role, cap, artifact, start, campaign):
            return types.SimpleNamespace(root_release='offline', case=case, role=role, cap=cap, artifact=artifact, stage_ns=start, case_ns=birth, campaign_ns=campaign, deadline_ns=common.deadline(start, cap, birth, campaign), run_root=str(HERE / 'never-created-stage'), stage_epoch=1, case_epoch=1)
        with patch.object(stage_actor, 'armed'), patch.object(stage_actor, 'read_json', return_value={'route': 'offline', 'pins': {}}), patch.object(stage_actor, 'check_release'), patch.object(stage_actor, 'check_planning'), patch.object(stage_actor, 'QUEUE', [case]), patch.object(stage_actor, 'ledger_module', side_effect=BeforeLedger), patch.object(stage_actor, 'load', return_value=types.SimpleNamespace(source_access=lambda *a: '/offline/source-access.json')):
            for role, cap, artifact in common.ROLES:
                edge = birth + (3600 - cap) * 10 ** 9
                with self.assertRaises(BeforeLedger):
                    stage_actor.run(args(role, cap, artifact, edge, birth + 4000 * 10 ** 9))
                with self.assertRaisesRegex(ValueError, 'whole original component cap must fit case/campaign'):
                    stage_actor.run(args(role, cap, artifact, edge + 1, birth + 4000 * 10 ** 9))
                with self.assertRaises(BeforeLedger):
                    stage_actor.run(args(role, cap, artifact, birth, birth + cap * 10 ** 9))
                with self.assertRaisesRegex(ValueError, 'whole original component cap must fit case/campaign'):
                    stage_actor.run(args(role, cap, artifact, birth, birth + cap * 10 ** 9 - 1))
        self.assertFalse((HERE / 'never-created-stage').exists())


if __name__ == '__main__':
    unittest.main(verbosity=2)
