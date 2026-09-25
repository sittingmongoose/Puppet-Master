"""Production-intent and Touch consumers use the exact current Backup contracts."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'Plans/backup_restore_system_contracts.schema.json#/$defs/'
FOUR = {'cmd.backup.destination.update', 'cmd.backup.verify',
        'cmd.backup.test_restore', 'cmd.backup.file.compare'}
READS = {'cmd.backup.destination.discover', 'cmd.backup.browse'}
READ_PREFIX = 'Plans/backup_bounded_read_contracts.schema.json#/$defs/'
LIFECYCLE = {'cmd.backup.destination.test','cmd.backup.destination.remove'}
LIFECYCLE_PREFIX = 'Plans/backup_destination_lifecycle_contracts.schema.json#/$defs/'
SELECTED_DELETE = {'cmd.backup.delete'}
DELETE_PREFIX = 'Plans/backup_selected_delete_contracts.schema.json#/$defs/'


class BackupConsumerBindings(unittest.TestCase):
    def test_all_41_production_consumers_preserve_handlers_events_and_other_32(self):
        schema = json.loads((ROOT / 'Plans/backup_restore_system_contracts.schema.json').read_text())
        commands = set(schema['$defs']['backup_restore_command_id']['enum'])
        wiring = json.loads((ROOT / 'Plans/Wiring_Matrix.production.json').read_text())
        rows = [r for r in wiring['entries'].values() if r.get('ui_command_id') in commands]
        self.assertEqual(41, len(commands))
        self.assertEqual(41, len(rows))
        self.assertEqual(commands, {r['ui_command_id'] for r in rows})
        self.assertEqual(32, len(commands - FOUR - READS - LIFECYCLE - SELECTED_DELETE))
        for row in rows:
            command = row['ui_command_id']
            with self.subTest(command=command):
                request, result = (('backup_action_request_v2', 'backup_action_result_v2')
                    if command in FOUR else ('backup_restore_command_request', 'backup_restore_command_result'))
                self.assertEqual(DELETE_PREFIX+'request' if command in SELECTED_DELETE else LIFECYCLE_PREFIX+'request' if command in LIFECYCLE else READ_PREFIX+'request' if command in READS else PREFIX+request, row['request_schema_ref'])
                self.assertEqual(DELETE_PREFIX+'result' if command in SELECTED_DELETE else LIFECYCLE_PREFIX+'result' if command in LIFECYCLE else READ_PREFIX+'result' if command in READS else PREFIX+result, row['result_schema_ref'])
                if command in READS:
                    self.assertEqual([READ_PREFIX+'result', READ_PREFIX+'read_receipt'], row['effect_contract']['receipt_or_event_refs'])
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

    def test_current_read_union_and_historical_fallback_remain_distinct(self):
        import importlib.util
        import sys
        sys.path.insert(0, str(ROOT/'scripts'))
        spec=importlib.util.spec_from_file_location('backup_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py')
        gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)
        schema=json.loads((ROOT/'Plans/backup_restore_system_contracts.schema.json').read_text())
        registry=gate.offline_schema_registry()
        reads=json.loads((ROOT/'Plans/backup_bounded_read_fixtures.json').read_text())
        old=json.loads((ROOT/'Plans/backup_restore_system_contract_fixtures.json').read_text())
        for kind in ('request','result'):
            current=gate.validator_for(schema,{'$ref':'#/$defs/backup_current_command_'+kind},registry)
            historical=gate.validator_for(schema,{'$ref':'#/$defs/backup_restore_command_'+kind},registry)
            found=set()
            candidates=list(old['valid'])
            if kind=='result':
                # The old pack has generic result examples but no read-result examples.
                # These structural probes establish decoder compatibility, not native reads.
                template=next(e['value'] for e in old['valid'] if e.get('definition')=='backup_restore_command_result')
                candidates += [{'definition':'backup_restore_command_result','value':dict(template,command_id=cmd,recovery_state='not_applicable')} for cmd in READS]
            for entry in candidates:
                value=entry['value']
                if entry.get('definition')=='backup_restore_command_'+kind and value.get('command_id') in READS:
                    found.add(value['command_id'])
                    self.assertEqual([],list(historical.iter_errors(value)))
                    self.assertTrue(list(current.iter_errors(value)))
            self.assertEqual(READS,found)
            for entry in reads['valid']:
                if entry['definition']=='fixture_case':
                    value=entry['value'][kind]
                    self.assertEqual([],list(current.iter_errors(value)))
                    self.assertTrue(list(historical.iter_errors(value)))


if __name__ == '__main__':
    unittest.main()
