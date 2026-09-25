"""Doctor remediation is an owner route, not a protected owner command."""

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCTOR_ROUTE = 'Doctor (route to owner only; no dispatch)'
PROFILE_ROUTE = ('Doctor (owner-route navigation only for protected or mutating '
                 'remediation; no Doctor command dispatch or owner-success proof; '
                 'Doctor-owned read diagnostics and rechecks remain available)')

# One reviewed subset, not every Backup/Remote command and not Doctor diagnostics.
COMMANDS = {
    'TOUCH-BRS-018': ('catalog.restore_project_in_place', 'cmd.restore.project_in_place'),
    'TOUCH-BRS-019': ('catalog.restore_project_as_new', 'cmd.restore.project_as_new'),
    'TOUCH-BRS-020': ('catalog.restore_selective', 'cmd.restore.selective'),
    'TOUCH-BRS-021': ('catalog.restore_server_full', 'cmd.restore.server_full'),
    'TOUCH-BRS-024': ('catalog.restore_rollback', 'cmd.restore.rollback'),
    'TOUCH-BRS-028': ('catalog.backup_prune', 'cmd.backup.prune'),
    'TOUCH-BRS-029': ('catalog.backup_unlock', 'cmd.backup.unlock'),
    'TOUCH-BRS-035': ('catalog.backup_recovery_key_export', 'cmd.backup.recovery_key.export'),
    'TOUCH-BRS-038': ('catalog.backup_recovery_key_test', 'cmd.backup.recovery_key.test'),
    'TOUCH-BRS-040': ('catalog.backup_recovery_key_rotate', 'cmd.backup.recovery_key.rotate'),
    'TOUCH-BRS-041': ('catalog.backup_recovery_key_reencrypt', 'cmd.backup.recovery_key.reencrypt'),
    'TOUCH-RAS-010': ('catalog.remote_access_tailscale_headscale_start', 'cmd.remote_access.tailscale.headscale.start'),
    'TOUCH-RAS-011': ('catalog.remote_access_tailscale_headscale_submit_registration', 'cmd.remote_access.tailscale.headscale.submit_registration'),
    'TOUCH-RAS-012': ('catalog.remote_access_tailscale_login_resume', 'cmd.remote_access.tailscale.login.resume'),
    'TOUCH-RAS-013': ('catalog.remote_access_tailscale_login_start', 'cmd.remote_access.tailscale.login.start'),
    'TOUCH-RAS-015': ('catalog.remote_access_tailscale_identity_reset', 'cmd.remote_access.tailscale.identity.reset'),
    'TOUCH-RAS-039': ('catalog.remote_access_remote_link_rotate_recovery_key', 'cmd.remote_access.remote_link.rotate_recovery_key'),
}


class DoctorRouteMetadataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.wiring = json.loads((ROOT / 'Plans/Wiring_Matrix.production.json').read_text(encoding='utf-8'))
        cls.touch = json.loads((ROOT / 'Plans/touch_closure.json').read_text(encoding='utf-8'))

    def test_exact_command_routes_preserve_owner_dispatch_elsewhere(self):
        self.assertEqual(len(COMMANDS), 17)
        entries = self.wiring['entries']
        for touch_id, (entry_id, command_id) in COMMANDS.items():
            with self.subTest(touch_id=touch_id):
                entry = entries[entry_id]
                self.assertEqual(entry['ui_command_id'], command_id)
                self.assertEqual(entry['ui_element_id'], entry_id)
                self.assertIn(DOCTOR_ROUTE, entry['ui_location'])
                self.assertNotEqual(entry['ui_location'].replace(DOCTOR_ROUTE, '').strip(' ;'), '')
                self.assertIn('handlers::', entry['handler_location'])
                self.assertTrue(entry['request_schema_ref'].startswith('Plans/'))
                self.assertTrue(entry['result_schema_ref'].startswith('Plans/'))
                self.assertEqual(entry['expected_event_types'], [])
                self.assertTrue(entry['state_selector'])
                self.assertTrue(entry['disabled_reason_projection'])
                checks = entry['acceptance_checks']
                self.assertIn('dispatch reverse consumer', checks[4])
                self.assertIn('Doctor shows route-to-owner navigation only', checks[4])
                self.assertIn('no ' + command_id + ' dispatch', checks[4])
                self.assertIn('Doctor route/focus return proves no owner success', checks[4])
                accessibility = entry['accessibility_contract']
                self.assertIn('dispatch consumers', accessibility['keyboard_access'])
                self.assertIn('Doctor keyboard/pointer activate route-to-owner navigation only',
                              accessibility['keyboard_access'])
                self.assertIn('never dispatch ' + command_id, accessibility['keyboard_access'])
                self.assertIn('Doctor the same surface is route-to-owner navigation only',
                              accessibility['role_or_semantics'])
                self.assertIn('Doctor route or focus return never proves owner success',
                              accessibility['focus_management'])
                self.assertIn('Doctor proves route-to-owner navigation only', entry['evidence_required'])
                self.assertIn('Doctor route/focus return proves no owner success', entry['evidence_required'])
                access_tests = [x for x in entry['test_evidence']
                                if x['evidence_kind'] == 'accessibility_regression']
                self.assertEqual(len(access_tests), 1)
                self.assertIn('no ' + command_id + ' dispatch', access_tests[0]['requirement'])

    def test_touch_rows_remain_partial_and_cite_exact_owner_route(self):
        rows = {row[0]: row for row in self.touch['rows']}
        for touch_id, (_, command_id) in COMMANDS.items():
            with self.subTest(touch_id=touch_id):
                row = rows[touch_id]
                self.assertEqual(row[3], command_id)
                self.assertEqual(row[4], 'partial')
                self.assertIn('Doctor is route-to-owner navigation only per N2-156/F3-528', row[5])
                self.assertIn('never dispatches ' + command_id, row[5])
                self.assertIn('Doctor route/focus return proves no owner success', row[5])
                self.assertIn('Native dispatch and runtime proof remain absent', row[5])

    def test_only_two_profile_qualifiers_preserve_doctor_diagnostics(self):
        profiles = {x['profile_id']: x for x in self.touch['profiles']}
        self.assertIn(PROFILE_ROUTE, profiles['TCP-BACKUP']['gui_triggers'][0])
        self.assertIn(PROFILE_ROUTE, profiles['TCP-REMOTE']['gui_triggers'][0])
        self.assertIn('Settings Backup managers', profiles['TCP-BACKUP']['gui_triggers'][0])
        self.assertIn('Settings Remote Access manager', profiles['TCP-REMOTE']['gui_triggers'][0])
        doctor = profiles['TCP-DOCTOR']
        self.assertIn('Doctor may read/recheck within descriptor policy', doctor['permission_gate'])
        self.assertIn('K3 Doctor summary, scopes, details, logs, receipts, rechecks',
                      doctor['gui_triggers'][0])


if __name__ == '__main__':
    unittest.main()
