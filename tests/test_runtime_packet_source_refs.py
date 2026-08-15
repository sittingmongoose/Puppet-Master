import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "reports/shared-runtime-integration-2026-08-13/PACKET_SOURCE_INDEX.json"


class RuntimePacketSourceRefsTest(unittest.TestCase):
    def test_durable_index_has_exact_corrected_packet_identity(self) -> None:
        value = json.loads(INDEX.read_text(encoding="utf-8"))
        self.assertEqual(value["manifest_declared_member_count"], 33)
        self.assertEqual(value["archive_file_member_count"], 34)
        self.assertEqual(len(value["members"]), 33)
        self.assertEqual(len({row["path"] for row in value["members"]}), 33)
        self.assertEqual(
            value["archive_sha256"],
            "8ec8184b055c0f3ddfc03c2848dde6f6e27c1abb067c2f08cdb5f4bde081053b",
        )

    def test_live_packet_references_resolve_without_local_aliases(self) -> None:
        proc = subprocess.run(
            [sys.executable, "scripts/pm-runtime-packet-source-refs.py", "validate"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        report = json.loads(proc.stdout)
        self.assertEqual(report["status"], "pass")
        self.assertTrue(report["live_reference_validation"]["all_references_resolve"])


if __name__ == "__main__":
    unittest.main()
