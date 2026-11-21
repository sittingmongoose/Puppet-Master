"""Real Markdown subject controls for the admission evidence writer (T265)."""

import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
ASSESSMENTS = ROOT / 'reports/event-authority-20261116/admission-merge-2'
SPEC = importlib.util.spec_from_file_location('admission_writer', ROOT / 'scripts/pm-ea-admission-writer.py')
WRITER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(WRITER)


def citations(folder, event, criterion):
    doc = json.loads((ASSESSMENTS / folder / (event + '.json')).read_text())
    return [item for item in doc['rows'][0]['cells'][criterion]['evidence'] if item['path'].endswith('.md')]


class MarkdownSubjectTests(unittest.TestCase):
    def assert_own_subject(self, item, event, criterion):
        result = WRITER.refresh_evidence(item, event_type=event, criterion=criterion)
        self.assertEqual(result['unit'], item['unit'])
        self.assertEqual(result['line_start'], item['line_start'])

    def assert_wrong_subject(self, item, event, criterion):
        with self.assertRaisesRegex(WRITER.Gap, r'Markdown.*subject'):
            WRITER.refresh_evidence(item, event_type=event, criterion=criterion)

    def test_wizard_custody_heading_names_its_own_event(self):
        cases = {
            'producer': 2, 'redaction_custody': 2, 'consumers_checkpoints': 2, 'compatibility_withdrawal': 1,
        }
        for criterion, count in cases.items():
            items = [item for item in citations('depth', 'wizard.opened', criterion)
                     if item['unit'] == 'heading:Wizard Opened Original Custody']
            self.assertEqual(len(items), count)
            for item in items:
                with self.subTest(criterion=criterion, quote=item['quote'][:50]):
                    self.assert_own_subject(item, 'wizard.opened', criterion)
                    self.assert_wrong_subject(item, 'wizard.deferred_payload.loaded', criterion)

    def test_ds15_oracle_labels_cannot_borrow_another_family_unit(self):
        criterion = 'positive_negative_oracles'
        sibling, *_ = citations('depth', 'browser.context_captured', criterion)
        families = ('browser.context_share_revoked', 'browser.context_shared', 'catalog.update.started',
                    'catalog.update.completed', 'catalog.remove.started', 'catalog.remove.completed',
                    'tool.custom_headless.skipped')
        for event in families:
            with self.subTest(event=event):
                selected, *_ = citations('depth', event, criterion)
                self.assert_own_subject(selected, event, criterion)
                self.assert_wrong_subject(sibling, event, criterion)

    def test_ds15_oracle_label_requires_family_specific_proof_in_its_owner(self):
        event = 'catalog.update.completed'
        criterion = 'positive_negative_oracles'
        item, *_ = citations('depth', event, criterion)
        text = WRITER.file_text(item['path'])
        lines = text.splitlines(keepends=True)
        line = item['line_start'] - 1
        self.assertIn(event, lines[line])
        lines[line] = lines[line].replace(event, 'catalog.update.started')
        file_text = WRITER.file_text

        def replaced_line(path):
            return ''.join(lines) if path == item['path'] else file_text(path)

        with patch.object(WRITER, 'file_text', side_effect=replaced_line):
            self.assert_wrong_subject(item, event, criterion)

    def test_memory_retention_binds_the_assignment_inside_each_shared_unit(self):
        criterion = 'retention'
        for action, unit in (('completed', 'SP-636'), ('started', 'SP-637')):
            prune = f'memory.prune_archive.{action}'
            sweep = f'memory.verification_sweep.{action}'
            prune_items = [item for item in citations('depth', prune, criterion) if item['unit'] == unit]
            sweep_items = [item for item in citations('depth', sweep, criterion) if item['unit'] == unit]
            for event, items, sibling in ((prune, prune_items, sweep), (sweep, sweep_items, prune)):
                self.assertTrue(items)
                for item in items:
                    with self.subTest(event=event, line=item['line_start']):
                        self.assert_own_subject(item, event, criterion)
                    with self.subTest(event=sibling, sibling_line=item['line_start']):
                        self.assert_wrong_subject(item, sibling, criterion)

            # The policy phrase occurs in both paragraphs. The located line
            # must still belong to the cited family.
            shared_quote = 'Its event history selects RP-OPERATIONAL-2555D@1.0.0'
            for event, item, sibling in ((prune, prune_items[0], sweep), (sweep, sweep_items[0], prune)):
                self.assertIn(shared_quote, item['quote'])
                excerpt = dict(item, quote=shared_quote)
                with self.subTest(event=event, shared_quote=True):
                    self.assert_own_subject(excerpt, event, criterion)
                    self.assert_wrong_subject(excerpt, sibling, criterion)

    def test_goal_revision_custody_rejects_other_family_owners(self):
        criterion = 'redaction_custody'
        for event in ('goal.blocked', 'goal.completed'):
            with self.subTest(event=event):
                wrong, = citations('revisions', event, criterion)
                self.assertEqual(wrong['unit'], 'SP-271')
                self.assert_wrong_subject(wrong, event, criterion)
        for event, sibling in (('goal_run.blocked', 'goal_run.stopped'), ('goal_run.stopped', 'goal_run.blocked')):
            with self.subTest(event=event):
                selected = citations('revisions', event, criterion)[1]
                self.assert_own_subject(selected, event, criterion)
                self.assert_wrong_subject(selected, sibling, criterion)

    def test_goal_shared_heading_binds_the_exact_oracle_table_row(self):
        criterion = 'positive_negative_oracles'
        stopped, = citations('revisions', 'goal_run.stopped', criterion)
        self.assert_own_subject(stopped, 'goal_run.stopped', criterion)
        self.assert_wrong_subject(stopped, 'goal_run.blocked', criterion)


if __name__ == '__main__':
    unittest.main()
