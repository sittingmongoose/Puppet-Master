#!/usr/bin/env python3
"""Synthetic exact-prompt/mechanics check; no inference, native Goal or case content."""
import datetime as dt, importlib.util, json, os, subprocess, tempfile, unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("a8_overlay", HERE / "prepare.py")
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)


class A8(unittest.TestCase):
    def test_exact_stage_only_additions_and_r0_clocks(self):
        with tempfile.TemporaryDirectory(prefix="er12-A8-synthetic-") as tmp:
            top = Path(tmp); root = top / "runtime"; cp = top / "config.json"
            (top / "brief.md").write_text("SYNTHETIC ONLY\n")
            (top / "plan.md").write_text("SYNTHETIC ONLY EXACT PLAN\n")
            c = {"run_id": "SYNTHETIC-A8-NOT-EXPERIMENT", "method": "A8-SCW-6-v1", "dispatch_owner": "root",
                 "runtime_root": str(root), "brief_path": str(top / "brief.md"), "plan_path": str(top / "plan.md"),
                 "whole_deadline_utc": (dt.datetime.now(dt.timezone.utc) + dt.timedelta(seconds=3500)).isoformat(),
                 "stage_budgets_s": {"investigator": 1800, "critic": 720, "reviser": 1080},
                 "provider": {"providerInstanceId": "AUTHORIZED_PROVIDER_INSTANCE", "model": "gpt-6-luna", "options": {"reasoningEffort": "max", "serviceTier": "priority"}}}
            cp.write_text(json.dumps(c))
            c = m.load_config(cp)
            for stage in ("investigator", "critic", "reviser"):
                if stage != "investigator":
                    previous = "investigator" if stage == "critic" else "critic"
                    m.b.record_response(c, previous, {"structuredContent": {"taskId": "SYNTHETIC-" + previous}})
                    m.b.record_status(c, previous, {"taskId": "SYNTHETIC-" + previous, "status": "completed", "hasPendingChildRuns": False})
                result = m.prepare(c, stage)
                p = root / "stages" / stage
                freeze = m.b.read_json(p / "freeze.json"); inputs = m.b.read_json(p / "input-map.json")
                expected = m.original_prompt(c, stage, inputs, freeze["stage_deadline_utc"], freeze["whole_deadline_utc"])
                delta = "" if stage == "investigator" else "\n" + m.DELTAS[stage][0].read_bytes().decode("utf-8")
                self.assertEqual((p / "assignment.md").read_text(), expected + delta)
                self.assertEqual(freeze["stage_budget_s"], {"investigator": 1800, "critic": 720, "reviser": 1080}[stage])
                self.assertEqual(freeze["whole_deadline_utc"], m.b.iso(c["_whole_deadline"]))
                self.assertIn("max", str(result["args"]["target"]))
                self.assertEqual(m.prepare(c, stage)["args"], result["args"])
                if stage != "investigator":
                    self.assertTrue(any(x["sha256"] == m.DELTAS[stage][1] for x in freeze["frozen_inputs"]))
                if stage == "investigator":
                    (p / "discovery.md").write_text("SYNTHETIC DISCOVERY\n" * 40)
                    (p / "source-map.json").write_text('{"S1":"synthetic://only"}')
                    reveal = subprocess.run(["python3", "-B", str(m.PINNED / "reveal.py"), "--config", str(cp)], capture_output=True, text=True, env=dict(os.environ, PYTHONDONTWRITEBYTECODE="1"))
                    self.assertEqual(reveal.returncode, 0, reveal.stderr)
                    self.assertEqual((p / "revealed-plan.md").read_bytes(), (top / "plan.md").read_bytes())
                    (p / "draft.md").write_text("SYNTHETIC FULL DRAFT\n")
                if stage == "critic":
                    (p / "critique.md").write_text("SYNTHETIC ONLY CRITIQUE\n")
                    (p / "source-map.json").write_text('{"S2":"synthetic://only"}')


if __name__ == "__main__":
    r = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(A8))
    (HERE / "evidence" / "mechanical-verification.json").write_text(json.dumps({
        "synthetic_only": True, "actual_case_or_inference": False, "tests_run": r.testsRun,
        "failures": len(r.failures), "errors": len(r.errors), "ok": r.wasSuccessful(),
        "checks": ["investigator prompt byte-for-byte unchanged", "critic/reviser exact additions only", "R0 deadlines/budgets unchanged", "delta hashes bound to retry freeze", "original exact one-shot reveal reused", "stable stage request id on retry"]}, indent=2) + "\n")
    raise SystemExit(0 if r.wasSuccessful() else 1)
