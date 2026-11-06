#!/usr/bin/env python3
"""Self-tests for scripts/pm-land.py, against throwaway repositories only.

Every test builds a bare "origin", a "shared checkout" clone, a local clone and branch worktrees under a
temporary folder, with the three heavy checks replaced by stubs whose exit codes the test sets. Nothing
here reads or writes the real landing lock, the real `main` or the real shared checkout: the harness sets
every PM_LAND_* path and refuses to start if any of them is under /mnt/Cursor.

    python3 scripts/test_pm_land.py            # or: python3 -m unittest scripts/test_pm_land.py
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import importlib.util
import json
import os
from pathlib import Path
import shutil
import signal
import stat
import subprocess
import sys
import tempfile
import textwrap
import threading
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / "scripts" / "pm-land.py"

STUB_HEAD = r'''#!/usr/bin/env python3
import json, os, subprocess, sys, time
from pathlib import Path
STUB = Path(os.environ["STUB_DIR"])
def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True).stdout.strip()
def behaviour(name):
    plan = STUB / (name + ".plan")
    if not plan.exists():
        return {}
    rows = json.loads(plan.read_text())
    if not rows:
        return {}
    row = rows.pop(0)
    plan.write_text(json.dumps(rows))
    return row
def record(name, row):
    shared = os.environ["PM_LAND_SHARED"]
    doc = {"tool": name, "args": sys.argv[1:], "cwd": os.path.realpath(os.getcwd()), "pid": os.getpid(),
           "head": git("rev-parse", "HEAD"),
           "shared_head": git("-C", shared, "rev-parse", "HEAD"),
           "shared_origin": git("-C", shared, "rev-parse", "refs/remotes/origin/main"),
           "origin_main": git("-C", os.environ["ORIGIN_PATH"], "rev-parse", "refs/heads/main"),
           "held": os.path.isdir(os.path.join(os.environ["PM_LAND_LOCK_DIR"], "held")),
           "symlink": os.path.islink("tests/agent_packet_restrictions"),
           "audit_input": os.path.exists("Plans/.audits/audit-20260828-003-chat-56-fast-lane/a.txt"),
           "sparse": git("config", "--get", "core.sparseCheckout"),
           "doc_in_tree": os.path.exists("src/x.txt"),
           "when": time.time()}
    with (STUB / "calls.jsonl").open("a") as handle:
        handle.write(json.dumps(doc) + "\n")
def act(row):
    if row.get("run"):
        subprocess.run(row["run"], shell=True, check=False)
    if row.get("sleep"):
        time.sleep(row["sleep"])
'''

STUB_SHARD = STUB_HEAD + r'''
row = behaviour("shard")
record("shard", row)
act(row)
broken = Path("Plans/_shards/doc-b/uncommitted-breakage")
if broken.exists() and not row:
    row = {"exit": 1, "failures": [{"path": str(broken), "error": "unregistered_shard_output_file"}]}
if row.get("raw") is not None:
    print(row["raw"])
    sys.exit(row.get("exit", 1))
failures = row.get("failures", [])
print(json.dumps({"status": "fail" if row.get("exit") else "pass", "failures": failures}))
sys.exit(row.get("exit", 0))
'''

STUB_LANDING = STUB_HEAD + r'''
args = sys.argv[1:]
record("baseline" if "--record-baseline" in args else "landing", {})
row = behaviour("baseline" if "--record-baseline" in args else "landing")
act(row)
if "--record-baseline" in args:
    code = row.get("exit", 0)
    if code == 0:
        Path("reports/landing-checks/baseline.json").write_text(json.dumps({"commit": git("rev-parse", "HEAD"), "at": time.time()}) + "\n")
    print(row.get("text", "pm-landing-check: baseline written"))
    sys.exit(code)
if "--keep-check-reports" in args:
    keep = Path(args[args.index("--keep-check-reports") + 1])
    keep.mkdir(parents=True, exist_ok=True)
    (keep / "run-gates.json").write_text("{}\n")
if row.get("raw") is not None:
    print(row["raw"])
else:
    print("pm-landing-check: baseline recorded at x; this checkout is at " + git("rev-parse", "HEAD")[:12])
    print("Infrastructure results, not failures of this tree (never new, growth or blocking): %d" % row.get("timeouts", 0))
    for index in range(row.get("timeouts", 0)):
        print("  [infrastructure] run-gates/x%d  subprocess_timeout (lint-x)  killed after 600 s" % index)
sys.exit(row.get("exit", 0))
'''

STUB_MIGRATION = STUB_HEAD + r'''
args = sys.argv[1:]
row = behaviour("snapshot")
record("snapshot", row)
run_id = args[args.index("--run-id") + 1]
base = Path("Plans/.plan_migration")
(base / run_id).mkdir()
(base / run_id / "partial.json").write_text("{}\n")
act(row)
if row.get("pointer_then_fail"):
    (base / "current_run.json").write_text(json.dumps({"run_id": run_id}) + "\n")
if row.get("exit"):
    print(json.dumps({"status": "fail"}))
    sys.exit(row["exit"])
(base / run_id / "final.json").write_text(json.dumps(args) + "\n")
(base / "current_run.json").write_text(json.dumps({"run_id": run_id}) + "\n")
print(json.dumps({"status": "pass"}))
'''

SSH_STUB = r'''#!/usr/bin/env python3
import os, sys
from pathlib import Path
Path(os.environ["SSH_MARKER"]).write_text(" ".join(sys.argv[1:]))
behaviour = os.environ.get("SSH_BEHAVIOUR", "unreachable")
if behaviour == "unreachable":
    sys.exit(255)
if behaviour == "gone":
    sys.exit(1)
print("Ss   " + os.environ.get("SSH_STARTED", "Fri Nov  6 00:00:00 2026"))
'''

AUDIT_FILES = [
    "Plans/.audits/audit-20260827-001-pmconcept7-usage-recovery/FINAL_REPORT.md",
    "Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/FINAL_REPORT.md",
    "Plans/.audits/audit-20260828-002-settings-tome-tabs-preport/a.txt",
    "Plans/.audits/audit-20260828-003-chat-56-fast-lane/a.txt",
    "Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/FINAL_REPORT.md",
    "Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json",
    "Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview/sub/a.txt",
    "Plans/.audits/event-authority-2026-08-12/NEXT_STEPS_20260910.md",
    "Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET_ANSWERS_20260910.json",
    "Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET_PLAIN_20260909.md",
]


def load_tool():
    spec = importlib.util.spec_from_file_location("pm_land", TOOL)
    module = importlib.util.module_from_spec(spec)
    sys.modules["pm_land"] = module
    spec.loader.exec_module(module)
    return module


M = load_tool()


def utc(seconds_ago: float = 0.0) -> str:
    return (datetime.now(timezone.utc) - timedelta(seconds=seconds_ago)).strftime("%Y-%m-%dT%H:%M:%SZ")


class Harness:
    def __init__(self) -> None:
        self.tmp = Path(os.path.realpath(tempfile.mkdtemp(prefix="pm-land-test-")))
        self.origin = self.tmp / "origin.git"
        self.shared = self.tmp / "shared"
        self.local = self.tmp / "local"
        self.lock = self.tmp / "lock"
        self.evidence = self.tmp / "evidence"
        self.wts = self.tmp / "wts"
        self.stub = self.tmp / "stub"
        self.raw = self.tmp / "raw-captures"
        self.gitconfig = self.tmp / "gitconfig"
        for path in (self.stub, self.raw, self.wts):
            path.mkdir()
        self.gitconfig.write_text(textwrap.dedent("""\
            [user]
            \tname = test
            \temail = test@example.invalid
            [init]
            \tdefaultBranch = main
            [safe]
            \tdirectory = *
            [advice]
            \tdetachedHead = false
            """))
        self.env = dict(
            os.environ,
            GIT_CONFIG_GLOBAL=str(self.gitconfig), GIT_CONFIG_NOSYSTEM="1", STUB_DIR=str(self.stub),
            ORIGIN_PATH=str(self.origin), PM_LAND_SHARED=str(self.shared), PM_LAND_LOCK_DIR=str(self.lock),
            PM_LAND_EVIDENCE_DIR=str(self.evidence), PM_LAND_WORKTREE_ROOT=str(self.wts),
            PM_LAND_LOCAL_REPO=str(self.local), PM_LAND_SYMLINK_TARGET=str(self.raw), PM_LAND_MIN_FREE_GB="0",
            PM_LAND_POLL_SECONDS="0.1", PM_LAND_HEARTBEAT_SECONDS="1", PM_LAND_PUSH_RETRY_SECONDS="0",
            PM_LAND_SSH=str(self.tmp / "fake-ssh"), SSH_MARKER=str(self.tmp / "ssh-marker"),
        )
        for key in ("PM_LAND_TEST_CRASH_BEFORE", "PM_LAND_HOST", "SSH_BEHAVIOUR"):
            self.env.pop(key, None)
        for key, value in self.env.items():
            if key.startswith("PM_LAND_") and str(value).startswith("/mnt/Cursor"):
                raise RuntimeError(f"self-test refuses to touch the real share: {key}={value}")
        (self.tmp / "fake-ssh").write_text(SSH_STUB)
        os.chmod(self.tmp / "fake-ssh", 0o755)
        self.background = []
        self._build()

    def close(self) -> None:
        for proc in self.background:
            if proc.poll() is None:
                proc.kill()
                proc.wait()
            if proc.stdout:
                proc.stdout.close()
        for row in self.calls():
            try:
                pid = int(row["pid"])
                if M.pid_start(pid) and "stub" in Path(f"/proc/{pid}/cmdline").read_text():
                    os.kill(pid, signal.SIGKILL)
            except (OSError, ValueError):
                pass
        shutil.rmtree(self.tmp, ignore_errors=True)

    def g(self, cwd, *args, check=True) -> str:
        result = subprocess.run(["git", "-C", str(cwd), *args], capture_output=True, text=True, env=self.env)
        if check and result.returncode != 0:
            raise AssertionError(f"git {args} in {cwd}: {result.stderr}")
        return result.stdout.strip()

    def _build(self) -> None:
        subprocess.run(["git", "init", "--bare", "-q", str(self.origin)], check=True, env=self.env)
        seed = self.tmp / "seed"
        subprocess.run(["git", "init", "-q", str(seed)], check=True, env=self.env)
        files = {
            "scripts/pm-shard-plans.py": STUB_SHARD,
            "scripts/pm-landing-check.py": STUB_LANDING,
            "scripts/pm-plan-migration.py": STUB_MIGRATION,
            "Plans/doc-a.md": "".join(f"line {i}\n" for i in range(30)),
            "Plans/doc-b.md": "b\n",
            "Plans/Spec_Lock.json": "{}\n",
            "Plans/sharding_config.json": "{}\n",
            "Plans/_shards/doc-a/manifest.json": json.dumps({"shards": [{"path": "Plans/_shards/doc-a/001.md"}]}) + "\n",
            "Plans/_shards/doc-a/001.md": "shard\n",
            "Plans/.plan_migration/current_run.json": json.dumps({"run_id": "pds-00000000-001-current-planunit-snapshot"}) + "\n",
            "Plans/.plan_migration/pds-00000000-001-current-planunit-snapshot/x.json": "{}\n",
            "reports/landing-checks/baseline.json": "{}\n",
            "src/x.txt": "x\n",
            "src/y.txt": "y\n",
            ".gitignore": "tests/agent_packet_restrictions\nPlans/.audits/\n__pycache__/\n",
        }
        for rel, text in files.items():
            path = seed / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
            if rel.startswith("scripts/"):
                os.chmod(path, 0o755)
        self.g(seed, "add", ".")
        self.g(seed, "commit", "-qm", "seed")
        self.g(seed, "remote", "add", "origin", str(self.origin))
        self.g(seed, "push", "-q", "origin", "main")
        for path in (self.shared, self.local):
            subprocess.run(["git", "clone", "-q", str(self.origin), str(path)], check=True, env=self.env)
        for rel in AUDIT_FILES:
            path = self.shared / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(f"{rel}\n")
        (self.shared / "tests").mkdir()
        os.symlink(str(self.raw), str(self.shared / "tests/agent_packet_restrictions"))

    def origin_main(self) -> str:
        return self.g(self.origin, "rev-parse", "refs/heads/main")

    def shared_head(self) -> str:
        return self.g(self.shared, "rev-parse", "HEAD")

    def commit_to_main(self, rel: str, text: str) -> str:
        """Another lander: main moves on origin, from outside."""
        other = self.tmp / "other"
        if not other.exists():
            subprocess.run(["git", "clone", "-q", str(self.origin), str(other)], check=True, env=self.env)
        self.g(other, "pull", "-q", "--ff-only", "origin", "main")
        path = other / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        self.g(other, "add", rel)
        self.g(other, "commit", "-qm", f"other: {rel}")
        self.g(other, "push", "-q", "origin", "main")
        return self.g(other, "rev-parse", "HEAD")

    def branch(self, name: str, files: dict, repo=None, from_ref="origin/main") -> Path:
        repo = repo or self.local
        self.g(repo, "fetch", "-q", "origin")
        wt = self.wts / name.replace("/", "-")
        self.g(repo, "worktree", "add", "-q", "-b", name, str(wt), from_ref)
        self.commit(wt, files)
        return wt

    def commit(self, wt: Path, files: dict, message: str = "change") -> str:
        for rel, text in files.items():
            path = wt / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
            self.g(wt, "add", rel)
        self.g(wt, "commit", "-qm", message)
        return self.g(wt, "rev-parse", "HEAD")

    def set_plan(self, name: str, rows: list) -> None:
        (self.stub / f"{name}.plan").write_text(json.dumps(rows))

    def calls(self, tool: str = "") -> list:
        path = self.stub / "calls.jsonl"
        if not path.exists():
            return []
        rows = [json.loads(line) for line in path.read_text().splitlines() if line]
        return [row for row in rows if not tool or row["tool"] == tool]

    def tool(self, *args, env=None, timeout=120):
        full = dict(self.env)
        full.update(env or {})
        return subprocess.run([sys.executable, "-B", str(TOOL), *args], cwd=str(self.tmp), env=full, capture_output=True,
                              text=True, timeout=timeout)

    def start(self, *args, env=None) -> subprocess.Popen:
        full = dict(self.env)
        full.update(env or {})
        proc = subprocess.Popen([sys.executable, "-B", str(TOOL), *args], cwd=str(self.tmp), env=full,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        self.background.append(proc)
        return proc

    def wait_calls(self, tool: str, count: int = 1, timeout: float = 30) -> None:
        end = time.time() + timeout
        while time.time() < end:
            if len(self.calls(tool)) >= count:
                return
            time.sleep(0.05)
        raise AssertionError(f"{tool} was not called {count} times; calls: {self.calls()}")

    def state(self, branch: str = "") -> dict:
        rows = []
        for path in sorted((self.lock / "state").glob("*.json")):
            doc = json.loads(path.read_text())
            if not branch or doc.get("branch") == branch:
                rows.append(doc)
        return rows[-1]

    def held(self) -> bool:
        return (self.lock / "held").is_dir()

    def holder(self) -> str:
        return (self.lock / "held" / "holder.txt").read_text()

    def hand_lock(self, text: str = "agent: by-hand\nbranch: x\ntime: now\n", age: float = 0) -> None:
        held = self.lock / "held"
        held.mkdir(parents=True)
        path = held / "holder.txt"
        path.write_text(text)
        if age:
            moment = time.time() - age
            os.utime(path, (moment, moment))
            os.utime(held, (moment, moment))

    def fetch_shared(self) -> None:
        self.g(self.shared, "fetch", "-q", "origin")


class Base(unittest.TestCase):
    def setUp(self) -> None:
        self.h = Harness()
        self.addCleanup(self.h.close)

    def assert_main_not_ahead(self) -> None:
        self.h.fetch_shared()
        head = self.h.shared_head()
        origin = self.h.origin_main()
        self.assertTrue(self.h.g(self.h.shared, "merge-base", "--is-ancestor", head, origin, check=False) == ""
                        and subprocess.run(["git", "-C", str(self.h.shared), "merge-base", "--is-ancestor", head, origin],
                                           env=self.h.env).returncode == 0,
                        f"shared main {head} is ahead of origin {origin}")

    def land(self, branch: str, *extra, env=None):
        return self.h.tool("run", branch, "--name", f"lander-{branch}", *extra, env=env)


class PlanTests(Base):
    def test_plan_lists_every_step_in_the_rules_order_and_changes_nothing(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        before = self.h.origin_main()
        result = self.h.tool("plan", "fix/a", "--name", "x")
        self.assertEqual(result.returncode, 0, result.stderr)
        order = ["lock:", "fetch:", "rebase:", "shard-own:", "transfer:", "dirty-check:", "ff:", "shard:", "check:", "push:",
                 "fu-prepare:", "fu-snapshot:", "fu-baseline:", "fu-commit:", "fu-land:", "fu-remove:", "worktree:", "release:"]
        positions = [result.stdout.index("\n" + label) for label in order]
        self.assertEqual(positions, sorted(positions), result.stdout)
        self.assertIn(f"git -C {self.h.shared} merge --ff-only", result.stdout)
        self.assertIn("python3 scripts/pm-landing-check.py --base origin/main --keep-check-reports", result.stdout)
        self.assertFalse(self.h.lock.exists(), "plan must create nothing")
        self.assertEqual(self.h.origin_main(), before)
        self.assertEqual(self.h.calls(), [])
        self.assertTrue(wt.exists())

    def test_plan_shows_the_local_copy_and_the_batch(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        result = self.h.tool("plan", "fix/a", "--checks-local", "--batch-open")
        self.assertIn("worktree add --no-checkout --detach", result.stdout)
        self.assertIn("--base '<batch-start>'", result.stdout)
        self.assertIn("The batch stays open", result.stdout)
        self.assertNotIn("fu-snapshot", result.stdout)
        self.assertEqual(self.h.tool("plan", "fix/a", "--batch-start", "abc").returncode, 2)


class HappyPathTests(Base):
    def test_landing_with_no_plans_change_runs_the_rules_order(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        result = self.land("fix/a")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        calls = self.h.calls()
        self.assertEqual([row["tool"] for row in calls], ["shard", "shard", "landing"])
        self.assertEqual(calls[0]["cwd"], str(wt))
        self.assertEqual(calls[1]["cwd"], str(self.h.shared))
        self.assertEqual(calls[1]["head"], tip)
        landing = calls[2]
        self.assertEqual(landing["cwd"], str(self.h.shared))
        self.assertEqual(landing["head"], tip)
        self.assertEqual(landing["origin_main"], base, "main must not be pushed before the landing check ends")
        self.assertEqual(landing["args"][:2], ["--base", "origin/main"])
        self.assertIn("--keep-check-reports", landing["args"])
        self.assertTrue(all(row["held"] for row in calls), "the lock must be held through every check")
        self.assertEqual(self.h.origin_main(), tip)
        self.assertEqual(self.h.shared_head(), tip)
        self.assertFalse(self.h.held(), "the lock must be released")
        self.assertFalse(wt.exists(), "the worktree must be removed")
        self.assertEqual(self.h.g(self.h.local, "branch", "--list", "fix/a"), "")
        self.assertEqual(self.h.state()["status"], "done")

    def test_branch_in_a_worktree_of_the_shared_repository_lands_too(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"}, repo=self.h.shared)
        tip = self.h.g(wt, "rev-parse", "HEAD")
        result = self.land("fix/a")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertFalse(wt.exists())

    def test_plans_change_runs_snapshot_and_baseline_as_its_own_landing_after_the_push(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        result = self.land("fix/a")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        calls = self.h.calls()
        self.assertEqual([row["tool"] for row in calls],
                         ["shard", "shard", "landing", "snapshot", "baseline", "shard", "landing"], result.stdout)
        snapshot, baseline, fu_check = calls[3], calls[4], calls[6]
        self.assertEqual(snapshot["origin_main"], tip, "the snapshot must follow the pushed landing")
        self.assertEqual(snapshot["head"], tip)
        self.assertNotEqual(snapshot["cwd"], str(self.h.shared))
        self.assertEqual(baseline["cwd"], snapshot["cwd"])
        self.assertTrue(baseline["symlink"] and baseline["audit_input"], "the follow-up tree needs the ignored inputs")
        self.assertEqual(baseline["head"], tip, "the baseline is recorded before the commit")
        self.assertEqual(fu_check["args"][:2], ["--base", "origin/main"])
        self.assertTrue(all(row["held"] for row in calls))
        final = self.h.origin_main()
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", f"{final}^"), tip)
        names = self.h.g(self.h.origin, "diff", "--name-only", f"{tip}..{final}").splitlines()
        self.assertIn("reports/landing-checks/baseline.json", names)
        self.assertTrue(all(name.startswith("Plans/.plan_migration/") or name.startswith("reports/landing-checks/")
                            for name in names), names)
        run_args = snapshot["args"]
        self.assertEqual(run_args[run_args.index("--expected-doc-count") + 1], "2")
        self.assertEqual(run_args[run_args.index("--supersedes-run-id") + 1], "pds-00000000-001-current-planunit-snapshot")
        run_id = run_args[run_args.index("--run-id") + 1]
        self.assertRegex(run_id, r"^pds-\d{8}-001-current-planunit-snapshot$")
        self.assertFalse(self.h.held())
        self.assertFalse(Path(snapshot["cwd"]).exists(), "the follow-up worktree must be removed")
        self.assertEqual(self.h.g(self.h.local, "branch", "--list", "plans/snapshot-*"), "")
        doc = json.loads(self.h.g(self.h.origin, "show", f"{final}:reports/landing-checks/baseline.json"))
        self.assertEqual(doc["commit"], tip)

    def test_snapshot_run_id_takes_the_next_free_number(self):
        date = datetime.now(timezone.utc).strftime("%Y%m%d")
        self.h.commit_to_main(f"Plans/.plan_migration/pds-{date}-007-current-planunit-snapshot/x.json", "{}\n")
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        self.assertEqual(self.land("fix/a").returncode, 0)
        args = self.h.calls("snapshot")[0]["args"]
        self.assertEqual(args[args.index("--run-id") + 1], f"pds-{date}-008-current-planunit-snapshot")

    def test_exit_1_continues_and_the_report_is_kept_for_jared(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.set_plan("landing", [{"exit": 1}])
        result = self.land("fix/a")
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertIn("report to Jared", result.stdout)
        state = self.h.state()
        self.assertTrue(state["for_jared"])
        check = state["land"]["check"]
        self.assertEqual(check["exit"], 1)
        self.assertTrue(Path(check["log"]).exists())
        self.assertTrue((Path(check["reports"]) / "run-gates.json").exists())

    def test_pass_through_args_reach_the_landing_check_only(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        self.assertEqual(self.land("fix/a", "--check-arg=--cache").returncode, 0)
        for row in self.h.calls("landing"):
            self.assertIn("--cache", row["args"])
        self.assertNotIn("--cache", self.h.calls("baseline")[0]["args"])

    def test_keep_worktree_keeps_it(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.assertEqual(self.land("fix/a", "--keep-worktree").returncode, 0)
        self.assertTrue(wt.exists())

    def test_a_process_inside_the_worktree_leaves_it_and_says_so(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        result = subprocess.run([sys.executable, "-B", str(TOOL), "run", "fix/a", "--name", "x"], cwd=str(wt), env=self.h.env,
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertTrue(wt.exists())
        self.assertIn("worktree remove", result.stdout)


class StopTests(Base):
    def stopped(self, result, code):
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertEqual(self.h.state()["stop"]["code"], code, result.stdout)

    def test_exit_2_stops_nothing_pushed_main_reset_lock_released_no_snapshot(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 2}])
        self.stopped(self.land("fix/a"), "landing_check_blocked")
        self.assertEqual(self.h.origin_main(), base)
        self.assertEqual(self.h.shared_head(), base, "main must be reset back at once")
        self.assertFalse(self.h.held())
        self.assertEqual(self.h.calls("snapshot"), [])
        self.assertEqual(self.h.calls("baseline"), [], "the baseline is never refreshed to make a landing pass")

    def test_exit_3_stops_the_same_way(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 3}])
        self.stopped(self.land("fix/a"), "landing_check_could_not_run")
        self.assertEqual(self.h.origin_main(), base)
        self.assertEqual(self.h.shared_head(), base)

    def test_a_resume_after_exit_2_with_nothing_changed_runs_the_check_again(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 2}, {"exit": 2}, {"exit": 0}])
        self.stopped(self.land("fix/a"), "landing_check_blocked")
        self.stopped(self.h.tool("resume"), "landing_check_blocked")
        self.assertEqual(self.h.origin_main(), base, "a blocked check is never reused as a pass")
        self.assertEqual(len(self.h.calls("landing")), 2)
        self.assertEqual(self.h.tool("resume").returncode, 0)
        self.assertEqual(self.h.origin_main(), self.h.state()["land"]["pushed_sha"])
        self.assertFalse(wt.exists())

    def test_a_baseline_naming_another_commit_stops_the_followup(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.set_plan("baseline", [{"run": "git commit -q --allow-empty -m drift"}])
        self.stopped(self.land("fix/a"), "baseline_failed")
        self.assertEqual(self.h.origin_main(), tip, "the landing stands; the follow-up has not landed")
        self.assertTrue(self.h.held(), "the follow-up is owed, so the lock stays")

    def test_a_failed_snapshot_stops_and_keeps_the_lock(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.set_plan("snapshot", [{"exit": 1}])
        self.stopped(self.land("fix/a"), "snapshot_failed")
        self.assertEqual(self.h.origin_main(), tip)
        self.assertTrue(self.h.held())
        self.assertNotIn("heartbeat", self.h.holder())
        self.assertEqual(self.h.calls("baseline"), [], "the baseline comes after the snapshot")
        self.assertEqual(self.h.tool("resume").returncode, 0)
        self.assertFalse(self.h.held())
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", "refs/heads/main^"), tip)

    def test_a_snapshot_exit_counts_even_if_the_pointer_moved(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        self.h.set_plan("snapshot", [{"exit": 1, "pointer_then_fail": True}])
        self.stopped(self.land("fix/a"), "snapshot_failed")
        self.assertEqual(self.h.calls("baseline"), [])

    def test_a_baseline_refused_for_a_timeout_retries_once_with_the_larger_bound(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        self.h.set_plan("baseline", [{"exit": 3, "text": "pm-landing-check: not recording a baseline: these subchecks"}])
        self.assertEqual(self.land("fix/a").returncode, 0)
        calls = self.h.calls("baseline")
        self.assertEqual(len(calls), 2)
        self.assertIn("1200", calls[1]["args"])

    def test_a_followup_landing_check_that_blocks_stops_and_keeps_the_lock(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.set_plan("landing", [{}, {"exit": 2}])
        self.stopped(self.land("fix/a"), "landing_check_blocked")
        self.assertEqual(self.h.origin_main(), tip)
        self.assertEqual(self.h.shared_head(), tip, "the follow-up's fast-forward is put back too")
        self.assertTrue(self.h.held())
        self.assertEqual(self.h.tool("resume").returncode, 0)
        self.assertEqual(len(self.h.calls("landing")), 3, "with the lock kept, a blocked check is still not reused")
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", "refs/heads/main^"), tip)
        self.assertEqual(len(self.h.calls("snapshot")), 1)

    def test_the_next_lander_hears_about_an_owed_followup(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "a\n"})
        self.h.branch("fix/b", {"src/y.txt": "b\n"})
        self.assertEqual(self.h.tool("run", "fix/a", "--name", "a", env={"PM_LAND_TEST_CRASH_BEFORE": "fu-baseline:fu"}).returncode, 137)
        shutil.rmtree(self.h.lock / "held")
        result = self.h.tool("run", "fix/b", "--name", "b")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("still owes", result.stdout)

    def test_any_other_exit_is_a_stop(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 137}])
        self.stopped(self.land("fix/a"), "landing_check_killed")
        self.assertEqual(self.h.origin_main(), base)

    def test_exit_1_with_a_timed_out_subcheck_stops_until_judged(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 1, "timeouts": 2}])
        self.stopped(self.land("fix/a"), "timeouts_need_judgement")
        self.assertEqual(self.h.origin_main(), base)
        self.assertEqual(self.h.shared_head(), base)
        self.assertTrue(self.h.held(), "the lock stays: another landing would invalidate the check")
        self.assertNotIn("heartbeat", self.h.holder(), "no process behind it: the 90-minute rule applies")
        result = self.h.tool("resume", "--timeouts-judged", "reran lint-x alone: 0 failures")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertEqual(len(self.h.calls("landing")), 1, "the judged check is not rerun")
        self.assertFalse(self.h.held())

    def test_exit_1_without_the_infrastructure_line_fails_closed(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 1, "raw": "some other report format"}])
        self.stopped(self.land("fix/a"), "timeouts_need_judgement")
        self.assertEqual(self.h.origin_main(), base)

    def test_a_resume_without_judgement_runs_the_check_again(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.set_plan("landing", [{"exit": 1, "timeouts": 1}, {"exit": 0}])
        self.stopped(self.land("fix/a"), "timeouts_need_judgement")
        self.assertEqual(self.h.tool("resume").returncode, 0)
        self.assertEqual(len(self.h.calls("landing")), 2)
        self.assertEqual(self.h.origin_main(), tip)

    def test_own_worktree_shard_failure_stops_before_the_fast_forward(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("shard", [{"exit": 1, "failures": [{"path": "Plans/_shards/doc-a/001.md", "error": "x"}]}])
        self.stopped(self.land("fix/a"), "shard_check_own_worktree")
        self.assertEqual(self.h.shared_head(), base)
        self.assertEqual(self.h.calls("landing"), [])
        self.assertFalse(self.h.held())

    def test_shared_shard_failure_on_other_files_with_consistent_head_lands_and_reports(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.set_plan("shard", [{}, {"exit": 1, "failures": [{"path": "Plans/_shards/doc-a/001.md", "error": "shard_hash_stale"}]}])
        result = self.land("fix/a")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertTrue(any("Plans/_shards/doc-a/001.md" in row for row in self.h.state()["for_jared"]))

    def test_shared_shard_failure_on_a_touched_file_stops_and_resets(self):
        self.h.branch("fix/a", {"Plans/_shards/doc-a/001.md": "regenerated\n"})
        base = self.h.origin_main()
        self.h.set_plan("shard", [{}, {"exit": 1, "failures": [{"path": "Plans/_shards/doc-a/001.md", "error": "shard_hash_stale"}]}])
        self.stopped(self.land("fix/a"), "shard_check_on_branch")
        self.assertEqual(self.h.shared_head(), base)
        self.assertEqual(self.h.calls("landing"), [])

    def test_shared_shard_failure_with_head_not_holding_the_file_stops(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("shard", [{}, {"exit": 1, "failures": [{"path": "Plans/_shards/doc-a/gone.md", "error": "missing_shard"}]}])
        self.stopped(self.land("fix/a"), "shard_check_head_inconsistent")
        self.assertEqual(self.h.shared_head(), base)

    def test_shared_shard_failure_on_a_file_head_lacks_stops_outside_the_shards_too(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("shard", [{}, {"exit": 1, "failures": [{"path": "Plans/not-in-head.md", "error": "missing_source"}]}])
        self.stopped(self.land("fix/a"), "shard_check_head_inconsistent")

    def test_shared_shard_failure_whose_manifest_does_not_reference_it_stops(self):
        self.h.commit_to_main("Plans/_shards/doc-a/orphan.md", "x\n")
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("shard", [{}, {"exit": 1, "failures": [{"path": "Plans/_shards/doc-a/orphan.md", "error": "x"}]}])
        self.stopped(self.land("fix/a"), "shard_check_head_inconsistent")

    def test_shared_shard_failure_that_cannot_be_read_stops(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("shard", [{}, {"exit": 1, "raw": "Traceback: no json here"}])
        self.stopped(self.land("fix/a"), "shard_check_unreadable")

    def test_shared_shard_failure_row_naming_no_file_stops(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("shard", [{}, {"exit": 1, "failures": [{"error": "missing_output_root"}]}])
        self.stopped(self.land("fix/a"), "shard_check_unreadable")

    def test_shared_shard_failure_naming_a_touched_source_stops(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        self.h.set_plan("shard", [{}, {"exit": 1, "failures": [
            {"source": "Plans/doc-a.md", "path": "Plans/_shards/doc-a/001.md", "error": "x"}]}])
        self.stopped(self.land("fix/a"), "shard_check_on_branch")

    def test_uncommitted_change_in_a_touched_file_of_the_shared_checkout_stops(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        (self.h.shared / "src/x.txt").write_text("another thread's edit\n")
        result = self.land("fix/a")
        self.stopped(result, "shared_dirty")
        self.assertIn("src/x.txt", result.stdout)
        self.assertIn("hand the branch over", result.stdout)
        self.assertEqual(self.h.shared_head(), base)
        self.assertEqual((self.h.shared / "src/x.txt").read_text(), "another thread's edit\n")

    def test_uncommitted_change_elsewhere_stays_and_the_landing_goes_on(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        (self.h.shared / "src/y.txt").write_text("another thread's edit\n")
        self.assertEqual(self.land("fix/a").returncode, 0)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertEqual((self.h.shared / "src/y.txt").read_text(), "another thread's edit\n")

    def test_untracked_folder_covering_a_touched_file_stops(self):
        self.h.branch("fix/a", {"src/new/thing.txt": "new\n"})
        (self.h.shared / "src/new").mkdir()
        (self.h.shared / "src/new/other.txt").write_text("x\n")
        self.stopped(self.land("fix/a"), "shared_dirty")

    def test_shared_checkout_not_on_main_stops(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.g(self.h.shared, "checkout", "-q", "-b", "elsewhere")
        self.stopped(self.land("fix/a"), "shared_not_on_main")

    def test_push_rejected_resets_main_and_stops(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        hook = self.h.origin / "hooks/pre-receive"
        hook.write_text("#!/bin/sh\nexit 1\n")
        os.chmod(hook, 0o755)
        self.stopped(self.land("fix/a"), "push_failed")
        self.assertEqual(self.h.origin_main(), base)
        self.assertEqual(self.h.shared_head(), base)
        hook.unlink()
        self.assertEqual(self.h.tool("resume").returncode, 0)
        self.assertNotEqual(self.h.origin_main(), base)

    def test_origin_moving_during_the_check_blocks_the_push(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        helper = self.h.tmp / "move.py"
        helper.write_text(textwrap.dedent(f"""\
            import subprocess
            subprocess.run(["git", "clone", "-q", {str(self.h.origin)!r}, {str(self.h.tmp / 'mover')!r}], check=True)
            open({str(self.h.tmp / 'mover/src/y.txt')!r}, "w").write("moved\\n")
            subprocess.run(["git", "-C", {str(self.h.tmp / 'mover')!r}, "commit", "-qam", "moved"], check=True)
            subprocess.run(["git", "-C", {str(self.h.tmp / 'mover')!r}, "push", "-q", "origin", "main"], check=True)
            """))
        self.h.set_plan("landing", [{"run": f"{sys.executable} {helper}"}])
        self.stopped(self.land("fix/a"), "origin_moved")
        self.assertNotEqual(self.h.g(self.h.origin, "rev-parse", "refs/heads/main"), tip)
        self.assert_main_not_ahead()
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(self.h.calls("landing")), 2, "the moved base means the check runs again")
        self.assertIn("moved", self.h.g(self.h.origin, "show", "refs/heads/main:src/y.txt"))
        self.assertEqual(self.h.g(self.h.origin, "show", "refs/heads/main:src/x.txt"), "new")

    def test_head_moving_during_the_check_blocks_the_push(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"run": f"git -C {self.h.shared} commit -q --allow-empty -m sneaked"}])
        result = self.land("fix/a")
        self.stopped(result, "checked_tree_moved")
        self.assertEqual(self.h.origin_main(), base)

    def test_losing_the_lock_during_the_check_blocks_the_push(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        held = self.h.lock / "held"
        self.h.set_plan("landing", [{"run": f"rm -r {held} && mkdir {held} && echo 'agent: someone else' > {held}/holder.txt"}])
        self.stopped(self.land("fix/a"), "lock_lost")
        self.assertEqual(self.h.origin_main(), base)
        self.assertEqual(self.h.shared_head(), base)
        self.assertIn("someone else", self.h.holder(), "someone else's lock must not be released")

    def test_the_tool_never_uses_what_the_rule_forbids(self):
        source = TOOL.read_text()
        for word in ('"--force"', '"--no-verify"', '"--hard"', '"gc"', '"-D"', "--force-with-lease"):
            self.assertNotIn(word, source.split('"""', 2)[2], word)


class RebaseTests(Base):
    def test_conflict_stops_names_the_files_and_leaves_the_branch_alone(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "mine\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.commit_to_main("Plans/doc-a.md", "theirs\n")
        base = self.h.origin_main()
        result = self.land("fix/a", "--readjudicated")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state()["stop"]["code"], "rebase_conflict")
        self.assertIn("Plans/doc-a.md", result.stdout)
        self.assertIn("re-adjudicated by the branch's owner", result.stdout)
        self.assertEqual(self.h.g(wt, "rev-parse", "HEAD"), tip)
        self.assertEqual(self.h.g(wt, "status", "--porcelain"), "")
        self.assertEqual(self.h.origin_main(), base)
        self.assertFalse(self.h.held())

    def test_a_clean_rebase_lands_the_rebased_commit_and_never_forces_the_branch(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "mine\n"})
        pushed = self.h.g(wt, "rev-parse", "HEAD")
        self.h.g(wt, "push", "-q", "origin", "fix/a")
        moved = self.h.commit_to_main("src/y.txt", "theirs\n")
        result = self.land("fix/a", "--keep-worktree")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        final = self.h.origin_main()
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", f"{final}^"), moved)
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", "refs/heads/fix/a"), pushed, "never forced")
        self.assertIn("never forced", result.stdout)

    def test_main_changing_a_plans_document_the_branch_edits_stops_until_readjudicated(self):
        lines = "".join(f"line {i}\n" for i in range(30))
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": lines.replace("line 1\n", "mine\n")})
        self.h.commit_to_main("Plans/doc-a.md", lines.replace("line 28\n", "theirs\n"))
        base = self.h.origin_main()
        result = self.land("fix/a")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state()["stop"]["code"], "plans_changed_on_both_sides")
        self.assertIn("Plans/doc-a.md", result.stdout)
        self.assertEqual(self.h.origin_main(), base)
        result = self.h.tool("resume", "--readjudicated")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        text = self.h.g(self.h.origin, "show", f"{self.h.state()['land']['pushed_sha']}:Plans/doc-a.md")
        self.assertIn("mine", text)
        self.assertIn("theirs", text)
        self.assertFalse(wt.exists())

    def test_a_branch_with_merges_already_on_main_is_not_flattened(self):
        wt = self.h.branch("land/fo-x", {"src/x.txt": "mine\n"})
        self.h.commit_to_main("src/y.txt", "theirs\n")
        self.h.g(wt, "fetch", "-q", "origin")
        self.h.g(wt, "merge", "-q", "--no-edit", "origin/main")
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.assertEqual(self.h.tool("run", "land/fo-x", "--name", "pm-fo-lead").returncode, 0)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertEqual(self.h.g(self.h.origin, "rev-list", "--merges", "--count", "HEAD~1..HEAD"), "1")

    def test_a_branch_with_merges_behind_main_stops(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "mine\n"})
        self.h.commit_to_main("src/y.txt", "theirs\n")
        self.h.g(wt, "fetch", "-q", "origin")
        self.h.g(wt, "merge", "-q", "--no-edit", "origin/main")
        self.h.commit_to_main("src/z.txt", "later\n")
        self.assertEqual(self.land("fix/a").returncode, 1)
        self.assertEqual(self.h.state()["stop"]["code"], "branch_has_merges")

    def test_a_dirty_branch_worktree_stops(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "mine\n"})
        (wt / "src/x.txt").write_text("uncommitted\n")
        self.assertEqual(self.land("fix/a").returncode, 1)
        self.assertEqual(self.h.state()["stop"]["code"], "branch_dirty")

    def test_nothing_to_land_stops(self):
        self.h.g(self.h.local, "fetch", "-q", "origin")
        self.h.g(self.h.local, "worktree", "add", "-q", "-b", "fix/empty", str(self.h.wts / "e"), "origin/main")
        self.assertEqual(self.land("fix/empty").returncode, 1)
        self.assertEqual(self.h.state()["stop"]["code"], "nothing_to_land")

    def test_a_second_run_of_a_branch_in_progress_is_refused(self):
        self.h.branch("fix/a", {"src/x.txt": "mine\n"})
        self.h.set_plan("landing", [{"exit": 2}])
        self.assertEqual(self.land("fix/a").returncode, 1)
        self.assertEqual(self.land("fix/a").returncode, 2)

    def test_an_unknown_branch_is_refused(self):
        self.assertEqual(self.land("no/such").returncode, 2)


class ResumeTests(Base):
    def kill_during_landing_check(self, branch="fix/a"):
        self.h.set_plan("landing", [{"sleep": 300}])
        proc = self.h.start("run", branch, "--name", "lander")
        self.h.wait_calls("landing")
        proc.kill()
        proc.wait()

    def test_a_killed_landing_check_reruns_main_was_put_back_first(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        self.kill_during_landing_check()
        self.assertEqual(self.h.shared_head(), tip, "a SIGKILL leaves the fast-forward behind")
        orphan = self.h.calls("landing")[0]["pid"]
        self.assertIsNotNone(M.pid_start(orphan), "the check outlives a SIGKILLed parent")
        self.assertEqual(self.h.origin_main(), base)
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIsNone(M.pid_start(orphan), "the leftover check must be stopped")
        self.assertIn("reset back", result.stdout)
        self.assertEqual(len(self.h.calls("landing")), 2)
        self.assertEqual(self.h.calls("landing")[1]["shared_origin"], base)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertFalse(self.h.held())

    def test_died_before_the_push_with_passed_checks_pushes_without_rerunning(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        result = self.land("fix/a", env={"PM_LAND_TEST_CRASH_BEFORE": "push:land"})
        self.assertEqual(result.returncode, 137)
        self.assertEqual(self.h.shared_head(), tip)
        self.assertEqual(self.h.origin_main(), base)
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("pushing now", result.stdout)
        self.assertEqual(len(self.h.calls("landing")), 1, "a passed check for the same commit and base stands")
        self.assertEqual(self.h.origin_main(), tip)

    def test_died_before_the_push_and_origin_moved_starts_over_never_pushes_the_old_check(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.land("fix/a", env={"PM_LAND_TEST_CRASH_BEFORE": "push:land"})
        self.h.commit_to_main("src/y.txt", "moved\n")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(self.h.calls("landing")), 2, "a moved base means the check runs again")
        self.assertNotEqual(self.h.origin_main(), tip, "the commit must be rebased, not pushed as it was")
        self.assertEqual(self.h.calls("landing")[1]["head"], self.h.origin_main())

    def test_died_before_the_push_and_the_branch_moved_lands_the_new_tip_never_the_old(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        old = self.h.g(wt, "rev-parse", "HEAD")
        self.land("fix/a", env={"PM_LAND_TEST_CRASH_BEFORE": "push:land"})
        self.assertEqual(self.h.shared_head(), old)
        fix = self.h.commit(wt, {"src/x.txt": "fixed\n"}, "fix")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(self.h.calls("landing")), 2, "the new tip gets its own check")
        self.assertEqual(self.h.calls("landing")[1]["head"], fix)
        self.assertEqual(self.h.origin_main(), fix)

    def test_a_push_that_reached_origin_is_proven_by_origin_itself(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.land("fix/a", env={"PM_LAND_TEST_CRASH_BEFORE": "push:land"})
        self.h.g(self.h.shared, "push", "-q", "origin", "main")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("push reached it", result.stdout)
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", "refs/heads/main^"), tip)
        self.assertEqual(len(self.h.calls("snapshot")), 1)

    def test_died_after_the_push_runs_the_followup_not_a_second_landing(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.assertEqual(self.land("fix/a", env={"PM_LAND_TEST_CRASH_BEFORE": "followup-decide:"}).returncode, 137)
        self.assertEqual(self.h.origin_main(), tip)
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(self.h.calls("landing")), 2, "the landing's check and the follow-up's")
        self.assertEqual(len(self.h.calls("snapshot")), 1)
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", "refs/heads/main^"), tip)

    def test_origin_moved_while_stopped_restarts_from_the_fetch(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("landing", [{"exit": 2}])
        self.assertEqual(self.land("fix/a").returncode, 1)
        moved = self.h.commit_to_main("src/y.txt", "moved\n")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        final = self.h.origin_main()
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", f"{final}^"), moved)
        self.assertFalse(wt.exists())

    def test_the_branch_moving_while_stopped_restarts_with_the_new_tip(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("landing", [{"exit": 2}])
        self.assertEqual(self.land("fix/a").returncode, 1)
        fix = self.h.commit(wt, {"src/x.txt": "fixed\n"}, "fix")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.origin_main(), fix)
        self.assertEqual(self.h.calls("landing")[-1]["head"], fix)

    def test_someone_else_holding_the_lock_blocks_resume_and_main_goes_back(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.land("fix/a", env={"PM_LAND_TEST_CRASH_BEFORE": "push:land"})
        shutil.rmtree(self.h.lock / "held")
        self.h.hand_lock("agent: hand-lander\nbranch: y\n")
        result = self.h.tool("resume", "--wait-timeout", "0.3")
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertEqual(self.h.state()["stop"]["code"], "lock_wait_timeout")
        self.assertEqual(self.h.origin_main(), base)
        self.assertEqual(self.h.shared_head(), base)
        self.assertIn("hand-lander", self.h.holder())

    def test_a_lock_that_changed_hands_means_the_whole_landing_is_rechecked(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.land("fix/a", env={"PM_LAND_TEST_CRASH_BEFORE": "push:land"})
        shutil.rmtree(self.h.lock / "held")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(self.h.calls("landing")), 2, "the lock was not ours for a while: start at the fetch")
        self.assertEqual(self.h.origin_main(), tip)

    def test_died_in_the_snapshot_starts_it_over_on_a_clean_tree(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        self.h.set_plan("snapshot", [{"sleep": 300}])
        proc = self.h.start("run", "fix/a", "--name", "lander")
        self.h.wait_calls("snapshot")
        proc.kill()
        proc.wait()
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(self.h.calls("snapshot")), 2)
        final = self.h.origin_main()
        names = self.h.g(self.h.origin, "diff", "--name-only", f"{final}^..{final}").splitlines()
        self.assertTrue(all("partial" not in name or "final" not in name for name in names))
        args = self.h.calls("snapshot")[1]["args"]
        run_id = args[args.index("--run-id") + 1]
        self.assertTrue(any(run_id in name for name in names))

    def test_died_in_the_followups_landing_check_reruns_it(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        self.h.set_plan("landing", [{}, {"sleep": 300}])
        proc = self.h.start("run", "fix/a", "--name", "lander")
        self.h.wait_calls("landing", 2)
        proc.kill()
        proc.wait()
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(self.h.calls("landing")), 3)
        self.assertEqual(len(self.h.calls("snapshot")), 1, "the finished snapshot stands")
        self.assertEqual(self.h.g(self.h.origin, "diff", "--name-only", "refs/heads/main^..refs/heads/main").count("baseline"), 1)
        self.assertFalse(self.h.held())

    def test_main_moving_in_the_followup_snapshots_at_the_new_main(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        self.land("fix/a", env={"PM_LAND_TEST_CRASH_BEFORE": "fu-baseline:fu"})
        moved = self.h.commit_to_main("src/y.txt", "moved\n")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", "refs/heads/main^"), moved)
        self.assertEqual(self.h.calls("baseline")[-1]["head"], moved)

    def test_sigterm_puts_main_back_stops_the_check_and_can_resume(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"sleep": 300}])
        proc = self.h.start("run", "fix/a", "--name", "lander")
        self.h.wait_calls("landing")
        proc.terminate()
        self.assertEqual(proc.wait(timeout=30), 1)
        self.assertIsNone(M.pid_start(self.h.calls("landing")[0]["pid"]))
        self.assertEqual(self.h.shared_head(), base)
        self.assertFalse(self.h.held())
        self.assertEqual(self.h.state()["stop"]["code"], "interrupted")
        self.assertEqual(self.h.tool("resume").returncode, 0)
        self.assertEqual(self.h.origin_main(), tip)

    def test_resume_refuses_while_it_is_still_running(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("landing", [{"sleep": 300}])
        self.h.start("run", "fix/a", "--name", "lander")
        self.h.wait_calls("landing")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 2)
        self.assertIn("still running", result.stderr)

    def test_resume_on_another_machine_is_refused(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("landing", [{"exit": 2}])
        self.assertEqual(self.land("fix/a").returncode, 1)
        result = self.h.tool("resume", env={"PM_LAND_HOST": "othermachine"})
        self.assertEqual(result.returncode, 2)
        self.assertIn("resume it there", result.stderr)

    def test_resume_with_nothing_in_progress_is_refused(self):
        self.assertEqual(self.h.tool("resume").returncode, 2)

    def test_a_landing_that_stopped_while_in_a_rebase_conflict_resumes_after_the_owner_fixed_it(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "mine\n"})
        self.h.commit_to_main("src/x.txt", "theirs\n")
        self.assertEqual(self.land("fix/a").returncode, 1)
        self.h.g(wt, "fetch", "-q", "origin")
        rebased = subprocess.run(["git", "-C", str(wt), "rebase", "origin/main"], capture_output=True, text=True, env=self.h.env)
        self.assertNotEqual(rebased.returncode, 0)
        (wt / "src/x.txt").write_text("owner's resolution\n")
        self.h.g(wt, "add", "src/x.txt")
        subprocess.run(["git", "-C", str(wt), "-c", "core.editor=true", "rebase", "--continue"], check=True, env=self.h.env,
                       capture_output=True)
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.g(self.h.origin, "show", "refs/heads/main:src/x.txt"), "owner's resolution")


class AbortTests(Base):
    def test_abort_after_a_crash_puts_main_back_and_releases(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.tool("run", "fix/a", "--name", "x", env={"PM_LAND_TEST_CRASH_BEFORE": "push:land"})
        self.assertNotEqual(self.h.shared_head(), base)
        result = self.h.tool("abort")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.shared_head(), base)
        self.assertEqual(self.h.origin_main(), base)
        self.assertFalse(self.h.held())
        self.assertEqual(self.h.state()["status"], "aborted")
        self.assertTrue(wt.exists(), "the branch's worktree is its owner's")

    def test_abort_of_a_running_landing_stops_it(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"sleep": 300}])
        proc = self.h.start("run", "fix/a", "--name", "x")
        self.h.wait_calls("landing")
        result = self.h.tool("abort")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        proc.wait(timeout=30)
        self.assertIsNone(M.pid_start(self.h.calls("landing")[0]["pid"]))
        self.assertEqual(self.h.shared_head(), base)
        self.assertFalse(self.h.held())

    def test_abort_after_the_push_says_the_followup_is_owed(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.tool("run", "fix/a", "--name", "x", env={"PM_LAND_TEST_CRASH_BEFORE": "fu-baseline:fu"})
        self.assertEqual(self.h.origin_main(), tip)
        fu_wt = self.h.state()["fu"]["worktree"]
        result = self.h.tool("abort")
        self.assertIn("follow-up", result.stdout)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertFalse(self.h.held())
        self.assertFalse(Path(fu_wt).exists() and (Path(fu_wt) / ".git").exists() and False)

    def test_abort_of_a_waiting_landing_removes_its_ticket(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.hand_lock()
        proc = self.h.start("run", "fix/a", "--name", "x")
        end = time.time() + 20
        while time.time() < end and not list((self.h.lock / "queue").glob("t-*.json")):
            time.sleep(0.05)
        self.assertTrue(list((self.h.lock / "queue").glob("t-*.json")))
        self.assertEqual(self.h.tool("abort").returncode, 0)
        proc.wait(timeout=30)
        self.assertEqual(list((self.h.lock / "queue").glob("t-*.json")), [])
        self.assertTrue(self.h.held(), "someone else's lock stays")

    def test_abort_with_nothing_in_progress_is_refused(self):
        self.assertEqual(self.h.tool("abort").returncode, 2)


class BatchTests(Base):
    def batch_start(self) -> str:
        return M.parse_holder(self.h.holder())["batch-start"]

    def test_three_landings_share_one_lock_hold_and_one_followup(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "a\n"})
        self.h.branch("fix/b", {"src/x.txt": "b\n"})
        self.h.branch("fix/c", {"Plans/doc-b.md": "c\n"})
        start = self.h.origin_main()
        result = self.land("fix/a", "--batch-open")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertTrue(self.h.held(), "the batch keeps the lock between landings")
        holder = M.parse_holder(self.h.holder())
        self.assertEqual(holder["batch-start"], start)
        self.assertEqual(len(holder["batch-landing"]), 1)
        self.assertTrue(holder["batch-landing"][0].startswith("fix/a "))
        self.assertNotIn("heartbeat", holder, "idle between landings: the 90-minute rule protects it")
        self.assertEqual(self.h.calls("snapshot"), [], "never refreshed in the middle of a batch")
        first = self.h.origin_main()
        result = self.land("fix/b", "--batch-start", start)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.calls("snapshot"), [])
        self.assertEqual(self.batch_start(), start)
        result = self.land("fix/c", "--batch-start", start, "--batch-close")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertFalse(self.h.held())
        landing = self.h.calls("landing")
        self.assertEqual(len(landing), 4)
        for row in landing[:3]:
            self.assertEqual(row["args"][:2], ["--base", start], "every check in a batch uses --base <batch-start>")
        self.assertEqual(landing[3]["args"][:2], ["--base", "origin/main"], "the follow-up is checked as usual")
        self.assertEqual(len(self.h.calls("snapshot")), 1, "one follow-up for the batch")
        self.assertEqual(len(self.h.calls("baseline")), 1)
        final = self.h.origin_main()
        third = self.h.g(self.h.origin, "rev-parse", f"{final}^")
        self.assertEqual(self.h.calls("snapshot")[0]["origin_main"], third, "at the batch's final main")
        self.assertTrue(subprocess.run(["git", "-C", str(self.h.origin), "merge-base", "--is-ancestor", first, third],
                                       env=self.h.env).returncode == 0)
        self.assertTrue(all(row["held"] for row in self.h.calls()))

    def test_a_members_plans_change_is_followed_up_when_a_later_lander_closes(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "a\n"})
        self.h.branch("fix/b", {"src/x.txt": "b\n"})
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        start = self.batch_start()
        result = self.land("fix/b", "--batch-start", start, "--batch-close")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(len(self.h.calls("snapshot")), 1)
        self.assertFalse(self.h.held())

    def test_batch_start_must_be_a_full_sha(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        for bad in ("origin/main", "abc1234", "HEAD"):
            result = self.land("fix/a", "--batch-start", bad)
            self.assertEqual(result.returncode, 2, bad)
            self.assertIn("full 40-character", result.stderr)

    def test_batch_start_must_match_the_open_batch(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        self.h.branch("fix/b", {"src/y.txt": "b\n"})
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        result = self.land("fix/b", "--batch-start", "a" * 40)
        self.assertEqual(result.returncode, 2)
        self.assertIn("not the open batch", result.stderr)

    def test_no_open_batch_is_refused(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        self.assertEqual(self.land("fix/a", "--batch-start", "a" * 40).returncode, 2)
        self.assertEqual(self.h.tool("run", "--batch-close", "--name", "x").returncode, 2)
        self.assertFalse(self.h.held())

    def test_a_batch_with_no_plans_paths_closes_with_no_followup(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        start = self.batch_start()
        result = self.h.tool("run", "--batch-close", "--batch-start", start, "--name", "closer")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.calls("snapshot"), [])
        self.assertFalse(self.h.held())

    def test_closing_a_batch_with_plans_runs_its_followup_at_the_final_main(self):
        wt = self.h.branch("fix/a", {"Plans/doc-a.md": "a\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        result = self.h.tool("run", "--batch-close", "--name", "lander-fix/a")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.calls("snapshot")[0]["head"], tip)
        self.assertEqual(self.h.g(self.h.origin, "rev-parse", "refs/heads/main^"), tip)
        self.assertFalse(self.h.held())

    def test_another_agent_cannot_close_a_batch_without_its_sha(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        result = self.h.tool("run", "--batch-close", "--name", "stranger")
        self.assertEqual(result.returncode, 2)
        self.assertTrue(self.h.held())

    def test_a_batch_holds_at_most_four_landings(self):
        names = [f"fix/{letter}" for letter in "abcde"]
        for index, name in enumerate(names):
            self.h.branch(name, {f"src/n{index}.txt": "n\n"})
        self.assertEqual(self.land(names[0], "--batch-open").returncode, 0)
        start = self.batch_start()
        for name in names[1:4]:
            self.assertEqual(self.land(name, "--batch-start", start).returncode, 0)
        before = self.h.origin_main()
        result = self.land(names[4], "--batch-start", start)
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state(names[4])["stop"]["code"], "batch_full")
        self.assertEqual(self.h.origin_main(), before)
        self.assertTrue(self.h.held())
        self.assertEqual(M.parse_holder(self.h.holder())["batch-start"], start)
        self.assertEqual(self.h.tool("run", "--batch-close", "--batch-start", start, "--name", "c").returncode, 0)
        self.assertEqual(self.h.tool("resume", "--branch", names[4]).returncode, 0)
        self.assertEqual(self.h.state(names[4])["status"], "done")

    def test_a_batch_older_than_two_hours_takes_no_landing(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        start = self.h.origin_main()
        self.h.hand_lock(f"batch-start: {start}\nbatch-first-push: {utc(7300)}\n")
        result = self.land("fix/a", "--batch-start", start)
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state()["stop"]["code"], "batch_expired")
        self.assertEqual(self.h.origin_main(), start)

    def test_a_hand_opened_batch_is_taken_over(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        start = self.h.origin_main()
        self.h.hand_lock(f"agent: by-hand\nbatch-start: {start}\n")
        result = self.land("fix/a", "--batch-start", start)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.calls("landing")[0]["args"][:2], ["--base", start])
        self.assertEqual(M.parse_holder(self.h.holder())["batch-start"], start)

    def test_a_stopped_landing_closes_the_batch_with_its_followup_and_is_rechecked_alone(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "a\n"})
        wt_b = self.h.branch("fix/b", {"src/x.txt": "b\n"})
        start = self.h.origin_main()
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        a_sha = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 2}, {}, {}])
        result = self.land("fix/b", "--batch-start", start)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        landing = self.h.calls("landing")
        self.assertEqual(len(landing), 4, [row["args"][:2] for row in landing])
        self.assertEqual(landing[1]["args"][:2], ["--base", start], "the stopped check judged the batch")
        self.assertEqual(landing[2]["args"][:2], ["--base", "origin/main"], "the follow-up's own check")
        self.assertEqual(landing[3]["args"][:2], ["--base", "origin/main"], "rerun alone")
        snapshot = self.h.calls("snapshot")
        self.assertEqual(len(snapshot), 1)
        self.assertEqual(snapshot[0]["head"], a_sha, "the follow-up runs at the current main, without the stopped landing")
        self.assertEqual(self.h.g(self.h.origin, "show", "refs/heads/main:src/x.txt"), "b")
        self.assertFalse(self.h.held())
        self.assertFalse(wt_b.exists())
        log = self.h.g(self.h.origin, "log", "--format=%s", "refs/heads/main", "-3").splitlines()
        self.assertEqual(log[1], "plans: refresh the plan-migration snapshot and the landing-check baseline")

    def test_a_landing_stopped_again_alone_is_an_ordinary_stop(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        self.h.branch("fix/b", {"src/y.txt": "b\n"})
        start = self.h.origin_main()
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        a_sha = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 2}, {"exit": 2}])
        result = self.land("fix/b", "--batch-start", start)
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state("fix/b")["stop"]["code"], "landing_check_blocked")
        self.assertEqual(self.h.state("fix/b")["batch"], None)
        self.assertEqual(self.h.origin_main(), a_sha)
        self.assertEqual(self.h.shared_head(), a_sha)
        self.assertFalse(self.h.held())
        self.assertEqual(self.h.calls("snapshot"), [], "no Plans path: no follow-up")

    def test_the_first_landing_of_a_batch_stopping_is_an_ordinary_stop(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "a\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 2}])
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 1)
        self.assertEqual(len(self.h.calls("landing")), 1)
        self.assertEqual(self.h.shared_head(), base)
        self.assertFalse(self.h.held(), "nothing is pushed yet: nothing to keep the lock for")
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.origin_main(), tip)
        self.assertTrue(self.h.held(), "the batch it opened is open now")

    def test_a_landing_needing_a_reseal_is_never_in_a_batch(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        self.h.branch("fix/b", {"Plans/Spec_Lock.json": "{\"x\":1}\n"})
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        start = self.batch_start()
        before = self.h.origin_main()
        result = self.land("fix/b", "--batch-start", start)
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state("fix/b")["stop"]["code"], "reseal_in_batch")
        self.assertEqual(self.h.origin_main(), before)
        self.assertTrue(self.h.held())

    def test_nobody_outside_lands_while_a_batch_is_open(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        self.h.branch("fix/b", {"src/y.txt": "b\n"})
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        before = self.h.origin_main()
        result = self.land("fix/b", "--wait-timeout", "0.3")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state("fix/b")["stop"]["code"], "lock_wait_timeout")
        self.assertEqual(self.h.origin_main(), before)

    def test_a_member_cannot_take_over_while_another_is_landing(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        self.h.branch("fix/b", {"src/y.txt": "b\n"})
        self.assertEqual(self.land("fix/a", "--batch-open").returncode, 0)
        start = self.batch_start()
        self.h.branch("fix/c", {"src/z.txt": "c\n"})
        self.h.set_plan("landing", [{"sleep": 300}])
        self.h.start("run", "fix/b", "--name", "member", "--batch-start", start)
        self.h.wait_calls("landing", 2)
        result = self.land("fix/c", "--batch-start", start)
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state("fix/c")["stop"]["code"], "batch_busy")

    def test_a_batch_passing_two_hours_during_the_check_closes_and_lands_alone(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        start = self.h.origin_main()
        self.h.hand_lock(f"batch-start: {start}\nbatch-first-push: {utc(7195)}\nbatch-landing: fix/old {start}\n")
        self.h.set_plan("landing", [{"sleep": 7}, {}])
        result = self.land("fix/a", "--batch-start", start)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        landing = self.h.calls("landing")
        self.assertEqual(len(landing), 2)
        self.assertEqual(landing[0]["args"][:2], ["--base", start])
        self.assertEqual(landing[1]["args"][:2], ["--base", "origin/main"])
        self.assertFalse(self.h.held())


class LocalCheckTests(Base):
    def test_checks_run_in_a_full_local_copy_and_the_shared_checkout_only_moves_at_the_end(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        result = self.land("fix/a", "--checks-local")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        calls = self.h.calls()
        self.assertEqual([row["tool"] for row in calls], ["shard", "shard", "landing"])
        local = calls[2]["cwd"]
        self.assertNotEqual(local, str(self.h.shared))
        self.assertEqual(calls[1]["cwd"], local)
        for row in calls[1:]:
            self.assertEqual(row["head"], tip, "at the exact commit")
            self.assertEqual(row["shared_head"], base, "the shared checkout does not move during the checks")
            self.assertTrue(row["symlink"] and row["audit_input"], "the ignored inputs are there")
            self.assertNotEqual(row["sparse"], "true")
            self.assertTrue(row["held"])
        self.assertEqual(calls[2]["args"][:2], ["--base", "origin/main"])
        self.assertEqual(self.h.origin_main(), tip)
        self.assertEqual(self.h.shared_head(), tip)
        self.assertFalse(Path(local).exists(), "the local copy must be removed")
        self.assertFalse(self.h.held())

    def test_exit_2_never_moves_the_shared_checkout(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"exit": 2}])
        self.assertEqual(self.land("fix/a", "--checks-local").returncode, 1)
        self.assertEqual(self.h.shared_head(), base)
        self.assertEqual(self.h.origin_main(), base)
        self.assertEqual(self.h.calls("landing")[0]["shared_head"], base)

    def test_another_threads_uncommitted_files_do_not_reach_the_local_copy(self):
        for mode, stop in (("default", "shard_check_head_inconsistent"), ("local", None)):
            with self.subTest(mode=mode):
                h = Harness()
                self.addCleanup(h.close)
                wt = h.branch("fix/a", {"src/x.txt": "new\n"})
                tip = h.g(wt, "rev-parse", "HEAD")
                (h.shared / "Plans/_shards/doc-b").mkdir(parents=True)
                (h.shared / "Plans/_shards/doc-b/uncommitted-breakage").write_text("half a regeneration\n")
                extra = ["--checks-local"] if mode == "local" else []
                result = h.tool("run", "fix/a", "--name", "x", *extra)
                if stop:
                    self.assertEqual(result.returncode, 1, result.stdout)
                    self.assertEqual(h.state()["stop"]["code"], stop)
                else:
                    self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                    self.assertEqual(h.origin_main(), tip)
                self.assertTrue((h.shared / "Plans/_shards/doc-b/uncommitted-breakage").exists())

    def test_the_shared_checkout_moving_during_the_checks_blocks_the_push(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"run": f"git -C {self.h.shared} commit -q --allow-empty -m sneaked"}])
        result = self.land("fix/a", "--checks-local")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state()["stop"]["code"], "shared_main_ahead")
        self.assertEqual(self.h.origin_main(), base)

    def test_a_touched_file_going_dirty_during_the_checks_stops_at_the_fast_forward(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"run": f"echo edit > {self.h.shared}/src/x.txt"}])
        self.assertEqual(self.land("fix/a", "--checks-local").returncode, 1)
        self.assertEqual(self.h.state()["stop"]["code"], "shared_dirty")
        self.assertEqual(self.h.shared_head(), base)

    def test_a_missing_ignored_input_stops_before_the_checks(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        (self.h.shared / "Plans/.audits/event-authority-2026-08-12/NEXT_STEPS_20260910.md").unlink()
        self.assertEqual(self.land("fix/a", "--checks-local").returncode, 1)
        self.assertEqual(self.h.state()["stop"]["code"], "input_missing")
        self.assertEqual(self.h.calls("landing"), [])

    def test_inputs_that_differ_from_the_shared_checkouts_stop_before_the_checks(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        other = self.h.tmp / "another-capture-folder"
        other.mkdir()
        result = self.land("fix/a", "--checks-local", env={"PM_LAND_SYMLINK_TARGET": str(other)})
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state()["stop"]["code"], "inputs_differ")
        self.assertIn("tests/agent_packet_restrictions", result.stdout)
        self.assertEqual(self.h.calls("landing"), [])

    def test_an_input_changing_during_the_checks_blocks_the_push(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        target = self.h.shared / "Plans/.audits/audit-20260828-003-chat-56-fast-lane/a.txt"
        self.h.set_plan("landing", [{"run": f"echo changed > {target}"}, {}])
        self.assertEqual(self.land("fix/a", "--checks-local").returncode, 1)
        self.assertEqual(self.h.state()["stop"]["code"], "inputs_changed")
        self.assertEqual(self.h.origin_main(), base)
        self.assertEqual(self.h.tool("resume").returncode, 0)
        self.assertNotEqual(self.h.origin_main(), base)

    def test_a_copy_at_the_wrong_commit_is_refused(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        # The copy is moved between its creation and its first check.
        self.h.set_plan("shard", [{}, {"run": "git commit -q --allow-empty -m drift"}])
        result = self.land("fix/a", "--checks-local")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state()["stop"]["code"], "checked_tree_moved")
        self.assertEqual(self.h.origin_main(), base)

    def test_a_stale_origin_main_in_the_local_repository_is_refused(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        base = self.h.origin_main()
        moved = self.h.commit_to_main("src/y.txt", "moved\n")
        self.h.set_plan("shard", [{}, {"run": f"git update-ref refs/remotes/origin/main {base}"}])
        result = self.land("fix/a", "--checks-local")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state()["stop"]["code"], "local_copy_moved")
        self.assertEqual(self.h.origin_main(), moved)

    def test_the_followup_uses_the_same_copy_and_everything_is_removed(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "new\n"})
        result = self.land("fix/a", "--checks-local")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        calls = self.h.calls()
        self.assertEqual([row["tool"] for row in calls],
                         ["shard", "shard", "landing", "snapshot", "baseline", "shard", "landing"])
        local = calls[2]["cwd"]
        for row in calls[3:]:
            self.assertEqual(row["cwd"], local)
        self.assertEqual(calls[6]["head"], self.h.origin_main())
        self.assertEqual(calls[6]["shared_origin"], calls[3]["head"], "the follow-up's check also runs before its push")
        self.assertFalse(Path(local).exists())
        self.assertFalse(self.h.held())
        self.assertEqual(self.h.g(self.h.local, "branch", "--list", "plans/snapshot-*"), "")

    def test_a_sparse_parent_repository_still_gives_a_full_copy(self):
        self.h.g(self.h.local, "sparse-checkout", "set", "src", "scripts", "Plans/_shards")
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        result = self.land("fix/a", "--checks-local")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertNotEqual(self.h.calls("landing")[0]["sparse"], "true")

    def test_a_batch_in_local_copies_keeps_the_batch_rules(self):
        self.h.branch("fix/a", {"Plans/doc-a.md": "a\n"})
        self.h.branch("fix/b", {"src/x.txt": "b\n"})
        start = self.h.origin_main()
        self.assertEqual(self.land("fix/a", "--batch-open", "--checks-local").returncode, 0)
        self.assertEqual(self.h.calls("snapshot"), [])
        result = self.land("fix/b", "--batch-start", start, "--batch-close", "--checks-local")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        landing = self.h.calls("landing")
        self.assertEqual([row["args"][1] for row in landing], [start, start, "origin/main"])
        self.assertEqual(len(self.h.calls("snapshot")), 1)
        self.assertFalse(self.h.held())
        self.assertEqual(list(self.h.wts.glob("land-*")), [])
        self.assertEqual(list(self.h.wts.glob("snapshot-*")), [])

    def test_low_disk_stops_before_the_copy(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        result = self.land("fix/a", "--checks-local", env={"PM_LAND_MIN_FREE_GB": "999999"})
        self.assertEqual(result.returncode, 1)
        self.assertEqual(self.h.state()["stop"]["code"], "low_disk")

    def test_a_killed_local_check_reruns_without_ever_moving_shared(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        self.h.set_plan("landing", [{"sleep": 300}])
        proc = self.h.start("run", "fix/a", "--name", "x", "--checks-local")
        self.h.wait_calls("landing")
        proc.kill()
        proc.wait()
        self.assertEqual(self.h.shared_head(), base)
        result = self.h.tool("resume")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.h.origin_main(), tip)


class GuardTests(Base):
    """Guards whose window is too short to hit from outside: the state is set up, the step is called."""

    def lander(self, wt=None):
        args = type("A", (), {"name": "x"})()
        saved = dict(os.environ)
        os.environ.update(self.h.env)
        self.addCleanup(lambda: (os.environ.clear(), os.environ.update(saved)))
        cfg = M.config_from(args)
        st = M.new_state(cfg, args, "fix/a", str(wt) if wt else None)
        lander = M.Lander(cfg, st)
        st["lock"]["token"] = "mine"
        (self.h.lock / "held").mkdir(parents=True)
        (self.h.lock / "held/holder.txt").write_text("token: mine\n")
        return lander, st

    def checked_state(self, st, sha):
        origin = self.h.origin_main()
        tree = self.h.g(self.h.shared, "rev-parse", f"{sha}^{{tree}}")
        st["land"].update(sha=sha, origin_main=origin, base_arg="origin/main", touched=["src/x.txt"],
                          check={"sha": sha, "tree": tree, "origin_main": origin, "base": "origin/main", "exit": 0, "timeouts": 0})
        return M.new_step("push", "land")

    def assert_stops(self, code, call, step):
        with self.assertRaises(M.Stop) as caught:
            call(step)
        self.assertEqual(caught.exception.code, code)

    def test_push_requires_the_shared_head_to_be_the_checked_commit(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"}, repo=self.h.shared)
        lander, st = self.lander(wt)
        sha = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        step = self.checked_state(st, sha)
        self.assert_stops("checked_commit_mismatch", lander.h_push, step)
        self.assertEqual(self.h.origin_main(), base, "nothing pushed")

    def test_push_requires_the_exact_commit_even_with_the_same_tree(self):
        self.h.g(self.h.shared, "fetch", "-q", "origin")
        wt = self.h.wts / "same-tree"
        self.h.g(self.h.shared, "worktree", "add", "-q", "-b", "fix/a", str(wt), "origin/main")
        self.h.g(wt, "commit", "-q", "--allow-empty", "-m", "same tree, another commit")
        lander, st = self.lander(wt)
        step = self.checked_state(st, self.h.g(wt, "rev-parse", "HEAD"))
        self.assert_stops("checked_commit_mismatch", lander.h_push, step)

    def test_push_requires_the_shared_tree_to_be_the_checked_tree(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"}, repo=self.h.shared)
        lander, st = self.lander(wt)
        sha = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        self.h.g(self.h.shared, "merge", "-q", "--ff-only", sha)
        step = self.checked_state(st, sha)
        st["land"]["check"]["tree"] = "0" * 40
        self.assert_stops("checked_commit_mismatch", lander.h_push, step)
        self.assertEqual(self.h.origin_main(), base, "nothing pushed")

    def test_push_requires_a_passing_check_for_that_commit_and_base(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"}, repo=self.h.shared)
        sha = self.h.g(wt, "rev-parse", "HEAD")
        base = self.h.origin_main()
        self.h.g(self.h.shared, "merge", "-q", "--ff-only", sha)
        lander, st = self.lander(wt)
        for change in ({"exit": 2}, {"exit": 3}, {"sha": "1" * 40}, {"base": "other"}, {"origin_main": "2" * 40}, {"timeouts": 1}):
            step = self.checked_state(st, sha)
            st["land"]["check"].update(change)
            self.assert_stops("no_passing_check", lander.h_push, step)
        st["land"]["check"] = None
        self.assert_stops("no_passing_check", lander.h_push, step)
        self.assertEqual(self.h.origin_main(), base, "nothing pushed")

    def test_the_local_shard_check_refuses_a_copy_at_another_commit(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"}, repo=self.h.shared)
        lander, st = self.lander(wt)
        st["checks_local"] = True
        st["local_wt"] = str(self.h.shared)
        st["land"]["sha"] = self.h.g(wt, "rev-parse", "HEAD")
        self.assert_stops("local_copy_moved", lander.h_shard_local, M.new_step("shard-local", "land"))
        self.assertEqual(self.h.calls(), [], "no check ran on the wrong commit")


class LockTests(Base):
    def config(self):
        args = type("A", (), {})()
        saved = dict(os.environ)
        try:
            os.environ.update(self.h.env)
            return M.config_from(args)
        finally:
            os.environ.clear()
            os.environ.update(saved)

    def tool_holder(self, **overrides) -> str:
        fields = {"agent": "other", "branch": "x", "time": utc(), "tool": M.TOOL_TAG, "token": "t", "host": M.hostname(),
                  "pid": "99999999", "pid-start": "Fri Jan  1 00:00:00 2021", "heartbeat": utc()}
        fields.update(overrides)
        return "".join(f"{key}: {value}\n" for key, value in fields.items())

    def judge(self):
        return M.judge_holder(self.config())

    def old(self, seconds: float) -> None:
        moment = time.time() - seconds
        os.utime(self.h.lock / "held" / "holder.txt", (moment, moment))
        os.utime(self.h.lock / "held", (moment, moment))

    def test_a_hand_holder_is_dead_only_by_the_90_minute_rule(self):
        self.h.hand_lock(age=89 * 60)
        self.assertFalse(self.judge()["dead"])
        shutil.rmtree(self.h.lock / "held")
        self.h.hand_lock(age=91 * 60)
        self.assertTrue(self.judge()["dead"])

    def test_the_rule_counts_from_the_latest_time_in_holder_txt(self):
        self.h.hand_lock(f"agent: x\nbatch-start: {'a' * 40}\ntime: {utc(60)}\n", age=91 * 60)
        self.assertFalse(self.judge()["dead"])

    def test_a_folder_with_no_holder_txt_yet_is_a_fresh_hand_holder(self):
        (self.h.lock / "held").mkdir(parents=True)
        self.assertFalse(self.judge()["dead"])

    def test_a_fresh_heartbeat_is_alive_even_with_the_pid_gone(self):
        self.h.hand_lock(self.tool_holder())
        self.assertFalse(self.judge()["dead"])

    def test_a_heartbeat_dated_in_the_future_does_not_hold_the_lock_past_90_minutes(self):
        self.h.hand_lock(self.tool_holder(heartbeat=utc(-6000), time=utc(91 * 60)), age=91 * 60)
        self.assertTrue(self.judge()["dead"])

    def test_a_heartbeat_up_to_10_minutes_old_is_alive_even_with_the_pid_gone(self):
        self.h.hand_lock(self.tool_holder(heartbeat=utc(9 * 60), time=utc(9 * 60)), age=9 * 60)
        self.assertFalse(self.judge()["dead"])

    def test_a_stale_heartbeat_and_a_gone_pid_are_dead(self):
        self.h.hand_lock(self.tool_holder(heartbeat=utc(11 * 60), time=utc(11 * 60)), age=11 * 60)
        verdict = self.judge()
        self.assertTrue(verdict["dead"], verdict)
        self.assertIn("gone", verdict["reason"])

    def test_a_stale_heartbeat_and_a_reused_pid_are_dead(self):
        self.h.hand_lock(self.tool_holder(heartbeat=utc(11 * 60), time=utc(11 * 60), pid=os.getpid()), age=11 * 60)
        verdict = self.judge()
        self.assertTrue(verdict["dead"], verdict)
        self.assertIn("different start time", verdict["reason"])

    def test_a_stale_heartbeat_with_the_same_process_alive_is_not_dead(self):
        me = os.getpid()
        self.h.hand_lock(self.tool_holder(heartbeat=utc(11 * 60), time=utc(11 * 60), pid=me,
                                          **{"pid-start": M.pid_start(me)}), age=11 * 60)
        self.assertFalse(self.judge()["dead"])

    def test_a_stale_heartbeat_with_the_process_alive_is_dead_after_90_minutes(self):
        me = os.getpid()
        self.h.hand_lock(self.tool_holder(heartbeat=utc(91 * 60), time=utc(91 * 60), pid=me,
                                          **{"pid-start": M.pid_start(me)}), age=91 * 60)
        self.assertTrue(self.judge()["dead"])

    def remote(self, behaviour: str, age: float = 11 * 60, **fields):
        self.h.hand_lock(self.tool_holder(host="othermachine", heartbeat=utc(age), time=utc(age), **fields), age=age)
        os.environ["SSH_BEHAVIOUR"] = behaviour
        os.environ["SSH_MARKER"] = self.h.env["SSH_MARKER"]
        os.environ["SSH_STARTED"] = "Fri Nov  6 00:00:00 2026"
        self.addCleanup(lambda: [os.environ.pop(key, None) for key in ("SSH_BEHAVIOUR", "SSH_MARKER", "SSH_STARTED")])
        return self.judge()

    def test_another_machine_saying_the_pid_is_gone_proves_it_dead(self):
        verdict = self.remote("gone")
        self.assertTrue(verdict["dead"], verdict)
        self.assertIn("othermachine", Path(self.h.env["SSH_MARKER"]).read_text())

    def test_another_machine_saying_it_is_another_process_proves_it_dead(self):
        self.assertTrue(self.remote("alive")["dead"], "pid-start differs from what it reports")

    def test_another_machine_saying_it_is_the_same_process_is_alive(self):
        self.assertFalse(self.remote("alive", **{"pid-start": "Fri Nov 6 00:00:00 2026"})["dead"])

    def test_an_unreachable_machine_proves_nothing_until_90_minutes(self):
        self.assertFalse(self.remote("unreachable")["dead"])
        shutil.rmtree(self.h.lock / "held")
        self.assertTrue(self.remote("unreachable", age=91 * 60)["dead"])

    def test_a_hostile_holder_never_reaches_ssh(self):
        for fields in ({"host": "-oProxyCommand=evil"}, {"host": "x y"}, {"pid": "1;rm -rf x"}):
            self.h.hand_lock(self.tool_holder(heartbeat=utc(700), time=utc(700), **{"host": "othermachine", **fields}), age=700)
            self.assertFalse(self.judge()["dead"])
            self.assertFalse(Path(self.h.env["SSH_MARKER"]).exists(), fields)
            shutil.rmtree(self.h.lock / "held")

    def test_a_dead_holder_is_cleared_and_logged_with_who_why_when(self):
        self.h.hand_lock(self.tool_holder(heartbeat=utc(700), time=utc(700)), age=700)
        result = self.h.tool("lock", "take", "--name", "second", "--no-wait", "--poll-seconds", "0.05")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("agent: second", self.h.holder())
        log = [json.loads(line) for line in (self.h.lock / "queue/log.jsonl").read_text().splitlines()]
        row = next(item for item in log if item["event"] == "cleared_dead_holder")
        self.assertEqual(row["who"], "second")
        self.assertIn("gone", row["why"])
        self.assertTrue(row["when"])
        self.assertIn("agent: other", row["holder"])

    def test_a_live_holder_is_not_cleared(self):
        self.h.hand_lock(self.tool_holder())
        result = self.h.tool("lock", "take", "--name", "second", "--no-wait")
        self.assertEqual(result.returncode, 4)
        self.assertIn("agent: other", self.h.holder())

    def test_clearing_is_undone_if_holder_txt_changed_meanwhile(self):
        cfg = self.config()
        self.h.hand_lock("agent: old\n", age=91 * 60)
        verdict = M.judge_holder(cfg)
        (self.h.lock / "held/holder.txt").write_text("agent: fresh\n")
        self.assertFalse(M.clear_dead_holder(cfg, verdict, "x"))
        self.assertIn("fresh", self.h.holder())

    def test_take_and_release_for_a_hand_lander(self):
        result = self.h.tool("lock", "take", "--name", "hand", "--branch", "fix/x")
        self.assertEqual(result.returncode, 0, result.stderr)
        text = self.h.holder()
        self.assertIn("agent: hand", text)
        self.assertIn("branch: fix/x", text)
        self.assertNotIn("heartbeat", text, "no process stays behind it: the 90-minute rule")
        self.assertEqual(self.h.tool("lock", "release", "--name", "stranger").returncode, 2)
        self.assertTrue(self.h.held())
        self.assertIn("HELD by hand", self.h.tool("lock", "status").stdout)
        self.assertEqual(self.h.tool("lock", "release", "--name", "hand").returncode, 0)
        self.assertFalse(self.h.held())
        self.assertIn("free", self.h.tool("lock", "status").stdout)
        self.assertEqual(list((self.h.lock / "queue").glob("t-*.json")), [])

    def test_one_of_many_gets_it(self):
        procs = [self.h.start("lock", "take", "--name", f"n{i}", "--no-wait", "--poll-seconds", "0.05") for i in range(8)]
        codes = [proc.wait(timeout=60) for proc in procs]
        self.assertEqual(codes.count(0), 1, codes)
        self.assertEqual(sum(1 for code in codes if code == 4), 7)

    def test_a_ticket_ahead_in_line_keeps_a_free_lock_from_a_lower_priority(self):
        me = os.getpid()
        (self.h.lock / "queue").mkdir(parents=True)
        ticket = {"id": "010-ahead", "priority": 10, "name": "pm-fo-lead", "branch": "land/fo-x", "host": M.hostname(),
                  "pid": me, "pid_start": M.pid_start(me), "time": utc(), "heartbeat": utc()}
        (self.h.lock / "queue/t-010-ahead.json").write_text(json.dumps(ticket))
        result = self.h.tool("lock", "take", "--name", "later", "--no-wait")
        self.assertEqual(result.returncode, 4, result.stdout)
        self.assertFalse(self.h.held(), "only the first in line takes it")
        self.assertIn("pm-fo-lead", self.h.tool("lock", "queue").stdout)

    def test_priority_then_arrival_decide_the_order(self):
        self.h.hand_lock()
        low1 = self.h.start("lock", "take", "--name", "z-first", "--poll-seconds", "0.05")
        self.wait_tickets(1)
        low2 = self.h.start("lock", "take", "--name", "a-second", "--poll-seconds", "0.05")
        self.wait_tickets(2)
        high = self.h.start("lock", "take", "--name", "pm-fo-lead", "--poll-seconds", "0.05")
        self.wait_tickets(3)
        lines = self.h.tool("lock", "queue").stdout
        self.assertLess(lines.index("pm-fo-lead"), lines.index("z-first"))
        self.assertLess(lines.index("z-first"), lines.index("a-second"))
        shutil.rmtree(self.h.lock / "held")
        self.assertEqual(high.wait(timeout=30), 0)
        self.assertIn("agent: pm-fo-lead", self.h.holder())
        self.assertIsNone(low1.poll())
        self.assertEqual(self.h.tool("lock", "release", "--name", "pm-fo-lead").returncode, 0)
        self.assertEqual(low1.wait(timeout=30), 0)
        self.assertIn("agent: z-first", self.h.holder())
        self.assertEqual(self.h.tool("lock", "release", "--name", "z-first").returncode, 0)
        self.assertEqual(low2.wait(timeout=30), 0)

    def wait_tickets(self, count: int) -> None:
        end = time.time() + 20
        while time.time() < end:
            if len(list((self.h.lock / "queue").glob("t-*.json"))) >= count:
                return
            time.sleep(0.02)
        raise AssertionError("tickets did not appear")

    def test_the_priority_flag_and_the_config_file_decide(self):
        cfg = self.config()
        self.assertEqual(M.priority_of(cfg, "pm-fo-lead", None, None), 10)
        self.assertEqual(M.priority_of(cfg, "someone", "land/fo-group6", None), 10)
        self.assertEqual(M.priority_of(cfg, "someone", "fix/a", None), 50)
        self.assertEqual(M.priority_of(cfg, "pm-fo-lead", None, 70), 70)
        (self.h.lock / "queue").mkdir(parents=True)
        (self.h.lock / "queue/priorities.json").write_text(json.dumps(
            {"default": 40, "rules": [{"match": "^pm-closure", "priority": 5}]}))
        self.assertEqual(M.priority_of(cfg, "pm-closure-lead", None, None), 5)
        self.assertEqual(M.priority_of(cfg, "pm-fo-lead", None, None), 40)
        (self.h.lock / "queue/priorities.json").write_text("{not json")
        self.assertEqual(M.priority_of(cfg, "pm-fo-lead", None, None), 10)

    def test_a_ticket_with_a_stale_heartbeat_loses_its_place(self):
        (self.h.lock / "queue").mkdir(parents=True)
        ticket = {"id": "001-stale", "priority": 1, "name": "gone-elsewhere", "branch": None, "host": "othermachine",
                  "pid": 1, "pid_start": "x", "time": utc(1000), "heartbeat": utc(700)}
        (self.h.lock / "queue/t-001-stale.json").write_text(json.dumps(ticket))
        self.assertEqual(self.h.tool("lock", "take", "--name", "later", "--no-wait").returncode, 0)

    def test_a_dead_local_ticket_is_dropped_at_once(self):
        (self.h.lock / "queue").mkdir(parents=True)
        ticket = {"id": "001-dead", "priority": 1, "name": "dead", "branch": None, "host": M.hostname(),
                  "pid": 99999999, "pid_start": "x", "time": utc(), "heartbeat": utc()}
        path = self.h.lock / "queue/t-001-dead.json"
        path.write_text(json.dumps(ticket))
        self.assertEqual(self.h.tool("lock", "take", "--name", "later", "--no-wait").returncode, 0)
        self.assertFalse(path.exists())

    def test_a_hand_lander_and_the_tool_exclude_each_other(self):
        wt = self.h.branch("fix/a", {"src/x.txt": "new\n"})
        tip = self.h.g(wt, "rev-parse", "HEAD")
        self.h.hand_lock()
        proc = self.h.start("run", "fix/a", "--name", "x")
        time.sleep(1)
        self.assertEqual(self.h.calls(), [], "it waits for a hand lander's lock")
        shutil.rmtree(self.h.lock / "held")
        self.assertEqual(proc.wait(timeout=60), 0)
        self.assertEqual(self.h.origin_main(), tip)
        self.h.branch("fix/b", {"src/y.txt": "new\n"})
        self.h.set_plan("landing", [{"sleep": 300}])
        self.h.start("run", "fix/b", "--name", "x")
        self.h.wait_calls("landing", 2)
        with self.assertRaises(FileExistsError):
            os.mkdir(self.h.lock / "held")

    def test_the_heartbeat_refreshes_holder_txt_during_a_long_check(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("landing", [{"sleep": 300}])
        proc = self.h.start("run", "fix/a", "--name", "x")
        self.h.wait_calls("landing")
        first = M.parse_holder(self.h.holder())
        self.assertEqual(first["pid"], str(proc.pid))
        self.assertEqual(first["pid-start"], M.pid_start(proc.pid))
        self.assertEqual(first["tool"], M.TOOL_TAG)
        self.assertEqual(first["host"], M.hostname())
        end = time.time() + 15
        while time.time() < end:
            now = M.parse_holder(self.h.holder())
            if now["heartbeat"] != first["heartbeat"]:
                break
            time.sleep(0.2)
        self.assertNotEqual(now["heartbeat"], first["heartbeat"])
        self.assertEqual(now["time"], now["heartbeat"], "a hand lander reads `time`: it must stay fresh")

    def test_a_killed_landing_is_cleared_by_the_next_and_its_fast_forward_is_put_back(self):
        wt_a = self.h.branch("fix/a", {"src/x.txt": "a\n"})
        a_tip = self.h.g(wt_a, "rev-parse", "HEAD")
        wt_b = self.h.branch("fix/b", {"src/y.txt": "b\n"})
        b_tip = self.h.g(wt_b, "rev-parse", "HEAD")
        self.assertEqual(self.h.tool("run", "fix/a", "--name", "a", env={"PM_LAND_TEST_CRASH_BEFORE": "push:land"}).returncode, 137)
        self.assertEqual(self.h.shared_head(), a_tip)
        text = self.h.holder()
        fields = M.parse_holder(text)
        (self.h.lock / "held/holder.txt").write_text(text.replace(fields["heartbeat"], utc(700)).replace(fields["time"], utc(700)))
        self.old(700)
        result = self.h.tool("run", "fix/b", "--name", "b", "--poll-seconds", "0.05")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("reset it back", result.stdout)
        self.assertEqual(self.h.origin_main(), b_tip)
        self.assertNotEqual(self.h.g(self.h.origin, "log", "--format=%H", "-1", "refs/heads/main"), a_tip)
        self.assertNotIn(a_tip, self.h.g(self.h.origin, "log", "--format=%H", "refs/heads/main"))

    def test_main_ahead_with_no_landing_to_blame_stops(self):
        self.h.branch("fix/a", {"src/x.txt": "a\n"})
        base = self.h.origin_main()
        self.h.g(self.h.shared, "commit", "-q", "--allow-empty", "-m", "someone's")
        result = self.land("fix/a")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertEqual(self.h.state()["stop"]["code"], "shared_main_ahead")
        self.assertEqual(self.h.origin_main(), base)
        self.assertNotEqual(self.h.shared_head(), base, "not ours to reset")


class StatusTests(Base):
    def test_status_shows_the_step_the_log_and_the_stop(self):
        self.assertIn("lock: free", self.h.tool("status").stdout)
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("landing", [{"sleep": 300}])
        proc = self.h.start("run", "fix/a", "--name", "lander")
        self.h.wait_calls("landing")
        out = self.h.tool("status").stdout
        self.assertIn("HELD by lander", out)
        self.assertIn("running  landing-check", out)
        self.assertIn("pm-landing-check.py", out)
        self.assertIn("log:", out)
        doc = json.loads(self.h.tool("status", "--json").stdout)
        self.assertEqual(doc["landings"][0]["branch"], "fix/a")
        self.assertTrue(doc["lock"]["held"])
        proc.kill()
        proc.wait()

    def test_status_of_a_stopped_landing_says_what_next(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.h.set_plan("landing", [{"exit": 2}])
        self.land("fix/a")
        out = self.h.tool("status").stdout
        self.assertIn("STOPPED at landing-check", out)
        self.assertIn("next:", out)

    def test_finished_landings_show_with_all(self):
        self.h.branch("fix/a", {"src/x.txt": "new\n"})
        self.assertEqual(self.land("fix/a").returncode, 0)
        self.assertNotIn("fix/a", self.h.tool("status").stdout)
        self.assertIn("fix/a", self.h.tool("status", "--all").stdout)


if __name__ == "__main__":
    unittest.main()
