#!/usr/bin/env python3
"""Synthetic mechanical diagnostics only: no native/provider calls or case science."""
import datetime as dt, hashlib, json, os, subprocess, tempfile, time, unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
HELPER = HERE / "prepare.py"
ENV = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")


class Mechanics(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="er12-topology-synthetic-")
        self.top = Path(self.temp.name)
        self.root = self.top / "runtime"
        self.cp = self.top / "config.json"
        (self.top / "brief.md").write_text("SYNTHETIC INPUT ONLY\n" * 40)
        (self.top / "plan.md").write_bytes(b"SYNTHETIC EXACT PLAN\r\nclause-alpha\n")

    def tearDown(self):
        self.temp.cleanup()

    def setup(self, topology):
        self.c = {"run_id": "SYNTHETIC-NOT-EXPERIMENT", "runtime_root": str(self.root),
                  "topology": topology, "dispatch_owner": "root", "brief_path": str(self.top / "brief.md"),
                  "plan_path": str(self.top / "plan.md"), "whole_deadline_utc": (dt.datetime.now(dt.timezone.utc) + dt.timedelta(seconds=3500)).isoformat(),
                  "provider": {"providerInstanceId": "AUTHORIZED_PROVIDER_INSTANCE", "model": "gpt-6-luna", "options": {"reasoningEffort": "max", "serviceTier": "priority"}},
                  "phase_budgets_s": [1800, 1800], "stage_budgets_s": {"investigator": 1800, "critic": 720, "retained-final": 1080} if topology == "A2" else {"investigator": 1800, "critic-finalizer": 1800}}
        self.cp.write_text(json.dumps(self.c))
        self.run_helper("prepare")
        self.inv = self.root / "stages" / "investigator"
        self.dispatch("investigator")
        self.native = self.native_fixture("investigator")

    def run_helper(self, action, stage="investigator", raw=None, extra=(), fail=None):
        args = ["python3", "-B", str(HELPER), action, "--config", str(self.cp), "--stage", stage]
        if raw is not None: args += ["--json", json.dumps(raw)]
        r = subprocess.run(args + list(extra), text=True, capture_output=True, env=ENV)
        if fail:
            self.assertNotEqual(r.returncode, 0, r.stdout)
            self.assertIn(fail, r.stderr + r.stdout)
            return r
        self.assertEqual(r.returncode, 0, r.stderr)
        return json.loads(r.stdout)

    def native_fixture(self, stage):
        # Explicit fixture: never emitted as a native lifecycle receipt or experiment proof.
        f = json.loads((self.root / "stages" / stage / "freeze.json").read_text())
        return {"synthetic_fixture": True, "goal": {"threadId": "SYNTHETIC-NATIVE-" + stage,
                "createdAt": 123456, "objective": f["native_goal_objective"], "status": "active"}}

    def dispatch(self, stage):
        return self.run_helper("record", stage, {"structuredContent": {
            "taskId": "SYNTHETIC-TASK-" + stage, "childThreadId": "SYNTHETIC-THREAD-" + stage,
            "childRunId": "SYNTHETIC-RUN-" + stage, "status": "running"}})

    def status(self, stage, state):
        return self.run_helper("record-status", stage, {
            "taskId": "SYNTHETIC-TASK-" + stage, "childThreadId": "SYNTHETIC-THREAD-" + stage,
            "childRunId": "SYNTHETIC-RUN-" + stage, "status": state, "hasPendingChildRuns": False})

    def handoff(self):
        (self.inv / "discovery.md").write_text("SYNTHETIC DISCOVERY\n" * 40)
        (self.inv / "source-map.json").write_text('{"S1":"synthetic://only"}')
        r = subprocess.run(["python3", "-B", str(HERE.parent / "er11" / "reveal.py"), "--config", str(self.cp)], text=True, capture_output=True, env=ENV)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual((self.inv / "revealed-plan.md").read_bytes(), (self.top / "plan.md").read_bytes())
        (self.inv / "draft.md").write_text("SYNTHETIC COMPLETE DRAFT\n" * 50)
        (self.inv / "sources" / "index.json").write_text('{"S1":"synthetic://only"}')
        (self.inv / "sources" / "context.txt").write_text("SYNTHETIC FULL SOURCE CONTEXT")
        frozen = self.run_helper("freeze-investigator", raw=self.native)
        self.run_helper("confirm-frozen-active", raw=self.native)
        return frozen

    def critic_ready(self):
        self.status("investigator", "running")
        self.run_helper("prepare", "critic")
        self.dispatch("critic")
        p = self.root / "stages" / "critic"
        (p / "critique.md").write_text("SYNTHETIC CRITICISM C1\n")
        (p / "source-map.json").write_text('{"S2":"synthetic://critic"}')
        (p / "critique-dispositions.json").write_text('[{"id":"C1"}]')
        (p / "sources" / "index.json").write_text('{"S2":"synthetic://critic"}')
        self.status("critic", "completed")
        return p

    def deliver_fixture(self):
        (self.root / "control" / "notification-delivery.json").write_text(json.dumps({
            "synthetic_fixture": True, "raw_response": {"structuredContent": {"delivery": "steered",
                "runId": "SYNTHETIC-RUN-investigator", "threadId": "SYNTHETIC-THREAD-investigator"}}}))

    def test_a2_complete_freeze_same_goal_binding_and_seal(self):
        self.setup("A2")
        m = self.handoff()
        self.assertEqual(len(m["files"]), 8)
        frozen = self.root / "handoff" / "stages" / "investigator"
        self.assertEqual((frozen / "draft.md").read_bytes(), (self.inv / "draft.md").read_bytes())
        self.critic_ready()
        bound = self.run_helper("bind-critic")
        self.deliver_fixture()
        self.assertIn("ORIGINAL investigator Goal/run", bound["message"])
        npath = self.root / "control" / "critic-notification.json"
        nhash = hashlib.sha256(npath.read_bytes()).hexdigest()
        self.run_helper("author-intake", raw=self.native, extra=["--notification-sha256", nhash])
        p = self.inv / "final"
        (p / "final.md").write_text("SYNTHETIC FULL FINAL\n" * 50)
        (p / "source-map.json").write_text('{"S1":"synthetic://only"}')
        row = {"id": "C1", "classification": "unsupported", "draft_locator": "synthetic section", "evidence": "S1", "disposition": "reject", "rationale": "synthetic test", "final_locator": "synthetic final"}
        (p / "critique-dispositions.json").write_text(json.dumps([row]))
        (p / "sources" / "index.json").write_text('{"S1":"synthetic://only"}')
        final = self.run_helper("seal-final", raw=self.native)
        self.assertEqual(final["native_goal_identity"], m["native_goal_identity"])
        self.assertEqual(final["explicit_disposition_count"], 1)
        self.assertFalse(final["scope_fidelity_proven"])
        self.assertFalse(final["native_provenance_attested_by_helper"])

    def test_a2_terminal_author_and_fresh_goal_rejected(self):
        self.setup("A2"); self.handoff()
        self.run_helper("prepare", "retained-final", fail="invalid stage")
        self.status("investigator", "completed")
        self.run_helper("prepare", "critic", fail="original investigator must remain active")
        self.critic_ready(); self.run_helper("bind-critic")
        native = json.loads(json.dumps(self.native)); native["goal"]["createdAt"] += 1
        nhash = hashlib.sha256((self.root / "control" / "critic-notification.json").read_bytes()).hexdigest()
        self.run_helper("author-intake", raw=native, extra=["--notification-sha256", nhash], fail="original active Goal")
        self.run_helper("author-intake", raw=self.native, extra=["--notification-sha256", "0" * 64], fail="exact notification")

    def test_source_mutation_missing_draft_and_inactive_goal_rejected(self):
        self.setup("A2")
        native = json.loads(json.dumps(self.native)); native["goal"]["status"] = "complete"
        self.run_helper("freeze-investigator", raw=native, fail="active goal")
        self.handoff()
        p = self.root / "handoff" / "stages" / "investigator" / "sources" / "context.txt"
        p.chmod(0o644); p.write_text("MUTATED SYNTHETIC INPUT")
        self.status("investigator", "running")
        self.run_helper("prepare", "critic", fail="handoff input changed")

    def test_unsteered_delivery_rejected_before_author_read(self):
        self.setup("A2"); self.handoff(); self.critic_ready(); self.run_helper("bind-critic")
        p = self.root / "control" / "notification-delivery.json"
        p.write_text(json.dumps({"synthetic_fixture": True, "raw_response": {"structuredContent": {
            "delivery": "queued", "runId": "SYNTHETIC-OTHER-RUN", "threadId": "SYNTHETIC-THREAD-investigator"}}}))
        nhash = hashlib.sha256((self.root / "control" / "critic-notification.json").read_bytes()).hexdigest()
        self.run_helper("author-intake", raw=self.native, extra=["--notification-sha256", nhash], fail="original active run")

    def test_a7_full_input_gate_checks_final_dispositions(self):
        self.setup("A7"); self.handoff()
        self.status("investigator", "running")
        self.run_helper("prepare", "critic-finalizer", fail="terminal and quiet")
        self.status("investigator", "completed")
        self.run_helper("prepare", "critic-finalizer")
        p = self.root / "stages" / "critic-finalizer"
        assignment = (p / "assignment.md").read_text()
        self.assertNotIn("do not write or repair a final", assignment)
        self.assertIn("one self-contained complete `final.md`", assignment)
        intake = self.run_helper("check-input", "critic-finalizer")
        self.assertTrue(intake["complete_bytes_verified"])
        self.assertFalse(intake["comprehension_proven"])
        self.run_helper("check-input", "critic-finalizer")
        native = self.native_fixture("critic-finalizer")
        (p / "critique.md").write_text("SYNTHETIC no criticisms after synthetic checks")
        (p / "checks.json").write_text('{"operations":[]}')
        (p / "critique-index.json").write_text('[]')
        self.run_helper("freeze-review", "critic-finalizer", fail="substantive independent check")
        (p / "checks.json").write_text(json.dumps({"operations": [{"source_id": "S1", "locator": "synthetic context", "observed_operation": "synthetic test only", "accessed_at_utc": "2000-01-01T00:00:00Z", "result": "synthetic result"}]}))
        self.run_helper("freeze-review", "critic-finalizer")
        (p / "final.md").write_text("SYNTHETIC SELF-CONTAINED FINAL\n" * 40)
        (p / "source-map.json").write_text('{"S1":"synthetic://only"}')
        (p / "critique-dispositions.json").write_text('[]')
        (p / "sources" / "index.json").write_text('{"S1":"synthetic://only"}')
        final = self.run_helper("seal-final", "critic-finalizer", native)
        self.assertEqual(final["topology"], "A7")

    def test_wait_is_bounded_blocks_without_poll_and_usage_unknown(self):
        self.setup("A2"); self.handoff()
        start = time.monotonic()
        out = self.run_helper("wait", extra=["--timeout-s", "1"])
        self.assertGreaterEqual(time.monotonic() - start, .9)
        self.assertFalse(out["notification_ready"])
        self.assertIsNone(out["provider_usage"])
        self.run_helper("wait", extra=["--timeout-s", "61"], fail="bounded to 1..60")

    def test_root_exact_notification_wakes_blocked_wait_and_binding_retry(self):
        self.setup("A2"); self.handoff(); self.critic_ready()
        args = ["python3", "-B", str(HELPER), "wait", "--config", str(self.cp), "--timeout-s", "5"]
        p = subprocess.Popen(args, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=ENV)
        try:
            time.sleep(.2)
            bound = self.run_helper("bind-critic")
            self.deliver_fixture()
            stdout, stderr = p.communicate(timeout=3)
            self.assertEqual(p.returncode, 0, stderr)
            result = json.loads(stdout)
            self.assertTrue(result["notification_ready"])
            self.assertEqual(result["root_precise_notification"]["message"], bound["message"])
            self.assertEqual(self.run_helper("bind-critic")["message"], bound["message"])
        finally:
            if p.poll() is None: p.kill(); p.communicate()

    def test_root_bootstrap_notify_mocked_transport_original_run(self):
        self.setup("A2"); self.handoff(); self.critic_ready()
        code = r'''import fs from 'node:fs'; import {spawnSync} from 'node:child_process';
const config=process.argv[2], file=process.argv[3];
let code=fs.readFileSync(file,'utf8').replace('"/absolute/caller/path/er12-topology.json"',JSON.stringify(config)).replace('const STAGE = "investigator"','const STAGE = "notify"');
const output=[]; let sent=null;
const tools={
 exec_command: async ({cmd})=>{const r=spawnSync('bash',['-c',cmd],{encoding:'utf8'});return {exit_code:r.status,output:r.stdout+r.stderr};},
 mcp__t3_code__task_status: async ({taskId})=>({structuredContent:{taskId,childThreadId:'SYNTHETIC-THREAD-investigator',childRunId:'SYNTHETIC-RUN-investigator',status:taskId.endsWith('investigator')?'running':'completed',hasPendingChildRuns:false}}),
 mcp__t3_code__t3_thread_send: async (args)=>{sent=args;return {structuredContent:{synthetic_fixture:true,delivery:'steered',runId:'SYNTHETIC-RUN-investigator',threadId:args.threadId}};}
};
try {await new Function('tools','text','exit',`return (async()=>{${code}})()`)(tools,x=>output.push(x),()=>{throw new Error('SYNTHETIC_EXIT')});}
catch(e){if(e.message!=='SYNTHETIC_EXIT')throw e;}
console.log(JSON.stringify({synthetic_only:true,sent,output}));'''
        script = self.top / "bootstrap-synthetic.mjs"; script.write_text(code)
        r = subprocess.run(["node", str(script), str(self.cp), str(HERE / "bootstrap.js")], text=True, capture_output=True, env=ENV)
        self.assertEqual(r.returncode, 0, r.stderr)
        out = json.loads(r.stdout)
        self.assertEqual(out["sent"]["mode"], "steer")
        self.assertEqual(out["sent"]["threadId"], "SYNTHETIC-THREAD-investigator")
        self.assertEqual(out["output"][0]["stage"], "notify")
        self.assertTrue((self.root / "control" / "notification-delivery.json").is_file())

    def test_retry_preserves_id_and_deadline_no_reveal_substitution(self):
        self.setup("A2")
        first = json.loads((self.inv / "request.json").read_text())
        deadline = json.loads((self.inv / "freeze.json").read_text())["stage_deadline_utc"]
        retry = self.run_helper("prepare")
        self.assertTrue(retry["alreadyDispatched"])
        self.assertEqual(first["args"], retry["args"])
        self.assertEqual(deadline, json.loads((self.inv / "freeze.json").read_text())["stage_deadline_utc"])
        self.handoff()
        r = subprocess.run(["python3", "-B", str(HERE.parent / "er11" / "reveal.py"), "--config", str(self.cp)], text=True, capture_output=True, env=ENV)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("only once", r.stderr)


if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Mechanics))
    report = {"version": "topology-v1", "synthetic_only": True, "actual_native_goal_or_steering_proof": False,
              "tests_run": result.testsRun, "failures": len(result.failures), "errors": len(result.errors),
              "ok": result.wasSuccessful()}
    (HERE / "evidence" / "mechanical-verification.json").write_text(json.dumps(report, indent=2) + "\n")
    raise SystemExit(0 if result.wasSuccessful() else 1)
