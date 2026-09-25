"""Source-input preservation in owner prose, not executable Backup proof."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


def unit(identifier):
    text = (ROOT / "Plans/Backup_Restore_System.md").read_text()
    return " ".join(text.split("### " + identifier + " -", 1)[1].split("\n### ", 1)[0].split())


class BackupOperandProseTests(unittest.TestCase):
    def test_destination_update_requires_actual_patch_without_implicit_effects(self):
        text = unit("BRS-004")
        for phrase in ("typed nonsecret patch", "expected current generation",
                       "preserves destination identity and unedited configuration fields",
                       "no implicit credential issuance, repository reassignment, backend deletion"):
            self.assertIn(phrase, text)

    def test_destination_edit_cannot_reuse_inapplicable_ready_or_test_proof(self):
        text = unit("BRS-004")
        for phrase in ("actual resulting effective configuration", "authentic test scope remains applicable",
                       "not require a new test for a label-only edit", "no fixed generation increment"):
            self.assertIn(phrase, text)

    def test_verify_has_explicit_snapshot_set_and_requested_level(self):
        text = unit("BRS-015")
        for phrase in ("explicit nonempty set of selected immutable snapshots",
                       "structural, sampled_data_read and full_data_read",
                       "without dropping failed or missing members"):
            self.assertIn(phrase, text)

    def test_drill_does_not_replace_current_native_and_original_custody_requirements(self):
        text = unit("BRS-015")
        for phrase in ("explicitly selected isolated", "typed requested drill coverage",
                       "BRS-021's mandatory native rebuild/retained-operation proof",
                       "BRS-024 through BRS-029", "BRS-022's separately authorized data completion",
                       "cannot activate the live Project or execute untrusted restored hooks"):
            self.assertIn(phrase, text)

    def test_compare_requires_second_operand_and_its_actual_owner(self):
        text = unit("BRS-014")
        for phrase in ("explicit target_revision", "Backup treats that revision as opaque",
                       "existing File or Source Control/native revision owner",
                       "preserve both resolved operands"):
            self.assertIn(phrase, text)

    def test_old_readability_cannot_admit_missing_current_operands(self):
        text = unit("BRS-008")
        for phrase in ("Historical requests lacking these operands remain readable",
                       "comparison revision, or admit such a historical request as a current effect",
                       "exact 41 command IDs remain unchanged"):
            self.assertIn(phrase, text)


if __name__ == "__main__":
    unittest.main()
