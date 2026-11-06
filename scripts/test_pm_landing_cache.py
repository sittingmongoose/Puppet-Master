"""The landing check's result cache: run with `python3 -m unittest scripts/test_pm_landing_cache.py`.

Everything here runs against a small real git repository in a temporary folder, with its own validators, the real
strace and the real pm-landing-check.py. The one exception, TheRealSpawnPath, runs one cheap real validator through the
real pm-plans-verify.py; it reads the checkout and writes nothing to it. Most tests are negatives: an input changes, and
the part that read it has to run again while the others do not.
"""

from __future__ import annotations

import argparse
import ast
import gzip
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
import time
import unittest

REPO = Path(__file__).resolve().parents[1]
MODULE_PATH = REPO / "scripts" / "pm_landing_cache.py"
LANDING_PATH = REPO / "scripts" / "pm-landing-check.py"
VERIFY_PATH = REPO / "scripts" / "pm-plans-verify.py"

spec = importlib.util.spec_from_file_location("pm_landing_cache", MODULE_PATH)
C = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = C
spec.loader.exec_module(C)

HAS_STRACE = C.Tracer().problem is None

# The contract of the real script, kept small: the aggregate spawns through run_validator_subprocess, by name, with
# this argv. ContractWithTheRealScript below checks that the real one still has this shape.
FAKE_VERIFY = r'''#!/usr/bin/env python3
import argparse, json, os, signal, subprocess, sys, tempfile, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
_AGGREGATE_CHILD_ENV = "PM_PLANS_VERIFY_AGGREGATE_CHILD"


def report_status(name, failures, **extra):
    return {"schema_id": "fake", "check": name, "generated_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "status": "pass" if not failures else "fail", "failures": failures, **extra}


def run_validator_subprocess(check_name, argv, *, timeout_seconds, extra_failure_fields=None, aggregate_child=False):
    env = None
    if aggregate_child:
        env = os.environ.copy()
        env[_AGGREGATE_CHILD_ENV] = "1"
    proc = subprocess.Popen(argv, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            start_new_session=True, env=env)
    try:
        out, err = proc.communicate(timeout=timeout_seconds or None)
    except subprocess.TimeoutExpired:
        os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        proc.communicate()
        return None, report_status(check_name, [{"error": "subprocess_timeout", "timeout_seconds": timeout_seconds,
                                                 **(extra_failure_fields or {})}])
    return subprocess.CompletedProcess(args=argv, returncode=proc.returncode, stdout=out, stderr=err), None


def _aggregate_subcheck_command_id(name):
    return {"plan_graph": "validate-plan-graph", "evidence": "validate-evidence",
            "auto_decisions": "validate-auto-decisions", "wiring_matrix": "validate-wiring-matrix"}.get(name, name.replace("_", "-"))


def _aggregate_subcheck_cli_args(name, namespace, *, timeout_seconds=None):
    return ["--subcheck-timeout-seconds", str(int(timeout_seconds or 0))] if name in {"validate_plan_graph", "plan_graph"} else []


def _run_subprocess_check(name, namespace, *, timeout_seconds):
    command = _aggregate_subcheck_command_id(name)
    tmp = tempfile.NamedTemporaryFile(prefix=f"pm-subcheck-{name}-", suffix=".json", delete=False)
    tmp.close()
    path = Path(tmp.name)
    try:
        argv = [sys.executable, "scripts/pm-plans-verify.py", command, "--report", str(path),
                *_aggregate_subcheck_cli_args(name, namespace, timeout_seconds=timeout_seconds)]
        proc, timeout_report = run_validator_subprocess(name, argv, timeout_seconds=timeout_seconds,
                                                        extra_failure_fields={"command_id": command}, aggregate_child=True)
        if timeout_report is not None:
            timeout_report["check"] = name
            return timeout_report
        report = json.loads(path.read_text()) if path.stat().st_size else json.loads(proc.stdout)
        report["check"] = name
        return report
    finally:
        path.unlink(missing_ok=True)


def compact(report):
    return {"status": report.get("status"), "failures": len(report.get("failures", []))}


RUN_GATES = ["validate_evidence", "validate_auto_decisions", "validate_plan_graph", "validate_wiring_matrix"]
AUDIT = ["evidence", "auto_decisions", "plan_graph", "wiring_matrix"]


def cmd_run_gates(args):
    t = args.subcheck_timeout_seconds
    checks = [(name, _run_subprocess_check(name, None, timeout_seconds=t)) for name in RUN_GATES]
    failures = [{"check": name, "status": r["status"], "failures": r["failures"][:50]} for name, r in checks if r["status"] != "pass"]
    return report_status("run-gates", failures, checks={name: compact(r) for name, r in checks}, subcheck_timeout_seconds=t)


def cmd_audit_governance(args):
    t = args.subcheck_timeout_seconds
    checks = [(name, _run_subprocess_check(name, None, timeout_seconds=t)) for name in AUDIT]
    failures = [{"check": name, "failures": r["failures"][:100]} for name, r in checks if r["status"] != "pass"]
    return report_status("audit-governance", failures, subcheck_timeout_seconds=t, **{name: compact(r) for name, r in checks})


def rows_from(path, error):
    text = (ROOT / path).read_text() if (ROOT / path).exists() else ""
    return [{"error": error, "path": path, "line": line, "where": str(ROOT)} for line in text.splitlines() if line.startswith("FAIL")]


def v_a(args):
    names = sorted(os.listdir(ROOT / "listed"))
    rows = rows_from("a.txt", "a_failed")
    rows += [{"error": "listed_bad", "path": "listed/" + n} for n in names if n.startswith("bad")]
    return report_status("a", rows, listed=names, where=str(ROOT))


def v_b(args):
    return report_status("b", rows_from("b.txt", "b_failed"))


def v_many(args):
    return report_status("many", [{"error": "kept", "path": "many.txt", "row": i} for i in range(60)])


def v_wiring(args):
    if (ROOT / "mutate.flag").exists():
        (ROOT / "b.txt").write_text("changed while the run was going\n")
    return report_status("wiring", [])


def v_absent(args):
    return report_status("absent", [{"error": "appeared", "path": "maybe.txt"}] if (ROOT / "maybe.txt").exists() else [])


def v_stat_size(args):
    return report_status("size", [{"error": "big", "path": "sized.txt"}] if (ROOT / "sized.txt").stat().st_size > 5 else [])


def v_link(args):
    return report_status("link", [], target=os.readlink(ROOT / "link"))


def v_listed_link(args):
    return report_status("listed_link", [], names=sorted(os.listdir(ROOT / "linked")))


def v_env(args):
    return report_status("env", [], value=os.environ.get("PM_EVIDENCE_MAP", ""))


def git(*argv, **kwargs):
    return subprocess.run(["git", "-C", str(ROOT), *argv], capture_output=True, text=True, **kwargs)


def v_git_files(args):
    return report_status("git-files", [], files=git("ls-files", "--cached", "--others", "--exclude-standard", "-z").stdout)


def v_git_origin(args):
    return report_status("git-origin", [], base=git("show", "origin/main:a.txt").stdout)


def v_git_head(args):
    return report_status("git-head", [], head=git("rev-parse", "HEAD").stdout.strip())


def v_git_batch(args):
    out = git("cat-file", "--batch-check", input="HEAD\n").stdout
    return report_status("git-batch", [], out=out)


def v_git_write(args):
    git("update-index", "--refresh")
    return report_status("git-write", [])


def v_git_selftest(args):
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["git", "-C", tmp, "init", "-q"], check=True)
    return report_status("git-selftest", [])


def v_writes(args):
    (ROOT / "generated.txt").write_text("x\n")
    return report_status("writes", [])


def v_timeout_row(args):
    return report_status("timeout-row", [{"error": "subprocess_timeout", "timeout_seconds": 1}])


def v_killed(args):
    subprocess.run([sys.executable, "-c", "import os,signal;os.kill(os.getpid(),signal.SIGKILL)"], check=False)
    return report_status("killed", [])


def v_crash(args):
    os._exit(7)


def v_sleep(args):
    text = (ROOT / "a.txt").read_text()
    time.sleep(1.5)
    return report_status("sleep", [], text=text)


def v_git_files_slow(args):
    out = git("ls-files", "--cached", "--others", "--exclude-standard", "-z").stdout
    time.sleep(1.5)
    return report_status("git-files-slow", [], files=out)


def v_helper(args):
    import helper_mod
    return report_status("helper", [], value=helper_mod.VALUE)


def v_scratch(args):
    with tempfile.TemporaryDirectory() as tmp:
        (Path(tmp) / "x.txt").write_text("x")
        names = os.listdir(tmp)
        (Path(tmp) / "x.txt").read_text()
    return report_status("scratch", [], names=names)


def v_scratch_link(args):
    with tempfile.TemporaryDirectory() as tmp:
        link = os.path.join(tmp, "through")
        os.symlink(str(ROOT / "a.txt"), link)
        return report_status("scratch_link", [], text=open(link).read())


def v_scratch_link_relative(args):
    with tempfile.TemporaryDirectory() as tmp:
        link = os.path.join(tmp, "through")
        os.symlink(os.path.relpath(str(ROOT / "a.txt"), tmp), link)
        return report_status("scratch_link", [], text=open(link).read())


def v_scratch_link_folder(args):
    with tempfile.TemporaryDirectory() as tmp:
        link = os.path.join(tmp, "through")
        os.symlink(str(ROOT / "listed"), link)
        return report_status("scratch_link", [], text=open(os.path.join(link, "one.txt")).read())


def v_unicode(args):
    return report_status("unicode", [], text=(ROOT / "listed" / "café one.txt").read_text())


COMMANDS = {"validate-evidence": v_a, "validate-auto-decisions": v_b, "validate-plan-graph": v_many, "validate-wiring-matrix": v_wiring,
            "absent": v_absent, "stat-size": v_stat_size, "link": v_link, "listed-link": v_listed_link, "env": v_env,
            "git-files": v_git_files, "git-origin": v_git_origin, "git-head": v_git_head, "git-batch": v_git_batch,
            "git-write": v_git_write, "git-selftest": v_git_selftest, "writes": v_writes, "timeout-row": v_timeout_row,
            "killed": v_killed, "crash": v_crash, "helper": v_helper, "sleep": v_sleep, "git-files-slow": v_git_files_slow, "scratch": v_scratch, "unicode": v_unicode,
            "scratch-link": v_scratch_link, "scratch-link-relative": v_scratch_link_relative, "scratch-link-folder": v_scratch_link_folder,
            "run-gates": cmd_run_gates, "audit-governance": cmd_audit_governance}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("command")
    parser.add_argument("--report")
    parser.add_argument("--quiet-progress", action="store_true")
    parser.add_argument("--subcheck-timeout-seconds", type=int, default=60)
    args = parser.parse_args()
    report = COMMANDS[args.command](args)
    if args.report:
        Path(args.report).write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    print(json.dumps({k: report[k] for k in report if k in {"check", "status", "failures", "generated_at_utc"} or args.command not in {"run-gates", "audit-governance"}}, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
'''

FAKE_MIGRATION = r'''#!/usr/bin/env python3
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
run = Path(sys.argv[sys.argv.index("--run-dir") + 1])
text = (ROOT / run / "inventory.txt").read_text()
rows = [{"error": "migration_failed", "path": str(run / "inventory.txt"), "line": line} for line in text.splitlines() if line.startswith("FAIL")]
print(json.dumps({"status": "pass" if not rows else "fail", "failures": rows}))
raise SystemExit(0 if not rows else 1)
'''


class Fixture(unittest.TestCase):
    """A small real repository with validators, and a cache folder beside it."""

    def setUp(self):
        self.scratch = Path(tempfile.mkdtemp(prefix="landing-cache-test-")).resolve()
        self.addCleanup(shutil.rmtree, self.scratch, ignore_errors=True)
        self.root = self.scratch / "repo"
        self.cache = self.scratch / "cache"
        self.stats = self.scratch / "units.jsonl"
        self.make_repo(self.root)

    def write(self, name, text, root=None):
        path = (root or self.root) / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def git(self, *argv, root=None):
        return subprocess.run(["git", "-C", str(root or self.root), "-c", "user.name=t", "-c", "user.email=t@invalid", *argv],
                              check=True, capture_output=True, text=True).stdout.strip()

    def make_repo(self, root):
        root.mkdir()
        self.git("init", "-q", "-b", "main", root=root)
        self.write("scripts/pm-plans-verify.py", FAKE_VERIFY, root)
        self.write("scripts/pm-plan-migration.py", FAKE_MIGRATION, root)
        shutil.copy(LANDING_PATH, root / "scripts" / "pm-landing-check.py")
        shutil.copy(MODULE_PATH, root / "scripts" / "pm_landing_cache.py")
        self.write("scripts/helper_mod.py", "VALUE = 1\n", root)
        self.write("a.txt", "fine\n", root)
        self.write("b.txt", "fine\n", root)
        self.write("sized.txt", "abc\n", root)
        self.write("listed/one.txt", "one\n", root)
        self.write("listed/café one.txt", "accent\n", root)
        self.write("linked_target/x.txt", "x\n", root)
        (root / "linked").symlink_to("linked_target", target_is_directory=True)
        (root / "link").symlink_to("a.txt")
        self.write("Plans/.plan_migration/current_run.json", json.dumps({"run_path": "Plans/.plan_migration/run-1"}), root)
        self.write("Plans/.plan_migration/run-1/inventory.txt", "fine\n", root)
        self.write(".gitignore", "__pycache__/\nmutate.flag\nmaybe.txt\ngenerated.txt\n", root)
        self.git("add", "-A", root=root)
        self.git("commit", "-q", "-m", "start", root=root)
        self.git("update-ref", "refs/remotes/origin/main", "HEAD", root=root)

    def unit(self, command, env=None, root=None, margin_ms=0):
        """Run one validator through the cache; returns (its row in the stats, exit code, stdout)."""
        self.stats.unlink(missing_ok=True)
        root = root or self.root
        argv = [sys.executable, str(MODULE_PATH), "exec", "--root", str(root), "--cache-dir", str(self.cache), "--stats", str(self.stats),
                "--label", "unit", "--race-margin-ms", str(margin_ms), "--", sys.executable, "scripts/pm-plans-verify.py", command]
        proc = subprocess.run(argv, cwd=root, capture_output=True, text=True, env={**os.environ, **(env or {})})
        rows = [json.loads(line) for line in self.stats.read_text().splitlines()] if self.stats.exists() else []
        self.assertEqual(len(rows), 1, (rows, proc.stderr))
        return rows[0], proc.returncode, proc.stdout

    def status(self, command, **kwargs):
        return self.unit(command, **kwargs)[0]["status"]

    def aggregate(self, name="run-gates", timeout=60):
        """One aggregate through the cache; returns ({subcheck: row}, the report it wrote, exit code)."""
        self.stats.unlink(missing_ok=True)
        report = self.scratch / f"{name}.json"
        argv = [sys.executable, str(MODULE_PATH), "exec", "--root", str(self.root), "--cache-dir", str(self.cache), "--stats", str(self.stats),
                "--label", name, "--race-margin-ms", "0", "--", sys.executable, "scripts/pm-plans-verify.py", name, "--quiet-progress",
                "--subcheck-timeout-seconds", str(timeout), "--report", str(report)]
        proc = subprocess.run(argv, cwd=self.root, capture_output=True, text=True)
        self.assertIn(proc.returncode, (0, 1), proc.stderr)
        rows = [json.loads(line) for line in self.stats.read_text().splitlines()]
        return {row["label"].split("/", 1)[1]: row for row in rows if "/" in row.get("label", "")}, json.loads(report.read_text()), proc.returncode


def lines(*text):
    return [line + "\n" for line in text]


class ReadingATrace(unittest.TestCase):
    root = Path("/repo")

    def read(self, *text, scratch=("/tmp",)):
        return C.TraceReader(self.root, scratch).read_lines(lines(*text))

    def test_a_file_opened_for_reading_is_read_with_the_root_as_a_token(self):
        trace = self.read('10 openat(AT_FDCWD</repo>, "Plans/a.md", O_RDONLY|O_CLOEXEC) = 3</repo/Plans/a.md>')
        self.assertEqual(trace.reads, {("file", "@ROOT/Plans/a.md")})
        self.assertEqual(trace.reasons, [])

    def test_a_missing_path_is_an_input_too(self):
        trace = self.read('10 newfstatat(AT_FDCWD</repo>, "maybe.txt", 0x7ffc, 0) = -1 ENOENT (No such file or directory)')
        self.assertEqual(trace.reads, {("stat", "@ROOT/maybe.txt")})
        self.assertEqual(trace.present, set())

    def test_lstat_and_stat_stay_apart(self):
        trace = self.read('10 newfstatat(AT_FDCWD</repo>, "a", {st_mode=S_IFREG|0644, st_size=1, ...}, AT_SYMLINK_NOFOLLOW) = 0',
                          '10 newfstatat(AT_FDCWD</repo>, "b", {st_mode=S_IFREG|0644, st_size=1, ...}, 0) = 0')
        self.assertEqual(trace.reads, {("lstat", "@ROOT/a"), ("stat", "@ROOT/b")})

    def test_a_listing_reads_the_folder_through_the_name_it_was_opened_by(self):
        trace = self.read('10 openat(AT_FDCWD</repo>, "linked", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = 3</elsewhere/target>',
                          '10 getdents64(3</elsewhere/target>, 0x4018 /* 3 entries */, 32768) = 80')
        self.assertIn(("list", "@ROOT/linked"), trace.reads)
        self.assertFalse(any(token.startswith("/elsewhere") for _kind, token in trace.reads))

    def test_a_relative_path_uses_the_directory_fd(self):
        trace = self.read('10 openat(5</repo/Plans>, "a.md", O_RDONLY) = 3</repo/Plans/a.md>')
        self.assertEqual(trace.reads, {("file", "@ROOT/Plans/a.md")})

    def test_a_chdir_moves_later_relative_paths(self):
        trace = self.read('10 chdir("/repo/Plans") = 0', '10 access("x.md", R_OK) = 0')
        self.assertEqual(trace.reads, {("stat", "@ROOT/Plans/x.md")})

    def test_a_child_inherits_its_parents_directory(self):
        trace = self.read('10 chdir("/repo/Plans") = 0', '11 readlink("x", 0x1, 10) = -1 EINVAL (Invalid argument)',
                          '10 vfork() = 11')
        self.assertEqual(trace.reads, {("link", "@ROOT/Plans/x")})

    def test_an_interrupted_call_is_joined_back_together(self):
        trace = self.read('10 openat(AT_FDCWD</repo>, "a.md", O_RDONLY <unfinished ...>', '11 access("/b", R_OK) = 0',
                          '10 <... openat resumed>) = 3</repo/a.md>')
        self.assertEqual(trace.reads, {("file", "@ROOT/a.md"), ("stat", "/b")})
        self.assertEqual(trace.reasons, [])

    def test_escaped_paths_decode(self):
        trace = self.read('10 openat(AT_FDCWD</repo>, "caf\\303\\251 \\"x\\".md", O_RDONLY) = 3</repo/caf\\303\\251 "x".md>')
        self.assertEqual(trace.reads, {("file", '@ROOT/café "x".md')})

    def test_a_comma_and_a_paren_in_a_path_do_not_split_it(self):
        trace = self.read('10 openat(AT_FDCWD</repo/a, (b)>, "c, (d).md", O_RDONLY) = 3</repo/a, (b)/c, (d).md>')
        self.assertEqual(trace.reads, {("file", "@ROOT/a, (b)/c, (d).md")})

    def test_bytecode_is_not_an_input_and_writing_it_is_no_side_effect(self):
        trace = self.read('10 openat(AT_FDCWD</repo>, "/repo/scripts/__pycache__/x.pyc", O_RDONLY) = 3</repo/scripts/__pycache__/x.pyc>',
                          '10 mkdir("/repo/scripts/__pycache__", 0777) = 0',
                          '10 rename("/repo/scripts/__pycache__/x.pyc.1", "/repo/scripts/__pycache__/x.pyc") = 0')
        self.assertEqual(trace.reads, set())
        self.assertEqual(trace.reasons, [])

    def test_pseudo_files_are_not_inputs(self):
        trace = self.read('10 openat(AT_FDCWD</repo>, "/proc/self/maps", O_RDONLY) = 3</proc/1/maps>',
                          '10 open("/dev/null", O_WRONLY) = 3</dev/null>')
        self.assertEqual((trace.reads, trace.reasons), (set(), []))

    def test_what_the_run_made_itself_is_not_an_input(self):
        trace = self.read('10 mkdir("/tmp/x1", 0700) = 0', '10 openat(AT_FDCWD</repo>, "/tmp/x1/y", O_WRONLY|O_CREAT, 0600) = 3</tmp/x1/y>',
                          '10 openat(AT_FDCWD</repo>, "/tmp/x1/y", O_RDONLY) = 3</tmp/x1/y>', '10 unlink("/tmp/x1/y") = 0', '10 rmdir("/tmp/x1") = 0')
        self.assertEqual((trace.reads, trace.reasons), (set(), []))

    def test_a_write_outside_scratch_stops_the_unit(self):
        trace = self.read('10 openat(AT_FDCWD</repo>, "out.txt", O_WRONLY|O_CREAT|O_TRUNC, 0666) = 3</repo/out.txt>')
        self.assertIn("it wrote outside scratch: @ROOT/out.txt", trace.reasons)

    def test_a_symlinks_target_is_read(self):
        """Review C1: what a run reads through a link it made itself is the target, so the target is an input."""
        for line, read in (('10 symlink("/repo/a.txt", "/tmp/x") = 0', "@ROOT/a.txt"),
                           ('10 symlinkat("/repo/a.txt", AT_FDCWD</tmp>, "x") = 0', "@ROOT/a.txt"),
                           ('10 symlink("../repo/a.txt", "/tmp/x") = 0', "@ROOT/a.txt"),
                           ('10 symlinkat("b.txt", AT_FDCWD</tmp/s>, "x") = 0', "/tmp/s/b.txt")):
            with self.subTest(line=line):
                trace = self.read(line)
                self.assertEqual((trace.reads, trace.reasons), ({("file", read)}, []))

    def test_a_symlink_to_what_the_run_made_itself_is_not_an_input(self):
        trace = self.read('10 mkdir("/tmp/x1", 0700) = 0', '10 openat(AT_FDCWD</repo>, "/tmp/x1/y", O_WRONLY|O_CREAT, 0600) = 3</tmp/x1/y>',
                          '10 symlink("/tmp/x1/y", "/tmp/x1/z") = 0', '10 symlink("y", "/tmp/x1/w") = 0')
        self.assertEqual((trace.reads, trace.reasons), (set(), []))

    def test_a_failed_symlink_reads_no_target(self):
        trace = self.read('10 symlink("/repo/a.txt", "/tmp/x") = -1 EEXIST (File exists)')
        self.assertEqual(trace.reads, {("stat", "/tmp/x")})

    def test_a_symlink_whose_target_cannot_be_read_stops_the_unit(self):
        self.assertTrue(any("target" in reason for reason in self.read('10 symlink(0x7ffc, "/tmp/x") = 0').reasons))

    def test_every_kind_of_write_counts(self):
        for line in ('10 unlink("/repo/x") = 0', '10 rename("/tmp/a", "/repo/x") = 0', '10 mkdir("/repo/x", 0777) = 0',
                     '10 symlink("t", "/repo/x") = 0', '10 unlinkat(AT_FDCWD</repo>, "x", 0) = 0',
                     '10 renameat2(AT_FDCWD</repo>, "a", AT_FDCWD</repo>, "x", 0) = 0',
                     '10 chmod("/repo/x", 0644) = 0', '10 utimensat(AT_FDCWD</repo>, "x", NULL, 0) = 0', '10 truncate("/repo/x", 0) = 0'):
            with self.subTest(line=line):
                self.assertTrue(any("wrote outside scratch" in reason for reason in self.read(line).reasons), line)

    def test_a_call_that_failed_with_a_transient_error_stops_the_unit(self):
        for error in ("EIO (Input/output error)", "ESTALE (Stale file handle)", "ENOMEM (Cannot allocate memory)", "EMFILE (Too many open files)"):
            with self.subTest(error=error):
                trace = self.read(f'10 openat(AT_FDCWD</repo>, "a", O_RDONLY) = -1 {error}')
                self.assertTrue(trace.reasons)

    def test_a_killed_process_stops_the_unit(self):
        self.assertTrue(self.read('11 +++ killed by SIGKILL +++').reasons)
        self.assertEqual(self.read('11 +++ exited with 1 +++').reasons, [])

    def test_a_line_it_cannot_read_stops_the_unit(self):
        self.assertTrue(self.read('this is not strace').reasons)
        self.assertTrue(self.read('10 openat(AT_FDCWD</repo>, 0x7ffc, O_RDONLY) = 3</repo/a>').reasons)

    def test_a_path_cut_short_stops_the_unit(self):
        self.assertTrue(self.read('10 openat(AT_FDCWD</repo>, "aaaa"..., O_RDONLY) = 3</repo/aaaa>').reasons)

    def test_a_call_it_does_not_know_stops_the_unit(self):
        self.assertTrue(self.read('10 mount("/a", "/b", "x", 0, NULL) = 0').reasons)

    def test_a_call_left_unfinished_stops_the_unit(self):
        self.assertTrue(self.read('10 openat(AT_FDCWD</repo>, "a", O_RDONLY <unfinished ...>').reasons)

    def test_a_git_command_is_recorded_and_what_it_reads_is_not(self):
        trace = self.read('10 execve("/usr/bin/git", ["git", "-C", "/repo", "ls-files", "-z"], 0x7 /* 60 vars */) = 0',
                          '10 openat(AT_FDCWD</repo>, ".git/index", O_RDONLY) = 3</repo/.git/index>',
                          '12 openat(AT_FDCWD</repo>, ".git/config", O_RDONLY) = 3</repo/.git/config>', '10 vfork() = 12')
        self.assertEqual(trace.git, [{"argv": ["-C", "@ROOT", "ls-files", "-z"], "cwd": "@ROOT"}])
        self.assertEqual(trace.reads, set())
        self.assertEqual(trace.which, {"git": "/usr/bin/git"})

    def test_a_git_command_that_may_write_stops_the_unit(self):
        for verb in ("add", "commit", "fetch", "update-index", "worktree", "gc"):
            with self.subTest(verb=verb):
                trace = self.read(f'10 execve("/usr/bin/git", ["git", "{verb}"], 0x7 /* 1 var */) = 0')
                self.assertTrue(any(verb in reason for reason in trace.reasons))

    def test_a_git_command_fed_on_stdin_keys_on_the_repositorys_state(self):
        trace = self.read('10 execve("/usr/bin/git", ["git", "cat-file", "--batch-check"], 0x7 /* 1 var */) = 0')
        self.assertTrue(trace.git_needs_state)
        self.assertEqual((trace.git, trace.reasons), ([], []))

    def test_git_in_a_repository_the_run_made_depends_on_nothing_else(self):
        trace = self.read('10 mkdir("/tmp/s", 0700) = 0', '10 execve("/usr/bin/git", ["git", "-C", "/tmp/s", "init"], 0x7 /* 1 var */) = 0')
        self.assertEqual((trace.git, trace.reasons, trace.git_needs_state), ([], [], False))

    def test_git_argument_lists_cut_short_stop_the_unit(self):
        trace = self.read('10 execve("/usr/bin/git", ["git", "ls-tree", ...], 0x7 /* 1 var */) = 0')
        self.assertTrue(trace.reasons)

    def test_a_pid_that_comes_back_is_not_still_git(self):
        trace = self.read('10 execve("/usr/bin/git", ["git", "status"], 0x7 /* 1 var */) = 0', '10 +++ exited with 0 +++',
                          '10 openat(AT_FDCWD</repo>, "a.md", O_RDONLY) = 3</repo/a.md>')
        self.assertEqual(trace.reads, {("file", "@ROOT/a.md")})

    def test_a_log_cut_short_is_not_believed(self):
        with tempfile.TemporaryDirectory() as folder:
            log = Path(folder) / "t.log"
            log.write_text('10 openat(AT_FDCWD</repo>, "a", O_RDONLY) = 3</repo/a>\n')
            self.assertIn("does not reach the end", " ".join(C.read_trace(log, self.root, ()).reasons))
            log.write_text('10 openat(AT_FDCWD</repo>, "a", O_RDONLY) = 3</repo/a>\n10 +++ exited with 1 +++\n')
            trace = C.read_trace(log, self.root, ())
            self.assertEqual((trace.reasons, trace.exit_code), ([], 1))
            log.write_text("")
            self.assertTrue(C.read_trace(log, self.root, ()).reasons)

    def test_an_exec_that_found_nothing_is_no_input(self):
        trace = self.read('10 execve("/opt/git", ["git", "x"], 0x7 /* 1 var */) = -1 ENOENT (No such file or directory)')
        self.assertEqual((trace.git, trace.reasons, trace.reads), ([], [], set()))


class CommandKey(unittest.TestCase):
    def test_the_report_path_and_the_time_bound_are_not_in_the_key_and_every_other_argument_is(self):
        root = Path("/repo")
        first = C.normalized_command(["/usr/bin/python3", "scripts/x.py", "c", "--report", "/tmp/a", "--subcheck-timeout-seconds", "600"], root)
        second = C.normalized_command(["python3", "scripts/x.py", "c", "--report", "/tmp/b", "--subcheck-timeout-seconds", "1200"], root)
        third = C.normalized_command(["python3", "scripts/x.py", "c", "--run-dir", "Plans/a"], root)
        fourth = C.normalized_command(["python3", "scripts/x.py", "c", "--run-dir", "Plans/b"], root)
        self.assertEqual(first, second)
        self.assertEqual(first, ["python", "scripts/x.py", "c"])
        self.assertNotEqual(third, fourth)

    def test_an_environment_name_not_on_the_list_changes_the_key(self):
        base = {"HOME": "/h", "PATH": "/bin", "CLAUDE_CODE_SESSION_ID": "1"}
        self.assertEqual(C.environment_digest(base), C.environment_digest({**base, "PATH": "/x", "CLAUDE_CODE_SESSION_ID": "2", "OLDPWD": "/"}))
        for name in ("PM_EVIDENCE_MAP", "PYTHONHASHSEED", "GIT_DIR", "LC_ALL", "SOMETHING_NEW"):
            with self.subTest(name=name):
                self.assertNotEqual(C.environment_digest(base), C.environment_digest({**base, name: "x"}))

    def test_output_tokens_stop_at_the_path_boundary(self):
        root = Path("/a/repo")
        text = '"/a/repo/x" "/a/repo" /a/repo-old/y /a/repo.bak'
        tokenized = C.tokenize_output(text, root)
        self.assertEqual(tokenized, f'"{C.OUTPUT_ROOT_TOKEN}/x" "{C.OUTPUT_ROOT_TOKEN}" /a/repo-old/y /a/repo.bak')
        self.assertEqual(C.detokenize_output(tokenized, Path("/b")), '"/b/x" "/b" /a/repo-old/y /a/repo.bak')


class WhatTheCheckedScriptsRead(unittest.TestCase):
    """The claims the key depends on, kept true: each fails if a script starts to read what the key leaves out."""

    def scripts(self, folder=None):
        # pm-land.py and its test run the landing; no aggregate runs them, so they are not validators (review M1).
        skip = {"pm_landing_cache.py", "test_pm_landing_cache.py", "pm-landing-check.py", "test_pm_landing_readiness_inputs.py",
                "pm-land.py", "test_pm_land.py"}
        return [path for path in sorted((folder or REPO / "scripts").glob("*.py")) if path.name not in skip]

    def test_the_landing_command_is_not_swept_in_as_a_validator(self):
        with tempfile.TemporaryDirectory() as folder:
            for name in ("pm-land.py", "test_pm_land.py", "pm-validate-x.py"):
                (Path(folder) / name).write_text("import time\nstamp = time.time()\n")
            self.assertEqual([path.name for path in self.scripts(Path(folder))], ["pm-validate-x.py"])

    def test_no_script_reads_an_ignored_environment_name(self):
        pattern = re.compile(r"""(?:environ(?:\.get|\.setdefault)?\s*[\[(]|getenv\(|\benv(?:iron)?\.get\(|\benv\[)\s*f?['"]([A-Za-z_][A-Za-z0-9_]*)['"]""")
        hits = []
        for path in self.scripts():
            for name in pattern.findall(path.read_text(encoding="utf-8", errors="replace")):
                if name in C.ENV_IGNORED or name.startswith(C.ENV_IGNORED_PREFIXES):
                    hits.append(f"{path.name}: {name}")
        self.assertEqual(hits, [])

    def test_no_script_reads_a_file_time(self):
        pattern = re.compile(r"st_mtime|st_ctime|st_atime|getmtime|getctime|getatime")
        hits = [path.name for path in self.scripts() if pattern.search(path.read_text(encoding="utf-8", errors="replace"))]
        self.assertEqual(hits, [])

    def test_no_validator_reads_a_files_mode_or_stdin(self):
        """Mode bits differ between the mount and local disk and are not in the key; stdin is not traced. These two
        are not validators: the governance seal keeps a file's mode when it rewrites it, pm7-where reads a pipe."""
        pattern = re.compile(r"\.st_mode|os\.access\(|\bX_OK\b|stat\.S_I|sys\.stdin")
        hits = [path.name for path in self.scripts() if pattern.search(path.read_text(encoding="utf-8", errors="replace"))]
        self.assertEqual(sorted(hits), ["pm-governance-seal.py", "pm7-where.py"])

    def test_the_clock_only_fills_timestamp_fields(self):
        pattern = re.compile(r"datetime\.now\(|datetime\.utcnow\(|date\.today\(|time\.time\(\)|time\.time_ns\(\)")
        hits = []
        for path in self.scripts():
            for number, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
                if pattern.search(line) and not line.lstrip().startswith("return ") and "generated_at" not in line:
                    hits.append(f"{path.name}:{number}: {line.strip()[:80]}")
        self.assertEqual(hits, [])


class ContractWithTheRealScript(unittest.TestCase):
    """What the aggregate hook relies on in scripts/pm-plans-verify.py, which the cache must not edit."""

    @classmethod
    def setUpClass(cls):
        cls.tree = ast.parse(VERIFY_PATH.read_text(encoding="utf-8"))
        cls.functions = {node.name: node for node in cls.tree.body if isinstance(node, ast.FunctionDef)}

    def test_run_validator_subprocess_has_the_signature_the_wrapper_passes_on(self):
        node = self.functions["run_validator_subprocess"]
        self.assertEqual([arg.arg for arg in node.args.args], ["check_name", "argv"])
        self.assertEqual([arg.arg for arg in node.args.kwonlyargs], ["timeout_seconds", "extra_failure_fields", "aggregate_child"])

    def test_a_subcheck_is_spawned_by_name_with_the_report_in_its_argv_and_marked_a_child(self):
        node = self.functions["_run_subprocess_check"]
        calls = [call for call in ast.walk(node) if isinstance(call, ast.Call) and getattr(call.func, "id", "") == "run_validator_subprocess"]
        self.assertEqual(len(calls), 1)
        self.assertEqual({kw.arg: getattr(kw.value, "value", None) for kw in calls[0].keywords}.get("aggregate_child"), True)
        strings = {item.value for item in ast.walk(node) if isinstance(item, ast.Constant) and isinstance(item.value, str)}
        self.assertLessEqual({"scripts/pm-plans-verify.py", "--report"}, strings)

    def test_main_is_a_function_the_hook_can_call(self):
        self.assertIn("main", self.functions)

    def test_only_verify_spec_lock_stays_in_process(self):
        text = VERIFY_PATH.read_text(encoding="utf-8")
        self.assertIn('_INPROCESS_AGGREGATE_CHECKS = {"verify_spec_lock"}', text)


@unittest.skipUnless(HAS_STRACE, "needs a working strace")
class TheRealSpawnPath(unittest.TestCase):
    """The hook on the real script, not the fake one: its own _run_subprocess_check, spawning through the wrapper."""

    def run_subcheck(self, runner, name):
        saved = list(sys.path)
        try:
            module = runner.load_aggregate(VERIFY_PATH)
            return module, module._run_subprocess_check(name, argparse.Namespace(), timeout_seconds=120)
        finally:
            sys.path[:] = saved

    def test_a_cheap_real_validator_comes_back_the_same_from_the_cache_and_without_it(self):
        with tempfile.TemporaryDirectory(prefix="landing-cache-real-") as folder:
            stats = Path(folder) / "units.jsonl"
            runner = C.Runner(REPO, Path(folder) / "cache", stats, "run-gates", 0)
            module, fresh = self.run_subcheck(runner, "validate_auto_decisions")
            self.assertEqual(json.loads(stats.read_text().splitlines()[-1])["status"], "fresh", stats.read_text())
            _module, cached = self.run_subcheck(runner, "validate_auto_decisions")
            row = json.loads(stats.read_text().splitlines()[-1])
            self.assertEqual(row["status"], "cache", row)
            self.assertEqual(row["label"], "run-gates/validate_auto_decisions")
            # The other aggregate's name for it runs the same command line, so it is the same unit.
            _module, other = self.run_subcheck(runner, "auto_decisions")
            self.assertEqual(json.loads(stats.read_text().splitlines()[-1])["status"], "cache")
            # Without the wrapper: the script's own spawn function, as a run without --cache takes it.
            spec_plain = importlib.util.spec_from_file_location("pm_plans_verify_plain", VERIFY_PATH)
            plain_module = importlib.util.module_from_spec(spec_plain)
            sys.modules[spec_plain.name] = plain_module
            saved = list(sys.path)
            try:
                sys.path.insert(0, str(VERIFY_PATH.parent))
                spec_plain.loader.exec_module(plain_module)
                plain = plain_module._run_subprocess_check("validate_auto_decisions", argparse.Namespace(), timeout_seconds=120)
            finally:
                sys.path[:] = saved
                del sys.modules[spec_plain.name]
            self.assertEqual(C.normalize_report(fresh, None), C.normalize_report(plain, None))
            self.assertEqual(C.normalize_report(cached, None), C.normalize_report(plain, None))
            self.assertEqual({key: value for key, value in C.normalize_report(other, None).items() if key != "check"},
                             {key: value for key, value in C.normalize_report(plain, None).items() if key != "check"})
            self.assertEqual(other["check"], "auto-decisions")


@unittest.skipUnless(HAS_STRACE, "needs a working strace")
class NegativesOnOneValidator(Fixture):
    def test_an_unchanged_tree_reuses_the_result_and_its_output(self):
        first, code, out = self.unit("validate-evidence")
        self.assertEqual((first["status"], code), ("fresh", 0))
        second, code_two, out_two = self.unit("validate-evidence")
        self.assertEqual((second["status"], code_two), ("cache", 0))
        self.assertEqual(json.loads(out)["listed"], json.loads(out_two)["listed"])
        self.assertTrue(second["key"].startswith(first["key"][:16]))

    def test_one_changed_byte_reruns_it_with_the_same_size(self):
        self.status("validate-evidence")
        self.write("a.txt", "fane\n")
        row, _code, _out = self.unit("validate-evidence")
        self.assertEqual(row["status"], "fresh")
        self.assertEqual(row["detail"], "input changed: a.txt")

    def test_the_rerun_says_what_the_changed_file_says_now(self):
        self.status("validate-evidence")
        self.write("a.txt", "FAIL now\n")
        row, code, out = self.unit("validate-evidence")
        self.assertEqual((row["status"], code), ("fresh", 1))
        self.assertEqual(json.loads(out)["failures"][0]["error"], "a_failed")
        self.assertEqual(self.status("validate-evidence"), "cache")

    def test_going_back_to_the_old_bytes_reuses_the_old_result(self):
        self.status("validate-evidence")
        self.write("a.txt", "other\n")
        self.status("validate-evidence")
        self.write("a.txt", "fine\n")
        self.assertEqual(self.status("validate-evidence"), "cache")

    def test_a_new_file_in_a_listed_folder_reruns_it(self):
        self.status("validate-evidence")
        self.write("listed/bad-new.txt", "x\n")
        row, code, out = self.unit("validate-evidence")
        self.assertEqual((row["status"], code), ("fresh", 1))
        self.assertIn("bad-new.txt", out)

    def test_a_removed_file_in_a_listed_folder_reruns_it(self):
        self.status("validate-evidence")
        (self.root / "listed" / "one.txt").unlink()
        self.assertEqual(self.status("validate-evidence"), "fresh")

    def test_a_file_appearing_where_a_stat_found_nothing_reruns_it(self):
        self.assertEqual(self.status("absent"), "fresh")
        self.assertEqual(self.status("absent"), "cache")
        self.write("maybe.txt", "x\n")
        row, code, _out = self.unit("absent")
        self.assertEqual((row["status"], code, row["detail"]), ("fresh", 1, "input changed: maybe.txt"))

    def test_a_stat_only_files_size_is_an_input(self):
        self.status("stat-size")
        self.write("sized.txt", "abcdefghij\n")
        row, code, _out = self.unit("stat-size")
        self.assertEqual((row["status"], code), ("fresh", 1))

    def test_a_symlink_pointed_elsewhere_reruns_it(self):
        self.status("link")
        (self.root / "link").unlink()
        (self.root / "link").symlink_to("b.txt")
        self.assertEqual(self.status("link"), "fresh")

    def test_a_file_read_through_a_link_the_run_made_reruns_it(self):
        """Review C1: the file changes, the validator reads it through its own scratch link: never the old result."""
        for command in ("scratch-link", "scratch-link-relative"):
            with self.subTest(command=command):
                self.write("a.txt", f"before {command}\n")
                first, code, out = self.unit(command)
                self.assertEqual((first["status"], code), ("fresh", 0), out)
                self.assertIn(f"before {command}", out)
                self.assertEqual(self.status(command), "cache")
                self.write("a.txt", f"after {command}\n")
                row, code, out = self.unit(command)
                self.assertEqual(row["status"], "fresh", row)
                self.assertIn(f"after {command}", out)

    def test_a_folder_linked_into_scratch_is_never_stored(self):
        """Its files are read through the link, so what they hold is not in the key: the unit is not cached."""
        self.assertEqual(self.status("scratch-link-folder"), "never")
        row, code, _out = self.unit("scratch-link-folder")
        self.assertEqual((row["status"], code), ("never", 0), row)
        self.assertIn("it linked a folder", row["detail"])
        self.write("listed/one.txt", "changed\n")
        row, code, out = self.unit("scratch-link-folder")
        self.assertEqual(row["status"], "never")
        self.assertIn("changed", out)

    def test_a_new_file_behind_a_symlinked_folder_reruns_it(self):
        self.status("listed-link")
        self.assertEqual(self.status("listed-link"), "cache")
        self.write("linked_target/new.txt", "x\n")
        self.assertEqual(self.status("listed-link"), "fresh")

    def test_a_path_with_an_accent_and_a_space_is_read_right(self):
        self.status("unicode")
        self.assertEqual(self.status("unicode"), "cache")
        self.write("listed/café one.txt", "changed\n")
        self.assertEqual(self.status("unicode"), "fresh")

    def test_a_validators_own_source_is_an_input_even_with_valid_bytecode(self):
        self.status("validate-auto-decisions")
        self.assertEqual(self.status("validate-auto-decisions"), "cache")
        path = self.root / "scripts" / "pm-plans-verify.py"
        path.write_text(path.read_text() + "# a comment\n")
        self.assertEqual(self.status("validate-auto-decisions"), "fresh")

    def test_an_imported_modules_bytes_are_an_input_when_only_its_bytecode_was_read(self):
        """With a valid .pyc the importer only stats the source, and an edit can keep its size."""
        subprocess.run([sys.executable, "scripts/pm-plans-verify.py", "helper"], cwd=self.root, check=True, capture_output=True)
        self.assertEqual(self.status("helper"), "fresh")
        self.assertEqual(self.status("helper"), "cache")
        self.write("scripts/helper_mod.py", "VALUE = 2\n")
        row, _code, out = self.unit("helper")
        self.assertEqual(row["status"], "fresh", row)
        self.assertEqual(json.loads(out)["value"], 2)

    def test_a_new_script_beside_it_reruns_it_because_the_importer_listed_that_folder(self):
        self.status("validate-auto-decisions")
        self.write("scripts/brand_new.py", "x = 1\n")
        self.assertEqual(self.status("validate-auto-decisions"), "fresh")

    def test_an_environment_variable_a_script_reads_reruns_it(self):
        self.status("env")
        self.assertEqual(self.status("env"), "cache")
        row, _code, out = self.unit("env", env={"PM_EVIDENCE_MAP": "x=y"})
        self.assertEqual(row["status"], "fresh")
        self.assertEqual(json.loads(out)["value"], "x=y")

    def test_session_noise_in_the_environment_does_not(self):
        self.status("env")
        self.assertEqual(self.status("env", env={"CLAUDE_CODE_SESSION_ID": "other", "OLDPWD": "/x"}), "cache")

    def test_files_it_made_itself_in_scratch_do_not_stop_it(self):
        self.assertEqual(self.status("scratch"), "fresh")
        self.assertEqual(self.status("scratch"), "cache")


@unittest.skipUnless(HAS_STRACE, "needs a working strace")
class WhatGitSays(Fixture):
    def test_an_untracked_file_reruns_a_validator_that_asks_git_for_files(self):
        self.status("git-files")
        self.assertEqual(self.status("git-files"), "cache")
        self.write("untracked-new.txt", "x\n")
        self.assertEqual(self.status("git-files"), "fresh")

    def test_a_commit_with_the_same_tree_reruns_what_reads_head_and_only_that(self):
        self.status("git-head")
        self.status("validate-auto-decisions")
        tree = self.git("rev-parse", "HEAD^{tree}")
        self.git("commit", "-q", "--allow-empty", "-m", "same tree")
        self.assertEqual(self.git("rev-parse", "HEAD^{tree}"), tree)
        row, _code, out = self.unit("git-head")
        self.assertEqual(row["status"], "fresh")
        self.assertEqual(json.loads(out)["head"], self.git("rev-parse", "HEAD"))
        self.assertEqual(self.status("validate-auto-decisions"), "cache")

    def test_origin_main_moving_reruns_what_reads_it_with_this_tree_unchanged(self):
        self.status("git-origin")
        self.assertEqual(self.status("git-origin"), "cache")
        old = self.git("rev-parse", "HEAD")
        self.write("a.txt", "next on main\n")
        self.git("add", "a.txt")
        self.git("commit", "-q", "-m", "next")
        self.git("update-ref", "refs/remotes/origin/main", "HEAD")
        self.git("reset", "-q", "--hard", old)
        row, _code, out = self.unit("git-origin")
        self.assertEqual(row["status"], "fresh")
        self.assertIn("next on main", json.loads(out)["base"])

    def test_a_git_command_on_stdin_keys_on_the_repositorys_state(self):
        self.assertEqual(self.status("git-batch"), "fresh")
        self.assertEqual(self.status("git-batch"), "cache")
        self.git("update-ref", "refs/remotes/origin/other", "HEAD")
        self.assertEqual(self.status("git-batch"), "fresh")

    def test_a_git_command_that_may_write_is_never_cached(self):
        for _attempt in range(2):
            row, _code, _out = self.unit("git-write")
            self.assertEqual(row["status"], "never")
            self.assertIn("may write", row["detail"])

    def test_a_validators_self_test_repository_is_no_input(self):
        self.assertEqual(self.status("git-selftest"), "fresh")
        self.assertEqual(self.status("git-selftest"), "cache")

    def test_another_git_on_the_path_reruns(self):
        self.status("git-files")
        bin_dir = self.scratch / "bin"
        bin_dir.mkdir()
        (bin_dir / "git").symlink_to(shutil.which("git"))
        path = f"{bin_dir}{os.pathsep}{os.environ['PATH']}"
        self.assertEqual(self.status("git-files", env={"PATH": path}), "fresh")


@unittest.skipUnless(HAS_STRACE, "needs a working strace")
class WhatIsNeverStored(Fixture):
    def assert_never(self, command, phrase):
        for _attempt in range(2):
            row, _code, _out = self.unit(command)
            self.assertEqual(row["status"], "never", row)
            self.assertIn(phrase, row["detail"])
        self.assertEqual(list(self.cache.rglob("r-*.json.gz")), [])

    def test_a_validator_that_writes_into_the_tree(self):
        self.assert_never("writes", "wrote outside scratch")

    def test_a_report_holding_a_timeout_row(self):
        self.assert_never("timeout-row", "timeout row")

    def test_a_process_killed_under_it(self):
        self.assert_never("killed", "killed")

    def test_an_odd_exit(self):
        self.assert_never("crash", "exited with 7")

    def test_an_input_changing_while_it_runs(self):
        argv = [sys.executable, str(MODULE_PATH), "exec", "--root", str(self.root), "--cache-dir", str(self.cache), "--stats", str(self.stats),
                "--label", "unit", "--race-margin-ms", "0", "--", sys.executable, "scripts/pm-plans-verify.py", "sleep"]
        proc = subprocess.Popen(argv, cwd=self.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.0)
        self.write("a.txt", "changed after it was read\n")
        proc.wait()
        row = json.loads(self.stats.read_text().splitlines()[0])
        self.assertEqual(row["status"], "never", row)
        self.assertIn("about when it ran", row["detail"])
        self.assertEqual(list(self.cache.rglob("r-*.json.gz")), [])
        self.assertEqual(self.status("sleep"), "fresh")

    def test_an_input_deleted_while_it_runs(self):
        argv = [sys.executable, str(MODULE_PATH), "exec", "--root", str(self.root), "--cache-dir", str(self.cache), "--stats", str(self.stats),
                "--label", "unit", "--race-margin-ms", "0", "--", sys.executable, "scripts/pm-plans-verify.py", "sleep"]
        proc = subprocess.Popen(argv, cwd=self.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.0)
        (self.root / "a.txt").unlink()
        proc.wait()
        row = json.loads(self.stats.read_text().splitlines()[0])
        self.assertEqual(row["status"], "never", row)
        self.assertIn("about when it ran", row["detail"])
        self.assertEqual(list(self.cache.rglob("r-*.json.gz")), [])

    def test_a_file_appearing_after_a_validator_asked_git_for_the_list(self):
        argv = [sys.executable, str(MODULE_PATH), "exec", "--root", str(self.root), "--cache-dir", str(self.cache), "--stats", str(self.stats),
                "--label", "unit", "--race-margin-ms", "0", "--", sys.executable, "scripts/pm-plans-verify.py", "git-files-slow"]
        proc = subprocess.Popen(argv, cwd=self.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.0)
        self.write("appeared.txt", "after git answered\n")
        proc.wait()
        row = json.loads(self.stats.read_text().splitlines()[0])
        self.assertEqual(row["status"], "never", row)
        self.assertIn("moved while it ran", row["detail"])
        row, _code, out = self.unit("git-files-slow")
        self.assertEqual(row["status"], "fresh")
        self.assertIn("appeared.txt", json.loads(out)["files"])

    def test_without_strace_everything_runs_and_nothing_is_stored(self):
        bin_dir = self.scratch / "nostrace"
        bin_dir.mkdir()
        (bin_dir / "git").symlink_to(shutil.which("git"))
        row, code, out = self.unit("validate-evidence", env={"PATH": str(bin_dir)})
        self.assertEqual((row["status"], code), ("never", 0))
        self.assertIn("strace", row["detail"])
        self.assertIn("listed", out)
        self.assertEqual(list(self.cache.rglob("r-*.json.gz")), [])


@unittest.skipUnless(HAS_STRACE, "needs a working strace")
class TheStore(Fixture):
    def entries(self, pattern="r-*.json.gz"):
        return sorted(self.cache.rglob(pattern))

    def test_a_damaged_entry_is_a_miss_and_not_a_crash(self):
        self.status("validate-evidence")
        self.entries()[0].write_bytes(b"not gzip")
        row, code, _out = self.unit("validate-evidence")
        self.assertEqual((row["status"], code), ("fresh", 0))
        self.assertEqual(self.status("validate-evidence"), "cache")

    def test_a_damaged_manifest_is_a_miss_and_not_a_crash(self):
        self.status("validate-evidence")
        self.entries("m-*.json.gz")[0].write_bytes(b"nope")
        self.assertEqual(self.status("validate-evidence"), "fresh")

    def test_a_value_measured_before_a_unit_ran_is_not_filed_under_its_result(self):
        """The hole a per-process memo would open: unit one measures a.txt, a.txt changes, unit two reads the new
        bytes. Its entry must say the new bytes, or going back to the old ones would hand back the wrong result."""
        fingerprints = C.Fingerprints(self.root)
        store = C.Store(self.cache, self.root, fingerprints, 0)
        self.assertEqual(fingerprints.value("file", "@ROOT/a.txt"), fingerprints.values_of([("file", "@ROOT/a.txt")])["file @ROOT/a.txt"])
        old = fingerprints.value("file", "@ROOT/a.txt")
        self.write("a.txt", "the second state\n")
        trace = C.Trace(reads={("file", "@ROOT/a.txt")}, exit_code=0)
        digest, why = store.store("k" * 16, ["python"], trace, {"stdout": "result of the second state", "returncode": 0}, time.time_ns(), 0.1, "c")
        self.assertEqual(why, "")
        self.assertNotEqual(fingerprints.values[("file", "@ROOT/a.txt")], old)
        self.assertEqual(fingerprints.moved, ["@ROOT/a.txt"])
        self.assertIn("@ROOT/a.txt", fingerprints.changed())
        self.write("a.txt", "fine\n")
        fresh = C.Fingerprints(self.root)
        entry, _why, _changed, _total = C.Store(self.cache, self.root, fresh).lookup("k" * 16)
        self.assertIsNone(entry, "the old bytes must not find the second state's result")

    def test_an_entry_whose_inputs_do_not_match_its_name_is_not_believed(self):
        self.status("validate-evidence")
        path = self.entries()[0]
        entry = json.loads(gzip.decompress(path.read_bytes()))
        entry["outputs"]["stdout"] = '{"status": "pass", "forged": true}'
        entry["inputs"]["file @ROOT/a.txt"] = "sha256:0"
        path.write_bytes(gzip.compress(json.dumps(entry).encode()))
        row, _code, out = self.unit("validate-evidence")
        self.assertEqual(row["status"], "fresh")
        self.assertNotIn("forged", out)

    def test_nothing_is_left_inside_the_repository(self):
        self.status("validate-evidence")
        self.aggregate()
        status = self.git("status", "--porcelain", "--ignored")
        self.assertEqual([line for line in status.splitlines() if "__pycache__" not in line], [])

    def test_a_stored_entry_holds_no_absolute_root_and_no_environment_value(self):
        self.unit("env", env={"PM_EVIDENCE_MAP": "secret-looking-value"})
        text = b"".join(gzip.decompress(path.read_bytes()) for path in self.cache.rglob("*.json.gz")).decode()
        self.assertNotIn(str(self.root), text.replace("secret-looking-value", ""))
        # What the validator itself printed is its report; the key holds only a digest of the environment.
        manifests = b"".join(gzip.decompress(path.read_bytes()) for path in self.cache.rglob("m-*.json.gz")).decode()
        self.assertNotIn("secret-looking-value", manifests)

    def test_eviction_takes_the_least_recently_used_first(self):
        for command in ("validate-evidence", "validate-auto-decisions", "env"):
            self.status(command)
        time.sleep(0.02)
        self.status("validate-evidence")
        size = sum(path.stat().st_size for path in self.cache.rglob("*") if path.is_file())
        kept = next(self.cache.rglob("r-*"))
        self.assertGreater(C.evict(self.cache, size // 2), 0)
        self.assertLessEqual(sum(path.stat().st_size for path in self.cache.rglob("*") if path.is_file()), size // 2)
        self.assertEqual(self.status("validate-evidence"), "cache", kept)

    def test_a_result_carries_over_to_a_checkout_at_another_path_with_its_paths_rewritten(self):
        first, _code, out = self.unit("validate-evidence")
        self.assertEqual(json.loads(out)["where"], str(self.root))
        other = self.scratch / "other"
        shutil.copytree(self.root, other, symlinks=True)
        row, _code, out = self.unit("validate-evidence", root=other)
        self.assertEqual(row["status"], "cache", row)
        self.assertEqual(json.loads(out)["where"], str(other))

    def test_a_different_file_in_that_other_checkout_does_not_carry_over(self):
        self.status("validate-evidence")
        other = self.scratch / "other"
        shutil.copytree(self.root, other, symlinks=True)
        self.write("a.txt", "FAIL only in the other checkout\n", other)
        row, code, _out = self.unit("validate-evidence", root=other)
        self.assertEqual((row["status"], code), ("fresh", 1))


@unittest.skipUnless(HAS_STRACE, "needs a working strace")
class ThroughAnAggregate(Fixture):
    def test_a_changed_byte_reruns_only_the_subcheck_that_read_it(self):
        rows, _report, _code = self.aggregate()
        self.assertEqual({row["status"] for row in rows.values()}, {"fresh"}, rows)
        self.assertEqual(len(rows), 4)
        self.write("b.txt", "fane\n")
        rows, _report, _code = self.aggregate()
        status = {name: row["status"] for name, row in rows.items()}
        self.assertEqual(status, {"validate_evidence": "cache", "validate_auto_decisions": "fresh",
                                  "validate_plan_graph": "cache", "validate_wiring_matrix": "cache"})
        self.assertEqual(rows["validate_auto_decisions"]["detail"], "input changed: b.txt")

    def test_a_new_file_in_a_listed_folder_reruns_only_the_subcheck_that_listed_it(self):
        self.aggregate()
        self.write("listed/new.txt", "x\n")
        rows, _report, _code = self.aggregate()
        status = {name: row["status"] for name, row in rows.items()}
        self.assertEqual(status, {"validate_evidence": "fresh", "validate_auto_decisions": "cache",
                                  "validate_plan_graph": "cache", "validate_wiring_matrix": "cache"})

    def test_the_aggregates_report_from_the_cache_is_the_report_a_fresh_run_writes(self):
        self.write("a.txt", "FAIL one\n")
        _rows, fresh, code = self.aggregate()
        rows, cached, code_two = self.aggregate()
        self.assertEqual({row["status"] for row in rows.values()}, {"cache"})
        self.assertEqual(code, code_two)
        self.assertEqual(C.normalize_report(fresh, None), C.normalize_report(cached, None))
        plain = self.scratch / "plain.json"
        subprocess.run([sys.executable, "scripts/pm-plans-verify.py", "run-gates", "--quiet-progress", "--subcheck-timeout-seconds", "60",
                        "--report", str(plain)], cwd=self.root, capture_output=True, check=False)
        self.assertEqual(C.normalize_report(json.loads(plain.read_text()), None), C.normalize_report(cached, None))

    def test_the_other_aggregate_reuses_the_same_commands(self):
        self.aggregate("run-gates")
        rows, _report, _code = self.aggregate("audit-governance")
        self.assertEqual({row["status"] for row in rows.values()}, {"cache"}, rows)

    def test_a_timeout_row_is_handed_on_and_nothing_is_stored(self):
        slow = self.root / "scripts" / "pm-plans-verify.py"
        slow.write_text(slow.read_text().replace('def v_b(args):\n', 'def v_b(args):\n    time.sleep(30)\n'))
        rows, report, _code = self.aggregate(timeout=1)
        self.assertEqual(rows["validate_auto_decisions"]["status"], "never")
        self.assertEqual(rows["validate_auto_decisions"]["detail"], "it timed out")
        block = next(block for block in report["failures"] if block["check"] == "validate_auto_decisions")
        self.assertEqual(block["failures"][0]["error"], "subprocess_timeout")

    def test_a_larger_bound_after_a_timeout_reuses_what_finished(self):
        slow = self.root / "scripts" / "pm-plans-verify.py"
        slow.write_text(slow.read_text().replace('def v_b(args):\n', 'def v_b(args):\n    time.sleep(2.5)\n'))
        rows, _report, _code = self.aggregate(timeout=1)
        self.assertEqual(rows["validate_auto_decisions"]["status"], "never")
        rows, report, _code = self.aggregate(timeout=30)
        status = {name: row["status"] for name, row in rows.items()}
        self.assertEqual(status["validate_auto_decisions"], "fresh")
        self.assertEqual({status[name] for name in status if name != "validate_auto_decisions"}, {"cache"})
        self.assertEqual(report["subcheck_timeout_seconds"], 30)


@unittest.skipUnless(HAS_STRACE, "needs a working strace")
class ThroughTheLandingCheck(Fixture):
    """The real pm-landing-check.py, on a repository with a real baseline."""

    def setUp(self):
        super().setUp()
        self.audit = self.scratch / "audit"
        self.audit.mkdir()
        code, out, err = self.landing("--record-baseline")
        self.assertEqual(code, 0, err)
        self.git("add", "reports/landing-checks/baseline.json")
        self.git("commit", "-q", "-m", "baseline")
        self.git("update-ref", "refs/remotes/origin/main", "HEAD")
        time.sleep(C.RACE_MARGIN_NS / 1e9 + 0.1)

    def landing(self, *argv):
        proc = subprocess.run([sys.executable, "scripts/pm-landing-check.py", "--readiness-audit-root", str(self.audit), *argv],
                              cwd=self.root, capture_output=True, text=True)
        return proc.returncode, proc.stdout, proc.stderr

    def cached(self, *argv):
        return self.landing("--cache", "--cache-dir", str(self.cache), *argv)

    def body(self, text):
        """The report without its cache lines, which are the only thing a cached run prints that a plain one does not."""
        return "".join(line for line in text.splitlines(keepends=True) if not re.match(r"^\s+(--cache:|\[(cache|fresh|never)\])", line))

    def test_without_cache_and_with_no_cache_nothing_is_written_or_printed_about_it(self):
        code, out, err = self.landing()
        self.assertNotIn("--cache", out)
        self.assertEqual(self.body(out), out)
        code_two, out_two, _err = self.landing("--no-cache", "--cache-dir", str(self.cache))
        self.assertEqual((code, out), (code_two, out_two))
        self.assertFalse(self.cache.exists())
        code_json, out_json, _err = self.landing("--json")
        self.assertNotIn("cache", json.loads(out_json))
        self.assertEqual(code_json, code)

    def test_no_cache_wins_over_cache(self):
        code, out, _err = self.landing("--cache", "--no-cache", "--cache-dir", str(self.cache))
        self.assertNotIn("--cache:", out)
        self.assertFalse(self.cache.exists())

    def test_a_baseline_is_never_recorded_with_the_cache(self):
        before = (self.root / "reports/landing-checks/baseline.json").read_bytes()
        self.cached()
        code, out, err = self.cached("--record-baseline")
        self.assertEqual(code, 3)
        self.assertIn("refuses --record-baseline", err)
        self.assertEqual((self.root / "reports/landing-checks/baseline.json").read_bytes(), before)

    def test_a_cache_folder_inside_the_repository_is_refused(self):
        code, _out, err = self.landing("--cache", "--cache-dir", str(self.root / "cache-here"))
        self.assertEqual(code, 3)
        self.assertIn("outside the repository", err)
        self.assertFalse((self.root / "cache-here").exists())

    def test_the_warm_run_reports_exactly_what_a_plain_run_reports_and_names_its_parts_and_keys(self):
        plain_code, plain, _err = self.landing()
        cold_code, cold, cold_err = self.cached()
        self.assertEqual(cold_code, plain_code, cold_err)
        self.assertEqual(self.body(cold), plain)
        warm_code, warm, _err = self.cached()
        self.assertEqual(warm_code, plain_code)
        self.assertEqual(self.body(warm), plain)
        rows = [line for line in warm.splitlines() if re.match(r"^\s+\[(cache|fresh|never)\]", line)]
        self.assertTrue(rows)
        self.assertTrue(all(line.lstrip().startswith("[cache]") for line in rows), rows)
        self.assertTrue(all(re.search(r"key [0-9a-f]{16}-[0-9a-f]{16}", line) for line in rows), rows)
        for part in ("run-gates/validate_evidence", "audit-governance/evidence", "plan-migration-validate",
                     "export/validate-plan-graph"):
            self.assertTrue(any(part in line for line in rows), (part, rows))

    def test_a_changed_input_gives_the_verdict_a_plain_run_gives_and_never_the_old_one(self):
        self.cached()
        self.cached()
        self.write("a.txt", "FAIL a new failure\n")
        self.git("add", "a.txt")
        self.git("commit", "-q", "-m", "a new failure on a.txt")
        time.sleep(C.RACE_MARGIN_NS / 1e9 + 0.1)
        plain_code, plain, _err = self.landing()
        code, out, _err = self.cached()
        self.assertEqual(code, plain_code)
        self.assertEqual(plain_code, 2)
        self.assertEqual(self.body(out), plain)
        self.assertIn("a_failed", out)
        self.assertIn("[fresh] run-gates/validate_evidence", out)

    def test_a_run_during_which_an_input_changes_stops_with_exit_3(self):
        self.cached()
        self.write("mutate.flag", "x\n")
        time.sleep(C.RACE_MARGIN_NS / 1e9 + 0.1)
        code, _out, err = self.cached()
        self.assertEqual(code, 3, err)
        self.assertIn("inputs changed during this run", err)
        self.assertIn("b.txt", err)

    def test_json_says_where_each_part_came_from(self):
        self.cached()
        code, out, _err = self.cached("--json")
        cache = json.loads(out)["cache"]
        self.assertEqual(cache["counts"]["fresh"] + cache["counts"]["never"], 0)
        self.assertGreater(cache["counts"]["cache"], 8)
        self.assertEqual({row["status"] for row in cache["units"]}, {"cache"})

    def test_kept_reports_compare_the_same_and_a_changed_one_does_not(self):
        plain_dir, warm_dir = self.scratch / "plain", self.scratch / "warm"
        self.landing("--keep-check-reports", str(plain_dir))
        self.cached()
        self.cached("--keep-check-reports", str(warm_dir))
        self.assertTrue((warm_dir / "cache.json").is_file())
        compare = [sys.executable, str(MODULE_PATH), "compare", str(plain_dir), str(warm_dir)]
        proc = subprocess.run(compare, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stdout)
        report = warm_dir / "run-gates.json"
        data = json.loads(report.read_text())
        data["status"] = "tampered"
        report.write_text(json.dumps(data))
        proc = subprocess.run(compare, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 1, proc.stdout)
        self.assertIn("DIFFERS  run-gates", proc.stdout)

    def test_the_plan_migration_check_reruns_only_when_its_run_changes(self):
        self.cached()
        self.write("Plans/.plan_migration/run-1/inventory.txt", "FAIL here\n")
        self.git("add", "Plans")
        self.git("commit", "-q", "-m", "x")
        time.sleep(C.RACE_MARGIN_NS / 1e9 + 0.1)
        code, out, _err = self.cached()
        self.assertIn("[fresh] plan-migration-validate", out)
        self.assertIn("[cache] run-gates/validate_auto_decisions", out)
        self.assertEqual(code, 2)


if __name__ == "__main__":
    unittest.main()
