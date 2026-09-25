"""Production-intent and Touch consumers use the exact current Backup contracts."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'Plans/backup_restore_system_contracts.schema.json#/$defs/'
FOUR = {'cmd.backup.destination.update', 'cmd.backup.verify',
        'cmd.backup.test_restore', 'cmd.backup.file.compare'}


class BackupConsumerBindings(unittest.TestCase):
    def test_all_41_production_consumers_preserve_handlers_events_and_other_37(self):
        schema = json.loads((ROOT / 'Plans/backup_restore_system_contracts.schema.json').read_text())
        commands = set(schema['$defs']['backup_restore_command_id']['enum'])
        wiring = json.loads((ROOT / 'Plans/Wiring_Matrix.production.json').read_text())
        rows = [r for r in wiring['entries'].values() if r.get('ui_command_id') in commands]
        self.assertEqual(41, len(commands))
        self.assertEqual(41, len(rows))
        self.assertEqual(commands, {r['ui_command_id'] for r in rows})
        self.assertEqual(37, len(commands - FOUR))
        for row in rows:
            command = row['ui_command_id']
            with self.subTest(command=command):
                request, result = (('backup_action_request_v2', 'backup_action_result_v2')
                    if command in FOUR else ('backup_restore_command_request', 'backup_restore_command_result'))
                self.assertEqual(PREFIX + request, row['request_schema_ref'])
                self.assertEqual(PREFIX + result, row['result_schema_ref'])
                if command in FOUR:
                    self.assertIn(PREFIX + result, row['effect_contract']['receipt_or_event_refs'])
                stem = command.removeprefix('cmd.').replace('.', '_')
                if command.startswith('cmd.backup.recovery_key.'):
                    stem = stem.removeprefix('backup_')
                if command == 'cmd.restore.preview':
                    stem = 'preview_restore'
                self.assertEqual('handlers::backup_restore::' + stem, row['handler_location'])
                self.assertEqual([], row['expected_event_types'])
                self.assertIn('handler_unavailable', ' '.join(row['acceptance_checks']))

    def test_touch_backup_profile_routes_current_discriminated_unions(self):
        touch = json.loads((ROOT / 'Plans/touch_closure.json').read_text())
        profile = next(p for p in touch['profiles'] if p['profile_id'] == 'TCP-BACKUP')
        self.assertEqual(PREFIX + 'backup_current_command_request', profile['payload_schema_ref'])
        self.assertEqual(PREFIX + 'backup_current_command_result', profile['result_schema_ref'])
        self.assertEqual(PREFIX + 'backup_restore_command_error', profile['error_schema_ref'])
        self.assertIn('handler_unavailable', profile['handler_owner'])


if __name__ == '__main__':
    unittest.main()
