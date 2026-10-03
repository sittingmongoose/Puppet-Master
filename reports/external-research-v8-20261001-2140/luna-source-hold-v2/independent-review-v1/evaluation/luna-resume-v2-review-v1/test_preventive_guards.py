"""Independent synthetic rejection fixtures; never acceptance or launch evidence."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

LAB = Path('LAB_ROOT')
SOURCE = LAB / 'dev/luna-resume-v2'
sys.path.insert(0, str(SOURCE / 'route-successor'))
sys.path.insert(0, str(SOURCE))
import common
import release_binding as root_validator
import formula_check as pid1_validator


class PreventiveGuards(unittest.TestCase):
    def exercise(self, validator, mode):
        with tempfile.TemporaryDirectory() as temp:
            controller = Path(temp) / 'controller'
            route = controller / 'route-successor'
            route.mkdir(parents=True)
            operator = Path(temp) / 'operator'
            run_root = operator / 'synthetic-once'

            def record(name, value):
                path = controller / name
                path.write_text(json.dumps(value) + '\n')
                return {'path': str(path), 'sha256': common.sha(path)}

            ledger_source = record('fixture-ledger.json', {'synthetic_fixture_only': True})
            authority = record('fixture-authority.json', {'synthetic_fixture_only': True})
            resume = record('fixture-resume.json', {'synthetic_fixture_only': True})
            control = {'operator_root': str(operator), 'ledger': ledger_source,
                       'authority': authority, 'resume_authority': resume,
                       'canary_id': 'canary'}
            control_record = record('recovery-control.json', control)
            route_record = record('route-successor/SNAPSHOT.json', {'closure_sha256': {}})
            controller_record = record('SNAPSHOT.json', {'closure_sha256': {
                str(controller / 'recovery-control.json'): control_record['sha256']}})
            boundary = record('fixture-boundary.json', {
                'verdict': 'accepted', 'snapshot_sha256': route_record['sha256'],
                'synthetic_fixture_only': True})
            for missing in ('create_goal_pre_dispatch_denied_verified',
                            'host_one_goal_lifetime_verified'):
                for invalid in (False, None, 1):
                    review = {'verdict': 'accepted', 'snapshot_sha256': route_record['sha256'],
                              'allowed_modes': [mode], 'synthetic_fixture_only': True,
                              'create_goal_pre_dispatch_denied_verified': True,
                              'host_one_goal_lifetime_verified': True}
                    if invalid is None:
                        review.pop(missing)
                    else:
                        review[missing] = invalid
                    source_review = record('fixture-source-review.json', review)
                    parent = {'schema': 'er8.luna.controller-root-release.v1',
                              'root_authority': True, 'accepted': True,
                              'authorization': 'EXACT_ROOT_RELEASE', 'family': 'L',
                              'model': 'gpt-6-luna', 'effort': 'max',
                              'native_response_policy': common.POLICY,
                              'binding_formula': root_validator.FORMULA,
                              'owned_cleanup_authorized': True, 'mode': mode,
                              'route_snapshot': route_record,
                              'controller_snapshot': controller_record,
                              'source_review': source_review,
                              'execution_acceptance': boundary,
                              'ledger_source': ledger_source,
                              'campaign_authority': authority, 'resume_authority': resume,
                              'run_root': str(run_root), 'synthetic_fixture_only': True}
                    with self.subTest(validator=validator, mode=mode, field=missing, value=invalid):
                        if validator == 'root':
                            with patch.object(root_validator, 'HERE', controller), \
                                 patch.object(root_validator, 'LUNA_ROUTE', route), \
                                 patch.object(root_validator, 'CONTROL', control), \
                                 patch.object(root_validator, 'ledger_module', side_effect=AssertionError('actual ledger forbidden')):
                                with self.assertRaisesRegex(ValueError, 'preventive'):
                                    root_validator.check_parent_release(parent, mode)
                        else:
                            parent_record = record('fixture-parent.json', parent)
                            concrete = {'binding_formula': root_validator.FORMULA,
                                        'prospective_root_release': parent_record,
                                        'route_snapshot_sha256': route_record['sha256'],
                                        'controller_snapshot': controller_record}
                            with patch.object(pid1_validator, 'HERE', route):
                                with self.assertRaisesRegex(ValueError, 'preventive'):
                                    pid1_validator.validate({}, {'mode': mode}, concrete)

    def test_root_canary_rejects_missing_prevention(self):
        self.exercise('root', 'canary')

    def test_root_productive_rejects_missing_prevention(self):
        self.exercise('root', 'productive')

    def test_pid1_canary_rejects_missing_prevention(self):
        self.exercise('pid1', 'canary')

    def test_pid1_productive_rejects_missing_prevention(self):
        self.exercise('pid1', 'productive')


if __name__ == '__main__':
    unittest.main()
